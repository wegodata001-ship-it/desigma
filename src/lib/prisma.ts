import "server-only";

import { prismaBase } from "@/lib/prisma-base";
import { isObservabilityDbEnabled } from "@/lib/observability/config";
import { recordPrismaQueryObservation } from "@/lib/observability/prisma-metrics";
import { recordScopedPrismaQuery } from "@/lib/server/prisma-query-scope";

/** Middleware preserves `PrismaClient` typing for `$transaction` and avoids recursive telemetry writes. */
prismaBase.$use(async (params, next) => {
  if (params.model === "ObservabilityEvent") {
    return next(params);
  }
  const t0 = Date.now();
  try {
    const result = await next(params);
    const durationMs = Date.now() - t0;
    recordScopedPrismaQuery(params.model, params.action, durationMs);
    if (isObservabilityDbEnabled()) {
      void recordPrismaQueryObservation({
        model: params.model ?? "unknown",
        operation: params.action,
        durationMs,
        ok: true,
      });
    }
    return result;
  } catch (err) {
    const durationMs = Date.now() - t0;
    recordScopedPrismaQuery(params.model, params.action, durationMs);
    if (isObservabilityDbEnabled()) {
      void recordPrismaQueryObservation({
        model: params.model ?? "unknown",
        operation: params.action,
        durationMs,
        ok: false,
        errorMessage: err instanceof Error ? err.message : String(err),
      });
    }
    throw err;
  }
});

export const prisma = prismaBase;
