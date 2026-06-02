"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useAdminI18n } from "@/lib/admin-i18n";

const DashboardChartLazy = dynamic(
  () => import("@/components/admin/dashboard-chart").then((m) => m.DashboardChart),
  {
    ssr: false,
    loading: () => <div className="mt-4 h-64 animate-pulse rounded-xl bg-slate-100" />,
  },
);

export type DashboardTotals = {
  ordersCount: number;
  revenuePaid: number;
  customersCount: number;
  productsCount: number;
  membersCount: number;
  monthlyGrowthPct: number | null;
};

export function DashboardStatsCards({ totals }: { totals: DashboardTotals }) {
  const { t } = useAdminI18n();
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {[
        [t("orders"), totals.ordersCount],
        [t("total"), `₪${totals.revenuePaid.toFixed(2)}`],
        [t("customer"), totals.customersCount],
        [t("products"), totals.productsCount],
        ["Membership Members", totals.membersCount],
        [
          "Monthly Growth",
          totals.monthlyGrowthPct == null
            ? "—"
            : `${totals.monthlyGrowthPct > 0 ? "+" : ""}${totals.monthlyGrowthPct}%`,
        ],
      ].map(([label, val]) => (
        <div
          key={String(label)}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
          <dd className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{val}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DashboardChartPanel({
  chart,
}: {
  chart: { date: string; revenue: number; orders: number }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">Sales (last 14 days)</h2>
        <p className="mt-0.5 text-xs text-slate-500">Revenue and order volume.</p>
      </div>
      <DashboardChartLazy chart={chart} />
    </div>
  );
}

export function DashboardLowStockPanel({
  lowStock,
}: {
  lowStock: { id: string; name_he: string; name_ar: string; name_en: string; stock: number; sku: string }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800">Low Stock</h2>
      <p className="mt-0.5 text-xs text-slate-500">Products under threshold.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-right text-xs uppercase text-slate-500">
              <th className="py-2">SKU</th>
              <th className="py-2">Product</th>
              <th className="py-2">Stock</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="py-2 font-mono text-xs text-slate-600">{p.sku}</td>
                <td className="py-2 text-slate-800">{p.name_he}</td>
                <td className="py-2 font-semibold tabular-nums text-amber-700">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {lowStock.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">All good.</p> : null}
      </div>
    </div>
  );
}

export function DashboardRecentOrdersPanel({
  recent,
}: {
  recent: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }[];
}) {
  const { t } = useAdminI18n();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800">{t("orders")}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-right text-xs uppercase text-slate-500">
              <th className="py-2">{t("order")}</th>
              <th className="py-2">{t("customer")}</th>
              <th className="py-2">{t("total")}</th>
              <th className="py-2">{t("status")}</th>
              <th className="py-2">{t("payment")}</th>
              <th className="py-2">{t("date")}</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                <td className="py-2 font-mono font-medium">{o.orderNumber}</td>
                <td className="py-2">{o.customerName}</td>
                <td className="py-2 tabular-nums">₪{o.total.toFixed(2)}</td>
                <td className="py-2">{o.status}</td>
                <td className="py-2">{o.paymentStatus}</td>
                <td className="py-2 whitespace-nowrap text-xs">
                  {new Date(o.createdAt).toLocaleString("he-IL")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recent.length === 0 && <p className="py-8 text-center text-sm text-slate-500">{t("noOrders")}</p>}
      </div>
    </div>
  );
}

export function DashboardQuickActions() {
  const { t } = useAdminI18n();
  const quick = {
    addProductHref: "/admin/products?add=1",
    addCategoryHref: "/admin/categories",
    addBannerHref: "/admin/banners",
  };
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-800">{t("quickActions")}</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          href={quick.addProductHref}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {t("addProduct")}
        </Link>
        <Link
          href={quick.addCategoryHref}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          {t("addMainCategory")}
        </Link>
        <Link
          href={quick.addBannerHref}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          {t("addBanner")}
        </Link>
      </div>
    </div>
  );
}

/** @deprecated Use streamed dashboard sections — kept for compatibility. */
export function AdminDashboardClient(props: {
  totals: DashboardTotals;
  chart: { date: string; revenue: number; orders: number }[];
  lowStock: { id: string; name_he: string; name_ar: string; name_en: string; stock: number; sku: string }[];
  recent: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }[];
  quick: { addProductHref: string; addCategoryHref: string; addBannerHref: string };
}) {
  const { t } = useAdminI18n();
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-900">{t("dashboard")}</h1>
      <DashboardStatsCards totals={props.totals} />
      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardChartPanel chart={props.chart} />
        <DashboardLowStockPanel lowStock={props.lowStock} />
      </div>
      <DashboardRecentOrdersPanel recent={props.recent} />
      <DashboardQuickActions />
    </div>
  );
}
