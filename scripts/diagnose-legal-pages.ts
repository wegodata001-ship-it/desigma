/**
 * Diagnostic: trace legal page DB load chain.
 * Run: npx tsx scripts/diagnose-legal-pages.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

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
const STORE_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG?.trim() || STORE_ID;
const prisma = new PrismaClient();

const TABS = ["terms", "privacy", "refund", "shipping"] as const;

async function main() {
  console.log("=== LEGAL PAGES DIAGNOSTIC ===");
  console.log("NEXT_PUBLIC_STORE_ID:", process.env.NEXT_PUBLIC_STORE_ID ?? "(unset → fallback desigma)");
  console.log("NEXT_PUBLIC_STORE_SLUG:", process.env.NEXT_PUBLIC_STORE_SLUG ?? "(unset → fallback storeId)");
  console.log("Resolved STORE_ID:", STORE_ID);
  console.log("Resolved STORE_SLUG:", STORE_SLUG);
  console.log("DATABASE_URL set:", Boolean(process.env.DATABASE_URL?.trim()));
  console.log("");

  const allSettings = await prisma.storeSettings.findMany({
    select: {
      storeId: true,
      terms_he: true,
      terms_en: true,
      terms_ar: true,
      privacy_he: true,
      refund_he: true,
      shipping_he: true,
      termsPublishedAt: true,
      privacyPublishedAt: true,
      refundPublishedAt: true,
      shippingPublishedAt: true,
    },
  });

  console.log(`StoreSettings rows in DB: ${allSettings.length}`);
  for (const row of allSettings) {
    console.log(`  - storeId="${row.storeId}" terms_he=${row.terms_he?.length ?? 0} chars`);
  }
  console.log("");

  const row = await prisma.storeSettings.findUnique({ where: { storeId: STORE_ID } });

  if (!row) {
    console.error(`❌ NO StoreSettings row for storeId="${STORE_ID}"`);
    console.error("   Content may exist under a different storeId — see list above.");
    return;
  }

  console.log(`✓ Found StoreSettings for storeId="${STORE_ID}"`);
  console.log("");

  for (const tab of TABS) {
    const heKey = `${tab}_he` as keyof typeof row;
    const enKey = `${tab}_en` as keyof typeof row;
    const arKey = `${tab}_ar` as keyof typeof row;
    const pubKey = `${tab}PublishedAt` as keyof typeof row;

    const he = row[heKey];
    const en = row[enKey];
    const ar = row[arKey];
    const pub = row[pubKey];

    console.log(`--- loadLegalPageFromDb("${tab}") ---`);
    console.log("  storeId:", STORE_ID);
    console.log("  storeSlug:", STORE_SLUG);
    console.log("  pageType:", tab);
    console.log("  html.he length:", typeof he === "string" ? he.length : he === null ? "null" : String(he));
    console.log("  html.en length:", typeof en === "string" ? en.length : en === null ? "null" : String(en));
    console.log("  html.ar length:", typeof ar === "string" ? ar.length : ar === null ? "null" : String(ar));
    console.log("  publishedAt:", pub instanceof Date ? pub.toISOString() : pub ?? "null");
    console.log("");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
