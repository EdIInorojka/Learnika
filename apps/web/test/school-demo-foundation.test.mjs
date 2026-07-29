import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";

import { SYNTHETIC_DEMO_SCHOOL_SEED } from "../../api/prisma/seed.mjs";
import { parseSchoolDemoSnapshotResponse } from "../lib/school-demo-contract.ts";
import { SchoolDemoClassDetailView, SchoolDemoDashboardView } from "../lib/school-demo-view.ts";

function buildSnapshotFixture() {
  const seed = SYNTHETIC_DEMO_SCHOOL_SEED;
  const teacherById = new Map(seed.teachers.map((teacher) => [teacher.id, teacher]));
  const subjectGroupById = new Map(
    seed.subjectGroups.map((subjectGroup) => [subjectGroup.id, subjectGroup]),
  );
  const classCodeById = new Map(
    seed.classes.map((schoolClass) => [schoolClass.id, schoolClass.code]),
  );
  return {
    academicYear: {
      code: seed.academicYear.code,
      endsOn: seed.academicYear.endsOn.slice(0, 10),
      startsOn: seed.academicYear.startsOn.slice(0, 10),
    },
    boundary: {
      activation: "BLOCKED",
      familyLinkCount: 0,
      mutationAllowed: false,
      productionDataCount: 0,
      readiness: "NOT_READY",
      realSchoolCount: 0,
      workflow: "INACTIVE",
    },
    classes: seed.classes.map((schoolClass) => ({
      code: schoolClass.code,
      gradeLevel: schoolClass.gradeLevel,
      studentCount: seed.students.filter((student) => student.classId === schoolClass.id).length,
      subjectGroupCodes: seed.assignments
        .filter((assignment) => assignment.classId === schoolClass.id)
        .map((assignment) => subjectGroupById.get(assignment.subjectGroupId)?.code)
        .filter(Boolean),
      teacherDemoCodes: seed.assignments
        .filter((assignment) => assignment.classId === schoolClass.id)
        .map((assignment) => teacherById.get(assignment.teacherId)?.demoCode)
        .filter(Boolean),
    })),
    entitlements: seed.entitlements.map((entitlement) => ({
      capabilityCode: entitlement.capabilityCode,
    })),
    license: {
      entitlementCount: seed.entitlements.length,
      licenseCode: seed.license.licenseCode,
      status: "PLANNED",
      validFrom: null,
      validUntil: null,
    },
    locale: seed.locale,
    marker: seed.marker,
    organization: {
      code: seed.organization.code,
      schoolCount: 1,
    },
    school: {
      code: seed.school.code,
    },
    studentEnrollments: seed.students.map((student) => ({
      classCode: classCodeById.get(student.classId),
      state: "ENROLLED",
      studentDemoCode: student.demoCode,
    })),
    students: seed.students.map((student) => ({
      classCode: classCodeById.get(student.classId),
      demoCode: student.demoCode,
      enrollmentState: "ENROLLED",
    })),
    subjectGroups: seed.subjectGroups.map((subjectGroup) => ({
      code: subjectGroup.code,
      subjectCode: "math",
    })),
    teacherAssignments: seed.assignments.map((assignment) => ({
      classCode: classCodeById.get(assignment.classId),
      subjectGroupCode: subjectGroupById.get(assignment.subjectGroupId)?.code,
      teacherDemoCode: teacherById.get(assignment.teacherId)?.demoCode,
    })),
    teachers: seed.teachers.map((teacher) => ({
      assignmentCount: seed.assignments.filter((assignment) => assignment.teacherId === teacher.id)
        .length,
      demoCode: teacher.demoCode,
    })),
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function snapshotFixtureForContract() {
  const snapshot = buildSnapshotFixture();
  return parseSchoolDemoSnapshotResponse({ data: { snapshot } });
}

test("school demo snapshot parser projects safe synthetic read-only data", () => {
  const snapshot = snapshotFixtureForContract();
  assert.deepEqual(Object.keys(snapshot).sort(), [
    "academicYear",
    "boundary",
    "classes",
    "entitlements",
    "license",
    "locale",
    "marker",
    "organization",
    "school",
    "studentEnrollments",
    "students",
    "subjectGroups",
    "teacherAssignments",
    "teachers",
  ]);
  assert.equal(snapshot.boundary.readiness, "NOT_READY");
  assert.equal(snapshot.boundary.activation, "BLOCKED");
  assert.equal(snapshot.boundary.realSchoolCount, 0);
  assert.equal(snapshot.boundary.productionDataCount, 0);
});

test("school demo contract rejects unsafe identifiers and contact data", () => {
  assert.throws(
    () =>
      parseSchoolDemoSnapshotResponse({
        data: {
          snapshot: {
            ...buildSnapshotFixture(),
            students: [
              {
                classCode: "7A",
                demoCode: "student-7-1@example.test",
                enrollmentState: "ENROLLED",
              },
            ],
          },
        },
      }),
    /contact data/,
  );
  assert.throws(
    () =>
      parseSchoolDemoSnapshotResponse({
        data: {
          snapshot: {
            ...buildSnapshotFixture(),
            userId: "11111111-1111-4111-8111-111111111111",
          },
        },
      }),
    /unsafe field/,
  );
});

test("school demo dashboard and drilldown render the synthetic school overview", () => {
  const snapshot = snapshotFixtureForContract();
  const dashboardHtml = renderToStaticMarkup(createElement(SchoolDemoDashboardView, { snapshot }));
  const drilldownHtml = renderToStaticMarkup(
    createElement(SchoolDemoClassDetailView, {
      classCode: snapshot.classes[0].code,
      snapshot,
    }),
  );
  const combinedHtml = `${dashboardHtml}\n${drilldownHtml}`;

  for (const phrase of [
    "Демо школы",
    "Сводка школы",
    "Учительский обзор",
    "Классы и drilldown",
    "Список учеников",
    "Назначения учителей",
    "Границы и лицензия",
    "Лицензия",
    "Права",
  ]) {
    assert.equal(combinedHtml.includes(phrase), true, phrase);
  }
  assert.match(combinedHtml, /\/school-demo\/classes\//);
  assert.match(combinedHtml, new RegExp(escapeRegExp(snapshot.classes[0].code)));
  assert.equal(combinedHtml.includes("form"), false);
  assert.equal(combinedHtml.includes("POST"), false);
  assert.equal(combinedHtml.includes("PUT"), false);
  assert.equal(combinedHtml.includes("PATCH"), false);
  assert.equal(combinedHtml.includes("DELETE"), false);
});

test("school demo route is read-only and display-only", async () => {
  const appSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "page.tsx"),
    "utf8",
  );
  const classPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "classes", "[classCode]", "page.tsx"),
    "utf8",
  );
  const serviceSource = fs.readFileSync(
    path.join(process.cwd(), "lib", "school-demo-service.server.ts"),
    "utf8",
  );
  const viewSource = fs.readFileSync(
    path.join(process.cwd(), "lib", "school-demo-view.ts"),
    "utf8",
  );

  assert.equal(appSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(appSource.includes("SchoolDemoDashboardView"), true);
  assert.equal(appSource.includes('href="/"'), true);
  assert.equal(classPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(classPageSource.includes("SchoolDemoClassDetailView"), true);
  assert.equal(classPageSource.includes("notFound()"), true);
  assert.equal(serviceSource.includes('"/demo/school-snapshot"'), true);

  for (const forbidden of [
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "form action",
    "authError",
    "userId",
    "familyId",
    "childProfileId",
    "email",
    "phone",
    "address",
  ]) {
    assert.equal(
      `${appSource}\n${classPageSource}\n${viewSource}`.includes(forbidden),
      false,
      forbidden,
    );
  }
});
