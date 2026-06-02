import "server-only";

import { prisma } from "@/lib/prisma";
import type { CartProductSnapshot } from "@/lib/cart/availability";
import { pickProductImageUrl } from "@/lib/product-images";

export type CartProductView = CartProductSnapshot & {
  name_he: string;
  name_ar: string;
  name_en: string;
  image: string | null;
};

export async function loadCartProductsForStore(
  storeId: string,
  productIds: string[],
): Promise<Map<string, CartProductView>> {
  if (productIds.length === 0) return new Map();

  const products = await prisma.product.findMany({
    where: { storeId, id: { in: productIds } },
    include: {
      images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }], take: 3 },
      variantGroups: {
        include: {
          options: { select: { id: true, stock: true, priceAdd: true } },
        },
      },
    },
  });

  const map = new Map<string, CartProductView>();
  for (const p of products) {
    const variantOptions = p.variantGroups.flatMap((g) =>
      g.options.map((o) => ({
        id: o.id,
        stock: o.stock,
        priceAdd: Number(o.priceAdd),
      })),
    );
    map.set(p.id, {
      id: p.id,
      active: p.active,
      stock: p.stock,
      price: Number(p.price),
      name_he: p.name_he,
      name_ar: p.name_ar,
      name_en: p.name_en,
      image: pickProductImageUrl(p.images),
      variantOptions: variantOptions.length ? variantOptions : undefined,
    });
  }
  return map;
}
