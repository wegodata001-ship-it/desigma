import "server-only";

import { prisma } from "@/lib/prisma";
import { perfQuery } from "@/lib/server/perf-query";

export type CategoryOpt = { id: string; label: string };

export async function loadAdminCategoryOptions(storeId: string): Promise<CategoryOpt[]> {
  return perfQuery("admin.products.categories", async () => {
    const categories = await prisma.category.findMany({
      where: { storeId, active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, parentId: true, name_he: true, name_en: true, sortOrder: true },
    });

    const byId = new Map(categories.map((c) => [c.id, c] as const));

    // If two actives share the same Hebrew path label, disambiguate with English name.
    const pathCounts = new Map<string, number>();
    for (const c of categories) {
      const parent = c.parentId ? byId.get(c.parentId) : null;
      const path = parent ? `${parent.name_he} > ${c.name_he}` : c.name_he;
      pathCounts.set(path, (pathCounts.get(path) ?? 0) + 1);
    }

    return categories
      .slice()
      .sort((a, b) => {
        const aParent = a.parentId ? byId.get(a.parentId) : a;
        const bParent = b.parentId ? byId.get(b.parentId) : b;
        const aKey = aParent?.sortOrder ?? a.sortOrder;
        const bKey = bParent?.sortOrder ?? b.sortOrder;
        if (aKey !== bKey) return aKey - bKey;
        if (!a.parentId && b.parentId) return -1;
        if (a.parentId && !b.parentId) return 1;
        return a.sortOrder - b.sortOrder;
      })
      .map((c) => {
        const parent = c.parentId ? byId.get(c.parentId) : null;
        const path = parent ? `${parent.name_he} > ${c.name_he}` : c.name_he;
        const needsDisambiguation = (pathCounts.get(path) ?? 0) > 1;
        const label = needsDisambiguation ? `${path} (${c.name_en})` : path;
        return { id: c.id, label };
      });
  });
}
