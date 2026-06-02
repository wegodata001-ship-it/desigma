import "server-only";

import type { OrderPaymentStatus, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { perfQuery } from "@/lib/server/perf-query";

export type AdminDashboardPayload = {
  totals: {
    ordersCount: number;
    revenuePaid: number;
    customersCount: number;
    productsCount: number;
    membersCount: number;
    monthlyGrowthPct: number | null;
  };
  chart: { date: string; revenue: number; orders: number }[];
  lowStock: { id: string; name_he: string; name_ar: string; name_en: string; stock: number; sku: string }[];
  recent: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: OrderStatus;
    paymentStatus: OrderPaymentStatus;
    createdAt: string;
  }[];
};

type ChartRow = { day: Date; revenue: unknown; orders: bigint };

async function loadChartBuckets(storeId: string, start14: Date) {
  const rows = await perfQuery("admin.dashboard.chart_sql", () =>
    prisma.$queryRaw<ChartRow[]>`
      SELECT DATE("createdAt") AS day,
             COALESCE(SUM(total), 0) AS revenue,
             COUNT(*)::bigint AS orders
      FROM "Order"
      WHERE "storeId" = ${storeId}
        AND "paymentStatus" = 'PAID'::"OrderPaymentStatus"
        AND "createdAt" >= ${start14}
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `,
  );

  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const buckets = new Map<string, { date: string; revenue: number; orders: number }>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(start14);
    d.setDate(d.getDate() + i);
    const k = dayKey(d);
    buckets.set(k, { date: k, revenue: 0, orders: 0 });
  }
  for (const row of rows) {
    const k = dayKey(new Date(row.day));
    const b = buckets.get(k);
    if (!b) continue;
    b.revenue = Math.round(Number(row.revenue) * 100) / 100;
    b.orders = Number(row.orders);
  }
  return Array.from(buckets.values());
}

export async function loadAdminDashboardTotals(storeId: string) {
  const now = new Date();
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    ordersCount,
    revenueAgg,
    customersCount,
    productsCount,
    membersCount,
    revenueThisMonth,
    revenuePrevMonth,
  ] = await Promise.all([
    perfQuery("admin.dashboard.orders_count", () => prisma.order.count({ where: { storeId } })),
    perfQuery("admin.dashboard.revenue_sum", () =>
      prisma.order.aggregate({
        where: { storeId, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
    ),
    perfQuery("admin.dashboard.customers_count", () =>
      prisma.customerProfile.count({ where: { storeId } }),
    ),
    perfQuery("admin.dashboard.products_count", () => prisma.product.count({ where: { storeId } })),
    perfQuery("admin.dashboard.members_count", () =>
      prisma.customerMembership.count({
        where: {
          plan: { storeId },
          active: true,
          OR: [{ endDate: null }, { endDate: { gt: now } }],
        },
      }),
    ),
    perfQuery("admin.dashboard.revenue_this_month", () =>
      prisma.order.aggregate({
        where: { storeId, paymentStatus: "PAID", createdAt: { gte: startThisMonth } },
        _sum: { total: true },
      }),
    ),
    perfQuery("admin.dashboard.revenue_prev_month", () =>
      prisma.order.aggregate({
        where: {
          storeId,
          paymentStatus: "PAID",
          createdAt: { gte: startPrevMonth, lt: endPrevMonth },
        },
        _sum: { total: true },
      }),
    ),
  ]);

  const revThis = Number(revenueThisMonth._sum.total ?? 0);
  const revPrev = Number(revenuePrevMonth._sum.total ?? 0);
  const growth = revPrev > 0 ? Math.round(((revThis - revPrev) / revPrev) * 1000) / 10 : null;

  return {
    ordersCount,
    revenuePaid: Number(revenueAgg._sum.total ?? 0),
    customersCount,
    productsCount,
    membersCount,
    monthlyGrowthPct: growth,
  };
}

export async function loadAdminDashboardChart(storeId: string) {
  const now = new Date();
  const start14 = new Date(now);
  start14.setDate(start14.getDate() - 13);
  start14.setHours(0, 0, 0, 0);
  return loadChartBuckets(storeId, start14);
}

export async function loadAdminDashboardRecent(storeId: string) {
  const recent = await perfQuery("admin.dashboard.recent_orders", () =>
    prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
  );
  return recent.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    total: Number(o.total),
    status: o.status as OrderStatus,
    paymentStatus: o.paymentStatus as OrderPaymentStatus,
    createdAt: o.createdAt.toISOString(),
  }));
}

export async function loadAdminDashboardLowStock(storeId: string) {
  const lowStock = await perfQuery("admin.dashboard.low_stock", () =>
    prisma.product.findMany({
      where: { storeId, active: true, stock: { lt: 5 } },
      orderBy: { stock: "asc" },
      take: 8,
      select: { id: true, name_he: true, name_ar: true, name_en: true, stock: true, sku: true },
    }),
  );
  return lowStock;
}

/** Full dashboard — parallel sections (chart uses SQL aggregate, not loading all orders). */
export async function loadAdminDashboardData(storeId: string): Promise<AdminDashboardPayload> {
  const pageStart = performance.now();
  const [totals, chart, recent, lowStock] = await Promise.all([
    loadAdminDashboardTotals(storeId),
    loadAdminDashboardChart(storeId),
    loadAdminDashboardRecent(storeId),
    loadAdminDashboardLowStock(storeId),
  ]);
  if (
    process.env.PERF_QUERY_LOG === "1" ||
    (process.env.NODE_ENV === "development" && process.env.PERF_QUERY_LOG !== "0")
  ) {
    console.log("admin.dashboard.total", Math.round((performance.now() - pageStart) * 100) / 100);
  }
  return { totals, chart, lowStock, recent };
}
