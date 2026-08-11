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
  SchoolDemoAssignmentDraftDetailView,
  SchoolDemoAssignmentPlanningView,
  SchoolDemoAssignmentDraftsView,
  SchoolDemoClassAnalyticsView,
  SchoolDemoClassDetailView,
  SchoolDemoCompactSummaryView,
  SchoolDemoDashboardView,
  SchoolDemoDeliveryPreviewView,
  SchoolDemoHandoffPackView,
  SchoolDemoImportPreviewView,
  SchoolDemoPilotChecklistView,
  SchoolDemoPilotConfigView,
  SchoolDemoPrintPackView,
  SchoolDemoRolloutView,
  SchoolDemoStudentPreviewView,
  SchoolDemoTeacherDashboardView,
  SchoolDemoTeacherReviewQueueView,
  SchoolDemoTeacherReviewRubricView,
  buildSchoolDemoAssignmentDraftPreview,
  buildSchoolDemoAssignmentPlanningPreview,
  buildSchoolDemoPersistedAssignmentDraftDetailPreview,
  buildSchoolDemoPersistedAssignmentDraftsPreview,
  buildSchoolDemoClassAnalyticsPreview,
  buildSchoolDemoDeliveryRehearsalPreview,
  buildSchoolDemoPrintPackPreview,
  buildSchoolDemoStudentDeliveryPreview,
  buildSchoolDemoTeacherDashboardPreview,
  buildSchoolDemoTeacherReviewQueuePreview,
  buildSchoolDemoTeacherReviewRubricPreview,
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
  const studentById = new Map(seed.students.map((student) => [student.id, student]));
  return {
    academicYear: {
      code: seed.academicYear.code,
      endsOn: seed.academicYear.endsOn.slice(0, 10),
      startsOn: seed.academicYear.startsOn.slice(0, 10),
    },
    assignmentDrafts: seed.assignmentDrafts.map((draft) => ({
      assignmentCode: draft.assignmentCode,
      classCode: classCodeById.get(draft.classId),
      deliveryMode: draft.deliveryMode,
      packageCode: draft.packageCode,
      settings: {
        attemptLimit: draft.attemptLimit,
        availabilityDays: draft.availabilityDays,
        durationMinutes: draft.durationMinutes,
      },
      status: draft.status,
      subjectGroupCode: subjectGroupById.get(draft.subjectGroupId)?.code,
      targetCount: seed.assignmentTargets.filter(
        (target) => target.assignmentDraftId === draft.id && target.state === "INCLUDED",
      ).length,
      targetStudentDemoCodes: seed.assignmentTargets
        .filter((target) => target.assignmentDraftId === draft.id && target.state === "INCLUDED")
        .map((target) => studentById.get(target.studentId)?.demoCode)
        .filter(Boolean),
      teacherDemoCode: teacherById.get(draft.teacherId)?.demoCode,
    })),
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
    "assignmentDrafts",
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

test("school demo persisted assignment drafts project only synthetic rows", () => {
  const snapshot = snapshotFixtureForContract();
  const preview = buildSchoolDemoPersistedAssignmentDraftsPreview(snapshot);

  assert.equal(preview.previewState, "ASSIGNMENT_DRAFTS_READY");
  assert.equal(preview.blockedReasons.length, 0);
  assert.equal(preview.totals.draftCount, 3);
  assert.equal(preview.totals.targetCount, 6);
  assert.equal(preview.totals.mutationWrites, 0);
  assert.equal(preview.totals.productionDataCount, 0);
  assert.equal(preview.totals.realSchoolCount, 0);
  assert.equal(
    preview.draftRows.every((row) => row.assignmentCode.startsWith("synthetic-draft-")),
    true,
  );
  assert.equal(
    preview.targetRows.every((row) => row.state === "DISPLAY_ONLY"),
    true,
  );
  assert.match(preview.safetyChecklist.join("\n"), /seeded synthetic metadata/);
  assert.match(preview.safetyChecklist.join("\n"), /Publishing and delivery remain blocked/);

  const blockedPreview = buildSchoolDemoPersistedAssignmentDraftsPreview({
    ...snapshot,
    boundary: {
      ...snapshot.boundary,
      activation: "BLOCKED",
      mutationAllowed: true,
      productionDataCount: 1,
      readiness: "NOT_READY",
    },
  });

  assert.equal(blockedPreview.previewState, "ASSIGNMENT_DRAFTS_BLOCKED");
  assert.equal(blockedPreview.totals.mutationWrites, 0);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Mutation boundary/);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Production data count/);
});

test("school demo assignment draft detail stays read-only and synthetic", () => {
  const snapshot = snapshotFixtureForContract();
  const draft = snapshot.assignmentDrafts[0];
  const preview = buildSchoolDemoPersistedAssignmentDraftDetailPreview(
    draft.assignmentCode,
    snapshot,
  );

  assert.equal(preview.detailState, "ASSIGNMENT_DRAFT_DETAIL_READY");
  assert.equal(preview.blockedReasons.length, 0);
  assert.equal(preview.draft.assignmentCode, draft.assignmentCode);
  assert.equal(preview.totals.detailWrites, 0);
  assert.equal(preview.totals.targetCount, draft.targetCount);
  assert.equal(preview.targetRows.length, draft.targetCount);
  assert.equal(
    preview.targetRows.every((row) => row.state === "DISPLAY_ONLY"),
    true,
  );
  assert.match(preview.safetyChecklist.join("\n"), /seeded synthetic draft metadata/);
  assert.match(preview.safetyChecklist.join("\n"), /cannot publish or deliver/);

  const missingPreview = buildSchoolDemoPersistedAssignmentDraftDetailPreview(
    "real-assignment-draft",
    snapshot,
  );

  assert.equal(missingPreview.detailState, "ASSIGNMENT_DRAFT_DETAIL_BLOCKED");
  assert.equal(missingPreview.draft, null);
  assert.equal(missingPreview.totals.detailWrites, 0);
  assert.match(missingPreview.blockedReasons.join("\n"), /outside the synthetic snapshot/);
});

