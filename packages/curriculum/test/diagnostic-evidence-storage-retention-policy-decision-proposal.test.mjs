import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  collectDiagnosticEvidenceStorageRetentionDecisionProposalChangedPaths,
  readDiagnosticEvidenceStorageRetentionPolicyDecisionProposal,
  readDiagnosticEvidenceStorageRetentionPolicyDecisionProposalUpstream,
  validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposal,
  validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposalChangedPaths,
  validateDiagnosticEvidenceStorageRetentionDecisionProposalWorktreeScope,
} from "../scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs";

const expectedChangedPaths = [
  "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-7-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs",
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
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticEvidenceStorageRetentionPolicyDecisionProposal(),
    readDiagnosticEvidenceStorageRetentionPolicyDecisionProposalUpstream(),
  ]);
  return { artifact, upstream };
}

test("evidence storage retention proposal is valid, deferred and non-production", async () => {
  const { artifact, upstream } = await readArtifacts();
  assert.deepEqual(
    validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposal(artifact, upstream),
    {
      proposalArtifactVersion: "wave-6.slice-7.grade-7-9-math.v1",
      proposalVersion: "wave-6.slice-7.diagnostic-evidence-storage-retention-policy.proposal.v1",
      proposalStatus: "PROPOSED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      evidenceTypePlaceholderCount: 6,
      storageClassPlaceholderCount: 3,
      unresolvedDecisionCount: 10,
      activeStorageRuleCount: 0,
      evidenceRecordCount: 0,
      retentionScheduleCount: 0,
      deletionExecutionCount: 0,
      legalHoldCount: 0,
      auditEventCount: 0,
      productionApprovalCount: 0,
      activationStatus: "BLOCKED",
      workflowStatus: "INACTIVE",
      readiness: "NOT_READY",
    },
  );
});

test("upstream pins and Slice 4/5/6 dependencies remain exact and non-authorizing", async () => {
  const { artifact, upstream } = await readArtifacts();
  for (const [name, version] of [
    ["separationOfDutiesDecisionProposal", "wave-6.slice-4.grade-7-9-math.v1"],
    ["conflictOfInterestDecisionProposal", "wave-6.slice-5.grade-7-9-math.v1"],
    ["auditIdentityDecisionProposal", "wave-6.slice-6.grade-7-9-math.v1"],
  ]) {
    assert.equal(artifact.upstreamReferences[name].artifactVersion, version);
  }
  assert.equal(artifact.proposalBoundary.policyApproved, false);
  const changed = clone(artifact);
  changed.metadata.auditIdentityDecisionProposalArtifactVersion = "wrong.version";
  assert.throws(() =>
    validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposal(changed, upstream),
  );
});

test("all ten decisions and all policy capabilities remain unresolved or disabled", async () => {
  const { artifact, upstream } = await readArtifacts();
  assert.deepEqual(
    artifact.unresolvedDecisions.map((item) => item.decisionId),
    [
      "evidence_taxonomy",
      "storage_classification_taxonomy",
      "record_access_boundary",
      "retention_duration_expiry",
      "deletion_request_execution",
      "legal_hold_boundary",
      "audit_trail_boundary",
      "export_redaction_boundary",
      "recovery_restore_boundary",
      "identity_separation_dependencies",
    ],
  );
  for (const decision of artifact.unresolvedDecisions)
    assert.equal(decision.state, "UNRESOLVED_DEFERRED");
  const changed = clone(artifact);
  changed.proposedPolicy.retentionDurationExpiry.schedulingAllowed = true;
  assert.throws(() =>
    validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposal(changed, upstream),
  );
});

test("baseline remains NOT_READY, BLOCKED, INACTIVE and prerequisite unsatisfied", async () => {
  const { artifact, upstream } = await readArtifacts();
  assert.deepEqual(artifact.currentBaseline.readiness.blockingReasons, [
    "INCOMPLETE_COVERAGE",
    "NON_PRODUCTION_FIXTURES",
  ]);
  assert.equal(
    artifact.currentBaseline.evidenceStorageRetentionPrerequisite.status,
    "UNSATISFIED_DEFERRED",
  );
  for (const mutation of [
    (changed) => (changed.currentBaseline.readiness.status = "READY"),
    (changed) => (changed.currentBaseline.activation.status = "ACTIVE"),
    (changed) =>
      (changed.currentBaseline.evidenceStorageRetentionPrerequisite.status = "SATISFIED"),
    (changed) => (changed.currentBaseline.satisfiedPrerequisiteCount = 1),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() =>
      validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposal(changed, upstream),
    );
  }
});

