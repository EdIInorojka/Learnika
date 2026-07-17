import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticReadinessIntegrationPlan,
  readDiagnosticReadinessIntegrationPlanUpstreamArtifacts,
  normalizeReadinessIntegrationPlanStatusPaths,
  validateDiagnosticReadinessIntegrationPlan,
  validateReadinessIntegrationPlanChangedPaths,
} from "../scripts/validate-diagnostic-readiness-integration-plan.mjs";

const expectedBlockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];
const expectedRequirementIds = [
  "readiness_input_contract_and_version_pins",
  "activation_prerequisite_reconciliation",
  "blocker_reconciliation_and_reopening",
  "production_approval_input_requirements",
  "coverage_completion_input_requirements",
  "evidence_digest_identity_dependency_requirements",
  "readiness_transition_guard_and_authority",
  "withdrawal_and_readiness_rollback",
  "ci_validation_gate_and_negative_vectors",
  "readiness_policy_change_and_activation_sequencing",
];
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
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
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
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];
const protectedRecordFields = [
  "readinessInputRecords",
  "blockerReconciliationRecords",
  "blockerClosureRecords",
  "productionApprovalInputRecords",
  "coverageCompletionInputRecords",
  "evidenceDependencyRecords",
  "digestDependencyRecords",
  "identityDependencyRecords",
  "readinessTransitionRecords",
  "readinessRollbackRecords",
  "prerequisiteSatisfactionRecords",
  "ciGateExecutionRecords",
  "readyStateRecords",
  "realDiagnosticItemRecords",
  "realCandidateRecords",
  "approvedCandidateRecords",
  "productionApproverRecords",
  "productionApprovalRecords",
  "reviewEvidenceRecords",
  "reviewDecisionRecords",
  "digestValueRecords",
  "candidateIdentityRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "authorityGrantRecords",
  "approvalDecisionRecords",
  "auditLogRecords",
  "auditEventRecords",
];

async function loadFixture() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticReadinessIntegrationPlan(),
    readDiagnosticReadinessIntegrationPlanUpstreamArtifacts(),
  ]);
  return { artifact, upstream };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function collectStringValues(value, result = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectStringValues(item, result));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStringValues(item, result));
  } else if (typeof value === "string") {
    result.push(value);
  }
  return result;
}

test("readiness integration plan placeholder is valid and unresolved", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(validateDiagnosticReadinessIntegrationPlan(artifact, upstream), {
    planArtifactVersion: "wave-5.slice-12.grade-7-9-math.v1",
    planVersion: "wave-5.slice-12.diagnostic-readiness-integration-plan.placeholder.v1",
    planState: "UNRESOLVED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    blockingReasonCount: 2,
    openBlockingReasonCount: 2,
    closedBlockingReasonCount: 0,
    decisionRequirementCount: 10,
    satisfiedPrerequisiteCount: 0,
    activeIntegrationRuleCount: 0,
    readinessTransitionRecordCount: 0,
    readyStateRecordCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("readiness integration prerequisite remains exact and unsatisfied", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(artifact.prerequisiteReference, {
    prerequisiteId: "readiness_integration_plan",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future fail-closed readiness reconciliation design with stale-reference, invalidation and withdrawal tests.",
    evidenceRecordRefs: [],
  });
  for (const mutation of [
    (changed) => (changed.prerequisiteReference.status = "SATISFIED"),
    (changed) => changed.prerequisiteReference.evidenceRecordRefs.push("recorded"),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticReadinessIntegrationPlan(changed, upstream));
  }
});

test("all exact upstream artifact and readiness source pins remain unchanged", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(artifact.dependencyReferences).map(([key, value]) => [
        key,
        value.artifactVersion ?? value.policyVersion,
      ]),
    ),
    {
      activationPrerequisites: "wave-5.slice-2.grade-7-9-math.v1",
      coverageGapClosurePlan: "wave-5.slice-11.grade-7-9-math.v1",
      productionApprovalAuthorityPolicy: "wave-5.slice-10.grade-7-9-math.v1",
      reviewCoverage: "wave-4.slice-2.grade-7-9-math.v1",
      diagnosticReadinessPolicySource: "wave-3-slice-11-diagnostic-readiness-policy-v1",
    },
  );
  assert.deepEqual(artifact.dependencyReferences.diagnosticReadinessPolicySource, {
    policyVersion: "wave-3-slice-11-diagnostic-readiness-policy-v1",
    evaluationVersion: "wave-3.slice-11.grade-7-9-math.v1",
    policySourcePath:
      "apps/api/src/diagnostic-readiness-policy/diagnostic-readiness-policy.types.ts",
    currentEvaluationContractMode: "METADATA_ONLY_FAIL_CLOSED",
    policyImplementationChangeAllowed: false,
    runtimeIntegrationAllowed: false,
  });
  const sourceDrift = { ...upstream, readinessPolicySource: "export const changed = true;" };
  assert.throws(() => validateDiagnosticReadinessIntegrationPlan(artifact, sourceDrift));
});

