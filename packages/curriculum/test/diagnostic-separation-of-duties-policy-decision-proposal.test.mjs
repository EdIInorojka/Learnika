import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticSeparationOfDutiesPolicyDecisionProposal,
  readDiagnosticSeparationOfDutiesPolicyDecisionProposalUpstream,
  validateDiagnosticSeparationOfDutiesPolicyDecisionProposal,
  validateSeparationOfDutiesDecisionProposalChangedPaths,
  validateSeparationOfDutiesDecisionProposalWorktreeScope,
} from "../scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs";

const expectedDecisionIds = [
  "maker_checker_separation",
  "author_reviewer_approver_separation",
  "reviewer_role_incompatibilities",
  "audit_observer_separation",
  "conflict_of_interest_dependency",
  "emergency_exception_boundaries",
  "violation_handling",
  "future_enforcement_evidence",
  "future_policy_gate_requirements",
];
const expectedMarkers = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NON_OPERATIONAL: true,
  NOT_ASSIGNED: true,
  NOT_ENFORCED: true,
  NOT_APPROVED: true,
  NOT_USABLE_FOR_REVIEW: true,
  NOT_USABLE_FOR_PRODUCTION: true,
};
const approvedWave6Slice4ChangedPaths = [
  "docs/wave-6/diagnostic-separation-of-duties-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-4-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs",
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
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-canonicalization-digest-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  return {
    artifact: await readDiagnosticSeparationOfDutiesPolicyDecisionProposal(),
    upstream: await readDiagnosticSeparationOfDutiesPolicyDecisionProposalUpstream(),
  };
}

function validate(artifacts, artifact = artifacts.artifact, upstream = artifacts.upstream) {
  return validateDiagnosticSeparationOfDutiesPolicyDecisionProposal(artifact, upstream);
}

test("proposal is valid, deferred and non-production", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    proposalArtifactVersion: "wave-6.slice-4.grade-7-9-math.v1",
    proposalVersion: "wave-6.slice-4.diagnostic-separation-of-duties-policy.proposal.v1",
    proposalStatus: "PROPOSED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    syntheticExampleCount: 8,
    acceptedSyntheticExampleCount: 4,
    rejectedSyntheticExampleCount: 4,
    unresolvedDecisionCount: 9,
    activeEnforcementRuleCount: 0,
    satisfiedPrerequisiteCount: 0,
    reviewerIdentityCount: 0,
    reviewerAssignmentCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    workflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("all seven upstream artifact pins are exact", async () => {
  const artifacts = await readArtifacts();
  for (const mutate of [
    (artifact) => (artifact.metadata.activationPrerequisitesArtifactVersion = "stale"),
    (artifact) => (artifact.metadata.separationOfDutiesPolicyPlaceholderArtifactVersion = "stale"),
    (artifact) =>
      (artifact.metadata.reviewerRoleOwnershipDecisionProposalArtifactVersion = "stale"),
    (artifact) => (artifact.metadata.conflictOfInterestPolicyPlaceholderArtifactVersion = "stale"),
    (artifact) => (artifact.metadata.auditIdentityPolicyPlaceholderArtifactVersion = "stale"),
    (artifact) => (artifact.metadata.reviewAuthorityArtifactVersion = "stale"),
    (artifact) => (artifact.metadata.reviewWorkflowStateArtifactVersion = "stale"),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() => validate(artifacts, invalid));
  }

  const upstream = clone(artifacts.upstream);
  upstream.separationPlaceholder.policyIdentity.policyState = "ACTIVE";
  assert.throws(() => validate(artifacts, artifacts.artifact, upstream), /policyState/);
});

test("readiness activation workflow and prerequisite remain blocked", async () => {
  const artifacts = await readArtifacts();
  for (const mutate of [
    (artifact) => (artifact.currentBaseline.readiness.status = "READY"),
    (artifact) => artifact.currentBaseline.readiness.blockingReasons.reverse(),
    (artifact) => (artifact.currentBaseline.activation.status = "ACTIVE"),
    (artifact) => (artifact.currentBaseline.activation.workflowStatus = "ACTIVE"),
    (artifact) => (artifact.currentBaseline.separationOfDutiesPrerequisite.status = "SATISFIED"),
    (artifact) => (artifact.currentBaseline.satisfiedPrerequisiteCount = 1),
    (artifact) => (artifact.proposalBoundary.prerequisiteSatisfactionAllowed = true),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() => validate(artifacts, invalid));
  }
});

test("nine policy areas and unresolved decisions remain exact", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.unresolvedDecisions.map(({ decisionId }) => decisionId),
    expectedDecisionIds,
  );
  assert.equal(Object.keys(artifacts.artifact.proposedPolicy).length, 10);
  for (const mutate of [
    (artifact) => (artifact.unresolvedDecisions[0].state = "APPROVED"),
    (artifact) => artifact.unresolvedDecisions.pop(),
    (artifact) => (artifact.proposedPolicy.makerCheckerSeparation.ruleActive = true),
    (artifact) =>
      (artifact.proposedPolicy.authorReviewerApproverSeparation.reviewerMayApprove = true),
    (artifact) => (artifact.proposedPolicy.conflictOfInterestDependency.dependencySatisfied = true),
    (artifact) =>
      (artifact.proposedPolicy.emergencyExceptionBoundaries.productionBypassAllowed = true),
    (artifact) => (artifact.proposedPolicy.futurePolicyGateRequirements.policyGatePassed = true),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() => validate(artifacts, invalid));
  }
});

