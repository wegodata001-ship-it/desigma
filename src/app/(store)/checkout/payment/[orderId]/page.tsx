import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetImg } from "@/components/asset-img";
import { CheckoutPayButton } from "@/components/storefront/checkout-pay-button";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, STORE_ID } from "@/lib/store";

export const dynamic = "force-dynamic";

function formatMoney(amount: number, currency: string): string {
  if (currency === "ILS") {
    return `₪${amount.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return `${amount.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function paymentStatusLabel(status: string): string {
  switch (status) {
    case "PAID":
      return "שולם";
    case "FAILED":
      return "תשלום נכשל";
    case "REFUNDED":
      return "הוחזר";
    case "UNPAID":
    default:
      return "ממתין לתשלום";
  }
}

function orderStatusLabel(status: string): string {
  switch (status) {
    case "PENDING_PAYMENT":
      return "ממתין לתשלום";
    case "PAID":
      return "שולם";
    case "PAYMENT_FAILED":
      return "תשלום נכשל";
    case "ABANDONED":
      return "נטוש";
    case "CANCELLED":
      return "בוטל";
    default:
      return status;
  }
}

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const storeId = STORE_ID;

  const [order, settings, store] = await Promise.all([
    prisma.order.findFirst({
      where: { id: orderId, storeId },
      include: {
        items: { orderBy: { id: "asc" } },
      },
    }),
    prisma.storeSettings.findUnique({
      where: { storeId },
      select: { logoUrl: true, currency: true },
    }),
    prisma.store.findUnique({
      where: { id: storeId },
      select: { name: true },
    }),
  ]);

  if (!order) notFound();

  const storeName = store?.name?.trim() || SITE_NAME;
  const currency = settings?.currency ?? "ILS";
  const isPaid = order.paymentStatus === "PAID";
  const subtotal = Number(order.subtotal);
  const deliveryPrice = Number(order.deliveryPrice);
  const discountAmount = Number(order.discountAmount);
  const pointsDiscount = Number(order.pointsDiscountAmount);
  const total = Number(order.total);

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
        <h1 className="mt-6 text-3xl font-black text-white">אישור הזמנה</h1>
        <p className="mt-2 text-sm text-zinc-400">סקירה אחרונה לפני תשלום מאובטח</p>
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl backdrop-blur-sm">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">מספר הזמנה</dt>
              <dd className="mt-0.5 text-lg font-bold text-white">{order.orderNumber}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">סטטוס</dt>
              <dd className="mt-0.5">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    isPaid
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-amber-500/15 text-amber-200"
                  }`}
                >
                  {paymentStatusLabel(order.paymentStatus)}
                </span>
              </dd>
            </div>
            <div className="sm:col-span-2 border-t border-zinc-800 pt-3">
              <dt className="text-zinc-500">סכום לתשלום</dt>
              <dd className="mt-1 text-3xl font-black text-orange-400">{formatMoney(total, currency)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <h2 className="mb-4 text-base font-bold text-orange-400">פרטי לקוח</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-zinc-800/80 pb-2">
              <dt className="text-zinc-500">שם</dt>
              <dd className="font-medium text-zinc-100">{order.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-800/80 pb-2">
              <dt className="text-zinc-500">טלפון</dt>
              <dd className="font-medium text-zinc-100" dir="ltr">
                {order.customerPhone}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">אימייל</dt>
              <dd className="font-medium text-zinc-100" dir="ltr">
                {order.customerEmail}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <h2 className="mb-4 text-base font-bold text-orange-400">מוצרים שהוזמנו</h2>
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
                    כמות: {item.quantity} · {formatMoney(Number(item.unitPrice), currency)} ליחידה
                  </p>
                </div>
                <div className="shrink-0 text-left font-semibold text-orange-300">
                  {formatMoney(Number(item.totalPrice), currency)}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <h2 className="mb-4 text-base font-bold text-orange-400">סיכום הזמנה</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-300">
              <dt>סכום ביניים</dt>
              <dd>{formatMoney(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between text-zinc-300">
              <dt>משלוח ({order.deliveryOptionName})</dt>
              <dd>{formatMoney(deliveryPrice, currency)}</dd>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-300">
                <dt>הנחת קופון</dt>
                <dd>−{formatMoney(discountAmount, currency)}</dd>
              </div>
            )}
            {pointsDiscount > 0 && (
              <div className="flex justify-between text-emerald-300">
                <dt>מימוש נקודות</dt>
                <dd>−{formatMoney(pointsDiscount, currency)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-700 pt-3 text-lg font-bold text-white">
              <dt>סה״כ לתשלום</dt>
              <dd className="text-orange-400">{formatMoney(total, currency)}</dd>
            </div>
          </dl>
        </section>

        <CheckoutPayButton orderId={order.id} isPaid={isPaid} />

        {!isPaid && (
          <ul className="space-y-2 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 px-5 py-4 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <span aria-hidden>🔒</span>
              <span>התשלום מאובטח ומוצפן</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden>🔒</span>
              <span>
                {storeName} אינה שומרת פרטי אשראי
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden>🔒</span>
              <span>הסליקה מתבצעת באמצעות ספק מורשה</span>
            </li>
          </ul>
        )}

        <p className="text-center text-sm">
          <Link href={`/orders/${encodeURIComponent(order.orderNumber)}`} className="text-orange-400 hover:underline">
            צפייה בהזמנה
          </Link>
        </p>
      </div>
    </div>
  );
}
