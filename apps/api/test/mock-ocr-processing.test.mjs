import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { MediaProcessingReadinessService } from "../dist/media-processing-readiness/media-processing-readiness.service.js";
import { MockOcrProcessingOrchestrationService } from "../dist/mock-ocr-processing/mock-ocr-processing.service.js";

const familyId = "11111111-1111-4111-8111-111111111111";
const childProfileId = "22222222-2222-4222-8222-222222222222";
const homeworkSessionId = "33333333-3333-4333-8333-333333333333";
const mediaAssetId = "44444444-4444-4444-8444-444444444444";
const evaluatedAt = new Date("2026-07-12T00:00:00.000Z");

function storageKey(assetKind, mimeType) {
  const segment = assetKind.toLowerCase().replaceAll("_", "-");
  const extension = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[mimeType];
  return `families/${familyId}/children/${childProfileId}/media/${segment}/${mediaAssetId}.${extension}`;
}

function baseMetadata(overrides = {}) {
  const assetKind = overrides.assetKind ?? "HOMEWORK_IMAGE";
  const mimeType = overrides.mimeType ?? "image/png";
  return {
    assetKind,
    checksumSha256: "a".repeat(64),
    childProfileId,
    deletedAt: null,
    deletionRequestedAt: null,
    familyId,
    homeworkSessionId,
    id: mediaAssetId,
    mimeType,
    retentionStatus: "TEMPORARY",
    retentionUntil: new Date("2026-07-13T00:00:00.000Z"),
    sizeBytes: 4096n,
    storageKey: storageKey(assetKind, mimeType),
    ...overrides,
  };
}

function request(overrides = {}) {
  return {
    mediaAsset: baseMetadata(),
    mockFixtureId: "clear-linear-equation",
    ...overrides,
  };
}

function createService() {
  return new MockOcrProcessingOrchestrationService();
}

function assertUntrustedCandidate(result) {
  assert.equal(result.status, "CANDIDATE_REQUIRES_CONFIRMATION");
  assert.equal(result.metadataOnly, true);
  assert.equal(result.objectExistence, "UNKNOWN_NOT_VERIFIED");
  assert.equal(result.orchestrationPolicyVersion, "wave-2-slice-15-mock-ocr-processing-v1");
  assert.equal(result.downstreamUseAllowed, false);
  assert.equal(result.requiresLearnerConfirmation, true);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].trust, "UNTRUSTED_OCR_CANDIDATE");
  assert.equal(result.candidates[0].requiresLearnerConfirmation, true);
  assert.equal(result.candidates[0].source, "MOCK_FIXTURE");
}

test("safe homework image metadata produces an untrusted OCR candidate", async () => {
  assertUntrustedCandidate(await createService().process(request(), evaluatedAt));
});

test("safe screenshot metadata produces an untrusted OCR candidate", async () => {
  assertUntrustedCandidate(
    await createService().process(
      request({
        mediaAsset: baseMetadata({
          assetKind: "HOMEWORK_SCREENSHOT",
          mimeType: "image/webp",
          storageKey: storageKey("HOMEWORK_SCREENSHOT", "image/webp"),
        }),
      }),
      evaluatedAt,
    ),
  );
});

test("safe PDF metadata produces an untrusted OCR candidate", async () => {
  assertUntrustedCandidate(
    await createService().process(
      request({
        mediaAsset: baseMetadata({
          assetKind: "HOMEWORK_PDF",
          mimeType: "application/pdf",
          storageKey: storageKey("HOMEWORK_PDF", "application/pdf"),
        }),
        pageCount: 2,
      }),
      evaluatedAt,
    ),
  );
});

test("unsupported and not-ready media are blocked before mock OCR", async () => {
  const calls = [];
  const boundary = {
    recognize(input) {
      calls.push(input);
      throw new Error("boundary must not be called");
    },
  };
  const service = new MockOcrProcessingOrchestrationService(
    new MediaProcessingReadinessService(),
    boundary,
  );

  const blockedCases = [
    [baseMetadata({ assetKind: "OTHER" }), "UNSUPPORTED_MEDIA_KIND"],
    [baseMetadata({ assetKind: "VOICE_AUDIO", mimeType: "audio/webm" }), "VOICE_MEDIA_DEFERRED"],
    [baseMetadata({ checksumSha256: null }), "MISSING_CHECKSUM"],
    [baseMetadata({ storageKey: null }), "MISSING_STORAGE_KEY"],
  ];

  for (const [mediaAsset, reason] of blockedCases) {
    const result = await service.process(request({ mediaAsset }), evaluatedAt);
    assert.equal(result.status, "BLOCKED");
    assert.equal(result.readinessReason, reason);
    assert.equal(result.downstreamUseAllowed, false);
  }
  assert.equal(calls.length, 0);
});

