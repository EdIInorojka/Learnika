import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  MockOcrCandidateContractError,
  isMockOcrCandidateAvailable,
  parseMockOcrCandidateForm,
  parseMockOcrCandidateResponse,
} from "../lib/mock-ocr-candidate-contract.ts";

const mediaAssetId = "22222222-2222-4222-8222-222222222222";

function commonSummary(overrides = {}) {
  return {
    boundaryPolicyVersion: "ocr-boundary-v1",
    confidence: "HIGH",
    downstreamUseAllowed: false,
    learnerConfirmationRequired: true,
    mediaAssetId,
    metadataOnly: true,
    modelVersion: "local-mock-ocr-v1",
    objectExistence: "UNKNOWN_NOT_VERIFIED",
    orchestrationPolicyVersion: "mock-ocr-orchestration-v1",
    schemaVersion: "ocr-boundary-schema-v1",
    ...overrides,
  };
}

function candidateResponse(overrides = {}) {
  return {
    data: {
      candidate: commonSummary({
        candidates: [
          {
            candidateId: "synthetic-candidate-1",
            confidence: "HIGH",
            source: "MOCK_FIXTURE",
            text: "2x + 5 = 17",
            trust: "UNTRUSTED_OCR_CANDIDATE",
          },
        ],
        status: "CANDIDATE_REQUIRES_CONFIRMATION",
        ...overrides,
      }),
    },
  };
}

function safeMediaAsset(overrides = {}) {
  return {
    assetKind: "HOMEWORK_IMAGE",
    checksumPresent: true,
    createdAt: "2026-07-12T12:00:00.000Z",
    id: mediaAssetId,
    mimeType: "image/png",
    retentionStatus: "TEMPORARY",
    retentionUntil: "2026-07-14T12:00:00.000Z",
    sizeBytes: 4096,
    updatedAt: "2026-07-12T12:00:00.000Z",
    ...overrides,
  };
}

test("mock OCR response parser projects an untrusted confirmation-gated candidate", () => {
  const result = parseMockOcrCandidateResponse(candidateResponse(), mediaAssetId);
  assert.deepEqual(Object.keys(result).sort(), [
    "candidates",
    "confidence",
    "downstreamUseAllowed",
    "learnerConfirmationRequired",
    "status",
  ]);
  assert.equal(result.status, "CANDIDATE_REQUIRES_CONFIRMATION");
  assert.equal(result.learnerConfirmationRequired, true);
  assert.equal(result.downstreamUseAllowed, false);
  assert.deepEqual(result.candidates, [
    {
      confidence: "HIGH",
      text: "2x + 5 = 17",
      trust: "UNTRUSTED_OCR_CANDIDATE",
    },
  ]);
  assert.equal(JSON.stringify(result).includes(mediaAssetId), false);
  assert.equal(JSON.stringify(result).includes("modelVersion"), false);
  assert.equal(JSON.stringify(result).includes("candidateId"), false);
});

test("low-confidence and failure responses contain no candidate text", () => {
  const review = parseMockOcrCandidateResponse(
    {
      data: {
        candidate: commonSummary({
          confidence: "LOW",
          reason: "LOW_CONFIDENCE",
          status: "NEEDS_REVIEW",
        }),
      },
    },
    mediaAssetId,
  );
  assert.deepEqual(review, {
    confidence: "LOW",
    downstreamUseAllowed: false,
    learnerConfirmationRequired: true,
    status: "NEEDS_REVIEW",
  });

  const failure = parseMockOcrCandidateResponse(
    {
      data: {
        candidate: commonSummary({
          confidence: "UNKNOWN",
          reason: "PROVIDER_FAILURE",
          status: "FAILED",
        }),
      },
    },
    mediaAssetId,
  );
  assert.deepEqual(failure, {
    confidence: "UNKNOWN",
    downstreamUseAllowed: false,
    learnerConfirmationRequired: true,
    status: "FAILED",
  });
  assert.equal(JSON.stringify([review, failure]).includes("text"), false);
  assert.equal(JSON.stringify(failure).includes("PROVIDER_FAILURE"), false);
});

