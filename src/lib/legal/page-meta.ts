import type { Locale } from "@/lib/localized";
import type { PolicyTab } from "@/lib/legal-defaults";

export type LegalPageMeta = {
  tab: PolicyTab;
  titles: Record<Locale, string>;
  path: string;
};

export const LEGAL_PAGES: Record<PolicyTab, LegalPageMeta> = {
  terms: {
    tab: "terms",
    path: "/terms",
    titles: {
      he: "תקנון אתר DESIGMA",
      ar: "شروط الاستخدام",
      en: "Terms of Use",
    },
  },
  privacy: {
    tab: "privacy",
    path: "/privacy",
    titles: {
      he: "מדיניות פרטיות",
      ar: "سياسة الخصوصية",
      en: "Privacy Policy",
    },
  },
  refund: {
    tab: "refund",
    path: "/refunds",
    titles: {
      he: "מדיניות ביטולים והחזרים",
      ar: "سياسة الإلغاء والاسترداد",
      en: "Cancellation & Refund Policy",
    },
  },
  shipping: {
    tab: "shipping",
    path: "/shipping",
    titles: {
      he: "מדיניות משלוחים",
      ar: "سياسة الشحن",
      en: "Shipping Policy",
    },
  },
};
