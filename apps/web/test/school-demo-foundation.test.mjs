import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";

import { SYNTHETIC_DEMO_SCHOOL_SEED } from "../../api/prisma/seed.mjs";
import { parseSchoolDemoSnapshotResponse } from "../lib/school-demo-contract.ts";
import {
  SchoolDemoClassDetailView,
  SchoolDemoCompactSummaryView,
  SchoolDemoDashboardView,
  SchoolDemoHandoffPackView,
  SchoolDemoPilotChecklistView,
  SchoolDemoPilotConfigView,
  SchoolDemoRolloutView,
} from "../lib/school-demo-view.ts";

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
  const guidedDashboardHtml = renderToStaticMarkup(
    createElement(SchoolDemoDashboardView, {
      presentationStep: "teacher-assignments",
      snapshot,
    }),
  );
  const guidedDrilldownHtml = renderToStaticMarkup(
    createElement(SchoolDemoClassDetailView, {
      classCode: snapshot.classes[0].code,
      presentationStep: "class-drilldown",
      snapshot,
    }),
  );
  const compactSummaryHtml = renderToStaticMarkup(
    createElement(SchoolDemoCompactSummaryView, {
      snapshot,
    }),
  );
  const handoffPackHtml = renderToStaticMarkup(
    createElement(SchoolDemoHandoffPackView, {
      snapshot,
    }),
  );
  const pilotChecklistHtml = renderToStaticMarkup(
    createElement(SchoolDemoPilotChecklistView, {
      snapshot,
    }),
  );
  const pilotConfigHtml = renderToStaticMarkup(
    createElement(SchoolDemoPilotConfigView, {
      snapshot,
    }),
  );
  const rolloutHtml = renderToStaticMarkup(
    createElement(SchoolDemoRolloutView, {
      snapshot,
    }),
  );
  const combinedHtml = `${guidedDashboardHtml}\n${guidedDrilldownHtml}\n${compactSummaryHtml}\n${handoffPackHtml}\n${pilotChecklistHtml}\n${pilotConfigHtml}\n${rolloutHtml}`;

  for (const phrase of [
    "Presentation route",
    "Guided mode",
    "Guided walkthrough",
    "Presentation script",
    "Compact summary",
    "School demo compact summary",
    "Teacher handoff pack",
    "School demo pilot checklist",
    "School demo pilot config preview",
    "What the demo shows",
    "Synthetic boundary",
    "School rollout checklist",
    "Pilot prerequisites",
    "What a school would later provide",
    "What remains synthetic",
    "FAQ and objections",
    "Next-step checklist",
    "School profile schema preview",
    "Supported class / subject layout",
    "Teacher role placeholders",
    "Rollout assumptions",
    "What will be configurable later",
    "What stays demo-only",
    "Pilot readiness checklist",
    "Rollout preview",
    "Pilot phases by week",
    "Onboarding roles and responsibilities",
    "Synthetic data import assumptions",
    "Manual fallback path",
    "Support / escalation path",
    "Pilot success criteria",
    "Demo-only versus real later",
    "Rollout readiness checklist",
    "Current page",
    "Overview",
    "Classes",
    "Teacher assignments",
    "License / entitlements",
    "Compact summary",
    "Handoff pack",
    "Pilot checklist",
    "Pilot config preview",
    "Class counts / roster snapshot",
    "Read-only boundary",
    "Overview",
    "Classes",
    "Teacher assignments",
    "License / entitlements",
    "Class drilldown",
  ]) {
    assert.equal(combinedHtml.includes(phrase), true, phrase);
  }
  assert.equal(combinedHtml.includes("Guided mode"), true);
  for (const className of [
    "school-demo-shell",
    "school-demo-page-header",
    "school-demo-status-strip",
    "school-demo-guided-walkthrough",
    "school-demo-guided-list",
    "school-demo-guided-step",
    "school-demo-guided-step-surface",
    "school-demo-guided-footnote",
    "school-demo-presentation-flow",
    "school-demo-step-nav",
    "school-demo-step-link",
    "school-demo-summary-shell",
    "school-demo-summary-status-strip",
    "school-demo-summary-grid",
    "school-demo-compact-kpi-grid",
    "school-demo-kpi-grid",
    "school-demo-panel",
    "school-demo-table",
    "school-demo-theme-toggle",
    "school-demo-guided-copy",
    "school-demo-guided-lead",
    "school-demo-guided-boundary",
    "school-demo-handoff-teaser",
    "school-demo-note-list",
  ]) {
    assert.equal(combinedHtml.includes(className), true, className);
  }
  assert.match(combinedHtml, /data-school-demo-theme="light"/);
  assert.match(combinedHtml, /data-school-demo-transition="idle"/);
  assert.match(combinedHtml, /aria-pressed="false"/);
  assert.match(combinedHtml, /aria-current="step"/);
  assert.match(combinedHtml, /<table/);
  assert.match(combinedHtml, /<th scope="col"/);
  assert.match(guidedDashboardHtml, /href="\/school-demo\?step=overview#school-demo-summary"/);
  assert.match(guidedDashboardHtml, /href="\/school-demo\?step=classes#school-demo-classes"/);
  assert.match(
    guidedDashboardHtml,
    /href="\/school-demo\?step=teacher-assignments#school-demo-teachers"/,
  );
  assert.match(guidedDashboardHtml, /href="\/school-demo\?step=license#school-demo-boundary"/);
  assert.match(guidedDashboardHtml, /href="\/school-demo\/summary"/);
  assert.match(guidedDashboardHtml, /href="\/school-demo\/pilot"/);
  assert.match(
    guidedDashboardHtml,
    /href="\/school-demo\/classes\/[^"]+\?step=class-drilldown#school-demo-class-roster"/,
  );
  assert.match(compactSummaryHtml, /href="\/school-demo\?step=overview#school-demo-summary"/);
  assert.match(compactSummaryHtml, /href="\/school-demo\/handoff"/);
  assert.match(compactSummaryHtml, /href="\/school-demo\/pilot"/);
  assert.match(compactSummaryHtml, /Guided walkthrough/);
  assert.match(compactSummaryHtml, /Presentation script/);
  assert.match(compactSummaryHtml, /Full walkthrough/);
  assert.match(compactSummaryHtml, /Synthetic boundary/);
  assert.match(compactSummaryHtml, /Mutations/);
  assert.match(handoffPackHtml, /href="\/school-demo\/summary"/);
  assert.match(handoffPackHtml, /href="\/school-demo\/pilot"/);
  assert.match(handoffPackHtml, /href="\/school-demo\/pilot-config"/);
  assert.match(handoffPackHtml, /href="\/school-demo\/rollout"/);
  assert.match(handoffPackHtml, /School demo handoff pack/);
  assert.match(handoffPackHtml, /Guided walkthrough/);
  assert.match(handoffPackHtml, /Presentation script/);
  assert.match(handoffPackHtml, /What the demo shows/);
  assert.match(handoffPackHtml, /Synthetic boundary/);
  assert.match(handoffPackHtml, /School rollout checklist/);
  assert.match(pilotChecklistHtml, /href="\/school-demo\/handoff"/);
  assert.match(pilotChecklistHtml, /href="\/school-demo\/summary"/);
  assert.match(pilotChecklistHtml, /href="\/school-demo\/pilot-config"/);
  assert.match(pilotChecklistHtml, /href="\/school-demo\/rollout"/);
  assert.match(pilotChecklistHtml, /School demo pilot checklist/);
  assert.match(pilotChecklistHtml, /Pilot prerequisites/);
  assert.match(pilotChecklistHtml, /What a school would later provide/);
  assert.match(pilotChecklistHtml, /What the demo already shows/);
  assert.match(pilotChecklistHtml, /What remains synthetic/);
  assert.match(pilotChecklistHtml, /FAQ and objections/);
  assert.match(pilotChecklistHtml, /Next-step checklist/);
  assert.match(pilotConfigHtml, /href="\/school-demo\/pilot"/);
  assert.match(pilotConfigHtml, /href="\/school-demo\/handoff"/);
  assert.match(pilotConfigHtml, /href="\/school-demo\/rollout"/);
  assert.match(pilotConfigHtml, /School demo pilot config preview/);
  assert.match(pilotConfigHtml, /School profile schema preview/);
  assert.match(pilotConfigHtml, /Supported class \/ subject layout/);
  assert.match(pilotConfigHtml, /Teacher role placeholders/);
  assert.match(pilotConfigHtml, /Rollout assumptions/);
  assert.match(pilotConfigHtml, /What will be configurable later/);
  assert.match(pilotConfigHtml, /What stays demo-only/);
  assert.match(pilotConfigHtml, /Pilot readiness checklist/);
  assert.match(pilotChecklistHtml, /Named design partners/);
  assert.match(pilotChecklistHtml, /Legal basis/);
  assert.match(pilotChecklistHtml, /CSV\/XLSX/);
  assert.match(rolloutHtml, /href="\/school-demo\/pilot-config"/);
  assert.match(rolloutHtml, /href="\/school-demo\/handoff"/);
  assert.match(rolloutHtml, /href="\/school-demo\/pilot"/);
  assert.match(rolloutHtml, /School demo rollout preview/);
  assert.match(rolloutHtml, /Pilot phases by week/);
  assert.match(rolloutHtml, /Onboarding roles and responsibilities/);
  assert.match(rolloutHtml, /Synthetic data import assumptions/);
  assert.match(rolloutHtml, /Manual fallback path/);
  assert.match(rolloutHtml, /Support \/ escalation path/);
  assert.match(rolloutHtml, /Pilot success criteria/);
  assert.match(rolloutHtml, /Demo-only versus real later/);
  assert.match(rolloutHtml, /Rollout readiness checklist/);
  assert.match(guidedDrilldownHtml, /href="\/school-demo\?step=overview#school-demo-summary"/);
  assert.match(
    guidedDrilldownHtml,
    /href="\/school-demo\/classes\/[^"]+\?step=class-drilldown#school-demo-class-roster"/,
  );
  assert.match(
    guidedDrilldownHtml,
    /href="\/school-demo\?step=teacher-assignments#school-demo-teachers"/,
  );
  assert.match(guidedDrilldownHtml, /href="\/school-demo\?step=license#school-demo-boundary"/);
  assert.match(combinedHtml, /aria-labelledby="school-demo-summary-title"/);
  assert.match(combinedHtml, /aria-labelledby="school-demo-class-roster-title"/);
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
  const summaryPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "summary", "page.tsx"),
    "utf8",
  );
  const handoffPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "handoff", "page.tsx"),
    "utf8",
  );
  const pilotPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "pilot", "page.tsx"),
    "utf8",
  );
  const pilotConfigPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "pilot-config", "page.tsx"),
    "utf8",
  );
  const rolloutPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "rollout", "page.tsx"),
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
  const cssSource = fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");

  assert.equal(appSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(appSource.includes("SchoolDemoDashboardView"), true);
  assert.equal(appSource.includes("searchParams"), true);
  assert.equal(appSource.includes("presentationStep"), true);
  assert.equal(appSource.includes("normalizeSchoolDemoPresentationStep"), true);
  assert.equal(appSource.includes('href="/"'), true);
  assert.equal(appSource.includes("/school-demo/summary"), false);
  assert.equal(classPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(classPageSource.includes("SchoolDemoClassDetailView"), true);
  assert.equal(classPageSource.includes("searchParams"), true);
  assert.equal(classPageSource.includes("presentationStep"), true);
  assert.equal(classPageSource.includes("normalizeSchoolDemoPresentationStep"), true);
  assert.equal(classPageSource.includes("notFound()"), true);
  assert.equal(summaryPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(summaryPageSource.includes("SchoolDemoCompactSummaryView"), true);
  assert.equal(summaryPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(handoffPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(handoffPageSource.includes("SchoolDemoHandoffPackView"), true);
  assert.equal(handoffPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(pilotPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(pilotPageSource.includes("SchoolDemoPilotChecklistView"), true);
  assert.equal(pilotPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(pilotConfigPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(pilotConfigPageSource.includes("SchoolDemoPilotConfigView"), true);
  assert.equal(pilotConfigPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(rolloutPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(rolloutPageSource.includes("SchoolDemoRolloutView"), true);
  assert.equal(rolloutPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(serviceSource.includes('"/demo/school-snapshot"'), true);
  assert.equal(viewSource.includes("SchoolDemoThemeToggle"), true);
  assert.equal(viewSource.includes("SchoolDemoCompactSummaryView"), true);
  assert.equal(viewSource.includes("SchoolDemoHandoffPackView"), true);
  assert.equal(viewSource.includes("SchoolDemoPilotChecklistView"), true);
  assert.equal(viewSource.includes("SchoolDemoPilotConfigView"), true);
  assert.equal(viewSource.includes("SchoolDemoRolloutView"), true);
  assert.equal(viewSource.includes("school-demo-summary-shell"), true);
  assert.equal(viewSource.includes("school-demo-summary-status-strip"), true);
  assert.equal(viewSource.includes("school-demo-compact-kpi-grid"), true);
  assert.equal(viewSource.includes("school-demo-handoff-teaser"), true);
  assert.equal(viewSource.includes("school-demo-handoff-demo"), true);
  assert.equal(viewSource.includes("school-demo-handoff-boundary"), true);
  assert.equal(viewSource.includes("school-demo-handoff-checklist"), true);
  assert.equal(viewSource.includes("school-demo-pilot-prerequisites"), true);
  assert.equal(viewSource.includes("school-demo-pilot-later-data"), true);
  assert.equal(viewSource.includes("school-demo-pilot-demo-shows"), true);
  assert.equal(viewSource.includes("school-demo-pilot-synthetic"), true);
  assert.equal(viewSource.includes("school-demo-pilot-faq"), true);
  assert.equal(viewSource.includes("school-demo-pilot-next-steps"), true);
  assert.equal(viewSource.includes("school-demo-pilot-config-profile"), true);
  assert.equal(viewSource.includes("school-demo-pilot-config-layout"), true);
  assert.equal(viewSource.includes("school-demo-pilot-config-roles"), true);
  assert.equal(viewSource.includes("school-demo-pilot-config-rollout"), true);
  assert.equal(viewSource.includes("school-demo-pilot-config-later"), true);
  assert.equal(viewSource.includes("school-demo-pilot-config-boundary"), true);
  assert.equal(viewSource.includes("school-demo-pilot-config-checklist"), true);
  assert.equal(viewSource.includes("school-demo-rollout-phases"), true);
  assert.equal(viewSource.includes("school-demo-rollout-roles"), true);
  assert.equal(viewSource.includes("school-demo-rollout-imports"), true);
  assert.equal(viewSource.includes("school-demo-rollout-fallback"), true);
  assert.equal(viewSource.includes("school-demo-rollout-support"), true);
  assert.equal(viewSource.includes("school-demo-rollout-success"), true);
  assert.equal(viewSource.includes("school-demo-rollout-boundary"), true);
  assert.equal(viewSource.includes("school-demo-rollout-checklist"), true);
  assert.equal(cssSource.includes(".school-demo-handoff-teaser"), true);
  assert.equal(cssSource.includes(".school-demo-note-list"), true);
  assert.equal(viewSource.includes("Compact one-screen read-only snapshot"), true);
  assert.equal(viewSource.includes("renderPresentationFlow"), true);
  assert.equal(viewSource.includes("renderGuidedWalkthrough"), true);
  assert.equal(viewSource.includes("buildGuidedWalkthroughSteps"), true);
  assert.equal(viewSource.includes("school-demo-presentation-flow"), true);
  assert.equal(viewSource.includes("school-demo-presentation-state"), true);
  assert.equal(viewSource.includes("Guided mode"), true);
  assert.equal(viewSource.includes("Guided walkthrough"), true);
  assert.equal(viewSource.includes("Presentation script"), true);
  assert.equal(viewSource.includes("aria-current"), true);
  assert.equal(viewSource.includes("step=overview#school-demo-summary"), true);
  assert.equal(viewSource.includes("step=class-drilldown#school-demo-class-roster"), true);
  assert.equal(viewSource.includes("/school-demo/pilot-config"), true);
  assert.equal(viewSource.includes("/school-demo/rollout"), true);
  assert.equal(viewSource.includes("school-demo-guided-walkthrough"), true);
  assert.equal(viewSource.includes("school-demo-guided-list"), true);
  assert.equal(viewSource.includes("school-demo-guided-step"), true);
  assert.equal(viewSource.includes("school-demo-guided-step-surface"), true);
  assert.equal(viewSource.includes("school-demo-guided-boundary"), true);
  assert.equal(viewSource.includes("school-demo-guided-footnote"), true);
  assert.equal(cssSource.includes(".school-demo-shell"), true);
  assert.equal(cssSource.includes(".school-demo-presentation-flow"), true);
  assert.equal(cssSource.includes(".school-demo-step-nav"), true);
  assert.equal(cssSource.includes(".school-demo-step-link"), true);
  assert.equal(cssSource.includes(".school-demo-guided-list"), true);
  assert.equal(cssSource.includes(".school-demo-guided-step"), true);
  assert.equal(cssSource.includes(".school-demo-guided-lead"), true);
  assert.equal(cssSource.includes(".school-demo-guided-step-surface"), true);
  assert.equal(cssSource.includes(".school-demo-guided-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-guided-footnote"), true);
  assert.equal(cssSource.includes(".school-demo-summary-shell"), true);
  assert.equal(cssSource.includes(".school-demo-summary-status-strip"), true);
  assert.equal(cssSource.includes(".school-demo-compact-kpi-grid"), true);
  assert.equal(cssSource.includes("@media print"), true);
  assert.equal(cssSource.includes("#1d4ed8"), true);
  assert.equal(cssSource.includes("#f8fafc"), true);
  assert.equal(cssSource.includes("#ffffff"), true);
  assert.equal(cssSource.includes('data-school-demo-theme="dark"'), true);
  assert.equal(cssSource.includes("radial-gradient"), true);
  assert.equal(cssSource.includes("prefers-reduced-motion"), true);
  assert.equal(viewSource.includes('"use client"'), true);
  assert.equal(viewSource.includes("learnika.schoolDemo.theme.v1"), true);
  assert.equal(viewSource.includes("localStorage"), true);
  assert.equal(viewSource.includes("schoolDemoTheme"), true);
  assert.equal(viewSource.includes("aria-pressed"), true);
  assert.equal(viewSource.includes("data-theme-state"), true);
  assert.equal(viewSource.includes("/school-demo/handoff"), true);
  assert.equal(viewSource.includes("/school-demo/pilot"), true);
  assert.equal(viewSource.includes("/school-demo/pilot-config"), true);
  assert.equal(viewSource.includes("document.cookie"), false);
  assert.equal(viewSource.includes("fetch("), false);

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
      `${appSource}\n${classPageSource}\n${summaryPageSource}\n${handoffPageSource}\n${pilotPageSource}\n${pilotConfigPageSource}\n${rolloutPageSource}\n${viewSource}`.includes(
        forbidden,
      ),
      false,
      forbidden,
    );
  }
  const visualSource = `${viewSource}\n${cssSource}`;
  for (const forbiddenVisual of [
    /linear-gradient/i,
    /\bpurple\b/i,
    /\bblob\b/i,
    /\borb\b/i,
    /\bhero\b/i,
    /\bmarketing-hero\b/i,
  ]) {
    assert.equal(forbiddenVisual.test(visualSource), false, forbiddenVisual.source);
  }
});

test("school demo presentation note stays local-only and synthetic", () => {
  const noteSource = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "..",
      "..",
      "docs",
      "wave-7-prep",
      "school-demo-presentation-flow.md",
    ),
    "utf8",
  );

  for (const expected of [
    "pnpm.cmd run infra:validate",
    "pnpm.cmd run db:migrate:deploy",
    "pnpm.cmd run db:seed",
    "/school-demo",
    "overview",
    "classes",
    "teacher assignments",
    "license/entitlements",
    "class drilldown",
    "synthetic demo codes",
    "do not change diagnostic readiness",
  ]) {
    assert.equal(noteSource.includes(expected), true, expected);
  }

  for (const forbidden of [
    "APPROVE WAVE 7",
    "real school beta is ready",
    "production records are authorized",
    "design partner approved",
  ]) {
    assert.equal(noteSource.includes(forbidden), false, forbidden);
  }
});
