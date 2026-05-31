/**
 * Publish all DESIGMA Hebrew legal policies to StoreSettings (idempotent).
 * Run: npx tsx scripts/publish-all-legal.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { DESIGMA_PRIVACY_HE_HTML } from "../src/lib/legal/desigma-privacy-he";
import { DESIGMA_REFUND_HE_HTML } from "../src/lib/legal/desigma-refund-he";
import { DESIGMA_SHIPPING_HE_HTML } from "../src/lib/legal/desigma-shipping-he";
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
  const payload = {
    terms_he: DESIGMA_TERMS_HE_HTML,
    termsPublishedAt: now,
    privacy_he: DESIGMA_PRIVACY_HE_HTML,
    privacyPublishedAt: now,
    refund_he: DESIGMA_REFUND_HE_HTML,
    refundPublishedAt: now,
    shipping_he: DESIGMA_SHIPPING_HE_HTML,
    shippingPublishedAt: now,
    supportEmail: "m.desigma@gmail.com",
    whatsappPhone: "0542298822",
  };

  await prisma.storeSettings.upsert({
    where: { storeId: STORE_ID },
    create: { storeId: STORE_ID, nextOrderNumber: 1001, ...payload },
    update: payload,
  });

  console.log(`Published all DESIGMA legal pages (he) for store "${STORE_ID}":`);
  console.log(`  terms:    ${DESIGMA_TERMS_HE_HTML.length} chars`);
  console.log(`  privacy:  ${DESIGMA_PRIVACY_HE_HTML.length} chars`);
  console.log(`  refund:   ${DESIGMA_REFUND_HE_HTML.length} chars`);
  console.log(`  shipping: ${DESIGMA_SHIPPING_HE_HTML.length} chars`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
