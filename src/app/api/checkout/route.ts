import { NextResponse } from "next/server";
import { z } from "zod";
import { DeliveryType, OrderPaymentStatus, OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { STORE_ID } from "@/lib/store";
import { decodeSessionToken } from "@/lib/auth/session";
import { cookies } from "next/headers";
import {
  computeCouponDiscount,
  computePointsDiscount,
  computeTotal,
  snapshotDeliveryName,
} from "@/lib/checkout/compute-order";
import {
  deliveryRequiresAddress,
  deliveryUiBehavior,
  formatStructuredAddress,
} from "@/lib/shipping/delivery-behavior";
import { isLinePurchasable, sanitizeCartLines } from "@/lib/cart/availability";
import type { CartLine } from "@/lib/cart/types";
import { loadCartProductsForStore } from "@/lib/cart/load-cart-products";
import { EMAIL_MISMATCH_MESSAGE, normalizeEmail } from "@/lib/email-confirm-validation";
import { ORDER_STATUS_AWAITING_PAYMENT } from "@/lib/orders/order-status-values";

export const runtime = "nodejs";

const Schema = z
  .object({
    customerName: z.string().min(1),
    customerEmail: z.string().trim().min(1).email(),
    confirmCustomerEmail: z.string().trim().min(1).email(),
    customerPhone: z.string().min(1),
    deliveryOptionId: z.string(),
    address: z.string().optional(),
    addressCity: z.string().optional(),
    addressStreet: z.string().optional(),
    addressHouseNumber: z.string().optional(),
    addressApartment: z.string().optional(),
    addressPostalCode: z.string().optional(),
    pickupPointId: z.string().optional(),
    notes: z.string().optional(),
    couponCode: z.string().optional(),
    redeemPoints: z.number().int().min(0).optional(),
    items: z
      .array(
        z.object({
          productId: z.string(),
          quantity: z.number().int().positive(),
          optionIds: z.array(z.string()).optional(),
        }),
      )
      .min(1),
  })
  .superRefine((data, ctx) => {
    if (normalizeEmail(data.customerEmail) !== normalizeEmail(data.confirmCustomerEmail)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmCustomerEmail"],
        message: EMAIL_MISMATCH_MESSAGE,
      });
    }
  });

