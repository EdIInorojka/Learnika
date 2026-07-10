import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  SttBoundaryService,
  redactSttDiagnostics,
} from "../dist/stt-boundary/stt-boundary.service.js";

const familyId = "11111111-1111-4111-8111-111111111111";
const childProfileId = "22222222-2222-4222-8222-222222222222";
const voiceSessionId = "33333333-3333-4333-8333-333333333333";
const audioAssetId = "44444444-4444-4444-8444-444444444444";
const storageKey = `families/${familyId}/children/${childProfileId}/voice-sessions/${voiceSessionId}/audio/${audioAssetId}.webm`;

function createService() {
  return new SttBoundaryService();
}

function baseRequest(overrides = {}) {
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
    storageKey,
    voiceSessionId,
    ...overrides,
  };
}

test("deterministic mock STT returns untrusted transcript candidates requiring confirmation", async () => {
  const service = createService();
  const firstResult = await service.transcribe(baseRequest());
  const secondResult = await service.transcribe(baseRequest());

  assert.deepEqual(firstResult, secondResult);
  assert.equal(firstResult.status, "CANDIDATE_REQUIRES_CONFIRMATION");
  assert.equal(firstResult.providerName, "local-mock-stt");
  assert.equal(firstResult.modelVersion, "local-mock-stt-v1");
  assert.equal(firstResult.policyVersion, "wave-2-slice-7-stt-boundary-v1");
  assert.equal(firstResult.schemaVersion, "stt-candidate-boundary-v1");
  assert.equal(firstResult.requiresEditableReview, true);
  assert.equal(firstResult.requiresLearnerConfirmation, true);
  assert.equal(firstResult.candidates.length, 1);
  assert.equal(firstResult.candidates[0].trust, "UNTRUSTED_TRANSCRIPT_CANDIDATE");
  assert.equal(firstResult.candidates[0].requiresEditableReview, true);
  assert.equal(firstResult.candidates[0].requiresLearnerConfirmation, true);
  assert.equal(firstResult.candidates[0].source, "MOCK_FIXTURE");
  assert.equal(firstResult.candidates[0].text, "5x - 3 = 7");

  const serialized = JSON.stringify(firstResult);
  assert.equal(serialized.includes(storageKey), false);
  assert.equal(serialized.includes("parent@example.test"), false);
  assert.equal(serialized.includes("LearnerA-Synthetic"), false);
});

test("low-confidence mock STT requires review and does not return candidate text", async () => {
  const service = createService();
  const result = await service.transcribe(baseRequest({ mockFixtureId: "low-confidence-audio" }));

  assert.deepEqual(result, {
    audioAssetId,
    confidence: "LOW",
    modelVersion: "local-mock-stt-v1",
    policyVersion: "wave-2-slice-7-stt-boundary-v1",
    providerName: "local-mock-stt",
    reason: "LOW_CONFIDENCE",
    requiresEditableReview: true,
    requiresLearnerConfirmation: true,
    schemaVersion: "stt-candidate-boundary-v1",
    status: "NEEDS_REVIEW",
    voiceSessionId,
  });

  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes("5x - 3 = 7"), false);
  assert.equal(Object.hasOwn(result, "candidates"), false);
});

test("prompt-injection spoken text remains an untrusted transcript candidate", async () => {
  const service = createService();
  const result = await service.transcribe(baseRequest({ mockFixtureId: "prompt-injection-audio" }));

  assert.equal(result.status, "CANDIDATE_REQUIRES_CONFIRMATION");
  assert.equal(result.candidates[0].trust, "UNTRUSTED_TRANSCRIPT_CANDIDATE");
  assert.equal(result.candidates[0].requiresEditableReview, true);
  assert.equal(result.candidates[0].requiresLearnerConfirmation, true);
  assert.equal(result.candidates[0].text.includes("Ignore previous instructions"), true);
  assert.deepEqual(result.candidates[0].uncertainFragments, [{ endOffset: 28, startOffset: 0 }]);
});

