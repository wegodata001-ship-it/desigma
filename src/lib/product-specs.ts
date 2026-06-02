import type { Locale } from "@/lib/localized";

export type ProductSpecItem = {
  title: string;
  content: string;
};

export const EMPTY_PRODUCT_SPEC: ProductSpecItem = { title: "", content: "" };

export function parseProductSpecs(value: unknown): ProductSpecItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const o = row as Record<string, unknown>;
      return {
        title: String(o.title ?? "").trim(),
        content: String(o.content ?? "").trim(),
      };
    })
    .filter((x): x is ProductSpecItem => x !== null && (x.title.length > 0 || x.content.length > 0));
}

export function specsForForm(value: unknown): ProductSpecItem[] {
  const parsed = parseProductSpecs(value);
  return parsed.length > 0 ? parsed : [{ ...EMPTY_PRODUCT_SPEC }];
}

export function serializeProductSpecs(items: ProductSpecItem[]): string {
  return JSON.stringify(
    items
      .map((s) => ({
        title: s.title.trim(),
        content: s.content.trim(),
      }))
      .filter((s) => s.title || s.content),
  );
}

export function pickLocalizedSpecs(
  row: {
    specs_he?: unknown;
    specs_ar?: unknown;
    specs_en?: unknown;
  },
  locale: Locale,
): ProductSpecItem[] {
  const order: Locale[] =
    locale === "he" ? ["he", "en", "ar"] : locale === "ar" ? ["ar", "he", "en"] : ["en", "he", "ar"];
  for (const l of order) {
    const key = `specs_${l}` as keyof typeof row;
    const parsed = parseProductSpecs(row[key]);
    if (parsed.length > 0) return parsed;
  }
  return [];
}
