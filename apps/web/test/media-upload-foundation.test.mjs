import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { afterEach, test } from "node:test";

import { apiMultipartRequest } from "../lib/api-client.server.ts";
import {
  MediaUploadContractError,
  buildSafeMediaUploadBody,
  isMediaAssetUploadAvailable,
  parseMediaUploadForm,
} from "../lib/media-upload-contract.ts";

const originalFetch = globalThis.fetch;
const originalApiBaseUrl = process.env.LEARNIKA_API_BASE_URL;
const homeworkSessionId = "11111111-1111-4111-8111-111111111111";
const mediaAssetId = "22222222-2222-4222-8222-222222222222";

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiBaseUrl === undefined) {
    delete process.env.LEARNIKA_API_BASE_URL;
  } else {
    process.env.LEARNIKA_API_BASE_URL = originalApiBaseUrl;
  }
});

function pngFile() {
  return new globalThis.File([new Uint8Array([137, 80, 78, 71])], "private-child-name.png", {
    type: "image/png",
  });
}

function safeMediaAsset(overrides = {}) {
  return {
    assetKind: "HOMEWORK_IMAGE",
    checksumPresent: false,
    createdAt: "2026-07-12T12:00:00.000Z",
    id: mediaAssetId,
    mimeType: "image/png",
    retentionStatus: "TEMPORARY",
    retentionUntil: "2026-07-13T12:00:00.000Z",
    sizeBytes: 4,
    updatedAt: "2026-07-12T12:00:00.000Z",
    ...overrides,
  };
}

test("upload form accepts one exact metadata-matching file", () => {
  const formData = new globalThis.FormData();
  const file = pngFile();
  formData.set("file", file);
  assert.equal(parseMediaUploadForm(formData, "image/png", 4), file);

  const outbound = buildSafeMediaUploadBody(file);
  const outboundFile = outbound.get("file");
  assert.equal(outboundFile instanceof globalThis.File, true);
  assert.equal(outboundFile.name, "upload.bin");
  assert.equal(outboundFile.type, "image/png");
  assert.equal(outboundFile.size, 4);
});

test("upload form rejects missing duplicate unsupported and mismatched fields", () => {
  assert.throws(
    () => parseMediaUploadForm(new globalThis.FormData(), "image/png", 4),
    MediaUploadContractError,
  );

  const unsupported = new globalThis.FormData();
  unsupported.set("file", pngFile());
  unsupported.set("originalFilename", "must-not-forward.png");
  assert.throws(() => parseMediaUploadForm(unsupported, "image/png", 4), MediaUploadContractError);

  const duplicate = new globalThis.FormData();
  duplicate.append("file", pngFile());
  duplicate.append("file", pngFile());
  assert.throws(() => parseMediaUploadForm(duplicate, "image/png", 4), MediaUploadContractError);

  const mismatch = new globalThis.FormData();
  mismatch.set("file", pngFile());
  assert.throws(
    () => parseMediaUploadForm(mismatch, "application/pdf", 4),
    MediaUploadContractError,
  );
  assert.throws(() => parseMediaUploadForm(mismatch, "image/png", 5), MediaUploadContractError);
});

test("upload availability requires safe supported metadata", () => {
  const now = Date.parse("2026-07-12T13:00:00.000Z");
  assert.equal(isMediaAssetUploadAvailable(safeMediaAsset(), now), true);
  assert.equal(
    isMediaAssetUploadAvailable(safeMediaAsset({ retentionStatus: "DELETION_REQUESTED" }), now),
    false,
  );
  assert.equal(
    isMediaAssetUploadAvailable(
      safeMediaAsset({ retentionUntil: "2026-07-12T12:30:00.000Z" }),
      now,
    ),
    false,
  );
  assert.equal(isMediaAssetUploadAvailable(safeMediaAsset({ sizeBytes: 0 }), now), false);
});

test("multipart API request keeps auth server-side and lets fetch set the boundary", async () => {
  process.env.LEARNIKA_API_BASE_URL = "http://127.0.0.1:3001";
  const multipartBody = buildSafeMediaUploadBody(pngFile());
  let capturedInit;
  globalThis.fetch = async (_url, init) => {
    capturedInit = init;
    return new Response(JSON.stringify({ data: { accepted: true } }), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  };

  const result = await apiMultipartRequest(
    `/homework/sessions/${homeworkSessionId}/media-assets/${mediaAssetId}/upload`,
    multipartBody,
    "synthetic-access-token",
  );
  const headers = new globalThis.Headers(capturedInit.headers);
  assert.deepEqual(result, { data: { accepted: true } });
  assert.equal(capturedInit.body, multipartBody);
  assert.equal(capturedInit.method, "POST");
  assert.equal(headers.get("authorization"), "Bearer synthetic-access-token");
  assert.equal(headers.get("content-type"), null);
});

test("upload UI uses only the approved route and excludes forbidden scope", () => {
  const homeworkDir = path.resolve(process.cwd(), "app", "homework");
  const detailDir = path.join(homeworkDir, "[homeworkSessionId]");
  const libDir = path.resolve(process.cwd(), "lib");
  const layout = fs.readFileSync(path.join(homeworkDir, "layout.tsx"), "utf8");
  const page = fs.readFileSync(path.join(detailDir, "page.tsx"), "utf8");
  const action = fs.readFileSync(path.join(detailDir, "media-upload-actions.ts"), "utf8");
  const service = fs.readFileSync(path.join(libDir, "media-upload-service.server.ts"), "utf8");
  const nextConfig = fs.readFileSync(path.resolve(process.cwd(), "next.config.ts"), "utf8");
  const source = `${page}\n${action}\n${service}`;

  assert.equal(layout.includes("readAuthShellState()"), true);
  assert.equal(page.includes("isMediaAssetUploadAvailable(mediaAsset)"), true);
  assert.equal(page.includes('type="file"'), true);
  assert.equal(page.includes('name="file"'), true);
  assert.equal(page.includes("uploadMediaAssetAction.bind("), true);
  assert.equal(nextConfig.includes('bodySizeLimit: "11mb"'), true);
  assert.equal(
    service.includes("`/homework/sessions/${sessionId}/media-assets/${assetId}/upload`"),
    true,
  );
  assert.equal(`${action}\n${service}`.includes("mock-ocr"), false);
  for (const forbidden of [
    "minio",
    "/download",
    "signedUrl",
    "publicUrl",
    "/stt",
    "/llm",
    "/hints",
    "answer",
    "solution",
    "providerPayload",
    "storageKey",
    "originalFilename",
    "rawMedia",
    "base64",
    "file.name",
    "localStorage",
    "sessionStorage",
    "console.",
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
});
