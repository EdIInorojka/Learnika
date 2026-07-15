import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticCandidateDigestRegistry,
  validateCandidateDigestChangedPaths,
  validateDiagnosticCandidateDigestRegistry,
} from "../scripts/validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticReviewCoverage } from "../scripts/validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "../scripts/validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "../scripts/validate-diagnostic-review-gate-rubric.mjs";

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
  "reviewerEmail",
  "reviewerName",
  "immutableDigest",
  "sha256",
  "contentHash",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [registry, coverage, evidence, rubric] = await Promise.all([
    readDiagnosticCandidateDigestRegistry(),
    readDiagnosticReviewCoverage(),
    readDiagnosticReviewEvidence(),
    readDiagnosticReviewGateRubric(),
  ]);
  return { registry, coverage, evidence, rubric };
}

test("candidate digest registry is valid with placeholders only", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();
  const summary = validateDiagnosticCandidateDigestRegistry(registry, coverage, evidence, rubric);

  assert.deepEqual(summary, {
    registryArtifactVersion: "wave-4.slice-5.grade-7-9-math.v1",
    reviewCoverageArtifactVersion: "wave-4.slice-2.grade-7-9-math.v1",
    reviewEvidenceArtifactVersion: "wave-4.slice-3.grade-7-9-math.v1",
    reviewGateRubricArtifactVersion: "wave-4.slice-4.grade-7-9-math.v1",
    blueprintSlotReferenceCount: 11,
    candidatePlaceholderCount: 11,
    assignedCandidateIdentityCount: 0,
    digestValueCount: 0,
    reviewEvidenceRecordCount: 0,
    reviewDecisionCount: 0,
    productionApprovedCandidateCount: 0,
    readiness: "NOT_READY",
  });
});

test("registry pins the exact coverage evidence and rubric versions", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();
  const mutations = [
    ["reviewCoverageArtifactVersion", "wave-4.invalid-coverage.v1"],
    ["reviewEvidenceArtifactVersion", "wave-4.invalid-evidence.v1"],
    ["reviewGateRubricArtifactVersion", "wave-4.invalid-rubric.v1"],
  ];

  for (const [field, value] of mutations) {
    const invalid = clone(registry);
    invalid.metadata[field] = value;
    assert.throws(
      () => validateDiagnosticCandidateDigestRegistry(invalid, coverage, evidence, rubric),
      /metadata\..* must be/,
      field,
    );
  }
});

test("registry represents every known coverage slot exactly once", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();

  const missing = clone(registry);
  missing.candidatePlaceholders.pop();
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(missing, coverage, evidence, rubric),
    /all 11 coverage slots exactly once/,
  );

  const unknown = clone(registry);
  unknown.candidatePlaceholders[0].blueprintReference.blueprintSlotId =
    "diag.math.g7-9.unknown.slot.v1";
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(unknown, coverage, evidence, rubric),
    /unknown blueprint slot/,
  );

  const duplicate = clone(registry);
  duplicate.candidatePlaceholders[1].blueprintReference.blueprintSlotId =
    duplicate.candidatePlaceholders[0].blueprintReference.blueprintSlotId;
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(duplicate, coverage, evidence, rubric),
    /Duplicate blueprint slot/,
  );
});

test("candidate identity format is defined while every identity remains unassigned", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();

  const invalidTemplate = clone(registry);
  invalidTemplate.policies.candidateIdentityFormat.formatTemplate = "candidate-{id}";
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(invalidTemplate, coverage, evidence, rubric),
    /must remain defined but unassigned/,
  );

  const assignedCount = clone(registry);
  assignedCount.policies.candidateIdentityFormat.assignedIdentityCount = 1;
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(assignedCount, coverage, evidence, rubric),
    /must remain defined but unassigned/,
  );

  const assignedIdentity = clone(registry);
  assignedIdentity.candidatePlaceholders[0].candidateIdentity.candidateId =
    "dcandidate.math.g7-9.number.example.v1";
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(assignedIdentity, coverage, evidence, rubric),
    /must remain an unassigned candidate identity placeholder/,
  );
});

test("algorithm and canonicalization policies remain explicitly deferred", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();

  const selectedAlgorithm = clone(registry);
  selectedAlgorithm.policies.digestAlgorithm.algorithmId = "selected-algorithm";
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(selectedAlgorithm, coverage, evidence, rubric),
    /no selected algorithm/,
  );

  const canonicalizationRules = clone(registry);
  canonicalizationRules.policies.canonicalization.rulesetVersion = "ruleset.v1";
  assert.throws(
    () =>
      validateDiagnosticCandidateDigestRegistry(canonicalizationRules, coverage, evidence, rubric),
    /without a ruleset/,
  );
});

test("allowed digest states remain non-approving placeholder vocabulary", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();
  assert.deepEqual(registry.policies.allowedPlaceholderDigestStates, [
    "PENDING_IMMUTABLE_CANDIDATE",
    "DIGEST_DEFERRED",
  ]);

  const approvingState = clone(registry);
  approvingState.policies.allowedPlaceholderDigestStates.push("APPROVED");
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(approvingState, coverage, evidence, rubric),
    /only the two placeholder states/,
  );

  const mismatchedCurrentState = clone(registry);
  mismatchedCurrentState.candidatePlaceholders[0].digestPlaceholder.state = "DIGEST_DEFERRED";
  assert.throws(
    () =>
      validateDiagnosticCandidateDigestRegistry(mismatchedCurrentState, coverage, evidence, rubric),
    /preserve the upstream pending candidate state/,
  );
});

