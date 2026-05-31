import { NextResponse } from "next/server";
import { getEmailConfig, isEmailConfigured } from "@/lib/email/config";
import { getMailTransporter } from "@/lib/email/transporter";
import { getPublicBaseUrl } from "@/lib/base-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Read-only SMTP / email diagnostics (no secrets). */
export async function GET() {
  const cfg = getEmailConfig();
  const configured = isEmailConfigured();
  const transporter = configured ? getMailTransporter() : null;

  let smtpVerify: { ok: boolean; error?: string } = { ok: false, error: "not_configured" };
  if (transporter) {
    try {
      await transporter.verify();
      smtpVerify = { ok: true };
    } catch (e) {
      smtpVerify = {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  const diagnosis: string[] = [];
  if (!configured) {
    diagnosis.push("SMTP_USER / SMTP_PASS / EMAIL_FROM_ADDRESS missing in Vercel env");
  } else if (!smtpVerify.ok) {
    diagnosis.push(`SMTP verify failed: ${smtpVerify.error}`);
  }
  if (!cfg.contactReceiver && !cfg.adminOrderReceiver) {
    diagnosis.push("No CONTACT_RECEIVER_EMAIL or ADMIN_ORDER_EMAIL — owner new-order emails skipped");
  }

  return NextResponse.json({
    smtpConfigured: configured,
    smtpHost: cfg.host,
    smtpPort: cfg.port,
    smtpUserSet: Boolean(cfg.user),
    smtpPassSet: Boolean(cfg.pass),
    fromAddress: cfg.fromAddress,
    fromName: cfg.fromName,
    contactReceiver: cfg.contactReceiver || null,
    adminOrderReceiver: cfg.adminOrderReceiver || null,
    publicBaseUrlForLinks: getPublicBaseUrl(),
    smtpVerify,
    orderEmailsNote: "Sent only when paymentStatus=PAID (after demo-complete or webhook)",
    diagnosis: diagnosis.length ? diagnosis : ["SMTP OK — if still no mail, check spam or payment_not_paid in logs"],
  });
}
