import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  AssistanceContractService,
  redactAssistanceContractDiagnostics,
} from "../dist/assistance-contract/assistance-contract.service.js";

const policyVersion = "wave-2-slice-5-safe-assistance-contract-v1";

function createService() {
  return new AssistanceContractService();
}

function baseContract(overrides = {}) {
  return {
    category: "CONCEPT_REMINDER",
    constraints: {
      noFinalAnswer: true,
      noFullSolution: true,
      noGeneratedTextPersistence: true,
      noProviderPayload: true,
      noRawMedia: true,
    },
    contractKind: "ASSISTANCE_CONTRACT",
    level: "LEVEL_2_CONCEPT_REMINDER",
    policyVersion,
    requiresMeaningfulAttempt: true,
    ...overrides,
  };
}

function satisfiedGate() {
  return {
    allowed: true,
    lastAttemptNumber: 1,
    policyVersion: "wave-2-slice-4-homework-state-v1",
    reason: "READY_AFTER_MEANINGFUL_ATTEMPT",
  };
}

test("allowed assistance contract shapes pass", () => {
  const service = createService();

  assert.equal(service.validateAssistanceContract(baseContract()).category, "CONCEPT_REMINDER");
  assert.deepEqual(
    service.validateAssistanceContract(
      baseContract({
        category: "WORKED_SIMILAR_EXAMPLE_DIFFERENT_DATA",
        constraints: {
          noFinalAnswer: true,
          noFullSolution: true,
          noGeneratedTextPersistence: true,
          noProviderPayload: true,
          noRawMedia: true,
          similarExampleMustUseDifferentData: true,
        },
        level: "LEVEL_4_SIMILAR_EXAMPLE",
      }),
    ).constraints,
    {
      noFinalAnswer: true,
      noFullSolution: true,
      noGeneratedTextPersistence: true,
      noProviderPayload: true,
      noRawMedia: true,
      similarExampleMustUseDifferentData: true,
    },
  );

  assert.deepEqual(service.getAllowedAssistanceCategories(), [
    "PROBLEM_RESTATEMENT",
    "CONCEPT_REMINDER",
    "NEXT_STEP_QUESTION",
    "WORKED_SIMILAR_EXAMPLE_DIFFERENT_DATA",
    "CHECK_YOUR_WORK_PROMPT",
    "STRATEGY_SUGGESTION",
    "PREREQUISITE_REVIEW",
    "SAFE_REFUSAL_FALLBACK",
  ]);
});

test("forbidden answer and solution fields are rejected safely", () => {
  const service = createService();

  for (const fieldName of ["answer", "finalAnswer", "solution", "fullSolution", "exactSolution"]) {
    assert.throws(
      () => service.validateAssistanceContract(baseContract({ [fieldName]: "final answer is 42" })),
      (error) => error.code === "ASSISTANCE_CONTRACT_UNSAFE_FIELD",
    );
  }
});

test("generated hint text fields are rejected", () => {
  const service = createService();

  for (const fieldName of ["generatedHint", "hintText"]) {
    assert.throws(
      () => service.validateAssistanceContract(baseContract({ [fieldName]: "hint text" })),
      (error) => error.code === "ASSISTANCE_CONTRACT_UNSAFE_FIELD",
    );
  }
});

test("OCR STT LLM and provider payload fields are rejected", () => {
  const service = createService();

  for (const fieldName of [
    "ocrResult",
    "sttResult",
    "llmPrompt",
    "llmCompletion",
    "providerPayload",
    "modelOutput",
    "rawMedia",
  ]) {
    assert.throws(
      () => service.validateAssistanceContract(baseContract({ [fieldName]: "provider payload" })),
      (error) => error.code === "ASSISTANCE_CONTRACT_UNSAFE_FIELD",
    );
  }
});

test("textbook copied content fields are rejected", () => {
  const service = createService();

  assert.throws(
    () =>
      service.validateAssistanceContract(
        baseContract({ textbookContent: "copied protected textbook content" }),
      ),
    (error) => error.code === "ASSISTANCE_CONTRACT_UNSAFE_FIELD",
  );
});

