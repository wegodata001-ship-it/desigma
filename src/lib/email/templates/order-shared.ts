import type { StoreEmailBrand } from "@/lib/email/store-branding";
import { STORE_BUSINESS } from "@/lib/store-business";
import { emailOrderViewUrl, emailTrackOrderUrl } from "@/lib/email/email-links";
import { absoluteAssetUrl, emailButton, infoRow } from "@/lib/email/templates/layout";

export type OrderEmailLine = {
  name: string;
  variant?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl?: string | null;
};

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatMoney(amount: number, currency = "ILS"): string {
  if (currency === "ILS") return `₪${amount.toFixed(2)}`;
  return `${amount.toFixed(2)} ${currency}`;
}

export function renderOrderItemsTable(items: OrderEmailLine[], accent: string): string {
  const rows = items
    .map((item) => {
      const img = absoluteAssetUrl(item.imageUrl);
      const imgCell = img
        ? `<img src="${img}" alt="" width="56" height="56" style="display:block;border-radius:10px;background:#0f172a;object-fit:contain;"/>`
        : `<div style="width:56px;height:56px;border-radius:10px;background:#1e293b;"></div>`;
      return `<tr>
        <td style="padding:12px 8px;border-bottom:1px solid #1e293b;vertical-align:middle;">${imgCell}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #1e293b;vertical-align:middle;">
          <div style="font-weight:700;color:#f8fafc;font-size:14px;">${escapeHtml(item.name)}</div>
          ${item.variant ? `<div style="font-size:12px;color:#94a3b8;margin-top:4px;">${escapeHtml(item.variant)}</div>` : ""}
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #1e293b;text-align:center;color:#e2e8f0;">×${item.quantity}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #1e293b;text-align:left;color:${accent};font-weight:700;white-space:nowrap;">${formatMoney(item.lineTotal)}</td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #1e293b;border-radius:12px;overflow:hidden;">
    <thead>
      <tr style="background:#0f172a;">
        <th style="padding:10px 8px;font-size:11px;color:#94a3b8;text-align:right;"></th>
        <th style="padding:10px 8px;font-size:11px;color:#94a3b8;text-align:right;">מוצר</th>
        <th style="padding:10px 8px;font-size:11px;color:#94a3b8;text-align:center;">כמות</th>
        <th style="padding:10px 8px;font-size:11px;color:#94a3b8;text-align:left;">סה״כ</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function renderOrderTotals(data: {
  subtotal: number;
  deliveryPrice: number;
  discountAmount: number;
  pointsDiscount: number;
  total: number;
  currency: string;
  accent: string;
}): string {
  const rows = [
    infoRow("סכום ביניים", formatMoney(data.subtotal, data.currency)),
    infoRow("משלוח", formatMoney(data.deliveryPrice, data.currency)),
  ];
  if (data.discountAmount > 0) {
    rows.push(infoRow("הנחת קופון", `−${formatMoney(data.discountAmount, data.currency)}`));
  }
  if (data.pointsDiscount > 0) {
    rows.push(infoRow("מימוש נקודות", `−${formatMoney(data.pointsDiscount, data.currency)}`));
  }
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;">
    ${rows.join("")}
  </table>
  <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#fff;text-align:left;">סה״כ לתשלום: <span style="color:${data.accent};">${formatMoney(data.total, data.currency)}</span></p>`;
}

export function renderCancellationPolicy(brand: StoreEmailBrand): string {
  return `<div style="margin:24px 0;padding:16px;background:#0f172a;border-radius:12px;border:1px solid #334155;">
    <div style="font-size:14px;font-weight:700;color:#f97316;margin-bottom:8px;">מדיניות ביטול</div>
    <ul style="margin:0;padding-right:18px;color:#cbd5e1;font-size:13px;line-height:1.7;">
      <li>ביטול עד 14 יום מקבלת המוצר, בהתאם לחוק.</li>
      <li>דמי ביטול: 5% או 100 ₪ — לפי הנמוך מביניהם.</li>
      <li>המוצר חייב לחזור באריזתו המקורית, חדש וללא פגם.</li>
    </ul>
    <p style="margin:12px 0 0;"><a href="${brand.legalUrls.refunds}" style="color:${brand.accentColor};font-weight:600;">מדיניות ביטולים והחזרים →</a></p>
  </div>`;
}

export function renderShippingPolicyBrief(): string {
  return `<div style="margin:16px 0;padding:16px;background:#0f172a;border-radius:12px;border:1px solid #334155;">
    <div style="font-size:14px;font-weight:700;color:#f97316;margin-bottom:8px;">מדיניות משלוחים</div>
    <ul style="margin:0;padding-right:18px;color:#cbd5e1;font-size:13px;line-height:1.7;">
      <li>זמן אספקה משוער: 3–7 ימי עסקים (בהתאם לסוג המשלוח).</li>
      <li>עיכובים אפשריים עקב כוח עליון, שביתות או חברת השילוח.</li>
    </ul>
  </div>`;
}

export function renderLegalFooter(brand: StoreEmailBrand): string {
  const { legalUrls } = brand;
  return `<div style="margin-top:28px;padding-top:20px;border-top:1px solid #334155;font-size:12px;color:#94a3b8;line-height:1.7;">
    <div style="font-weight:700;color:#e2e8f0;margin-bottom:8px;">מסמך עסקה ותנאי רכישה</div>
    <p style="margin:0 0 8px;">בלחיצה כאן ניתן לצפות:</p>
    <p style="margin:0;">
      <a href="${legalUrls.terms}" style="color:${brand.accentColor};">תקנון האתר</a> ·
      <a href="${legalUrls.privacy}" style="color:${brand.accentColor};">מדיניות פרטיות</a> ·
      <a href="${legalUrls.refunds}" style="color:${brand.accentColor};">ביטולים והחזרים</a> ·
      <a href="${legalUrls.shipping}" style="color:${brand.accentColor};">משלוחים</a>
    </p>
    <p style="margin:12px 0 0;"><a href="${legalUrls.legal}" style="color:${brand.accentColor};">כל המידע המשפטי →</a></p>
  </div>`;
}

export function renderContactFooter(brand: StoreEmailBrand): string {
  const phone = brand.phone || STORE_BUSINESS.phone;
  const email = brand.email || STORE_BUSINESS.email;
  return `<div style="margin-top:20px;padding:16px;background:#0f172a;border-radius:12px;border:1px solid #334155;font-size:13px;color:#cbd5e1;">
    <div style="font-weight:700;color:#f97316;margin-bottom:8px;">יצירת קשר</div>
    <p style="margin:0;">טלפון: <a href="tel:${phone.replace(/\D/g, "")}" style="color:#fff;">${escapeHtml(phone)}</a></p>
    <p style="margin:8px 0 0;">אימייל: <a href="mailto:${escapeHtml(email)}" style="color:#fff;">${escapeHtml(email)}</a></p>
    <p style="margin:12px 0 0;"><a href="${brand.legalUrls.contact}" style="color:${brand.accentColor};font-weight:600;">דף יצירת קשר →</a></p>
  </div>`;
}

export function renderViewOrderButton(
  brand: StoreEmailBrand,
  orderNumber: string,
  label = "צפייה בהזמנה שלי",
): string {
  return `<p style="margin:24px 0 8px;text-align:center;">${emailButton(emailOrderViewUrl(orderNumber), label, brand.accentColor)}</p>`;
}

export function renderTrackOrderButton(
  brand: StoreEmailBrand,
  orderNumber: string,
  label = "מעקב הזמנה",
): string {
  const href = emailTrackOrderUrl(orderNumber);
  return `<p style="margin:8px 0;text-align:center;">${emailButton(href, label, false)}</p>`;
}
