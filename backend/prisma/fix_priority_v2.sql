-- Quick fix: Manually set priorities based on provider type
-- Run this in Prisma Studio or pgAdmin

-- First, check current values
SELECT id, provider, priority, "isActive", "createdAt" 
FROM "AiProviderConfig" 
WHERE "organizationId" IS NULL
ORDER BY id;

-- Update priorities
UPDATE "AiProviderConfig" 
SET priority = CASE 
    WHEN provider = 'KIE' THEN 1
    WHEN provider = 'REPLICATE' THEN 2
    WHEN provider = 'FAL' THEN 3
    ELSE priority
END
WHERE "organizationId" IS NULL;

-- Verify
SELECT id, provider, priority, "isActive" 
FROM "AiProviderConfig" 
WHERE "organizationId" IS NULL
ORDER BY priority;
