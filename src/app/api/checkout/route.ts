import { NextResponse } from "next/server";
import { z } from "zod";
import { DeliveryType, OrderPaymentStatus, Prisma } from "@prisma/client";
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
import { isLinePurchasable, lineUnitPrice, sanitizeCartLines } from "@/lib/cart/availability";
import type { CartLine } from "@/lib/cart/types";
import { loadCartProductsForStore, type CartProductView } from "@/lib/cart/load-cart-products";
import { perfLog } from "@/lib/server/perf-log";
import { getPrismaQueryScope, runWithPrismaQueryScope } from "@/lib/server/prisma-query-scope";
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
  const routeT0 = performance.now();
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

  return runWithPrismaQueryScope("checkout.post", async () => {
  const productIds = Array.from(new Set(cartInput.map((i) => i.productId)));
  const loadProductsT0 = performance.now();
  const productsMap = await loadCartProductsForStore(storeId, productIds);
  perfLog("checkout.post.load-products", performance.now() - loadProductsT0, {
    productIds: productIds.length,
  });

  const { items: validCartLines } = sanitizeCartLines(cartInput, productsMap);

  if (validCartLines.length !== cartInput.length) {
    return NextResponse.json(
      { error: "אחד או יותר מהמוצרים בעגלה אינם זמינים יותר. עדכנו את העגלה ונסו שוב." },
      { status: 400 },
    );
  }

  for (const line of validCartLines) {
    const snapshot = productsMap.get(line.productId);
    if (!snapshot?.active || !isLinePurchasable(snapshot, line)) {
      return NextResponse.json(
        { error: "אין מספיק מלאי לאחד המוצרים בעגלה." },
        { status: 400 },
      );
    }
  }

  type Line = { product: CartProductView; quantity: number; optionIds: string[] };
  const lines: Line[] = validCartLines.map((i) => {
    const product = productsMap.get(i.productId);
    if (!product) throw new Error("missing product");
    return { product, quantity: i.quantity, optionIds: i.optionIds ?? [] };
  });

  const parallelT0 = performance.now();
  const [delivery, storeSettings, coupon, loyalty, customerUser] = await Promise.all([
    prisma.deliveryOption.findFirst({
      where: { id: body.deliveryOptionId, storeId, active: true },
    }),
    prisma.storeSettings.findUnique({ where: { storeId } }),
    body.couponCode?.trim()
      ? prisma.coupon.findFirst({
          where: { storeId, code: body.couponCode.trim(), active: true },
        })
      : Promise.resolve(null),
    prisma.loyaltySettings.findUnique({ where: { storeId } }),
    session?.role === "CUSTOMER" && session.storeId === storeId
      ? prisma.user.findFirst({
          where: { id: session.userId, storeId },
          select: {
            emailVerified: true,
            customerProfile: { select: { id: true, pointsBalance: true } },
          },
        })
      : Promise.resolve(null),
  ]);
  perfLog("checkout.post.parallel-meta", performance.now() - parallelT0);

  if (!delivery) {
    return NextResponse.json({ error: "Invalid delivery option" }, { status: 400 });
  }

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
    (storeSettings?.requireEmailVerificationForCheckout ?? true) &&
    customerUser &&
    !customerUser.emailVerified
  ) {
    return NextResponse.json(
      { error: "יש לאמת את כתובת האימייל לפני ביצוע הזמנה." },
      { status: 403 },
    );
  }

  const subtotal = computeSubtotalFromSnapshots(lines);
  const { discount: couponDiscount, code: appliedCoupon } = computeCouponDiscount(
    coupon,
    subtotal,
  );

  const deliveryPrice = Number(delivery.price);
  const remainingAfterCoupon = Math.round((subtotal + deliveryPrice - couponDiscount) * 100) / 100;

  const customerProfileId = customerUser?.customerProfile?.id ?? null;
  const pointsBalance = customerUser?.customerProfile?.pointsBalance ?? 0;
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

  const linePricing = lines.map((line) => {
    const unit = lineUnitPrice(line.product, line.optionIds);
    return {
      line,
      unit,
      lineTotal: Math.round(unit * line.quantity * 100) / 100,
    };
  });

  const productImages = await prisma.productImage.findMany({
    where: { storeId, productId: { in: productIds } },
    orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }],
    select: { productId: true, url: true, isMain: true, sortOrder: true },
  });
  const imageByProduct = new Map<string, string | null>();
  for (const pid of productIds) {
    const imgs = productImages.filter((i) => i.productId === pid);
    const main = imgs.find((i) => i.isMain) ?? imgs[0];
    imageByProduct.set(pid, main?.url ?? null);
  }

  let orderId: string;
  let orderNumber: string;
  try {
    const created = await prisma.$transaction(
      async (tx) => {
        if (!storeSettings) {
          throw new Error("Store settings missing");
        }
        const nextOrderNumber = `${storeSettings.orderNumberPrefix}-${storeSettings.nextOrderNumber}`;
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

        await Promise.all(
          linePricing.map(({ line, unit, lineTotal }) =>
            tx.orderItem.create({
              data: {
                storeId,
                orderId: order.id,
                productId: line.product.id,
                productName: line.product.name_he,
                productImage: imageByProduct.get(line.product.id) ?? line.product.image,
                variantOptionIds: Array.from(new Set((line.optionIds ?? []).map(String))).filter(Boolean),
                quantity: line.quantity,
                unitPrice: new Prisma.Decimal(unit),
                totalPrice: new Prisma.Decimal(lineTotal),
              },
            }),
          ),
        );

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

  const currency = storeSettings?.currency ?? "ILS";
  const scope = getPrismaQueryScope();
  perfLog("checkout.post.total", performance.now() - routeT0, {
    prismaQueries: scope?.count ?? 0,
    lines: lines.length,
  });

  return NextResponse.json({
    orderId,
    orderNumber,
    total,
    currency,
  });
  });
}

function computeSubtotalFromSnapshots(
  lines: Array<{ product: CartProductView; quantity: number; optionIds: string[] }>,
): number {
  let s = 0;
  for (const line of lines) {
    s += lineUnitPrice(line.product, line.optionIds) * line.quantity;
  }
  return Math.round(s * 100) / 100;
}
