import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthDebugLogsEnabled, SESSION_COOKIE_NAME } from "@/lib/auth/cookie-constants";
import {
  hostFromUrl,
  hostsMatch,
  isAdminPortalHostname,
  isAdminPortalPath,
  isLikelyOrderId,
  isStorefrontHostname,
} from "@/lib/app-urls-shared";
import { resolveEffectiveStoreId } from "@/lib/store-resolve";

function forbidden(message = "403 Unauthorized") {
  return new NextResponse(message, {
    status: 403,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-request-path", req.nextUrl.pathname);
  const existingTrace = req.headers.get("x-trace-id");
  requestHeaders.set("x-trace-id", existingTrace && existingTrace.length > 0 ? existingTrace : crypto.randomUUID());

  const pathname = req.nextUrl.pathname;
  const requestHost = req.nextUrl.host;

  const storeId = resolveEffectiveStoreId({ host: requestHost });
  requestHeaders.set("x-store-id", storeId);

  const onAdminPortal = isAdminPortalHostname(requestHost);
  const onStorefront = isStorefrontHostname(requestHost);
  const storeHost = hostFromUrl(process.env.NEXT_PUBLIC_STORE_URL);
  const adminHost =
    hostFromUrl(process.env.NEXT_PUBLIC_ADMIN_URL) ??
    hostFromUrl(process.env.ADMIN_APP_URL);
  const splitDomains = !!(storeHost && adminHost && !hostsMatch(storeHost, adminHost));

  // portal.desigma-shop.com → admin only (redirect any storefront page to /admin)
  if (onAdminPortal && !isAdminPortalPath(pathname)) {
    if (pathname === "/login" || pathname.startsWith("/login/")) {
      const url = req.nextUrl.clone();
      url.pathname = "/login-admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // desigma-shop.com → admin lives on portal (redirect, not opaque 403)
  if (splitDomains && onStorefront && !onAdminPortal) {
    if (pathname.startsWith("/admin") || pathname === "/login-admin") {
      const adminBase =
        process.env.NEXT_PUBLIC_ADMIN_URL?.trim() ||
        process.env.ADMIN_APP_URL?.trim() ||
        "";
      if (adminBase) {
        const targetPath = pathname.startsWith("/admin") ? pathname : "/login-admin";
        try {
          const dest = new URL(targetPath, adminBase.endsWith("/") ? adminBase : `${adminBase}/`);
          dest.search = req.nextUrl.search;
          return NextResponse.redirect(dest);
        } catch {
          /* fall through */
        }
      }
      return forbidden(
        "ניהול החנות זמין רק בפורטל הניהול. היכנסו ל: https://portal.desigma-shop.com/login-admin",
      );
    }
  }

  const orderMatch = pathname.match(/^\/orders\/([^/]+)$/);
  if (orderMatch) {
    const slug = decodeURIComponent(orderMatch[1]);
    const adminRoute = isLikelyOrderId(slug) || onAdminPortal;

    if (onStorefront && !onAdminPortal && isLikelyOrderId(slug)) {
      return forbidden();
    }

    if (adminRoute) {
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = `/admin/orders/${slug}`;
      return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    }
  }

  if (isAuthDebugLogsEnabled()) {
    const cookieValue = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (pathname.startsWith("/admin") || pathname.startsWith("/login-admin")) {
      console.log(
        JSON.stringify({
          scope: "auth",
          message: "middleware_cookie_check",
          path: pathname,
          cookieName: SESSION_COOKIE_NAME,
          hasCookie: !!cookieValue,
          cookieLength: cookieValue?.length ?? 0,
        }),
      );
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
