import { UserRole } from "@prisma/client";
import { getSiteName } from "@/lib/store-config";
import { getCachedSession } from "@/lib/auth/cached-session";
import { StoreHeader } from "@/components/storefront/store-header";
import { logDbFailure } from "@/lib/server/db-log";
import { getNavigation, getStore } from "@/lib/server/store-loaders";
import { logServerComponentError } from "@/lib/runtime-log/server";
import { getRequestPath } from "@/lib/server/request-path";

export async function SiteHeader() {
  const ctx = await getStore();
  const title = getSiteName();
  let path = "unknown";

  try {
    path = await getRequestPath();
  } catch {
    path = "unknown";
  }

  let session = null;
  try {
    session = await getCachedSession();
  } catch (e) {
    logServerComponentError("SiteHeader.session", e, path);
  }

  let categories: Awaited<ReturnType<typeof getNavigation>> = [];
  try {
    categories = await getNavigation();
  } catch (e) {
    await logDbFailure("SiteHeader.getNavigation", e, { ...ctx, path });
    categories = [];
  }

  const role = session?.role ?? null;
  const isLoggedIn = role === UserRole.CUSTOMER || role === UserRole.STORE_OWNER || role === UserRole.SUPER_ADMIN;

  console.log("[SiteHeader]", {
    storeId: ctx.storeId,
    storeSlug: ctx.storeSlug,
    path,
    categoriesCount: categories?.length ?? 0,
    isLoggedIn,
  });

  return (
    <StoreHeader title={title} categories={categories ?? []} isLoggedIn={isLoggedIn} role={role} />
  );
}
