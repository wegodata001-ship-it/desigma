"use client";

import Link from "next/link";
import { ProductImage } from "@/components/asset-img";
import { QuickAddToCartButton } from "@/components/storefront/quick-add-to-cart-button";
import { useStoreI18n } from "@/components/storefront/store-i18n";
import { pickLocalized } from "@/lib/localized";

export type StoreProductCardData = {
  id: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  description_he: string | null;
  description_ar: string | null;
  description_en: string | null;
  price: number;
  fromPrice?: number;
  oldPrice: number | null;
  discountPercent: number | null;
  stock: number;
  image: string | null;
  tags?: string[];
  featured?: boolean;
  brand?: "apple" | "samsung" | null;
  colorOptions?: string[];
  variantGroups?: { name: string; options: { value: string; priceAdd: number }[] }[];
};

const COLOR_SWATCH: Record<string, string> = {
  black: "#111827",
  white: "#f8fafc",
  blue: "#2563eb",
  titanium: "#71717a",
  "natural titanium": "#a8a29e",
  "phantom black": "#0f172a",
  silver: "#cbd5e1",
  purple: "#7c3aed",
  gray: "#6b7280",
};

function swatchColor(name: string): string {
  return COLOR_SWATCH[name.toLowerCase()] ?? "#64748b";
}

export function ProductCard({ product }: { product: StoreProductCardData }) {
  const { lang, t } = useStoreI18n();
  const title = pickLocalized(product, "name", lang);
  const displayPrice = product.fromPrice ?? product.price;
  const badges = [
    ...(product.featured ? ["Recommended"] : []),
    ...(product.tags ?? []),
  ].slice(0, 3);

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-zinc-800 bg-[#111827] p-2.5 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.7)] transition hover:border-orange-500/40 active:scale-[0.99] md:p-3">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-[radial-gradient(ellipse_at_center,_#1a1f2e_0%,_#0a0a0f_70%)]">
          <div className="aspect-[4/5] min-h-[220px] sm:min-h-[240px]">
            <ProductImage path={product.image} alt={title} className="h-full w-full" />
          </div>
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.discountPercent ? (
              <span className="rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white">
                -{product.discountPercent}%
              </span>
            ) : null}
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full bg-zinc-900/90 px-2 py-0.5 text-[10px] font-semibold text-orange-200 ring-1 ring-zinc-700"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </Link>
      <div className="mt-2.5 flex flex-1 flex-col gap-2">
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 min-h-10 text-[13px] font-semibold leading-snug text-zinc-100 hover:text-orange-300 md:text-sm"
        >
          {title}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-orange-400 md:text-lg">
            {product.fromPrice != null && product.fromPrice !== product.price ? (
              <>
                <span className="text-[11px] font-normal text-zinc-500">מ-</span>₪{displayPrice.toFixed(0)}
              </>
            ) : (
              <>₪{displayPrice.toFixed(2)}</>
            )}
          </span>
          {product.oldPrice ? (
            <span className="text-sm text-zinc-500 line-through">₪{product.oldPrice.toFixed(2)}</span>
          ) : null}
        </div>
        {(product.colorOptions?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.colorOptions!.slice(0, 5).map((c) => (
              <span
                key={c}
                title={c}
                className="h-4 w-4 rounded-full ring-1 ring-zinc-600"
                style={{ backgroundColor: swatchColor(c) }}
              />
            ))}
          </div>
        )}
        <p className={`text-[11px] ${product.stock > 0 ? "text-emerald-400/90" : "text-red-400/90"}`}>
          {product.stock > 0 ? t("inStock") : t("outOfStock")}
        </p>
        <div className="mt-auto">
          <QuickAddToCartButton
            disabled={product.stock <= 0}
            product={{
              id: product.id,
              title,
              price: displayPrice,
              image: product.image,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </article>
  );
}
