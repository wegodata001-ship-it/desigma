import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeDatabaseUrl } from "@/lib/db-url-mode";
import { getStore } from "@/lib/server/store-loaders";
import { safeQuery } from "@/lib/server/safe-query";
import { STORE_ID, STORE_SLUG } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Exact query used by homepage — src/app/(store)/page.tsx loadHomeProducts */
const HOME_PRODUCTS_QUERY = {
  where: { storeId: "__STORE_ID__", active: true },
  take: 60,
  include: {
    category: { select: { id: true, parentId: true, name_en: true } },
    images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  },
  orderBy: [{ featured: "desc" as const }, { createdAt: "desc" as const }],
};

export async function GET() {
  const { storeId, storeSlug, siteName } = await getStore();

  console.log("STORE", storeId);
  console.log("STORE SLUG", storeSlug);

  const envStoreId = process.env.NEXT_PUBLIC_STORE_ID ?? "(not set — defaults to desigma)";
  const dbUrl = analyzeDatabaseUrl(process.env.DATABASE_URL);

  let dbConnected = false;
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  let totalProducts = 0;
  let activeProducts = 0;
  let storeProducts = 0;
  let featuredCount = 0;
  let bestSellerTagCount = 0;
  let directHomeCount = 0;
  let safeQueryHomeCount = 0;
  let directQueryError: string | null = null;
  let safeQueryError: string | null = null;
  let sampleProducts: Array<{
    id: string;
    name_en: string;
    active: boolean;
    featured: boolean;
    stock: number;
    tags: string[];
    storeId: string;
  }> = [];
  let featuredProducts: typeof sampleProducts = [];
  let bestSellerProducts: typeof sampleProducts = [];

  if (dbConnected) {
    try {
      [totalProducts, activeProducts, storeProducts, featuredCount, bestSellerTagCount] =
        await Promise.all([
          prisma.product.count(),
          prisma.product.count({ where: { active: true } }),
          prisma.product.count({ where: { storeId } }),
          prisma.product.count({ where: { storeId, active: true, featured: true } }),
          prisma.product.count({
            where: {
              storeId,
              active: true,
              tags: { hasSome: ["Best Seller", "BEST SELLER", "best seller"] },
            },
          }),
        ]);

      const homeProductsDirect = await prisma.product.findMany({
        where: { storeId, active: true },
        take: 60,
        include: {
          category: { select: { id: true, parentId: true, name_en: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      });
      directHomeCount = homeProductsDirect.length;

      featuredProducts = homeProductsDirect
        .filter((p) => p.featured)
        .slice(0, 12)
        .map((p) => ({
          id: p.id,
          name_en: p.name_en,
          active: p.active,
          featured: p.featured,
          stock: p.stock,
          tags: p.tags ?? [],
          storeId: p.storeId,
        }));

      bestSellerProducts = [...homeProductsDirect]
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 10)
        .map((p) => ({
          id: p.id,
          name_en: p.name_en,
          active: p.active,
          featured: p.featured,
          stock: p.stock,
          tags: p.tags ?? [],
          storeId: p.storeId,
        }));

      sampleProducts = homeProductsDirect.slice(0, 5).map((p) => ({
        id: p.id,
        name_en: p.name_en,
        active: p.active,
        featured: p.featured,
        stock: p.stock,
        tags: p.tags ?? [],
        storeId: p.storeId,
      }));
    } catch (e) {
      directQueryError = e instanceof Error ? e.message : String(e);
    }

    try {
      const viaSafeQuery = await safeQuery(
        "debug.home.products",
        () =>
          prisma.product.findMany({
            where: { storeId, active: true },
            take: 60,
            include: {
              category: { select: { id: true, parentId: true, name_en: true } },
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
            orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          }),
        [],
        { timeoutMs: 25_000 },
      );
      safeQueryHomeCount = viaSafeQuery.length;
      if (viaSafeQuery.length === 0 && directHomeCount > 0) {
        safeQueryError = "safeQuery returned [] but direct prisma returned products — likely timeout/pool error swallowed";
      }
    } catch (e) {
      safeQueryError = e instanceof Error ? e.message : String(e);
    }
  }

  const productsByStore = dbConnected
    ? await prisma.product.groupBy({ by: ["storeId"], _count: { _all: true } }).catch(() => [])
    : [];

  const storeRow = dbConnected
    ? await prisma.store.findUnique({ where: { id: storeId }, select: { id: true, slug: true, name: true, status: true } }).catch(() => null)
    : null;

  const diagnosis: string[] = [];
  if (!dbConnected) diagnosis.push("DB not connected");
  if (envStoreId !== storeId && envStoreId !== "(not set — defaults to desigma)") {
    diagnosis.push(`ENV mismatch: NEXT_PUBLIC_STORE_ID=${envStoreId} vs resolved storeId=${storeId}`);
  }
  if (storeId !== "desigma" && storeProducts === 0 && (productsByStore as { storeId: string; _count: { _all: number } }[]).some((r) => r.storeId === "desigma" && r._count._all > 0)) {
    diagnosis.push("Products exist for storeId=desigma but runtime uses storeId=" + storeId);
  }
  if (dbUrl.mode === "session") {
    diagnosis.push("DATABASE_URL uses session pooler (5432) — safeQuery may return [] under load");
  }
  if (directHomeCount > 0 && safeQueryHomeCount === 0) {
    diagnosis.push("Homepage safeQuery returns 0 but direct query returns " + directHomeCount + " — pool/timeout issue");
  }
  if (directHomeCount === 0 && storeProducts > 0) {
    diagnosis.push("Store has products but none active=true");
  }
  if (directHomeCount === 0 && storeProducts === 0 && totalProducts > 0) {
    diagnosis.push("No products for storeId=" + storeId + " — wrong NEXT_PUBLIC_STORE_ID in Vercel?");
  }
  if (featuredCount === 0 && directHomeCount > 0) {
    diagnosis.push("No featured=true products — Featured section uses catalogFallback (first 8 products)");
  }

  return NextResponse.json({
    storeId,
    storeSlug,
    siteName,
    env: {
      NEXT_PUBLIC_STORE_ID: envStoreId,
      STORE_ID_resolved: STORE_ID,
      STORE_SLUG_resolved: STORE_SLUG,
      DATABASE_URL_mode: dbUrl.mode,
      DATABASE_URL_port: dbUrl.port,
    },
    dbConnected,
    dbError,
    storeRow,
    totalProducts,
    activeProducts,
    productsForStore: storeProducts,
    featuredProductsCount: featuredCount,
    bestSellerTagCount,
    homepageQueryResultCount: {
      direct: directHomeCount,
      viaSafeQuery: safeQueryHomeCount,
    },
    featuredProducts,
    bestSellerProducts,
    sampleProducts,
    productsByStore,
    homepageQuery: {
      ...HOME_PRODUCTS_QUERY,
      where: { storeId, active: true },
      note: "Same as loadHomeProducts() in src/app/(store)/page.tsx",
    },
    homepageFeaturedLogic: "products.filter(p => p.featured).slice(0, 12) — fallback to catalogFallback if empty",
    homepageBestSellersLogic: "sort by stock desc, slice(0, 10) — fallback to catalogFallback if empty",
    directQueryError,
    safeQueryError,
    diagnosis,
  });
}
