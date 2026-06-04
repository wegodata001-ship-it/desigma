import Link from "next/link";
import { AssetImg } from "@/components/asset-img";
import { OrderTrackingTimeline } from "@/components/storefront/order-tracking-timeline";
import type { OrderTrackingViewData } from "@/lib/orders/tracking-data";
import { formatOrderMoney } from "@/lib/orders/order-display-labels";

export function OrderTrackingView({
  data,
  storeName,
  logoUrl,
}: {
  data: OrderTrackingViewData;
  storeName: string;
  logoUrl?: string | null;
}) {
  const { currency } = data;

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8 pb-16 md:py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <Link href="/" className="inline-flex flex-col items-center gap-2">
          {logoUrl ? (
            <div className="relative h-12 w-40">
              <AssetImg
                path={logoUrl}
                alt={storeName}
                className="relative h-12 w-40"
                imageClassName="object-contain object-center"
                fit="contain"
                priority
              />
            </div>
          ) : (
            <span className="text-2xl font-black tracking-tight text-white">{storeName}</span>
          )}
        </Link>
        <h1 className="mt-6 text-3xl font-black text-white">מעקב הזמנה</h1>
        <p className="mt-2 font-mono text-sm text-zinc-400">{data.orderNumber}</p>
      </div>

      <section className="mb-4 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-zinc-900/90 p-6 shadow-xl shadow-orange-950/20">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-400/90">סטטוס נוכחי</p>
        <p className="mt-2 text-2xl font-black text-white">{data.statusLabel}</p>
        {data.statusUpdatedAt && (
          <p className="mt-2 text-sm text-zinc-400">
            עודכן: {new Date(data.statusUpdatedAt).toLocaleString("he-IL")}
          </p>
        )}
      </section>

      <section className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <h2 className="mb-5 text-base font-bold text-orange-400">ציר מעקב</h2>
        <OrderTrackingTimeline steps={data.timeline.steps} terminal={data.timeline.terminal} />
      </section>

      {data.trackingUrl?.trim() && (
        <section className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 text-center">
          <a
            href={data.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 text-base font-bold text-white shadow-lg shadow-orange-900/40 hover:from-orange-400 hover:to-orange-500"
          >
            עקוב אחרי המשלוח
          </a>
          {data.trackingNumber && (
            <p className="mt-3 text-sm text-zinc-400">
              מספר מעקב: <span className="font-mono text-zinc-200">{data.trackingNumber}</span>
              {data.trackingCarrier ? ` · ${data.trackingCarrier}` : ""}
            </p>
          )}
        </section>
      )}

      <section className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
        <h2 className="mb-4 text-base font-bold text-orange-400">פרטי לקוח</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">שם</dt>
            <dd className="font-medium text-zinc-100">{data.customerName}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">טלפון</dt>
            <dd dir="ltr" className="font-medium text-zinc-100">
              {data.customerPhone}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-zinc-500">אימייל</dt>
            <dd dir="ltr" className="font-mono text-xs text-zinc-200">
              {data.customerEmail}
            </dd>
          </div>
        </dl>
      </section>

      {data.address?.trim() && (
        <section className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <h2 className="mb-3 text-base font-bold text-orange-400">כתובת משלוח</h2>
          <p className="whitespace-pre-wrap text-sm text-zinc-200">{data.address}</p>
          <p className="mt-2 text-xs text-zinc-500">{data.deliveryOptionName}</p>
        </section>
      )}

      <section className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
        <h2 className="mb-4 text-base font-bold text-orange-400">מוצרים בהזמנה</h2>
        <ul className="space-y-3">
          {data.items.map((item) => (
            <li
              key={item.id}
              className="flex gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                <AssetImg
                  path={item.productImage}
                  alt={item.productName}
                  className="h-16 w-16"
                  variant="product"
                  fit="contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-100">{item.productName}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  כמות: {item.quantity} · {formatOrderMoney(item.unitPrice, currency)} ליחידה
                </p>
              </div>
              <div className="shrink-0 font-semibold text-orange-300">
                {formatOrderMoney(item.totalPrice, currency)}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
        <h2 className="mb-4 text-base font-bold text-orange-400">סיכום כספי</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between text-zinc-300">
            <dt>סה״כ מוצרים</dt>
            <dd>{formatOrderMoney(data.subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between text-zinc-300">
            <dt>משלוח</dt>
            <dd>{formatOrderMoney(data.deliveryPrice, currency)}</dd>
          </div>
          {data.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-300">
              <dt>הנחה</dt>
              <dd>−{formatOrderMoney(data.discountAmount, currency)}</dd>
            </div>
          )}
          {data.pointsDiscount > 0 && (
            <div className="flex justify-between text-emerald-300">
              <dt>מימוש נקודות</dt>
              <dd>−{formatOrderMoney(data.pointsDiscount, currency)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-800 pt-3 text-lg font-bold text-white">
            <dt>סה״כ לתשלום</dt>
            <dd className="text-orange-400">{formatOrderMoney(data.total, currency)}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <Link href="/contact" className="text-orange-400 hover:underline">
          צור קשר
        </Link>
        <span className="text-zinc-600">·</span>
        <Link href="/" className="text-orange-400 hover:underline">
          חזרה לחנות
        </Link>
      </div>
    </div>
  );
}
