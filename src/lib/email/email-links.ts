import "server-only";

import { stripTrailingSlash } from "@/lib/app-urls-shared";
import {
  isLocalhostUrl,
  PRODUCTION_ADMIN_BASE_URL,
  PRODUCTION_PUBLIC_BASE_URL,
  rewriteLocalhostUrlsInHtml,
} from "@/lib/base-url";

export const EMAIL_STORE_NAME = "DESIGMA";

/** Storefront origin for all transactional emails — never localhost. */
export function getEmailPublicBaseUrl(): string {
  const override = process.env.EMAIL_PUBLIC_BASE_URL?.trim();
  if (override && !isLocalhostUrl(override)) {
    return stripTrailingSlash(override);
  }
  return PRODUCTION_PUBLIC_BASE_URL;
}

/** Admin portal origin for owner notification emails. */
export function getEmailAdminBaseUrl(): string {
  const override = process.env.EMAIL_ADMIN_BASE_URL?.trim();
  if (override && !isLocalhostUrl(override)) {
    return stripTrailingSlash(override);
  }
  return PRODUCTION_ADMIN_BASE_URL;
}

export function emailPublicPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getEmailPublicBaseUrl()}${p}`;
}

export function emailAdminPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getEmailAdminBaseUrl()}${p}`;
}

export function emailOrderViewUrl(orderNumber: string): string {
  return emailPublicPath(`/orders/${encodeURIComponent(orderNumber)}`);
}

export function emailTrackOrderUrl(orderNumber?: string): string {
  if (orderNumber?.trim()) {
    return emailPublicPath(`/track-order/${encodeURIComponent(orderNumber.trim())}`);
  }
  return emailPublicPath("/track-order");
}

export const emailLegalUrls = () => ({
  terms: emailPublicPath("/terms"),
  privacy: emailPublicPath("/privacy"),
  refunds: emailPublicPath("/refunds"),
  contact: emailPublicPath("/contact"),
  trackOrder: emailPublicPath("/track-order"),
});

/** Rewrite localhost and root-relative hrefs to production storefront URLs. */
export function sanitizeEmailHtml(html: string): string {
  const base = getEmailPublicBaseUrl();
  let out = rewriteLocalhostUrlsInHtml(html, base);
  out = out.replace(/href="(\/(?!\/)[^"]*)"/gi, (_match, path: string) => {
    if (path.startsWith("//")) return _match;
    return `href="${base}${path}"`;
  });
  return out;
}
