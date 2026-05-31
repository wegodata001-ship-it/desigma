import "server-only";

import { prisma } from "@/lib/prisma";
import { getEmailConfig, isEmailConfigured } from "@/lib/email/config";
import { loadOrderEmailPayload } from "@/lib/email/order-email-data";
import { logEmailFailure, logEmailSkipped, logEmailSuccess } from "@/lib/email/logger";
import { isOrderPaidForEmail } from "@/lib/payments/post-payment-emails";
import { adminOrderUrl, getStoreUrl } from "@/lib/app-url";
import { loadStoreEmailBrand, resolveAdminOrderEmail } from "@/lib/email/store-branding";
import { getMailTransporter } from "@/lib/email/transporter";
import { renderContactAutoReplyEmail } from "@/lib/email/templates/contact-auto-reply";
import { renderContactLeadEmail } from "@/lib/email/templates/contact-lead";
import { renderNewOrderEmail } from "@/lib/email/templates/new-order";
import { renderOrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { renderOrderStatusEmail } from "@/lib/email/templates/order-status";
import { renderPasswordResetEmail } from "@/lib/email/templates/password-reset";
import { renderWelcomeEmail } from "@/lib/email/templates/welcome";
import { wrapEmailHtml } from "@/lib/email/templates/layout";

type SendOpts = { to: string; subject: string; html: string; type: Parameters<typeof logEmailSuccess>[0] };

async function sendMail(opts: SendOpts): Promise<boolean> {
  if (!isEmailConfigured()) {
    logEmailSkipped(opts.type, "smtp_not_configured");
    return false;
  }
  const transporter = getMailTransporter();
  if (!transporter) {
    logEmailSkipped(opts.type, "transporter_unavailable");
    return false;
  }
  const cfg = getEmailConfig();
  try {
    await transporter.sendMail({
      from: `"${cfg.fromName}" <${cfg.fromAddress}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    logEmailSuccess(opts.type, opts.to);
    return true;
  } catch (err) {
    logEmailFailure(opts.type, opts.to, err);
    return false;
  }
}

export async function sendContactLeadEmail(
  storeId: string,
  data: {
    name: string;
    phone?: string | null;
    email?: string | null;
    message: string;
    createdAt: Date;
  },
): Promise<void> {
  const brand = await loadStoreEmailBrand(storeId);
  const cfg = getEmailConfig();
  const to = resolveAdminOrderEmail(brand) || cfg.contactReceiver;
  if (!to) {
    logEmailSkipped("contact_lead", "no_contact_receiver");
    return;
  }
  const { subject, html } = renderContactLeadEmail({ brand, ...data });
  await sendMail({ to, subject, html, type: "contact_lead" });
}

export async function sendContactAutoReplyEmail(
  storeId: string,
  data: { name: string; email: string },
): Promise<void> {
  if (!data.email?.trim()) return;
  const brand = await loadStoreEmailBrand(storeId);
  const { subject, html } = renderContactAutoReplyEmail({ brand, name: data.name });
  await sendMail({ to: data.email.trim(), subject, html, type: "contact_auto_reply" });
}

export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  if (!(await isOrderPaidForEmail(orderId))) {
    logEmailSkipped("order_confirmation", "payment_not_paid");
    return;
  }
  const payload = await loadOrderEmailPayload(orderId);
  if (!payload?.order.customerEmail) return;

  const brand = await loadStoreEmailBrand(payload.order.storeId);
  const { subject, html } = renderOrderConfirmationEmail({
    brand,
    order: payload.order,
    items: payload.items,
    currency: payload.currency,
    paymentLabel: payload.paymentLabel,
    statusLabel: payload.statusLabel,
  });

  await sendMail({
    to: payload.order.customerEmail,
    subject,
    html,
    type: "order_confirmation",
  });
}

export async function sendNewOrderEmail(orderId: string): Promise<void> {
  if (!(await isOrderPaidForEmail(orderId))) {
    logEmailSkipped("new_order", "payment_not_paid");
    return;
  }
  const payload = await loadOrderEmailPayload(orderId);
  if (!payload) return;

  const brand = await loadStoreEmailBrand(payload.order.storeId);
  const adminTo = resolveAdminOrderEmail(brand);
  if (!adminTo) {
    logEmailSkipped("new_order", "no_admin_receiver");
    return;
  }

  const order = payload.order;
  const { subject, html } = renderNewOrderEmail({
    brand,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    address: order.address,
    paymentMethod: payload.paymentLabel,
    deliveryMethod: order.deliveryOptionName,
    notes: order.notes,
    subtotal: Number(order.subtotal),
    deliveryPrice: Number(order.deliveryPrice),
    discountAmount: Number(order.discountAmount),
    pointsDiscount: Number(order.pointsDiscountAmount),
    total: Number(order.total),
    currency: payload.currency,
    items: payload.items,
    adminUrl: adminOrderUrl(order.id),
  });

  await sendMail({ to: adminTo, subject, html, type: "new_order" });
}

export async function sendOrderStatusEmail(
  orderId: string,
  statusKey: string,
  extras?: { trackingNumber?: string | null; carrier?: string | null },
): Promise<void> {
  const payload = await loadOrderEmailPayload(orderId);
  if (!payload?.order.customerEmail) return;

  const brand = await loadStoreEmailBrand(payload.order.storeId);
  const { subject, html } = renderOrderStatusEmail({
    brand,
    customerName: payload.order.customerName,
    orderNumber: payload.order.orderNumber,
    orderId: payload.order.id,
    statusKey,
    statusLabel: payload.statusLabel,
    total: Number(payload.order.total),
    currency: payload.currency,
    trackingNumber: extras?.trackingNumber,
    carrier: extras?.carrier,
  });

  await sendMail({ to: payload.order.customerEmail, subject, html, type: "order_status" });
}

export async function sendCustomerWelcomeEmail(storeId: string, data: { name: string; email: string }): Promise<void> {
  const brand = await loadStoreEmailBrand(storeId);
  const { subject, html } = renderWelcomeEmail({
    brand,
    name: data.name,
    shopUrl: `${getStoreUrl()}/products`,
  });
  await sendMail({ to: data.email, subject, html, type: "welcome" });
}

export async function sendPasswordResetEmail(
  storeId: string,
  data: { name: string; email: string; resetUrl: string },
): Promise<void> {
  const brand = await loadStoreEmailBrand(storeId);
  const { subject, html } = renderPasswordResetEmail({ brand, name: data.name, resetUrl: data.resetUrl });
  await sendMail({ to: data.email, subject, html, type: "password_reset" });
}

export async function sendAdminNotificationEmail(data: {
  storeId?: string;
  subject: string;
  title: string;
  bodyHtml: string;
}): Promise<void> {
  const cfg = getEmailConfig();
  let to = cfg.contactReceiver || cfg.adminOrderReceiver;
  let brandName = cfg.fromName;
  if (data.storeId) {
    const brand = await loadStoreEmailBrand(data.storeId);
    to = resolveAdminOrderEmail(brand) || to;
    brandName = brand.name;
  }
  if (!to) {
    logEmailSkipped("admin_notification", "no_receiver");
    return;
  }
  await sendMail({
    to,
    subject: data.subject,
    html: wrapEmailHtml(data.title, data.bodyHtml, {
      brand: { name: brandName ?? "Store" },
    }),
    type: "admin_notification",
  });
}

/** Fire-and-forget — never blocks the caller. */
export function queueEmail(task: () => Promise<void>): void {
  void task().catch(() => {});
}
