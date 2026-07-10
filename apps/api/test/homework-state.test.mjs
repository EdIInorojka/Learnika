import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  HomeworkStateService,
  redactHomeworkStateDiagnostics,
} from "../dist/homework-state/homework-state.service.js";

const familyId = "11111111-1111-4111-8111-111111111111";
const childProfileId = "22222222-2222-4222-8222-222222222222";
const homeworkSessionId = "33333333-3333-4333-8333-333333333333";
const createdByUserId = "44444444-4444-4444-8444-444444444444";

function createService() {
  return new HomeworkStateService();
}

function meaningfulAttempt(isMeaningful = true) {
  return {
    isMeaningful,
    policyVersion: "wave-2-slice-4-meaningful-attempt-placeholder-v1",
    reason: isMeaningful ? "PLACEHOLDER_ACCEPTED_SUBMITTED_WORK" : "LEARNER_WORK_REQUIRED",
  };
}

test("valid homework session state transitions pass", () => {
  const service = createService();

  assert.deepEqual(
    service.transitionSession({ fromStatus: "CREATED", toStatus: "WAITING_FOR_ATTEMPT" }),
    {
      fromStatus: "CREATED",
      isTerminal: false,
      policyVersion: "wave-2-slice-4-homework-state-v1",
      toStatus: "WAITING_FOR_ATTEMPT",
    },
  );
  assert.equal(
    service.transitionSession({ fromStatus: "WAITING_FOR_ATTEMPT", toStatus: "PAUSED" }).toStatus,
    "PAUSED",
  );
  assert.equal(
    service.transitionSession({ fromStatus: "PAUSED", toStatus: "WAITING_FOR_ATTEMPT" }).toStatus,
    "WAITING_FOR_ATTEMPT",
  );
  assert.equal(
    service.transitionSession({ fromStatus: "WAITING_FOR_ATTEMPT", toStatus: "CLOSED" }).isTerminal,
    true,
  );
});

test("invalid homework session transitions are rejected safely", () => {
  const service = createService();

  assert.throws(
    () => service.transitionSession({ fromStatus: "CLOSED", toStatus: "WAITING_FOR_ATTEMPT" }),
    (error) => error.code === "HOMEWORK_SESSION_TRANSITION_INVALID",
  );
  assert.throws(
    () => service.transitionSession({ fromStatus: "CREATED", toStatus: "SOLVED" }),
    (error) => error.code === "HOMEWORK_SESSION_STATUS_INVALID",
  );
});

test("valid and invalid attempt transitions are enforced", () => {
  const service = createService();

  assert.deepEqual(service.transitionAttempt({ fromStatus: "CREATED", toStatus: "SUBMITTED" }), {
    fromStatus: "CREATED",
    isTerminal: true,
    policyVersion: "wave-2-slice-4-homework-state-v1",
    toStatus: "SUBMITTED",
  });
  assert.equal(
    service.transitionAttempt({ fromStatus: "CREATED", toStatus: "CANCELLED" }).toStatus,
    "CANCELLED",
  );
  assert.throws(
    () => service.transitionAttempt({ fromStatus: "SUBMITTED", toStatus: "CREATED" }),
    (error) => error.code === "HOMEWORK_ATTEMPT_TRANSITION_INVALID",
  );
  assert.throws(
    () => service.transitionAttempt({ fromStatus: "CANCELLED", toStatus: "SUBMITTED" }),
    (error) => error.code === "HOMEWORK_ATTEMPT_TRANSITION_INVALID",
  );
  assert.throws(
    () => service.transitionAttempt({ fromStatus: "CREATED", toStatus: "ABANDONED" }),
    (error) => error.code === "HOMEWORK_ATTEMPT_STATUS_INVALID",
  );
});

test("attempt numbers are monotonic for a session", () => {
  const service = createService();

  assert.equal(
    service.nextAttemptNumber([{ attemptNumber: 1 }, { attemptNumber: 3 }, { attemptNumber: 2 }]),
    4,
  );
  assert.equal(service.nextAttemptNumber([]), 1);
  assert.throws(
    () => service.nextAttemptNumber([{ attemptNumber: 0 }]),
    (error) => error.code === "HOMEWORK_ATTEMPT_NUMBER_INVALID",
  );
});