test("synthetic vectors are marker-complete and records/counts remain empty or zero", async () => {
  const { artifact, upstream } = await readArtifacts();
  assert.equal(artifact.syntheticExamples.length, 8);
  assert.deepEqual(
    artifact.syntheticExamples.map((item) => item.expectedDisposition),
    [
      "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
      "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
      "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
      "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
      "REJECT",
      "REJECT",
      "REJECT",
      "REJECT",
    ],
  );
  for (const field of [
    "evidenceRecordRecords",
    "storageObjectRecords",
    "retentionScheduleRecords",
    "retentionExecutionRecords",
    "deletionRequestRecords",
    "deletionExecutionRecords",
    "legalHoldRecords",
    "accessGrantRecords",
    "accessLogRecords",
    "auditEventRecords",
    "evidenceExportRecords",
    "redactionRecords",
    "recoveryRecords",
    "restoreRecords",
  ]) {
    assert.deepEqual(artifact[field], []);
  }
  const changed = clone(artifact);
  changed.deletionExecutionRecords.push({ state: "SYNTHETIC" });
  assert.throws(() =>
    validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposal(changed, upstream),
  );
});

test("private, runtime, content and identity-like material fails closed", async () => {
  const { artifact, upstream } = await readArtifacts();
  for (const value of [
    "answer",
    "solution",
    "hint",
    "providerPayload",
    "userId",
    "reviewerId",
    "auditId",
    "storageObjectKey",
    "rawMedia",
    "textbookContent",
    "https://example.invalid/private",
    "person@example.invalid",
    "550e8400-e29b-41d4-a716-446655440000",
    "0123456789abcdef0123456789abcdef",
    "s3://private/object",
  ]) {
    const changed = clone(artifact);
    changed.metadata.status = value;
    assert.throws(
      () => validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposal(changed, upstream),
      undefined,
      value,
    );
  }
});

test("exact Slice 7 scope is duplicate-safe and rejects broad/runtime paths", () => {
  assert.equal(expectedChangedPaths.length, 46);
  assert.equal(new Set(expectedChangedPaths).size, expectedChangedPaths.length);
  assert.deepEqual(
    validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposalChangedPaths(
      expectedChangedPaths,
    ),
    expectedChangedPaths,
  );
  assert.throws(
    () =>
      validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposalChangedPaths([
        ...expectedChangedPaths,
        expectedChangedPaths[0],
      ]),
    /duplicates/,
  );
  for (const forbiddenPath of [
    "README.md",
    "docs/wave-6/",
    "packages/curriculum/",
    "packages/curriculum/diagnostic-evidence-storage-retention-policy/runtime.mjs",
    "apps/api/src/evidence-storage/evidence-storage.controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () =>
        validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposalChangedPaths([
          forbiddenPath,
        ]),
      /Slice 7 out-of-scope path changed/,
    );
  }
});

test("clean local checkout is allowed while dirty local scope is exact", () => {
  assert.deepEqual(
    validateDiagnosticEvidenceStorageRetentionDecisionProposalWorktreeScope([], {
      env: { GITHUB_ACTIONS: "false" },
    }),
    [],
  );
  assert.throws(
    () =>
      validateDiagnosticEvidenceStorageRetentionDecisionProposalWorktreeScope(
        ["docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md"],
        { env: { GITHUB_ACTIONS: "false" } },
      ),
    /exactly 46 changed paths/,
  );
});

test("CI path collection fails closed when exact range is unavailable", () => {
  assert.throws(
    () =>
      collectDiagnosticEvidenceStorageRetentionDecisionProposalChangedPaths({
        cwd: process.cwd(),
        env: {
          GITHUB_ACTIONS: "true",
          GITHUB_EVENT_NAME: "workflow_dispatch",
          GITHUB_SHA: "short",
        },
        runGit: () => ({ status: 1, stdout: "", stderr: "missing" }),
        readEvent: () => ({}),
      }),
    /BLOCK/,
  );
});

test("root test command registers Slice 7 validator and test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const command = packageJson.scripts?.test;
  assert.equal(typeof command, "string");
  for (const registration of [
    "node packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
  ]) {
    assert.equal(command.split(registration).length - 1, 1, registration);
  }
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-6\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
