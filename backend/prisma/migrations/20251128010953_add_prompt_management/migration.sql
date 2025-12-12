-- CreateEnum
CREATE TYPE "PromptType" AS ENUM ('MASTER', 'SCENE', 'POSE', 'LIGHTING', 'STYLE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "PromptCategoryType" AS ENUM ('PRODUCT', 'MODEL', 'GENERAL', 'BACKGROUND', 'QUALITY');

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PromptType" NOT NULL,
    "category" "PromptCategoryType",
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_versions" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "changes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,

    CONSTRAINT "prompt_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_presets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scenePrompt" TEXT,
    "posePrompt" TEXT,
    "lightingPrompt" TEXT,
    "stylePrompt" TEXT,
    "negativePrompt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,

    CONSTRAINT "prompt_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_analytics" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "generationId" INTEGER,
    "success" BOOLEAN NOT NULL,
    "qualityScore" DOUBLE PRECISION,
    "executionTime" INTEGER,
    "errorMessage" TEXT,
    "combination" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompt_templates_type_idx" ON "prompt_templates"("type");

-- CreateIndex
CREATE INDEX "prompt_templates_isActive_idx" ON "prompt_templates"("isActive");

-- CreateIndex
CREATE INDEX "prompt_versions_templateId_idx" ON "prompt_versions"("templateId");

-- CreateIndex
CREATE INDEX "prompt_presets_isActive_idx" ON "prompt_presets"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_categories_name_key" ON "prompt_categories"("name");

-- CreateIndex
CREATE INDEX "prompt_analytics_templateId_idx" ON "prompt_analytics"("templateId");

-- CreateIndex
CREATE INDEX "prompt_analytics_success_idx" ON "prompt_analytics"("success");

-- CreateIndex
CREATE INDEX "prompt_analytics_createdAt_idx" ON "prompt_analytics"("createdAt");

-- AddForeignKey
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "prompt_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_analytics" ADD CONSTRAINT "prompt_analytics_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "prompt_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
