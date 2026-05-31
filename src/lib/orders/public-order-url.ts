import { getPublicBaseUrl } from "@/lib/base-url";
import { storeOrderPath } from "@/lib/app-urls-shared";

/** Public storefront path — no login required. */
export function publicOrderPath(orderNumber: string): string {
  return storeOrderPath(orderNumber);
}

export function publicOrderUrl(orderNumber: string): string {
  return `${getPublicBaseUrl()}${publicOrderPath(orderNumber)}`;
}
