import { emailButton, wrapEmailHtml } from "@/lib/email/templates/layout";

export function renderWelcomeEmail(data: { name: string; shopUrl: string }): { subject: string; html: string } {
  const body = `
    <p style="margin:0 0 16px;font-size:16px;">שלום ${escapeHtml(data.name)},</p>
    <p style="margin:0 0 16px;">ברוכים הבאים ל-<strong style="color:#fb923c;">DESIGMA</strong> — חנות האלקטרוניקה הפרימיום שלך.</p>
    <p style="margin:0 0 20px;color:#94a3b8;">גלו מבצעים, נקודות מועדון והזמנות מהירות מהחשבון האישי.</p>
    ${emailButton(data.shopUrl, "🛍️ התחילו לקנות")}
  `;
  return {
    subject: "Welcome to DESIGMA",
    html: wrapEmailHtml("ברוכים הבאים ל-DESIGMA", body, "Welcome to DESIGMA"),
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
