"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AssetImg } from "@/components/asset-img";
import { adminThumbnailSrc } from "@/lib/image-thumbnail";
import type { CategoryOpt } from "@/lib/admin/categories-options";
import {
  imagesFromUploadedPaths,
  patchProductDetailFromForm,
  patchProductListRowFromForm,
} from "@/lib/admin/product-list-patch";
import type { ProductListRow } from "@/lib/admin/product-serialize";
import {
  ADMIN_LIST_GC_MS,
  ADMIN_LIST_STALE_MS,
  ADMIN_PRODUCT_DETAIL_STALE_MS,
  adminProductsKeys,
} from "@/lib/admin/products-query-keys";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminSpinner } from "@/components/admin/admin-spinner";
import { ProductImagesSection } from "@/components/admin/product-images-section";
import {
  ProductVariantsSection,
  copyProductImagesToColorVariants,
  serializeVariantGroupsForSave,
  type VariantGroup,
  type VariantOption,
} from "@/components/admin/product-variants-section";
import { useAdminI18n } from "@/lib/admin-i18n";
import type { GalleryDisplayConfig } from "@/lib/product-gallery-display";
import { uploadAdminAsset } from "@/lib/admin-upload-client";
import { CREATE_PRODUCT_PERF, perfEnd, perfStart } from "@/lib/admin/create-product-perf";
import {
  addProductImagesBatch,
  deleteAllStoreProducts,
  deleteProduct,
  upsertProduct,
} from "@/app/admin/actions";
import { AdminBulkDeleteModal } from "@/components/admin/admin-bulk-delete-modal";
import {
  adminVariantGroupsFromPreset,
  PRODUCT_TAGS,
} from "@/lib/smartphone-catalog";
import { ProductSpecsEditor } from "@/components/admin/product-specs-editor";
import { serializeProductSpecs, specsForForm, type ProductSpecItem } from "@/lib/product-specs";

type Img = { id: string; url: string; isMain: boolean; sortOrder: number };
type RelatedProduct = { id: string; name_he: string; name_ar: string; name_en: string; price: number; image: string | null; sortOrder: number };
export type { CategoryOpt } from "@/lib/admin/categories-options";

export type ProductRow = {
  id: string;
  sku: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  description_he: string | null;
  description_ar: string | null;
  description_en: string | null;
  specs_he: unknown;
  specs_ar: unknown;
  specs_en: unknown;
  price: number;
  oldPrice: number | null;
  discountPercent: number | null;
  stock: number;
  active: boolean;
  featured: boolean;
  tags?: string[];
  categoryId: string;
  category: { name_he: string };
  images: Img[];
  variantGroups: VariantGroup[];
  relatedProducts: RelatedProduct[];
};

function SuccessBar({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
      {message}
    </div>
  );
}

