import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  changedPaths,
  readDiagnosticRollbackWithdrawalPolicyDecisionProposal,
  validateDiagnosticRollbackWithdrawalPolicyDecisionProposal,
  validateDiagnosticRollbackWithdrawalPolicyDecisionProposalChangedPaths,
  validateDiagnosticRollbackWithdrawalPolicyDecisionProposalWorktreeScope,
} from "../scripts/validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs";

const clone = (value) => JSON.parse(JSON.stringify(value));

test("Slice 11 proposal is deferred and preserves the rollback baseline", async () => {
  const artifact = await readDiagnosticRollbackWithdrawalPolicyDecisionProposal();
  assert.deepEqual(validateDiagnosticRollbackWithdrawalPolicyDecisionProposal(artifact), {
    proposalArtifactVersion: "wave-6.slice-11.grade-7-9-math.v1",
    proposalVersion: "wave-6.slice-11.diagnostic-rollback-withdrawal-policy.proposal.v1",
    withdrawalTriggerPlaceholderCount: 7,
    rollbackTriggerPlaceholderCount: 5,
    decisionRequirementCount: 11,
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    activationStatus: "BLOCKED",
    workflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("readiness integration and rollback upstream pins remain exact and non-authorizing", async () => {
  const artifact = await readDiagnosticRollbackWithdrawalPolicyDecisionProposal();
  for (const [group, field] of [
    ["rollbackWithdrawalPlaceholder", "rollbackExecutionAllowed"],
    ["readinessIntegrationProposal", "readinessIntegrationAllowed"],
    ["readinessIntegrationPlaceholder", "rollbackExecutionAllowed"],
    ["productionApprovalAuthority", "approvalInputAllowed"],
    ["evidenceStorageRetention", "evidenceRecordCount"],
    ["auditIdentity", "identityBindingAllowed"],
    ["separationOfDuties", "enforcementAllowed"],
  ]) {
    const changed = clone(artifact);
    changed.upstreamReferences[group][field] = field.endsWith("Count") ? 1 : true;
    assert.throws(() => validateDiagnosticRollbackWithdrawalPolicyDecisionProposal(changed));
  }
});

test("all eleven requirements and trigger placeholders remain unresolved and disabled", async () => {
  const artifact = await readDiagnosticRollbackWithdrawalPolicyDecisionProposal();
  for (const mutation of [
    (changed) => (changed.decisionRequirements[0].state = "DECIDED"),
    (changed) => (changed.decisionRequirements[0].decisionRecorded = true),
    (changed) => (changed.withdrawalTriggerTaxonomyPlaceholders[0].executionAllowed = true),
    (changed) => (changed.readinessRollbackPlaceholder.evaluationAllowed = true),
    (changed) => changed.baseline.rollbackWithdrawalPrerequisite.evidenceRecordRefs.push("record"),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticRollbackWithdrawalPolicyDecisionProposal(changed));
  }
});

test("operational records and counts remain empty and zero", async () => {
  const artifact = await readDiagnosticRollbackWithdrawalPolicyDecisionProposal();
  for (const key of [
    "triggerEvaluationRecords",
    "candidateWithdrawalRecords",
    "productionApprovalWithdrawalRecords",
    "evidenceWithdrawalRecords",
    "digestInvalidationRecords",
    "readinessRollbackRecords",
    "rollbackRecords",
    "tombstoneRecords",
    "restorationRecords",
    "notificationRecords",
    "auditEventRecords",
    "realCandidateRecords",
    "evidenceRecords",
    "identityRecords",
    "authorityGrantRecords",
    "productionApprovalRecords",
  ]) {
    assert.deepEqual(artifact[key], []);
  }
  for (const value of Object.values(artifact.recordBoundary)) assert.equal(value, false);
  const changed = clone(artifact);
  changed.aggregate.readinessRollbackCount = 1;
  assert.throws(() => validateDiagnosticRollbackWithdrawalPolicyDecisionProposal(changed));
});

test("forbidden, private, runtime and content values fail closed", async () => {
  const artifact = await readDiagnosticRollbackWithdrawalPolicyDecisionProposal();
  for (const field of [
    "candidateId",
    "userId",
    "email",
    "storageKey",
    "contentHash",
    "providerPayload",
  ]) {
    const changed = clone(artifact);
    changed.metadata[field] = "forbidden";
    assert.throws(() => validateDiagnosticRollbackWithdrawalPolicyDecisionProposal(changed));
  }
  for (const value of [
    "https://example.test/rollback",
    "person@example.test",
    "123e4567-e89b-42d3-a456-426614174000",
    "0123456789abcdef0123456789abcdef",
  ]) {
    const changed = clone(artifact);
    changed.metadata.sourceContract = value;
    assert.throws(() => validateDiagnosticRollbackWithdrawalPolicyDecisionProposal(changed));
  }
  const unknown = clone(artifact);
  unknown.metadata.unexpectedField = false;
  assert.throws(() => validateDiagnosticRollbackWithdrawalPolicyDecisionProposal(unknown));
});

test("exact cumulative scope is duplicate-safe, narrow and clean-checkout tolerant", () => {
  assert.equal(changedPaths.length, 52);
  assert.equal(new Set(changedPaths).size, 52);
  assert.deepEqual(
    validateDiagnosticRollbackWithdrawalPolicyDecisionProposalChangedPaths(changedPaths),
    changedPaths,
  );
  assert.deepEqual(
    validateDiagnosticRollbackWithdrawalPolicyDecisionProposalWorktreeScope([], { ci: false }),
    [],
  );
  assert.throws(
    () =>
      validateDiagnosticRollbackWithdrawalPolicyDecisionProposalChangedPaths([
        ...changedPaths,
        changedPaths[0],
      ]),
    /duplicates/,
  );
  assert.throws(
    () =>
      validateDiagnosticRollbackWithdrawalPolicyDecisionProposalChangedPaths([
        ...changedPaths.slice(0, -1),
        "apps/api/src/diagnostic-readiness-policy/diagnostic-readiness-policy.service.ts",
      ]),
    /out-of-scope/,
  );
  assert.throws(
    () => validateDiagnosticRollbackWithdrawalPolicyDecisionProposalWorktreeScope([], { ci: true }),
    /exactly 52/,
  );
});

test("validator contains no broad allowlists", async () => {
  const source = await readFile(
    "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs",
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-6\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
