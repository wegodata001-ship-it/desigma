import "server-only";

import { queueEmail, sendNewOrderEmail, sendOrderStatusEmail } from "@/lib/email/email-service";

export function notifyNewOrderToOwnerAsync(orderId: string): void {
  queueEmail(() => sendNewOrderEmail(orderId));
}

export type OrderNotificationPayload = {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: number;
  currency: string;
};

export function notifyOrderConfirmationToCustomer(payload: OrderNotificationPayload): Promise<void> {
  queueEmail(() => sendOrderStatusEmail(payload.orderId, "RECEIVED"));
  return Promise.resolve();
}

export function notifyOrderPaidToOwner(payload: OrderNotificationPayload): Promise<void> {
  queueEmail(() => sendNewOrderEmail(payload.orderId));
  return Promise.resolve();
}
