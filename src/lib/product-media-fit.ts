export type ImageFitMode = "contain" | "cover" | "original" | "fit-width" | "fit-height";

export const IMAGE_FIT_MODES: ImageFitMode[] = [
  "contain",
  "cover",
  "original",
  "fit-width",
  "fit-height",
];

/** Tailwind classes for the image inside the editor / preview frame. */
export function imageFitClass(mode: ImageFitMode): string {
  switch (mode) {
    case "cover":
      return "h-full w-full object-cover";
    case "original":
      return "max-h-none max-w-none h-auto w-auto object-none";
    case "fit-width":
      return "h-auto w-full max-h-full object-contain";
    case "fit-height":
      return "h-full w-auto max-w-full object-contain";
    case "contain":
    default:
      return "max-h-full max-w-full h-auto w-auto object-contain";
  }
}

/** Storefront gallery default — premium product pages. */
export function storefrontGalleryImageClass(fit: ImageFitMode = "contain"): string {
  const base = "h-full w-full transition duration-300";
  if (fit === "cover") return `${base} object-cover`;
  if (fit === "fit-width") return `${base} object-contain object-center w-full`;
  if (fit === "fit-height") return `${base} object-contain object-center h-full`;
  return `${base} object-contain object-center`;
}
