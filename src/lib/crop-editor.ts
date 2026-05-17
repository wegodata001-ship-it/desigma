import type { MediaTransform } from "@/lib/product-media-transform";
import { clampZoom, DEFAULT_MEDIA_TRANSFORM } from "@/lib/product-media-transform";

export type CropPresetId =
  | "product-card"
  | "square"
  | "portrait"
  | "banner"
  | "full-width"
  | "mobile-hero";

export type CropRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type CropEditorState = {
  preset: CropPresetId;
  cropScale: number;
  transform: MediaTransform;
};

export const CROP_PRESET_ASPECT: Record<CropPresetId, number> = {
  "product-card": 1,
  square: 1,
  portrait: 3 / 4,
  banner: 16 / 9,
  "full-width": 2 / 1,
  "mobile-hero": 9 / 16,
};

export const DEFAULT_CROP_EDITOR_STATE: CropEditorState = {
  preset: "product-card",
  cropScale: 0.82,
  transform: { ...DEFAULT_MEDIA_TRANSFORM },
};

export function computeCropRect(
  containerW: number,
  containerH: number,
  aspect: number,
  cropScale: number,
): CropRect {
  const pad = 0.06;
  const maxW = containerW * (1 - pad * 2);
  const maxH = containerH * (1 - pad * 2);
  const scale = Math.min(1, Math.max(0.35, cropScale));

  let width: number;
  let height: number;

  if (aspect >= 1) {
    width = Math.min(maxW, maxH * aspect) * scale;
    height = width / aspect;
    if (height > maxH) {
      height = maxH * scale;
      width = height * aspect;
    }
  } else {
    height = Math.min(maxH, maxW / aspect) * scale;
    width = height * aspect;
    if (width > maxW) {
      width = maxW * scale;
      height = width / aspect;
    }
  }

  return {
    width: Math.max(120, width),
    height: Math.max(120, height),
    left: (containerW - width) / 2,
    top: (containerH - height) / 2,
  };
}

/** Cover-fit: zoom/pan so image fills the crop window. */
export function autoFitTransform(
  imageW: number,
  imageH: number,
  crop: CropRect,
  viewportW: number,
  viewportH: number,
): MediaTransform {
  if (imageW <= 0 || imageH <= 0) return { ...DEFAULT_MEDIA_TRANSFORM };

  const baseFit = Math.min(viewportW / imageW, viewportH / imageH);
  const cropCx = crop.left + crop.width / 2;
  const cropCy = crop.top + crop.height / 2;
  const viewCx = viewportW / 2;
  const viewCy = viewportH / 2;

  const coverZoom =
    Math.max(crop.width / (imageW * baseFit), crop.height / (imageH * baseFit)) * 1.02;

  return {
    zoom: clampZoom(coverZoom),
    panX: viewCx - cropCx,
    panY: viewCy - cropCy,
    rotation: 0,
    flipH: false,
    flipV: false,
  };
}

export function cloneCropState(s: CropEditorState): CropEditorState {
  return {
    preset: s.preset,
    cropScale: s.cropScale,
    transform: { ...s.transform },
  };
}
