"use client";

import { createElement, useEffect, useId, useState, type ReactNode } from "react";

import type { SchoolDemoSnapshot } from "./school-demo-contract";

type SchoolDemoTheme = "light" | "dark";

const schoolDemoThemeStorageKey = "learnika.schoolDemo.theme.v1";
const transitionResetMs = 700;

interface SchoolDemoDashboardViewProps {
  snapshot: SchoolDemoSnapshot;
  presentationStep?: SchoolDemoPresentationStepKey;
}

interface SchoolDemoClassDetailViewProps {
  classCode: string;
  snapshot: SchoolDemoSnapshot;
  presentationStep?: SchoolDemoPresentationStepKey;
}

interface SchoolDemoCompactSummaryViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoHandoffPackViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoPilotChecklistViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoPilotConfigViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoRolloutViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoImportPreviewViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoAssignmentPreviewViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoDeliveryPreviewViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoStudentPreviewViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoTeacherReviewQueueViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoTeacherReviewRubricViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoClassAnalyticsViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoTeacherDashboardViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoPrintPackViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoClassOverview {
  code: string;
  gradeLevel: number;
  studentCount: number;
  subjectGroupCodes: string[];
  teacherDemoCodes: string[];
}

interface SchoolDemoTeacherOverview {
  assignmentCount: number;
  classCodes: string[];
  demoCode: string;
  subjectGroupCodes: string[];
}

type SchoolDemoPresentationStepKey =
  "overview" | "classes" | "teacher-assignments" | "license" | "class-drilldown";

const schoolDemoPresentationStepOrder: SchoolDemoPresentationStepKey[] = [
  "overview",
  "classes",
  "teacher-assignments",
  "license",
  "class-drilldown",
];

function getSchoolDemoPresentationStepIndex(step: SchoolDemoPresentationStepKey): number {
  return schoolDemoPresentationStepOrder.indexOf(step) + 1;
}

function getSchoolDemoPresentationStepLabel(step: SchoolDemoPresentationStepKey): string {
  switch (step) {
    case "overview":
      return "Overview";
    case "classes":
      return "Classes";
    case "teacher-assignments":
      return "Teacher assignments";
    case "license":
      return "License / entitlements";
    case "class-drilldown":
      return "Class drilldown";
  }
}

interface SchoolDemoPresentationStep {
  href: string;
  key: SchoolDemoPresentationStepKey;
  label: string;
  note: string;
}

type SchoolDemoGuidedWalkthroughStepKey =
  | "overview"
  | "classes"
  | "teacher-assignments"
  | "license"
  | "summary"
  | "handoff"
  | "pilot"
  | "pilot-config"
  | "assignment-preview"
  | "delivery-preview"
  | "student-preview"
  | "review-queue"
  | "review-rubric"
  | "analytics"
  | "teacher-dashboard"
  | "print-pack"
  | "import-preview"
  | "rollout";

const schoolDemoGuidedWalkthroughStepOrder: SchoolDemoGuidedWalkthroughStepKey[] = [
  "overview",
  "classes",
  "teacher-assignments",
  "license",
  "summary",
  "handoff",
  "pilot",
  "pilot-config",
  "assignment-preview",
  "delivery-preview",
  "student-preview",
  "review-queue",
  "review-rubric",
  "analytics",
  "teacher-dashboard",
  "print-pack",
  "import-preview",
  "rollout",
];

interface SchoolDemoRosterPreviewAcceptedRow {
  classCode: string;
  demoCode: string;
  lineNumber: number;
  rowType: "student" | "teacher-assignment";
  subjectGroupCode: string;
}

interface SchoolDemoRosterPreviewRejectedRow {
  lineNumber: number;
  reason: string;
}

export interface SchoolDemoRosterImportPreviewResult {
  acceptedRows: SchoolDemoRosterPreviewAcceptedRow[];
  classRows: Array<{
    acceptedStudentRows: number;
    classCode: string;
  }>;
  rejectedRows: SchoolDemoRosterPreviewRejectedRow[];
  teacherAssignmentRows: number;
  warnings: string[];
}

export interface SchoolDemoAssignmentDraftInput {
  attemptLimit: number;
  availabilityDays: number;
  classCode: string;
  deliveryMode: "online-preview" | "print-preview";
  durationMinutes: number;
  packageCode: string;
  subjectGroupCode: string;
  teacherDemoCode: string;
}

export interface SchoolDemoAssignmentDraftPreview {
  blockedReasons: string[];
  classCode: string;
  deliveryMode: "online-preview" | "print-preview";
  draftState: "PREVIEW_READY" | "PREVIEW_BLOCKED";
  eligibleStudentCount: number;
  packageCode: string;
  reviewChecklist: string[];
  settings: {
    attemptLimit: number;
    availabilityDays: number;
    durationMinutes: number;
  };
  subjectGroupCode: string;
  teacherDemoCode: string;
}

export interface SchoolDemoDeliveryRehearsalPreview {
  blockedReasons: string[];
  channelRows: Array<{
    channelCode: string;
    note: string;
    state: "READY_FOR_REHEARSAL" | "BLOCKED_FOR_REHEARSAL";
  }>;
  classCode: string;
  deliveryMode: "online-preview" | "print-preview";
  packageCode: string;
  rehearsalState: "REHEARSAL_READY" | "REHEARSAL_BLOCKED";
  rosterRows: Array<{
    classCode: string;
    note: string;
    rehearsalState: "QUEUED_FOR_DEMO" | "BLOCKED_FOR_DEMO";
    studentDemoCode: string;
  }>;
  safetyChecklist: string[];
  settings: {
    attemptLimit: number;
    availabilityDays: number;
    durationMinutes: number;
  };
  subjectGroupCode: string;
  teacherDemoCode: string;
  timelineRows: Array<{
    note: string;
    state: "READY" | "BLOCKED" | "STOPPED";
    step: string;
  }>;
  totals: {
    blockedRows: number;
    queuedRows: number;
    writeCount: 0;
  };
}

export interface SchoolDemoStudentDeliveryPreviewInput extends SchoolDemoAssignmentDraftInput {
  studentDemoCode: string;
}

export interface SchoolDemoStudentDeliveryPreview {
  assignmentCardRows: Array<{
    label: string;
    value: string | number;
  }>;
  blockedReasons: string[];
  classCode: string;
  packageCode: string;
  previewState: "STUDENT_PREVIEW_READY" | "STUDENT_PREVIEW_BLOCKED";
  studentDemoCode: string;
  studentWorkspaceRows: Array<{
    control: string;
    note: string;
    state: "VISIBLE_DEMO_ONLY" | "DISABLED_DEMO_ONLY";
  }>;
  safetyChecklist: string[];
  teacherDemoCode: string;
  totals: {
    learnerRecordWrites: 0;
    mediaUploads: 0;
    scoreUpdates: 0;
  };
}

export type SchoolDemoTeacherReviewQueueInput = SchoolDemoAssignmentDraftInput;

export interface SchoolDemoTeacherReviewQueuePreview {
  blockedReasons: string[];
  classCode: string;
  packageCode: string;
  queueRows: Array<{
    classCode: string;
    note: string;
    reviewState: "WAITING_SYNTHETIC_REVIEW" | "BLOCKED_FOR_DEMO";
    studentDemoCode: string;
    subjectGroupCode: string;
    teacherDemoCode: string;
  }>;
  queueState: "REVIEW_QUEUE_READY" | "REVIEW_QUEUE_BLOCKED";
  reviewPolicyRows: Array<{
    policy: string;
    status: string;
  }>;
  safetyChecklist: string[];
  subjectGroupCode: string;
  teacherDemoCode: string;
  totals: {
    learnerRecordWrites: 0;
    queueItems: number;
    scoreUpdates: 0;
    teacherDecisionWrites: 0;
  };
}

export type SchoolDemoTeacherReviewRubricInput = SchoolDemoAssignmentDraftInput;

export interface SchoolDemoTeacherReviewRubricPreview {
  blockedReasons: string[];
  classCode: string;
  packageCode: string;
  queueContextRows: Array<{
    classCode: string;
    reviewState: "WAITING_SYNTHETIC_REVIEW" | "BLOCKED_FOR_DEMO";
    studentDemoCode: string;
  }>;
  rubricRows: Array<{
    area: string;
    evidence: string;
    reviewerAction: string;
    state: "DISPLAY_ONLY" | "DISABLED_DEMO_ONLY";
  }>;
  rubricState: "RUBRIC_PREVIEW_READY" | "RUBRIC_PREVIEW_BLOCKED";
  safetyChecklist: string[];
  subjectGroupCode: string;
  teacherDemoCode: string;
  totals: {
    evidenceWrites: 0;
    learnerRecordWrites: 0;
    rubricCriteria: number;
    scoreUpdates: 0;
    teacherDecisionWrites: 0;
  };
}

export interface SchoolDemoClassAnalyticsPreview {
  analyticsRows: Array<{
    classCode: string;
    enrolledStudents: number;
    gradeLevel: number;
    queueLoad: number;
    signalState: "SYNTHETIC_READY" | "SYNTHETIC_EMPTY";
    subjectGroupCount: number;
    teacherAssignmentCount: number;
  }>;
  analyticsState: "ANALYTICS_PREVIEW_READY" | "ANALYTICS_PREVIEW_BLOCKED";
  blockedReasons: string[];
  safetyChecklist: string[];
  signalRows: Array<{
    label: string;
    note: string;
    state: "DISPLAY_ONLY" | "BLOCKED";
  }>;
  teacherLoadRows: Array<{
    assignmentCount: number;
    classCodes: string[];
    demoCode: string;
    subjectGroupCodes: string[];
  }>;
  totals: {
    analyticsWrites: 0;
    classCount: number;
    enrolledStudents: number;
    evidenceWrites: 0;
    learnerRecordWrites: 0;
    productionDataCount: 0;
    queueRows: number;
    realSchoolCount: 0;
    scoreUpdates: 0;
    subjectGroupCount: number;
    teacherAssignmentCount: number;
  };
}

export interface SchoolDemoTeacherDashboardPreview {
  blockedReasons: string[];
  classRows: Array<{
    classCode: string;
    enrolledStudents: number;
    gradeLevel: number;
    queueLoad: number;
    state: "DISPLAY_ONLY" | "BLOCKED";
    teacherDemoCodes: string[];
  }>;
  dashboardState: "TEACHER_DASHBOARD_READY" | "TEACHER_DASHBOARD_BLOCKED";
  safetyChecklist: string[];
  surfaceRows: Array<{
    href: string;
    note: string;
    state: "DISPLAY_ONLY" | "STOP_GATED";
    surface: string;
  }>;
  totals: {
    analyticsWrites: 0;
    assignmentWrites: 0;
    classCount: number;
    deliveryWrites: 0;
    evidenceWrites: 0;
    importWrites: 0;
    learnerRecordWrites: 0;
    queueItems: number;
    rubricCriteria: number;
    scoreUpdates: 0;
    studentCount: number;
    subjectGroupCount: number;
    teacherCount: number;
    teacherDecisionWrites: 0;
  };
}

export interface SchoolDemoPrintPackPreview {
  boundaryRows: Array<{
    label: string;
    value: string | number;
  }>;
  checklistRows: Array<{
    item: string;
    state: "DISPLAY_ONLY" | "STOP_GATED";
  }>;
  classRows: Array<{
    classCode: string;
    enrolledStudents: number;
    gradeLevel: number;
    queueLoad: number;
    teacherDemoCodes: string[];
  }>;
  packState: "PRINT_PACK_READY" | "PRINT_PACK_BLOCKED";
  safetyChecklist: string[];
  sectionRows: Array<{
    href: string;
    note: string;
    section: string;
    state: "PRINT_READY" | "STOP_GATED";
  }>;
  totals: {
    generatedFiles: 0;
    printJobWrites: 0;
    productionDataCount: 0;
    realSchoolCount: 0;
    serverRenderJobs: 0;
    storageObjects: 0;
  };
}

interface SchoolDemoGuidedWalkthroughStep {
  actionLabel: string;
  href: string;
  key: SchoolDemoGuidedWalkthroughStepKey;
  label: string;
  note: string;
  surface: string;
}

interface SchoolDemoClassDetail extends SchoolDemoClassOverview {
  roster: Array<{
    demoCode: string;
    enrollmentState: "ENROLLED" | "WITHDRAWN";
  }>;
  teacherAssignments: Array<{
    subjectGroupCode: string;
    teacherDemoCode: string;
  }>;
}

function isSchoolDemoTheme(value: string | null): value is SchoolDemoTheme {
  return value === "light" || value === "dark";
}

function readStoredTheme(): SchoolDemoTheme {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem(schoolDemoThemeStorageKey);
  return isSchoolDemoTheme(storedTheme) ? storedTheme : "light";
}

function applyTheme(theme: SchoolDemoTheme, shouldAnimate: boolean): void {
  document.documentElement.dataset.schoolDemoTheme = theme;

  for (const shell of document.querySelectorAll<HTMLElement>(".school-demo-shell")) {
    shell.dataset.schoolDemoTheme = theme;
    shell.dataset.schoolDemoTransition = shouldAnimate ? "radiate" : "idle";

    if (shouldAnimate) {
      window.setTimeout(() => {
        if (shell.dataset.schoolDemoTransition === "radiate") {
          shell.dataset.schoolDemoTransition = "idle";
        }
      }, transitionResetMs);
    }
  }
}

function SchoolDemoThemeToggle() {
  const labelId = useId();
  const [theme, setTheme] = useState<SchoolDemoTheme>("light");
  const isDark = theme === "dark";

  useEffect(() => {
    const storedTheme = readStoredTheme();
    setTheme(storedTheme);
    applyTheme(storedTheme, false);

    return () => {
      delete document.documentElement.dataset.schoolDemoTheme;
    };
  }, []);

  function handleToggle() {
    const nextTheme: SchoolDemoTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(schoolDemoThemeStorageKey, nextTheme);
    applyTheme(nextTheme, true);
  }

  return createElement(
    "div",
    { className: "school-demo-theme-control" },
    createElement(
      "span",
      { className: "school-demo-theme-title", id: labelId },
      "РўРµРјР° РґРµРјРѕ",
    ),
    createElement(
      "button",
      {
        "aria-labelledby": labelId,
        "aria-pressed": isDark,
        className: "school-demo-theme-toggle",
        "data-theme-state": theme,
        onClick: handleToggle,
        type: "button",
      },
      createElement(
        "span",
        { "aria-hidden": "true", className: "school-demo-theme-track" },
        createElement("span", { className: "school-demo-theme-thumb" }),
      ),
      createElement(
        "span",
        { className: "school-demo-theme-label" },
        isDark ? "Р“СЂР°С„РёС‚" : "РЎРІРµС‚Р»Р°СЏ",
      ),
    ),
    createElement(
      "span",
      { className: "school-demo-theme-note" },
      "Р›РѕРєР°Р»СЊРЅРѕ РІ Р±СЂР°СѓР·РµСЂРµ",
    ),
  );
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function compareClassRecords(
  left: { code: string; gradeLevel: number },
  right: { code: string; gradeLevel: number },
): number {
  return left.gradeLevel - right.gradeLevel || left.code.localeCompare(right.code);
}

function buildClassOverviews(snapshot: SchoolDemoSnapshot): SchoolDemoClassOverview[] {
  const classes = [...snapshot.classes].sort(compareClassRecords);
  const assignments = snapshot.teacherAssignments;
  const enrollments = snapshot.studentEnrollments;

  return classes.map((schoolClass) => {
    const classAssignments = assignments.filter(
      (assignment) => assignment.classCode === schoolClass.code,
    );
    const classEnrollments = enrollments.filter(
      (enrollment) => enrollment.classCode === schoolClass.code,
    );
    return {
      code: schoolClass.code,
      gradeLevel: schoolClass.gradeLevel,
      studentCount: classEnrollments.length,
      subjectGroupCodes: uniqueSorted(
        classAssignments.map((assignment) => assignment.subjectGroupCode),
      ),
      teacherDemoCodes: uniqueSorted(
        classAssignments.map((assignment) => assignment.teacherDemoCode),
      ),
    };
  });
}

function buildTeacherOverviews(snapshot: SchoolDemoSnapshot): SchoolDemoTeacherOverview[] {
  return [...snapshot.teachers]
    .sort((left, right) => left.demoCode.localeCompare(right.demoCode))
    .map((teacher) => {
      const teacherAssignments = snapshot.teacherAssignments.filter(
        (assignment) => assignment.teacherDemoCode === teacher.demoCode,
      );
      return {
        assignmentCount: teacherAssignments.length,
        classCodes: uniqueSorted(teacherAssignments.map((assignment) => assignment.classCode)),
        demoCode: teacher.demoCode,
        subjectGroupCodes: uniqueSorted(
          teacherAssignments.map((assignment) => assignment.subjectGroupCode),
        ),
      };
    });
}

function buildSchoolDemoRosterImportSample(snapshot: SchoolDemoSnapshot): string {
  const studentRows = [...snapshot.students]
    .sort(
      (left, right) =>
        left.classCode.localeCompare(right.classCode) ||
        left.demoCode.localeCompare(right.demoCode),
    )
    .slice(0, 6)
    .map((student) => {
      const subjectGroupCode =
        snapshot.teacherAssignments.find((assignment) => assignment.classCode === student.classCode)
          ?.subjectGroupCode ?? snapshot.subjectGroups[0]?.code;
      return ["student", student.demoCode, student.classCode, subjectGroupCode].join(",");
    });
  const teacherRows = [...snapshot.teacherAssignments]
    .sort(
      (left, right) =>
        left.classCode.localeCompare(right.classCode) ||
        left.teacherDemoCode.localeCompare(right.teacherDemoCode),
    )
    .slice(0, 3)
    .map((assignment) =>
      [
        "teacher-assignment",
        assignment.teacherDemoCode,
        assignment.classCode,
        assignment.subjectGroupCode,
      ].join(","),
    );

  return ["rowType,demoCode,classCode,subjectGroupCode", ...studentRows, ...teacherRows].join("\n");
}

function isBlockedRosterPreviewValue(value: string): boolean {
  return (
    value.length > 96 ||
    value.includes("@") ||
    /(?:https?|s3|minio|file):\/\//i.test(value) ||
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3,4}-[0-9a-f]{3,4}-[0-9a-f]{12}\b/i.test(value) ||
    /\b[0-9a-f]{32,}\b/i.test(value) ||
    /\s{2,}/.test(value)
  );
}

