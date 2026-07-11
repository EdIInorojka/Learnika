import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  MediaLifecycleService,
  mediaLifecyclePolicyVersion,
  redactMediaLifecycleDiagnostics,
} from "../dist/media-lifecycle/media-lifecycle.service.js";

const mediaAssetIdA = "11111111-1111-4111-8111-111111111111";
const mediaAssetIdB = "22222222-2222-4222-8222-222222222222";
const mediaAssetIdC = "33333333-3333-4333-8333-333333333333";
const mediaAssetIdD = "44444444-4444-4444-8444-444444444444";
const mediaAssetIdE = "55555555-5555-4555-8555-555555555555";
const mediaAssetIdF = "66666666-6666-4666-8666-666666666666";
const mediaAssetIdG = "77777777-7777-4777-8777-777777777777";
const storageKey = `families/${mediaAssetIdA}/children/${mediaAssetIdB}/media/homework-image/${mediaAssetIdC}.png`;
const start = new Date("2026-07-11T00:00:00.000Z");
const retentionUntil = new Date("2026-07-12T00:00:00.000Z");
const evaluatedAt = new Date("2026-07-13T00:00:00.000Z");

function metadata(overrides = {}) {
  return {
    deletedAt: null,
    deletionRequestedAt: null,
    id: mediaAssetIdA,
    retentionStatus: "TEMPORARY",
    retentionUntil,
    storageKey,
    ...overrides,
  };
}

