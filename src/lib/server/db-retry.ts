import "server-only";

const POOL_ERROR = /max clients|EMAXCONNSESSION|too many connections/i;

export function isDbPoolError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return POOL_ERROR.test(msg);
}

/** Retry transient Supabase pool errors (session mode / exhaustion). */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  opts?: { attempts?: number; delayMs?: number },
): Promise<T> {
  const attempts = opts?.attempts ?? 3;
  const delayMs = opts?.delayMs ?? 400;
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (!isDbPoolError(e) || i === attempts - 1) throw e;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw last;
}
