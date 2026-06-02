"use client";

import type { ProductCardData } from "@/components/product-card";

export type SmartphoneFilterState = {
  brand: "" | "apple" | "samsung";
  minPrice: string;
  maxPrice: string;
  color: string;
  storage: string;
  importType: string;
  stock: "" | "in" | "out";
};

export const DEFAULT_SMARTPHONE_FILTERS: SmartphoneFilterState = {
  brand: "",
  minPrice: "",
  maxPrice: "",
  color: "",
  storage: "",
  importType: "",
  stock: "",
};

export function applySmartphoneFilters(
  products: ProductCardData[],
  filters: SmartphoneFilterState,
): ProductCardData[] {
  return products.filter((p) => {
    if (filters.brand === "apple" && p.brand !== "apple") return false;
    if (filters.brand === "samsung" && p.brand !== "samsung") return false;

    const price = p.fromPrice ?? p.price;
    if (filters.minPrice && price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && price > Number(filters.maxPrice)) return false;

    if (filters.color && !(p.colorOptions ?? []).some((c) => c.toLowerCase() === filters.color.toLowerCase())) {
      return false;
    }

    if (filters.storage) {
      const storageGroup = (p.variantGroups ?? []).find((g) => g.name.toLowerCase() === "storage");
      if (!storageGroup?.options.some((o) => o.value === filters.storage)) return false;
    }

    if (filters.importType) {
      const importGroup = (p.variantGroups ?? []).find((g) => g.name.toLowerCase() === "import type");
      if (!importGroup?.options.some((o) => o.value === filters.importType)) return false;
    }

    if (filters.stock === "in" && p.stock <= 0) return false;
    if (filters.stock === "out" && p.stock > 0) return false;

    return true;
  });
}

export function SmartphoneFiltersPanel({
  filters,
  onChange,
  colorChoices,
  storageChoices,
  importChoices,
}: {
  filters: SmartphoneFilterState;
  onChange: (next: SmartphoneFilterState) => void;
  colorChoices: string[];
  storageChoices: string[];
  importChoices: string[];
}) {
  const set = (patch: Partial<SmartphoneFilterState>) => onChange({ ...filters, ...patch });

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="text-sm font-bold text-white">סינון סמארטפונים</div>

      <label className="block text-xs text-zinc-400">
        מותג
        <select
          value={filters.brand}
          onChange={(e) => set({ brand: e.target.value as SmartphoneFilterState["brand"] })}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          <option value="">הכל</option>
          <option value="apple">Apple / iPhone</option>
          <option value="samsung">Samsung</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs text-zinc-400">
          מחיר מ-
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
          />
        </label>
        <label className="block text-xs text-zinc-400">
          עד
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
          />
        </label>
      </div>

      <label className="block text-xs text-zinc-400">
        צבע
        <select
          value={filters.color}
          onChange={(e) => set({ color: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          <option value="">הכל</option>
          {colorChoices.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-zinc-400">
        נפח אחסון
        <select
          value={filters.storage}
          onChange={(e) => set({ storage: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          <option value="">הכל</option>
          {storageChoices.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-zinc-400">
        סוג יבוא
        <select
          value={filters.importType}
          onChange={(e) => set({ importType: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          <option value="">הכל</option>
          {importChoices.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-zinc-400">
        מלאי
        <select
          value={filters.stock}
          onChange={(e) => set({ stock: e.target.value as SmartphoneFilterState["stock"] })}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          <option value="">הכל</option>
          <option value="in">במלאי</option>
          <option value="out">אזל</option>
        </select>
      </label>

      <button
        type="button"
        onClick={() => onChange(DEFAULT_SMARTPHONE_FILTERS)}
        className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-orange-500/50"
      >
        נקה סינון
      </button>
    </div>
  );
}
