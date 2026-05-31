import type { AdminOrderDetailDTO } from "@/app/admin/actions";
import { useAdminI18n } from "@/lib/admin-i18n";

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
      </div>

      {onSaveStatus && (
        <form
          className="flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void onSaveStatus(e.currentTarget);
          }}
        >
          <input type="hidden" name="id" value={detail.id} />
          <label className="text-xs">
            {t("status")}
            <select name="status" defaultValue={detail.status} className="mt-1 block rounded border px-2 py-1 text-sm">
              <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
              <option value="ABANDONED">ABANDONED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </label>
          <label className="text-xs">
            {t("payment")}
            <select name="paymentStatus" defaultValue={detail.paymentStatus} className="mt-1 block rounded border px-2 py-1 text-sm">
              <option value="UNPAID">UNPAID</option>
              <option value="PAID">PAID</option>
              <option value="REFUNDED">REFUNDED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </label>
          <label className="text-xs">
            מעקב / שליחה
            <select
              name="fulfillmentStatus"
              defaultValue={detail.fulfillmentStatus}
              className="mt-1 block rounded border px-2 py-1 text-sm"
            >
              <option value="RECEIVED">RECEIVED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </label>
          <button type="submit" className="rounded bg-slate-900 px-3 py-1.5 text-xs text-white">
            {t("update")}
          </button>
        </form>
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
