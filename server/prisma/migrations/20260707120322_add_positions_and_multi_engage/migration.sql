-- DropIndex
DROP INDEX "Engagement_jobId_key";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "filledCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "positions" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Engagement_jobId_idx" ON "Engagement"("jobId");
