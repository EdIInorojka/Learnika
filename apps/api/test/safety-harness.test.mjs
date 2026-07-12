import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  AssistanceContractService,
  redactAssistanceContractDiagnostics,
} from "../dist/assistance-contract/assistance-contract.service.js";
import {
  HomeworkStateService,
  redactHomeworkStateDiagnostics,
} from "../dist/homework-state/homework-state.service.js";
import {
  LlmBoundaryService,
  redactLlmDiagnostics,
} from "../dist/llm-boundary/llm-boundary.service.js";
import {
  MediaStorageService,
  redactMediaStorageDiagnostics,
} from "../dist/media-storage/media-storage.service.js";
import {
  OcrBoundaryService,
  redactOcrDiagnostics,
} from "../dist/ocr-boundary/ocr-boundary.service.js";
import {
  SttBoundaryService,
  redactSttDiagnostics,
} from "../dist/stt-boundary/stt-boundary.service.js";

const repoRoot = path.resolve(process.cwd(), "..", "..");
const assistancePolicyVersion = "wave-2-slice-5-safe-assistance-contract-v1";
const homeworkPolicyVersion = "wave-2-slice-4-homework-state-v1";
const familyId = "11111111-1111-4111-8111-111111111111";
const childProfileId = "22222222-2222-4222-8222-222222222222";
const mediaAssetId = "33333333-3333-4333-8333-333333333333";
const voiceSessionId = "44444444-4444-4444-8444-444444444444";
const audioAssetId = "55555555-5555-4555-8555-555555555555";
const imageStorageKey = `families/${familyId}/children/${childProfileId}/media/homework-image/${mediaAssetId}.png`;
const audioStorageKey = `families/${familyId}/children/${childProfileId}/voice-sessions/${voiceSessionId}/audio/${audioAssetId}.webm`;
const forbiddenOutputTokens = [
  "answer",
  "finalAnswer",
  "fullSolution",
  "generatedHint",
  "hintText",
  "llmCompletion",
  "llmPrompt",
  "providerPayload",
  "solution",
  "sourceAnswer",
  "stepByStepSolution",
];

