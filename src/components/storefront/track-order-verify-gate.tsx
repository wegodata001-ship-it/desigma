"use client";

import { TrackOrderForm } from "@/components/storefront/track-order-form";

export function TrackOrderVerifyGate({ orderNumber }: { orderNumber: string }) {
  return (
    <div dir="rtl" className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl">
        <h1 className="text-xl font-bold text-white">אימות לצפייה בהזמנה</h1>
        <p className="mt-2 text-sm text-zinc-400">
          הזינו את האימייל שבו בוצעה ההזמנה <span className="font-mono text-zinc-300">{orderNumber}</span>
        </p>
        <div className="mt-6">
          <TrackOrderForm initialOrderNumber={orderNumber} />
        </div>
      </div>
    </div>
  );
}
