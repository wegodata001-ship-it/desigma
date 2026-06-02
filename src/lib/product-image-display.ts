/** Shared catalog / product-page image rules — single source of truth for storefront + admin preview. */

export const PRODUCT_CATALOG_BG = "#0d0f18";

/** Next.js Image optimizer quality (1–100). */
export const PRODUCT_IMAGE_QUALITY = 92;

/** Canvas re-encode when upload compression runs (0–1). */
export const UPLOAD_JPEG_QUALITY = 0.92;
export const UPLOAD_WEBP_QUALITY = 0.92;
export const UPLOAD_CANVAS_QUALITY = 0.94;

export const PRODUCT_IMAGE_SIZES = {
  card: "(max-width: 640px) 92vw, (max-width: 1024px) 300px, 360px",
  galleryMain: "(max-width: 768px) 100vw, 550px",
  thumb: "80px",
} as const;

export type CatalogImageVariant = "card" | "gallery-main" | "thumb";

/** Card frame fills the fixed image wrapper (180px mobile / 260px desktop). */
export const CATALOG_FRAME_CLASS: Record<CatalogImageVariant, string> = {
  card: "product-card-image relative h-full w-full overflow-hidden",
  "gallery-main":
    "relative h-[320px] min-h-[320px] w-full overflow-hidden sm:h-[400px] sm:min-h-[400px] md:h-[480px] md:min-h-[480px] lg:h-[550px] lg:min-h-[550px]",
  thumb: "relative h-20 min-h-20 w-20 min-w-20 shrink-0 overflow-hidden",
};

export const CATALOG_IMAGE_INNER_CLASS = "h-full w-full object-contain object-center";

export const CATALOG_CARD_HOVER_TRANSITION_CLASS =
  "transition-transform duration-[250ms] ease-out motion-safe:group-hover/card:scale-[1.05]";
