import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "desigma_track_order";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

function secret(): string {
  return process.env.SESSION_SECRET?.trim() || "desigma-track-fallback";
}

function sign(orderNumber: string, email: string): string {
  const payload = `${orderNumber.toLowerCase()}|${email.toLowerCase().trim()}`;
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function setTrackingAccessCookie(orderNumber: string, email: string): Promise<void> {
  const token = sign(orderNumber, email);
  const jar = await cookies();
  jar.set(COOKIE_NAME, `${encodeURIComponent(orderNumber)}:${token}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function hasTrackingAccess(
  orderNumber: string,
  customerEmail: string,
  options?: { sessionEmail?: string | null; sessionOwnsOrder?: boolean },
): Promise<boolean> {
  if (options?.sessionOwnsOrder) return true;
  const sessionEmail = options?.sessionEmail?.trim().toLowerCase();
  const orderEmail = customerEmail.trim().toLowerCase();
  if (sessionEmail && sessionEmail === orderEmail) return true;

  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const colon = raw.indexOf(":");
  if (colon <= 0) return false;
  const storedOrder = decodeURIComponent(raw.slice(0, colon));
  const token = raw.slice(colon + 1);
  if (storedOrder !== orderNumber) return false;

  const expected = sign(orderNumber, customerEmail);
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