test("ownership-aware attempt metadata remains metadata-only", () => {
  const service = createService();
  const metadata = service.buildAttemptMetadata({
    attemptNumber: 2,
    childProfileId,
    createdByUserId,
    familyId,
    homeworkSessionId,
    status: "CREATED",
  });

  assert.deepEqual(metadata, {
    attemptNumber: 2,
    childProfileId,
    createdByUserId,
    familyId,
    homeworkSessionId,
    status: "CREATED",
  });

  const serialized = JSON.stringify(metadata);
  for (const forbidden of [
    "final answer is 42",
    "full solution",
    "hint text",
    "transcript body",
    "ocrResult",
    "sttResult",
    "llmPrompt",
    "providerPayload",
    "raw media bytes",
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("attempt gate denies assistance before any attempt exists", () => {
  const service = createService();
  const gate = service.evaluateAttemptGate({
    attempts: [],
    meaningfulAttempt: meaningfulAttempt(true),
    sessionStatus: "WAITING_FOR_ATTEMPT",
  });

  assert.deepEqual(gate, {
    allowed: false,
    policyVersion: "wave-2-slice-4-homework-state-v1",
    reason: "ATTEMPT_REQUIRED",
  });
});

test("attempt gate denies invalid or abandoned attempts", () => {
  const service = createService();

  assert.deepEqual(
    service.evaluateAttemptGate({
      attempts: [{ attemptNumber: 1, id: "attempt-1", status: "CANCELLED" }],
      meaningfulAttempt: meaningfulAttempt(true),
      sessionStatus: "WAITING_FOR_ATTEMPT",
    }),
    {
      allowed: false,
      lastAttemptId: "attempt-1",
      lastAttemptNumber: 1,
      policyVersion: "wave-2-slice-4-homework-state-v1",
      reason: "ATTEMPT_ABANDONED_OR_INVALID",
    },
  );
  assert.equal(
    service.evaluateAttemptGate({
      attempts: [{ attemptNumber: 1, status: "CREATED" }],
      meaningfulAttempt: meaningfulAttempt(true),
      sessionStatus: "WAITING_FOR_ATTEMPT",
    }).reason,
    "ATTEMPT_NOT_SUBMITTED",
  );
});

test("meaningful-attempt placeholder requires submitted learner work without revealing answers", () => {
  const service = createService();

  assert.deepEqual(
    service.evaluateMeaningfulAttemptPlaceholder({
      attemptStatus: "SUBMITTED",
      hasLearnerWork: true,
    }),
    {
      isMeaningful: true,
      policyVersion: "wave-2-slice-4-meaningful-attempt-placeholder-v1",
      reason: "PLACEHOLDER_ACCEPTED_SUBMITTED_WORK",
    },
  );
  assert.equal(
    service.evaluateMeaningfulAttemptPlaceholder({
      attemptStatus: "SUBMITTED",
      hasLearnerWork: false,
    }).isMeaningful,
    false,
  );
  assert.equal(
    service.evaluateMeaningfulAttemptPlaceholder({ attemptStatus: "CREATED", hasLearnerWork: true })
      .reason,
    "ATTEMPT_NOT_SUBMITTED",
  );

  const gate = service.evaluateAttemptGate({
    attempts: [{ attemptNumber: 1, id: "attempt-1", status: "SUBMITTED" }],
    meaningfulAttempt: service.evaluateMeaningfulAttemptPlaceholder({
      attemptStatus: "SUBMITTED",
      hasLearnerWork: true,
    }),
    sessionStatus: "WAITING_FOR_ATTEMPT",
  });
  assert.equal(gate.allowed, true);

  const serialized = JSON.stringify([
    gate,
    service.evaluateMeaningfulAttemptPlaceholder({
      attemptStatus: "SUBMITTED",
      hasLearnerWork: true,
    }),
  ]);
  for (const forbidden of [
    "sourceAnswer",
    "final answer is 42",
    "full solution",
    "hint text",
    "transcript body",
    "ocrResult",
    "sttResult",
    "llmPrompt",
    "providerPayload",
    "raw media bytes",
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("diagnostic redaction removes sensitive homework state values", () => {
  const redacted = JSON.stringify(
    redactHomeworkStateDiagnostics({
      authorization: "Bearer raw-token",
      childNickname: "LearnerA-Synthetic",
      parentEmail: "parent@example.test",
      rawContent: "raw media bytes",
      safe: "HOMEWORK_ATTEMPT_TRANSITION_INVALID",
      sourceAnswer: "final answer is 42",
      transcriptBody: "spoken learner text",
    }),
  );

  assert.equal(redacted.includes("raw-token"), false);
  assert.equal(redacted.includes("LearnerA-Synthetic"), false);
  assert.equal(redacted.includes("parent@example.test"), false);
  assert.equal(redacted.includes("raw media bytes"), false);
  assert.equal(redacted.includes("final answer is 42"), false);
  assert.equal(redacted.includes("spoken learner text"), false);
  assert.equal(redacted.includes("HOMEWORK_ATTEMPT_TRANSITION_INVALID"), true);
});

test("Slice 4 does not create public homework routes or controllers", () => {
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const openapi = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  const routePaths = Object.keys(openapi.paths ?? {});
  for (const routePrefix of ["/assets", "/homework", "/media", "/voice"]) {
    assert.equal(
      routePaths.some((routePath) => routePath.startsWith(routePrefix)),
      false,
    );
  }

  const homeworkStateDir = path.join(process.cwd(), "src", "homework-state");
  const homeworkStateFiles = fs.readdirSync(homeworkStateDir);
  assert.equal(
    homeworkStateFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModuleSource = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModuleSource.includes("HomeworkStateModule"), false);
});
