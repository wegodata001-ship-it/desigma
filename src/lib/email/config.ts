import "server-only";

export function getEmailConfig() {
  return {
    host: process.env.SMTP_HOST?.trim() || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT?.trim() || "587"),
    user: process.env.SMTP_USER?.trim() || "",
    pass: process.env.SMTP_PASS?.trim() || "",
    fromName: process.env.EMAIL_FROM_NAME?.trim() || "DESIGMA",
    fromAddress: process.env.EMAIL_FROM_ADDRESS?.trim() || "noreply@desigma-shop.com",
    contactReceiver:
      process.env.CONTACT_RECEIVER_EMAIL?.trim() ||
      process.env.STORE_OWNER_EMAIL?.trim() ||
      "",
    adminOrderReceiver:
      process.env.ADMIN_ORDER_EMAIL?.trim() ||
      process.env.CONTACT_RECEIVER_EMAIL?.trim() ||
      process.env.STORE_OWNER_EMAIL?.trim() ||
      "",
  };
}

export function isEmailConfigured(): boolean {
  const c = getEmailConfig();
  return Boolean(c.user && c.pass && c.fromAddress);
}
