import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequestStoreId } from "@/lib/store-request";
import { loadCartProductsForStore } from "@/lib/cart/load-cart-products";

export const dynamic = "force-dynamic";

const Schema = z.object({
  items: z
    .array(
      z.object({
        key: z.string().optional(),
        productId: z.string(),
        quantity: z.number().int().positive(),
        optionIds: z.array(z.string()).default([]),
      }),
    )
    .default([]),
});

/** POST { items: CartLine[] } — read-only cart vs storeId audit (no DB writes). */
export async function POST(req: Request) {
  const siteStoreId = await getRequestStoreId();
  let body: z.infer<typeof Schema>;
  try {
    const json = await req.json();
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    body = { items: [] };
  }

  const cartItems = body.items;
  console.log("Cart Items (debug)", cartItems);
  console.log("Site storeId", siteStoreId);

  const productIds = Array.from(new Set(cartItems.map((i) => i.productId)));
  const foundForSite = await loadCartProductsForStore(siteStoreId, productIds);

  const perItem: Array<{
    productId: string;
    quantity: number;
    optionIds: string[];
    siteStoreId: string;
    foundProduct: boolean;
    productStoreId: string | null;
    productName: string | null;
    mismatch: boolean;
  }> = [];

  for (const line of cartItems) {
    const inSite = foundForSite.get(line.productId);
    const anywhere = await prisma.product.findFirst({
      where: { id: line.productId },
      select: { id: true, storeId: true, name_en: true, active: true },
    });

    const row = {
      productId: line.productId,
      quantity: line.quantity,
      optionIds: line.optionIds,
      siteStoreId,
      foundProduct: !!inSite,
      productStoreId: anywhere?.storeId ?? null,
      productName: anywhere?.name_en ?? null,
      mismatch: !!anywhere && anywhere.storeId !== siteStoreId,
    };

    console.log({
      productId: line.productId,
      storeId: siteStoreId,
      foundProduct: row.foundProduct,
      productStoreId: row.productStoreId,
    });

    perItem.push(row);
  }

  const missingProducts = perItem.filter((r) => !r.productStoreId).map((r) => r.productId);
  const wrongStore = perItem.filter((r) => r.mismatch);

  return NextResponse.json({
    siteStoreId,
    cartItemsCount: cartItems.reduce((n, l) => n + l.quantity, 0),
    cartLinesCount: cartItems.length,
    productIds,
    missingProducts,
    wrongStoreProducts: wrongStore.map((r) => ({
      productId: r.productId,
      actualStoreId: r.productStoreId,
      expectedStoreId: siteStoreId,
    })),
    perItem,
    diagnosis:
      wrongStore.length > 0
        ? `Products exist under other storeId (e.g. base) but site queries storeId=${siteStoreId}`
        : missingProducts.length > 0
          ? "Product IDs in cart not found in DB"
          : foundForSite.size === 0 && cartItems.length > 0
            ? "Cart has lines but none resolved for site storeId (DB down or pool error?)"
            : "OK",
  });
}
