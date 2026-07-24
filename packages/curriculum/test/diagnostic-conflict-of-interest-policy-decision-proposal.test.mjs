import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  collectConflictOfInterestDecisionProposalChangedPaths,
  readDiagnosticConflictOfInterestPolicyDecisionProposal,
  readDiagnosticConflictOfInterestPolicyDecisionProposalUpstream,
  validateConflictOfInterestDecisionProposalChangedPaths,
  validateConflictOfInterestDecisionProposalSlice6ChangedPaths,
  validateConflictOfInterestDecisionProposalSlice7ChangedPaths,
  validateConflictOfInterestDecisionProposalWorktreeScope,
  validateDiagnosticConflictOfInterestPolicyDecisionProposal,
} from "../scripts/validate-diagnostic-conflict-of-interest-policy-decision-proposal.mjs";

const expectedDecisionIds = [
  "conflict_relationship_taxonomy",
  "self_disclosure_boundary",
  "candidate_content_source_relationships",
  "commercial_financial_relationships",
  "recusal_reassignment_requirements",
  "late_disclosure_handling",
  "waiver_exception_boundaries",
  "escalation_authority",
  "future_audit_evidence_requirements",
  "separation_of_duties_dependency",
];
const expectedMarkers = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NON_OPERATIONAL: true,
  NOT_ASSIGNED: true,
  NOT_EVALUATED: true,
  NOT_APPROVED: true,
  NOT_USABLE_FOR_REVIEW: true,
  NOT_USABLE_FOR_PRODUCTION: true,
};
const approvedWave6Slice5ChangedPaths = [
  "docs/wave-6/diagnostic-conflict-of-interest-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-5-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-conflict-of-interest-policy-decision-proposal/grade-7-9-math.conflict-of-interest-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy-decision-proposal.mjs",
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
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];
const slice5PrimaryOnlyPaths = new Set([
  "docs/wave-6/diagnostic-conflict-of-interest-policy-decision-proposal.md",
  "docs/wave-6/slice-5-implementation-note.md",
  "packages/curriculum/diagnostic-conflict-of-interest-policy-decision-proposal/grade-7-9-math.conflict-of-interest-policy-decision-proposal.v1.json",
]);
const approvedWave6Slice6ChangedPaths = [
  ...approvedWave6Slice5ChangedPaths.filter((path) => !slice5PrimaryOnlyPaths.has(path)),
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy-decision-proposal.test.mjs",
];
const slice6PrimaryOnlyPaths = new Set([
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
]);
const approvedWave6Slice7ChangedPaths = [
  ...approvedWave6Slice6ChangedPaths.filter((path) => !slice6PrimaryOnlyPaths.has(path)),
  "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
  "docs/wave-6/slice-7-implementation-note.md",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nameStatusOutput(paths) {
  return paths.map((value) => `M\0${value}\0`).join("");
}

async function readArtifacts() {
  return {
    artifact: await readDiagnosticConflictOfInterestPolicyDecisionProposal(),
    upstream: await readDiagnosticConflictOfInterestPolicyDecisionProposalUpstream(),
  };
}

function validate(artifacts, artifact = artifacts.artifact, upstream = artifacts.upstream) {
  return validateDiagnosticConflictOfInterestPolicyDecisionProposal(artifact, upstream);
}

test("proposal is valid, deferred and non-production", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    proposalArtifactVersion: "wave-6.slice-5.grade-7-9-math.v1",
    proposalVersion: "wave-6.slice-5.diagnostic-conflict-of-interest-policy.proposal.v1",
    proposalStatus: "PROPOSED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    separationDependencyStatus: "UNRESOLVED_DEFERRED",
    syntheticExampleCount: 8,
    acceptedSyntheticExampleCount: 4,
    rejectedSyntheticExampleCount: 4,
    unresolvedDecisionCount: 10,
    activeConflictRuleCount: 0,
    satisfiedPrerequisiteCount: 0,
    conflictDisclosureCount: 0,
    recusalCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    workflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("all eight upstream artifact pins are exact", async () => {
  const artifacts = await readArtifacts();
  for (const mutate of [
    (artifact) => (artifact.metadata.activationPrerequisitesArtifactVersion = "stale"),
    (artifact) => (artifact.metadata.conflictOfInterestPolicyPlaceholderArtifactVersion = "stale"),
    (artifact) => (artifact.metadata.separationOfDutiesDecisionProposalArtifactVersion = "stale"),
    (artifact) =>
      (artifact.metadata.reviewerRoleOwnershipDecisionProposalArtifactVersion = "stale"),
    (artifact) => (artifact.metadata.auditIdentityPolicyPlaceholderArtifactVersion = "stale"),
    (artifact) =>
      (artifact.metadata.evidenceStorageRetentionPolicyPlaceholderArtifactVersion = "stale"),
    (artifact) => (artifact.metadata.reviewAuthorityArtifactVersion = "stale"),
    (artifact) => (artifact.metadata.reviewWorkflowStateArtifactVersion = "stale"),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() => validate(artifacts, invalid));
  }
});

test("Slice 4 dependency remains exact unresolved and non-authorizing", async () => {
  const artifacts = await readArtifacts();
  for (const mutate of [
    (artifact) =>
      (artifact.upstreamReferences.separationOfDutiesDecisionProposal.proposalStatus = "APPROVED"),
    (artifact) =>
      (artifact.upstreamReferences.separationOfDutiesDecisionProposal.prerequisiteStatus =
        "SATISFIED"),
    (artifact) => (artifact.proposedPolicy.separationOfDutiesDependency.dependencySatisfied = true),
    (artifact) => (artifact.proposedPolicy.separationOfDutiesDependency.enforcementActive = true),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() => validate(artifacts, invalid));
  }
  const upstream = clone(artifacts.upstream);
  upstream.separationProposal.proposalBoundary.enforcementAllowed = true;
  assert.throws(() => validate(artifacts, artifacts.artifact, upstream), /enforcementAllowed/);
});

test("readiness activation workflow and conflict prerequisite remain blocked", async () => {
  const artifacts = await readArtifacts();
  for (const mutate of [
    (artifact) => (artifact.currentBaseline.readiness.status = "READY"),
    (artifact) => artifact.currentBaseline.readiness.blockingReasons.reverse(),
    (artifact) => (artifact.currentBaseline.activation.status = "ACTIVE"),
    (artifact) => (artifact.currentBaseline.activation.workflowStatus = "ACTIVE"),
    (artifact) => (artifact.currentBaseline.conflictOfInterestPrerequisite.status = "SATISFIED"),
    (artifact) => (artifact.currentBaseline.satisfiedPrerequisiteCount = 1),
    (artifact) => (artifact.proposalBoundary.prerequisiteSatisfactionAllowed = true),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() => validate(artifacts, invalid));
  }
});

test("ten policy areas and unresolved decisions remain exact", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.unresolvedDecisions.map(({ decisionId }) => decisionId),
    expectedDecisionIds,
  );
  assert.equal(Object.keys(artifacts.artifact.proposedPolicy).length, 11);
  for (const mutate of [
    (artifact) => (artifact.unresolvedDecisions[0].state = "APPROVED"),
    (artifact) => artifact.unresolvedDecisions.pop(),
    (artifact) => (artifact.proposedPolicy.conflictRelationshipTaxonomy.ruleActive = true),
    (artifact) => (artifact.proposedPolicy.selfDisclosureBoundary.selfClearanceAllowed = true),
    (artifact) =>
      (artifact.proposedPolicy.candidateContentSourceRelationships.identityComparisonAllowed = true),
    (artifact) =>
      (artifact.proposedPolicy.commercialFinancialRelationships.providerIntegrationAllowed = true),
    (artifact) =>
      (artifact.proposedPolicy.recusalReassignmentRequirements.reassignmentAllowed = true),
    (artifact) => (artifact.proposedPolicy.lateDisclosureHandling.processingActive = true),
    (artifact) =>
      (artifact.proposedPolicy.waiverExceptionBoundaries.productionBypassAllowed = true),
    (artifact) => (artifact.proposedPolicy.escalationAuthority.authorityAssigned = true),
    (artifact) => (artifact.proposedPolicy.futureAuditEvidenceRequirements.evidenceRecorded = true),
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
    (artifact) => delete artifact.syntheticExamples[0].markers.NOT_EVALUATED,
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
    (artifact) => artifact.conflictDisclosureRecords.push({ synthetic: true }),
    (artifact) => artifact.recusalRecords.push({ synthetic: true }),
    (artifact) => artifact.auditEvidenceRecords.push({ synthetic: true }),
    (artifact) => artifact.productionApprovalRecords.push({ synthetic: true }),
    (artifact) => (artifact.aggregate.activeConflictRuleCount = 1),
    (artifact) => (artifact.aggregate.satisfiedPrerequisiteCount = 1),
    (artifact) => (artifact.aggregate.productionApprovalCount = 1),
    (artifact) => (artifact.recordBoundary.runtimeConflictEvaluationEnabled = true),
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

test("Slice 5 worktree guard is exact duplicate-safe cumulative and fail-closed", () => {
  assert.equal(approvedWave6Slice5ChangedPaths.length, 42);
  assert.deepEqual(
    validateConflictOfInterestDecisionProposalChangedPaths(approvedWave6Slice5ChangedPaths),
    approvedWave6Slice5ChangedPaths,
  );
  assert.deepEqual(
    validateConflictOfInterestDecisionProposalWorktreeScope([], {
      env: { GITHUB_ACTIONS: "false" },
    }),
    [],
  );
  assert.throws(
    () =>
      validateConflictOfInterestDecisionProposalChangedPaths([
        ...approvedWave6Slice5ChangedPaths,
        approvedWave6Slice5ChangedPaths[0],
      ]),
    /duplicates/,
  );
  assert.throws(
    () =>
      validateConflictOfInterestDecisionProposalChangedPaths(
        approvedWave6Slice5ChangedPaths.slice(1),
      ),
    /exactly 42 changed paths/,
  );
  for (const forbiddenPath of [
    "docs/wave-6/nested/diagnostic-conflict-of-interest-policy-decision-proposal.md",
    "docs/wave-6/slice-6-implementation-note.md",
    "packages/curriculum/diagnostic-conflict-of-interest-policy-decision-proposal/extra.json",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-conflict-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateConflictOfInterestDecisionProposalChangedPaths([forbiddenPath]),
      /Wave 6 Slice 5 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 5 guard admits the exact cumulative Slice 6 continuation", () => {
  assert.equal(approvedWave6Slice6ChangedPaths.length, 44);
  assert.deepEqual(
    validateConflictOfInterestDecisionProposalSlice6ChangedPaths(approvedWave6Slice6ChangedPaths),
    approvedWave6Slice6ChangedPaths,
  );
  assert.deepEqual(
    validateConflictOfInterestDecisionProposalWorktreeScope(approvedWave6Slice6ChangedPaths, {
      env: { GITHUB_ACTIONS: "false" },
    }),
    approvedWave6Slice6ChangedPaths,
  );
  assert.throws(
    () =>
      validateConflictOfInterestDecisionProposalSlice6ChangedPaths(
        approvedWave6Slice6ChangedPaths.slice(1),
      ),
    /requires exactly 44 changed paths/,
  );
});

test("Slice 5 guard admits the exact cumulative Slice 7 continuation", () => {
  assert.equal(approvedWave6Slice7ChangedPaths.length, 46);
  assert.deepEqual(
    validateConflictOfInterestDecisionProposalSlice7ChangedPaths(approvedWave6Slice7ChangedPaths),
    approvedWave6Slice7ChangedPaths,
  );
  assert.deepEqual(
    validateConflictOfInterestDecisionProposalWorktreeScope(approvedWave6Slice7ChangedPaths, {
      env: { GITHUB_ACTIONS: "false" },
    }),
    approvedWave6Slice7ChangedPaths,
  );
});

test("clean CI current-commit range preserves exact Slice 5 validation", () => {
  const base = "1".repeat(40);
  const head = "2".repeat(40);
  const paths = collectConflictOfInterestDecisionProposalChangedPaths({
    cwd: "fixture-repo",
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_NAME: "workflow_dispatch",
      GITHUB_SHA: head,
    },
    runGit: (args) => {
      if (args[0] === "rev-list") {
        return { status: 0, stdout: `${head} ${base}\n`, stderr: "" };
      }
      if (args[0] === "diff") {
        return { status: 0, stdout: nameStatusOutput(approvedWave6Slice5ChangedPaths), stderr: "" };
      }
      return { status: 0, stdout: "", stderr: "" };
    },
  });
  assert.deepEqual(paths, approvedWave6Slice5ChangedPaths);
  assert.deepEqual(
    validateConflictOfInterestDecisionProposalWorktreeScope(paths, {
      env: { GITHUB_ACTIONS: "true" },
    }),
    paths,
  );
});

test("root registration is exact and no broad allowlist exists", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  for (const registration of [
    "node packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy-decision-proposal.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-conflict-of-interest-policy-decision-proposal.test.mjs",
  ]) {
    assert.equal(packageJson.scripts.test.split(registration).length - 1, 1, registration);
  }
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-conflict-of-interest-policy-decision-proposal.mjs",
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
