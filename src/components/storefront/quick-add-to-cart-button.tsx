"use client";

import { useCallback, useState } from "react";
import { useCart, type CartProductRow } from "@/components/cart-context";
import { RelatedProductsModal } from "@/components/storefront/related-products-modal";
import { useStoreI18n } from "@/components/storefront/store-i18n";

type RelatedProduct = {
  id: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  price: number;
  stock: number;
  image: string | null;
};

function toCartSnapshot(product: {
  id: string;
  title: string;
  price: number;
  image: string | null;
  stock: number;
}): CartProductRow {
  const title = product.title;
  return {
    id: product.id,
    active: product.stock > 0,
    stock: product.stock,
    price: product.price,
    name_he: title,
    name_ar: title,
    name_en: title,
    image: product.image,
  };
}

/**
 * Instant add-to-cart from catalog cards.
 * Cross-sell modal only when `relatedProducts` is passed from the server (no blocking API).
 */
export function QuickAddToCartButton({
  product,
  disabled,
  relatedProducts = [],
}: {
  product: { id: string; title: string; price: number; image: string | null; stock: number };
  disabled?: boolean;
  relatedProducts?: RelatedProduct[];
}) {
  const { addItem } = useCart();
  const { t } = useStoreI18n();
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const click = () => {
    if (disabled || modalOpen) return;
    const snapshot = toCartSnapshot(product);
    addItem(product.id, 1, [], snapshot, "quick-add-catalog");

    const rel = relatedProducts.filter((p) => p.stock > 0);
    if (rel.length > 0) {
      setModalOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled || modalOpen}
        onClick={click}
        className="w-full rounded-xl border border-orange-500/40 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:-translate-y-0.5 hover:shadow-orange-700/40 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-400"
      >
        {disabled ? t("outOfStock") : t("addToCart")}
      </button>

      <RelatedProductsModal
        open={modalOpen}
        onClose={handleModalClose}
        main={{ productId: product.id, qty: 1, optionIds: [], title: product.title }}
        mainDisplay={{ image: product.image, price: product.price }}
        related={relatedProducts}
        mainAlreadyInCart
      />
    </>
  );
}