test("school demo assignment planning board groups only synthetic drafts", () => {
  const snapshot = snapshotFixtureForContract();
  const preview = buildSchoolDemoAssignmentPlanningPreview(snapshot);

  assert.equal(preview.planningState, "ASSIGNMENT_PLANNING_READY");
  assert.equal(preview.blockedReasons.length, 0);
  assert.equal(preview.totals.draftCount, 3);
  assert.equal(preview.totals.targetCount, 6);
  assert.equal(preview.totals.planningWrites, 0);
  assert.equal(preview.totals.productionDataCount, 0);
  assert.equal(preview.totals.realSchoolCount, 0);
  assert.equal(preview.classPlanRows.length, snapshot.classes.length);
  assert.equal(preview.teacherPlanRows.length, snapshot.teachers.length);
  assert.equal(
    preview.classPlanRows.every((row) => row.state === "DISPLAY_ONLY"),
    true,
  );
  assert.equal(
    preview.teacherPlanRows.every((row) => row.state === "DISPLAY_ONLY"),
    true,
  );
  assert.match(preview.safetyChecklist.join("\n"), /seeded synthetic assignment drafts/);
  assert.match(preview.safetyChecklist.join("\n"), /No publication/);

  const blockedPreview = buildSchoolDemoAssignmentPlanningPreview({
    ...snapshot,
    boundary: {
      ...snapshot.boundary,
      activation: "BLOCKED",
      mutationAllowed: true,
      productionDataCount: 1,
      readiness: "NOT_READY",
    },
  });

  assert.equal(blockedPreview.planningState, "ASSIGNMENT_PLANNING_BLOCKED");
  assert.equal(blockedPreview.totals.planningWrites, 0);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Mutation boundary/);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Production data count/);
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

test("school demo teacher review queue stays synthetic and writes nothing", () => {
  const snapshot = snapshotFixtureForContract();
  const assignment = snapshot.teacherAssignments[0];
  const readyPreview = buildSchoolDemoTeacherReviewQueuePreview(
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

  assert.equal(readyPreview.queueState, "REVIEW_QUEUE_READY");
  assert.equal(readyPreview.blockedReasons.length, 0);
  assert.equal(readyPreview.totals.queueItems > 0, true);
  assert.equal(readyPreview.totals.learnerRecordWrites, 0);
  assert.equal(readyPreview.totals.scoreUpdates, 0);
  assert.equal(readyPreview.totals.teacherDecisionWrites, 0);
  assert.equal(
    readyPreview.queueRows.every((row) => row.reviewState === "WAITING_SYNTHETIC_REVIEW"),
    true,
  );
  assert.match(readyPreview.reviewPolicyRows.map((row) => row.status).join("\n"), /Disabled/);
  assert.match(readyPreview.safetyChecklist.join("\n"), /No learner work/);
  assert.match(readyPreview.safetyChecklist.join("\n"), /Real teacher review remains blocked/);

  const blockedPreview = buildSchoolDemoTeacherReviewQueuePreview(
    {
      attemptLimit: 2,
      availabilityDays: 7,
      classCode: "real-class",
      deliveryMode: "online-preview",
      durationMinutes: 45,
      packageCode: "grade-7-linear-practice-demo",
      subjectGroupCode: assignment.subjectGroupCode,
      teacherDemoCode: assignment.teacherDemoCode,
    },
    snapshot,
  );

  assert.equal(blockedPreview.queueState, "REVIEW_QUEUE_BLOCKED");
  assert.equal(blockedPreview.totals.queueItems, 0);
  assert.equal(blockedPreview.totals.teacherDecisionWrites, 0);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Class code is outside/);
});

test("school demo teacher review rubric stays display-only and writes nothing", () => {
  const snapshot = snapshotFixtureForContract();
  const assignment = snapshot.teacherAssignments[0];
  const readyPreview = buildSchoolDemoTeacherReviewRubricPreview(
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

  assert.equal(readyPreview.rubricState, "RUBRIC_PREVIEW_READY");
  assert.equal(readyPreview.blockedReasons.length, 0);
  assert.equal(readyPreview.queueContextRows.length > 0, true);
  assert.equal(readyPreview.totals.rubricCriteria, 5);
  assert.equal(readyPreview.totals.evidenceWrites, 0);
  assert.equal(readyPreview.totals.learnerRecordWrites, 0);
  assert.equal(readyPreview.totals.scoreUpdates, 0);
  assert.equal(readyPreview.totals.teacherDecisionWrites, 0);
  assert.equal(
    readyPreview.rubricRows.some((row) => row.state === "DISABLED_DEMO_ONLY"),
    true,
  );
  assert.match(readyPreview.safetyChecklist.join("\n"), /No learner work/);
  assert.match(
    readyPreview.safetyChecklist.join("\n"),
    /Real rubric-assisted review remains blocked/,
  );

  const blockedPreview = buildSchoolDemoTeacherReviewRubricPreview(
    {
      attemptLimit: 2,
      availabilityDays: 7,
      classCode: "real-class",
      deliveryMode: "online-preview",
      durationMinutes: 45,
      packageCode: "grade-7-linear-practice-demo",
      subjectGroupCode: assignment.subjectGroupCode,
      teacherDemoCode: assignment.teacherDemoCode,
    },
    snapshot,
  );

  assert.equal(blockedPreview.rubricState, "RUBRIC_PREVIEW_BLOCKED");
  assert.equal(blockedPreview.queueContextRows.length, 0);
  assert.equal(blockedPreview.totals.teacherDecisionWrites, 0);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Class code is outside/);
});

