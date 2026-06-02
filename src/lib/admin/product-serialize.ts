import "server-only";

import type { Prisma } from "@prisma/client";
import type { ProductRow } from "@/components/admin/products-admin-client";

/** Admin table — minimal columns only (no variants, descriptions, gallery). */
export const productAdminListSelect = {
  id: true,
  sku: true,
  name_he: true,
  name_ar: true,
  name_en: true,
  price: true,
  stock: true,
  active: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: { id: true, url: true, isMain: true, sortOrder: true },
  },
} satisfies Prisma.ProductSelect;

export const productAdminDetailSelect = {
  id: true,
  sku: true,
  name_he: true,
  name_ar: true,
  name_en: true,
  description_he: true,
  description_ar: true,
  description_en: true,
  specs_he: true,
  specs_ar: true,
  specs_en: true,
  price: true,
  oldPrice: true,
  discountPercent: true,
  stock: true,
  active: true,
  featured: true,
  tags: true,
  categoryId: true,
  category: { select: { name_he: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: { id: true, url: true, isMain: true, sortOrder: true },
  },
  variantGroups: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      name: true,
      sortOrder: true,
      options: {
        orderBy: { sortOrder: "asc" as const },
        select: {
          id: true,
          value: true,
          priceAdd: true,
          stock: true,
          sku: true,
          image: true,
          isDefault: true,
          sortOrder: true,
        },
      },
    },
  },
  relatedProducts: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      sortOrder: true,
      relatedProduct: {
        select: {
          id: true,
          name_he: true,
          name_ar: true,
          name_en: true,
          price: true,
          images: {
            orderBy: { sortOrder: "asc" as const },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

type ProductWithRelations = Prisma.ProductGetPayload<{ select: typeof productAdminDetailSelect }>;

export function serializeAdminProduct(p: ProductWithRelations): ProductRow {
  return {
    id: p.id,
    sku: p.sku,
    name_he: p.name_he,
    name_ar: p.name_ar,
    name_en: p.name_en,
    description_he: p.description_he,
    description_ar: p.description_ar,
    description_en: p.description_en,
    specs_he: p.specs_he,
    specs_ar: p.specs_ar,
    specs_en: p.specs_en,
    price: Number(p.price),
    oldPrice: p.oldPrice != null ? Number(p.oldPrice) : null,
    discountPercent: p.discountPercent ?? null,
    stock: p.stock,
    active: p.active,
    featured: p.featured,
    tags: p.tags ?? [],
    categoryId: p.categoryId,
    category: { name_he: p.category.name_he },
    images: p.images.map((im) => ({
      id: im.id,
      url: im.url,
      isMain: im.isMain,
      sortOrder: im.sortOrder,
    })),
    variantGroups: p.variantGroups.map((g) => ({
      id: g.id,
      name: g.name,
      sortOrder: g.sortOrder,
      options: g.options.map((o) => ({
        id: o.id,
        value: o.value,
        priceAdd: Number(o.priceAdd),
        stock: o.stock ?? null,
        sku: o.sku ?? null,
        image: o.image ?? null,
        isDefault: o.isDefault,
        sortOrder: o.sortOrder,
      })),
    })),
    relatedProducts: p.relatedProducts.map((rp) => ({
      id: rp.relatedProduct.id,
      name_he: rp.relatedProduct.name_he,
      name_ar: rp.relatedProduct.name_ar,
      name_en: rp.relatedProduct.name_en,
      price: Number(rp.relatedProduct.price),
      image: rp.relatedProduct.images[0]?.url ?? null,
      sortOrder: rp.sortOrder,
    })),
  };
}

export type ProductListRow = {
  id: string;
  sku: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  price: number;
  stock: number;
  active: boolean;
  category: { name_he: string };
  images: ProductRow["images"];
};

export function serializeAdminProductListItem(
  p: Prisma.ProductGetPayload<{ select: typeof productAdminListSelect }>,
): ProductListRow {
  return {
    id: p.id,
    sku: p.sku,
    name_he: p.name_he,
    name_ar: p.name_ar,
    name_en: p.name_en,
    price: Number(p.price),
    stock: p.stock,
    active: p.active,
    category: { name_he: "" },
    images: p.images.map((im) => ({
      id: im.id,
      url: im.url,
      isMain: im.isMain,
      sortOrder: im.sortOrder,
    })),
  };
}
