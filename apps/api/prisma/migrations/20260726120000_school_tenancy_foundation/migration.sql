-- CreateEnum
CREATE TYPE "SchoolLicenseStatus" AS ENUM ('PLANNED', 'ACTIVE', 'SUSPENDED', 'EXPIRED');

-- CreateTable
CREATE TABLE "SchoolOrganization" (
    "id" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "startsOn" TIMESTAMP(3) NOT NULL,
    "endsOn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AcademicYear_dates_check" CHECK ("endsOn" > "startsOn")
);

-- CreateTable
CREATE TABLE "SchoolClass" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "gradeLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolClass_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SchoolClass_gradeLevel_check" CHECK ("gradeLevel" IN (7, 8, 9))
);

-- CreateTable
CREATE TABLE "SchoolSubjectGroup" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "subjectCode" VARCHAR(40) NOT NULL DEFAULT 'math',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSubjectGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolTeacher" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "demoCode" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolStudent" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "demoCode" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAssignment" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "schoolClassId" UUID NOT NULL,
    "subjectGroupId" UUID NOT NULL,
    "schoolTeacherId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentEnrollment" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "schoolClassId" UUID NOT NULL,
    "schoolStudentId" UUID NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolLicense" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "licenseCode" VARCHAR(80) NOT NULL,
    "status" "SchoolLicenseStatus" NOT NULL DEFAULT 'PLANNED',
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolLicense_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SchoolLicense_dates_check" CHECK ("validUntil" IS NULL OR "validFrom" IS NULL OR "validUntil" > "validFrom")
);

-- CreateTable
CREATE TABLE "SchoolEntitlement" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "licenseId" UUID NOT NULL,
    "capabilityCode" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolOrganization_code_key" ON "SchoolOrganization"("code");

-- CreateIndex
CREATE UNIQUE INDEX "School_id_organizationId_key" ON "School"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "School_organizationId_code_key" ON "School"("organizationId", "code");

-- CreateIndex
CREATE INDEX "School_organizationId_idx" ON "School"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_id_schoolId_key" ON "AcademicYear"("id", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_schoolId_code_key" ON "AcademicYear"("schoolId", "code");

-- CreateIndex
CREATE INDEX "AcademicYear_schoolId_idx" ON "AcademicYear"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolClass_id_schoolId_key" ON "SchoolClass"("id", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolClass_schoolId_academicYearId_code_key" ON "SchoolClass"("schoolId", "academicYearId", "code");

-- CreateIndex
CREATE INDEX "SchoolClass_schoolId_gradeLevel_idx" ON "SchoolClass"("schoolId", "gradeLevel");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolSubjectGroup_id_schoolId_key" ON "SchoolSubjectGroup"("id", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolSubjectGroup_schoolId_code_key" ON "SchoolSubjectGroup"("schoolId", "code");

-- CreateIndex
CREATE INDEX "SchoolSubjectGroup_schoolId_subjectCode_idx" ON "SchoolSubjectGroup"("schoolId", "subjectCode");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolTeacher_id_schoolId_key" ON "SchoolTeacher"("id", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolTeacher_schoolId_demoCode_key" ON "SchoolTeacher"("schoolId", "demoCode");

-- CreateIndex
CREATE INDEX "SchoolTeacher_schoolId_idx" ON "SchoolTeacher"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolStudent_id_schoolId_key" ON "SchoolStudent"("id", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolStudent_schoolId_demoCode_key" ON "SchoolStudent"("schoolId", "demoCode");

-- CreateIndex
CREATE INDEX "SchoolStudent_schoolId_idx" ON "SchoolStudent"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAssignment_id_schoolId_key" ON "TeacherAssignment"("id", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAssignment_schoolId_schoolClassId_subjectGroupId_schoolTeacherId_key" ON "TeacherAssignment"("schoolId", "schoolClassId", "subjectGroupId", "schoolTeacherId");

-- CreateIndex
CREATE INDEX "TeacherAssignment_schoolId_schoolClassId_idx" ON "TeacherAssignment"("schoolId", "schoolClassId");

-- CreateIndex
CREATE INDEX "TeacherAssignment_schoolId_schoolTeacherId_idx" ON "TeacherAssignment"("schoolId", "schoolTeacherId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollment_schoolId_schoolClassId_schoolStudentId_key" ON "StudentEnrollment"("schoolId", "schoolClassId", "schoolStudentId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_schoolId_schoolStudentId_idx" ON "StudentEnrollment"("schoolId", "schoolStudentId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolLicense_id_schoolId_key" ON "SchoolLicense"("id", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolLicense_schoolId_licenseCode_key" ON "SchoolLicense"("schoolId", "licenseCode");

-- CreateIndex
CREATE INDEX "SchoolLicense_schoolId_status_idx" ON "SchoolLicense"("schoolId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolEntitlement_schoolId_licenseId_capabilityCode_key" ON "SchoolEntitlement"("schoolId", "licenseId", "capabilityCode");

-- CreateIndex
CREATE INDEX "SchoolEntitlement_schoolId_capabilityCode_idx" ON "SchoolEntitlement"("schoolId", "capabilityCode");

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "SchoolOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_academicYearId_schoolId_fkey" FOREIGN KEY ("academicYearId", "schoolId") REFERENCES "AcademicYear"("id", "schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolSubjectGroup" ADD CONSTRAINT "SchoolSubjectGroup_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolTeacher" ADD CONSTRAINT "SchoolTeacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolStudent" ADD CONSTRAINT "SchoolStudent_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_schoolClassId_schoolId_fkey" FOREIGN KEY ("schoolClassId", "schoolId") REFERENCES "SchoolClass"("id", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_subjectGroupId_schoolId_fkey" FOREIGN KEY ("subjectGroupId", "schoolId") REFERENCES "SchoolSubjectGroup"("id", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_schoolTeacherId_schoolId_fkey" FOREIGN KEY ("schoolTeacherId", "schoolId") REFERENCES "SchoolTeacher"("id", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_schoolClassId_schoolId_fkey" FOREIGN KEY ("schoolClassId", "schoolId") REFERENCES "SchoolClass"("id", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_schoolStudentId_schoolId_fkey" FOREIGN KEY ("schoolStudentId", "schoolId") REFERENCES "SchoolStudent"("id", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolLicense" ADD CONSTRAINT "SchoolLicense_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolEntitlement" ADD CONSTRAINT "SchoolEntitlement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolEntitlement" ADD CONSTRAINT "SchoolEntitlement_licenseId_schoolId_fkey" FOREIGN KEY ("licenseId", "schoolId") REFERENCES "SchoolLicense"("id", "schoolId") ON DELETE CASCADE ON UPDATE CASCADE;
