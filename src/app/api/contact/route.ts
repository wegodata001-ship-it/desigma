import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { STORE_ID } from "@/lib/store";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";
import { queueEmail, sendContactAutoReplyEmail, sendContactLeadEmail } from "@/lib/email/email-service";

export const runtime = "nodejs";

const Schema = z.object({
  name: z.string().trim().min(2, "יש להזין שם").max(120),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .refine((v) => !v || z.string().email().safeParse(v).success, { message: "אימייל לא תקין" }),
  message: z.string().trim().min(10, "הודעה קצרה מדי").max(5000),
});

export async function POST(req: Request) {
  const storeId = STORE_ID;
  const ip = clientIpFromRequest(req);
  if (!rateLimit(`contact:${ip}`, 8, 60_000)) {
    return NextResponse.json({ error: "יותר מדי בקשות. נסו שוב בעוד דקה." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, phone, email, message } = parsed.data;
  const lead = await prisma.contactLead.create({
    data: {
      storeId,
      name,
      phone: phone?.trim() || null,
      email: email?.trim().toLowerCase() || null,
      message,
    },
  });

  queueEmail(async () => {
    await sendContactLeadEmail(storeId, {
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      message: lead.message,
      createdAt: lead.createdAt,
    });
    if (lead.email) {
      await sendContactAutoReplyEmail(storeId, { name: lead.name, email: lead.email });
    }
  });

  return NextResponse.json({ ok: true, id: lead.id });
}
