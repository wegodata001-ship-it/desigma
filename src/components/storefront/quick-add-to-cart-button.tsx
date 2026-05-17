"use client";

import { useCallback, useRef, useState } from "react";
import { useCart } from "@/components/cart-context";
import { RelatedProductsModal } from "@/components/storefront/related-products-modal";
import { useStoreI18n } from "@/components/storefront/store-i18n";
import { crossSellModalDebug } from "@/lib/cross-sell-modal-debug";

type RelatedProduct = {
  id: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  price: number;
  stock: number;
  image: string | null;
};

type FlowPhase = "idle" | "fetching" | "open";

const FETCH_TIMEOUT_MS = 8_000;

export function QuickAddToCartButton({
  product,
  disabled,
}: {
  product: { id: string; title: string; price: number; image: string | null; stock: number };
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const { t } = useStoreI18n();
  const [phase, setPhase] = useState<FlowPhase>("idle");
  const [modalOpen, setModalOpen] = useState(false);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const inFlightRef = useRef(false);

  const busy = phase === "fetching";

  const handleModalClose = useCallback(() => {
    crossSellModalDebug("quick_add_modal_closed");
    setModalOpen(false);
    setPhase("idle");
    setRelated([]);
    inFlightRef.current = false;
  }, []);

  const click = async () => {
    if (disabled || inFlightRef.current || modalOpen) return;
    inFlightRef.current = true;
    setPhase("fetching");
    crossSellModalDebug("quick_add_start", { productId: product.id });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let openedModal = false;

    try {
      const res = await fetch(`/api/products/related?productId=${encodeURIComponent(product.id)}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        crossSellModalDebug("quick_add_fetch_failed", { status: res.status });
        addItem(product.id, 1, []);
        return;
      }
      const data = (await res.json()) as { related?: RelatedProduct[] };
      const rel = Array.isArray(data.related) ? data.related : [];
      if (rel.length === 0) {
        crossSellModalDebug("quick_add_no_related");
        addItem(product.id, 1, []);
        return;
      }
      setRelated(rel);
      openedModal = true;
      setModalOpen(true);
      setPhase("open");
      crossSellModalDebug("quick_add_modal_open");
    } catch (e) {
      crossSellModalDebug("quick_add_error", {
        message: e instanceof Error ? e.message : String(e),
      });
      addItem(product.id, 1, []);
    } finally {
      window.clearTimeout(timeoutId);
      inFlightRef.current = false;
      if (!openedModal) setPhase("idle");
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled || busy || modalOpen}
        onClick={() => void click()}
        className="w-full rounded-xl border border-orange-500/40 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:-translate-y-0.5 hover:shadow-orange-700/40 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-400"
      >
        {disabled ? t("outOfStock") : busy ? "טוען…" : t("addToCart")}
      </button>

      <RelatedProductsModal
        open={modalOpen}
        onClose={handleModalClose}
        main={{ productId: product.id, qty: 1, optionIds: [], title: product.title }}
        mainDisplay={{ image: product.image, price: product.price }}
        related={related}
      />
    </>
  );
}
