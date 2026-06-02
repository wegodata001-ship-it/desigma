import "server-only";

/** Structured timing logs for Vercel / local diagnostics (grep: [perf]). */
export function perfLog(label: string, ms: number, meta?: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      scope: "perf",
      label,
      ms: Math.round(ms * 100) / 100,
      ...meta,
    }),
  );
}

export async function perfTimed<T>(label: string, fn: () => Promise<T>, meta?: Record<string, unknown>): Promise<T> {
  const t0 = performance.now();
  try {
    return await fn();
  } finally {
    perfLog(label, performance.now() - t0, meta);
  }
}