test("unsafe assistance categories and disabled constraints are rejected", () => {
  const service = createService();

  assert.throws(
    () => service.validateAssistanceContract(baseContract({ category: "DIRECT_FINAL_RESULT" })),
    (error) => error.code === "ASSISTANCE_CONTRACT_UNSAFE_CATEGORY",
  );
  assert.throws(
    () =>
      service.validateAssistanceContract(
        baseContract({
          category: "WORKED_SIMILAR_EXAMPLE_DIFFERENT_DATA",
          constraints: {
            noFinalAnswer: true,
            noFullSolution: true,
            noGeneratedTextPersistence: true,
            noProviderPayload: true,
            noRawMedia: true,
          },
          level: "LEVEL_4_SIMILAR_EXAMPLE",
        }),
      ),
    (error) => error.code === "ASSISTANCE_CONTRACT_INVALID",
  );
  assert.throws(
    () =>
      service.validateAssistanceContract(
        baseContract({
          constraints: {
            noFinalAnswer: false,
            noFullSolution: true,
            noGeneratedTextPersistence: true,
            noProviderPayload: true,
            noRawMedia: true,
          },
        }),
      ),
    (error) => error.code === "ASSISTANCE_CONTRACT_INVALID",
  );
});

test("assistance is denied before any attempt exists", () => {
  const service = createService();
  const eligibility = service.evaluateEligibility({
    attemptGate: {
      allowed: false,
      policyVersion: "wave-2-slice-4-homework-state-v1",
      reason: "ATTEMPT_REQUIRED",
    },
  });

  assert.deepEqual(eligibility, {
    eligible: false,
    policyVersion,
    reason: "ATTEMPT_REQUIRED",
  });
});

test("assistance is denied when meaningful-attempt placeholder is false", () => {
  const service = createService();
  const eligibility = service.evaluateEligibility({
    attemptGate: {
      allowed: false,
      lastAttemptNumber: 1,
      policyVersion: "wave-2-slice-4-homework-state-v1",
      reason: "MEANINGFUL_ATTEMPT_REQUIRED",
    },
  });

  assert.deepEqual(eligibility, {
    eligible: false,
    policyVersion,
    reason: "MEANINGFUL_ATTEMPT_REQUIRED",
  });
});

test("assistance becomes structurally eligible only after attempt gate is satisfied", () => {
  const service = createService();

  assert.deepEqual(service.evaluateEligibility({ attemptGate: satisfiedGate() }), {
    eligible: true,
    policyVersion,
    reason: "ATTEMPT_GATE_SATISFIED",
  });
});

test("safe fallback result contains no answer solution or hint text", () => {
  const service = createService();
  const fallback = service.buildSafeFallback("POLICY_BOUNDARY");

  assert.deepEqual(fallback, {
    category: "SAFE_REFUSAL_FALLBACK",
    contractKind: "ASSISTANCE_FALLBACK",
    eligible: false,
    policyVersion,
    reason: "POLICY_BOUNDARY",
  });

  const serialized = JSON.stringify(fallback);
  for (const forbidden of [
    "answer",
    "solution",
    "hint text",
    "transcript",
    "ocrResult",
    "sttResult",
    "llmPrompt",
    "providerPayload",
    "rawMedia",
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("diagnostic redaction removes PII credentials and unsafe assistance values", () => {
  const redacted = JSON.stringify(
    redactAssistanceContractDiagnostics({
      authorization: "Bearer raw-token",
      childNickname: "LearnerA-Synthetic",
      parentEmail: "parent@example.test",
      password: "raw-password",
      providerPayload: "provider payload",
      safe: "ASSISTANCE_CONTRACT_UNSAFE_FIELD",
      sourceAnswer: "final answer is 42",
      transcriptBody: "spoken learner text",
    }),
  );

  assert.equal(redacted.includes("raw-token"), false);
  assert.equal(redacted.includes("LearnerA-Synthetic"), false);
  assert.equal(redacted.includes("parent@example.test"), false);
  assert.equal(redacted.includes("raw-password"), false);
  assert.equal(redacted.includes("provider payload"), false);
  assert.equal(redacted.includes("final answer is 42"), false);
  assert.equal(redacted.includes("spoken learner text"), false);
  assert.equal(redacted.includes("ASSISTANCE_CONTRACT_UNSAFE_FIELD"), true);
});

test("Slice 5 does not create public assistance or homework routes", () => {
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const openapi = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  const routePaths = Object.keys(openapi.paths ?? {});
  for (const routePrefix of ["/assets", "/assistance", "/hints", "/homework", "/media", "/voice"]) {
    assert.equal(
      routePaths.some((routePath) => routePath.startsWith(routePrefix)),
      false,
    );
  }

  const assistanceDir = path.join(process.cwd(), "src", "assistance-contract");
  const assistanceFiles = fs.readdirSync(assistanceDir);
  assert.equal(
    assistanceFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModuleSource = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModuleSource.includes("AssistanceContractModule"), false);
});
