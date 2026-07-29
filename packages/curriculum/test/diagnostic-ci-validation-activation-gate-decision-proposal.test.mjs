import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  changedPaths,
  readDiagnosticCiValidationActivationGateDecisionProposal,
  readDiagnosticCiValidationActivationGateDecisionProposalUpstreamArtifacts,
  validateDiagnosticCiValidationActivationGateDecisionProposal,
  validateDiagnosticCiValidationActivationGateDecisionProposalChangedPaths,
  validateDiagnosticCiValidationActivationGateDecisionProposalWorktreeScope,
} from "../scripts/validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs";
import { preWave7Slice8ChangedPaths } from "../scripts/validate-skill-graph.mjs";

async function loadFixture() {
  return Promise.all([
    readDiagnosticCiValidationActivationGateDecisionProposal(),
    readDiagnosticCiValidationActivationGateDecisionProposalUpstreamArtifacts(),
  ]);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function expectArtifactFailure(mutator, pattern) {
  const [artifact, upstream] = await loadFixture();
  const changed = clone(artifact);
  mutator(changed);
  assert.throws(
    () => validateDiagnosticCiValidationActivationGateDecisionProposal(changed, upstream),
    pattern,
  );
}

test("Slice 12 proposal is deferred and preserves the CI activation baseline", async () => {
  const [artifact, upstream] = await loadFixture();
  assert.deepEqual(
    validateDiagnosticCiValidationActivationGateDecisionProposal(artifact, upstream),
    {
      proposalArtifactVersion: "wave-6.slice-12.grade-7-9-math.v1",
      proposalVersion: "wave-6.slice-12.diagnostic-ci-validation-activation-gate.proposal.v1",
      decisionRequirementCount: 8,
      ciJobPlaceholderCount: 6,
      validatorMatrixPlaceholderCount: 10,
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      activationStatus: "BLOCKED",
      workflowStatus: "INACTIVE",
      readiness: "NOT_READY",
      satisfiedPrerequisiteCount: 0,
    },
  );
});

test("all CI contract-chain pins remain exact and non-authorizing", async () => {
  const [artifact, upstream] = await loadFixture();
  assert.deepEqual(
    Object.values(artifact.upstreamReferences).map((reference) => reference.artifactVersion),
    [
      "wave-5.slice-2.grade-7-9-math.v1",
      "wave-5.slice-10.grade-7-9-math.v1",
      "wave-5.slice-11.grade-7-9-math.v1",
      "wave-5.slice-12.grade-7-9-math.v1",
      "wave-5.slice-13.grade-7-9-math.v1",
      "wave-5.slice-14.grade-7-9-math.v1",
      "wave-6.slice-11.grade-7-9-math.v1",
    ],
  );
  assert.equal(upstream.ciSummary.prerequisiteStatus, "UNSATISFIED_DEFERRED");
  assert.equal(upstream.ciSummary.activationStatus, "BLOCKED");
  assert.equal(upstream.slice11Summary.prerequisiteStatus, "UNSATISFIED_DEFERRED");
});

test("eight decision requirements and future policy placeholders remain unresolved", async () => {
  const [artifact] = await loadFixture();
  assert.equal(artifact.decisionRequirements.length, 8);
  for (const requirement of artifact.decisionRequirements) {
    assert.equal(requirement.state, "UNRESOLVED_DEFERRED");
    assert.equal(requirement.decisionRecorded, false);
    assert.equal(requirement.decisionReference, null);
    assert.equal(requirement.policyReference, null);
    assert.deepEqual(requirement.activeRuleReferences, []);
  }
  for (const key of [
    "ciJobGraphPlaceholder",
    "deterministicValidatorMatrixPlaceholder",
    "syntheticFixturePolicyPlaceholder",
    "negativeAuthorizationCasePolicyPlaceholder",
    "reproducibilityVectorPolicyPlaceholder",
    "retentionTestPolicyPlaceholder",
    "independentReleaseEvidencePolicyPlaceholder",
  ]) {
    assert.equal(artifact[key].state, "UNRESOLVED_DEFERRED", key);
  }
  assert.equal(artifact.ciJobGraphPlaceholder.executionAllowed, false);
  assert.equal(artifact.deterministicValidatorMatrixPlaceholder.gateContributionAllowed, false);
});

test("operational records and counts remain empty and zero", async () => {
  const [artifact] = await loadFixture();
  for (const records of Object.values(artifact.operationalRecords)) assert.deepEqual(records, []);
  for (const [key, value] of Object.entries(artifact.recordBoundary))
    assert.equal(value, false, key);
  for (const key of [
    "ciExecutionCount",
    "validatorExecutionCount",
    "fixtureExecutionCount",
    "negativeCaseExecutionCount",
    "reproducibilityRecordCount",
    "retentionTestRecordCount",
    "releaseEvidenceRecordCount",
    "activationDecisionCount",
    "readinessTransitionCount",
    "approvedCandidateCount",
    "productionApprovalCount",
  ]) {
    assert.equal(artifact.aggregate[key], 0, key);
  }
  assert.equal(artifact.aggregate.satisfiedPrerequisiteCount, 0);
  assert.equal(artifact.aggregate.approvedCandidateCount, 0);
  assert.equal(artifact.aggregate.productionApprovalCount, 0);
});

test("forbidden, private, runtime and content values fail closed", async () => {
  await expectArtifactFailure((artifact) => {
    artifact.solution = "forbidden";
  }, /forbidden|declared fields/);
  await expectArtifactFailure((artifact) => {
    artifact.metadata.proposalVersion = "reviewer@example.com";
  }, /contact data/);
  await expectArtifactFailure((artifact) => {
    artifact.metadata.proposalVersion = "0123456789abcdef0123456789abcdef";
  }, /immutable value/);
  await expectArtifactFailure((artifact) => {
    artifact.runtimeModule = "forbidden";
  }, /declared fields/);
  await expectArtifactFailure((artifact) => {
    artifact.metadata.proposalVersion = "https://private.example/gate";
  }, /URL/);
  await expectArtifactFailure((artifact) => {
    artifact.unexpectedField = false;
  }, /declared fields/);
});

test("exact cumulative scope is duplicate-safe, narrow and clean-checkout tolerant", () => {
  assert.equal(changedPaths.length, 53);
  assert.equal(new Set(changedPaths).size, 53);
  assert.deepEqual(
    validateDiagnosticCiValidationActivationGateDecisionProposalChangedPaths(changedPaths),
    changedPaths,
  );
  assert.deepEqual(
    validateDiagnosticCiValidationActivationGateDecisionProposalWorktreeScope([]),
    [],
  );
  assert.deepEqual(
    validateDiagnosticCiValidationActivationGateDecisionProposalWorktreeScope([
      ...preWave7Slice8ChangedPaths,
    ]),
    [...preWave7Slice8ChangedPaths],
  );
  assert.throws(
    () =>
      validateDiagnosticCiValidationActivationGateDecisionProposalChangedPaths([
        ...changedPaths,
        changedPaths[0],
      ]),
    /duplicates/,
  );
  assert.throws(
    () =>
      validateDiagnosticCiValidationActivationGateDecisionProposalChangedPaths([
        ...changedPaths.slice(0, -1),
        "apps/api/src/diagnostic-review/ci-validation.ts",
      ]),
    /out-of-scope/,
  );
});

test("Slice 12 base guard keeps the separate Slice 13 primary boundary explicit", () => {
  const slice13PrimaryPaths = [
    "docs/wave-6/diagnostic-activation-slice-boundary-decision-proposal.md",
    "docs/wave-6/slice-13-implementation-note.md",
    "packages/curriculum/diagnostic-activation-slice-boundary-decision-proposal/grade-7-9-math.activation-slice-boundary-decision-proposal.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-activation-slice-boundary-decision-proposal.mjs",
    "packages/curriculum/test/diagnostic-activation-slice-boundary-decision-proposal.test.mjs",
  ];
  assert.equal(new Set(slice13PrimaryPaths).size, 5);
  assert.throws(
    () =>
      validateDiagnosticCiValidationActivationGateDecisionProposalChangedPaths(slice13PrimaryPaths),
    /out-of-scope/,
  );
});

test("root registration and validator scope remain exact without broad allowlists", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  assert.equal(
    packageJson.scripts.test.split(
      "node packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs --check-worktree-scope",
    ).length - 1,
    1,
  );
  assert.equal(
    packageJson.scripts.test.split(
      "packages/curriculum/test/diagnostic-ci-validation-activation-gate-decision-proposal.test.mjs",
    ).length - 1,
    1,
  );
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-6\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
  assert.doesNotMatch(source, /["']apps\/web\/["']/);
});
