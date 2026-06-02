"use client";

import { ProductCard, type ProductCardData } from "@/components/product-card";
import { PRODUCT_CARD_GRID_CLASS, PRODUCT_CARD_GRID_ITEM_CLASS } from "@/lib/product-card-layout";

export function ProductGrid({ title, products }: { title?: string; products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      {title ? <h2 className="text-2xl font-black text-white">{title}</h2> : null}
      <ul className={PRODUCT_CARD_GRID_CLASS} role="list">
        {products.map((p) => (
          <li key={p.id} className={`${PRODUCT_CARD_GRID_ITEM_CLASS} h-full`}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
