import type { StoreEmailBrand } from "@/lib/email/store-branding";
import { emailButton, infoRow, telLink, whatsAppLink, wrapEmailHtml } from "@/lib/email/templates/layout";
import { escapeHtml } from "@/lib/email/templates/order-shared";

export type ContactLeadEmailData = {
  brand: StoreEmailBrand;
  name: string;
  phone?: string | null;
  email?: string | null;
  message: string;
  createdAt: Date;
};

export function renderContactLeadEmail(data: ContactLeadEmailData): { subject: string; html: string } {
  const when = data.createdAt.toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
  const tel = telLink(data.phone);
  const wa = whatsAppLink(data.phone);
  const mail = data.email?.trim() ? `mailto:${data.email.trim()}` : null;
  const accent = data.brand.accentColor;

  const actions = [
    tel ? emailButton(tel, "התקשר", accent) : "",
    wa ? emailButton(wa, "WhatsApp", false) : "",
    mail ? emailButton(mail, "השב במייל", false) : "",
  ].join("");

  const body = `
    <div style="padding:14px 18px;background:#0f172a;border-radius:12px;border-right:4px solid ${accent};margin-bottom:20px;">
      <div style="font-size:18px;font-weight:800;color:#fff;">פנייה חדשה מהאתר</div>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;">
      ${infoRow("שם", escapeHtml(data.name))}
      ${infoRow("טלפון", data.phone ? escapeHtml(data.phone) : "—")}
      ${infoRow("אימייל", data.email ? escapeHtml(data.email) : "—")}
      ${infoRow("תאריך", when)}
    </table>
    <div style="margin:20px 0;padding:16px;background:#0f172a;border-radius:12px;border:1px solid #334155;">
      <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">הודעה</div>
      <div style="white-space:pre-wrap;color:#f8fafc;font-size:14px;line-height:1.6;">${escapeHtml(data.message)}</div>
    </div>
    <div style="margin-top:24px;">${actions}</div>
  `;

  return {
    subject: `פנייה חדשה מהאתר — ${data.brand.name}`,
    html: wrapEmailHtml("פנייה חדשה", body, {
      preheader: `פנייה מ${data.name}`,
      brand: { name: data.brand.name, logoUrl: data.brand.logoUrl, accentColor: accent },
    }),
  };
}
