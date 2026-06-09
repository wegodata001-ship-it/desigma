import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getStoreId } from "@/lib/store-config";
import { safeQuery } from "@/lib/server/safe-query";
import { StoreProductDetailClient } from "@/components/storefront/store-product-detail-client";
import { pickProductImageUrl, sortProductImages } from "@/lib/product-images";
import { createSiteMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = createSiteMetadata("מוצר");

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  category: true,
  variantGroups: {
    orderBy: { sortOrder: "asc" as const },
    include: { options: { orderBy: { sortOrder: "asc" as const } } },
  },
  relatedProducts: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      relatedProduct: {
        include: { images: { orderBy: { sortOrder: "asc" as const }, take: 3 } },
      },
    },
  },
} as const;

function ProductNotFound({ productId }: { productId: string }) {
  return (
    <div dir="rtl" className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl">
        <p className="text-4xl" aria-hidden>
          📱
        </p>
        <h1 className="mt-4 text-2xl font-bold text-white">מוצר לא נמצא</h1>
        <p className="mt-3 text-sm text-zinc-400">
          לא מצאנו מוצר עם המזהה{" "}
          <span className="font-mono font-semibold text-zinc-200">{productId}</span>.
          <br />
          ייתכן שהמוצר הוסר או שהקישור שגוי.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-400"
          >
            לכל המוצרים
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-xl border border-zinc-700 px-5 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            חזרה לחנות
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storeId = getStoreId();

  const product = await safeQuery(
    "product.detail",
    () =>
      prisma.product.findFirst({
        where: { id, storeId },
        include: productInclude,
      }),
    null,
    { timeoutMs: 20_000 },
  );

  if (!product) {
    return <ProductNotFound productId={id} />;
  }

  return (
    <StoreProductDetailClient
      product={{
        id: product.id,
        name_he: product.name_he,
        name_ar: product.name_ar,
        name_en: product.name_en,
        description_he: product.description_he,
        description_ar: product.description_ar,
        description_en: product.description_en,
        specs_he: product.specs_he,
        specs_ar: product.specs_ar,
        specs_en: product.specs_en,
        price: Number(product.price),
        oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
        discountPercent: product.discountPercent ?? null,
        stock: product.stock,
        tags: product.tags ?? [],
        category: {
          name_he: product.category.name_he,
          name_ar: product.category.name_ar,
          name_en: product.category.name_en,
        },
        images: sortProductImages(product.images).map((i) => ({
          id: i.id,
          url: i.url,
          isMain: i.isMain,
          sortOrder: i.sortOrder,
        })),
        variantGroups: product.variantGroups.map((g) => ({
          id: g.id,
          name: g.name,
          sortOrder: g.sortOrder,
          options: g.options.map((o) => ({
            id: o.id,
            value: o.value,
            priceAdd: Number(o.priceAdd),
            stock: o.stock ?? null,
            sku: o.sku ?? null,
            image: o.image ?? null,
            isDefault: o.isDefault,
            sortOrder: o.sortOrder,
          })),
        })),
        relatedProducts: product.relatedProducts.map((rp) => ({
          id: rp.relatedProduct.id,
          name_he: rp.relatedProduct.name_he,
          name_ar: rp.relatedProduct.name_ar,
          name_en: rp.relatedProduct.name_en,
          price: Number(rp.relatedProduct.price),
          stock: rp.relatedProduct.stock,
          image: pickProductImageUrl(rp.relatedProduct.images),
        })),
      }}
    />
  );
}
