import type { DeliveryType } from "@prisma/client";

export type DeliveryUiBehavior = "full_address" | "pickup_notice" | "pickup_point";

/** Maps DB delivery type → checkout UI behavior. */
export function deliveryUiBehavior(type: DeliveryType): DeliveryUiBehavior {
  switch (type) {
    case "PICKUP":
      return "pickup_notice";
    case "PICKUP_POINT":
      return "pickup_point";
    case "HOME":
    case "EXPRESS":
    case "SHIPPING":
    case "INTERNATIONAL":
    default:
      return "full_address";
  }
}

export function deliveryRequiresAddress(type: DeliveryType): boolean {
  return deliveryUiBehavior(type) === "full_address";
}

export type StructuredAddress = {
  city: string;
  street: string;
  houseNumber: string;
  apartment: string;
  postalCode: string;
};

export function formatStructuredAddress(a: StructuredAddress): string {
  const parts = [
    a.city.trim(),
    [a.street.trim(), a.houseNumber.trim()].filter(Boolean).join(" "),
    a.apartment.trim() ? `דירה ${a.apartment.trim()}` : "",
    a.postalCode.trim() ? `מיקוד ${a.postalCode.trim()}` : "",
  ].filter(Boolean);
  return parts.join(", ");
}

export type DeliveryOptionDto = {
  id: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  type: DeliveryType;
  price: number;
  eta_he: string | null;
  eta_ar: string | null;
  eta_en: string | null;
  sortOrder: number;
};

export function deliveryDisplayName(
  option: Pick<DeliveryOptionDto, "name_he" | "name_ar" | "name_en">,
  locale: "he" | "ar" | "en",
): string {
  if (locale === "ar") return option.name_ar;
  if (locale === "en") return option.name_en;
  return option.name_he;
}

export function deliveryEtaLabel(
  option: Pick<DeliveryOptionDto, "eta_he" | "eta_ar" | "eta_en">,
  locale: "he" | "ar" | "en",
): string | null {
  const raw = locale === "ar" ? option.eta_ar : locale === "en" ? option.eta_en : option.eta_he;
  const t = raw?.trim();
  return t && t.length > 0 ? t : null;
}

/** Default shipping methods for new stores / seed script. */
export const DEFAULT_SHIPPING_METHODS = [
  {
    name_he: "משלוח עד הבית",
    name_ar: "توصيل للمنزل",
    name_en: "Home delivery",
    type: "HOME" as const,
    eta_he: "3–7 ימי עסקים",
    eta_ar: "3–7 أيام عمل",
    eta_en: "3–7 business days",
    price: 29,
    sortOrder: 1,
  },
  {
    name_he: "משלוח מהיר",
    name_ar: "توصيل سريع",
    name_en: "Express delivery",
    type: "EXPRESS" as const,
    eta_he: "1–3 ימי עסקים",
    eta_ar: "1–3 أيام عمل",
    eta_en: "1–3 business days",
    price: 49,
    sortOrder: 2,
  },
  {
    name_he: "משלוח לנקודת איסוף",
    name_ar: "توصيل لنقطة استلام",
    name_en: "Pickup point delivery",
    type: "PICKUP_POINT" as const,
    eta_he: "2–5 ימי עסקים",
    eta_ar: "2–5 أيام عمل",
    eta_en: "2–5 business days",
    price: 19,
    sortOrder: 3,
  },
  {
    name_he: "איסוף עצמי",
    name_ar: "استلام ذاتي",
    name_en: "Self pickup",
    type: "PICKUP" as const,
    eta_he: "בתיאום מראש",
    eta_ar: "بموعد مسبق",
    eta_en: "By appointment",
    price: 0,
    sortOrder: 4,
  },
  {
    name_he: "משלוח בינלאומי",
    name_ar: "شحن دولي",
    name_en: "International shipping",
    type: "INTERNATIONAL" as const,
    eta_he: "7–21 ימי עסקים",
    eta_ar: "7–21 يوم عمل",
    eta_en: "7–21 business days",
    price: 99,
    sortOrder: 5,
  },
] as const;
