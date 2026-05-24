import "server-only";

import { getAppUrl } from "@/lib/app-url";

const BRAND = "#f97316";
const BG = "#0a0f1a";
const CARD = "#111827";
const MUTED = "#94a3b8";

export function absoluteAssetUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  const p = path.trim();
  const base = getAppUrl();
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${base}${p}`;
  if (p.startsWith("demo/") || p.startsWith("products/")) return `${base}/${p}`;
  return p;
}

export function whatsAppLink(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `972${digits.slice(1)}`;
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export function telLink(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

export function emailButton(href: string, label: string, primary = true): string {
  const bg = primary ? BRAND : "#334155";
  return `<a href="${href}" style="display:inline-block;margin:6px 8px 6px 0;padding:12px 20px;background:${bg};color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">${label}</a>`;
}

export function wrapEmailHtml(title: string, bodyHtml: string, preheader?: string): string {
  const hidden = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>`
    : "";
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  ${hidden}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${CARD};border-radius:16px;border:1px solid #1e293b;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background:linear-gradient(135deg,#1c1917 0%,#0a0f1a 100%);border-bottom:2px solid ${BRAND};">
              <div style="font-size:11px;letter-spacing:0.2em;color:${BRAND};font-weight:700;">DESIGMA</div>
              <div style="margin-top:6px;font-size:22px;font-weight:800;color:#fff;">${title}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-size:15px;line-height:1.65;color:#cbd5e1;">${bodyHtml}</td>
          </tr>
          <tr>
            <td style="padding:20px 28px;border-top:1px solid #1e293b;font-size:12px;color:${MUTED};text-align:center;">
              © ${new Date().getFullYear()} DESIGMA · Premium Electronics
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:${MUTED};font-size:13px;width:120px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;color:#f1f5f9;font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}
