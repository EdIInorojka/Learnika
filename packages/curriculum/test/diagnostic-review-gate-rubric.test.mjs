import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import { readDiagnosticReviewCoverage } from "../scripts/validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "../scripts/validate-diagnostic-review-evidence.mjs";
import {
  readDiagnosticReviewGateRubric,
  validateDiagnosticReviewGateRubric,
  validateReviewGateRubricChangedPaths,
} from "../scripts/validate-diagnostic-review-gate-rubric.mjs";

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
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [rubric, coverage, evidence] = await Promise.all([
    readDiagnosticReviewGateRubric(),
    readDiagnosticReviewCoverage(),
    readDiagnosticReviewEvidence(),
  ]);
  return { rubric, coverage, evidence };
}

test("review gate rubric is valid with six gates and no records", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();
  const summary = validateDiagnosticReviewGateRubric(rubric, coverage, evidence);

  assert.deepEqual(summary, {
    rubricArtifactVersion: "wave-4.slice-4.grade-7-9-math.v1",
    reviewCoverageArtifactVersion: "wave-4.slice-2.grade-7-9-math.v1",
    reviewEvidenceArtifactVersion: "wave-4.slice-3.grade-7-9-math.v1",
    gateCount: 6,
    criterionCount: 23,
    requiredEvidenceCategoryCount: 23,
    blockingIssueCategoryCount: 23,
    recordedDecisionCount: 0,
    recordedEvidenceCount: 0,
    productionApprovalCount: 0,
    readiness: "NOT_READY",
  });
});

test("rubric requires exactly the six approved gate IDs", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();

  const missing = clone(rubric);
  missing.gates.pop();
  assert.throws(
    () => validateDiagnosticReviewGateRubric(missing, coverage, evidence),
    /exactly the six approved gate IDs/,
  );

  const unknown = clone(rubric);
  unknown.gates[0].gateId = "unknown_gate";
  assert.throws(
    () => validateDiagnosticReviewGateRubric(unknown, coverage, evidence),
    /unknown gate ID/,
  );

  const duplicate = clone(rubric);
  duplicate.gates[1].gateId = duplicate.gates[0].gateId;
  assert.throws(
    () => validateDiagnosticReviewGateRubric(duplicate, coverage, evidence),
    /Duplicate gate ID/,
  );
});

test("every gate policy version matches coverage and evidence pins", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();
  rubric.gates[0].policyVersion = "wave-4.invalid.v1";

  assert.throws(
    () => validateDiagnosticReviewGateRubric(rubric, coverage, evidence),
    /must match the approved gate policy pin/,
  );
});

test("every gate requires non-empty unique evidence categories", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();

  const missing = clone(rubric);
  missing.gates[0].requiredEvidenceCategories = [];
  assert.throws(
    () => validateDiagnosticReviewGateRubric(missing, coverage, evidence),
    /requiredEvidenceCategories must be a non-empty array/,
  );

  const duplicate = clone(rubric);
  duplicate.gates[0].requiredEvidenceCategories[1] =
    duplicate.gates[0].requiredEvidenceCategories[0];
  assert.throws(
    () => validateDiagnosticReviewGateRubric(duplicate, coverage, evidence),
    /contains duplicate category/,
  );
});

test("every gate requires non-empty unique blocking issue categories", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();

  const missing = clone(rubric);
  missing.gates[0].blockingIssueCategories = [];
  assert.throws(
    () => validateDiagnosticReviewGateRubric(missing, coverage, evidence),
    /blockingIssueCategories must be a non-empty array/,
  );

  const duplicate = clone(rubric);
  duplicate.gates[0].blockingIssueCategories[1] = duplicate.gates[0].blockingIssueCategories[0];
  assert.throws(
    () => validateDiagnosticReviewGateRubric(duplicate, coverage, evidence),
    /contains duplicate category/,
  );
});

test("allowed decision states remain future enum definitions only", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();
  const methodology = rubric.gates.find((gate) => gate.gateId === "methodology");
  const production = rubric.gates.find((gate) => gate.gateId === "production_approval");

  assert.deepEqual(methodology.allowedFutureDecisionStates, [
    "NOT_STARTED",
    "IN_REVIEW",
    "CHANGES_REQUIRED",
    "APPROVED",
    "INVALIDATED",
  ]);
  assert.deepEqual(production.allowedFutureDecisionStates, [
    "NOT_ELIGIBLE",
    "PENDING",
    "APPROVED",
    "WITHDRAWN",
  ]);
  assert.deepEqual(rubric.reviewDecisionRecords, []);

  const unknownState = clone(rubric);
  unknownState.gates[0].allowedFutureDecisionStates.push("RECORDED");
  assert.throws(
    () => validateDiagnosticReviewGateRubric(unknownState, coverage, evidence),
    /must match the future enum contract/,
  );
});

