import { Prisma, PrismaClient } from "@prisma/client";
import {
  buildDemoVariantGroups,
  DEMO_FEATURED_KEYS,
  DEMO_SMARTPHONE_CATEGORIES,
  DEMO_SMARTPHONE_PRODUCTS,
  demoGalleryImages,
} from "../smartphone-demo-catalog";

const DESCRIPTION = {
  he: "סמארטפון פרימיום — אחריות רשמית, משלוח מהיר, תמיכה מלאה.",
  ar: "هاتف ذكي ممتاز — ضمان رسمي، شحن سريع، دعم كامل.",
  en: "Premium smartphone — official warranty, fast delivery, full support.",
};

const DEMO_SKUS = new Set(
  DEMO_SMARTPHONE_PRODUCTS.map((p) => `PHONE-${p.key.toUpperCase().replace(/-/g, "")}`),
);

async function upsertDemoVariants(prisma: PrismaClient, productId: string, product: (typeof DEMO_SMARTPHONE_PRODUCTS)[number]) {
  await prisma.productVariantGroup.deleteMany({ where: { productId } });
  const groups = buildDemoVariantGroups(product);
  for (const g of groups) {
    await prisma.productVariantGroup.create({
      data: {
        productId,
        name: g.name,
        sortOrder: g.sortOrder,
        options: {
          create: g.options.map((o, i) => ({
            value: o.value,
            priceAdd: new Prisma.Decimal(o.priceAdd),
            stock: o.stock ?? 10,
            image: "image" in o && typeof o.image === "string" ? o.image : null,
            isDefault: o.isDefault ?? i === 0,
            sortOrder: o.sortOrder ?? i,
          })),
        },
      },
    });
  }
}

/** Idempotent seed — exact DESIGMA smartphone demo catalog. */
export async function seedSmartphonesCatalog(prisma: PrismaClient, storeId: string): Promise<void> {
  const categoryIdByKey = new Map<string, string>();

  for (const cat of DEMO_SMARTPHONE_CATEGORIES) {
    const id = `${storeId}-phone-${cat.key}`;
    const parentId = "parentKey" in cat && cat.parentKey ? (categoryIdByKey.get(cat.parentKey) ?? null) : null;
    await prisma.category.upsert({
      where: { id },
      create: {
        id,
        storeId,
        parentId,
        name_he: cat.name_he,
        name_ar: cat.name_ar,
        name_en: cat.name_en,
        description_he: DESCRIPTION.he,
        description_ar: DESCRIPTION.ar,
        description_en: DESCRIPTION.en,
        imageUrl: "imageUrl" in cat ? (cat.imageUrl ?? null) : null,
        active: true,
        sortOrder: cat.sortOrder,
      },
      update: {
        parentId,
        name_he: cat.name_he,
        name_ar: cat.name_ar,
        name_en: cat.name_en,
        active: true,
        sortOrder: cat.sortOrder,
      },
    });
    categoryIdByKey.set(cat.key, id);
  }

  for (const p of DEMO_SMARTPHONE_PRODUCTS) {
    const categoryId = categoryIdByKey.get(p.categoryKey);
    if (!categoryId) continue;

    const sku = `PHONE-${p.key.toUpperCase().replace(/-/g, "")}`;
    const featured = DEMO_FEATURED_KEYS.has(p.key) || p.featured === true;
    const hasSale = p.tags.includes("SALE");
    const oldPrice = hasSale ? Math.round(p.basePrice * 1.1) : null;
    const discountPercent =
      oldPrice && oldPrice > p.basePrice
        ? Math.round(((oldPrice - p.basePrice) / oldPrice) * 100)
        : null;

    const saved = await prisma.product.upsert({
      where: { storeId_sku: { storeId, sku } },
      create: {
        storeId,
        categoryId,
        title_he: p.name_he,
        title_ar: p.name_ar,
        title_en: p.name_en,
        name_he: p.name_he,
        name_ar: p.name_ar,
        name_en: p.name_en,
        description_he: DESCRIPTION.he,
        description_ar: DESCRIPTION.ar,
        description_en: DESCRIPTION.en,
        price: new Prisma.Decimal(p.basePrice),
        oldPrice: oldPrice != null ? new Prisma.Decimal(oldPrice) : null,
        discountPercent,
        stock: 32,
        sku,
        active: true,
        featured,
        tags: p.tags,
      },
      update: {
        categoryId,
        name_he: p.name_he,
        name_ar: p.name_ar,
        name_en: p.name_en,
        title_he: p.name_he,
        title_ar: p.name_ar,
        title_en: p.name_en,
        price: new Prisma.Decimal(p.basePrice),
        oldPrice: oldPrice != null ? new Prisma.Decimal(oldPrice) : null,
        discountPercent,
        stock: 32,
        active: true,
        featured,
        tags: p.tags,
      },
    });

    await upsertDemoVariants(prisma, saved.id, p);

    await prisma.productImage.deleteMany({ where: { storeId, productId: saved.id } });
    const gallery = demoGalleryImages(p);
    await prisma.productImage.createMany({
      data: gallery.map((im) => ({
        storeId,
        productId: saved.id,
        url: im.url,
        alt: `${p.name_en} ${im.alt}`,
        isMain: im.isMain,
        sortOrder: im.sortOrder,
      })),
    });
  }

  await prisma.product.updateMany({
    where: {
      storeId,
      sku: { startsWith: "PHONE-", notIn: [...DEMO_SKUS] },
    },
    data: { active: false },
  });
}
