import "server-only";

import { runtimeLog } from "@/lib/runtime-log/server";
import { getRequestPath } from "@/lib/server/request-path";
import { STORE_ID, STORE_SLUG } from "@/lib/store";

export type DbLogContext = {
  storeId?: string;
  storeSlug?: string;
  path?: string;
  [key: string]: unknown;
};

function normalizeError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

/**
 * Structured DB / loader failure — always logs full stack (visible in Vercel Runtime Logs).
 */
export async function logDbFailure(functionName: string, err: unknown, ctx: DbLogContext = {}): Promise<void> {
  const e = normalizeError(err);
  let path = ctx.path ?? "unknown";
  if (path === "unknown") {
    try {
      path = await getRequestPath();
    } catch {
      path = "unknown";
    }
  }

  const payload = {
    function: functionName,
    storeId: ctx.storeId ?? STORE_ID,
    storeSlug: ctx.storeSlug ?? STORE_SLUG,
    path,
    ...ctx,
  };

  runtimeLog({
    level: "error",
    scope: "store_boundary",
    message: "db_or_loader_failed",
    query: functionName,
    path,
    error: e.message,
    stack: e.stack,
  });

  console.error(`[store_boundary][${functionName}]`, payload, e.message, e.stack);
}

export function logLoaderOk(functionName: string, ctx: DbLogContext): void {
  console.log(`[store_loader][${functionName}]`, {
    storeId: ctx.storeId ?? STORE_ID,
    storeSlug: ctx.storeSlug ?? STORE_SLUG,
    ...ctx,
  });
}
