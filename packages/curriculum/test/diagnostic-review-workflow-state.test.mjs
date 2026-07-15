import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "../scripts/validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateDigestRegistry } from "../scripts/validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticReviewCoverage } from "../scripts/validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "../scripts/validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "../scripts/validate-diagnostic-review-gate-rubric.mjs";
import {
  readDiagnosticReviewWorkflowState,
  validateDiagnosticReviewWorkflowState,
  validateReviewWorkflowStateChangedPaths,
} from "../scripts/validate-diagnostic-review-workflow-state.mjs";

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
  "canonicalizedContent",
  "normalizedStem",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [workflow, coverage, evidence, rubric, registry, canonicalization] = await Promise.all([
    readDiagnosticReviewWorkflowState(),
    readDiagnosticReviewCoverage(),
    readDiagnosticReviewEvidence(),
    readDiagnosticReviewGateRubric(),
    readDiagnosticCandidateDigestRegistry(),
    readDiagnosticCandidateCanonicalization(),
  ]);
  return { workflow, coverage, evidence, rubric, registry, canonicalization };
}

function validate(artifacts, override = artifacts.workflow) {
  return validateDiagnosticReviewWorkflowState(
    override,
    artifacts.coverage,
    artifacts.evidence,
    artifacts.rubric,
    artifacts.registry,
    artifacts.canonicalization,
  );
}

test("review workflow state placeholder is valid and inactive", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    workflowArtifactVersion: "wave-4.slice-7.grade-7-9-math.v1",
    workflowPolicyId: "diagnostic-review-workflow-state",
    workflowVersion: "wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1",
    workflowPolicyState: "DEFERRED_NON_PRODUCTION",
    allowedPlaceholderStateCount: 7,
    transitionDefinitionCount: 7,
    workflowEntryCount: 11,
    submittedCandidateCount: 0,
    activeReviewCount: 0,
    approvedDecisionCount: 0,
    productionApprovalCount: 0,
    readiness: "NOT_READY",
  });
});

test("metadata pins every exact upstream artifact version", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    "reviewCoverageArtifactVersion",
    "reviewEvidenceArtifactVersion",
    "reviewGateRubricArtifactVersion",
    "candidateDigestRegistryArtifactVersion",
    "candidateCanonicalizationArtifactVersion",
  ];
  for (const field of mutations) {
    const invalid = clone(artifacts.workflow);
    invalid.metadata[field] = "wave-4.invalid-artifact.v1";
    assert.throws(
      () => validate(artifacts, invalid),
      new RegExp(`metadata\\.${field} must be`),
      field,
    );
  }
});

test("workflow policy identity remains deferred and runtime-disabled", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["policyState", "ACTIVE"],
    ["runtimeActivationAllowed", true],
    ["productionReadinessTransitionAllowed", true],
  ];
  for (const [field, value] of mutations) {
    const invalid = clone(artifacts.workflow);
    invalid.workflowPolicy[field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      /inactive non-production Slice 7 placeholder/,
      field,
    );
  }
});

test("allowed workflow states are the exact unique placeholder enum", async () => {
  const artifacts = await readArtifacts();

  const missing = clone(artifacts.workflow);
  missing.workflowPolicy.allowedPlaceholderStates.pop();
  assert.throws(() => validate(artifacts, missing), /must contain exactly 7 values/);

  const unknown = clone(artifacts.workflow);
  unknown.workflowPolicy.allowedPlaceholderStates[0] = "PRODUCTION_READY";
  assert.throws(() => validate(artifacts, unknown), /exact approved placeholder values/);

  const duplicate = clone(artifacts.workflow);
  duplicate.workflowPolicy.allowedPlaceholderStates[1] =
    duplicate.workflowPolicy.allowedPlaceholderStates[0];
  assert.throws(() => validate(artifacts, duplicate), /exact approved placeholder values/);
});

test("transition table is exact conservative and has no approval path", async () => {
  const artifacts = await readArtifacts();

  const inboundApproval = clone(artifacts.workflow);
  inboundApproval.workflowPolicy.transitionTable[0].allowedToStates = [
    "APPROVED_DEFERRED_PLACEHOLDER",
  ];
  assert.throws(() => validate(artifacts, inboundApproval), /exact approved placeholder values/);

  const productionTransition = clone(artifacts.workflow);
  productionTransition.workflowPolicy.transitionTable[0].productionReadinessAllowed = true;
  assert.throws(() => validate(artifacts, productionTransition), /prohibit production readiness/);

  const authorization = clone(artifacts.workflow);
  authorization.workflowPolicy.transitionTable[0].authorizationPolicyRef = "policy.v1";
  assert.throws(() => validate(artifacts, authorization), /prohibit production readiness/);
});

