-- AlterTable
ALTER TABLE "ScenePreset" ADD COLUMN     "packId" TEXT;

-- CreateTable
CREATE TABLE "ScenePack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenePack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScenePack_slug_key" ON "ScenePack"("slug");

-- CreateIndex
CREATE INDEX "CreditTransaction_organizationId_createdAt_idx" ON "CreditTransaction"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditTransaction_type_idx" ON "CreditTransaction"("type");

-- CreateIndex
CREATE INDEX "GeneratedImage_generationRequestId_idx" ON "GeneratedImage"("generationRequestId");

-- CreateIndex
CREATE INDEX "GeneratedImage_productId_idx" ON "GeneratedImage"("productId");

-- CreateIndex
CREATE INDEX "GeneratedImage_viewType_idx" ON "GeneratedImage"("viewType");

-- CreateIndex
CREATE INDEX "GenerationRequest_organizationId_createdAt_idx" ON "GenerationRequest"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationRequest_productId_idx" ON "GenerationRequest"("productId");

-- CreateIndex
CREATE INDEX "GenerationRequest_modelProfileId_idx" ON "GenerationRequest"("modelProfileId");

-- CreateIndex
CREATE INDEX "GenerationRequest_scenePresetId_idx" ON "GenerationRequest"("scenePresetId");

-- CreateIndex
CREATE INDEX "GenerationRequest_status_idx" ON "GenerationRequest"("status");

-- CreateIndex
CREATE INDEX "ModelProfile_organizationId_idx" ON "ModelProfile"("organizationId");

-- CreateIndex
CREATE INDEX "ModelProfile_gender_idx" ON "ModelProfile"("gender");

-- CreateIndex
CREATE INDEX "Product_organizationId_idx" ON "Product"("organizationId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- AddForeignKey
ALTER TABLE "ScenePreset" ADD CONSTRAINT "ScenePreset_packId_fkey" FOREIGN KEY ("packId") REFERENCES "ScenePack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
