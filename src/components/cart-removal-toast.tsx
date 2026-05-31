"use client";

import { useCart } from "@/components/cart-context";

export function CartRemovalToast() {
  const { removalToast, dismissRemovalToast } = useCart();
  if (!removalToast) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-[60] w-[min(92vw,420px)] -translate-x-1/2 rounded-xl border border-amber-500/40 bg-zinc-900 px-4 py-3 text-center text-sm text-amber-50 shadow-xl md:bottom-8"
    >
      <p>{removalToast}</p>
      <button
        type="button"
        onClick={dismissRemovalToast}
        className="mt-2 text-xs text-amber-300/90 underline hover:text-amber-200"
      >
        סגור
      </button>
    </div>
  );
}
