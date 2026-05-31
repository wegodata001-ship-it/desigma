import "server-only";

import {
  adminOrderPath,
  hostFromUrl,
  hostsMatch,
  stripTrailingSlash,
  storeOrderPath,
} from "@/lib/app-urls-shared";

export {
  adminOrderPath,
  hostFromUrl,
  hostsMatch,
  isLikelyOrderId,
  storeOrderPath,
  stripTrailingSlash,
} from "@/lib/app-urls-shared";

function fallbackDevUrl(port = "3000"): string {
  return `http://localhost:${port}`;
}

/**
 * Public storefront origin (customer emails, legal links, order tracking).
 * NEXT_PUBLIC_STORE_URL → NEXT_PUBLIC_APP_URL → localhost
 */
export function getStoreUrl(): string {
  const store = process.env.NEXT_PUBLIC_STORE_URL?.trim();
  if (store) return stripTrailingSlash(store);

  const app = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (app) return stripTrailingSlash(app);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${stripTrailingSlash(vercel)}`;

  return fallbackDevUrl();
}

/**
 * Admin portal origin (owner emails, admin order links).
 * NEXT_PUBLIC_ADMIN_URL → NEXT_PUBLIC_APP_URL → localhost
 */
export function getAdminUrl(): string {
  const admin = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
  if (admin) return stripTrailingSlash(admin);

  const app = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (app) return stripTrailingSlash(app);

  return fallbackDevUrl();
}

/** @deprecated Prefer getStoreUrl() or getAdminUrl() */
export function getAppUrl(): string {
  return getStoreUrl();
}

export function getStoreHost(): string | null {
  return hostFromUrl(getStoreUrl());
}

export function getAdminHost(): string | null {
  return hostFromUrl(getAdminUrl());
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
  return `${getStoreUrl()}${storeOrderPath(orderNumber)}`;
}

export function adminOrderUrl(orderId: string): string {
  return `${getAdminUrl()}${adminOrderPath(orderId)}`;
}
