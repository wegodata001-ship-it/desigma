import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { seedSmartphonesCatalog } from "../src/lib/presets/smartphonesPreset";

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

const STORE_ID = process.env.STORE_ID?.trim() || "desigma";

/** Session pooler (5432) caps at ~15 clients; prefer transaction pooler or direct host. */
function resolveSeedDatabaseUrl(): string {
  const direct = process.env.DIRECT_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();

  if (direct && !direct.includes("pooler.supabase.com")) {
    return direct;
  }

  if (pooled?.includes(":6543/") && pooled.includes("pgbouncer=true")) {
    console.log("Using transaction pooler (port 6543) for seed — stop other dev servers if pool:max clients");
    return pooled;
  }

  if (pooled || direct) {
    const candidate = direct || pooled!;
    const refMatch = candidate.match(/postgres\.([a-z0-9]+):/i);
    const credMatch = candidate.match(/postgresql:\/\/([^:]+):([^@]+)@/i);
    if (refMatch && credMatch) {
      const ref = refMatch[1];
      const user = credMatch[1].includes(".") ? "postgres" : credMatch[1];
      const pass = credMatch[2];
      const url = `postgresql://${user}:${pass}@db.${ref}.supabase.co:5432/postgres`;
      console.log(`Trying direct host db.${ref}.supabase.co (fallback if unreachable)`);
      return url;
    }
    console.warn("Using pooler URL — stop `npm run dev` to free session pool slots.");
    return candidate;
  }

  console.error("Missing DIRECT_URL or DATABASE_URL in .env / .env.local");
  process.exit(1);
}

const dbUrl = resolveSeedDatabaseUrl();

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});

async function main() {
  await seedSmartphonesCatalog(prisma, STORE_ID);
  console.log(`Smartphones catalog seeded for store: ${STORE_ID}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
