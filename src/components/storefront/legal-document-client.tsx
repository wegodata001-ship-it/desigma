"use client";

import { useEffect, useMemo } from "react";
import type { Locale } from "@/lib/localized";
import { prepareLegalHtml } from "@/lib/legal/toc";
import { resolveLegalContent } from "@/lib/legal/resolve-content";
import { useStoreI18n } from "@/components/storefront/store-i18n";

export type LegalPageDebug = {
  storeId: string;
  storeSlug: string;
  pageType: string;
  rowFound: boolean;
  htmlLength: Record<Locale, number>;
  source?: string;
};

function formatLegalDate(iso: string | null, lang: Locale): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const locale = lang === "en" ? "en-IL" : lang === "ar" ? "ar-IL" : "he-IL";
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export function LegalDocumentClient({
  titles,
  htmlByLang,
  publishedAt,
  debug,
}: {
  titles: Readonly<Record<Locale, string>>;
  htmlByLang: Record<Locale, string | null>;
  publishedAt: string | null;
  debug?: LegalPageDebug;
}) {
  const { lang, dir, t } = useStoreI18n();

  const resolved = useMemo(() => resolveLegalContent(htmlByLang, lang), [htmlByLang, lang]);
  const hasContent = resolved !== null;
  const contentLang = resolved?.resolvedLang ?? lang;
  const updatedLabel = formatLegalDate(publishedAt, contentLang);

  const prepared = useMemo(
    () => (resolved ? prepareLegalHtml(resolved.html) : { html: "", toc: [] }),
    [resolved],
  );

  useEffect(() => {
    const payload = {
      storeId: debug?.storeId,
      storeSlug: debug?.storeSlug,
      pageType: debug?.pageType,
      uiLang: lang,
      contentLang: resolved?.resolvedLang ?? null,
      htmlLength: debug?.htmlLength ?? {
        he: htmlByLang.he?.length ?? 0,
        en: htmlByLang.en?.length ?? 0,
        ar: htmlByLang.ar?.length ?? 0,
      },
      activeHtmlLength: resolved?.html.length ?? 0,
      rowFound: debug?.rowFound,
      hasContent,
    };

    if (!hasContent) {
      console.warn("[LegalDocumentClient] NO CONTENT — chain debug:", payload);
    } else {
      console.log("[LegalDocumentClient] content loaded:", payload);
    }
  }, [debug, lang, resolved, htmlByLang, hasContent]);

  const displayTitle = titles[contentLang] ?? titles.he;

  return (
    <section dir={dir} className="legal-page-shell border-t border-zinc-800/80 bg-zinc-950">
      <div className="legal-document scroll-smooth mx-auto w-full max-w-[1000px] px-4 py-12 md:px-8 md:py-16">
        <header className="legal-document__header">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">DESIGMA</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            {displayTitle}
          </h1>
          {updatedLabel ? (
            <p className="mt-4 text-sm text-zinc-400">
              {t("legalLastUpdated")}:{" "}
              <time dateTime={publishedAt ?? undefined} className="text-zinc-300">
                {updatedLabel}
              </time>
            </p>
          ) : null}
          <div className="legal-document__accent mt-8 h-1 w-16 rounded-full bg-orange-500" />
        </header>

        {!hasContent ? (
          <div
            className="legal-document__empty mt-10 rounded-2xl border border-amber-500/25 bg-amber-500/5 px-6 py-8 text-center"
            role="status"
          >
            <p className="text-base font-medium text-amber-100 md:text-lg">{t("legalNoContent")}</p>
            {process.env.NODE_ENV === "development" && debug ? (
              <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-4 text-start text-xs text-amber-200/80">
                {JSON.stringify(
                  {
                    reason: "htmlByLang empty for all locales (he/en/ar)",
                    storeId: debug.storeId,
                    storeSlug: debug.storeSlug,
                    pageType: debug.pageType,
                    rowFound: debug.rowFound,
                    htmlLength: debug.htmlLength,
                    uiLang: lang,
                  },
                  null,
                  2,
                )}
              </pre>
            ) : null}
          </div>
        ) : (
          <div className="legal-document__body mt-10 md:mt-12">
            {resolved && resolved.resolvedLang !== lang ? (
              <p className="mb-6 rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-400">
                {t("legalContentFallback")}
              </p>
            ) : null}

            {prepared.toc.length > 1 ? (
              <nav
                className="legal-toc mb-12 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-8"
                aria-label={t("legalTableOfContents")}
              >
                <h2 className="text-base font-bold text-orange-400 md:text-lg">{t("legalTableOfContents")}</h2>
                <ol className="legal-toc__list mt-5 grid gap-2 sm:grid-cols-2">
                  {prepared.toc.map((item, i) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="legal-toc__link group flex gap-2 text-sm md:text-base">
                        <span className="shrink-0 font-bold text-orange-500">{i + 1}.</span>
                        <span className="text-zinc-200 transition group-hover:text-white group-hover:underline">
                          {item.title.replace(/^\d+\.\s*/, "")}
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <article className="legal-prose" dangerouslySetInnerHTML={{ __html: prepared.html }} />
          </div>
        )}
      </div>
    </section>
  );
}
