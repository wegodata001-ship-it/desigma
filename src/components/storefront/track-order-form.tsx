"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TrackOrderForm({ initialOrderNumber = "" }: { initialOrderNumber?: string }) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/track-order/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          email: email.trim(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; orderNumber?: string };
      if (!res.ok || !data.ok || !data.orderNumber) {
        setError(data.error ?? "לא נמצאה הזמנה. בדקו את המספר והאימייל.");
        return;
      }
      router.push(`/track-order/${encodeURIComponent(data.orderNumber)}`);
    } catch {
      setError("שגיאת רשת. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="ds-label">מספר הזמנה</label>
        <input
          required
          className="ds-input mt-1.5 font-mono"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="ORD-2026-00152"
          autoComplete="off"
        />
      </div>
      <div>
        <label className="ds-label">אימייל</label>
        <input
          required
          type="email"
          className="ds-input mt-1.5"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
        />
      </div>
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 font-bold text-white shadow-lg shadow-orange-900/35 disabled:opacity-60"
      >
        {loading ? "מחפש…" : "חפש הזמנה"}
      </button>
    </form>
  );
}
