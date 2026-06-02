/** Single source for storefront product card dimensions. */

export const PRODUCT_CARD_IMAGE_HEIGHT_PX = 260;

/** Tailwind classes for card shell width (mobile full → tablet 280 → desktop 320). */
export const PRODUCT_CARD_WIDTH_CLASS =
  "w-full max-w-full md:max-w-[280px] lg:max-w-[320px]";

/** Grid that lays out product cards with consistent column widths. */
export const PRODUCT_CARD_GRID_CLASS =
  "grid grid-cols-1 justify-items-stretch gap-4 sm:justify-items-center md:grid-cols-[repeat(auto-fill,280px)] md:justify-center lg:grid-cols-[repeat(auto-fill,320px)]";
