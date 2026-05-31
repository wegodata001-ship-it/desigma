import type { StoreEmailBrand } from "@/lib/email/store-branding";
import { wrapEmailHtml } from "@/lib/email/templates/layout";
import { escapeHtml, renderContactFooter } from "@/lib/email/templates/order-shared";

export function renderContactAutoReplyEmail(data: {
  brand: StoreEmailBrand;
  name: string;
}): { subject: string; html: string } {
  const accent = data.brand.accentColor;
  const body = `
    <p style="margin:0 0 16px;font-size:16px;">שלום ${escapeHtml(data.name)},</p>
    <div style="padding:14px 18px;background:#0f172a;border-radius:12px;border-right:4px solid ${accent};margin-bottom:20px;">
      <div style="font-size:18px;font-weight:800;color:#fff;">קיבלנו את פנייתך</div>
      <div style="margin-top:6px;font-size:13px;color:#94a3b8;">נחזור אליך בהקדם האפשרי.</div>
    </div>
    <p style="margin:0 0 16px;color:#cbd5e1;">תודה שפנית אל ${escapeHtml(data.brand.name)}. צוות השירות שלנו יעיין בפנייה ויצור איתך קשר.</p>
    ${renderContactFooter(data.brand)}
  `;
  return {
    subject: `קיבלנו את פנייתך — ${data.brand.name}`,
    html: wrapEmailHtml("קיבלנו את פנייתך", body, {
      preheader: "נחזור אליך בהקדם",
      brand: { name: data.brand.name, logoUrl: data.brand.logoUrl, accentColor: accent },
    }),
  };
}
