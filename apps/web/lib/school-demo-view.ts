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
  "overview" | "classes" | "teacher-assignments" | "license" | "summary" | "handoff" | "pilot";

const schoolDemoGuidedWalkthroughStepOrder: SchoolDemoGuidedWalkthroughStepKey[] = [
  "overview",
  "classes",
  "teacher-assignments",
  "license",
  "summary",
  "handoff",
  "pilot",
];

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
        "Presentation script: use this sequence to present the synthetic school demo in order: overview, classes, teacher assignments, license / entitlements, compact summary, handoff pack and pilot checklist.",
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
        renderList(nextStepChecklist, true),
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
