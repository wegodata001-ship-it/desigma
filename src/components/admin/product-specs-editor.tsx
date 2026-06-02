"use client";

import { useAdminI18n } from "@/lib/admin-i18n";
import { EMPTY_PRODUCT_SPEC, type ProductSpecItem } from "@/lib/product-specs";

export function ProductSpecsEditor({
  label,
  specs,
  onChange,
}: {
  label: string;
  specs: ProductSpecItem[];
  onChange: (next: ProductSpecItem[]) => void;
}) {
  const { t } = useAdminI18n();

  const update = (index: number, patch: Partial<ProductSpecItem>) => {
    const next = specs.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  };

  const remove = (index: number) => {
    const next = specs.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [{ ...EMPTY_PRODUCT_SPEC }]);
  };

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <div className="text-xs font-semibold text-slate-800">{label}</div>
      <p className="text-[11px] text-slate-500">{t("productSpecsHint")}</p>
      {specs.map((s, i) => (
        <div key={i} className="space-y-2 rounded-md border border-slate-200 bg-white p-2">
          <input
            type="text"
            value={s.title}
            placeholder={t("productSpecTitlePlaceholder")}
            onChange={(e) => update(i, { title: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <textarea
            rows={3}
            value={s.content}
            placeholder={t("productSpecContentPlaceholder")}
            onChange={(e) => update(i, { content: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          {specs.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs font-medium text-red-600 hover:text-red-800"
            >
              {t("removeSpecField")}
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...specs, { ...EMPTY_PRODUCT_SPEC }])}
        className="rounded-md border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-800"
      >
        + {t("addSpecField")}
      </button>
    </div>
  );
}
