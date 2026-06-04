import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setTrackingAccessCookie } from "@/lib/orders/tracking-access";
import { STORE_ID } from "@/lib/store";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Schema = z.object({
  orderNumber: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
});

export async function POST(req: Request) {
  const ip = clientIpFromRequest(req);
  if (!rateLimit(`track-order:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "יותר מדי ניסיונות. נסו שוב בעוד דקה." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "נא למלא מספר הזמנה ואימייל תקינים" }, { status: 400 });
  }

  const orderNumber = parsed.data.orderNumber;
  const email = parsed.data.email.toLowerCase();
  const storeId = STORE_ID;

  const order = await prisma.order.findFirst({
    where: { storeId, orderNumber },
    select: { customerEmail: true },
  });

  if (!order || order.customerEmail.trim().toLowerCase() !== email) {
    return NextResponse.json(
      { error: "לא נמצאה הזמנה עם הפרטים שהוזנו. בדקו מספר הזמנה ואימייל." },
      { status: 404 },
    );
  }

  await setTrackingAccessCookie(orderNumber, email);

  return NextResponse.json({ ok: true, orderNumber });
}