function baseAssistanceContract(overrides = {}) {
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

function satisfiedAttemptGate(overrides = {}) {
  return {
    allowed: true,
    lastAttemptNumber: 1,
    policyVersion: homeworkPolicyVersion,
    reason: "READY_AFTER_MEANINGFUL_ATTEMPT",
    ...overrides,
  };
}

function baseLlmRequest(overrides = {}) {
  return {
    assistanceContract: baseAssistanceContract(),
    attemptGate: satisfiedAttemptGate(),
    mockFixtureId: "safe-refusal",
    policyContext: {
      gradeBand: "GRADES_7_9",
      locale: "ru-RU",
      subject: "MATHEMATICS",
    },
    requestKind: "SAFE_REFUSAL_CLASSIFICATION",
    sourceInputTrust: "LEARNER_CONFIRMED_TEXT",
    ...overrides,
  };
}

function baseOcrRequest(overrides = {}) {
  return {
    assetKind: "HOMEWORK_IMAGE",
    checksumSha256: "a".repeat(64),
    childProfileId,
    familyId,
    mediaAssetId,
    mimeType: "image/png",
    mockFixtureId: "clear-linear-equation",
    sizeBytes: 512,
    storageKey: imageStorageKey,
    ...overrides,
  };
}

function baseSttRequest(overrides = {}) {
  return {
    assetKind: "VOICE_AUDIO",
    audioAssetId,
    checksumSha256: "b".repeat(64),
    childProfileId,
    durationMs: 12_000,
    familyId,
    locale: "ru-RU",
    mimeType: "audio/webm",
    mockFixtureId: "clear-russian-step",
    purpose: "SOLUTION_STEP",
    sizeBytes: 4096,
    storageKey: audioStorageKey,
    voiceSessionId,
    ...overrides,
  };
}

function createMediaStorageService() {
  return new MediaStorageService({
    bucket: "learnika-local",
    endpoint: "http://127.0.0.1:9000",
    forcePathStyle: true,
    maxFileSizeBytes: 1024,
  });
}

function assertNoForbiddenOutput(value) {
  const serialized = JSON.stringify(value, (_key, item) =>
    typeof item === "bigint" ? item.toString() : item,
  );
  for (const forbidden of forbiddenOutputTokens) {
    assert.equal(serialized.includes(forbidden), false);
  }
  assert.equal(serialized.includes("x = 2"), false);
  assert.equal(serialized.includes("provider payload"), false);
}

function assertRedacted(redactedValue, unsafeValues) {
  const serialized = JSON.stringify(redactedValue);
  for (const unsafeValue of unsafeValues) {
    assert.equal(serialized.includes(unsafeValue), false);
  }
  assert.equal(serialized.includes("SAFE_SENTINEL"), true);
}

function assertEachRedactorRemoves(redactors, unsafeDiagnostics, unsafeValues) {
  for (const redact of redactors) {
    assertRedacted(redact(unsafeDiagnostics), unsafeValues);
  }
}

function isAssistanceBoundaryRejection(error) {
  return (
    error.code === "ASSISTANCE_CONTRACT_INVALID" ||
    error.code === "ASSISTANCE_CONTRACT_UNSAFE_FIELD"
  );
}

test("safety harness rejects answer solution and step-by-step solution fields", async () => {
  const assistance = new AssistanceContractService();
  const llm = new LlmBoundaryService();

  for (const fieldName of [
    "answer",
    "finalAnswer",
    "solution",
    "fullSolution",
    "exactSolution",
    "stepByStepSolution",
  ]) {
    assert.throws(
      () =>
        assistance.validateAssistanceContract(
          baseAssistanceContract({ [fieldName]: "synthetic final answer x = 2" }),
        ),
      (error) => error.code === "ASSISTANCE_CONTRACT_UNSAFE_FIELD",
    );
    await assert.rejects(
      () => llm.evaluate(baseLlmRequest({ [fieldName]: "synthetic source solution" })),
      (error) => error.code === "LLM_REQUEST_FORBIDDEN",
    );
  }
});

test("safety harness rejects prompt completion provider payload raw media and copied textbook fields", async () => {
  const assistance = new AssistanceContractService();
  const llm = new LlmBoundaryService();

  for (const fieldName of [
    "llmPrompt",
    "prompt",
    "llmCompletion",
    "completion",
    "providerPayload",
    "modelOutput",
    "rawMedia",
    "textbookContent",
  ]) {
    assert.throws(
      () =>
        assistance.validateAssistanceContract(
          baseAssistanceContract({ [fieldName]: "synthetic unsafe payload" }),
        ),
      isAssistanceBoundaryRejection,
    );
    await assert.rejects(
      () => llm.evaluate(baseLlmRequest({ [fieldName]: "synthetic unsafe payload" })),
      (error) => error.code === "LLM_REQUEST_FORBIDDEN",
    );
  }
});

test("generated hint text and answer-checking requests are refused before assistance", async () => {
  const assistance = new AssistanceContractService();
  const llm = new LlmBoundaryService();

  for (const fieldName of ["generatedHint", "hintText"]) {
    assert.throws(
      () =>
        assistance.validateAssistanceContract(
          baseAssistanceContract({ [fieldName]: "synthetic generated hint text" }),
        ),
      (error) => error.code === "ASSISTANCE_CONTRACT_UNSAFE_FIELD",
    );
  }

  for (const requestKind of [
    "ANSWER_CHECKING",
    "DIRECT_ANSWER_REQUEST",
    "FULL_SOLUTION_REQUEST",
    "SOLUTION_GENERATION",
    "STEP_BY_STEP_SOURCE_SOLUTION",
  ]) {
    await assert.rejects(
      () => llm.evaluate(baseLlmRequest({ requestKind })),
      (error) => error.code === "LLM_REQUEST_FORBIDDEN",
    );
  }
});

test("OCR and STT candidates remain untrusted and are rejected before LLM use unless confirmed later", async () => {
  const ocr = new OcrBoundaryService();
  const stt = new SttBoundaryService();
  const llm = new LlmBoundaryService();

  const ocrResult = await ocr.recognize(baseOcrRequest());
  const sttResult = await stt.transcribe(baseSttRequest());

  assert.equal(ocrResult.status, "CANDIDATE_REQUIRES_CONFIRMATION");
  assert.equal(ocrResult.requiresLearnerConfirmation, true);
  assert.equal(ocrResult.candidates[0].trust, "UNTRUSTED_OCR_CANDIDATE");
  assert.equal(sttResult.status, "CANDIDATE_REQUIRES_CONFIRMATION");
  assert.equal(sttResult.requiresLearnerConfirmation, true);
  assert.equal(sttResult.candidates[0].trust, "UNTRUSTED_TRANSCRIPT_CANDIDATE");
  assert.equal(sttResult.candidates[0].requiresEditableReview, true);

  for (const sourceInputTrust of ["UNCONFIRMED_OCR_CANDIDATE", "UNCONFIRMED_STT_TRANSCRIPT"]) {
    await assert.rejects(
      () => llm.evaluate(baseLlmRequest({ sourceInputTrust })),
      (error) => error.code === "LLM_INPUT_UNCONFIRMED",
    );
  }

  assert.doesNotThrow(() =>
    llm.validateSafeRequest(baseLlmRequest({ sourceInputTrust: "LEARNER_CONFIRMED_TEXT" })),
  );
});

test("cross-boundary fallback and refusal outputs carry only policy metadata", async () => {
  const assistance = new AssistanceContractService();
  const llm = new LlmBoundaryService();

  const fallback = assistance.buildSafeFallback("POLICY_BOUNDARY");
  const refusal = await llm.evaluate(baseLlmRequest());

  assert.deepEqual(fallback, {
    category: "SAFE_REFUSAL_FALLBACK",
    contractKind: "ASSISTANCE_FALLBACK",
    eligible: false,
    policyVersion: assistancePolicyVersion,
    reason: "POLICY_BOUNDARY",
  });
  assert.deepEqual(refusal, {
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
  assertNoForbiddenOutput(fallback);
  assertNoForbiddenOutput(refusal);
});

test("attempt gate still blocks no-attempt and non-meaningful assistance paths", async () => {
  const homework = new HomeworkStateService();
  const assistance = new AssistanceContractService();
  const llm = new LlmBoundaryService();
  const noAttemptGate = homework.evaluateAttemptGate({
    attempts: [],
    meaningfulAttempt: homework.evaluateMeaningfulAttemptPlaceholder({
      attemptStatus: "SUBMITTED",
      hasLearnerWork: true,
    }),
    sessionStatus: "WAITING_FOR_ATTEMPT",
  });
  const notMeaningfulGate = homework.evaluateAttemptGate({
    attempts: [{ attemptNumber: 1, status: "SUBMITTED" }],
    meaningfulAttempt: homework.evaluateMeaningfulAttemptPlaceholder({
      attemptStatus: "SUBMITTED",
      hasLearnerWork: false,
    }),
    sessionStatus: "WAITING_FOR_ATTEMPT",
  });

  assert.equal(assistance.evaluateEligibility({ attemptGate: noAttemptGate }).eligible, false);
  assert.equal(
    assistance.evaluateEligibility({ attemptGate: notMeaningfulGate }).reason,
    "MEANINGFUL_ATTEMPT_REQUIRED",
  );
  await assert.rejects(
    () => llm.evaluate(baseLlmRequest({ attemptGate: noAttemptGate })),
    (error) => error.code === "LLM_ATTEMPT_GATE_REQUIRED",
  );
  await assert.rejects(
    () => llm.evaluate(baseLlmRequest({ attemptGate: notMeaningfulGate })),
    (error) => error.code === "LLM_ATTEMPT_GATE_REQUIRED",
  );
});

test("redaction removes child PII credentials media keys filenames transcripts and provider-like values", () => {
  const commonUnsafeDiagnostics = {
    authorization: "Bearer synthetic-auth-token",
    childNickname: "LearnerA-Synthetic",
    cookie: "session=synthetic-cookie",
    originalFilename: "LearnerA-Synthetic parent@example.test homework.png",
    parentEmail: "parent@example.test",
    safe: "SAFE_SENTINEL",
    secret: "synthetic-secret",
    token: "synthetic-token",
  };
  const commonUnsafeValues = [
    "synthetic-auth-token",
    "LearnerA-Synthetic",
    "synthetic-cookie",
    "parent@example.test",
    "synthetic-secret",
    "synthetic-token",
  ];

  assertEachRedactorRemoves(
    [
      redactAssistanceContractDiagnostics,
      redactHomeworkStateDiagnostics,
      redactLlmDiagnostics,
      redactMediaStorageDiagnostics,
      redactOcrDiagnostics,
      redactSttDiagnostics,
    ],
    commonUnsafeDiagnostics,
    commonUnsafeValues,
  );

  assertEachRedactorRemoves(
    [
      redactAssistanceContractDiagnostics,
      redactHomeworkStateDiagnostics,
      redactLlmDiagnostics,
      redactOcrDiagnostics,
      redactSttDiagnostics,
    ],
    {
      providerPayload: "synthetic provider payload",
      rawMediaBytes: "synthetic raw media",
      safe: "SAFE_SENTINEL",
      sourceAnswer: "synthetic final answer x = 2",
      transcriptBody: "synthetic transcript text",
    },
    [
      "synthetic provider payload",
      "synthetic raw media",
      "synthetic final answer x = 2",
      "synthetic transcript text",
    ],
  );

  assertEachRedactorRemoves(
    [
      redactAssistanceContractDiagnostics,
      redactHomeworkStateDiagnostics,
      redactLlmDiagnostics,
      redactOcrDiagnostics,
      redactSttDiagnostics,
    ],
    {
      authorizationHeader: "Bearer synthetic-auth-header-token",
      cookieHeader: "learnika_session=synthetic-cookie-header",
      safe: "SAFE_SENTINEL",
    },
    ["synthetic-auth-header-token", "synthetic-cookie-header"],
  );

  assertEachRedactorRemoves(
    [redactMediaStorageDiagnostics, redactOcrDiagnostics, redactSttDiagnostics],
    {
      originalFilename: "LearnerA-Synthetic parent@example.test worksheet.png",
      safe: "SAFE_SENTINEL",
      storageKey: imageStorageKey,
    },
    ["LearnerA-Synthetic", "parent@example.test", "worksheet.png", "families/"],
  );
});

test("media safety keeps original PII filenames out of generated storage metadata", () => {
  const media = createMediaStorageService();

  const metadata = media.buildMediaAssetMetadata({
    assetKind: "HOMEWORK_IMAGE",
    childProfileId,
    familyId,
    mediaAssetId,
    mimeType: "image/png",
    originalFilename: "LearnerA-Synthetic parent@example.test homework.png",
    retentionUntil: new Date("2026-07-11T00:00:00.000Z"),
    sizeBytes: 512,
  });

  assert.equal(metadata.storageKey, imageStorageKey);
  assert.equal(metadata.retentionStatus, "TEMPORARY");
  assertNoForbiddenOutput(metadata);
  const serialized = JSON.stringify(metadata, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
  assert.equal(serialized.includes("LearnerA-Synthetic"), false);
  assert.equal(serialized.includes("parent@example.test"), false);
  assert.equal(serialized.includes("originalFilename"), false);
});

test("safety harness sees only approved homework metadata routes and no provider scope", () => {
  const openapi = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  const routePaths = Object.keys(openapi.paths ?? {});
  const homeworkPaths = routePaths.filter((routePath) => routePath.startsWith("/homework")).sort();
  assert.deepEqual(homeworkPaths, [
    "/homework/sessions",
    "/homework/sessions/{homeworkSessionId}",
    "/homework/sessions/{homeworkSessionId}/attempts",
    "/homework/sessions/{homeworkSessionId}/media-assets",
    "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}",
    "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/mock-ocr-candidate",
    "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/retention",
    "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/upload",
  ]);

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

  for (const moduleName of [
    "assistance-contract",
    "homework-state",
    "llm-boundary",
    "media-storage",
    "ocr-boundary",
    "stt-boundary",
  ]) {
    const moduleDir = path.join(process.cwd(), "src", moduleName);
    const moduleFiles = fs.readdirSync(moduleDir);
    assert.equal(
      moduleFiles.some((fileName) => fileName.endsWith(".controller.ts")),
      false,
    );
  }

  const appModuleSource = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  for (const moduleName of [
    "AssistanceContractModule",
    "HomeworkStateModule",
    "LlmBoundaryModule",
    "MediaStorageModule",
    "OcrBoundaryModule",
    "SttBoundaryModule",
  ]) {
    assert.equal(appModuleSource.includes(moduleName), false);
  }

  const migrations = fs
    .readdirSync(path.join(process.cwd(), "prisma", "migrations"))
    .filter((fileName) => fileName !== "migration_lock.toml");
  assert.deepEqual(migrations, [
    "20260708173051_initial_data_foundation",
    "20260708181231_auth_session_foundation",
    "20260710082038_homework_media_domain_foundation",
  ]);

  const prismaSchema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  for (const forbidden of [
    "confirmedTranscript",
    "generatedHint",
    "llmCompletion",
    "llmPrompt",
    "ocrResult",
    "providerPayload",
    "rawAudio",
    "recognizedText",
    "sourceAnswer",
    "sttResult",
    "transcriptBody",
  ]) {
    assert.equal(prismaSchema.includes(forbidden), false);
  }

  const apiPackage = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
  const rootPackage = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const packages = JSON.stringify([apiPackage, rootPackage]).toLowerCase();
  for (const forbidden of ["anthropic", "gemini", "openai", "whisper"]) {
    assert.equal(packages.includes(forbidden), false);
  }
});