function assertNoForbiddenFields(value) {
  const serialized = JSON.stringify(value).toLowerCase();
  for (const forbidden of [
    "answer",
    "completion",
    "filename",
    "hint",
    "llm",
    "ocr",
    "prompt",
    "providerpayload",
    "rawmedia",
    "solution",
    "stt",
    "transcript",
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
}

test("valid media lifecycle transitions remain metadata-only", () => {
  const service = new MediaLifecycleService();
  const deadline = service.computeRetentionDeadline({
    retentionDurationMs: 24 * 60 * 60 * 1000,
    startsAt: start,
  });
  assert.deepEqual(deadline, retentionUntil);

  const deletionRequested = service.transition(
    metadata(),
    "REQUEST_DELETION",
    new Date("2026-07-11T12:00:00.000Z"),
  );
  assert.equal(deletionRequested.previousStatus, "TEMPORARY");
  assert.equal(deletionRequested.nextStatus, "DELETION_REQUESTED");
  assert.equal(deletionRequested.metadataOnly, true);
  assert.equal(deletionRequested.objectDeletionState, "NOT_PERFORMED_OR_VERIFIED");

  const retriedDeletionRequest = service.transition(
    metadata({
      deletionRequestedAt: deletionRequested.patch.deletionRequestedAt,
      retentionStatus: "DELETION_REQUESTED",
    }),
    "REQUEST_DELETION",
    new Date("2026-07-11T13:00:00.000Z"),
  );
  assert.deepEqual(
    retriedDeletionRequest.patch.deletionRequestedAt,
    deletionRequested.patch.deletionRequestedAt,
  );

  const retentionExpired = service.transition(metadata(), "EXPIRE_RETENTION", retentionUntil);
  assert.equal(retentionExpired.nextStatus, "RETENTION_EXPIRED");

  for (const eligibleMetadata of [
    metadata({
      deletionRequestedAt: deletionRequested.patch.deletionRequestedAt,
      retentionStatus: "DELETION_REQUESTED",
    }),
    metadata({ retentionStatus: "RETENTION_EXPIRED" }),
  ]) {
    const markedDeleted = service.transition(
      eligibleMetadata,
      "MARK_METADATA_DELETED",
      evaluatedAt,
    );
    assert.equal(markedDeleted.nextStatus, "DELETED");
    assert.equal(markedDeleted.patch.deletedAt.toISOString(), evaluatedAt.toISOString());
    assert.equal(markedDeleted.objectDeletionState, "NOT_PERFORMED_OR_VERIFIED");
    assertNoForbiddenFields(markedDeleted);
  }

  const auditMetadata = service.toAuditMetadata(deletionRequested);
  assert.deepEqual(auditMetadata, {
    action: "media.lifecycle.transition",
    event: "REQUEST_DELETION",
    mediaAssetId: mediaAssetIdA,
    metadataOnly: true,
    nextStatus: "DELETION_REQUESTED",
    occurredAt: "2026-07-11T12:00:00.000Z",
    policyVersion: mediaLifecyclePolicyVersion,
    previousStatus: "TEMPORARY",
  });
  assert.equal(JSON.stringify(auditMetadata).includes(storageKey), false);
});

test("invalid lifecycle transitions and policies are rejected safely", () => {
  const service = new MediaLifecycleService();

  assert.throws(
    () => service.computeRetentionDeadline({ retentionDurationMs: 0, startsAt: start }),
    (error) => error.code === "MEDIA_LIFECYCLE_INVALID_POLICY",
  );
  assert.throws(
    () => service.transition(metadata(), "EXPIRE_RETENTION", start),
    (error) => error.code === "MEDIA_LIFECYCLE_NOT_EXPIRED",
  );
  assert.throws(
    () => service.transition(metadata(), "MARK_METADATA_DELETED", evaluatedAt),
    (error) => error.code === "MEDIA_LIFECYCLE_INVALID_TRANSITION",
  );
  assert.throws(
    () =>
      service.transition(
        metadata({ deletedAt: evaluatedAt, retentionStatus: "DELETED" }),
        "REQUEST_DELETION",
        evaluatedAt,
      ),
    (error) => error.code === "MEDIA_LIFECYCLE_INVALID_TRANSITION",
  );
  let failure;
  try {
    service.transition(
      metadata({
        originalFilename: "LearnerA parent@example.test homework.png",
        retentionStatus: "DELETION_REQUESTED",
      }),
      "MARK_METADATA_DELETED",
      evaluatedAt,
    );
  } catch (error) {
    failure = error;
  }
  assert.equal(failure.code, "MEDIA_LIFECYCLE_INVALID_METADATA");
  const serializedFailure = JSON.stringify(failure);
  for (const unsafeValue of [storageKey, "LearnerA", "parent@example.test", "homework.png"]) {
    assert.equal(serializedFailure.includes(unsafeValue), false);
  }
});

test("cleanup selection requires requested or explicitly expired metadata state", () => {
  const service = new MediaLifecycleService();
  const selection = service.selectCleanupCandidates(
    [
      metadata({
        deletionRequestedAt: new Date("2026-07-11T06:00:00.000Z"),
        id: mediaAssetIdA,
        retentionStatus: "DELETION_REQUESTED",
      }),
      metadata({ id: mediaAssetIdB, retentionStatus: "RETENTION_EXPIRED" }),
      metadata({
        id: mediaAssetIdC,
        retentionUntil: new Date("2026-07-14T00:00:00.000Z"),
      }),
      metadata({ id: mediaAssetIdD }),
      metadata({
        deletedAt: new Date("2026-07-12T12:00:00.000Z"),
        id: mediaAssetIdE,
        retentionStatus: "DELETED",
      }),
      metadata({
        deletionRequestedAt: new Date("2026-07-14T00:00:00.000Z"),
        id: mediaAssetIdF,
        retentionStatus: "DELETION_REQUESTED",
      }),
      metadata({
        id: mediaAssetIdG,
        retentionStatus: "DELETION_REQUESTED",
      }),
    ],
    evaluatedAt,
  );

  assert.deepEqual(
    selection.candidates.map((candidate) => candidate.mediaAssetId),
    [mediaAssetIdA, mediaAssetIdB],
  );
  assert.deepEqual(
    selection.candidates.map((candidate) => candidate.eligibilityReason),
    ["DELETION_REQUESTED", "RETENTION_EXPIRED"],
  );
  assert.equal(
    selection.candidates.every((candidate) => candidate.metadataOnly),
    true,
  );
  assert.equal(
    selection.candidates.every(
      (candidate) => candidate.objectDeletionState === "NOT_PERFORMED_OR_VERIFIED",
    ),
    true,
  );
  assert.equal(selection.skippedInvalidCount, 1);
  assert.equal(
    selection.candidates.some((candidate) => candidate.mediaAssetId === mediaAssetIdE),
    false,
  );
  assertNoForbiddenFields(selection);
});

test("lifecycle diagnostics redact storage and identity secrets", () => {
  const redacted = JSON.stringify(
    redactMediaLifecycleDiagnostics({
      answer: "x = 2",
      authorizationHeader: "Bearer synthetic-auth-token",
      childNickname: "LearnerA",
      cookie: "session=synthetic-cookie",
      originalFilename: "LearnerA parent@example.test homework.png",
      providerPayload: "synthetic provider payload",
      rawMedia: "synthetic raw bytes",
      safe: "MEDIA_LIFECYCLE_INVALID_TRANSITION",
      secret: "synthetic-secret",
      storageKey,
      token: "synthetic-token",
    }),
  );

  for (const unsafeValue of [
    "x = 2",
    "synthetic-auth-token",
    "LearnerA",
    "synthetic-cookie",
    "parent@example.test",
    "synthetic provider payload",
    "synthetic raw bytes",
    "synthetic-secret",
    "families/",
    "synthetic-token",
  ]) {
    assert.equal(redacted.includes(unsafeValue), false);
  }
  assert.equal(redacted.includes("MEDIA_LIFECYCLE_INVALID_TRANSITION"), true);
});

test("Slice 12 remains internal and creates no route contract or schema expansion", () => {
  const moduleDir = path.join(process.cwd(), "src", "media-lifecycle");
  const moduleFiles = fs.readdirSync(moduleDir);
  assert.equal(
    moduleFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModule = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModule.includes("MediaLifecycleModule"), false);

  const openapi = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "..", "..", "packages", "contracts", "openapi.json"),
      "utf8",
    ),
  );
  const routePaths = Object.keys(openapi.paths ?? {});
  assert.equal(
    routePaths.some((routePath) => /cleanup|lifecycle/i.test(routePath)),
    false,
  );
  assert.deepEqual(routePaths.filter((routePath) => routePath.startsWith("/homework")).sort(), [
    "/homework/sessions",
    "/homework/sessions/{homeworkSessionId}",
    "/homework/sessions/{homeworkSessionId}/attempts",
    "/homework/sessions/{homeworkSessionId}/media-assets",
    "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}",
    "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/retention",
  ]);

  const migrations = fs
    .readdirSync(path.join(process.cwd(), "prisma", "migrations"))
    .filter((fileName) => fileName !== "migration_lock.toml");
  assert.deepEqual(migrations, [
    "20260708173051_initial_data_foundation",
    "20260708181231_auth_session_foundation",
    "20260710082038_homework_media_domain_foundation",
  ]);
  const schema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  assert.equal(schema.includes("model MediaLifecycle"), false);
  assert.equal(schema.includes("model MediaCleanup"), false);
});
