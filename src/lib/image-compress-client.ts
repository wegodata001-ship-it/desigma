/** Client-side compression before upload — avoids huge payloads without native sharp dependency. */

const MAX_DIMENSION = 2400;
const DEFAULT_JPEG_QUALITY = 0.85;
const MAX_INPUT_BYTES = 20 * 1024 * 1024;

export type CompressOptions = {
  maxDimension?: number;
  mime?: "image/jpeg" | "image/webp";
  quality?: number;
};

function loadImageBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

/**
 * Resize (if needed) and re-encode as JPEG or WebP for smaller uploads.
 * GIF/SVG pass-through below threshold.
 */
export async function compressImageForUpload(file: File, opts?: CompressOptions): Promise<File> {
  if (file.size <= 1_000_000 && file.type !== "image/png") {
    return file;
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  if (file.type === "image/svg+xml") {
    return file;
  }

  const maxDim = opts?.maxDimension ?? MAX_DIMENSION;
  const mime = opts?.mime ?? "image/jpeg";
  const quality = opts?.quality ?? DEFAULT_JPEG_QUALITY;

  const bitmap = await loadImageBitmap(file);
  try {
    let { width, height } = bitmap;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), mime, quality),
    );
    if (!blob || blob.size >= file.size * 0.95) {
      return file;
    }

    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    const ext = mime === "image/webp" ? "webp" : "jpg";
    return new File([blob], `${base}.${ext}`, { type: mime });
  } finally {
    bitmap.close();
  }
}

/** Rotate image +90° — returns new File for replace/re-upload flow */
/** Rotate a remote image URL 90° CW (canvas; may fail on strict CORS). */
export async function rotateImageFromUrl90CW(url: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalHeight;
        canvas.height = img.naturalWidth;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("no context"));
          return;
        }
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        canvas.toBlob(
          (blob) => {
            if (!blob) reject(new Error("blob"));
            else resolve(new File([blob], "rotated.jpg", { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.92,
        );
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("load failed"));
    img.src = url;
  });
}

function drawTransformedImage(
  img: CanvasImageSource,
  width: number,
  height: number,
  rotationDeg: number,
  flipH: boolean,
  flipV: boolean,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const rot = ((rotationDeg % 360) + 360) % 360;
  const swap = rot === 90 || rot === 270;
  canvas.width = swap ? height : width;
  canvas.height = swap ? width : height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  const dw = swap ? height : width;
  const dh = swap ? width : height;
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  return canvas;
}

async function canvasToJpegFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92),
  );
  if (!blob) throw new Error("blob");
  return new File([blob], name, { type: "image/jpeg" });
}

/** Export visible frame (container size) with pan/zoom/rotate/flip applied. */
export async function exportFramedImageFromUrl(
  url: string,
  frameWidth: number,
  frameHeight: number,
  transform: {
    zoom: number;
    panX: number;
    panY: number;
    rotation: number;
    flipH: boolean;
    flipV: boolean;
  },
): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("load failed"));
    el.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(frameWidth));
  canvas.height = Math.max(1, Math.round(frameHeight));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no context");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scale = transform.zoom;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const fitScale = Math.min(canvas.width / iw, canvas.height / ih);
  const drawW = iw * fitScale * scale;
  const drawH = ih * fitScale * scale;

  ctx.save();
  ctx.translate(canvas.width / 2 + transform.panX, canvas.height / 2 + transform.panY);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  const base = "cropped";
  return canvasToJpegFile(canvas, `${base}.jpg`);
}

/** Export pixels inside crop rect from the editor viewport (Instagram-style crop). */
export async function exportCropFromViewport(
  url: string,
  viewportWidth: number,
  viewportHeight: number,
  crop: { left: number; top: number; width: number; height: number },
  transform: {
    zoom: number;
    panX: number;
    panY: number;
    rotation: number;
    flipH: boolean;
    flipV: boolean;
  },
): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("load failed"));
    el.src = url;
  });

  const vw = Math.max(1, viewportWidth);
  const vh = Math.max(1, viewportHeight);
  const outW = Math.max(1, Math.round(crop.width));
  const outH = Math.max(1, Math.round(crop.height));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no context");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);

  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const fitScale = Math.min(vw / iw, vh / ih);
  const drawW = iw * fitScale * transform.zoom;
  const drawH = ih * fitScale * transform.zoom;

  ctx.save();
  ctx.translate(-crop.left, -crop.top);
  ctx.translate(vw / 2 + transform.panX, vh / 2 + transform.panY);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  return canvasToJpegFile(canvas, "cropped.jpg");
}

export async function flipImageFromUrl(url: string, flipH: boolean, flipV: boolean): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("load failed"));
    el.src = url;
  });
  const canvas = drawTransformedImage(img, img.naturalWidth, img.naturalHeight, 0, flipH, flipV);
  return canvasToJpegFile(canvas, "flipped.jpg");
}

export async function rotateImageFile90CW(file: File): Promise<File> {
  const bitmap = await loadImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.height;
    canvas.height = bitmap.width;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92),
    );
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}-rotated.jpg`, { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}
