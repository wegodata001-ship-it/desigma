import "server-only";

import {
  OrderFulfillmentStatus,
  OrderPaymentStatus,
  OrderStatus,
  OrderTrackingStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notifyOrderTrackingStatusAsync } from "@/lib/notifications";
import { TRACKING_LABELS_HE } from "@/lib/orders/tracking-status";

export type RecordTrackingInput = {
  orderId: string;
  storeId: string;
  status: OrderTrackingStatus;
  note?: string | null;
  updatedBy?: string | null;
  trackingUrl?: string | null;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
  /** Skip customer email (e.g. initial NEW on checkout). */
  silent?: boolean;
};

function mapTrackingToLegacy(status: OrderTrackingStatus): {
  orderStatus: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
} {
  switch (status) {
    case OrderTrackingStatus.PAID:
      return {
        orderStatus: OrderStatus.PAID,
        paymentStatus: OrderPaymentStatus.PAID,
        fulfillmentStatus: OrderFulfillmentStatus.RECEIVED,
      };
    case OrderTrackingStatus.PROCESSING:
      return {
        orderStatus: OrderStatus.PAID,
        fulfillmentStatus: OrderFulfillmentStatus.PROCESSING,
      };
    case OrderTrackingStatus.PACKED:
      return {
        orderStatus: OrderStatus.PAID,
        fulfillmentStatus: OrderFulfillmentStatus.PACKED,
      };
    case OrderTrackingStatus.SHIPPED:
      return {
        orderStatus: OrderStatus.PAID,
        fulfillmentStatus: OrderFulfillmentStatus.SHIPPED,
      };
    case OrderTrackingStatus.DELIVERED:
      return {
        orderStatus: OrderStatus.PAID,
        fulfillmentStatus: OrderFulfillmentStatus.COMPLETED,
      };
    case OrderTrackingStatus.CANCELLED:
      return {
        orderStatus: OrderStatus.CANCELLED,
        fulfillmentStatus: OrderFulfillmentStatus.RECEIVED,
      };
    case OrderTrackingStatus.REFUNDED:
      return {
        orderStatus: OrderStatus.CANCELLED,
        paymentStatus: OrderPaymentStatus.REFUNDED,
        fulfillmentStatus: OrderFulfillmentStatus.RECEIVED,
      };
    case OrderTrackingStatus.NEW:
    default:
      return {
        orderStatus: OrderStatus.PENDING,
        paymentStatus: OrderPaymentStatus.UNPAID,
        fulfillmentStatus: OrderFulfillmentStatus.RECEIVED,
      };
  }
}

export async function recordOrderTrackingStatus(input: RecordTrackingInput): Promise<{
  changed: boolean;
  previous: OrderTrackingStatus | null;
}> {
  const order = await prisma.order.findFirst({
    where: { id: input.orderId, storeId: input.storeId },
    select: { trackingStatus: true },
  });
  if (!order) return { changed: false, previous: null };

  const previous = order.trackingStatus;
  if (previous === input.status && !input.trackingUrl && !input.trackingNumber) {
    return { changed: false, previous };
  }

  const legacy = mapTrackingToLegacy(input.status);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.orderStatusHistory.create({
      data: {
        storeId: input.storeId,
        orderId: input.orderId,
        status: input.status,
        note: input.note?.trim() || TRACKING_LABELS_HE[input.status],
        updatedBy: input.updatedBy ?? null,
        createdAt: now,
      },
    });

    await tx.order.update({
      where: { id: input.orderId },
      data: {
        trackingStatus: input.status,
        statusUpdatedAt: now,
        status: legacy.orderStatus,
        fulfillmentStatus: legacy.fulfillmentStatus,
        ...(legacy.paymentStatus ? { paymentStatus: legacy.paymentStatus } : {}),
        ...(input.trackingUrl !== undefined ? { trackingUrl: input.trackingUrl?.trim() || null } : {}),
        ...(input.trackingNumber !== undefined
          ? { trackingNumber: input.trackingNumber?.trim() || null }
          : {}),
        ...(input.trackingCarrier !== undefined
          ? { trackingCarrier: input.trackingCarrier?.trim() || null }
          : {}),
      },
    });
  });

  if (!input.silent && previous !== input.status) {
    notifyOrderTrackingStatusAsync(input.orderId, input.status);
  }

  return { changed: true, previous };
}

/** Initial status when order is created at checkout. */
export async function recordOrderCreatedTracking(
  orderId: string,
  storeId: string,
): Promise<void> {
  await recordOrderTrackingStatus({
    orderId,
    storeId,
    status: OrderTrackingStatus.NEW,
    note: "ההזמנה התקבלה",
    silent: true,
  });
}
