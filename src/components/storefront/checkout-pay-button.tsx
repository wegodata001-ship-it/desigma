"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CheckoutPayButton({
  orderId,
  isPaid,
}: {
  orderId: string;
  isPaid: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startPayment() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/demo-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setError(
          typeof data.error === "string" && data.error.trim()
            ? data.error
            : "לא ניתן להשלים את התשלום כרגע. נסו שוב או צרו קשר עם התמיכה.",
        );
        return;
      }
      router.refresh();
    } catch {
      setError("לא ניתן להשלים את התשלום כרגע. בדקו את החיבור ונסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  if (isPaid) {
    return (
      <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-5 py-4 text-center">
        <p className="text-lg font-bold text-emerald-300">✓ התשלום התקבל בהצלחה</p>
        <p className="mt-1 text-sm text-emerald-100/80">תודה! ההזמנה בטיפול.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={loading}
        onClick={() => void startPayment()}
        className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-orange-900/35 transition hover:from-orange-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "מעביר לתשלום…" : "המשך לתשלום מאובטח"}
      </button>
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
