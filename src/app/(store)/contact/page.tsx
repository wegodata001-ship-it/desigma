import type { Metadata } from "next";
import { ContactPageClient } from "@/components/storefront/contact-page-client";
import { prisma } from "@/lib/prisma";
import { getEmailConfig } from "@/lib/email/config";
import { STORE_ID } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "צור קשר — DESIGMA",
  description: "יצירת קשר עם DESIGMA — טלפון, אימייל וטופס פנייה",
};

export default async function ContactPage() {
  const settings = await prisma.storeSettings.findUnique({
    where: { storeId: STORE_ID },
    select: { whatsappPhone: true, supportEmail: true },
  });
  const cfg = getEmailConfig();
  const phone = settings?.whatsappPhone?.trim() || "054-2298822";
  const email = settings?.supportEmail?.trim() || cfg.contactReceiver || "m.desigma@gmail.com";

  return <ContactPageClient phone={phone} email={email} />;
}
