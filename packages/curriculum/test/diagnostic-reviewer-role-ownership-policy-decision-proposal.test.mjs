import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticReviewerRoleOwnershipDecisionProposal,
  readDiagnosticReviewerRoleOwnershipDecisionProposalUpstream,
  validateDiagnosticReviewerRoleOwnershipDecisionProposal,
  validateReviewerRoleOwnershipDecisionProposalChangedPaths,
} from "../scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs";

const expectedMarkers = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NOT_A_REAL_ROLE_OWNER: true,
  NOT_ASSIGNED: true,
  NOT_AUTHORIZED: true,
  NOT_ACTIVE: true,
  NOT_USABLE_FOR_REVIEW: true,
  NOT_USABLE_FOR_PRODUCTION: true,
};
const approvedWave6Slice3ChangedPaths = [
  "docs/wave-6/diagnostic-reviewer-role-ownership-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-3-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
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
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-canonicalization-digest-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  return {
    artifact: await readDiagnosticReviewerRoleOwnershipDecisionProposal(),
    upstream: await readDiagnosticReviewerRoleOwnershipDecisionProposalUpstream(),
  };
}

test("proposal remains deferred and non-production", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    validateDiagnosticReviewerRoleOwnershipDecisionProposal(artifacts.artifact, artifacts.upstream),
    {
      proposalArtifactVersion: "wave-6.slice-3.grade-7-9-math.v1",
      proposalVersion: "wave-6.slice-3.diagnostic-reviewer-role-ownership-policy.proposal.v1",
      proposalStatus: "PROPOSED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      syntheticExampleCount: 8,
      acceptedSyntheticExampleCount: 4,
      rejectedSyntheticExampleCount: 4,
      unresolvedDecisionCount: 8,
      roleTaxonomyPlaceholderCount: 7,
      ownerAssignmentCount: 0,
      reviewerAssignmentCount: 0,
      productionApprovalCount: 0,
      activationStatus: "BLOCKED",
      workflowStatus: "INACTIVE",
      readiness: "NOT_READY",
    },
  );
});

test("upstream pins, role taxonomy and eight decisions are exact", async () => {
  const artifacts = await readArtifacts();
  assert.equal(artifacts.artifact.roleTaxonomyPlaceholders.length, 7);
  assert.deepEqual(
    artifacts.artifact.unresolvedDecisions.map(({ decisionId }) => decisionId),
    [
      "accountable_role_ownership",
      "role_eligibility_competence_and_independence",
      "appointment_and_assignment_authority",
      "scope_minimum_counts_quorum_and_decision_aggregation",
      "reviewer_lifecycle_expiry_suspension_and_reassignment",
      "delegation_revocation_and_emergency_coverage",
      "policy_maintenance_and_access_review_ownership",
      "reviewer_and_audit_identity_separation",
    ],
  );
  for (const mutate of [
    (artifact) => (artifact.metadata.reviewAuthorityArtifactVersion = "stale"),
    (artifact) =>
      (artifact.upstreamReferences.canonicalizationDigestDecisionProposal.proposalStatus =
        "APPROVED"),
    (artifact) => artifact.roleTaxonomyPlaceholders.pop(),
    (artifact) => (artifact.unresolvedDecisions[0].state = "APPROVED"),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() =>
      validateDiagnosticReviewerRoleOwnershipDecisionProposal(invalid, artifacts.upstream),
    );
  }
});

test("baseline, proposal boundary and zero operational records are fail-closed", async () => {
  const artifacts = await readArtifacts();
  for (const mutate of [
    (artifact) => (artifact.currentBaseline.readiness.status = "READY"),
    (artifact) => (artifact.currentBaseline.activation.status = "ACTIVE"),
    (artifact) => (artifact.currentBaseline.reviewerRoleOwnershipPrerequisite.status = "SATISFIED"),
    (artifact) => (artifact.proposalBoundary.policyApproved = true),
    (artifact) => (artifact.aggregate.roleOwnerCount = 1),
    (artifact) => artifact.roleOwnerRecords.push({ synthetic: true }),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() =>
      validateDiagnosticReviewerRoleOwnershipDecisionProposal(invalid, artifacts.upstream),
    );
  }
});

