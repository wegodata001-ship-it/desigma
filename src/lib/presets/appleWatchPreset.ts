import { Prisma, PrismaClient } from "@prisma/client";
import {
  APPLE_WATCHES,
  APPLE_WATCH_CATEGORY,
  buildWatchSpecs,
  watchDescription,
  watchGallery,
  watchImage,
  type WatchSeed,
} from "../catalog/apple-watch-catalog";

const PRODUCT_SKU_PREFIX = "APPLE-WATCH";
const PER_COLOR_STOCK = 15;

function productSku(p: WatchSeed): string {
  // Keys already start with "apple-watch-..." so use them directly to avoid an APPLE- double prefix.
  return p.key.toUpperCase();
}

function localizedSpecs(p: WatchSeed) {
  return {
    he: buildWatchSpecs("he", p.spec),
    ar: buildWatchSpecs("ar", p.spec),
    en: buildWatchSpecs("en", p.spec),
  };
}

async function upsertCategories(prisma: PrismaClient, storeId: string): Promise<string> {
  const parent = APPLE_WATCH_CATEGORY.parent;
  const child = APPLE_WATCH_CATEGORY.watch;
  const parentId = `${storeId}-cat-${parent.key}`;
  const childId = `${storeId}-cat-${child.key}`;

  await prisma.category.upsert({
    where: { id: parentId },
    create: {
      id: parentId,
      storeId,
      name_he: parent.name_he,
      name_ar: parent.name_ar,
      name_en: parent.name_en,
      imageUrl: parent.imageUrl,
      active: true,
      sortOrder: parent.sortOrder,
    },
    update: {
      name_he: parent.name_he,
      name_ar: parent.name_ar,
      name_en: parent.name_en,
      imageUrl: parent.imageUrl,
      active: true,
      sortOrder: parent.sortOrder,
    },
  });

  await prisma.category.upsert({
    where: { id: childId },
    create: {
      id: childId,
      storeId,
      parentId,
      name_he: child.name_he,
      name_ar: child.name_ar,
      name_en: child.name_en,
      imageUrl: child.imageUrl,
      active: true,
      sortOrder: child.sortOrder,
    },
    update: {
      parentId,
      name_he: child.name_he,
      name_ar: child.name_ar,
      name_en: child.name_en,
      imageUrl: child.imageUrl,
      active: true,
      sortOrder: child.sortOrder,
    },
  });

  return childId;
}

async function upsertVariants(prisma: PrismaClient, productId: string, p: WatchSeed) {
  await prisma.productVariantGroup.deleteMany({ where: { productId } });
  const base = productSku(p);

  await prisma.productVariantGroup.create({
    data: {
      productId,
      name: "Size",
      sortOrder: 0,
      options: {
        create: p.sizes.map((s, i) => ({
          value: s.value,
          priceAdd: new Prisma.Decimal(s.priceAdd ?? 0),
          stock: PER_COLOR_STOCK,
          sku: `${base}-SIZE-${s.slug.toUpperCase()}`,
          isDefault: i === 0,
          sortOrder: i,
        })),
      },
    },
  });

  await prisma.productVariantGroup.create({
    data: {
      productId,
      name: "Color",
      sortOrder: 1,
      options: {
        create: p.colors.map((c, i) => ({
          value: c.value,
          priceAdd: new Prisma.Decimal(c.priceAdd ?? 0),
          stock: PER_COLOR_STOCK,
          image: watchImage(p.key, c.slug, "main"),
          sku: `${base}-${c.slug.toUpperCase()}`,
          isDefault: i === 0,
          sortOrder: i,
        })),
      },
    },
  });

  await prisma.productVariantGroup.create({
    data: {
      productId,
      name: "Band",
      sortOrder: 2,
      options: {
        create: p.bands.map((b, i) => ({
          value: b.value,
          priceAdd: new Prisma.Decimal(b.priceAdd ?? 0),
          stock: PER_COLOR_STOCK,
          sku: `${base}-BAND-${b.slug.toUpperCase()}`,
          isDefault: i === 0,
          sortOrder: i,
        })),
      },
    },
  });
}