test("dependency references preserve all upstream zero-record boundaries", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["reviewCoverage", "blueprintSlotCount", 10],
    ["reviewEvidence", "approvedDecisionCount", 1],
    ["reviewGateRubric", "recordedEvidenceCount", 1],
    ["candidateDigestRegistry", "digestValueCount", 1],
    ["candidateCanonicalization", "activeRuleCount", 1],
  ];
  for (const [dependency, field, value] of mutations) {
    const invalid = clone(artifacts.workflow);
    invalid.dependencyReferences[dependency][field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      new RegExp(`dependencyReferences\\.${dependency}`),
      `${dependency}.${field}`,
    );
  }
});

test("workflow entries cover exactly the 11 known coverage slots", async () => {
  const artifacts = await readArtifacts();
  assert.equal(artifacts.workflow.workflowEntries.length, 11);

  const missing = clone(artifacts.workflow);
  missing.workflowEntries.pop();
  assert.throws(() => validate(artifacts, missing), /exactly 11 blueprint-slot placeholders/);

  const unknown = clone(artifacts.workflow);
  unknown.workflowEntries[0].blueprintSlotId = "diag.math.g7-9.unknown.slot.v1";
  assert.throws(() => validate(artifacts, unknown), /unknown coverage slot/);

  const duplicate = clone(artifacts.workflow);
  duplicate.workflowEntries[1].blueprintSlotId = duplicate.workflowEntries[0].blueprintSlotId;
  assert.throws(() => validate(artifacts, duplicate), /Duplicate workflow entry/);
});

test("each workflow entry pins its matching coverage and evidence placeholders", async () => {
  const artifacts = await readArtifacts();

  const coverageMismatch = clone(artifacts.workflow);
  coverageMismatch.workflowEntries[0].coverageReference.coverageStatus = "GAP_CONFIRMED";
  assert.throws(
    () => validate(artifacts, coverageMismatch),
    /must match the Slice 2 coverage slot/,
  );

  const evidenceMismatch = clone(artifacts.workflow);
  evidenceMismatch.workflowEntries[0].evidenceReference.recordState = "RECORDED";
  assert.throws(
    () => validate(artifacts, evidenceMismatch),
    /must match the unrecorded Slice 3 placeholder/,
  );
});

test("each workflow entry pins the rubric registry and canonicalization placeholders", async () => {
  const artifacts = await readArtifacts();

  const rubricMismatch = clone(artifacts.workflow);
  rubricMismatch.workflowEntries[0].rubricReference.gateCount = 5;
  assert.throws(() => validate(artifacts, rubricMismatch), /six-gate Slice 4 rubric/);

  const registryMismatch = clone(artifacts.workflow);
  registryMismatch.workflowEntries[0].candidateRegistryReference.candidateIdentityState =
    "ASSIGNED";
  assert.throws(() => validate(artifacts, registryMismatch), /unresolved Slice 5 entry/);

  const canonicalizationMismatch = clone(artifacts.workflow);
  canonicalizationMismatch.workflowEntries[0].canonicalizationReference.policyState = "ACTIVE";
  assert.throws(() => validate(artifacts, canonicalizationMismatch), /unresolved Slice 6 policy/);
});

test("workflow entries use only approved states and remain NOT_SUBMITTED", async () => {
  const artifacts = await readArtifacts();

  const unknown = clone(artifacts.workflow);
  unknown.workflowEntries[0].workflowState = "PRODUCTION_READY";
  assert.throws(() => validate(artifacts, unknown), /outside the approved placeholder enum/);

  const deferred = clone(artifacts.workflow);
  deferred.workflowEntries[0].workflowState = "CANDIDATE_DEFERRED";
  assert.throws(() => validate(artifacts, deferred), /must remain NOT_SUBMITTED/);
});

test("candidate submission and active review claims are rejected", async () => {
  const artifacts = await readArtifacts();
  for (const field of ["candidateSubmitted", "activeReview"]) {
    const invalid = clone(artifacts.workflow);
    invalid.workflowEntries[0][field] = true;
    assert.throws(
      () => validate(artifacts, invalid),
      /must contain no submission, review, decision, identity or approval/,
      field,
    );
  }
});

