import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import { readDiagnosticBlueprint } from "../scripts/validate-diagnostic-blueprint.mjs";
import { readDiagnosticItemFixtures } from "../scripts/validate-diagnostic-items.mjs";
import {
  readDiagnosticReviewCoverage,
  validateDiagnosticReviewCoverage,
  validateReviewCoverageChangedPaths,
  validateReviewCoverageWorktreeScope,
} from "../scripts/validate-diagnostic-review-coverage.mjs";

const forbiddenFields = [
  "finalAnswer",
  "correctAnswer",
  "workedSolution",
  "solution",
  "hint",
  "scoringKey",
  "isCorrect",
  "score",
  "mastery",
  "proficiency",
  "providerPayload",
  "llmPrompt",
  "llmCompletion",
  "textbookContent",
  "copiedText",
  "studentName",
  "childName",
  "email",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [coverage, blueprint, fixtures] = await Promise.all([
    readDiagnosticReviewCoverage(),
    readDiagnosticBlueprint(),
    readDiagnosticItemFixtures(),
  ]);
  return { coverage, blueprint, fixtures };
}

test("review coverage baseline is structurally valid and remains NOT_READY", async () => {
  const { coverage, blueprint, fixtures } = await readArtifacts();
  const summary = validateDiagnosticReviewCoverage(coverage, blueprint, fixtures);

  assert.deepEqual(summary, {
    coverageArtifactVersion: "wave-4.slice-2.grade-7-9-math.v1",
    blueprintSlotCount: 11,
    draftOnlyCount: 5,
    gapCount: 6,
    productionApprovedCount: 0,
    readiness: "NOT_READY",
  });
});

test("review coverage validator requires every blueprint slot exactly once", async () => {
  const { coverage, blueprint, fixtures } = await readArtifacts();

  const duplicate = clone(coverage);
  duplicate.slots[1].blueprintSlotId = duplicate.slots[0].blueprintSlotId;
  assert.throws(
    () => validateDiagnosticReviewCoverage(duplicate, blueprint, fixtures),
    /Duplicate blueprint slot/,
  );

  const missing = clone(coverage);
  missing.slots.pop();
  assert.throws(
    () => validateDiagnosticReviewCoverage(missing, blueprint, fixtures),
    /all 11 blueprint slots exactly once/,
  );
});

test("review coverage validator rejects unknown blueprint slots", async () => {
  const { coverage, blueprint, fixtures } = await readArtifacts();
  coverage.slots[0].blueprintSlotId = "diag.math.g7-9.number.unknown.v1";

  assert.throws(
    () => validateDiagnosticReviewCoverage(coverage, blueprint, fixtures),
    /unknown blueprint slot/,
  );
});

test("draft-only coverage references only matching existing fixtures", async () => {
  const { coverage, blueprint, fixtures } = await readArtifacts();

  const unknown = clone(coverage);
  unknown.slots[0].candidateFixtureIds = ["ditem.math.number.unknown.fixture-01.v1"];
  assert.throws(
    () => validateDiagnosticReviewCoverage(unknown, blueprint, fixtures),
    /unknown fixture/,
  );

  const duplicate = clone(coverage);
  duplicate.slots[1].coverageStatus = "DRAFT_ONLY";
  duplicate.slots[1].candidateFixtureIds = duplicate.slots[0].candidateFixtureIds;
  assert.throws(
    () => validateDiagnosticReviewCoverage(duplicate, blueprint, fixtures),
    /assigned to another blueprint slot/,
  );
});

test("confirmed gaps cannot pretend to have candidate content", async () => {
  const { coverage, blueprint, fixtures } = await readArtifacts();
  const gap = coverage.slots.find((slot) => slot.coverageStatus === "GAP_CONFIRMED");
  gap.candidateFixtureIds = [fixtures.items[0].id];

  assert.throws(
    () => validateDiagnosticReviewCoverage(coverage, blueprint, fixtures),
    /confirmed gap and cannot reference candidate fixtures/,
  );
});

test("all six review gates and policy pins are required for every slot", async () => {
  const { coverage, blueprint, fixtures } = await readArtifacts();

  const missingGate = clone(coverage);
  delete missingGate.slots[0].reviewGates.methodology;
  assert.throws(
    () => validateDiagnosticReviewCoverage(missingGate, blueprint, fixtures),
    /reviewGates.methodology is required/,
  );

  const mismatchedPin = clone(coverage);
  mismatchedPin.slots[0].reviewGates.methodology.policyVersion = "wave-4.invalid.v1";
  assert.throws(
    () => validateDiagnosticReviewCoverage(mismatchedPin, blueprint, fixtures),
    /must match its top-level policy pin/,
  );
});

