import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  MediaProcessingReadinessService,
  redactMediaProcessingReadinessDiagnostics,
} from "../dist/media-processing-readiness/media-processing-readiness.service.js";

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

function createService() {
  return new MediaProcessingReadinessService();
}

function assertReady(result) {
  assert.deepEqual(result, {
    learnerConfirmationRequired: true,
    mediaAssetId,
    metadataOnly: true,
    objectExistence: "UNKNOWN_NOT_VERIFIED",
    policyVersion: "wave-2-slice-14-media-processing-readiness-v1",
    processingDisposition: "HOMEWORK_TEXT_RECOGNITION",
    status: "READY",
    trust: "UNTRUSTED_CANDIDATE_ONLY",
  });
}

test("uploaded safe homework image metadata is ready for future text recognition", () => {
  assertReady(createService().evaluate(baseMetadata(), evaluatedAt));
});

test("uploaded safe homework screenshot metadata is ready for future text recognition", () => {
  assertReady(
    createService().evaluate(
      baseMetadata({
        assetKind: "HOMEWORK_SCREENSHOT",
        mimeType: "image/webp",
        storageKey: storageKey("HOMEWORK_SCREENSHOT", "image/webp"),
      }),
      evaluatedAt,
    ),
  );
});

test("uploaded safe homework PDF metadata is ready for future text recognition", () => {
  assertReady(
    createService().evaluate(
      baseMetadata({
        assetKind: "HOMEWORK_PDF",
        mimeType: "application/pdf",
        storageKey: storageKey("HOMEWORK_PDF", "application/pdf"),
      }),
      evaluatedAt,
    ),
  );
});

test("unsupported and voice media kinds are blocked", () => {
  const service = createService();

  assert.equal(
    service.evaluate(baseMetadata({ assetKind: "OTHER" }), evaluatedAt).reason,
    "UNSUPPORTED_MEDIA_KIND",
  );
  assert.equal(
    service.evaluate(baseMetadata({ assetKind: "VOICE_AUDIO" }), evaluatedAt).reason,
    "VOICE_MEDIA_DEFERRED",
  );
});

test("kind and MIME mismatch is blocked", () => {
  const result = createService().evaluate(
    baseMetadata({ mimeType: "application/pdf" }),
    evaluatedAt,
  );

  assert.equal(result.status, "BLOCKED");
  assert.equal(result.reason, "KIND_MIME_MISMATCH");
});

test("unsafe and expired retention states are blocked", () => {
  const service = createService();

  for (const retentionStatus of ["DELETION_REQUESTED", "RETENTION_EXPIRED", "DELETED"]) {
    const result = service.evaluate(baseMetadata({ retentionStatus }), evaluatedAt);
    assert.equal(result.status, "BLOCKED");
    assert.equal(result.reason, "UNSAFE_RETENTION_STATE");
  }

  assert.equal(
    service.evaluate(
      baseMetadata({ deletionRequestedAt: new Date("2026-07-11T00:00:00.000Z") }),
      evaluatedAt,
    ).reason,
    "UNSAFE_RETENTION_STATE",
  );
  assert.equal(
    service.evaluate(
      baseMetadata({ retentionUntil: new Date("2026-07-12T00:00:00.000Z") }),
      evaluatedAt,
    ).reason,
    "RETENTION_DEADLINE_PASSED",
  );
});

test("missing mismatched and unsafe storage key metadata is blocked", () => {
  const service = createService();

  assert.equal(
    service.evaluate(baseMetadata({ storageKey: null }), evaluatedAt).reason,
    "MISSING_STORAGE_KEY",
  );
  assert.equal(
    service.evaluate(
      baseMetadata({
        storageKey: `families/${familyId}/children/${childProfileId}/media/homework-image/55555555-5555-4555-8555-555555555555.png`,
      }),
      evaluatedAt,
    ).reason,
    "UNSAFE_STORAGE_KEY",
  );
  assert.equal(
    service.evaluate(baseMetadata({ storageKey: "homework-parent@example.test.png" }), evaluatedAt)
      .reason,
    "UNSAFE_STORAGE_KEY",
  );
});

test("missing and malformed upload checksum metadata is blocked", () => {
  const service = createService();

  assert.equal(
    service.evaluate(baseMetadata({ checksumSha256: null }), evaluatedAt).reason,
    "MISSING_CHECKSUM",
  );
  assert.equal(
    service.evaluate(baseMetadata({ checksumSha256: "A".repeat(64) }), evaluatedAt).reason,
    "UNSAFE_CHECKSUM",
  );
  assert.equal(
    service.evaluate(baseMetadata({ checksumSha256: "not-a-checksum" }), evaluatedAt).reason,
    "UNSAFE_CHECKSUM",
  );
});

