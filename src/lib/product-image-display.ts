/** Shared catalog / product-page image rules — single source of truth for storefront + admin preview. */

export const PRODUCT_CATALOG_BG = "#0d0f18";

/** Next.js Image optimizer quality (1–100). */
export const PRODUCT_IMAGE_QUALITY = 92;

/** Canvas re-encode when upload compression runs (0–1). */
export const UPLOAD_JPEG_QUALITY = 0.92;
export const UPLOAD_WEBP_QUALITY = 0.92;
export const UPLOAD_CANVAS_QUALITY = 0.94;

export const PRODUCT_IMAGE_SIZES = {
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 280px, 320px",
  galleryMain: "(max-width: 768px) 100vw, 550px",
  thumb: "80px",
} as const;

export type CatalogImageVariant = "card" | "gallery-main" | "thumb";

/** Fixed frame box — use `relative` + absolute fill child (flex was collapsing Next/Image). */
export const CATALOG_FRAME_CLASS: Record<CatalogImageVariant, string> = {
  card: "relative h-[260px] w-full overflow-hidden",
  "gallery-main": "relative h-[320px] w-full overflow-hidden sm:h-[400px] md:h-[480px] lg:h-[550px]",
  thumb: "relative h-20 w-20 shrink-0 overflow-hidden",
};

export const CATALOG_IMAGE_INNER_CLASS = "h-full w-full max-h-full max-w-full object-contain object-center";
