import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  MediaAssetContractError,
  parseCreateMediaAssetForm,
  parseMediaAssetResponse,
  parseMediaAssetsResponse,
} from "../lib/media-asset-contract.ts";

const homeworkSessionId = "11111111-1111-4111-8111-111111111111";
const mediaAssetId = "22222222-2222-4222-8222-222222222222";
const checksumSha256 = "a".repeat(64);
const storageKey =
  "families/33333333-3333-4333-8333-333333333333/children/44444444-4444-4444-8444-444444444444/media/homework-image/22222222-2222-4222-8222-222222222222.png";

function mediaAssetFixture(overrides = {}) {
  return {
    assetKind: "HOMEWORK_IMAGE",
    checksumSha256,
    childProfileId: "44444444-4444-4444-8444-444444444444",
    createdAt: "2026-07-12T12:00:00.000Z",
    createdByUserId: "55555555-5555-4555-8555-555555555555",
    deletedAt: null,
    deletionRequestedAt: null,
    familyId: "33333333-3333-4333-8333-333333333333",
    homeworkSessionId,
    id: mediaAssetId,
    mimeType: "image/png",
    retentionStatus: "TEMPORARY",
    retentionUntil: "2026-07-13T12:00:00.000Z",
    sizeBytes: 4096,
    storageKey,
    updatedAt: "2026-07-12T12:00:00.000Z",
    ...overrides,
  };
}

test("media response parsers project only display-safe metadata", () => {
  const mediaAsset = parseMediaAssetResponse({ data: { mediaAsset: mediaAssetFixture() } });
  assert.deepEqual(Object.keys(mediaAsset).sort(), [
    "assetKind",
    "checksumPresent",
    "createdAt",
    "id",
    "mimeType",
    "retentionStatus",
    "retentionUntil",
    "sizeBytes",
    "updatedAt",
  ]);
  assert.equal(mediaAsset.checksumPresent, true);
  assert.equal(Object.hasOwn(mediaAsset, "storageKey"), false);
  assert.equal(Object.hasOwn(mediaAsset, "checksumSha256"), false);
  assert.equal(Object.hasOwn(mediaAsset, "familyId"), false);
  assert.equal(Object.hasOwn(mediaAsset, "childProfileId"), false);
  assert.equal(JSON.stringify(mediaAsset).includes(storageKey), false);
  assert.equal(JSON.stringify(mediaAsset).includes(checksumSha256), false);

  const mediaAssets = parseMediaAssetsResponse({
    data: { mediaAssets: [mediaAssetFixture(), mediaAssetFixture({ checksumSha256: null })] },
  });
  assert.equal(mediaAssets.length, 2);
  assert.equal(mediaAssets[1].checksumPresent, false);
});

test("media response parsers reject unsafe content and provider fields", () => {
  for (const forbiddenField of [
    "rawMedia",
    "base64",
    "originalFilename",
    "answer",
    "solution",
    "hintText",
    "ocrResult",
    "sttResult",
    "llmCompletion",
    "providerPayload",
  ]) {
    assert.throws(
      () =>
        parseMediaAssetResponse({
          data: { mediaAsset: mediaAssetFixture({ [forbiddenField]: "must-not-render" }) },
        }),
      MediaAssetContractError,
      forbiddenField,
    );
  }
});

function safeCreateForm() {
  const formData = new globalThis.FormData();
  formData.set("assetKind", "HOMEWORK_IMAGE");
  formData.set("checksumSha256", checksumSha256.toUpperCase());
  formData.set("mimeType", "image/png");
  formData.set("sizeBytes", "4096");
  return formData;
}

test("media create form accepts only approved metadata fields", () => {
  assert.deepEqual(parseCreateMediaAssetForm(safeCreateForm()), {
    assetKind: "HOMEWORK_IMAGE",
    checksumSha256,
    mimeType: "image/png",
    sizeBytes: 4096,
  });

  for (const forbiddenField of [
    "file",
    "rawMedia",
    "base64",
    "originalFilename",
    "storageKey",
    "answer",
    "hintText",
    "providerPayload",
  ]) {
    const unsafe = safeCreateForm();
    unsafe.set(forbiddenField, "must-not-submit");
    assert.throws(() => parseCreateMediaAssetForm(unsafe), MediaAssetContractError);
  }

  const mismatched = safeCreateForm();
  mismatched.set("assetKind", "HOMEWORK_PDF");
  assert.throws(() => parseCreateMediaAssetForm(mismatched), MediaAssetContractError);
});

test("media metadata UI remains protected and excludes transfer/provider scope", () => {
  const appDir = path.resolve(process.cwd(), "app", "homework");
  const detailDir = path.join(appDir, "[homeworkSessionId]");
  const libDir = path.resolve(process.cwd(), "lib");
  const layout = fs.readFileSync(path.join(appDir, "layout.tsx"), "utf8");
  const detailPage = fs.readFileSync(path.join(detailDir, "page.tsx"), "utf8");
  const action = fs.readFileSync(path.join(detailDir, "media-asset-actions.ts"), "utf8");
  const service = fs.readFileSync(path.join(libDir, "media-asset-service.server.ts"), "utf8");
  const renderedOrSubmitted = `${detailPage}\n${action}`;

  assert.equal(layout.includes("readAuthShellState()"), true);
  assert.equal(layout.includes("canViewHomework(authState.status)"), true);
  assert.equal(service.includes("`/homework/sessions/${sessionId}/media-assets`"), true);
  for (const forbiddenRoute of [
    "/upload",
    "/download",
    "/retention",
    "/mock-ocr",
    "/stt",
    "/llm",
  ]) {
    assert.equal(service.includes(forbiddenRoute), false, forbiddenRoute);
  }
  for (const forbiddenMarkup of [
    'type="file"',
    "multipart/form-data",
    "enctype=",
    "storageKey",
    "originalFilename",
    "rawMedia",
    "base64",
    "providerPayload",
    "llmPrompt",
    "ocrResult",
    "sttResult",
  ]) {
    assert.equal(renderedOrSubmitted.includes(forbiddenMarkup), false, forbiddenMarkup);
  }
  assert.equal(action.includes("formData: FormData"), true);
  assert.equal(action.includes("parseCreateMediaAssetForm(formData)"), true);
  assert.equal(detailPage.includes(".bind(null, homeworkSessionId)"), true);
  assert.equal(renderedOrSubmitted.includes("localStorage"), false);
  assert.equal(renderedOrSubmitted.includes("sessionStorage"), false);
  assert.equal(renderedOrSubmitted.includes("console."), false);
});
