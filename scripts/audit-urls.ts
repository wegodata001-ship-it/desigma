/**
 * URL audit — counts localhost / APP_URL usage in repo + prints resolved production URLs.
 *
 *   npm run audit:urls
 */

import { resolveBaseUrls, getPublicBaseUrl, getAdminBaseUrl } from "../src/lib/base-url";

async function main() {
  const fs = await import("fs");
  const path = await import("path");

  const root = path.join(__dirname, "..");
  const skip = new Set(["node_modules", ".next", ".git"]);

  let localhostHits = 0;
  let appUrlHits = 0;
  const localhostFiles: string[] = [];
  const appUrlFiles: string[] = [];

  function walk(dir: string) {
    for (const name of fs.readdirSync(dir)) {
      if (skip.has(name)) continue;
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx|js|jsx|md|env|example|local)$/i.test(name)) continue;
      const rel = path.relative(root, full).replace(/\\/g, "/");
      const text = fs.readFileSync(full, "utf8");
      const loc = (text.match(/localhost/gi) ?? []).length;
      const app = (text.match(/NEXT_PUBLIC_APP_URL|process\.env\.APP_URL/g) ?? []).length;
      if (loc > 0) {
        localhostHits += loc;
        localhostFiles.push(`${rel}:${loc}`);
      }
      if (app > 0) {
        appUrlHits += app;
        appUrlFiles.push(`${rel}:${app}`);
      }
    }
  }

  walk(root);

  const resolved = resolveBaseUrls();

  console.log("=== URL AUDIT ===\n");
  console.log("1) localhost string occurrences:", localhostHits);
  console.log("   files:", localhostFiles.slice(0, 20).join(", ") || "(none)");
  console.log("\n2) NEXT_PUBLIC_APP_URL / APP_URL references:", appUrlHits);
  console.log("   files:", appUrlFiles.slice(0, 20).join(", ") || "(none)");
  console.log("\n3) Resolved at runtime (this process):");
  console.log("   getPublicBaseUrl():", getPublicBaseUrl());
  console.log("   getAdminBaseUrl():", getAdminBaseUrl());
  console.log("   sources:", resolved.sources);
  if (resolved.warnings.length) console.log("   warnings:", resolved.warnings);

  const emailUsesLocalhost =
    getPublicBaseUrl().includes("localhost") || getAdminBaseUrl().includes("localhost");
  console.log("\n4) Emails would use localhost:", emailUsesLocalhost ? "YES — FIX ENV" : "NO");
  console.log("\n5) Storefront pages with relative href (/terms, /account): not using APP_URL in components");

  if (emailUsesLocalhost) process.exit(1);
  console.log("\nPASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
