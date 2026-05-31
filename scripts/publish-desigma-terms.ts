/**
 * Publish DESIGMA Hebrew terms to StoreSettings (idempotent).
 * Run: npx tsx scripts/publish-desigma-terms.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { DESIGMA_TERMS_HE_HTML } from "../src/lib/legal/desigma-terms-he";

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
  const now = new Date();
  await prisma.storeSettings.upsert({
    where: { storeId: STORE_ID },
    create: {
      storeId: STORE_ID,
      terms_he: DESIGMA_TERMS_HE_HTML,
      termsPublishedAt: now,
      supportEmail: "m.desigma@gmail.com",
      whatsappPhone: "0542298822",
    },
    update: {
      terms_he: DESIGMA_TERMS_HE_HTML,
      termsPublishedAt: now,
      supportEmail: "m.desigma@gmail.com",
      whatsappPhone: "0542298822",
    },
  });
  console.log(`Published DESIGMA terms (he) for store "${STORE_ID}" (${DESIGMA_TERMS_HE_HTML.length} chars).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
