-- CreateEnum
CREATE TYPE "AiProviderType" AS ENUM ('KIE', 'REPLICATE', 'FAL');

-- CreateTable
CREATE TABLE "AiProviderConfig" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER,
    "provider" "AiProviderType" NOT NULL,
    "apiKey" TEXT,
    "baseUrl" TEXT,
    "modelId" TEXT,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiProviderConfig_organizationId_idx" ON "AiProviderConfig"("organizationId");

-- AddForeignKey
ALTER TABLE "AiProviderConfig" ADD CONSTRAINT "AiProviderConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
