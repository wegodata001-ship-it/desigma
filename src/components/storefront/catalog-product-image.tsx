"use client";

import { AssetImg } from "@/components/asset-img";
import {
  CATALOG_FRAME_CLASS,
  CATALOG_IMAGE_INNER_CLASS,
  PRODUCT_CATALOG_BG,
  PRODUCT_IMAGE_QUALITY,
  PRODUCT_IMAGE_SIZES,
  type CatalogImageVariant,
} from "@/lib/product-image-display";

type CatalogProductImageProps = {
  path: string | null | undefined;
  alt: string;
  variant: CatalogImageVariant;
  priority?: boolean;
  /** Extra classes on outer frame (borders, rounded, etc.) */
  frameClassName?: string;
};

/**
 * Storefront product image — fixed frame, contain, centered, uniform background.
 * Use for cards, gallery, thumbs, cart, related products.
 */
export function CatalogProductImage({
  path,
  alt,
  variant,
  priority,
  frameClassName = "",
}: CatalogProductImageProps) {
  const sizes =
    variant === "card"
      ? PRODUCT_IMAGE_SIZES.card
      : variant === "gallery-main"
        ? PRODUCT_IMAGE_SIZES.galleryMain
        : PRODUCT_IMAGE_SIZES.thumb;

  const rounded =
    variant === "thumb"
      ? "rounded-xl"
      : variant === "card"
        ? "rounded-2xl border border-zinc-800/90"
        : "rounded-2xl border border-zinc-800";

  return (
    <div
      className={`${CATALOG_FRAME_CLASS[variant]} ${rounded} ${frameClassName}`}
      style={{ backgroundColor: PRODUCT_CATALOG_BG }}
    >
      <div className="absolute inset-0">
        <AssetImg
          path={path}
          alt={alt}
          fit="contain"
          variant="product"
          quality={PRODUCT_IMAGE_QUALITY}
          sizes={sizes}
          priority={priority}
          className="relative block h-full w-full"
          imageClassName={CATALOG_IMAGE_INNER_CLASS}
        />
      </div>
    </div>
  );
}

/** Admin / pending upload — blob URL preview at real catalog frame size (no Next optimizer). */
export function CatalogProductImagePreview({
  src,
  alt,
  variant = "card",
  frameClassName = "",
}: {
  src: string;
  alt: string;
  variant?: CatalogImageVariant;
  frameClassName?: string;
}) {
  const rounded = variant === "thumb" ? "rounded-xl border border-slate-200" : "rounded-2xl border border-slate-200";

  return (
    <div
      className={`${CATALOG_FRAME_CLASS[variant]} ${rounded} ${frameClassName}`}
      style={{ backgroundColor: PRODUCT_CATALOG_BG }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={CATALOG_IMAGE_INNER_CLASS} draggable={false} />
    </div>
  );
}
