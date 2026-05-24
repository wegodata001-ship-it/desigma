import Image from "next/image";
import { resolvePublicAssetSrc } from "@/lib/assets-path";

function ProductImageFallback({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 ${className ?? ""}`}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="h-14 w-14 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="18" y="6" width="28" height="52" rx="6" />
        <circle cx="32" cy="48" r="2.5" fill="currentColor" stroke="none" />
      </svg>
      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">No image</span>
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
  const fitClass = fit === "contain" ? "object-contain object-center" : "object-cover object-center";

  return (
    <span className={`relative block h-full w-full ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        className={`${fitClass} ${imageClassName ?? ""}`}
      />
    </span>
  );
}

/** Storefront product thumbnail — contain, transparent-friendly, hover zoom. */
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
      className={className}
      imageClassName="p-3 drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)] transition duration-500 ease-out group-hover:scale-[1.06]"
    />
  );
}
