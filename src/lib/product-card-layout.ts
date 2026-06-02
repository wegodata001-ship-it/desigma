/** Single source for storefront product card dimensions. */

export const PRODUCT_CARD_IMAGE_HEIGHT_MOBILE_PX = 180;
export const PRODUCT_CARD_IMAGE_HEIGHT_DESKTOP_PX = 260;

/** Image zone — fixed height, never grows; does not cover content below. */
export const PRODUCT_CARD_IMAGE_WRAPPER_CLASS =
  "product-card-image-wrapper relative z-0 block h-[180px] w-full shrink-0 overflow-hidden rounded-xl border border-zinc-800/80 md:h-[260px]";

/** Name, price, colors, stock, CTA — must stay visible (no overflow:hidden). */
export const PRODUCT_CARD_CONTENT_CLASS =
  "product-card-content relative z-10 flex flex-1 flex-col gap-2 px-1 pb-1 pt-2 md:gap-2.5 md:px-2 md:pb-2";

/** Card shell — flex column; min-height for grid rows, grows if needed. */
export const PRODUCT_CARD_SHELL_CLASS =
  "product-card group/card flex h-full min-h-[300px] w-full max-w-none flex-col rounded-2xl border border-zinc-800 bg-[#111827] p-2 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.7)] transition hover:border-orange-500/40 active:scale-[0.99] md:min-h-[420px] md:p-2.5 lg:p-3";

/**
 * Storefront product grid — KSP / Amazon style.
 * Mobile: 2 | Tablet: 3 | Desktop & large laptop: 4 per row.
 */
export const PRODUCT_CARD_GRID_CLASS =
  "grid grid-cols-2 items-stretch gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4";

export const PRODUCT_CARD_GRID_ITEM_CLASS = "flex min-w-0";

/** @deprecated Use PRODUCT_CARD_CONTENT_CLASS */
export const PRODUCT_CARD_BODY_CLASS = PRODUCT_CARD_CONTENT_CLASS;
