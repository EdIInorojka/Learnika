import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { parseSchoolDemoSnapshotResponse } from "../lib/school-demo-contract.ts";

test("school demo snapshot parser projects safe synthetic read-only data", () => {
  const snapshot = parseSchoolDemoSnapshotResponse({
    data: {
      snapshot: {
        academicYear: {
          code: "2026-2027-demo",
          endsOn: "2027-05-31",
          startsOn: "2026-09-01",
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
        classes: [
          {
            code: "7A",
            gradeLevel: 7,
            studentCount: 2,
            subjectGroupCodes: ["7A-math"],
            teacherDemoCodes: ["teacher-7"],
          },
        ],
        entitlements: [{ capabilityCode: "assignment-delivery" }],
        license: {
          entitlementCount: 1,
          licenseCode: "demo-school-license",
          status: "PLANNED",
          validFrom: null,
          validUntil: null,
        },
        locale: "ru-RU",
        marker: "SYNTHETIC_NON_PRODUCTION",
        organization: { code: "synthetic-demo-organization-ru-ru", schoolCount: 1 },
        school: { code: "synthetic-demo-school-ru-ru" },
        studentEnrollments: [
          { classCode: "7A", state: "ENROLLED", studentDemoCode: "student-7-1" },
        ],
        students: [{ classCode: "7A", demoCode: "student-7-1", enrollmentState: "ENROLLED" }],
        subjectGroups: [{ code: "7A-math", subjectCode: "math" }],
        teacherAssignments: [
          { classCode: "7A", subjectGroupCode: "7A-math", teacherDemoCode: "teacher-7" },
        ],
        teachers: [{ assignmentCount: 1, demoCode: "teacher-7" }],
      },
    },
  });
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
            academicYear: {
              code: "2026-2027-demo",
              endsOn: "2027-05-31",
              startsOn: "2026-09-01",
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
            classes: [],
            entitlements: [],
            license: {
              entitlementCount: 0,
              licenseCode: "demo-school-license",
              status: "PLANNED",
              validFrom: null,
              validUntil: null,
            },
            locale: "ru-RU",
            marker: "SYNTHETIC_NON_PRODUCTION",
            organization: { code: "synthetic-demo-organization-ru-ru", schoolCount: 1 },
            school: { code: "synthetic-demo-school-ru-ru" },
            studentEnrollments: [],
            students: [
              {
                classCode: "7A",
                demoCode: "student-7-1@example.test",
                enrollmentState: "ENROLLED",
              },
            ],
            subjectGroups: [],
            teacherAssignments: [],
            teachers: [],
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
            academicYear: {
              code: "2026-2027-demo",
              endsOn: "2027-05-31",
              startsOn: "2026-09-01",
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
            classes: [],
            entitlements: [],
            license: {
              entitlementCount: 0,
              licenseCode: "demo-school-license",
              status: "PLANNED",
              validFrom: null,
              validUntil: null,
            },
            locale: "ru-RU",
            marker: "SYNTHETIC_NON_PRODUCTION",
            organization: { code: "synthetic-demo-organization-ru-ru", schoolCount: 1 },
            school: { code: "synthetic-demo-school-ru-ru" },
            studentEnrollments: [],
            students: [],
            subjectGroups: [],
            teacherAssignments: [],
            teachers: [],
            userId: "11111111-1111-4111-8111-111111111111",
          },
        },
      }),
    /unsafe field/,
  );
});

test("school demo route is read-only and display-only", async () => {
  const appSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "page.tsx"),
    "utf8",
  );
  const serviceSource = fs.readFileSync(
    path.join(process.cwd(), "lib", "school-demo-service.server.ts"),
    "utf8",
  );
  assert.equal(appSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(appSource.includes('href="/"'), true);
  assert.equal(serviceSource.includes('"/demo/school-snapshot"'), true);
  for (const forbidden of ["POST", "PUT", "PATCH", "DELETE", "form action", "authError"]) {
    assert.equal(appSource.includes(forbidden), false, forbidden);
  }
});
