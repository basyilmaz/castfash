-- Fix existing providers with null priority
-- Run this SQL to update existing providers

UPDATE "AiProviderConfig" 
SET "priority" = 1 
WHERE "priority" IS NULL AND "provider" = 'KIE';

UPDATE "AiProviderConfig" 
SET "priority" = 2 
WHERE "priority" IS NULL AND "provider" = 'REPLICATE';

UPDATE "AiProviderConfig" 
SET "priority" = 3 
WHERE "priority" IS NULL AND "provider" = 'FAL';

-- Verify
SELECT id, provider, priority, "isActive" FROM "AiProviderConfig" ORDER BY priority;
