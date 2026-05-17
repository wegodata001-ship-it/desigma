import { UserRole } from "@prisma/client";
import { getSiteName } from "@/lib/store-config";
import { getCachedSession } from "@/lib/auth/cached-session";
import { prisma } from "@/lib/prisma";
import { getStoreId } from "@/lib/store-config";
import { StoreHeader } from "@/components/storefront/store-header";
import { safeQuery } from "@/lib/server/safe-query";
import { logServerComponentError } from "@/lib/runtime-log/server";
import { getRequestPath } from "@/lib/server/request-path";

export async function SiteHeader() {
  const title = getSiteName();
  let session = null;
  try {
    session = await getCachedSession();
  } catch (e) {
    let path = "unknown";
    try {
      path = await getRequestPath();
    } catch {
      path = "unknown";
    }
    logServerComponentError("SiteHeader.session", e, path);
  }

  const storeId = getStoreId();
  const categories = await safeQuery(
    "site_header.categories",
    () =>
      prisma.category.findMany({
        where: { storeId, active: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, parentId: true, name_he: true, name_ar: true, name_en: true },
      }),
    [],
    { timeoutMs: 12_000 },
  );

  const role = session?.role ?? null;
  const isLoggedIn = role === UserRole.CUSTOMER || role === UserRole.STORE_OWNER || role === UserRole.SUPER_ADMIN;

  return (
    <StoreHeader title={title} categories={categories} isLoggedIn={isLoggedIn} role={role} />
  );
}
