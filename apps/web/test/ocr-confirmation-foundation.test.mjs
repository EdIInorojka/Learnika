import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  canConfirmLocalOcrText,
  createLocalOcrConfirmationState,
  localOcrConfirmationMaxLength,
  localOcrConfirmationReducer,
} from "../lib/local-ocr-confirmation.ts";

test("candidate text starts untrusted and can be edited before local confirmation", () => {
  const initial = createLocalOcrConfirmationState("2x + 5 = 17");
  assert.deepEqual(initial, { confirmed: false, draftText: "2x + 5 = 17" });
  assert.equal(canConfirmLocalOcrText(initial), true);

  const edited = localOcrConfirmationReducer(initial, {
    text: "2x + 5 = 17, проверено учеником",
    type: "EDIT",
  });
  assert.deepEqual(edited, {
    confirmed: false,
    draftText: "2x + 5 = 17, проверено учеником",
  });

  const confirmed = localOcrConfirmationReducer(edited, { type: "CONFIRM" });
  assert.deepEqual(confirmed, {
    confirmed: true,
    draftText: "2x + 5 = 17, проверено учеником",
  });
  assert.equal(canConfirmLocalOcrText(confirmed), false);
});

test("editing or replacing candidate text clears local confirmation", () => {
  const confirmed = localOcrConfirmationReducer(createLocalOcrConfirmationState("x + 1 = 4"), {
    type: "CONFIRM",
  });
  assert.equal(confirmed.confirmed, true);

  const edited = localOcrConfirmationReducer(confirmed, { text: "x + 1 = 5", type: "EDIT" });
  assert.equal(edited.confirmed, false);

  const reset = localOcrConfirmationReducer(confirmed, {
    text: "3y = 12",
    type: "RESET",
  });
  assert.deepEqual(reset, { confirmed: false, draftText: "3y = 12" });
});

test("blank or oversized local drafts cannot bypass confirmation rules", () => {
  const blank = localOcrConfirmationReducer(createLocalOcrConfirmationState("x = 1"), {
    text: "   ",
    type: "EDIT",
  });
  assert.equal(canConfirmLocalOcrText(blank), false);
  assert.equal(localOcrConfirmationReducer(blank, { type: "CONFIRM" }).confirmed, false);

  const oversized = createLocalOcrConfirmationState("x".repeat(localOcrConfirmationMaxLength + 5));
  assert.equal(oversized.draftText.length, localOcrConfirmationMaxLength);
  assert.equal(oversized.confirmed, false);
});

test("confirmation editor is local-only and absent from review or failure states", () => {
  const detailDir = path.resolve(process.cwd(), "app", "homework", "[homeworkSessionId]");
  const libDir = path.resolve(process.cwd(), "lib");
  const panel = fs.readFileSync(path.join(detailDir, "mock-ocr-candidate-panel.tsx"), "utf8");
  const editor = fs.readFileSync(
    path.join(detailDir, "learner-ocr-confirmation-editor.tsx"),
    "utf8",
  );
  const localState = fs.readFileSync(path.join(libDir, "local-ocr-confirmation.ts"), "utf8");
  const localSource = `${editor}\n${localState}`;

  assert.equal(editor.includes("Непроверенный OCR-текст"), true);
  assert.equal(editor.includes("<textarea"), true);
  assert.equal(editor.includes("candidate.text"), true);
  assert.equal(editor.includes('type="button"'), true);
  assert.equal(editor.includes("Подтвердить локально"), true);
  assert.equal(editor.includes("Подтверждение действует только на этой странице"), true);
  assert.equal(editor.includes("не сохраняются в Learnika"), true);

  const reviewBranch = panel.indexOf('result.status === "NEEDS_REVIEW"');
  const failureBranch = panel.indexOf('result.status === "FAILED"');
  const editorRender = panel.indexOf("<LearnerOcrConfirmationEditor");
  assert.equal(reviewBranch >= 0 && reviewBranch < editorRender, true);
  assert.equal(failureBranch >= 0 && failureBranch < editorRender, true);

  for (const forbidden of [
    "<form",
    "action=",
    "fetch(",
    "authenticatedApiRequest",
    "/homework/",
    "localStorage",
    "sessionStorage",
    "minio",
    "@aws-sdk",
    "S3Client",
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
    "console.",
  ]) {
    assert.equal(localSource.includes(forbidden), false, forbidden);
  }
});
