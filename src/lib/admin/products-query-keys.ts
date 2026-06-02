export const adminProductsKeys = {
  list: ["admin", "products", "list"] as const,
  categories: ["admin", "products", "categories"] as const,
  gallery: ["admin", "products", "gallery"] as const,
  product: (id: string) => ["admin", "product", id] as const,
};

export const ADMIN_LIST_STALE_MS = 60_000;
export const ADMIN_LIST_GC_MS = 300_000;
/** Product edit modal — always refetch so specs/descriptions match DB. */
export const ADMIN_PRODUCT_DETAIL_STALE_MS = 0;
