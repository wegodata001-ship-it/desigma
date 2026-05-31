import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreId } from "@/lib/store-config";

export async function GET() {
  const storeId = getStoreId();
  const [settings, options] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { storeId } }),
    prisma.deliveryOption.findMany({
      where: { storeId, active: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const filtered =
    settings?.pickupEnabled === false
      ? options.filter((o) => o.type !== "PICKUP")
      : options;

  const serialized = filtered.map((o) => ({
    id: o.id,
    name_he: o.name_he,
    name_ar: o.name_ar,
    name_en: o.name_en,
    type: o.type,
    price: Number(o.price),
    eta_he: o.eta_he,
    eta_ar: o.eta_ar,
    eta_en: o.eta_en,
    sortOrder: o.sortOrder,
  }));

  return NextResponse.json({ options: serialized });
}
