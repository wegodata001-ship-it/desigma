"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStoreI18n } from "@/components/storefront/store-i18n";
import { ProductGrid } from "@/components/storefront/product-grid";
import { pickLocalized } from "@/lib/localized";
import type { ProductCardData } from "@/components/product-card";
import { CategorySidebar } from "@/components/storefront/category-sidebar";
import {
  applySmartphoneFilters,
  DEFAULT_SMARTPHONE_FILTERS,
  SmartphoneFiltersPanel,
  type SmartphoneFilterState,
} from "@/components/storefront/smartphone-filters";
import { APPLE_COLORS, IMPORT_TYPES, SAMSUNG_COLORS, STORAGE_OPTIONS } from "@/lib/smartphone-catalog";

type Category = {
  id: string;
  parentId: string | null;
  name_he: string;
  name_ar: string;
  name_en: string;
  imageUrl?: string | null;
};

export function StoreProductsClient({
  categories,
  selectedCategoryId,
  products,
  smartphoneMode = false,
}: {
  categories: Category[];
  selectedCategoryId: string;
  products: ProductCardData[];
  smartphoneMode?: boolean;
}) {
  const { lang, dir, t } = useStoreI18n();
  const [filters, setFilters] = useState<SmartphoneFilterState>(DEFAULT_SMARTPHONE_FILTERS);
  const selected = selectedCategoryId ? categories.find((c) => c.id === selectedCategoryId) : null;

  const filteredProducts = useMemo(
    () => (smartphoneMode ? applySmartphoneFilters(products, filters) : products),
    [products, filters, smartphoneMode],
  );

  const colorChoices = useMemo(() => {
    const set = new Set<string>([...APPLE_COLORS, ...SAMSUNG_COLORS]);
    products.forEach((p) => p.colorOptions?.forEach((c) => set.add(c)));
    return [...set];
  }, [products]);

  const storageChoices = useMemo(() => {
    const set = new Set<string>(STORAGE_OPTIONS.map((s) => s.value));
    return [...set];
  }, []);

  const importChoices = useMemo(() => IMPORT_TYPES.map((t) => t.value), []);

  return (
    <div dir={dir} className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">
      {/* Mobile categories — full width, above products */}
      <div className="mb-6 rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-950/95 to-black p-4 shadow-xl shadow-black/40 lg:hidden">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-400/90">Browse</p>
            <h2 className="text-lg font-bold text-white">{t("categories")}</h2>
          </div>
          <Link
            href="/products"
            className="rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-orange-500/50 hover:text-white"
          >
            {t("allProducts")}
          </Link>
        </div>
        <CategorySidebar
          categories={categories}
          selectedId={selected?.id ?? undefined}
          hrefForId={(id) => `/products?cat=${encodeURIComponent(id)}`}
        />
      </div>

      <div className="grid gap-8 xl:gap-10 lg:grid-cols-[minmax(380px,420px)_1fr] lg:items-start">
        <aside className="hidden lg:block">
          <div className="sticky top-24 min-h-[560px] rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-950/95 via-zinc-950/80 to-black p-6 shadow-2xl shadow-black/50">
            <div className="mb-6 flex items-center justify-between gap-3 border-b border-zinc-800/70 pb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-400/90">Browse</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{t("categories")}</h2>
              </div>
              <Link
                href="/products"
                className="rounded-full border border-zinc-700/90 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition duration-200 hover:scale-[1.02] hover:border-orange-500/55 hover:text-white hover:shadow-[0_0_18px_-4px_rgba(249,115,22,0.4)]"
              >
                {t("allProducts")}
              </Link>
            </div>
            <CategorySidebar
              categories={categories}
              selectedId={selected?.id ?? undefined}
              hrefForId={(id) => `/products?cat=${encodeURIComponent(id)}`}
            />
          </div>
          {smartphoneMode && (
            <div className="mt-5">
              <SmartphoneFiltersPanel
                filters={filters}
                onChange={setFilters}
                colorChoices={colorChoices}
                storageChoices={storageChoices}
                importChoices={importChoices}
              />
            </div>
          )}
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-400 sm:px-5">
            {selected ? (
              <>
                {t("showing")}:{" "}
                <span className="font-semibold text-zinc-100">{pickLocalized(selected, "name", lang)}</span>
                {smartphoneMode && (
                  <span className="ms-2 text-zinc-500">({filteredProducts.length})</span>
                )}
              </>
            ) : (
              t("allProducts")
            )}
          </div>
          <ProductGrid
            title={smartphoneMode ? "סמארטפונים" : "קטלוג מוצרים"}
            products={filteredProducts}
          />
        </div>
      </div>

      {smartphoneMode && (
        <div className="mt-6 lg:hidden">
          <SmartphoneFiltersPanel
            filters={filters}
            onChange={setFilters}
            colorChoices={colorChoices}
            storageChoices={storageChoices}
            importChoices={importChoices}
          />
        </div>
      )}
    </div>
  );
}
