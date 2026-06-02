import { prisma } from "@/lib/prisma";
import { getStore } from "@/lib/server/store-loaders";
import { perfLog, perfTimed } from "@/lib/server/perf-log";
import { safeQuery } from "@/lib/server/safe-query";
import { withDbRetry, isDbPoolError } from "@/lib/server/db-retry";
import { StoreHomeClient } from "@/components/storefront/store-home-client";
import { pickProductImageUrl } from "@/lib/product-images";
import { productListForCardsSelect, type ProductListForCards } from "@/lib/prisma-product-selects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type HomeLoaded = {
  banners: Awaited<ReturnType<typeof prisma.banner.findMany>>;
  categories: Array<{
    id: string;
    parentId: string | null;
    name_he: string;
    name_ar: string;
    name_en: string;
    imageUrl: string | null;
  }>;
  products: ProductListForCards[];
};

async function loadHomeData(storeId: string): Promise<HomeLoaded> {
  const pageT0 = performance.now();

  const [banners, categories, products] = await Promise.all([
    perfTimed(
      "home.banners",
      () =>
        safeQuery(
          "store.home.banners",
          () =>
            prisma.banner.findMany({
              where: { storeId, active: true },
              orderBy: [{ isHero: "desc" }, { sortOrder: "asc" }],
            }),
          [],
          { timeoutMs: 12_000 },
        ),
      { storeId },
    ),
    perfTimed(
      "home.categories",
      () =>
        safeQuery(
          "store.home.categories",
          () =>
            prisma.category.findMany({
              where: { storeId, active: true },
              orderBy: { sortOrder: "asc" },
              select: { id: true, parentId: true, name_he: true, name_ar: true, name_en: true, imageUrl: true },
            }),
          [],
          { timeoutMs: 12_000 },
        ),
      { storeId },
    ),
    perfTimed(
      "home.products",
      () =>
        safeQuery(
          "store.home.products",
          () =>
            prisma.product.findMany({
              where: { storeId, active: true },
              take: 60,
              select: productListForCardsSelect,
              orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
            }),
          [],
          { timeoutMs: 25_000 },
        ),
      { storeId },
    ),
  ]);

  perfLog("home.total", performance.now() - pageT0, {
    storeId,
    banners: banners.length,
    categories: categories.length,
    products: products.length,
  });

  return { banners, categories, products };
}

export default async function HomePage() {
  const storeT0 = performance.now();
  const { storeId } = await getStore();
  perfLog("home.getStore", performance.now() - storeT0, { storeId });

  let loadError: string | null = null;
  let banners: HomeLoaded["banners"] = [];
  let categories: HomeLoaded["categories"] = [];
  let products: HomeLoaded["products"] = [];

  try {
    const data = await loadHomeData(storeId);
    banners = data.banners;
    categories = data.categories;
    products = data.products;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    loadError = msg;
    console.error("[homepage] load failed", { storeId, error: msg });
  }

  if (products.length === 0) {
    try {
      await withDbRetry(() => prisma.$queryRaw`SELECT 1`, { attempts: 2, delayMs: 300 });
      const n = await prisma.product.count({ where: { storeId, active: true } });
      if (n === 0) {
        loadError = `אין מוצרים פעילים לחנות "${storeId}" במסד הנתונים.`;
      }
    } catch (e) {
      loadError = isDbPoolError(e)
        ? "מסד הנתונים עמוס (Session Pooler 5432). עדכנו DATABASE_URL לפורט 6543 ב-Vercel."
        : e instanceof Error
          ? e.message
          : "שגיאת מסד נתונים";
    }
  }

  const heroBanner = banners.find((b) => b.isHero) ?? null;
  const nonHeroBanners = banners.filter((b) => !b.isHero);
  const featured = products.filter((p) => p.featured).slice(0, 12);
  const bestSellers = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 10);
  const catalogFallback = products.slice(0, 8);
  const childIdsByParent = new Map<string, string[]>();
  for (const category of categories) {
    if (!category.parentId) continue;
    const list = childIdsByParent.get(category.parentId) ?? [];
    list.push(category.id);
    childIdsByParent.set(category.parentId, list);
  }
  const sectionIds = (rootName: string) => {
    const root = categories.find((c) => !c.parentId && c.name_en.toLowerCase() === rootName.toLowerCase());
    if (!root) return new Set<string>();
    return new Set([root.id, ...(childIdsByParent.get(root.id) ?? [])]);
  };
  const gamingIds = sectionIds("Gaming");
  const laptopIds = sectionIds("Laptops");
  const audioIds = sectionIds("Audio");
  const smartHomeIds = sectionIds("Smart Home");
  const airConditionerIds = sectionIds("Air Conditioners");
  const gamingCollection = products.filter((p) => gamingIds.has(p.categoryId)).slice(0, 8);
  const laptopDeals = products.filter((p) => laptopIds.has(p.categoryId)).slice(0, 8);
  const audioCollection = products.filter((p) => audioIds.has(p.categoryId)).slice(0, 8);
  const smartHome = products.filter((p) => smartHomeIds.has(p.categoryId)).slice(0, 8);
  const airConditionerDeals = products.filter((p) => airConditionerIds.has(p.categoryId)).slice(0, 8);
  const newArrivals = [...products].sort((a, b) => +b.createdAt - +a.createdAt).slice(0, 8);

  const withFallback = (list: typeof products) => (list.length > 0 ? list : catalogFallback);

  const toCard = (p: (typeof products)[number]) => ({
    id: p.id,
    name_he: p.name_he,
    name_ar: p.name_ar,
    name_en: p.name_en,
    description_he: p.description_he,
    description_ar: p.description_ar,
    description_en: p.description_en,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    discountPercent: p.discountPercent ?? null,
    stock: p.stock,
    image: pickProductImageUrl(p.images),
    tags: p.tags ?? [],
    featured: p.featured,
  });

  return (
    <StoreHomeClient
      loadError={loadError}
      banners={heroBanner ? [heroBanner] : []}
      promoBanners={nonHeroBanners}
      categories={categories}
      featured={(featured.length > 0 ? featured : catalogFallback).map(toCard)}
      bestSellers={(bestSellers.length > 0 ? bestSellers : catalogFallback).map(toCard)}
      gamingCollection={withFallback(gamingCollection).map(toCard)}
      laptopDeals={withFallback(laptopDeals).map(toCard)}
      audioCollection={withFallback(audioCollection).map(toCard)}
      smartHome={withFallback(smartHome).map(toCard)}
      airConditionerDeals={withFallback(airConditionerDeals).map(toCard)}
      newArrivals={(newArrivals.length > 0 ? newArrivals : catalogFallback).map(toCard)}
    />
  );
}