test("mock OCR parser rejects unsafe fields and broken trust gates", () => {
  for (const forbiddenField of [
    "storageKey",
    "originalFilename",
    "rawMedia",
    "base64",
    "answer",
    "solution",
    "hintText",
    "sttResult",
    "llmCompletion",
    "providerPayload",
  ]) {
    assert.throws(
      () =>
        parseMockOcrCandidateResponse(
          candidateResponse({ [forbiddenField]: "must-not-render" }),
          mediaAssetId,
        ),
      MockOcrCandidateContractError,
      forbiddenField,
    );
  }

  assert.throws(
    () =>
      parseMockOcrCandidateResponse(
        candidateResponse({ downstreamUseAllowed: true }),
        mediaAssetId,
      ),
    MockOcrCandidateContractError,
  );
  assert.throws(
    () =>
      parseMockOcrCandidateResponse(
        candidateResponse({ learnerConfirmationRequired: false }),
        mediaAssetId,
      ),
    MockOcrCandidateContractError,
  );
  assert.throws(
    () =>
      parseMockOcrCandidateResponse(
        {
          data: {
            candidate: commonSummary({
              candidates: candidateResponse().data.candidate.candidates,
              confidence: "LOW",
              reason: "LOW_CONFIDENCE",
              status: "NEEDS_REVIEW",
            }),
          },
        },
        mediaAssetId,
      ),
    MockOcrCandidateContractError,
  );
});

test("mock OCR form accepts only allowlisted scenarios", () => {
  for (const scenario of ["candidate", "review", "failure"]) {
    const formData = new globalThis.FormData();
    formData.set("scenario", scenario);
    assert.equal(parseMockOcrCandidateForm(formData), scenario);
  }

  const unexpected = new globalThis.FormData();
  unexpected.set("scenario", "candidate");
  unexpected.set("prompt", "must-not-submit");
  assert.throws(() => parseMockOcrCandidateForm(unexpected), MockOcrCandidateContractError);

  const duplicate = new globalThis.FormData();
  duplicate.append("scenario", "candidate");
  duplicate.append("scenario", "review");
  assert.throws(() => parseMockOcrCandidateForm(duplicate), MockOcrCandidateContractError);
});

test("mock OCR availability requires safe checksum-ready media metadata", () => {
  const now = Date.parse("2026-07-13T12:00:00.000Z");
  assert.equal(isMockOcrCandidateAvailable(safeMediaAsset(), now), true);
  assert.equal(isMockOcrCandidateAvailable(safeMediaAsset({ checksumPresent: false }), now), false);
  assert.equal(
    isMockOcrCandidateAvailable(safeMediaAsset({ retentionStatus: "DELETION_REQUESTED" }), now),
    false,
  );
  assert.equal(
    isMockOcrCandidateAvailable(
      safeMediaAsset({ retentionUntil: "2026-07-13T11:59:59.000Z" }),
      now,
    ),
    false,
  );
  assert.equal(isMockOcrCandidateAvailable(safeMediaAsset({ sizeBytes: 0 }), now), false);
});

test("mock OCR UI is protected ephemeral and limited to the approved route", () => {
  const homeworkDir = path.resolve(process.cwd(), "app", "homework");
  const detailDir = path.join(homeworkDir, "[homeworkSessionId]");
  const libDir = path.resolve(process.cwd(), "lib");
  const layout = fs.readFileSync(path.join(homeworkDir, "layout.tsx"), "utf8");
  const page = fs.readFileSync(path.join(detailDir, "page.tsx"), "utf8");
  const action = fs.readFileSync(path.join(detailDir, "mock-ocr-candidate-actions.ts"), "utf8");
  const panel = fs.readFileSync(path.join(detailDir, "mock-ocr-candidate-panel.tsx"), "utf8");
  const service = fs.readFileSync(
    path.join(libDir, "mock-ocr-candidate-service.server.ts"),
    "utf8",
  );
  const source = `${page}\n${action}\n${panel}\n${service}`;

  assert.equal(layout.includes("readAuthShellState()"), true);
  assert.equal(layout.includes("canViewHomework(authState.status)"), true);
  assert.equal(page.includes("isMockOcrCandidateAvailable(mediaAsset)"), true);
  assert.equal(page.includes("<MockOcrCandidatePanel"), true);
  assert.equal(panel.includes("useActionState"), true);
  assert.equal(panel.includes('result.status === "NEEDS_REVIEW"'), true);
  assert.equal(panel.includes('result.status === "FAILED"'), true);
  assert.equal(panel.includes("Непроверенный OCR-текст"), true);
  assert.equal(panel.includes("Требуется подтверждение ученика."), true);
  assert.equal(panel.includes("Передача текста дальше отключена."), true);
  assert.equal(
    service.includes(
      "`/homework/sessions/${sessionId}/media-assets/${assetId}/mock-ocr-candidate`",
    ),
    true,
  );
  assert.equal(service.includes('method: "POST"'), true);

  for (const forbidden of [
    "minio",
    "@aws-sdk",
    "S3Client",
    "/download",
    "signedUrl",
    "publicUrl",
    "storageKey",
    "originalFilename",
    "rawMedia",
    "base64",
    "/stt",
    "/llm",
    "/hints",
    "answer",
    "solution",
    "providerPayload",
    "localStorage",
    "sessionStorage",
    "console.",
    "prisma.",
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
});