async function fetchProductDetail(id: string): Promise<ProductRow> {
  const res = await fetch(`/api/admin/products/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load product");
  const data = (await res.json()) as { product: ProductRow };
  return data.product;
}

export function ProductsAdminClient({
  initialProducts,
  initialCategories,
  initialGalleryDisplay,
  initialOpenAdd,
}: {
  initialProducts: ProductListRow[];
  initialCategories: CategoryOpt[];
  initialGalleryDisplay: GalleryDisplayConfig;
  initialOpenAdd?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { t } = useAdminI18n();

  useEffect(() => {
    if (initialOpenAdd || searchParams.get("add") === "1") {
      setAddOpen(true);
      router.replace("/admin/products", { scroll: false });
    }
  }, [initialOpenAdd, router, searchParams]);

  const { data: products = initialProducts } = useQuery({
    queryKey: adminProductsKeys.list,
    queryFn: async () => initialProducts,
    initialData: initialProducts,
    staleTime: ADMIN_LIST_STALE_MS,
    gcTime: ADMIN_LIST_GC_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: categories = initialCategories } = useQuery({
    queryKey: adminProductsKeys.categories,
    queryFn: async () => initialCategories,
    initialData: initialCategories,
    staleTime: ADMIN_LIST_STALE_MS,
    gcTime: ADMIN_LIST_GC_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: galleryDisplay = initialGalleryDisplay } = useQuery({
    queryKey: adminProductsKeys.gallery,
    queryFn: async () => initialGalleryDisplay,
    initialData: initialGalleryDisplay,
    staleTime: ADMIN_LIST_STALE_MS,
    gcTime: ADMIN_LIST_GC_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const categoryOptions = useMemo(() => categories, [categories]);

  const patchList = useCallback(
    (productId: string, row: ProductListRow, isNew: boolean) => {
      queryClient.setQueryData<ProductListRow[]>(adminProductsKeys.list, (prev) => {
        const list = prev ?? initialProducts;
        if (isNew) return [row, ...list.filter((p) => p.id !== productId)];
        return list.map((p) => (p.id === productId ? row : p));
      });
    },
    [queryClient, initialProducts],
  );

  const {
    data: editProduct,
    isLoading: editLoading,
    error: editError,
  } = useQuery({
    queryKey: adminProductsKeys.product(editId ?? ""),
    queryFn: () => fetchProductDetail(editId!),
    enabled: !!editId,
    staleTime: ADMIN_PRODUCT_DETAIL_STALE_MS,
    gcTime: ADMIN_LIST_GC_MS,
    refetchOnMount: "always",
  });

  const handleProductImagesChange = useCallback(
    (productId: string, images: Img[]) => {
      queryClient.setQueryData<ProductRow>(adminProductsKeys.product(productId), (prev) =>
        prev ? { ...prev, images } : prev,
      );
      const main = images.find((i) => i.isMain) ?? images[0];
      queryClient.setQueryData<ProductListRow[]>(adminProductsKeys.list, (prev) => {
        const list = prev ?? [];
        return list.map((p) =>
          p.id === productId
            ? {
                ...p,
                images: main ? [{ ...main }] : [],
              }
            : p,
        );
      });
    },
    [queryClient],
  );

  const handleUpsert = async (form: FormData, files: File[] | null, editing: ProductRow | null) => {
    setSaving(true);
    perfStart(CREATE_PRODUCT_PERF.total);
    const clientT0 = performance.now();

    perfStart(CREATE_PRODUCT_PERF.product);
    const res = await upsertProduct(form);
    perfEnd(CREATE_PRODUCT_PERF.product, { ok: res.ok });
    if (!res.ok) {
      perfEnd(CREATE_PRODUCT_PERF.total, { failed: "upsertProduct" });
      setToast(res.error);
      setSaving(false);
      return;
    }
    const pid = res.data.productId;
    const isNew = !editing;
    const hadImages = (editing?.images.length ?? 0) > 0;
    let listImages = editing?.images ?? [];

    if (files?.length && pid) {
      let order = editing?.images.length ?? 0;
      perfStart(CREATE_PRODUCT_PERF.images);
      const uploadT0 = performance.now();
      try {
        const paths = await Promise.all(
          files.map((file, i) =>
            uploadAdminAsset(file, "products", {
              entityId: pid,
              originalName: file.name,
            }).then((path) => ({ path, i })),
          ),
        );
        const uploadMs = Math.round(performance.now() - uploadT0);
        console.log("[create-product-perf] image-uploads-parallel", {
          count: files.length,
          uploadMs,
        });

        const batch = paths
          .sort((a, b) => a.i - b.i)
          .map(({ path, i }) => ({
            url: path,
            sortOrder: order++,
            isMain: !hadImages && i === 0,
          }));

        const batchRes = await addProductImagesBatch({ productId: pid, images: batch });
        if (!batchRes.ok) {
          console.error("[handleUpsert] addProductImagesBatch failed", batchRes.error);
          setToast(batchRes.error);
          perfEnd(CREATE_PRODUCT_PERF.images, { failed: true });
          perfEnd(CREATE_PRODUCT_PERF.total, { failed: "images" });
          setSaving(false);
          return;
        }
        listImages = imagesFromUploadedPaths(
          paths.sort((a, b) => a.i - b.i).map((p) => p.path),
          editing?.images.length ?? 0,
          hadImages,
        );
        perfEnd(CREATE_PRODUCT_PERF.images, { count: files.length, uploadMs });
      } catch (e) {
        console.error("[handleUpsert] product image upload failed", e);
        perfEnd(CREATE_PRODUCT_PERF.images, { error: true });
        perfEnd(CREATE_PRODUCT_PERF.total, { failed: "images" });
        setToast(e instanceof Error ? e.message : t("imageSaveFailed"));
        setSaving(false);
        return;
      }
    }

    const listRow = patchProductListRowFromForm(
      form,
      pid,
      products.find((p) => p.id === pid),
      listImages,
    );
    patchList(pid, listRow, isNew);

    if (editing) {
      const images = listImages.length > 0 ? listImages : editing.images;
      queryClient.setQueryData<ProductRow>(
        adminProductsKeys.product(pid),
        patchProductDetailFromForm(form, pid, editing, images),
      );
    }

    setToast(t("savedSuccessfully"));
    setAddOpen(false);
    setEditId(null);
    setSaving(false);

    perfEnd(CREATE_PRODUCT_PERF.total, {
      clientMs: Math.round(performance.now() - clientT0),
      hadImages: Boolean(files?.length),
      note: "no router.refresh — local cache patch only",
    });
  };

  const handleDelete = async (id: string) => {
    const fd = new FormData();
    fd.append("id", id);
    const res = await deleteProduct(fd);
    if (!res.ok) setToast(res.error);
    else {
      setToast(t("deletedSuccessfully"));
      setDeleteId(null);
      queryClient.setQueryData<ProductListRow[]>(adminProductsKeys.list, (prev) =>
        (prev ?? []).filter((p) => p.id !== id),
      );
      queryClient.removeQueries({ queryKey: adminProductsKeys.product(id) });
    }
  };

  return (
    <div>
      {toast && (
        <SuccessBar message={toast === "error" ? "שגיאה" : toast} onDismiss={() => setToast(null)} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t("products")}</h1>
          <p className="text-sm text-slate-500">{t("productsSubtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setBulkDeleteOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_22px_-6px_rgba(239,68,68,0.65)] transition hover:bg-red-500 hover:shadow-[0_0_26px_-4px_rgba(239,68,68,0.75)]"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            {t("bulkDeleteAllProducts")}
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            {t("addProduct")}
          </button>
        </div>
      </div>

      <AdminBulkDeleteModal
        open={bulkDeleteOpen}
        onClose={() => !bulkDeleting && setBulkDeleteOpen(false)}
        title={t("bulkDeleteProductsTitle")}
        description={t("bulkDeleteProductsWarning")}
        typeDeleteHint={t("typeDeleteToConfirm")}
        cancelLabel={t("cancel")}
        confirmLabel={t("bulkDeleteAllProducts")}
        pending={bulkDeleting}
        onConfirmed={async (phrase) => {
          setBulkDeleting(true);
          try {
            const res = await deleteAllStoreProducts(phrase);
            if (!res.ok) setToast(res.error);
            else {
              setToast(t("allProductsDeletedToast"));
              setBulkDeleteOpen(false);
              queryClient.setQueryData<ProductListRow[]>(adminProductsKeys.list, []);
            }
          } finally {
            setBulkDeleting(false);
          }
        }}
      />

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">{t("image")}</th>
              <th className="px-4 py-3">{t("name")}</th>
              <th className="px-4 py-3">{t("price")}</th>
              <th className="px-4 py-3">{t("stock")}</th>
              <th className="px-4 py-3">{t("active")}</th>
              <th className="px-4 py-3 text-end">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const main = p.images.find((i) => i.isMain) ?? p.images[0];
              return (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-2">
                    <div className="h-12 w-12 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                      <AssetImg
                        path={main?.url ? adminThumbnailSrc(main.url, 120) : null}
                        alt=""
                        className="h-full w-full object-cover"
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-900">{p.name_he}</td>
                  <td className="px-4 py-2 tabular-nums">₪{p.price.toFixed(2)}</td>
                  <td className="px-4 py-2 tabular-nums">{p.stock}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {p.active ? t("active") : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-end">
                    <button
                      type="button"
                      onClick={() => setEditId(p.id)}
                      className="text-blue-600 hover:underline"
                    >
                      {t("edit")}
                    </button>
                    <span className="mx-2 text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setDeleteId(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      {t("delete")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-center text-slate-500">{t("noProducts")}</p>
        )}
      </div>

      {saving && (
        <div className="fixed bottom-6 left-6 z-[90] flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-white shadow-lg">
          <AdminSpinner className="h-4 w-4 border-t-white" />
          <span className="text-sm">{t("updating")}</span>
        </div>
      )}

      <AdminModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t("addProduct")}
        size="xl"
      >
        <ProductForm
          key="new-product"
          categories={categoryOptions}
          allProducts={products}
          galleryDisplay={galleryDisplay}
          onSubmit={(fd, files) => handleUpsert(fd, files, null)}
          onCancel={() => setAddOpen(false)}
        />
      </AdminModal>

      <AdminModal
        open={!!editId}
        onClose={() => setEditId(null)}
        title={t("edit")}
        size="xl"
      >
        {editLoading && !editProduct && (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-600">
            <AdminSpinner />
            <span>{t("updating")}</span>
          </div>
        )}
        {editError && (
          <p className="py-8 text-center text-sm text-red-600">{(editError as Error).message}</p>
        )}
        {editProduct && (
          <ProductForm
            key={editProduct.id}
            categories={categories}
            allProducts={products}
            galleryDisplay={galleryDisplay}
            product={editProduct}
            onSubmit={(fd, files) => handleUpsert(fd, files, editProduct)}
            onCancel={() => setEditId(null)}
            onImagesChange={handleProductImagesChange}
          />
        )}
      </AdminModal>

      <AdminModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={t("delete")}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              onClick={() => setDeleteId(null)}
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              onClick={() => deleteId && void handleDelete(deleteId)}
            >
              {t("delete")}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">{t("confirmDeleteProduct")}</p>
      </AdminModal>
    </div>
  );
}

function ProductForm({
  categories,
  allProducts,
  galleryDisplay,
  product,
  onSubmit,
  onCancel,
  onImagesChange,
}: {
  categories: CategoryOpt[];
  allProducts: ProductListRow[];
  galleryDisplay: GalleryDisplayConfig;
  product?: ProductRow;
  onSubmit: (fd: FormData, files: File[] | null) => Promise<void>;
  onCancel: () => void;
  onImagesChange?: (productId: string, images: Img[]) => void;
}) {
  const [pending, setPending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [variantGroups, setVariantGroups] = useState<
    Array<{
      id: string;
      name: string;
      sortOrder: number;
      options: Array<{
        id: string;
        value: string;
        priceAdd: number;
        stock: number | null;
        sku: string | null;
        image: string | null;
        isDefault: boolean;
        sortOrder: number;
        uploading?: boolean;
      }>;
    }>
  >(() => {
    const groups = product?.variantGroups ?? [];
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      sortOrder: g.sortOrder,
      options: (g.options ?? []).map((o) => ({
        id: o.id,
        value: o.value,
        priceAdd: o.priceAdd,
        stock: o.stock,
        sku: o.sku,
        image: o.image,
        isDefault: o.isDefault,
        sortOrder: o.sortOrder,
      })),
    }));
  });
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>(() => {
    const rel = product?.relatedProducts ?? [];
    return [...rel].sort((a, b) => a.sortOrder - b.sortOrder);
  });
  const [relatedModalOpen, setRelatedModalOpen] = useState(false);
  const [relatedQuery, setRelatedQuery] = useState("");
  const [specsHe, setSpecsHe] = useState<ProductSpecItem[]>(() => specsForForm(product?.specs_he));
  const [specsAr, setSpecsAr] = useState<ProductSpecItem[]>(() => specsForForm(product?.specs_ar));
  const [specsEn, setSpecsEn] = useState<ProductSpecItem[]>(() => specsForForm(product?.specs_en));
  const { t } = useAdminI18n();

  useEffect(() => {
    if (!product?.id) return;
    setSpecsHe(specsForForm(product.specs_he));
    setSpecsAr(specsForForm(product.specs_ar));
    setSpecsEn(specsForForm(product.specs_en));
  }, [product?.id, product?.specs_he, product?.specs_ar, product?.specs_en]);

  async function internalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (!product?.id) fd.append("id", "");
    else fd.set("id", product.id);
    const sku = (fd.get("sku") as string)?.trim();
    if (!sku && !product) {
      fd.set("sku", `SKU-${Date.now()}`);
    }
    const files = selectedFiles.length > 0 ? selectedFiles : null;
    fd.set("variantGroups", JSON.stringify(serializeVariantGroupsForSave(variantGroups)));
    fd.set(
      "relatedProducts",
      JSON.stringify(relatedProducts.map((p, idx) => ({ id: p.id, sortOrder: idx }))),
    );
    fd.set("specs_he", serializeProductSpecs(specsHe));
    fd.set("specs_ar", serializeProductSpecs(specsAr));
    fd.set("specs_en", serializeProductSpecs(specsEn));
    setPending(true);
    try {
      await onSubmit(fd, files);
      setSelectedFiles([]);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={internalSubmit} className="grid gap-3">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-slate-700">
          {t("productNameHe")}
          <input
            name="name_he"
            required
            defaultValue={product?.name_he}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-700">
          {t("productNameAr")}
          <input
            name="name_ar"
            required
            defaultValue={product?.name_ar}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-700">
          {t("productNameEn")}
          <input
            name="name_en"
            required
            defaultValue={product?.name_en}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="sm:col-span-3 text-xs font-medium text-slate-700">
          {t("productDescriptionHe")}
          <textarea
            name="description_he"
            rows={6}
            defaultValue={product?.description_he ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <ProductSpecsEditor
          label={t("productSpecsTitleHe")}
          specs={specsHe}
          onChange={setSpecsHe}
        />
        <label className="sm:col-span-3 text-xs font-medium text-slate-700">
          {t("productDescriptionAr")}
          <textarea
            name="description_ar"
            rows={6}
            defaultValue={product?.description_ar ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <ProductSpecsEditor
          label={t("productSpecsTitleAr")}
          specs={specsAr}
          onChange={setSpecsAr}
        />
        <label className="sm:col-span-3 text-xs font-medium text-slate-700">
          {t("productDescriptionEn")}
          <textarea
            name="description_en"
            rows={6}
            defaultValue={product?.description_en ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <ProductSpecsEditor
          label={t("productSpecsTitleEn")}
          specs={specsEn}
          onChange={setSpecsEn}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-slate-700">
          {t("productSku")}
          <input
            name="sku"
            required={!!product}
            defaultValue={product?.sku}
            placeholder={t("productSkuPlaceholder")}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-700">
          {t("productCategory")}
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-700">
          {t("stock")}
          <input
            name="stock"
            type="number"
            required
            defaultValue={product?.stock ?? 0}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-700">
          {t("price")}
          <input
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={product?.price ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-700">
          {t("productOldPrice")}
          <input
            name="oldPrice"
            type="number"
            step="0.01"
            defaultValue={product?.oldPrice ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-700">
          {t("productDiscountPercent")}
          <input
            name="discountPercent"
            type="number"
            defaultValue={product?.discountPercent ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} value="on" />
        {t("productActive")}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} value="on" />
        {t("productFeatured")}
      </label>
      <label className="text-xs font-medium text-slate-700">
        תגיות מוצר (New, Sale, Best Seller…)
        <input
          name="tags"
          defaultValue={(product?.tags ?? []).join(", ")}
          placeholder="NEW, SALE, BEST SELLER"
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <div className="flex flex-wrap gap-1">
        {PRODUCT_TAGS.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
            {tag}
          </span>
        ))}
      </div>

      <ProductImagesSection
        product={product ? { id: product.id, images: product.images } : null}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        galleryDisplay={galleryDisplay}
        onImagesChange={onImagesChange}
        onCopyToColors={
          product && product.images.length > 0
            ? () => setVariantGroups((prev) => copyProductImagesToColorVariants(prev, product.images))
            : undefined
        }
      />

      <ProductVariantsSection
        variantGroups={variantGroups}
        setVariantGroups={setVariantGroups}
        productImages={product?.images ?? []}
        productId={product?.id}
        onApplyPreset={(brand) => setVariantGroups(adminVariantGroupsFromPreset(brand))}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">מוצרים משלימים</div>
            <div className="mt-0.5 text-xs text-slate-500">בחרו מוצרים קיימים כדי להציע Cross‑sell לפני הוספה לסל.</div>
          </div>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            onClick={() => setRelatedModalOpen(true)}
          >
            + הוסף מוצר משלים
          </button>
        </div>

        {relatedProducts.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
            אין מוצרים משלימים כרגע.
          </div>
        ) : (
          <ul className="mt-4 grid gap-2">
            {relatedProducts.map((rp, idx) => (
              <li key={rp.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="h-10 w-10 overflow-hidden rounded-md border border-slate-200 bg-white">
                  <AssetImg path={rp.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">{rp.name_he}</div>
                  <div className="text-xs text-slate-500">₪{rp.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    disabled={idx === 0}
                    onClick={() =>
                      setRelatedProducts((prev) => {
                        if (idx === 0) return prev;
                        const next = [...prev];
                        const tmp = next[idx - 1];
                        next[idx - 1] = next[idx];
                        next[idx] = tmp;
                        return next;
                      })
                    }
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    disabled={idx === relatedProducts.length - 1}
                    onClick={() =>
                      setRelatedProducts((prev) => {
                        if (idx === prev.length - 1) return prev;
                        const next = [...prev];
                        const tmp = next[idx + 1];
                        next[idx + 1] = next[idx];
                        next[idx] = tmp;
                        return next;
                      })
                    }
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => setRelatedProducts((prev) => prev.filter((x) => x.id !== rp.id))}
                  >
                    הסר
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <AdminModal open={relatedModalOpen} onClose={() => setRelatedModalOpen(false)} title="הוסף מוצרים משלימים" size="lg">
          <div className="space-y-3">
            <input
              value={relatedQuery}
              onChange={(e) => setRelatedQuery(e.target.value)}
              placeholder="חפש מוצר..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="max-h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-white">
              <ul className="divide-y divide-slate-100">
                {allProducts
                  .filter((p) => p.id !== product?.id)
                  .filter((p) => {
                    const q = relatedQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      p.name_he.toLowerCase().includes(q) ||
                      p.name_en.toLowerCase().includes(q) ||
                      p.sku.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, 60)
                  .map((p) => {
                    const main = p.images.find((i) => i.isMain) ?? p.images[0];
                    const checked = relatedProducts.some((x) => x.id === p.id);
                    return (
                      <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setRelatedProducts((prev) => {
                              const exists = prev.some((x) => x.id === p.id);
                              if (exists) return prev.filter((x) => x.id !== p.id);
                              return [
                                ...prev,
                                {
                                  id: p.id,
                                  name_he: p.name_he,
                                  name_ar: p.name_ar,
                                  name_en: p.name_en,
                                  price: p.price,
                                  image: main?.url ?? null,
                                  sortOrder: prev.length,
                                },
                              ];
                            });
                          }}
                        />
                        <div className="h-10 w-10 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                          <AssetImg path={main?.url ?? null} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900">{p.name_he}</div>
                          <div className="text-xs text-slate-500">₪{p.price.toFixed(2)} • {p.sku}</div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="rounded-lg border border-slate-200 px-4 py-2 text-sm" onClick={() => setRelatedModalOpen(false)}>
                סגור
              </button>
              <button type="button" className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" onClick={() => setRelatedModalOpen(false)}>
                שמור בחירה
              </button>
            </div>
          </div>
        </AdminModal>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending && <AdminSpinner className="h-4 w-4 border-t-white" />}
          {t("save")}
        </button>
      </div>
    </form>
  );
}
