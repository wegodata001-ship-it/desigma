/** Decorative dashboard preview — desktop login panel only. */
export function AdminLoginIllustration() {
  return (
    <div
      className="relative mx-auto w-full max-w-md select-none"
      aria-hidden
    >
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="h-2.5 w-24 rounded-full bg-white/20" />
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-500/80" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "הזמנות", value: "128", accent: true },
            { label: "מוצרים", value: "64", accent: false },
            { label: "הכנסות", value: "₪42K", accent: false },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border p-3 ${
                card.accent
                  ? "border-orange-500/30 bg-orange-500/10"
                  : "border-white/[0.06] bg-white/[0.03]"
              }`}
            >
              <div className="text-[10px] text-white/50">{card.label}</div>
              <div
                className={`mt-1 text-lg font-bold ${card.accent ? "text-orange-400" : "text-white/90"}`}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="mb-3 flex items-end justify-between gap-2">
            <span className="text-xs font-medium text-white/60">מכירות השבוע</span>
            <span className="text-xs text-emerald-400">+12%</span>
          </div>
          <div className="flex h-24 items-end gap-1.5">
            {[35, 55, 40, 70, 50, 85, 65].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-orange-600/80 to-orange-400/90"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {["הזמנה #1042", "הזמנה #1041", "הזמנה #1040"].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
            >
              <span className="text-xs text-white/70">{row}</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                חדש
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-orange-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-6 -start-6 h-24 w-24 rounded-full bg-blue-500/15 blur-2xl" />
    </div>
  );
}
