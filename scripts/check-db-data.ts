/**
 * Factual DB report — run: npm run db:check
 * Uses Prisma schema fields as-is (Product.active — no isPublished / deletedAt).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACTIVE_STORE_ID = process.env.NEXT_PUBLIC_STORE_ID?.trim() || "desigma";

async function main() {
  console.log("=== DESIGMA DB FACT REPORT ===\n");

  // 1. Connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("DB Connected: YES");
  } catch (e) {
    console.log("DB Connected: NO");
    console.error("Connection error:", e instanceof Error ? e.message : e);
    process.exit(1);
  }

  // 2. Total products
  const totalProducts = await prisma.product.count();
  console.log("TOTAL PRODUCTS:", totalProducts);

  // 3. Stores
  const stores = await prisma.store.findMany({
    select: { id: true, name: true, slug: true, status: true, domain: true },
    orderBy: { id: "asc" },
  });
  console.log("\nSTORES (" + stores.length + "):");
  console.log(JSON.stringify(stores, null, 2));

  // 4. Active store ID from env
  console.log("\nNEXT_PUBLIC_STORE_ID (env):", process.env.NEXT_PUBLIC_STORE_ID ?? "(not set)");
  console.log("ACTIVE_STORE_ID (resolved):", ACTIVE_STORE_ID);

  // 5. Products for current store
  const productsForCurrentStore = await prisma.product.count({
    where: { storeId: ACTIVE_STORE_ID },
  });
  console.log("\nPRODUCTS FOR CURRENT STORE:", productsForCurrentStore);

  // 6. active=false (schema field is `active`, not isActive)
  const inactiveProducts = await prisma.product.count({ where: { active: false } });
  const inactiveForStore = await prisma.product.count({
    where: { storeId: ACTIVE_STORE_ID, active: false },
  });
  console.log("\nINACTIVE PRODUCTS (active=false) — all stores:", inactiveProducts);
  console.log("INACTIVE PRODUCTS (active=false) — current store:", inactiveForStore);

  // Schema has no `published` on Product — report N/A explicitly
  console.log("\nPUBLISHED FIELD ON Product: DOES NOT EXIST IN SCHEMA");
  console.log("PUBLISHED PRODUCTS: N/A (no published column on Product model)");

  // 7. Soft delete — schema has no deletedAt on Product
  console.log("\nSOFT DELETE (deletedAt) ON Product: DOES NOT EXIST IN SCHEMA");
  console.log("SOFT-DELETED PRODUCTS: N/A (hard delete only via prisma.product.delete)");

  // 8. Full report summary
  const activeProducts = await prisma.product.count({ where: { active: true } });
  const activeForStore = await prisma.product.count({
    where: { storeId: ACTIVE_STORE_ID, active: true },
  });
  const byStore = await prisma.product.groupBy({
    by: ["storeId"],
    _count: { _all: true },
  });

  console.log("\n========== REPORT ==========");
  console.log("TOTAL PRODUCTS:              ", totalProducts);
  console.log("ACTIVE PRODUCTS (active=true):", activeProducts);
  console.log("PUBLISHED PRODUCTS:            N/A (field not in schema)");
  console.log("PRODUCTS FOR CURRENT STORE:  ", productsForCurrentStore);
  console.log("  └ active=true for store:   ", activeForStore);
  console.log("  └ active=false for store:  ", inactiveForStore);
  console.log("\nPRODUCTS BY storeId:");
  for (const row of byStore) {
    console.log(`  ${row.storeId}: ${row._count._all}`);
  }

  const storeExists = stores.some((s) => s.id === ACTIVE_STORE_ID);
  if (!storeExists) {
    console.log("\n⚠ WARNING: ACTIVE_STORE_ID does not match any Store.id in DB");
  }

  // Sample product IDs for current store
  const sample = await prisma.product.findMany({
    where: { storeId: ACTIVE_STORE_ID },
    select: { id: true, name_en: true, active: true, sku: true },
    take: 5,
    orderBy: { createdAt: "desc" },
  });
  console.log("\nSAMPLE PRODUCTS (current store, latest 5):");
  console.log(JSON.stringify(sample, null, 2));
}

main()
  .catch((e) => {
    console.error("\nDB ERROR:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
