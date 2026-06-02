import type { ProductListRow } from "@/lib/admin/product-serialize";
import type { ProductRow } from "@/components/admin/products-admin-client";
import { parseProductSpecs } from "@/lib/product-specs";

type ListImage = ProductListRow["images"][number];

function specsFromForm(form: FormData, key: string, prev: unknown): unknown {
  const raw = String(form.get(key) ?? "").trim();
  if (!raw) return prev ?? null;
  try {
    const items = parseProductSpecs(JSON.parse(raw));
    return items.length > 0 ? items : null;
  } catch {
    return prev ?? null;
  }
}

/** Merge saved form fields into admin product detail cache (includes specs). */
export function patchProductDetailFromForm(
  form: FormData,
  productId: string,
  prev: ProductRow,
  images: ProductRow["images"],
): ProductRow {
  const emptyToNull = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : s;
  };
  const oldPriceRaw = form.get("oldPrice");
  const discountRaw = form.get("discountPercent");
  const categoryId = String(form.get("categoryId") ?? prev.categoryId);
  const tagsRaw = String(form.get("tags") ?? "");
  const tags = tagsRaw
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    ...prev,
    id: productId,
    sku: String(form.get("sku") ?? prev.sku),
    name_he: String(form.get("name_he") ?? prev.name_he),
    name_ar: String(form.get("name_ar") ?? prev.name_ar),
    name_en: String(form.get("name_en") ?? prev.name_en),
    description_he: emptyToNull(form.get("description_he")),
    description_ar: emptyToNull(form.get("description_ar")),
    description_en: emptyToNull(form.get("description_en")),
    specs_he: specsFromForm(form, "specs_he", prev.specs_he),
    specs_ar: specsFromForm(form, "specs_ar", prev.specs_ar),
    specs_en: specsFromForm(form, "specs_en", prev.specs_en),
    price: Number(form.get("price")),
    oldPrice:
      oldPriceRaw == null || String(oldPriceRaw).trim() === ""
        ? null
        : Number(oldPriceRaw),
    discountPercent:
      discountRaw == null || String(discountRaw).trim() === ""
        ? null
        : Number(discountRaw),
    stock: Number(form.get("stock")),
    active: form.get("active") === "on",
    featured: form.get("featured") === "on",
    tags: tags.length > 0 ? tags : prev.tags ?? [],
    categoryId,
    images: images.length > 0 ? images : prev.images,
  };
}

export function patchProductListRowFromForm(
  form: FormData,
  productId: string,
  prev?: ProductListRow,
  images?: ListImage[],
): ProductListRow {
  return {
    id: productId,
    sku: String(form.get("sku") ?? prev?.sku ?? ""),
    name_he: String(form.get("name_he") ?? prev?.name_he ?? ""),
    name_ar: String(form.get("name_ar") ?? prev?.name_ar ?? ""),
    name_en: String(form.get("name_en") ?? prev?.name_en ?? ""),
    price: Number(form.get("price")),
    stock: Number(form.get("stock")),
    active: form.get("active") === "on",
    category: prev?.category ?? { name_he: "" },
    images: images ?? prev?.images ?? [],
  };
}

export function imagesFromUploadedPaths(
  paths: string[],
  startOrder: number,
  hadImages: boolean,
): ListImage[] {
  return paths.map((url, i) => ({
    id: `new-${startOrder + i}`,
    url,
    isMain: !hadImages && i === 0,
    sortOrder: startOrder + i,
  }));
}
