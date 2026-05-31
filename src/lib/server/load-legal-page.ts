import "server-only";

import type { Locale } from "@/lib/localized";
import type { PolicyTab } from "@/lib/legal-defaults";
import { legalHtmlLengths } from "@/lib/legal/resolve-content";
import { prisma } from "@/lib/prisma";
import { STORE_ID, STORE_SLUG } from "@/lib/store";

const SELECT_BY_TAB: Record<
  PolicyTab,
  {
    he: "terms_he" | "privacy_he" | "refund_he" | "shipping_he";
    ar: "terms_ar" | "privacy_ar" | "refund_ar" | "shipping_ar";
    en: "terms_en" | "privacy_en" | "refund_en" | "shipping_en";
    publishedAt:
      | "termsPublishedAt"
      | "privacyPublishedAt"
      | "refundPublishedAt"
      | "shippingPublishedAt";
  }
> = {
  terms: {
    he: "terms_he",
    ar: "terms_ar",
    en: "terms_en",
    publishedAt: "termsPublishedAt",
  },
  privacy: {
    he: "privacy_he",
    ar: "privacy_ar",
    en: "privacy_en",
    publishedAt: "privacyPublishedAt",
  },
  refund: {
    he: "refund_he",
    ar: "refund_ar",
    en: "refund_en",
    publishedAt: "refundPublishedAt",
  },
  shipping: {
    he: "shipping_he",
    ar: "shipping_ar",
    en: "shipping_en",
    publishedAt: "shippingPublishedAt",
  },
};

export type LegalPageData = {
  htmlByLang: Record<Locale, string | null>;
  publishedAt: Date | null;
  rowFound: boolean;
};

export async function loadLegalPageFromDb(tab: PolicyTab): Promise<LegalPageData> {
  const storeId = STORE_ID;
  const keys = SELECT_BY_TAB[tab];

  const row = await prisma.storeSettings.findUnique({
    where: { storeId },
    select: {
      storeId: true,
      [keys.he]: true,
      [keys.ar]: true,
      [keys.en]: true,
      [keys.publishedAt]: true,
    },
  });

  const pickHtml = (value: string | null | undefined): string | null => {
    if (value == null) return null;
    const t = value.trim();
    return t.length > 0 ? t : null;
  };

  const r = row as Record<string, string | Date | null | undefined> | null;

  const htmlByLang: Record<Locale, string | null> = {
    he: pickHtml(r?.[keys.he] as string | null | undefined),
    ar: pickHtml(r?.[keys.ar] as string | null | undefined),
    en: pickHtml(r?.[keys.en] as string | null | undefined),
  };

  const publishedAt = (r?.[keys.publishedAt] as Date | null | undefined) ?? null;
  const lengths = legalHtmlLengths(htmlByLang);

  console.log("[loadLegalPageFromDb]", {
    storeId,
    storeSlug: STORE_SLUG,
    pageType: tab,
    rowFound: Boolean(row),
    dbStoreId: row?.storeId ?? null,
    htmlLength: lengths,
    publishedAt: publishedAt?.toISOString() ?? null,
    hasAnyContent: lengths.he + lengths.en + lengths.ar > 0,
  });

  return {
    htmlByLang,
    publishedAt,
    rowFound: Boolean(row),
  };
}
