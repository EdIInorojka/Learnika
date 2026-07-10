import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  MediaStorageService,
  createSha256Hex,
  redactMediaStorageDiagnostics,
} from "../dist/media-storage/media-storage.service.js";

const familyId = "11111111-1111-4111-8111-111111111111";
const childProfileId = "22222222-2222-4222-8222-222222222222";
const mediaAssetId = "33333333-3333-4333-8333-333333333333";

function createService() {
  return new MediaStorageService({
    bucket: "learnika-local",
    endpoint: "http://127.0.0.1:9000",
    forcePathStyle: true,
    maxFileSizeBytes: 1024,
  });
}

test("storage keys are family and child scoped without PII or original filenames", () => {
  const service = createService();
  const storageKey = service.buildStorageKey({
    assetKind: "HOMEWORK_IMAGE",
    childProfileId,
    familyId,
    mediaAssetId,
    mimeType: "image/png",
  });

  assert.equal(
    storageKey,
    `families/${familyId}/children/${childProfileId}/media/homework-image/${mediaAssetId}.png`,
  );
  assert.equal(storageKey.includes("LearnerA-Synthetic"), false);
  assert.equal(storageKey.includes("parent@example.test"), false);
  assert.equal(storageKey.includes("homework from school.png"), false);
  assert.doesNotThrow(() => service.validateStorageKey(storageKey));
});

test("invalid MIME types, oversized files and unsupported asset kinds are rejected", () => {
  const service = createService();

  assert.throws(
    () =>
      service.validateAsset({
        assetKind: "HOMEWORK_IMAGE",
        mimeType: "text/plain",
        sizeBytes: 10,
      }),
    (error) => error.code === "MEDIA_MIME_UNSUPPORTED",
  );
  assert.throws(
    () =>
      service.validateAsset({
        assetKind: "HOMEWORK_PDF",
        mimeType: "application/pdf",
        sizeBytes: 2048,
      }),
    (error) => error.code === "MEDIA_FILE_TOO_LARGE",
  );
  assert.throws(
    () =>
      service.validateAsset({
        assetKind: "OTHER",
        mimeType: "image/png",
        sizeBytes: 10,
      }),
    (error) => error.code === "MEDIA_ASSET_KIND_UNSUPPORTED",
  );
  assert.throws(
    () =>
      service.validateAsset({
        assetKind: "VOICE_AUDIO",
        mimeType: "audio/webm",
        sizeBytes: 10,
      }),
    (error) => error.code === "MEDIA_ASSET_KIND_UNSUPPORTED",
  );
});

test("diagnostic redaction removes sensitive media and identity values", () => {
  const redacted = JSON.stringify(
    redactMediaStorageDiagnostics({
      authorization: "Bearer raw-token",
      childNickname: "LearnerA-Synthetic",
      originalFilename: "homework parent@example.test.png",
      parentEmail: "parent@example.test",
      safe: "MEDIA_MIME_UNSUPPORTED",
      storageKey: `families/${familyId}/children/${childProfileId}/media/homework-image/${mediaAssetId}.png`,
    }),
  );

  assert.equal(redacted.includes("raw-token"), false);
  assert.equal(redacted.includes("LearnerA-Synthetic"), false);
  assert.equal(redacted.includes("parent@example.test"), false);
  assert.equal(redacted.includes("homework"), false);
  assert.equal(redacted.includes("families/"), false);
  assert.equal(redacted.includes("MEDIA_MIME_UNSUPPORTED"), true);
});

test("metadata mapping remains metadata-only and hashes content without storing it", () => {
  const service = createService();
  const checksumSha256 = createSha256Hex(Buffer.from("synthetic file bytes"));
  const metadata = service.buildMediaAssetMetadata({
    assetKind: "HOMEWORK_SCREENSHOT",
    checksumSha256,
    childProfileId,
    createdByUserId: "44444444-4444-4444-8444-444444444444",
    familyId,
    mediaAssetId,
    mimeType: "image/jpeg",
    retentionUntil: new Date("2026-07-11T00:00:00.000Z"),
    sizeBytes: 512,
  });

  assert.equal(metadata.familyId, familyId);
  assert.equal(metadata.childProfileId, childProfileId);
  assert.equal(metadata.assetKind, "HOMEWORK_SCREENSHOT");
  assert.equal(metadata.retentionStatus, "TEMPORARY");
  assert.equal(metadata.sizeBytes, 512n);
  assert.equal(metadata.checksumSha256, checksumSha256);

  const serialized = JSON.stringify(metadata, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
  assert.equal(serialized.includes("synthetic file bytes"), false);
  assert.equal(serialized.includes("rawContent"), false);
  assert.equal(serialized.includes("transcript"), false);
  assert.equal(serialized.includes("ocrResult"), false);
  assert.equal(serialized.includes("llmPrompt"), false);
});

test("Slice 3 does not create public media routes or controllers", () => {
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

  const mediaStorageDir = path.join(process.cwd(), "src", "media-storage");
  const mediaStorageFiles = fs.readdirSync(mediaStorageDir);
  assert.equal(
    mediaStorageFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModuleSource = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModuleSource.includes("MediaStorageModule"), false);
});
