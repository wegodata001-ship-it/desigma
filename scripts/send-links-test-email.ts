/**
 * Full QA email — all production links (order, track, legal, contact).
 *
 *   npm run email:test-links
 *   npm run email:test-links -- you@example.com
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import nodemailer from "nodemailer";

const BASE = "https://desigma-shop.com";
const SAMPLE_ORDER = "DESIGMA-TEST-LINKS";

function loadEnvFile(name: string, override = false) {
  const path = resolve(process.cwd(), name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (override || process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local", true);

const host = process.env.SMTP_HOST?.trim() || "smtp-relay.brevo.com";
const port = Number(process.env.SMTP_PORT?.trim() || "587");
const user = process.env.SMTP_USER?.trim();
const pass =
  process.env.SMTP_PASS?.trim() ||
  process.env.SMTP_PASSWORD?.trim() ||
  process.env.BREVO_API_KEY?.trim();
const fromName = process.env.EMAIL_FROM_NAME?.trim() || "DESIGMA";
const fromAddress = process.env.EMAIL_FROM_ADDRESS?.trim() || "noreply@desigma-shop.com";
const defaultTo =
  process.env.CONTACT_RECEIVER_EMAIL?.trim() ||
  process.env.STORE_OWNER_EMAIL?.trim() ||
  "";
const to = process.argv[2]?.trim() || defaultTo;

const urls = {
  home: `${BASE}/`,
  order: `${BASE}/orders/${encodeURIComponent(SAMPLE_ORDER)}`,
  trackOrder: `${BASE}/track-order`,
  contact: `${BASE}/contact`,
  terms: `${BASE}/terms`,
  privacy: `${BASE}/privacy`,
  refunds: `${BASE}/refunds`,
  shipping: `${BASE}/shipping`,
  legal: `${BASE}/legal`,
  products: `${BASE}/products`,
};

const accent = "#f97316";

function btn(href: string, label: string, primary = true): string {
  const bg = primary ? accent : "#334155";
  return `<a href="${href}" style="display:inline-block;margin:6px 8px 6px 0;padding:12px 20px;background:${bg};color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">${label}</a>`;
}

function link(href: string, label: string): string {
  return `<a href="${href}" style="color:${accent};font-weight:600;">${label}</a>`;
}

const now = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });

const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0f1a;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0f1a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#111827;border-radius:16px;border:1px solid #1e293b;">
        <tr>
          <td style="padding:24px 28px;border-bottom:2px solid ${accent};">
            <div style="font-size:11px;letter-spacing:0.15em;color:${accent};font-weight:700;">DESIGMA</div>
            <div style="margin-top:6px;font-size:22px;font-weight:800;color:#fff;">מייל ניסיון — כל הקישורים</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;font-size:15px;line-height:1.65;color:#cbd5e1;">
            <p style="margin:0 0 16px;">שלום,</p>
            <p style="margin:0 0 20px;">זהו מייל בדיקה מ-<strong>${BASE}</strong>. לחצי על כל כפתור/קישור לוודא שאין localhost ושאין 404.</p>

            <div style="padding:14px 18px;background:#0f172a;border-radius:12px;border-right:4px solid ${accent};margin-bottom:24px;">
              <div style="font-size:16px;font-weight:800;color:#fff;">הזמנה לדוגמה #${SAMPLE_ORDER}</div>
              <div style="margin-top:6px;font-size:13px;color:#94a3b8;">נשלח: ${now}</div>
            </div>

            <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${accent};">כפתורי פעולה</p>
            <p style="margin:0 0 20px;text-align:center;">
              ${btn(urls.order, "צפייה בהזמנה שלי")}
              ${btn(urls.trackOrder, "מעקב הזמנה", false)}
              ${btn(urls.contact, "צור קשר", false)}
            </p>

            <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${accent};">מסמכים משפטיים</p>
            <p style="margin:0 0 8px;line-height:2;">
              ${link(urls.terms, "תקנון האתר")} ·
              ${link(urls.privacy, "מדיניות פרטיות")} ·
              ${link(urls.refunds, "ביטולים והחזרים")}
            </p>
            <p style="margin:0 0 20px;">
              ${link(urls.shipping, "מדיניות משלוחים")} ·
              ${link(urls.legal, "כל המידע המשפטי")}
            </p>

            <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${accent};">ניווט</p>
            <p style="margin:0 0 20px;">
              ${link(urls.home, "דף הבית")} ·
              ${link(urls.products, "קטלוג מוצרים")}
            </p>

            <div style="margin-top:28px;padding-top:20px;border-top:1px solid #334155;font-size:12px;color:#94a3b8;text-align:center;line-height:1.8;">
              <div style="font-weight:800;font-size:13px;letter-spacing:0.12em;color:#e2e8f0;">DESIGMA</div>
              <p style="margin:8px 0 0;">תודה על ההזמנה.</p>
              <p style="margin:4px 0 0;">לשירות לקוחות:<br/><a href="${urls.contact}" style="color:${accent};">${urls.contact}</a></p>
              <p style="margin:4px 0 0;">תקנון:<br/><a href="${urls.terms}" style="color:${accent};">${urls.terms}</a></p>
              <p style="margin:4px 0 0;">מדיניות פרטיות:<br/><a href="${urls.privacy}" style="color:${accent};">${urls.privacy}</a></p>
              <p style="margin:4px 0 0;">מדיניות החזרות:<br/><a href="${urls.refunds}" style="color:${accent};">${urls.refunds}</a></p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

async function main() {
  if (!user || !pass) {
    console.error("Missing SMTP_USER / SMTP_PASS in .env");
    process.exit(1);
  }
  if (!to) {
    console.error("Missing recipient. Set CONTACT_RECEIVER_EMAIL or pass email as arg.");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 15_000,
  });

  console.log("EMAIL SEND START");
  console.log("To:", to);
  console.log("Links:", urls);

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `✅ DESIGMA — בדיקת קישורים (${BASE})`,
    html,
  });

  console.log("EMAIL SEND OK");
  console.log("MessageId:", info.messageId);
  console.log("Response:", info.response);
}

main().catch((err) => {
  console.error("EMAIL ERROR", err);
  process.exit(1);
});
