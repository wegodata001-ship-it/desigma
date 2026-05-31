import type { Locale } from "@/lib/localized";
import { DESIGMA_PRIVACY_HE_HTML } from "@/lib/legal/desigma-privacy-he";
import { DESIGMA_REFUND_HE_HTML } from "@/lib/legal/desigma-refund-he";
import { DESIGMA_SHIPPING_HE_HTML } from "@/lib/legal/desigma-shipping-he";
import { DESIGMA_TERMS_HE_HTML } from "@/lib/legal/desigma-terms-he";

export type PolicyTab = "terms" | "privacy" | "refund" | "shipping";

/** Admin-only defaults for “Restore defaults” — not shown on the public storefront. */
export const LEGAL_ADMIN_DEFAULTS: Record<PolicyTab, Record<Locale, string>> = {
  terms: {
    he: DESIGMA_TERMS_HE_HTML,
    ar: "",
    en: "",
  },
  privacy: {
    he: DESIGMA_PRIVACY_HE_HTML,
    ar: "",
    en: "",
  },
  refund: {
    he: DESIGMA_REFUND_HE_HTML,
    ar: "",
    en: "",
  },
  shipping: {
    he: DESIGMA_SHIPPING_HE_HTML,
    ar: "",
    en: "",
  },
};

/** @deprecated Use LEGAL_ADMIN_DEFAULTS — kept for imports during migration */
export const LEGAL_FALLBACK = LEGAL_ADMIN_DEFAULTS;

/** Flat DB payload for seed / restore-defaults */
export function defaultLegalFlat(): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const tab of ["terms", "privacy", "refund", "shipping"] as PolicyTab[]) {
    for (const lang of ["he", "ar", "en"] as Locale[]) {
      const key = `${tab}_${lang}` as const;
      out[key] = LEGAL_ADMIN_DEFAULTS[tab][lang] || null;
    }
  }
  return out;
}
