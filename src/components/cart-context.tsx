"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  cartSubtotal,
  CART_REMOVAL_TOAST_HE,
  validatedCartCount,
} from "@/lib/cart/availability";
import type { CartProductSnapshot } from "@/lib/cart/availability";
import type { CartLine } from "@/lib/cart/types";

export type { CartLine } from "@/lib/cart/types";

export type CartProductRow = CartProductSnapshot & {
  name_he: string;
  name_ar: string;
  name_en: string;
  image: string | null;
};

type CartContextValue = {
  items: CartLine[];
  cartCount: number;
  subtotal: number;
  products: Record<string, CartProductRow>;
  syncing: boolean;
  syncedOnce: boolean;
  lastAddedAt: number;
  removalToast: string | null;
  dismissRemovalToast: () => void;
  setQuantity: (key: string, quantity: number) => void;
  addItem: (productId: string, qty?: number, optionIds?: string[]) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  /** Re-sync with server; returns false if cart became empty or items were removed. */
  validateForCheckout: () => Promise<{ ok: boolean; error?: string }>;
};

const CartContext = createContext<CartContextValue | null>(null);

function storageKey() {
  const id = process.env.NEXT_PUBLIC_STORE_ID ?? "desigma";
  return `cart:${id}`;
}

function makeKey(productId: string, optionIds: string[]) {
  const uniq = Array.from(new Set(optionIds.map(String))).sort();
  return uniq.length ? `${productId}:${uniq.join(",")}` : productId;
}

function lineSignature(line: CartLine): string {
  return `${line.key}|${line.productId}|${line.quantity}|${line.optionIds.join(",")}`;
}

function linesEqual(a: CartLine[], b: CartLine[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].map(lineSignature).sort();
  const sb = [...b].map(lineSignature).sort();
  return sa.every((s, i) => s === sb[i]);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [products, setProducts] = useState<Record<string, CartProductRow>>({});
  const [syncing, setSyncing] = useState(false);
  const [lastAddedAt, setLastAddedAt] = useState(0);
  const [removalToast, setRemovalToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [syncedOnce, setSyncedOnce] = useState(false);
  const syncGen = useRef(0);
  const skipNextSync = useRef(false);
  const initialSyncDone = useRef(false);

  const productsMap = useMemo(() => new Map(Object.entries(products)), [products]);
  const cartCount = useMemo(
    () =>
      validatedCartCount(items, productsMap, {
        trustItemsWithoutProduct: syncedOnce,
      }),
    [items, productsMap, syncedOnce],
  );
  const subtotal = useMemo(() => cartSubtotal(items, productsMap), [items, productsMap]);

  const dismissRemovalToast = useCallback(() => setRemovalToast(null), []);

  const runSync = useCallback(async (lines: CartLine[], showToastOnRemove: boolean) => {
    if (lines.length === 0) {
      setProducts({});
      setSyncedOnce(true);
      return { items: [] as CartLine[], removed: false };
    }
    const gen = ++syncGen.current;
    setSyncing(true);
    try {
      const res = await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines }),
      });
      if (!res.ok) {
        setSyncedOnce(true);
        return { items: lines, removed: false };
      }
      const data = (await res.json()) as {
        items: CartLine[];
        removed?: boolean;
        products?: Record<string, CartProductRow>;
      };
      if (gen !== syncGen.current) return { items: lines, removed: false };

      setProducts(data.products ?? {});
      const next = data.items ?? [];
      const changed = !linesEqual(lines, next);
      const hadRemovals =
        next.length < lines.length ||
        lines.some((line) => !next.some((n) => n.key === line.key));

      if (changed) {
        skipNextSync.current = true;
        setItems(next);
        if (showToastOnRemove && hadRemovals) setRemovalToast(CART_REMOVAL_TOAST_HE);
      }

      setSyncedOnce(true);
      return { items: next, removed: changed && hadRemovals };
    } catch {
      setSyncedOnce(true);
      return { items: lines, removed: false };
    } finally {
      if (gen === syncGen.current) setSyncing(false);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey());
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        const list = Array.isArray(parsed) ? parsed : [];
        const normalized: CartLine[] = list
          .map((l) => {
            if (!l || typeof l !== "object") return null;
            const rec = l as Record<string, unknown>;
            const productId = typeof rec.productId === "string" ? rec.productId : "";
            if (!productId) return null;
            const quantity =
              typeof rec.quantity === "number" ? rec.quantity : Number(rec.quantity ?? 1);
            const optionIds = Array.isArray(rec.optionIds)
              ? rec.optionIds.filter((x): x is string => typeof x === "string")
              : [];
            const key = typeof rec.key === "string" ? rec.key : makeKey(productId, optionIds);
            return { key, productId, quantity: Number(quantity) || 1, optionIds };
          })
          .filter((x): x is CartLine => x != null);
        setItems(normalized);
        if (normalized.length === 0) setSyncedOnce(true);
      } else {
        setSyncedOnce(true);
      }
    } catch {
      setItems([]);
      setSyncedOnce(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey(), JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    const isFirst = !initialSyncDone.current;
    const delay = isFirst ? 0 : 120;
    const timer = window.setTimeout(() => {
      void runSync(items, true).then(() => {
        initialSyncDone.current = true;
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [items, hydrated, runSync]);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) => {
      const line = prev.find((p) => p.key === key);
      const next = prev.filter((p) => p.key !== key);
      if (quantity > 0 && line) next.push({ ...line, quantity });
      return next;
    });
  }, []);

  const addItem = useCallback((productId: string, qty = 1, optionIds: string[] = []) => {
    setItems((prev) => {
      const key = makeKey(productId, optionIds);
      const cur = prev.find((p) => p.key === key);
      const q = (cur?.quantity ?? 0) + qty;
      const rest = prev.filter((p) => p.key !== key);
      rest.push({
        key,
        productId,
        quantity: q,
        optionIds: Array.from(new Set(optionIds.map(String))).sort(),
      });
      return rest.sort((a, b) => a.key.localeCompare(b.key));
    });
    setLastAddedAt(Date.now());
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((p) => p.key !== key));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setProducts({});
  }, []);

  const validateForCheckout = useCallback(async () => {
    const { items: next, removed } = await runSync(items, true);
    if (next.length === 0) {
      return {
        ok: false,
        error: removed
          ? CART_REMOVAL_TOAST_HE
          : "העגלה ריקה. הוסיפו מוצרים לפני המשך לתשלום.",
      };
    }
    if (removed) {
      return { ok: false, error: CART_REMOVAL_TOAST_HE };
    }
    return { ok: true };
  }, [items, runSync]);

  const value = useMemo(
    () => ({
      items,
      cartCount,
      subtotal,
      products,
      syncing,
      syncedOnce,
      lastAddedAt,
      removalToast,
      dismissRemovalToast,
      setQuantity,
      addItem,
      removeItem,
      clear,
      validateForCheckout,
    }),
    [
      items,
      cartCount,
      subtotal,
      products,
      syncing,
      syncedOnce,
      lastAddedAt,
      removalToast,
      dismissRemovalToast,
      setQuantity,
      addItem,
      removeItem,
      clear,
      validateForCheckout,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
