/**
 * Store isolation audit — run: npm run store:audit
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const STORES = ["base", "desigma", "hagor"] as const;

async function main() {
  console.log("=== STORE ISOLATION AUDIT ===\n");
  console.log("NEXT_PUBLIC_STORE_ID (env):", process.env.NEXT_PUBLIC_STORE_ID ?? "(not set)");
  console.log("Effective (code rule): env 'base' → treated as 'desigma' on DESIGMA hosts\n");

  const rows: Array<[string, (id: string) => Promise<number>]> = [
    ["Products", (id) => prisma.product.count({ where: { storeId: id } })],
    ["Categories", (id) => prisma.category.count({ where: { storeId: id } })],
    ["ShippingOptions (DeliveryOption)", (id) => prisma.deliveryOption.count({ where: { storeId: id } })],
    ["Banners", (id) => prisma.banner.count({ where: { storeId: id } })],
    ["StoreSettings", (id) => prisma.storeSettings.count({ where: { storeId: id } })],
    ["ProductImages", (id) => prisma.productImage.count({ where: { storeId: id } })],
  ];

  for (const [label, countFn] of rows) {
    console.log(`--- ${label} ---`);
    for (const storeId of STORES) {
      const n = await countFn(storeId);
      console.log(`  ${storeId}: ${n}`);
    }
    console.log("");
  }

  const envAudit = process.env.NEXT_PUBLIC_STORE_ID?.trim();
  if (envAudit === "base") {
    console.log("⚠ WARNING: NEXT_PUBLIC_STORE_ID=base in environment — causes wrong queries unless host override applies.");
  }

  const baseProducts = await prisma.product.findMany({
    where: { storeId: "base" },
    select: { id: true, sku: true, name_en: true, createdAt: true },
    take: 20,
  });
  if (baseProducts.length > 0) {
    console.log("Sample products still under storeId=base (candidates for migration):");
    console.log(JSON.stringify(baseProducts, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
