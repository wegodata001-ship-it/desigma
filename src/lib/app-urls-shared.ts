/** Edge-safe URL helpers (middleware + client). */

export function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function hostFromUrl(url: string | undefined | null): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  try {
    const withProto = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    return new URL(withProto).host.toLowerCase();
  } catch {
    return null;
  }
}

export function hostsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const norm = (h: string) => h.toLowerCase().split(":")[0];
  return norm(a) === norm(b);
}

/** Prisma cuid-style order id (admin links). */
export function isLikelyOrderId(slug: string): boolean {
  return /^c[a-z0-9]{20,}$/i.test(slug.trim());
}

export function storeOrderPath(orderNumber: string): string {
  return `/orders/${encodeURIComponent(orderNumber)}`;
}

export function adminOrderPath(orderId: string): string {
  return `/orders/${encodeURIComponent(orderId)}`;
}
