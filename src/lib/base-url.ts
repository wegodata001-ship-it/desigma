/**
 * Canonical storefront / admin origins (client + server safe).
 * Never use window.location.origin or request.url for emails — use these helpers only.
 */

import { stripTrailingSlash } from "@/lib/app-urls-shared";

export const PRODUCTION_PUBLIC_BASE_URL = "https://desigma-shop.com";
export const PRODUCTION_ADMIN_BASE_URL = "https://portal.desigma-shop.com";

const PRODUCTION_HOSTS = new Set([
  "desigma-shop.com",
  "www.desigma-shop.com",
  "portal.desigma-shop.com",
]);

export function isLocalhostUrl(url: string): boolean {
  try {
    const withProto =
      url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    const host = new URL(withProto).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

/** True in Vercel/production builds (client bundle included). */
export function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL === "1"
  );
}

function pickFirstValidOrigin(
  candidates: Array<{ value: string | undefined | null; source: string }>,
  productionDefault: string,
): { url: string; source: string } | null {
  const allowLocalhost = !isProductionRuntime();

  for (const c of candidates) {
    const raw = c.value?.trim();
    if (!raw) continue;
    if (!allowLocalhost && isLocalhostUrl(raw)) continue;
    return { url: stripTrailingSlash(raw), source: c.source };
  }

  if (!allowLocalhost) {
    return { url: productionDefault, source: "production_default" };
  }

  return null;
}

export type BaseUrlResolution = {
  publicBaseUrl: string;
  adminBaseUrl: string;
  sources: { public: string; admin: string };
  env: {
    NEXT_PUBLIC_STORE_URL: string | null;
    NEXT_PUBLIC_APP_URL: string | null;
    NEXT_PUBLIC_ADMIN_URL: string | null;
    ADMIN_APP_URL: string | null;
    APP_URL: string | null;
    VERCEL_URL: string | null;
  };
  warnings: string[];
};

export function resolveBaseUrls(): BaseUrlResolution {
  const warnings: string[] = [];
  const env = {
    NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL?.trim() || null,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL?.trim() || null,
    NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL?.trim() || null,
    ADMIN_APP_URL: process.env.ADMIN_APP_URL?.trim() || null,
    APP_URL: process.env.APP_URL?.trim() || null,
    VERCEL_URL: process.env.VERCEL_URL?.trim() || null,
  };

  if (isProductionRuntime()) {
    for (const [key, val] of Object.entries(env)) {
      if (val && isLocalhostUrl(val)) {
        warnings.push(`${key}=${val} ignored in production`);
      }
    }
  }

  const publicPick =
    pickFirstValidOrigin(
      [
        { value: env.NEXT_PUBLIC_STORE_URL, source: "NEXT_PUBLIC_STORE_URL" },
        { value: env.NEXT_PUBLIC_APP_URL, source: "NEXT_PUBLIC_APP_URL" },
        { value: env.APP_URL, source: "APP_URL" },
      ],
      PRODUCTION_PUBLIC_BASE_URL,
    ) ??
    (env.VERCEL_URL && !isProductionRuntime()
      ? { url: `https://${stripTrailingSlash(env.VERCEL_URL)}`, source: "VERCEL_URL" }
      : null) ??
    (isProductionRuntime()
      ? { url: PRODUCTION_PUBLIC_BASE_URL, source: "production_default" }
      : { url: "http://localhost:3000", source: "localhost_dev_fallback" });

  const adminPick =
    pickFirstValidOrigin(
      [
        { value: env.NEXT_PUBLIC_ADMIN_URL, source: "NEXT_PUBLIC_ADMIN_URL" },
        { value: env.ADMIN_APP_URL, source: "ADMIN_APP_URL" },
      ],
      PRODUCTION_ADMIN_BASE_URL,
    ) ??
    (isProductionRuntime()
      ? { url: PRODUCTION_ADMIN_BASE_URL, source: "production_default" }
      : { url: "http://localhost:3000", source: "localhost_dev_fallback" });

  if (isProductionRuntime() && publicPick.url === adminPick.url) {
    warnings.push("Public and admin base URLs are identical");
  }

  return {
    publicBaseUrl: publicPick.url,
    adminBaseUrl: adminPick.url,
    sources: { public: publicPick.source, admin: adminPick.source },
    env,
    warnings,
  };
}

/** Storefront origin — https://desigma-shop.com in production (never localhost). */
export function getPublicBaseUrl(): string {
  return resolveBaseUrls().publicBaseUrl;
}

/** Admin portal origin — https://portal.desigma-shop.com in production. */
export function getAdminBaseUrl(): string {
  return resolveBaseUrls().adminBaseUrl;
}

export function publicAbsolutePath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicBaseUrl()}${p}`;
}

export function adminAbsolutePath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getAdminBaseUrl()}${p}`;
}

/** Rewrite localhost/127.0.0.1 absolute links in CMS HTML (legal pages, emails). */
export function rewriteLocalhostUrlsInHtml(
  html: string,
  publicBase = getPublicBaseUrl(),
): string {
  const base = stripTrailingSlash(publicBase);
  return html
    .replace(/https?:\/\/localhost(?::\d+)?/gi, base)
    .replace(/https?:\/\/127\.0\.0\.1(?::\d+)?/gi, base);
}

/** When running in browser on production host, confirm we are not on localhost. */
export function isBrowserOnProductionStorefront(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return PRODUCTION_HOSTS.has(host) || host.endsWith(".desigma-shop.com");
}
