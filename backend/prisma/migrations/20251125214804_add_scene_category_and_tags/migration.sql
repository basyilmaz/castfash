-- AlterTable
ALTER TABLE "ScenePreset" ADD COLUMN     "backgroundPrompt" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "lighting" TEXT,
ADD COLUMN     "mood" TEXT,
ADD COLUMN     "qualityPreset" TEXT,
ADD COLUMN     "suggestedAspectRatio" TEXT,
ADD COLUMN     "tags" TEXT;
