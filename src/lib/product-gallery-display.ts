import type { CSSProperties } from "react";

export type ProductGalleryPreset = "small" | "medium" | "large" | "custom";

export type GalleryDisplayConfig = {
  preset: ProductGalleryPreset;
  maxHeightPx: number;
  maxWidthPx: number;
};

/** Safe fallbacks when StoreSettings row is missing or has NULLs (admin never crashes). */
export const GALLERY_DISPLAY_DEFAULTS: GalleryDisplayConfig = {
  preset: "medium",
  maxHeightPx: 900,
  maxWidthPx: 1400,
};

export const GALLERY_PRESET_CAPS: Record<
  Exclude<ProductGalleryPreset, "custom">,
  { maxHeightPx: number; maxWidthPx: number }
> = {
  small: { maxHeightPx: 320, maxWidthPx: 320 },
  medium: { maxHeightPx: 520, maxWidthPx: 520 },
  large: { maxHeightPx: 680, maxWidthPx: 680 },
};

export function normalizeGalleryPreset(v: string | null | undefined): ProductGalleryPreset {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (s === "small" || s === "medium" || s === "large" || s === "custom") return s;
  return GALLERY_DISPLAY_DEFAULTS.preset;
}

function normalizePositivePx(value: number | null | undefined, fallback: number): number {
  if (value == null || !Number.isFinite(value) || value <= 0) return fallback;
  return Math.min(Math.round(value), 2000);
}

export type GallerySettingsRow = {
  productGalleryPreset?: string | null;
  productGalleryMaxHeightPx?: number | null;
  productGalleryMaxWidthPx?: number | null;
} | null;

/** Single normalization entry point — use after every DB read. */
export function normalizeGalleryDisplayConfig(row: GallerySettingsRow): GalleryDisplayConfig {
  if (!row) return { ...GALLERY_DISPLAY_DEFAULTS };

  const preset = normalizeGalleryPreset(row.productGalleryPreset);

  if (preset !== "custom") {
    const caps = GALLERY_PRESET_CAPS[preset];
    return {
      preset,
      maxHeightPx: caps.maxHeightPx,
      maxWidthPx: caps.maxWidthPx,
    };
  }

  return {
    preset: "custom",
    maxHeightPx: normalizePositivePx(
      row.productGalleryMaxHeightPx,
      GALLERY_DISPLAY_DEFAULTS.maxHeightPx,
    ),
    maxWidthPx: normalizePositivePx(row.productGalleryMaxWidthPx, GALLERY_DISPLAY_DEFAULTS.maxWidthPx),
  };
}

/** CSS max dimensions for main gallery column */
export function galleryMainMaxStyle(cfg: GalleryDisplayConfig): CSSProperties {
  const h = normalizePositivePx(cfg.maxHeightPx, GALLERY_DISPLAY_DEFAULTS.maxHeightPx);
  const w = normalizePositivePx(cfg.maxWidthPx, GALLERY_DISPLAY_DEFAULTS.maxWidthPx);
  return { maxHeight: h, maxWidth: w };
}

/** Values persisted to StoreSettings from admin form / server action. */
export function resolveGallerySettingsForDb(input: {
  preset: ProductGalleryPreset;
  maxHeightRaw: string | null;
  maxWidthRaw: string | null;
}): {
  productGalleryPreset: ProductGalleryPreset;
  productGalleryMaxHeightPx: number | null;
  productGalleryMaxWidthPx: number | null;
} {
  const parsePx = (raw: string | null): number | null => {
    if (raw == null) return null;
    const s = String(raw).trim();
    if (s === "") return null;
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.min(Math.round(n), 2000);
  };

  const productGalleryPreset = input.preset;

  if (productGalleryPreset === "custom") {
    return {
      productGalleryPreset,
      productGalleryMaxHeightPx: parsePx(input.maxHeightRaw),
      productGalleryMaxWidthPx: parsePx(input.maxWidthRaw),
    };
  }

  const caps = GALLERY_PRESET_CAPS[productGalleryPreset];
  return {
    productGalleryPreset,
    productGalleryMaxHeightPx: caps.maxHeightPx,
    productGalleryMaxWidthPx: caps.maxWidthPx,
  };
}

export function galleryThumbSizeClass(cfg: GalleryDisplayConfig): string {
  switch (cfg.preset) {
    case "small":
      return "h-12 w-12 md:h-14 md:w-14";
    case "large":
      return "h-20 w-20 md:h-24 md:w-24";
    case "custom":
      return "h-16 w-16 md:h-[4.5rem] md:w-[4.5rem]";
    default:
      return "h-14 w-14 md:h-16 md:w-16";
  }
}
