import { STUDIO_DISPLAY_MAX } from "@/lib/product-image-studio/types";

/** Load file into canvas with white (or custom) letterbox — product-card friendly. */
export async function autoFixImageFile(
  file: File,
  opts?: { background?: string; targetAspect?: number; fillRatio?: number },
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = renderLetterbox(bitmap, opts);
    return canvasToWebpFile(canvas, file.name.replace(/\.[^.]+$/, "") || "product");
  } finally {
    bitmap.close();
  }
}

/** Shopify-style: full image visible, centered, generous white margin. */
export async function smartProductFitFile(file: File): Promise<File> {
  return autoFixImageFile(file, { background: "#ffffff", targetAspect: 1, fillRatio: 0.82 });
}

export function renderLetterbox(
  source: ImageBitmap | HTMLImageElement,
  opts?: { background?: string; targetAspect?: number; fillRatio?: number },
): HTMLCanvasElement {
  const iw = "naturalWidth" in source ? source.naturalWidth : source.width;
  const ih = "naturalHeight" in source ? source.naturalHeight : source.height;
  const imgAspect = iw / ih;
  const targetAspect = opts?.targetAspect ?? 1;
  const fillRatio = opts?.fillRatio ?? 0.9;
  const bg = opts?.background ?? "#ffffff";

  let cw: number;
  let ch: number;
  if (targetAspect >= 1) {
    cw = STUDIO_DISPLAY_MAX;
    ch = Math.round(STUDIO_DISPLAY_MAX / targetAspect);
  } else {
    ch = STUDIO_DISPLAY_MAX;
    cw = Math.round(STUDIO_DISPLAY_MAX * targetAspect);
  }

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  if (bg !== "transparent") {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);
  }

  let dw: number;
  let dh: number;
  const boxAspect = cw / ch;

  if (imgAspect > boxAspect) {
    dw = cw * fillRatio;
    dh = dw / imgAspect;
  } else {
    dh = ch * fillRatio;
    dw = dh * imgAspect;
  }

  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.drawImage(source, dx, dy, dw, dh);
  return canvas;
}

export async function canvasToWebpFile(
  canvas: HTMLCanvasElement,
  baseName: string,
  quality = 0.91,
): Promise<File> {
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", quality),
  );
  if (!blob) throw new Error("EXPORT_FAILED");
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

export async function scaleCanvasToMaxEdge(
  canvas: HTMLCanvasElement,
  maxEdge: number,
  quality: number,
  name: string,
): Promise<File> {
  const scale = Math.min(1, maxEdge / Math.max(canvas.width, canvas.height));
  if (scale >= 0.999) {
    return canvasToWebpFile(canvas, name, quality);
  }
  const w = Math.max(1, Math.round(canvas.width * scale));
  const h = Math.max(1, Math.round(canvas.height * scale));
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");
  if (!ctx) return canvasToWebpFile(canvas, name, quality);
  ctx.drawImage(canvas, 0, 0, w, h);
  return canvasToWebpFile(out, name, quality);
}