test("readiness results expose metadata-only safe decisions", () => {
  const ready = createService().evaluate(baseMetadata(), evaluatedAt);
  const blocked = createService().evaluate(baseMetadata({ storageKey: null }), evaluatedAt);
  const serialized = JSON.stringify([ready, blocked]).toLowerCase();

  for (const forbiddenValue of [
    "families/",
    "originalfilename",
    "rawmedia",
    "base64",
    "providerpayload",
    "finalanswer",
    "fullsolution",
    "generatedhint",
  ]) {
    assert.equal(serialized.includes(forbiddenValue), false);
  }

  const forbiddenFieldPattern =
    /answer|base64|filename|hint|llm|ocr|provider|rawmedia|solution|storagekey|stt/i;
  for (const result of [ready, blocked]) {
    for (const key of Object.keys(result)) {
      assert.equal(forbiddenFieldPattern.test(key), false, `forbidden result field: ${key}`);
    }
  }
});

test("diagnostics redact storage metadata credentials child PII and forbidden content", () => {
  const redacted = JSON.stringify(
    redactMediaProcessingReadinessDiagnostics({
      answer: "x = 2",
      authorization: "Bearer raw-token",
      childNickname: "LearnerA-Synthetic",
      cookie: "session=raw-cookie",
      originalFilename: "homework parent@example.test.png",
      safeReason: "UNSAFE_STORAGE_KEY",
      storageKey: storageKey("HOMEWORK_IMAGE", "image/png"),
    }),
  );

  for (const forbiddenValue of [
    "x = 2",
    "raw-token",
    "LearnerA-Synthetic",
    "raw-cookie",
    "parent@example.test",
    "families/",
  ]) {
    assert.equal(redacted.includes(forbiddenValue), false);
  }
  assert.equal(redacted.includes("UNSAFE_STORAGE_KEY"), true);
});

test("existing recognition and transcription candidates remain untrusted and confirmation gated", () => {
  const ocrTypes = fs.readFileSync(
    path.join(process.cwd(), "src", "ocr-boundary", "ocr-boundary.types.ts"),
    "utf8",
  );
  const sttTypes = fs.readFileSync(
    path.join(process.cwd(), "src", "stt-boundary", "stt-boundary.types.ts"),
    "utf8",
  );

  assert.equal(ocrTypes.includes('trust: "UNTRUSTED_OCR_CANDIDATE"'), true);
  assert.equal(ocrTypes.includes("requiresLearnerConfirmation: true"), true);
  assert.equal(sttTypes.includes('trust: "UNTRUSTED_TRANSCRIPT_CANDIDATE"'), true);
  assert.equal(sttTypes.includes("requiresEditableReview: true"), true);
  assert.equal(sttTypes.includes("requiresLearnerConfirmation: true"), true);
});

test("Slice 14 remains internal-only and performs no object or provider operation", () => {
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const readinessDir = path.join(process.cwd(), "src", "media-processing-readiness");
  const readinessFiles = fs.readdirSync(readinessDir);
  assert.equal(
    readinessFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const source = readinessFiles
    .filter((fileName) => fileName.endsWith(".ts"))
    .map((fileName) => fs.readFileSync(path.join(readinessDir, fileName), "utf8"))
    .join("\n");
  for (const forbiddenOperation of [
    "getObject(",
    "statObject(",
    "listObjects(",
    "removeObject(",
    "presignedGetObject(",
    ".recognize(",
    ".transcribe(",
    ".complete(",
    "fetch(",
    "http.request",
    "https.request",
  ]) {
    assert.equal(source.includes(forbiddenOperation), false, forbiddenOperation);
  }

  const appModuleSource = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModuleSource.includes("MediaProcessingReadinessModule"), false);

  const openapi = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  assert.equal(
    Object.keys(openapi.paths ?? {}).some((routePath) =>
      /processing|readiness|recognition|transcription/i.test(routePath),
    ),
    false,
  );

  const prismaSchema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  for (const forbiddenSchemaTerm of [
    "MediaProcessingReadiness",
    "processingDisposition",
    "objectExistence",
    "recognitionResult",
    "transcriptionResult",
  ]) {
    assert.equal(prismaSchema.includes(forbiddenSchemaTerm), false);
  }

  const migrations = fs
    .readdirSync(path.join(process.cwd(), "prisma", "migrations"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory());
  assert.equal(migrations.length, 3);
});
