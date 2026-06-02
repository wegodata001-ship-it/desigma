import { NextResponse } from "next/server";
import { loadCheckoutBootstrap } from "@/lib/server/checkout-bootstrap";
import { getPrismaQueryScope } from "@/lib/server/prisma-query-scope";
import { perfLog } from "@/lib/server/perf-log";

export const runtime = "nodejs";

/** Fallback if checkout is rendered client-only — prefer server `loadCheckoutBootstrap`. */
export async function GET() {
  const t0 = performance.now();
  const data = await loadCheckoutBootstrap();
  const scope = getPrismaQueryScope();
  perfLog("checkout.api.bootstrap", performance.now() - t0, {
    prismaQueries: scope?.count ?? 0,
  });
  return NextResponse.json({
    ...data,
    debug: {
      prismaQueries: scope?.count ?? 0,
      prismaOperations: scope?.queries ?? [],
    },
  });
}
