import "server-only";

import { getStoreUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { getEmailConfig } from "@/lib/email/config";
import { absoluteAssetUrl } from "@/lib/email/templates/layout";

export type StoreEmailBrand = {
  storeId: string;
  name: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  accentColor: string;
  /** Customer-facing storefront origin (NEXT_PUBLIC_STORE_URL). */
  storeUrl: string;
  /** @deprecated Use storeUrl */
  baseUrl: string;
  legalUrls: {
    terms: string;
    privacy: string;
    refunds: string;
    shipping: string;
    legal: string;
  };
};

export async function loadStoreEmailBrand(storeId: string): Promise<StoreEmailBrand> {
  const [store, settings] = await Promise.all([
    prisma.store.findUnique({ where: { id: storeId }, select: { name: true } }),
    prisma.storeSettings.findUnique({
      where: { storeId },
      select: {
        logoUrl: true,
        accentColor: true,
        whatsappPhone: true,
        supportEmail: true,
      },
    }),
  ]);

  const cfg = getEmailConfig();
  const storeUrl = getStoreUrl();
  const path = (p: string) => `${storeUrl}${p}`;

  return {
    storeId,
    name: store?.name?.trim() || cfg.fromName || "Store",
    logoUrl: absoluteAssetUrl(settings?.logoUrl),
    phone: settings?.whatsappPhone?.trim() || null,
    email: settings?.supportEmail?.trim() || cfg.contactReceiver || null,
    accentColor: settings?.accentColor?.trim() || "#f97316",
    storeUrl,
    baseUrl: storeUrl,
    legalUrls: {
      terms: path("/terms"),
      privacy: path("/privacy"),
      refunds: path("/refunds"),
      shipping: path("/shipping"),
      legal: path("/legal"),
    },
  };
}

export function resolveAdminOrderEmail(brand: StoreEmailBrand): string | null {
  const cfg = getEmailConfig();
  return cfg.adminOrderReceiver || brand.email || cfg.contactReceiver || null;
}
