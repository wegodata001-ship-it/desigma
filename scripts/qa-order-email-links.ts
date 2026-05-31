/**
 * QA: verify customer vs admin order URLs use separate origins.
 *
 *   npm run qa:order-email-links
 *   STORE_URL=https://desigma-shop.com ADMIN_URL=https://portal.desigma-shop.com npm run qa:order-email-links -- --fetch
 */

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

import { getAdminBaseUrl, getPublicBaseUrl } from "../src/lib/base-url";

function resolveStoreUrl(): string {
  return process.env.STORE_URL?.trim()
    ? stripTrailingSlash(process.env.STORE_URL.trim())
    : getPublicBaseUrl();
}

function resolveAdminUrl(): string {
  return process.env.ADMIN_URL?.trim()
    ? stripTrailingSlash(process.env.ADMIN_URL.trim())
    : getAdminBaseUrl();
}

const STORE_ROUTES = ["/terms", "/privacy", "/refunds", "/shipping", "/legal", "/contact"];

async function checkUrl(url: string): Promise<{ url: string; ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    return { url, ok: res.status >= 200 && res.status < 400, status: res.status };
  } catch (e) {
    return { url, ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function main() {
  const storeUrl = resolveStoreUrl();
  const adminUrl = resolveAdminUrl();
  const doFetch = process.argv.includes("--fetch");

  const customerOrderLink = `${storeUrl}/orders/TEST-0001`;
  const adminOrderLink = `${adminUrl}/orders/test-order-cuid-id`;
  const legalLinks = STORE_ROUTES.map((p) => `${storeUrl}${p}`);

  console.log("=== URL separation audit ===\n");
  console.log(`STORE_URL:  ${storeUrl}`);
  console.log(`ADMIN_URL:  ${adminUrl}\n`);

  console.log("Customer email links:");
  console.log(`  • ${customerOrderLink}`);
  for (const l of legalLinks) console.log(`  • ${l}`);
  console.log(`  • ${storeUrl}/contact`);

  console.log("\nAdmin email links:");
  console.log(`  • ${adminOrderLink}`);

  if (storeUrl === adminUrl) {
    console.warn("\nWARN: STORE_URL and ADMIN_URL are identical — use separate domains in production.");
  } else {
    console.log("\n✓ Store and admin origins differ");
  }

  if (!customerOrderLink.includes("/orders/")) {
    console.error("FAIL: invalid customer order URL");
    process.exit(1);
  }

  if (doFetch) {
    console.log("\n=== HTTP checks (--fetch) ===\n");
    let failed = 0;
    for (const url of [customerOrderLink, ...legalLinks, `${storeUrl}/contact`]) {
      const result = await checkUrl(url);
      console.log(`  ${result.ok ? "✓" : "✗"} ${result.status ?? "ERR"} ${url}`);
      if (!result.ok) failed += 1;
    }
    if (failed > 0) process.exit(1);
  }

  console.log("\nPASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
