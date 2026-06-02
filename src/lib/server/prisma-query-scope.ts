import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";

type Scope = {
  label: string;
  count: number;
  queries: Array<{ model: string; action: string; ms: number }>;
};

const storage = new AsyncLocalStorage<Scope>();

export function runWithPrismaQueryScope<T>(label: string, fn: () => Promise<T>): Promise<T> {
  return storage.run({ label, count: 0, queries: [] }, fn);
}

export function recordScopedPrismaQuery(model: string | undefined, action: string, ms: number) {
  const scope = storage.getStore();
  if (!scope) return;
  scope.count += 1;
  scope.queries.push({ model: model ?? "raw", action, ms: Math.round(ms * 100) / 100 });
}

export function getPrismaQueryScope(): Pick<Scope, "label" | "count" | "queries"> | null {
  const scope = storage.getStore();
  if (!scope) return null;
  return { label: scope.label, count: scope.count, queries: [...scope.queries] };
}
