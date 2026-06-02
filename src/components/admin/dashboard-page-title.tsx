"use client";

import { useAdminI18n } from "@/lib/admin-i18n";

export function DashboardPageTitle() {
  const { t } = useAdminI18n();
  return <h1 className="text-xl font-semibold text-slate-900">{t("dashboard")}</h1>;
}