export function parseSchoolDemoRosterImportPreview(
  csvText: string,
  snapshot: SchoolDemoSnapshot,
): SchoolDemoRosterImportPreviewResult {
  const classCodes = new Set(snapshot.classes.map((schoolClass) => schoolClass.code));
  const subjectGroupCodes = new Set(
    snapshot.subjectGroups.map((subjectGroup) => subjectGroup.code),
  );
  const teacherCodes = new Set(snapshot.teachers.map((teacher) => teacher.demoCode));
  const studentCodes = new Set(snapshot.students.map((student) => student.demoCode));
  const warnings: string[] = [];
  const acceptedRows: SchoolDemoRosterPreviewAcceptedRow[] = [];
  const rejectedRows: SchoolDemoRosterPreviewRejectedRow[] = [];
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const expectedHeader = "rowType,demoCode,classCode,subjectGroupCode";

  if (lines.length === 0) {
    return {
      acceptedRows,
      classRows: [],
      rejectedRows: [{ lineNumber: 1, reason: "CSV preview is empty." }],
      teacherAssignmentRows: 0,
      warnings: ["Nothing was saved. Add synthetic demo rows to preview the import shape."],
    };
  }

  if (lines[0] !== expectedHeader) {
    return {
      acceptedRows,
      classRows: [],
      rejectedRows: [{ lineNumber: 1, reason: "Header must match the approved demo CSV layout." }],
      teacherAssignmentRows: 0,
      warnings: ["Nothing was saved. This preview accepts only the fixed synthetic CSV layout."],
    };
  }

  for (const [index, line] of lines.slice(1, 51).entries()) {
    const lineNumber = index + 2;
    const cells = line.split(",").map((cell) => cell.trim());
    const [rowType, demoCode, classCode, subjectGroupCode] = cells;

    if (cells.length !== 4 || !rowType || !demoCode || !classCode || !subjectGroupCode) {
      rejectedRows.push({ lineNumber, reason: "Row must contain four non-empty cells." });
      continue;
    }

    if (cells.some(isBlockedRosterPreviewValue)) {
      rejectedRows.push({
        lineNumber,
        reason: "Row contains contact data, external reference, raw identity or unsupported text.",
      });
      continue;
    }

    if (rowType !== "student" && rowType !== "teacher-assignment") {
      rejectedRows.push({ lineNumber, reason: "Row type must be student or teacher-assignment." });
      continue;
    }

    if (!classCodes.has(classCode)) {
      rejectedRows.push({ lineNumber, reason: "Class code is outside the synthetic snapshot." });
      continue;
    }

    if (!subjectGroupCodes.has(subjectGroupCode)) {
      rejectedRows.push({
        lineNumber,
        reason: "Subject group code is outside the synthetic snapshot.",
      });
      continue;
    }

    if (rowType === "student" && !studentCodes.has(demoCode)) {
      rejectedRows.push({ lineNumber, reason: "Student demo code is not in the snapshot." });
      continue;
    }

    if (rowType === "teacher-assignment" && !teacherCodes.has(demoCode)) {
      rejectedRows.push({ lineNumber, reason: "Teacher demo code is not in the snapshot." });
      continue;
    }

    acceptedRows.push({ classCode, demoCode, lineNumber, rowType, subjectGroupCode });
  }

  if (lines.length > 52) {
    warnings.push("Only the first 50 data rows are previewed to keep the demo bounded.");
  }

  warnings.push(
    "Preview only: no upload, no server save, no tenant write and no real school data.",
  );

  return {
    acceptedRows,
    classRows: [...classCodes]
      .sort((left, right) => left.localeCompare(right))
      .map((classCode) => ({
        acceptedStudentRows: acceptedRows.filter(
          (row) => row.rowType === "student" && row.classCode === classCode,
        ).length,
        classCode,
      })),
    rejectedRows,
    teacherAssignmentRows: acceptedRows.filter((row) => row.rowType === "teacher-assignment")
      .length,
    warnings,
  };
}

const schoolDemoAssignmentPackageOptions = [
  "grade-7-linear-practice-demo",
  "grade-8-functions-check-demo",
  "grade-9-oge-warmup-demo",
] as const;

function buildDefaultSchoolDemoAssignmentInput(
  snapshot: SchoolDemoSnapshot,
): SchoolDemoAssignmentDraftInput {
  const firstClass = [...snapshot.classes].sort(compareClassRecords)[0];
  const firstAssignment = snapshot.teacherAssignments.find(
    (assignment) => assignment.classCode === firstClass?.code,
  );

  return {
    attemptLimit: 2,
    availabilityDays: 7,
    classCode: firstClass?.code ?? "",
    deliveryMode: "online-preview",
    durationMinutes: 45,
    packageCode: schoolDemoAssignmentPackageOptions[0],
    subjectGroupCode: firstAssignment?.subjectGroupCode ?? snapshot.subjectGroups[0]?.code ?? "",
    teacherDemoCode: firstAssignment?.teacherDemoCode ?? snapshot.teachers[0]?.demoCode ?? "",
  };
}

function isSafeAssignmentPackageCode(value: string): boolean {
  return schoolDemoAssignmentPackageOptions.includes(
    value as (typeof schoolDemoAssignmentPackageOptions)[number],
  );
}

export function buildSchoolDemoAssignmentDraftPreview(
  input: SchoolDemoAssignmentDraftInput,
  snapshot: SchoolDemoSnapshot,
): SchoolDemoAssignmentDraftPreview {
  const classCodes = new Set(snapshot.classes.map((schoolClass) => schoolClass.code));
  const subjectGroupCodes = new Set(
    snapshot.subjectGroups.map((subjectGroup) => subjectGroup.code),
  );
  const teacherCodes = new Set(snapshot.teachers.map((teacher) => teacher.demoCode));
  const blockedReasons: string[] = [];
  const matchingAssignment = snapshot.teacherAssignments.find(
    (assignment) =>
      assignment.classCode === input.classCode &&
      assignment.subjectGroupCode === input.subjectGroupCode &&
      assignment.teacherDemoCode === input.teacherDemoCode,
  );

  if (!classCodes.has(input.classCode)) blockedReasons.push("Class code is outside the snapshot.");
  if (!subjectGroupCodes.has(input.subjectGroupCode)) {
    blockedReasons.push("Subject group code is outside the snapshot.");
  }
  if (!teacherCodes.has(input.teacherDemoCode)) {
    blockedReasons.push("Teacher demo code is outside the snapshot.");
  }
  if (!matchingAssignment) {
    blockedReasons.push("Teacher, class and subject group are not linked in the snapshot.");
  }
  if (!isSafeAssignmentPackageCode(input.packageCode)) {
    blockedReasons.push("Package code is outside the fixed demo options.");
  }
  if (![1, 2, 3].includes(input.attemptLimit)) {
    blockedReasons.push("Attempt limit must be 1, 2 or 3.");
  }
  if (![3, 5, 7, 14].includes(input.availabilityDays)) {
    blockedReasons.push("Availability window must use an approved demo value.");
  }
  if (![30, 45, 60].includes(input.durationMinutes)) {
    blockedReasons.push("Duration must use an approved demo value.");
  }
  if (input.deliveryMode !== "online-preview" && input.deliveryMode !== "print-preview") {
    blockedReasons.push("Delivery mode must remain a preview-only mode.");
  }

  return {
    blockedReasons,
    classCode: input.classCode,
    deliveryMode: input.deliveryMode,
    draftState: blockedReasons.length === 0 ? "PREVIEW_READY" : "PREVIEW_BLOCKED",
    eligibleStudentCount: snapshot.students.filter(
      (student) => student.classCode === input.classCode,
    ).length,
    packageCode: input.packageCode,
    reviewChecklist: [
      "Preview only: no assignment is saved.",
      "Uses synthetic class, teacher and subject group codes only.",
      "No task text, worked examples, grading or learner submissions are created.",
      "Real assignment delivery remains blocked until school beta gates are approved.",
    ],
    settings: {
      attemptLimit: input.attemptLimit,
      availabilityDays: input.availabilityDays,
      durationMinutes: input.durationMinutes,
    },
    subjectGroupCode: input.subjectGroupCode,
    teacherDemoCode: input.teacherDemoCode,
  };
}

export function buildSchoolDemoDeliveryRehearsalPreview(
  input: SchoolDemoAssignmentDraftInput,
  snapshot: SchoolDemoSnapshot,
): SchoolDemoDeliveryRehearsalPreview {
  const assignmentPreview = buildSchoolDemoAssignmentDraftPreview(input, snapshot);
  const blockedReasons = [...assignmentPreview.blockedReasons];

  if (snapshot.boundary.mutationAllowed !== false) {
    blockedReasons.push("Mutation boundary must stay closed.");
  }
  if (snapshot.boundary.productionDataCount !== 0) {
    blockedReasons.push("Production data count must stay zero.");
  }
  if (snapshot.boundary.realSchoolCount !== 0) {
    blockedReasons.push("Real school count must stay zero.");
  }
  if (snapshot.boundary.activation !== "BLOCKED" || snapshot.boundary.readiness !== "NOT_READY") {
    blockedReasons.push("Readiness and activation gates must stay closed.");
  }

  const classRoster = snapshot.students
    .filter((student) => student.classCode === input.classCode)
    .sort((left, right) => left.demoCode.localeCompare(right.demoCode));
  const isReady = blockedReasons.length === 0;
  const rosterRows: SchoolDemoDeliveryRehearsalPreview["rosterRows"] = classRoster.map(
    (student) => ({
      classCode: student.classCode,
      note: isReady
        ? "Queued in browser-only rehearsal; no learner delivery exists."
        : "Blocked because the local rehearsal did not pass every gate.",
      rehearsalState: isReady ? "QUEUED_FOR_DEMO" : "BLOCKED_FOR_DEMO",
      studentDemoCode: student.demoCode,
    }),
  );
  const channelRows = [
    {
      channelCode: "browser-demo",
      note:
        input.deliveryMode === "online-preview" && isReady
          ? "Selected for local browser rehearsal only."
          : "Available as preview metadata; no server delivery.",
      state:
        input.deliveryMode === "online-preview" && isReady
          ? "READY_FOR_REHEARSAL"
          : "BLOCKED_FOR_REHEARSAL",
    },
    {
      channelCode: "paper-pack-demo",
      note:
        input.deliveryMode === "print-preview" && isReady
          ? "Selected for paper-pack rehearsal only."
          : "Available as preview metadata; no generated packet.",
      state:
        input.deliveryMode === "print-preview" && isReady
          ? "READY_FOR_REHEARSAL"
          : "BLOCKED_FOR_REHEARSAL",
    },
  ] satisfies SchoolDemoDeliveryRehearsalPreview["channelRows"];

  return {
    blockedReasons,
    channelRows,
    classCode: input.classCode,
    deliveryMode: input.deliveryMode,
    packageCode: input.packageCode,
    rehearsalState: isReady ? "REHEARSAL_READY" : "REHEARSAL_BLOCKED",
    rosterRows,
    safetyChecklist: [
      "Browser-only rehearsal: no assignment is saved.",
      "No learner task, grading, delivery event or school record is created.",
      "Roster rows use synthetic demo codes only.",
      "Real school delivery remains blocked until a later approved beta gate.",
    ],
    settings: assignmentPreview.settings,
    subjectGroupCode: input.subjectGroupCode,
    teacherDemoCode: input.teacherDemoCode,
    timelineRows: [
      {
        note: isReady ? "Synthetic draft passes local checks." : "Synthetic draft is blocked.",
        state: isReady ? "READY" : "BLOCKED",
        step: "Draft check",
      },
      {
        note: isReady
          ? `${rosterRows.length} synthetic roster rows queued for demo.`
          : "Roster queue remains closed.",
        state: isReady ? "READY" : "BLOCKED",
        step: "Roster queue",
      },
      {
        note: "No send, save, invite, notification or learner session is triggered.",
        state: "STOPPED",
        step: "Stop gate",
      },
    ],
    totals: {
      blockedRows: rosterRows.filter((row) => row.rehearsalState === "BLOCKED_FOR_DEMO").length,
      queuedRows: rosterRows.filter((row) => row.rehearsalState === "QUEUED_FOR_DEMO").length,
      writeCount: 0,
    },
  };
}

function buildDefaultSchoolDemoStudentDeliveryInput(
  snapshot: SchoolDemoSnapshot,
): SchoolDemoStudentDeliveryPreviewInput {
  const defaultDraft = buildDefaultSchoolDemoAssignmentInput(snapshot);
  const defaultStudent = snapshot.students
    .filter((student) => student.classCode === defaultDraft.classCode)
    .sort((left, right) => left.demoCode.localeCompare(right.demoCode))[0];

  return {
    ...defaultDraft,
    studentDemoCode: defaultStudent?.demoCode ?? snapshot.students[0]?.demoCode ?? "",
  };
}

export function buildSchoolDemoStudentDeliveryPreview(
  input: SchoolDemoStudentDeliveryPreviewInput,
  snapshot: SchoolDemoSnapshot,
): SchoolDemoStudentDeliveryPreview {
  const deliveryPreview = buildSchoolDemoDeliveryRehearsalPreview(input, snapshot);
  const blockedReasons = [...deliveryPreview.blockedReasons];
  const student = snapshot.students.find((entry) => entry.demoCode === input.studentDemoCode);

  if (!student) {
    blockedReasons.push("Student demo code is outside the snapshot.");
  } else if (student.classCode !== input.classCode) {
    blockedReasons.push("Student demo code is not enrolled in the selected class.");
  }

  const isReady = blockedReasons.length === 0;

  return {
    assignmentCardRows: [
      { label: "Student", value: input.studentDemoCode || "BLOCKED" },
      { label: "Class", value: input.classCode || "BLOCKED" },
      { label: "Teacher", value: input.teacherDemoCode || "BLOCKED" },
      { label: "Subject group", value: input.subjectGroupCode || "BLOCKED" },
      { label: "Package", value: input.packageCode || "BLOCKED" },
      { label: "Mode", value: input.deliveryMode },
      { label: "Attempt limit", value: input.attemptLimit },
      { label: "Duration minutes", value: input.durationMinutes },
      { label: "Availability days", value: input.availabilityDays },
    ],
    blockedReasons,
    classCode: input.classCode,
    packageCode: input.packageCode,
    previewState: isReady ? "STUDENT_PREVIEW_READY" : "STUDENT_PREVIEW_BLOCKED",
    studentDemoCode: input.studentDemoCode,
    studentWorkspaceRows: [
      {
        control: "Assignment card",
        note: isReady
          ? "Visible with synthetic package metadata only."
          : "Hidden until the local rehearsal is valid.",
        state: isReady ? "VISIBLE_DEMO_ONLY" : "DISABLED_DEMO_ONLY",
      },
      {
        control: "Work area",
        note: "Disabled in this demo; no learner input is collected.",
        state: "DISABLED_DEMO_ONLY",
      },
      {
        control: "Media upload",
        note: "Disabled in this demo; no file or raw media path exists.",
        state: "DISABLED_DEMO_ONLY",
      },
      {
        control: "Teacher review",
        note: "Stopped at preview; no grade, score or review record exists.",
        state: "DISABLED_DEMO_ONLY",
      },
    ],
    safetyChecklist: [
      "Student preview uses synthetic demo codes only.",
      "No learner attempt, media upload, grade, score or mastery change is created.",
      "No task body, worked steps or copied textbook material is shown.",
      "Real student access remains blocked until a later approved school beta gate.",
    ],
    teacherDemoCode: input.teacherDemoCode,
    totals: {
      learnerRecordWrites: 0,
      mediaUploads: 0,
      scoreUpdates: 0,
    },
  };
}

function buildDefaultSchoolDemoTeacherReviewQueueInput(
  snapshot: SchoolDemoSnapshot,
): SchoolDemoTeacherReviewQueueInput {
  return buildDefaultSchoolDemoAssignmentInput(snapshot);
}

export function buildSchoolDemoTeacherReviewQueuePreview(
  input: SchoolDemoTeacherReviewQueueInput,
  snapshot: SchoolDemoSnapshot,
): SchoolDemoTeacherReviewQueuePreview {
  const deliveryPreview = buildSchoolDemoDeliveryRehearsalPreview(input, snapshot);
  const blockedReasons = [...deliveryPreview.blockedReasons];
  const isReady = blockedReasons.length === 0;
  const queueRows = isReady
    ? snapshot.students
        .filter((student) => student.classCode === input.classCode)
        .sort((left, right) => left.demoCode.localeCompare(right.demoCode))
        .map((student) => ({
          classCode: student.classCode,
          note: "Placeholder row only; no learner work, grade, score or teacher decision exists.",
          reviewState: "WAITING_SYNTHETIC_REVIEW" as const,
          studentDemoCode: student.demoCode,
          subjectGroupCode: input.subjectGroupCode,
          teacherDemoCode: input.teacherDemoCode,
        }))
    : [];

  return {
    blockedReasons,
    classCode: input.classCode,
    packageCode: input.packageCode,
    queueRows,
    queueState: isReady ? "REVIEW_QUEUE_READY" : "REVIEW_QUEUE_BLOCKED",
    reviewPolicyRows: [
      {
        policy: "Queue source",
        status: "Synthetic class roster only.",
      },
      {
        policy: "Teacher action",
        status: "Disabled; no grade, score or decision writes.",
      },
      {
        policy: "Learner data",
        status: "Demo codes only; no learner work is collected.",
      },
      {
        policy: "Stop gate",
        status: "Real review workflow waits for a later approved school beta gate.",
      },
    ],
    safetyChecklist: [
      "Review queue preview uses synthetic class and teacher demo codes only.",
      "No learner work, upload, grade, score, teacher decision or mastery change is created.",
      "No task body, worked steps, model text or copied textbook material is shown.",
      "Real teacher review remains blocked until a later approved school beta gate.",
    ],
    subjectGroupCode: input.subjectGroupCode,
    teacherDemoCode: input.teacherDemoCode,
    totals: {
      learnerRecordWrites: 0,
      queueItems: queueRows.length,
      scoreUpdates: 0,
      teacherDecisionWrites: 0,
    },
  };
}

function buildDefaultSchoolDemoTeacherReviewRubricInput(
  snapshot: SchoolDemoSnapshot,
): SchoolDemoTeacherReviewRubricInput {
  return buildDefaultSchoolDemoAssignmentInput(snapshot);
}

export function buildSchoolDemoTeacherReviewRubricPreview(
  input: SchoolDemoTeacherReviewRubricInput,
  snapshot: SchoolDemoSnapshot,
): SchoolDemoTeacherReviewRubricPreview {
  const queuePreview = buildSchoolDemoTeacherReviewQueuePreview(input, snapshot);
  const rubricRows: SchoolDemoTeacherReviewRubricPreview["rubricRows"] = [
    {
      area: "Attempt presence",
      evidence: "Synthetic queue row placeholder only; no learner work is available.",
      reviewerAction: "Disabled until a future approved teacher review workflow exists.",
      state: "DISPLAY_ONLY",
    },
    {
      area: "Reasoning trace",
      evidence: "No learner text or worked steps are shown in the demo.",
      reviewerAction: "Disabled; teacher notes are not saved.",
      state: "DISABLED_DEMO_ONLY",
    },
    {
      area: "Mathematical check",
      evidence: "No deterministic check is run from this preview page.",
      reviewerAction: "Disabled; no grade or score update exists.",
      state: "DISABLED_DEMO_ONLY",
    },
    {
      area: "Manual review",
      evidence: "Teacher confirmation is represented as a stop gate only.",
      reviewerAction: "Disabled; no teacher decision record is created.",
      state: "DISABLED_DEMO_ONLY",
    },
    {
      area: "Escalation",
      evidence: "Ambiguous work would require a future human-review path.",
      reviewerAction: "Disabled; escalation remains outside this demo.",
      state: "DISABLED_DEMO_ONLY",
    },
  ];

  return {
    blockedReasons: [...queuePreview.blockedReasons],
    classCode: input.classCode,
    packageCode: input.packageCode,
    queueContextRows: queuePreview.queueRows.map((row) => ({
      classCode: row.classCode,
      reviewState: row.reviewState,
      studentDemoCode: row.studentDemoCode,
    })),
    rubricRows,
    rubricState:
      queuePreview.queueState === "REVIEW_QUEUE_READY"
        ? "RUBRIC_PREVIEW_READY"
        : "RUBRIC_PREVIEW_BLOCKED",
    safetyChecklist: [
      "Rubric preview uses synthetic queue rows and demo codes only.",
      "No learner work, teacher notes, grade, score or review decision is created.",
      "No task body, worked steps, model text or copied textbook material is shown.",
      "Real rubric-assisted review remains blocked until a later approved school beta gate.",
    ],
    subjectGroupCode: input.subjectGroupCode,
    teacherDemoCode: input.teacherDemoCode,
    totals: {
      evidenceWrites: 0,
      learnerRecordWrites: 0,
      rubricCriteria: rubricRows.length,
      scoreUpdates: 0,
      teacherDecisionWrites: 0,
    },
  };
}

