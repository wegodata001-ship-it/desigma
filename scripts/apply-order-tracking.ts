/**
 * Order tracking columns + OrderStatusHistory table + backfill.
 * Run: npm run db:apply-order-tracking
 */
import { PrismaClient, OrderTrackingStatus } from "@prisma/client";

const prisma = new PrismaClient();

const STATEMENTS = [
  `DO $$ BEGIN
    CREATE TYPE "OrderTrackingStatus" AS ENUM (
      'NEW', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    );
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingStatus" "OrderTrackingStatus" NOT NULL DEFAULT 'NEW'`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "statusUpdatedAt" TIMESTAMP(3)`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingCarrier" TEXT`,
  `CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderTrackingStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "OrderStatusHistory_storeId_idx" ON "OrderStatusHistory"("storeId")`,
  `CREATE INDEX IF NOT EXISTS "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId")`,
  `CREATE INDEX IF NOT EXISTS "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt")`,
];

function deriveTrackingStatus(order: {
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
}): OrderTrackingStatus {
  if (order.paymentStatus === "REFUNDED") return OrderTrackingStatus.REFUNDED;
  if (order.status === "CANCELLED") return OrderTrackingStatus.CANCELLED;
  if (order.fulfillmentStatus === "COMPLETED") return OrderTrackingStatus.DELIVERED;
  if (order.fulfillmentStatus === "SHIPPED") return OrderTrackingStatus.SHIPPED;
  if (order.fulfillmentStatus === "PACKED") return OrderTrackingStatus.PACKED;
  if (order.fulfillmentStatus === "PROCESSING") return OrderTrackingStatus.PROCESSING;
  if (order.paymentStatus === "PAID") return OrderTrackingStatus.PAID;
  return OrderTrackingStatus.NEW;
}

type OrderRow = {
  id: string;
  storeId: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: Date;
  updatedAt: Date;
};

async function backfill() {
  const orders = await prisma.$queryRaw<OrderRow[]>`
    SELECT id, "storeId", status::text, "paymentStatus"::text, "fulfillmentStatus"::text,
           "createdAt", "updatedAt"
    FROM "Order"
  `;

  let updated = 0;
  for (const o of orders) {
    const trackingStatus = deriveTrackingStatus(o);
    const at = o.updatedAt ?? o.createdAt;
    await prisma.$executeRaw`
      UPDATE "Order"
      SET "trackingStatus" = ${trackingStatus}::"OrderTrackingStatus",
          "statusUpdatedAt" = ${at}
      WHERE id = ${o.id}
    `;

    const count = await prisma.orderStatusHistory.count({ where: { orderId: o.id } });
    if (count === 0) {
      await prisma.orderStatusHistory.create({
        data: {
          storeId: o.storeId,
          orderId: o.id,
          status: OrderTrackingStatus.NEW,
          note: "ההזמנה התקבלה",
          createdAt: o.createdAt,
        },
      });
      if (trackingStatus !== OrderTrackingStatus.NEW) {
        await prisma.orderStatusHistory.create({
          data: {
            storeId: o.storeId,
            orderId: o.id,
            status: trackingStatus,
            createdAt: at,
          },
        });
      }
    }
    updated += 1;
  }
  console.log(`Backfilled ${updated} orders.`);
}

async function main() {
  for (const sql of STATEMENTS) {
    console.log("Running:", sql.slice(0, 80).replace(/\s+/g, " "), "…");
    await prisma.$executeRawUnsafe(sql);
  }
  await backfill();
  console.log("Done — order tracking ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
