import type { OrderTrackingStatus } from "@prisma/client";
import type { StoreEmailBrand } from "@/lib/email/store-branding";
import { TRACKING_LABELS_HE } from "@/lib/orders/tracking-status";
import { emailButton, infoRow, wrapEmailHtml } from "@/lib/email/templates/layout";
import {
  escapeHtml,
  formatMoney,
  renderContactFooter,
  renderLegalFooter,
  renderTrackOrderButton,
  renderViewOrderButton,
} from "@/lib/email/templates/order-shared";

const LEGACY_STATUS_LABELS: Record<string, string> = {
  RECEIVED: "ההזמנה התקבלה",
  PROCESSING: "ההזמנה בטיפול",
  PACKED: "ההזמנה ארוזה ומוכנה לשליחה",
  SHIPPED: "ההזמנה נשלחה",
  COMPLETED: "ההזמנה הושלמה",
  CANCELLED: "ההזמנה בוטלה",
};

export function renderOrderStatusEmail(data: {
  brand: StoreEmailBrand;
  customerName: string;
  orderNumber: string;
  orderId: string;
  statusLabel: string;
  statusKey: string;
  trackingStatus?: OrderTrackingStatus;
  total: number;
  currency?: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  trackingUrl?: string | null;
}): { subject: string; html: string } {
  const label =
    (data.trackingStatus && TRACKING_LABELS_HE[data.trackingStatus]) ||
    LEGACY_STATUS_LABELS[data.statusKey] ||
    data.statusLabel;
  const accent = data.brand.accentColor;
  const currency = data.currency ?? "ILS";

  const showShip =
    (data.trackingStatus === "SHIPPED" || data.statusKey === "SHIPPED") &&
    (data.trackingUrl || data.trackingNumber || data.carrier);

  const trackingBlock = showShip
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;padding:16px;background:#0f172a;border-radius:12px;border:1px solid #334155;">
          ${data.trackingNumber ? infoRow("מספר מעקב", escapeHtml(data.trackingNumber)) : ""}
          ${data.carrier ? infoRow("חברת משלוחים", escapeHtml(data.carrier)) : ""}
        </table>
        ${data.trackingUrl ? `<p style="margin:16px 0;text-align:center;">${emailButton(data.trackingUrl, "עקוב אחרי המשלוח", accent)}</p>` : ""}`
    : "";

  const body = `
    <p style="margin:0 0 16px;">שלום ${escapeHtml(data.customerName)},</p>
    <p style="margin:0 0 20px;">ההזמנה שלך עודכנה — <strong>${escapeHtml(data.orderNumber)}</strong>:</p>
    <div style="padding:16px 20px;background:#0f172a;border-radius:12px;border-right:4px solid ${accent};margin-bottom:20px;">
      <div style="font-size:18px;font-weight:800;color:#fff;">${escapeHtml(label)}</div>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${infoRow("מס׳ הזמנה", escapeHtml(data.orderNumber))}
      ${infoRow("סכום", formatMoney(data.total, currency))}
    </table>
    ${trackingBlock}
    ${renderViewOrderButton(data.brand, data.orderNumber)}
    ${renderTrackOrderButton(data.brand, data.orderNumber)}
    ${renderContactFooter(data.brand)}
    ${renderLegalFooter(data.brand)}
    <p style="margin-top:24px;color:#94a3b8;font-size:13px;">תודה שקניתם ב-${escapeHtml(data.brand.name)}.</p>
  `;

  return {
    subject: `ההזמנה שלך עודכנה — #${data.orderNumber}`,
    html: wrapEmailHtml("עדכון הזמנה", body, {
      preheader: label,
      brand: { name: data.brand.name, logoUrl: data.brand.logoUrl, accentColor: accent },
    }),
  };
}
