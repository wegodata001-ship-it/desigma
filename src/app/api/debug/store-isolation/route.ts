import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestStoreContext } from "@/lib/store-request";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getRequestStoreContext();
  const stores = ["base", "desigma", "hagor"] as const;

  const counts: Record<string, Record<string, number>> = {};
  for (const storeId of stores) {
    counts[storeId] = {
      products: await prisma.product.count({ where: { storeId } }),
      categories: await prisma.category.count({ where: { storeId } }),
      deliveryOptions: await prisma.deliveryOption.count({ where: { storeId } }),
      banners: await prisma.banner.count({ where: { storeId } }),
      storeSettings: await prisma.storeSettings.count({ where: { storeId } }),
    };
  }

  return NextResponse.json({
    requestStoreId: ctx.storeId,
    env_NEXT_PUBLIC_STORE_ID: process.env.NEXT_PUBLIC_STORE_ID ?? null,
    counts,
    note: "Collection/Feature models do not exist in schema",
  });
}
