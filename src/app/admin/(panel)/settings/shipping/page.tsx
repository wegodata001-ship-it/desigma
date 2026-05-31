import { prisma } from "@/lib/prisma";
import { getRequestStoreId } from "@/lib/store-request";
import { requireAdminSession } from "@/lib/admin-auth";
import type { DeliveryRow } from "@/components/admin/delivery-admin-client";
import { DeliveryAdminClient } from "@/components/admin/delivery-admin-client";
import { safeQuery } from "@/lib/server/safe-query";

export const dynamic = "force-dynamic";

export default async function AdminShippingMethodsPage() {
  await requireAdminSession();
  const storeId = await getRequestStoreId();
  const { settings, serialized } = await safeQuery(
    "admin.shipping_methods",
    async () => {
      const [settingsRow, options] = await Promise.all([
        prisma.storeSettings.findUnique({ where: { storeId } }),
        prisma.deliveryOption.findMany({
          where: { storeId },
          orderBy: { sortOrder: "asc" },
        }),
      ]);
      const opts = JSON.parse(JSON.stringify(options)) as DeliveryRow[];
      return { settings: settingsRow, serialized: opts };
    },
    { settings: null, serialized: [] as DeliveryRow[] },
    { timeoutMs: 25_000 },
  );

  return (
    <DeliveryAdminClient
      storeId={storeId}
      pickupEnabled={settings?.pickupEnabled ?? true}
      options={serialized}
      settingsContext
    />
  );
}
