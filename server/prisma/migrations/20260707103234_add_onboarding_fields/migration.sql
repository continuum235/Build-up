-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "documents" JSONB,
ADD COLUMN     "hourlyRate" INTEGER,
ADD COLUMN     "languages" JSONB,
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roleTitle" TEXT,
ADD COLUMN     "skills" JSONB,
ALTER COLUMN "role" DROP NOT NULL;
