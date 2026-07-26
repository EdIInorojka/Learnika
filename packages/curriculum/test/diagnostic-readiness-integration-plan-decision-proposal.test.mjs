import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  changedPaths,
  readDiagnosticReadinessIntegrationPlanDecisionProposal,
  validateDiagnosticReadinessIntegrationPlanDecisionProposal,
  validateDiagnosticReadinessIntegrationPlanDecisionProposalChangedPaths,
  validateDiagnosticReadinessIntegrationPlanDecisionProposalWorktreeScope,
} from "../scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs";

const clone = (value) => JSON.parse(JSON.stringify(value));

test("Slice 10 proposal is deferred and preserves the readiness baseline", async () => {
  const artifact = await readDiagnosticReadinessIntegrationPlanDecisionProposal();
  assert.deepEqual(validateDiagnosticReadinessIntegrationPlanDecisionProposal(artifact), {
    proposalArtifactVersion: "wave-6.slice-10.grade-7-9-math.v1",
    proposalVersion: "wave-6.slice-10.diagnostic-readiness-integration-plan.proposal.v1",
    decisionRequirementCount: 10,
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    activationStatus: "BLOCKED",
    workflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("exact upstream pins remain non-authorizing", async () => {
  const artifact = await readDiagnosticReadinessIntegrationPlanDecisionProposal();
  for (const [group, field] of [
    ["readinessIntegrationPlaceholder", "integrationEvaluationAllowed"],
    ["candidateIdentity", "allocationAllowed"],
    ["canonicalizationDigest", "policyActivationAllowed"],
    ["separationOfDuties", "enforcementAllowed"],
    ["conflictOfInterest", "identityComparisonAllowed"],
    ["auditIdentity", "identityBindingAllowed"],
    ["productionApprovalAuthority", "approvalInputAllowed"],
    ["coverageGapClosure", "coverageClosureAllowed"],
    ["rollbackWithdrawal", "rollbackExecutionAllowed"],
    ["ciValidationGate", "readinessAuthorizationAllowed"],
  ]) {
    const changed = clone(artifact);
    changed.upstreamReferences[group][field] = true;
    assert.throws(() => validateDiagnosticReadinessIntegrationPlanDecisionProposal(changed));
  }
});

test("all ten requirements remain unresolved and all placeholders are disabled", async () => {
  const artifact = await readDiagnosticReadinessIntegrationPlanDecisionProposal();
  for (const mutation of [
    (changed) => (changed.decisionRequirements[0].state = "DECIDED"),
    (changed) => (changed.decisionRequirements[0].decisionRecorded = true),
    (changed) => (changed.readinessTransitionGuardPlaceholder.evaluationAllowed = true),
    (changed) => (changed.policyChangeActivationSequencingPlaceholder.policyChangeAllowed = true),
    (changed) =>
      changed.baseline.readinessIntegrationPrerequisite.evidenceRecordRefs.push("record"),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticReadinessIntegrationPlanDecisionProposal(changed));
  }
});

test("readiness, blocker, approval and transition records remain empty and zero", async () => {
  const artifact = await readDiagnosticReadinessIntegrationPlanDecisionProposal();
  for (const field of [
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
    "ciGateExecutionRecords",
    "readyStateRecords",
    "prerequisiteSatisfactionRecords",
    "productionApprovalRecords",
  ]) {
    assert.deepEqual(artifact[field], []);
  }
  const changed = clone(artifact);
  changed.aggregate.readinessTransitionRecordCount = 1;
  assert.throws(() => validateDiagnosticReadinessIntegrationPlanDecisionProposal(changed));
});

test("unknown, private and forbidden values fail closed", async () => {
  const artifact = await readDiagnosticReadinessIntegrationPlanDecisionProposal();
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
    assert.throws(() => validateDiagnosticReadinessIntegrationPlanDecisionProposal(changed));
  }
  for (const value of [
    "https://example.test/readiness",
    "person@example.test",
    "123e4567-e89b-42d3-a456-426614174000",
    "0123456789abcdef0123456789abcdef",
  ]) {
    const changed = clone(artifact);
    changed.metadata.sourceProposal = value;
    assert.throws(() => validateDiagnosticReadinessIntegrationPlanDecisionProposal(changed));
  }
  const unknown = clone(artifact);
  unknown.metadata.unexpectedField = false;
  assert.throws(() => validateDiagnosticReadinessIntegrationPlanDecisionProposal(unknown));
});

test("exact cumulative scope is duplicate-safe, narrow and clean-checkout tolerant", () => {
  assert.equal(changedPaths.length, 51);
  assert.equal(new Set(changedPaths).size, 51);
  assert.deepEqual(
    validateDiagnosticReadinessIntegrationPlanDecisionProposalChangedPaths(changedPaths),
    changedPaths,
  );
  assert.deepEqual(
    validateDiagnosticReadinessIntegrationPlanDecisionProposalWorktreeScope([], { ci: false }),
    [],
  );
  assert.throws(
    () =>
      validateDiagnosticReadinessIntegrationPlanDecisionProposalChangedPaths([
        ...changedPaths,
        changedPaths[0],
      ]),
    /duplicates/,
  );
  assert.throws(
    () =>
      validateDiagnosticReadinessIntegrationPlanDecisionProposalChangedPaths([
        ...changedPaths.slice(0, -1),
        "apps/api/src/diagnostic-readiness-policy/diagnostic-readiness-policy.service.ts",
      ]),
    /out-of-scope/,
  );
  assert.throws(
    () => validateDiagnosticReadinessIntegrationPlanDecisionProposalWorktreeScope([], { ci: true }),
    /exactly 51/,
  );
});

test("validator has no broad allowlists", async () => {
  const source = await readFile(
    "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs",
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-6\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
