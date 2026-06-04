import type { AdminOrderDetailDTO } from "@/app/admin/actions";
import { TRACKING_LABELS_HE } from "@/lib/orders/tracking-status";
import { useAdminI18n } from "@/lib/admin-i18n";

const TRACKING_OPTIONS = [
  "NEW",
  "PAID",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export function AdminOrderDetailView({
  detail,
  onSaveStatus,
}: {
  detail: AdminOrderDetailDTO;
  onSaveStatus?: (form: HTMLFormElement) => void | Promise<void>;
}) {
  const { t } = useAdminI18n();

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-slate-500">{t("orderLabel")}:</span>{" "}
          <span className="font-mono text-lg font-semibold">{detail.orderNumber}</span>
        </div>
        <div>
          <span className="text-slate-500">{t("date")}:</span>{" "}
          {new Date(detail.createdAt).toLocaleString("he-IL")}
        </div>
        <div>
          <a
            href={`https://desigma-shop.com/track-order/${encodeURIComponent(detail.orderNumber)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-orange-600 hover:underline"
          >
            צפייה במעקב לקוח ↗
          </a>
        </div>
      </div>

      {onSaveStatus && (
        <form
          className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void onSaveStatus(e.currentTarget);
          }}
        >
          <input type="hidden" name="id" value={detail.id} />
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold text-slate-700">
              סטטוס מעקב
              <select
                name="trackingStatus"
                defaultValue={detail.trackingStatus}
                className="mt-1 block min-w-[200px] rounded border border-slate-300 px-2 py-1.5 text-sm"
              >
                {TRACKING_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s} — {TRACKING_LABELS_HE[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-slate-600">
              הערה (אופציונלי)
              <input
                name="statusNote"
                className="mt-1 block w-48 rounded border border-slate-300 px-2 py-1.5 text-sm"
                placeholder="הערה ללקוח"
              />
            </label>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="text-xs text-slate-600">
              קישור מעקב משלוח (trackingUrl)
              <input
                name="trackingUrl"
                type="url"
                defaultValue={detail.trackingUrl ?? ""}
                placeholder="https://..."
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-slate-600">
              מספר מעקב
              <input
                name="trackingNumber"
                defaultValue={detail.trackingNumber ?? ""}
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-slate-600">
              חברת משלוחים
              <input
                name="trackingCarrier"
                defaultValue={detail.trackingCarrier ?? ""}
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <p className="text-[11px] text-slate-500">
            שינוי סטטוס שולח מייל ללקוח: &quot;ההזמנה שלך עודכנה&quot; + קישור מעקב.
          </p>
          <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
            {t("update")}
          </button>
        </form>
      )}

      {detail.statusHistory.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-800">היסטוריית סטטוס</h2>
          <ul className="mt-3 space-y-2 text-xs">
            {detail.statusHistory.map((h) => (
              <li key={h.id} className="flex flex-wrap gap-2 border-b border-slate-50 pb-2">
                <span className="font-mono font-semibold text-slate-800">{h.status}</span>
                <span className="text-slate-500">
                  {new Date(h.createdAt).toLocaleString("he-IL")}
                </span>
                {h.note && <span className="text-slate-600">— {h.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-800">{t("customerTitle")}</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">שם</dt>
            <dd className="font-medium">{detail.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">טלפון</dt>
            <dd dir="ltr" className="font-medium">
              {detail.customerPhone}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-slate-500">אימייל</dt>
            <dd dir="ltr" className="font-mono text-xs">
              {detail.customerEmail}
            </dd>
          </div>
        </dl>
        {detail.customerProfile && (
          <p className="mt-2 text-xs text-slate-600">
            {t("points")}: {detail.customerProfile.pointsBalance}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-800">{t("deliveryTitle")}</h2>
        <p className="mt-2">
          {detail.deliveryOptionName} ({detail.deliveryOptionType}) — ₪{detail.deliveryPrice.toFixed(2)}
        </p>
        {detail.address && <p className="mt-2 whitespace-pre-wrap text-slate-700">{detail.address}</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-800">{t("items")}</h2>
        <table className="mt-3 w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500">
              <th className="py-2 text-start">מוצר</th>
              <th className="py-2 text-center">כמות</th>
              <th className="py-2 text-end">מחיר</th>
            </tr>
          </thead>
          <tbody>
            {detail.items.map((i) => (
              <tr key={i.id} className="border-b border-slate-50">
                <td className="py-2">{i.productName}</td>
                <td className="py-2 text-center">×{i.quantity}</td>
                <td className="py-2 text-end tabular-nums">₪{i.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-800">{t("payment")}</h2>
        <p className="mt-1 text-xs text-slate-500">
          תשלום: {detail.paymentStatus} · מעקב: {detail.trackingStatus}
        </p>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          {detail.payments.length === 0 && <li className="text-slate-500">אין רשומות תשלום</li>}
          {detail.payments.map((p) => (
            <li key={p.id}>
              {p.provider} · {p.status} · {p.currency} {p.amount.toFixed(2)}
              {p.transactionId ? ` · ${p.transactionId}` : ""}
            </li>
          ))}
        </ul>
      </section>

      {detail.notes?.trim() && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="font-semibold text-amber-900">הערות</h2>
          <p className="mt-2 whitespace-pre-wrap text-amber-950">{detail.notes}</p>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div>{t("orderSubtotal")}: ₪{detail.subtotal.toFixed(2)}</div>
        <div>{t("orderCouponDiscount")}: ₪{detail.discountAmount.toFixed(2)}</div>
        <div>{t("orderPointsDiscount")}: ₪{detail.pointsDiscountAmount.toFixed(2)}</div>
        <div>{t("orderDeliveryPrice")}: ₪{detail.deliveryPrice.toFixed(2)}</div>
        <div className="mt-2 text-lg font-bold">
          {t("orderFinalTotal")}: ₪{detail.total.toFixed(2)}
        </div>
      </section>
    </div>
  );
}
