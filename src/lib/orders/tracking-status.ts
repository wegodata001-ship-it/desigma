import type { OrderTrackingStatus } from "@prisma/client";

export const TRACKING_STEP_ORDER: OrderTrackingStatus[] = [
  "NEW",
  "PAID",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

export const TRACKING_LABELS_HE: Record<OrderTrackingStatus, string> = {
  NEW: "התקבלה הזמנה",
  PAID: "התשלום אושר",
  PROCESSING: "ההזמנה בטיפול",
  PACKED: "נארזה",
  SHIPPED: "נשלחה",
  DELIVERED: "נמסרה",
  CANCELLED: "ההזמנה בוטלה",
  REFUNDED: "הוחזר כספי",
};

export function trackingStatusIndex(status: OrderTrackingStatus): number {
  return TRACKING_STEP_ORDER.indexOf(status);
}

export function isTerminalTrackingStatus(status: OrderTrackingStatus): boolean {
  return status === "CANCELLED" || status === "REFUNDED";
}

export type TrackingTimelineStep = {
  status: OrderTrackingStatus;
  label: string;
  done: boolean;
  current: boolean;
  at: string | null;
};

export function buildTrackingTimeline(
  current: OrderTrackingStatus,
  history: { status: OrderTrackingStatus; createdAt: Date }[],
): { steps: TrackingTimelineStep[]; terminal: boolean } {
  const terminal = isTerminalTrackingStatus(current);
  const byStatus = new Map<OrderTrackingStatus, Date>();
  for (const h of history) {
    const prev = byStatus.get(h.status);
    if (!prev || h.createdAt < prev) byStatus.set(h.status, h.createdAt);
  }

  if (terminal) {
    const at = byStatus.get(current) ?? history[history.length - 1]?.createdAt ?? null;
    return {
      terminal: true,
      steps: [
        {
          status: current,
          label: TRACKING_LABELS_HE[current],
          done: true,
          current: true,
          at: at ? at.toISOString() : null,
        },
      ],
    };
  }

  const currentIdx = trackingStatusIndex(current);
  const steps: TrackingTimelineStep[] = TRACKING_STEP_ORDER.map((status, i) => {
    const at = byStatus.get(status);
    const done = i <= currentIdx;
    const isCurrent = i === currentIdx;
    return {
      status,
      label: TRACKING_LABELS_HE[status],
      done,
      current: isCurrent,
      at: at ? at.toISOString() : null,
    };
  });

  return { steps, terminal: false };
}

export function formatTrackingDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
