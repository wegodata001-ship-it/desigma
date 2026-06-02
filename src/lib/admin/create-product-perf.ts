/** Labels for create/update product profiling (client + server console). */
export const CREATE_PRODUCT_PERF = {
  total: "create-product-total",
  store: "store",
  images: "images",
  variants: "variants",
  product: "product",
  revalidate: "revalidate",
  prisma: "prisma-product-save",
  audit: "admin-audit-log",
} as const;

export function perfStart(label: string): void {
  if (typeof console !== "undefined" && console.time) console.time(label);
}

export function perfEnd(label: string, meta?: Record<string, unknown>): void {
  if (typeof console !== "undefined" && console.timeEnd) console.timeEnd(label);
  if (meta && Object.keys(meta).length > 0) {
    console.log(`[create-product-perf] ${label}`, meta);
  }
}
