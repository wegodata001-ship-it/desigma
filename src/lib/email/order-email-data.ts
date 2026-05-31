import "server-only";

import type { Order, OrderItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { OrderEmailLine } from "@/lib/email/templates/order-shared";

export type OrderEmailPayload = {
  order: Order;
  items: OrderEmailLine[];
  currency: string;
  paymentLabel: string;
  statusLabel: string;
};

function paymentLabel(status: string): string {
  switch (status) {
    case "PAID":
      return "שולם";
    case "REFUNDED":
      return "הוחזר";
    case "FAILED":
      return "תשלום נכשל";
    case "UNPAID":
    default:
      return "ממתין לתשלום";
  }
}

function fulfillmentLabel(status: string): string {
  switch (status) {
    case "PROCESSING":
      return "בטיפול";
    case "PACKED":
      return "ארוזה";
    case "SHIPPED":
      return "נשלחה";
    case "COMPLETED":
      return "הושלמה";
    case "CANCELLED":
      return "בוטלה";
    case "RECEIVED":
    default:
      return "התקבלה";
  }
}

export async function loadOrderEmailPayload(orderId: string): Promise<OrderEmailPayload | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return null;

  const variantIds = order.items.flatMap((i) =>
    Array.isArray(i.variantOptionIds) ? (i.variantOptionIds as string[]) : [],
  );
  const variantOpts =
    variantIds.length > 0
      ? await prisma.productVariantOption.findMany({
          where: { id: { in: variantIds } },
          include: { group: true },
        })
      : [];
  const variantById = new Map(variantOpts.map((o) => [o.id, o]));

  const items: OrderEmailLine[] = order.items.map((item: OrderItem) => {
    const ids = Array.isArray(item.variantOptionIds) ? (item.variantOptionIds as string[]) : [];
    const variantParts = ids
      .map((id) => {
        const o = variantById.get(id);
        return o ? `${o.group.name}: ${o.value}` : null;
      })
      .filter(Boolean);
    return {
      name: item.productName,
      variant: variantParts.length ? variantParts.join(" · ") : null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.totalPrice),
      imageUrl: item.productImage,
    };
  });

  const settings = await prisma.storeSettings.findUnique({
    where: { storeId: order.storeId },
    select: { currency: true },
  });

  return {
    order,
    items,
    currency: settings?.currency ?? "ILS",
    paymentLabel: paymentLabel(order.paymentStatus),
    statusLabel: fulfillmentLabel(order.fulfillmentStatus),
  };
}
