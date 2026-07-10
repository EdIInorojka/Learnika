-- CreateEnum
CREATE TYPE "HomeworkSessionStatus" AS ENUM ('CREATED', 'WAITING_FOR_ATTEMPT', 'PAUSED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "HomeworkSourceType" AS ENUM ('MANUAL', 'IMAGE', 'SCREENSHOT', 'PDF', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "HomeworkAttemptStatus" AS ENUM ('CREATED', 'SUBMITTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MediaAssetKind" AS ENUM ('HOMEWORK_IMAGE', 'HOMEWORK_SCREENSHOT', 'HOMEWORK_PDF', 'VOICE_AUDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaRetentionStatus" AS ENUM ('TEMPORARY', 'RETENTION_EXPIRED', 'DELETION_REQUESTED', 'DELETED');

-- CreateTable
CREATE TABLE "HomeworkSession" (
    "id" UUID NOT NULL,
    "familyId" UUID NOT NULL,
    "childProfileId" UUID NOT NULL,
    "createdByUserId" UUID,
    "subject" VARCHAR(40) NOT NULL DEFAULT 'math',
    "gradeLevel" INTEGER,
    "sourceType" "HomeworkSourceType" NOT NULL DEFAULT 'UNKNOWN',
    "status" "HomeworkSessionStatus" NOT NULL DEFAULT 'CREATED',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeworkSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkAttempt" (
    "id" UUID NOT NULL,
    "familyId" UUID NOT NULL,
    "homeworkSessionId" UUID NOT NULL,
    "childProfileId" UUID NOT NULL,
    "createdByUserId" UUID,
    "attemptNumber" INTEGER NOT NULL,
    "status" "HomeworkAttemptStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeworkAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" UUID NOT NULL,
    "familyId" UUID NOT NULL,
    "childProfileId" UUID,
    "homeworkSessionId" UUID,
    "createdByUserId" UUID,
    "assetKind" "MediaAssetKind" NOT NULL,
    "storageKey" VARCHAR(512),
    "mimeType" VARCHAR(120) NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "checksumSha256" VARCHAR(64),
    "retentionStatus" "MediaRetentionStatus" NOT NULL DEFAULT 'TEMPORARY',
    "retentionUntil" TIMESTAMP(3) NOT NULL,
    "deletionRequestedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeworkSession_familyId_childProfileId_idx" ON "HomeworkSession"("familyId", "childProfileId");

-- CreateIndex
CREATE INDEX "HomeworkSession_familyId_status_idx" ON "HomeworkSession"("familyId", "status");

-- CreateIndex
CREATE INDEX "HomeworkSession_createdByUserId_idx" ON "HomeworkSession"("createdByUserId");

-- CreateIndex
CREATE INDEX "HomeworkAttempt_familyId_childProfileId_idx" ON "HomeworkAttempt"("familyId", "childProfileId");

-- CreateIndex
CREATE INDEX "HomeworkAttempt_familyId_status_idx" ON "HomeworkAttempt"("familyId", "status");

-- CreateIndex
CREATE INDEX "HomeworkAttempt_createdByUserId_idx" ON "HomeworkAttempt"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkAttempt_homeworkSessionId_attemptNumber_key" ON "HomeworkAttempt"("homeworkSessionId", "attemptNumber");

-- CreateIndex
CREATE INDEX "MediaAsset_familyId_childProfileId_idx" ON "MediaAsset"("familyId", "childProfileId");

-- CreateIndex
CREATE INDEX "MediaAsset_familyId_retentionStatus_retentionUntil_idx" ON "MediaAsset"("familyId", "retentionStatus", "retentionUntil");

-- CreateIndex
CREATE INDEX "MediaAsset_homeworkSessionId_idx" ON "MediaAsset"("homeworkSessionId");

-- CreateIndex
CREATE INDEX "MediaAsset_createdByUserId_idx" ON "MediaAsset"("createdByUserId");

-- AddForeignKey
ALTER TABLE "HomeworkSession" ADD CONSTRAINT "HomeworkSession_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSession" ADD CONSTRAINT "HomeworkSession_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSession" ADD CONSTRAINT "HomeworkSession_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAttempt" ADD CONSTRAINT "HomeworkAttempt_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAttempt" ADD CONSTRAINT "HomeworkAttempt_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAttempt" ADD CONSTRAINT "HomeworkAttempt_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAttempt" ADD CONSTRAINT "HomeworkAttempt_homeworkSessionId_fkey" FOREIGN KEY ("homeworkSessionId") REFERENCES "HomeworkSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_homeworkSessionId_fkey" FOREIGN KEY ("homeworkSessionId") REFERENCES "HomeworkSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
