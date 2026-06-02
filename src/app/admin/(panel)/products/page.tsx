import { getStoreId } from "@/lib/store-config";
import { requireAdminSession } from "@/lib/admin-auth";
import { loadAdminCategoryOptions } from "@/lib/admin/categories-options";
import {
  productAdminListSelect,
  serializeAdminProductListItem,
  type ProductListRow,
} from "@/lib/admin/product-serialize";
import { ProductsAdminClient } from "@/components/admin/products-admin-client";
import { GALLERY_DISPLAY_DEFAULTS } from "@/lib/product-gallery-display";
import { loadGalleryDisplayForStore } from "@/lib/gallery-settings-load";
import { prisma } from "@/lib/prisma";
import { perfQuery } from "@/lib/server/perf-query";
import { safeQuery } from "@/lib/server/safe-query";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ add?: string }>;
}) {
  await requireAdminSession();
  const storeId = getStoreId();
  const sp = (await searchParams) ?? {};

  const [cats, galleryDisplay, list] = await Promise.all([
    safeQuery("admin.products.categories", () => loadAdminCategoryOptions(storeId), [], {
      timeoutMs: 12_000,
      slowThresholdMs: 700,
    }),
    safeQuery(
      "admin.products.gallery_settings",
      () => perfQuery("admin.products.gallery_settings", () => loadGalleryDisplayForStore(storeId)),
      GALLERY_DISPLAY_DEFAULTS,
      { timeoutMs: 8_000, slowThresholdMs: 700 },
    ),
    safeQuery(
      "admin.products.list",
      () =>
        perfQuery("admin.products.list", async () => {
          const products = await prisma.product.findMany({
            where: { storeId },
            orderBy: { updatedAt: "desc" },
            select: productAdminListSelect,
          });
          return products.map(serializeAdminProductListItem);
        }),
      [] as ProductListRow[],
      { timeoutMs: 20_000, slowThresholdMs: 700 },
    ),
  ]);

  return (
    <ProductsAdminClient
      initialProducts={list}
      initialCategories={cats}
      initialGalleryDisplay={galleryDisplay}
      initialOpenAdd={sp.add === "1"}
    />
  );
}
