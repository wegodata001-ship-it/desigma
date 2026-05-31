import type { PolicyTab } from "@/lib/legal-defaults";
import { prepareLegalHtml, type LegalTocEntry, type LegalTocItem } from "@/lib/legal/toc";

export type { LegalTocEntry, LegalTocItem };

export type PreparedLegalBlock = {
  tab: string;
  documentId: string;
  title: string;
  html: string;
  toc: LegalTocItem[];
};

export type CombinedLegalInput = {
  tab: PolicyTab;
  title: string;
  html: string;
};

export const LEGAL_HUB_ORDER: PolicyTab[] = ["terms", "privacy", "refund", "shipping"];
export function buildCombinedLegalDocuments(sections: CombinedLegalInput[]): {
  toc: LegalTocEntry[];
  blocks: PreparedLegalBlock[];
  combinedHtml: string;
} {
  const toc: LegalTocEntry[] = [];
  const blocks: PreparedLegalBlock[] = [];

  for (const section of sections) {
    const documentId = `legal-${section.tab}`;
    toc.push({ id: documentId, title: section.title, level: "document" });

    const prepared = prepareLegalHtml(section.html, { idPrefix: `${section.tab}-` });
    for (const item of prepared.toc) {
      toc.push({ id: item.id, title: item.title, level: "section" });
    }

    blocks.push({
      tab: section.tab,
      documentId,
      title: section.title,
      html: prepared.html,
      toc: prepared.toc,
    });
  }

  const combinedHtml = blocks
    .map(
      (b) =>
        `<section id="${b.documentId}" class="legal-document-block" aria-labelledby="${b.documentId}-title">` +
        `<h1 id="${b.documentId}-title" class="legal-document-block__title">${b.title}</h1>` +
        `<div class="legal-document-block__body">${b.html}</div>` +
        `</section>`,
    )
    .join("\n");

  return { toc, blocks, combinedHtml };
}
