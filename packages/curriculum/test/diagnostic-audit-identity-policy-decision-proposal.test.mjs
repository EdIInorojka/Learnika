import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  collectDiagnosticAuditIdentityDecisionProposalChangedPaths,
  readDiagnosticAuditIdentityPolicyDecisionProposal,
  readDiagnosticAuditIdentityPolicyDecisionProposalUpstream,
  validateDiagnosticAuditIdentityDecisionProposalWorktreeScope,
  validateDiagnosticAuditIdentityDecisionProposalChangedPaths,
  validateDiagnosticAuditIdentityDecisionProposalSlice7ChangedPaths,
  validateDiagnosticAuditIdentityDecisionProposalSlice8ChangedPaths,
  validateDiagnosticAuditIdentityPolicyDecisionProposal,
} from "../scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs";

const expectedDecisionIds = [
  "opaque_reviewer_reference_domain",
  "opaque_audit_reference_domain",
  "reviewer_audit_domain_separation",
  "identity_binding_authority",
  "attribution_requirements",
  "audit_actor_taxonomy",
  "authorization_snapshot_requirements",
  "privacy_and_data_exclusion",
  "correction_and_amendment_boundaries",
  "access_and_export_constraints",
  "retention_and_deletion_dependency",
  "separation_and_conflict_dependencies",
];
const approvedSlice6ChangedPaths = [
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
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
  "packages/curriculum/test/diagnostic-audit-identity-policy-decision-proposal.test.mjs",
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
const slice6PrimaryOnlyPaths = new Set([
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
]);
const approvedSlice7ChangedPaths = [
  ...approvedSlice6ChangedPaths.filter((value) => !slice6PrimaryOnlyPaths.has(value)),
  "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
  "docs/wave-6/slice-7-implementation-note.md",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
];
const slice7PrimaryOnlyPaths = new Set([
  "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
  "docs/wave-6/slice-7-implementation-note.md",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
]);
const approvedSlice8ChangedPaths = [
  ...approvedSlice7ChangedPaths.filter((value) => !slice7PrimaryOnlyPaths.has(value)),
  "docs/wave-6/diagnostic-production-approval-authority-policy-decision-proposal.md",
  "docs/wave-6/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-production-approval-authority-policy-decision-proposal/grade-7-9-math.production-approval-authority-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy-decision-proposal.test.mjs",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nameStatusOutput(paths) {
  return paths.map((value) => `M\0${value}\0`).join("");
}

async function readArtifacts() {
  return {
    artifact: await readDiagnosticAuditIdentityPolicyDecisionProposal(),
    upstream: await readDiagnosticAuditIdentityPolicyDecisionProposalUpstream(),
  };
}

test("proposal is valid, deferred and non-production", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    validateDiagnosticAuditIdentityPolicyDecisionProposal(artifacts.artifact, artifacts.upstream),
    {
      proposalArtifactVersion: "wave-6.slice-6.grade-7-9-math.v1",
      proposalVersion: "wave-6.slice-6.diagnostic-audit-identity-policy.proposal.v1",
      proposalStatus: "PROPOSED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      syntheticExampleCount: 8,
      unresolvedDecisionCount: 12,
      activeIdentityRuleCount: 0,
      satisfiedPrerequisiteCount: 0,
      auditEventCount: 0,
      productionApprovalCount: 0,
      activationStatus: "BLOCKED",
      workflowStatus: "INACTIVE",
      readiness: "NOT_READY",
    },
  );
});

test("exact upstream pins and Slice 4/Slice 5 dependencies remain non-authorizing", async () => {
  const artifacts = await readArtifacts();
  for (const mutate of [
    (artifact) => (artifact.metadata.separationOfDutiesDecisionProposalArtifactVersion = "stale"),
    (artifact) => (artifact.metadata.conflictOfInterestDecisionProposalArtifactVersion = "stale"),
    (artifact) =>
      (artifact.upstreamReferences.separationOfDutiesDecisionProposal.proposalStatus = "APPROVED"),
    (artifact) =>
      (artifact.upstreamReferences.conflictOfInterestDecisionProposal.proposalStatus = "APPROVED"),
    (artifact) =>
      (artifact.proposedPolicy.separationConflictDependencies.identityUseAllowed = true),
    (artifact) => (artifact.proposedPolicy.retentionDeletionDependency.dependencySatisfied = true),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() =>
      validateDiagnosticAuditIdentityPolicyDecisionProposal(invalid, artifacts.upstream),
    );
  }
});

