import "server-only";

import { OrderPaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logEmailSkipped } from "@/lib/email/logger";
import { sendNewOrderEmail, sendOrderConfirmationEmail } from "@/lib/email/email-service";

export async function isOrderPaidForEmail(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true },
  });
  return order?.paymentStatus === OrderPaymentStatus.PAID;
}

/**
 * Post-payment customer + owner emails.
 * Only runs when paymentStatus === PAID (order confirmation, receipt, owner alert).
 */
export async function sendPostPaymentOrderEmails(orderId: string): Promise<void> {
  if (!(await isOrderPaidForEmail(orderId))) {
    logEmailSkipped("order_confirmation", "payment_not_paid");
    return;
  }
  await sendOrderConfirmationEmail(orderId);
  await sendNewOrderEmail(orderId);
}
