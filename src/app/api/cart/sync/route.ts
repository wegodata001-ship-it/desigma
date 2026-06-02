import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeCartLines } from "@/lib/cart/availability";
import { loadCartProductsForStore } from "@/lib/cart/load-cart-products";
import { perfLog } from "@/lib/server/perf-log";
import { getPrismaQueryScope, runWithPrismaQueryScope } from "@/lib/server/prisma-query-scope";
import { getRequestStoreId } from "@/lib/store-request";

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
  const debugSession = req.headers.get("x-cart-debug-session");
  const t0 = performance.now();

  return runWithPrismaQueryScope("cart.sync", async () => {
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
    const productIds = Array.from(new Set(cartItems.map((i) => i.productId)));

    const loadT0 = performance.now();
    const productsMap = await loadCartProductsForStore(storeId, productIds);
    const loadMs = performance.now() - loadT0;
    perfLog("cart.sync.loadProducts", loadMs, {
      storeId,
      productIds: productIds.length,
      resolved: productsMap.size,
    });

    const { items, removed, adjusted } = sanitizeCartLines(cartItems, productsMap);

    const products: Record<string, (typeof productsMap extends Map<string, infer V> ? V : never)> = {};
    for (const [id, p] of productsMap) {
      if (items.some((line) => line.productId === id)) {
        products[id] = p;
      }
    }

    const scope = getPrismaQueryScope();
    const totalMs = performance.now() - t0;
    perfLog("cart.sync.total", totalMs, {
      storeId,
      linesIn: cartItems.length,
      linesOut: items.length,
      removed,
      adjusted,
      prismaQueries: scope?.count ?? 0,
      debugSession: debugSession ?? undefined,
    });

    return NextResponse.json({
      items,
      removed: removed || adjusted,
      adjusted,
      products,
      debug: debugSession
        ? {
            sessionId: debugSession,
            totalMs: Math.round(totalMs * 100) / 100,
            loadProductsMs: Math.round(loadMs * 100) / 100,
            prismaQueries: scope?.count ?? 0,
            prismaOperations: scope?.queries ?? [],
            storeSettingsQuery: false,
            productRefetch: scope?.queries.some((q) => q.model === "Product") ?? false,
            variantsIncludedInProductQuery: true,
            stockIncludedInProductQuery: true,
          }
        : undefined,
    });
  });
}
