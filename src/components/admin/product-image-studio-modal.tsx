"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ProductImageCropper,
  STUDIO_CROP_PRESET_IDS,
  type ProductImageCropperHandle,
} from "@/components/admin/product-image-cropper";
import { useAdminI18n } from "@/lib/admin-i18n";
import { lockBodyScroll } from "@/lib/modal-scroll-lock";
import { autoFixImageFile } from "@/lib/product-image-studio/auto-fix";
import { buildStudioExportBundle } from "@/lib/product-image-studio/export-bundle";
import { STUDIO_BG_HEX, type StudioBackground, type StudioExportBundle } from "@/lib/product-image-studio/types";
import type { GalleryDisplayConfig } from "@/lib/product-gallery-display";
import { resolvePublicAssetSrc } from "@/lib/assets-path";

export type StudioSource =
  | { kind: "file"; file: File }
  | { kind: "url"; url: string; imageId?: string };

export function ProductImageStudioModal({
  open,
  source,
  galleryDisplay,
  onClose,
  onSave,
}: {
  open: boolean;
  source: StudioSource | null;
  galleryDisplay: GalleryDisplayConfig;
  onClose: () => void;
  onSave: (bundle: StudioExportBundle, meta: { imageId?: string }) => Promise<void>;
}) {
  const { t } = useAdminI18n();
  const cropperRef = useRef<ProductImageCropperHandle>(null);
  const originalFileRef = useRef<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const [workSrc, setWorkSrc] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [background, setBackground] = useState<StudioBackground>("white");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !source) return;
    let revoked: string | null = null;
    setError(null);
    setPreparing(true);

    void (async () => {
      try {
        let file: File;
        if (source.kind === "file") {
          file = source.file;
        } else {
          const res = await fetch(resolvePublicAssetSrc(source.url));
          const blob = await res.blob();
          file = new File([blob], "edit.jpg", { type: blob.type || "image/jpeg" });
        }
        originalFileRef.current = file;
        const fixed = await autoFixImageFile(file, {
          background: STUDIO_BG_HEX.white,
          targetAspect: 1,
        });
        revoked = URL.createObjectURL(fixed);
        setWorkSrc(revoked);
      } catch (e) {
        setError(e instanceof Error ? e.message : "טעינת תמונה נכשלה");
      } finally {
        setPreparing(false);
      }
    })();

    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [open, source]);

  useEffect(() => {
    if (!open) {
      setWorkSrc(null);
      originalFileRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const unlock = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlock();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, saving]);

  const handleSave = useCallback(async () => {
    if (!cropperRef.current || !originalFileRef.current) return;
    setSaving(true);
    setError(null);
    try {
      const cropped = await cropperRef.current.exportCropped();
      const bundle = await buildStudioExportBundle(cropped, originalFileRef.current);
      await onSave(bundle, { imageId: source?.kind === "url" ? source.imageId : undefined });
      // Parent keeps modal open for multi-file queue; closes via `open` when done
    } catch (e) {
      setError(e instanceof Error ? e.message : t("imageSaveFailed"));
    } finally {
      setSaving(false);
    }
  }, [onClose, onSave, source, t]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[130] flex flex-col bg-slate-950/95">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-white">סטודיו תמונות מוצר</h2>
          <p className="text-xs text-slate-400">עריכה בדפדפן · העלאה רק בלחיצה על שמור</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">רקע:</span>
          {(["white", "black", "gray", "transparent"] as const).map((bg) => (
            <button
              key={bg}
              type="button"
              disabled={saving || preparing}
              onClick={() => setBackground(bg)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                background === bg
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-slate-600 bg-slate-800 text-slate-200"
              }`}
            >
              {bg === "white"
                ? "לבן"
                : bg === "black"
                  ? "שחור"
                  : bg === "gray"
                    ? "אפור"
                    : "שקוף"}
            </button>
          ))}
          <button
            type="button"
            disabled={saving || preparing}
            onClick={() => cropperRef.current?.runSmartProduct()}
            className="rounded-lg border border-violet-500/50 bg-violet-600/20 px-3 py-1.5 text-xs font-semibold text-violet-100"
          >
            התאם למוצר
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={saving || preparing || !workSrc}
            onClick={() => void handleSave()}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? t("saving") : "שמור"}
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto bg-white p-4">
        {error && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
        {preparing && (
          <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
            מכין תמונה…
          </div>
        )}
        {!preparing && workSrc && (
          <ProductImageCropper
            ref={cropperRef}
            src={workSrc}
            alt=""
            galleryDisplay={galleryDisplay}
            busy={saving}
            onCancel={onClose}
            presetIds={STUDIO_CROP_PRESET_IDS}
            background={background}
            hideApplyButton
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