test("digest values stay null and hash-like values are rejected", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();

  const populated = clone(registry);
  populated.candidatePlaceholders[0].digestPlaceholder.value = "pending-value";
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(populated, coverage, evidence, rubric),
    /no selected algorithm or digest value/,
  );

  const hashLike = clone(registry);
  hashLike.candidatePlaceholders[0].digestPlaceholder.value = "a".repeat(64);
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(hashLike, coverage, evidence, rubric),
    /hash-like value/,
  );
});

test("candidate references align with blueprint coverage evidence and rubric", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();

  const coverageMismatch = clone(registry);
  coverageMismatch.candidatePlaceholders[0].reviewCoverageReference.coverageStatus =
    "GAP_CONFIRMED";
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(coverageMismatch, coverage, evidence, rubric),
    /must match the coverage artifact/,
  );

  const evidenceMismatch = clone(registry);
  evidenceMismatch.candidatePlaceholders[0].reviewEvidenceReference.blueprintSlotId =
    evidenceMismatch.candidatePlaceholders[1].reviewEvidenceReference.blueprintSlotId;
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(evidenceMismatch, coverage, evidence, rubric),
    /must match the unrecorded evidence slot/,
  );

  const rubricMismatch = clone(registry);
  rubricMismatch.candidatePlaceholders[0].reviewGateRubricReference.gateCount = 5;
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(rubricMismatch, coverage, evidence, rubric),
    /must pin the six-gate rubric/,
  );
});

test("candidate records remain content-free placeholders", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();

  const activeRecord = clone(registry);
  activeRecord.candidatePlaceholders[0].recordState = "ACTIVE";
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(activeRecord, coverage, evidence, rubric),
    /recordState must remain PLACEHOLDER_ONLY/,
  );

  const embeddedContent = clone(registry);
  embeddedContent.candidatePlaceholders[0].candidateContentEmbedded = true;
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(embeddedContent, coverage, evidence, rubric),
    /contain no candidate content/,
  );
});

test("no candidate can claim review or production approval", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();

  const reviewApproved = clone(registry);
  reviewApproved.candidatePlaceholders[0].reviewDecisionState = "APPROVED";
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(reviewApproved, coverage, evidence, rubric),
    /cannot claim a review decision or production approval/,
  );

  const productionApproved = clone(registry);
  productionApproved.candidatePlaceholders[0].productionApprovalState = "APPROVED";
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(productionApproved, coverage, evidence, rubric),
    /cannot claim a review decision or production approval/,
  );
});

test("review evidence decision and approval record arrays remain empty", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();
  for (const field of [
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "productionApprovalRecords",
  ]) {
    const populated = clone(registry);
    populated[field].push({ recordId: "record-1" });
    assert.throws(
      () => validateDiagnosticCandidateDigestRegistry(populated, coverage, evidence, rubric),
      new RegExp(`${field} must remain empty`),
      field,
    );
  }
});

test("record boundary and aggregate counts remain zero", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();

  const boundary = clone(registry);
  boundary.recordBoundary.digestValuesRecorded = true;
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(boundary, coverage, evidence, rubric),
    /digestValuesRecorded must remain false/,
  );

  const aggregate = clone(registry);
  aggregate.aggregate.productionApprovedCandidateCount = 1;
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(aggregate, coverage, evidence, rubric),
    /zero identities, digests, evidence, decisions and approvals/,
  );
});

test("readiness remains NOT_READY with both Wave 3 blockers", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();

  const ready = clone(registry);
  ready.readiness.status = "READY";
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(ready, coverage, evidence, rubric),
    /readiness.status must remain NOT_READY/,
  );

  const missingBlocker = clone(registry);
  missingBlocker.readiness.blockingReasons = ["INCOMPLETE_COVERAGE"];
  assert.throws(
    () => validateDiagnosticCandidateDigestRegistry(missingBlocker, coverage, evidence, rubric),
    /two current Wave 3 blockers/,
  );
});

test("candidate digest registry rejects every forbidden field term", async () => {
  const { registry, coverage, evidence, rubric } = await readArtifacts();

  for (const forbiddenField of forbiddenFields) {
    const unsafeRegistry = clone(registry);
    unsafeRegistry.candidatePlaceholders[0][forbiddenField] = "blocked";
    assert.throws(
      () => validateDiagnosticCandidateDigestRegistry(unsafeRegistry, coverage, evidence, rubric),
      /forbidden field term/,
      forbiddenField,
    );
  }
});

test("Slice 5 worktree scope permits only the nine exact static paths", () => {
  const approvedPaths = [
    "docs/wave-4/diagnostic-candidate-digest-contract.md",
    "docs/wave-4/slice-5-implementation-note.md",
    "packages/curriculum/diagnostic-candidate-digest/grade-7-9-math.candidate-digest-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
    "packages/curriculum/test/diagnostic-candidate-digest.test.mjs",
    "package.json",
  ];
  assert.deepEqual(validateCandidateDigestChangedPaths(approvedPaths), approvedPaths);

  const forbiddenPaths = [
    "apps/api/src/diagnostic-review/candidate-digest.controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "pnpm-lock.yaml",
    "packages/curriculum/src/diagnostic-candidate-digest.ts",
  ];
  for (const forbiddenPath of forbiddenPaths) {
    assert.throws(
      () => validateCandidateDigestChangedPaths([forbiddenPath]),
      /Wave 4 Slice 5 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("review scope guards contain no broad API allowlist", async () => {
  const sources = await Promise.all([
    readFile(
      new URL("../scripts/validate-diagnostic-candidate-digest.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-review-gate-rubric.mjs", import.meta.url),
      "utf8",
    ),
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
