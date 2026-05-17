"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAdminI18n } from "@/lib/admin-i18n";
import { flipImageFromUrl, rotateImageFromUrl90CW } from "@/lib/image-compress-client";
import { IMAGE_FIT_MODES, imageFitClass, type ImageFitMode } from "@/lib/product-media-fit";

const FIT_I18N_KEY: Record<ImageFitMode, string> = {
  contain: "mediaFit_contain",
  cover: "mediaFit_cover",
  original: "mediaFit_original",
  "fit-width": "mediaFit_fit-width",
  "fit-height": "mediaFit_fit-height",
};
import { galleryMainMaxStyle, type GalleryDisplayConfig } from "@/lib/product-gallery-display";
import {
  buildImageTransformStyle,
  clampZoom,
  DEFAULT_MEDIA_TRANSFORM,
  type MediaTransform,
} from "@/lib/product-media-transform";
import { resolvePublicAssetSrc } from "@/lib/assets-path";
import { lockBodyScroll } from "@/lib/modal-scroll-lock";
import { ProductImageCropper } from "@/components/admin/product-image-cropper";

function MediaCanvasImage({
  src,
  alt,
  fitMode,
  transform,
  compareOriginal,
  originalTransform,
}: {
  src: string;
  alt: string;
  fitMode: ImageFitMode;
  transform: MediaTransform;
  compareOriginal?: boolean;
  originalTransform?: MediaTransform;
}) {
  const t = compareOriginal ? (originalTransform ?? DEFAULT_MEDIA_TRANSFORM) : transform;
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={`select-none ${imageFitClass(fitMode)}`}
      style={buildImageTransformStyle(t)}
    />
  );
}

function StorefrontPreviewMock({
  mode,
  src,
  alt,
  fitMode,
  transform,
  label,
  frameClass,
}: {
  mode: "desktop" | "mobile" | "card";
  src: string;
  alt: string;
  fitMode: ImageFitMode;
  transform: MediaTransform;
  label: string;
  frameClass: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={frameClass}>
        {mode === "card" ? (
          <div className="flex h-full flex-col rounded-xl border border-zinc-800 bg-[#111827] p-2">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-black/40">
              <MediaCanvasImage src={src} alt={alt} fitMode={fitMode} transform={transform} />
            </div>
            <div className="mt-2 h-2 w-3/4 rounded bg-zinc-700" />
            <div className="mt-1 h-2 w-1/2 rounded bg-orange-500/40" />
          </div>
        ) : (
          <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
            <MediaCanvasImage src={src} alt={alt} fitMode={fitMode} transform={transform} />
          </div>
        )}
      </div>
    </div>
  );
}


type ToolbarBtnProps = {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
};

