"use client";

import { createElement, useEffect, useId, useState, type ReactNode } from "react";

import type { SchoolDemoSnapshot } from "./school-demo-contract";

type SchoolDemoTheme = "light" | "dark";

const schoolDemoThemeStorageKey = "learnika.schoolDemo.theme.v1";
const transitionResetMs = 700;

interface SchoolDemoDashboardViewProps {
  snapshot: SchoolDemoSnapshot;
}

interface SchoolDemoClassDetailViewProps {
  classCode: string;
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
    createElement("span", { className: "school-demo-theme-title", id: labelId }, "Тема демо"),
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
        isDark ? "Графит" : "Светлая",
      ),
    ),
    createElement("span", { className: "school-demo-theme-note" }, "Локально в браузере"),
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
  return values.length > 0 ? values.join(", ") : "—";
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
  if (values.length === 0) return createElement("span", { className: "school-demo-muted" }, "—");
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

function renderStatusStrip(snapshot: SchoolDemoSnapshot) {
  return createElement(
    "section",
    { "aria-label": "Статус демо-контура", className: "school-demo-status-strip" },
    [
      ["Маркер", snapshot.marker],
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

function renderHeader({
  actionHref,
  actionLabel,
  subtitle,
  title,
}: {
  actionHref: string;
  actionLabel: string;
  subtitle: string;
  title: string;
}) {
  return createElement(
    "header",
    { className: "school-demo-page-header" },
    createElement(
      "div",
      { className: "school-demo-heading" },
      createElement("span", { className: "school-demo-eyebrow" }, "Pre-Wave 7 · synthetic demo"),
      createElement("h1", null, title),
      createElement("p", null, subtitle),
    ),
    createElement(
      "nav",
      { "aria-label": "Навигация демо школы", className: "school-demo-header-actions" },
      createElement(SchoolDemoThemeToggle),
      createElement(
        "a",
        { className: "button-link school-demo-secondary-link", href: actionHref },
        actionLabel,
      ),
    ),
  );
}

function renderPanel(id: string, title: string, children: ReactNode, wide = false) {
  return createElement(
    "section",
    {
      "aria-labelledby": `${id}-title`,
      className: wide ? "school-demo-panel school-demo-panel-wide" : "school-demo-panel",
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

export function SchoolDemoDashboardView({ snapshot }: SchoolDemoDashboardViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const teacherOverviews = buildTeacherOverviews(snapshot);

  return createElement(
    "main",
    {
      className: "app-shell school-demo-shell",
      "data-school-demo-theme": "light",
      "data-school-demo-transition": "idle",
    },
    renderHeader({
      actionHref: "/",
      actionLabel: "На главную",
      subtitle:
        "Строгий read-only обзор синтетической школьной ветки: организация, классы, назначения и лицензия без реальных данных.",
      title: "Демо школы",
    }),
    renderStatusStrip(snapshot),
    createElement(
      "section",
      { "aria-label": "Ключевые показатели демо школы", className: "school-demo-kpi-grid" },
      renderMetric(
        "Организация",
        snapshot.organization.code,
        `${snapshot.organization.schoolCount} школа`,
      ),
      renderMetric(
        "Учебный год",
        snapshot.academicYear.code,
        `${snapshot.academicYear.startsOn} — ${snapshot.academicYear.endsOn}`,
      ),
      renderMetric(
        "Классы",
        classOverviews.length,
        joinValues(classOverviews.map((item) => item.code)),
      ),
      renderMetric("Учителя", teacherOverviews.length, "синтетические demo-коды"),
      renderMetric("Ученики", snapshot.students.length, "без ФИО и контактов"),
      renderMetric("Права", snapshot.entitlements.length, "плановые entitlement-коды"),
    ),
    createElement(
      "div",
      { className: "school-demo-grid" },
      renderPanel(
        "school-demo-summary",
        "Сводка школы",
        listSummaryItems([
          ["Организация", snapshot.organization.code],
          ["Школа", snapshot.school.code],
          ["Локаль", snapshot.locale],
          ["Учебный год", `${snapshot.academicYear.startsOn} — ${snapshot.academicYear.endsOn}`],
          ["Предметные группы", joinValues(snapshot.subjectGroups.map((item) => item.code))],
          ["Зачисления", snapshot.studentEnrollments.length],
        ]),
      ),
      renderPanel(
        "school-demo-boundary",
        "Границы и лицензия",
        listSummaryItems([
          ["Маркер", snapshot.marker],
          ["Лицензия", snapshot.license.licenseCode],
          ["Статус лицензии", snapshot.license.status],
          [
            "Права",
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
        "Классы и drilldown",
        renderTable({
          emptyLabel: "Классов пока нет.",
          headers: ["Класс", "Уровень", "Ученики", "Предметные группы", "Учителя", "Действие"],
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
                "Открыть класс",
              ),
            ],
            key: schoolClass.code,
          })),
        }),
        true,
      ),
      renderPanel(
        "school-demo-teachers",
        "Учительский обзор",
        renderTable({
          emptyLabel: "Учительских назначений пока нет.",
          headers: ["Учитель", "Назначения", "Классы", "Предметные группы"],
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

export function SchoolDemoClassDetailView({ classCode, snapshot }: SchoolDemoClassDetailViewProps) {
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
        actionHref: "/school-demo",
        actionLabel: "К обзору школы",
        subtitle:
          "Запрошенный drilldown недоступен в синтетической демо-выборке. Реальные классы не подключены.",
        title: "Класс не найден",
      }),
      renderStatusStrip(snapshot),
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
      actionHref: "/school-demo",
      actionLabel: "К обзору школы",
      subtitle:
        "Read-only карточка класса: состав, назначения и границы демо-лицензии без персональных данных.",
      title: `Класс ${detail.code}`,
    }),
    renderStatusStrip(snapshot),
    createElement(
      "section",
      { "aria-label": "Ключевые показатели класса", className: "school-demo-kpi-grid" },
      renderMetric("Уровень", detail.gradeLevel, "7–9 классы"),
      renderMetric("Ученики", detail.studentCount, "синтетические demo-коды"),
      renderMetric("Учителя", detail.teacherDemoCodes.length, joinValues(detail.teacherDemoCodes)),
      renderMetric(
        "Предметные группы",
        detail.subjectGroupCodes.length,
        joinValues(detail.subjectGroupCodes),
      ),
    ),
    createElement(
      "div",
      { className: "school-demo-grid" },
      renderPanel(
        "school-demo-class-summary",
        "Сводка класса",
        listSummaryItems([
          ["Класс", detail.code],
          ["Уровень", detail.gradeLevel],
          ["Ученики", detail.studentCount],
          ["Зачисления", enrollments.length],
          ["Предметные группы", renderChips(detail.subjectGroupCodes)],
          ["Учителя", renderChips(detail.teacherDemoCodes, "blue")],
        ]),
      ),
      renderPanel(
        "school-demo-class-boundary",
        "Границы и лицензия",
        listSummaryItems([
          ["Readiness", snapshot.boundary.readiness],
          ["Activation", snapshot.boundary.activation],
          ["Production data", snapshot.boundary.productionDataCount],
          ["Real schools", snapshot.boundary.realSchoolCount],
          ["Лицензия", snapshot.license.licenseCode],
          [
            "Права",
            renderChips(
              snapshot.entitlements.map((item) => item.capabilityCode),
              "blue",
            ),
          ],
        ]),
      ),
      renderPanel(
        "school-demo-class-roster",
        "Список учеников",
        renderTable({
          emptyLabel: "Учеников в этом классе пока нет.",
          headers: ["Demo-код ученика", "Статус зачисления", "Класс"],
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
        "Назначения учителей",
        renderTable({
          emptyLabel: "Назначений пока нет.",
          headers: ["Учитель", "Предметная группа", "Режим"],
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