test("criteria reference every gate taxonomy category exactly once", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();

  const missingCriteria = clone(rubric);
  missingCriteria.gates[0].criteria = [];
  assert.throws(
    () => validateDiagnosticReviewGateRubric(missingCriteria, coverage, evidence),
    /criteria must be a non-empty array/,
  );

  const unknownEvidenceCategory = clone(rubric);
  unknownEvidenceCategory.gates[0].criteria[0].requiredEvidenceCategory = "UNKNOWN_CATEGORY";
  assert.throws(
    () => validateDiagnosticReviewGateRubric(unknownEvidenceCategory, coverage, evidence),
    /must reference its gate taxonomy/,
  );

  const unknownBlockingCategory = clone(rubric);
  unknownBlockingCategory.gates[0].criteria[0].blockingIssueCategory = "UNKNOWN_CATEGORY";
  assert.throws(
    () => validateDiagnosticReviewGateRubric(unknownBlockingCategory, coverage, evidence),
    /must reference its gate taxonomy/,
  );
});

test("reviewer roles remain PII-free deferred placeholders", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();

  for (const field of ["roleId", "assignmentRef", "identityRef"]) {
    const assigned = clone(rubric);
    assigned.gates[0].reviewerRolePlaceholder[field] = "assigned";
    assert.throws(
      () => validateDiagnosticReviewGateRubric(assigned, coverage, evidence),
      /PII-free deferred placeholder/,
      field,
    );
  }
});

test("rubric cannot contain actual evidence decisions or role assignments", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();

  const decisionRecord = clone(rubric);
  decisionRecord.reviewDecisionRecords.push({ decisionId: "decision-1" });
  assert.throws(
    () => validateDiagnosticReviewGateRubric(decisionRecord, coverage, evidence),
    /reviewDecisionRecords must remain empty/,
  );

  const evidenceRecord = clone(rubric);
  evidenceRecord.reviewEvidenceRecords.push({ evidenceId: "evidence-1" });
  assert.throws(
    () => validateDiagnosticReviewGateRubric(evidenceRecord, coverage, evidence),
    /reviewEvidenceRecords must remain empty/,
  );

  const assignment = clone(rubric);
  assignment.decisionBoundary.reviewerRoleAssignmentsRecorded = true;
  assert.throws(
    () => validateDiagnosticReviewGateRubric(assignment, coverage, evidence),
    /reviewerRoleAssignmentsRecorded must remain false/,
  );
});

test("rubric cannot claim production approval", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();

  const boundary = clone(rubric);
  boundary.decisionBoundary.productionApprovalsRecorded = true;
  assert.throws(
    () => validateDiagnosticReviewGateRubric(boundary, coverage, evidence),
    /productionApprovalsRecorded must remain false/,
  );

  const aggregate = clone(rubric);
  aggregate.aggregate.productionApprovalCount = 1;
  assert.throws(
    () => validateDiagnosticReviewGateRubric(aggregate, coverage, evidence),
    /zero recorded decisions, evidence and approvals/,
  );
});

test("readiness remains NOT_READY with both Wave 3 blockers", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();

  const ready = clone(rubric);
  ready.readiness.status = "READY";
  assert.throws(
    () => validateDiagnosticReviewGateRubric(ready, coverage, evidence),
    /readiness.status must remain NOT_READY/,
  );

  const missingBlocker = clone(rubric);
  missingBlocker.readiness.blockingReasons = ["INCOMPLETE_COVERAGE"];
  assert.throws(
    () => validateDiagnosticReviewGateRubric(missingBlocker, coverage, evidence),
    /two current Wave 3 blockers/,
  );
});

test("review gate rubric rejects every forbidden field term", async () => {
  const { rubric, coverage, evidence } = await readArtifacts();

  for (const forbiddenField of forbiddenFields) {
    const unsafeRubric = clone(rubric);
    unsafeRubric.gates[0][forbiddenField] = "blocked";
    assert.throws(
      () => validateDiagnosticReviewGateRubric(unsafeRubric, coverage, evidence),
      /forbidden field term/,
      forbiddenField,
    );
  }
});

test("Slice 4 worktree scope permits only the eight exact static files", () => {
  const approvedPaths = [
    "docs/wave-4/diagnostic-review-gate-rubric-contract.md",
    "docs/wave-4/slice-4-implementation-note.md",
    "packages/curriculum/diagnostic-review-gate-rubric/grade-7-9-math.review-gate-rubric.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
    "packages/curriculum/test/diagnostic-review-gate-rubric.test.mjs",
    "package.json",
  ];
  assert.deepEqual(validateReviewGateRubricChangedPaths(approvedPaths), approvedPaths);

  const forbiddenPaths = [
    "apps/api/src/diagnostic-review/rubric.controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "pnpm-lock.yaml",
    "packages/curriculum/src/diagnostic-review-gate-rubric.ts",
  ];
  for (const forbiddenPath of forbiddenPaths) {
    assert.throws(
      () => validateReviewGateRubricChangedPaths([forbiddenPath]),
      /Wave 4 Slice 4 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("review scope guards contain no broad API allowlist", async () => {
  const sources = await Promise.all([
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