test("review decisions and production approvals cannot be recorded", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["reviewDecisionState", "APPROVED_DEFERRED_PLACEHOLDER"],
    ["productionApprovalState", "APPROVED_DEFERRED_PLACEHOLDER"],
  ];
  for (const [field, value] of mutations) {
    const invalid = clone(artifacts.workflow);
    invalid.workflowEntries[0][field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      /must contain no submission, review, decision, identity or approval/,
      field,
    );
  }
});

test("reviewer and audit identity remain deferred and unpopulated", async () => {
  const artifacts = await readArtifacts();

  const activatedPolicy = clone(artifacts.workflow);
  activatedPolicy.identityPolicyDeferrals.reviewerIdentity.policyVersion = "identity-policy.v1";
  assert.throws(() => validate(artifacts, activatedPolicy), /must remain deferred/);

  const populatedEntry = clone(artifacts.workflow);
  populatedEntry.workflowEntries[0].auditIdentityRef = "audit-ref-1";
  assert.throws(
    () => validate(artifacts, populatedEntry),
    /must contain no submission, review, decision, identity or approval/,
  );
});

test("all workflow activity and identity record arrays remain empty", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "candidateSubmissionRecords",
    "activeReviewRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "productionApprovalRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
  ]) {
    const invalid = clone(artifacts.workflow);
    invalid[field].push({ recordId: "record-1" });
    assert.throws(
      () => validate(artifacts, invalid),
      new RegExp(`${field} must remain empty`),
      field,
    );
  }
});

test("record boundary and all activity aggregates remain zero", async () => {
  const artifacts = await readArtifacts();

  const boundary = clone(artifacts.workflow);
  boundary.recordBoundary.activeReviewsRecorded = true;
  assert.throws(() => validate(artifacts, boundary), /activeReviewsRecorded must remain false/);

  const aggregate = clone(artifacts.workflow);
  aggregate.aggregate.approvedDecisionCount = 1;
  assert.throws(
    () => validate(artifacts, aggregate),
    /activity, decision, approval and identity counts must remain zero/,
  );
});

test("hash-like values are rejected", async () => {
  const artifacts = await readArtifacts();
  const invalid = clone(artifacts.workflow);
  invalid.dependencyReferences.reviewCoverage.artifactVersion = "a".repeat(64);
  assert.throws(() => validate(artifacts, invalid), /hash-like value/);
});

test("workflow artifact rejects every forbidden field term", async () => {
  const artifacts = await readArtifacts();
  for (const forbiddenField of forbiddenFields) {
    const invalid = clone(artifacts.workflow);
    invalid.workflowEntries[0][forbiddenField] = "blocked";
    assert.throws(() => validate(artifacts, invalid), /forbidden field term/, forbiddenField);
  }
});

test("readiness remains NOT_READY with both Wave 3 blockers", async () => {
  const artifacts = await readArtifacts();

  const ready = clone(artifacts.workflow);
  ready.readiness.status = "READY";
  assert.throws(() => validate(artifacts, ready), /readiness.status must remain NOT_READY/);

  const missingBlocker = clone(artifacts.workflow);
  missingBlocker.readiness.blockingReasons = ["INCOMPLETE_COVERAGE"];
  assert.throws(() => validate(artifacts, missingBlocker), /two current Wave 3 blockers/);
});

test("Slice 7 worktree scope permits only the eleven exact static paths", () => {
  const approvedPaths = [
    "docs/wave-4/diagnostic-review-workflow-state-contract.md",
    "docs/wave-4/slice-7-implementation-note.md",
    "packages/curriculum/diagnostic-review-workflow-state/grade-7-9-math.review-workflow-state-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
    "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
    "packages/curriculum/test/diagnostic-review-workflow-state.test.mjs",
    "package.json",
  ];
  assert.deepEqual(validateReviewWorkflowStateChangedPaths(approvedPaths), approvedPaths);

  const forbiddenPaths = [
    "apps/api/src/diagnostic-review/workflow.controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "pnpm-lock.yaml",
    "packages/curriculum/src/diagnostic-review-workflow.ts",
  ];
  for (const forbiddenPath of forbiddenPaths) {
    assert.throws(
      () => validateReviewWorkflowStateChangedPaths([forbiddenPath]),
      /Wave 4 Slice 7 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("review scope guards contain no broad API allowlist", async () => {
  const sources = await Promise.all([
    readFile(
      new URL("../scripts/validate-diagnostic-review-workflow-state.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-candidate-canonicalization.mjs", import.meta.url),
      "utf8",
    ),
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
