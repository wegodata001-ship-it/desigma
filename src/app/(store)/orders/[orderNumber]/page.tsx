import Link from "next/link";
import type { Metadata } from "next";
import { AssetImg } from "@/components/asset-img";
import { OrderTimeline } from "@/components/account/order-timeline";
import { CheckoutPayButton } from "@/components/storefront/checkout-pay-button";
import { prisma } from "@/lib/prisma";
import {
  formatOrderMoney,
  fulfillmentStatusLabelHe,
  orderStatusLabelHe,
  paymentStatusLabelHe,
} from "@/lib/orders/order-display-labels";
import { SITE_NAME, STORE_ID } from "@/lib/store";
import { isLikelyOrderId } from "@/lib/app-urls-shared";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "הזמנה שלי — DESIGMA",
  description: "צפייה בסטטוס הזמנה, מוצרים, משלוח ותשלום",
};

function OrderNotFound({ orderNumber }: { orderNumber: string }) {
  return (
    <div dir="rtl" className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl">
        <p className="text-4xl" aria-hidden>
          📦
        </p>
        <h1 className="mt-4 text-2xl font-bold text-white">הזמנה לא נמצאה</h1>
        <p className="mt-3 text-sm text-zinc-400">
          לא מצאנו הזמנה עם המספר{" "}
          <span className="font-mono font-semibold text-zinc-200">{orderNumber}</span>.
          <br />
          בדקו שהמספר נכון או פנו אלינו לעזרה.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-400"
          >
            חזרה לחנות
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center rounded-xl border border-zinc-700 px-5 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            צור קשר
          </Link>
        </div>
      </div>
    </div>
  );
}

function OrderUnauthorized() {
  return (
    <div dir="rtl" className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="rounded-2xl border border-red-500/30 bg-zinc-900/80 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">403 Unauthorized</h1>
        <p className="mt-3 text-sm text-zinc-400">אין לך הרשאה לצפות בקישור זה.</p>
        <Link href="/" className="mt-6 inline-block text-sm text-orange-400 hover:underline">
          חזרה לחנות
        </Link>
      </div>
    </div>
  );
}

export default async function PublicOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber: raw } = await params;
  const orderNumber = decodeURIComponent(raw).trim();

  if (isLikelyOrderId(orderNumber)) {
    return <OrderUnauthorized />;
  }

  const storeId = STORE_ID;

  const [order, settings, store] = await Promise.all([
    prisma.order.findFirst({
      where: { storeId, orderNumber },
      include: { items: { orderBy: { id: "asc" } } },
    }),
    prisma.storeSettings.findUnique({
      where: { storeId },
      select: { logoUrl: true, currency: true, supportEmail: true, whatsappPhone: true },
    }),
    prisma.store.findUnique({
      where: { id: storeId },
      select: { name: true },
    }),
  ]);

  if (!order) {
    return <OrderNotFound orderNumber={orderNumber} />;
  }

  const storeName = store?.name?.trim() || SITE_NAME;
  const currency = settings?.currency ?? "ILS";
  const isPaid = order.paymentStatus === "PAID";
  const subtotal = Number(order.subtotal);
  const deliveryPrice = Number(order.deliveryPrice);
  const discountAmount = Number(order.discountAmount);
  const pointsDiscount = Number(order.pointsDiscountAmount);
  const total = Number(order.total);
  const cancelled = order.status === "CANCELLED";

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8 pb-16 md:py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <Link href="/" className="inline-flex flex-col items-center gap-2">
          {settings?.logoUrl ? (
            <div className="relative h-12 w-40">
              <AssetImg
                path={settings.logoUrl}
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
        <h1 className="mt-6 text-3xl font-black text-white">הזמנה שלי</h1>
        <p className="mt-2 text-sm text-zinc-400">מספר הזמנה {order.orderNumber}</p>
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl backdrop-blur-sm">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">מספר הזמנה</dt>
              <dd className="mt-0.5 text-lg font-bold text-white">{order.orderNumber}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">תאריך</dt>
              <dd className="mt-0.5 font-medium text-zinc-100">
                {new Date(order.createdAt).toLocaleString("he-IL")}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">סטטוס הזמנה</dt>
              <dd className="mt-0.5">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    cancelled
                      ? "bg-red-500/15 text-red-300"
                      : "bg-blue-500/15 text-blue-200"
                  }`}
                >
                  {orderStatusLabelHe(order.status)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">מצב משלוח</dt>
              <dd className="mt-0.5 font-medium text-zinc-100">
                {fulfillmentStatusLabelHe(order.fulfillmentStatus)}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">תשלום</dt>
              <dd className="mt-0.5">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    isPaid ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-200"
                  }`}
                >
                  {paymentStatusLabelHe(order.paymentStatus)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">סכום כולל</dt>
              <dd className="mt-0.5 text-xl font-black text-orange-400">{formatOrderMoney(total, currency)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <h2 className="mb-4 text-base font-bold text-orange-400">מוצרים</h2>
          <ul className="space-y-3">
            {order.items.map((item) => (
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
                    כמות: {item.quantity} · {formatOrderMoney(Number(item.unitPrice), currency)} ליחידה
                  </p>
                </div>
                <div className="shrink-0 text-left font-semibold text-orange-300">
                  {formatOrderMoney(Number(item.totalPrice), currency)}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <h2 className="mb-4 text-base font-bold text-orange-400">משלוח</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4 text-zinc-300">
              <dt className="text-zinc-500">סוג משלוח</dt>
              <dd>{order.deliveryOptionName}</dd>
            </div>
            {order.address?.trim() ? (
              <div className="border-t border-zinc-800 pt-3">
                <dt className="text-zinc-500">כתובת</dt>
                <dd className="mt-1 whitespace-pre-wrap text-zinc-200">{order.address}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <h2 className="mb-4 text-base font-bold text-orange-400">סיכום תשלום</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-300">
              <dt>סכום ביניים</dt>
              <dd>{formatOrderMoney(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between text-zinc-300">
              <dt>משלוח</dt>
              <dd>{formatOrderMoney(deliveryPrice, currency)}</dd>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-300">
                <dt>הנחה</dt>
                <dd>−{formatOrderMoney(discountAmount, currency)}</dd>
              </div>
            )}
            {pointsDiscount > 0 && (
              <div className="flex justify-between text-emerald-300">
                <dt>מימוש נקודות</dt>
                <dd>−{formatOrderMoney(pointsDiscount, currency)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-800 pt-3 text-lg font-bold text-white">
              <dt>סה״כ</dt>
              <dd className="text-orange-400">{formatOrderMoney(total, currency)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <h2 className="mb-3 text-base font-bold text-orange-400">מעקב הזמנה</h2>
          <OrderTimeline status={order.status} fulfillmentStatus={order.fulfillmentStatus} />
        </section>

        {!isPaid && order.paymentStatus === "UNPAID" && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center">
            <p className="text-sm text-amber-100">ההזמנה ממתינה לתשלום</p>
            <div className="mt-4">
              <CheckoutPayButton orderId={order.id} isPaid={isPaid} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 pt-2 text-sm">
          <Link href="/refunds" className="text-orange-400 hover:underline">
            מדיניות ביטולים
          </Link>
          <span className="text-zinc-600">·</span>
          <Link href="/contact" className="text-orange-400 hover:underline">
            צור קשר
          </Link>
          <span className="text-zinc-600">·</span>
          <Link href="/" className="text-orange-400 hover:underline">
            חזרה לחנות
          </Link>
        </div>
      </div>
    </div>
  );
}