test("synthetic markers and rejected vectors are complete", async () => {
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
    (artifact) => delete artifact.syntheticExamples[0].markers.NOT_ACTIVE,
    (artifact) => (artifact.syntheticExamples[4].rejectionReasonCode = ""),
    (artifact) => (artifact.syntheticExamples[0].abstractInputTokens[0] = "REAL_ROLE"),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() =>
      validateDiagnosticReviewerRoleOwnershipDecisionProposal(invalid, artifacts.upstream),
    );
  }
});

test("role-placeholder literals are allowed only in their exact taxonomy fields", async () => {
  const artifacts = await readArtifacts();
  const outsideTaxonomy = clone(artifacts.artifact);
  outsideTaxonomy.syntheticExamples[0].vectorRef = "METHODOLOGY_REVIEWER_PLACEHOLDER";
  assert.throws(
    () =>
      validateDiagnosticReviewerRoleOwnershipDecisionProposal(outsideTaxonomy, artifacts.upstream),
    /outside its intended taxonomy field/,
  );

  const wrongTaxonomyPosition = clone(artifacts.artifact);
  wrongTaxonomyPosition.roleTaxonomyPlaceholders[0].rolePlaceholderId =
    "SAFETY_REVIEWER_PLACEHOLDER";
  assert.throws(
    () =>
      validateDiagnosticReviewerRoleOwnershipDecisionProposal(
        wrongTaxonomyPosition,
        artifacts.upstream,
      ),
    /outside its intended taxonomy field/,
  );

  const nearMiss = clone(artifacts.artifact);
  nearMiss.roleTaxonomyPlaceholders[0].rolePlaceholderId = "METHODOLOGY_REVIEWER_PLACEHOLDER_EXTRA";
  assert.throws(
    () => validateDiagnosticReviewerRoleOwnershipDecisionProposal(nearMiss, artifacts.upstream),
    /exact static role-placeholder literal/,
  );
});

test("forbidden, identity-like and hash-like values fail closed", async () => {
  const artifacts = await readArtifacts();
  for (const value of [
    "person@example.invalid",
    "https://example.invalid/path",
    "00000000-0000-0000-0000-000000000000",
    "reviewer:abc",
    "reviewer_identity_abc",
    "audit-id-abc",
    "account_123",
    "+7 (912) 345-67-89",
    "0123456789abcdef0123456789abcdef",
    "dcandidate.math.g7-9.algebra.example.v1",
    "finalAnswer",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.syntheticExamples[0].vectorRef = value;
    assert.throws(
      () => validateDiagnosticReviewerRoleOwnershipDecisionProposal(invalid, artifacts.upstream),
      undefined,
      value,
    );
  }
});

test("scope guard admits only the exact cumulative Slice 3 worktree", () => {
  assert.equal(approvedWave6Slice3ChangedPaths.length, 38);
  assert.deepEqual(
    validateReviewerRoleOwnershipDecisionProposalChangedPaths(approvedWave6Slice3ChangedPaths),
    approvedWave6Slice3ChangedPaths,
  );
  for (const forbiddenPath of [
    "docs/wave-6/archive/diagnostic-reviewer-role-ownership-policy-decision-proposal.md",
    "docs/wave-6/slice-3-implementation-note.md.bak",
    "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/extra.json",
    "apps/api/src/diagnostic-reviewer/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/reviewer/page.tsx",
    "packages/curriculum/src/diagnostic-reviewer-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateReviewerRoleOwnershipDecisionProposalChangedPaths([forbiddenPath]),
      /Wave 6 Slice 3 out-of-scope path changed/,
    );
  }
});

test("root registration is exact and validator has no broad allowlist", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  for (const registration of [
    "node packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  ])
    assert.equal(packageJson.scripts.test.split(registration).length - 1, 1, registration);
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-6\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /startsWith\(["']docs\/wave-6\//);
  assert.doesNotMatch(source, /startsWith\(["']apps\/api\//);
});
