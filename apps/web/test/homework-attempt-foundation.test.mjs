import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  HomeworkContractError,
  parseCreateHomeworkAttemptForm,
  parseHomeworkAttemptResponse,
} from "../lib/homework-contract.ts";

const sessionId = "11111111-1111-4111-8111-111111111111";

function attemptFixture(overrides = {}) {
  return {
    attemptNumber: 2,
    childProfileId: "22222222-2222-4222-8222-222222222222",
    createdAt: "2026-07-13T09:00:00.000Z",
    createdByUserId: "33333333-3333-4333-8333-333333333333",
    familyId: "44444444-4444-4444-8444-444444444444",
    homeworkSessionId: sessionId,
    id: "55555555-5555-4555-8555-555555555555",
    status: "CREATED",
    updatedAt: "2026-07-13T09:01:00.000Z",
    ...overrides,
  };
}

test("attempt creation accepts no learner fields and constructs fixed metadata", () => {
  assert.deepEqual(parseCreateHomeworkAttemptForm(new globalThis.FormData()), {
    status: "CREATED",
  });

  const nextActionForm = new globalThis.FormData();
  nextActionForm.set("$ACTION_ID_slice23", "internal");
  assert.deepEqual(parseCreateHomeworkAttemptForm(nextActionForm), { status: "CREATED" });

  for (const forbiddenField of [
    "status",
    "answer",
    "solution",
    "hintText",
    "ocrText",
    "sttResult",
    "llmCompletion",
    "providerPayload",
    "rawMedia",
    "storageKey",
    "originalFilename",
  ]) {
    const unsafe = new globalThis.FormData();
    unsafe.set(forbiddenField, "must-not-submit");
    assert.throws(() => parseCreateHomeworkAttemptForm(unsafe), HomeworkContractError);
  }
});

test("created attempt response projects only number, status and timestamps", () => {
  const attempt = parseHomeworkAttemptResponse({ data: { attempt: attemptFixture() } });
  assert.deepEqual(attempt, {
    attemptNumber: 2,
    createdAt: "2026-07-13T09:00:00.000Z",
    status: "CREATED",
    updatedAt: "2026-07-13T09:01:00.000Z",
  });

  for (const forbiddenField of [
    "answer",
    "solution",
    "hintText",
    "ocrText",
    "sttResult",
    "llmCompletion",
    "providerPayload",
    "rawMedia",
  ]) {
    assert.throws(
      () =>
        parseHomeworkAttemptResponse({
          data: { attempt: attemptFixture({ [forbiddenField]: "must-not-render" }) },
        }),
      HomeworkContractError,
      forbiddenField,
    );
  }
});

test("attempt action uses only the existing authenticated metadata route", () => {
  const appDir = path.resolve(process.cwd(), "app");
  const detailDir = path.join(appDir, "homework", "[homeworkSessionId]");
  const libDir = path.resolve(process.cwd(), "lib");
  const layout = fs.readFileSync(path.join(appDir, "homework", "layout.tsx"), "utf8");
  const action = fs.readFileSync(path.join(detailDir, "homework-attempt-actions.ts"), "utf8");
  const service = fs.readFileSync(path.join(libDir, "homework-service.server.ts"), "utf8");
  const createServiceStart = service.indexOf("export async function createHomeworkAttempt(");
  const createServiceEnd = service.indexOf("export async function createHomeworkSession(");
  const createService = service.slice(createServiceStart, createServiceEnd);

  assert.equal(layout.includes("readAuthShellState()"), true);
  assert.equal(layout.includes("canViewHomework(authState.status)"), true);
  assert.equal(action.includes("parseCreateHomeworkAttemptForm(formData)"), true);
  assert.equal(action.includes("createHomeworkAttempt(homeworkSessionId, input)"), true);
  assert.equal(createService.includes("`/homework/sessions/${id}/attempts`"), true);
  assert.equal(createService.includes('method: "POST"'), true);
  assert.equal(createService.includes("body: input"), true);

  const attemptSource = `${action}\n${createService}`;
  for (const forbidden of [
    "localStorage",
    "sessionStorage",
    "minio",
    "@aws-sdk",
    "S3Client",
    "storageKey",
    "originalFilename",
    "rawMedia",
    "base64",
    "answer",
    "solution",
    "hintText",
    "ocrText",
    "sttResult",
    "llmCompletion",
    "providerPayload",
    "console.",
  ]) {
    assert.equal(attemptSource.includes(forbidden), false, forbidden);
  }
});

test("attempt UI has no learner input and renders only approved attempt fields", () => {
  const detailPagePath = path.resolve(
    process.cwd(),
    "app",
    "homework",
    "[homeworkSessionId]",
    "page.tsx",
  );
  const page = fs.readFileSync(detailPagePath, "utf8");
  const sectionStart = page.indexOf('<section className="attempts-section"');
  const sectionEnd = page.indexOf('<section className="media-section"');
  const attemptsSection = page.slice(sectionStart, sectionEnd);

  assert.equal(sectionStart >= 0 && sectionEnd > sectionStart, true);
  assert.equal(attemptsSection.includes("action={createAttemptForSession}"), true);
  assert.equal(attemptsSection.includes('type="submit"'), true);
  assert.equal(attemptsSection.includes("<input"), false);
  assert.equal(attemptsSection.includes("<textarea"), false);
  assert.equal(attemptsSection.includes("<select"), false);
  assert.equal(attemptsSection.includes("attempt.attemptNumber"), true);
  assert.equal(attemptsSection.includes("attempt.status"), true);
  assert.equal(attemptsSection.includes("attempt.createdAt"), true);
  assert.equal(attemptsSection.includes("attempt.updatedAt"), true);

  const referencedAttemptFields = new Set(
    [...attemptsSection.matchAll(/attempt\.(\w+)/g)].map((match) => match[1]),
  );
  assert.deepEqual([...referencedAttemptFields].sort(), [
    "attemptNumber",
    "createdAt",
    "status",
    "updatedAt",
  ]);
});
