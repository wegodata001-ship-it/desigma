"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminSpinner } from "@/components/admin/admin-spinner";
import { useAdminI18n } from "@/lib/admin-i18n";
import {
  deleteDeliveryOption,
  savePickupEnabled,
  upsertDelivery,
} from "@/app/admin/actions";
import type { DeliveryType } from "@prisma/client";

export type DeliveryRow = {
  id: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  type: DeliveryType;
  price: number;
  eta_he: string | null;
  eta_ar: string | null;
  eta_en: string | null;
  active: boolean;
  sortOrder: number;
};

const DELIVERY_TYPES: DeliveryType[] = [
  "HOME",
  "EXPRESS",
  "PICKUP_POINT",
  "PICKUP",
  "INTERNATIONAL",
  "SHIPPING",
];

function typeLabel(type: DeliveryType, t: (k: string) => string): string {
  switch (type) {
    case "HOME":
      return t("deliveryTypeHome");
    case "EXPRESS":
      return t("deliveryTypeExpress");
    case "PICKUP_POINT":
      return t("deliveryTypePickupPoint");
    case "PICKUP":
      return t("pickupOption");
    case "INTERNATIONAL":
      return t("deliveryTypeInternational");
    default:
      return t("shippingOption");
  }
}

export function DeliveryAdminClient({
  storeId,
  pickupEnabled,
  options,
  settingsContext = false,
}: {
  storeId: string;
  pickupEnabled: boolean;
  options: DeliveryRow[];
  settingsContext?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<DeliveryRow | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const { t } = useAdminI18n();

  const refresh = () => startTransition(() => router.refresh());

  const openAddModal = () => {
    console.log("Current Store", storeId);
    setOpen(true);
  };

  async function submitDelivery(form: HTMLFormElement) {
    const fd = new FormData(form);
    const name = String(fd.get("name_he") ?? "").trim();
    const type = String(fd.get("type") ?? "");
    const price = Number(fd.get("price") ?? 0);
    console.log("Saving shipping option", { storeId, name, type, price });

    const res = await upsertDelivery(fd);
    if (!res.ok) {
      console.error("[DeliveryAdminClient] save failed", res.error);
      setToast({ kind: "error", message: res.error });
      return;
    }
    setToast({ kind: "success", message: t("savedSuccessfully") });
    setOpen(false);
    setEdit(null);
    refresh();
  }

  return (
    <div>
      {toast && (
        <div
          className={`mb-4 rounded-lg border px-4 py-2 text-sm ${
            toast.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {settingsContext ? t("shippingMethodsTitle") : t("deliverySettings")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("shippingMethodsHint")}</p>
        </div>
        {settingsContext && (
          <Link href="/admin/settings" className="text-sm text-sky-600 hover:underline">
            ← {t("storeSettings")}
          </Link>
        )}
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">{t("pickup")}</h2>
        <form
          className="mt-3 flex flex-wrap items-center gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const res = await savePickupEnabled(fd);
            if (!res.ok) setToast({ kind: "error", message: res.error });
            else {
              setToast({ kind: "success", message: t("savedSuccessfully") });
              refresh();
            }
          }}
        >
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="pickupEnabled" defaultChecked={pickupEnabled} value="on" />
            {t("pickupEnabled")}
          </label>
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
            {t("save")}
          </button>
        </form>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">{t("shippingOptions")}</h2>
          <button type="button" onClick={openAddModal} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
            {t("addOption")}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <th className="px-4 py-3 text-start">{t("name")}</th>
                <th className="px-4 py-3">{t("deliveryPriceLabel")}</th>
                <th className="px-4 py-3">{t("deliveryEtaLabel")}</th>
                <th className="px-4 py-3">{t("deliveryTypeLabel")}</th>
                <th className="px-4 py-3">{t("displayOrder")}</th>
                <th className="px-4 py-3">{t("active")}</th>
                <th className="px-4 py-3 text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {options.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {t("shippingMethodsEmpty")}
                  </td>
                </tr>
              ) : (
                options.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-900">{o.name_he}</td>
                    <td className="px-4 py-2 tabular-nums">₪{Number(o.price).toFixed(2)}</td>
                    <td className="px-4 py-2 text-slate-600">{o.eta_he || "—"}</td>
                    <td className="px-4 py-2 text-slate-600">{typeLabel(o.type, t)}</td>
                    <td className="px-4 py-2 tabular-nums">{o.sortOrder}</td>
                    <td className="px-4 py-2">{o.active ? t("yes") : t("no")}</td>
                    <td className="px-4 py-2 text-end whitespace-nowrap">
                      <button type="button" className="text-blue-600 hover:underline" onClick={() => setEdit(o)}>
                        {t("edit")}
                      </button>
                      <span className="mx-2 text-slate-300">|</span>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => setDelId(o.id)}>
                        {t("delete")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {pending && (
        <div className="fixed bottom-6 left-6 z-[90] rounded-lg bg-slate-900 px-3 py-2 text-white">
          <AdminSpinner className="h-4 w-4 border-t-white" />
        </div>
      )}

      <AdminModal open={open} onClose={() => setOpen(false)} title={t("addOption")}>
        <DeliveryForm onSubmit={(f) => void submitDelivery(f)} onCancel={() => setOpen(false)} />
      </AdminModal>

      <AdminModal open={!!edit} onClose={() => setEdit(null)} title={t("edit")}>
        {edit && (
          <DeliveryForm
            row={edit}
            onSubmit={(f) => void submitDelivery(f)}
            onCancel={() => setEdit(null)}
          />
        )}
      </AdminModal>

      <AdminModal
        open={!!delId}
        onClose={() => setDelId(null)}
        title={t("delete")}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setDelId(null)}>
              {t("cancel")}
            </button>
            <button
              type="button"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
              onClick={async () => {
                if (!delId) return;
                const fd = new FormData();
                fd.append("id", delId);
                const res = await deleteDeliveryOption(fd);
                if (!res.ok) setToast({ kind: "error", message: res.error });
                else {
                  setDelId(null);
                  setToast({ kind: "success", message: t("deletedSuccessfully") });
                  refresh();
                }
              }}
            >
              {t("delete")}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">{t("confirmDeleteOption")}</p>
      </AdminModal>
    </div>
  );
}

function DeliveryForm({
  row,
  onSubmit,
  onCancel,
}: {
  row?: DeliveryRow;
  onSubmit: (form: HTMLFormElement) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [pending, setPending] = useState(false);
  const { t } = useAdminI18n();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        await onSubmit(e.currentTarget);
        setPending(false);
      }}
      className="grid gap-3"
    >
      <input type="hidden" name="id" value={row?.id ?? ""} />
      <label className="text-xs font-medium">
        {t("deliveryNameHe")}
        <input name="name_he" required defaultValue={row?.name_he} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" />
      </label>
      <label className="text-xs font-medium">
        {t("deliveryNameAr")}
        <input name="name_ar" required defaultValue={row?.name_ar} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" />
      </label>
      <label className="text-xs font-medium">
        {t("deliveryNameEn")}
        <input name="name_en" required defaultValue={row?.name_en} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" />
      </label>
      <label className="text-xs font-medium">
        {t("deliveryTypeLabel")}
        <select name="type" required defaultValue={row?.type ?? "HOME"} className="mt-1 w-full rounded border px-2 py-1.5 text-sm">
          {DELIVERY_TYPES.map((dt) => (
            <option key={dt} value={dt}>
              {typeLabel(dt, t)}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-medium">
        {t("deliveryPriceLabel")}
        <input name="price" type="number" step="0.01" required defaultValue={row?.price ?? 0} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" />
      </label>
      <label className="text-xs font-medium">
        {t("deliveryEtaHe")}
        <input name="eta_he" defaultValue={row?.eta_he ?? ""} placeholder="3–7 ימי עסקים" className="mt-1 w-full rounded border px-2 py-1.5 text-sm" />
      </label>
      <label className="text-xs font-medium">
        {t("deliveryEtaAr")}
        <input name="eta_ar" defaultValue={row?.eta_ar ?? ""} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" />
      </label>
      <label className="text-xs font-medium">
        {t("deliveryEtaEn")}
        <input name="eta_en" defaultValue={row?.eta_en ?? ""} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" />
      </label>
      <label className="text-xs font-medium">
        {t("displayOrder")}
        <input name="sortOrder" type="number" defaultValue={row?.sortOrder ?? 0} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={row?.active ?? true} value="on" />
        {t("deliveryActive")}
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm">
          {t("cancel")}
        </button>
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60">
          {pending && <AdminSpinner className="h-4 w-4 border-t-white" />}
          {t("save")}
        </button>
      </div>
    </form>
  );
}
