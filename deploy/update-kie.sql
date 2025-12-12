UPDATE "AiProviderConfig" SET "modelId" = 'google/nano-banana' WHERE provider = 'KIE';
SELECT provider, "modelId", "isActive" FROM "AiProviderConfig";
