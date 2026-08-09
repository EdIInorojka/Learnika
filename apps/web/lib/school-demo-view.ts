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
        "Presentation script: use this sequence to present the synthetic school demo in order: overview, classes, teacher assignments, license / entitlements, compact summary, handoff pack, pilot checklist, pilot config preview, assignment preview, delivery rehearsal, import preview and rollout preview.",
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
      secondaryActionHref: "/school-demo/import-preview",
      secondaryActionLabel: "Import preview",
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
