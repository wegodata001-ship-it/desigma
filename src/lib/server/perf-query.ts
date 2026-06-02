import "server-only";

const LOG =
  process.env.PERF_QUERY_LOG === "1" ||
  (process.env.NODE_ENV === "development" && process.env.PERF_QUERY_LOG !== "0");

/** Time a single DB/query call — logs `queryName durationMs` when enabled. */
export async function perfQuery<T>(queryName: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    if (LOG) {
      const ms = Math.round((performance.now() - start) * 100) / 100;
      console.log(queryName, ms);
    }
  }
}
