import "server-only";

import { prisma } from "@/lib/prisma";
import { perfQuery } from "@/lib/server/perf-query";

export type CategoryOpt = { id: string; label: string };

export async function loadAdminCategoryOptions(storeId: string): Promise<CategoryOpt[]> {
  return perfQuery("admin.products.categories", async () => {
    const categories = await prisma.category.findMany({
      where: { storeId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, parentId: true, name_he: true, sortOrder: true },
    });

    const byId = new Map(categories.map((c) => [c.id, c] as const));
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
        if (!c.parentId) return { id: c.id, label: c.name_he };
        const parent = byId.get(c.parentId);
        const parentName = parent?.name_he ?? "קטגוריה";
        return { id: c.id, label: `${parentName} > ${c.name_he}` };
      });
  });
}
