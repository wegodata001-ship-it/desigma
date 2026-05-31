import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestStoreId } from "@/lib/store-request";
import { analyzeDatabaseUrl } from "@/lib/db-url-mode";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const storeId = await getRequestStoreId();
  const dbUrl = analyzeDatabaseUrl(process.env.DATABASE_URL);

  let dbConnected = false;
  let dbError: string | null = null;
  let options: Array<{
    id: string;
    name_he: string;
    name_en: string;
    type: string;
    price: number;
    active: boolean;
    sortOrder: number;
    storeId: string;
  }> = [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
    const rows = await prisma.deliveryOption.findMany({
      where: { storeId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        storeId: true,
        name_he: true,
        name_en: true,
        type: true,
        price: true,
        active: true,
        sortOrder: true,
      },
    });
    options = rows.map((r) => ({
      id: r.id,
      storeId: r.storeId,
      name_he: r.name_he,
      name_en: r.name_en,
      type: r.type,
      price: Number(r.price),
      active: r.active,
      sortOrder: r.sortOrder,
    }));
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  const allStores = dbConnected
    ? await prisma.deliveryOption.groupBy({ by: ["storeId"], _count: { _all: true } }).catch(() => [])
    : [];

  return NextResponse.json({
    storeId,
    shippingOptionsCount: options.length,
    shippingOptions: options,
    dbConnected,
    dbError,
    DATABASE_URL_mode: dbUrl.mode,
    DATABASE_URL_port: dbUrl.port,
    deliveryOptionsByStore: allStores,
    note: "Only lists options for current storeId from NEXT_PUBLIC_STORE_ID",
  });
}
