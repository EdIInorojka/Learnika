import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://learnika_local:learnika_local_password@127.0.0.1:5432/learnika_local";

process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

function isForeignKeyViolation(error) {
  const message = [error?.message, error?.cause?.message, error?.cause?.originalMessage]
    .filter(Boolean)
    .join(" ");
  return (
    error?.code === "P2003" || /(foreign key|constraint|schoolclass|schoolstudent)/i.test(message)
  );
}

test("school tenancy uses synthetic participant records and rejects cross-school links", async () => {
  await assert.rejects(
    prisma.$transaction(async (tx) => {
      const organizationAId = randomUUID();
      const organizationBId = randomUUID();
      const schoolAId = randomUUID();
      const schoolBId = randomUUID();
      const academicYearAId = randomUUID();
      const academicYearBId = randomUUID();
      const classAId = randomUUID();
      const classBId = randomUUID();
      const subjectGroupAId = randomUUID();
      const subjectGroupBId = randomUUID();
      const teacherAId = randomUUID();
      const teacherBId = randomUUID();
      const studentAId = randomUUID();
      const studentBId = randomUUID();
      const licenseAId = randomUUID();

      await tx.schoolOrganization.create({
        data: { id: organizationAId, code: `synthetic-org-a-${Date.now()}` },
      });
      await tx.schoolOrganization.create({
        data: { id: organizationBId, code: `synthetic-org-b-${Date.now()}` },
      });
      await tx.school.create({
        data: { id: schoolAId, organizationId: organizationAId, code: "synthetic-school-a" },
      });
      await tx.school.create({
        data: { id: schoolBId, organizationId: organizationBId, code: "synthetic-school-b" },
      });

      await tx.academicYear.createMany({
        data: [
          {
            id: academicYearAId,
            schoolId: schoolAId,
            code: "synthetic-year-a",
            startsOn: new Date("2026-09-01T00:00:00.000Z"),
            endsOn: new Date("2027-05-31T00:00:00.000Z"),
          },
          {
            id: academicYearBId,
            schoolId: schoolBId,
            code: "synthetic-year-b",
            startsOn: new Date("2026-09-01T00:00:00.000Z"),
            endsOn: new Date("2027-05-31T00:00:00.000Z"),
          },
        ],
      });
      await tx.schoolClass.createMany({
        data: [
          {
            id: classAId,
            schoolId: schoolAId,
            academicYearId: academicYearAId,
            code: "synthetic-class-a",
            gradeLevel: 7,
          },
          {
            id: classBId,
            schoolId: schoolBId,
            academicYearId: academicYearBId,
            code: "synthetic-class-b",
            gradeLevel: 8,
          },
        ],
      });
      await tx.schoolSubjectGroup.createMany({
        data: [
          { id: subjectGroupAId, schoolId: schoolAId, code: "synthetic-math-a" },
          { id: subjectGroupBId, schoolId: schoolBId, code: "synthetic-math-b" },
        ],
      });
      await tx.schoolTeacher.createMany({
        data: [
          { id: teacherAId, schoolId: schoolAId, demoCode: "synthetic-teacher-a" },
          { id: teacherBId, schoolId: schoolBId, demoCode: "synthetic-teacher-b" },
        ],
      });
      await tx.schoolStudent.createMany({
        data: [
          { id: studentAId, schoolId: schoolAId, demoCode: "synthetic-student-a" },
          { id: studentBId, schoolId: schoolBId, demoCode: "synthetic-student-b" },
        ],
      });
      await tx.schoolLicense.create({
        data: {
          id: licenseAId,
          schoolId: schoolAId,
          licenseCode: "synthetic-license-a",
        },
      });
      await tx.schoolEntitlement.create({
        data: {
          schoolId: schoolAId,
          licenseId: licenseAId,
          capabilityCode: "synthetic-assignment-delivery",
        },
      });

      await tx.teacherAssignment.create({
        data: {
          schoolId: schoolAId,
          schoolClassId: classAId,
          subjectGroupId: subjectGroupAId,
          schoolTeacherId: teacherAId,
        },
      });
      await tx.studentEnrollment.create({
        data: {
          schoolId: schoolAId,
          schoolClassId: classAId,
          schoolStudentId: studentAId,
        },
      });

      await tx.$executeRawUnsafe("SAVEPOINT school_cross_school_assignment");
      await assert.rejects(
        tx.teacherAssignment.create({
          data: {
            schoolId: schoolAId,
            schoolClassId: classBId,
            subjectGroupId: subjectGroupAId,
            schoolTeacherId: teacherAId,
          },
        }),
        isForeignKeyViolation,
      );
      await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT school_cross_school_assignment");
      await tx.$executeRawUnsafe("SAVEPOINT school_cross_school_enrollment");
      await assert.rejects(
        tx.studentEnrollment.create({
          data: {
            schoolId: schoolAId,
            schoolClassId: classAId,
            schoolStudentId: studentBId,
          },
        }),
        isForeignKeyViolation,
      );
      await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT school_cross_school_enrollment");

      const foreignKeys = await tx.$queryRaw`
        SELECT DISTINCT ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.constraint_column_usage AS ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name IN (
            'School',
            'AcademicYear',
            'SchoolClass',
            'SchoolSubjectGroup',
            'SchoolTeacher',
            'SchoolStudent',
            'TeacherAssignment',
            'StudentEnrollment',
            'SchoolLicense',
            'SchoolEntitlement'
          )
      `;
      assert.equal(
        foreignKeys.some(({ foreign_table_name: tableName }) =>
          ["Family", "User", "ChildProfile"].includes(tableName),
        ),
        false,
      );

      throw new Error("school-tenancy-foundation-test-rollback");
    }),
    (error) => error?.message === "school-tenancy-foundation-test-rollback",
  );
});

after(async () => {
  await prisma.$disconnect();
});
