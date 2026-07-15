import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import { readDiagnosticReviewCoverage } from "../scripts/validate-diagnostic-review-coverage.mjs";
import {
  readDiagnosticReviewEvidence,
  validateDiagnosticReviewEvidence,
  validateReviewEvidenceChangedPaths,
} from "../scripts/validate-diagnostic-review-evidence.mjs";

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
  "ocrOutput",
  "sttOutput",
  "textbookContent",
  "copiedText",
  "studentName",
  "childName",
  "email",
  "reviewerName",
  "reviewerEmail",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [evidence, coverage] = await Promise.all([
    readDiagnosticReviewEvidence(),
    readDiagnosticReviewCoverage(),
  ]);
  return { evidence, coverage };
}

test("review evidence placeholder is valid with zero decisions and remains NOT_READY", async () => {
  const { evidence, coverage } = await readArtifacts();
  const summary = validateDiagnosticReviewEvidence(evidence, coverage);

  assert.deepEqual(summary, {
    evidenceArtifactVersion: "wave-4.slice-3.grade-7-9-math.v1",
    reviewCoverageArtifactVersion: "wave-4.slice-2.grade-7-9-math.v1",
    blueprintSlotCount: 11,
    gatePlaceholderCount: 66,
    evidenceRecordCount: 0,
    approvedDecisionCount: 0,
    productionApprovalCount: 0,
    readiness: "NOT_READY",
  });
});

test("review evidence validator requires every coverage slot exactly once", async () => {
  const { evidence, coverage } = await readArtifacts();

  const duplicate = clone(evidence);
  duplicate.slots[1].blueprintSlotId = duplicate.slots[0].blueprintSlotId;
  assert.throws(
    () => validateDiagnosticReviewEvidence(duplicate, coverage),
    /Duplicate blueprint slot/,
  );

  const missing = clone(evidence);
  missing.slots.pop();
  assert.throws(
    () => validateDiagnosticReviewEvidence(missing, coverage),
    /all 11 review coverage slots exactly once/,
  );
});

test("review evidence validator rejects unknown coverage slots", async () => {
  const { evidence, coverage } = await readArtifacts();
  evidence.slots[0].blueprintSlotId = "diag.math.g7-9.number.unknown.v1";

  assert.throws(
    () => validateDiagnosticReviewEvidence(evidence, coverage),
    /unknown review coverage slot/,
  );
});

test("slot coverage status must match the pinned Slice 2 artifact", async () => {
  const { evidence, coverage } = await readArtifacts();
  evidence.slots[0].coverageStatus = "GAP_CONFIRMED";

  assert.throws(
    () => validateDiagnosticReviewEvidence(evidence, coverage),
    /coverageStatus must match the Slice 2 coverage artifact/,
  );
});

test("all six gate placeholders and matching policy pins are required", async () => {
  const { evidence, coverage } = await readArtifacts();

  const missingGate = clone(evidence);
  delete missingGate.slots[0].gateEvidencePlaceholders.methodology;
  assert.throws(
    () => validateDiagnosticReviewEvidence(missingGate, coverage),
    /gateEvidencePlaceholders.methodology is required/,
  );

  const mismatchedPin = clone(evidence);
  mismatchedPin.slots[0].gateEvidencePlaceholders.methodology.policyVersion = "wave-4.invalid.v1";
  assert.throws(
    () => validateDiagnosticReviewEvidence(mismatchedPin, coverage),
    /must match the Slice 2 coverage policy pin/,
  );
});

test("candidate digests remain pending placeholders only", async () => {
  const { evidence, coverage } = await readArtifacts();

  const populatedDigest = clone(evidence);
  populatedDigest.slots[0].candidateDigest.value = "sha256:unreviewed";
  assert.throws(
    () => validateDiagnosticReviewEvidence(populatedDigest, coverage),
    /must remain an unpopulated immutable-candidate digest placeholder/,
  );

  const gateDigest = clone(evidence);
  gateDigest.slots[0].gateEvidencePlaceholders.methodology.candidateDigest = "sha256:unreviewed";
  assert.throws(
    () => validateDiagnosticReviewEvidence(gateDigest, coverage),
    /candidateDigest must remain pending/,
  );
});

