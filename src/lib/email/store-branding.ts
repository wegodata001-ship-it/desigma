import "server-only";

import { emailLegalUrls, emailPublicPath, getEmailPublicBaseUrl } from "@/lib/email/email-links";
import { prisma } from "@/lib/prisma";
import { getEmailConfig } from "@/lib/email/config";
import { absoluteAssetUrl } from "@/lib/email/templates/layout";
import { STORE_BUSINESS } from "@/lib/store-business";
import { SITE_NAME } from "@/lib/store";

export type StoreEmailBrand = {
  storeId: string;
  name: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  accentColor: string;
  /** Customer-facing storefront origin (getPublicBaseUrl). */
  storeUrl: string;
  /** @deprecated Use storeUrl */
  baseUrl: string;
  legalUrls: {
    terms: string;
    privacy: string;
    refunds: string;
    shipping: string;
    legal: string;
    contact: string;
    trackOrder: string;
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
  const storeUrl = getEmailPublicBaseUrl();
  const legal = emailLegalUrls();

  return {
    storeId,
    name: cfg.fromName || SITE_NAME || store?.name?.trim() || STORE_BUSINESS.name,
    logoUrl: absoluteAssetUrl(settings?.logoUrl),
    phone: settings?.whatsappPhone?.trim() || STORE_BUSINESS.phone,
    email: settings?.supportEmail?.trim() || STORE_BUSINESS.email || cfg.contactReceiver || null,
    accentColor: settings?.accentColor?.trim() || "#f97316",
    storeUrl,
    baseUrl: storeUrl,
    legalUrls: {
      terms: legal.terms,
      privacy: legal.privacy,
      refunds: legal.refunds,
      shipping: emailPublicPath("/shipping"),
      legal: emailPublicPath("/legal"),
      contact: legal.contact,
      trackOrder: legal.trackOrder,
    },
  };
}

export function resolveAdminOrderEmail(brand: StoreEmailBrand): string | null {
  const cfg = getEmailConfig();
  return cfg.adminOrderReceiver || brand.email || cfg.contactReceiver || null;
}
