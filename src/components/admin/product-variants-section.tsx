"use client";

import { AssetImg } from "@/components/asset-img";
import { useAdminI18n } from "@/lib/admin-i18n";
import { uploadAdminAsset } from "@/lib/admin-upload-client";
import { isColorVariantGroup, isStorageVariantGroup } from "@/lib/variant-group-kind";
import type { Img } from "@/components/admin/product-images-section";

export type VariantOption = {
  id: string;
  value: string;
  priceAdd: number;
  stock: number | null;
  sku: string | null;
  image: string | null;
  isDefault: boolean;
  sortOrder: number;
  uploading?: boolean;
};

export type VariantGroup = {
  id: string;
  name: string;
  sortOrder: number;
  options: VariantOption[];
};

export function copyProductImagesToColorVariants(
  groups: VariantGroup[],
  images: Img[],
): VariantGroup[] {
  if (images.length === 0) return groups;
  const sorted = [...images].sort((a, b) => {
    if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
  const fallback = sorted[0]?.url ?? null;
  return groups.map((g) => {
    if (!isColorVariantGroup(g.name)) return g;
    return {
      ...g,
      options: g.options.map((o, idx) => ({
        ...o,
        image: sorted[idx]?.url ?? fallback,
      })),
    };
  });
}

function ColorOptionCard({
  groupId,
  option,
  productImages,
  productId,
  onChange,
}: {
  groupId: string;
  option: VariantOption;
  productImages: Img[];
  productId?: string;
  onChange: (groupId: string, optionId: string, patch: Partial<VariantOption>) => void;
}) {
  const { t } = useAdminI18n();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              📱
            </span>
            <input
              value={option.value}
              onChange={(e) => onChange(groupId, option.id, { value: e.target.value })}
              placeholder="Titanium Black"
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm font-semibold text-slate-900"
            />
          </div>
          <label className="mt-3 block text-xs font-medium text-slate-600">
            {t("stock")}
            <input
              value={option.stock ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                const v = raw.trim() === "" ? null : Number(raw);
                onChange(groupId, option.id, { stock: v });
              }}
              type="number"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm tabular-nums"
            />
          </label>
        </div>
        {option.isDefault && (
          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
            {t("main")}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="text-xs font-medium text-slate-600">{t("variantColorImage")}</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <AssetImg path={option.image} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            {productImages.length > 0 ? (
              <select
                value={option.image ?? ""}
                onChange={(e) => onChange(groupId, option.id, { image: e.target.value || null })}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
              >
                <option value="">{t("chooseImage")}</option>
                {productImages.map((im) => (
                  <option key={im.id} value={im.url}>
                    {im.isMain ? `★ ${t("main")}` : `#${im.sortOrder + 1}`} — {im.url.split("/").pop()}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-[11px] text-slate-400">{t("variantUploadProductImagesFirst")}</p>
            )}
            <label className="block cursor-pointer text-[11px] font-medium text-blue-700 hover:underline">
              {t("uploadVariantImage")}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const input = e.currentTarget;
                  const f = input.files?.[0] ?? null;
                  if (!f) return;
                  onChange(groupId, option.id, { uploading: true });
                  try {
                    const path = await uploadAdminAsset(f, "products", {
                      entityId: productId ?? "new",
                      originalName: f.name,
                    });
                    onChange(groupId, option.id, { image: path, uploading: false });
                  } catch {
                    onChange(groupId, option.id, { uploading: false });
                  } finally {
                    try {
                      input.value = "";
                    } catch {
                      /* ignore */
                    }
                  }
                }}
              />
            </label>
            {option.uploading ? <span className="text-[10px] text-slate-500">{t("saving")}</span> : null}
          </div>
        </div>
      </div>

      <label className="mt-3 flex items-center gap-2 text-xs text-slate-600">
        <input
          type="radio"
          name={`default-${groupId}`}
          checked={option.isDefault}
          onChange={() => onChange(groupId, option.id, { isDefault: true })}
        />
        {t("variantDefaultOption")}
      </label>
    </div>
  );
}

function StorageOptionRow({
  groupId,
  option,
  onChange,
  onDelete,
}: {
  groupId: string;
  option: VariantOption;
  onChange: (groupId: string, optionId: string, patch: Partial<VariantOption>) => void;
  onDelete: (groupId: string, optionId: string) => void;
}) {
  const { t } = useAdminI18n();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
      <input
        value={option.value}
        onChange={(e) => onChange(groupId, option.id, { value: e.target.value })}
        className="min-w-[100px] flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm font-medium"
        placeholder="256GB"
      />
      <label className="text-xs text-slate-600">
        {t("priceAdd")}
        <input
          value={Number.isFinite(option.priceAdd) ? option.priceAdd : 0}
          onChange={(e) => onChange(groupId, option.id, { priceAdd: Number(e.target.value || 0) })}
          type="number"
          step="0.01"
          className="ms-1 w-24 rounded-md border border-slate-300 px-2 py-1 text-xs tabular-nums"
        />
      </label>
      <label className="text-xs text-slate-600">
        {t("stock")}
        <input
          value={option.stock ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            const v = raw.trim() === "" ? null : Number(raw);
            onChange(groupId, option.id, { stock: v });
          }}
          type="number"
          className="ms-1 w-20 rounded-md border border-slate-300 px-2 py-1 text-xs tabular-nums"
        />
      </label>
      <label className="flex items-center gap-1 text-xs text-slate-600">
        <input
          type="radio"
          name={`default-${groupId}`}
          checked={option.isDefault}
          onChange={() => onChange(groupId, option.id, { isDefault: true })}
        />
        {t("variantDefaultOption")}
      </label>
      <button
        type="button"
        className="ms-auto text-xs text-red-600 hover:underline"
        onClick={() => onDelete(groupId, option.id)}
      >
        {t("deleteShort")}
      </button>
    </div>
  );
}

export function ProductVariantsSection({
  variantGroups,
  setVariantGroups,
  productImages,
  productId,
  onApplyPreset,
}: {
  variantGroups: VariantGroup[];
  setVariantGroups: React.Dispatch<React.SetStateAction<VariantGroup[]>>;
  productImages: Img[];
  productId?: string;
  onApplyPreset: (brand: "apple" | "samsung") => void;
}) {
  const { t } = useAdminI18n();

  const patchOption = (groupId: string, optionId: string, patch: Partial<VariantOption>) => {
    setVariantGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          options: g.options.map((o) => {
            if (o.id !== optionId) {
              return patch.isDefault ? { ...o, isDefault: false } : o;
            }
            return { ...o, ...patch };
          }),
        };
      }),
    );
  };

  const deleteOption = (groupId: string, optionId: string) => {
    setVariantGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              options: g.options.filter((o) => o.id !== optionId).map((o, idx) => ({ ...o, sortOrder: idx })),
            },
      ),
    );
  };

  const addOption = (groupId: string, isColor: boolean) => {
    setVariantGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              options: [
                ...g.options,
                {
                  id: `new-opt-${Date.now()}`,
                  value: "",
                  priceAdd: 0,
                  stock: isColor ? 10 : null,
                  sku: null,
                  image: isColor ? (productImages[0]?.url ?? null) : null,
                  isDefault: g.options.length === 0,
                  sortOrder: g.options.length,
                },
              ],
            },
      ),
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{t("productVariantsTitle")}</div>
          <div className="mt-0.5 text-xs text-slate-500">{t("productVariantsHint")}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-900 hover:bg-blue-100"
            onClick={() => onApplyPreset("apple")}
          >
            📱 {t("variantPresetApple")}
          </button>
          <button
            type="button"
            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-900 hover:bg-violet-100"
            onClick={() => onApplyPreset("samsung")}
          >
            📱 {t("variantPresetSamsung")}
          </button>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            onClick={() =>
              setVariantGroups((prev) => [
                ...prev,
                { id: `new-group-${Date.now()}`, name: "", sortOrder: prev.length, options: [] },
              ])
            }
          >
            + {t("addVariantGroup")}
          </button>
        </div>
      </div>

      {variantGroups.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
          {t("noVariantGroups")}
        </div>
      ) : (
        <div className="mt-4 grid gap-4">
          {variantGroups.map((g) => {
            const isColor = isColorVariantGroup(g.name);
            const isStorage = isStorageVariantGroup(g.name);

            return (
              <div key={g.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-medium text-slate-700">
                    {t("variantGroupName")}
                    <input
                      value={g.name}
                      onChange={(e) =>
                        setVariantGroups((prev) =>
                          prev.map((x) => (x.id === g.id ? { ...x, name: e.target.value } : x)),
                        )
                      }
                      placeholder={t("variantGroupNamePlaceholder")}
                      className="mt-1 w-64 max-w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      onClick={() => addOption(g.id, isColor)}
                    >
                      ➕ {t("addVariantOption")}
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => setVariantGroups((prev) => prev.filter((x) => x.id !== g.id))}
                    >
                      {t("deleteVariantGroup")}
                    </button>
                  </div>
                </div>

                {isColor ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {g.options.map((o) => (
                      <ColorOptionCard
                        key={o.id}
                        groupId={g.id}
                        option={o}
                        productImages={productImages}
                        productId={productId}
                        onChange={patchOption}
                      />
                    ))}
                    {g.options.length === 0 && (
                      <p className="col-span-full text-center text-xs text-slate-500">{t("noVariantOptions")}</p>
                    )}
                  </div>
                ) : isStorage ? (
                  <div className="mt-3 space-y-2">
                    {g.options.map((o) => (
                      <StorageOptionRow
                        key={o.id}
                        groupId={g.id}
                        option={o}
                        onChange={patchOption}
                        onDelete={deleteOption}
                      />
                    ))}
                    {g.options.length === 0 && (
                      <p className="text-center text-xs text-slate-500">{t("noVariantOptions")}</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {g.options.map((o) => (
                      <StorageOptionRow
                        key={o.id}
                        groupId={g.id}
                        option={o}
                        onChange={patchOption}
                        onDelete={deleteOption}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
