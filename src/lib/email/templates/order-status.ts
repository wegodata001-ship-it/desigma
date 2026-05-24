import { infoRow, wrapEmailHtml } from "@/lib/email/templates/layout";

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "ההזמנה התקבלה",
  PROCESSING: "ההזמנה בטיפול",
  PACKED: "ההזמנה ארוזה ומוכנה",
  SHIPPED: "ההזמנה נשלחה",
  COMPLETED: "ההזמנה נמסרה",
  CANCELLED: "ההזמנה בוטלה",
  PENDING: "ממתין לאישור",
  PAID: "שולם",
};

export function renderOrderStatusEmail(data: {
  customerName: string;
  orderNumber: string;
  statusLabel: string;
  statusKey: string;
  total: number;
  trackingNote?: string | null;
}): { subject: string; html: string } {
  const label = STATUS_LABELS[data.statusKey] ?? data.statusLabel;
  const body = `
    <p style="margin:0 0 16px;">שלום ${escapeHtml(data.customerName)},</p>
    <p style="margin:0 0 20px;">עדכון סטטוס להזמנה <strong>${escapeHtml(data.orderNumber)}</strong>:</p>
    <div style="padding:16px 20px;background:#0f172a;border-radius:12px;border-left:4px solid #f97316;margin-bottom:20px;">
      <div style="font-size:18px;font-weight:800;color:#fff;">${escapeHtml(label)}</div>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${infoRow("מס׳ הזמנה", data.orderNumber)}
      ${infoRow("סכום", `₪${data.total.toFixed(2)}`)}
    </table>
    ${data.trackingNote ? `<p style="margin-top:16px;color:#94a3b8;">${escapeHtml(data.trackingNote)}</p>` : ""}
    <p style="margin-top:24px;color:#94a3b8;font-size:13px;">תודה שקניתם ב-DESIGMA.</p>
  `;
  return {
    subject: `עדכון הזמנה #${data.orderNumber} — DESIGMA`,
    html: wrapEmailHtml("עדכון הזמנה", body, label),
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
