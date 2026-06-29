import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { seedSamsungGalaxyZCatalog } from "../src/lib/presets/samsungGalaxyZPreset";

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

const STORE_ID = process.env.STORE_ID?.trim() || process.env.NEXT_PUBLIC_STORE_ID?.trim() || "desigma";

function resolveSeedDatabaseUrl(): string {
  const direct = process.env.DIRECT_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();

  if (direct && !direct.includes("pooler.supabase.com")) return direct;
  if (pooled?.includes(":6543/") && pooled.includes("pgbouncer=true")) return pooled;

  const candidate = direct || pooled;
  if (candidate) return candidate;

  console.error("Missing DIRECT_URL or DATABASE_URL in .env / .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: { db: { url: resolveSeedDatabaseUrl() } },
});

async function main() {
  await seedSamsungGalaxyZCatalog(prisma, STORE_ID);
  console.log(`Samsung Galaxy Z catalog (Part 2) seeded for store: ${STORE_ID}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
