/** Detect variant group type from its display name (Hebrew / English). */

export function isColorVariantGroup(name: string): boolean {
  const n = name.trim().toLowerCase();
  return n === "color" || n === "colour" || n === "צבע" || n === "צבעים" || n.includes("צבע");
}

export function isStorageVariantGroup(name: string): boolean {
  const n = name.trim().toLowerCase();
  if (n === "storage" || n === "capacity" || n === "נפח" || n === "זיכרון" || n === "memory") return true;
  return /\d\s*(gb|tb|mb)/i.test(n);
}
