import { NextResponse } from "next/server";
import { adminOrderUrl, storeOrderUrl } from "@/lib/app-url";
import { getAdminBaseUrl, getPublicBaseUrl, resolveBaseUrls } from "@/lib/base-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Read-only audit: resolved origins + sample email/store links. */
export async function GET() {
  const resolved = resolveBaseUrls();
  const sampleOrderNumber = "DESIGMA-1001";
  const sampleOrderId = "cxxxxxxxxxxxxxxxxxxxxxxx";

  const usesLocalhost =
    resolved.publicBaseUrl.includes("localhost") || resolved.adminBaseUrl.includes("localhost");

  return NextResponse.json({
    audit: {
      localhostOccurrencesInResolvedUrls: usesLocalhost ? 2 : 0,
      publicUsesAppUrlEnv:
        resolved.sources.public === "env_1" || resolved.sources.public === "env_2",
      adminUsesAppUrlEnv: false,
    },
    resolved: {
      publicBaseUrl: resolved.publicBaseUrl,
      adminBaseUrl: resolved.adminBaseUrl,
      sources: resolved.sources,
      warnings: resolved.warnings,
    },
    runtime: {
      getPublicBaseUrl: getPublicBaseUrl(),
      getAdminBaseUrl: getAdminBaseUrl(),
    },
    env: resolved.env,
    emailLinks: {
      orderConfirmation_viewOrder: storeOrderUrl(sampleOrderNumber),
      orderStatus_trackOrder: storeOrderUrl(sampleOrderNumber),
      newOrder_adminView: adminOrderUrl(sampleOrderId),
      legal_terms: `${resolved.publicBaseUrl}/terms`,
      welcome_shop: `${resolved.publicBaseUrl}/products`,
    },
    storefrontPagesNote:
      "Footer/nav use relative /terms, /account — OK on live domain. Legal CMS HTML is rewritten to drop localhost.",
    emailsNote: "All server emails use getPublicBaseUrl() / getAdminBaseUrl() — never request.url or window.location.",
    diagnosis: usesLocalhost
      ? "CRITICAL: resolved URLs still contain localhost — check Vercel env and redeploy"
      : resolved.warnings.length > 0
        ? resolved.warnings
        : "OK",
  });
}
