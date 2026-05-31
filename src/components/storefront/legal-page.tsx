import { LegalDocumentClient } from "@/components/storefront/legal-document-client";
import type { PolicyTab } from "@/lib/legal-defaults";
import { legalHtmlLengths } from "@/lib/legal/resolve-content";
import { LEGAL_PAGES } from "@/lib/legal/page-meta";
import { loadLegalPageFromDb } from "@/lib/server/load-legal-page";
import { STORE_ID, STORE_SLUG } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function LegalPage({ tab }: { tab: PolicyTab }) {
  const meta = LEGAL_PAGES[tab];
  const { htmlByLang, publishedAt, rowFound } = await loadLegalPageFromDb(tab);
  const lengths = legalHtmlLengths(htmlByLang);

  console.log("[LegalPage render]", {
    storeId: STORE_ID,
    storeSlug: STORE_SLUG,
    pageType: tab,
    path: meta.path,
    rowFound,
    htmlLength: lengths,
    publishedAt: publishedAt?.toISOString() ?? null,
  });

  return (
    <LegalDocumentClient
      titles={meta.titles}
      htmlByLang={htmlByLang}
      publishedAt={publishedAt?.toISOString() ?? null}
      debug={{
        storeId: STORE_ID,
        storeSlug: STORE_SLUG,
        pageType: tab,
        rowFound,
        htmlLength: lengths,
      }}
    />
  );
}
