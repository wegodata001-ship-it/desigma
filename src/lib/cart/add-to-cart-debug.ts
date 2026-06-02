"use client";

/** Set NEXT_PUBLIC_CART_DEBUG=1 in .env to force logs in production. */
export function isCartDebugEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_CART_DEBUG === "1") return true;
  return process.env.NODE_ENV === "development";
}

export type AddToCartDebugChecks = {
  routerRefresh: boolean;
  revalidatePath: boolean;
  storeSettingsFetch: boolean;
  productRefetch: boolean;
  variantsRefetch: boolean;
  stockRefetch: boolean;
  dbBeforeUi: boolean;
};

export type AddToCartSession = {
  id: string;
  source: string;
  t0: number;
  apiCalls: Array<{ url: string; method: string; ms: number; status?: number }>;
  checks: AddToCartDebugChecks;
};

let activeSession: AddToCartSession | null = null;

const defaultChecks = (): AddToCartDebugChecks => ({
  routerRefresh: false,
  revalidatePath: false,
  storeSettingsFetch: false,
  productRefetch: false,
  variantsRefetch: false,
  stockRefetch: false,
  dbBeforeUi: false,
});

export function beginAddToCartDebug(
  source: string,
  partialChecks?: Partial<AddToCartDebugChecks>,
): string {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  activeSession = {
    id,
    source,
    t0: performance.now(),
    apiCalls: [],
    checks: { ...defaultChecks(), ...partialChecks },
  };
  if (isCartDebugEnabled()) {
    console.log("[addToCart] START", {
      id,
      source,
      checks: activeSession.checks,
    });
  }
  return id;
}

export function getActiveAddToCartSession(): AddToCartSession | null {
  return activeSession;
}

export function recordAddToCartApiCall(
  url: string,
  method: string,
  ms: number,
  status?: number,
): void {
  if (!activeSession) return;
  activeSession.apiCalls.push({ url, method, ms, status });
  if (isCartDebugEnabled()) {
    console.log("[addToCart] API", { sessionId: activeSession.id, url, method, ms: Math.round(ms), status });
  }
}

export function endAddToCartDebug(
  sessionId: string,
  extra?: Record<string, unknown>,
): void {
  if (!activeSession || activeSession.id !== sessionId) return;
  const ms = performance.now() - activeSession.t0;
  const apiCount = activeSession.apiCalls.length;
  const summary = {
    id: sessionId,
    source: activeSession.source,
    totalMs: Math.round(ms * 100) / 100,
    apiRequests: apiCount,
    apiCalls: activeSession.apiCalls,
    checks: activeSession.checks,
    prismaQueriesOnClick: 0,
    note: "Prisma runs only on debounced POST /api/cart/sync (not during addItem)",
    ...extra,
  };
  if (isCartDebugEnabled()) {
    console.log("[addToCart] END", summary);
  }
  activeSession = null;
}
