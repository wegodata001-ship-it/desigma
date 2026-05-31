import type { CartLine } from "@/lib/cart/types";

/** Product snapshot used for cart availability (maps DB `active` → isActive). */
export type CartProductSnapshot = {
  id: string;
  active: boolean;
  stock: number;
  price: number;
  variantOptions?: Array<{ id: string; stock: number | null; priceAdd: number }>;
};

export function lineUnitPrice(product: CartProductSnapshot, optionIds: string[]): number {
  const base = product.price;
  const ids = new Set(optionIds);
  const opts = product.variantOptions?.filter((o) => ids.has(o.id)) ?? [];
  const add = opts.reduce((s, o) => s + (Number.isFinite(o.priceAdd) ? o.priceAdd : 0), 0);
  return Math.round((base + add) * 100) / 100;
}

/** Max purchasable quantity for a cart line (0 = unavailable). */
export function availableStockForLine(product: CartProductSnapshot, optionIds: string[]): number {
  if (!product.active) return 0;
  const ids = optionIds.filter(Boolean);
  const opts =
    product.variantOptions?.filter((o) => ids.includes(o.id)) ?? [];
  const managed = opts.filter((o) => o.stock != null);
  if (managed.length > 0) {
    return Math.min(...managed.map((o) => Math.max(0, o.stock!)));
  }
  return Math.max(0, product.stock);
}

export function isLinePurchasable(
  product: CartProductSnapshot | undefined,
  line: Pick<CartLine, "quantity" | "optionIds">,
): boolean {
  if (!product) return false;
  return availableStockForLine(product, line.optionIds) >= line.quantity && line.quantity > 0;
}

export type SanitizeCartResult = {
  items: CartLine[];
  removed: boolean;
  adjusted: boolean;
};

function lineSignature(line: CartLine): string {
  return `${line.key}|${line.productId}|${line.quantity}|${line.optionIds.join(",")}`;
}

function linesEqual(a: CartLine[], b: CartLine[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].map(lineSignature).sort();
  const sb = [...b].map(lineSignature).sort();
  return sa.every((s, i) => s === sb[i]);
}

export function sanitizeCartLines(
  items: CartLine[],
  productsById: Map<string, CartProductSnapshot>,
): SanitizeCartResult {
  const validItems: CartLine[] = [];
  let removed = false;
  let adjusted = false;

  for (const line of items) {
    const product = productsById.get(line.productId);
    if (!product) {
      removed = true;
      continue;
    }
    const avail = availableStockForLine(product, line.optionIds);
    if (avail <= 0) {
      removed = true;
      continue;
    }
    const qty = Math.min(Math.max(1, line.quantity), avail);
    if (qty !== line.quantity) adjusted = true;
    validItems.push({ ...line, quantity: qty });
  }

  if (!linesEqual(items, validItems)) removed = true;
  return { items: validItems, removed, adjusted };
}

export function cartItemCount(items: CartLine[]): number {
  return items.reduce((n, line) => n + line.quantity, 0);
}

/** Badge/count — only purchasable lines; unknown products excluded unless trusted (optimistic add). */
export function validatedCartCount(
  items: CartLine[],
  productsById: Map<string, CartProductSnapshot>,
  options?: { trustItemsWithoutProduct?: boolean },
): number {
  if (items.length === 0) return 0;
  let count = 0;
  for (const line of items) {
    const product = productsById.get(line.productId);
    if (!product) {
      if (options?.trustItemsWithoutProduct) count += line.quantity;
      continue;
    }
    if (isLinePurchasable(product, line)) count += line.quantity;
  }
  return count;
}

export function cartSubtotal(
  items: CartLine[],
  productsById: Map<string, CartProductSnapshot>,
): number {
  let sum = 0;
  for (const line of items) {
    const product = productsById.get(line.productId);
    if (!product || !product.active) continue;
    if (availableStockForLine(product, line.optionIds) <= 0) continue;
    sum += lineUnitPrice(product, line.optionIds) * line.quantity;
  }
  return Math.round(sum * 100) / 100;
}

export const CART_REMOVAL_TOAST_HE =
  "אחד או יותר מהמוצרים בעגלה אינם זמינים יותר והוסרו מהעגלה.";
