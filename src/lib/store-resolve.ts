/**
 * Resolve storeId from request host + env.
 * DESIGMA production hosts always map to "desigma" — never "base".
 */

const DESIGMA_HOSTS = new Set([
  "desigma-shop.com",
  "www.desigma-shop.com",
  "portal.desigma-shop.com",
  "localhost",
  "127.0.0.1",
]);

export function normalizeHost(host: string | null | undefined): string | null {
  if (!host?.trim()) return null;
  return host.toLowerCase().split(":")[0];
}

export function isDesigmaProductionHost(host: string | null | undefined): boolean {
  const h = normalizeHost(host);
  if (!h) return false;
  if (DESIGMA_HOSTS.has(h)) return true;
  return h.endsWith(".desigma-shop.com");
}

/**
 * Effective store id for this deployment.
 * - desigma-shop.com / portal.desigma-shop.com → always "desigma"
 * - Never auto-select "base"
 */
export function resolveEffectiveStoreId(opts?: {
  host?: string | null;
  envStoreId?: string | null;
}): string {
  const host = normalizeHost(opts?.host);
  if (host && isDesigmaProductionHost(host)) {
    return "desigma";
  }

  const env = opts?.envStoreId?.trim() || process.env.NEXT_PUBLIC_STORE_ID?.trim() || "";
  if (!env || env === "base") {
    return "desigma";
  }
  return env;
}
