import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { STORE_ID } from "@/lib/store";
import { safeQuery } from "@/lib/server/safe-query";
import { ContactsAdminClient, type ContactLeadRow } from "@/components/admin/contacts-admin-client";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string; q?: string }>;
}) {
  await requireAdminSession();
  const storeId = STORE_ID;
  const sp = (await searchParams) ?? {};
  const filterRaw = (sp.filter ?? "all").toLowerCase();
  const filter = filterRaw === "unread" || filterRaw === "read" ? filterRaw : "all";
  const q = (sp.q ?? "").trim();

  const where: Prisma.ContactLeadWhereInput = { storeId };
  if (filter === "unread") where.isRead = false;
  if (filter === "read") where.isRead = true;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows: ContactLeadRow[] = await safeQuery(
    "admin.contacts",
    async () => {
      const leads = await prisma.contactLead.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
      return leads.map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        email: l.email,
        message: l.message,
        createdAt: l.createdAt.toISOString(),
        isRead: l.isRead,
      }));
    },
    [],
    { timeoutMs: 15_000 },
  );

  return <ContactsAdminClient rows={rows} filter={filter} q={q} />;
}
