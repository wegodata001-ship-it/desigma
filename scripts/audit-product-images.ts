/**
 * Audit product images in DB (ProductImage table).
 * Run: npx tsx scripts/audit-product-images.ts
 */
import { PrismaClient } from "@prisma/client";
import { pickProductImageUrl } from "../src/lib/product-images";

const prisma = new PrismaClient();

async function main() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID?.trim() || "desigma";
  const products = await prisma.product.findMany({
    where: { storeId, active: true },
    take: 20,
    select: {
      id: true,
      name_he: true,
      images: {
        orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }],
        select: { id: true, url: true, isMain: true, sortOrder: true },
      },
    },
  });

  console.log(`Store: ${storeId} — active products sampled: ${products.length}\n`);

  let withImage = 0;
  for (const p of products) {
    const picked = pickProductImageUrl(p.images);
    if (picked) withImage++;
    console.log({
      id: p.id,
      name: p.name_he,
      imageCount: p.images.length,
      pickedUrl: picked,
      images: p.images.map((i) => i.url),
    });
  }

  console.log(`\nWith at least one image URL: ${withImage}/${products.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
