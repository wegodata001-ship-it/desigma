"use client";

import type { TrackingTimelineStep } from "@/lib/orders/tracking-status";
import { formatTrackingDate } from "@/lib/orders/tracking-status";

const ICONS: Record<string, string> = {
  NEW: "📋",
  PAID: "✓",
  PROCESSING: "⚙",
  PACKED: "📦",
  SHIPPED: "🚚",
  DELIVERED: "🏠",
  CANCELLED: "✕",
  REFUNDED: "↩",
};

export function OrderTrackingTimeline({
  steps,
  terminal,
}: {
  steps: TrackingTimelineStep[];
  terminal: boolean;
}) {
  return (
    <ol className="relative space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const dotClass = terminal
          ? "border-red-400/80 bg-red-500/20 text-red-100 shadow-[0_0_20px_rgba(248,113,113,0.25)]"
          : step.current
            ? "border-orange-400 bg-orange-500/25 text-orange-50 shadow-[0_0_0_4px_rgba(249,115,22,0.2)]"
            : step.done
              ? "border-emerald-500/70 bg-emerald-500/15 text-emerald-200"
              : "border-zinc-700 bg-zinc-900/80 text-zinc-600";

        const lineClass =
          step.done && !isLast ? "bg-gradient-to-b from-orange-500/60 to-zinc-800" : "bg-zinc-800";

        return (
          <li key={`${step.status}-${i}`} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={`absolute right-[1.15rem] top-10 bottom-0 w-0.5 ${lineClass}`}
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${dotClass}`}
            >
              {step.done && !step.current ? "✓" : ICONS[step.status] ?? "•"}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p
                className={`text-sm font-semibold leading-snug ${
                  step.current
                    ? "text-orange-200"
                    : step.done
                      ? "text-zinc-100"
                      : "text-zinc-500"
                }`}
              >
                {step.label}
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-500">
                {step.at ? formatTrackingDate(step.at) : step.done ? "" : "ממתין"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
