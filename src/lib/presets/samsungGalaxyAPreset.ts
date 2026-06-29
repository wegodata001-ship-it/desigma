import { Prisma, PrismaClient } from "@prisma/client";
import {
  SAMSUNG_GALAXY_A,
  SAMSUNG_GALAXY_A_CATEGORY,
  aDescription,
  aGallery,
  aImage,
  buildASpecs,
  type ASeed,
} from "../catalog/samsung-galaxy-a-catalog";

const PRODUCT_SKU_PREFIX = "SAMSUNG-GALAXY-A";
const PER_COLOR_STOCK = 14;

function productSku(p: ASeed): string {
  return `SAMSUNG-${p.key.replace(/^samsung-/, "").toUpperCase()}`;
}

function localizedSpecs(p: ASeed) {
  return {
    he: buildASpecs("he", p),
    ar: buildASpecs("ar", p),
    en: buildASpecs("en", p),
  };
}

async function upsertCategories(prisma: PrismaClient, storeId: string): Promise<string> {
  const parent = SAMSUNG_GALAXY_A_CATEGORY.parent;
  const child = SAMSUNG_GALAXY_A_CATEGORY.galaxyA;
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

async function upsertVariants(prisma: PrismaClient, productId: string, p: ASeed) {
  await prisma.productVariantGroup.deleteMany({ where: { productId } });
  const base = productSku(p);

  await prisma.productVariantGroup.create({
    data: {
      productId,
      name: "Color",
      sortOrder: 0,
      options: {
        create: p.colors.map((c, i) => ({
          value: c.value,
          priceAdd: new Prisma.Decimal(0),
          stock: PER_COLOR_STOCK,
          image: aImage(p.key, c.slug, "front"),
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
      name: "RAM",
      sortOrder: 1,
      options: {
        create: p.ram.map((r, i) => ({
          value: r.value,
          priceAdd: new Prisma.Decimal(r.priceAdd),
          stock: PER_COLOR_STOCK,
          sku: `${base}-RAM-${r.value.toUpperCase()}`,
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
      sortOrder: 2,
      options: {
        create: p.storage.map((s, i) => ({
          value: s.value,
          priceAdd: new Prisma.Decimal(s.priceAdd),
          stock: PER_COLOR_STOCK,
          sku: `${base}-STG-${s.value.toUpperCase()}`,
          isDefault: i === 0,
          sortOrder: i,
        })),
      },
    },
  });
}

async function upsertImages(prisma: PrismaClient, storeId: string, productId: string, p: ASeed) {
  await prisma.productImage.deleteMany({ where: { storeId, productId } });

  let sortOrder = 0;
  const data = p.colors.flatMap((c) =>
    aGallery(p.key, c.slug).map((img) => ({
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

/** Idempotent seed of the REAL Samsung Galaxy A catalog (Master Catalog Part 3). */
export async function seedSamsungGalaxyACatalog(prisma: PrismaClient, storeId: string): Promise<void> {
  const categoryId = await upsertCategories(prisma, storeId);
  const activeSkus: string[] = [];

  for (const p of SAMSUNG_GALAXY_A) {
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
      he: aDescription("he", p),
      ar: aDescription("ar", p),
      en: aDescription("en", p),
    };
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

  // Deactivate stale real-catalog SKUs not in the current lineup.
  await prisma.product.updateMany({
    where: { storeId, sku: { startsWith: PRODUCT_SKU_PREFIX }, NOT: { sku: { in: activeSkus } } },
    data: { active: false },
  });
}
