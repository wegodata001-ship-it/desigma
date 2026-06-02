import "server-only";

import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { perfLog, perfTimed } from "@/lib/server/perf-log";
import { getPrismaQueryScope, runWithPrismaQueryScope } from "@/lib/server/prisma-query-scope";
import { getRequestStoreId } from "@/lib/store-request";
import type { CheckoutBootstrapData } from "@/lib/checkout/checkout-bootstrap-types";
import type { DeliveryOptionDto } from "@/lib/shipping/delivery-behavior";

export type { CheckoutBootstrapData };

function serializeDeliveryOptions(
  options: Array<{
    id: string;
    name_he: string;
    name_ar: string;
    name_en: string;
    type: string;
    price: unknown;
    eta_he: string | null;
    eta_ar: string | null;
    eta_en: string | null;
    sortOrder: number;
  }>,
): DeliveryOptionDto[] {
  return options.map((o) => ({
    id: o.id,
    name_he: o.name_he,
    name_ar: o.name_ar,
    name_en: o.name_en,
    type: o.type as DeliveryOptionDto["type"],
    price: Number(o.price),
    eta_he: o.eta_he,
    eta_ar: o.eta_ar,
    eta_en: o.eta_en,
    sortOrder: o.sortOrder,
  }));
}

/** Single server load for /checkout — shipping + store flags + logged-in customer. */
export async function loadCheckoutBootstrap(): Promise<CheckoutBootstrapData> {
  const pageT0 = performance.now();
  return runWithPrismaQueryScope("checkout.bootstrap", async () => {
    const storeId = await getRequestStoreId();
    const session = await getSession();

    const [settings, options, user] = await Promise.all([
      perfTimed(
        "checkout.load-store",
        () =>
          prisma.storeSettings.findUnique({
            where: { storeId },
            select: {
              pickupEnabled: true,
              requireEmailVerificationForCheckout: true,
            },
          }),
        { storeId },
      ),
      perfTimed(
        "checkout.load-shipping",
        () =>
          prisma.deliveryOption.findMany({
            where: { storeId, active: true },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              name_he: true,
              name_ar: true,
              name_en: true,
              type: true,
              price: true,
              eta_he: true,
              eta_ar: true,
              eta_en: true,
              sortOrder: true,
            },
          }),
        { storeId },
      ),
      session?.role === UserRole.CUSTOMER
        ? perfTimed(
            "checkout.load-customer",
            () =>
              prisma.user.findFirst({
                where: { id: session.userId, storeId },
                select: {
                  name: true,
                  email: true,
                  emailVerified: true,
                  customerProfile: { select: { pointsBalance: true } },
                },
              }),
            { storeId },
          )
        : Promise.resolve(null),
    ]);

    const filtered =
      settings?.pickupEnabled === false ? options.filter((o) => o.type !== "PICKUP") : options;

    const scope = getPrismaQueryScope();
    perfLog("checkout.bootstrap.total", performance.now() - pageT0, {
      storeId,
      prismaQueries: scope?.count ?? 0,
      deliveryCount: filtered.length,
      hasCustomer: Boolean(user),
    });

    return {
      deliveryOptions: serializeDeliveryOptions(filtered),
      requireEmailVerificationForCheckout: settings?.requireEmailVerificationForCheckout ?? true,
      customer: user
        ? {
            name: user.name ?? "",
            email: user.email ?? "",
            pointsBalance: user.customerProfile?.pointsBalance ?? null,
            emailVerified: user.emailVerified,
          }
        : null,
    };
  });
}
