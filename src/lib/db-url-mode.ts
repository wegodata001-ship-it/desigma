/** Parse DATABASE_URL for pool mode — never log the full URL (contains credentials). */
export type DbUrlMode = "session" | "transaction" | "direct" | "unknown";

export type DbUrlAnalysis = {
  mode: DbUrlMode;
  port: string | null;
  host: string | null;
  hasPgbouncer: boolean;
  connectionLimit: string | null;
  poolSizeHint: string;
};

export function analyzeDatabaseUrl(raw: string | undefined): DbUrlAnalysis {
  const url = typeof raw === "string" ? raw.trim() : "";
  if (!url) {
    return {
      mode: "unknown",
      port: null,
      host: null,
      hasPgbouncer: false,
      connectionLimit: null,
      poolSizeHint: "DATABASE_URL not set",
    };
  }

  let port: string | null = null;
  let host: string | null = null;
  let hasPgbouncer = false;
  let connectionLimit: string | null = null;

  try {
    const parsed = new URL(url.replace(/^postgresql:/, "postgres:"));
    port = parsed.port || "5432";
    host = parsed.hostname;
    hasPgbouncer = parsed.searchParams.get("pgbouncer") === "true";
    connectionLimit = parsed.searchParams.get("connection_limit");
  } catch {
    const portMatch = url.match(/:(\d+)\//);
    port = portMatch?.[1] ?? null;
    const hostMatch = url.match(/@([^:/]+)/);
    host = hostMatch?.[1] ?? null;
    hasPgbouncer = url.includes("pgbouncer=true");
    const clMatch = url.match(/connection_limit=(\d+)/);
    connectionLimit = clMatch?.[1] ?? null;
  }

  const isPooler = host?.includes("pooler") ?? false;
  const isDirectHost = host?.startsWith("db.") ?? false;

  let mode: DbUrlMode = "unknown";
  let poolSizeHint = "unknown";

  if (port === "6543" && hasPgbouncer) {
    mode = "transaction";
    poolSizeHint = "Transaction pooler (6543) — recommended for Prisma runtime";
  } else if (port === "5432" && isPooler && hasPgbouncer) {
    mode = "session";
    poolSizeHint = "Session pooler (5432) — max ~15 connections TOTAL → EMAXCONNSESSION errors";
  } else if (port === "5432" && isDirectHost) {
    mode = "direct";
    poolSizeHint = "Direct Postgres (5432) — use DIRECT_URL for migrations only, not runtime";
  } else if (port === "5432") {
    mode = isPooler ? "session" : "direct";
    poolSizeHint =
      mode === "session"
        ? "Likely session pooler (5432) — high risk of max clients reached"
        : "Direct or unknown 5432 connection";
  }

  return { mode, port, host, hasPgbouncer, connectionLimit, poolSizeHint };
}

export function isSessionPoolerUrl(raw: string | undefined): boolean {
  return analyzeDatabaseUrl(raw).mode === "session";
}
