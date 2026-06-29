import { Prisma, PrismaClient } from "@prisma/client";
import {
  APPLE_IPHONE_CATEGORY,
  APPLE_IPHONES,
  buildIphoneSpecs,
  iphoneColorImage,
  iphoneDescription,
  type IphoneSeed,
} from "../catalog/apple-iphone-catalog";

const PRODUCT_SKU_PREFIX = "APPLE-IPHONE";

function productSku(p: IphoneSeed): string {
  return `APPLE-${p.key.toUpperCase()}`;
}

function variantSku(p: IphoneSeed, colorSlug: string, storage: string): string {
  return `${productSku(p)}-${colorSlug.toUpperCase()}-${storage.toUpperCase()}`;
}

function localizedSpecs(p: IphoneSeed) {
  return {
    he: buildIphoneSpecs("he", p.name_he, p.spec),
    ar: buildIphoneSpecs("ar", p.name_ar, p.spec),
    en: buildIphoneSpecs("en", p.name_en, p.spec),
  };
}

async function upsertCategories(prisma: PrismaClient, storeId: string): Promise<string> {
  const parent = APPLE_IPHONE_CATEGORY.parent;
  const child = APPLE_IPHONE_CATEGORY.iphone;
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

async function upsertVariants(prisma: PrismaClient, productId: string, p: IphoneSeed) {
  await prisma.productVariantGroup.deleteMany({ where: { productId } });

  await prisma.productVariantGroup.create({
    data: {
      productId,
      name: "Color",
      sortOrder: 0,
      options: {
        create: p.colors.map((c, i) => ({
          value: c.value,
          priceAdd: new Prisma.Decimal(0),
          stock: 12,
          image: iphoneColorImage(p.key, c.slug),
          sku: variantSku(p, c.slug, "COLOR"),
          isDefault: i === 0,
          sortOrder: i,
        })),
      },
    },
  });

  await prisma.productVariantGroup.create({
    data: {
      productId,
      name: "Storage",
      sortOrder: 1,
      options: {
        create: p.storage.map((s, i) => ({
          value: s.value,
          priceAdd: new Prisma.Decimal(s.priceAdd),
          stock: 12,
          sku: variantSku(p, "STORAGE", s.value),
          isDefault: i === 0,
          sortOrder: i,
        })),
      },
    },
  });
}

async function upsertImages(prisma: PrismaClient, storeId: string, productId: string, p: IphoneSeed) {
  await prisma.productImage.deleteMany({ where: { storeId, productId } });
  await prisma.productImage.createMany({
    data: p.colors.map((c, i) => ({
      storeId,
      productId,
      url: iphoneColorImage(p.key, c.slug),
      alt: `${p.name_en} — ${c.value}`,
      isMain: i === 0,
      sortOrder: i,
    })),
  });
}

/** Idempotent seed of the REAL Apple iPhone catalog (Stage 1). */
export async function seedAppleIphoneCatalog(prisma: PrismaClient, storeId: string): Promise<void> {
  const categoryId = await upsertCategories(prisma, storeId);
  const activeSkus: string[] = [];

  for (const p of APPLE_IPHONES) {
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
    const desc = {
      he: iphoneDescription("he", p),
      ar: iphoneDescription("ar", p),
      en: iphoneDescription("en", p),
    };
    const title = {
      he: `${p.name_he} — קנו אונליין | אחריות רשמית`,
      ar: `${p.name_ar} — اشترِ أونلاين | ضمان رسمي`,
      en: `${p.name_en} — Buy Online | Official Warranty`,
    };

    const totalStock = p.colors.length * p.storage.length * 12;

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

  // Replace demo iPhones with the real catalog.
  await prisma.product.updateMany({
    where: { storeId, sku: { startsWith: "PHONE-IPHONE" } },
    data: { active: false },
  });

  // Deactivate stale real-catalog SKUs not in the current lineup.
  await prisma.product.updateMany({
    where: { storeId, sku: { startsWith: PRODUCT_SKU_PREFIX }, NOT: { sku: { in: activeSkus } } },
    data: { active: false },
  });
}
