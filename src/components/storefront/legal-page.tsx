import { LegalDocumentClient } from "@/components/storefront/legal-document-client";
import type { PolicyTab } from "@/lib/legal-defaults";
import { legalHtmlLengths } from "@/lib/legal/resolve-content";
import { LEGAL_PAGES } from "@/lib/legal/page-meta";
import { logDbFailure } from "@/lib/server/db-log";
import { getStore, loadLegalPageFromDb } from "@/lib/server/store-loaders";
import { getRequestPath } from "@/lib/server/request-path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function LegalPage({ tab }: { tab: PolicyTab }) {
  const meta = LEGAL_PAGES[tab];
  const ctx = await getStore();
  let path = meta.path;

  let htmlByLang = { he: null as string | null, ar: null as string | null, en: null as string | null };
  let publishedAt: Date | null = null;
  let rowFound = false;
  let source: "database" | "admin_defaults" | "empty" = "empty";

  try {
    path = await getRequestPath();
  } catch {
    path = meta.path;
  }

  try {
    const loaded = await loadLegalPageFromDb(tab);
    htmlByLang = loaded.htmlByLang;
    publishedAt = loaded.publishedAt;
    rowFound = loaded.rowFound;
    source = loaded.source;
  } catch (err) {
    await logDbFailure(`LegalPage.${tab}`, err, {
      ...ctx,
      path,
      pageType: tab,
    });
    // loadLegalPageFromDb already falls back — this catch is a last-resort safety net.
  }

  const lengths = legalHtmlLengths(htmlByLang);

  console.log("[LegalPage render]", {
    storeId: ctx.storeId,
    storeSlug: ctx.storeSlug,
    pageType: tab,
    path: meta.path,
    rowFound,
    source,
    htmlLength: lengths,
    publishedAt: publishedAt?.toISOString() ?? null,
  });

  if (lengths.he + lengths.en + lengths.ar === 0) {
    console.warn("[LegalPage] rendering with NO html content", {
      storeId: ctx.storeId,
      pageType: tab,
      path,
      rowFound,
      source,
    });
  }

  return (
    <LegalDocumentClient
      titles={meta.titles}
      htmlByLang={htmlByLang}
      publishedAt={publishedAt?.toISOString() ?? null}
      debug={{
        storeId: ctx.storeId,
        storeSlug: ctx.storeSlug,
        pageType: tab,
        rowFound,
        htmlLength: lengths,
        source,
      }}
    />
  );
}
