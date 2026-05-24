/** Paths under public/products/{apple|samsung}/{model}/{color}.png */

export type ProductBrand = "apple" | "samsung";

export function colorToImageSlug(color: string): string {
  const n = color.toLowerCase();
  if (n.includes("black")) return "black";
  if (n.includes("blue")) return "blue";
  if (n.includes("white")) return "white";
  if (n.includes("silver")) return "silver";
  if (n.includes("gold")) return "gold";
  if (n.includes("natural")) return "natural";
  if (n.includes("desert")) return "desert";
  if (n.includes("pink")) return "pink";
  if (n.includes("green")) return "green";
  if (n.includes("purple") || n.includes("violet")) return "purple";
  if (n.includes("gray") || n.includes("grey")) return "gray";
  return n.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "default";
}

export function phoneColorImage(brand: ProductBrand, modelKey: string, color: string): string {
  return `products/${brand}/${modelKey}/${colorToImageSlug(color)}.png`;
}

export function isLocalProductAsset(path: string | null | undefined): boolean {
  if (!path) return false;
  const p = path.trim();
  return p.startsWith("products/") || p.startsWith("/products/") || p.startsWith("demo/");
}
