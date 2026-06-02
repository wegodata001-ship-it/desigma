import {
  DashboardChartPanel,
  DashboardLowStockPanel,
  DashboardRecentOrdersPanel,
  DashboardStatsCards,
  DashboardQuickActions,
} from "@/components/admin/dashboard-admin-client";
import {
  loadAdminDashboardChart,
  loadAdminDashboardLowStock,
  loadAdminDashboardRecent,
  loadAdminDashboardTotals,
} from "@/lib/admin/dashboard-data";
import { safeQuery } from "@/lib/server/safe-query";

const emptyTotals = {
  ordersCount: 0,
  revenuePaid: 0,
  customersCount: 0,
  productsCount: 0,
  membersCount: 0,
  monthlyGrowthPct: null as number | null,
};

export async function DashboardStatsSection({ storeId }: { storeId: string }) {
  const totals = await safeQuery(
    "admin.dashboard.stats",
    () => loadAdminDashboardTotals(storeId),
    emptyTotals,
    { timeoutMs: 8_000, slowThresholdMs: 500 },
  );
  return <DashboardStatsCards totals={totals} />;
}

export async function DashboardChartSection({ storeId }: { storeId: string }) {
  const chart = await safeQuery("admin.dashboard.chart", () => loadAdminDashboardChart(storeId), [], {
    timeoutMs: 8_000,
    slowThresholdMs: 500,
  });
  return <DashboardChartPanel chart={chart} />;
}

export async function DashboardLowStockSection({ storeId }: { storeId: string }) {
  const lowStock = await safeQuery(
    "admin.dashboard.low_stock_section",
    () => loadAdminDashboardLowStock(storeId),
    [],
    { timeoutMs: 6_000, slowThresholdMs: 500 },
  );
  return <DashboardLowStockPanel lowStock={lowStock} />;
}

export async function DashboardRecentSection({ storeId }: { storeId: string }) {
  const recent = await safeQuery(
    "admin.dashboard.recent_section",
    () => loadAdminDashboardRecent(storeId),
    [],
    { timeoutMs: 6_000, slowThresholdMs: 500 },
  );
  return (
    <div className="space-y-8">
      <DashboardRecentOrdersPanel recent={recent} />
      <DashboardQuickActions />
    </div>
  );
}
