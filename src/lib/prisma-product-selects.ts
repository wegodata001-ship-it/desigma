import type { Prisma } from "@prisma/client";

/** Home / catalog list — omits specs_* so queries work before optional JSON migration. */
export const productListForCardsSelect = {
  id: true,
  name_he: true,
  name_ar: true,
  name_en: true,
  description_he: true,
  description_ar: true,
  description_en: true,
  price: true,
  oldPrice: true,
  discountPercent: true,
  stock: true,
  tags: true,
  featured: true,
  categoryId: true,
  createdAt: true,
  images: {
    orderBy: [{ isMain: "desc" as const }, { sortOrder: "asc" as const }],
    take: 3,
    select: { url: true, isMain: true, sortOrder: true },
  },
  category: { select: { id: true, parentId: true, name_en: true } },
} satisfies Prisma.ProductSelect;

export type ProductListForCards = Prisma.ProductGetPayload<{ select: typeof productListForCardsSelect }>;

/** Products listing + smartphone filters (variants), no specs_* columns. */
export const productCatalogWithVariantsSelect = {
  ...productListForCardsSelect,
  category: { select: { name_he: true, name_en: true, parentId: true } },
  variantGroups: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      name: true,
      options: {
        orderBy: { sortOrder: "asc" as const },
        select: { value: true, priceAdd: true },
      },
    },
  },
} satisfies Prisma.ProductSelect;
