import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const stores = await prisma.store.findMany({
    select: { id: true, name: true, status: true, slug: true },
  });
  const productCount = await prisma.product.count();
  const activeProducts = await prisma.product.count({ where: { active: true } });
  const byStore = await prisma.product.groupBy({ by: ["storeId"], _count: true });
  const categories = await prisma.category.count();

  console.log("=== DB health check ===");
  console.log("STORE_ID env:", process.env.NEXT_PUBLIC_STORE_ID ?? "(not set, defaults to desigma)");
  console.log("Stores:", stores);
  console.log("Products total:", productCount, "| active:", activeProducts);
  console.log("Products by storeId:", byStore);
  console.log("Categories:", categories);

  const storeId = process.env.NEXT_PUBLIC_STORE_ID?.trim() || "desigma";
  const forStore = await prisma.product.count({ where: { storeId, active: true } });
  const featured = await prisma.product.count({ where: { storeId, active: true, featured: true } });
  console.log(`Active products for storeId="${storeId}":`, forStore, "| featured:", featured);
}

main()
  .catch((e) => {
    console.error("DB ERROR:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
