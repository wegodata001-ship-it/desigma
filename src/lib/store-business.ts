/** Public business details — visible site-wide (footer, contact, emails). */
export const STORE_BUSINESS = {
  name: "CITYPEL",
  address: "עין מאהל, ישראל",
  phone: "050-390-9045",
  phoneTel: "+972503909045",
  email: "citypel2@gmail.com",
} as const;

export const STORE_LEGAL_LINKS = [
  { href: "/terms", labelKey: "termsOfUse" as const },
  { href: "/privacy", labelKey: "privacyPolicy" as const },
  { href: "/refunds", labelKey: "refundPolicy" as const },
  { href: "/shipping", labelKey: "shippingPolicy" as const },
] as const;

export const STORE_TEAM_LABEL = `${STORE_BUSINESS.name} Team` as const;
