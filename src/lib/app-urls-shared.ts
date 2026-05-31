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

/** True when request host is the admin portal (env or portal.* subdomain). */
export function isAdminPortalHostname(requestHost: string | null | undefined): boolean {
  if (!requestHost) return false;
  const configured = hostFromUrl(
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_ADMIN_URL : undefined,
  );
  if (configured && hostsMatch(requestHost, configured)) return true;
  const host = requestHost.toLowerCase().split(":")[0];
  return host === "portal.desigma-shop.com" || host.startsWith("portal.");
}

/** True when request host is the public storefront. */
export function isStorefrontHostname(
  requestHost: string | null | undefined,
  storeUrl?: string | null,
): boolean {
  if (!requestHost) return false;
  const configured =
    hostFromUrl(storeUrl ?? undefined) ??
    hostFromUrl(typeof process !== "undefined" ? process.env.NEXT_PUBLIC_STORE_URL : undefined);
  if (!configured) return false;
  return hostsMatch(requestHost, configured);
}

export function isAdminPortalPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname === "/login-admin" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/api") ||
    /^\/orders\/[^/]+$/.test(pathname)
  );
}

export function storeOrderPath(orderNumber: string): string {
  return `/orders/${encodeURIComponent(orderNumber)}`;
}

export function adminOrderPath(orderId: string): string {
  return `/orders/${encodeURIComponent(orderId)}`;
}
