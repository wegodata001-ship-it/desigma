import { OrderStatus } from "@prisma/client";

/**
 * Extended OrderStatus values (PENDING_PAYMENT, PAYMENT_FAILED, ABANDONED) require DB migration:
 * scripts/add-order-status-enums.sql
 *
 * Set ORDER_STATUS_ENUM_EXTENDED=true in .env after running that SQL.
 * Until then, legacy enum values are used so checkout does not fail.
 */
function extendedOrderStatus(
  extended: "PENDING_PAYMENT" | "PAYMENT_FAILED" | "ABANDONED",
  fallback: OrderStatus,
): OrderStatus {
  if (process.env.ORDER_STATUS_ENUM_EXTENDED !== "true") return fallback;
  const value = OrderStatus[extended as keyof typeof OrderStatus];
  return value ?? fallback;
}

export const ORDER_STATUS_AWAITING_PAYMENT = extendedOrderStatus("PENDING_PAYMENT", OrderStatus.PENDING);

export const ORDER_STATUS_PAYMENT_FAILED = extendedOrderStatus("PAYMENT_FAILED", OrderStatus.FAILED);

export const ORDER_STATUS_ABANDONED = extendedOrderStatus("ABANDONED", OrderStatus.CANCELLED);
