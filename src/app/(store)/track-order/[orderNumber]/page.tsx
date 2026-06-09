import type { Metadata } from "next";
import { TrackOrderVerifyGate } from "@/components/storefront/track-order-verify-gate";
import { OrderTrackingView } from "@/components/storefront/order-tracking-view";
import { getCachedSession } from "@/lib/auth/cached-session";
import { hasTrackingAccess } from "@/lib/orders/tracking-access";
import { loadOrderTrackingView } from "@/lib/orders/tracking-data";
import { prisma } from "@/lib/prisma";
import { createSiteMetadata } from "@/lib/site-metadata";
import { SITE_NAME, STORE_ID } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return createSiteMetadata(`מעקב הזמנה ${decodeURIComponent(orderNumber)}`);
}

export default async function TrackOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber: raw } = await params;
  const orderNumber = decodeURIComponent(raw).trim();
  const storeId = STORE_ID;

  const orderRow = await prisma.order.findFirst({
    where: { storeId, orderNumber },
    select: {
      id: true,
      customerEmail: true,
      customerId: true,
    },
  });

  if (!orderRow) {
    return (
      <div dir="rtl" className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8">
          <h1 className="text-2xl font-bold text-white">הזמנה לא נמצאה</h1>
          <p className="mt-3 text-sm text-zinc-400">בדקו את מספר ההזמנה או חפשו מחדש.</p>
          <a
            href="/track-order"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            חיפוש הזמנה
          </a>
        </div>
      </div>
    );
  }

  const session = await getCachedSession();
  let sessionOwnsOrder = false;
  let sessionEmail: string | null = null;

  if (session?.role === "CUSTOMER" && session.storeId === storeId) {
    const profile = await prisma.customerProfile.findFirst({
      where: { userId: session.userId, storeId },
      include: { user: { select: { email: true } } },
    });
    sessionEmail = profile?.user.email ?? null;
    if (profile && orderRow.customerId === profile.id) sessionOwnsOrder = true;
  }

  const allowed = await hasTrackingAccess(orderNumber, orderRow.customerEmail, {
    sessionEmail,
    sessionOwnsOrder,
  });

  if (!allowed) {
    return <TrackOrderVerifyGate orderNumber={orderNumber} />;
  }

  const [data, settings, store] = await Promise.all([
    loadOrderTrackingView(storeId, orderNumber),
    prisma.storeSettings.findUnique({
      where: { storeId },
      select: { logoUrl: true },
    }),
    prisma.store.findUnique({ where: { id: storeId }, select: { name: true } }),
  ]);

  if (!data) {
    return <TrackOrderVerifyGate orderNumber={orderNumber} />;
  }

  return (
    <OrderTrackingView
      data={data}
      storeName={store?.name?.trim() || SITE_NAME}
      logoUrl={settings?.logoUrl}
    />
  );
}
