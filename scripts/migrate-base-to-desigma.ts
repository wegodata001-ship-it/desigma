/**
 * Move store-scoped rows from storeId "base" → "desigma" (no deletes).
 * Run: npm run store:migrate-base-to-desigma
 * Dry-run: npm run store:migrate-base-to-desigma -- --dry-run
 */
import { PrismaClient } from "@prisma/client";

const SOURCE = "base";
const TARGET = "desigma";
const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");
const includeProducts = process.argv.includes("--include-products");
const includeCategories = process.argv.includes("--include-categories");

async function main() {
  console.log(`=== Migrate ${SOURCE} → ${TARGET} ${dryRun ? "(DRY RUN)" : ""} ===\n`);

  const targetStore = await prisma.store.findUnique({ where: { id: TARGET } });
  if (!targetStore) {
    throw new Error(`Target store "${TARGET}" does not exist. Run seed first.`);
  }

  const counts = {
    categories: await prisma.category.count({ where: { storeId: SOURCE } }),
    products: await prisma.product.count({ where: { storeId: SOURCE } }),
    productImages: await prisma.productImage.count({ where: { storeId: SOURCE } }),
    deliveryOptions: await prisma.deliveryOption.count({ where: { storeId: SOURCE } }),
    banners: await prisma.banner.count({ where: { storeId: SOURCE } }),
    storeSettings: await prisma.storeSettings.count({ where: { storeId: SOURCE } }),
  };
  console.log("Records to move:", counts);

  if (Object.values(counts).every((n) => n === 0)) {
    console.log("Nothing under base — nothing to migrate.");
    return;
  }

  if (dryRun) {
    console.log("\nDry run complete. Re-run without --dry-run to apply.");
    console.log("Flags: --include-products --include-categories (default: deliveryOptions + banners only)");
    return;
  }

  if (includeCategories) {
    const cat = await prisma.category.updateMany({
      where: { storeId: SOURCE },
      data: { storeId: TARGET },
    });
    console.log("Categories moved:", cat.count);
  } else {
    console.log("Categories: skipped (pass --include-categories to move)");
  }

  if (includeProducts) {
    const baseProducts = await prisma.product.findMany({
      where: { storeId: SOURCE },
      select: { id: true, sku: true },
    });
    let skuRenamed = 0;
    for (const p of baseProducts) {
      const clash = await prisma.product.findFirst({
        where: { storeId: TARGET, sku: p.sku },
        select: { id: true },
      });
      if (clash) {
        await prisma.product.update({
          where: { id: p.id },
          data: { sku: `${p.sku}-from-base` },
        });
        skuRenamed++;
      }
    }
    const prod = await prisma.product.updateMany({
      where: { storeId: SOURCE },
      data: { storeId: TARGET },
    });
    console.log("Products moved:", prod.count, "| SKU renamed:", skuRenamed);

    const imgs = await prisma.productImage.updateMany({
      where: { storeId: SOURCE },
      data: { storeId: TARGET },
    });
    console.log("ProductImages moved:", imgs.count);
  } else {
    console.log("Products/images: skipped (pass --include-products to move; base has demo BASE-P* SKUs)");
  }

  const ship = await prisma.deliveryOption.updateMany({
    where: { storeId: SOURCE },
    data: { storeId: TARGET },
  });
  console.log("DeliveryOptions moved:", ship.count);

  const banners = await prisma.banner.updateMany({
    where: { storeId: SOURCE },
    data: { storeId: TARGET },
  });
  console.log("Banners moved:", banners.count);

  const targetSettings = await prisma.storeSettings.findUnique({ where: { storeId: TARGET } });
  const sourceSettings = await prisma.storeSettings.findUnique({ where: { storeId: SOURCE } });
  if (sourceSettings && !targetSettings) {
    await prisma.storeSettings.update({
      where: { storeId: SOURCE },
      data: { storeId: TARGET },
    });
    console.log("StoreSettings moved: 1");
  } else if (sourceSettings && targetSettings) {
    console.log("StoreSettings: skipped (desigma already has settings)");
  } else {
    console.log("StoreSettings: none under base");
  }

  console.log("\n=== Post-migration counts ===");
  for (const storeId of [SOURCE, TARGET]) {
    const p = await prisma.product.count({ where: { storeId } });
    const c = await prisma.category.count({ where: { storeId } });
    const d = await prisma.deliveryOption.count({ where: { storeId } });
    console.log(`${storeId}: products=${p} categories=${c} delivery=${d}`);
  }
}

main()
  .catch((e) => {
    console.error("Migration failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
