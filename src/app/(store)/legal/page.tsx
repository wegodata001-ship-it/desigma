import type { Metadata } from "next";
import { LegalHubPage } from "@/components/storefront/legal-hub-page";

export const metadata: Metadata = {
  title: "מידע משפטי — DESIGMA",
  description:
    "תקנון האתר, מדיניות פרטיות, ביטולים והחזרים, ומשלוחים — DESIGMA. טלפון 054-2298822, m.desigma@gmail.com",
};

export default function LegalHubRoute() {
  return <LegalHubPage />;
}
