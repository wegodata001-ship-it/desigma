/** Resolve storefront product image paths consistently. */

export type ProductImageRow = {
  id?: string;
  url: string;
  isMain?: boolean;
  sortOrder?: number;
};

export function sortProductImages<T extends ProductImageRow>(images: T[]): T[] {
  return [...images].sort((a, b) => {
    if (!!a.isMain !== !!b.isMain) return a.isMain ? -1 : 1;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
}

/** Main catalog image — prefers isMain, then lowest sortOrder. */
export function pickProductImageUrl(
  images: ProductImageRow[] | null | undefined,
  fallback: string | null = null,
): string | null {
  const sorted = sortProductImages(images ?? []);
  const url = sorted.find((im) => im.url?.trim())?.url?.trim();
  return url || fallback;
}

/** Gallery list for product page (optional variant hero prepended, deduped). */
export function buildProductGalleryImages(
  images: { id: string; url: string; isMain?: boolean; sortOrder?: number }[],
  variantHeroUrl?: string | null,
): { id: string; url: string }[] {
  const sorted = sortProductImages(images).filter((im) => im.url?.trim());
  const list = sorted.map((im) => ({ id: im.id, url: im.url.trim() }));
  const hero = variantHeroUrl?.trim();
  if (hero && !list.some((im) => im.url === hero)) {
    return [{ id: "variant-hero", url: hero }, ...list];
  }
  return list;
}
