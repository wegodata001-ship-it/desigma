"use client";

import Link from "next/link";
import { AssetImg } from "@/components/asset-img";

/** Storefront subcategory chip — premium pill, touch-friendly, orange active state. */
export function SubcategoryPillLink({
  href,
  label,
  imageUrl,
  active,
  size = "md",
  fullWidth = false,
}: {
  href: string;
  label: string;
  imageUrl?: string | null;
  active: boolean;
  size?: "md" | "lg";
  fullWidth?: boolean;
}) {
  const textSize = size === "lg" ? "text-[15px] sm:text-base" : "text-sm";
  const iconSize = size === "lg" ? "h-9 w-9 sm:h-10 sm:w-10" : "h-8 w-8 sm:h-9 sm:w-9";
  const pad = size === "lg" ? "min-h-[48px] px-5 py-3" : "min-h-[44px] px-4 py-2.5";

  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center gap-3 rounded-full border font-semibold leading-snug",
        fullWidth ? "flex w-full" : "max-w-full",
        pad,
        textSize,
        "transition duration-300 ease-out",
        "motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400",
        active
          ? "border-orange-400/90 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_0_24px_-4px_rgba(249,115,22,0.65)] ring-1 ring-orange-300/30"
          : "border-zinc-600/70 bg-gradient-to-r from-zinc-900/90 to-zinc-950/95 text-zinc-100 shadow-sm backdrop-blur-sm hover:border-orange-500/55 hover:from-zinc-800/95 hover:to-zinc-900/95 hover:text-white hover:shadow-[0_0_20px_-6px_rgba(249,115,22,0.4)]",
      ].join(" ")}
    >
      {imageUrl ? (
        <span
          className={`relative ${iconSize} shrink-0 overflow-hidden rounded-full border border-white/20 bg-zinc-950 ring-1 ring-black/30`}
        >
          <AssetImg path={imageUrl} alt="" className="h-full w-full object-cover" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate text-start">{label}</span>
    </Link>
  );
}
