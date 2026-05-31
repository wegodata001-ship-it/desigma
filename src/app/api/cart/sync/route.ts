import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeCartLines } from "@/lib/cart/availability";
import { loadCartProductsForStore } from "@/lib/cart/load-cart-products";
import { getRequestStoreId } from "@/lib/store-request";
import { prisma } from "@/lib/prisma";

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
  const storeId = await getRequestStoreId();
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

  const cartItems = parsed.data.items;
  console.log("Cart Items", cartItems);
  console.log("Cart sync storeId", storeId);

  const productIds = Array.from(new Set(cartItems.map((i) => i.productId)));

  for (const productId of productIds) {
    const foundInStore = await prisma.product.findFirst({
      where: { id: productId, storeId },
      select: { id: true, storeId: true, name_en: true },
    });
    const foundAnywhere = await prisma.product.findFirst({
      where: { id: productId },
      select: { id: true, storeId: true, name_en: true },
    });
    console.log({
      productId,
      storeId,
      foundProduct: !!foundInStore,
      productStoreId: foundAnywhere?.storeId ?? null,
    });
  }

  const productsMap = await loadCartProductsForStore(storeId, productIds);
  const { items, removed, adjusted } = sanitizeCartLines(cartItems, productsMap);

  console.log("Cart sync result", {
    storeId,
    linesIn: cartItems.length,
    linesOut: items.length,
    productsResolved: productsMap.size,
    removed,
    adjusted,
  });

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
