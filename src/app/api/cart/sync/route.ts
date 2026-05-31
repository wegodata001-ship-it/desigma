import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeCartLines } from "@/lib/cart/availability";
import { loadCartProductsForStore } from "@/lib/cart/load-cart-products";
import { getStoreId } from "@/lib/store-config";

export const runtime = "nodejs";

const Schema = z.object({
  items: z.array(
    z.object({
      key: z.string(),
      productId: z.string(),
      quantity: z.number().int().positive(),
      optionIds: z.array(z.string()).default([]),
    }),
  ),
});

export async function POST(req: Request) {
  const storeId = getStoreId();
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart payload" }, { status: 400 });
  }

  const productIds = Array.from(new Set(parsed.data.items.map((i) => i.productId)));
  const productsMap = await loadCartProductsForStore(storeId, productIds);
  const { items, removed, adjusted } = sanitizeCartLines(parsed.data.items, productsMap);

  const products: Record<string, (typeof productsMap extends Map<string, infer V> ? V : never)> = {};
  for (const [id, p] of productsMap) {
    if (items.some((line) => line.productId === id)) {
      products[id] = p;
    }
  }

  return NextResponse.json({
    items,
    removed: removed || adjusted,
    adjusted,
    products,
  });
}
