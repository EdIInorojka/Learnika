import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  OcrBoundaryService,
  redactOcrDiagnostics,
} from "../dist/ocr-boundary/ocr-boundary.service.js";

const familyId = "11111111-1111-4111-8111-111111111111";
const childProfileId = "22222222-2222-4222-8222-222222222222";
const mediaAssetId = "33333333-3333-4333-8333-333333333333";
const storageKey = `families/${familyId}/children/${childProfileId}/media/homework-image/${mediaAssetId}.png`;

function createService() {
  return new OcrBoundaryService();
}

function baseRequest(overrides = {}) {
  return {
    assetKind: "HOMEWORK_IMAGE",
    checksumSha256: "a".repeat(64),
    childProfileId,
    familyId,
    mediaAssetId,
    mimeType: "image/png",
    mockFixtureId: "clear-linear-equation",
    sizeBytes: 512,
    storageKey,
    ...overrides,
  };
}

test("deterministic mock OCR returns untrusted candidates requiring learner confirmation", async () => {
  const service = createService();
  const firstResult = await service.recognize(baseRequest());
  const secondResult = await service.recognize(baseRequest());

  assert.deepEqual(firstResult, secondResult);
  assert.equal(firstResult.status, "CANDIDATE_REQUIRES_CONFIRMATION");
  assert.equal(firstResult.providerName, "local-mock-ocr");
  assert.equal(firstResult.modelVersion, "local-mock-ocr-v1");
  assert.equal(firstResult.policyVersion, "wave-2-slice-6-ocr-boundary-v1");
  assert.equal(firstResult.schemaVersion, "ocr-candidate-boundary-v1");
  assert.equal(firstResult.requiresLearnerConfirmation, true);
  assert.equal(firstResult.candidates.length, 1);
  assert.equal(firstResult.candidates[0].trust, "UNTRUSTED_OCR_CANDIDATE");
  assert.equal(firstResult.candidates[0].requiresLearnerConfirmation, true);
  assert.equal(firstResult.candidates[0].source, "MOCK_FIXTURE");
  assert.equal(firstResult.candidates[0].text, "2x + 3 = 7");

  const serialized = JSON.stringify(firstResult);
  assert.equal(serialized.includes(storageKey), false);
  assert.equal(serialized.includes("parent@example.test"), false);
  assert.equal(serialized.includes("LearnerA-Synthetic"), false);
});

test("low-confidence mock OCR requires review and does not return candidate text", async () => {
  const service = createService();
  const result = await service.recognize(baseRequest({ mockFixtureId: "low-confidence-equation" }));

  assert.deepEqual(result, {
    confidence: "LOW",
    mediaAssetId,
    modelVersion: "local-mock-ocr-v1",
    policyVersion: "wave-2-slice-6-ocr-boundary-v1",
    providerName: "local-mock-ocr",
    reason: "LOW_CONFIDENCE",
    requiresLearnerConfirmation: true,
    schemaVersion: "ocr-candidate-boundary-v1",
    status: "NEEDS_REVIEW",
  });

  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes("2x + 3 = 7"), false);
  assert.equal(Object.hasOwn(result, "candidates"), false);
});

test("prompt-injection fixture remains untrusted worksheet text", async () => {
  const service = createService();
  const result = await service.recognize(
    baseRequest({ mockFixtureId: "prompt-injection-equation" }),
  );

  assert.equal(result.status, "CANDIDATE_REQUIRES_CONFIRMATION");
  assert.equal(result.candidates[0].trust, "UNTRUSTED_OCR_CANDIDATE");
  assert.equal(result.candidates[0].requiresLearnerConfirmation, true);
  assert.equal(result.candidates[0].text.includes("Ignore previous instructions"), true);
});

