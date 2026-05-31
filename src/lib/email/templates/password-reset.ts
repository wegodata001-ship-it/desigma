import type { StoreEmailBrand } from "@/lib/email/store-branding";
import { emailButton, wrapEmailHtml } from "@/lib/email/templates/layout";
import { escapeHtml, renderContactFooter } from "@/lib/email/templates/order-shared";

export function renderPasswordResetEmail(data: {
  brand: StoreEmailBrand;
  name: string;
  resetUrl: string;
}): { subject: string; html: string } {
  const accent = data.brand.accentColor;
  const body = `
    <p style="margin:0 0 16px;">שלום ${escapeHtml(data.name)},</p>
    <p style="margin:0 0 16px;">קיבלנו בקשה לאיפוס הסיסמה שלך ב-${escapeHtml(data.brand.name)}.</p>
    <p style="margin:0 0 20px;color:#94a3b8;">לחץ על הכפתור למטה כדי לבחור סיסמה חדשה. הקישור תקף לזמן מוגבל.</p>
    <p style="text-align:center;margin:24px 0;">${emailButton(data.resetUrl, "איפוס סיסמה", accent)}</p>
    <p style="margin:16px 0 0;font-size:12px;color:#64748b;">אם לא ביקשת איפוס סיסמה, ניתן להתעלם ממייל זה.</p>
    ${renderContactFooter(data.brand)}
  `;
  return {
    subject: `איפוס סיסמה — ${data.brand.name}`,
    html: wrapEmailHtml("איפוס סיסמה", body, {
      preheader: "קישור מאובטח לאיפוס סיסמה",
      brand: { name: data.brand.name, logoUrl: data.brand.logoUrl, accentColor: accent },
    }),
  };
}
