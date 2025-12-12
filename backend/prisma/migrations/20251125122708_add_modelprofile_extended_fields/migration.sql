-- AlterTable
ALTER TABLE "ModelProfile" ADD COLUMN     "ageRange" TEXT,
ADD COLUMN     "backPrompt" TEXT,
ADD COLUMN     "frontPrompt" TEXT,
ADD COLUMN     "hairColor" TEXT,
ADD COLUMN     "hairStyle" TEXT,
ADD COLUMN     "modelType" TEXT NOT NULL DEFAULT 'IMAGE_REFERENCE',
ADD COLUMN     "stylePrompt" TEXT;
