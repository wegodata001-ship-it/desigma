-- Safe idempotent patch: Product.tags for smartphone badges / filters
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
