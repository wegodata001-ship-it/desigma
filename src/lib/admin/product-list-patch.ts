import type { ProductListRow } from "@/lib/admin/product-serialize";

type ListImage = ProductListRow["images"][number];

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