test("twelve policy areas remain unresolved and all domain capabilities stay disabled", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.unresolvedDecisions.map(({ decisionId }) => decisionId),
    expectedDecisionIds,
  );
  for (const section of Object.values(artifacts.artifact.proposedPolicy).slice(1)) {
    assert.equal(section.decisionState, "UNRESOLVED_DEFERRED");
  }
  for (const mutate of [
    (artifact) =>
      (artifact.proposedPolicy.opaqueReviewerReferenceDomain.referenceIssuanceAllowed = true),
    (artifact) =>
      (artifact.proposedPolicy.opaqueAuditReferenceDomain.referenceIssuanceAllowed = true),
    (artifact) => (artifact.proposedPolicy.identityBindingAuthority.bindingAllowed = true),
    (artifact) =>
      (artifact.proposedPolicy.attributionRequirements.attributionRecordingAllowed = true),
    (artifact) =>
      (artifact.proposedPolicy.authorizationSnapshotRequirements.snapshotRecordingAllowed = true),
    (artifact) => (artifact.proposedPolicy.accessExportConstraints.bulkExportAllowed = true),
    (artifact) => (artifact.proposedPolicy.correctionAmendmentBoundaries.processingActive = true),
    (artifact) =>
      (artifact.proposedPolicy.separationConflictDependencies.identityUseAllowed = true),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() =>
      validateDiagnosticAuditIdentityPolicyDecisionProposal(invalid, artifacts.upstream),
    );
  }
});

test("baseline remains NOT_READY, BLOCKED, INACTIVE and audit prerequisite unsatisfied", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(artifacts.artifact.currentBaseline.readiness, {
    policyVersion: "wave-3-slice-11-diagnostic-readiness-policy-v1",
    status: "NOT_READY",
    blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
  });
  for (const mutate of [
    (artifact) => (artifact.currentBaseline.readiness.status = "READY"),
    (artifact) => (artifact.currentBaseline.activation.status = "ACTIVE"),
    (artifact) => (artifact.currentBaseline.activation.workflowStatus = "ACTIVE"),
    (artifact) => (artifact.currentBaseline.auditIdentityPrerequisite.status = "SATISFIED"),
    (artifact) => (artifact.currentBaseline.satisfiedPrerequisiteCount = 1),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() =>
      validateDiagnosticAuditIdentityPolicyDecisionProposal(invalid, artifacts.upstream),
    );
  }
});

