import "server-only";

export function getEmailConfig() {
  const pass =
    process.env.SMTP_PASS?.trim() ||
    process.env.SMTP_PASSWORD?.trim() ||
    process.env.BREVO_API_KEY?.trim() ||
    "";
  const user =
    process.env.SMTP_USER?.trim() ||
    process.env.SMTP_USERNAME?.trim() ||
    "";
  return {
    host: process.env.SMTP_HOST?.trim() || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT?.trim() || "587"),
    user,
    pass,
    fromName: process.env.EMAIL_FROM_NAME?.trim() || "CITYPEL",
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