export function buildSchoolDemoClassAnalyticsPreview(
  snapshot: SchoolDemoSnapshot,
): SchoolDemoClassAnalyticsPreview {
  const classOverviews = buildClassOverviews(snapshot);
  const teacherOverviews = buildTeacherOverviews(snapshot);
  const blockedReasons: string[] = [];

  if (snapshot.boundary.readiness !== "NOT_READY") {
    blockedReasons.push("Readiness boundary is not in the expected NOT_READY state.");
  }
  if (snapshot.boundary.activation !== "BLOCKED") {
    blockedReasons.push("Activation boundary is not in the expected BLOCKED state.");
  }
  if (snapshot.boundary.workflow !== "INACTIVE") {
    blockedReasons.push("Workflow boundary is not in the expected INACTIVE state.");
  }
  if (snapshot.boundary.productionDataCount !== 0 || snapshot.boundary.realSchoolCount !== 0) {
    blockedReasons.push("Snapshot must contain zero production data and zero real schools.");
  }
  if (classOverviews.length === 0) {
    blockedReasons.push("Synthetic class roster is empty.");
  }

  const analyticsRows = classOverviews.map((schoolClass) => ({
    classCode: schoolClass.code,
    enrolledStudents: schoolClass.studentCount,
    gradeLevel: schoolClass.gradeLevel,
    queueLoad: snapshot.students.filter((student) => student.classCode === schoolClass.code).length,
    signalState:
      schoolClass.studentCount > 0 ? ("SYNTHETIC_READY" as const) : ("SYNTHETIC_EMPTY" as const),
    subjectGroupCount: schoolClass.subjectGroupCodes.length,
    teacherAssignmentCount: snapshot.teacherAssignments.filter(
      (assignment) => assignment.classCode === schoolClass.code,
    ).length,
  }));

  return {
    analyticsRows,
    analyticsState:
      blockedReasons.length === 0 ? "ANALYTICS_PREVIEW_READY" : "ANALYTICS_PREVIEW_BLOCKED",
    blockedReasons,
    safetyChecklist: [
      "Class analytics preview uses synthetic class, teacher and student demo codes only.",
      "Counts are derived from the local read-only school snapshot.",
      "No grades, teacher decisions, evidence, learner records or score changes are created.",
      "No learner work, answers, solutions, hints, raw media or copied textbook material is shown.",
      "Real class analytics remains blocked until a later approved school beta gate.",
    ],
    signalRows: [
      {
        label: "Roster coverage",
        note: "Shows synthetic enrolled-student counts by class only.",
        state: "DISPLAY_ONLY",
      },
      {
        label: "Teacher load",
        note: "Shows synthetic assignment counts without naming real people.",
        state: "DISPLAY_ONLY",
      },
      {
        label: "Review queue load",
        note: "Uses placeholder queue row counts; no learner work is visible.",
        state: "DISPLAY_ONLY",
      },
      {
        label: "License boundary",
        note: "Shows planned demo entitlements only; no paid or production grant exists.",
        state: "DISPLAY_ONLY",
      },
      {
        label: "Stop gate",
        note: "Readiness stays NOT_READY and activation stays BLOCKED.",
        state: blockedReasons.length === 0 ? "DISPLAY_ONLY" : "BLOCKED",
      },
    ],
    teacherLoadRows: teacherOverviews.map((teacher) => ({
      assignmentCount: teacher.assignmentCount,
      classCodes: teacher.classCodes,
      demoCode: teacher.demoCode,
      subjectGroupCodes: teacher.subjectGroupCodes,
    })),
    totals: {
      analyticsWrites: 0,
      classCount: classOverviews.length,
      enrolledStudents: classOverviews.reduce(
        (total, schoolClass) => total + schoolClass.studentCount,
        0,
      ),
      evidenceWrites: 0,
      learnerRecordWrites: 0,
      productionDataCount: snapshot.boundary.productionDataCount,
      queueRows: analyticsRows.reduce((total, row) => total + row.queueLoad, 0),
      realSchoolCount: snapshot.boundary.realSchoolCount,
      scoreUpdates: 0,
      subjectGroupCount: snapshot.subjectGroups.length,
      teacherAssignmentCount: snapshot.teacherAssignments.length,
    },
  };
}

export function buildSchoolDemoTeacherDashboardPreview(
  snapshot: SchoolDemoSnapshot,
): SchoolDemoTeacherDashboardPreview {
  const classOverviews = buildClassOverviews(snapshot);
  const defaultInput = buildDefaultSchoolDemoAssignmentInput(snapshot);
  const assignmentPreview = buildSchoolDemoAssignmentDraftPreview(defaultInput, snapshot);
  const deliveryPreview = buildSchoolDemoDeliveryRehearsalPreview(defaultInput, snapshot);
  const reviewQueuePreview = buildSchoolDemoTeacherReviewQueuePreview(defaultInput, snapshot);
  const reviewRubricPreview = buildSchoolDemoTeacherReviewRubricPreview(defaultInput, snapshot);
  const analyticsPreview = buildSchoolDemoClassAnalyticsPreview(snapshot);
  const blockedReasons = uniqueSorted([
    ...assignmentPreview.blockedReasons,
    ...deliveryPreview.blockedReasons,
    ...reviewQueuePreview.blockedReasons,
    ...reviewRubricPreview.blockedReasons,
    ...analyticsPreview.blockedReasons,
  ]);

  return {
    blockedReasons,
    classRows: classOverviews.map((schoolClass) => ({
      classCode: schoolClass.code,
      enrolledStudents: schoolClass.studentCount,
      gradeLevel: schoolClass.gradeLevel,
      queueLoad: snapshot.students.filter((student) => student.classCode === schoolClass.code)
        .length,
      state: schoolClass.studentCount > 0 ? ("DISPLAY_ONLY" as const) : ("BLOCKED" as const),
      teacherDemoCodes: schoolClass.teacherDemoCodes,
    })),
    dashboardState:
      blockedReasons.length === 0 ? "TEACHER_DASHBOARD_READY" : "TEACHER_DASHBOARD_BLOCKED",
    safetyChecklist: [
      "Teacher dashboard uses synthetic class, teacher and student demo codes only.",
      "Every linked surface is read-only and display-only.",
      "No assignment, delivery, import, evidence, grade, score or teacher decision is created.",
      "No learner work, answers, solutions, hints, raw media or copied textbook material is shown.",
      "Real teacher dashboard remains blocked until a later approved school beta gate.",
    ],
    surfaceRows: [
      {
        href: "/school-demo/assignment-preview",
        note: "Draft shell only; no saved assignment.",
        state: "DISPLAY_ONLY",
        surface: "Assignment preview",
      },
      {
        href: "/school-demo/delivery-preview",
        note: "Rehearsal shell only; no send or learner session.",
        state: "DISPLAY_ONLY",
        surface: "Delivery rehearsal",
      },
      {
        href: "/school-demo/student-preview",
        note: "Student view shell only; no learner input.",
        state: "DISPLAY_ONLY",
        surface: "Student preview",
      },
      {
        href: "/school-demo/review-queue",
        note: "Queue shell only; no teacher decision.",
        state: "DISPLAY_ONLY",
        surface: "Review queue",
      },
      {
        href: "/school-demo/review-rubric",
        note: "Rubric shell only; no notes, grades or scores.",
        state: "DISPLAY_ONLY",
        surface: "Review rubric",
      },
      {
        href: "/school-demo/analytics",
        note: "Count signals only; no learner analytics record.",
        state: "DISPLAY_ONLY",
        surface: "Class analytics",
      },
      {
        href: "/school-demo/import-preview",
        note: "Local CSV preview only; no upload.",
        state: "DISPLAY_ONLY",
        surface: "Import preview",
      },
      {
        href: "/school-demo/rollout",
        note: "Rollout discussion only; real beta gate remains closed.",
        state: "STOP_GATED",
        surface: "Rollout preview",
      },
    ],
    totals: {
      analyticsWrites: analyticsPreview.totals.analyticsWrites,
      assignmentWrites: 0,
      classCount: classOverviews.length,
      deliveryWrites: deliveryPreview.totals.writeCount,
      evidenceWrites: 0,
      importWrites: 0,
      learnerRecordWrites: 0,
      queueItems: reviewQueuePreview.totals.queueItems,
      rubricCriteria: reviewRubricPreview.totals.rubricCriteria,
      scoreUpdates: 0,
      studentCount: analyticsPreview.totals.enrolledStudents,
      subjectGroupCount: analyticsPreview.totals.subjectGroupCount,
      teacherCount: snapshot.teachers.length,
      teacherDecisionWrites: 0,
    },
  };
}

export function buildSchoolDemoPrintPackPreview(
  snapshot: SchoolDemoSnapshot,
): SchoolDemoPrintPackPreview {
  const teacherDashboard = buildSchoolDemoTeacherDashboardPreview(snapshot);
  const blockedReasons = [
    snapshot.boundary.readiness !== "NOT_READY" ? "Readiness boundary must stay NOT_READY." : null,
    snapshot.boundary.activation !== "BLOCKED" ? "Activation boundary must stay BLOCKED." : null,
    snapshot.boundary.workflow !== "INACTIVE" ? "Workflow boundary must stay INACTIVE." : null,
    teacherDashboard.dashboardState !== "TEACHER_DASHBOARD_READY"
      ? "Teacher dashboard preview must be ready before the print pack is useful."
      : null,
  ].filter((item): item is string => item !== null);

  return {
    boundaryRows: [
      { label: "Marker", value: snapshot.marker },
      { label: "Readiness", value: snapshot.boundary.readiness },
      { label: "Activation", value: snapshot.boundary.activation },
      { label: "Workflow", value: snapshot.boundary.workflow },
      { label: "Production data", value: snapshot.boundary.productionDataCount },
      { label: "Real schools", value: snapshot.boundary.realSchoolCount },
    ],
    checklistRows: [
      {
        item: "Use browser print dialog only.",
        state: "DISPLAY_ONLY",
      },
      {
        item: "Keep synthetic boundary visible on every printed page.",
        state: "DISPLAY_ONLY",
      },
      {
        item: "Do not generate a server file or storage object.",
        state: "DISPLAY_ONLY",
      },
      {
        item: "Do not include learner work, grades, answers, solutions or hints.",
        state: "DISPLAY_ONLY",
      },
      {
        item: "Real school pilot materials wait for a later approved beta gate.",
        state: "STOP_GATED",
      },
    ],
    classRows: teacherDashboard.classRows.map((row) => ({
      classCode: row.classCode,
      enrolledStudents: row.enrolledStudents,
      gradeLevel: row.gradeLevel,
      queueLoad: row.queueLoad,
      teacherDemoCodes: row.teacherDemoCodes,
    })),
    packState: blockedReasons.length === 0 ? "PRINT_PACK_READY" : "PRINT_PACK_BLOCKED",
    safetyChecklist: [
      "Print pack uses synthetic demo codes only.",
      "Browser print is the only intended output path.",
      "No generated file, server render job or storage object is created.",
      "No learner work, grade, score, evidence or teacher decision is shown.",
      "Real school pilot print materials remain blocked until a later approved school beta gate.",
      ...blockedReasons,
    ],
    sectionRows: [
      {
        href: "/school-demo/summary",
        note: "One-screen school summary for meeting context.",
        section: "Compact summary",
        state: "PRINT_READY",
      },
      {
        href: "/school-demo/handoff",
        note: "Teacher and admin handoff notes.",
        section: "Handoff pack",
        state: "PRINT_READY",
      },
      {
        href: "/school-demo/teacher-dashboard",
        note: "Consolidated teacher view and stop gates.",
        section: "Teacher dashboard",
        state: "PRINT_READY",
      },
      {
        href: "/school-demo/analytics",
        note: "Synthetic class counts and load signals.",
        section: "Class analytics",
        state: "PRINT_READY",
      },
      {
        href: "/school-demo/pilot",
        note: "Future pilot checklist and FAQ.",
        section: "Pilot checklist",
        state: "PRINT_READY",
      },
      {
        href: "/school-demo/rollout",
        note: "Pilot phases and rollout assumptions.",
        section: "Rollout preview",
        state: "PRINT_READY",
      },
      {
        href: "/school-demo/import-preview",
        note: "Local synthetic CSV preview; no upload.",
        section: "Import preview",
        state: "STOP_GATED",
      },
    ],
    totals: {
      generatedFiles: 0,
      printJobWrites: 0,
      productionDataCount: snapshot.boundary.productionDataCount,
      realSchoolCount: snapshot.boundary.realSchoolCount,
      serverRenderJobs: 0,
      storageObjects: 0,
    },
  };
}

function buildClassDetail(
  snapshot: SchoolDemoSnapshot,
  classCode: string,
): SchoolDemoClassDetail | null {
  const schoolClass = snapshot.classes.find((entry) => entry.code === classCode);
  if (!schoolClass) return null;

  const teacherAssignments = snapshot.teacherAssignments.filter(
    (assignment) => assignment.classCode === classCode,
  );
  const enrollments = snapshot.studentEnrollments.filter(
    (enrollment) => enrollment.classCode === classCode,
  );
  const roster = snapshot.students
    .filter((student) => student.classCode === classCode)
    .map((student) => ({
      demoCode: student.demoCode,
      enrollmentState:
        enrollments.find((enrollment) => enrollment.studentDemoCode === student.demoCode)?.state ??
        student.enrollmentState,
    }));

  return {
    code: schoolClass.code,
    gradeLevel: schoolClass.gradeLevel,
    roster,
    studentCount: enrollments.length,
    subjectGroupCodes: uniqueSorted(
      teacherAssignments.map((assignment) => assignment.subjectGroupCode),
    ),
    teacherAssignments: teacherAssignments.map((assignment) => ({
      subjectGroupCode: assignment.subjectGroupCode,
      teacherDemoCode: assignment.teacherDemoCode,
    })),
    teacherDemoCodes: uniqueSorted(
      teacherAssignments.map((assignment) => assignment.teacherDemoCode),
    ),
  };
}

function joinValues(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "вЂ”";
}

function listSummaryItems(items: Array<[string, ReactNode]>) {
  return createElement(
    "dl",
    { className: "school-demo-definition-grid" },
    items.map(([label, value]) =>
      createElement(
        "div",
        { key: label },
        createElement("dt", null, label),
        createElement("dd", null, value),
      ),
    ),
  );
}

function renderChips(values: string[], tone = "neutral") {
  if (values.length === 0) return createElement("span", { className: "school-demo-muted" }, "вЂ”");
  return createElement(
    "span",
    { className: "school-demo-chip-list" },
    values.map((value) =>
      createElement(
        "span",
        { className: `school-demo-chip school-demo-chip-${tone}`, key: value },
        value,
      ),
    ),
  );
}

function renderMetric(label: string, value: string | number, note: string) {
  return createElement(
    "article",
    { className: "school-demo-kpi-card" },
    createElement("span", { className: "school-demo-kpi-label" }, label),
    createElement("strong", null, value),
    createElement("span", { className: "school-demo-kpi-note" }, note),
  );
}

function renderList(items: ReactNode[], ordered = false, className = "school-demo-note-list") {
  return createElement(
    ordered ? "ol" : "ul",
    { className },
    items.map((item, index) => createElement("li", { key: index }, item)),
  );
}

function renderStatusStrip(snapshot: SchoolDemoSnapshot) {
  return createElement(
    "section",
    { "aria-label": "РЎС‚Р°С‚СѓСЃ РґРµРјРѕ-РєРѕРЅС‚СѓСЂР°", className: "school-demo-status-strip" },
    [
      ["РњР°СЂРєРµСЂ", snapshot.marker],
      ["Readiness", snapshot.boundary.readiness],
      ["Activation", snapshot.boundary.activation],
      ["Production data", snapshot.boundary.productionDataCount],
      ["Real schools", snapshot.boundary.realSchoolCount],
    ].map(([label, value]) =>
      createElement(
        "div",
        { className: "school-demo-status-item", key: label },
        createElement("span", null, label),
        createElement("strong", null, value),
      ),
    ),
  );
}

function buildPresentationSteps(
  snapshot: SchoolDemoSnapshot,
  selectedClassCode?: string,
): SchoolDemoPresentationStep[] {
  const drilldownClassCode = selectedClassCode ?? snapshot.classes[0]?.code;
  const dashboardHref = (step: SchoolDemoPresentationStepKey, fragment: string) =>
    `/school-demo?step=${step}${fragment}`;
  const drilldownHref = drilldownClassCode
    ? `/school-demo/classes/${encodeURIComponent(drilldownClassCode)}?step=class-drilldown#school-demo-class-roster`
    : "#school-demo-classes";

  return [
    {
      href: dashboardHref("overview", "#school-demo-summary"),
      key: "overview",
      label: "Overview",
      note: "РєРѕРЅС‚РµРєСЃС‚ РѕСЂРіР°РЅРёР·Р°С†РёРё, С€РєРѕР»С‹ Рё СѓС‡РµР±РЅРѕРіРѕ РіРѕРґР°",
    },
    {
      href: dashboardHref("classes", "#school-demo-classes"),
      key: "classes",
      label: "Classes",
      note: "7вЂ“9 РєР»Р°СЃСЃС‹ Рё Р±С‹СЃС‚СЂС‹Р№ РїРµСЂРµС…РѕРґ РІ drilldown",
    },
    {
      href: dashboardHref("teacher-assignments", "#school-demo-teachers"),
      key: "teacher-assignments",
      label: "Teacher assignments",
      note: "СЃРёРЅС‚РµС‚РёС‡РµСЃРєРёРµ СЂРѕР»Рё Рё РїСЂРµРґРјРµС‚РЅС‹Рµ РіСЂСѓРїРїС‹",
    },
    {
      href: dashboardHref("license", "#school-demo-boundary"),
      key: "license",
      label: "License / entitlements",
      note: "read-only РїСЂР°РІР° РґРµРјРѕ-РєРѕРЅС‚СѓСЂР°",
    },
    {
      href: drilldownHref,
      key: "class-drilldown",
      label: "Class drilldown",
      note: drilldownClassCode
        ? `РєР°СЂС‚РѕС‡РєР° РєР»Р°СЃСЃР° ${drilldownClassCode}`
        : "РґРѕСЃС‚СѓРїРµРЅ РїРѕСЃР»Рµ seed",
    },
  ];
}

function renderPresentationFlow({
  activeStep,
  classCode,
  snapshot,
}: {
  activeStep: SchoolDemoPresentationStepKey;
  classCode?: string;
  snapshot: SchoolDemoSnapshot;
}) {
  const steps = buildPresentationSteps(snapshot, classCode);
  const activeStepIndex = steps.findIndex((step) => step.key === activeStep);
  const currentStep = steps[activeStepIndex] ?? steps[0]!;
  const guidedSurface = classCode ? "class page" : "overview";

  return createElement(
    "section",
    {
      "aria-labelledby": "school-demo-presentation-title",
      className: "school-demo-presentation-flow",
      id: "school-demo-presentation-flow",
    },
    createElement(
      "div",
      { className: "school-demo-presentation-copy" },
      createElement("span", { className: "school-demo-eyebrow" }, "Presentation route"),
      createElement(
        "h2",
        { id: "school-demo-presentation-title" },
        "РњР°СЂС€СЂСѓС‚ РїРѕРєР°Р·Р° С€РєРѕР»Рµ",
      ),
      createElement(
        "p",
        { className: "school-demo-presentation-state" },
        `Guided mode - ${guidedSurface} - step ${getSchoolDemoPresentationStepIndex(currentStep.key)} of ${steps.length} - ${getSchoolDemoPresentationStepLabel(currentStep.key)}`,
      ),
      createElement(
        "p",
        null,
        "РџРѕСЃР»РµРґРѕРІР°С‚РµР»СЊРЅРѕСЃС‚СЊ РґР»СЏ Р¶РёРІРѕР№ РґРµРјРѕРЅСЃС‚СЂР°С†РёРё: overview в†’ classes в†’ teacher assignments в†’ license/entitlements в†’ class drilldown.",
      ),
    ),
    createElement(
      "aside",
      { className: "school-demo-boundary-card" },
      createElement("span", null, "Read-only boundary"),
      createElement("strong", null, "РЎРёРЅС‚РµС‚РёС‡РµСЃРєРёРµ РґРµРјРѕ-РґР°РЅРЅС‹Рµ"),
      createElement(
        "p",
        null,
        `${snapshot.boundary.readiness} / ${snapshot.boundary.activation}; production data ${snapshot.boundary.productionDataCount}, real schools ${snapshot.boundary.realSchoolCount}.`,
      ),
    ),
    createElement(
      "nav",
      {
        "aria-label": "РњР°СЂС€СЂСѓС‚ РїСЂРµР·РµРЅС‚Р°С†РёРё school demo",
        className: "school-demo-step-nav",
      },
      steps.map((step, index) =>
        createElement(
          "a",
          {
            "aria-current": step.key === activeStep ? "step" : undefined,
            className: "school-demo-step-link",
            "data-step-state": step.key === activeStep ? "current" : "available",
            href: step.href,
            key: step.key,
          },
          createElement("span", { className: "school-demo-step-index" }, String(index + 1)),
          createElement("strong", null, step.label),
          createElement("span", null, step.note),
        ),
      ),
    ),
  );
}

