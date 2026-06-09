import type { Metadata } from "next";
import { LegalHubPage } from "@/components/storefront/legal-hub-page";
import { createSiteMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createSiteMetadata("מידע משפטי");

export default function LegalHubRoute() {
  return <LegalHubPage />;
}
