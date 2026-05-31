import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderPaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { STORE_ID } from "@/lib/store";
import { processPaymentWebhook } from "@/lib/payments/process-webhook";

export const runtime = "nodejs";

const Schema = z.object({
  orderId: z.string().min(1),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const storeId = STORE_ID;
  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, storeId },
    select: { id: true, total: true, paymentStatus: true },
  });

  if (!order) {
    return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
  }

  if (order.paymentStatus === OrderPaymentStatus.PAID) {
    return NextResponse.json({ ok: true, message: "התשלום כבר התקבל" });
  }

  const settings = await prisma.storeSettings.findUnique({ where: { storeId } });
  const currency = settings?.currency ?? "ILS";

  const result = await processPaymentWebhook({
    provider: "demo",
    orderId: order.id,
    amount: Number(order.total),
    currency,
    success: true,
    transactionId: `demo-${order.id}-${Date.now()}`,
    confirmationNumber: `DEMO-${Date.now()}`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: result.message });
}
