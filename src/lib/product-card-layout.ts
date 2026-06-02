/** Single source for storefront product card dimensions. */

/** Fixed image frame — must use `block`, not `flex`, so the image child gets full width. */
export const PRODUCT_CARD_IMAGE_HEIGHT_PX = 260;

export const PRODUCT_CARD_IMAGE_WRAPPER_CLASS =
  "product-card-image-wrapper relative block h-[260px] min-h-[260px] w-full shrink-0 overflow-hidden rounded-xl border border-zinc-800/80";

export const PRODUCT_CARD_BODY_CLASS = "flex min-h-0 flex-1 flex-col gap-2 pt-2.5";

/** Tailwind classes for card shell width (mobile full → tablet 280 → desktop 320). */
export const PRODUCT_CARD_WIDTH_CLASS =
  "w-full max-w-full md:max-w-[280px] lg:max-w-[320px]";

/** Grid — equal-height rows without forcing excessive min-height. */
export const PRODUCT_CARD_GRID_CLASS =
  "grid grid-cols-1 items-stretch gap-4 sm:justify-items-center md:grid-cols-[repeat(auto-fill,280px)] md:justify-center lg:grid-cols-[repeat(auto-fill,320px)]";

export const PRODUCT_CARD_GRID_ITEM_CLASS = "flex h-full w-full justify-center";
