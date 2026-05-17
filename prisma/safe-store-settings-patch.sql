-- =============================================================================
-- DESIGMA — Safe StoreSettings schema patch (idempotent)
-- =============================================================================
-- Aligns PostgreSQL "StoreSettings" with prisma/schema.prisma.
-- Run once in Supabase SQL Editor (or psql). Safe to re-run.
--
-- NO prisma db push | NO migrate reset | NO DROP TABLE | NO destructive DDL
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Nullable TEXT / JSONB / TIMESTAMP columns
-- -----------------------------------------------------------------------------
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "whatsappPhone" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "supportEmail" TEXT;

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "terms_he" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "terms_ar" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "terms_en" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "privacy_he" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "privacy_ar" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "privacy_en" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "refund_he" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "refund_ar" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "refund_en" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shipping_he" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shipping_ar" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shipping_en" TEXT;

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "policyDrafts" JSONB;

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "termsPublishedAt" TIMESTAMP(3);
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "privacyPublishedAt" TIMESTAMP(3);
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "refundPublishedAt" TIMESTAMP(3);
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shippingPublishedAt" TIMESTAMP(3);

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "heroTitle_he" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "heroTitle_ar" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "heroTitle_en" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "heroSubtitle_he" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "heroSubtitle_ar" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "heroSubtitle_en" TEXT;

-- Product gallery (admin studio + storefront) — fixes productGalleryMaxHeightPx runtime errors
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "productGalleryPreset" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "productGalleryMaxHeightPx" INTEGER;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "productGalleryMaxWidthPx" INTEGER;

UPDATE "StoreSettings"
SET "productGalleryPreset" = 'medium'
WHERE "productGalleryPreset" IS NULL;

UPDATE "StoreSettings"
SET
  "productGalleryMaxHeightPx" = CASE
    WHEN "productGalleryPreset" = 'small' THEN 320
    WHEN "productGalleryPreset" = 'large' THEN 680
    WHEN "productGalleryPreset" = 'custom' THEN COALESCE("productGalleryMaxHeightPx", 900)
    ELSE COALESCE("productGalleryMaxHeightPx", 520)
  END,
  "productGalleryMaxWidthPx" = CASE
    WHEN "productGalleryPreset" = 'small' THEN 320
    WHEN "productGalleryPreset" = 'large' THEN 680
    WHEN "productGalleryPreset" = 'custom' THEN COALESCE("productGalleryMaxWidthPx", 1400)
    ELSE COALESCE("productGalleryMaxWidthPx", 520)
  END
WHERE "productGalleryMaxHeightPx" IS NULL OR "productGalleryMaxWidthPx" IS NULL;

ALTER TABLE "StoreSettings"
  ALTER COLUMN "productGalleryPreset" SET DEFAULT 'medium';

-- -----------------------------------------------------------------------------
-- TEXT columns with defaults
-- -----------------------------------------------------------------------------
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "primaryColor" TEXT;
UPDATE "StoreSettings" SET "primaryColor" = '#111827' WHERE "primaryColor" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "primaryColor" SET DEFAULT '#111827';

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT;
UPDATE "StoreSettings" SET "secondaryColor" = '#6b7280' WHERE "secondaryColor" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "secondaryColor" SET DEFAULT '#6b7280';

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "accentColor" TEXT;
UPDATE "StoreSettings" SET "accentColor" = '#2563eb' WHERE "accentColor" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "accentColor" SET DEFAULT '#2563eb';

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "currency" TEXT;
UPDATE "StoreSettings" SET "currency" = 'ILS' WHERE "currency" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "currency" SET DEFAULT 'ILS';

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "languageDefault" TEXT;
UPDATE "StoreSettings" SET "languageDefault" = 'he' WHERE "languageDefault" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "languageDefault" SET DEFAULT 'he';

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "orderNumberPrefix" TEXT;
UPDATE "StoreSettings" SET "orderNumberPrefix" = 'ORD' WHERE "orderNumberPrefix" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "orderNumberPrefix" SET DEFAULT 'ORD';

-- -----------------------------------------------------------------------------
-- INTEGER with default
-- -----------------------------------------------------------------------------
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "nextOrderNumber" INTEGER;
UPDATE "StoreSettings" SET "nextOrderNumber" = 1001 WHERE "nextOrderNumber" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "nextOrderNumber" SET DEFAULT 1001;

-- -----------------------------------------------------------------------------
-- BOOLEAN columns with defaults
-- -----------------------------------------------------------------------------
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "rtlEnabled" BOOLEAN;
UPDATE "StoreSettings" SET "rtlEnabled" = true WHERE "rtlEnabled" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "rtlEnabled" SET DEFAULT true;

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "pickupEnabled" BOOLEAN;
UPDATE "StoreSettings" SET "pickupEnabled" = true WHERE "pickupEnabled" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "pickupEnabled" SET DEFAULT true;

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "registrationEnabled" BOOLEAN;
UPDATE "StoreSettings" SET "registrationEnabled" = true WHERE "registrationEnabled" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "registrationEnabled" SET DEFAULT true;

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "requireEmailVerificationForCheckout" BOOLEAN;
UPDATE "StoreSettings"
SET "requireEmailVerificationForCheckout" = true
WHERE "requireEmailVerificationForCheckout" IS NULL;
ALTER TABLE "StoreSettings"
  ALTER COLUMN "requireEmailVerificationForCheckout" SET DEFAULT true;

-- -----------------------------------------------------------------------------
-- Timestamps (if table predates Prisma defaults)
-- -----------------------------------------------------------------------------
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3);
UPDATE "StoreSettings" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
UPDATE "StoreSettings" SET "updatedAt" = COALESCE("createdAt", CURRENT_TIMESTAMP) WHERE "updatedAt" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

COMMIT;

-- Verify gallery columns (optional — run separately)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'StoreSettings'
--   AND column_name IN ('productGalleryPreset', 'productGalleryMaxHeightPx', 'productGalleryMaxWidthPx')
-- ORDER BY column_name;
