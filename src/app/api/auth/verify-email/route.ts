import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STORE_ID } from "@/lib/store";
import { getPublicBaseUrl } from "@/lib/base-url";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const storeId = STORE_ID;
  const token = new URL(req.url).searchParams.get("token")?.trim();
  const base = getPublicBaseUrl();

  if (!token) {
    return NextResponse.redirect(new URL("/login?verify=invalid", base));
  }

  const row = await prisma.emailVerificationToken.findFirst({
    where: {
      storeId,
      token,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!row) {
    return NextResponse.redirect(new URL("/login?verify=expired", base));
  }

  await prisma.$transaction([
    prisma.user.updateMany({
      where: { id: row.userId, storeId },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.updateMany({
      where: { id: row.id, storeId },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.redirect(new URL("/login?verify=ok", base));
}
