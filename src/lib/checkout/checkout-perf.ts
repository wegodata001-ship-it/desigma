"use client";

/** Client checkout profiling — grep DevTools console for [checkout-perf]. */
export function isCheckoutPerfEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CHECKOUT_PERF === "1" || process.env.NODE_ENV === "development";
}

export function checkoutPerfStart(label: string): void {
  if (!isCheckoutPerfEnabled()) return;
  console.time(label);
}

export function checkoutPerfEnd(label: string, meta?: Record<string, unknown>): void {
  if (!isCheckoutPerfEnabled()) return;
  console.timeEnd(label);
  if (meta) console.log(`[checkout-perf] ${label}`, meta);
}

export async function checkoutPerfFetch<T>(
  label: string,
  url: string,
  init?: RequestInit,
): Promise<T> {
  checkoutPerfStart(label);
  const t0 = performance.now();
  try {
    const res = await fetch(url, init);
    const ms = Math.round(performance.now() - t0);
    const data = (await res.json()) as T;
    checkoutPerfEnd(label, { url, status: res.status, ms, ok: res.ok });
    return data;
  } catch (e) {
    checkoutPerfEnd(label, { url, error: e instanceof Error ? e.message : String(e) });
    throw e;
  }
}
