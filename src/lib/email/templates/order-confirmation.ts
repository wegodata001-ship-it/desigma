import "server-only";

import type { Order } from "@prisma/client";
import type { StoreEmailBrand } from "@/lib/email/store-branding";
import { infoRow, wrapEmailHtml } from "@/lib/email/templates/layout";
import {
  escapeHtml,
  renderCancellationPolicy,
  renderContactFooter,
  renderLegalFooter,
  renderOrderItemsTable,
  renderOrderTotals,
  renderShippingPolicyBrief,
  renderTrackOrderButton,
  renderViewOrderButton,
  type OrderEmailLine,
} from "@/lib/email/templates/order-shared";

export type OrderConfirmationEmailData = {
  brand: StoreEmailBrand;
  order: Order;
  items: OrderEmailLine[];
  currency: string;
  paymentLabel: string;
  statusLabel: string;
};

function formatOrderDate(d: Date): string {
  return d.toLocaleString("he-IL", { timeZone: "Asia/Jerusalem", dateStyle: "medium", timeStyle: "short" });
}

export function renderOrderConfirmationEmail(data: OrderConfirmationEmailData): { subject: string; html: string } {
  const { brand, order, items, currency, paymentLabel, statusLabel } = data;
  const accent = brand.accentColor;

  const body = `
    <div style="padding:14px 18px;background:#0f172a;border-radius:12px;border-right:4px solid ${accent};margin-bottom:20px;">
      <div style="font-size:18px;font-weight:800;color:#fff;">✅ ההזמנה התקבלה</div>
      <div style="margin-top:6px;font-size:13px;color:#94a3b8;">תודה שקניתם ב-${escapeHtml(brand.name)}!</div>
    </div>

    <h3 style="margin:24px 0 12px;font-size:14px;color:${accent};">פרטי לקוח</h3>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${infoRow("שם", escapeHtml(order.customerName))}
      ${infoRow("טלפון", escapeHtml(order.customerPhone))}
      ${infoRow("אימייל", escapeHtml(order.customerEmail))}
    </table>

    <h3 style="margin:24px 0 12px;font-size:14px;color:${accent};">פרטי הזמנה</h3>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${infoRow("מס׳ הזמנה", escapeHtml(order.orderNumber))}
      ${infoRow("תאריך", formatOrderDate(order.createdAt))}
      ${infoRow("סטטוס", escapeHtml(statusLabel))}
      ${infoRow("תשלום", escapeHtml(paymentLabel))}
    </table>

    <h3 style="margin:24px 0 12px;font-size:14px;color:${accent};">מוצרים</h3>
    ${renderOrderItemsTable(items, accent)}

    <h3 style="margin:24px 0 12px;font-size:14px;color:${accent};">סיכום כספי</h3>
    ${renderOrderTotals({
      subtotal: Number(order.subtotal),
      deliveryPrice: Number(order.deliveryPrice),
      discountAmount: Number(order.discountAmount),
      pointsDiscount: Number(order.pointsDiscountAmount),
      total: Number(order.total),
      currency,
      accent,
    })}

    <h3 style="margin:24px 0 12px;font-size:14px;color:${accent};">פרטי משלוח</h3>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${infoRow("סוג משלוח", escapeHtml(order.deliveryOptionName))}
      ${infoRow("כתובת", order.address?.trim() ? escapeHtml(order.address) : "—")}
    </table>
    ${order.notes?.trim() ? `<div style="margin:16px 0;padding:12px;background:#0f172a;border-radius:10px;border:1px solid #334155;font-size:13px;"><strong>הערות:</strong> ${escapeHtml(order.notes)}</div>` : ""}

    ${renderCancellationPolicy(brand)}
    ${renderShippingPolicyBrief()}
    ${renderContactFooter(brand)}
    ${renderViewOrderButton(brand, order.orderNumber)}
    ${renderTrackOrderButton(brand, order.orderNumber)}
    ${renderLegalFooter(brand)}
  `;

  return {
    subject: `אישור הזמנה #${order.orderNumber} - ${brand.name}`,
    html: wrapEmailHtml("אישור הזמנה", body, {
      preheader: `הזמנה ${order.orderNumber} התקבלה בהצלחה`,
      brand: { name: brand.name, logoUrl: brand.logoUrl, accentColor: accent },
    }),
  };
}