test("synthetic vectors stay marker-complete and non-operational", async () => {
  const artifacts = await readArtifacts();
  const vectors = artifacts.artifact.syntheticExamples;
  assert.equal(
    vectors.filter(({ vectorType }) => vectorType === "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR").length,
    4,
  );
  assert.equal(
    vectors.filter(({ vectorType }) => vectorType === "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR").length,
    4,
  );
  for (const vector of vectors) assert.deepEqual(vector.markers, expectedMarkers);
  for (const mutate of [
    (artifact) => delete artifact.syntheticExamples[0].markers.NON_OPERATIONAL,
    (artifact) => (artifact.syntheticExamples[0].abstractInputTokens[0] = "OPERATIVE_TOKEN"),
    (artifact) => (artifact.syntheticExamples[4].rejectionReasonCode = null),
    (artifact) => (artifact.syntheticExamples[0].vectorType = "ACTIVE_VECTOR"),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() => validate(artifacts, invalid));
  }
});

test("operational arrays and counts remain empty or zero", async () => {
  const artifacts = await readArtifacts();
  for (const mutate of [
    (artifact) => artifact.policyDecisionRecords.push({ synthetic: true }),
    (artifact) => artifact.reviewerIdentityRecords.push({ synthetic: true }),
    (artifact) => artifact.reviewerAssignmentRecords.push({ synthetic: true }),
    (artifact) => artifact.enforcementEvidenceRecords.push({ synthetic: true }),
    (artifact) => artifact.productionApprovalRecords.push({ synthetic: true }),
    (artifact) => (artifact.aggregate.activeEnforcementRuleCount = 1),
    (artifact) => (artifact.aggregate.reviewerIdentityCount = 1),
    (artifact) => (artifact.aggregate.productionApprovalCount = 1),
    (artifact) => (artifact.recordBoundary.runtimeSeparationEnforcementEnabled = true),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() => validate(artifacts, invalid));
  }
});

test("private runtime and content material fails closed", async () => {
  const artifacts = await readArtifacts();
  for (const value of [
    "person@example.invalid",
    "https://example.invalid/private",
    "00000000-0000-0000-0000-000000000000",
    "reviewer:private",
    "account_123456",
    "+7 (912) 345-67-89",
    "0123456789abcdef0123456789abcdef",
    "dcandidate.math.g7-9.algebra.example.v1",
    "finalAnswer",
    "providerPayload",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.syntheticExamples[0].vectorRef = value;
    assert.throws(() => validate(artifacts, invalid), undefined, value);
  }
  const runtimeField = clone(artifacts.artifact);
  runtimeField.proposalBoundary.runtimeHandler = "enabled";
  assert.throws(() => validate(artifacts, runtimeField), /forbidden field term|unexpected/);
});

test("Slice 4 worktree guard is exact, duplicate-safe and fail-closed", () => {
  assert.equal(approvedWave6Slice4ChangedPaths.length, 40);
  assert.deepEqual(
    validateSeparationOfDutiesDecisionProposalChangedPaths(approvedWave6Slice4ChangedPaths),
    approvedWave6Slice4ChangedPaths,
  );
  assert.deepEqual(
    validateSeparationOfDutiesDecisionProposalWorktreeScope([], {
      env: { GITHUB_ACTIONS: "false" },
    }),
    [],
  );
  assert.throws(
    () =>
      validateSeparationOfDutiesDecisionProposalChangedPaths([
        ...approvedWave6Slice4ChangedPaths,
        approvedWave6Slice4ChangedPaths[0],
      ]),
    /duplicates/,
  );
  assert.throws(
    () =>
      validateSeparationOfDutiesDecisionProposalChangedPaths(
        approvedWave6Slice4ChangedPaths.slice(1),
      ),
    /exactly 40 changed paths/,
  );
  for (const forbiddenPath of [
    "docs/wave-6/nested/diagnostic-separation-of-duties-policy-decision-proposal.md",
    "docs/wave-6/slice-5-implementation-note.md",
    "packages/curriculum/diagnostic-separation-of-duties-policy-decision-proposal/extra.json",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-separation-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateSeparationOfDutiesDecisionProposalChangedPaths([forbiddenPath]),
      /Wave 6 Slice 4 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root registration is exact and no broad allowlist exists", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  for (const registration of [
    "node packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  ]) {
    assert.equal(packageJson.scripts.test.split(registration).length - 1, 1, registration);
  }
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-6\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /startsWith\(["']docs\/wave-6\//);
  assert.doesNotMatch(source, /startsWith\(["']packages\/curriculum\//);
  assert.doesNotMatch(source, /startsWith\(["']apps\/api\//);
});
