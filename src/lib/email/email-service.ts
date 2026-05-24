import "server-only";

import { getAppUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { getEmailConfig, isEmailConfigured } from "@/lib/email/config";
import { logEmailFailure, logEmailSkipped, logEmailSuccess } from "@/lib/email/logger";
import { getMailTransporter } from "@/lib/email/transporter";
import { renderContactLeadEmail } from "@/lib/email/templates/contact-lead";
import { renderNewOrderEmail, type OrderEmailLine } from "@/lib/email/templates/new-order";
import { renderOrderStatusEmail } from "@/lib/email/templates/order-status";
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

export async function sendContactLeadEmail(data: {
  name: string;
  phone?: string | null;
  email?: string | null;
  message: string;
  createdAt: Date;
}): Promise<void> {
  const cfg = getEmailConfig();
  if (!cfg.contactReceiver) {
    logEmailSkipped("contact_lead", "no_contact_receiver");
    return;
  }
  const { subject, html } = renderContactLeadEmail(data);
  await sendMail({ to: cfg.contactReceiver, subject, html, type: "contact_lead" });
}

export async function sendNewOrderEmail(orderId: string): Promise<void> {
  const cfg = getEmailConfig();
  if (!cfg.adminOrderReceiver) {
    logEmailSkipped("new_order", "no_admin_receiver");
    return;
  }
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const variantIds = order.items.flatMap((i) =>
    Array.isArray(i.variantOptionIds) ? (i.variantOptionIds as string[]) : [],
  );
  const variantOpts =
    variantIds.length > 0
      ? await prisma.productVariantOption.findMany({
          where: { id: { in: variantIds } },
          include: { group: true },
        })
      : [];
  const variantById = new Map(variantOpts.map((o) => [o.id, o]));

  const items: OrderEmailLine[] = order.items.map((item) => {
    const ids = Array.isArray(item.variantOptionIds) ? (item.variantOptionIds as string[]) : [];
    const variantParts = ids
      .map((id) => {
        const o = variantById.get(id);
        return o ? `${o.group.name}: ${o.value}` : null;
      })
      .filter(Boolean);
    return {
      name: item.productName,
      variant: variantParts.length ? variantParts.join(" · ") : null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.totalPrice),
      imageUrl: item.productImage,
    };
  });

  const settings = await prisma.storeSettings.findUnique({ where: { storeId: order.storeId } });
  const currency = settings?.currency ?? "ILS";
  const paymentMethod =
    order.paymentStatus === "PAID"
      ? "שולם"
      : order.paymentStatus === "FAILED"
        ? "נכשל"
        : "ממתין לתשלום";

  const { subject, html } = renderNewOrderEmail({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    city: order.address,
    paymentMethod,
    deliveryMethod: order.deliveryOptionName,
    notes: order.notes,
    total: Number(order.total),
    currency,
    items,
    adminUrl: `${getAppUrl()}/admin/orders/${order.id}`,
  });

  await sendMail({ to: cfg.adminOrderReceiver, subject, html, type: "new_order" });
}

export async function sendOrderStatusEmail(orderId: string, statusKey: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.customerEmail) return;

  const { subject, html } = renderOrderStatusEmail({
    customerName: order.customerName,
    orderNumber: order.orderNumber,
    statusKey,
    statusLabel: statusKey,
    total: Number(order.total),
  });

  await sendMail({ to: order.customerEmail, subject, html, type: "order_status" });
}

export async function sendCustomerWelcomeEmail(data: { name: string; email: string }): Promise<void> {
  const { subject, html } = renderWelcomeEmail({
    name: data.name,
    shopUrl: `${getAppUrl()}/products`,
  });
  await sendMail({ to: data.email, subject, html, type: "welcome" });
}

export async function sendAdminNotificationEmail(data: {
  subject: string;
  title: string;
  bodyHtml: string;
}): Promise<void> {
  const cfg = getEmailConfig();
  const to = cfg.contactReceiver || cfg.adminOrderReceiver;
  if (!to) {
    logEmailSkipped("admin_notification", "no_receiver");
    return;
  }
  await sendMail({
    to,
    subject: data.subject,
    html: wrapEmailHtml(data.title, data.bodyHtml),
    type: "admin_notification",
  });
}

/** Fire-and-forget — never blocks the caller. */
export function queueEmail(task: () => Promise<void>): void {
  void task().catch(() => {});
}
