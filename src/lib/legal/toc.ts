export type LegalTocItem = {
  id: string;
  title: string;
};

export type LegalTocEntry = LegalTocItem & {
  level: "document" | "section";
};

function slugifyHeading(text: string, index: number, prefix: string): string {
  const base = text
    .replace(/<[^>]+>/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .slice(0, 40);
  return base ? `${prefix}${base}` : `${prefix}section-${index + 1}`;
}

/** Inject stable ids on h2 elements and build table of contents. */
export function prepareLegalHtml(
  html: string,
  options?: { idPrefix?: string },
): { html: string; toc: LegalTocItem[] } {
  const prefix = options?.idPrefix ?? "";
  const toc: LegalTocItem[] = [];
  let index = 0;

  const withIds = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (full, attrs = "", inner) => {
    const title = inner.replace(/<[^>]+>/g, "").trim();
    if (!title) return full;

    const existingId = /id\s*=\s*["']([^"']+)["']/i.exec(attrs ?? "");
    const id = existingId?.[1] ?? slugifyHeading(title, index, prefix);
    index += 1;
    toc.push({ id, title });

    if (existingId) return full;
    return `<h2 id="${id}">${inner}</h2>`;
  });

  return { html: withIds, toc };
}
