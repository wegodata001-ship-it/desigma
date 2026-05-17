"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AssetImg } from "@/components/asset-img";
import { useCart } from "@/components/cart-context";
import { useStoreI18n } from "@/components/storefront/store-i18n";
import { crossSellModalDebug } from "@/lib/cross-sell-modal-debug";
import { pickLocalized } from "@/lib/localized";
import { forceUnlockBodyScroll, lockBodyScroll } from "@/lib/modal-scroll-lock";

type RelatedProduct = {
  id: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  price: number;
  stock: number;
  image: string | null;
};

type ModalPhase = "selecting" | "adding" | "closing";

const ADD_TIMEOUT_MS = 12_000;

export function RelatedProductsModal({
  open,
  onClose,
  main,
  mainDisplay,
  related,
}: {
  open: boolean;
  onClose: () => void;
  main: { productId: string; qty: number; optionIds: string[]; title: string };
  mainDisplay?: { image: string | null; price: number };
  related: RelatedProduct[];
}) {
  const { addItem } = useCart();
  const { lang, dir } = useStoreI18n();

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<ModalPhase>("selecting");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const addingRef = useRef(false);
  const addTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = useMemo(() => related.filter((p) => p.stock > 0), [related]);
  const busy = phase === "adding";

  const clearAddTimeout = useCallback(() => {
    if (addTimeoutRef.current) {
      clearTimeout(addTimeoutRef.current);
      addTimeoutRef.current = null;
    }
  }, []);

  const runCleanup = useCallback(() => {
    crossSellModalDebug("cleanup_triggered");
    clearAddTimeout();
    addingRef.current = false;
    setPhase("selecting");
    setSelected({});
    setError(null);
    forceUnlockBodyScroll();
  }, [clearAddTimeout]);

  const requestClose = useCallback(() => {
    crossSellModalDebug("modal_close");
    setPhase("closing");
    runCleanup();
    onClose();
    crossSellModalDebug("cleanup_complete");
  }, [onClose, runCleanup]);

  useEffect(() => {
    setMounted(true);
    return () => {
      runCleanup();
      crossSellModalDebug("unmount_cleanup");
    };
  }, [runCleanup]);

  useEffect(() => {
    if (!open) {
      runCleanup();
      return;
    }

    setPhase("selecting");
    setError(null);
    setSelected({});
    addingRef.current = false;
    crossSellModalDebug("modal_open", { productId: main.productId, relatedCount: items.length });

    const unlockScroll = lockBodyScroll();
    return () => {
      unlockScroll();
      crossSellModalDebug("scroll_lock_released");
    };
  }, [open, main.productId, items.length, runCleanup]);

  useEffect(() => {
    if (!open || !mounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, mounted, requestClose]);

  const commitAddToCart = useCallback(() => {
    if (addingRef.current) return;
    addingRef.current = true;
    setPhase("adding");
    setError(null);
    crossSellModalDebug("add_start", {
      productId: main.productId,
      selectedCount: Object.values(selected).filter(Boolean).length,
    });

    clearAddTimeout();
    addTimeoutRef.current = setTimeout(() => {
      crossSellModalDebug("add_timeout");
      setError("הפעולה לקחה יותר מדי זמן. נסו שוב.");
      addingRef.current = false;
      setPhase("selecting");
    }, ADD_TIMEOUT_MS);

    try {
      addItem(main.productId, main.qty, main.optionIds);
      for (const p of items) {
        if (selected[p.id]) addItem(p.id, 1, []);
      }
      crossSellModalDebug("add_success");
      requestClose();
    } catch (e) {
      crossSellModalDebug("add_failure", { message: e instanceof Error ? e.message : String(e) });
      setError("לא הצלחנו להוסיף לסל. נסו שוב.");
      setPhase("selecting");
    } finally {
      clearAddTimeout();
      addingRef.current = false;
    }
  }, [addItem, clearAddTimeout, items, main.optionIds, main.productId, main.qty, requestClose, selected]);

  const skipAndAddMain = useCallback(() => {
    if (addingRef.current) return;
    addingRef.current = true;
    setPhase("adding");
    crossSellModalDebug("skip_add_main");
    clearAddTimeout();
    try {
      addItem(main.productId, main.qty, main.optionIds);
      crossSellModalDebug("add_success");
      requestClose();
    } catch (e) {
      crossSellModalDebug("add_failure", { message: e instanceof Error ? e.message : String(e) });
      setError("לא הצלחנו להוסיף לסל.");
      setPhase("selecting");
    } finally {
      addingRef.current = false;
    }
  }, [addItem, clearAddTimeout, main.optionIds, main.productId, main.qty, requestClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[200] bg-black/70"
        aria-hidden
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="cross-sell-modal-title"
        dir={dir}
        className="pointer-events-auto fixed inset-x-0 bottom-0 z-[210] mx-auto w-full max-w-xl rounded-t-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl md:inset-y-0 md:bottom-auto md:left-1/2 md:right-auto md:top-1/2 md:w-[min(100%,28rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div id="cross-sell-modal-title" className="text-lg font-black text-white">השלם את הקנייה שלך</div>
            <div className="mt-1 text-sm text-zinc-400">לקוחות קונים גם את המוצרים האלו</div>
          </div>
          <button type="button" onClick={requestClose} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-200" aria-label="סגור">
            ✕
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-500/40 bg-blue-500/10 p-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-300">המוצר הראשי</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
              <AssetImg path={mainDisplay?.image ?? null} alt={main.title} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{main.title}</div>
              {mainDisplay ? <div className="mt-0.5 text-sm text-orange-400">₪{mainDisplay.price.toFixed(2)}</div> : null}
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-blue-500 text-sm text-white" aria-hidden>
              ✓
            </div>
          </div>
        </div>

        <div className="mt-4 max-h-[55vh] space-y-2 overflow-y-auto pr-1 md:max-h-[60vh]">
          {items.map((p) => {
            const checked = !!selected[p.id];
            const name = pickLocalized(p, "name", lang);
            return (
              <button
                key={p.id}
                type="button"
                disabled={busy}
                onClick={() => setSelected((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition disabled:opacity-60 ${
                  checked
                    ? "border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(37,99,235,0.25)]"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-blue-500/50"
                }`}
              >
                <div className="h-12 w-12 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                  <AssetImg path={p.image} alt={name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{name}</div>
                  <div className="mt-0.5 text-sm text-orange-400">₪{p.price.toFixed(2)}</div>
                </div>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm ${
                    checked ? "border-blue-400 bg-blue-500 text-white" : "border-zinc-700 text-zinc-400"
                  }`}
                  aria-hidden
                >
                  ✓
                </div>
              </button>
            );
          })}
          {items.length === 0 && <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">אין מוצרים משלימים זמינים.</div>}
        </div>

        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          <button
            type="button"
            onClick={commitAddToCart}
            disabled={busy}
            className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "מוסיף לסל…" : "הוסף לסל והמשך"}
          </button>
          <button
            type="button"
            onClick={skipAndAddMain}
            disabled={busy}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            דלג
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}


