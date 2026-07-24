import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticProductionApprovalAuthorityDecisionProposal,
  readDiagnosticProductionApprovalAuthorityDecisionProposalUpstream,
  validateDiagnosticProductionApprovalAuthorityDecisionProposal,
  validateDiagnosticProductionApprovalAuthorityDecisionProposalChangedPaths,
} from "../scripts/validate-diagnostic-production-approval-authority-policy-decision-proposal.mjs";

const expectedChangedPaths = [
  "docs/wave-6/diagnostic-production-approval-authority-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-8-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-production-approval-authority-policy-decision-proposal/grade-7-9-math.production-approval-authority-policy-decision-proposal.v1.json",
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
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
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
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy-decision-proposal.test.mjs",
];

const clone = (value) => JSON.parse(JSON.stringify(value));

test("production approval authority proposal is valid and deferred", async () => {
  const artifact = await readDiagnosticProductionApprovalAuthorityDecisionProposal();
  const upstream = await readDiagnosticProductionApprovalAuthorityDecisionProposalUpstream();
  assert.deepEqual(
    validateDiagnosticProductionApprovalAuthorityDecisionProposal(artifact, upstream),
    {
      proposalArtifactVersion: "wave-6.slice-8.grade-7-9-math.v1",
      proposalVersion: "wave-6.slice-8.diagnostic-production-approval-authority-policy.proposal.v1",
      unresolvedDecisionCount: 10,
      approverRolePlaceholderCount: 3,
      productionApproverCount: 0,
      authorityGrantCount: 0,
      approvalDecisionCount: 0,
      productionApprovalCount: 0,
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      activationStatus: "BLOCKED",
      workflowStatus: "INACTIVE",
      readiness: "NOT_READY",
    },
  );
});

test("Slice 4-7 dependencies remain exact and non-authorizing", async () => {
  const artifact = await readDiagnosticProductionApprovalAuthorityDecisionProposal();
  const upstream = await readDiagnosticProductionApprovalAuthorityDecisionProposalUpstream();
  for (const [group, field] of [
    ["separationOfDutiesDecisionProposal", "artifactVersion"],
    ["conflictOfInterestDecisionProposal", "artifactVersion"],
    ["auditIdentityDecisionProposal", "artifactVersion"],
    ["evidenceStorageRetentionDecisionProposal", "artifactVersion"],
  ]) {
    const changed = clone(artifact);
    changed.upstreamReferences[group][field] = "wrong.version";
    assert.throws(() =>
      validateDiagnosticProductionApprovalAuthorityDecisionProposal(changed, upstream),
    );
  }
  for (const [group, field] of [
    ["separationOfDutiesDecisionProposal", "enforcementAllowed"],
    ["conflictOfInterestDecisionProposal", "identityComparisonAllowed"],
    ["auditIdentityDecisionProposal", "identityBindingAllowed"],
    ["auditIdentityDecisionProposal", "auditEventRecordingAllowed"],
  ]) {
    const changed = clone(artifact);
    changed.upstreamReferences[group][field] = true;
    assert.throws(() =>
      validateDiagnosticProductionApprovalAuthorityDecisionProposal(changed, upstream),
    );
  }
});

test("baseline, prerequisite and all operational capabilities remain blocked", async () => {
  const artifact = await readDiagnosticProductionApprovalAuthorityDecisionProposal();
  const upstream = await readDiagnosticProductionApprovalAuthorityDecisionProposalUpstream();
  for (const mutation of [
    (value) => (value.currentBaseline.readiness.status = "READY"),
    (value) => (value.currentBaseline.activation.status = "ACTIVE"),
    (value) => (value.currentBaseline.productionApprovalAuthorityPrerequisite.status = "SATISFIED"),
    (value) => (value.proposalBoundary.productionApprovalAllowed = true),
    (value) => (value.authorityGrantPlaceholder.grantIssuanceAllowed = true),
    (value) => (value.approvalDecisionSchemaPlaceholder.decisionRecordCreationAllowed = true),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() =>
      validateDiagnosticProductionApprovalAuthorityDecisionProposal(changed, upstream),
    );
  }
});

test("unresolved decisions, synthetic markers and zero records are enforced", async () => {
  const artifact = await readDiagnosticProductionApprovalAuthorityDecisionProposal();
  const upstream = await readDiagnosticProductionApprovalAuthorityDecisionProposalUpstream();
  const changed = clone(artifact);
  changed.unresolvedDecisions[0].state = "DECIDED";
  assert.throws(() =>
    validateDiagnosticProductionApprovalAuthorityDecisionProposal(changed, upstream),
  );
  const withRecord = clone(artifact);
  withRecord.approvalDecisionRecords = [{ recordState: "SYNTHETIC" }];
  assert.throws(() =>
    validateDiagnosticProductionApprovalAuthorityDecisionProposal(withRecord, upstream),
  );
  const withCount = clone(artifact);
  withCount.aggregate.productionApprovalCount = 1;
  assert.throws(() =>
    validateDiagnosticProductionApprovalAuthorityDecisionProposal(withCount, upstream),
  );
});

test("private, runtime and learning-content values fail closed", async () => {
  const artifact = await readDiagnosticProductionApprovalAuthorityDecisionProposal();
  const upstream = await readDiagnosticProductionApprovalAuthorityDecisionProposalUpstream();
  for (const value of [
    "person@example.org",
    "https://example.org/approval",
    "s3://bucket/key",
    "550e8400-e29b-41d4-a716-446655440000",
    "0123456789abcdef0123456789abcdef",
    "dcandidate.math.g7-9.example.v1",
  ]) {
    const changed = clone(artifact);
    changed.metadata.sourceContract = value;
    assert.throws(() =>
      validateDiagnosticProductionApprovalAuthorityDecisionProposal(changed, upstream),
    );
  }
  for (const key of [
    "finalAnswer",
    "solution",
    "hint",
    "providerPayload",
    "userId",
    "digestValue",
  ]) {
    const changed = clone(artifact);
    changed.metadata[key] = "forbidden";
    assert.throws(() =>
      validateDiagnosticProductionApprovalAuthorityDecisionProposal(changed, upstream),
    );
  }
});

test("exact Slice 8 worktree scope rejects duplicates and out-of-scope paths", () => {
  assert.equal(expectedChangedPaths.length, 48);
  assert.equal(new Set(expectedChangedPaths).size, 48);
  assert.deepEqual(
    validateDiagnosticProductionApprovalAuthorityDecisionProposalChangedPaths(expectedChangedPaths),
    expectedChangedPaths,
  );
  assert.throws(
    () =>
      validateDiagnosticProductionApprovalAuthorityDecisionProposalChangedPaths([
        ...expectedChangedPaths,
        expectedChangedPaths[0],
      ]),
    /duplicates/,
  );
  assert.throws(
    () =>
      validateDiagnosticProductionApprovalAuthorityDecisionProposalChangedPaths([
        ...expectedChangedPaths.slice(0, -1),
        "apps/api/src/production-approval/approval.controller.ts",
      ]),
    /out-of-scope/,
  );
});

test("root test command registers Slice 8 validator and focused test once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const command = packageJson.scripts?.test;
  assert.equal(typeof command, "string");
  for (const registration of [
    "node packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy-decision-proposal.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-production-approval-authority-policy-decision-proposal.test.mjs",
  ]) {
    assert.equal(command.split(registration).length - 1, 1, registration);
  }
});

test("Slice 8 validator has no broad allowlist", async () => {
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-production-approval-authority-policy-decision-proposal.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-6\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
