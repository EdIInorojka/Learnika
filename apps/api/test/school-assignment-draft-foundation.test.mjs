import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { SchoolAssignmentDraftService } from "../dist/school-assignments/school-assignment-draft.service.js";

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
  return error?.code === "P2003" || /foreign key|constraint|schoolassignmenttarget/i.test(message);
}

function createScopedService(tx) {
  return new SchoolAssignmentDraftService({
    $transaction: async (callback) => callback(tx),
  });
}

async function createSyntheticSchoolFixture(tx) {
  const suffix = randomUUID().slice(0, 8);
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

  await tx.schoolOrganization.createMany({
    data: [
      { id: organizationAId, code: `synthetic-assignment-org-a-${suffix}` },
      { id: organizationBId, code: `synthetic-assignment-org-b-${suffix}` },
    ],
  });
  await tx.school.createMany({
    data: [
      { id: schoolAId, organizationId: organizationAId, code: `synthetic-assignment-a-${suffix}` },
      { id: schoolBId, organizationId: organizationBId, code: `synthetic-assignment-b-${suffix}` },
    ],
  });
  await tx.academicYear.createMany({
    data: [
      {
        id: academicYearAId,
        schoolId: schoolAId,
        code: `year-a-${suffix}`,
        startsOn: new Date("2026-09-01T00:00:00.000Z"),
        endsOn: new Date("2027-05-31T00:00:00.000Z"),
      },
      {
        id: academicYearBId,
        schoolId: schoolBId,
        code: `year-b-${suffix}`,
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
        code: `synthetic-class-a-${suffix}`,
        gradeLevel: 7,
      },
      {
        id: classBId,
        schoolId: schoolBId,
        academicYearId: academicYearBId,
        code: `synthetic-class-b-${suffix}`,
        gradeLevel: 8,
      },
    ],
  });
  await tx.schoolSubjectGroup.createMany({
    data: [
      { id: subjectGroupAId, schoolId: schoolAId, code: `synthetic-math-a-${suffix}` },
      { id: subjectGroupBId, schoolId: schoolBId, code: `synthetic-math-b-${suffix}` },
    ],
  });
  await tx.schoolTeacher.createMany({
    data: [
      { id: teacherAId, schoolId: schoolAId, demoCode: `synthetic-teacher-a-${suffix}` },
      { id: teacherBId, schoolId: schoolBId, demoCode: `synthetic-teacher-b-${suffix}` },
    ],
  });
  await tx.schoolStudent.createMany({
    data: [
      { id: studentAId, schoolId: schoolAId, demoCode: `synthetic-student-a-${suffix}` },
      { id: studentBId, schoolId: schoolBId, demoCode: `synthetic-student-b-${suffix}` },
    ],
  });
  await tx.teacherAssignment.create({
    data: {
      schoolClassId: classAId,
      schoolId: schoolAId,
      schoolTeacherId: teacherAId,
      subjectGroupId: subjectGroupAId,
    },
  });
  await tx.studentEnrollment.create({
    data: {
      schoolClassId: classAId,
      schoolId: schoolAId,
      schoolStudentId: studentAId,
    },
  });

  return {
    academicYearAId,
    classAId,
    schoolAId,
    schoolBId,
    studentBId,
    subjectGroupAId,
    suffix,
    teacherAId,
    teacherBId,
  };
}

test("school assignment draft foundation creates only synthetic school-scoped drafts", async () => {
  await assert.rejects(
    prisma.$transaction(async (tx) => {
      const fixture = await createSyntheticSchoolFixture(tx);
      const service = createScopedService(tx);

      const summary = await service.createSyntheticDraft({
        academicYearId: fixture.academicYearAId,
        assignmentCode: `synthetic-draft-${fixture.suffix}`,
        attemptLimit: 2,
        availabilityDays: 7,
        deliveryMode: "ONLINE_REHEARSAL",
        durationMinutes: 45,
        packageCode: `synthetic-package-${fixture.suffix}`,
        schoolClassId: fixture.classAId,
        schoolId: fixture.schoolAId,
        schoolTeacherId: fixture.teacherAId,
        subjectGroupId: fixture.subjectGroupAId,
      });

      assert.equal(summary.assignmentCode, `synthetic-draft-${fixture.suffix}`);
      assert.equal(summary.deliveryMode, "ONLINE_REHEARSAL");
      assert.equal(summary.status, "DRAFT");
      assert.equal(summary.targetCount, 1);
      assert.equal(summary.writeScope, "SYNTHETIC_SCHOOL_ONLY");
      assert.deepEqual(summary.boundary, {
        activation: "BLOCKED",
        familyLinkCount: 0,
        productionDataCount: 0,
        readiness: "NOT_READY",
        realSchoolCount: 0,
      });

      const assignment = await tx.schoolAssignment.findUniqueOrThrow({
        include: { targets: true },
        where: {
          schoolId_assignmentCode: {
            assignmentCode: `synthetic-draft-${fixture.suffix}`,
            schoolId: fixture.schoolAId,
          },
        },
      });
      assert.equal(assignment.targets.length, 1);
      assert.equal(assignment.status, "DRAFT");
      assert.equal(assignment.deliveryMode, "ONLINE_REHEARSAL");

      await tx.$executeRawUnsafe("SAVEPOINT school_assignment_cross_school_target");
      await assert.rejects(
        tx.schoolAssignmentTarget.create({
          data: {
            schoolAssignmentId: assignment.id,
            schoolId: fixture.schoolAId,
            schoolStudentId: fixture.studentBId,
          },
        }),
        isForeignKeyViolation,
      );
      await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT school_assignment_cross_school_target");

      await assert.rejects(
        service.createSyntheticDraft({
          academicYearId: fixture.academicYearAId,
          assignmentCode: `synthetic-unassigned-${fixture.suffix}`,
          attemptLimit: 2,
          availabilityDays: 7,
          deliveryMode: "PRINT_REHEARSAL",
          durationMinutes: 45,
          packageCode: `synthetic-package-print-${fixture.suffix}`,
          schoolClassId: fixture.classAId,
          schoolId: fixture.schoolAId,
          schoolTeacherId: fixture.teacherBId,
          subjectGroupId: fixture.subjectGroupAId,
        }),
        (error) => error?.getResponse?.().code === "SCHOOL_ASSIGNMENT_SCOPE_MISMATCH",
      );

      const foreignKeys = await tx.$queryRaw`
        SELECT DISTINCT ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.constraint_column_usage AS ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name IN ('SchoolAssignment', 'SchoolAssignmentTarget')
      `;
      assert.equal(
        foreignKeys.some(({ foreign_table_name: tableName }) =>
          ["Family", "User", "ChildProfile"].includes(tableName),
        ),
        false,
      );

      throw new Error("school-assignment-draft-foundation-test-rollback");
    }),
    (error) => error?.message === "school-assignment-draft-foundation-test-rollback",
  );
});

after(async () => {
  await prisma.$disconnect();
});
