import assert from "node:assert/strict";
import { after, test } from "node:test";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  SYNTHETIC_DEMO_SCHOOL_SEED,
  isApprovedSyntheticSeedDatabase,
  seedSyntheticDemoSchool,
} from "../prisma/seed.mjs";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://learnika_local:learnika_local_password@127.0.0.1:5432/learnika_local";

process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

function collectKeys(value, keys = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys);
    return keys;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      keys.push(key);
      collectKeys(child, keys);
    }
  }
  return keys;
}

async function readSeedSnapshot() {
  const seed = SYNTHETIC_DEMO_SCHOOL_SEED;
  return prisma.school.findUniqueOrThrow({
    where: { id: seed.school.id },
    select: {
      id: true,
      organizationId: true,
      code: true,
      academicYears: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          schoolId: true,
          code: true,
          startsOn: true,
          endsOn: true,
        },
      },
      classes: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          schoolId: true,
          academicYearId: true,
          code: true,
          gradeLevel: true,
        },
      },
      subjectGroups: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          schoolId: true,
          code: true,
          subjectCode: true,
        },
      },
      teachers: {
        orderBy: { id: "asc" },
        select: { id: true, schoolId: true, demoCode: true },
      },
      students: {
        orderBy: { id: "asc" },
        select: { id: true, schoolId: true, demoCode: true },
      },
      assignments: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          schoolId: true,
          schoolClassId: true,
          subjectGroupId: true,
          schoolTeacherId: true,
        },
      },
      enrollments: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          schoolId: true,
          schoolClassId: true,
          schoolStudentId: true,
          enrolledAt: true,
          withdrawnAt: true,
        },
      },
      licenses: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          schoolId: true,
          licenseCode: true,
          status: true,
          validFrom: true,
          validUntil: true,
        },
      },
      entitlements: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          schoolId: true,
          licenseId: true,
          capabilityCode: true,
        },
      },
    },
  });
}

test("synthetic demo seed is deterministic, PII-safe and local-only", () => {
  const seed = SYNTHETIC_DEMO_SCHOOL_SEED;
  const serialized = JSON.stringify(seed);
  const keys = collectKeys(seed);

  assert.equal(seed.marker, "SYNTHETIC_NON_PRODUCTION");
  assert.equal(seed.locale, "ru-RU");
  assert.deepEqual(
    seed.classes.map(({ code, gradeLevel }) => ({ code, gradeLevel })),
    [
      { code: "7А", gradeLevel: 7 },
      { code: "8А", gradeLevel: 8 },
      { code: "9А", gradeLevel: 9 },
    ],
  );
  assert.equal(seed.license.status, "PLANNED");
  assert.equal(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https?:\/\/|\+7[\s()-]*\d/i.test(serialized), false);
  assert.equal(
    keys.some((key) =>
      ["email", "phone", "address", "userId", "familyId", "childProfileId"].includes(key),
    ),
    false,
  );
  assert.equal(isApprovedSyntheticSeedDatabase(databaseUrl), true);
  assert.equal(isApprovedSyntheticSeedDatabase("postgresql://example.invalid/learnika"), false);
  assert.equal(isApprovedSyntheticSeedDatabase("not-a-database-url"), false);
});

test("synthetic demo seed is idempotent and preserves school tenant isolation", async () => {
  const seed = SYNTHETIC_DEMO_SCHOOL_SEED;
  const firstSummary = await seedSyntheticDemoSchool(prisma);
  const firstSnapshot = await readSeedSnapshot();
  const secondSummary = await seedSyntheticDemoSchool(prisma);
  const secondSnapshot = await readSeedSnapshot();

  assert.deepEqual(secondSummary, firstSummary);
  assert.deepEqual(secondSnapshot, firstSnapshot);
  assert.equal(secondSnapshot.academicYears.length, 1);
  assert.equal(secondSnapshot.classes.length, 3);
  assert.equal(secondSnapshot.subjectGroups.length, 3);
  assert.equal(secondSnapshot.teachers.length, 3);
  assert.equal(secondSnapshot.students.length, 6);
  assert.equal(secondSnapshot.assignments.length, 3);
  assert.equal(secondSnapshot.enrollments.length, 6);
  assert.equal(secondSnapshot.licenses.length, 1);
  assert.equal(secondSnapshot.entitlements.length, 3);

  for (const record of [
    ...secondSnapshot.academicYears,
    ...secondSnapshot.classes,
    ...secondSnapshot.subjectGroups,
    ...secondSnapshot.teachers,
    ...secondSnapshot.students,
    ...secondSnapshot.assignments,
    ...secondSnapshot.enrollments,
    ...secondSnapshot.licenses,
    ...secondSnapshot.entitlements,
  ]) {
    assert.equal(record.schoolId, seed.school.id);
  }

  const classIds = new Set(secondSnapshot.classes.map(({ id }) => id));
  const subjectGroupIds = new Set(secondSnapshot.subjectGroups.map(({ id }) => id));
  const teacherIds = new Set(secondSnapshot.teachers.map(({ id }) => id));
  const studentIds = new Set(secondSnapshot.students.map(({ id }) => id));
  const licenseIds = new Set(secondSnapshot.licenses.map(({ id }) => id));

  for (const assignment of secondSnapshot.assignments) {
    assert.equal(classIds.has(assignment.schoolClassId), true);
    assert.equal(subjectGroupIds.has(assignment.subjectGroupId), true);
    assert.equal(teacherIds.has(assignment.schoolTeacherId), true);
  }
  for (const enrollment of secondSnapshot.enrollments) {
    assert.equal(classIds.has(enrollment.schoolClassId), true);
    assert.equal(studentIds.has(enrollment.schoolStudentId), true);
  }
  for (const entitlement of secondSnapshot.entitlements) {
    assert.equal(licenseIds.has(entitlement.licenseId), true);
  }

  const participantIds = [...teacherIds, ...studentIds];
  const [userCount, familyCount, childProfileCount] = await Promise.all([
    prisma.user.count({ where: { id: { in: participantIds } } }),
    prisma.family.count({ where: { id: { in: participantIds } } }),
    prisma.childProfile.count({ where: { id: { in: participantIds } } }),
  ]);
  assert.deepEqual([userCount, familyCount, childProfileCount], [0, 0, 0]);
});

after(async () => {
  await prisma.$disconnect();
});
