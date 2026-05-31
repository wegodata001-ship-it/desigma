import "server-only";

import { headers } from "next/headers";
import { resolveEffectiveStoreId } from "@/lib/store-resolve";
import { STORE_SLUG, SITE_NAME } from "@/lib/store";

export type RequestStoreContext = {
  storeId: string;
  storeSlug: string;
  siteName: string;
};

/** Store id for the current request (host header + env). Never returns "base" on DESIGMA hosts. */
export async function getRequestStoreContext(): Promise<RequestStoreContext> {
  let host: string | null = null;
  let headerStoreId: string | null = null;
  try {
    const h = await headers();
    host = h.get("host");
    headerStoreId = h.get("x-store-id");
  } catch {
    // outside request (scripts)
  }

  const storeId =
    headerStoreId?.trim() && headerStoreId !== "base"
      ? headerStoreId.trim()
      : resolveEffectiveStoreId({ host });

  return {
    storeId,
    storeSlug: STORE_SLUG === "base" ? storeId : STORE_SLUG,
    siteName: SITE_NAME,
  };
}

export async function getRequestStoreId(): Promise<string> {
  const ctx = await getRequestStoreContext();
  return ctx.storeId;
}