test("school demo class analytics stays synthetic and writes nothing", () => {
  const snapshot = snapshotFixtureForContract();
  const preview = buildSchoolDemoClassAnalyticsPreview(snapshot);

  assert.equal(preview.analyticsState, "ANALYTICS_PREVIEW_READY");
  assert.equal(preview.blockedReasons.length, 0);
  assert.equal(preview.totals.classCount, 3);
  assert.equal(preview.totals.enrolledStudents, snapshot.students.length);
  assert.equal(preview.totals.queueRows, snapshot.students.length);
  assert.equal(preview.totals.teacherAssignmentCount, snapshot.teacherAssignments.length);
  assert.equal(preview.totals.subjectGroupCount, snapshot.subjectGroups.length);
  assert.equal(preview.totals.analyticsWrites, 0);
  assert.equal(preview.totals.evidenceWrites, 0);
  assert.equal(preview.totals.learnerRecordWrites, 0);
  assert.equal(preview.totals.productionDataCount, 0);
  assert.equal(preview.totals.realSchoolCount, 0);
  assert.equal(preview.totals.scoreUpdates, 0);
  assert.equal(preview.analyticsRows.length, snapshot.classes.length);
  assert.equal(
    preview.analyticsRows.every((row) => row.signalState === "SYNTHETIC_READY"),
    true,
  );
  assert.equal(
    preview.signalRows.some((row) => row.label === "Review queue load"),
    true,
  );
  assert.match(preview.safetyChecklist.join("\n"), /synthetic class/);
  assert.match(preview.safetyChecklist.join("\n"), /No grades/);
  assert.match(preview.safetyChecklist.join("\n"), /Real class analytics remains blocked/);

  const blockedPreview = buildSchoolDemoClassAnalyticsPreview({
    ...snapshot,
    boundary: {
      ...snapshot.boundary,
      activation: "READY",
    },
  });

  assert.equal(blockedPreview.analyticsState, "ANALYTICS_PREVIEW_BLOCKED");
  assert.equal(blockedPreview.totals.analyticsWrites, 0);
  assert.equal(blockedPreview.totals.evidenceWrites, 0);
  assert.equal(blockedPreview.totals.learnerRecordWrites, 0);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Activation boundary/);
});

test("school demo teacher dashboard consolidates read-only surfaces and writes nothing", () => {
  const snapshot = snapshotFixtureForContract();
  const preview = buildSchoolDemoTeacherDashboardPreview(snapshot);

  assert.equal(preview.dashboardState, "TEACHER_DASHBOARD_READY");
  assert.equal(preview.blockedReasons.length, 0);
  assert.equal(preview.classRows.length, snapshot.classes.length);
  assert.equal(preview.surfaceRows.length, 8);
  assert.equal(preview.totals.classCount, 3);
  assert.equal(preview.totals.studentCount, snapshot.students.length);
  assert.equal(preview.totals.teacherCount, snapshot.teachers.length);
  assert.equal(preview.totals.subjectGroupCount, snapshot.subjectGroups.length);
  assert.equal(preview.totals.queueItems > 0, true);
  assert.equal(preview.totals.rubricCriteria, 5);
  assert.equal(preview.totals.analyticsWrites, 0);
  assert.equal(preview.totals.assignmentWrites, 0);
  assert.equal(preview.totals.deliveryWrites, 0);
  assert.equal(preview.totals.evidenceWrites, 0);
  assert.equal(preview.totals.importWrites, 0);
  assert.equal(preview.totals.learnerRecordWrites, 0);
  assert.equal(preview.totals.scoreUpdates, 0);
  assert.equal(preview.totals.teacherDecisionWrites, 0);
  assert.equal(
    preview.surfaceRows.some((row) => row.href === "/school-demo/analytics"),
    true,
  );
  assert.equal(
    preview.surfaceRows.some((row) => row.href === "/school-demo/import-preview"),
    true,
  );
  assert.match(preview.safetyChecklist.join("\n"), /synthetic class/);
  assert.match(preview.safetyChecklist.join("\n"), /No assignment/);
  assert.match(preview.safetyChecklist.join("\n"), /Real teacher dashboard remains blocked/);

  const blockedPreview = buildSchoolDemoTeacherDashboardPreview({
    ...snapshot,
    boundary: {
      ...snapshot.boundary,
      workflow: "ACTIVE",
    },
  });

  assert.equal(blockedPreview.dashboardState, "TEACHER_DASHBOARD_BLOCKED");
  assert.equal(blockedPreview.totals.assignmentWrites, 0);
  assert.equal(blockedPreview.totals.teacherDecisionWrites, 0);
  assert.match(blockedPreview.blockedReasons.join("\n"), /Workflow boundary/);
});

