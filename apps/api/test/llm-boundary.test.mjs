import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  LlmBoundaryService,
  redactLlmDiagnostics,
} from "../dist/llm-boundary/llm-boundary.service.js";

const assistancePolicyVersion = "wave-2-slice-5-safe-assistance-contract-v1";

function createService() {
  return new LlmBoundaryService();
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
    policyVersion: assistancePolicyVersion,
    requiresMeaningfulAttempt: true,
    ...overrides,
  };
}

function satisfiedGate(overrides = {}) {
  return {
    allowed: true,
    lastAttemptNumber: 1,
    policyVersion: "wave-2-slice-4-homework-state-v1",
    reason: "READY_AFTER_MEANINGFUL_ATTEMPT",
    ...overrides,
  };
}

function baseRequest(overrides = {}) {
  return {
    assistanceContract: baseContract(),
    attemptGate: satisfiedGate(),
    mockFixtureId: "safe-concept-reminder",
    policyContext: {
      gradeBand: "GRADES_7_9",
      locale: "ru-RU",
      subject: "MATHEMATICS",
    },
    requestKind: "SAFE_ASSISTANCE_INTENT",
    sourceInputTrust: "LEARNER_CONFIRMED_TEXT",
    ...overrides,
  };
}

test("deterministic mock LLM returns only safe intent metadata through an allowed contract", async () => {
  const service = createService();
  const firstResult = await service.evaluate(baseRequest());
  const secondResult = await service.evaluate(baseRequest());

  assert.deepEqual(firstResult, secondResult);
  assert.deepEqual(firstResult, {
    assistanceCategory: "CONCEPT_REMINDER",
    assistanceLevel: "LEVEL_2_CONCEPT_REMINDER",
    confidence: "HIGH",
    modelVersion: "local-mock-llm-v1",
    noLearnerFacingText: true,
    policyVersion: "wave-2-slice-8-llm-boundary-v1",
    providerName: "local-mock-llm",
    requiresPostValidation: true,
    schemaVersion: "llm-safe-intent-boundary-v1",
    status: "SAFE_INTENT_READY",
  });
});

test("safe refusal fixture returns deterministic refusal without generated text", async () => {
  const service = createService();
  const result = await service.evaluate(
    baseRequest({
      mockFixtureId: "safe-refusal",
      requestKind: "SAFE_REFUSAL_CLASSIFICATION",
    }),
  );

  assert.deepEqual(result, {
    confidence: "HIGH",
    modelVersion: "local-mock-llm-v1",
    noLearnerFacingText: true,
    policyVersion: "wave-2-slice-8-llm-boundary-v1",
    providerName: "local-mock-llm",
    refusalReason: "POLICY_BOUNDARY",
    requiresPostValidation: true,
    schemaVersion: "llm-safe-intent-boundary-v1",
    status: "REFUSED",
  });
});

test("invalid assistance contract is rejected before provider evaluation", async () => {
  const service = createService();

  await assert.rejects(
    () =>
      service.evaluate(
        baseRequest({
          assistanceContract: baseContract({ finalAnswer: "final answer is 42" }),
        }),
      ),
    (error) => error.code === "LLM_REQUEST_FORBIDDEN",
  );
  await assert.rejects(
    () =>
      service.evaluate(
        baseRequest({
          assistanceContract: baseContract({
            constraints: {
              noFinalAnswer: false,
              noFullSolution: true,
              noGeneratedTextPersistence: true,
              noProviderPayload: true,
              noRawMedia: true,
            },
          }),
        }),
      ),
    (error) => error.code === "LLM_ASSISTANCE_CONTRACT_INVALID",
  );
});

test("missing attempt eligibility is rejected", async () => {
  const service = createService();

  for (const reason of ["ATTEMPT_REQUIRED", "MEANINGFUL_ATTEMPT_REQUIRED"]) {
    await assert.rejects(
      () =>
        service.evaluate(
          baseRequest({
            attemptGate: satisfiedGate({
              allowed: false,
              reason,
            }),
          }),
        ),
      (error) => error.code === "LLM_ATTEMPT_GATE_REQUIRED",
    );
  }
});

test("unconfirmed OCR and STT candidate input is rejected", async () => {
  const service = createService();

  for (const sourceInputTrust of ["UNCONFIRMED_OCR_CANDIDATE", "UNCONFIRMED_STT_TRANSCRIPT"]) {
    await assert.rejects(
      () => service.evaluate(baseRequest({ sourceInputTrust })),
      (error) => error.code === "LLM_INPUT_UNCONFIRMED",
    );
  }
});

test("direct answer and source solution request kinds are rejected", async () => {
  const service = createService();

  for (const requestKind of [
    "ANSWER_CHECKING",
    "DIRECT_ANSWER_REQUEST",
    "FULL_SOLUTION_REQUEST",
    "SOLUTION_GENERATION",
    "STEP_BY_STEP_SOURCE_SOLUTION",
  ]) {
    await assert.rejects(
      () => service.evaluate(baseRequest({ requestKind })),
      (error) => error.code === "LLM_REQUEST_FORBIDDEN",
    );
  }
});

