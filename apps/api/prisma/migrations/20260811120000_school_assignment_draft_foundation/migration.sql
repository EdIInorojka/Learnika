-- CreateEnum
CREATE TYPE "SchoolAssignmentStatus" AS ENUM ('DRAFT', 'REHEARSAL_READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SchoolAssignmentDeliveryMode" AS ENUM ('ONLINE_REHEARSAL', 'PRINT_REHEARSAL');

-- CreateEnum
CREATE TYPE "SchoolAssignmentTargetState" AS ENUM ('INCLUDED', 'REMOVED');

-- CreateTable
CREATE TABLE "SchoolAssignment" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "schoolClassId" UUID NOT NULL,
    "subjectGroupId" UUID NOT NULL,
    "schoolTeacherId" UUID NOT NULL,
    "assignmentCode" VARCHAR(80) NOT NULL,
    "packageCode" VARCHAR(80) NOT NULL,
    "status" "SchoolAssignmentStatus" NOT NULL DEFAULT 'DRAFT',
    "deliveryMode" "SchoolAssignmentDeliveryMode" NOT NULL DEFAULT 'ONLINE_REHEARSAL',
    "attemptLimit" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "availabilityDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolAssignment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SchoolAssignment_assignmentCode_check" CHECK ("assignmentCode" ~ '^[a-z0-9][a-z0-9-]{2,79}$'),
    CONSTRAINT "SchoolAssignment_packageCode_check" CHECK ("packageCode" ~ '^[a-z0-9][a-z0-9-]{2,79}$'),
    CONSTRAINT "SchoolAssignment_attemptLimit_check" CHECK ("attemptLimit" BETWEEN 1 AND 5),
    CONSTRAINT "SchoolAssignment_durationMinutes_check" CHECK ("durationMinutes" BETWEEN 5 AND 180),
    CONSTRAINT "SchoolAssignment_availabilityDays_check" CHECK ("availabilityDays" BETWEEN 1 AND 60)
);

-- CreateTable
CREATE TABLE "SchoolAssignmentTarget" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "schoolAssignmentId" UUID NOT NULL,
    "schoolStudentId" UUID NOT NULL,
    "state" "SchoolAssignmentTargetState" NOT NULL DEFAULT 'INCLUDED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolAssignmentTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolAssignment_id_schoolId_key" ON "SchoolAssignment"("id", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolAssignment_schoolId_assignmentCode_key" ON "SchoolAssignment"("schoolId", "assignmentCode");

-- CreateIndex
CREATE INDEX "SchoolAssignment_schoolId_academicYearId_idx" ON "SchoolAssignment"("schoolId", "academicYearId");

-- CreateIndex
CREATE INDEX "SchoolAssignment_schoolId_schoolClassId_idx" ON "SchoolAssignment"("schoolId", "schoolClassId");

-- CreateIndex
CREATE INDEX "SchoolAssignment_schoolId_schoolTeacherId_idx" ON "SchoolAssignment"("schoolId", "schoolTeacherId");

-- CreateIndex
CREATE INDEX "SchoolAssignment_schoolId_status_idx" ON "SchoolAssignment"("schoolId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolAssignmentTarget_schoolId_schoolAssignmentId_schoolStudentId_key" ON "SchoolAssignmentTarget"("schoolId", "schoolAssignmentId", "schoolStudentId");

-- CreateIndex
CREATE INDEX "SchoolAssignmentTarget_schoolId_schoolStudentId_idx" ON "SchoolAssignmentTarget"("schoolId", "schoolStudentId");

-- CreateIndex
CREATE INDEX "SchoolAssignmentTarget_schoolId_state_idx" ON "SchoolAssignmentTarget"("schoolId", "state");

-- AddForeignKey
ALTER TABLE "SchoolAssignment" ADD CONSTRAINT "SchoolAssignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAssignment" ADD CONSTRAINT "SchoolAssignment_academicYearId_schoolId_fkey" FOREIGN KEY ("academicYearId", "schoolId") REFERENCES "AcademicYear"("id", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAssignment" ADD CONSTRAINT "SchoolAssignment_schoolClassId_schoolId_fkey" FOREIGN KEY ("schoolClassId", "schoolId") REFERENCES "SchoolClass"("id", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAssignment" ADD CONSTRAINT "SchoolAssignment_subjectGroupId_schoolId_fkey" FOREIGN KEY ("subjectGroupId", "schoolId") REFERENCES "SchoolSubjectGroup"("id", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAssignment" ADD CONSTRAINT "SchoolAssignment_schoolTeacherId_schoolId_fkey" FOREIGN KEY ("schoolTeacherId", "schoolId") REFERENCES "SchoolTeacher"("id", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAssignmentTarget" ADD CONSTRAINT "SchoolAssignmentTarget_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAssignmentTarget" ADD CONSTRAINT "SchoolAssignmentTarget_schoolAssignmentId_schoolId_fkey" FOREIGN KEY ("schoolAssignmentId", "schoolId") REFERENCES "SchoolAssignment"("id", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAssignmentTarget" ADD CONSTRAINT "SchoolAssignmentTarget_schoolStudentId_schoolId_fkey" FOREIGN KEY ("schoolStudentId", "schoolId") REFERENCES "SchoolStudent"("id", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;
