import "server-only";

import { PrismaClient } from "@prisma/client";
import { analyzeDatabaseUrl, isSessionPoolerUrl } from "@/lib/db-url-mode";

/**
 * Base Prisma client (no query extensions). Used for observability writes to avoid
 * recursive middleware / slow-query logging on telemetry inserts.
 */
const globalForPrisma = globalThis as unknown as { prismaBase?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const analysis = analyzeDatabaseUrl(process.env.DATABASE_URL);
  console.log("[prisma] Prisma connection created", {
    pid: process.pid,
    nodeEnv: process.env.NODE_ENV,
    dbMode: analysis.mode,
    port: analysis.port,
    host: analysis.host,
    connectionLimit: analysis.connectionLimit,
  });
  if (isSessionPoolerUrl(process.env.DATABASE_URL)) {
    console.error(
      "[prisma] CRITICAL: DATABASE_URL uses Session pooler (5432). " +
        "Switch to Transaction pooler port 6543 — see .env.example",
    );
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prismaBase = globalForPrisma.prismaBase ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaBase = prismaBase;