test("synthetic vectors are marker-complete and operational records/counts stay zero", async () => {
  const artifacts = await readArtifacts();
  assert.equal(artifacts.artifact.syntheticExamples.length, 8);
  for (const vector of artifacts.artifact.syntheticExamples) {
    assert.deepEqual(vector.markers, {
      SYNTHETIC_EXAMPLE_ONLY: true,
      NON_OPERATIONAL: true,
      NOT_ISSUED: true,
      NOT_BOUND: true,
      NOT_ATTRIBUTED: true,
      NOT_AUTHORIZED: true,
      NOT_APPROVED: true,
      NOT_USABLE_FOR_REVIEW: true,
      NOT_USABLE_FOR_PRODUCTION: true,
    });
  }
  for (const field of [
    "policyDecisionRecords",
    "realPrincipalRecords",
    "accountRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "identityBindingRecords",
    "authorizationSnapshotRecords",
    "auditEventRecords",
    "attributionRecords",
    "exportRecords",
    "correctionRecords",
    "amendmentRecords",
    "reviewDecisionRecords",
    "productionApprovalRecords",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[field].push({ synthetic: true });
    assert.throws(() =>
      validateDiagnosticAuditIdentityPolicyDecisionProposal(invalid, artifacts.upstream),
    );
  }
  for (const [field, value] of Object.entries(artifacts.artifact.aggregate)) {
    if (
      ![
        "syntheticExampleCount",
        "acceptedSyntheticExampleCount",
        "rejectedSyntheticExampleCount",
        "unresolvedDecisionCount",
        "referenceDomainPlaceholderCount",
        "auditActorPlaceholderCount",
      ].includes(field)
    ) {
      assert.equal(value, 0, field);
    }
  }
});

test("private, runtime, content and identity-like material fails closed", async () => {
  const artifacts = await readArtifacts();
  for (const value of [
    "person@example.invalid",
    "https://example.invalid/private",
    "00000000-0000-0000-0000-000000000000",
    "reviewer-id-123456",
    "audit-ref-123456",
    "account-123456",
    "+7 (912) 345-67-89",
    "0123456789abcdef0123456789abcdef",
    "dcandidate.math.g7-9.algebra.example.v1",
    "finalAnswer",
    "providerPayload",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.syntheticExamples[0].vectorRef = value;
    assert.throws(
      () => validateDiagnosticAuditIdentityPolicyDecisionProposal(invalid, artifacts.upstream),
      undefined,
      value,
    );
  }
  const unknown = clone(artifacts.artifact);
  unknown.unexpected = false;
  assert.throws(
    () => validateDiagnosticAuditIdentityPolicyDecisionProposal(unknown, artifacts.upstream),
    /unexpected/,
  );
});

test("Slice 6 scope is exact, duplicate-safe and rejects broad/runtime paths", () => {
  assert.equal(approvedSlice6ChangedPaths.length, 44);
  assert.deepEqual(
    validateDiagnosticAuditIdentityDecisionProposalChangedPaths(approvedSlice6ChangedPaths),
    approvedSlice6ChangedPaths,
  );
  assert.deepEqual(
    validateDiagnosticAuditIdentityDecisionProposalWorktreeScope([], {
      env: { GITHUB_ACTIONS: "false" },
    }),
    [],
  );
  assert.throws(
    () =>
      validateDiagnosticAuditIdentityDecisionProposalChangedPaths([
        ...approvedSlice6ChangedPaths,
        approvedSlice6ChangedPaths[0],
      ]),
    /duplicates/,
  );
  assert.throws(
    () =>
      validateDiagnosticAuditIdentityDecisionProposalChangedPaths(
        approvedSlice6ChangedPaths.slice(1),
      ),
    /exactly 44 changed paths/,
  );
  for (const forbiddenPath of [
    "docs/wave-6/slice-7-implementation-note.md",
    "docs/wave-6/nested/diagnostic-audit-identity-policy-decision-proposal.md",
    "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/extra.json",
    "apps/api/src/diagnostic-review/audit-identity.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-audit-identity-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateDiagnosticAuditIdentityDecisionProposalChangedPaths([forbiddenPath]),
      /Slice 6 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 6 guard admits the separate exact Slice 7 continuation", () => {
  assert.equal(approvedSlice7ChangedPaths.length, 46);
  assert.deepEqual(
    validateDiagnosticAuditIdentityDecisionProposalSlice7ChangedPaths(approvedSlice7ChangedPaths),
    approvedSlice7ChangedPaths,
  );
  assert.deepEqual(
    validateDiagnosticAuditIdentityDecisionProposalWorktreeScope(approvedSlice7ChangedPaths, {
      env: { GITHUB_ACTIONS: "false" },
    }),
    approvedSlice7ChangedPaths,
  );
});

test("Slice 6 guard admits the separate exact Slice 8 continuation", () => {
  assert.equal(approvedSlice8ChangedPaths.length, 48);
  assert.deepEqual(
    validateDiagnosticAuditIdentityDecisionProposalSlice8ChangedPaths(approvedSlice8ChangedPaths),
    approvedSlice8ChangedPaths,
  );
  assert.deepEqual(
    validateDiagnosticAuditIdentityDecisionProposalWorktreeScope(approvedSlice8ChangedPaths, {
      env: { GITHUB_ACTIONS: "false" },
    }),
    approvedSlice8ChangedPaths,
  );
});

test("clean CI commit range and unavailable range fail closed", () => {
  const base = "1".repeat(40);
  const head = "2".repeat(40);
  const paths = collectDiagnosticAuditIdentityDecisionProposalChangedPaths({
    cwd: "fixture-repo",
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_NAME: "workflow_dispatch",
      GITHUB_SHA: head,
    },
    runGit: (args) => {
      if (args[0] === "rev-list") return { status: 0, stdout: `${head} ${base}\n`, stderr: "" };
      if (args[0] === "diff")
        return { status: 0, stdout: nameStatusOutput(approvedSlice6ChangedPaths), stderr: "" };
      return { status: 0, stdout: "", stderr: "" };
    },
  });
  assert.deepEqual(paths, approvedSlice6ChangedPaths);
  assert.deepEqual(
    validateDiagnosticAuditIdentityDecisionProposalWorktreeScope(paths, {
      env: { GITHUB_ACTIONS: "true" },
    }),
    paths,
  );
  assert.throws(
    () =>
      collectDiagnosticAuditIdentityDecisionProposalChangedPaths({
        cwd: "fixture-repo",
        env: { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_SHA: "bad" },
        runGit: () => ({ status: 1, stdout: "", stderr: "missing" }),
      }),
    /BLOCK/,
  );
});

test("root registration is exact and validator has no broad allowlist", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  for (const registration of [
    "node packages/curriculum/scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-audit-identity-policy-decision-proposal.test.mjs",
  ]) {
    assert.equal(packageJson.scripts.test.split(registration).length - 1, 1, registration);
  }
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs",
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
