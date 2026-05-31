import "server-only";

import {
  queueEmail,
  sendOrderStatusEmail,
} from "@/lib/email/email-service";
import { sendPostPaymentOrderEmails } from "@/lib/payments/post-payment-emails";

/** Sends customer confirmation + owner notification — only when order is PAID. */
export function notifyOrderPaidEmailsAsync(orderId: string): void {
  queueEmail(() => sendPostPaymentOrderEmails(orderId));
}

/** @deprecated Do not call on checkout create — use notifyOrderPaidEmailsAsync after payment. */
export function notifyNewOrderToOwnerAsync(_orderId: string): void {
  // Intentionally no-op: owner is notified after payment via notifyOrderPaidEmailsAsync.
}

/** @deprecated Do not call on checkout create — use notifyOrderPaidEmailsAsync after payment. */
export function notifyOrderConfirmationToCustomerAsync(_orderId: string): void {
  // Intentionally no-op: confirmation is sent after payment via notifyOrderPaidEmailsAsync.
}

export type OrderNotificationPayload = {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: number;
  currency: string;
};

/** @deprecated Use notifyOrderPaidEmailsAsync(orderId) after payment succeeds. */
export function notifyOrderConfirmationToCustomer(payload: OrderNotificationPayload): Promise<void> {
  notifyOrderPaidEmailsAsync(payload.orderId);
  return Promise.resolve();
}

/** @deprecated Use notifyOrderPaidEmailsAsync(orderId) after payment succeeds. */
export function notifyOrderPaidToOwner(payload: OrderNotificationPayload): Promise<void> {
  notifyOrderPaidEmailsAsync(payload.orderId);
  return Promise.resolve();
}

export function notifyOrderStatusChangeAsync(
  orderId: string,
  statusKey: string,
  extras?: { trackingNumber?: string | null; carrier?: string | null },
): void {
  queueEmail(() => sendOrderStatusEmail(orderId, statusKey, extras));
}
