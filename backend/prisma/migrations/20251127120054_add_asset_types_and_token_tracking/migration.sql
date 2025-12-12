-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('UPLOADED', 'AI_GENERATED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CreditType" ADD VALUE 'PRODUCT_GENERATION';
ALTER TYPE "CreditType" ADD VALUE 'MODEL_GENERATION';
ALTER TYPE "CreditType" ADD VALUE 'SCENE_GENERATION';
ALTER TYPE "CreditType" ADD VALUE 'FINAL_GENERATION';

-- AlterTable
ALTER TABLE "CreditTransaction" ADD COLUMN     "generationRequestId" INTEGER,
ADD COLUMN     "modelProfileId" INTEGER,
ADD COLUMN     "productId" INTEGER,
ADD COLUMN     "scenePresetId" INTEGER;

-- AlterTable
ALTER TABLE "ModelProfile" ADD COLUMN     "backReferenceType" "AssetType" NOT NULL DEFAULT 'UPLOADED',
ADD COLUMN     "faceReferenceType" "AssetType" NOT NULL DEFAULT 'UPLOADED',
ADD COLUMN     "tokensSpentOnCreation" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productBackImagePrompt" TEXT,
ADD COLUMN     "productBackImageType" "AssetType" NOT NULL DEFAULT 'UPLOADED',
ADD COLUMN     "productImagePrompt" TEXT,
ADD COLUMN     "productImageType" "AssetType" NOT NULL DEFAULT 'UPLOADED',
ADD COLUMN     "tokensSpentOnCreation" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ScenePreset" ADD COLUMN     "backgroundType" "AssetType" NOT NULL DEFAULT 'UPLOADED',
ADD COLUMN     "tokensSpentOnCreation" INTEGER NOT NULL DEFAULT 0;
