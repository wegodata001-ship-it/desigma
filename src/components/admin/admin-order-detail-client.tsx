"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminOrderDetailView } from "@/components/admin/admin-order-detail-view";
import { updateOrderStatus, type AdminOrderDetailDTO } from "@/app/admin/actions";
import { useAdminI18n } from "@/lib/admin-i18n";

export function AdminOrderDetailClient({ detail: initial }: { detail: AdminOrderDetailDTO }) {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [detail, setDetail] = useState(initial);
  const [toast, setToast] = useState<string | null>(null);

  async function onSaveStatus(form: HTMLFormElement) {
    const fd = new FormData(form);
    const res = await updateOrderStatus(fd);
    if (!res.ok) setToast(res.error);
    else {
      setToast(t("savedSuccessfully"));
      router.refresh();
      setDetail((d) => ({
        ...d,
        status: String(fd.get("status") ?? d.status),
        paymentStatus: String(fd.get("paymentStatus") ?? d.paymentStatus),
        fulfillmentStatus: String(fd.get("fulfillmentStatus") ?? d.fulfillmentStatus),
      }));
    }
  }

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {toast}
        </div>
      )}
      <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
        ← {t("orders")}
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-slate-900">{t("orderDetail")}</h1>
      <div className="mt-4">
        <AdminOrderDetailView detail={detail} onSaveStatus={onSaveStatus} />
      </div>
    </div>
  );
}
