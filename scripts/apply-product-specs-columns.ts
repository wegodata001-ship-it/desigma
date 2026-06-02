/**
 * Adds Product.specs_* columns via pooler (DATABASE_URL / port 6543).
 * Use when `prisma db push` fails on DIRECT_URL (5432 unreachable).
 *
 * Run: npx tsx scripts/apply-product-specs-columns.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STATEMENTS = [
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "specs_he" JSONB`,
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "specs_ar" JSONB`,
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "specs_en" JSONB`,
];

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.includes("6543") && !url.includes("pooler")) {
    console.warn("[apply-product-specs] DATABASE_URL may not be the Supabase pooler (6543).");
  }

  for (const sql of STATEMENTS) {
    console.log("Running:", sql);
    await prisma.$executeRawUnsafe(sql);
  }

  console.log("Done — Product.specs_he / specs_ar / specs_en are ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
