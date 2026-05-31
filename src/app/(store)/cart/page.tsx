"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useCart } from "@/components/cart-context";
import { AssetImg } from "@/components/asset-img";
import { useStoreI18n } from "@/components/storefront/store-i18n";
import { pickLocalized } from "@/lib/localized";
import { availableStockForLine, isLinePurchasable, lineUnitPrice } from "@/lib/cart/availability";

export default function CartPage() {
  const router = useRouter();
  const { items, products, subtotal, syncing, syncedOnce, setQuantity, removeItem, validateForCheckout } =
    useCart();
  const { t, lang, dir } = useStoreI18n();

  const displayItems = useMemo(
    () =>
      items.filter((line) => {
        const p = products[line.productId];
        return p && isLinePurchasable(p, line);
      }),
    [items, products],
  );

  async function goCheckout() {
    const check = await validateForCheckout();
    if (!check.ok) return;
    router.push("/checkout");
  }

  return (
    <div dir={dir} className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-black text-white">{t("cart")}</h1>
      {(syncing || !syncedOnce) && items.length > 0 && <p className="mt-6 text-zinc-500">טוען…</p>}
      {syncedOnce && !syncing && displayItems.length === 0 && (
        <p className="mt-6 text-zinc-400">
          {t("emptyCart")}{" "}
          <Link href="/products" className="text-orange-400 hover:underline">
            לקטלוג
          </Link>
        </p>
      )}
      <ul className="mt-6 space-y-4">
        {displayItems.map((line) => {
          const p = products[line.productId];
          if (!p) return null;
          const maxStock = availableStockForLine(p, line.optionIds);
          const unit = lineUnitPrice(p, line.optionIds);
          const lineTotal = unit * line.quantity;
          return (
            <li
              key={line.key}
              className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                <AssetImg path={p.image} alt={pickLocalized(p, "name", lang)} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-zinc-100">{pickLocalized(p, "name", lang)}</div>
                <div className="mt-1 text-sm text-zinc-400">
                  ₪{unit.toFixed(2)} × {line.quantity} = ₪{lineTotal.toFixed(2)}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="text-sm text-zinc-400">
                    כמות{" "}
                    <input
                      type="number"
                      min={1}
                      max={maxStock}
                      value={line.quantity}
                      onChange={(e) =>
                        setQuantity(line.key, Math.min(maxStock, Math.max(1, Number(e.target.value) || 1)))
                      }
                      className="ml-1 w-16 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-200"
                    />
                  </label>
                  <button
                    type="button"
                    className="text-sm text-red-400 hover:underline"
                    onClick={() => removeItem(line.key)}
                  >
                    הסר
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {displayItems.length > 0 && (
        <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-6">
          <span className="text-lg font-semibold text-zinc-100">
            {t("subtotal")}: ₪{subtotal.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => void goCheckout()}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-medium text-white"
          >
            {t("checkout")}
          </button>
        </div>
      )}
    </div>
  );
}
