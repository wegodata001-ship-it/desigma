"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { AssetImg } from "@/components/asset-img";
import { useAdminI18n } from "@/lib/admin-i18n";
import { resolveUploadErrorMessage, type UploadErrorMessages } from "@/lib/admin-upload-errors";
import { uploadAdminAsset } from "@/lib/admin-upload-client";
import {
  addProductImage,
  deleteProductImage,
  setMainProductImage,
  setProductImageOrder,
} from "@/app/admin/actions";
import { compressImageForUpload } from "@/lib/image-compress-client";
import { withTimeout } from "@/lib/promise-with-timeout";

export type Img = { id: string; url: string; isMain: boolean; sortOrder: number };

const COMPRESS_TIMEOUT_MS = 45_000;

function sortImages(im: Img[]): Img[] {
  return [...im].sort((a, b) => {
    if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
}

function ImageToast({
  kind,
  message,
  onDismiss,
}: {
  kind: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, kind === "error" ? 6000 : 2500);
    return () => window.clearTimeout(id);
  }, [kind, onDismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-none fixed end-4 top-4 z-[120] max-w-sm rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-lg ${
        kind === "success" ? "bg-emerald-600" : "bg-red-600"
      }`}
    >
      {kind === "success" ? "✓ " : "✕ "}
      {message}
    </div>
  );
}

export function ProductImagesSection({
  product,
  selectedFiles,
  setSelectedFiles,
  onRefresh,
  onCopyToColors,
}: {
  product: { id: string; images: Img[] } | null;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  onRefresh?: () => void;
  onCopyToColors?: () => void;
}) {
  const { t } = useAdminI18n();
  const fileInputId = useId();
  const [ordered, setOrdered] = useState<Img[]>(() => sortImages(product?.images ?? []));
  const [activeIdx, setActiveIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const uploadMessages: UploadErrorMessages = useMemo(
    () => ({
      imageSaveFailed: t("imageSaveFailed"),
      fileTooLarge: t("fileTooLarge"),
      uploadUnauthorized: t("uploadUnauthorized"),
      uploadForbidden: t("uploadForbidden"),
      uploadServerError: t("uploadServerError"),
      uploadTimeout: t("uploadTimeout"),
      uploadStorageUnavailable: t("uploadStorageUnavailable"),
    }),
    [t],
  );

  useEffect(() => {
    const next = sortImages(product?.images ?? []);
    setOrdered(next);
    setActiveIdx((i) => Math.min(i, Math.max(0, next.length - 1)));
  }, [product?.images]);

  const active = ordered[activeIdx] ?? null;

  const showSuccess = useCallback(() => {
    setToast({ kind: "success", message: t("autoSaved") });
  }, [t]);

  const showError = useCallback(
    (err: unknown, context: string) => {
      console.error(`[ProductImagesSection] ${context}`, err);
      setToast({
        kind: "error",
        message: resolveUploadErrorMessage(err, uploadMessages),
      });
    },
    [uploadMessages],
  );

  const persistOrder = useCallback(
    async (next: Img[]) => {
      if (!product) return;
      const mainFirst = sortImages(next);
      const fd = new FormData();
      fd.append("productId", product.id);
      fd.append("orderedIds", JSON.stringify(mainFirst.map((x) => x.id)));
      const res = await setProductImageOrder(fd);
      if (!res.ok) throw new Error(res.error);
      setOrdered(mainFirst);
      onRefresh?.();
      showSuccess();
    },
    [product, onRefresh, showSuccess],
  );

  const uploadFiles = useCallback(
    async (list: FileList | File[]) => {
      const arr = Array.from(list).filter((f) => f.type.startsWith("image/"));
      if (arr.length === 0) return;

      if (!product?.id) {
        setSelectedFiles([...selectedFiles, ...arr]);
        return;
      }

      setBusy(true);
      setToast(null);
      try {
        let order = ordered.length;
        const hadImages = ordered.length > 0;
        const added: Img[] = [];

        for (let i = 0; i < arr.length; i++) {
          let file = arr[i];
          try {
            file = await withTimeout(
              compressImageForUpload(file),
              COMPRESS_TIMEOUT_MS,
              "compress",
            );
          } catch (e) {
            if (e instanceof Error && e.message === "FILE_TOO_LARGE") throw e;
            if (e instanceof Error && e.message.startsWith("TIMEOUT:")) throw e;
          }

          const path = await uploadAdminAsset(file, "products", {
            entityId: product.id,
            originalName: arr[i].name,
            compress: false,
          });

          const fd = new FormData();
          fd.append("productId", product.id);
          fd.append("url", path);
          fd.append("sortOrder", String(order++));
          if (!hadImages && i === 0) fd.append("isMain", "on");

          const res = await addProductImage(fd);
          if (!res.ok) throw new Error(res.error);
          added.push(res.data);
        }

        setOrdered((prev) => sortImages([...prev, ...added]));
        setActiveIdx((prev) => (ordered.length === 0 ? 0 : prev));
        showSuccess();
        onRefresh?.();
      } catch (e) {
        showError(e, "uploadFiles");
      } finally {
        setBusy(false);
      }
    },
    [
      product,
      ordered.length,
      selectedFiles,
      setSelectedFiles,
      onRefresh,
      showSuccess,
      showError,
    ],
  );

  const handleSetMain = async (imageId: string) => {
    if (!product) return;
    setBusy(true);
    setToast(null);
    try {
      const fd = new FormData();
      fd.append("productId", product.id);
      fd.append("imageId", imageId);
      const res = await setMainProductImage(fd);
      if (!res.ok) throw new Error(res.error);
      setOrdered((prev) =>
        sortImages(
          prev.map((im) => ({
            ...im,
            isMain: im.id === imageId,
          })),
        ),
      );
      showSuccess();
      onRefresh?.();
    } catch (e) {
      showError(e, "handleSetMain");
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (idx: number, direction: "left" | "right") => {
    if (idx <= 0) return;
    const target = direction === "left" ? idx - 1 : idx + 1;
    if (target <= 0 || target >= ordered.length) return;
    const next = [...ordered];
    [next[idx], next[target]] = [next[target], next[idx]];
    setActiveIdx(target);
    setBusy(true);
    setToast(null);
    try {
      await persistOrder(next.map((x, i) => ({ ...x, sortOrder: i })));
    } catch (e) {
      showError(e, "handleMove");
      setOrdered(sortImages(product?.images ?? []));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!product) return;
    setBusy(true);
    setToast(null);
    try {
      const fd = new FormData();
      fd.append("imageId", imageId);
      const res = await deleteProductImage(fd);
      if (!res.ok) throw new Error(res.error);
      setOrdered((prev) => sortImages(prev.filter((im) => im.id !== imageId)));
      setActiveIdx((i) => Math.max(0, Math.min(i, ordered.length - 2)));
      showSuccess();
      onRefresh?.();
    } catch (e) {
      showError(e, "handleDelete");
    } finally {
      setBusy(false);
    }
  };

  const pendingPreviews = useMemo(
    () => selectedFiles.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [selectedFiles],
  );

  useEffect(() => {
    return () => {
      for (const p of pendingPreviews) URL.revokeObjectURL(p.url);
    };
  }, [pendingPreviews]);

  return (
    <div className="relative space-y-4">
      {toast && (
        <ImageToast kind={toast.kind} message={toast.message} onDismiss={() => setToast(null)} />
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{t("productImagesLabel")}</div>
          <p className="mt-0.5 text-xs text-slate-500">{t("productImagesStudioHint")}</p>
        </div>
        {onCopyToColors && ordered.length > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={onCopyToColors}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-900 hover:bg-blue-100 disabled:opacity-50"
          >
            {t("copyImagesToColors")}
          </button>
        )}
      </div>

      <div
        className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-6 transition hover:border-blue-400 hover:bg-blue-50/30"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void uploadFiles(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          id={fileInputId}
          disabled={busy}
          onChange={(e) => {
            const f = e.currentTarget.files;
            if (f?.length) void uploadFiles(f);
            e.currentTarget.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-slate-700">{t("dropImagesHere")}</p>
          <label
            htmlFor={fileInputId}
            className={`cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 ${busy ? "pointer-events-none opacity-50" : ""}`}
          >
            {busy ? t("saving") : t("chooseImages")}
          </label>
        </div>
      </div>

      {selectedFiles.length > 0 && !product?.id && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4">
          <span className="text-xs font-semibold text-amber-900">
            {t("pendingUploads")} ({selectedFiles.length}) — {t("pendingUploadsSaveHint")}
          </span>
          <ul className="mt-3 flex flex-wrap gap-3">
            {pendingPreviews.map((p) => (
              <li key={p.url}>
                <AssetImg path={p.url} alt="" className="h-20 w-20 rounded-xl border object-cover" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {product && ordered.length > 0 && active && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
            <div className="relative mx-auto aspect-square max-h-[420px] w-full max-w-lg">
              <AssetImg path={active.url} alt="" className="object-contain" />
            </div>
            {active.isMain && (
              <span className="absolute start-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow">
                ★ {t("main")}
              </span>
            )}
          </div>

          {active && (
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
              <span className="w-full text-center text-xs font-medium text-slate-500">{t("imageActions")}</span>
              {!active.isMain && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleSetMain(active.id)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  ⭐ {t("setAsMainImage")}
                </button>
              )}
              <button
                type="button"
                disabled={busy || activeIdx <= 1}
                onClick={() => void handleMove(activeIdx, "left")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                title={t("moveImageRight")}
              >
                ⬆ {t("moveImageRight")}
              </button>
              <button
                type="button"
                disabled={busy || activeIdx === 0 || activeIdx >= ordered.length - 1}
                onClick={() => void handleMove(activeIdx, "right")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                title={t("moveImageLeft")}
              >
                ⬇ {t("moveImageLeft")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDelete(active.id)}
                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                🗑 {t("deleteShort")}
              </button>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1">
            {ordered.map((im, idx) => (
              <button
                key={im.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition md:h-24 md:w-24 ${
                  idx === activeIdx
                    ? "border-blue-600 shadow-md ring-2 ring-blue-300"
                    : "border-slate-200 hover:border-blue-400"
                }`}
              >
                <AssetImg path={im.url} alt="" className="object-cover" />
                {im.isMain && (
                  <span className="absolute bottom-0 inset-x-0 bg-blue-600/95 py-0.5 text-center text-[10px] font-bold text-white">
                    {t("main")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
