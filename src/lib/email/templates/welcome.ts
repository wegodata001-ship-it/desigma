import type { StoreEmailBrand } from "@/lib/email/store-branding";
import { emailButton, wrapEmailHtml } from "@/lib/email/templates/layout";
import { escapeHtml, renderContactFooter, renderLegalFooter } from "@/lib/email/templates/order-shared";

export function renderWelcomeEmail(data: {
  brand: StoreEmailBrand;
  name: string;
  shopUrl: string;
}): { subject: string; html: string } {
  const accent = data.brand.accentColor;
  const body = `
    <div style="padding:14px 18px;background:#0f172a;border-radius:12px;border-right:4px solid ${accent};margin-bottom:20px;">
      <div style="font-size:18px;font-weight:800;color:#fff;">ברוכים הבאים ל-${escapeHtml(data.brand.name)}</div>
    </div>
    <p style="margin:0 0 16px;font-size:16px;">שלום ${escapeHtml(data.name)},</p>
    <p style="margin:0 0 16px;">חשבונך נוצר בהצלחה. כעת תוכלו לעקוב אחר הזמנות, לצבור נקודות מועדון ולהנות ממבצעים בלעדיים.</p>
    <p style="margin:0 0 20px;color:#94a3b8;">גלו את המוצרים שלנו והתחילו לקנות בקלות.</p>
    <p style="text-align:center;margin:24px 0;">${emailButton(data.shopUrl, "התחילו לקנות", accent)}</p>
    ${renderContactFooter(data.brand)}
    ${renderLegalFooter(data.brand)}
  `;
  return {
    subject: `ברוכים הבאים ל-${data.brand.name}`,
    html: wrapEmailHtml("ברוכים הבאים", body, {
      preheader: `חשבון נוצר בהצלחה ב-${data.brand.name}`,
      brand: { name: data.brand.name, logoUrl: data.brand.logoUrl, accentColor: accent },
    }),
  };
}