test("unsafe retention is blocked before mock OCR", async () => {
  let callCount = 0;
  const boundary = {
    recognize() {
      callCount += 1;
      throw new Error("boundary must not be called");
    },
  };
  const service = new MockOcrProcessingOrchestrationService(
    new MediaProcessingReadinessService(),
    boundary,
  );

  for (const mediaAsset of [
    baseMetadata({ retentionStatus: "DELETION_REQUESTED" }),
    baseMetadata({ retentionStatus: "RETENTION_EXPIRED" }),
    baseMetadata({ retentionStatus: "DELETED" }),
    baseMetadata({ retentionUntil: evaluatedAt }),
  ]) {
    const result = await service.process(request({ mediaAsset }), evaluatedAt);
    assert.equal(result.status, "BLOCKED");
  }
  assert.equal(callCount, 0);
});

test("low-confidence mock OCR returns a review state without candidate text", async () => {
  const result = await createService().process(
    request({ mockFixtureId: "low-confidence-equation" }),
    evaluatedAt,
  );

  assert.equal(result.status, "NEEDS_REVIEW");
  assert.equal(result.reason, "LOW_CONFIDENCE");
  assert.equal(result.requiresLearnerConfirmation, true);
  assert.equal(result.downstreamUseAllowed, false);
  assert.equal(Object.hasOwn(result, "candidates"), false);
  assert.equal(JSON.stringify(result).includes("2x + 3 = 7"), false);
});

test("mock provider failure returns safe failure metadata", async () => {
  const result = await createService().process(
    request({ mockFixtureId: "provider-failure" }),
    evaluatedAt,
  );

  assert.equal(result.status, "FAILED");
  assert.equal(result.reason, "PROVIDER_FAILURE");
  assert.equal(result.confidence, "UNKNOWN");
  assert.equal(result.downstreamUseAllowed, false);
  assert.equal(Object.hasOwn(result, "candidates"), false);
  assert.equal(Object.hasOwn(result, "providerPayload"), false);
});

test("invalid boundary metadata fails safely without leaking boundary details", async () => {
  const result = await createService().process(
    request({ mockFixtureId: "unknown-fixture" }),
    evaluatedAt,
  );

  assert.deepEqual(result, {
    confidence: "UNKNOWN",
    downstreamUseAllowed: false,
    mediaAssetId,
    metadataOnly: true,
    objectExistence: "UNKNOWN_NOT_VERIFIED",
    orchestrationPolicyVersion: "wave-2-slice-15-mock-ocr-processing-v1",
    reason: "BOUNDARY_REJECTED",
    safeMessage: "Mock recognition boundary rejected the metadata request safely.",
    status: "FAILED",
  });
});

test("orchestration results contain no raw media storage key or unsafe fields", async () => {
  const result = await createService().process(request(), evaluatedAt);
  const serialized = JSON.stringify(result);
  const lower = serialized.toLowerCase();

  assert.equal(serialized.includes(storageKey("HOMEWORK_IMAGE", "image/png")), false);
  for (const forbidden of [
    "rawmedia",
    "base64",
    "originalfilename",
    "storagekey",
    "llmprompt",
    "llmcompletion",
    "providerpayload",
    "finalanswer",
    "fullsolution",
    "generatedhint",
    "hinttext",
  ]) {
    assert.equal(lower.includes(forbidden), false, forbidden);
  }
});

test("Slice 15 creates no persistence object access public route or contract expansion", () => {
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const sourceDir = path.join(process.cwd(), "src", "mock-ocr-processing");
  const files = fs.readdirSync(sourceDir);
  assert.equal(
    files.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const source = files
    .filter((fileName) => fileName.endsWith(".ts"))
    .map((fileName) => fs.readFileSync(path.join(sourceDir, fileName), "utf8"))
    .join("\n");
  for (const forbiddenOperation of [
    "getObject(",
    "statObject(",
    "listObjects(",
    "removeObject(",
    "presignedGetObject(",
    "prisma.",
    "PrismaService",
    "fetch(",
    "http.request",
    "https.request",
    ".transcribe(",
    ".complete(",
  ]) {
    assert.equal(source.includes(forbiddenOperation), false, forbiddenOperation);
  }

  const appModule = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModule.includes("MockOcrProcessingModule"), false);

  const openapi = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  assert.equal(
    Object.keys(openapi.paths ?? {}).some((routePath) =>
      /ocr|processing|readiness|recognition/i.test(routePath),
    ),
    false,
  );

  const prismaSchema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  for (const forbiddenSchemaTerm of [
    "OcrResult",
    "OcrCandidate",
    "recognizedText",
    "recognitionResult",
    "providerPayload",
  ]) {
    assert.equal(prismaSchema.includes(forbiddenSchemaTerm), false);
  }

  const migrations = fs
    .readdirSync(path.join(process.cwd(), "prisma", "migrations"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory());
  assert.equal(migrations.length, 3);
});
