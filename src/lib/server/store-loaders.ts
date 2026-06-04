import "server-only";

import { prisma } from "@/lib/prisma";
import type { PolicyTab } from "@/lib/legal-defaults";
import { LEGAL_ADMIN_DEFAULTS } from "@/lib/legal-defaults";
import type { Locale } from "@/lib/localized";
import { legalHtmlLengths } from "@/lib/legal/resolve-content";
import { logDbFailure, logLoaderOk } from "@/lib/server/db-log";
import { getRequestPath } from "@/lib/server/request-path";
import { safeQuery } from "@/lib/server/safe-query";
import { SITE_NAME, STORE_ID, STORE_SLUG } from "@/lib/store";
import { getRequestStoreContext } from "@/lib/store-request";

export type StoreContext = {
  storeId: string;
  storeSlug: string;
  siteName: string;
};

export type StoreSettingsPublic = {
  supportEmail: string | null;
  whatsappPhone: string | null;
  registrationEnabled: boolean;
} | null;

export type CategoryNavItem = {
  id: string;
  parentId: string | null;
  name_he: string;
  name_ar: string;
  name_en: string;
  imageUrl: string | null;
};

export type FooterData = {
  legalLinks: { href: string; labelKey: string }[];
  supportEmail: string;
  phone: string;
};

const FOOTER_LINKS: FooterData["legalLinks"] = [
  { href: "/track-order", labelKey: "orderTracking" },
  { href: "/legal", labelKey: "legalHubLink" },
  { href: "/terms", labelKey: "termsOfUse" },
  { href: "/privacy", labelKey: "privacyPolicy" },
  { href: "/refunds", labelKey: "refundPolicy" },
  { href: "/shipping", labelKey: "shippingPolicy" },
];

/** Store identity for current request — never uses storeId "base" on DESIGMA hosts. */
export async function getStore(): Promise<StoreContext> {
  const ctx = await getRequestStoreContext();
  console.log("STORE", ctx.storeId);
  console.log("STORE SLUG", ctx.storeSlug);
  return ctx;
}

/** Sync fallback (build-time env only). Prefer `getStore()` in server components. */
export function getStoreSync(): StoreContext {
  return {
    storeId: STORE_ID,
    storeSlug: STORE_SLUG,
    siteName: SITE_NAME,
  };
}

/** @deprecated alias */
export const getStoreContext = getStore;

export async function getStoreSettings(): Promise<StoreSettingsPublic> {
  const ctx = await getStore();
  let path = "unknown";
  try {
    path = await getRequestPath();
  } catch {
    // ignore
  }

  const { perfTimed } = await import("@/lib/server/perf-log");
  const row = await perfTimed(
    "layout.storeSettings",
    () =>
      safeQuery(
        "getStoreSettings",
        () =>
          prisma.storeSettings.findUnique({
            where: { storeId: ctx.storeId },
            select: {
              supportEmail: true,
              whatsappPhone: true,
              registrationEnabled: true,
            },
          }),
        null,
        { timeoutMs: 12_000 },
      ),
    { storeId: ctx.storeId },
  );

  logLoaderOk("getStoreSettings", {
    ...ctx,
    path,
    found: Boolean(row),
  });

  return row;
}

export async function getCategories(selectImage = false): Promise<CategoryNavItem[]> {
  const ctx = await getStore();
  let path = "unknown";
  try {
    path = await getRequestPath();
  } catch {
    // ignore
  }

  const { perfTimed } = await import("@/lib/server/perf-log");
  const categories = await perfTimed(
    "layout.categories",
    () =>
      safeQuery(
        "getCategories",
        () =>
          prisma.category.findMany({
            where: { storeId: ctx.storeId, active: true },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              parentId: true,
              name_he: true,
              name_ar: true,
              name_en: true,
              ...(selectImage ? { imageUrl: true } : {}),
            },
          }),
        [] as CategoryNavItem[],
        { timeoutMs: 12_000 },
      ),
    { storeId: ctx.storeId },
  );

  logLoaderOk("getCategories", {
    ...ctx,
    path,
    count: categories.length,
  });

  return categories;
}

/** Navigation categories for header — alias with logging. */
export async function getNavigation(): Promise<CategoryNavItem[]> {
  return getCategories(false);
}

/** Footer is static links + optional settings contact — no DB required for links. */
export async function getFooterData(): Promise<FooterData> {
  const ctx = await getStore();
  const settings = await getStoreSettings();

  logLoaderOk("getFooterData", { ...ctx, hasSettings: Boolean(settings) });

  return {
    legalLinks: FOOTER_LINKS,
    supportEmail: settings?.supportEmail?.trim() || "m.desigma@gmail.com",
    phone: settings?.whatsappPhone?.trim() || "054-2298822",
  };
}

/** Storefront translations are client-side (store-i18n); this logs locale resolution only. */
export function getTranslationsHint(): { source: "client-store-i18n"; defaultLocale: Locale } {
  logLoaderOk("getTranslations", { source: "client-store-i18n", defaultLocale: "he" });
  return { source: "client-store-i18n", defaultLocale: "he" };
}

export type LegalPageLoadResult = {
  htmlByLang: Record<Locale, string | null>;
  publishedAt: Date | null;
  rowFound: boolean;
  source: "database" | "admin_defaults" | "empty";
};

