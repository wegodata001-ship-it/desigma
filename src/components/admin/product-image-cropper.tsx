"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
} from "react";
import { useAdminI18n } from "@/lib/admin-i18n";
import { exportCropFromViewport } from "@/lib/image-compress-client";
import { STUDIO_BG_HEX, type StudioBackground } from "@/lib/product-image-studio/types";
import {
  autoFitTransform,
  cloneCropState,
  computeCropRect,
  CROP_PRESET_ASPECT,
  DEFAULT_CROP_EDITOR_STATE,
  type CropEditorState,
  type CropPresetId,
  type CropRect,
} from "@/lib/crop-editor";
import { galleryMainMaxStyle, type GalleryDisplayConfig } from "@/lib/product-gallery-display";
import {
  buildImageTransformStyle,
  clampZoom,
  DEFAULT_MEDIA_TRANSFORM,
  type MediaTransform,
} from "@/lib/product-media-transform";

const PRESETS: { id: CropPresetId; icon: string; labelKey: string }[] = [
  { id: "product-card", icon: "▣", labelKey: "cropPresetProductCard" },
  { id: "square", icon: "□", labelKey: "cropPresetSquare" },
  { id: "portrait", icon: "▯", labelKey: "cropPresetPortrait" },
  { id: "banner", icon: "▬", labelKey: "cropPresetBanner" },
  { id: "full-width", icon: "▭", labelKey: "cropPresetFullWidth" },
  { id: "mobile-hero", icon: "▮", labelKey: "cropPresetMobileHero" },
];

/** Storefront product studio — 1:1, 4:5, 16:9 + square (free-style resize via crop handles). */
export const STUDIO_CROP_PRESET_IDS: CropPresetId[] = ["product-card", "portrait", "banner", "square"];

export type ProductImageCropperHandle = {
  exportCropped: () => Promise<File>;
  runSmartProduct: () => void;
  runAutoFit: () => void;
};

type ViewportSize = { w: number; h: number };

function CropToolbarButton({
  active,
  disabled,
  onClick,
  title,
  label,
  children,
  className = "",
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-xl border px-2.5 py-2 text-sm font-medium transition sm:flex-row sm:gap-2 ${
        active
          ? "border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-600/25"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      } disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span className="text-base leading-none">{children}</span>
      {label ? <span className="text-[10px] font-semibold sm:text-xs">{label}</span> : null}
    </button>
  );
}

function CroppedLivePreview({
  src,
  alt,
  viewport,
  crop,
  transform,
  frameClass,
  label,
}: {
  src: string;
  alt: string;
  viewport: ViewportSize;
  crop: CropRect;
  transform: MediaTransform;
  frameClass: string;
  label: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pw, setPw] = useState(0);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPw(el.clientWidth));
    ro.observe(el);
    setPw(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const scale = pw > 0 && crop.width > 0 ? pw / crop.width : 1;

  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div ref={boxRef} className={`relative overflow-hidden rounded-xl border border-slate-200 bg-zinc-950 ${frameClass}`}>
        {viewport.w > 0 && pw > 0 ? (
          <div className="absolute inset-0">
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: viewport.w * scale,
                height: viewport.h * scale,
                transform: `translate(${-crop.left * scale}px, ${-crop.top * scale}px)`,
              }}
            >
              <div className="flex h-full w-full items-center justify-center">
                <img
                  src={src}
                  alt={alt}
                  draggable={false}
                  className="max-h-full max-w-full select-none object-contain"
                  style={buildImageTransformStyle(transform)}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CropOverlayMask({
  crop,
  viewport,
  maskId,
}: {
  crop: CropRect;
  viewport: ViewportSize;
  maskId: string;
}) {
  const { w, h } = viewport;
  const { left, top, width, height } = crop;
  const shade = "rgba(15,23,42,0.72)";
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          <rect x={left} y={top} width={width} height={height} fill="black" rx={4} />
        </mask>
      </defs>
      <rect width={w} height={h} fill={shade} mask={`url(#${maskId})`} />
    </svg>
  );
}

