import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";

import { SYNTHETIC_DEMO_SCHOOL_SEED } from "../../api/prisma/seed.mjs";
import { parseSchoolDemoSnapshotResponse } from "../lib/school-demo-contract.ts";
import {
  SchoolDemoAssignmentPreviewView,
  SchoolDemoClassDetailView,
  SchoolDemoCompactSummaryView,
  SchoolDemoDashboardView,
  SchoolDemoDeliveryPreviewView,
  SchoolDemoHandoffPackView,
  SchoolDemoImportPreviewView,
  SchoolDemoPilotChecklistView,
  SchoolDemoPilotConfigView,
  SchoolDemoRolloutView,
  SchoolDemoStudentPreviewView,
  buildSchoolDemoAssignmentDraftPreview,
  buildSchoolDemoDeliveryRehearsalPreview,
  buildSchoolDemoStudentDeliveryPreview,
  parseSchoolDemoRosterImportPreview,
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

test("school demo import preview parses only synthetic snapshot rows", () => {
  const snapshot = snapshotFixtureForContract();
  const student = snapshot.students[0];
  const teacherAssignment = snapshot.teacherAssignments[0];
  const validCsv = [
    "rowType,demoCode,classCode,subjectGroupCode",
    `student,${student.demoCode},${student.classCode},${teacherAssignment.subjectGroupCode}`,
    `teacher-assignment,${teacherAssignment.teacherDemoCode},${teacherAssignment.classCode},${teacherAssignment.subjectGroupCode}`,
  ].join("\n");
  const validPreview = parseSchoolDemoRosterImportPreview(validCsv, snapshot);

  assert.equal(validPreview.acceptedRows.length, 2);
  assert.equal(validPreview.rejectedRows.length, 0);
  assert.equal(validPreview.teacherAssignmentRows, 1);
  assert.equal(
    validPreview.classRows.some(
      (row) => row.classCode === student.classCode && row.acceptedStudentRows === 1,
    ),
    true,
  );
  assert.match(validPreview.warnings.join("\n"), /no upload, no server save/);

  const unsafeCsv = [
    "rowType,demoCode,classCode,subjectGroupCode",
    `student,person@example.test,${student.classCode},${teacherAssignment.subjectGroupCode}`,
    `student,${student.demoCode},unknown-class,${teacherAssignment.subjectGroupCode}`,
    `teacher-assignment,${teacherAssignment.teacherDemoCode},${teacherAssignment.classCode},unknown-subject`,
  ].join("\n");
  const unsafePreview = parseSchoolDemoRosterImportPreview(unsafeCsv, snapshot);

  assert.equal(unsafePreview.acceptedRows.length, 0);
  assert.equal(unsafePreview.rejectedRows.length, 3);
  assert.match(unsafePreview.rejectedRows.map((row) => row.reason).join("\n"), /contact data/);
  assert.match(
    unsafePreview.rejectedRows.map((row) => row.reason).join("\n"),
    /Class code is outside/,
  );
  assert.match(
    unsafePreview.rejectedRows.map((row) => row.reason).join("\n"),
    /Subject group code is outside/,
  );
});

test("school demo assignment preview builds only local synthetic drafts", () => {
  const snapshot = snapshotFixtureForContract();
  const assignment = snapshot.teacherAssignments[0];
  const validPreview = buildSchoolDemoAssignmentDraftPreview(
    {
      attemptLimit: 2,
      availabilityDays: 7,
      classCode: assignment.classCode,
      deliveryMode: "online-preview",
      durationMinutes: 45,
      packageCode: "grade-7-linear-practice-demo",
      subjectGroupCode: assignment.subjectGroupCode,
      teacherDemoCode: assignment.teacherDemoCode,
    },
    snapshot,
  );

  assert.equal(validPreview.draftState, "PREVIEW_READY");
  assert.equal(validPreview.blockedReasons.length, 0);
  assert.equal(validPreview.eligibleStudentCount > 0, true);
  assert.match(validPreview.reviewChecklist.join("\n"), /no assignment is saved/);
  assert.match(validPreview.reviewChecklist.join("\n"), /Real assignment delivery remains blocked/);

  const blockedPreview = buildSchoolDemoAssignmentDraftPreview(
    {
      attemptLimit: 9,
      availabilityDays: 99,
      classCode: "real-class",
      deliveryMode: "online-preview",
      durationMinutes: 120,
      packageCode: "unreviewed-package",
      subjectGroupCode: "real-subject",
      teacherDemoCode: "person@example.test",
    },
    snapshot,
  );

  assert.equal(blockedPreview.draftState, "PREVIEW_BLOCKED");
  assert.equal(blockedPreview.eligibleStudentCount, 0);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Class code is outside/);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Subject group code is outside/);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Teacher demo code is outside/);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Package code is outside/);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Attempt limit/);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Availability window/);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Duration/);
});

