import type { Metadata } from "next";
import { ContactPageClient } from "@/components/storefront/contact-page-client";
import { prisma } from "@/lib/prisma";
import { getEmailConfig } from "@/lib/email/config";
import { createSiteMetadata } from "@/lib/site-metadata";
import { STORE_BUSINESS } from "@/lib/store-business";
import { STORE_ID } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createSiteMetadata("צור קשר");

export default async function ContactPage() {
  const settings = await prisma.storeSettings.findUnique({
    where: { storeId: STORE_ID },
    select: { whatsappPhone: true, supportEmail: true },
  });
  const cfg = getEmailConfig();
  const phone = settings?.whatsappPhone?.trim() || STORE_BUSINESS.phone;
  const email = settings?.supportEmail?.trim() || cfg.contactReceiver || STORE_BUSINESS.email;

  return (
    <ContactPageClient
      businessName={STORE_BUSINESS.name}
      address={STORE_BUSINESS.address}
      phone={phone}
      email={email}
    />
  );
}
