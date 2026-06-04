import "server-only";

import { OrderPaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logEmailSkipped } from "@/lib/email/logger";
import { sendNewOrderEmail, sendOrderConfirmationEmail } from "@/lib/email/email-service";

export async function isOrderPaidForEmail(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true, customerEmail: true },
  });
  return order?.paymentStatus === OrderPaymentStatus.PAID;
}

/**
 * Post-payment customer + owner emails.
 * Only runs when paymentStatus === PAID (order confirmation, receipt, owner alert).
 */
export async function sendPostPaymentOrderEmails(orderId: string): Promise<void> {
  console.log("EMAIL SEND START", { flow: "post_payment", orderId });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true, customerEmail: true, orderNumber: true },
  });

  if (!order) {
    logEmailSkipped("order_confirmation", "order_not_found");
    console.warn("[email] post_payment skipped — order_not_found", { orderId });
    return;
  }

  console.log("EMAIL SEND START", {
    orderId,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    paymentStatus: order.paymentStatus,
  });

  if (order.paymentStatus !== OrderPaymentStatus.PAID) {
    logEmailSkipped("order_confirmation", "payment_not_paid");
    console.warn("[email] post_payment skipped — payment_not_paid", { orderId });
    return;
  }

  try {
    await sendOrderConfirmationEmail(orderId);
  } catch (err) {
    console.error("EMAIL ERROR", { flow: "order_confirmation", orderId, err });
  }

  try {
    await sendNewOrderEmail(orderId);
  } catch (err) {
    console.error("EMAIL ERROR", { flow: "new_order", orderId, err });
  }
}
