import { compressImageForUpload } from "@/lib/image-compress-client";
import {
  STUDIO_DISPLAY_MAX,
  STUDIO_ORIGINAL_MAX,
  STUDIO_THUMB_MAX,
  STUDIO_WEBP_QUALITY,
  type StudioExportBundle,
} from "@/lib/product-image-studio/types";

/** Build display + thumb WebP from cropped file; keep original bytes when reasonable. */
export async function buildStudioExportBundle(
  cropped: File,
  originalSource: File,
): Promise<StudioExportBundle> {
  const [display, thumb] = await Promise.all([
    compressImageForUpload(cropped, {
      maxDimension: STUDIO_DISPLAY_MAX,
      mime: "image/webp",
      quality: STUDIO_WEBP_QUALITY,
    }),
    compressImageForUpload(cropped, {
      maxDimension: STUDIO_THUMB_MAX,
      mime: "image/webp",
      quality: 0.9,
    }),
  ]);

  let original: File = originalSource;
  if (originalSource.size > 3_000_000 || originalSource.type === "image/png") {
    original = await compressImageForUpload(originalSource, {
      maxDimension: STUDIO_ORIGINAL_MAX,
      mime: "image/jpeg",
      quality: 0.95,
    });
  }

  return { display, thumb, original };
}