export const ProductImageCropper = forwardRef<
  ProductImageCropperHandle,
  {
    src: string;
    alt: string;
    galleryDisplay: GalleryDisplayConfig;
    busy?: boolean;
    onCancel: () => void;
    onApply?: (file: File) => Promise<void>;
    /** Limit aspect presets (studio uses STUDIO_CROP_PRESET_IDS). */
    presetIds?: CropPresetId[];
    background?: StudioBackground;
    hideApplyButton?: boolean;
  }
>(function ProductImageCropper(
  {
    src,
    alt,
    galleryDisplay,
    busy,
    onCancel,
    onApply,
    presetIds,
    background = "white",
    hideApplyButton = false,
  },
  ref,
) {
  const { t } = useAdminI18n();
  const zoomSliderId = useId();
  const cropMaskId = useId().replace(/:/g, "");
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<ViewportSize>({ w: 0, h: 0 });
  const [editor, setEditor] = useState<CropEditorState>(DEFAULT_CROP_EDITOR_STATE);
  const [history, setHistory] = useState<CropEditorState[]>([DEFAULT_CROP_EDITOR_STATE]);
  const [future, setFuture] = useState<CropEditorState[]>([]);
  const [compare, setCompare] = useState(false);
  const [baseline, setBaseline] = useState<MediaTransform>(DEFAULT_MEDIA_TRANSFORM);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [panning, setPanning] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const resizeStart = useRef<{ scale: number; y: number } | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);

  const aspect = CROP_PRESET_ASPECT[editor.preset];
  const crop = computeCropRect(viewport.w, viewport.h, aspect, editor.cropScale);
  const transform = editor.transform;

  const measureViewport = useCallback(() => {
    const el = workspaceRef.current;
    if (!el) return;
    setViewport({ w: el.clientWidth, h: el.clientHeight });
  }, []);

  useEffect(() => {
    measureViewport();
    const el = workspaceRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measureViewport);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureViewport]);

  const pushHistory = useCallback((next: CropEditorState) => {
    setHistory((h) => [...h.slice(-29), cloneCropState(next)]);
    setFuture([]);
  }, []);

  const commitEditor = useCallback(
    (updater: (prev: CropEditorState) => CropEditorState, record = true) => {
      setEditor((prev) => {
        const next = updater(prev);
        if (record) pushHistory(next);
        return next;
      });
    },
    [pushHistory],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length < 2) return h;
      const prev = h[h.length - 2];
      const current = h[h.length - 1];
      setFuture((f) => [current, ...f]);
      setEditor(cloneCropState(prev));
      return h.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const [next, ...rest] = f;
      setHistory((h) => [...h, cloneCropState(next)]);
      setEditor(cloneCropState(next));
      return rest;
    });
  }, []);

  const setZoom = useCallback(
    (zoom: number, record = true) => {
      commitEditor(
        (s) => ({ ...s, transform: { ...s.transform, zoom: clampZoom(zoom) } }),
        record,
      );
    },
    [commitEditor],
  );

  const runAutoFit = useCallback(() => {
    if (imageSize.w <= 0 || viewport.w <= 0) return;
    const nextTransform = autoFitTransform(imageSize.w, imageSize.h, crop, viewport.w, viewport.h);
    commitEditor((s) => ({ ...s, transform: nextTransform }));
  }, [commitEditor, crop, imageSize, viewport]);

  const runSmartProduct = useCallback(() => {
    if (imageSize.w <= 0 || viewport.w <= 0) return;
    const nextTransform = autoFitTransform(imageSize.w, imageSize.h, crop, viewport.w, viewport.h);
    commitEditor((s) => ({
      ...s,
      transform: { ...nextTransform, zoom: clampZoom(nextTransform.zoom * 0.88) },
      cropScale: Math.min(0.88, s.cropScale),
    }));
  }, [commitEditor, crop, imageSize, viewport]);

  const resetView = useCallback(() => {
    commitEditor((s) => ({
      ...s,
      transform: { ...DEFAULT_MEDIA_TRANSFORM },
      cropScale: DEFAULT_CROP_EDITOR_STATE.cropScale,
    }));
  }, [commitEditor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === "+" || e.key === "=") setZoom(transform.zoom + 0.1);
      if (e.key === "-") setZoom(transform.zoom - 0.1);
      const step = e.shiftKey ? 12 : 4;
      if (e.key === "ArrowLeft")
        commitEditor((s) => ({ ...s, transform: { ...s.transform, panX: s.transform.panX - step } }));
      if (e.key === "ArrowRight")
        commitEditor((s) => ({ ...s, transform: { ...s.transform, panX: s.transform.panX + step } }));
      if (e.key === "ArrowUp")
        commitEditor((s) => ({ ...s, transform: { ...s.transform, panY: s.transform.panY - step } }));
      if (e.key === "ArrowDown")
        commitEditor((s) => ({ ...s, transform: { ...s.transform, panY: s.transform.panY + step } }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commitEditor, onCancel, redo, setZoom, transform.zoom, undo]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoom(transform.zoom + delta, false);
    },
    [setZoom, transform.zoom],
  );

  const onPointerDownWorkspace = (e: ReactPointerEvent) => {
    if (e.button !== 0 || resizing) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setPanning(true);
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: transform.panX,
      panY: transform.panY,
    };
  };

  const onPointerMoveWorkspace = (e: ReactPointerEvent) => {
    if (panning && panStart.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setEditor((s) => ({
        ...s,
        transform: {
          ...s.transform,
          panX: panStart.current!.panX + dx,
          panY: panStart.current!.panY + dy,
        },
      }));
    }
    if (resizing && resizeStart.current) {
      const dy = resizeStart.current.y - e.clientY;
      const nextScale = Math.min(0.95, Math.max(0.4, resizeStart.current.scale + dy / 280));
      setEditor((s) => ({ ...s, cropScale: nextScale }));
    }
  };

  const onPointerUpWorkspace = () => {
    if (panning) pushHistory(editor);
    if (resizing) pushHistory(editor);
    setPanning(false);
    setResizing(false);
    panStart.current = null;
    resizeStart.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (pinchRef.current) {
        const ratio = dist / pinchRef.current.dist;
        setZoom(pinchRef.current.zoom * ratio, false);
      } else {
        pinchRef.current = { dist, zoom: transform.zoom };
      }
    }
  };

  const onTouchEnd = () => {
    if (pinchRef.current) pushHistory(editor);
    pinchRef.current = null;
  };

  const startResize = (e: ReactPointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setResizing(true);
    resizeStart.current = { scale: editor.cropScale, y: e.clientY };
  };

  const exportCropped = useCallback(async () => {
    if (viewport.w <= 0) throw new Error("NO_VIEWPORT");
    return exportCropFromViewport(src, viewport.w, viewport.h, crop, transform, {
      background: STUDIO_BG_HEX[background],
      mime: "image/webp",
      quality: 0.91,
    });
  }, [background, crop, src, transform, viewport.h, viewport.w]);

  useImperativeHandle(
    ref,
    () => ({
      exportCropped,
      runSmartProduct,
      runAutoFit,
    }),
    [exportCropped, runAutoFit, runSmartProduct],
  );

  const handleApply = async () => {
    if (viewport.w <= 0 || busy || !onApply) return;
    try {
      const file = await exportCropped();
      await onApply(file);
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 600);
    } catch {
      /* load / CORS */
    }
  };

  const visiblePresets = presetIds
    ? PRESETS.filter((p) => presetIds.includes(p.id))
    : PRESETS;

  const maxStyle = galleryMainMaxStyle(galleryDisplay);
  const canUndo = history.length > 1;
  const canRedo = future.length > 0;

  return (
    <div
      className={`flex flex-col gap-4 transition ${saveFlash ? "ring-2 ring-emerald-400 ring-offset-2 rounded-2xl" : ""}`}
      role="region"
      aria-label={t("cropEditorTitle")}
    >
      {/* Presets */}
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("cropPresetGroup")}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {visiblePresets.map((p) => (
            <CropToolbarButton
              key={p.id}
              active={editor.preset === p.id}
              title={t(p.labelKey)}
              label={t(p.labelKey)}
              onClick={() =>
                commitEditor((s) => ({
                  ...s,
                  preset: p.id,
                }))
              }
            >
              {p.icon}
            </CropToolbarButton>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 p-1">
          <CropToolbarButton
            title={t("mediaToolZoomOut")}
            label="−"
            disabled={busy}
            onClick={() => setZoom(transform.zoom - 0.12)}
          >
            −
          </CropToolbarButton>
          <label htmlFor={zoomSliderId} className="sr-only">
            {t("cropZoomSlider")}
          </label>
          <input
            id={zoomSliderId}
            type="range"
            min={25}
            max={400}
            value={Math.round(transform.zoom * 100)}
            disabled={busy}
            onChange={(e) => setZoom(Number(e.target.value) / 100, false)}
            onPointerUp={() => pushHistory(editor)}
            className="h-2 w-24 min-w-[5rem] cursor-pointer accent-blue-600 sm:w-32"
          />
          <CropToolbarButton
            title={t("mediaToolZoomIn")}
            label="+"
            disabled={busy}
            onClick={() => setZoom(transform.zoom + 0.12)}
          >
            +
          </CropToolbarButton>
          <CropToolbarButton title={t("cropResetZoom")} label={t("cropResetZoom")} onClick={() => setZoom(1)}>
            ⊙
          </CropToolbarButton>
        </div>

        <CropToolbarButton
          title={t("rotate90")}
          label={t("rotate90")}
          disabled={busy}
          onClick={() =>
            commitEditor((s) => ({
              ...s,
              transform: { ...s.transform, rotation: (s.transform.rotation + 90) % 360 },
            }))
          }
        >
          ↻
        </CropToolbarButton>

        <CropToolbarButton
          title={t("cropAutoFit")}
          label={t("cropAutoFit")}
          disabled={busy}
          className="border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
          onClick={runAutoFit}
        >
          ✦
        </CropToolbarButton>
        {presetIds && (
          <CropToolbarButton
            title="התאם למוצר"
            label="התאם למוצר"
            disabled={busy}
            className="border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100"
            onClick={runSmartProduct}
          >
            ◎
          </CropToolbarButton>
        )}

        <div className="mx-0 hidden h-8 w-px bg-slate-200 sm:block" />

        <CropToolbarButton title={t("cropUndo")} label={t("cropUndo")} disabled={!canUndo || busy} onClick={undo}>
          ↶
        </CropToolbarButton>
        <CropToolbarButton title={t("cropRedo")} label={t("cropRedo")} disabled={!canRedo || busy} onClick={redo}>
          ↷
        </CropToolbarButton>
        <CropToolbarButton
          active={compare}
          title={t("mediaToolCompare")}
          label={t("mediaToolCompare")}
          onClick={() => {
            setCompare((v) => {
              if (!v) setBaseline(transform);
              return !v;
            });
          }}
        >
          ◫
        </CropToolbarButton>
        <CropToolbarButton title={t("mediaToolReset")} label={t("mediaToolReset")} disabled={busy} onClick={resetView}>
          ↺
        </CropToolbarButton>

        {!hideApplyButton && (
          <div className="ms-auto flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleApply()}
              className="min-h-11 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? t("saving") : t("mediaApplyCrop")}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        {/* Workspace */}
        <div className="space-y-2">
          <p className="text-center text-xs text-slate-500 sm:text-start">{t("cropDragHint")}</p>
          <div
            ref={workspaceRef}
            className={`relative w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-inner ring-1 ring-zinc-700/80 ${
              panning ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              ...maxStyle,
              minHeight: "min(78vh, 820px)",
              maxHeight: "min(82vh, 900px)",
            }}
            onWheel={onWheel}
            onPointerDown={onPointerDownWorkspace}
            onPointerMove={onPointerMoveWorkspace}
            onPointerUp={onPointerUpWorkspace}
            onPointerLeave={onPointerUpWorkspace}
            onDoubleClick={resetView}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {compare && viewport.w > 0 && (
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 overflow-hidden border-r-2 border-blue-400"
                aria-hidden
              >
                <div
                  className="absolute left-0 top-0 origin-top-left"
                  style={{
                    width: viewport.w,
                    height: viewport.h,
                    transform: `translate(${-crop.left}px, ${-crop.top}px)`,
                  }}
                >
                  <div className="flex h-full w-full items-center justify-center">
                    <img
                      src={src}
                      alt=""
                      draggable={false}
                      className="max-h-full max-w-full object-contain opacity-90"
                      style={buildImageTransformStyle(baseline)}
                    />
                  </div>
                </div>
                <span className="absolute left-3 top-3 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-bold text-white">
                  {t("mediaBefore")}
                </span>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={src}
                alt={alt}
                draggable={false}
                onLoad={(e) => {
                  const im = e.currentTarget;
                  setImageSize({ w: im.naturalWidth, h: im.naturalHeight });
                }}
                className="max-h-full max-w-full select-none object-contain transition-transform duration-75"
                style={buildImageTransformStyle(transform)}
              />
            </div>

            {viewport.w > 0 && <CropOverlayMask crop={crop} viewport={viewport} maskId={cropMaskId} />}

            {/* Crop frame */}
            <div
              className="pointer-events-none absolute z-10 rounded-sm border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
              style={{
                left: crop.left,
                top: crop.top,
                width: crop.width,
                height: crop.height,
              }}
            >
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/25" />
                ))}
              </div>
              {compare && (
                <span className="absolute -top-8 right-0 rounded-lg bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {t("mediaAfter")}
                </span>
              )}
            </div>

            {/* Resize handles */}
            {(["nw", "ne", "sw", "se"] as const).map((corner) => {
              const style: CSSProperties = {
                width: 22,
                height: 22,
                touchAction: "none",
              };
              if (corner.includes("n")) style.top = crop.top - 11;
              else style.top = crop.top + crop.height - 11;
              if (corner.includes("w")) style.left = crop.left - 11;
              else style.left = crop.left + crop.width - 11;
              return (
                <button
                  key={corner}
                  type="button"
                  aria-label={t("cropResizeHandle")}
                  className="absolute z-20 rounded-full border-2 border-white bg-blue-600 shadow-lg hover:scale-110 active:scale-95"
                  style={style}
                  onPointerDown={startResize}
                />
              );
            })}
          </div>
        </div>

        {/* Live previews */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("mediaLivePreview")}
          </div>
          <CroppedLivePreview
            src={src}
            alt={alt}
            viewport={viewport}
            crop={crop}
            transform={transform}
            label={t("previewProductPage")}
            frameClass="aspect-[4/3] w-full"
          />
          <CroppedLivePreview
            src={src}
            alt={alt}
            viewport={viewport}
            crop={crop}
            transform={transform}
            label={t("previewMobile")}
            frameClass="mx-auto aspect-[9/16] w-[140px]"
          />
          <CroppedLivePreview
            src={src}
            alt={alt}
            viewport={viewport}
            crop={crop}
            transform={transform}
            label={t("previewProductCard")}
            frameClass="aspect-square w-[160px]"
          />
        </div>
      </div>
    </div>
  );
});
