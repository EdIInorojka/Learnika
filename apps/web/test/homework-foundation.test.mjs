import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  HomeworkContractError,
  canViewHomework,
  parseChildProfileChoices,
  parseCreateHomeworkSessionForm,
  parseHomeworkAttemptsResponse,
  parseHomeworkSessionResponse,
  parseHomeworkSessionsResponse,
} from "../lib/homework-contract.ts";

const sessionId = "11111111-1111-4111-8111-111111111111";
const childProfileId = "22222222-2222-4222-8222-222222222222";

function sessionFixture(overrides = {}) {
  return {
    archivedAt: null,
    childProfileId,
    createdAt: "2026-07-12T12:00:00.000Z",
    createdByUserId: "33333333-3333-4333-8333-333333333333",
    familyId: "44444444-4444-4444-8444-444444444444",
    gradeLevel: 8,
    id: sessionId,
    sourceType: "MANUAL",
    status: "CREATED",
    subject: "math",
    updatedAt: "2026-07-12T12:00:00.000Z",
    ...overrides,
  };
}

test("homework response parsers project metadata into display-safe views", () => {
  const session = parseHomeworkSessionResponse({ data: { session: sessionFixture() } });
  assert.deepEqual(Object.keys(session).sort(), [
    "archivedAt",
    "createdAt",
    "gradeLevel",
    "id",
    "sourceType",
    "status",
    "subject",
    "updatedAt",
  ]);
  assert.equal(Object.hasOwn(session, "familyId"), false);
  assert.equal(Object.hasOwn(session, "childProfileId"), false);
  assert.equal(Object.hasOwn(session, "createdByUserId"), false);

  const sessions = parseHomeworkSessionsResponse({ data: { sessions: [sessionFixture()] } });
  assert.equal(sessions.length, 1);

  const attempts = parseHomeworkAttemptsResponse({
    data: {
      attempts: [
        {
          attemptNumber: 1,
          childProfileId,
          createdAt: "2026-07-12T12:05:00.000Z",
          createdByUserId: "33333333-3333-4333-8333-333333333333",
          familyId: "44444444-4444-4444-8444-444444444444",
          homeworkSessionId: sessionId,
          id: "55555555-5555-4555-8555-555555555555",
          status: "CREATED",
          updatedAt: "2026-07-12T12:05:00.000Z",
        },
      ],
    },
  });
  assert.deepEqual(Object.keys(attempts[0]).sort(), [
    "attemptNumber",
    "createdAt",
    "status",
    "updatedAt",
  ]);
});

test("homework parsers reject unsafe generated or media-bearing API fields", () => {
  for (const forbiddenField of [
    "answer",
    "solution",
    "hintText",
    "ocrResult",
    "sttResult",
    "llmCompletion",
    "providerPayload",
    "rawMedia",
  ]) {
    assert.throws(
      () =>
        parseHomeworkSessionResponse({
          data: { session: sessionFixture({ [forbiddenField]: "must-not-render" }) },
        }),
      HomeworkContractError,
      forbiddenField,
    );
  }
});

test("create form accepts only approved homework metadata and fixes subject to math", () => {
  const formData = new globalThis.FormData();
  formData.set("childProfileId", childProfileId);
  formData.set("gradeLevel", "8");
  formData.set("sourceType", "MANUAL");
  assert.deepEqual(parseCreateHomeworkSessionForm(formData), {
    childProfileId,
    gradeLevel: 8,
    sourceType: "MANUAL",
    subject: "math",
  });

  for (const forbiddenField of ["answer", "hintText", "rawMedia", "providerPayload"]) {
    const unsafe = new globalThis.FormData();
    unsafe.set("childProfileId", childProfileId);
    unsafe.set("gradeLevel", "8");
    unsafe.set("sourceType", "MANUAL");
    unsafe.set(forbiddenField, "must-not-submit");
    assert.throws(() => parseCreateHomeworkSessionForm(unsafe), HomeworkContractError);
  }
});

test("child choices omit nickname and archived profiles", () => {
  const choices = parseChildProfileChoices({
    data: {
      children: [
        {
          archivedAt: null,
          gradeLevel: 8,
          id: childProfileId,
          locale: "ru",
          nickname: "sensitive-child-nickname",
        },
        {
          archivedAt: "2026-07-12T12:00:00.000Z",
          gradeLevel: 7,
          id: "66666666-6666-4666-8666-666666666666",
          nickname: "archived-child",
        },
      ],
    },
  });
  assert.deepEqual(choices, [{ gradeLevel: 8, id: childProfileId }]);
  assert.equal(JSON.stringify(choices).includes("nickname"), false);
  assert.equal(JSON.stringify(choices).includes("sensitive-child-nickname"), false);
});

test("homework UI is authenticated and uses only approved metadata routes", () => {
  assert.equal(canViewHomework("authenticated"), true);
  assert.equal(canViewHomework("anonymous"), false);
  assert.equal(canViewHomework("unavailable"), false);

  const appDir = path.resolve(process.cwd(), "app");
  const libDir = path.resolve(process.cwd(), "lib");
  const rootPage = fs.readFileSync(path.join(appDir, "page.tsx"), "utf8");
  const homeworkLayout = fs.readFileSync(path.join(appDir, "homework", "layout.tsx"), "utf8");
  const homeworkPage = fs.readFileSync(path.join(appDir, "homework", "page.tsx"), "utf8");
  const detailPage = fs.readFileSync(
    path.join(appDir, "homework", "[homeworkSessionId]", "page.tsx"),
    "utf8",
  );
  const actions = fs.readFileSync(path.join(appDir, "homework", "homework-actions.ts"), "utf8");
  const service = fs.readFileSync(path.join(libDir, "homework-service.server.ts"), "utf8");
  const renderedOrSubmitted = `${homeworkPage}\n${detailPage}\n${actions}`;

  assert.equal(
    rootPage.indexOf('state.status === "authenticated"') < rootPage.indexOf('href="/homework"'),
    true,
  );
  assert.equal(homeworkLayout.includes("readAuthShellState()"), true);
  assert.equal(homeworkLayout.includes("canViewHomework(authState.status)"), true);
  assert.equal(homeworkLayout.includes("redirect(`/?authError="), true);

  for (const route of [
    '"/family-setup/children"',
    '"/homework/sessions"',
    "`/homework/sessions/${id}`",
    "`/homework/sessions/${id}/attempts`",
  ]) {
    assert.equal(service.includes(route), true, route);
  }
  for (const forbiddenRoute of [
    "/media-assets",
    "/upload",
    "/mock-ocr",
    "/stt",
    "/llm",
    "/hints",
  ]) {
    assert.equal(service.includes(forbiddenRoute), false, forbiddenRoute);
  }
  for (const forbiddenField of [
    "answer",
    "solution",
    "hintText",
    "ocrResult",
    "sttResult",
    "llmPrompt",
    "providerPayload",
    "rawMedia",
    "nickname",
  ]) {
    assert.equal(renderedOrSubmitted.includes(forbiddenField), false, forbiddenField);
  }

  const webSource = `${rootPage}\n${homeworkLayout}\n${homeworkPage}\n${detailPage}\n${actions}\n${service}`;
  assert.equal(webSource.includes("localStorage"), false);
  assert.equal(webSource.includes("sessionStorage"), false);
  assert.equal(webSource.includes("console."), false);
});