test("provider failure is a safe typed failure without raw provider payloads", async () => {
  const service = createService();
  const result = await service.recognize(baseRequest({ mockFixtureId: "provider-failure" }));

  assert.deepEqual(result, {
    confidence: "UNKNOWN",
    mediaAssetId,
    modelVersion: "local-mock-ocr-v1",
    policyVersion: "wave-2-slice-6-ocr-boundary-v1",
    providerName: "local-mock-ocr",
    reason: "PROVIDER_FAILURE",
    safeMessage: "OCR provider boundary returned a safe mock failure.",
    schemaVersion: "ocr-candidate-boundary-v1",
    status: "FAILED",
  });

  const serialized = JSON.stringify(result);
  for (const forbidden of ["providerPayload", "rawProvider", "secret", "token", storageKey]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("only MVP homework image and PDF media metadata are supported", () => {
  const service = createService();

  assert.doesNotThrow(() =>
    service.validateMediaMetadataRequest(baseRequest({ assetKind: "HOMEWORK_IMAGE" })),
  );
  assert.doesNotThrow(() =>
    service.validateMediaMetadataRequest(
      baseRequest({
        assetKind: "HOMEWORK_SCREENSHOT",
        mimeType: "image/webp",
        storageKey: `families/${familyId}/children/${childProfileId}/media/homework-screenshot/${mediaAssetId}.webp`,
      }),
    ),
  );
  assert.doesNotThrow(() =>
    service.validateMediaMetadataRequest(
      baseRequest({
        assetKind: "HOMEWORK_PDF",
        mimeType: "application/pdf",
        pageCount: 2,
        storageKey: `families/${familyId}/children/${childProfileId}/media/homework-pdf/${mediaAssetId}.pdf`,
      }),
    ),
  );

  assert.deepEqual(service.getSupportedMediaKinds(), [
    "HOMEWORK_IMAGE",
    "HOMEWORK_SCREENSHOT",
    "HOMEWORK_PDF",
  ]);
});

test("unsupported media kind MIME and unsafe metadata are rejected", async () => {
  const service = createService();

  assert.throws(
    () =>
      service.validateMediaMetadataRequest(
        baseRequest({ assetKind: "VOICE_AUDIO", mimeType: "audio/webm" }),
      ),
    (error) => error.code === "OCR_MEDIA_UNSUPPORTED",
  );
  assert.throws(
    () => service.validateMediaMetadataRequest(baseRequest({ mimeType: "text/plain" })),
    (error) => error.code === "OCR_MEDIA_UNSUPPORTED",
  );
  assert.throws(
    () => service.validateMediaMetadataRequest(baseRequest({ originalFilename: "homework.png" })),
    (error) => error.code === "OCR_REQUEST_INVALID",
  );
  await assert.rejects(
    () => service.recognize(baseRequest({ storageKey: "homework-parent@example.test.png" })),
    (error) => error.code === "OCR_REQUEST_INVALID",
  );
});

test("OCR results contain no answer solution hint transcript prompt completion or provider payload fields", async () => {
  const service = createService();
  const result = await service.recognize(baseRequest());
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
    "sttResult",
    "transcript",
    "x = 2",
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("diagnostic redaction removes media keys filenames raw text credentials and child PII", () => {
  const redacted = JSON.stringify(
    redactOcrDiagnostics({
      authorization: "Bearer raw-token",
      candidateText: "2x + 3 = 7",
      childNickname: "LearnerA-Synthetic",
      ocrText: "recognized worksheet text",
      originalFilename: "homework parent@example.test.png",
      parentEmail: "parent@example.test",
      rawMediaBytes: "raw bytes",
      safe: "OCR_MEDIA_UNSUPPORTED",
      storageKey,
    }),
  );

  assert.equal(redacted.includes("raw-token"), false);
  assert.equal(redacted.includes("2x + 3 = 7"), false);
  assert.equal(redacted.includes("LearnerA-Synthetic"), false);
  assert.equal(redacted.includes("recognized worksheet text"), false);
  assert.equal(redacted.includes("parent@example.test"), false);
  assert.equal(redacted.includes("homework"), false);
  assert.equal(redacted.includes("raw bytes"), false);
  assert.equal(redacted.includes("families/"), false);
  assert.equal(redacted.includes("OCR_MEDIA_UNSUPPORTED"), true);
});

test("Slice 6 remains internal-only with no persistence public routes or OpenAPI changes", () => {
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const openapi = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  const routePaths = Object.keys(openapi.paths ?? {});
  for (const routePrefix of ["/assets", "/assistance", "/hints", "/media", "/ocr", "/voice"]) {
    assert.equal(
      routePaths.some((routePath) => routePath.startsWith(routePrefix)),
      false,
    );
  }

  const ocrBoundaryDir = path.join(process.cwd(), "src", "ocr-boundary");
  const ocrBoundaryFiles = fs.readdirSync(ocrBoundaryDir);
  assert.equal(
    ocrBoundaryFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModuleSource = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModuleSource.includes("OcrBoundaryModule"), false);

  const prismaSchema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  for (const forbidden of [
    "OcrResult",
    "OcrCandidate",
    "ocrResult",
    "ocrCandidate",
    "recognizedText",
    "providerPayload",
    "llmPrompt",
    "llmCompletion",
    "transcript",
  ]) {
    assert.equal(prismaSchema.includes(forbidden), false);
  }
});
