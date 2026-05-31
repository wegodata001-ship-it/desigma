import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthDebugLogsEnabled, SESSION_COOKIE_NAME } from "@/lib/auth/cookie-constants";
import {
  hostFromUrl,
  hostsMatch,
  isLikelyOrderId,
} from "@/lib/app-urls-shared";

function forbidden(message = "403 Unauthorized") {
  return new NextResponse(message, {
    status: 403,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function resolveHosts() {
  const storeHost = hostFromUrl(process.env.NEXT_PUBLIC_STORE_URL);
  const adminHost = hostFromUrl(process.env.NEXT_PUBLIC_ADMIN_URL);
  const appHost = hostFromUrl(process.env.NEXT_PUBLIC_APP_URL);
  return {
    storeHost: storeHost ?? appHost,
    adminHost: adminHost ?? appHost,
  };
}

export async function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-request-path", req.nextUrl.pathname);
  const existingTrace = req.headers.get("x-trace-id");
  requestHeaders.set("x-trace-id", existingTrace && existingTrace.length > 0 ? existingTrace : crypto.randomUUID());

  const pathname = req.nextUrl.pathname;
  const requestHost = req.nextUrl.host;
  const { storeHost, adminHost } = resolveHosts();

  const onAdminPortal =
    (adminHost && hostsMatch(requestHost, adminHost)) ||
    (adminHost && storeHost && hostsMatch(adminHost, storeHost) && pathname.startsWith("/admin"));
  const onStorefront = storeHost && hostsMatch(requestHost, storeHost);
  const splitDomains = adminHost && storeHost && !hostsMatch(adminHost, storeHost);

  if (splitDomains) {
    if (pathname.startsWith("/admin") || pathname === "/login-admin") {
      if (onStorefront && !onAdminPortal) {
        return forbidden();
      }
    }
    if (onAdminPortal && !pathname.startsWith("/admin") && !pathname.startsWith("/api") && !pathname.startsWith("/login-admin") && !pathname.startsWith("/_next")) {
      const isStoreOnly =
        pathname === "/" ||
        pathname.startsWith("/products") ||
        pathname.startsWith("/cart") ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/account") ||
        pathname.startsWith("/terms") ||
        pathname.startsWith("/privacy") ||
        pathname.startsWith("/refunds") ||
        pathname.startsWith("/shipping") ||
        pathname.startsWith("/legal") ||
        pathname.startsWith("/contact") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register");
      if (isStoreOnly) {
        return forbidden();
      }
    }
  }

  const orderMatch = pathname.match(/^\/orders\/([^/]+)$/);
  if (orderMatch) {
    const slug = decodeURIComponent(orderMatch[1]);
    const adminRoute = isLikelyOrderId(slug) || onAdminPortal;

    if (onStorefront && splitDomains && isLikelyOrderId(slug)) {
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