test("current readiness baseline remains exact blocked and inactive", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(artifact.currentReadinessBaseline, {
    policyVersion: "wave-3-slice-11-diagnostic-readiness-policy-v1",
    evaluationVersion: "wave-3.slice-11.grade-7-9-math.v1",
    status: "NOT_READY",
    blockingReasons: expectedBlockingReasons,
    blockingReasonCount: 2,
    openBlockingReasonCount: 2,
    closedBlockingReasonCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    eligibleForReadyTransition: false,
    readyStateRecorded: false,
    readinessTransitionRecorded: false,
    policyImplementationChanged: false,
  });
  for (const mutation of [
    (changed) => (changed.currentReadinessBaseline.status = "READY"),
    (changed) => (changed.currentReadinessBaseline.activationStatus = "ACTIVE"),
    (changed) => (changed.currentReadinessBaseline.reviewWorkflowStatus = "ACTIVE"),
    (changed) => (changed.currentReadinessBaseline.eligibleForReadyTransition = true),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticReadinessIntegrationPlan(changed, upstream));
  }
});

test("both current blockers remain exact open and unresolved", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(
    artifact.currentBlockers.map((blocker) => blocker.blockingReason),
    expectedBlockingReasons,
  );
  assert.ok(
    artifact.currentBlockers.every(
      (blocker) =>
        blocker.blockerState === "OPEN_UNRESOLVED" &&
        blocker.closureRecorded === false &&
        blocker.closureEvidenceReferences.length === 0 &&
        blocker.readinessRemovalAllowed === false,
    ),
  );
  for (const mutation of [
    (changed) => changed.currentBlockers.pop(),
    (changed) => changed.currentBlockers.reverse(),
    (changed) => (changed.currentBlockers[0].blockerState = "CLOSED"),
    (changed) => (changed.currentBlockers[0].closureRecorded = true),
    (changed) => (changed.currentBlockers[0].readinessRemovalAllowed = true),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticReadinessIntegrationPlan(changed, upstream));
  }
});

test("all eight future integration placeholders remain disabled", async () => {
  const { artifact, upstream } = await loadFixture();
  const mutations = [
    (changed) => (changed.readinessInputPrerequisitesPlaceholder.inputEvaluationAllowed = true),
    (changed) => (changed.blockerReconciliationPlaceholder.blockerClosureRecordingAllowed = true),
    (changed) => (changed.productionApprovalInputPlaceholder.inputEvaluationAllowed = true),
    (changed) => (changed.coverageCompletionInputPlaceholder.completionEvaluationAllowed = true),
    (changed) =>
      (changed.evidenceDigestIdentityDependencyPlaceholder.dependencyLinkageAllowed = true),
    (changed) =>
      (changed.readinessTransitionGuardPlaceholder.readinessTransitionEvaluationAllowed = true),
    (changed) => (changed.readinessRollbackPlaceholder.rollbackExecutionAllowed = true),
    (changed) => (changed.ciValidationGatePlaceholder.gateExecutionAllowed = true),
  ];
  for (const mutation of mutations) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticReadinessIntegrationPlan(changed, upstream));
  }
});

test("exact ten readiness integration decisions remain unresolved", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(
    artifact.decisionRequirements.map((requirement) => requirement.requirementId),
    expectedRequirementIds,
  );
  assert.ok(
    artifact.decisionRequirements.every(
      (requirement) =>
        requirement.state === "TO_BE_DECIDED" &&
        requirement.decisionReference === null &&
        requirement.policyReference === null &&
        requirement.activeRuleReferences.length === 0 &&
        requirement.decisionRecorded === false,
    ),
  );
  for (const mutation of [
    (changed) => changed.decisionRequirements.pop(),
    (changed) => changed.decisionRequirements.reverse(),
    (changed) => (changed.decisionRequirements[0].decisionRecorded = true),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticReadinessIntegrationPlan(changed, upstream));
  }
});

test("activation integration and readiness transitions remain disabled", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.equal(artifact.activationBoundary.status, "BLOCKED");
  assert.equal(artifact.activationBoundary.reviewWorkflowStatus, "INACTIVE");
  assert.deepEqual(artifact.readiness, {
    policyVersion: "wave-3-slice-11-diagnostic-readiness-policy-v1",
    evaluationVersion: "wave-3.slice-11.grade-7-9-math.v1",
    status: "NOT_READY",
    blockingReasons: expectedBlockingReasons,
  });
  for (const mutation of [
    (changed) => (changed.activationBoundary.readinessIntegrationAllowed = true),
    (changed) => (changed.activationBoundary.readinessTransitionAllowed = true),
    (changed) => (changed.activationBoundary.prerequisiteSatisfactionAllowed = true),
    (changed) => (changed.readiness.status = "READY"),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticReadinessIntegrationPlan(changed, upstream));
  }
});

test("artifact contains no standalone READY state value", async () => {
  const { artifact } = await loadFixture();
  assert.equal(collectStringValues(artifact).includes("READY"), false);
});

