import "server-only";

import { prisma } from "@/lib/prisma";
import { getEmailConfig, isEmailConfigured } from "@/lib/email/config";
import { loadOrderEmailPayload } from "@/lib/email/order-email-data";
import { logEmailFailure, logEmailSkipped, logEmailSuccess } from "@/lib/email/logger";
import { isOrderPaidForEmail } from "@/lib/payments/post-payment-emails";
import {
  emailAdminPath,
  emailOrderViewUrl,
  emailPublicPath,
  getEmailPublicBaseUrl,
  sanitizeEmailHtml,
} from "@/lib/email/email-links";
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

type SendOpts = {
  to: string;
  subject: string;
  html: string;
  type: Parameters<typeof logEmailSuccess>[0];
  meta?: { orderId?: string };
};

async function sendMail(opts: SendOpts): Promise<void> {
  console.log("EMAIL SEND START", {
    type: opts.type,
    to: opts.to,
    orderId: opts.meta?.orderId,
  });

  if (!isEmailConfigured()) {
    logEmailSkipped(opts.type, "smtp_not_configured");
    console.error("EMAIL ERROR", { type: opts.type, reason: "smtp_not_configured" });
    throw new Error("SMTP not configured (SMTP_USER / SMTP_PASS / EMAIL_FROM_ADDRESS)");
  }
  const transporter = getMailTransporter();
  if (!transporter) {
    logEmailSkipped(opts.type, "transporter_unavailable");
    console.error("EMAIL ERROR", { type: opts.type, reason: "transporter_unavailable" });
    throw new Error("SMTP transporter unavailable");
  }
  const cfg = getEmailConfig();
  const html = sanitizeEmailHtml(opts.html);
  try {
    await transporter.sendMail({
      from: `"${cfg.fromName}" <${cfg.fromAddress}>`,
      to: opts.to,
      subject: opts.subject,
      html,
    });
    logEmailSuccess(opts.type, opts.to, opts.meta);
    console.log("EMAIL SEND OK", { type: opts.type, to: opts.to, orderId: opts.meta?.orderId });
  } catch (err) {
    console.error("EMAIL ERROR", { type: opts.type, to: opts.to, orderId: opts.meta?.orderId, err });
    logEmailFailure(opts.type, opts.to, err, opts.meta);
    throw err;
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

/** Customer order confirmation (after payment). */
export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  console.log("EMAIL SEND START", { flow: "order_confirmation", orderId });

  if (!(await isOrderPaidForEmail(orderId))) {
    logEmailSkipped("order_confirmation", "payment_not_paid");
    console.warn("[email] order_confirmation skipped — payment_not_paid", { orderId });
    return;
  }
  const payload = await loadOrderEmailPayload(orderId);
  if (!payload) {
    logEmailSkipped("order_confirmation", "order_not_found");
    console.warn("[email] order_confirmation skipped — order_not_found", { orderId });
    return;
  }
  const customerEmail = payload.order.customerEmail?.trim();
  if (!customerEmail) {
    logEmailSkipped("order_confirmation", "no_customer_email");
    console.warn("[email] order_confirmation skipped — no_customer_email", { orderId });
    return;
  }

  console.log("EMAIL SEND START", {
    type: "order_confirmation",
    orderId,
    orderNumber: payload.order.orderNumber,
    customerEmail,
  });

  const brand = await loadStoreEmailBrand(payload.order.storeId);
  const { subject, html } = renderOrderConfirmationEmail({
    brand,
    order: payload.order,
    items: payload.items,
    currency: payload.currency,
    paymentLabel: payload.paymentLabel,
    statusLabel: payload.statusLabel,
  });

  console.log("[email] order_confirmation links", {
    orderNumber: payload.order.orderNumber,
    viewOrderUrl: emailOrderViewUrl(payload.order.orderNumber),
    publicBase: getEmailPublicBaseUrl(),
  });

  await sendMail({
    to: customerEmail,
    subject,
    html,
    type: "order_confirmation",
    meta: { orderId },
  });
}

/** Owner / admin new-order alert (after payment). */
export async function sendNewOrderEmail(orderId: string): Promise<void> {
  console.log("EMAIL SEND START", { flow: "new_order", orderId });

  if (!(await isOrderPaidForEmail(orderId))) {
    logEmailSkipped("new_order", "payment_not_paid");
    console.warn("[email] new_order skipped — payment_not_paid", { orderId });
    return;
  }
  const payload = await loadOrderEmailPayload(orderId);
  if (!payload) {
    logEmailSkipped("new_order", "order_not_found");
    return;
  }

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
    adminUrl: emailAdminPath(`/orders/${encodeURIComponent(order.id)}`),
  });

  await sendMail({ to: adminTo, subject, html, type: "new_order", meta: { orderId } });
}

export async function sendOrderStatusEmail(
  orderId: string,
  statusKey: string,
  extras?: { trackingNumber?: string | null; carrier?: string | null },
): Promise<void> {
  const payload = await loadOrderEmailPayload(orderId);
  if (!payload) {
    logEmailSkipped("order_status", "order_not_found");
    return;
  }
  if (!payload.order.customerEmail?.trim()) {
    logEmailSkipped("order_status", "no_customer_email");
    return;
  }

  const brand = await loadStoreEmailBrand(payload.order.storeId);
  const order = payload.order;
  const { subject, html } = renderOrderStatusEmail({
    brand,
    customerName: order.customerName,
    orderNumber: order.orderNumber,
    orderId: order.id,
    statusKey,
    statusLabel: payload.statusLabel,
    trackingStatus: order.trackingStatus,
    total: Number(order.total),
    currency: payload.currency,
    trackingNumber: extras?.trackingNumber ?? order.trackingNumber,
    carrier: extras?.carrier ?? order.trackingCarrier,
    trackingUrl: order.trackingUrl,
  });

  await sendMail({
    to: payload.order.customerEmail,
    subject,
    html,
    type: "order_status",
    meta: { orderId },
  });
}

export async function sendCustomerWelcomeEmail(storeId: string, data: { name: string; email: string }): Promise<void> {
  const brand = await loadStoreEmailBrand(storeId);
  const { subject, html } = renderWelcomeEmail({
    brand,
    name: data.name,
    shopUrl: emailPublicPath("/products"),
  });
  await sendMail({ to: data.email, subject, html, type: "welcome" });
}

export async function sendPasswordResetEmail(
  storeId: string,
  data: { name: string; email: string; resetUrl: string },
): Promise<void> {
  const brand = await loadStoreEmailBrand(storeId);
  let resetUrl = data.resetUrl;
  try {
    const u = new URL(resetUrl);
    if (/localhost|127\.0\.0\.1/i.test(u.hostname)) {
      resetUrl = emailPublicPath(`${u.pathname}${u.search}`);
    }
  } catch {
    if (resetUrl.startsWith("/")) resetUrl = emailPublicPath(resetUrl);
  }
  const { subject, html } = renderPasswordResetEmail({ brand, name: data.name, resetUrl });
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

/** Fire-and-forget — never blocks the caller; logs failures to Vercel/runtime logs. */
export function queueEmail(task: () => Promise<void>): void {
  void task().catch((err) => {
    console.error("[email] queue_task_failed", err);
    logEmailFailure("generic", "queue", err);
  });
}
