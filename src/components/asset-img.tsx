"use client";

import Image from "next/image";
import { useState } from "react";
import { resolvePublicAssetSrc } from "@/lib/assets-path";
import { PRODUCT_CATALOG_BG, PRODUCT_IMAGE_QUALITY } from "@/lib/product-image-display";

/** Intrinsic dimensions for Next/Image when not using `fill` (avoids height:0 parent bugs). */
const PRODUCT_INTRINSIC_SIZE = 640;

function ProductImageFallback({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-full min-h-[inherit] w-full flex-col items-center justify-center gap-2 ${className ?? ""}`}
      style={{ backgroundColor: PRODUCT_CATALOG_BG }}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="h-16 w-16 text-zinc-600 sm:h-20 sm:w-20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="18" y="6" width="28" height="52" rx="6" />
        <circle cx="32" cy="48" r="2.5" fill="currentColor" stroke="none" />
      </svg>
      <span className="text-[11px] font-medium text-zinc-500">אין תמונה</span>
    </div>
  );
}

export type AssetImgFit = "contain" | "cover";

export function AssetImg({
  path,
  alt,
  className,
  imageClassName,
  fit = "cover",
  variant = "default",
  priority = false,
  quality,
  sizes,
}: {
  path: string | null | undefined;
  alt: string;
  /** Wrapper sizing (relative block). */
  className?: string;
  /** Extra classes on the &lt;Image&gt; element (object-fit applied separately). */
  imageClassName?: string;
  fit?: AssetImgFit;
  variant?: "default" | "product";
  priority?: boolean;
  /** Next/Image quality 1–100 (product catalog defaults to 92). */
  quality?: number;
  sizes?: string;
}) {
  if (!path) {
    if (variant === "product") {
      return <ProductImageFallback className={className} />;
    }
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-300 ${className ?? ""}`}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="2" width="14" height="20" rx="2" />
        </svg>
      </div>
    );
  }

  const src = resolvePublicAssetSrc(path);

  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEBUG_PRODUCT_IMAGES === "1") {
    console.log("[AssetImg] IMAGE URL", { path, src, alt });
  }

  const fitClass = fit === "contain" ? "object-contain object-center" : "object-cover object-center";
  const imageQuality = quality ?? (variant === "product" ? PRODUCT_IMAGE_QUALITY : 85);
  const imageSizes =
    sizes ??
    (variant === "product"
      ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
      : "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw");

  return (
    <ProductImageInner
      src={src}
      alt={alt}
      fitClass={fitClass}
      imageQuality={imageQuality}
      imageSizes={imageSizes}
      priority={priority}
      className={className}
      imageClassName={imageClassName}
      useIntrinsic={variant === "product"}
    />
  );
}

function ProductImageInner({
  src,
  alt,
  fitClass,
  imageQuality,
  imageSizes,
  priority,
  className,
  imageClassName,
  useIntrinsic,
}: {
  src: string;
  alt: string;
  fitClass: string;
  imageQuality: number;
  imageSizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  useIntrinsic: boolean;
}) {
  const [useNative, setUseNative] = useState(false);

  const imgClass = `${fitClass} ${imageClassName ?? ""}`;

  if (useNative) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`h-full w-full ${imgClass}`}
        draggable={false}
      />
    );
  }

  if (useIntrinsic) {
    return (
      <div className={`relative h-full w-full min-h-[1px] ${className ?? ""}`}>
        <Image
          src={src}
          alt={alt}
          width={PRODUCT_INTRINSIC_SIZE}
          height={PRODUCT_INTRINSIC_SIZE}
          priority={priority}
          quality={imageQuality}
          sizes={imageSizes}
          className={`h-full w-full ${imgClass}`}
          onError={() => setUseNative(true)}
        />
      </div>
    );
  }

  return (
    <span className={`relative block h-full w-full min-h-[1px] ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={imageQuality}
        sizes={imageSizes}
        className={imgClass}
        onError={() => setUseNative(true)}
      />
    </span>
  );
}

/** @deprecated Prefer CatalogProductImage — kept for gradual migration. */
export function ProductImage({
  path,
  alt,
  className,
  priority,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <AssetImg
      path={path}
      alt={alt}
      fit="contain"
      variant="product"
      priority={priority}
      quality={PRODUCT_IMAGE_QUALITY}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
      className={className}
      imageClassName="h-full w-full object-contain object-center"
    />
  );
}
