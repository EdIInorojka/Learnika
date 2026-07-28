import path from "node:path";
import { URL, fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { loadLocalEnv } from "./local-env.mjs";

const currentFilePath = fileURLToPath(import.meta.url);

export const SYNTHETIC_DEMO_SCHOOL_SEED = Object.freeze({
  marker: "SYNTHETIC_NON_PRODUCTION",
  locale: "ru-RU",
  organization: {
    id: "70000000-0000-4000-8000-000000000001",
    code: "synthetic-demo-organization-ru-ru",
  },
  school: {
    id: "70000000-0000-4000-8000-000000000002",
    code: "synthetic-demo-school-ru-ru",
  },
  academicYear: {
    id: "70000000-0000-4000-8000-000000000003",
    code: "2026-2027-demo",
    startsOn: "2026-09-01T00:00:00.000Z",
    endsOn: "2027-05-31T00:00:00.000Z",
  },
  classes: [
    {
      id: "70000000-0000-4000-8000-000000000010",
      code: "7А",
      gradeLevel: 7,
    },
    {
      id: "70000000-0000-4000-8000-000000000011",
      code: "8А",
      gradeLevel: 8,
    },
    {
      id: "70000000-0000-4000-8000-000000000012",
      code: "9А",
      gradeLevel: 9,
    },
  ],
  subjectGroups: [
    {
      id: "70000000-0000-4000-8000-000000000020",
      code: "математика-7а",
      subjectCode: "math",
    },
    {
      id: "70000000-0000-4000-8000-000000000021",
      code: "математика-8а",
      subjectCode: "math",
    },
    {
      id: "70000000-0000-4000-8000-000000000022",
      code: "математика-9а",
      subjectCode: "math",
    },
  ],
  teachers: [
    {
      id: "70000000-0000-4000-8000-000000000030",
      demoCode: "синтетический-учитель-7",
    },
    {
      id: "70000000-0000-4000-8000-000000000031",
      demoCode: "синтетический-учитель-8",
    },
    {
      id: "70000000-0000-4000-8000-000000000032",
      demoCode: "синтетический-учитель-9",
    },
  ],
  students: [
    {
      id: "70000000-0000-4000-8000-000000000040",
      demoCode: "синтетический-ученик-7а-01",
      classId: "70000000-0000-4000-8000-000000000010",
    },
    {
      id: "70000000-0000-4000-8000-000000000041",
      demoCode: "синтетический-ученик-7а-02",
      classId: "70000000-0000-4000-8000-000000000010",
    },
    {
      id: "70000000-0000-4000-8000-000000000042",
      demoCode: "синтетический-ученик-8а-01",
      classId: "70000000-0000-4000-8000-000000000011",
    },
    {
      id: "70000000-0000-4000-8000-000000000043",
      demoCode: "синтетический-ученик-8а-02",
      classId: "70000000-0000-4000-8000-000000000011",
    },
    {
      id: "70000000-0000-4000-8000-000000000044",
      demoCode: "синтетический-ученик-9а-01",
      classId: "70000000-0000-4000-8000-000000000012",
    },
    {
      id: "70000000-0000-4000-8000-000000000045",
      demoCode: "синтетический-ученик-9а-02",
      classId: "70000000-0000-4000-8000-000000000012",
    },
  ],
  assignments: [
    {
      id: "70000000-0000-4000-8000-000000000050",
      classId: "70000000-0000-4000-8000-000000000010",
      subjectGroupId: "70000000-0000-4000-8000-000000000020",
      teacherId: "70000000-0000-4000-8000-000000000030",
    },
    {
      id: "70000000-0000-4000-8000-000000000051",
      classId: "70000000-0000-4000-8000-000000000011",
      subjectGroupId: "70000000-0000-4000-8000-000000000021",
      teacherId: "70000000-0000-4000-8000-000000000031",
    },
    {
      id: "70000000-0000-4000-8000-000000000052",
      classId: "70000000-0000-4000-8000-000000000012",
      subjectGroupId: "70000000-0000-4000-8000-000000000022",
      teacherId: "70000000-0000-4000-8000-000000000032",
    },
  ],
  license: {
    id: "70000000-0000-4000-8000-000000000070",
    licenseCode: "synthetic-demo-license-ru-ru",
    status: "PLANNED",
  },
  entitlements: [
    {
      id: "70000000-0000-4000-8000-000000000080",
      capabilityCode: "synthetic-demo-school-tenancy",
    },
    {
      id: "70000000-0000-4000-8000-000000000081",
      capabilityCode: "synthetic-demo-roster-foundation",
    },
    {
      id: "70000000-0000-4000-8000-000000000082",
      capabilityCode: "synthetic-demo-assignment-planning",
    },
  ],
});

export function isApprovedSyntheticSeedDatabase(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    return (
      parsed.protocol === "postgresql:" &&
      ["127.0.0.1", "localhost"].includes(parsed.hostname) &&
      parsed.pathname === "/learnika_local"
    );
  } catch {
    return false;
  }
}

function updateWithoutId(record) {
  return Object.fromEntries(Object.entries(record).filter(([key]) => key !== "id"));
}

