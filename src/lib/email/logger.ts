import "server-only";

import { runtimeLog } from "@/lib/runtime-log/server";

export type EmailLogType =
  | "contact_lead"
  | "new_order"
  | "order_status"
  | "welcome"
  | "admin_notification"
  | "generic";

export function logEmailSuccess(type: EmailLogType, recipient: string, meta?: Record<string, unknown>) {
  runtimeLog({
    level: "debug",
    scope: "email",
    message: "send_success",
    query: `${type}|${recipient}`,
    ...meta,
  });
}

export function logEmailFailure(
  type: EmailLogType,
  recipient: string,
  err: unknown,
  meta?: Record<string, unknown>,
) {
  const e = err instanceof Error ? err : new Error(String(err));
  const isTimeout = e.message.toLowerCase().includes("timeout");
  runtimeLog({
    level: "error",
    scope: "email",
    message: isTimeout ? "smtp_timeout" : "send_failed",
    query: `${type}|${recipient}`,
    error: e.message,
    ...meta,
  });
}

export function logEmailSkipped(type: EmailLogType, reason: string) {
  runtimeLog({
    level: "warn",
    scope: "email",
    message: "send_skipped",
    query: type,
    error: reason,
  });
}
