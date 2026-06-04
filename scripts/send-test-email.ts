import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import nodemailer from "nodemailer";

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
const to =
  process.env.CONTACT_RECEIVER_EMAIL?.trim() ||
  process.env.STORE_OWNER_EMAIL?.trim() ||
  "";

if (!user || !pass) {
  console.error("Missing SMTP_USER or SMTP_PASS in .env / .env.local");
  process.exit(1);
}
if (!to) {
  console.error("Missing CONTACT_RECEIVER_EMAIL or STORE_OWNER_EMAIL");
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

const now = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });

const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<body style="margin:0;padding:32px;background:#0a0f1a;font-family:Segoe UI,Arial,sans-serif;color:#e2e8f0;">
  <div style="max-width:520px;margin:0 auto;background:#111827;border-radius:16px;border:1px solid #1e293b;overflow:hidden;">
    <div style="padding:24px;border-bottom:2px solid #f97316;">
      <div style="font-size:11px;letter-spacing:0.2em;color:#f97316;font-weight:700;">DESIGMA</div>
      <h1 style="margin:8px 0 0;font-size:22px;color:#fff;">מייל ניסיון ✅</h1>
    </div>
    <div style="padding:24px;line-height:1.6;">
      <p>שלום,</p>
      <p>זהו מייל בדיקה ממערכת DESIGMA. אם קיבלת את ההודעה — Brevo SMTP מוגדר ועובד.</p>
      <p style="color:#94a3b8;font-size:13px;margin-top:24px;">נשלח: ${now}</p>
    </div>
  </div>
</body>
</html>`;

async function main() {
  console.log(`Sending test email to ${to} via ${host}:${port}…`);
  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: "✅ DESIGMA — מייל ניסיון",
    html,
  });
  console.log("Sent:", info.messageId);
  console.log("Response:", info.response);
}

main().catch((err) => {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