async function upsertImages(prisma: PrismaClient, storeId: string, productId: string, p: WatchSeed) {
  await prisma.productImage.deleteMany({ where: { storeId, productId } });

  let sortOrder = 0;
  const data = p.colors.flatMap((c) =>
    watchGallery(p.key, c.slug).map((img) => ({
      storeId,
      productId,
      url: img.url,
      alt: `${p.name_en} — ${c.value} (${img.kind})`,
      isMain: sortOrder === 0,
      sortOrder: sortOrder++,
    })),
  );

  await prisma.productImage.createMany({ data });
}

/** Idempotent seed of the REAL Apple Watch catalog (Stage 3). */
export async function seedAppleWatchCatalog(prisma: PrismaClient, storeId: string): Promise<void> {
  const categoryId = await upsertCategories(prisma, storeId);
  const activeSkus: string[] = [];

  for (const p of APPLE_WATCHES) {
    const sku = productSku(p);
    activeSkus.push(sku);

    const oldPrice = p.salePercent
      ? Math.round((p.basePrice / (1 - p.salePercent / 100)) / 10) * 10
      : null;
    const discountPercent =
      oldPrice && oldPrice > p.basePrice
        ? Math.round(((oldPrice - p.basePrice) / oldPrice) * 100)
        : null;

    const specs = localizedSpecs(p);
    const desc = watchDescription(p);
    const title = {
      he: `${p.name_he} — קנו אונליין | אחריות רשמית`,
      ar: `${p.name_ar} — اشترِ أونلاين | ضمان رسمي`,
      en: `${p.name_en} — Buy Online | Official Warranty`,
    };

    const totalStock = p.colors.length * PER_COLOR_STOCK;

    const saved = await prisma.product.upsert({
      where: { storeId_sku: { storeId, sku } },
      create: {
        storeId,
        categoryId,
        title_he: title.he,
        title_ar: title.ar,
        title_en: title.en,
        name_he: p.name_he,
        name_ar: p.name_ar,
        name_en: p.name_en,
        description_he: desc.he,
        description_ar: desc.ar,
        description_en: desc.en,
        specs_he: specs.he as unknown as Prisma.InputJsonValue,
        specs_ar: specs.ar as unknown as Prisma.InputJsonValue,
        specs_en: specs.en as unknown as Prisma.InputJsonValue,
        price: new Prisma.Decimal(p.basePrice),
        oldPrice: oldPrice != null ? new Prisma.Decimal(oldPrice) : null,
        discountPercent,
        stock: totalStock,
        sku,
        active: true,
        featured: p.featured === true,
        tags: p.tags,
      },
      update: {
        categoryId,
        title_he: title.he,
        title_ar: title.ar,
        title_en: title.en,
        name_he: p.name_he,
        name_ar: p.name_ar,
        name_en: p.name_en,
        description_he: desc.he,
        description_ar: desc.ar,
        description_en: desc.en,
        specs_he: specs.he as unknown as Prisma.InputJsonValue,
        specs_ar: specs.ar as unknown as Prisma.InputJsonValue,
        specs_en: specs.en as unknown as Prisma.InputJsonValue,
        price: new Prisma.Decimal(p.basePrice),
        oldPrice: oldPrice != null ? new Prisma.Decimal(oldPrice) : null,
        discountPercent,
        stock: totalStock,
        active: true,
        featured: p.featured === true,
        tags: p.tags,
      },
    });

    await upsertVariants(prisma, saved.id, p);
    await upsertImages(prisma, storeId, saved.id, p);
  }

  // Clean up products created with the earlier double-prefixed SKU bug (APPLE-APPLE-WATCH-*).
  const badProducts = await prisma.product.findMany({
    where: { storeId, sku: { startsWith: "APPLE-APPLE-WATCH" } },
    select: { id: true },
  });
  if (badProducts.length > 0) {
    const ids = badProducts.map((b) => b.id);
    await prisma.productImage.deleteMany({ where: { productId: { in: ids } } });
    await prisma.productVariantGroup.deleteMany({ where: { productId: { in: ids } } });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
  }

  // Deactivate any demo smartwatch products from earlier seeds.
  await prisma.product.updateMany({
    where: { storeId, sku: { startsWith: "WATCH-APPLE" } },
    data: { active: false },
  });

  // Deactivate stale real-catalog SKUs not in the current lineup.
  await prisma.product.updateMany({
    where: { storeId, sku: { startsWith: PRODUCT_SKU_PREFIX }, NOT: { sku: { in: activeSkus } } },
    data: { active: false },
  });
}
