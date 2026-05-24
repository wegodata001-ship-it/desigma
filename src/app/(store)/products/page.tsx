import { prisma } from "@/lib/prisma";
import { getStoreId } from "@/lib/store-config";
import { StoreProductsClient } from "@/components/storefront/store-products-client";
import {
  collectDescendantCategoryIds,
  colorOptionsFromGroups,
  minSmartphonePrice,
} from "@/lib/smartphone-catalog";

export const dynamic = "force-dynamic";

function detectBrand(name: string, categoryPath: string): "apple" | "samsung" | null {
  const n = `${name} ${categoryPath}`.toLowerCase();
  if (n.includes("iphone") || n.includes("apple")) return "apple";
  if (n.includes("samsung") || n.includes("galaxy")) return "samsung";
  return null;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ cat?: string; q?: string }>;
}) {
  const storeId = getStoreId();
  const sp = (await searchParams) ?? {};
  const cat = sp.cat?.trim() || "";
  const q = sp.q?.trim() || "";

  const categories = await prisma.category.findMany({
    where: { storeId, active: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, parentId: true, name_he: true, name_ar: true, name_en: true, imageUrl: true },
  });
  const byId = new Map(categories.map((c) => [c.id, c] as const));
  const selected = cat ? byId.get(cat) : null;

  const smartphonesRoot = categories.find((c) => c.name_en === "Smartphones" || c.id.endsWith("-phone-smartphones"));

  const categoryIds = selected
    ? collectDescendantCategoryIds(categories, selected.id)
    : null;

  const isSmartphoneView =
    !!smartphonesRoot &&
    (!selected || categoryIds?.includes(smartphonesRoot.id) || selected.id === smartphonesRoot.id);

  const products = await prisma.product.findMany({
    where: {
      storeId,
      active: true,
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
      ...(q
        ? {
            OR: [
              { name_he: { contains: q, mode: "insensitive" } },
              { name_ar: { contains: q, mode: "insensitive" } },
              { name_en: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: { select: { name_he: true, name_en: true, parentId: true } },
      variantGroups: {
        orderBy: { sortOrder: "asc" },
        include: { options: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  return (
    <StoreProductsClient
      categories={categories}
      selectedCategoryId={selected?.id ?? ""}
      smartphoneMode={isSmartphoneView}
      products={products.map((p) => {
        const basePrice = Number(p.price);
        const variantGroups = p.variantGroups.map((g) => ({
          name: g.name,
          options: g.options.map((o) => ({
            value: o.value,
            priceAdd: Number(o.priceAdd),
          })),
        }));
        const catPath = p.category.name_en;
        return {
          id: p.id,
          name_he: p.name_he,
          name_ar: p.name_ar,
          name_en: p.name_en,
          description_he: p.description_he,
          description_ar: p.description_ar,
          description_en: p.description_en,
          price: basePrice,
          fromPrice: minSmartphonePrice(basePrice),
          oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
          discountPercent: p.discountPercent ?? null,
          stock: p.stock,
          image: p.images[0]?.url ?? null,
          tags: p.tags ?? [],
          featured: p.featured,
          brand: detectBrand(p.name_en, catPath),
          colorOptions: colorOptionsFromGroups(variantGroups),
          variantGroups,
        };
      })}
    />
  );
}
