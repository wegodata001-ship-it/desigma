"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { AssetImg } from "@/components/asset-img";
import { ProductMediaEditor } from "@/components/admin/product-media-editor";
import { useAdminI18n } from "@/lib/admin-i18n";
import { uploadAdminAsset } from "@/lib/admin-upload-client";
import {
  deleteProductImage,
  replaceProductImage,
  setMainProductImage,
  setProductImageOrder,
} from "@/app/admin/actions";
import { compressImageForUpload } from "@/lib/image-compress-client";
import type { GalleryDisplayConfig } from "@/lib/product-gallery-display";

export type Img = { id: string; url: string; isMain: boolean; sortOrder: number };

function sortImages(im: Img[]): Img[] {
  return [...im].sort((a, b) => {
    if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
}

export function ProductImagesSection({
  product,
  galleryDisplay,
  selectedFiles,
  setSelectedFiles,
  onRefresh,
}: {
  product: { id: string; images: Img[] } | null;
  galleryDisplay: GalleryDisplayConfig;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  onRefresh?: () => void;
}) {
  const { t } = useAdminI18n();
  const fileInputId = useId();
  const [ordered, setOrdered] = useState<Img[]>(() => sortImages(product?.images ?? []));
  const [activeIdx, setActiveIdx] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const next = sortImages(product?.images ?? []);
    setOrdered(next);
    setActiveIdx((i) => Math.min(i, Math.max(0, next.length - 1)));
  }, [product?.images]);

  const active = ordered[activeIdx] ?? null;

  const onDropFiles = useCallback(
    (list: FileList | File[]) => {
      const arr = Array.from(list).filter((f) => f.type.startsWith("image/"));
      if (arr.length === 0) return;
      setSelectedFiles([...selectedFiles, ...arr]);
    },
    [selectedFiles, setSelectedFiles],
  );

  const persistOrder = useCallback(
    async (next: Img[]) => {
      if (!product) return;
      const fd = new FormData();
      fd.append("productId", product.id);
      fd.append("orderedIds", JSON.stringify(next.map((x) => x.id)));
      const res = await setProductImageOrder(fd);
      if (!res.ok) throw new Error(res.error);
      onRefresh?.();
    },
    [product, onRefresh],
  );

  const handleDropReorder = async (targetId: string) => {
    if (!dragId || dragId === targetId || !product) return;
    const ids = ordered.map((x) => x.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const nextIds = [...ids];
    const [moved] = nextIds.splice(from, 1);
    nextIds.splice(to, 0, moved);
    const byId = new Map(ordered.map((x) => [x.id, x]));
    const next = nextIds.map((id, idx) => {
      const row = byId.get(id)!;
      return { ...row, sortOrder: idx };
    });
    setOrdered(next);
    setDragId(null);
    try {
      await persistOrder(next);
    } catch {
      setOrdered(sortImages(product.images));
    }
  };

  const runReplaceUpload = async (imageId: string, file: File) => {
    if (!product) return;
    setBusyId(imageId);
    try {
      let uploadFile = file;
      try {
        uploadFile = await compressImageForUpload(file);
      } catch (e) {
        if (e instanceof Error && e.message === "FILE_TOO_LARGE") throw e;
      }
      const path = await uploadAdminAsset(uploadFile, "products", {
        entityId: product.id,
        originalName: file.name,
        compress: false,
      });
      const fd = new FormData();
      fd.append("imageId", imageId);
      fd.append("url", path);
      const res = await replaceProductImage(fd);
      if (!res.ok) throw new Error(res.error);
      onRefresh?.();
    } finally {
      setBusyId(null);
    }
  };

  const previews = useMemo(
    () => selectedFiles.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [selectedFiles],
  );

  useEffect(() => {
    return () => {
      for (const p of previews) URL.revokeObjectURL(p.url);
    };
  }, [previews]);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold text-slate-900">{t("productImagesLabel")}</div>
        <p className="mt-0.5 text-xs text-slate-500">{t("productImagesStudioHint")}</p>
      </div>

      <div
        className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-8 transition hover:border-blue-400 hover:bg-blue-50/30"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onDropFiles(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          id={fileInputId}
          onChange={(e) => {
            const f = e.currentTarget.files;
            if (f?.length) onDropFiles(f);
            e.currentTarget.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-slate-700">{t("dropImagesHere")}</p>
          <label
            htmlFor={fileInputId}
            className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            {t("chooseImages")}
          </label>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4">
          <span className="text-xs font-semibold text-emerald-900">
            {t("pendingUploads")} ({selectedFiles.length}) — {t("pendingUploadsSaveHint")}
          </span>
          <ul className="mt-3 flex flex-wrap gap-3">
            {previews.map((p) => (
              <li key={p.url}>
                <Image
                  src={p.url}
                  alt=""
                  width={112}
                  height={112}
                  unoptimized
                  className="h-28 w-28 rounded-xl border border-emerald-200 object-cover shadow-sm"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {product && ordered.length > 0 && active && (
        <div className="space-y-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {ordered.map((im, idx) => (
              <div
                key={im.id}
                draggable
                onDragStart={() => setDragId(im.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => void handleDropReorder(im.id)}
                className={`group/thumb relative shrink-0 ${
                  idx === activeIdx ? "ring-2 ring-blue-500 ring-offset-2" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`relative h-24 w-24 overflow-hidden rounded-xl border-2 transition md:h-28 md:w-28 ${
                    idx === activeIdx
                      ? "border-blue-600 shadow-md"
                      : "border-slate-200 hover:border-blue-400 hover:shadow"
                  }`}
                >
                  <AssetImg path={im.url} alt="" className="object-cover transition group-hover/thumb:scale-105" />
                  {im.isMain && (
                    <span className="absolute bottom-0 left-0 right-0 bg-blue-600/95 py-0.5 text-center text-[10px] font-bold text-white">
                      {t("main")}
                    </span>
                  )}
                </button>
                <div className="pointer-events-none absolute inset-0 flex items-start justify-end gap-1 p-1 opacity-0 transition group-hover/thumb:pointer-events-auto group-hover/thumb:opacity-100">
                  <label
                    className="pointer-events-auto cursor-pointer rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow hover:bg-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ↻
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) void runReplaceUpload(im.id, f);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="pointer-events-auto rounded-md bg-red-600/95 px-1.5 py-0.5 text-[10px] font-bold text-white shadow hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      const fd = new FormData();
                      fd.append("imageId", im.id);
                      void deleteProductImage(fd).then((res) => {
                        if (res.ok) onRefresh?.();
                      });
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">{t("dragReorderHint")}</p>

          {toast && (
            <div
              role="status"
              className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-opacity"
            >
              {toast}
            </div>
          )}

          <ProductMediaEditor
            key={active.id}
            imageUrl={active.url}
            alt={t("productImagesLabel")}
            galleryDisplay={galleryDisplay}
            isMain={active.isMain}
            busy={busyId === active.id}
            onCropSaved={() => setToast(t("imageCropSaved"))}
            onSetMain={async () => {
              const fd = new FormData();
              fd.append("productId", product.id);
              fd.append("imageId", active.id);
              const res = await setMainProductImage(fd);
              if (res.ok) onRefresh?.();
            }}
            onReplaceFile={async (file) => runReplaceUpload(active.id, file)}
            onDelete={async () => {
              const fd = new FormData();
              fd.append("imageId", active.id);
              const res = await deleteProductImage(fd);
              if (res.ok) onRefresh?.();
            }}
          />
        </div>
      )}
    </div>
  );
}
