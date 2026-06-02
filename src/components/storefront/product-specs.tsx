"use client";

import { useState } from "react";
import type { ProductSpecItem } from "@/lib/product-specs";

export function ProductSpecs({
  specs,
  title = "מפרט טכני",
}: {
  specs: ProductSpecItem[];
  title?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  if (specs.length === 0) return null;

  return (
    <section className="mt-8 border-t border-zinc-800 pt-6">
      <h2 className="mb-3 text-lg font-bold text-white">{title}</h2>
      <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950/50">
        {specs.map((s, i) => (
          <div key={`${s.title}-${i}`} className="px-4 py-3">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-3 text-start text-sm font-bold text-white"
              aria-expanded={open === i}
            >
              <span>{s.title}</span>
              <span className="text-zinc-500" aria-hidden>
                {open === i ? "−" : "+"}
              </span>
            </button>
            {open === i && (
              <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                {s.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
