import { prisma } from "@/lib/prisma";
import {
  GALLERY_DISPLAY_DEFAULTS,
  normalizeGalleryDisplayConfig,
  type GalleryDisplayConfig,
  type GallerySettingsRow,
} from "@/lib/product-gallery-display";
import { gallerySettingsDebug } from "@/lib/gallery-settings-debug";

type GalleryRowRaw = {
  productGalleryPreset: string | null;
  productGalleryMaxHeightPx: number | null;
  productGalleryMaxWidthPx: number | null;
};

/** Raw SQL read when Prisma rejects NULL in legacy rows. */
async function loadGalleryRowRaw(storeId: string): Promise<GallerySettingsRow> {
  const rows = await prisma.$queryRaw<GalleryRowRaw[]>`
    SELECT
      "productGalleryPreset",
      "productGalleryMaxHeightPx",
      "productGalleryMaxWidthPx"
    FROM "StoreSettings"
    WHERE "storeId" = ${storeId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/**
 * Loads gallery display config for a store. Never throws — returns safe defaults on any failure.
 */
export async function loadGalleryDisplayForStore(storeId: string): Promise<GalleryDisplayConfig> {
  try {
    const row = await prisma.storeSettings.findUnique({
      where: { storeId },
      select: {
        productGalleryPreset: true,
        productGalleryMaxHeightPx: true,
        productGalleryMaxWidthPx: true,
      },
    });
    const normalized = normalizeGalleryDisplayConfig(row);
    gallerySettingsDebug("gallery_load_ok", { storeId, source: "prisma", normalized });
    return normalized;
  } catch (prismaError) {
    gallerySettingsDebug("gallery_load_prisma_failed", {
      storeId,
      message: prismaError instanceof Error ? prismaError.message : String(prismaError),
    });

    try {
      const raw = await loadGalleryRowRaw(storeId);
      const normalized = normalizeGalleryDisplayConfig(raw);
      gallerySettingsDebug("gallery_load_ok", { storeId, source: "raw_sql", normalized });
      return normalized;
    } catch (rawError) {
      gallerySettingsDebug("gallery_load_fallback", {
        storeId,
        message: rawError instanceof Error ? rawError.message : String(rawError),
        defaults: GALLERY_DISPLAY_DEFAULTS,
      });
      return { ...GALLERY_DISPLAY_DEFAULTS };
    }
  }
}
