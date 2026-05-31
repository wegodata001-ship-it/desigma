import { LegalHubClient, type LegalHubSection } from "@/components/storefront/legal-hub-client";
import type { PolicyTab } from "@/lib/legal-defaults";
import { loadAllLegalPagesFromDb } from "@/lib/server/store-loaders";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function LegalHubPage() {
  const all = await loadAllLegalPagesFromDb();

  const sections: LegalHubSection[] = (["terms", "privacy", "refund", "shipping"] as PolicyTab[]).map((tab) => ({
    tab,
    htmlByLang: all[tab].htmlByLang,
    publishedAt: all[tab].publishedAt?.toISOString() ?? null,
  }));

  const dates = sections
    .map((s) => s.publishedAt)
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d).getTime())
    .filter((n) => !Number.isNaN(n));

  const latestPublishedAt =
    dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;

  return (
    <LegalHubClient sections={sections} latestPublishedAt={latestPublishedAt} />
  );
}
