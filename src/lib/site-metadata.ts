import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/store";
import { STORE_BUSINESS } from "@/lib/store-business";
import { PRODUCTION_PUBLIC_BASE_URL } from "@/lib/base-url";

export function createSiteMetadata(pageTitle?: string): Metadata {
  const title = pageTitle ? `${pageTitle} — ${SITE_NAME}` : SITE_NAME;
  const description = pageTitle ? `${pageTitle} | ${SITE_DESCRIPTION}` : SITE_DESCRIPTION;
  const url = PRODUCTION_PUBLIC_BASE_URL;

  return {
    title,
    description,
    metadataBase: new URL(url),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      locale: "he_IL",
      type: "website",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: url },
  };
}

export function organizationSchemaJson() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: PRODUCTION_PUBLIC_BASE_URL,
    email: STORE_BUSINESS.email,
    telephone: STORE_BUSINESS.phoneTel,
    address: {
      "@type": "PostalAddress",
      addressLocality: "עין מאהל",
      addressCountry: "IL",
    },
  };
}
