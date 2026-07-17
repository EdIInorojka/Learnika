import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  normalizeRollbackWithdrawalStatusPaths,
  readDiagnosticRollbackWithdrawalPolicy,
  readDiagnosticRollbackWithdrawalPolicyUpstreamArtifacts,
  validateDiagnosticRollbackWithdrawalPolicy,
  validateRollbackWithdrawalChangedPaths,
} from "../scripts/validate-diagnostic-rollback-withdrawal-policy.mjs";

const expectedChangedPaths = [
  "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
  "docs/wave-5/slice-13-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy/grade-7-9-math.rollback-withdrawal-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-coverage-gap-closure-plan.test.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];

const expectedDecisionRequirementIds = [
  "withdrawal_trigger_taxonomy",
  "rollback_trigger_taxonomy",
  "candidate_withdrawal_and_containment",
  "production_approval_withdrawal",
  "evidence_withdrawal_and_tombstone",
  "digest_invalidation_and_dependency_propagation",
  "readiness_rollback_and_blocker_reopening",
  "audit_trail_and_history_preservation",
  "notification_and_escalation",
  "restoration_reapproval_and_forward_fix",
  "partial_failure_reconciliation_and_recovery",
];

const protectedRecordFields = [
  "policyDecisionRecords",
  "withdrawalTriggerEvaluationRecords",
  "rollbackTriggerEvaluationRecords",
  "candidateWithdrawalRecords",
  "productionApprovalWithdrawalRecords",
  "evidenceWithdrawalRecords",
  "digestInvalidationRecords",
  "readinessRollbackRecords",
  "rollbackRecords",
  "revocationRecords",
  "tombstoneRecords",
  "restorationRecords",
  "reapprovalRecords",
  "blockerReopeningRecords",
  "notificationRecords",
  "escalationRecords",
  "auditLogRecords",
  "auditEventRecords",
  "realDiagnosticItemRecords",
  "realCandidateRecords",
  "approvedCandidateRecords",
  "reviewEvidenceRecords",
  "reviewDecisionRecords",
  "digestValueRecords",
  "candidateIdentityRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "authorityGrantRecords",
  "productionApprovalRecords",
];

async function loadFixture() {
  return Promise.all([
    readDiagnosticRollbackWithdrawalPolicy(),
    readDiagnosticRollbackWithdrawalPolicyUpstreamArtifacts(),
  ]);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function expectArtifactFailure(mutator, pattern) {
  const [artifact, upstream] = await loadFixture();
  const changed = clone(artifact);
  mutator(changed);
  assert.throws(() => validateDiagnosticRollbackWithdrawalPolicy(changed, upstream), pattern);
}

test("rollback and withdrawal policy placeholder is valid and unresolved", async () => {
  const [artifact, upstream] = await loadFixture();
  assert.deepEqual(validateDiagnosticRollbackWithdrawalPolicy(artifact, upstream), {
    policyArtifactVersion: "wave-5.slice-13.grade-7-9-math.v1",
    policyVersion: "wave-5.slice-13.diagnostic-rollback-and-withdrawal.placeholder.v1",
    policyState: "UNRESOLVED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    withdrawalTriggerPlaceholderCount: 7,
    rollbackTriggerPlaceholderCount: 5,
    decisionRequirementCount: 11,
    openBlockingReasonCount: 2,
    closedBlockingReasonCount: 0,
    satisfiedPrerequisiteCount: 0,
    candidateWithdrawalCount: 0,
    rollbackRecordCount: 0,
    tombstoneRecordCount: 0,
    restorationRecordCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("rollback and withdrawal prerequisite remains exact and unsatisfied", async () => {
  const [artifact] = await loadFixture();
  assert.deepEqual(artifact.prerequisiteReference, {
    prerequisiteId: "rollback_and_withdrawal_policy",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future trigger, containment, propagation, history-preservation, restoration and partial-failure test matrix.",
    evidenceRecordRefs: [],
  });
});

test("all exact upstream artifact and policy pins remain unchanged", async () => {
  const [artifact] = await loadFixture();
  assert.deepEqual(
    Object.values(artifact.dependencyReferences).map((reference) => reference.artifactVersion),
    [
      "wave-5.slice-2.grade-7-9-math.v1",
      "wave-5.slice-12.grade-7-9-math.v1",
      "wave-5.slice-11.grade-7-9-math.v1",
      "wave-5.slice-10.grade-7-9-math.v1",
      "wave-5.slice-9.grade-7-9-math.v1",
      "wave-5.slice-8.grade-7-9-math.v1",
      "wave-4.slice-7.grade-7-9-math.v1",
    ],
  );
  assert.equal(
    artifact.dependencyReferences.readinessIntegrationPlan.planVersion,
    "wave-5.slice-12.diagnostic-readiness-integration-plan.placeholder.v1",
  );
  assert.equal(
    artifact.dependencyReferences.coverageGapClosurePlan.planVersion,
    "wave-5.slice-11.diagnostic-coverage-gap-closure-plan.placeholder.v1",
  );
});

test("current baseline remains exact blocked inactive and not ready", async () => {
  const [artifact] = await loadFixture();
  assert.deepEqual(artifact.currentBaseline, {
    readinessPolicyVersion: "wave-3-slice-11-diagnostic-readiness-policy-v1",
    readinessStatus: "NOT_READY",
    blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
    blockingReasonCount: 2,
    openBlockingReasonCount: 2,
    closedBlockingReasonCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    prerequisiteCount: 12,
    unsatisfiedPrerequisiteCount: 12,
    satisfiedPrerequisiteCount: 0,
    productionApprovalCount: 0,
    approvedCandidateCount: 0,
    baselineTransitionRecorded: false,
  });
});

test("both current blockers remain open and unresolved", async () => {
  const [artifact] = await loadFixture();
  assert.deepEqual(
    artifact.currentBlockers.map((blocker) => [
      blocker.blockingReason,
      blocker.blockerState,
      blocker.closureRecorded,
      blocker.reopeningRecorded,
      blocker.readinessRemovalAllowed,
    ]),
    [
      ["INCOMPLETE_COVERAGE", "OPEN_UNRESOLVED", false, false, false],
      ["NON_PRODUCTION_FIXTURES", "OPEN_UNRESOLVED", false, false, false],
    ],
  );
});

test("trigger taxonomies are exact placeholders and cannot evaluate or execute", async () => {
  const [artifact] = await loadFixture();
  assert.deepEqual(
    artifact.withdrawalTriggerTaxonomyPlaceholders.map((entry) => entry.triggerScope),
    [
      "candidate_revision",
      "policy_change",
      "expired_evidence",
      "rights_dispute",
      "safety_issue",
      "authorization_failure",
      "digest_incident",
    ],
  );
  assert.deepEqual(
    artifact.rollbackTriggerTaxonomyPlaceholders.map((entry) => entry.triggerScope),
    [
      "readiness_input_invalidation",
      "coverage_reconciliation_failure",
      "production_approval_withdrawal",
      "partial_propagation_failure",
      "policy_version_incompatibility",
    ],
  );
  for (const entry of [
    ...artifact.withdrawalTriggerTaxonomyPlaceholders,
    ...artifact.rollbackTriggerTaxonomyPlaceholders,
  ]) {
    assert.equal(entry.recordState, "PLACEHOLDER_ONLY");
    assert.equal(entry.evaluationAllowed, false);
    assert.equal(entry.executionAllowed, false);
  }
});

test("all eight lifecycle policy placeholders remain undecided and disabled", async () => {
  const [artifact] = await loadFixture();
  const placeholders = [
    artifact.candidateWithdrawalPlaceholder,
    artifact.productionApprovalWithdrawalPlaceholder,
    artifact.evidenceWithdrawalTombstonePlaceholder,
    artifact.digestInvalidationPlaceholder,
    artifact.readinessRollbackPlaceholder,
    artifact.auditTrailRequirementPlaceholder,
    artifact.notificationEscalationPlaceholder,
    artifact.restorationReapprovalPlaceholder,
  ];
  for (const placeholder of placeholders) {
    assert.equal(placeholder.state, "TO_BE_DECIDED");
    for (const [key, value] of Object.entries(placeholder)) {
      if (key.endsWith("Allowed")) assert.equal(value, false, key);
      if (key === "activeRuleReferences") assert.deepEqual(value, []);
    }
  }
});

test("exact eleven policy decisions remain unresolved", async () => {
  const [artifact] = await loadFixture();
  assert.deepEqual(
    artifact.decisionRequirements.map((requirement) => requirement.requirementId),
    expectedDecisionRequirementIds,
  );
  for (const requirement of artifact.decisionRequirements) {
    assert.equal(requirement.state, "TO_BE_DECIDED");
    assert.equal(requirement.decisionRecorded, false);
    assert.equal(requirement.decisionReference, null);
    assert.equal(requirement.policyReference, null);
    assert.deepEqual(requirement.activeRuleReferences, []);
  }
});

test("activation rollback withdrawal restoration and readiness transitions remain disabled", async () => {
  const [artifact] = await loadFixture();
  for (const [key, value] of Object.entries(artifact.activationBoundary)) {
    if (key.endsWith("Allowed")) assert.equal(value, false, key);
  }
  assert.deepEqual(artifact.readiness, {
    policyVersion: "wave-3-slice-11-diagnostic-readiness-policy-v1",
    status: "NOT_READY",
    blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
  });
  assert.doesNotMatch(JSON.stringify(artifact), /(?<!NOT_)\bREADY\b/);
});

test("all protected records and lifecycle aggregates remain zero", async () => {
  const [artifact] = await loadFixture();
  for (const field of protectedRecordFields) assert.deepEqual(artifact[field], [], field);
  for (const [field, value] of Object.entries(artifact.aggregate)) {
    if (
      ![
        "withdrawalTriggerPlaceholderCount",
        "rollbackTriggerPlaceholderCount",
        "decisionRequirementCount",
        "undecidedRequirementCount",
        "blockingReasonCount",
        "openBlockingReasonCount",
      ].includes(field)
    ) {
      assert.equal(value, 0, field);
    }
  }
  for (const value of Object.values(artifact.recordBoundary)) assert.equal(value, false);
});

test("candidate identifiers and diagnostic item payload fields fail closed", async () => {
  await expectArtifactFailure((artifact) => {
    artifact.candidateId = "candidate-123456";
  }, /forbidden candidate identifier field/);
  await expectArtifactFailure((artifact) => {
    artifact.itemStem = "payload";
  }, /forbidden field term itemStem/);
});

test("unknown fields and requested forbidden content terms fail closed", async () => {
  const terms = [
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
    "reviewerName",
    "immutableDigest",
    "sha256",
    "contentHash",
    "canonicalizedContent",
    "storageObjectKey",
  ];
  for (const term of terms) {
    await expectArtifactFailure((artifact) => {
      artifact[term] = "forbidden";
    }, /forbidden field term/);
  }
  await expectArtifactFailure((artifact) => {
    artifact.unexpectedBoundary = false;
  }, /unexpected field/);
});

test("private identity location candidate and hash-like values fail closed", async () => {
  const values = [
    "reviewer@example.com",
    "https://private.example/object",
    "123e4567-e89b-42d3-a456-426614174000",
    "user-private123",
    "account-private123",
    "candidate-123456",
    "0123456789abcdef0123456789abcdef",
  ];
  for (const value of values) {
    await expectArtifactFailure((artifact) => {
      artifact.metadata.policyArtifactVersion = value;
    }, /contains a|forbidden content term/);
  }
});

test("Slice 13 worktree guard permits only the exact 42 implementation paths", () => {
  assert.equal(expectedChangedPaths.length, 42);
  assert.deepEqual(
    validateRollbackWithdrawalChangedPaths(expectedChangedPaths),
    expectedChangedPaths,
  );
  const forbiddenPaths = [
    "docs/wave-5/archive/diagnostic-rollback-withdrawal-policy-contract.md",
    "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md.bak",
    "packages/curriculum/diagnostic-rollback-withdrawal-policy/extra.json",
    "packages/curriculum/src/diagnostic-rollback-runtime.ts",
    "apps/api/src/diagnostic-review/rollback.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "pnpm-lock.yaml",
  ];
  for (const forbiddenPath of forbiddenPaths) {
    assert.throws(
      () => validateRollbackWithdrawalChangedPaths([forbiddenPath]),
      /Wave 5 Slice 13 out-of-scope path changed/,
      forbiddenPath,
    );
  }
  assert.deepEqual(
    normalizeRollbackWithdrawalStatusPaths(
      "R  apps/api/src/diagnostic-review/rollback.ts -> docs/wave-5/slice-13-implementation-note.md",
    ),
    ["apps/api/src/diagnostic-review/rollback.ts", "docs/wave-5/slice-13-implementation-note.md"],
  );
  assert.throws(
    () =>
      validateRollbackWithdrawalChangedPaths(
        normalizeRollbackWithdrawalStatusPaths(
          "R  apps/api/src/diagnostic-review/rollback.ts -> docs/wave-5/slice-13-implementation-note.md",
        ),
      ),
    /Wave 5 Slice 13 out-of-scope path changed: apps\/api\/src\/diagnostic-review\/rollback\.ts/,
  );
});

test("root test command registers the Slice 13 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../../../package.json", import.meta.url)));
  const registrations = [
    "node packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-rollback-withdrawal-policy.test.mjs",
  ];
  for (const registration of registrations) {
    assert.equal(packageJson.scripts.test.split(registration).length - 1, 1, registration);
  }
});

test("Slice 13 validator contains no broad documentation curriculum API or runtime allowlist", async () => {
  const source = await readFile(
    new URL("../scripts/validate-diagnostic-rollback-withdrawal-policy.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
  assert.doesNotMatch(source, /["']apps\/web\/["']/);
});
