export function crossSellModalDebug(event: string, detail?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_DEBUG_MODAL !== "true") return;
  console.log(
    JSON.stringify({
      scope: "cross_sell_modal",
      event,
      ts: new Date().toISOString(),
      ...detail,
    }),
  );
}
