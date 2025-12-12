-- AlterTable
ALTER TABLE "AiProviderConfig" ADD COLUMN     "avgResponseMs" INTEGER,
ADD COLUMN     "errorCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "lastErrorAt" TIMESTAMP(3),
ADD COLUMN     "maxRetries" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "successCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timeoutMs" INTEGER NOT NULL DEFAULT 30000;

-- CreateIndex
CREATE INDEX "AiProviderConfig_priority_isActive_idx" ON "AiProviderConfig"("priority", "isActive");
