import {
  LoyaltyTransactionType,
  OrderPaymentStatus,
  OrderStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../prisma";
import { STORE_ID } from "@/lib/store";
import { reduceInventoryAfterPayment } from "@/lib/inventory/updateInventory";
import { notifyOrderPaidEmailsAsync } from "@/lib/notifications";
import { ORDER_STATUS_PAYMENT_FAILED } from "@/lib/orders/order-status-values";

export type WebhookInput = {
  provider: string;
  orderId: string;
  amount: number;
  currency: string;
  /** Provider-specific payment success flag */
  success: boolean;
  transactionId?: string | null;
  confirmationNumber?: string | null;
  rawPayload?: unknown;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function processPaymentWebhook(input: WebhookInput): Promise<{ ok: boolean; message: string }> {
  const storeId = STORE_ID;

  const order = await prisma.order.findFirst({
    where: { id: input.orderId, storeId },
    include: {
      items: true,
      customerProfile: true,
    },
  });

  if (!order) return { ok: false, message: "Order not found" };

  if (input.transactionId) {
    const existing = await prisma.payment.findFirst({
      where: { storeId, transactionId: input.transactionId },
    });
    if (existing) {
      return { ok: true, message: "Duplicate transaction ignored" };
    }
  }

  const expectedTotal = roundMoney(Number(order.total));
  const paidAmount = roundMoney(input.amount);
  if (paidAmount !== expectedTotal) {
    return { ok: false, message: "Amount mismatch" };
  }

  const settings = await prisma.storeSettings.findUnique({ where: { storeId } });
  const currency = settings?.currency ?? "ILS";
  if (input.currency !== currency) {
    return { ok: false, message: "Currency mismatch" };
  }

  if (order.paymentStatus === OrderPaymentStatus.PAID && order.status === OrderStatus.PAID) {
    return { ok: true, message: "Order already paid" };
  }

  const wasAlreadyPaid = order.paymentStatus === OrderPaymentStatus.PAID;

  if (!input.success) {
    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { id: order.id, storeId },
        data: {
          paymentStatus: OrderPaymentStatus.FAILED,
          status: ORDER_STATUS_PAYMENT_FAILED,
        },
      });
    });
    await prisma.payment.create({
      data: {
        storeId,
        orderId: order.id,
        provider: input.provider,
        amount: new Prisma.Decimal(paidAmount),
        currency,
        status: "FAILED",
        transactionId: input.transactionId ?? undefined,
        confirmationNumber: input.confirmationNumber ?? undefined,
        rawPayload: input.rawPayload === undefined ? Prisma.JsonNull : (input.rawPayload as Prisma.InputJsonValue),
      },
    });
    return { ok: true, message: "Payment failed recorded" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.updateMany({
      where: { id: order.id, storeId },
      data: {
        paymentStatus: OrderPaymentStatus.PAID,
        status: OrderStatus.PAID,
      },
    });

    if (order.couponCode) {
      await tx.coupon.updateMany({
        where: { storeId, code: order.couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    if (order.customerId && order.loyaltyPointsRedeemed > 0) {
      await tx.customerProfile.updateMany({
        where: { id: order.customerId, storeId },
        data: { pointsBalance: { decrement: order.loyaltyPointsRedeemed } },
      });
      await tx.loyaltyTransaction.create({
        data: {
          storeId,
          customerId: order.customerId,
          orderId: order.id,
          type: LoyaltyTransactionType.REDEEM,
          points: order.loyaltyPointsRedeemed,
          reason: "Checkout redeem (paid)",
        },
      });
    }

    if (order.customerId) {
      const paidTotal = Number(order.total);
      await tx.customerProfile.updateMany({
        where: { id: order.customerId, storeId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: order.total },
        },
      });
      const loyalty = await tx.loyaltySettings.findUnique({ where: { storeId } });
      if (loyalty?.enabled) {
        const minOk = Number(loyalty.minOrderForPoints);
        const rate = Number(loyalty.pointsPerShekel);
        if (paidTotal >= minOk) {
          const pointsToAdd = Math.floor(paidTotal * rate);
          if (pointsToAdd > 0) {
            await tx.customerProfile.updateMany({
              where: { id: order.customerId, storeId },
              data: { pointsBalance: { increment: pointsToAdd } },
            });
            await tx.loyaltyTransaction.create({
              data: {
                storeId,
                customerId: order.customerId,
                orderId: order.id,
                type: LoyaltyTransactionType.EARN,
                points: pointsToAdd,
                reason: "Order paid",
              },
            });
          }
        }
      }
    }

    await tx.payment.create({
      data: {
        storeId,
        orderId: order.id,
        provider: input.provider,
        amount: new Prisma.Decimal(paidAmount),
        currency,
        status: "PAID",
        transactionId: input.transactionId ?? undefined,
        confirmationNumber: input.confirmationNumber ?? undefined,
        rawPayload: input.rawPayload === undefined ? Prisma.JsonNull : (input.rawPayload as Prisma.InputJsonValue),
      },
    });
  });

  // Emails must not depend on inventory — customer already paid.
  if (!wasAlreadyPaid) {
    notifyOrderPaidEmailsAsync(order.id);
  }

  // Reduce inventory ONLY after verified paid status is persisted.
  const inv = await reduceInventoryAfterPayment(order.id);
  if (!inv.ok) {
    return { ok: false, message: `Payment recorded; inventory error: ${inv.message}` };
  }

  return { ok: true, message: "Payment recorded" };
}
