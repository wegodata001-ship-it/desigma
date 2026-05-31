import type { Locale } from "@/lib/localized";

const FALLBACK_ORDER: Locale[] = ["he", "en", "ar"];

/** Pick legal HTML: preferred locale first, then he → en → ar. */
export function resolveLegalContent(
  htmlByLang: Record<Locale, string | null>,
  preferred: Locale,
): { html: string; resolvedLang: Locale } | null {
  const tried = new Set<Locale>();
  const order: Locale[] = [preferred, ...FALLBACK_ORDER.filter((l) => l !== preferred)];

  for (const locale of order) {
    if (tried.has(locale)) continue;
    tried.add(locale);
    const raw = htmlByLang[locale]?.trim();
    if (raw && raw.length > 0) {
      return { html: raw, resolvedLang: locale };
    }
  }
  return null;
}

export function legalHtmlLengths(htmlByLang: Record<Locale, string | null>): Record<Locale, number> {
  return {
    he: htmlByLang.he?.trim().length ?? 0,
    en: htmlByLang.en?.trim().length ?? 0,
    ar: htmlByLang.ar?.trim().length ?? 0,
  };
}