test("provider failure is a safe typed failure without raw provider payloads", async () => {
  const service = createService();
  const result = await service.transcribe(baseRequest({ mockFixtureId: "provider-failure" }));

  assert.deepEqual(result, {
    audioAssetId,
    confidence: "UNKNOWN",
    modelVersion: "local-mock-stt-v1",
    policyVersion: "wave-2-slice-7-stt-boundary-v1",
    providerName: "local-mock-stt",
    reason: "PROVIDER_FAILURE",
    safeMessage: "STT provider boundary returned a safe mock failure.",
    schemaVersion: "stt-candidate-boundary-v1",
    status: "FAILED",
    voiceSessionId,
  });

  const serialized = JSON.stringify(result);
  for (const forbidden of ["providerPayload", "rawProvider", "secret", "token", storageKey]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("only short foreground voice audio metadata is accepted", () => {
  const service = createService();

  assert.doesNotThrow(() => service.validateAudioMetadataRequest(baseRequest()));
  assert.doesNotThrow(() =>
    service.validateAudioMetadataRequest(
      baseRequest({
        mimeType: "audio/ogg",
        storageKey: `families/${familyId}/children/${childProfileId}/voice-sessions/${voiceSessionId}/audio/${audioAssetId}.ogg`,
      }),
    ),
  );

  assert.deepEqual(service.getSupportedMediaKinds(), ["VOICE_AUDIO"]);
  assert.deepEqual(service.getSupportedMimeTypes(), ["audio/webm", "audio/ogg", "audio/mp4"]);
});

test("OCR text image PDF and unsafe audio metadata are rejected", async () => {
  const service = createService();

  for (const rejectedInput of [
    baseRequest({ assetKind: "HOMEWORK_IMAGE", mimeType: "image/png" }),
    baseRequest({ assetKind: "HOMEWORK_SCREENSHOT", mimeType: "image/webp" }),
    baseRequest({ assetKind: "HOMEWORK_PDF", mimeType: "application/pdf" }),
    baseRequest({ assetKind: "OCR_TEXT", mimeType: "text/plain" }),
    baseRequest({ mimeType: "application/pdf" }),
    baseRequest({ mimeType: "text/plain" }),
    baseRequest({ durationMs: 60_001 }),
  ]) {
    assert.throws(
      () => service.validateAudioMetadataRequest(rejectedInput),
      (error) => error.code === "STT_MEDIA_UNSUPPORTED",
    );
  }

  assert.throws(
    () =>
      service.validateAudioMetadataRequest(baseRequest({ originalFilename: "learner-voice.webm" })),
    (error) => error.code === "STT_REQUEST_INVALID",
  );
  await assert.rejects(
    () => service.transcribe(baseRequest({ storageKey: "audio-parent@example.test.webm" })),
    (error) => error.code === "STT_REQUEST_INVALID",
  );
});

test("STT results contain no answer solution hint prompt completion or provider payload fields", async () => {
  const service = createService();
  const result = await service.transcribe(baseRequest());
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
    "x = 2",
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("diagnostic redaction removes media keys filenames raw text credentials child PII and audio IDs", () => {
  const redacted = JSON.stringify(
    redactSttDiagnostics({
      audioAssetId,
      authorization: "Bearer raw-token",
      candidateText: "5x - 3 = 7",
      childNickname: "LearnerA-Synthetic",
      cookie: "session=raw-cookie",
      originalFilename: "voice parent@example.test.webm",
      parentEmail: "parent@example.test",
      rawAudioBytes: "raw audio bytes",
      safe: "STT_MEDIA_UNSUPPORTED",
      storageKey,
      transcriptBody: "spoken learner text",
      voiceSessionId,
    }),
  );

  assert.equal(redacted.includes(audioAssetId), false);
  assert.equal(redacted.includes(voiceSessionId), false);
  assert.equal(redacted.includes("raw-token"), false);
  assert.equal(redacted.includes("raw-cookie"), false);
  assert.equal(redacted.includes("5x - 3 = 7"), false);
  assert.equal(redacted.includes("LearnerA-Synthetic"), false);
  assert.equal(redacted.includes("parent@example.test"), false);
  assert.equal(redacted.includes("voice"), false);
  assert.equal(redacted.includes("raw audio bytes"), false);
  assert.equal(redacted.includes("spoken learner text"), false);
  assert.equal(redacted.includes("families/"), false);
  assert.equal(redacted.includes("STT_MEDIA_UNSUPPORTED"), true);
});

test("Slice 7 remains internal-only with no persistence public routes OpenAPI changes or SDKs", () => {
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const openapi = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  const routePaths = Object.keys(openapi.paths ?? {});
  for (const routePrefix of [
    "/assets",
    "/assistance",
    "/hints",
    "/homework",
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

  const sttBoundaryDir = path.join(process.cwd(), "src", "stt-boundary");
  const sttBoundaryFiles = fs.readdirSync(sttBoundaryDir);
  assert.equal(
    sttBoundaryFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModuleSource = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModuleSource.includes("SttBoundaryModule"), false);

  const prismaSchema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  for (const forbidden of [
    "SttResult",
    "SttTranscript",
    "VoiceInputSession",
    "confirmedTranscript",
    "providerPayload",
    "llmPrompt",
    "llmCompletion",
    "rawAudio",
    "transcriptBody",
  ]) {
    assert.equal(prismaSchema.includes(forbidden), false);
  }

  const serviceSource = fs.readFileSync(
    path.join(process.cwd(), "src", "stt-boundary", "stt-boundary.service.ts"),
    "utf8",
  );
  for (const forbidden of [
    "fetch(",
    "http.request",
    "https.request",
    "createReadStream",
    "readFile",
    "ffmpeg",
    "whisper",
    "speechClient",
  ]) {
    assert.equal(serviceSource.includes(forbidden), false);
  }

  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
  assert.equal(JSON.stringify(packageJson).includes("whisper"), false);
});
