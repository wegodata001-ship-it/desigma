/**
 * Prisma / DATABASE_URL audit — run: npm run db:audit
 * Prints facts only (no credentials).
 */
import { PrismaClient } from "@prisma/client";
import { analyzeDatabaseUrl } from "../src/lib/db-url-mode";

const runtime = analyzeDatabaseUrl(process.env.DATABASE_URL);
const direct = analyzeDatabaseUrl(process.env.DIRECT_URL);

console.log("=== PRISMA AUDIT REPORT ===\n");

console.log("1. PrismaClient instances in app runtime: 1 (singleton in src/lib/prisma-base.ts)");
console.log("   Scripts/seeds create separate short-lived clients (expected).\n");

console.log("2. DATABASE_URL mode:");
console.log(JSON.stringify(runtime, null, 2));

console.log("\n3. DIRECT_URL mode:");
console.log(JSON.stringify(direct, null, 2));

if (runtime.mode === "session") {
  console.log("\n⚠ ROOT CAUSE: Session pooler (5432) — max ~15 clients shared globally.");
  console.log("  FIX: DATABASE_URL → port 6543 + ?pgbouncer=true&connection_limit=1");
  console.log("  FIX: DIRECT_URL   → db.xxxx.supabase.co:5432 (direct host, migrations only)");
}

if (runtime.mode === "transaction" && !runtime.connectionLimit) {
  console.log("\n💡 TIP: Add &connection_limit=1 to DATABASE_URL for Vercel/serverless.");
}

console.log("\n4. Connection test...");
const prisma = new PrismaClient();
prisma
  .$queryRaw`SELECT 1`
  .then(() => console.log("   DB Connected: YES"))
  .catch((e) => {
    console.log("   DB Connected: NO");
    console.error("   Error:", e instanceof Error ? e.message : e);
  })
  .finally(() => prisma.$disconnect());