test("all protected records and matching aggregates remain zero", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const field of protectedRecordFields) {
    assert.deepEqual(artifact[field], [], field);
  }
  assert.ok(Object.values(artifact.recordBoundary).every((value) => value === false));
  for (const [field, value] of Object.entries(artifact.aggregate)) {
    if (
      ![
        "decisionRequirementCount",
        "undecidedRequirementCount",
        "blockingReasonCount",
        "openBlockingReasonCount",
      ].includes(field)
    ) {
      assert.equal(value, 0, field);
    }
  }
  const changed = clone(artifact);
  changed.readinessTransitionRecords.push({ state: "recorded" });
  assert.throws(() => validateDiagnosticReadinessIntegrationPlan(changed, upstream));
});

test("candidate identifiers and item payload fields fail closed", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const forbiddenField of [
    "candidateId",
    "candidateIds",
    "itemStem",
    "stemText",
    "candidateContent",
    "diagnosticItemContent",
  ]) {
    const changed = clone(artifact);
    changed.metadata[forbiddenField] = "forbidden";
    assert.throws(
      () => validateDiagnosticReadinessIntegrationPlan(changed, upstream),
      undefined,
      forbiddenField,
    );
  }
});

test("unknown fields and every requested forbidden term fail closed", async () => {
  const { artifact, upstream } = await loadFixture();
  const forbiddenTerms = [
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
    "userId",
    "accountId",
    "auditUserId",
    "auditAccountId",
    "auditEmail",
    "immutableDigest",
    "sha256",
    "contentHash",
    "canonicalizedContent",
    "normalizedStem",
    "storageObjectKey",
    "presignedUrl",
    "downloadUrl",
    "uploadUrl",
  ];
  for (const forbiddenTerm of forbiddenTerms) {
    const changed = clone(artifact);
    changed.metadata[forbiddenTerm] = "forbidden";
    assert.throws(
      () => validateDiagnosticReadinessIntegrationPlan(changed, upstream),
      undefined,
      forbiddenTerm,
    );
  }
  const unknown = clone(artifact);
  unknown.metadata.unexpectedField = false;
  assert.throws(() => validateDiagnosticReadinessIntegrationPlan(unknown, upstream));
});

test("private identity location candidate and hash-like values fail closed", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const privateValue of [
    "person@example.test",
    "https://example.test/evidence",
    "www.example.test",
    "123e4567-e89b-42d3-a456-426614174000",
    "user-abcdef12",
    "account_abcdef12",
    "dcandidate.math.fixture-01.v1",
    "candidate-abcdef12",
    "0123456789abcdef0123456789abcdef",
  ]) {
    const changed = clone(artifact);
    changed.metadata.sourceContract = privateValue;
    assert.throws(
      () => validateDiagnosticReadinessIntegrationPlan(changed, upstream),
      undefined,
      privateValue,
    );
  }
});

test("Slice 12 worktree guard permits only the exact 42 Slice 13 implementation paths", () => {
  assert.equal(expectedChangedPaths.length, 42);
  assert.equal(new Set(expectedChangedPaths).size, 42);
  assert.deepEqual(
    validateReadinessIntegrationPlanChangedPaths(expectedChangedPaths),
    expectedChangedPaths,
  );
  for (const forbiddenPath of [
    "README.md",
    "docs/wave-5/slice-15-implementation-note.md",
    "docs/wave-5/archive/diagnostic-readiness-integration-plan-contract.md",
    "docs/wave-5/diagnostic-readiness-integration-plan-contract.md.bak",
    "packages/curriculum/diagnostic-readiness-integration-plan/extra.json",
    "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs.bak",
    "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs.bak",
    "packages/curriculum/src/readiness/runtime.mjs",
    "apps/api/src/diagnostic-readiness-policy/diagnostic-readiness-policy.service.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/api/prisma/migrations/999_slice12/migration.sql",
    "apps/web/app/diagnostic-readiness/page.tsx",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
  ]) {
    assert.throws(
      () => validateReadinessIntegrationPlanChangedPaths([forbiddenPath]),
      /Wave 5 Slice 13 out-of-scope path changed/,
      forbiddenPath,
    );
  }

  const renamedPaths = normalizeReadinessIntegrationPlanStatusPaths(
    "R  apps/api/src/diagnostic-readiness-policy/runtime.ts -> docs/wave-5/slice-13-implementation-note.md",
  );
  assert.deepEqual(renamedPaths, [
    "apps/api/src/diagnostic-readiness-policy/runtime.ts",
    "docs/wave-5/slice-13-implementation-note.md",
  ]);
  assert.throws(
    () => validateReadinessIntegrationPlanChangedPaths(renamedPaths),
    /Wave 5 Slice 13 out-of-scope path changed: apps\/api\/src\/diagnostic-readiness-policy\/runtime\.ts/,
  );
});

test("root test command registers the Slice 12 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");
  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
  ]) {
    assert.equal(
      testCommand.split(exactRegistration).length - 1,
      1,
      `${exactRegistration} must occur exactly once`,
    );
  }
});

test("Slice 12 validator contains no broad documentation curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL("../scripts/validate-diagnostic-readiness-integration-plan.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
