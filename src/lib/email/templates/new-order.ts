import { absoluteAssetUrl, infoRow, wrapEmailHtml } from "@/lib/email/templates/layout";

export type OrderEmailLine = {
  name: string;
  variant?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl?: string | null;
};

export type NewOrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city?: string | null;
  paymentMethod: string;
  deliveryMethod: string;
  notes?: string | null;
  total: number;
  currency: string;
  items: OrderEmailLine[];
  adminUrl?: string;
};

export function renderNewOrderEmail(data: NewOrderEmailData): { subject: string; html: string } {
  const rows = data.items
    .map((item) => {
      const img = absoluteAssetUrl(item.imageUrl);
      const imgCell = img
        ? `<img src="${img}" alt="" width="56" height="56" style="display:block;border-radius:10px;background:#0f172a;object-fit:contain;"/>`
        : `<div style="width:56px;height:56px;border-radius:10px;background:#1e293b;"></div>`;
      return `<tr>
        <td style="padding:12px 8px;border-bottom:1px solid #1e293b;vertical-align:middle;">${imgCell}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #1e293b;vertical-align:middle;">
          <div style="font-weight:700;color:#f8fafc;font-size:14px;">${escapeHtml(item.name)}</div>
          ${item.variant ? `<div style="font-size:12px;color:#94a3b8;margin-top:4px;">${escapeHtml(item.variant)}</div>` : ""}
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #1e293b;text-align:center;color:#e2e8f0;">×${item.quantity}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #1e293b;text-align:left;color:#fb923c;font-weight:700;white-space:nowrap;">₪${item.lineTotal.toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  const body = `
    <p style="margin:0 0 16px;">התקבלה הזמנה חדשה ב-DESIGMA.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:12px 0;">
      ${infoRow("מס׳ הזמנה", data.orderNumber)}
      ${infoRow("לקוח", data.customerName)}
      ${infoRow("טלפון", data.customerPhone)}
      ${infoRow("אימייל", data.customerEmail)}
      ${infoRow("עיר / כתובת", data.city || "—")}
      ${infoRow("תשלום", data.paymentMethod)}
      ${infoRow("משלוח", data.deliveryMethod)}
    </table>
    ${data.notes ? `<div style="margin:16px 0;padding:12px;background:#0f172a;border-radius:10px;border:1px solid #334155;"><strong>הערות:</strong> ${escapeHtml(data.notes)}</div>` : ""}
    <h3 style="margin:24px 0 12px;font-size:15px;color:#f97316;">מוצרים</h3>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #1e293b;border-radius:12px;overflow:hidden;">
      <thead>
        <tr style="background:#0f172a;">
          <th style="padding:10px 8px;font-size:11px;color:#94a3b8;text-align:right;"></th>
          <th style="padding:10px 8px;font-size:11px;color:#94a3b8;text-align:right;">מוצר</th>
          <th style="padding:10px 8px;font-size:11px;color:#94a3b8;text-align:center;">כמות</th>
          <th style="padding:10px 8px;font-size:11px;color:#94a3b8;text-align:left;">סה״כ</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin:20px 0 0;font-size:20px;font-weight:800;color:#fff;text-align:left;">סה״כ: <span style="color:#fb923c;">₪${data.total.toFixed(2)}</span></p>
    ${data.adminUrl ? `<p style="margin-top:20px;"><a href="${data.adminUrl}" style="color:#f97316;font-weight:600;">פתח הזמנה באדמין →</a></p>` : ""}
  `;

  return {
    subject: `🛒 New Order #${data.orderNumber}`,
    html: wrapEmailHtml(`הזמנה ${data.orderNumber}`, body, `הזמנה חדשה ${data.orderNumber}`),
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