test("school demo print pack stays browser-only and writes nothing", () => {
  const snapshot = snapshotFixtureForContract();
  const preview = buildSchoolDemoPrintPackPreview(snapshot);

  assert.equal(preview.packState, "PRINT_PACK_READY");
  assert.equal(preview.sectionRows.length, 7);
  assert.equal(preview.classRows.length, snapshot.classes.length);
  assert.equal(preview.totals.generatedFiles, 0);
  assert.equal(preview.totals.printJobWrites, 0);
  assert.equal(preview.totals.serverRenderJobs, 0);
  assert.equal(preview.totals.storageObjects, 0);
  assert.equal(preview.totals.productionDataCount, 0);
  assert.equal(preview.totals.realSchoolCount, 0);
  assert.equal(
    preview.sectionRows.some((row) => row.href === "/school-demo/teacher-dashboard"),
    true,
  );
  assert.equal(
    preview.sectionRows.some((row) => row.href === "/school-demo/import-preview"),
    true,
  );
  assert.match(preview.safetyChecklist.join("\n"), /Browser print/);
  assert.match(preview.safetyChecklist.join("\n"), /No generated file/);
  assert.match(preview.safetyChecklist.join("\n"), /Real school pilot print materials/);

  const blockedPreview = buildSchoolDemoPrintPackPreview({
    ...snapshot,
    boundary: {
      ...snapshot.boundary,
      readiness: "READY",
    },
  });

  assert.equal(blockedPreview.packState, "PRINT_PACK_BLOCKED");
  assert.equal(blockedPreview.totals.generatedFiles, 0);
  assert.equal(blockedPreview.totals.serverRenderJobs, 0);
  assert.equal(blockedPreview.totals.storageObjects, 0);
  assert.match(blockedPreview.safetyChecklist.join("\n"), /Readiness boundary/);
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
  const assignmentDraftsHtml = renderToStaticMarkup(
    createElement(SchoolDemoAssignmentDraftsView, {
      snapshot,
    }),
  );
  const assignmentDraftDetailHtml = renderToStaticMarkup(
    createElement(SchoolDemoAssignmentDraftDetailView, {
      assignmentCode: snapshot.assignmentDrafts[0].assignmentCode,
      snapshot,
    }),
  );
  const assignmentPlanningHtml = renderToStaticMarkup(
    createElement(SchoolDemoAssignmentPlanningView, {
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
  const reviewQueueHtml = renderToStaticMarkup(
    createElement(SchoolDemoTeacherReviewQueueView, {
      snapshot,
    }),
  );
  const reviewRubricHtml = renderToStaticMarkup(
    createElement(SchoolDemoTeacherReviewRubricView, {
      snapshot,
    }),
  );
  const analyticsHtml = renderToStaticMarkup(
    createElement(SchoolDemoClassAnalyticsView, {
      snapshot,
    }),
  );
  const teacherDashboardHtml = renderToStaticMarkup(
    createElement(SchoolDemoTeacherDashboardView, {
      snapshot,
    }),
  );
  const printPackHtml = renderToStaticMarkup(
    createElement(SchoolDemoPrintPackView, {
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
  const combinedHtml = `${guidedDashboardHtml}\n${guidedDrilldownHtml}\n${compactSummaryHtml}\n${handoffPackHtml}\n${pilotChecklistHtml}\n${pilotConfigHtml}\n${assignmentPreviewHtml}\n${assignmentDraftsHtml}\n${assignmentDraftDetailHtml}\n${assignmentPlanningHtml}\n${deliveryPreviewHtml}\n${studentPreviewHtml}\n${reviewQueueHtml}\n${reviewRubricHtml}\n${analyticsHtml}\n${teacherDashboardHtml}\n${printPackHtml}\n${importPreviewHtml}\n${rolloutHtml}`;

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
    "School demo assignment draft rows",
    "School demo assignment draft detail",
    "Teacher draft controls",
    "Draft summary",
    "Draft rows",
    "Target snapshot",
    "Draft settings",
    "Zero-write boundary",
    "Teacher planning detail",
    "Planning settings",
    "Target roster detail",
    "Detail boundary",
    "ASSIGNMENT_DRAFTS_READY",
    "ASSIGNMENT_DRAFT_DETAIL_READY",
    "School demo assignment planning board",
    "Class planning board",
    "Teacher planning board",
    "Draft drilldown links",
    "Planning timeline",
    "Planning boundary",
    "ASSIGNMENT_PLANNING_READY",
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
    "School demo review queue",
    "Review queue controls",
    "Review queue summary",
    "Synthetic review queue rows",
    "Review policy shell",
    "Review queue boundary",
    "REVIEW_QUEUE_READY",
    "School demo review rubric",
    "Review rubric controls",
    "Review rubric summary",
    "Display-only rubric rows",
    "Synthetic queue context",
    "Review rubric boundary",
    "RUBRIC_PREVIEW_READY",
    "School demo class analytics",
    "Analytics summary",
    "Synthetic class analytics rows",
    "Synthetic teacher load",
    "Display-only signal rows",
    "Analytics boundary",
    "ANALYTICS_PREVIEW_READY",
    "School demo teacher dashboard",
    "Teacher dashboard overview",
    "Surface map",
    "Class dashboard rows",
    "Operational write counters",
    "Teacher dashboard boundary",
    "TEACHER_DASHBOARD_READY",
    "School demo print pack",
    "Print pack cover",
    "Printable sections",
    "Class snapshot",
    "Output counters",
    "Print checklist",
    "Print pack boundary",
    "PRINT_PACK_READY",
    "Print pack",
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
    "Assignment draft rows",
    "Assignment planning board",
    "Delivery rehearsal",
    "Student preview",
    "Review queue",
    "Review rubric",
    "Class analytics",
    "Teacher dashboard",
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
    "school-demo-assignment-drafts-grid",
    "school-demo-assignment-drafts-boundary",
    "school-demo-assignment-draft-detail-grid",
    "school-demo-assignment-draft-detail-boundary",
    "school-demo-assignment-planning-grid",
    "school-demo-assignment-planning-boundary",
    "school-demo-delivery-preview-grid",
    "school-demo-delivery-preview-controls",
    "school-demo-delivery-preview-boundary",
    "school-demo-delivery-preview-timeline",
    "school-demo-student-preview-grid",
    "school-demo-student-preview-controls",
    "school-demo-student-preview-boundary",
    "school-demo-student-preview-workspace",
    "school-demo-review-queue-grid",
    "school-demo-review-queue-controls",
    "school-demo-review-queue-boundary",
    "school-demo-review-queue-table",
    "school-demo-review-rubric-grid",
    "school-demo-review-rubric-controls",
    "school-demo-review-rubric-boundary",
    "school-demo-review-rubric-table",
    "school-demo-analytics-grid",
    "school-demo-analytics-boundary",
    "school-demo-analytics-class-table",
    "school-demo-analytics-teacher-load",
    "school-demo-analytics-signal-table",
    "school-demo-teacher-dashboard-grid",
    "school-demo-teacher-dashboard-boundary",
    "school-demo-teacher-dashboard-surface-map",
    "school-demo-teacher-dashboard-class-table",
    "school-demo-teacher-dashboard-zero-writes",
    "school-demo-print-pack-shell",
    "school-demo-print-pack-grid",
    "school-demo-print-pack-boundary",
    "school-demo-print-pack-sections",
    "school-demo-print-pack-class-snapshot",
    "school-demo-print-pack-output-counters",
    "school-demo-print-pack-checklist",
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
  assert.match(assignmentPreviewHtml, /href="\/school-demo\/assignment-drafts"/);
  assert.match(assignmentPreviewHtml, /href="\/school-demo\/import-preview"/);
  assert.match(assignmentPreviewHtml, /href="\/school-demo\/rollout"/);
  assert.match(assignmentPreviewHtml, /School demo assignment preview/);
  assert.match(assignmentPreviewHtml, /Teacher draft controls/);
  assert.match(assignmentPreviewHtml, /Draft summary/);
  assert.match(assignmentPreviewHtml, /PREVIEW_READY/);
  assert.match(assignmentPreviewHtml, /Eligible roster preview/);
  assert.match(assignmentPreviewHtml, /Preview boundary/);
  assert.match(assignmentPreviewHtml, /No task text/);
  assert.match(assignmentDraftsHtml, /href="\/school-demo\/assignment-preview"/);
  assert.match(assignmentDraftsHtml, /href="\/school-demo\/assignment-planning"/);
  assert.match(assignmentDraftsHtml, /href="\/school-demo\/delivery-preview"/);
  assert.match(assignmentDraftsHtml, /href="\/school-demo\/teacher-dashboard"/);
  assert.match(assignmentDraftsHtml, /href="\/school-demo\/print-pack"/);
  assert.match(assignmentDraftsHtml, /href="\/school-demo\/assignment-drafts\/synthetic-draft-/);
  assert.match(assignmentDraftsHtml, /School demo assignment draft rows/);
  assert.match(assignmentDraftsHtml, /Draft rows/);
  assert.match(assignmentDraftsHtml, /Target snapshot/);
  assert.match(assignmentDraftsHtml, /ASSIGNMENT_DRAFTS_READY/);
  assert.match(assignmentDraftsHtml, /Zero-write boundary/);
  assert.match(assignmentDraftDetailHtml, /href="\/school-demo\/assignment-drafts"/);
  assert.match(assignmentDraftDetailHtml, /href="\/school-demo\/assignment-planning"/);
  assert.match(assignmentDraftDetailHtml, /href="\/school-demo\/teacher-dashboard"/);
  assert.match(assignmentDraftDetailHtml, /href="\/school-demo\/delivery-preview"/);
  assert.match(assignmentDraftDetailHtml, /href="\/school-demo\/review-queue"/);
  assert.match(assignmentDraftDetailHtml, /School demo assignment draft detail/);
  assert.match(assignmentDraftDetailHtml, /Teacher planning detail/);
  assert.match(assignmentDraftDetailHtml, /Planning settings/);
  assert.match(assignmentDraftDetailHtml, /Target roster detail/);
  assert.match(assignmentDraftDetailHtml, /ASSIGNMENT_DRAFT_DETAIL_READY/);
  assert.match(assignmentDraftDetailHtml, /Detail boundary/);
  assert.match(assignmentPlanningHtml, /href="\/school-demo\/assignment-drafts"/);
  assert.match(assignmentPlanningHtml, /href="\/school-demo\/delivery-preview"/);
  assert.match(assignmentPlanningHtml, /href="\/school-demo\/teacher-dashboard"/);
  assert.match(assignmentPlanningHtml, /href="\/school-demo\/print-pack"/);
  assert.match(assignmentPlanningHtml, /href="\/school-demo\/assignment-drafts\/synthetic-draft-/);
  assert.match(assignmentPlanningHtml, /School demo assignment planning board/);
  assert.match(assignmentPlanningHtml, /Class planning board/);
  assert.match(assignmentPlanningHtml, /Teacher planning board/);
  assert.match(assignmentPlanningHtml, /Draft drilldown links/);
  assert.match(assignmentPlanningHtml, /Planning timeline/);
  assert.match(assignmentPlanningHtml, /ASSIGNMENT_PLANNING_READY/);
  assert.match(assignmentPlanningHtml, /Planning boundary/);
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
  assert.match(studentPreviewHtml, /href="\/school-demo\/review-queue"/);
  assert.match(studentPreviewHtml, /href="\/school-demo\/summary"/);
  assert.match(studentPreviewHtml, /School demo student preview/);
  assert.match(studentPreviewHtml, /Student preview controls/);
  assert.match(studentPreviewHtml, /Student assignment card/);
  assert.match(studentPreviewHtml, /Student workspace shell/);
  assert.match(studentPreviewHtml, /Student preview boundary/);
  assert.match(studentPreviewHtml, /STUDENT_PREVIEW_READY/);
  assert.match(studentPreviewHtml, /No learner attempt/);
  assert.match(studentPreviewHtml, /Real student access remains blocked/);
  assert.match(reviewQueueHtml, /href="\/school-demo\/student-preview"/);
  assert.match(reviewQueueHtml, /href="\/school-demo\/import-preview"/);
  assert.match(reviewQueueHtml, /href="\/school-demo\/review-rubric"/);
  assert.match(reviewQueueHtml, /href="\/school-demo\/summary"/);
  assert.match(reviewQueueHtml, /School demo review queue/);
  assert.match(reviewQueueHtml, /Review queue controls/);
  assert.match(reviewQueueHtml, /Review queue summary/);
  assert.match(reviewQueueHtml, /Synthetic review queue rows/);
  assert.match(reviewQueueHtml, /Review policy shell/);
  assert.match(reviewQueueHtml, /Review queue boundary/);
  assert.match(reviewQueueHtml, /REVIEW_QUEUE_READY/);
  assert.match(reviewQueueHtml, /Real teacher review remains blocked/);
  assert.match(reviewRubricHtml, /href="\/school-demo\/review-queue"/);
  assert.match(reviewRubricHtml, /href="\/school-demo\/analytics"/);
  assert.match(reviewRubricHtml, /href="\/school-demo\/summary"/);
  assert.match(reviewRubricHtml, /School demo review rubric/);
  assert.match(reviewRubricHtml, /Review rubric controls/);
  assert.match(reviewRubricHtml, /Review rubric summary/);
  assert.match(reviewRubricHtml, /Display-only rubric rows/);
  assert.match(reviewRubricHtml, /Synthetic queue context/);
  assert.match(reviewRubricHtml, /Review rubric boundary/);
  assert.match(reviewRubricHtml, /RUBRIC_PREVIEW_READY/);
  assert.match(reviewRubricHtml, /Real rubric-assisted review remains blocked/);
  assert.match(analyticsHtml, /href="\/school-demo\/review-rubric"/);
  assert.match(analyticsHtml, /href="\/school-demo\/teacher-dashboard"/);
  assert.match(analyticsHtml, /href="\/school-demo\/summary"/);
  assert.match(analyticsHtml, /School demo class analytics/);
  assert.match(analyticsHtml, /Analytics summary/);
  assert.match(analyticsHtml, /Synthetic class analytics rows/);
  assert.match(analyticsHtml, /Synthetic teacher load/);
  assert.match(analyticsHtml, /Display-only signal rows/);
  assert.match(analyticsHtml, /Analytics boundary/);
  assert.match(analyticsHtml, /ANALYTICS_PREVIEW_READY/);
  assert.match(analyticsHtml, /No grades/);
  assert.match(analyticsHtml, /Real class analytics still waits/);
  assert.match(teacherDashboardHtml, /href="\/school-demo\/analytics"/);
  assert.match(teacherDashboardHtml, /href="\/school-demo\/print-pack"/);
  assert.match(teacherDashboardHtml, /href="\/school-demo\/import-preview"/);
  assert.match(teacherDashboardHtml, /href="\/school-demo\/summary"/);
  assert.match(teacherDashboardHtml, /School demo teacher dashboard/);
  assert.match(teacherDashboardHtml, /Teacher dashboard overview/);
  assert.match(teacherDashboardHtml, /Surface map/);
  assert.match(teacherDashboardHtml, /Class dashboard rows/);
  assert.match(teacherDashboardHtml, /Operational write counters/);
  assert.match(teacherDashboardHtml, /Teacher dashboard boundary/);
  assert.match(teacherDashboardHtml, /TEACHER_DASHBOARD_READY/);
  assert.match(teacherDashboardHtml, /Real teacher dashboard remains blocked/);
  assert.match(printPackHtml, /href="\/school-demo\/teacher-dashboard"/);
  assert.match(printPackHtml, /href="\/school-demo\/import-preview"/);
  assert.match(printPackHtml, /href="\/school-demo\/summary"/);
  assert.match(printPackHtml, /School demo print pack/);
  assert.match(printPackHtml, /Print pack cover/);
  assert.match(printPackHtml, /Printable sections/);
  assert.match(printPackHtml, /Class snapshot/);
  assert.match(printPackHtml, /Output counters/);
  assert.match(printPackHtml, /Print checklist/);
  assert.match(printPackHtml, /Print pack boundary/);
  assert.match(printPackHtml, /PRINT_PACK_READY/);
  assert.match(printPackHtml, /No generated file/);
  assert.match(printPackHtml, /Real school pilot print materials/);
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
  const assignmentDraftsPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "assignment-drafts", "page.tsx"),
    "utf8",
  );
  const assignmentDraftDetailPageSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "app",
      "school-demo",
      "assignment-drafts",
      "[assignmentCode]",
      "page.tsx",
    ),
    "utf8",
  );
  const assignmentPlanningPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "assignment-planning", "page.tsx"),
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
  const reviewQueuePageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "review-queue", "page.tsx"),
    "utf8",
  );
  const reviewRubricPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "review-rubric", "page.tsx"),
    "utf8",
  );
  const analyticsPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "analytics", "page.tsx"),
    "utf8",
  );
  const teacherDashboardPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "teacher-dashboard", "page.tsx"),
    "utf8",
  );
  const printPackPageSource = fs.readFileSync(
    path.join(process.cwd(), "app", "school-demo", "print-pack", "page.tsx"),
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
  assert.equal(assignmentDraftsPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(assignmentDraftsPageSource.includes("SchoolDemoAssignmentDraftsView"), true);
  assert.equal(assignmentDraftsPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(assignmentDraftDetailPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(
    assignmentDraftDetailPageSource.includes("SchoolDemoAssignmentDraftDetailView"),
    true,
  );
  assert.equal(assignmentDraftDetailPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(assignmentDraftDetailPageSource.includes("notFound()"), true);
  assert.equal(assignmentDraftDetailPageSource.includes("assignmentCode"), true);
  assert.equal(assignmentPlanningPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(assignmentPlanningPageSource.includes("SchoolDemoAssignmentPlanningView"), true);
  assert.equal(assignmentPlanningPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(deliveryPreviewPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(deliveryPreviewPageSource.includes("SchoolDemoDeliveryPreviewView"), true);
  assert.equal(deliveryPreviewPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(studentPreviewPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(studentPreviewPageSource.includes("SchoolDemoStudentPreviewView"), true);
  assert.equal(studentPreviewPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(reviewQueuePageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(reviewQueuePageSource.includes("SchoolDemoTeacherReviewQueueView"), true);
  assert.equal(reviewQueuePageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(reviewRubricPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(reviewRubricPageSource.includes("SchoolDemoTeacherReviewRubricView"), true);
  assert.equal(reviewRubricPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(analyticsPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(analyticsPageSource.includes("SchoolDemoClassAnalyticsView"), true);
  assert.equal(analyticsPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(teacherDashboardPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(teacherDashboardPageSource.includes("SchoolDemoTeacherDashboardView"), true);
  assert.equal(teacherDashboardPageSource.includes('dynamic = "force-dynamic"'), true);
  assert.equal(printPackPageSource.includes("readSchoolDemoSnapshot"), true);
  assert.equal(printPackPageSource.includes("SchoolDemoPrintPackView"), true);
  assert.equal(printPackPageSource.includes('dynamic = "force-dynamic"'), true);
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
  assert.equal(viewSource.includes("SchoolDemoAssignmentDraftsView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoPersistedAssignmentDraftsPreview"), true);
  assert.equal(viewSource.includes("SchoolDemoAssignmentDraftDetailView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoPersistedAssignmentDraftDetailPreview"), true);
  assert.equal(viewSource.includes("SchoolDemoAssignmentPlanningView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoAssignmentPlanningPreview"), true);
  assert.equal(viewSource.includes("SchoolDemoDeliveryPreviewView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoDeliveryRehearsalPreview"), true);
  assert.equal(viewSource.includes("SchoolDemoStudentPreviewView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoStudentDeliveryPreview"), true);
  assert.equal(viewSource.includes("SchoolDemoTeacherReviewQueueView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoTeacherReviewQueuePreview"), true);
  assert.equal(viewSource.includes("SchoolDemoTeacherReviewRubricView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoTeacherReviewRubricPreview"), true);
  assert.equal(viewSource.includes("SchoolDemoClassAnalyticsView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoClassAnalyticsPreview"), true);
  assert.equal(viewSource.includes("SchoolDemoTeacherDashboardView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoTeacherDashboardPreview"), true);
  assert.equal(viewSource.includes("SchoolDemoPrintPackView"), true);
  assert.equal(viewSource.includes("buildSchoolDemoPrintPackPreview"), true);
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
  assert.equal(viewSource.includes("school-demo-assignment-drafts-rows"), true);
  assert.equal(viewSource.includes("school-demo-assignment-drafts-targets"), true);
  assert.equal(viewSource.includes("school-demo-assignment-drafts-settings"), true);
  assert.equal(viewSource.includes("school-demo-assignment-drafts-blockers"), true);
  assert.equal(viewSource.includes("school-demo-assignment-drafts-boundary"), true);
  assert.equal(viewSource.includes("school-demo-assignment-draft-detail-summary"), true);
  assert.equal(viewSource.includes("school-demo-assignment-draft-detail-settings"), true);
  assert.equal(viewSource.includes("school-demo-assignment-draft-detail-targets"), true);
  assert.equal(viewSource.includes("school-demo-assignment-draft-detail-blockers"), true);
  assert.equal(viewSource.includes("school-demo-assignment-draft-detail-boundary"), true);
  assert.equal(viewSource.includes("school-demo-assignment-planning-class-board"), true);
  assert.equal(viewSource.includes("school-demo-assignment-planning-teacher-board"), true);
  assert.equal(viewSource.includes("school-demo-assignment-planning-draft-links"), true);
  assert.equal(viewSource.includes("school-demo-assignment-planning-timeline"), true);
  assert.equal(viewSource.includes("school-demo-assignment-planning-blockers"), true);
  assert.equal(viewSource.includes("school-demo-assignment-planning-boundary"), true);
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
  assert.equal(viewSource.includes("school-demo-review-queue-controls"), true);
  assert.equal(viewSource.includes("school-demo-review-queue-summary"), true);
  assert.equal(viewSource.includes("school-demo-review-queue-table"), true);
  assert.equal(viewSource.includes("school-demo-review-queue-policy"), true);
  assert.equal(viewSource.includes("school-demo-review-queue-blockers"), true);
  assert.equal(viewSource.includes("school-demo-review-queue-boundary"), true);
  assert.equal(viewSource.includes("school-demo-review-rubric-controls"), true);
  assert.equal(viewSource.includes("school-demo-review-rubric-summary"), true);
  assert.equal(viewSource.includes("school-demo-review-rubric-table"), true);
  assert.equal(viewSource.includes("school-demo-review-rubric-context"), true);
  assert.equal(viewSource.includes("school-demo-review-rubric-blockers"), true);
  assert.equal(viewSource.includes("school-demo-review-rubric-boundary"), true);
  assert.equal(viewSource.includes("school-demo-analytics-summary"), true);
  assert.equal(viewSource.includes("school-demo-analytics-class-table"), true);
  assert.equal(viewSource.includes("school-demo-analytics-teacher-load"), true);
  assert.equal(viewSource.includes("school-demo-analytics-signal-table"), true);
  assert.equal(viewSource.includes("school-demo-analytics-blockers"), true);
  assert.equal(viewSource.includes("school-demo-analytics-boundary"), true);
  assert.equal(viewSource.includes("school-demo-teacher-dashboard-overview"), true);
  assert.equal(viewSource.includes("school-demo-teacher-dashboard-surface-map"), true);
  assert.equal(viewSource.includes("school-demo-teacher-dashboard-class-table"), true);
  assert.equal(viewSource.includes("school-demo-teacher-dashboard-zero-writes"), true);
  assert.equal(viewSource.includes("school-demo-teacher-dashboard-blockers"), true);
  assert.equal(viewSource.includes("school-demo-teacher-dashboard-boundary"), true);
  assert.equal(viewSource.includes("school-demo-print-pack-cover"), true);
  assert.equal(viewSource.includes("school-demo-print-pack-sections"), true);
  assert.equal(viewSource.includes("school-demo-print-pack-class-snapshot"), true);
  assert.equal(viewSource.includes("school-demo-print-pack-output-counters"), true);
  assert.equal(viewSource.includes("school-demo-print-pack-checklist"), true);
  assert.equal(viewSource.includes("school-demo-print-pack-boundary"), true);
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
  assert.equal(viewSource.includes("/school-demo/review-queue"), true);
  assert.equal(viewSource.includes("/school-demo/review-rubric"), true);
  assert.equal(viewSource.includes("/school-demo/analytics"), true);
  assert.equal(viewSource.includes("/school-demo/teacher-dashboard"), true);
  assert.equal(viewSource.includes("/school-demo/print-pack"), true);
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
  assert.equal(cssSource.includes(".school-demo-assignment-drafts-grid"), true);
  assert.equal(cssSource.includes(".school-demo-assignment-drafts-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-assignment-draft-detail-grid"), true);
  assert.equal(cssSource.includes(".school-demo-assignment-draft-detail-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-assignment-planning-grid"), true);
  assert.equal(cssSource.includes(".school-demo-assignment-planning-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-delivery-preview-grid"), true);
  assert.equal(cssSource.includes(".school-demo-delivery-preview-controls"), true);
  assert.equal(cssSource.includes(".school-demo-delivery-preview-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-delivery-preview-timeline"), true);
  assert.equal(cssSource.includes(".school-demo-student-preview-grid"), true);
  assert.equal(cssSource.includes(".school-demo-student-preview-controls"), true);
  assert.equal(cssSource.includes(".school-demo-student-preview-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-student-preview-workspace"), true);
  assert.equal(cssSource.includes(".school-demo-review-queue-grid"), true);
  assert.equal(cssSource.includes(".school-demo-review-queue-controls"), true);
  assert.equal(cssSource.includes(".school-demo-review-queue-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-review-queue-table"), true);
  assert.equal(cssSource.includes(".school-demo-review-rubric-grid"), true);
  assert.equal(cssSource.includes(".school-demo-review-rubric-controls"), true);
  assert.equal(cssSource.includes(".school-demo-review-rubric-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-review-rubric-table"), true);
  assert.equal(cssSource.includes(".school-demo-analytics-grid"), true);
  assert.equal(cssSource.includes(".school-demo-analytics-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-analytics-class-table"), true);
  assert.equal(cssSource.includes(".school-demo-analytics-teacher-load"), true);
  assert.equal(cssSource.includes(".school-demo-analytics-signal-table"), true);
  assert.equal(cssSource.includes(".school-demo-teacher-dashboard-grid"), true);
  assert.equal(cssSource.includes(".school-demo-teacher-dashboard-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-teacher-dashboard-surface-map"), true);
  assert.equal(cssSource.includes(".school-demo-teacher-dashboard-class-table"), true);
  assert.equal(cssSource.includes(".school-demo-teacher-dashboard-zero-writes"), true);
  assert.equal(cssSource.includes(".school-demo-print-pack-shell"), true);
  assert.equal(cssSource.includes(".school-demo-print-pack-grid"), true);
  assert.equal(cssSource.includes(".school-demo-print-pack-boundary"), true);
  assert.equal(cssSource.includes(".school-demo-print-pack-sections"), true);
  assert.equal(cssSource.includes(".school-demo-print-pack-class-snapshot"), true);
  assert.equal(cssSource.includes(".school-demo-print-pack-output-counters"), true);
  assert.equal(cssSource.includes(".school-demo-print-pack-checklist"), true);
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
  assert.equal(viewSource.includes("/school-demo/assignment-drafts"), true);
  assert.equal(viewSource.includes("/school-demo/assignment-planning"), true);
  assert.equal(viewSource.includes("/school-demo/delivery-preview"), true);
  assert.equal(viewSource.includes("/school-demo/student-preview"), true);
  assert.equal(viewSource.includes("/school-demo/review-queue"), true);
  assert.equal(viewSource.includes("/school-demo/review-rubric"), true);
  assert.equal(viewSource.includes("/school-demo/analytics"), true);
  assert.equal(viewSource.includes("/school-demo/teacher-dashboard"), true);
  assert.equal(viewSource.includes("/school-demo/print-pack"), true);
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
      `${appSource}\n${classPageSource}\n${summaryPageSource}\n${handoffPageSource}\n${pilotPageSource}\n${pilotConfigPageSource}\n${assignmentPreviewPageSource}\n${assignmentDraftsPageSource}\n${assignmentDraftDetailPageSource}\n${assignmentPlanningPageSource}\n${deliveryPreviewPageSource}\n${studentPreviewPageSource}\n${reviewQueuePageSource}\n${reviewRubricPageSource}\n${analyticsPageSource}\n${teacherDashboardPageSource}\n${printPackPageSource}\n${importPreviewPageSource}\n${rolloutPageSource}\n${viewSource}`.includes(
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
