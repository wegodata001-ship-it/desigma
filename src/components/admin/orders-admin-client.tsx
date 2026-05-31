"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminSpinner } from "@/components/admin/admin-spinner";
import { useAdminI18n } from "@/lib/admin-i18n";
import { adminOrderPath } from "@/lib/app-urls-shared";

export type OrderRowDTO = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  deliveryOptionName: string;
  deliveryOptionType: string;
  deliveryPrice: number;
};

export type OrderFilters = {
  q: string;
  status: string;
  paymentStatus: string;
  deliveryType: string;
  shippingArea: string;
  from: string;
  to: string;
  minTotal: string;
  maxTotal: string;
};

const ORDER_STATUS_OPTIONS = [
  "ALL",
  "PENDING_PAYMENT",
  "PENDING",
  "PAID",
  "PAYMENT_FAILED",
  "ABANDONED",
  "CANCELLED",
  "FAILED",
];
const PAYMENT_STATUS_OPTIONS = ["ALL", "UNPAID", "PAID", "REFUNDED", "FAILED"];
const DELIVERY_TYPE_OPTIONS = ["ALL", "PICKUP", "SHIPPING"];

export function OrdersAdminClient({
  orders,
  initialFilters,
  shippingAreas,
}: {
  orders: OrderRowDTO[];
  initialFilters: OrderFilters;
  shippingAreas: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(initialFilters);
  const { t } = useAdminI18n();

  const refresh = () => startTransition(() => router.refresh());

  function setFilter<K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.status !== "ALL") params.set("status", filters.status);
    if (filters.paymentStatus !== "ALL") params.set("paymentStatus", filters.paymentStatus);
    if (filters.deliveryType !== "ALL") params.set("deliveryType", filters.deliveryType);
    if (filters.shippingArea !== "ALL") params.set("shippingArea", filters.shippingArea);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.minTotal.trim()) params.set("minTotal", filters.minTotal.trim());
    if (filters.maxTotal.trim()) params.set("maxTotal", filters.maxTotal.trim());
    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => router.replace(next));
  }

  function clearFilters() {
    const cleared: OrderFilters = {
      q: "",
      status: "ALL",
      paymentStatus: "ALL",
      deliveryType: "ALL",
      shippingArea: "ALL",
      from: "",
      to: "",
      minTotal: "",
      maxTotal: "",
    };
    setFilters(cleared);
    startTransition(() => router.replace(pathname));
  }

  function openOrder(id: string) {
    router.push(adminOrderPath(id));
  }

  const deliveryLabel = (o: OrderRowDTO) =>
    o.deliveryOptionType === "PICKUP"
      ? "איסוף עצמי"
      : `${o.deliveryOptionName} - ₪${o.deliveryPrice.toFixed(2)}`;

  return (
    <div>
      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm">{toast}</div>}
      <h1 className="text-xl font-semibold text-slate-900">{t("orders")}</h1>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <input
            value={filters.q}
            onChange={(e) => setFilter("q", e.target.value)}
            placeholder="חיפוש: מספר הזמנה / שם / טלפון / אימייל"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />

          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {ORDER_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All order statuses" : s}
              </option>
            ))}
          </select>

          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilter("paymentStatus", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {PAYMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All payment statuses" : s}
              </option>
            ))}
          </select>

          <select
            value={filters.deliveryType}
            onChange={(e) => setFilter("deliveryType", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {DELIVERY_TYPE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v === "ALL" ? "All delivery types" : v === "PICKUP" ? "Pickup from store" : "Shipping"}
              </option>
            ))}
          </select>

          <select
            value={filters.shippingArea}
            onChange={(e) => setFilter("shippingArea", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="ALL">All areas</option>
            {shippingAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilter("from", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilter("to", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={filters.minTotal}
            onChange={(e) => setFilter("minTotal", e.target.value)}
            placeholder="Min total"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={filters.maxTotal}
            onChange={(e) => setFilter("maxTotal", e.target.value)}
            placeholder="Max total"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <th className="px-4 py-3">{t("orderNumber")}</th>
              <th className="px-4 py-3">{t("customer")}</th>
              <th className="px-4 py-3">{t("deliveryTitle")}</th>
              <th className="px-4 py-3">{t("total")}</th>
              <th className="px-4 py-3">{t("status")}</th>
              <th className="px-4 py-3">{t("payment")}</th>
              <th className="px-4 py-3">{t("date")}</th>
              <th className="px-4 py-3 text-end"> </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => openOrder(o.id)}
                    className="font-mono font-semibold text-blue-700 hover:underline"
                  >
                    {o.orderNumber}
                  </button>
                </td>
                <td className="px-4 py-2">{o.customerName}</td>
                <td className="px-4 py-2">{deliveryLabel(o)}</td>
                <td className="px-4 py-2 tabular-nums">₪{o.total.toFixed(2)}</td>
                <td className="px-4 py-2">{o.status}</td>
                <td className="px-4 py-2">{o.paymentStatus}</td>
                <td className="px-4 py-2 text-xs">{new Date(o.createdAt).toLocaleString("he-IL")}</td>
                <td className="px-4 py-2 text-end">
                  <button
                    type="button"
                    onClick={() => openOrder(o.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    צפה
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pending && (
        <div className="fixed bottom-6 left-6 z-[90] rounded-lg bg-slate-900 px-3 py-2 text-white">
          <AdminSpinner className="h-4 w-4 border-t-white" />
        </div>
      )}
    </div>
  );
}