test("solution prompt completion and provider payload fields are rejected", async () => {
  const service = createService();

  for (const fieldName of [
    "solution",
    "fullSolution",
    "llmPrompt",
    "llmCompletion",
    "providerPayload",
    "ocrResult",
    "sttResult",
    "transcriptBody",
    "generatedHint",
    "textbookContent",
  ]) {
    await assert.rejects(
      () => service.evaluate(baseRequest({ [fieldName]: "unsafe provider payload" })),
      (error) => error.code === "LLM_REQUEST_FORBIDDEN",
    );
  }
});

test("provider failure returns safe failure without provider payloads", async () => {
  const service = createService();
  const result = await service.evaluate(baseRequest({ mockFixtureId: "provider-failure" }));

  assert.deepEqual(result, {
    confidence: "UNKNOWN",
    modelVersion: "local-mock-llm-v1",
    noLearnerFacingText: true,
    policyVersion: "wave-2-slice-8-llm-boundary-v1",
    providerName: "local-mock-llm",
    reason: "PROVIDER_FAILURE",
    requiresPostValidation: true,
    safeMessage: "LLM provider boundary returned a safe mock failure.",
    schemaVersion: "llm-safe-intent-boundary-v1",
    status: "FAILED",
  });

  const serialized = JSON.stringify(result);
  for (const forbidden of ["providerPayload", "rawProvider", "secret", "token"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("LLM result contains no answer solution hint text prompt completion provider payload transcript or OCR output", async () => {
  const service = createService();
  const result = await service.evaluate(baseRequest());
  const serialized = JSON.stringify(result);

  for (const forbidden of [
    "answer",
    "finalAnswer",
    "solution",
    "fullSolution",
    "generatedHint",
    "hintText",
    "llmPrompt",
    "llmCompletion",
    "providerPayload",
    "ocrResult",
    "sttResult",
    "transcript",
    "x = 2",
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("diagnostic redaction removes prompts completions provider payloads child PII and credentials", () => {
  const redacted = JSON.stringify(
    redactLlmDiagnostics({
      authorization: "Bearer raw-token",
      childNickname: "LearnerA-Synthetic",
      cookie: "session=raw-cookie",
      llmCompletion: "model completion with final answer",
      llmPrompt: "prompt with parent@example.test",
      parentEmail: "parent@example.test",
      password: "raw-password",
      providerPayload: "raw provider payload",
      safe: "LLM_REQUEST_FORBIDDEN",
      secret: "raw-secret",
      sourceAnswer: "final answer is 42",
      transcriptBody: "spoken learner text",
    }),
  );

  assert.equal(redacted.includes("raw-token"), false);
  assert.equal(redacted.includes("raw-cookie"), false);
  assert.equal(redacted.includes("raw-password"), false);
  assert.equal(redacted.includes("raw-secret"), false);
  assert.equal(redacted.includes("LearnerA-Synthetic"), false);
  assert.equal(redacted.includes("parent@example.test"), false);
  assert.equal(redacted.includes("model completion"), false);
  assert.equal(redacted.includes("prompt with"), false);
  assert.equal(redacted.includes("raw provider payload"), false);
  assert.equal(redacted.includes("final answer is 42"), false);
  assert.equal(redacted.includes("spoken learner text"), false);
  assert.equal(redacted.includes("LLM_REQUEST_FORBIDDEN"), true);
});

test("Slice 8 remains internal-only with no persistence public routes OpenAPI changes or SDKs", () => {
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const openapi = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  const routePaths = Object.keys(openapi.paths ?? {});
  for (const routePrefix of [
    "/ai",
    "/assets",
    "/assistance",
    "/hints",
    "/llm",
    "/media",
    "/ocr",
    "/stt",
    "/voice",
  ]) {
    assert.equal(
      routePaths.some((routePath) => routePath.startsWith(routePrefix)),
      false,
    );
  }

  const llmBoundaryDir = path.join(process.cwd(), "src", "llm-boundary");
  const llmBoundaryFiles = fs.readdirSync(llmBoundaryDir);
  assert.equal(
    llmBoundaryFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModuleSource = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModuleSource.includes("LlmBoundaryModule"), false);

  const prismaSchema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  for (const forbidden of [
    "LlmResult",
    "LlmPrompt",
    "LlmCompletion",
    "providerPayload",
    "generatedHint",
    "sourceAnswer",
    "fullSolution",
    "transcriptBody",
    "ocrResult",
  ]) {
    assert.equal(prismaSchema.includes(forbidden), false);
  }

  const serviceSource = fs.readFileSync(
    path.join(process.cwd(), "src", "llm-boundary", "llm-boundary.service.ts"),
    "utf8",
  );
  for (const forbidden of [
    "fetch(",
    "http.request",
    "https.request",
    "OpenAI",
    "Anthropic",
    "Gemini",
    "stream",
    "toolCall",
  ]) {
    assert.equal(serviceSource.includes(forbidden), false);
  }

  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
  const serializedPackage = JSON.stringify(packageJson);
  for (const forbidden of ["openai", "anthropic", "gemini"]) {
    assert.equal(serializedPackage.toLowerCase().includes(forbidden), false);
  }
});