test("school demo delivery rehearsal queues only synthetic rows and writes nothing", () => {
  const snapshot = snapshotFixtureForContract();
  const assignment = snapshot.teacherAssignments[0];
  const readyPreview = buildSchoolDemoDeliveryRehearsalPreview(
    {
      attemptLimit: 2,
      availabilityDays: 7,
      classCode: assignment.classCode,
      deliveryMode: "online-preview",
      durationMinutes: 45,
      packageCode: "grade-7-linear-practice-demo",
      subjectGroupCode: assignment.subjectGroupCode,
      teacherDemoCode: assignment.teacherDemoCode,
    },
    snapshot,
  );

  assert.equal(readyPreview.rehearsalState, "REHEARSAL_READY");
  assert.equal(readyPreview.blockedReasons.length, 0);
  assert.equal(readyPreview.totals.writeCount, 0);
  assert.equal(readyPreview.totals.queuedRows > 0, true);
  assert.equal(readyPreview.totals.blockedRows, 0);
  assert.equal(
    readyPreview.rosterRows.every((row) => row.rehearsalState === "QUEUED_FOR_DEMO"),
    true,
  );
  assert.match(readyPreview.safetyChecklist.join("\n"), /no assignment is saved/);
  assert.match(readyPreview.timelineRows.map((row) => row.note).join("\n"), /No send/);

  const blockedPreview = buildSchoolDemoDeliveryRehearsalPreview(
    {
      attemptLimit: 9,
      availabilityDays: 99,
      classCode: "real-class",
      deliveryMode: "online-preview",
      durationMinutes: 120,
      packageCode: "unreviewed-package",
      subjectGroupCode: "real-subject",
      teacherDemoCode: "real-teacher",
    },
    snapshot,
  );

  assert.equal(blockedPreview.rehearsalState, "REHEARSAL_BLOCKED");
  assert.equal(blockedPreview.totals.writeCount, 0);
  assert.equal(blockedPreview.totals.queuedRows, 0);
  assert.equal(blockedPreview.rosterRows.length, 0);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Class code is outside/);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Package code is outside/);
  assert.match(blockedPreview.timelineRows.map((row) => row.state).join("\n"), /BLOCKED/);
});

