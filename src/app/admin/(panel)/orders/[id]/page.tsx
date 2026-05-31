import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminOrderDetailClient } from "@/components/admin/admin-order-detail-client";
import { getAdminOrderDetail } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getAdminOrderDetail(id);
  if (!detail) notFound();

  return <AdminOrderDetailClient detail={detail} />;
}