export async function seedSyntheticDemoSchool(prisma) {
  const seed = SYNTHETIC_DEMO_SCHOOL_SEED;
  const schoolId = seed.school.id;
  const academicYearId = seed.academicYear.id;

  await prisma.$transaction(async (tx) => {
    await tx.schoolOrganization.upsert({
      where: { id: seed.organization.id },
      create: seed.organization,
      update: { code: seed.organization.code },
    });
    await tx.school.upsert({
      where: { id: schoolId },
      create: {
        ...seed.school,
        organizationId: seed.organization.id,
      },
      update: {
        organizationId: seed.organization.id,
        code: seed.school.code,
      },
    });
    await tx.academicYear.upsert({
      where: { id: academicYearId },
      create: {
        ...seed.academicYear,
        schoolId,
        startsOn: new Date(seed.academicYear.startsOn),
        endsOn: new Date(seed.academicYear.endsOn),
      },
      update: {
        schoolId,
        code: seed.academicYear.code,
        startsOn: new Date(seed.academicYear.startsOn),
        endsOn: new Date(seed.academicYear.endsOn),
      },
    });

    for (const schoolClass of seed.classes) {
      await tx.schoolClass.upsert({
        where: { id: schoolClass.id },
        create: {
          ...schoolClass,
          schoolId,
          academicYearId,
        },
        update: {
          ...updateWithoutId(schoolClass),
          schoolId,
          academicYearId,
        },
      });
    }

    for (const subjectGroup of seed.subjectGroups) {
      await tx.schoolSubjectGroup.upsert({
        where: { id: subjectGroup.id },
        create: {
          ...subjectGroup,
          schoolId,
        },
        update: {
          ...updateWithoutId(subjectGroup),
          schoolId,
        },
      });
    }

    for (const teacher of seed.teachers) {
      await tx.schoolTeacher.upsert({
        where: { id: teacher.id },
        create: {
          ...teacher,
          schoolId,
        },
        update: {
          demoCode: teacher.demoCode,
          schoolId,
        },
      });
    }

    for (const student of seed.students) {
      await tx.schoolStudent.upsert({
        where: { id: student.id },
        create: {
          id: student.id,
          schoolId,
          demoCode: student.demoCode,
        },
        update: {
          schoolId,
          demoCode: student.demoCode,
        },
      });
    }

    for (const assignment of seed.assignments) {
      await tx.teacherAssignment.upsert({
        where: { id: assignment.id },
        create: {
          id: assignment.id,
          schoolId,
          schoolClassId: assignment.classId,
          subjectGroupId: assignment.subjectGroupId,
          schoolTeacherId: assignment.teacherId,
        },
        update: {
          schoolId,
          schoolClassId: assignment.classId,
          subjectGroupId: assignment.subjectGroupId,
          schoolTeacherId: assignment.teacherId,
        },
      });
    }

    for (const student of seed.students) {
      const enrollmentId = student.id.replace(/004([0-5])$/, "006$1");
      await tx.studentEnrollment.upsert({
        where: { id: enrollmentId },
        create: {
          id: enrollmentId,
          schoolId,
          schoolClassId: student.classId,
          schoolStudentId: student.id,
          enrolledAt: new Date(seed.academicYear.startsOn),
          withdrawnAt: null,
        },
        update: {
          schoolId,
          schoolClassId: student.classId,
          schoolStudentId: student.id,
          enrolledAt: new Date(seed.academicYear.startsOn),
          withdrawnAt: null,
        },
      });
    }

    await tx.schoolLicense.upsert({
      where: { id: seed.license.id },
      create: {
        ...seed.license,
        schoolId,
        validFrom: null,
        validUntil: null,
      },
      update: {
        schoolId,
        licenseCode: seed.license.licenseCode,
        status: seed.license.status,
        validFrom: null,
        validUntil: null,
      },
    });

    for (const entitlement of seed.entitlements) {
      await tx.schoolEntitlement.upsert({
        where: { id: entitlement.id },
        create: {
          ...entitlement,
          schoolId,
          licenseId: seed.license.id,
        },
        update: {
          schoolId,
          licenseId: seed.license.id,
          capabilityCode: entitlement.capabilityCode,
        },
      });
    }
  });

  return {
    marker: seed.marker,
    locale: seed.locale,
    organizationCount: 1,
    schoolCount: 1,
    academicYearCount: 1,
    classCount: seed.classes.length,
    subjectGroupCount: seed.subjectGroups.length,
    teacherCount: seed.teachers.length,
    studentCount: seed.students.length,
    assignmentCount: seed.assignments.length,
    enrollmentCount: seed.students.length,
    licenseCount: 1,
    entitlementCount: seed.entitlements.length,
  };
}

async function main() {
  const env = loadLocalEnv();
  const databaseUrl = env.DATABASE_URL;

  if (!isApprovedSyntheticSeedDatabase(databaseUrl)) {
    console.error(
      "[db:seed] BLOCK: synthetic demo seed may run only against the local learnika_local database.",
    );
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const summary = await seedSyntheticDemoSchool(prisma);
    console.log(
      `[db:seed] ${summary.marker} ${summary.locale} school seeded: ${summary.classCount} classes, ${summary.teacherCount} teachers, ${summary.studentCount} students.`,
    );
  } catch {
    console.error("[db:seed] Synthetic demo school seed failed.");
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  await main();
}