test("school demo student preview renders only a disabled learner shell", () => {
  const snapshot = snapshotFixtureForContract();
  const assignment = snapshot.teacherAssignments[0];
  const student = snapshot.students.find((entry) => entry.classCode === assignment.classCode);
  const mismatchedStudent = snapshot.students.find(
    (entry) => entry.classCode !== assignment.classCode,
  );

  assert.ok(student);
  assert.ok(mismatchedStudent);

  const readyPreview = buildSchoolDemoStudentDeliveryPreview(
    {
      attemptLimit: 2,
      availabilityDays: 7,
      classCode: assignment.classCode,
      deliveryMode: "online-preview",
      durationMinutes: 45,
      packageCode: "grade-7-linear-practice-demo",
      studentDemoCode: student.demoCode,
      subjectGroupCode: assignment.subjectGroupCode,
      teacherDemoCode: assignment.teacherDemoCode,
    },
    snapshot,
  );

  assert.equal(readyPreview.previewState, "STUDENT_PREVIEW_READY");
  assert.equal(readyPreview.blockedReasons.length, 0);
  assert.equal(readyPreview.totals.learnerRecordWrites, 0);
  assert.equal(readyPreview.totals.mediaUploads, 0);
  assert.equal(readyPreview.totals.scoreUpdates, 0);
  assert.equal(
    readyPreview.studentWorkspaceRows.some(
      (row) => row.control === "Assignment card" && row.state === "VISIBLE_DEMO_ONLY",
    ),
    true,
  );
  assert.equal(
    readyPreview.studentWorkspaceRows
      .filter((row) => row.control !== "Assignment card")
      .every((row) => row.state === "DISABLED_DEMO_ONLY"),
    true,
  );
  assert.match(readyPreview.safetyChecklist.join("\n"), /No learner attempt/);
  assert.match(readyPreview.safetyChecklist.join("\n"), /Real student access remains blocked/);

  const blockedPreview = buildSchoolDemoStudentDeliveryPreview(
    {
      attemptLimit: 2,
      availabilityDays: 7,
      classCode: assignment.classCode,
      deliveryMode: "online-preview",
      durationMinutes: 45,
      packageCode: "grade-7-linear-practice-demo",
      studentDemoCode: mismatchedStudent.demoCode,
      subjectGroupCode: assignment.subjectGroupCode,
      teacherDemoCode: assignment.teacherDemoCode,
    },
    snapshot,
  );

  assert.equal(blockedPreview.previewState, "STUDENT_PREVIEW_BLOCKED");
  assert.equal(blockedPreview.totals.learnerRecordWrites, 0);
  assert.equal(blockedPreview.totals.mediaUploads, 0);
  assert.equal(blockedPreview.totals.scoreUpdates, 0);
  assert.match(blockedPreview.blockedReasons.join("\n"), /not enrolled/);
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
  const assignmentPreviewHtml = renderToStaticMarkup(
    createElement(SchoolDemoAssignmentPreviewView, {
      snapshot,
    }),
  );
  const deliveryPreviewHtml = renderToStaticMarkup(
    createElement(SchoolDemoDeliveryPreviewView, {
      snapshot,
    }),
  );
  const studentPreviewHtml = renderToStaticMarkup(
    createElement(SchoolDemoStudentPreviewView, {
      snapshot,
    }),
  );
  const importPreviewHtml = renderToStaticMarkup(
    createElement(SchoolDemoImportPreviewView, {
      snapshot,
    }),
  );
  const rolloutHtml = renderToStaticMarkup(
    createElement(SchoolDemoRolloutView, {
      snapshot,
    }),
  );
  const combinedHtml = `${guidedDashboardHtml}\n${guidedDrilldownHtml}\n${compactSummaryHtml}\n${handoffPackHtml}\n${pilotChecklistHtml}\n${pilotConfigHtml}\n${assignmentPreviewHtml}\n${deliveryPreviewHtml}\n${studentPreviewHtml}\n${importPreviewHtml}\n${rolloutHtml}`;

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
    "School demo assignment preview",
    "Teacher draft controls",
    "Draft summary",
    "Blocked reasons",
    "Eligible roster preview",
    "Preview boundary",
    "School demo delivery rehearsal",
    "Delivery rehearsal controls",
    "Rehearsal summary",
    "Delivery channels",
    "Roster queue rehearsal",
    "Stop-gated timeline",
    "Delivery boundary",
    "School demo student preview",
    "Student preview controls",
    "Student assignment card",
    "Student workspace shell",
    "Student preview boundary",
    "STUDENT_PREVIEW_READY",
    "DISABLED_DEMO_ONLY",
    "School demo import preview",
    "Synthetic CSV preview",
    "Accepted preview rows",
    "Rejected preview rows",
    "Import boundary",
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
    "Assignment preview",
    "Delivery rehearsal",
    "Student preview",
    "Import preview",
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
    "school-demo-assignment-preview-grid",
    "school-demo-assignment-preview-controls",
    "school-demo-assignment-preview-boundary",
    "school-demo-delivery-preview-grid",
    "school-demo-delivery-preview-controls",
    "school-demo-delivery-preview-boundary",
    "school-demo-delivery-preview-timeline",
    "school-demo-student-preview-grid",
    "school-demo-student-preview-controls",
    "school-demo-student-preview-boundary",
    "school-demo-student-preview-workspace",
    "school-demo-import-preview-grid",
    "school-demo-import-preview-editor",
    "school-demo-import-preview-textarea",
    "school-demo-import-preview-boundary",
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
  assert.match(compactSummaryHtml, /href="\/school-demo\/import-preview"/);
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
  assert.match(pilotConfigHtml, /href="\/school-demo\/assignment-preview"/);
  assert.match(assignmentPreviewHtml, /href="\/school-demo\/pilot-config"/);
  assert.match(assignmentPreviewHtml, /href="\/school-demo\/delivery-preview"/);
  assert.match(assignmentPreviewHtml, /href="\/school-demo\/import-preview"/);
  assert.match(assignmentPreviewHtml, /href="\/school-demo\/rollout"/);
  assert.match(assignmentPreviewHtml, /School demo assignment preview/);
  assert.match(assignmentPreviewHtml, /Teacher draft controls/);
  assert.match(assignmentPreviewHtml, /Draft summary/);
  assert.match(assignmentPreviewHtml, /PREVIEW_READY/);
  assert.match(assignmentPreviewHtml, /Eligible roster preview/);
  assert.match(assignmentPreviewHtml, /Preview boundary/);
  assert.match(assignmentPreviewHtml, /No task text/);
  assert.match(deliveryPreviewHtml, /href="\/school-demo\/assignment-preview"/);
  assert.match(deliveryPreviewHtml, /href="\/school-demo\/student-preview"/);
  assert.match(deliveryPreviewHtml, /href="\/school-demo\/import-preview"/);
  assert.match(deliveryPreviewHtml, /href="\/school-demo\/summary"/);
  assert.match(deliveryPreviewHtml, /href="\/school-demo\/rollout"/);
  assert.match(deliveryPreviewHtml, /School demo delivery rehearsal/);
  assert.match(deliveryPreviewHtml, /Delivery rehearsal controls/);
  assert.match(deliveryPreviewHtml, /Rehearsal summary/);
  assert.match(deliveryPreviewHtml, /REHEARSAL_READY/);
  assert.match(deliveryPreviewHtml, /Delivery channels/);
  assert.match(deliveryPreviewHtml, /Roster queue rehearsal/);
  assert.match(deliveryPreviewHtml, /Stop-gated timeline/);
  assert.match(deliveryPreviewHtml, /Delivery boundary/);
  assert.match(deliveryPreviewHtml, /Browser-only rehearsal/);
  assert.match(studentPreviewHtml, /href="\/school-demo\/delivery-preview"/);
  assert.match(studentPreviewHtml, /href="\/school-demo\/import-preview"/);
  assert.match(studentPreviewHtml, /href="\/school-demo\/summary"/);
  assert.match(studentPreviewHtml, /School demo student preview/);
  assert.match(studentPreviewHtml, /Student preview controls/);
  assert.match(studentPreviewHtml, /Student assignment card/);
  assert.match(studentPreviewHtml, /Student workspace shell/);
  assert.match(studentPreviewHtml, /Student preview boundary/);
  assert.match(studentPreviewHtml, /STUDENT_PREVIEW_READY/);
  assert.match(studentPreviewHtml, /No learner attempt/);
  assert.match(studentPreviewHtml, /Real student access remains blocked/);
  assert.match(importPreviewHtml, /href="\/school-demo\/pilot-config"/);
  assert.match(importPreviewHtml, /href="\/school-demo\/assignment-preview"/);
  assert.match(importPreviewHtml, /href="\/school-demo\/delivery-preview"/);
  assert.match(importPreviewHtml, /href="\/school-demo\/summary"/);
  assert.match(importPreviewHtml, /href="\/school-demo\/rollout"/);
  assert.match(importPreviewHtml, /School demo import preview/);
  assert.match(importPreviewHtml, /Synthetic CSV preview/);
  assert.match(importPreviewHtml, /rowType,demoCode,classCode,subjectGroupCode/);
  assert.match(importPreviewHtml, /Accepted preview rows/);
  assert.match(importPreviewHtml, /Rejected preview rows/);
  assert.match(importPreviewHtml, /Import boundary/);
  assert.match(importPreviewHtml, /No upload, no server save/);
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
  const assignmentPreviewPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "assignment-preview", "page.tsx"),
    "utf8",
  );
  const deliveryPreviewPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "delivery-preview", "page.tsx"),
    "utf8",
  );
  const studentPreviewPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "student-preview", "page.tsx"),
    "utf8",
  );
  const importPreviewPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "import-preview", "page.tsx"),
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
  assert.equal(assignmentPreviewPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(assignmentPreviewPageSource.includes("SchoolDemoAssignmentPreviewView"), true);
  assert.equal(assignmentPreviewPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(deliveryPreviewPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(deliveryPreviewPageSource.includes("SchoolDemoDeliveryPreviewView"), true);
  assert.equal(deliveryPreviewPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(studentPreviewPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(studentPreviewPageSource.includes("SchoolDemoStudentPreviewView"), true);
  assert.equal(studentPreviewPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(importPreviewPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(importPreviewPageSource.includes("SchoolDemoImportPreviewView"), true);
  assert.equal(importPreviewPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(rolloutPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(rolloutPageSource.includes("SchoolDemoRolloutView"), true);
  assert.equal(rolloutPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(serviceSource.includes('"/demo/school-snapshot"'), true);
  assert.equal(viewSource.includes("SchoolDemoThemeToggle"), true);
  assert.equal(viewSource.includes("SchoolDemoCompactSummaryView"), true);
  assert.equal(viewSource.includes("SchoolDemoHandoffPackView"), true);
  assert.equal(viewSource.includes("SchoolDemoPilotChecklistView"), true);
  assert.equal(viewSource.includes("SchoolDemoPilotConfigView"), true);
  assert.equal(viewSource.includes("SchoolDemoAssignmentPreviewView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoAssignmentDraftPreview"), true);
  assert.equal(viewSource.includes("SchoolDemoDeliveryPreviewView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoDeliveryRehearsalPreview"), true);
  assert.equal(viewSource.includes("SchoolDemoStudentPreviewView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoStudentDeliveryPreview"), true);
  assert.equal(viewSource.includes("SchoolDemoImportPreviewView"), true);
  assert.equal(viewSource.includes("parseSchoolDemoRosterImportPreview"), true);
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
  assert.equal(viewSource.includes("school-demo-assignment-preview-controls"), true);
  assert.equal(viewSource.includes("school-demo-assignment-preview-summary"), true);
  assert.equal(viewSource.includes("school-demo-assignment-preview-blockers"), true);
  assert.equal(viewSource.includes("school-demo-assignment-preview-roster"), true);
  assert.equal(viewSource.includes("school-demo-assignment-preview-boundary"), true);
  assert.equal(viewSource.includes("school-demo-delivery-preview-controls"), true);
  assert.equal(viewSource.includes("school-demo-delivery-preview-summary"), true);
  assert.equal(viewSource.includes("school-demo-delivery-preview-channels"), true);
  assert.equal(viewSource.includes("school-demo-delivery-preview-roster"), true);
  assert.equal(viewSource.includes("school-demo-delivery-preview-timeline"), true);
  assert.equal(viewSource.includes("school-demo-delivery-preview-blockers"), true);
  assert.equal(viewSource.includes("school-demo-delivery-preview-boundary"), true);
  assert.equal(viewSource.includes("school-demo-student-preview-controls"), true);
  assert.equal(viewSource.includes("school-demo-student-preview-card"), true);
  assert.equal(viewSource.includes("school-demo-student-preview-workspace"), true);
  assert.equal(viewSource.includes("school-demo-student-preview-blockers"), true);
  assert.equal(viewSource.includes("school-demo-student-preview-boundary"), true);
  assert.equal(viewSource.includes("school-demo-import-preview-input"), true);
  assert.equal(viewSource.includes("school-demo-import-preview-class-summary"), true);
  assert.equal(viewSource.includes("school-demo-import-preview-accepted"), true);
  assert.equal(viewSource.includes("school-demo-import-preview-rejected"), true);
  assert.equal(viewSource.includes("school-demo-import-preview-boundary"), true);
  assert.equal(viewSource.includes("school-demo-import-preview-warnings"), true);
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
  assert.equal(viewSource.includes("/school-demo/student-preview"), true);
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
  assert.equal(cssSource.includes(".school-demo-assignment-preview-grid"), true);
  assert.equal(cssSource.includes(".school-demo-assignment-preview-controls"), true);
  assert.equal(cssSource.includes(".school-demo-assignment-preview-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-delivery-preview-grid"), true);
  assert.equal(cssSource.includes(".school-demo-delivery-preview-controls"), true);
  assert.equal(cssSource.includes(".school-demo-delivery-preview-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-delivery-preview-timeline"), true);
  assert.equal(cssSource.includes(".school-demo-student-preview-grid"), true);
  assert.equal(cssSource.includes(".school-demo-student-preview-controls"), true);
  assert.equal(cssSource.includes(".school-demo-student-preview-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-student-preview-workspace"), true);
  assert.equal(cssSource.includes(".school-demo-import-preview-grid"), true);
  assert.equal(cssSource.includes(".school-demo-import-preview-textarea"), true);
  assert.equal(cssSource.includes(".school-demo-import-preview-actions"), true);
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
  assert.equal(viewSource.includes("/school-demo/assignment-preview"), true);
  assert.equal(viewSource.includes("/school-demo/delivery-preview"), true);
  assert.equal(viewSource.includes("/school-demo/student-preview"), true);
  assert.equal(viewSource.includes("/school-demo/import-preview"), true);
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
      `${appSource}\n${classPageSource}\n${summaryPageSource}\n${handoffPageSource}\n${pilotPageSource}\n${pilotConfigPageSource}\n${assignmentPreviewPageSource}\n${deliveryPreviewPageSource}\n${studentPreviewPageSource}\n${importPreviewPageSource}\n${rolloutPageSource}\n${viewSource}`.includes(
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
