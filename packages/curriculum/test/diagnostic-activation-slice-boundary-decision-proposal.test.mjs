import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  changedPaths,
  readDiagnosticActivationSliceBoundaryDecisionProposal,
  readDiagnosticActivationSliceBoundaryDecisionProposalUpstreamArtifacts,
  validateDiagnosticActivationSliceBoundaryDecisionProposal,
  validateDiagnosticActivationSliceBoundaryDecisionProposalChangedPaths,
  validateDiagnosticActivationSliceBoundaryDecisionProposalWorktreeScope,
} from "../scripts/validate-diagnostic-activation-slice-boundary-decision-proposal.mjs";
import { preWave7Slice3ChangedPaths } from "../scripts/validate-skill-graph.mjs";

async function loadFixture() {
  return Promise.all([
    readDiagnosticActivationSliceBoundaryDecisionProposal(),
    readDiagnosticActivationSliceBoundaryDecisionProposalUpstreamArtifacts(),
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
    () => validateDiagnosticActivationSliceBoundaryDecisionProposal(changed, upstream),
    pattern,
  );
}

test("Slice 13 proposal is deferred and preserves the activation baseline", async () => {
  const [artifact, upstream] = await loadFixture();
  assert.deepEqual(validateDiagnosticActivationSliceBoundaryDecisionProposal(artifact, upstream), {
    proposalArtifactVersion: "wave-6.slice-13.grade-7-9-math.v1",
    proposalVersion: "wave-6.slice-13.diagnostic-activation-slice-boundary.proposal.v1",
    proposalStatus: "PROPOSED_DEFERRED",
    decisionRequirementCount: 10,
    capabilityPlaceholderCount: 10,
    readiness: "NOT_READY",
    activationStatus: "BLOCKED",
    workflowStatus: "INACTIVE",
    satisfiedPrerequisiteCount: 0,
    productionApprovalCount: 0,
  });
});

test("source decision and upstream pins remain exact and non-authorizing", async () => {
  const [artifact, upstream] = await loadFixture();
  assert.equal(artifact.metadata.sourceDecisionId, "W5-OD-ACTIVATION-SLICE");
  assert.deepEqual(
    Object.values(artifact.upstreamReferences).map((reference) => reference.artifactVersion),
    [
      "wave-5.slice-2.grade-7-9-math.v1",
      "wave-5.slice-14.grade-7-9-math.v1",
      "wave-6.slice-12.grade-7-9-math.v1",
    ],
  );
  assert.equal(upstream.slice12Summary.prerequisiteStatus, "UNSATISFIED_DEFERRED");
  assert.equal(upstream.slice12Summary.activationStatus, "BLOCKED");
  assert.equal(upstream.slice12Summary.workflowStatus, "INACTIVE");
  assert.equal(upstream.slice12Summary.readiness, "NOT_READY");
});

test("ten boundary decisions and capability placeholders remain unresolved", async () => {
  const [artifact] = await loadFixture();
  assert.equal(artifact.decisionRequirements.length, 10);
  assert.equal(artifact.futureBoundaryPlaceholder.capabilityPlaceholderIds.length, 10);
  assert.equal(artifact.futureBoundaryPlaceholder.state, "UNRESOLVED_DEFERRED");
  for (const requirement of artifact.decisionRequirements) {
    assert.equal(requirement.state, "UNRESOLVED_DEFERRED");
    assert.equal(requirement.decisionReference, null);
    assert.equal(requirement.policyReference, null);
    assert.equal(requirement.decisionRecorded, false);
    assert.deepEqual(requirement.activeRuleReferences, []);
  }
  assert.deepEqual(artifact.futureBoundaryPlaceholder.approvedCapabilityReferences, []);
  assert.deepEqual(artifact.futureBoundaryPlaceholder.approvedPathReferences, []);
  assert.equal(artifact.futureBoundaryPlaceholder.implementationAllowed, false);
});

test("activation permissions, operational records and counts remain false or zero", async () => {
  const [artifact] = await loadFixture();
  for (const [key, value] of Object.entries(artifact.activationBoundary)) {
    if (key === "status") assert.equal(value, "BLOCKED");
    else if (key === "workflowStatus") assert.equal(value, "INACTIVE");
    else assert.equal(value, false, key);
  }
  for (const [key, value] of Object.entries(artifact.recordBoundary)) {
    assert.equal(value, false, key);
  }
  for (const records of Object.values(artifact.operationalRecords)) assert.deepEqual(records, []);
  for (const [key, value] of Object.entries(artifact.aggregate)) {
    if (
      ![
        "capabilityPlaceholderCount",
        "decisionRequirementCount",
        "unresolvedDecisionCount",
        "prerequisiteCount",
        "unsatisfiedPrerequisiteCount",
        "openBlockingReasonCount",
      ].includes(key)
    ) {
      assert.equal(value, 0, key);
    }
  }
});

test("unknown, private, runtime and learner-content additions fail closed", async () => {
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
    artifact.apiRoute = "/diagnostic/activate";
  }, /declared fields/);
  await expectArtifactFailure((artifact) => {
    artifact.metadata.proposalVersion = "https://private.example/activation";
  }, /URL/);
  await expectArtifactFailure((artifact) => {
    artifact.unexpectedField = false;
  }, /declared fields/);
});

test("exact cumulative scope is duplicate-safe, narrow and clean-checkout tolerant", () => {
  assert.equal(changedPaths.length, 55);
  assert.equal(new Set(changedPaths).size, 55);
  assert.deepEqual(
    validateDiagnosticActivationSliceBoundaryDecisionProposalChangedPaths(changedPaths),
    changedPaths,
  );
  assert.deepEqual(validateDiagnosticActivationSliceBoundaryDecisionProposalWorktreeScope([]), []);
  assert.deepEqual(
    validateDiagnosticActivationSliceBoundaryDecisionProposalWorktreeScope([
      ...preWave7Slice3ChangedPaths,
    ]),
    [...preWave7Slice3ChangedPaths],
  );
  assert.throws(
    () =>
      validateDiagnosticActivationSliceBoundaryDecisionProposalChangedPaths([
        ...changedPaths,
        changedPaths[0],
      ]),
    /duplicates/,
  );
  assert.throws(
    () =>
      validateDiagnosticActivationSliceBoundaryDecisionProposalChangedPaths([
        ...changedPaths.slice(0, -1),
        "apps/api/src/diagnostic-review/activation.ts",
      ]),
    /out-of-scope/,
  );
});

test("root registration and validator scope remain exact without broad allowlists", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  assert.equal(
    packageJson.scripts.test.split(
      "node packages/curriculum/scripts/validate-diagnostic-activation-slice-boundary-decision-proposal.mjs --check-worktree-scope",
    ).length - 1,
    1,
  );
  assert.equal(
    packageJson.scripts.test.split(
      "packages/curriculum/test/diagnostic-activation-slice-boundary-decision-proposal.test.mjs",
    ).length - 1,
    1,
  );
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-activation-slice-boundary-decision-proposal.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-6\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
  assert.doesNotMatch(source, /["']apps\/web\/["']/);
  assert.doesNotMatch(source, /["']\.github\/["']/);
});
