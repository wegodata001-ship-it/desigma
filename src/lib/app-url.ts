import "server-only";

import {
  adminOrderPath,
  hostFromUrl,
  hostsMatch,
  storeOrderPath,
} from "@/lib/app-urls-shared";
import {
  getAdminBaseUrl,
  getPublicBaseUrl,
  PRODUCTION_ADMIN_BASE_URL,
  PRODUCTION_PUBLIC_BASE_URL,
  resolveBaseUrls,
  type BaseUrlResolution,
} from "@/lib/base-url";

export {
  adminOrderPath,
  hostFromUrl,
  hostsMatch,
  isLikelyOrderId,
  storeOrderPath,
  stripTrailingSlash,
} from "@/lib/app-urls-shared";

export {
  getAdminBaseUrl,
  getPublicBaseUrl,
  PRODUCTION_ADMIN_BASE_URL,
  PRODUCTION_PUBLIC_BASE_URL,
  publicAbsolutePath,
  adminAbsolutePath,
  rewriteLocalhostUrlsInHtml,
  resolveBaseUrls,
  type BaseUrlResolution,
} from "@/lib/base-url";

/** @deprecated Use PRODUCTION_PUBLIC_BASE_URL */
export const PRODUCTION_STORE_URL = PRODUCTION_PUBLIC_BASE_URL;
/** @deprecated Use PRODUCTION_ADMIN_BASE_URL */
export const PRODUCTION_ADMIN_URL = PRODUCTION_ADMIN_BASE_URL;

/** @deprecated Use resolveBaseUrls() */
export type AppUrlResolution = BaseUrlResolution & {
  storeUrl: string;
  adminUrl: string;
  sources: BaseUrlResolution["sources"] & { store: string };
};

export function resolveAppUrls(): AppUrlResolution {
  const r = resolveBaseUrls();
  return {
    ...r,
    storeUrl: r.publicBaseUrl,
    adminUrl: r.adminBaseUrl,
    sources: { ...r.sources, store: r.sources.public },
  };
}

/** @deprecated Prefer getPublicBaseUrl() */
export function getStoreUrl(): string {
  return getPublicBaseUrl();
}

/** @deprecated Prefer getAdminBaseUrl() */
export function getAdminUrl(): string {
  return getAdminBaseUrl();
}

/** @deprecated Prefer getPublicBaseUrl() */
export function getAppUrl(): string {
  return getPublicBaseUrl();
}

export function getStoreHost(): string | null {
  return hostFromUrl(getPublicBaseUrl());
}

export function getAdminHost(): string | null {
  return hostFromUrl(getAdminBaseUrl());
}

export function isAdminPortalHost(requestHost: string | null | undefined): boolean {
  const adminHost = getAdminHost();
  const storeHost = getStoreHost();
  if (!requestHost) return false;
  if (adminHost && hostsMatch(requestHost, adminHost)) return true;
  if (adminHost && storeHost && !hostsMatch(adminHost, storeHost)) return false;
  return false;
}

export function isStorefrontHost(requestHost: string | null | undefined): boolean {
  const storeHost = getStoreHost();
  if (!requestHost || !storeHost) return true;
  return hostsMatch(requestHost, storeHost);
}

export function storeOrderUrl(orderNumber: string): string {
  return `${getPublicBaseUrl()}${storeOrderPath(orderNumber)}`;
}

export function adminOrderUrl(orderId: string): string {
  return `${getAdminBaseUrl()}${adminOrderPath(orderId)}`;
}
