import {
  emailButton,
  infoRow,
  telLink,
  whatsAppLink,
  wrapEmailHtml,
} from "@/lib/email/templates/layout";

export type ContactLeadEmailData = {
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

  const actions = [
    tel ? emailButton(tel, "📞 התקשר") : "",
    wa ? emailButton(wa, "💬 WhatsApp", false) : "",
    mail ? emailButton(mail, "✉️ השב במייל", false) : "",
  ].join("");

  const body = `
    <p style="margin:0 0 16px;color:#e2e8f0;">התקבלה פנייה חדשה מהאתר.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;">
      ${infoRow("שם", data.name)}
      ${infoRow("טלפון", data.phone || "—")}
      ${infoRow("אימייל", data.email || "—")}
      ${infoRow("תאריך", when)}
    </table>
    <div style="margin:20px 0;padding:16px;background:#0f172a;border-radius:12px;border:1px solid #334155;">
      <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">הודעה</div>
      <div style="white-space:pre-wrap;color:#f8fafc;font-size:14px;line-height:1.6;">${escapeHtml(data.message)}</div>
    </div>
    <div style="margin-top:24px;">${actions}</div>
  `;

  return {
    subject: "🔥 New Contact Lead - DESIGMA",
    html: wrapEmailHtml("פנייה חדשה", body, `פנייה מ${data.name}`),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
