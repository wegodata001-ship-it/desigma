import { requireAdminSession } from "@/lib/admin-auth";
import { AdminAppShell } from "@/components/admin/admin-app-shell";
import { getCachedAdminShellData } from "@/lib/server/admin-shell-data";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  const { storeName, userName, logoPath, unreadContactCount } = await getCachedAdminShellData(session.userId);

  return (
    <AdminAppShell
      storeName={storeName}
      userName={userName}
      logoPath={logoPath}
      unreadContactCount={unreadContactCount}
    >
      {children}
    </AdminAppShell>
  );
}