function getSchoolDemoGuidedWalkthroughStepLabel(step: SchoolDemoGuidedWalkthroughStepKey): string {
  switch (step) {
    case "overview":
      return "Overview";
    case "classes":
      return "Classes";
    case "teacher-assignments":
      return "Teacher assignments";
    case "license":
      return "License / entitlements";
    case "summary":
      return "Compact summary";
    case "handoff":
      return "Handoff pack";
    case "pilot":
      return "Pilot checklist";
    case "pilot-config":
      return "Pilot config preview";
    case "assignment-preview":
      return "Assignment preview";
    case "delivery-preview":
      return "Delivery rehearsal";
    case "student-preview":
      return "Student preview";
    case "review-queue":
      return "Review queue";
    case "review-rubric":
      return "Review rubric";
    case "analytics":
      return "Class analytics";
    case "teacher-dashboard":
      return "Teacher dashboard";
    case "print-pack":
      return "Print pack";
    case "import-preview":
      return "Import preview";
    case "rollout":
      return "Rollout preview";
  }
}

function buildGuidedWalkthroughSteps(): SchoolDemoGuidedWalkthroughStep[] {
  return [
    {
      actionLabel: "Open dashboard",
      href: "/school-demo?step=overview#school-demo-summary",
      key: "overview",
      label: "Overview",
      note: "Start with the synthetic organization, school and academic year. The boundary strip keeps the read-only, non-production status visible.",
      surface: "/school-demo",
    },
    {
      actionLabel: "Open classes",
      href: "/school-demo?step=classes#school-demo-classes",
      key: "classes",
      label: "Classes",
      note: "Show the grade 7-9 classes, class counts and drilldown entry points before moving to the school-facing views.",
      surface: "/school-demo",
    },
    {
      actionLabel: "Open teachers",
      href: "/school-demo?step=teacher-assignments#school-demo-teachers",
      key: "teacher-assignments",
      label: "Teacher assignments",
      note: "Walk through synthetic teacher roles, class assignments and subject groups without exposing real people or school records.",
      surface: "/school-demo",
    },
    {
      actionLabel: "Open license",
      href: "/school-demo?step=license#school-demo-boundary",
      key: "license",
      label: "License / entitlements",
      note: "Keep the entitlement plan visible as read-only metadata so the demo stays grounded in a school rollout discussion.",
      surface: "/school-demo",
    },
    {
      actionLabel: "Open summary",
      href: "/school-demo/summary",
      key: "summary",
      label: "Compact summary",
      note: "Switch to the one-screen school-facing overview for a live meeting, screenshot or print-style discussion.",
      surface: "/school-demo/summary",
    },
    {
      actionLabel: "Open handoff",
      href: "/school-demo/handoff",
      key: "handoff",
      label: "Handoff pack",
      note: "Open the teacher and admin handoff pack with the synthetic boundary and rollout checklist.",
      surface: "/school-demo/handoff",
    },
    {
      actionLabel: "Open pilot checklist",
      href: "/school-demo/pilot",
      key: "pilot",
      label: "Pilot checklist",
      note: "Discuss future pilot prerequisites, data boundaries, FAQ objections and the next-step checklist without collecting real school data.",
      surface: "/school-demo/pilot",
    },
    {
      actionLabel: "Open pilot config preview",
      href: "/school-demo/pilot-config",
      key: "pilot-config",
      label: "Pilot config preview",
      note: "Preview school profile placeholders, class and subject layout, teacher roles and boundary notes without any operational intake.",
      surface: "/school-demo/pilot-config",
    },
    {
      actionLabel: "Open assignment preview",
      href: "/school-demo/assignment-preview",
      key: "assignment-preview",
      label: "Assignment preview",
      note: "Build a local-only teacher draft from synthetic class, subject and timing options. It creates no assignment record.",
      surface: "/school-demo/assignment-preview",
    },
    {
      actionLabel: "Open delivery rehearsal",
      href: "/school-demo/delivery-preview",
      key: "delivery-preview",
      label: "Delivery rehearsal",
      note: "Rehearse the local-only delivery plan, roster queue and stop gates without sending, saving or publishing anything.",
      surface: "/school-demo/delivery-preview",
    },
    {
      actionLabel: "Open student preview",
      href: "/school-demo/student-preview",
      key: "student-preview",
      label: "Student preview",
      note: "Show the synthetic learner-side assignment card and disabled action area without attempts, uploads, grading or records.",
      surface: "/school-demo/student-preview",
    },
    {
      actionLabel: "Open review queue",
      href: "/school-demo/review-queue",
      key: "review-queue",
      label: "Review queue",
      note: "Show the synthetic teacher review queue shell with disabled teacher actions and no learner work, scores or decisions.",
      surface: "/school-demo/review-queue",
    },
    {
      actionLabel: "Open review rubric",
      href: "/school-demo/review-rubric",
      key: "review-rubric",
      label: "Review rubric",
      note: "Show the read-only teacher rubric shell with display-only criteria, disabled notes and no grade or score writes.",
      surface: "/school-demo/review-rubric",
    },
    {
      actionLabel: "Open class analytics",
      href: "/school-demo/analytics",
      key: "analytics",
      label: "Class analytics",
      note: "Show synthetic class counts, teacher load and queue load without grades, learner work or production records.",
      surface: "/school-demo/analytics",
    },
    {
      actionLabel: "Open teacher dashboard",
      href: "/school-demo/teacher-dashboard",
      key: "teacher-dashboard",
      label: "Teacher dashboard",
      note: "Use one consolidated teacher view to jump between classes, draft, delivery, review, analytics and import previews.",
      surface: "/school-demo/teacher-dashboard",
    },
    {
      actionLabel: "Open print pack",
      href: "/school-demo/print-pack",
      key: "print-pack",
      label: "Print pack",
      note: "Open the browser-print pack for a meeting, screenshot or projector handoff without creating any generated file.",
      surface: "/school-demo/print-pack",
    },
    {
      actionLabel: "Open import preview",
      href: "/school-demo/import-preview",
      key: "import-preview",
      label: "Import preview",
      note: "Preview the future roster CSV shape locally with synthetic demo codes only. No upload and no saved records.",
      surface: "/school-demo/import-preview",
    },
    {
      actionLabel: "Open rollout preview",
      href: "/school-demo/rollout",
      key: "rollout",
      label: "Rollout preview",
      note: "Review weekly rollout phases, responsibilities, import assumptions, fallback paths and success criteria before any future real-school gate.",
      surface: "/school-demo/rollout",
    },
  ];
}

function renderGuidedWalkthrough({
  activeStep,
  classCode,
  snapshot,
}: {
  activeStep: SchoolDemoGuidedWalkthroughStepKey;
  classCode: string | undefined;
  snapshot: SchoolDemoSnapshot;
}) {
  const steps = buildGuidedWalkthroughSteps();
  const drilldownClassCode = classCode ?? snapshot.classes[0]?.code;
  const currentStep = steps.find((step) => step.key === activeStep) ?? steps[0]!;
  const currentStepIndex = schoolDemoGuidedWalkthroughStepOrder.indexOf(currentStep.key) + 1;

  return renderPanel(
    "school-demo-guided-walkthrough",
    "Guided walkthrough",
    createElement(
      "div",
      { className: "school-demo-guided-copy" },
      createElement(
        "p",
        { className: "school-demo-guided-lead" },
        "Presentation script: use this sequence to present the synthetic school demo in order: overview, classes, teacher assignments, license / entitlements, compact summary, handoff pack, pilot checklist, pilot config preview, assignment preview, delivery rehearsal, student preview, review queue, review rubric, class analytics, teacher dashboard, print pack, import preview and rollout preview.",
      ),
      createElement(
        "p",
        { className: "school-demo-guided-boundary" },
        `Current page: ${getSchoolDemoGuidedWalkthroughStepLabel(currentStep.key)} (${currentStepIndex} of ${steps.length}). The demo stays ${snapshot.boundary.readiness} / ${snapshot.boundary.activation}, with production data ${snapshot.boundary.productionDataCount}, real schools ${snapshot.boundary.realSchoolCount} and no mutations.`,
      ),
      createElement(
        "ol",
        { className: "school-demo-guided-list" },
        steps.map((step, index) =>
          createElement(
            "li",
            {
              "aria-current": step.key === activeStep ? "step" : undefined,
              className: "school-demo-guided-step",
              "data-guided-state": step.key === activeStep ? "current" : "available",
              key: step.key,
            },
            createElement("span", { className: "school-demo-step-index" }, String(index + 1)),
            createElement("strong", null, step.label),
            createElement("span", { className: "school-demo-guided-step-surface" }, step.surface),
            createElement("p", null, step.note),
            createElement(
              "a",
              { className: "button-link school-demo-secondary-link", href: step.href },
              step.actionLabel,
            ),
          ),
        ),
      ),
      createElement(
        "p",
        { className: "school-demo-guided-footnote" },
        drilldownClassCode
          ? createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: `/school-demo/classes/${encodeURIComponent(drilldownClassCode)}?step=class-drilldown#school-demo-class-roster`,
              },
              `Optional drilldown: open ${drilldownClassCode}`,
            )
          : "Optional drilldown is available from the classes table when a demo class exists.",
      ),
    ),
    true,
  );
}

function renderHeader({
  actionHref,
  actionLabel,
  secondaryActionHref,
  secondaryActionLabel,
  subtitle,
  title,
}: {
  actionHref: string;
  actionLabel: string;
  secondaryActionHref?: string;
  secondaryActionLabel?: string;
  subtitle: string;
  title: string;
}) {
  return createElement(
    "header",
    { className: "school-demo-page-header" },
    createElement(
      "div",
      { className: "school-demo-heading" },
      createElement("span", { className: "school-demo-eyebrow" }, "Pre-Wave 7 В· synthetic demo"),
      createElement("h1", null, title),
      createElement("p", null, subtitle),
    ),
    createElement(
      "nav",
      {
        "aria-label": "РќР°РІРёРіР°С†РёСЏ РґРµРјРѕ С€РєРѕР»С‹",
        className: "school-demo-header-actions",
      },
      createElement(SchoolDemoThemeToggle),
      createElement(
        "a",
        { className: "button-link school-demo-secondary-link", href: actionHref },
        actionLabel,
      ),
      secondaryActionHref && secondaryActionLabel
        ? createElement(
            "a",
            { className: "button-link school-demo-secondary-link", href: secondaryActionHref },
            secondaryActionLabel,
          )
        : null,
    ),
  );
}

function renderPanel(id: string, title: string, children: ReactNode, wide = false) {
  return createElement(
    "section",
    {
      "aria-labelledby": `${id}-title`,
      className: wide ? "school-demo-panel school-demo-panel-wide" : "school-demo-panel",
      id,
    },
    createElement("h2", { id: `${id}-title` }, title),
    children,
  );
}

function renderTable({
  emptyLabel,
  headers,
  rows,
}: {
  emptyLabel: string;
  headers: string[];
  rows: Array<{ cells: ReactNode[]; key: string }>;
}) {
  if (rows.length === 0) {
    return createElement("p", { className: "empty-state" }, emptyLabel);
  }

  return createElement(
    "div",
    { className: "school-demo-table-scroll" },
    createElement(
      "table",
      { className: "school-demo-table" },
      createElement(
        "thead",
        null,
        createElement(
          "tr",
          null,
          headers.map((header) => createElement("th", { key: header, scope: "col" }, header)),
        ),
      ),
      createElement(
        "tbody",
        null,
        rows.map((row) =>
          createElement(
            "tr",
            { key: row.key },
            row.cells.map((cell, index) =>
              createElement("td", { "data-label": headers[index], key: headers[index] }, cell),
            ),
          ),
        ),
      ),
    ),
  );
}

