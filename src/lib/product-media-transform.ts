import type { CSSProperties } from "react";

export type MediaTransform = {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
};

export const DEFAULT_MEDIA_TRANSFORM: MediaTransform = {
  zoom: 1,
  panX: 0,
  panY: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
};

export function buildImageTransformStyle(t: MediaTransform): CSSProperties {
  const scaleX = t.flipH ? -1 : 1;
  const scaleY = t.flipV ? -1 : 1;
  return {
    transform: `translate(${t.panX}px, ${t.panY}px) scale(${t.zoom * scaleX}, ${t.zoom * scaleY}) rotate(${t.rotation}deg)`,
    transformOrigin: "center center",
    willChange: "transform",
  };
}

export function clampZoom(z: number): number {
  return Math.min(4, Math.max(0.25, Math.round(z * 100) / 100));
}