export async function POST(req: Request) {
  const storeId = STORE_ID;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid checkout payload";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const body = parsed.data;
  const verifiedEmail = normalizeEmail(body.customerEmail);
  const jar = await cookies();
  const session = await decodeSessionToken(jar.get("session")?.value ?? "");

  const cartInput: CartLine[] = body.items.map((i, idx) => ({
    key: `checkout-${idx}`,
    productId: i.productId,
    quantity: i.quantity,
    optionIds: i.optionIds ?? [],
  }));

  const productIds = Array.from(new Set(cartInput.map((i) => i.productId)));
  const productsMap = await loadCartProductsForStore(storeId, productIds);
  const { items: validCartLines } = sanitizeCartLines(cartInput, productsMap);

  if (validCartLines.length !== cartInput.length) {
    return NextResponse.json(
      { error: "אחד או יותר מהמוצרים בעגלה אינם זמינים יותר. עדכנו את העגלה ונסו שוב." },
      { status: 400 },
    );
  }

  for (const line of validCartLines) {
    const snapshot = productsMap.get(line.productId);
    if (!isLinePurchasable(snapshot, line)) {
      return NextResponse.json(
        { error: "אין מספיק מלאי לאחד המוצרים בעגלה." },
        { status: 400 },
      );
    }
  }

  const products = await prisma.product.findMany({
    where: {
      storeId,
      id: { in: validCartLines.map((i) => i.productId) },
      active: true,
    },
  });

  if (products.length !== validCartLines.length) {
    return NextResponse.json(
      { error: "אחד או יותר מהמוצרים בעגלה אינם זמינים יותר. עדכנו את העגלה ונסו שוב." },
      { status: 400 },
    );
  }

  const byId = new Map(products.map((p) => [p.id, p]));
  type Line = { product: (typeof products)[number]; quantity: number; optionIds: string[] };
  const lines: Line[] = validCartLines.map((i) => {
    const product = byId.get(i.productId);
    if (!product) throw new Error("missing product");
    return { product, quantity: i.quantity, optionIds: i.optionIds ?? [] };
  });

  const delivery = await prisma.deliveryOption.findFirst({
    where: { id: body.deliveryOptionId, storeId, active: true },
  });
  if (!delivery) {
    return NextResponse.json({ error: "Invalid delivery option" }, { status: 400 });
  }

  const storeSettings = await prisma.storeSettings.findUnique({ where: { storeId } });
  if (
    delivery.type === DeliveryType.PICKUP &&
    storeSettings &&
    !storeSettings.pickupEnabled
  ) {
    return NextResponse.json({ error: "Pickup is not available" }, { status: 400 });
  }

  const behavior = deliveryUiBehavior(delivery.type);
  let resolvedAddress = body.address?.trim() || null;
  let resolvedNotes = body.notes?.trim() || null;

  if (deliveryRequiresAddress(delivery.type)) {
    if (body.addressCity?.trim() && body.addressStreet?.trim() && body.addressHouseNumber?.trim()) {
      resolvedAddress = formatStructuredAddress({
        city: body.addressCity,
        street: body.addressStreet,
        houseNumber: body.addressHouseNumber,
        apartment: body.addressApartment ?? "",
        postalCode: body.addressPostalCode ?? "",
      });
    }
    if (!resolvedAddress) {
      return NextResponse.json({ error: "יש למלא כתובת משלוח מלאה." }, { status: 400 });
    }
  } else if (behavior === "pickup_point") {
    if (!body.pickupPointId?.trim()) {
      return NextResponse.json({ error: "יש לבחור נקודת איסוף." }, { status: 400 });
    }
    const line = `נקודת איסוף: ${body.pickupPointId.trim()}`;
    resolvedNotes = resolvedNotes ? `${resolvedNotes}\n${line}` : line;
  }

  if (
    session?.role === "CUSTOMER" &&
    session.storeId === storeId &&
    (storeSettings?.requireEmailVerificationForCheckout ?? true)
  ) {
    const u = await prisma.user.findFirst({
      where: { id: session.userId, storeId },
      select: { emailVerified: true },
    });
    if (u && !u.emailVerified) {
      return NextResponse.json(
        { error: "יש לאמת את כתובת האימייל לפני ביצוע הזמנה." },
        { status: 403 },
      );
    }
  }

  let coupon = null as Awaited<ReturnType<typeof prisma.coupon.findFirst>>;
  if (body.couponCode?.trim()) {
    coupon = await prisma.coupon.findFirst({
      where: { storeId, code: body.couponCode.trim(), active: true },
    });
  }

  const subtotal = await computeSubtotalWithVariants(storeId, lines);
  const { discount: couponDiscount, code: appliedCoupon } = computeCouponDiscount(
    coupon,
    subtotal,
  );

  const deliveryPrice = Number(delivery.price);
  const remainingAfterCoupon = Math.round((subtotal + deliveryPrice - couponDiscount) * 100) / 100;

  let customerProfileId: string | null = null;
  let pointsBalance = 0;
  if (session?.role === "CUSTOMER" && session.storeId === storeId) {
    const user = await prisma.user.findFirst({
      where: { id: session.userId, storeId },
      include: { customerProfile: true },
    });
    if (user?.customerProfile) {
      customerProfileId = user.customerProfile.id;
      pointsBalance = user.customerProfile.pointsBalance;
    }
  }

  const loyalty = await prisma.loyaltySettings.findUnique({ where: { storeId } });
  const redeemReq = body.redeemPoints ?? 0;
  const { discount: pointsDiscount, pointsUsed } = computePointsDiscount(
    loyalty,
    redeemReq,
    pointsBalance,
    remainingAfterCoupon,
  );

  const total = computeTotal({
    subtotal,
    deliveryPrice,
    couponDiscount,
    pointsDiscount,
  });

  const deliveryName = snapshotDeliveryName(delivery, "he");

  let orderId: string;
  let orderNumber: string;
  try {
    const created = await prisma.$transaction(
      async (tx) => {
        const settings = await tx.storeSettings.findUnique({ where: { storeId } });
        if (!settings) {
          throw new Error("Store settings missing");
        }
        const nextOrderNumber = `${settings.orderNumberPrefix}-${settings.nextOrderNumber}`;
        await tx.storeSettings.update({
          where: { storeId },
          data: { nextOrderNumber: { increment: 1 } },
        });

        const order = await tx.order.create({
          data: {
            storeId,
            orderNumber: nextOrderNumber,
            customerId: customerProfileId,
            customerName: body.customerName,
            customerEmail: verifiedEmail,
            customerPhone: body.customerPhone,
            status: ORDER_STATUS_AWAITING_PAYMENT,
            paymentStatus: OrderPaymentStatus.UNPAID,
          subtotal: new Prisma.Decimal(subtotal),
          deliveryPrice: new Prisma.Decimal(deliveryPrice),
          discountAmount: new Prisma.Decimal(couponDiscount),
          pointsDiscountAmount: new Prisma.Decimal(pointsDiscount),
          total: new Prisma.Decimal(total),
          deliveryOptionName: deliveryName,
          deliveryOptionType: delivery.type as DeliveryType,
          deliveryOptionPrice: new Prisma.Decimal(deliveryPrice),
          address: resolvedAddress,
          notes: resolvedNotes,
          couponCode: appliedCoupon,
          loyaltyPointsRedeemed: pointsUsed,
        },
      });

    for (const line of lines) {
      const unit = await computeUnitPriceWithVariants(tx, storeId, line.product.id, line.optionIds);
      const lineTotal = Math.round(unit * line.quantity * 100) / 100;
      const mainImg = await tx.productImage.findFirst({
        where: { productId: line.product.id, storeId, isMain: true },
      });
      const anyImg = mainImg
        ? mainImg
        : await tx.productImage.findFirst({
            where: { productId: line.product.id, storeId },
            orderBy: { sortOrder: "asc" },
          });
      await tx.orderItem.create({
        data: {
          storeId,
          orderId: order.id,
          productId: line.product.id,
          productName: line.product.name_he,
          productImage: anyImg?.url ?? null,
          variantOptionIds: Array.from(new Set((line.optionIds ?? []).map(String))).filter(Boolean),
          quantity: line.quantity,
          unitPrice: new Prisma.Decimal(unit),
          totalPrice: new Prisma.Decimal(lineTotal),
        },
      });
    }

        return { orderId: order.id, orderNumber: order.orderNumber };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    orderId = created.orderId;
    orderNumber = created.orderNumber;
  } catch (err) {
    console.error("[checkout] order create failed", err);
    return NextResponse.json(
      { error: "לא ניתן ליצור הזמנה כרגע. נסו שוב בעוד רגע." },
      { status: 500 },
    );
  }

  const currency =
    (await prisma.storeSettings.findUnique({ where: { storeId } }))?.currency ?? "ILS";

  return NextResponse.json({
    orderId,
    orderNumber,
    total,
    currency,
  });
}

async function computeUnitPriceWithVariants(
  tx: Prisma.TransactionClient,
  storeId: string,
  productId: string,
  optionIds: string[],
): Promise<number> {
  const base = await tx.product.findFirst({ where: { id: productId, storeId }, select: { price: true } });
  const basePrice = base ? Number(base.price) : 0;
  const uniq = Array.from(new Set((optionIds ?? []).map(String)));
  if (uniq.length === 0) return basePrice;

  const opts = await tx.productVariantOption.findMany({
    where: {
      id: { in: uniq },
      group: { productId },
    },
    select: { priceAdd: true },
  });
  const add = opts.reduce((s, o) => s + Number(o.priceAdd), 0);
  return Math.round((basePrice + add) * 100) / 100;
}

async function computeSubtotalWithVariants(storeId: string, lines: Array<{ product: { id: string }; quantity: number; optionIds: string[] }>): Promise<number> {
  let s = 0;
  for (const line of lines) {
    const unit = await computeUnitPriceWithVariants(prisma, storeId, line.product.id, line.optionIds);
    s += unit * line.quantity;
  }
  return Math.round(s * 100) / 100;
}
