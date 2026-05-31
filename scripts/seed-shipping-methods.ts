/**
 * Seed default shipping methods for a store (idempotent replace).
 * Run: npm run shipping:seed
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_SHIPPING_METHODS } from "../src/lib/shipping/delivery-behavior";

function loadEnvFile(name: string, override = false) {
  const path = resolve(process.cwd(), name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (override || process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local", true);

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID?.trim() || "desigma";
const prisma = new PrismaClient();

async function main() {
  await prisma.deliveryOption.deleteMany({ where: { storeId: STORE_ID } });
  await prisma.deliveryOption.createMany({
    data: DEFAULT_SHIPPING_METHODS.map((m) => ({
      storeId: STORE_ID,
      name_he: m.name_he,
      name_ar: m.name_ar,
      name_en: m.name_en,
      type: m.type,
      eta_he: m.eta_he,
      eta_ar: m.eta_ar,
      eta_en: m.eta_en,
      price: m.price,
      active: true,
      sortOrder: m.sortOrder,
    })),
  });
  console.log(`Seeded ${DEFAULT_SHIPPING_METHODS.length} shipping methods for store "${STORE_ID}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
