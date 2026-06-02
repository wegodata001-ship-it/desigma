import { NextResponse } from "next/server";
import { getCachedSession } from "@/lib/auth/cached-session";
import { assertAdmin } from "@/lib/auth/scope";
import { productAdminDetailSelect, serializeAdminProduct } from "@/lib/admin/product-serialize";
import { prisma } from "@/lib/prisma";
import { perfQuery } from "@/lib/server/perf-query";
import { getStoreId } from "@/lib/store-config";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCachedSession();
  try {
    assertAdmin(session);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const storeId = getStoreId();

  const product = await perfQuery("admin.products.detail", () =>
    prisma.product.findFirst({
      where: { id, storeId },
      select: productAdminDetailSelect,
    }),
  );

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product: serializeAdminProduct(product) });
}
