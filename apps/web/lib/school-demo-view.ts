import { createElement } from "react";

import type { SchoolDemoSnapshot } from "./school-demo-contract";

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

function listSummaryItems(items: Array<[string, string | number]>) {
  return createElement(
    "dl",
    { className: "metadata-list" },
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

function listCards<T>(
  items: T[],
  renderItem: (item: T) => ReturnType<typeof createElement>,
  emptyLabel: string,
) {
  if (items.length === 0) {
    return createElement("p", { className: "empty-state" }, emptyLabel);
  }
  return createElement("ul", { className: "session-list" }, items.map(renderItem));
}

export function SchoolDemoDashboardView({ snapshot }: SchoolDemoDashboardViewProps) {
  const classOverviews = buildClassOverviews(snapshot);
  const teacherOverviews = buildTeacherOverviews(snapshot);

  return createElement(
    "main",
    { className: "app-shell" },
    createElement(
      "header",
      { className: "app-header" },
      createElement(
        "div",
        null,
        createElement("h1", { className: "brand" }, "Демо школы"),
        createElement(
          "p",
          { className: "page-context" },
          "Синтетический непроизводственный контур для показа школьной ветки.",
        ),
      ),
      createElement("a", { className: "button-link", href: "/" }, "Назад"),
    ),
    createElement(
      "section",
      { className: "metadata-section", "aria-labelledby": "demo-boundary-title" },
      createElement("h2", { id: "demo-boundary-title" }, "Границы и статус"),
      listSummaryItems([
        ["Marker", snapshot.marker],
        ["Readiness", snapshot.boundary.readiness],
        ["Activation", snapshot.boundary.activation],
        ["Workflow", snapshot.boundary.workflow],
        ["Production data", snapshot.boundary.productionDataCount],
        ["Real schools", snapshot.boundary.realSchoolCount],
        ["Family links", snapshot.boundary.familyLinkCount],
      ]),
    ),
    createElement(
      "section",
      { className: "metadata-section", "aria-labelledby": "demo-summary-title" },
      createElement("h2", { id: "demo-summary-title" }, "Сводка школы"),
      createElement(
        "p",
        { className: "attempt-metadata-note" },
        `Organization ${snapshot.organization.code} · School ${snapshot.school.code} · ${snapshot.academicYear.code}`,
      ),
      listSummaryItems([
        ["Учебный год", `${snapshot.academicYear.startsOn} — ${snapshot.academicYear.endsOn}`],
        ["Классы", classOverviews.map((item) => item.code).join(", ")],
        ["Учителя", teacherOverviews.map((item) => item.demoCode).join(", ")],
        ["Ученики", snapshot.students.map((item) => item.demoCode).join(", ")],
        ["Назначения", snapshot.teacherAssignments.length],
        ["Зачисления", snapshot.studentEnrollments.length],
        ["Лицензия", snapshot.license.licenseCode],
        ["Права", snapshot.entitlements.map((item) => item.capabilityCode).join(", ")],
      ]),
    ),
    createElement(
      "section",
      { className: "metadata-section", "aria-labelledby": "demo-teachers-title" },
      createElement("h2", { id: "demo-teachers-title" }, "Учительский обзор"),
      listCards(
        teacherOverviews,
        (teacher) =>
          createElement(
            "li",
            { key: teacher.demoCode },
            createElement(
              "div",
              { className: "session-row" },
              createElement(
                "div",
                null,
                createElement("strong", null, teacher.demoCode),
                createElement(
                  "span",
                  { className: "session-meta" },
                  `Назначения: ${teacher.assignmentCount}`,
                ),
                createElement(
                  "span",
                  { className: "session-meta" },
                  `Классы: ${teacher.classCodes.join(", ")}`,
                ),
                createElement(
                  "span",
                  { className: "session-meta" },
                  `Предметные группы: ${teacher.subjectGroupCodes.join(", ")}`,
                ),
              ),
              createElement("span", { className: "status-label" }, "Read only"),
            ),
          ),
        "Учительских назначений пока нет.",
      ),
    ),
    createElement(
      "section",
      { className: "metadata-section", "aria-labelledby": "demo-classes-title" },
      createElement("h2", { id: "demo-classes-title" }, "Классы и drilldown"),
      listCards(
        classOverviews,
        (schoolClass) =>
          createElement(
            "li",
            { key: schoolClass.code },
            createElement(
              "div",
              { className: "session-row" },
              createElement(
                "div",
                null,
                createElement(
                  "strong",
                  null,
                  `${schoolClass.code} · grade ${schoolClass.gradeLevel}`,
                ),
                createElement(
                  "span",
                  { className: "session-meta" },
                  `Students: ${schoolClass.studentCount} · Subjects: ${schoolClass.subjectGroupCodes.join(", ")}`,
                ),
                createElement(
                  "span",
                  { className: "session-meta" },
                  `Teachers: ${schoolClass.teacherDemoCodes.join(", ")}`,
                ),
                createElement(
                  "a",
                  {
                    className: "button-link",
                    href: `/school-demo/classes/${encodeURIComponent(schoolClass.code)}`,
                  },
                  "Open class drilldown",
                ),
              ),
              createElement("span", { className: "status-label" }, "Read only"),
            ),
          ),
        "Классов пока нет.",
      ),
    ),
  );
}

export function SchoolDemoClassDetailView({ classCode, snapshot }: SchoolDemoClassDetailViewProps) {
  const detail = buildClassDetail(snapshot, classCode);

  if (!detail) {
    return createElement(
      "main",
      { className: "app-shell" },
      createElement(
        "header",
        { className: "app-header" },
        createElement(
          "div",
          null,
          createElement("h1", { className: "brand" }, "Демо школы"),
          createElement(
            "p",
            { className: "page-context" },
            "Синтетический непроизводственный контур для показа школьной ветки.",
          ),
        ),
        createElement("a", { className: "button-link", href: "/school-demo" }, "Назад"),
      ),
      createElement(
        "section",
        { className: "metadata-section", "aria-labelledby": "demo-class-missing-title" },
        createElement("h2", { id: "demo-class-missing-title" }, "Класс не найден"),
        createElement(
          "p",
          { className: "attempt-metadata-note" },
          "Запрошенный drilldown недоступен в синтетической демо-выборке.",
        ),
      ),
    );
  }

  const teacherAssignments = detail.teacherAssignments;
  const roster = detail.roster;
  const enrollments = snapshot.studentEnrollments.filter(
    (enrollment) => enrollment.classCode === detail.code,
  );

  return createElement(
    "main",
    { className: "app-shell" },
    createElement(
      "header",
      { className: "app-header" },
      createElement(
        "div",
        null,
        createElement("h1", { className: "brand" }, "Демо школы"),
        createElement(
          "p",
          { className: "page-context" },
          "Синтетический непроизводственный контур для показа школьной ветки.",
        ),
      ),
      createElement("a", { className: "button-link", href: "/school-demo" }, "Назад"),
    ),
    createElement(
      "section",
      { className: "metadata-section", "aria-labelledby": "demo-class-summary-title" },
      createElement("h2", { id: "demo-class-summary-title" }, `Класс ${detail.code}`),
      listSummaryItems([
        ["Уровень", detail.gradeLevel],
        ["Ученики", detail.studentCount],
        ["Предметные группы", detail.subjectGroupCodes.join(", ")],
        ["Учителя", detail.teacherDemoCodes.join(", ")],
        ["Зачисления", enrollments.length],
      ]),
    ),
    createElement(
      "section",
      { className: "metadata-section", "aria-labelledby": "demo-class-roster-title" },
      createElement("h2", { id: "demo-class-roster-title" }, "Список учеников"),
      listCards(
        roster,
        (student) =>
          createElement(
            "li",
            { key: student.demoCode },
            createElement(
              "div",
              { className: "session-row" },
              createElement(
                "div",
                null,
                createElement("strong", null, student.demoCode),
                createElement(
                  "span",
                  { className: "session-meta" },
                  `Статус зачисления: ${student.enrollmentState}`,
                ),
              ),
              createElement("span", { className: "status-label" }, "Synthetic"),
            ),
          ),
        "Учеников в этом классе пока нет.",
      ),
    ),
    createElement(
      "section",
      { className: "metadata-section", "aria-labelledby": "demo-class-assignments-title" },
      createElement("h2", { id: "demo-class-assignments-title" }, "Назначения учителей"),
      listCards(
        teacherAssignments,
        (assignment) =>
          createElement(
            "li",
            {
              key: `${assignment.teacherDemoCode}:${assignment.subjectGroupCode}`,
            },
            createElement(
              "div",
              { className: "session-row" },
              createElement(
                "div",
                null,
                createElement("strong", null, assignment.teacherDemoCode),
                createElement(
                  "span",
                  { className: "session-meta" },
                  `Предметная группа: ${assignment.subjectGroupCode}`,
                ),
              ),
              createElement("span", { className: "status-label" }, "Read only"),
            ),
          ),
        "Назначений пока нет.",
      ),
    ),
    createElement(
      "section",
      { className: "metadata-section", "aria-labelledby": "demo-class-boundary-title" },
      createElement("h2", { id: "demo-class-boundary-title" }, "Границы и лицензия"),
      listSummaryItems([
        ["Marker", snapshot.marker],
        ["Readiness", snapshot.boundary.readiness],
        ["Activation", snapshot.boundary.activation],
        ["Workflow", snapshot.boundary.workflow],
        ["Production data", snapshot.boundary.productionDataCount],
        ["Real schools", snapshot.boundary.realSchoolCount],
        ["Лицензия", snapshot.license.licenseCode],
        ["Права", snapshot.entitlements.map((item) => item.capabilityCode).join(", ")],
      ]),
    ),
  );
}
