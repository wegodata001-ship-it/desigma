import "server-only";

import type { StoreEmailBrand } from "@/lib/email/store-branding";
import { emailButton, infoRow, telLink, whatsAppLink, wrapEmailHtml } from "@/lib/email/templates/layout";
import {
  escapeHtml,
  formatMoney,
  renderOrderItemsTable,
  renderOrderTotals,
  type OrderEmailLine,
} from "@/lib/email/templates/order-shared";

export type NewOrderEmailData = {
  brand: StoreEmailBrand;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address?: string | null;
  paymentMethod: string;
  deliveryMethod: string;
  notes?: string | null;
  subtotal: number;
  deliveryPrice: number;
  discountAmount: number;
  pointsDiscount: number;
  total: number;
  currency: string;
  items: OrderEmailLine[];
  adminUrl?: string;
};

export function renderNewOrderEmail(data: NewOrderEmailData): { subject: string; html: string } {
  const accent = data.brand.accentColor;
  const body = `
    <div style="padding:14px 18px;background:#0f172a;border-radius:12px;border-right:4px solid ${accent};margin-bottom:20px;">
      <div style="font-size:18px;font-weight:800;color:#fff;">🔔 הזמנה חדשה התקבלה</div>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:12px 0;">
      ${infoRow("מס׳ הזמנה", escapeHtml(data.orderNumber))}
      ${infoRow("לקוח", escapeHtml(data.customerName))}
      ${infoRow("טלפון", escapeHtml(data.customerPhone))}
      ${infoRow("אימייל", escapeHtml(data.customerEmail))}
      ${infoRow("כתובת", data.address?.trim() ? escapeHtml(data.address) : "—")}
      ${infoRow("תשלום", escapeHtml(data.paymentMethod))}
      ${infoRow("משלוח", escapeHtml(data.deliveryMethod))}
    </table>
    ${data.notes?.trim() ? `<div style="margin:16px 0;padding:12px;background:#0f172a;border-radius:10px;border:1px solid #334155;"><strong>הערות:</strong> ${escapeHtml(data.notes)}</div>` : ""}
    <h3 style="margin:24px 0 12px;font-size:14px;color:${accent};">מוצרים</h3>
    ${renderOrderItemsTable(data.items, accent)}
    ${renderOrderTotals({
      subtotal: data.subtotal,
      deliveryPrice: data.deliveryPrice,
      discountAmount: data.discountAmount,
      pointsDiscount: data.pointsDiscount,
      total: data.total,
      currency: data.currency,
      accent,
    })}
    ${data.adminUrl ? `<p style="margin-top:20px;text-align:center;">${emailButton(data.adminUrl, "פתח הזמנה באדמין", accent)}</p>` : ""}
  `;

  return {
    subject: `התקבלה הזמנה חדשה #${data.orderNumber}`,
    html: wrapEmailHtml("הזמנה חדשה", body, {
      preheader: `הזמנה חדשה ${data.orderNumber} — ${formatMoney(data.total, data.currency)}`,
      brand: { name: data.brand.name, logoUrl: data.brand.logoUrl, accentColor: accent },
    }),
  };
}
