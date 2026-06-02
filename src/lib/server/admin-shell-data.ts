import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { STORE_ID } from "@/lib/store";
import { perfQuery } from "@/lib/server/perf-query";
import { safeQuery } from "@/lib/server/safe-query";

export type AdminShellData = {
  storeName: string;
  userName: string;
  logoPath: string | null;
  unreadContactCount: number;
};

export const getCachedAdminShellData = cache(async (userId: string): Promise<AdminShellData> => {
  const storeId = STORE_ID;

  const [user, store, settings, unreadContactCount] = await safeQuery(
    "admin.shell",
    () =>
      Promise.all([
        perfQuery("admin.shell.user", () =>
          prisma.user.findFirst({ where: { id: userId, storeId }, select: { name: true } }),
        ),
        perfQuery("admin.shell.store", () =>
          prisma.store.findUnique({ where: { id: storeId }, select: { name: true } }),
        ),
        perfQuery("admin.shell.settings", () =>
          prisma.storeSettings.findUnique({ where: { storeId }, select: { logoUrl: true } }),
        ),
        perfQuery("admin.shell.contacts_unread", () =>
          prisma.contactLead.count({ where: { storeId, isRead: false } }),
        ),
      ]),
    [null, null, null, 0] as [null, null, null, number],
    { timeoutMs: 15_000, slowThresholdMs: 500 },
  );

  return {
    storeName: store?.name ?? "Store",
    userName: user?.name ?? "Owner",
    logoPath: settings?.logoUrl ?? null,
    unreadContactCount: unreadContactCount ?? 0,
  };
});