function adminDefaultsForTab(tab: PolicyTab): Record<Locale, string | null> {
  const d = LEGAL_ADMIN_DEFAULTS[tab];
  return {
    he: d.he?.trim() || null,
    en: d.en?.trim() || null,
    ar: d.ar?.trim() || null,
  };
}

function mergeWithDefaults(
  tab: PolicyTab,
  htmlByLang: Record<Locale, string | null>,
): { htmlByLang: Record<Locale, string | null>; source: LegalPageLoadResult["source"] } {
  const defaults = adminDefaultsForTab(tab);
  const merged: Record<Locale, string | null> = {
    he: htmlByLang.he ?? defaults.he,
    en: htmlByLang.en ?? defaults.en,
    ar: htmlByLang.ar ?? defaults.ar,
  };
  const hasDb = Object.values(htmlByLang).some((v) => v && v.length > 0);
  const hasAny = Object.values(merged).some((v) => v && v.length > 0);
  if (!hasAny) return { htmlByLang: merged, source: "empty" };
  if (!hasDb && hasAny) return { htmlByLang: merged, source: "admin_defaults" };
  return { htmlByLang: merged, source: "database" };
}

const LEGAL_SELECT: Record<
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
  terms: { he: "terms_he", ar: "terms_ar", en: "terms_en", publishedAt: "termsPublishedAt" },
  privacy: { he: "privacy_he", ar: "privacy_ar", en: "privacy_en", publishedAt: "privacyPublishedAt" },
  refund: { he: "refund_he", ar: "refund_ar", en: "refund_en", publishedAt: "refundPublishedAt" },
  shipping: { he: "shipping_he", ar: "shipping_ar", en: "shipping_en", publishedAt: "shippingPublishedAt" },
};

export async function loadLegalPageFromDb(tab: PolicyTab): Promise<LegalPageLoadResult> {
  const ctx = await getStore();
  let path = "unknown";
  try {
    path = await getRequestPath();
  } catch {
    // ignore
  }

  const keys = LEGAL_SELECT[tab];
  const empty: LegalPageLoadResult = {
    htmlByLang: adminDefaultsForTab(tab),
    publishedAt: null,
    rowFound: false,
    source: "admin_defaults",
  };

  try {
    const row = await safeQuery(
      `loadLegalPageFromDb.${tab}`,
      () =>
        prisma.storeSettings.findUnique({
          where: { storeId: ctx.storeId },
          select: {
            storeId: true,
            [keys.he]: true,
            [keys.ar]: true,
            [keys.en]: true,
            [keys.publishedAt]: true,
          },
        }),
      null,
      { timeoutMs: 15_000 },
    );

    const pickHtml = (value: string | null | undefined): string | null => {
      if (value == null) return null;
      const t = value.trim();
      return t.length > 0 ? t : null;
    };

    const r = row as Record<string, string | Date | null | undefined> | null;

    const fromDb: Record<Locale, string | null> = row
      ? {
          he: pickHtml(r![keys.he] as string | null | undefined),
          ar: pickHtml(r![keys.ar] as string | null | undefined),
          en: pickHtml(r![keys.en] as string | null | undefined),
        }
      : { he: null, en: null, ar: null };

    const { htmlByLang, source } = mergeWithDefaults(tab, fromDb);
    const lengths = legalHtmlLengths(htmlByLang);
    const publishedAt = (r?.[keys.publishedAt] as Date | null | undefined) ?? null;

    logLoaderOk("loadLegalPageFromDb", {
      ...ctx,
      path,
      pageType: tab,
      rowFound: Boolean(row),
      dbStoreId: (row as { storeId?: string } | null)?.storeId ?? null,
      htmlLength: lengths,
      publishedAt: publishedAt?.toISOString() ?? null,
      source,
      hasAnyContent: lengths.he + lengths.en + lengths.ar > 0,
    });

    if (lengths.he + lengths.en + lengths.ar === 0) {
      console.warn("[loadLegalPageFromDb] NO CONTENT after merge", {
        storeId: ctx.storeId,
        pageType: tab,
        path,
        rowFound: Boolean(row),
      });
    }

    return {
      htmlByLang,
      publishedAt,
      rowFound: Boolean(row),
      source,
    };
  } catch (err) {
    await logDbFailure(`loadLegalPageFromDb.${tab}`, err, {
      ...ctx,
      path,
      pageType: tab,
    });
    return empty;
  }
}

export type AllLegalPagesData = Record<
  PolicyTab,
  {
    htmlByLang: Record<Locale, string | null>;
    publishedAt: Date | null;
  }
>;

/** Load all four policy documents in parallel — never throws. */
export async function loadAllLegalPagesFromDb(): Promise<AllLegalPagesData> {
  const tabs: PolicyTab[] = ["terms", "privacy", "refund", "shipping"];
  const results = await Promise.allSettled(tabs.map((tab) => loadLegalPageFromDb(tab)));

  const out = {} as AllLegalPagesData;
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const r = results[i];
    if (r.status === "fulfilled") {
      out[tab] = {
        htmlByLang: r.value.htmlByLang,
        publishedAt: r.value.publishedAt,
      };
    } else {
      await logDbFailure(`loadAllLegalPagesFromDb.${tab}`, r.reason, { pageType: tab });
      out[tab] = {
        htmlByLang: adminDefaultsForTab(tab),
        publishedAt: null,
      };
    }
  }

  logLoaderOk("loadAllLegalPagesFromDb", {
    ...(await getStore()),
    tabs: tabs.length,
  });

  return out;
}
