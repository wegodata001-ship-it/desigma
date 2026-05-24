-- Safe idempotent patch: ContactLead for storefront contact form + admin inbox
CREATE TABLE IF NOT EXISTS "ContactLead" (
  "id" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "ContactLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ContactLead_storeId_idx" ON "ContactLead"("storeId");
CREATE INDEX IF NOT EXISTS "ContactLead_storeId_isRead_idx" ON "ContactLead"("storeId", "isRead");
CREATE INDEX IF NOT EXISTS "ContactLead_createdAt_idx" ON "ContactLead"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ContactLead_storeId_fkey'
  ) THEN
    ALTER TABLE "ContactLead"
      ADD CONSTRAINT "ContactLead_storeId_fkey"
      FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
