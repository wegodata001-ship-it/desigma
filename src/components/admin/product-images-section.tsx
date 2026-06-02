"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { ProductImageStudioModal, type StudioSource } from "@/components/admin/product-image-studio-modal";
import {
  CatalogProductImage,
  CatalogProductImagePreview,
} from "@/components/storefront/catalog-product-image";
import { useAdminI18n } from "@/lib/admin-i18n";
import { resolveUploadErrorMessage, type UploadErrorMessages } from "@/lib/admin-upload-errors";
import { uploadAdminAsset } from "@/lib/admin-upload-client";
import { ProductImageGalleryCard } from "@/components/admin/product-image-gallery-grid";
import {
  addProductImage,
  deleteProductImage,
  replaceProductImage,
  setProductImageOrder,
} from "@/app/admin/actions";
import type { GalleryDisplayConfig } from "@/lib/product-gallery-display";
import type { StudioExportBundle } from "@/lib/product-image-studio/types";

export type Img = { id: string; url: string; isMain: boolean; sortOrder: number };

/** Visual list order (sortOrder). First image = main — same as Shopify / server reorder. */
function withVisualOrder(im: Img[]): Img[] {
  return [...im]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img, i) => ({ ...img, sortOrder: i, isMain: i === 0 }));
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
  galleryDisplay,
  onImagesChange,
  onCopyToColors,
}: {
  product: { id: string; images: Img[] } | null;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  galleryDisplay: GalleryDisplayConfig;
  /** Optimistic patch — avoids router.refresh() after each image save */
  onImagesChange?: (productId: string, images: Img[]) => void;
  onCopyToColors?: () => void;
}) {
  const { t } = useAdminI18n();
  const fileInputId = useId();
  const [ordered, setOrdered] = useState<Img[]>(() => withVisualOrder(product?.images ?? []));
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [studioSource, setStudioSource] = useState<StudioSource | null>(null);
  const [fileQueue, setFileQueue] = useState<File[]>([]);

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
    setOrdered(withVisualOrder(product?.images ?? []));
  }, [product?.images]);

  const patchImages = useCallback(
    (next: Img[]) => {
      const normalized = withVisualOrder(next);
      setOrdered(normalized);
      if (product?.id) onImagesChange?.(product.id, normalized);
    },
    [onImagesChange, product?.id],
  );

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

  const persistBundle = useCallback(
    async (bundle: StudioExportBundle, opts: { imageId?: string; setMain?: boolean }) => {
      if (!product?.id) return;
      const path = await uploadAdminAsset(bundle.display, "products", {
        entityId: product.id,
        originalName: bundle.display.name,
        compress: false,
      });
      const base = path.replace(/\.[^/]+$/, "");
      const stem = base.split("/").pop() ?? "image";
      void Promise.all([
        uploadAdminAsset(bundle.original, "products", {
          entityId: product.id,
          originalName: `${stem}-original.jpg`,
          compress: false,
        }),
        uploadAdminAsset(bundle.thumb, "products", {
          entityId: product.id,
          originalName: `${stem}-thumb.webp`,
          compress: false,
        }),
      ]).catch(() => undefined);

      if (opts.imageId) {
        const fd = new FormData();
        fd.append("imageId", opts.imageId);
        fd.append("url", path);
        const res = await replaceProductImage(fd);
        if (!res.ok) throw new Error(res.error);
        patchImages(ordered.map((im) => (im.id === opts.imageId ? { ...im, url: path } : im)));
      } else {
        const fd = new FormData();
        fd.append("productId", product.id);
        fd.append("url", path);
        fd.append("sortOrder", String(ordered.length));
        if (opts.setMain) fd.append("isMain", "on");
        const res = await addProductImage(fd);
        if (!res.ok) throw new Error(res.error);
        patchImages([...ordered, res.data]);
      }
      showSuccess();
    },
    [ordered, patchImages, product?.id, showSuccess],
  );

  const openStudioForQueue = useCallback((queue: File[]) => {
    if (queue.length === 0) return;
    setFileQueue(queue.slice(1));
    setStudioSource({ kind: "file", file: queue[0]! });
  }, []);

  const queueNextStudio = useCallback(() => {
    setFileQueue((q) => {
      if (q.length === 0) {
        setStudioSource(null);
        return q;
      }
      const [next, ...rest] = q;
      setStudioSource({ kind: "file", file: next! });
      return rest;
    });
  }, []);

  const onFilesPicked = useCallback(
    (list: FileList | File[]) => {
      const arr = Array.from(list).filter((f) => f.type.startsWith("image/"));
      if (arr.length === 0) return;

      if (!product?.id) {
        setSelectedFiles([...selectedFiles, ...arr]);
        return;
      }
      openStudioForQueue(arr);
    },
    [openStudioForQueue, product?.id, selectedFiles, setSelectedFiles],
  );

  const handleStudioSave = useCallback(
    async (bundle: StudioExportBundle, meta: { imageId?: string }) => {
      setBusy(true);
      try {
        const hadImages = ordered.length > 0;
        await persistBundle(bundle, {
          imageId: meta.imageId,
          setMain: !hadImages && !meta.imageId,
        });
        if (fileQueue.length > 0) {
          queueNextStudio();
        } else {
          setStudioSource(null);
        }
      } catch (e) {
        showError(e, "studioSave");
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [fileQueue.length, ordered.length, persistBundle, queueNextStudio, showError],
  );

  const persistOrder = useCallback(
    async (next: Img[]) => {
      if (!product) return;
      const normalized = withVisualOrder(next);
      const fd = new FormData();
      fd.append("productId", product.id);
      fd.append("orderedIds", JSON.stringify(normalized.map((x) => x.id)));
      const res = await setProductImageOrder(fd);
      if (!res.ok) throw new Error(res.error);
      patchImages(normalized);
      showSuccess();
    },
    [patchImages, product, showSuccess],
  );

  const reorderImages = useCallback(
    (fromId: string, toId: string) => {
      const fromIdx = ordered.findIndex((im) => im.id === fromId);
      const toIdx = ordered.findIndex((im) => im.id === toId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return null;
      const next = [...ordered];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved!);
      return withVisualOrder(next);
    },
    [ordered],
  );

  const handleGalleryDrop = useCallback(
    async (targetId: string) => {
      if (!dragId || dragId === targetId || !product) return;
      const next = reorderImages(dragId, targetId);
      if (!next) return;
      setDragId(null);
      setDropTargetId(null);
      setBusy(true);
      setToast(null);
      try {
        await persistOrder(next);
      } catch (e) {
        showError(e, "handleGalleryDrop");
        setOrdered(withVisualOrder(product.images ?? []));
      } finally {
        setBusy(false);
      }
    },
    [dragId, onImagesChange, persistOrder, product, reorderImages, showError],
  );

  const openEditStudio = useCallback((im: Img) => {
    setStudioSource({ kind: "url", url: im.url, imageId: im.id });
  }, []);

  const handleDelete = async (imageId: string) => {
    if (!product) return;
    setBusy(true);
    setToast(null);
    try {
      const fd = new FormData();
      fd.append("imageId", imageId);
      const res = await deleteProductImage(fd);
      if (!res.ok) throw new Error(res.error);
      patchImages(ordered.filter((im) => im.id !== imageId));
      showSuccess();
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

      <ProductImageStudioModal
        open={studioSource != null}
        source={studioSource}
        galleryDisplay={galleryDisplay}
        onClose={() => {
          setStudioSource(null);
          setFileQueue([]);
        }}
        onSave={handleStudioSave}
      />

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
          onFilesPicked(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          id={fileInputId}
          disabled={busy || studioSource != null}
          onChange={(e) => {
            const f = e.currentTarget.files;
            if (f?.length) onFilesPicked(f);
            e.currentTarget.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-slate-700">{t("dropImagesHere")}</p>
          <label
            htmlFor={fileInputId}
            className={`cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 ${busy || studioSource ? "pointer-events-none opacity-50" : ""}`}
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
          <ul className="mt-3 flex flex-col gap-4">
            {pendingPreviews.map((p) => (
              <li key={p.url} className="max-w-md">
                <span className="mb-1 block truncate text-[11px] font-medium text-amber-900">{p.name}</span>
                <CatalogProductImagePreview src={p.url} alt={p.name} variant="card" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {product && ordered.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">{t("dragReorderHint")}</p>
          <p className="text-xs font-medium text-blue-800">{t("firstImageIsMain")}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {ordered.map((im, idx) => (
              <ProductImageGalleryCard
                key={im.id}
                image={im}
                index={idx}
                busy={busy || studioSource != null}
                isDragging={dragId === im.id}
                isDropTarget={dropTargetId === im.id && dragId !== im.id}
                editLabel={t("editImage")}
                mainLabel={t("main")}
                deleteLabel={t("deleteShort")}
                dragHandleLabel={t("dragReorderHint")}
                onEdit={() => openEditStudio(im)}
                onDelete={() => void handleDelete(im.id)}
                onDragStart={() => setDragId(im.id)}
                onDragEnd={() => {
                  setDragId(null);
                  setDropTargetId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragId && dragId !== im.id) setDropTargetId(im.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  void handleGalleryDrop(im.id);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
