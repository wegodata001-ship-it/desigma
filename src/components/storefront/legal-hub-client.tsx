"use client";

import { useMemo } from "react";
import type { Locale } from "@/lib/localized";
import type { PolicyTab } from "@/lib/legal-defaults";
import { buildCombinedLegalDocuments, LEGAL_HUB_ORDER } from "@/lib/legal/combine-legal";
import { LEGAL_HUB, LEGAL_PAGES } from "@/lib/legal/page-meta";
import { resolveLegalContent } from "@/lib/legal/resolve-content";
import type { LegalTocEntry } from "@/lib/legal/toc";
import { useStoreI18n } from "@/components/storefront/store-i18n";
import { STORE_BUSINESS } from "@/lib/store-business";
import { SITE_NAME } from "@/lib/store";
import {
  BusinessContactRow,
  IconMail,
  IconPackage,
  IconPhone,
  IconTruck,
} from "@/components/storefront/business-icons";

export type LegalHubSection = {
  tab: PolicyTab;
  htmlByLang: Record<Locale, string | null>;
  publishedAt: string | null;
};

function formatLegalDate(iso: string | null, lang: Locale): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const locale = lang === "en" ? "en-IL" : lang === "ar" ? "ar-IL" : "he-IL";
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

function stripLeadingNumber(title: string): string {
  return title.replace(/^\d+\.\s*/, "");
}

export function LegalHubClient({
  sections,
  latestPublishedAt,
}: {
  sections: LegalHubSection[];
  latestPublishedAt: string | null;
}) {
  const { lang, dir, t } = useStoreI18n();
  const hubTitle = LEGAL_HUB.titles[lang] ?? LEGAL_HUB.titles.he;

  const { toc, combinedHtml, hasContent, contentLang } = useMemo(() => {
    const inputs = LEGAL_HUB_ORDER.map((tab) => {
      const data = sections.find((s) => s.tab === tab);
      const htmlByLang = data?.htmlByLang ?? { he: null, en: null, ar: null };
      const resolved = resolveLegalContent(htmlByLang, lang);
      const titles = LEGAL_PAGES[tab].titles;
      return {
        tab,
        title: titles[resolved?.resolvedLang ?? lang] ?? titles.he,
        html: resolved?.html ?? "",
      };
    }).filter((s) => s.html.length > 0);

    const resolvedLang = (() => {
      for (const tab of LEGAL_HUB_ORDER) {
        const data = sections.find((s) => s.tab === tab);
        if (!data) continue;
        const r = resolveLegalContent(data.htmlByLang, lang);
        if (r) return r.resolvedLang;
      }
      return lang;
    })();

    if (inputs.length === 0) {
      return { toc: [] as LegalTocEntry[], combinedHtml: "", hasContent: false, contentLang: resolvedLang };
    }

    const built = buildCombinedLegalDocuments(inputs);
    return {
      toc: built.toc,
      combinedHtml: built.combinedHtml,
      hasContent: true,
      contentLang: resolvedLang,
    };
  }, [sections, lang]);

  const updatedLabel = formatLegalDate(latestPublishedAt, contentLang);

  const numberedToc = useMemo(() => {
    let docNum = 0;
    let secNum = 0;
    return toc.map((item) => {
      if (item.level === "document") {
        docNum += 1;
        secNum = 0;
        return { ...item, label: `${docNum}.`, isDocument: true as const };
      }
      secNum += 1;
      return { ...item, label: `${docNum}.${secNum}`, isDocument: false as const };
    });
  }, [toc]);

  return (
    <section dir={dir} className="legal-page-shell legal-hub-shell border-t border-zinc-800/80 bg-zinc-950">
      <div className="legal-hub scroll-smooth mx-auto w-full max-w-[1100px] px-4 py-12 md:px-8 md:py-16">
        {/* Merchant header — required for payment gateway review */}
        <header className="legal-hub__merchant rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-3xl font-black tracking-tight text-white md:text-4xl">{SITE_NAME}</p>
              <p className="mt-2 text-sm text-zinc-400">{t("legalHubSubtitle")}</p>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2 md:text-base">
              <BusinessContactRow icon={<IconPhone />} href={`tel:${STORE_BUSINESS.phoneTel}`}>
                {STORE_BUSINESS.phone}
              </BusinessContactRow>
              <BusinessContactRow icon={<IconMail />} href={`mailto:${STORE_BUSINESS.email}`}>
                {STORE_BUSINESS.email}
              </BusinessContactRow>
              <div className="sm:col-span-2">
                <BusinessContactRow icon={<IconTruck />}>{t("legalHubShipping")}</BusinessContactRow>
              </div>
              <div className="sm:col-span-2">
                <BusinessContactRow icon={<IconPackage />}>{t("legalHubPickup")}</BusinessContactRow>
              </div>
            </div>
          </div>
        </header>

        <header className="legal-hub__title mt-10 md:mt-12">
          <h1 className="text-2xl font-bold leading-tight text-white md:text-4xl">{hubTitle}</h1>
          {updatedLabel ? (
            <p className="mt-3 text-sm text-zinc-400">
              {t("legalLastUpdated")}:{" "}
              <time dateTime={latestPublishedAt ?? undefined} className="text-zinc-300">
                {updatedLabel}
              </time>
            </p>
          ) : null}
          <div className="legal-document__accent mt-6 h-1 w-20 rounded-full bg-orange-500" />
        </header>

        {!hasContent ? (
          <div
            className="legal-document__empty mt-10 rounded-2xl border border-amber-500/25 bg-amber-500/5 px-6 py-8 text-center"
            role="status"
          >
            <p className="text-base font-medium text-amber-100 md:text-lg">{t("legalNoContent")}</p>
          </div>
        ) : (
          <div className="legal-hub__body mt-10 md:mt-12">
            <nav
              className="legal-toc legal-hub__toc mb-12 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-8"
              aria-label={t("legalTableOfContents")}
            >
              <h2 className="text-lg font-bold text-orange-400 md:text-xl">{t("legalTableOfContents")}</h2>
              <ol className="legal-toc__list legal-hub__toc-list mt-6 space-y-2">
                {numberedToc.map((item) =>
                  item.isDocument ? (
                    <li key={item.id} className="legal-hub__toc-doc pt-2 first:pt-0">
                      <a
                        href={`#${item.id}`}
                        className="legal-toc__link group flex gap-3 text-base font-semibold md:text-lg"
                      >
                        <span className="shrink-0 font-bold text-orange-500">{item.label}</span>
                        <span className="text-white transition group-hover:text-orange-300 group-hover:underline">
                          {item.title}
                        </span>
                      </a>
                    </li>
                  ) : (
                    <li key={item.id} className="legal-hub__toc-section ms-6 md:ms-8">
                      <a
                        href={`#${item.id}`}
                        className="legal-toc__link group flex gap-2 text-sm text-zinc-300 md:text-base"
                      >
                        <span className="shrink-0 text-orange-500/80">{item.label}</span>
                        <span className="transition group-hover:text-white group-hover:underline">
                          {stripLeadingNumber(item.title)}
                        </span>
                      </a>
                    </li>
                  ),
                )}
              </ol>
            </nav>

            <article className="legal-prose legal-hub__content" dangerouslySetInnerHTML={{ __html: combinedHtml }} />
          </div>
        )}
      </div>
    </section>
  );
}
