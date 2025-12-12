-- Add provider management columns
-- Migration: add_provider_management_columns

-- Add priority and health tracking columns
ALTER TABLE "AiProviderConfig" 
  ADD COLUMN IF NOT EXISTS "priority" INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "maxRetries" INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS "timeoutMs" INTEGER DEFAULT 30000,
  ADD COLUMN IF NOT EXISTS "lastError" TEXT,
  ADD COLUMN IF NOT EXISTS "lastErrorAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "errorCount" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "successCount" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "avgResponseMs" INTEGER;

-- Set default priorities for existing providers
UPDATE "AiProviderConfig" SET "priority" = 1 WHERE "provider" = 'KIE' AND "priority" IS NULL;
UPDATE "AiProviderConfig" SET "priority" = 2 WHERE "provider" = 'REPLICATE' AND "priority" IS NULL;
UPDATE "AiProviderConfig" SET "priority" = 3 WHERE "provider" = 'FAL' AND "priority" IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS "idx_provider_priority" ON "AiProviderConfig"("priority", "isActive");
CREATE INDEX IF NOT EXISTS "idx_provider_org" ON "AiProviderConfig"("organizationId", "isActive");