function ToolbarBtn({ active, disabled, onClick, title, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm transition ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

export function ProductMediaEditor({
  imageUrl,
  alt,
  galleryDisplay,
  isMain,
  busy,
  onSetMain,
  onReplaceFile,
  onDelete,
  onCropSaved,
}: {
  imageUrl: string;
  alt: string;
  galleryDisplay: GalleryDisplayConfig;
  isMain: boolean;
  busy?: boolean;
  onSetMain: () => void;
  onReplaceFile: (file: File) => Promise<void>;
  onDelete: () => void;
  onCropSaved?: () => void;
}) {
  const { t } = useAdminI18n();
  const replaceInputId = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fitMode, setFitMode] = useState<ImageFitMode>("contain");
  const [transform, setTransform] = useState<MediaTransform>(DEFAULT_MEDIA_TRANSFORM);
  const [baselineTransform, setBaselineTransform] = useState<MediaTransform>(DEFAULT_MEDIA_TRANSFORM);
  const [compare, setCompare] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [panning, setPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [livePreview, setLivePreview] = useState<"desktop" | "mobile" | "card">("desktop");

  const src = resolvePublicAssetSrc(imageUrl);
  const maxStyle = galleryMainMaxStyle(galleryDisplay);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setTransform(DEFAULT_MEDIA_TRANSFORM);
    setBaselineTransform(DEFAULT_MEDIA_TRANSFORM);
    setCompare(false);
    setCropMode(false);
  }, [imageUrl]);

  useEffect(() => {
    if (!fullscreen) return;
    const unlock = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlock();
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const resetTransform = useCallback(() => {
    setTransform(DEFAULT_MEDIA_TRANSFORM);
    setBaselineTransform(DEFAULT_MEDIA_TRANSFORM);
    setCompare(false);
  }, []);

  const runFileOp = useCallback(
    async (factory: () => Promise<File>) => {
      try {
        const file = await factory();
        await onReplaceFile(file);
        resetTransform();
        setCropMode(false);
      } catch {
        /* CORS / load */
      }
    },
    [onReplaceFile, resetTransform],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: transform.panX, panY: transform.panY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!panning || !panStart.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setTransform((prev) => ({
      ...prev,
      panX: panStart.current!.panX + dx,
      panY: panStart.current!.panY + dy,
    }));
  };

  const onPointerUp = () => {
    setPanning(false);
    panStart.current = null;
  };

  const editorBody = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 p-2">
        <ToolbarBtn
          title={t("mediaToolZoomIn")}
          disabled={busy}
          onClick={() => setTransform((p) => ({ ...p, zoom: clampZoom(p.zoom + 0.15) }))}
        >
          +
        </ToolbarBtn>
        <ToolbarBtn
          title={t("mediaToolZoomOut")}
          disabled={busy}
          onClick={() => setTransform((p) => ({ ...p, zoom: clampZoom(p.zoom - 0.15) }))}
        >
          −
        </ToolbarBtn>
        <ToolbarBtn
          title={t("rotate90")}
          disabled={busy}
          onClick={() =>
            setTransform((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))
          }
        >
          ⟳
        </ToolbarBtn>
        <ToolbarBtn
          title={t("mediaToolFlipH")}
          disabled={busy}
          onClick={() => setTransform((p) => ({ ...p, flipH: !p.flipH }))}
        >
          ⇋
        </ToolbarBtn>
        <ToolbarBtn
          title={t("mediaToolFlipV")}
          disabled={busy}
          onClick={() => setTransform((p) => ({ ...p, flipV: !p.flipV }))}
        >
          ⇅
        </ToolbarBtn>
        <ToolbarBtn
          active={cropMode}
          title={t("mediaToolCrop")}
          disabled={busy}
          onClick={() => setCropMode((v) => !v)}
        >
          ⬚
        </ToolbarBtn>
        <ToolbarBtn
          active={compare}
          title={t("mediaToolCompare")}
          disabled={busy}
          onClick={() => {
            setCompare((v) => {
              if (!v) setBaselineTransform(transform);
              return !v;
            });
          }}
        >
          ◫
        </ToolbarBtn>
        <ToolbarBtn title={t("mediaToolReset")} disabled={busy} onClick={resetTransform}>
          ↺
        </ToolbarBtn>
        <div className="mx-1 hidden h-6 w-px bg-slate-300 sm:block" />
        {IMAGE_FIT_MODES.map((mode) => (
          <ToolbarBtn
            key={mode}
            active={fitMode === mode}
            title={t(FIT_I18N_KEY[mode])}
            onClick={() => setFitMode(mode)}
          >
            <span className="text-[10px] font-bold uppercase">{mode.slice(0, 4)}</span>
          </ToolbarBtn>
        ))}
        {cropMode && (
          <span className="ms-2 text-xs font-medium text-slate-600">{t("cropEditorTitle")}</span>
        )}
      </div>

      {cropMode ? (
        <ProductImageCropper
          src={src}
          alt={alt}
          galleryDisplay={galleryDisplay}
          busy={busy}
          onCancel={() => setCropMode(false)}
          onApply={async (file) => {
            await onReplaceFile(file);
            resetTransform();
            setCropMode(false);
            onCropSaved?.();
          }}
        />
      ) : (
      <div className={`grid gap-4 ${fullscreen ? "lg:grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_240px]"}`}>
        <div className="space-y-3">
          <div
            ref={frameRef}
            className={`relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_center,_#f8fafc_0%,_#e2e8f0_100%)] shadow-inner ${
              fullscreen ? "min-h-[min(78vh,900px)]" : "min-h-[min(68vh,720px)]"
            }`}
            style={fullscreen ? undefined : maxStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {compare && (
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 overflow-hidden border-r-2 border-blue-500/80 bg-white/5">
                <div className="flex h-full w-[200%] items-center justify-center">
                  <MediaCanvasImage
                    src={src}
                    alt={alt}
                    fitMode={fitMode}
                    transform={baselineTransform}
                  />
                </div>
                <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
                  {t("mediaBefore")}
                </span>
              </div>
            )}
            <div
              className={`relative flex h-full w-full max-h-full max-w-full items-center justify-center p-4 ${
                panning ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <MediaCanvasImage
                src={src}
                alt={alt}
                fitMode={fitMode}
                transform={transform}
                compareOriginal={false}
              />
            </div>
            {compare && (
              <span className="absolute right-2 top-2 rounded bg-blue-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
                {t("mediaAfter")}
              </span>
            )}
            {isMain && (
              <span className="absolute bottom-3 left-3 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                ★ {t("main")}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onSetMain}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              ★ {t("setAsMainImage")}
            </button>
            <label
              htmlFor={replaceInputId}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              ↻ {t("replaceImage")}
              <input
                id={replaceInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void onReplaceFile(f);
                }}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              onClick={() => void runFileOp(() => rotateImageFromUrl90CW(src))}
            >
              ⟳ {t("mediaSaveRotate")}
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              onClick={() => void runFileOp(() => flipImageFromUrl(src, true, false))}
            >
              ⇋ {t("mediaSaveFlip")}
            </button>
            <a
              href={src}
              download
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              ⬇ {t("downloadImage")}
            </a>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              ✕ {t("deleteShort")}
            </button>
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="ms-auto rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              ⛶ {t("mediaEditorFullscreen")}
            </button>
          </div>
        </div>

        {!fullscreen && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("mediaLivePreview")}
            </div>
            <div className="flex gap-1 rounded-lg border border-slate-100 p-0.5 text-[10px] font-semibold">
              {(["desktop", "mobile", "card"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLivePreview(m)}
                  className={`flex-1 rounded-md px-2 py-1 ${
                    livePreview === m ? "bg-slate-900 text-white" : "text-slate-600"
                  }`}
                >
                  {m === "desktop"
                    ? t("previewDesktop")
                    : m === "mobile"
                      ? t("previewMobile")
                      : t("previewProductCard")}
                </button>
              ))}
            </div>
            <StorefrontPreviewMock
              mode={livePreview}
              src={src}
              alt={alt}
              fitMode={fitMode}
              transform={transform}
              label={
                livePreview === "desktop"
                  ? t("previewDesktop")
                  : livePreview === "mobile"
                    ? t("previewMobile")
                    : t("previewProductCard")
              }
              frameClass={
                livePreview === "mobile"
                  ? "mx-auto w-[200px]"
                  : livePreview === "card"
                    ? "w-[160px]"
                    : "w-full max-w-[280px]"
              }
            />
          </div>
        )}
      </div>
      )}
    </div>
  );

  if (fullscreen && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-[110] flex flex-col bg-slate-950/95 p-4 md:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-white">{t("mediaEditorFullscreen")}</h3>
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            ✕ {t("cancel")}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-700 bg-white p-4">
          {editorBody}
        </div>
      </div>,
      document.body,
    );
  }

  return editorBody;
}

