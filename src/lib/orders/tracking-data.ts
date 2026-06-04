import "server-only";

import type { OrderTrackingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildTrackingTimeline, TRACKING_LABELS_HE } from "@/lib/orders/tracking-status";

export type OrderTrackingViewData = {
  orderNumber: string;
  trackingStatus: OrderTrackingStatus;
  statusLabel: string;
  statusUpdatedAt: string | null;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string | null;
  deliveryOptionName: string;
  trackingUrl: string | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  currency: string;
  subtotal: number;
  deliveryPrice: number;
  discountAmount: number;
  pointsDiscount: number;
  total: number;
  items: {
    id: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  timeline: ReturnType<typeof buildTrackingTimeline>;
};

export async function loadOrderTrackingView(
  storeId: string,
  orderNumber: string,
): Promise<OrderTrackingViewData | null> {
  const [order, settings] = await Promise.all([
    prisma.order.findFirst({
      where: { storeId, orderNumber },
      include: {
        items: { orderBy: { id: "asc" } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.storeSettings.findUnique({
      where: { storeId },
      select: { currency: true },
    }),
  ]);

  if (!order) return null;

  const timeline = buildTrackingTimeline(
    order.trackingStatus,
    order.statusHistory.map((h) => ({ status: h.status, createdAt: h.createdAt })),
  );

  return {
    orderNumber: order.orderNumber,
    trackingStatus: order.trackingStatus,
    statusLabel: TRACKING_LABELS_HE[order.trackingStatus],
    statusUpdatedAt: order.statusUpdatedAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    address: order.address,
    deliveryOptionName: order.deliveryOptionName,
    trackingUrl: order.trackingUrl,
    trackingNumber: order.trackingNumber,
    trackingCarrier: order.trackingCarrier,
    currency: settings?.currency ?? "ILS",
    subtotal: Number(order.subtotal),
    deliveryPrice: Number(order.deliveryPrice),
    discountAmount: Number(order.discountAmount),
    pointsDiscount: Number(order.pointsDiscountAmount),
    total: Number(order.total),
    items: order.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      productImage: i.productImage,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
    })),
    timeline,
  };
}