test("candidate digest placeholders cannot claim immutable review evidence", async () => {
  const { coverage, blueprint, fixtures } = await readArtifacts();

  const populatedDigest = clone(coverage);
  populatedDigest.slots[0].candidateDigest.value = "sha256:unreviewed";
  assert.throws(
    () => validateDiagnosticReviewCoverage(populatedDigest, blueprint, fixtures),
    /must remain an unpopulated immutable-candidate digest placeholder/,
  );

  const claimedEvidence = clone(coverage);
  claimedEvidence.slots[0].reviewGates.methodology.reviewerRole = "methodology_reviewer";
  assert.throws(
    () => validateDiagnosticReviewCoverage(claimedEvidence, blueprint, fixtures),
    /must not claim review evidence or a reviewer decision/,
  );
});

test("no slot can claim production approval", async () => {
  const { coverage, blueprint, fixtures } = await readArtifacts();

  const approvedGate = clone(coverage);
  approvedGate.slots[0].reviewGates.production_approval.status = "APPROVED";
  assert.throws(
    () => validateDiagnosticReviewCoverage(approvedGate, blueprint, fixtures),
    /production_approval.status must remain NOT_ELIGIBLE/,
  );

  const approvedCoverage = clone(coverage);
  approvedCoverage.slots[0].coverageStatus = "PRODUCTION_APPROVED";
  assert.throws(
    () => validateDiagnosticReviewCoverage(approvedCoverage, blueprint, fixtures),
    /cannot claim production approval/,
  );
});

test("aggregate counts remain exactly five drafts six gaps and zero approvals", async () => {
  const { coverage, blueprint, fixtures } = await readArtifacts();
  coverage.aggregate.statusCounts.DRAFT_ONLY = 4;

  assert.throws(
    () => validateDiagnosticReviewCoverage(coverage, blueprint, fixtures),
    /statusCounts must remain 5 DRAFT_ONLY, 6 GAP_CONFIRMED and 0 approved/,
  );
});

test("readiness remains NOT_READY with both Wave 3 blockers", async () => {
  const { coverage, blueprint, fixtures } = await readArtifacts();

  const ready = clone(coverage);
  ready.readiness.status = "READY";
  assert.throws(
    () => validateDiagnosticReviewCoverage(ready, blueprint, fixtures),
    /readiness.status must remain NOT_READY/,
  );

  const missingBlocker = clone(coverage);
  missingBlocker.readiness.blockingReasons = ["INCOMPLETE_COVERAGE"];
  assert.throws(
    () => validateDiagnosticReviewCoverage(missingBlocker, blueprint, fixtures),
    /two current Wave 3 blockers/,
  );
});

test("review coverage validator rejects every forbidden field term", async () => {
  const { coverage, blueprint, fixtures } = await readArtifacts();

  for (const forbiddenField of forbiddenFields) {
    const unsafeCoverage = clone(coverage);
    unsafeCoverage.slots[0][forbiddenField] = "blocked";
    assert.throws(
      () => validateDiagnosticReviewCoverage(unsafeCoverage, blueprint, fixtures),
      /forbidden field term/,
      forbiddenField,
    );
  }
});

test("Slice 2 worktree scope permits only the five exact static files", () => {
  const approvedPaths = [
    "docs/wave-4/slice-2-implementation-note.md",
    "packages/curriculum/diagnostic-review-coverage/grade-7-9-math.review-coverage.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
    "packages/curriculum/test/diagnostic-review-coverage.test.mjs",
    "package.json",
  ];
  assert.deepEqual(validateReviewCoverageChangedPaths(approvedPaths), approvedPaths);

  const forbiddenPaths = [
    "apps/api/src/diagnostic-review/controller.ts",
    "apps/web/app/diagnostic/page.tsx",
    "packages/contracts/openapi.json",
    "prisma/schema.prisma",
    "pnpm-lock.yaml",
  ];
  for (const forbiddenPath of forbiddenPaths) {
    assert.throws(
      () => validateReviewCoverageChangedPaths([forbiddenPath]),
      /Wave 4 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("current worktree is exact-path guarded without a broad API allowlist", async () => {
  const changedPaths = validateReviewCoverageWorktreeScope();
  assert.equal(changedPaths.length, 5);

  const validatorSource = await readFile(
    new URL("../scripts/validate-diagnostic-review-coverage.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(validatorSource, /["']apps\/api\/["']/);
});
