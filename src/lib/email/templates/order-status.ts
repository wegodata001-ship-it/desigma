import type { StoreEmailBrand } from "@/lib/email/store-branding";
import { infoRow, wrapEmailHtml } from "@/lib/email/templates/layout";
import {
  escapeHtml,
  formatMoney,
  renderContactFooter,
  renderLegalFooter,
  renderViewOrderButton,
} from "@/lib/email/templates/order-shared";

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "ההזמנה התקבלה",
  PROCESSING: "ההזמנה בטיפול",
  PACKED: "ההזמנה ארוזה ומוכנה לשליחה",
  SHIPPED: "ההזמנה נשלחה",
  COMPLETED: "ההזמנה הושלמה",
  CANCELLED: "ההזמנה בוטלה",
};

const STATUS_SUBJECTS: Record<string, (orderNumber: string, storeName: string) => string> = {
  RECEIVED: (n, s) => `הזמנה #${n} התקבלה — ${s}`,
  PROCESSING: (n, s) => `הזמנה #${n} בטיפול — ${s}`,
  PACKED: (n, s) => `הזמנה #${n} ארוזה — ${s}`,
  SHIPPED: (n) => `הזמנה #${n} נשלחה`,
  COMPLETED: (n, s) => `הזמנה #${n} הושלמה — ${s}`,
  CANCELLED: (n) => `הזמנה #${n} בוטלה`,
};

export function renderOrderStatusEmail(data: {
  brand: StoreEmailBrand;
  customerName: string;
  orderNumber: string;
  orderId: string;
  statusLabel: string;
  statusKey: string;
  total: number;
  currency?: string;
  trackingNumber?: string | null;
  carrier?: string | null;
}): { subject: string; html: string } {
  const label = STATUS_LABELS[data.statusKey] ?? data.statusLabel;
  const accent = data.brand.accentColor;
  const currency = data.currency ?? "ILS";

  const trackingBlock =
    data.statusKey === "SHIPPED" && (data.trackingNumber || data.carrier)
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;padding:16px;background:#0f172a;border-radius:12px;border:1px solid #334155;">
          ${data.trackingNumber ? infoRow("מספר מעקב", escapeHtml(data.trackingNumber)) : ""}
          ${data.carrier ? infoRow("חברת משלוחים", escapeHtml(data.carrier)) : ""}
        </table>`
      : "";

  const body = `
    <p style="margin:0 0 16px;">שלום ${escapeHtml(data.customerName)},</p>
    <p style="margin:0 0 20px;">עדכון סטטוס להזמנה <strong>${escapeHtml(data.orderNumber)}</strong>:</p>
    <div style="padding:16px 20px;background:#0f172a;border-radius:12px;border-right:4px solid ${accent};margin-bottom:20px;">
      <div style="font-size:18px;font-weight:800;color:#fff;">${escapeHtml(label)}</div>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${infoRow("מס׳ הזמנה", escapeHtml(data.orderNumber))}
      ${infoRow("סכום", formatMoney(data.total, currency))}
    </table>
    ${trackingBlock}
    ${renderViewOrderButton(data.brand, data.orderNumber)}
    ${renderContactFooter(data.brand)}
    ${renderLegalFooter(data.brand)}
    <p style="margin-top:24px;color:#94a3b8;font-size:13px;">תודה שקניתם ב-${escapeHtml(data.brand.name)}.</p>
  `;

  const subjectFn = STATUS_SUBJECTS[data.statusKey];
  const subject = subjectFn
    ? subjectFn(data.orderNumber, data.brand.name)
    : `עדכון הזמנה #${data.orderNumber} — ${data.brand.name}`;

  return {
    subject,
    html: wrapEmailHtml("עדכון הזמנה", body, {
      preheader: label,
      brand: { name: data.brand.name, logoUrl: data.brand.logoUrl, accentColor: accent },
    }),
  };
}
