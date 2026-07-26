import assert from "node:assert/strict";
import test from "node:test";

import {
  changedPaths,
  readDiagnosticCoverageGapClosurePlanDecisionProposal,
  validateDiagnosticCoverageGapClosurePlanDecisionProposal,
  validateDiagnosticCoverageGapClosurePlanDecisionProposalChangedPaths,
  validateDiagnosticCoverageGapClosurePlanDecisionProposalWorktreeScope,
} from "../scripts/validate-diagnostic-coverage-gap-closure-plan-decision-proposal.mjs";

const clone = (value) => JSON.parse(JSON.stringify(value));

test("Slice 9 proposal remains deferred with the exact coverage baseline", async () => {
  const artifact = await readDiagnosticCoverageGapClosurePlanDecisionProposal();
  assert.deepEqual(validateDiagnosticCoverageGapClosurePlanDecisionProposal(artifact), {
    proposalArtifactVersion: "wave-6.slice-9.grade-7-9-math.v1",
    proposalVersion: "wave-6.slice-9.diagnostic-coverage-gap-closure-plan.proposal.v1",
    slotCount: 11,
    draftOnlySlotCount: 5,
    gapConfirmedSlotCount: 6,
    unresolvedDecisionCount: 10,
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    activationStatus: "BLOCKED",
    workflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("Slice 4-8 dependencies remain exact and non-authorizing", async () => {
  const artifact = await readDiagnosticCoverageGapClosurePlanDecisionProposal();
  for (const [group, field] of [
    ["separationOfDuties", "enforcementAllowed"],
    ["conflictOfInterest", "identityComparisonAllowed"],
    ["auditIdentity", "identityBindingAllowed"],
    ["evidenceStorageRetention", "evidenceRecordCount"],
    ["productionApprovalAuthority", "productionApprovalAllowed"],
  ]) {
    const changed = clone(artifact);
    changed.upstreamReferences[group][field] = field.endsWith("Count") ? 1 : true;
    assert.throws(() => validateDiagnosticCoverageGapClosurePlanDecisionProposal(changed));
  }
});

test("baseline, slots, decisions and operational boundaries fail closed", async () => {
  const artifact = await readDiagnosticCoverageGapClosurePlanDecisionProposal();
  for (const mutate of [
    (value) => (value.currentBaseline.readiness.status = "READY"),
    (value) => (value.currentBaseline.activation.status = "ACTIVE"),
    (value) => (value.coverageBaseline.slots[0].coverageStatus = "PRODUCTION_APPROVED"),
    (value) => (value.unresolvedDecisions[0].state = "DECIDED"),
    (value) => value.coverageApprovalRecords.push({ state: "synthetic" }),
    (value) => (value.aggregate.closedGapCount = 1),
  ]) {
    const changed = clone(artifact);
    mutate(changed);
    assert.throws(() => validateDiagnosticCoverageGapClosurePlanDecisionProposal(changed));
  }
});

test("exact cumulative Slice 9 scope rejects duplicates and out-of-scope paths", () => {
  assert.equal(changedPaths.length, 50);
  assert.equal(new Set(changedPaths).size, 50);
  assert.deepEqual(
    validateDiagnosticCoverageGapClosurePlanDecisionProposalChangedPaths(changedPaths),
    changedPaths,
  );
  assert.throws(
    () =>
      validateDiagnosticCoverageGapClosurePlanDecisionProposalChangedPaths([
        ...changedPaths,
        changedPaths[0],
      ]),
    /duplicates/,
  );
  assert.throws(
    () =>
      validateDiagnosticCoverageGapClosurePlanDecisionProposalChangedPaths([
        ...changedPaths.slice(0, -1),
        "apps/api/src/coverage/coverage.controller.ts",
      ]),
    /out-of-scope/,
  );
});

test("Slice 10 continuation paths remain explicit and narrow", () => {
  const slice10Paths = [
    "docs/wave-6/diagnostic-readiness-integration-plan-decision-proposal.md",
    "docs/wave-6/slice-10-implementation-note.md",
    "packages/curriculum/diagnostic-readiness-integration-plan-decision-proposal/grade-7-9-math.readiness-integration-plan-decision-proposal.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs",
    "packages/curriculum/test/diagnostic-readiness-integration-plan-decision-proposal.test.mjs",
  ];
  assert.equal(new Set(slice10Paths).size, 5);
  assert.throws(
    () => validateDiagnosticCoverageGapClosurePlanDecisionProposalChangedPaths(slice10Paths),
    /out-of-scope/,
  );
});

test("clean local checkout is allowed while dirty scope is exact", () => {
  assert.deepEqual(
    validateDiagnosticCoverageGapClosurePlanDecisionProposalWorktreeScope([], { env: {} }),
    [],
  );
  assert.deepEqual(
    validateDiagnosticCoverageGapClosurePlanDecisionProposalWorktreeScope(changedPaths, {
      env: {},
    }),
    changedPaths,
  );
});
