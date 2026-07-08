-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PARENT', 'CHILD', 'MENTOR', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "FamilyMemberRole" AS ENUM ('OWNER', 'CAREGIVER', 'CHILD', 'MENTOR');

-- CreateEnum
CREATE TYPE "ConsentSubjectType" AS ENUM ('FAMILY', 'CHILD');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditOutcome" AS ENUM ('SUCCESS', 'DENIED', 'ERROR');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "accountRole" "UserRole" NOT NULL,
    "email" VARCHAR(320),
    "locale" VARCHAR(16) NOT NULL DEFAULT 'ru',
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" UUID NOT NULL,
    "displayName" VARCHAR(120),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" UUID NOT NULL,
    "familyId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "FamilyMemberRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildProfile" (
    "id" UUID NOT NULL,
    "familyId" UUID NOT NULL,
    "userId" UUID,
    "nickname" VARCHAR(120),
    "gradeLevel" INTEGER,
    "locale" VARCHAR(16) NOT NULL DEFAULT 'ru',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" UUID NOT NULL,
    "familyId" UUID NOT NULL,
    "childProfileId" UUID,
    "subjectType" "ConsentSubjectType" NOT NULL,
    "purpose" VARCHAR(80) NOT NULL,
    "documentVersion" VARCHAR(80) NOT NULL,
    "policyVersion" VARCHAR(80) NOT NULL,
    "grantedByUserId" UUID NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextbookSelection" (
    "id" UUID NOT NULL,
    "familyId" UUID NOT NULL,
    "childProfileId" UUID NOT NULL,
    "subject" VARCHAR(40) NOT NULL DEFAULT 'math',
    "gradeLevel" INTEGER,
    "textbookCode" VARCHAR(120) NOT NULL,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TextbookSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "familyId" UUID,
    "actorUserId" UUID,
    "actorType" "AuditActorType" NOT NULL,
    "action" VARCHAR(120) NOT NULL,
    "targetType" VARCHAR(120),
    "targetId" VARCHAR(120),
    "outcome" "AuditOutcome" NOT NULL,
    "policyVersion" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "FamilyMember_familyId_role_idx" ON "FamilyMember"("familyId", "role");

-- CreateIndex
CREATE INDEX "FamilyMember_userId_idx" ON "FamilyMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_familyId_userId_key" ON "FamilyMember"("familyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildProfile_userId_key" ON "ChildProfile"("userId");

-- CreateIndex
CREATE INDEX "ChildProfile_familyId_idx" ON "ChildProfile"("familyId");

-- CreateIndex
CREATE INDEX "ChildProfile_familyId_gradeLevel_idx" ON "ChildProfile"("familyId", "gradeLevel");

-- CreateIndex
CREATE INDEX "ConsentRecord_familyId_childProfileId_idx" ON "ConsentRecord"("familyId", "childProfileId");

-- CreateIndex
CREATE INDEX "ConsentRecord_familyId_purpose_documentVersion_idx" ON "ConsentRecord"("familyId", "purpose", "documentVersion");

-- CreateIndex
CREATE INDEX "ConsentRecord_grantedByUserId_idx" ON "ConsentRecord"("grantedByUserId");

-- CreateIndex
CREATE INDEX "TextbookSelection_familyId_childProfileId_idx" ON "TextbookSelection"("familyId", "childProfileId");

-- CreateIndex
CREATE INDEX "TextbookSelection_familyId_subject_gradeLevel_idx" ON "TextbookSelection"("familyId", "subject", "gradeLevel");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_familyId_createdAt_idx" ON "AuditLog"("familyId", "createdAt");

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildProfile" ADD CONSTRAINT "ChildProfile_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildProfile" ADD CONSTRAINT "ChildProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_grantedByUserId_fkey" FOREIGN KEY ("grantedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextbookSelection" ADD CONSTRAINT "TextbookSelection_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextbookSelection" ADD CONSTRAINT "TextbookSelection_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;
