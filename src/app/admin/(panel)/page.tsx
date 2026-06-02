import { Suspense } from "react";
import { getStoreId } from "@/lib/store-config";
import { requireAdminSession } from "@/lib/admin-auth";
import { DashboardPageTitle } from "@/components/admin/dashboard-page-title";
import {
  DashboardChartSection,
  DashboardLowStockSection,
  DashboardRecentSection,
  DashboardStatsSection,
} from "@/components/admin/dashboard-sections";

export const dynamic = "force-dynamic";

function DashboardSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const storeId = getStoreId();

  return (
    <div className="space-y-8">
      <DashboardPageTitle />

      <Suspense fallback={<DashboardSkeleton className="h-28" />}>
        <DashboardStatsSection storeId={storeId} />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-3">
        <Suspense fallback={<DashboardSkeleton className="h-80 lg:col-span-2" />}>
          <DashboardChartSection storeId={storeId} />
        </Suspense>
        <Suspense fallback={<DashboardSkeleton className="h-80" />}>
          <DashboardLowStockSection storeId={storeId} />
        </Suspense>
      </div>

      <Suspense fallback={<DashboardSkeleton className="h-64" />}>
        <DashboardRecentSection storeId={storeId} />
      </Suspense>
    </div>
  );
}
