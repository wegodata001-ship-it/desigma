import "server-only";

import { logDbFailure } from "@/lib/server/db-log";
import { STORE_ID, STORE_SLUG } from "@/lib/store";

type SettledResult<T> = { ok: true; value: T } | { ok: false; error: unknown };

/**
 * Like Promise.allSettled but returns keyed results with per-task fallbacks.
 * One failed query does not reject the batch.
 */
export async function safeAllSettled<T extends Record<string, () => Promise<unknown>>>(
  label: string,
  tasks: T,
  fallbacks: { [K in keyof T]: Awaited<ReturnType<T[K]>> },
  ctx: { storeId?: string; storeSlug?: string; path?: string } = {},
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const keys = Object.keys(tasks) as (keyof T)[];
  const settled = await Promise.allSettled(keys.map((k) => tasks[k]()));

  const out = { ...fallbacks };

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const result = settled[i];
    if (result.status === "fulfilled") {
      (out as Record<string, unknown>)[key as string] = result.value;
    } else {
      await logDbFailure(`${label}.${String(key)}`, result.reason, {
        storeId: ctx.storeId ?? STORE_ID,
        storeSlug: ctx.storeSlug ?? STORE_SLUG,
        path: ctx.path,
        task: String(key),
      });
    }
  }

  return out;
}

export async function settleOne<T>(
  functionName: string,
  fn: () => Promise<T>,
  fallback: T,
  ctx: { storeId?: string; storeSlug?: string; path?: string } = {},
): Promise<SettledResult<T>> {
  try {
    const value = await fn();
    return { ok: true, value };
  } catch (err) {
    await logDbFailure(functionName, err, ctx);
    return { ok: false, error: err };
  }
}