test("reviewer and audit identity remain explicitly deferred", async () => {
  const { evidence, coverage } = await readArtifacts();

  const reviewerPolicy = clone(evidence);
  reviewerPolicy.identityPolicyDeferrals.reviewerIdentity.referenceFormat = "user-id";
  assert.throws(
    () => validateDiagnosticReviewEvidence(reviewerPolicy, coverage),
    /reviewerIdentity must remain explicitly DEFERRED and unresolved/,
  );

  const auditPolicy = clone(evidence);
  auditPolicy.identityPolicyDeferrals.auditIdentity.policyVersion = "audit-policy-v1";
  assert.throws(
    () => validateDiagnosticReviewEvidence(auditPolicy, coverage),
    /auditIdentity must remain explicitly DEFERRED and unresolved/,
  );
});

test("placeholder cannot claim evidence decisions or production approval", async () => {
  const { evidence, coverage } = await readArtifacts();

  const recordedEvidence = clone(evidence);
  recordedEvidence.evidenceRecords.push({ evidenceRecordId: "review-evidence-1" });
  assert.throws(
    () => validateDiagnosticReviewEvidence(recordedEvidence, coverage),
    /evidenceRecords must remain empty/,
  );

  const gateDecision = clone(evidence);
  gateDecision.slots[0].gateEvidencePlaceholders.methodology.decisionStatus = "APPROVED";
  assert.throws(
    () => validateDiagnosticReviewEvidence(gateDecision, coverage),
    /unrecorded placeholder with no decision/,
  );

  const productionApproval = clone(evidence);
  productionApproval.aggregate.productionApprovalCount = 1;
  assert.throws(
    () => validateDiagnosticReviewEvidence(productionApproval, coverage),
    /zero evidence records, approved decisions and approvals/,
  );
});

test("gate placeholders cannot claim evidence identity or timestamps", async () => {
  const { evidence, coverage } = await readArtifacts();

  for (const field of ["evidenceRef", "reviewerIdentityRef", "auditIdentityRef", "decidedAt"]) {
    const claimed = clone(evidence);
    claimed.slots[0].gateEvidencePlaceholders.methodology[field] = "claimed";
    assert.throws(
      () => validateDiagnosticReviewEvidence(claimed, coverage),
      /must not claim evidence, identity or a reviewer decision/,
      field,
    );
  }
});

test("readiness remains NOT_READY with both Wave 3 blockers", async () => {
  const { evidence, coverage } = await readArtifacts();

  const ready = clone(evidence);
  ready.readiness.status = "READY";
  assert.throws(
    () => validateDiagnosticReviewEvidence(ready, coverage),
    /readiness.status must remain NOT_READY/,
  );

  const missingBlocker = clone(evidence);
  missingBlocker.readiness.blockingReasons = ["INCOMPLETE_COVERAGE"];
  assert.throws(
    () => validateDiagnosticReviewEvidence(missingBlocker, coverage),
    /two current Wave 3 blockers/,
  );
});

test("review evidence validator rejects every forbidden field term", async () => {
  const { evidence, coverage } = await readArtifacts();

  for (const forbiddenField of forbiddenFields) {
    const unsafeEvidence = clone(evidence);
    unsafeEvidence.slots[0][forbiddenField] = "blocked";
    assert.throws(
      () => validateDiagnosticReviewEvidence(unsafeEvidence, coverage),
      /forbidden field term/,
      forbiddenField,
    );
  }
});

test("Slice 3 worktree scope permits only the seven exact static files", () => {
  const approvedPaths = [
    "docs/wave-4/diagnostic-review-evidence-contract.md",
    "docs/wave-4/slice-3-implementation-note.md",
    "packages/curriculum/diagnostic-review-evidence/grade-7-9-math.review-evidence.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
    "packages/curriculum/test/diagnostic-review-evidence.test.mjs",
    "package.json",
  ];
  assert.deepEqual(validateReviewEvidenceChangedPaths(approvedPaths), approvedPaths);

  const forbiddenPaths = [
    "apps/api/src/diagnostic-review/evidence.controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "pnpm-lock.yaml",
    "packages/curriculum/src/diagnostic-review-evidence.ts",
  ];
  for (const forbiddenPath of forbiddenPaths) {
    assert.throws(
      () => validateReviewEvidenceChangedPaths([forbiddenPath]),
      /Wave 4 Slice 3 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("review scope guards contain no broad API allowlist", async () => {
  const sources = await Promise.all([
    readFile(
      new URL("../scripts/validate-diagnostic-review-evidence.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-review-coverage.mjs", import.meta.url),
      "utf8",
    ),
  ]);

  for (const source of sources) {
    assert.doesNotMatch(source, /["']apps\/api\/["']/);
  }
});