export function SchoolDemoDashboardView({
  presentationStep,
  snapshot,
}: SchoolDemoDashboardViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const teacherOverviews = buildTeacherOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/",
      secondaryActionHref: "/school-demo/summary",
      secondaryActionLabel: "Compact summary",
      actionLabel: "РќР° РіР»Р°РІРЅСѓСЋ",
      subtitle:
        "РЎС‚СЂРѕРіРёР№ read-only РѕР±Р·РѕСЂ СЃРёРЅС‚РµС‚РёС‡РµСЃРєРѕР№ С€РєРѕР»СЊРЅРѕР№ РІРµС‚РєРё: РѕСЂРіР°РЅРёР·Р°С†РёСЏ, РєР»Р°СЃСЃС‹, РЅР°Р·РЅР°С‡РµРЅРёСЏ Рё Р»РёС†РµРЅР·РёСЏ Р±РµР· СЂРµР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С….",
      title: "Р”РµРјРѕ С€РєРѕР»С‹",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: (() => {
        switch (presentationStep ?? "overview") {
          case "overview":
            return "overview";
          case "classes":
            return "classes";
          case "teacher-assignments":
            return "teacher-assignments";
          case "license":
            return "license";
          case "class-drilldown":
            return "classes";
        }
      })(),
      classCode: guidedClassCode,
      snapshot,
    }),
    renderPresentationFlow({
      activeStep: presentationStep ?? "overview",
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "РљР»СЋС‡РµРІС‹Рµ РїРѕРєР°Р·Р°С‚РµР»Рё РґРµРјРѕ С€РєРѕР»С‹",
        className: "school-demo-kpi-grid",
      },
      renderMetric(
        "РћСЂРіР°РЅРёР·Р°С†РёСЏ",
        snapshot.organization.code,
        `${snapshot.organization.schoolCount} С€РєРѕР»Р°`,
      ),
      renderMetric(
        "РЈС‡РµР±РЅС‹Р№ РіРѕРґ",
        snapshot.academicYear.code,
        `${snapshot.academicYear.startsOn} вЂ” ${snapshot.academicYear.endsOn}`,
      ),
      renderMetric(
        "РљР»Р°СЃСЃС‹",
        classOverviews.length,
        joinValues(classOverviews.map((item) => item.code)),
      ),
      renderMetric(
        "РЈС‡РёС‚РµР»СЏ",
        teacherOverviews.length,
        "СЃРёРЅС‚РµС‚РёС‡РµСЃРєРёРµ demo-РєРѕРґС‹",
      ),
      renderMetric(
        "РЈС‡РµРЅРёРєРё",
        snapshot.students.length,
        "Р±РµР· Р¤РРћ Рё РєРѕРЅС‚Р°РєС‚РѕРІ",
      ),
      renderMetric(
        "РџСЂР°РІР°",
        snapshot.entitlements.length,
        "РїР»Р°РЅРѕРІС‹Рµ entitlement-РєРѕРґС‹",
      ),
    ),
    createElement(
      "div",
      { className: "school-demo-grid" },
      renderPanel(
        "school-demo-summary",
        "РЎРІРѕРґРєР° С€РєРѕР»С‹",
        listSummaryItems([
          ["РћСЂРіР°РЅРёР·Р°С†РёСЏ", snapshot.organization.code],
          ["РЁРєРѕР»Р°", snapshot.school.code],
          ["Р›РѕРєР°Р»СЊ", snapshot.locale],
          [
            "РЈС‡РµР±РЅС‹Р№ РіРѕРґ",
            `${snapshot.academicYear.startsOn} вЂ” ${snapshot.academicYear.endsOn}`,
          ],
          [
            "РџСЂРµРґРјРµС‚РЅС‹Рµ РіСЂСѓРїРїС‹",
            joinValues(snapshot.subjectGroups.map((item) => item.code)),
          ],
          ["Р—Р°С‡РёСЃР»РµРЅРёСЏ", snapshot.studentEnrollments.length],
        ]),
      ),
      renderPanel(
        "school-demo-boundary",
        "Р“СЂР°РЅРёС†С‹ Рё Р»РёС†РµРЅР·РёСЏ",
        listSummaryItems([
          ["РњР°СЂРєРµСЂ", snapshot.marker],
          ["Р›РёС†РµРЅР·РёСЏ", snapshot.license.licenseCode],
          ["РЎС‚Р°С‚СѓСЃ Р»РёС†РµРЅР·РёРё", snapshot.license.status],
          [
            "РџСЂР°РІР°",
            renderChips(
              snapshot.entitlements.map((item) => item.capabilityCode),
              "blue",
            ),
          ],
          ["Family links", snapshot.boundary.familyLinkCount],
          ["Workflow", snapshot.boundary.workflow],
        ]),
      ),
      renderPanel(
        "school-demo-classes",
        "РљР»Р°СЃСЃС‹ Рё drilldown",
        renderTable({
          emptyLabel: "РљР»Р°СЃСЃРѕРІ РїРѕРєР° РЅРµС‚.",
          headers: [
            "РљР»Р°СЃСЃ",
            "РЈСЂРѕРІРµРЅСЊ",
            "РЈС‡РµРЅРёРєРё",
            "РџСЂРµРґРјРµС‚РЅС‹Рµ РіСЂСѓРїРїС‹",
            "РЈС‡РёС‚РµР»СЏ",
            "Р”РµР№СЃС‚РІРёРµ",
          ],
          rows: classOverviews.map((schoolClass) => ({
            cells: [
              createElement("strong", { key: "code" }, schoolClass.code),
              schoolClass.gradeLevel,
              schoolClass.studentCount,
              renderChips(schoolClass.subjectGroupCodes),
              renderChips(schoolClass.teacherDemoCodes, "blue"),
              createElement(
                "a",
                {
                  className: "button-link school-demo-table-link",
                  href: `/school-demo/classes/${encodeURIComponent(schoolClass.code)}`,
                  key: "link",
                },
                "РћС‚РєСЂС‹С‚СЊ РєР»Р°СЃСЃ",
              ),
            ],
            key: schoolClass.code,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-teachers",
        "РЈС‡РёС‚РµР»СЊСЃРєРёР№ РѕР±Р·РѕСЂ",
        renderTable({
          emptyLabel: "РЈС‡РёС‚РµР»СЊСЃРєРёС… РЅР°Р·РЅР°С‡РµРЅРёР№ РїРѕРєР° РЅРµС‚.",
          headers: [
            "РЈС‡РёС‚РµР»СЊ",
            "РќР°Р·РЅР°С‡РµРЅРёСЏ",
            "РљР»Р°СЃСЃС‹",
            "РџСЂРµРґРјРµС‚РЅС‹Рµ РіСЂСѓРїРїС‹",
          ],
          rows: teacherOverviews.map((teacher) => ({
            cells: [
              createElement("strong", { key: "teacher" }, teacher.demoCode),
              teacher.assignmentCount,
              renderChips(teacher.classCodes),
              renderChips(teacher.subjectGroupCodes, "blue"),
            ],
            key: teacher.demoCode,
          })),
        }),
        true,
      ),
    ),
  );
}

export function SchoolDemoCompactSummaryView({ snapshot }: SchoolDemoCompactSummaryViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const teacherOverviews = buildTeacherOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const rosterPreview = [...snapshot.students]
    .sort(
      (left, right) =>
        left.classCode.localeCompare(right.classCode) ||
        left.demoCode.localeCompare(right.demoCode),
    )
    .slice(0, 9);
  const totalAssignments = snapshot.teacherAssignments.length;
  const classCountsByGrade = uniqueSorted(
    classOverviews.map((schoolClass) => `Grade ${schoolClass.gradeLevel}: ${schoolClass.code}`),
  );

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo?step=overview#school-demo-summary",
      actionLabel: "Full walkthrough",
      secondaryActionHref: "/",
      secondaryActionLabel: "Home",
      subtitle:
        "Compact one-screen read-only snapshot for a live school meeting, screenshot or print-style export. Uses only synthetic demo data.",
      title: "School demo compact summary",
    }),
    createElement(
      "section",
      {
        "aria-label": "Compact synthetic demo status",
        className: "school-demo-summary-status-strip",
      },
      [
        ["Synthetic boundary", snapshot.marker],
        ["Readiness", snapshot.boundary.readiness],
        ["Activation", snapshot.boundary.activation],
        ["Production data", snapshot.boundary.productionDataCount],
        ["Real schools", snapshot.boundary.realSchoolCount],
        ["Mutations", snapshot.boundary.mutationAllowed ? "ALLOWED" : "BLOCKED"],
      ].map(([label, value]) =>
        createElement(
          "div",
          { className: "school-demo-status-item", key: label },
          createElement("span", null, label),
          createElement("strong", null, String(value)),
        ),
      ),
    ),
    renderGuidedWalkthrough({
      activeStep: "summary",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Compact school demo metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("School", snapshot.school.code, snapshot.organization.code),
      renderMetric(
        "Academic year",
        snapshot.academicYear.code,
        `${snapshot.academicYear.startsOn} - ${snapshot.academicYear.endsOn}`,
      ),
      renderMetric(
        "Classes",
        classOverviews.length,
        joinValues(classOverviews.map((item) => item.code)),
      ),
      renderMetric("Students", snapshot.students.length, "Synthetic demo codes only"),
      renderMetric(
        "Teachers",
        teacherOverviews.length,
        `${totalAssignments} read-only assignments`,
      ),
      renderMetric("Entitlements", snapshot.entitlements.length, snapshot.license.licenseCode),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid" },
      renderPanel(
        "school-demo-compact-school",
        "School summary",
        listSummaryItems([
          ["Organization", snapshot.organization.code],
          ["School", snapshot.school.code],
          ["Locale", snapshot.locale],
          ["Class groups", renderChips(classCountsByGrade, "blue")],
          ["Subject groups", renderChips(snapshot.subjectGroups.map((item) => item.code))],
          ["Family links", snapshot.boundary.familyLinkCount],
        ]),
      ),
      renderPanel(
        "school-demo-compact-license",
        "License / entitlements",
        listSummaryItems([
          ["License", snapshot.license.licenseCode],
          ["Status", snapshot.license.status],
          ["Entitlement count", snapshot.license.entitlementCount],
          [
            "Capability codes",
            renderChips(
              snapshot.entitlements.map((item) => item.capabilityCode),
              "blue",
            ),
          ],
          ["Workflow", snapshot.boundary.workflow],
          ["Mutation allowed", String(snapshot.boundary.mutationAllowed)],
        ]),
      ),
      renderPanel(
        "school-demo-compact-classes",
        "Class counts / roster snapshot",
        renderTable({
          emptyLabel: "No synthetic classes are available.",
          headers: ["Class", "Grade", "Students", "Subject groups", "Teachers"],
          rows: classOverviews.map((schoolClass) => ({
            cells: [
              createElement("strong", { key: "code" }, schoolClass.code),
              schoolClass.gradeLevel,
              schoolClass.studentCount,
              renderChips(schoolClass.subjectGroupCodes),
              renderChips(schoolClass.teacherDemoCodes, "blue"),
            ],
            key: schoolClass.code,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-compact-teachers",
        "Teacher assignments",
        renderTable({
          emptyLabel: "No synthetic teacher assignments are available.",
          headers: ["Teacher", "Assignments", "Classes", "Subject groups"],
          rows: teacherOverviews.map((teacher) => ({
            cells: [
              createElement("strong", { key: "teacher" }, teacher.demoCode),
              teacher.assignmentCount,
              renderChips(teacher.classCodes),
              renderChips(teacher.subjectGroupCodes, "blue"),
            ],
            key: teacher.demoCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-compact-roster",
        "Roster preview",
        renderTable({
          emptyLabel: "No synthetic students are available.",
          headers: ["Demo student code", "Class", "Enrollment"],
          rows: rosterPreview.map((student) => ({
            cells: [
              createElement("strong", { key: "student" }, student.demoCode),
              student.classCode,
              createElement(
                "span",
                { className: "school-demo-chip", key: "state" },
                student.enrollmentState,
              ),
            ],
            key: student.demoCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-compact-handoff",
        "Teacher handoff pack",
        createElement(
          "div",
          { className: "school-demo-handoff-teaser" },
          createElement(
            "p",
            null,
            "Printable one-pager for teachers and school admins. It stays read-only, synthetic and local-only.",
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              { className: "button-link school-demo-secondary-link", href: "/school-demo/handoff" },
              "Open handoff pack",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              { className: "button-link school-demo-secondary-link", href: "/school-demo/pilot" },
              "Open pilot checklist",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/pilot-config",
              },
              "Open pilot config preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/assignment-preview",
              },
              "Open assignment preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/import-preview",
              },
              "Open import preview",
            ),
          ),
          renderList(
            ["What the demo shows", "What stays synthetic", "Pilot checklist and FAQ objections"],
            false,
            "school-demo-note-list",
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoHandoffPackView({ snapshot }: SchoolDemoHandoffPackViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const teacherOverviews = buildTeacherOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const demoShowPoints = [
    "organization, school and academic year context",
    "classes 7-9 with teacher assignments and roster snapshot",
    "license / entitlements and read-only boundary markers",
    "class drilldown links for a live walkthrough",
  ];
  const syntheticBoundaryPoints = [
    "all values are synthetic demo codes",
    "no real school names, people, contacts or identifiers",
    "no mutations, auth/session changes or production data",
    "no family tenant links or school approvals",
  ];
  const rolloutChecklistPoints = [
    "Confirm the teacher or admin audience and the class level in scope.",
    "Walk the summary page first, then open the handoff pack for the one-pager.",
    "Review overview, classes, teacher assignments, license and class drilldown in that order.",
    "Keep real data, CSV/XLSX imports and named design-partner approvals behind a later gate.",
  ];

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/summary",
      actionLabel: "Back to summary",
      secondaryActionHref: "/school-demo/pilot",
      secondaryActionLabel: "Pilot checklist",
      subtitle:
        "Compact read-only handoff pack for teachers and school admins. It uses only synthetic demo data and stays local-only.",
      title: "School demo handoff pack",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "handoff",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Handoff pack metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Audience", "Teachers + admins", "Read-only school presentation"),
      renderMetric("Focus", "What the demo shows", "Synthetic snapshot only"),
      renderMetric(
        "Classes",
        classOverviews.length,
        joinValues(classOverviews.map((item) => item.code)),
      ),
      renderMetric(
        "Teachers",
        teacherOverviews.length,
        `${snapshot.teacherAssignments.length} assignments`,
      ),
      renderMetric("Students", snapshot.students.length, "Synthetic demo codes only"),
      renderMetric("Theme", "Light / dark", "Local-only toggle"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid" },
      renderPanel(
        "school-demo-handoff-demo",
        "What the demo shows",
        renderList(demoShowPoints),
        true,
      ),
      renderPanel(
        "school-demo-handoff-boundary",
        "Synthetic boundary",
        renderList(syntheticBoundaryPoints),
        true,
      ),
      renderPanel(
        "school-demo-handoff-checklist",
        "School rollout checklist",
        renderList(rolloutChecklistPoints, true),
        true,
      ),
      renderPanel(
        "school-demo-handoff-notes",
        "Presentation notes",
        createElement(
          "div",
          null,
          createElement(
            "p",
            null,
            "Use the compact summary for the live walkthrough, then open this page when the audience wants a printable handoff artifact.",
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              { className: "button-link school-demo-secondary-link", href: "/school-demo/pilot" },
              "Open pilot checklist",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/pilot-config",
              },
              "Open pilot config preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/assignment-preview",
              },
              "Open assignment preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/rollout",
              },
              "Open rollout preview",
            ),
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoPilotChecklistView({ snapshot }: SchoolDemoPilotChecklistViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const teacherOverviews = buildTeacherOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const pilotPrerequisites = [
    "Named design partners and business gate approval remain outside this synthetic demo.",
    "Legal basis, consent path and school tenant owner must be approved before any real roster data.",
    "Pilot scope must name grades, classes, teacher roles and allowed subject groups before activation.",
    "CSV/XLSX roster intake must pass a separate preview, review and deletion gate before real use.",
  ];
  const laterSchoolData = [
    "organization and school codes approved for the pilot tenant",
    "academic year and class labels for grades 7-9",
    "teacher role mapping and subject group mapping",
    "minimal roster codes after legal basis and consent review",
    "license and entitlement plan for the pilot window",
  ];
  const demoAlreadyShows = [
    "synthetic organization, school and academic year",
    "classes 7A, 8A and 9A with roster snapshots",
    "teacher assignments and subject groups",
    "license / entitlements and read-only boundary markers",
    "summary, handoff and class drilldown views",
  ];
  const remainsSynthetic = [
    "no real school names, people, contacts or identifiers",
    "no auth/session changes and no writes",
    "no production records, approvals or activation events",
    "no family-domain links or learner diagnostic readiness change",
  ];
  const nextStepChecklist = [
    "Select the audience: teacher, director or admin.",
    "Open summary, handoff and pilot pages in that order.",
    "Open the pilot config preview when discussing future intake fields.",
    "Confirm which classes and subject groups would be in a future pilot.",
    "Capture objections outside the product and keep real data out of the demo.",
    "Return to the business gate before any school beta activation.",
  ];
  const faqRows = [
    {
      answer:
        "No. The current page is read-only and synthetic. It explains a future pilot path without approving real school use.",
      question: "Does this start a real pilot?",
    },
    {
      answer:
        "No. This demo uses synthetic codes only. Real roster data stays behind a later legal, consent and tenant gate.",
      question: "Can a school send roster data now?",
    },
    {
      answer:
        "The current demo shows tenant structure, class snapshots, teacher assignments and entitlement boundaries.",
      question: "What can a director evaluate today?",
    },
    {
      answer:
        "Named design partners, data basis, import preview, access rules, retention and independent review remain open.",
      question: "What blocks the next beta step?",
    },
  ];

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/handoff",
      actionLabel: "Back to handoff",
      secondaryActionHref: "/school-demo/summary",
      secondaryActionLabel: "Compact summary",
      subtitle:
        "Read-only school pilot checklist and FAQ for teacher, director and admin conversations. It uses only synthetic demo data.",
      title: "School demo pilot checklist",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "pilot",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Pilot checklist metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Pilot status", "BLOCKED", "Requires business gate and named design partners"),
      renderMetric("Data mode", "Synthetic", "No real school records"),
      renderMetric(
        "Classes shown",
        classOverviews.length,
        joinValues(classOverviews.map((item) => item.code)),
      ),
      renderMetric("Teachers shown", teacherOverviews.length, "Synthetic demo codes only"),
      renderMetric("Writes", "0", "Read-only school demo surface"),
      renderMetric("FAQ", faqRows.length, "Teacher, director and admin objections"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid" },
      renderPanel(
        "school-demo-pilot-prerequisites",
        "Pilot prerequisites",
        renderList(pilotPrerequisites, true),
        true,
      ),
      renderPanel(
        "school-demo-pilot-later-data",
        "What a school would later provide",
        renderList(laterSchoolData),
        true,
      ),
      renderPanel(
        "school-demo-pilot-demo-shows",
        "What the demo already shows",
        renderList(demoAlreadyShows),
        true,
      ),
      renderPanel(
        "school-demo-pilot-synthetic",
        "What remains synthetic",
        renderList(remainsSynthetic),
        true,
      ),
      renderPanel(
        "school-demo-pilot-faq",
        "FAQ and objections",
        renderTable({
          emptyLabel: "No pilot FAQ items are available.",
          headers: ["Question", "Read-only answer"],
          rows: faqRows.map((item) => ({
            cells: [createElement("strong", { key: "question" }, item.question), item.answer],
            key: item.question,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-pilot-next-steps",
        "Next-step checklist",
        createElement(
          "div",
          null,
          renderList(nextStepChecklist, true),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/pilot-config",
              },
              "Open pilot config preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/assignment-preview",
              },
              "Open assignment preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/rollout",
              },
              "Open rollout preview",
            ),
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoPilotConfigView({ snapshot }: SchoolDemoPilotConfigViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const teacherOverviews = buildTeacherOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const teacherRoles = ["class lead", "subject teacher", "school admin", "import reviewer"];
  const rolloutAssumptions = [
    "One organization, one school and one academic year are enough for the first synthetic pilot preview.",
    "Grade 7-9 classes can be shown with one subject group per class until a later scheduling slice exists.",
    "CSV/XLSX intake stays preview-only until the legal basis, consent path and tenant owner are approved.",
    "Teacher roles remain placeholders until named school staff and access boundaries are approved.",
  ];
  const configurableLater = [
    "school profile labels and tenant codes",
    "class count, class labels and grade-band mapping",
    "subject groups and teacher role mapping",
    "schedule assumptions and import options",
    "retention, deletion and preview confirmation rules",
  ];
  const demoOnly = [
    "synthetic organization and school codes only",
    "no real names or contact details",
    "no writes, no auth/session changes and no real imports",
    "no production activation, approvals or family links",
  ];
  const readinessChecklist = [
    "Confirm the school is a named future design partner, not a real live tenant.",
    "Confirm the class count, grade bands and subject layout before any later intake.",
    "Confirm teacher role placeholders and pilot ownership before any future import.",
    "Confirm data boundary, retention and deletion expectations before activation.",
  ];

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/pilot",
      actionLabel: "Back to pilot",
      secondaryActionHref: "/school-demo/handoff",
      secondaryActionLabel: "Back to handoff",
      subtitle:
        "Read-only school pilot intake and configuration preview. It stays synthetic, non-operational and local-only.",
      title: "School demo pilot config preview",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "pilot-config",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Pilot config preview metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Preview mode", "Read-only", "Synthetic pilot intake only"),
      renderMetric("Grade bands", "7-9", "Russian school demo layout"),
      renderMetric(
        "Class count",
        classOverviews.length,
        joinValues(classOverviews.map((item) => item.code)),
      ),
      renderMetric(
        "Teachers shown",
        teacherOverviews.length,
        joinValues(teacherOverviews.map((item) => item.demoCode)),
      ),
      renderMetric("Teacher roles", teacherRoles.length, joinValues(teacherRoles)),
      renderMetric(
        "Subject groups",
        snapshot.subjectGroups.length,
        joinValues(snapshot.subjectGroups.map((item) => item.code)),
      ),
      renderMetric("Writes", "0", "No operational intake"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid" },
      renderPanel(
        "school-demo-pilot-config-profile",
        "School profile schema preview",
        listSummaryItems([
          ["Organization placeholder", snapshot.organization.code],
          ["School placeholder", snapshot.school.code],
          ["Academic year", snapshot.academicYear.code],
          ["Locale", snapshot.locale],
          ["Class count", classOverviews.length],
          ["Grade bands", "7-9"],
          ["Teacher role placeholders", renderChips(teacherRoles, "blue")],
          ["Data boundary", "synthetic / read-only / non-operational"],
        ]),
        true,
      ),
      renderPanel(
        "school-demo-pilot-config-layout",
        "Supported class / subject layout",
        renderTable({
          emptyLabel: "No synthetic classes are available.",
          headers: ["Class", "Grade", "Subject groups", "Teacher preview"],
          rows: classOverviews.map((schoolClass) => ({
            cells: [
              createElement("strong", { key: "code" }, schoolClass.code),
              schoolClass.gradeLevel,
              renderChips(schoolClass.subjectGroupCodes),
              renderChips(schoolClass.teacherDemoCodes, "blue"),
            ],
            key: schoolClass.code,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-pilot-config-roles",
        "Teacher role placeholders",
        renderList(teacherRoles),
        true,
      ),
      renderPanel(
        "school-demo-pilot-config-rollout",
        "Rollout assumptions",
        createElement(
          "div",
          null,
          renderList(rolloutAssumptions),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/assignment-preview",
              },
              "Open assignment preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/rollout",
              },
              "Open rollout preview",
            ),
          ),
        ),
        true,
      ),
      renderPanel(
        "school-demo-pilot-config-later",
        "What will be configurable later",
        renderList(configurableLater),
        true,
      ),
      renderPanel(
        "school-demo-pilot-config-boundary",
        "What stays demo-only",
        renderList(demoOnly),
        true,
      ),
      renderPanel(
        "school-demo-pilot-config-checklist",
        "Pilot readiness checklist",
        renderList(readinessChecklist, true),
        true,
      ),
    ),
  );
}

export function SchoolDemoAssignmentPreviewView({
  snapshot,
}: SchoolDemoAssignmentPreviewViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const defaultDraft = buildDefaultSchoolDemoAssignmentInput(snapshot);
  const [draft, setDraft] = useState<SchoolDemoAssignmentDraftInput>(defaultDraft);
  const preview = buildSchoolDemoAssignmentDraftPreview(draft, snapshot);

  function updateDraft(patch: Partial<SchoolDemoAssignmentDraftInput>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/pilot-config",
      actionLabel: "Back to pilot config",
      secondaryActionHref: "/school-demo/delivery-preview",
      secondaryActionLabel: "Delivery rehearsal",
      subtitle:
        "Local-only teacher assignment draft preview over synthetic demo classes. It creates no assignment, no delivery and no learner record.",
      title: "School demo assignment preview",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "assignment-preview",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Assignment preview metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Draft state", preview.draftState, "Local preview only"),
      renderMetric("Class", preview.classCode || "BLOCKED", "Synthetic class code"),
      renderMetric("Students", preview.eligibleStudentCount, "Eligible synthetic roster rows"),
      renderMetric("Delivery mode", preview.deliveryMode, "No delivery is created"),
      renderMetric("Availability", `${preview.settings.availabilityDays} days`, "Demo setting"),
      renderMetric("Writes", "0", "No server mutation"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid school-demo-assignment-preview-grid" },
      renderPanel(
        "school-demo-assignment-preview-controls",
        "Teacher draft controls",
        createElement(
          "div",
          { className: "school-demo-assignment-preview-controls" },
          createElement(
            "label",
            null,
            createElement("span", null, "Class"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic class for assignment preview",
                onChange: (event) =>
                  updateDraft({
                    classCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: draft.classCode,
              },
              [...snapshot.classes]
                .sort(compareClassRecords)
                .map((schoolClass) =>
                  createElement(
                    "option",
                    { key: schoolClass.code, value: schoolClass.code },
                    `${schoolClass.code} / grade ${schoolClass.gradeLevel}`,
                  ),
                ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Teacher"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic teacher for assignment preview",
                onChange: (event) =>
                  updateDraft({
                    teacherDemoCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: draft.teacherDemoCode,
              },
              [...snapshot.teachers]
                .sort((left, right) => left.demoCode.localeCompare(right.demoCode))
                .map((teacher) =>
                  createElement(
                    "option",
                    { key: teacher.demoCode, value: teacher.demoCode },
                    teacher.demoCode,
                  ),
                ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Subject group"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic subject group for assignment preview",
                onChange: (event) =>
                  updateDraft({
                    subjectGroupCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: draft.subjectGroupCode,
              },
              snapshot.subjectGroups.map((subjectGroup) =>
                createElement(
                  "option",
                  { key: subjectGroup.code, value: subjectGroup.code },
                  subjectGroup.code,
                ),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Package"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic package code for assignment preview",
                onChange: (event) =>
                  updateDraft({
                    packageCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: draft.packageCode,
              },
              schoolDemoAssignmentPackageOptions.map((packageCode) =>
                createElement("option", { key: packageCode, value: packageCode }, packageCode),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Attempt limit"),
            createElement(
              "select",
              {
                "aria-label": "Attempt limit for assignment preview",
                onChange: (event) =>
                  updateDraft({
                    attemptLimit: Number((event.currentTarget as HTMLSelectElement).value),
                  }),
                value: String(draft.attemptLimit),
              },
              [1, 2, 3].map((value) =>
                createElement("option", { key: value, value: String(value) }, String(value)),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Duration"),
            createElement(
              "select",
              {
                "aria-label": "Duration for assignment preview",
                onChange: (event) =>
                  updateDraft({
                    durationMinutes: Number((event.currentTarget as HTMLSelectElement).value),
                  }),
                value: String(draft.durationMinutes),
              },
              [30, 45, 60].map((value) =>
                createElement("option", { key: value, value: String(value) }, `${value} minutes`),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Availability"),
            createElement(
              "select",
              {
                "aria-label": "Availability window for assignment preview",
                onChange: (event) =>
                  updateDraft({
                    availabilityDays: Number((event.currentTarget as HTMLSelectElement).value),
                  }),
                value: String(draft.availabilityDays),
              },
              [3, 5, 7, 14].map((value) =>
                createElement("option", { key: value, value: String(value) }, `${value} days`),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Mode"),
            createElement(
              "select",
              {
                "aria-label": "Delivery preview mode",
                onChange: (event) =>
                  updateDraft({
                    deliveryMode: (event.currentTarget as HTMLSelectElement)
                      .value as SchoolDemoAssignmentDraftInput["deliveryMode"],
                  }),
                value: draft.deliveryMode,
              },
              ["online-preview", "print-preview"].map((value) =>
                createElement("option", { key: value, value }, value),
              ),
            ),
          ),
          createElement(
            "button",
            {
              className: "button-link school-demo-secondary-link",
              onClick: () => setDraft(defaultDraft),
              type: "button",
            },
            "Reset synthetic draft",
          ),
        ),
        true,
      ),
      renderPanel(
        "school-demo-assignment-preview-summary",
        "Draft summary",
        listSummaryItems([
          ["State", preview.draftState],
          ["Teacher", preview.teacherDemoCode],
          ["Class", preview.classCode],
          ["Subject group", preview.subjectGroupCode],
          ["Package", preview.packageCode],
          ["Mode", preview.deliveryMode],
          ["Eligible roster rows", preview.eligibleStudentCount],
          ["Attempt limit", preview.settings.attemptLimit],
          ["Duration minutes", preview.settings.durationMinutes],
          ["Availability days", preview.settings.availabilityDays],
        ]),
        true,
      ),
      renderPanel(
        "school-demo-assignment-preview-blockers",
        "Blocked reasons",
        preview.blockedReasons.length > 0
          ? renderList(preview.blockedReasons)
          : createElement(
              "p",
              { className: "school-demo-muted" },
              "No local preview blockers. This still does not authorize real delivery.",
            ),
        true,
      ),
      renderPanel(
        "school-demo-assignment-preview-roster",
        "Eligible roster preview",
        renderTable({
          emptyLabel: "No eligible synthetic students for this class.",
          headers: ["Demo student code", "Class", "Enrollment"],
          rows: snapshot.students
            .filter((student) => student.classCode === preview.classCode)
            .map((student) => ({
              cells: [
                createElement("strong", { key: "student" }, student.demoCode),
                student.classCode,
                student.enrollmentState,
              ],
              key: student.demoCode,
            })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-assignment-preview-boundary",
        "Preview boundary",
        createElement(
          "div",
          { className: "school-demo-assignment-preview-boundary" },
          renderList(preview.reviewChecklist),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/delivery-preview",
              },
              "Open delivery rehearsal",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/import-preview",
              },
              "Open import preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/delivery-preview",
              },
              "Open delivery rehearsal",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              { className: "button-link school-demo-secondary-link", href: "/school-demo/rollout" },
              "Open rollout preview",
            ),
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoDeliveryPreviewView({ snapshot }: SchoolDemoDeliveryPreviewViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const defaultDraft = buildDefaultSchoolDemoAssignmentInput(snapshot);
  const [draft, setDraft] = useState<SchoolDemoAssignmentDraftInput>(defaultDraft);
  const preview = buildSchoolDemoDeliveryRehearsalPreview(draft, snapshot);

  function updateDraft(patch: Partial<SchoolDemoAssignmentDraftInput>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/assignment-preview",
      actionLabel: "Back to assignment preview",
      secondaryActionHref: "/school-demo/student-preview",
      secondaryActionLabel: "Student preview",
      subtitle:
        "Read-only delivery rehearsal for a synthetic teacher draft. It queues demo rows locally and stops before any real delivery.",
      title: "School demo delivery rehearsal",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "delivery-preview",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Delivery rehearsal metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Rehearsal state", preview.rehearsalState, "Browser-only"),
      renderMetric("Queued rows", preview.totals.queuedRows, "Synthetic roster"),
      renderMetric("Blocked rows", preview.totals.blockedRows, "Fail-closed"),
      renderMetric("Mode", preview.deliveryMode, "Preview channel"),
      renderMetric("Window", `${preview.settings.availabilityDays} days`, "Local setting"),
      renderMetric("Writes", preview.totals.writeCount, "No server mutation"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid school-demo-delivery-preview-grid" },
      renderPanel(
        "school-demo-delivery-preview-controls",
        "Delivery rehearsal controls",
        createElement(
          "div",
          {
            className:
              "school-demo-assignment-preview-controls school-demo-delivery-preview-controls",
          },
          createElement(
            "label",
            null,
            createElement("span", null, "Class"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic class for delivery rehearsal",
                onChange: (event) =>
                  updateDraft({
                    classCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: draft.classCode,
              },
              [...snapshot.classes]
                .sort(compareClassRecords)
                .map((schoolClass) =>
                  createElement(
                    "option",
                    { key: schoolClass.code, value: schoolClass.code },
                    `${schoolClass.code} / grade ${schoolClass.gradeLevel}`,
                  ),
                ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Teacher"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic teacher for delivery rehearsal",
                onChange: (event) =>
                  updateDraft({
                    teacherDemoCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: draft.teacherDemoCode,
              },
              [...snapshot.teachers]
                .sort((left, right) => left.demoCode.localeCompare(right.demoCode))
                .map((teacher) =>
                  createElement(
                    "option",
                    { key: teacher.demoCode, value: teacher.demoCode },
                    teacher.demoCode,
                  ),
                ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Subject group"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic subject group for delivery rehearsal",
                onChange: (event) =>
                  updateDraft({
                    subjectGroupCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: draft.subjectGroupCode,
              },
              snapshot.subjectGroups.map((subjectGroup) =>
                createElement(
                  "option",
                  { key: subjectGroup.code, value: subjectGroup.code },
                  subjectGroup.code,
                ),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Package"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic package code for delivery rehearsal",
                onChange: (event) =>
                  updateDraft({
                    packageCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: draft.packageCode,
              },
              schoolDemoAssignmentPackageOptions.map((packageCode) =>
                createElement("option", { key: packageCode, value: packageCode }, packageCode),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Attempt limit"),
            createElement(
              "select",
              {
                "aria-label": "Attempt limit for delivery rehearsal",
                onChange: (event) =>
                  updateDraft({
                    attemptLimit: Number((event.currentTarget as HTMLSelectElement).value),
                  }),
                value: String(draft.attemptLimit),
              },
              [1, 2, 3].map((value) =>
                createElement("option", { key: value, value: String(value) }, String(value)),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Duration"),
            createElement(
              "select",
              {
                "aria-label": "Duration for delivery rehearsal",
                onChange: (event) =>
                  updateDraft({
                    durationMinutes: Number((event.currentTarget as HTMLSelectElement).value),
                  }),
                value: String(draft.durationMinutes),
              },
              [30, 45, 60].map((value) =>
                createElement("option", { key: value, value: String(value) }, `${value} minutes`),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Availability"),
            createElement(
              "select",
              {
                "aria-label": "Availability window for delivery rehearsal",
                onChange: (event) =>
                  updateDraft({
                    availabilityDays: Number((event.currentTarget as HTMLSelectElement).value),
                  }),
                value: String(draft.availabilityDays),
              },
              [3, 5, 7, 14].map((value) =>
                createElement("option", { key: value, value: String(value) }, `${value} days`),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Mode"),
            createElement(
              "select",
              {
                "aria-label": "Delivery rehearsal mode",
                onChange: (event) =>
                  updateDraft({
                    deliveryMode: (event.currentTarget as HTMLSelectElement)
                      .value as SchoolDemoAssignmentDraftInput["deliveryMode"],
                  }),
                value: draft.deliveryMode,
              },
              ["online-preview", "print-preview"].map((value) =>
                createElement("option", { key: value, value }, value),
              ),
            ),
          ),
          createElement(
            "button",
            {
              className: "button-link school-demo-secondary-link",
              onClick: () => setDraft(defaultDraft),
              type: "button",
            },
            "Reset rehearsal",
          ),
        ),
        true,
      ),
      renderPanel(
        "school-demo-delivery-preview-summary",
        "Rehearsal summary",
        listSummaryItems([
          ["State", preview.rehearsalState],
          ["Teacher", preview.teacherDemoCode],
          ["Class", preview.classCode],
          ["Subject group", preview.subjectGroupCode],
          ["Package", preview.packageCode],
          ["Mode", preview.deliveryMode],
          ["Queued rows", preview.totals.queuedRows],
          ["Blocked rows", preview.totals.blockedRows],
          ["Write count", preview.totals.writeCount],
        ]),
        true,
      ),
      renderPanel(
        "school-demo-delivery-preview-channels",
        "Delivery channels",
        renderTable({
          emptyLabel: "No delivery rehearsal channels are available.",
          headers: ["Channel", "State", "Note"],
          rows: preview.channelRows.map((row) => ({
            cells: [
              createElement("strong", { key: "channel" }, row.channelCode),
              row.state,
              row.note,
            ],
            key: row.channelCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-delivery-preview-roster",
        "Roster queue rehearsal",
        renderTable({
          emptyLabel: "No synthetic roster rows are queued.",
          headers: ["Demo student code", "Class", "State", "Note"],
          rows: preview.rosterRows.map((row) => ({
            cells: [
              createElement("strong", { key: "student" }, row.studentDemoCode),
              row.classCode,
              row.rehearsalState,
              row.note,
            ],
            key: row.studentDemoCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-delivery-preview-timeline",
        "Stop-gated timeline",
        renderTable({
          emptyLabel: "No rehearsal timeline is available.",
          headers: ["Step", "State", "Note"],
          rows: preview.timelineRows.map((row) => ({
            cells: [createElement("strong", { key: "step" }, row.step), row.state, row.note],
            key: row.step,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-delivery-preview-blockers",
        "Blocked reasons",
        preview.blockedReasons.length > 0
          ? renderList(preview.blockedReasons)
          : createElement(
              "p",
              { className: "school-demo-muted" },
              "No local rehearsal blockers. Real delivery still waits for a later beta gate.",
            ),
        true,
      ),
      renderPanel(
        "school-demo-delivery-preview-boundary",
        "Delivery boundary",
        createElement(
          "div",
          { className: "school-demo-delivery-preview-boundary" },
          renderList(preview.safetyChecklist),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/student-preview",
              },
              "Open student preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/import-preview",
              },
              "Open import preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/summary",
              },
              "Open compact summary",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/rollout",
              },
              "Open rollout preview",
            ),
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoStudentPreviewView({ snapshot }: SchoolDemoStudentPreviewViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const defaultInput = buildDefaultSchoolDemoStudentDeliveryInput(snapshot);
  const [input, setInput] = useState<SchoolDemoStudentDeliveryPreviewInput>(defaultInput);
  const preview = buildSchoolDemoStudentDeliveryPreview(input, snapshot);

  function updateInput(patch: Partial<SchoolDemoStudentDeliveryPreviewInput>) {
    setInput((current) => ({ ...current, ...patch }));
  }

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/delivery-preview",
      actionLabel: "Back to delivery rehearsal",
      secondaryActionHref: "/school-demo/review-queue",
      secondaryActionLabel: "Review queue",
      subtitle:
        "Read-only learner-side preview for one synthetic demo student. It shows the assignment shell and disabled action area only.",
      title: "School demo student preview",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "student-preview",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Student preview metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Preview state", preview.previewState, "Browser-only"),
      renderMetric("Student", preview.studentDemoCode || "BLOCKED", "Synthetic demo code"),
      renderMetric("Class", preview.classCode || "BLOCKED", "Synthetic class code"),
      renderMetric("Workspace rows", preview.studentWorkspaceRows.length, "Read-only shell"),
      renderMetric("Learner writes", preview.totals.learnerRecordWrites, "No record writes"),
      renderMetric("Media uploads", preview.totals.mediaUploads, "Disabled"),
      renderMetric("Score updates", preview.totals.scoreUpdates, "Disabled"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid school-demo-student-preview-grid" },
      renderPanel(
        "school-demo-student-preview-controls",
        "Student preview controls",
        createElement(
          "div",
          {
            className:
              "school-demo-assignment-preview-controls school-demo-student-preview-controls",
          },
          createElement(
            "label",
            null,
            createElement("span", null, "Class"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic class for student preview",
                onChange: (event) =>
                  updateInput({
                    classCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.classCode,
              },
              [...snapshot.classes]
                .sort(compareClassRecords)
                .map((schoolClass) =>
                  createElement(
                    "option",
                    { key: schoolClass.code, value: schoolClass.code },
                    `${schoolClass.code} / grade ${schoolClass.gradeLevel}`,
                  ),
                ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Student"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic student for student preview",
                onChange: (event) =>
                  updateInput({
                    studentDemoCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.studentDemoCode,
              },
              [...snapshot.students]
                .sort(
                  (left, right) =>
                    left.classCode.localeCompare(right.classCode) ||
                    left.demoCode.localeCompare(right.demoCode),
                )
                .map((student) =>
                  createElement(
                    "option",
                    { key: student.demoCode, value: student.demoCode },
                    `${student.demoCode} / ${student.classCode}`,
                  ),
                ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Teacher"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic teacher for student preview",
                onChange: (event) =>
                  updateInput({
                    teacherDemoCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.teacherDemoCode,
              },
              [...snapshot.teachers]
                .sort((left, right) => left.demoCode.localeCompare(right.demoCode))
                .map((teacher) =>
                  createElement(
                    "option",
                    { key: teacher.demoCode, value: teacher.demoCode },
                    teacher.demoCode,
                  ),
                ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Subject group"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic subject group for student preview",
                onChange: (event) =>
                  updateInput({
                    subjectGroupCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.subjectGroupCode,
              },
              snapshot.subjectGroups.map((subjectGroup) =>
                createElement(
                  "option",
                  { key: subjectGroup.code, value: subjectGroup.code },
                  subjectGroup.code,
                ),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Package"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic package code for student preview",
                onChange: (event) =>
                  updateInput({
                    packageCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.packageCode,
              },
              schoolDemoAssignmentPackageOptions.map((packageCode) =>
                createElement("option", { key: packageCode, value: packageCode }, packageCode),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Attempt limit"),
            createElement(
              "select",
              {
                "aria-label": "Attempt limit for student preview",
                onChange: (event) =>
                  updateInput({
                    attemptLimit: Number((event.currentTarget as HTMLSelectElement).value),
                  }),
                value: String(input.attemptLimit),
              },
              [1, 2, 3].map((value) =>
                createElement("option", { key: value, value: String(value) }, String(value)),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Duration"),
            createElement(
              "select",
              {
                "aria-label": "Duration for student preview",
                onChange: (event) =>
                  updateInput({
                    durationMinutes: Number((event.currentTarget as HTMLSelectElement).value),
                  }),
                value: String(input.durationMinutes),
              },
              [30, 45, 60].map((value) =>
                createElement("option", { key: value, value: String(value) }, `${value} minutes`),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Availability"),
            createElement(
              "select",
              {
                "aria-label": "Availability window for student preview",
                onChange: (event) =>
                  updateInput({
                    availabilityDays: Number((event.currentTarget as HTMLSelectElement).value),
                  }),
                value: String(input.availabilityDays),
              },
              [3, 5, 7, 14].map((value) =>
                createElement("option", { key: value, value: String(value) }, `${value} days`),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Mode"),
            createElement(
              "select",
              {
                "aria-label": "Delivery mode for student preview",
                onChange: (event) =>
                  updateInput({
                    deliveryMode: (event.currentTarget as HTMLSelectElement)
                      .value as SchoolDemoAssignmentDraftInput["deliveryMode"],
                  }),
                value: input.deliveryMode,
              },
              ["online-preview", "print-preview"].map((value) =>
                createElement("option", { key: value, value }, value),
              ),
            ),
          ),
          createElement(
            "button",
            {
              className: "button-link school-demo-secondary-link",
              onClick: () => setInput(defaultInput),
              type: "button",
            },
            "Reset student preview",
          ),
        ),
        true,
      ),
      renderPanel(
        "school-demo-student-preview-card",
        "Student assignment card",
        renderTable({
          emptyLabel: "No assignment card rows are available.",
          headers: ["Field", "Value"],
          rows: preview.assignmentCardRows.map((row) => ({
            cells: [createElement("strong", { key: "label" }, row.label), row.value],
            key: row.label,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-student-preview-workspace",
        "Student workspace shell",
        renderTable({
          emptyLabel: "No workspace rows are available.",
          headers: ["Control", "State", "Note"],
          rows: preview.studentWorkspaceRows.map((row) => ({
            cells: [createElement("strong", { key: "control" }, row.control), row.state, row.note],
            key: row.control,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-student-preview-blockers",
        "Blocked reasons",
        preview.blockedReasons.length > 0
          ? renderList(preview.blockedReasons)
          : createElement(
              "p",
              { className: "school-demo-muted" },
              "No local student preview blockers. Real student access still waits for a later beta gate.",
            ),
        true,
      ),
      renderPanel(
        "school-demo-student-preview-boundary",
        "Student preview boundary",
        createElement(
          "div",
          { className: "school-demo-student-preview-boundary" },
          renderList(preview.safetyChecklist),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/delivery-preview",
              },
              "Open delivery rehearsal",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/review-queue",
              },
              "Open review queue",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/summary",
              },
              "Open compact summary",
            ),
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoTeacherReviewQueueView({
  snapshot,
}: SchoolDemoTeacherReviewQueueViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const defaultInput = buildDefaultSchoolDemoTeacherReviewQueueInput(snapshot);
  const [input, setInput] = useState<SchoolDemoTeacherReviewQueueInput>(defaultInput);
  const preview = buildSchoolDemoTeacherReviewQueuePreview(input, snapshot);

  function updateInput(patch: Partial<SchoolDemoTeacherReviewQueueInput>) {
    setInput((current) => ({ ...current, ...patch }));
  }

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/student-preview",
      actionLabel: "Back to student preview",
      secondaryActionHref: "/school-demo/review-rubric",
      secondaryActionLabel: "Review rubric",
      subtitle:
        "Read-only teacher review queue preview for synthetic class rows. It shows disabled teacher actions only.",
      title: "School demo review queue",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "review-queue",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Review queue metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Queue state", preview.queueState, "Browser-only"),
      renderMetric("Class", preview.classCode || "BLOCKED", "Synthetic class code"),
      renderMetric("Teacher", preview.teacherDemoCode || "BLOCKED", "Synthetic teacher code"),
      renderMetric("Queue items", preview.totals.queueItems, "Synthetic roster"),
      renderMetric("Teacher decisions", preview.totals.teacherDecisionWrites, "Disabled"),
      renderMetric("Score updates", preview.totals.scoreUpdates, "Disabled"),
      renderMetric("Learner writes", preview.totals.learnerRecordWrites, "Disabled"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid school-demo-review-queue-grid" },
      renderPanel(
        "school-demo-review-queue-controls",
        "Review queue controls",
        createElement(
          "div",
          {
            className: "school-demo-assignment-preview-controls school-demo-review-queue-controls",
          },
          createElement(
            "label",
            null,
            createElement("span", null, "Class"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic class for review queue",
                onChange: (event) =>
                  updateInput({
                    classCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.classCode,
              },
              [...snapshot.classes]
                .sort(compareClassRecords)
                .map((schoolClass) =>
                  createElement(
                    "option",
                    { key: schoolClass.code, value: schoolClass.code },
                    `${schoolClass.code} / grade ${schoolClass.gradeLevel}`,
                  ),
                ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Teacher"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic teacher for review queue",
                onChange: (event) =>
                  updateInput({
                    teacherDemoCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.teacherDemoCode,
              },
              [...snapshot.teachers]
                .sort((left, right) => left.demoCode.localeCompare(right.demoCode))
                .map((teacher) =>
                  createElement(
                    "option",
                    { key: teacher.demoCode, value: teacher.demoCode },
                    teacher.demoCode,
                  ),
                ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Subject group"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic subject group for review queue",
                onChange: (event) =>
                  updateInput({
                    subjectGroupCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.subjectGroupCode,
              },
              snapshot.subjectGroups.map((subjectGroup) =>
                createElement(
                  "option",
                  { key: subjectGroup.code, value: subjectGroup.code },
                  subjectGroup.code,
                ),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Package"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic package code for review queue",
                onChange: (event) =>
                  updateInput({
                    packageCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.packageCode,
              },
              schoolDemoAssignmentPackageOptions.map((packageCode) =>
                createElement("option", { key: packageCode, value: packageCode }, packageCode),
              ),
            ),
          ),
          createElement(
            "button",
            {
              className: "button-link school-demo-secondary-link",
              onClick: () => setInput(defaultInput),
              type: "button",
            },
            "Reset review queue",
          ),
        ),
        true,
      ),
      renderPanel(
        "school-demo-review-queue-summary",
        "Review queue summary",
        renderTable({
          emptyLabel: "No review queue summary rows are available.",
          headers: ["Field", "Value"],
          rows: [
            ["State", preview.queueState],
            ["Class", preview.classCode],
            ["Teacher", preview.teacherDemoCode],
            ["Subject group", preview.subjectGroupCode],
            ["Package", preview.packageCode],
            ["Queue items", preview.totals.queueItems],
            ["Teacher decision writes", preview.totals.teacherDecisionWrites],
            ["Score updates", preview.totals.scoreUpdates],
          ].map(([label, value]) => ({
            cells: [createElement("strong", { key: "label" }, label), value],
            key: String(label),
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-review-queue-table",
        "Synthetic review queue rows",
        renderTable({
          emptyLabel: "No synthetic review queue rows are available.",
          headers: ["Demo student code", "Class", "Teacher", "State", "Note"],
          rows: preview.queueRows.map((row) => ({
            cells: [
              createElement("strong", { key: "student" }, row.studentDemoCode),
              row.classCode,
              row.teacherDemoCode,
              row.reviewState,
              row.note,
            ],
            key: row.studentDemoCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-review-queue-policy",
        "Review policy shell",
        renderTable({
          emptyLabel: "No review policy rows are available.",
          headers: ["Policy area", "Status"],
          rows: preview.reviewPolicyRows.map((row) => ({
            cells: [createElement("strong", { key: "policy" }, row.policy), row.status],
            key: row.policy,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-review-queue-blockers",
        "Blocked reasons",
        preview.blockedReasons.length > 0
          ? renderList(preview.blockedReasons)
          : createElement(
              "p",
              { className: "school-demo-muted" },
              "No local review queue blockers. Real teacher review still waits for a later beta gate.",
            ),
        true,
      ),
      renderPanel(
        "school-demo-review-queue-boundary",
        "Review queue boundary",
        createElement(
          "div",
          { className: "school-demo-review-queue-boundary" },
          renderList(preview.safetyChecklist),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/student-preview",
              },
              "Open student preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/review-rubric",
              },
              "Open review rubric",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/summary",
              },
              "Open compact summary",
            ),
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoTeacherReviewRubricView({
  snapshot,
}: SchoolDemoTeacherReviewRubricViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const defaultInput = buildDefaultSchoolDemoTeacherReviewRubricInput(snapshot);
  const [input, setInput] = useState<SchoolDemoTeacherReviewRubricInput>(defaultInput);
  const preview = buildSchoolDemoTeacherReviewRubricPreview(input, snapshot);

  function updateInput(patch: Partial<SchoolDemoTeacherReviewRubricInput>) {
    setInput((current) => ({ ...current, ...patch }));
  }

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/review-queue",
      actionLabel: "Back to review queue",
      secondaryActionHref: "/school-demo/analytics",
      secondaryActionLabel: "Class analytics",
      subtitle:
        "Read-only teacher rubric preview for synthetic review rows. It explains the future check path without creating grades or decisions.",
      title: "School demo review rubric",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "review-rubric",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Review rubric metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Rubric state", preview.rubricState, "Browser-only"),
      renderMetric("Criteria", preview.totals.rubricCriteria, "Display-only"),
      renderMetric("Queue rows", preview.queueContextRows.length, "Synthetic context"),
      renderMetric("Teacher decisions", preview.totals.teacherDecisionWrites, "Disabled"),
      renderMetric("Evidence writes", preview.totals.evidenceWrites, "Disabled"),
      renderMetric("Score updates", preview.totals.scoreUpdates, "Disabled"),
      renderMetric("Learner writes", preview.totals.learnerRecordWrites, "Disabled"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid school-demo-review-rubric-grid" },
      renderPanel(
        "school-demo-review-rubric-controls",
        "Review rubric controls",
        createElement(
          "div",
          {
            className: "school-demo-assignment-preview-controls school-demo-review-rubric-controls",
          },
          createElement(
            "label",
            null,
            createElement("span", null, "Class"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic class for review rubric",
                onChange: (event) =>
                  updateInput({
                    classCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.classCode,
              },
              [...snapshot.classes]
                .sort(compareClassRecords)
                .map((schoolClass) =>
                  createElement(
                    "option",
                    { key: schoolClass.code, value: schoolClass.code },
                    `${schoolClass.code} / grade ${schoolClass.gradeLevel}`,
                  ),
                ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Teacher"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic teacher for review rubric",
                onChange: (event) =>
                  updateInput({
                    teacherDemoCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.teacherDemoCode,
              },
              [...snapshot.teachers]
                .sort((left, right) => left.demoCode.localeCompare(right.demoCode))
                .map((teacher) =>
                  createElement(
                    "option",
                    { key: teacher.demoCode, value: teacher.demoCode },
                    teacher.demoCode,
                  ),
                ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Subject group"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic subject group for review rubric",
                onChange: (event) =>
                  updateInput({
                    subjectGroupCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.subjectGroupCode,
              },
              snapshot.subjectGroups.map((subjectGroup) =>
                createElement(
                  "option",
                  { key: subjectGroup.code, value: subjectGroup.code },
                  subjectGroup.code,
                ),
              ),
            ),
          ),
          createElement(
            "label",
            null,
            createElement("span", null, "Package"),
            createElement(
              "select",
              {
                "aria-label": "Synthetic package code for review rubric",
                onChange: (event) =>
                  updateInput({
                    packageCode: (event.currentTarget as HTMLSelectElement).value,
                  }),
                value: input.packageCode,
              },
              schoolDemoAssignmentPackageOptions.map((packageCode) =>
                createElement("option", { key: packageCode, value: packageCode }, packageCode),
              ),
            ),
          ),
          createElement(
            "button",
            {
              className: "button-link school-demo-secondary-link",
              onClick: () => setInput(defaultInput),
              type: "button",
            },
            "Reset review rubric",
          ),
        ),
        true,
      ),
      renderPanel(
        "school-demo-review-rubric-summary",
        "Review rubric summary",
        renderTable({
          emptyLabel: "No review rubric summary rows are available.",
          headers: ["Field", "Value"],
          rows: [
            ["State", preview.rubricState],
            ["Class", preview.classCode],
            ["Teacher", preview.teacherDemoCode],
            ["Subject group", preview.subjectGroupCode],
            ["Package", preview.packageCode],
            ["Criteria", preview.totals.rubricCriteria],
            ["Teacher decision writes", preview.totals.teacherDecisionWrites],
            ["Evidence writes", preview.totals.evidenceWrites],
          ].map(([label, value]) => ({
            cells: [createElement("strong", { key: "label" }, label), value],
            key: String(label),
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-review-rubric-table",
        "Display-only rubric rows",
        renderTable({
          emptyLabel: "No rubric rows are available.",
          headers: ["Area", "Evidence", "Reviewer action", "State"],
          rows: preview.rubricRows.map((row) => ({
            cells: [
              createElement("strong", { key: "area" }, row.area),
              row.evidence,
              row.reviewerAction,
              row.state,
            ],
            key: row.area,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-review-rubric-context",
        "Synthetic queue context",
        renderTable({
          emptyLabel: "No synthetic queue context rows are available.",
          headers: ["Demo student code", "Class", "State"],
          rows: preview.queueContextRows.map((row) => ({
            cells: [
              createElement("strong", { key: "student" }, row.studentDemoCode),
              row.classCode,
              row.reviewState,
            ],
            key: row.studentDemoCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-review-rubric-blockers",
        "Blocked reasons",
        preview.blockedReasons.length > 0
          ? renderList(preview.blockedReasons)
          : createElement(
              "p",
              { className: "school-demo-muted" },
              "No local rubric blockers. Real rubric-assisted review still waits for a later beta gate.",
            ),
        true,
      ),
      renderPanel(
        "school-demo-review-rubric-boundary",
        "Review rubric boundary",
        createElement(
          "div",
          { className: "school-demo-review-rubric-boundary" },
          renderList(preview.safetyChecklist),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/review-queue",
              },
              "Open review queue",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/analytics",
              },
              "Open class analytics",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/summary",
              },
              "Open compact summary",
            ),
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoClassAnalyticsView({ snapshot }: SchoolDemoClassAnalyticsViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const preview = buildSchoolDemoClassAnalyticsPreview(snapshot);

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/review-rubric",
      actionLabel: "Back to review rubric",
      secondaryActionHref: "/school-demo/teacher-dashboard",
      secondaryActionLabel: "Teacher dashboard",
      subtitle:
        "Read-only class analytics preview for the synthetic school snapshot. It shows counts and load signals without grades, learner work or production records.",
      title: "School demo class analytics",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "analytics",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Class analytics metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Analytics state", preview.analyticsState, "Display-only"),
      renderMetric("Classes", preview.totals.classCount, "Grades 7-9"),
      renderMetric("Enrolled demo students", preview.totals.enrolledStudents, "Synthetic codes"),
      renderMetric("Teacher assignments", preview.totals.teacherAssignmentCount, "Demo roles"),
      renderMetric("Queue rows", preview.totals.queueRows, "Placeholder load"),
      renderMetric("Analytics writes", preview.totals.analyticsWrites, "Disabled"),
      renderMetric("Score updates", preview.totals.scoreUpdates, "Disabled"),
      renderMetric("Learner writes", preview.totals.learnerRecordWrites, "Disabled"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid school-demo-analytics-grid" },
      renderPanel(
        "school-demo-analytics-summary",
        "Analytics summary",
        renderTable({
          emptyLabel: "No analytics summary rows are available.",
          headers: ["Field", "Value"],
          rows: [
            ["State", preview.analyticsState],
            ["Class count", preview.totals.classCount],
            ["Subject groups", preview.totals.subjectGroupCount],
            ["Teacher assignments", preview.totals.teacherAssignmentCount],
            ["Production data", preview.totals.productionDataCount],
            ["Real schools", preview.totals.realSchoolCount],
            ["Evidence writes", preview.totals.evidenceWrites],
            ["Learner record writes", preview.totals.learnerRecordWrites],
          ].map(([label, value]) => ({
            cells: [createElement("strong", { key: "label" }, label), value],
            key: String(label),
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-analytics-class-table",
        "Synthetic class analytics rows",
        renderTable({
          emptyLabel: "No synthetic class analytics rows are available.",
          headers: [
            "Class",
            "Grade",
            "Demo students",
            "Subject groups",
            "Teacher assignments",
            "Queue load",
            "State",
          ],
          rows: preview.analyticsRows.map((row) => ({
            cells: [
              createElement("strong", { key: "class" }, row.classCode),
              row.gradeLevel,
              row.enrolledStudents,
              row.subjectGroupCount,
              row.teacherAssignmentCount,
              row.queueLoad,
              row.signalState,
            ],
            key: row.classCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-analytics-teacher-load",
        "Synthetic teacher load",
        renderTable({
          emptyLabel: "No synthetic teacher load rows are available.",
          headers: ["Teacher demo code", "Classes", "Subject groups", "Assignments"],
          rows: preview.teacherLoadRows.map((row) => ({
            cells: [
              createElement("strong", { key: "teacher" }, row.demoCode),
              joinValues(row.classCodes),
              joinValues(row.subjectGroupCodes),
              row.assignmentCount,
            ],
            key: row.demoCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-analytics-signal-table",
        "Display-only signal rows",
        renderTable({
          emptyLabel: "No signal rows are available.",
          headers: ["Signal", "Note", "State"],
          rows: preview.signalRows.map((row) => ({
            cells: [createElement("strong", { key: "label" }, row.label), row.note, row.state],
            key: row.label,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-analytics-blockers",
        "Blocked reasons",
        preview.blockedReasons.length > 0
          ? renderList(preview.blockedReasons)
          : createElement(
              "p",
              { className: "school-demo-muted" },
              "No local analytics blockers. Real class analytics still waits for a later beta gate.",
            ),
        true,
      ),
      renderPanel(
        "school-demo-analytics-boundary",
        "Analytics boundary",
        createElement(
          "div",
          { className: "school-demo-analytics-boundary" },
          renderList(preview.safetyChecklist),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/review-rubric",
              },
              "Open review rubric",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/teacher-dashboard",
              },
              "Open teacher dashboard",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/summary",
              },
              "Open compact summary",
            ),
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoTeacherDashboardView({ snapshot }: SchoolDemoTeacherDashboardViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const preview = buildSchoolDemoTeacherDashboardPreview(snapshot);

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/analytics",
      actionLabel: "Back to analytics",
      secondaryActionHref: "/school-demo/print-pack",
      secondaryActionLabel: "Print pack",
      subtitle:
        "Read-only consolidated teacher dashboard for the synthetic school demo. It links existing demo surfaces without creating assignments, delivery, review or analytics records.",
      title: "School demo teacher dashboard",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "teacher-dashboard",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Teacher dashboard metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Dashboard state", preview.dashboardState, "Display-only"),
      renderMetric("Classes", preview.totals.classCount, "Grades 7-9"),
      renderMetric("Demo students", preview.totals.studentCount, "Synthetic codes"),
      renderMetric("Teachers", preview.totals.teacherCount, "Demo roles"),
      renderMetric("Queue items", preview.totals.queueItems, "Placeholder rows"),
      renderMetric("Rubric criteria", preview.totals.rubricCriteria, "Display-only"),
      renderMetric("Teacher decisions", preview.totals.teacherDecisionWrites, "Disabled"),
      renderMetric("Writes", preview.totals.assignmentWrites, "Disabled"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid school-demo-teacher-dashboard-grid" },
      renderPanel(
        "school-demo-teacher-dashboard-overview",
        "Teacher dashboard overview",
        renderTable({
          emptyLabel: "No teacher dashboard overview rows are available.",
          headers: ["Field", "Value"],
          rows: [
            ["State", preview.dashboardState],
            ["Class count", preview.totals.classCount],
            ["Demo students", preview.totals.studentCount],
            ["Teacher demo roles", preview.totals.teacherCount],
            ["Subject groups", preview.totals.subjectGroupCount],
            ["Queue items", preview.totals.queueItems],
            ["Rubric criteria", preview.totals.rubricCriteria],
            ["Learner record writes", preview.totals.learnerRecordWrites],
          ].map(([label, value]) => ({
            cells: [createElement("strong", { key: "label" }, label), value],
            key: String(label),
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-teacher-dashboard-surface-map",
        "Surface map",
        renderTable({
          emptyLabel: "No teacher dashboard surfaces are available.",
          headers: ["Surface", "State", "Note", "Link"],
          rows: preview.surfaceRows.map((row) => ({
            cells: [
              createElement("strong", { key: "surface" }, row.surface),
              row.state,
              row.note,
              createElement(
                "a",
                { className: "button-link school-demo-table-link", href: row.href, key: "link" },
                "Open",
              ),
            ],
            key: row.surface,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-teacher-dashboard-class-table",
        "Class dashboard rows",
        renderTable({
          emptyLabel: "No teacher dashboard class rows are available.",
          headers: ["Class", "Grade", "Demo students", "Teachers", "Queue load", "State"],
          rows: preview.classRows.map((row) => ({
            cells: [
              createElement("strong", { key: "class" }, row.classCode),
              row.gradeLevel,
              row.enrolledStudents,
              joinValues(row.teacherDemoCodes),
              row.queueLoad,
              row.state,
            ],
            key: row.classCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-teacher-dashboard-zero-writes",
        "Operational write counters",
        renderTable({
          emptyLabel: "No operational counters are available.",
          headers: ["Counter", "Value"],
          rows: [
            ["Assignment writes", preview.totals.assignmentWrites],
            ["Delivery writes", preview.totals.deliveryWrites],
            ["Import writes", preview.totals.importWrites],
            ["Evidence writes", preview.totals.evidenceWrites],
            ["Learner record writes", preview.totals.learnerRecordWrites],
            ["Score updates", preview.totals.scoreUpdates],
            ["Teacher decision writes", preview.totals.teacherDecisionWrites],
          ].map(([label, value]) => ({
            cells: [createElement("strong", { key: "label" }, label), value],
            key: String(label),
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-teacher-dashboard-blockers",
        "Blocked reasons",
        preview.blockedReasons.length > 0
          ? renderList(preview.blockedReasons)
          : createElement(
              "p",
              { className: "school-demo-muted" },
              "No local teacher dashboard blockers. Real teacher workspace still waits for a later beta gate.",
            ),
        true,
      ),
      renderPanel(
        "school-demo-teacher-dashboard-boundary",
        "Teacher dashboard boundary",
        createElement(
          "div",
          { className: "school-demo-teacher-dashboard-boundary" },
          renderList(preview.safetyChecklist),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/analytics",
              },
              "Open class analytics",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/print-pack",
              },
              "Open print pack",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/summary",
              },
              "Open compact summary",
            ),
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoPrintPackView({ snapshot }: SchoolDemoPrintPackViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const preview = buildSchoolDemoPrintPackPreview(snapshot);

  return createElement(
    "main",
    {
      className:
        "app-shell school-demo-shell school-demo-summary-shell school-demo-print-pack-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/teacher-dashboard",
      actionLabel: "Back to teacher dashboard",
      secondaryActionHref: "/school-demo/summary",
      secondaryActionLabel: "Compact summary",
      subtitle:
        "Browser-print pack for the synthetic school demo. It keeps the meeting view compact without creating files, storage objects or server render jobs.",
      title: "School demo print pack",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "print-pack",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Print pack metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Pack state", preview.packState, "Browser print only"),
      renderMetric("Sections", preview.sectionRows.length, "Meeting pack"),
      renderMetric("Classes", preview.classRows.length, "Grades 7-9"),
      renderMetric("Generated files", preview.totals.generatedFiles, "Disabled"),
      renderMetric("Server render jobs", preview.totals.serverRenderJobs, "Disabled"),
      renderMetric("Storage objects", preview.totals.storageObjects, "Disabled"),
      renderMetric("Production data", preview.totals.productionDataCount, "0 required"),
      renderMetric("Real schools", preview.totals.realSchoolCount, "0 required"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid school-demo-print-pack-grid" },
      renderPanel(
        "school-demo-print-pack-cover",
        "Print pack cover",
        renderTable({
          emptyLabel: "No print pack cover rows are available.",
          headers: ["Field", "Value"],
          rows: preview.boundaryRows.map((row) => ({
            cells: [createElement("strong", { key: "label" }, row.label), row.value],
            key: row.label,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-print-pack-sections",
        "Printable sections",
        renderTable({
          emptyLabel: "No printable sections are available.",
          headers: ["Section", "State", "Note", "Link"],
          rows: preview.sectionRows.map((row) => ({
            cells: [
              createElement("strong", { key: "section" }, row.section),
              row.state,
              row.note,
              createElement(
                "a",
                { className: "button-link school-demo-table-link", href: row.href, key: "link" },
                "Open",
              ),
            ],
            key: row.section,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-print-pack-class-snapshot",
        "Class snapshot",
        renderTable({
          emptyLabel: "No class snapshot rows are available.",
          headers: ["Class", "Grade", "Demo students", "Teachers", "Queue load"],
          rows: preview.classRows.map((row) => ({
            cells: [
              createElement("strong", { key: "class" }, row.classCode),
              row.gradeLevel,
              row.enrolledStudents,
              joinValues(row.teacherDemoCodes),
              row.queueLoad,
            ],
            key: row.classCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-print-pack-output-counters",
        "Output counters",
        renderTable({
          emptyLabel: "No output counters are available.",
          headers: ["Counter", "Value"],
          rows: [
            ["Generated files", preview.totals.generatedFiles],
            ["Print job writes", preview.totals.printJobWrites],
            ["Server render jobs", preview.totals.serverRenderJobs],
            ["Storage objects", preview.totals.storageObjects],
            ["Production data", preview.totals.productionDataCount],
            ["Real schools", preview.totals.realSchoolCount],
          ].map(([label, value]) => ({
            cells: [createElement("strong", { key: "label" }, label), value],
            key: String(label),
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-print-pack-checklist",
        "Print checklist",
        renderTable({
          emptyLabel: "No print checklist rows are available.",
          headers: ["Item", "State"],
          rows: preview.checklistRows.map((row) => ({
            cells: [createElement("strong", { key: "item" }, row.item), row.state],
            key: row.item,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-print-pack-boundary",
        "Print pack boundary",
        createElement(
          "div",
          { className: "school-demo-print-pack-boundary" },
          renderList(preview.safetyChecklist),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/teacher-dashboard",
              },
              "Open teacher dashboard",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/import-preview",
              },
              "Open import preview",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/summary",
              },
              "Open compact summary",
            ),
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoImportPreviewView({ snapshot }: SchoolDemoImportPreviewViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const sampleCsv = buildSchoolDemoRosterImportSample(snapshot);
  const [csvText, setCsvText] = useState(sampleCsv);
  const [preview, setPreview] = useState<SchoolDemoRosterImportPreviewResult>(() =>
    parseSchoolDemoRosterImportPreview(sampleCsv, snapshot),
  );

  function handlePreview() {
    setPreview(parseSchoolDemoRosterImportPreview(csvText, snapshot));
  }

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/pilot-config",
      actionLabel: "Back to pilot config",
      secondaryActionHref: "/school-demo/summary",
      secondaryActionLabel: "Compact summary",
      subtitle:
        "Read-only local roster import preview for synthetic demo codes. It parses CSV text in the browser and saves nothing.",
      title: "School demo import preview",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "import-preview",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Import preview metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Preview mode", "Local", "Browser-only CSV text parse"),
      renderMetric("Accepted rows", preview.acceptedRows.length, "Synthetic codes only"),
      renderMetric("Rejected rows", preview.rejectedRows.length, "Fail-closed preview"),
      renderMetric("Classes checked", preview.classRows.length, "Snapshot class codes"),
      renderMetric("Teacher rows", preview.teacherAssignmentRows, "Assignment preview only"),
      renderMetric("Writes", "0", "No upload, no server save"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid school-demo-import-preview-grid" },
      renderPanel(
        "school-demo-import-preview-input",
        "Synthetic CSV preview",
        createElement(
          "div",
          { className: "school-demo-import-preview-editor" },
          createElement(
            "p",
            null,
            "Use the fixed demo layout: rowType,demoCode,classCode,subjectGroupCode. Accepted values must already exist in the synthetic snapshot.",
          ),
          createElement("textarea", {
            "aria-label": "Synthetic roster CSV preview text",
            className: "school-demo-import-preview-textarea",
            onChange: (event) => setCsvText((event.currentTarget as HTMLTextAreaElement).value),
            spellCheck: false,
            value: csvText,
          }),
          createElement(
            "div",
            { className: "school-demo-import-preview-actions" },
            createElement(
              "button",
              {
                className: "button-link",
                onClick: handlePreview,
                type: "button",
              },
              "Preview rows",
            ),
            createElement(
              "button",
              {
                className: "button-link school-demo-secondary-link",
                onClick: () => {
                  setCsvText(sampleCsv);
                  setPreview(parseSchoolDemoRosterImportPreview(sampleCsv, snapshot));
                },
                type: "button",
              },
              "Reset synthetic sample",
            ),
          ),
        ),
        true,
      ),
      renderPanel(
        "school-demo-import-preview-class-summary",
        "Class row summary",
        renderTable({
          emptyLabel: "No class preview rows are available.",
          headers: ["Class", "Accepted student rows"],
          rows: preview.classRows.map((row) => ({
            cells: [
              createElement("strong", { key: "class" }, row.classCode),
              row.acceptedStudentRows,
            ],
            key: row.classCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-import-preview-accepted",
        "Accepted preview rows",
        renderTable({
          emptyLabel: "No rows are accepted.",
          headers: ["Line", "Type", "Demo code", "Class", "Subject group"],
          rows: preview.acceptedRows.map((row) => ({
            cells: [
              row.lineNumber,
              row.rowType,
              createElement("strong", { key: "demo" }, row.demoCode),
              row.classCode,
              row.subjectGroupCode,
            ],
            key: `${row.lineNumber}-${row.demoCode}`,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-import-preview-rejected",
        "Rejected preview rows",
        renderTable({
          emptyLabel: "No rejected rows in the current preview.",
          headers: ["Line", "Reason"],
          rows: preview.rejectedRows.map((row) => ({
            cells: [row.lineNumber, row.reason],
            key: `${row.lineNumber}-${row.reason}`,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-import-preview-boundary",
        "Import boundary",
        createElement(
          "div",
          { className: "school-demo-import-preview-boundary" },
          renderList([
            "Client-only preview: no upload and no saved records.",
            "Accepted rows must use synthetic snapshot class, teacher, student and subject group codes.",
            "Contact data, URLs, raw identity-like values and unsupported free text are rejected.",
            "Real roster intake remains blocked until business, legal, security and review gates are approved.",
          ]),
          createElement(
            "p",
            null,
            createElement(
              "a",
              { className: "button-link school-demo-secondary-link", href: "/school-demo/rollout" },
              "Open rollout preview",
            ),
          ),
        ),
        true,
      ),
      renderPanel(
        "school-demo-import-preview-warnings",
        "Preview warnings",
        renderList(preview.warnings),
        true,
      ),
    ),
  );
}

export function SchoolDemoRolloutView({ snapshot }: SchoolDemoRolloutViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const guidedClassCode = classOverviews[0]?.code;
  const rolloutPhases = [
    {
      focus: "Kickoff and scope",
      output: "Roles, classes and synthetic boundary are confirmed.",
      week: "Week 1",
    },
    {
      focus: "Data preview",
      output: "Synthetic classes, subjects and teacher mappings are checked.",
      week: "Week 2",
    },
    {
      focus: "Manual rehearsal",
      output: "Fallback path and school admin handoff are rehearsed.",
      week: "Week 3",
    },
    {
      focus: "Readout and review",
      output: "Success criteria, escalation path and next gate are recorded.",
      week: "Week 4",
    },
  ];
  const onboardingRoles = [
    {
      responsibility: "Owns the pilot conversation and pilot intent.",
      role: "School sponsor",
    },
    {
      responsibility: "Checks classes, roles and rollout assumptions.",
      role: "School admin",
    },
    {
      responsibility: "Confirms class-level fit and teaching flow.",
      role: "Class teacher",
    },
    {
      responsibility: "Supports the demo and escalates issues.",
      role: "Learnika support",
    },
  ];
  const importAssumptions = [
    "CSV/XLSX preview only, with no real-school ingestion in this slice.",
    "Class, subject and teacher codes stay synthetic and local-only.",
    "Grade 7-9 layout remains the supported pilot shape for now.",
    "Any real import path waits for later legal, consent and tenant approval.",
  ];
  const manualFallbackPath = [
    "Use the summary and handoff pages if the import preview is unavailable.",
    "Continue with synthetic roster codes instead of real student records.",
    "Keep the walkthrough read-only and stop on uncertainty.",
    "Return to the business gate before any operational school use.",
  ];
  const supportEscalation = [
    "Teacher records the issue during the demo and keeps real data out of the flow.",
    "School admin routes the question to Learnika support.",
    "Support captures the blocker without operational intake or writes.",
    "Any real-school decision waits for the later approval gate.",
  ];
  const successCriteria = [
    "The school understands the synthetic boundary and rollout steps.",
    "Class, subject and teacher-role assumptions fit the conversation.",
    "The manual fallback path is clear if preview data is unavailable.",
    "No PII, writes or activation happen during the demo.",
  ];
  const demoOnlyVsRealLaterRows = [
    {
      cells: ["Synthetic organization, school and classes", "Named school tenant and approvals"],
      key: "tenant",
    },
    {
      cells: ["Preview-only CSV/XLSX assumptions", "Approved import and roster sync"],
      key: "import",
    },
    {
      cells: ["Read-only demo pages and static checks", "Operational school workflow and support"],
      key: "workflow",
    },
    {
      cells: ["No PII or real roster data", "Consent-backed real student and teacher records"],
      key: "data",
    },
  ];

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell school-demo-summary-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo/pilot-config",
      actionLabel: "Back to pilot config",
      secondaryActionHref: "/school-demo/handoff",
      secondaryActionLabel: "Back to handoff",
      subtitle:
        "Read-only school pilot rollout and integration preview. It stays synthetic, non-operational and local-only.",
      title: "School demo rollout preview",
    }),
    renderStatusStrip(snapshot),
    renderGuidedWalkthrough({
      activeStep: "rollout",
      classCode: guidedClassCode,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "Rollout preview metrics",
        className: "school-demo-compact-kpi-grid",
      },
      renderMetric("Weeks", rolloutPhases.length, "Preview-only rollout horizon"),
      renderMetric(
        "Roles",
        onboardingRoles.length,
        joinValues(onboardingRoles.map((item) => item.role)),
      ),
      renderMetric("Import mode", "CSV/XLSX", "Preview only"),
      renderMetric("Fallback", "Manual", "No hidden writes"),
      renderMetric("Support", "Teacher + admin + support", "Escalation path"),
      renderMetric("Success criteria", successCriteria.length, "Read-only checkpoints"),
      renderMetric("Writes", "0", "No operational intake"),
    ),
    createElement(
      "div",
      { className: "school-demo-summary-grid" },
      renderPanel(
        "school-demo-rollout-phases",
        "Pilot phases by week",
        renderTable({
          emptyLabel: "No rollout phases are available.",
          headers: ["Week", "Focus", "Output"],
          rows: rolloutPhases.map((phase) => ({
            cells: [phase.week, phase.focus, phase.output],
            key: phase.week,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-rollout-roles",
        "Onboarding roles and responsibilities",
        renderTable({
          emptyLabel: "No onboarding roles are available.",
          headers: ["Role", "Responsibility"],
          rows: onboardingRoles.map((role) => ({
            cells: [createElement("strong", null, role.role), role.responsibility],
            key: role.role,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-rollout-imports",
        "Synthetic data import assumptions",
        renderList(importAssumptions),
        true,
      ),
      renderPanel(
        "school-demo-rollout-fallback",
        "Manual fallback path",
        renderList(manualFallbackPath),
        true,
      ),
      renderPanel(
        "school-demo-rollout-support",
        "Support / escalation path",
        renderList(supportEscalation),
        true,
      ),
      renderPanel(
        "school-demo-rollout-success",
        "Pilot success criteria",
        renderList(successCriteria),
        true,
      ),
      renderPanel(
        "school-demo-rollout-boundary",
        "Demo-only versus real later",
        renderTable({
          emptyLabel: "No rollout boundary rows are available.",
          headers: ["Demo-only", "Real later"],
          rows: demoOnlyVsRealLaterRows,
        }),
        true,
      ),
      renderPanel(
        "school-demo-rollout-checklist",
        "Rollout readiness checklist",
        createElement(
          "div",
          null,
          renderList(
            [
              "Confirm the school remains synthetic for now.",
              "Confirm weekly phases and owners before any future intake.",
              "Confirm support and fallback paths are understood.",
              "Confirm real data stays blocked until a later gate.",
            ],
            true,
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/pilot",
              },
              "Open pilot checklist",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/handoff",
              },
              "Open handoff pack",
            ),
          ),
          createElement(
            "p",
            null,
            createElement(
              "a",
              {
                className: "button-link school-demo-secondary-link",
                href: "/school-demo/pilot-config",
              },
              "Open pilot config preview",
            ),
          ),
        ),
        true,
      ),
    ),
  );
}

export function SchoolDemoClassDetailView({
  classCode,
  presentationStep,
  snapshot,
}: SchoolDemoClassDetailViewProps) {
  const detail = buildClassDetail(snapshot, classCode);

  if (!detail) {
    return createElement(
      "main",
      {
        className: "app-shell school-demo-shell",
        "data-school-demo-theme": "light",
        "data-school-demo-transition": "idle",
      },
      renderHeader({
        actionHref: "/school-demo?step=overview#school-demo-summary",
        actionLabel: "Рљ РѕР±Р·РѕСЂСѓ С€РєРѕР»С‹",
        subtitle:
          "Р—Р°РїСЂРѕС€РµРЅРЅС‹Р№ drilldown РЅРµРґРѕСЃС‚СѓРїРµРЅ РІ СЃРёРЅС‚РµС‚РёС‡РµСЃРєРѕР№ РґРµРјРѕ-РІС‹Р±РѕСЂРєРµ. Р РµР°Р»СЊРЅС‹Рµ РєР»Р°СЃСЃС‹ РЅРµ РїРѕРґРєР»СЋС‡РµРЅС‹.",
        title: "РљР»Р°СЃСЃ РЅРµ РЅР°Р№РґРµРЅ",
      }),
      renderStatusStrip(snapshot),
      renderPresentationFlow({
        activeStep: presentationStep ?? "class-drilldown",
        classCode,
        snapshot,
      }),
    );
  }

  const teacherAssignments = detail.teacherAssignments;
  const roster = detail.roster;
  const enrollments = snapshot.studentEnrollments.filter(
    (enrollment) => enrollment.classCode === detail.code,
  );

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/school-demo?step=overview#school-demo-summary",
      actionLabel: "Рљ РѕР±Р·РѕСЂСѓ С€РєРѕР»С‹",
      subtitle:
        "Read-only РєР°СЂС‚РѕС‡РєР° РєР»Р°СЃСЃР°: СЃРѕСЃС‚Р°РІ, РЅР°Р·РЅР°С‡РµРЅРёСЏ Рё РіСЂР°РЅРёС†С‹ РґРµРјРѕ-Р»РёС†РµРЅР·РёРё Р±РµР· РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С….",
      title: `РљР»Р°СЃСЃ ${detail.code}`,
    }),
    renderStatusStrip(snapshot),
    renderPresentationFlow({
      activeStep: presentationStep ?? "class-drilldown",
      classCode: detail.code,
      snapshot,
    }),
    createElement(
      "section",
      {
        "aria-label": "РљР»СЋС‡РµРІС‹Рµ РїРѕРєР°Р·Р°С‚РµР»Рё РєР»Р°СЃСЃР°",
        className: "school-demo-kpi-grid",
      },
      renderMetric("РЈСЂРѕРІРµРЅСЊ", detail.gradeLevel, "7вЂ“9 РєР»Р°СЃСЃС‹"),
      renderMetric(
        "РЈС‡РµРЅРёРєРё",
        detail.studentCount,
        "СЃРёРЅС‚РµС‚РёС‡РµСЃРєРёРµ demo-РєРѕРґС‹",
      ),
      renderMetric(
        "РЈС‡РёС‚РµР»СЏ",
        detail.teacherDemoCodes.length,
        joinValues(detail.teacherDemoCodes),
      ),
      renderMetric(
        "РџСЂРµРґРјРµС‚РЅС‹Рµ РіСЂСѓРїРїС‹",
        detail.subjectGroupCodes.length,
        joinValues(detail.subjectGroupCodes),
      ),
    ),
    createElement(
      "div",
      { className: "school-demo-grid" },
      renderPanel(
        "school-demo-class-summary",
        "РЎРІРѕРґРєР° РєР»Р°СЃСЃР°",
        listSummaryItems([
          ["РљР»Р°СЃСЃ", detail.code],
          ["РЈСЂРѕРІРµРЅСЊ", detail.gradeLevel],
          ["РЈС‡РµРЅРёРєРё", detail.studentCount],
          ["Р—Р°С‡РёСЃР»РµРЅРёСЏ", enrollments.length],
          ["РџСЂРµРґРјРµС‚РЅС‹Рµ РіСЂСѓРїРїС‹", renderChips(detail.subjectGroupCodes)],
          ["РЈС‡РёС‚РµР»СЏ", renderChips(detail.teacherDemoCodes, "blue")],
        ]),
      ),
      renderPanel(
        "school-demo-class-boundary",
        "Р“СЂР°РЅРёС†С‹ Рё Р»РёС†РµРЅР·РёСЏ",
        listSummaryItems([
          ["Readiness", snapshot.boundary.readiness],
          ["Activation", snapshot.boundary.activation],
          ["Production data", snapshot.boundary.productionDataCount],
          ["Real schools", snapshot.boundary.realSchoolCount],
          ["Р›РёС†РµРЅР·РёСЏ", snapshot.license.licenseCode],
          [
            "РџСЂР°РІР°",
            renderChips(
              snapshot.entitlements.map((item) => item.capabilityCode),
              "blue",
            ),
          ],
        ]),
      ),
      renderPanel(
        "school-demo-class-roster",
        "РЎРїРёСЃРѕРє СѓС‡РµРЅРёРєРѕРІ",
        renderTable({
          emptyLabel: "РЈС‡РµРЅРёРєРѕРІ РІ СЌС‚РѕРј РєР»Р°СЃСЃРµ РїРѕРєР° РЅРµС‚.",
          headers: [
            "Demo-РєРѕРґ СѓС‡РµРЅРёРєР°",
            "РЎС‚Р°С‚СѓСЃ Р·Р°С‡РёСЃР»РµРЅРёСЏ",
            "РљР»Р°СЃСЃ",
          ],
          rows: roster.map((student) => ({
            cells: [
              createElement("strong", { key: "student" }, student.demoCode),
              createElement(
                "span",
                { className: "school-demo-chip", key: "status" },
                student.enrollmentState,
              ),
              detail.code,
            ],
            key: student.demoCode,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-class-assignments",
        "РќР°Р·РЅР°С‡РµРЅРёСЏ СѓС‡РёС‚РµР»РµР№",
        renderTable({
          emptyLabel: "РќР°Р·РЅР°С‡РµРЅРёР№ РїРѕРєР° РЅРµС‚.",
          headers: ["РЈС‡РёС‚РµР»СЊ", "РџСЂРµРґРјРµС‚РЅР°СЏ РіСЂСѓРїРїР°", "Р РµР¶РёРј"],
          rows: teacherAssignments.map((assignment) => ({
            cells: [
              createElement("strong", { key: "teacher" }, assignment.teacherDemoCode),
              assignment.subjectGroupCode,
              createElement(
                "span",
                { className: "school-demo-chip school-demo-chip-blue", key: "mode" },
                "Read only",
              ),
            ],
            key: `${assignment.teacherDemoCode}:${assignment.subjectGroupCode}`,
          })),
        }),
        true,
      ),
    ),
  );
}
