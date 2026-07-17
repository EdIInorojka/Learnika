import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  normalizeCiValidationActivationGateStatusPaths,
  readDiagnosticCiValidationActivationGate,
  readDiagnosticCiValidationActivationGateUpstreamArtifacts,
  validateCiValidationActivationGateChangedPaths,
  validateDiagnosticCiValidationActivationGate,
} from "../scripts/validate-diagnostic-ci-validation-activation-gate.mjs";

const expectedChangedPaths = [
  "docs/wave-5/diagnostic-ci-validation-activation-gate-contract.md",
  "docs/wave-5/slice-14-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-ci-validation-activation-gate/grade-7-9-math.ci-validation-activation-gate-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs",
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
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate.test.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-coverage-gap-closure-plan.test.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];

const expectedDecisionRequirementIds = [
  "current_validation_baseline_and_provenance",
  "required_ci_jobs_and_dependency_order",
  "deterministic_validator_matrix",
  "governance_artifact_consistency_gate",
  "no_answer_no_scoring_safety_gate",
  "privacy_and_pii_scan_gate",
  "runtime_api_openapi_web_change_gate",
  "migration_and_schema_drift_gate",
  "docker_and_infrastructure_availability_gate",
  "rerun_flakiness_and_reproducibility_policy",
  "manual_approval_handoff_and_activation_sequencing",
];

const protectedRecordFields = [
  "ciGateDecisionRecords",
  "ciGateExecutionRecords",
  "ciJobExecutionRecords",
  "validatorExecutionRecords",
  "governanceConsistencyRecords",
  "safetyScanRecords",
  "privacyScanRecords",
  "runtimeChangeAssessmentRecords",
  "schemaDriftAssessmentRecords",
  "infrastructureAvailabilityRecords",
  "rerunRecords",
  "flakinessRecords",
  "manualApprovalHandoffRecords",
  "prerequisiteSatisfactionRecords",
  "activationTransitionRecords",
  "readinessTransitionRecords",
  "realDiagnosticItemRecords",
  "realCandidateRecords",
  "approvedCandidateRecords",
  "reviewEvidenceRecords",
  "reviewDecisionRecords",
  "digestValueRecords",
  "candidateIdentityRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "authorityGrantRecords",
  "rollbackRecords",
  "withdrawalRecords",
  "productionApprovalRecords",
];

async function loadFixture() {
  return Promise.all([
    readDiagnosticCiValidationActivationGate(),
    readDiagnosticCiValidationActivationGateUpstreamArtifacts(),
  ]);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function expectArtifactFailure(mutator, pattern) {
  const [artifact, upstream] = await loadFixture();
  const changed = clone(artifact);
  mutator(changed);
  assert.throws(() => validateDiagnosticCiValidationActivationGate(changed, upstream), pattern);
}

test("CI validation activation gate placeholder is valid and unresolved", async () => {
  const [artifact, upstream] = await loadFixture();
  assert.deepEqual(validateDiagnosticCiValidationActivationGate(artifact, upstream), {
    gateArtifactVersion: "wave-5.slice-14.grade-7-9-math.v1",
    gateVersion:
      "wave-5.slice-14.diagnostic-ci-and-deterministic-validation-activation-gate.placeholder.v1",
    gateState: "UNRESOLVED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    ciJobPlaceholderCount: 6,
    validatorMatrixPlaceholderCount: 10,
    decisionRequirementCount: 11,
    openBlockingReasonCount: 2,
    satisfiedPrerequisiteCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("CI deterministic validation prerequisite remains exact and unsatisfied", async () => {
  const [artifact] = await loadFixture();
  assert.deepEqual(artifact.prerequisiteReference, {
    prerequisiteId: "ci_and_deterministic_validation",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future deterministic schema, version-pin, negative-fixture, exact-scope and provenance checks in CI.",
    evidenceRecordRefs: [],
  });
});

test("all five upstream artifact pins remain exact", async () => {
  const [artifact] = await loadFixture();
  assert.deepEqual(
    Object.values(artifact.dependencyReferences).map((reference) => reference.artifactVersion),
    [
      "wave-5.slice-2.grade-7-9-math.v1",
      "wave-5.slice-12.grade-7-9-math.v1",
      "wave-5.slice-13.grade-7-9-math.v1",
      "wave-5.slice-11.grade-7-9-math.v1",
      "wave-5.slice-10.grade-7-9-math.v1",
    ],
  );
});

test("read-only CI baseline records no mutation approval execution or gate pass", async () => {
  const [artifact] = await loadFixture();
  assert.equal(
    artifact.currentValidationBaselinePlaceholder.workflowSourcePath,
    ".github/workflows/ci.yml",
  );
  assert.deepEqual(artifact.currentValidationBaselinePlaceholder.observedJobIds, ["validate"]);
  assert.equal(artifact.currentValidationBaselinePlaceholder.workflowMutationRecorded, false);
  assert.equal(artifact.currentValidationBaselinePlaceholder.baselineApprovalRecorded, false);
  assert.equal(artifact.currentValidationBaselinePlaceholder.baselineGatePassRecorded, false);
  assert.deepEqual(artifact.currentValidationBaselinePlaceholder.baselineExecutionEvidenceRefs, []);
});

test("read-only CI baseline fails closed on workflow source drift", async () => {
  const [artifact, upstream] = await loadFixture();
  const changed = clone(upstream);
  changed.ciWorkflowSource = changed.ciWorkflowSource.replace(
    'node-version: "24"',
    'node-version: "22"',
  );
  assert.throws(
    () => validateDiagnosticCiValidationActivationGate(artifact, changed),
    /ciWorkflowSource must contain exactly one "node-version: \\"24\\"" marker/,
  );

  const extraJob = clone(upstream);
  extraJob.ciWorkflowSource += "\n  extra:\n    runs-on: ubuntu-latest\n";
  assert.throws(
    () => validateDiagnosticCiValidationActivationGate(artifact, extraJob),
    /ciWorkflowSource\.jobIds must contain exactly 1 values/,
  );
});

test("future CI jobs remain exact disabled placeholders", async () => {
  const [artifact] = await loadFixture();
  assert.equal(artifact.futureRequiredCiJobPlaceholders.length, 6);
  for (const job of artifact.futureRequiredCiJobPlaceholders) {
    assert.equal(job.state, "TO_BE_DECIDED");
    assert.equal(job.workflowJobRecorded, false);
    assert.equal(job.executionAllowed, false);
    assert.equal(job.gateContributionAllowed, false);
  }
});

test("deterministic validator matrix remains exact and disabled", async () => {
  const [artifact] = await loadFixture();
  assert.equal(artifact.futureDeterministicValidatorMatrixPlaceholders.length, 10);
  for (const row of artifact.futureDeterministicValidatorMatrixPlaceholders) {
    assert.equal(row.state, "TO_BE_DECIDED");
    assert.equal(row.deterministicResultRequired, true);
    assert.equal(row.activeValidatorRecorded, false);
    assert.equal(row.executionAllowed, false);
    assert.equal(row.gateContributionAllowed, false);
  }
});

test("governance safety privacy change schema infra rerun and handoff gates stay disabled", async () => {
  const [artifact] = await loadFixture();
  const placeholders = [
    artifact.governanceArtifactConsistencyGatePlaceholder,
    artifact.safetyNoAnswerNoScoringGatePlaceholder,
    artifact.privacyPiiScanGatePlaceholder,
    artifact.runtimeInterfaceChangeGatePlaceholder,
    artifact.migrationSchemaDriftGatePlaceholder,
    artifact.dockerInfrastructureAvailabilityGatePlaceholder,
    artifact.rerunFlakinessPolicyPlaceholder,
    artifact.manualApprovalHandoffPlaceholder,
  ];
  for (const placeholder of placeholders) {
    assert.equal(placeholder.state, "TO_BE_DECIDED");
    assert.deepEqual(placeholder.activeRuleReferences, []);
    for (const [key, value] of Object.entries(placeholder)) {
      if (key.endsWith("Allowed")) assert.equal(value, false, key);
    }
  }
});

test("exact eleven gate decisions remain unresolved", async () => {
  const [artifact] = await loadFixture();
  assert.deepEqual(
    artifact.decisionRequirements.map((requirement) => requirement.requirementId),
    expectedDecisionRequirementIds,
  );
  for (const requirement of artifact.decisionRequirements) {
    assert.equal(requirement.state, "TO_BE_DECIDED");
    assert.equal(requirement.decisionRecorded, false);
    assert.equal(requirement.decisionReference, null);
    assert.equal(requirement.policyReference, null);
    assert.deepEqual(requirement.activeRuleReferences, []);
  }
});

test("activation workflow readiness and blockers remain exact", async () => {
  const [artifact] = await loadFixture();
  assert.equal(artifact.activationBoundary.status, "BLOCKED");
  assert.equal(artifact.activationBoundary.reviewWorkflowStatus, "INACTIVE");
  for (const [key, value] of Object.entries(artifact.activationBoundary)) {
    if (key.endsWith("Allowed")) assert.equal(value, false, key);
  }
  assert.deepEqual(artifact.readiness, {
    policyVersion: "wave-3-slice-11-diagnostic-readiness-policy-v1",
    status: "NOT_READY",
    blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
  });
  assert.doesNotMatch(JSON.stringify(artifact), /(?<!NOT_)\bREADY\b/);
});

test("all protected records and activation aggregates remain zero", async () => {
  const [artifact] = await loadFixture();
  for (const field of protectedRecordFields) assert.deepEqual(artifact[field], [], field);
  for (const [field, value] of Object.entries(artifact.aggregate)) {
    if (
      ![
        "futureRequiredCiJobPlaceholderCount",
        "deterministicValidatorMatrixPlaceholderCount",
        "decisionRequirementCount",
        "undecidedRequirementCount",
        "blockingReasonCount",
        "openBlockingReasonCount",
      ].includes(field)
    ) {
      assert.equal(value, 0, field);
    }
  }
  for (const value of Object.values(artifact.recordBoundary)) assert.equal(value, false);
});

test("candidate identifiers and diagnostic payload fields fail closed", async () => {
  await expectArtifactFailure((artifact) => {
    artifact.candidateId = "candidate-123456";
  }, /forbidden candidate identifier field/);
  await expectArtifactFailure((artifact) => {
    artifact.itemStem = "payload";
  }, /forbidden field term itemStem/);
});

test("unknown fields and requested forbidden content terms fail closed", async () => {
  const terms = [
    "finalAnswer",
    "correctAnswer",
    "workedSolution",
    "solution",
    "hint",
    "scoringKey",
    "isCorrect",
    "score",
    "mastery",
    "proficiency",
    "providerPayload",
    "llmPrompt",
    "llmCompletion",
    "textbookContent",
    "copiedText",
    "studentName",
    "childName",
    "reviewerName",
    "immutableDigest",
    "sha256",
    "contentHash",
    "canonicalizedContent",
    "storageObjectKey",
  ];
  for (const term of terms) {
    await expectArtifactFailure((artifact) => {
      artifact[term] = "forbidden";
    }, /forbidden field term/);
  }
  await expectArtifactFailure((artifact) => {
    artifact.unexpectedBoundary = false;
  }, /unexpected field/);
});

test("private identity location candidate and hash-like values fail closed", async () => {
  const values = [
    "reviewer@example.com",
    "https://private.example/object",
    "123e4567-e89b-42d3-a456-426614174000",
    "user-private123",
    "account-private123",
    "candidate-123456",
    "0123456789abcdef0123456789abcdef",
  ];
  for (const value of values) {
    await expectArtifactFailure((artifact) => {
      artifact.metadata.gateArtifactVersion = value;
    }, /contains a|forbidden content term/);
  }
});

test("Slice 14 worktree guard permits only the exact 40 implementation paths", () => {
  assert.equal(expectedChangedPaths.length, 40);
  assert.equal(new Set(expectedChangedPaths).size, 40);
  assert.deepEqual(
    validateCiValidationActivationGateChangedPaths(expectedChangedPaths),
    expectedChangedPaths,
  );
  const forbiddenPaths = [
    ".github/workflows/ci.yml",
    "docs/wave-5/archive/diagnostic-ci-validation-activation-gate-contract.md",
    "packages/curriculum/diagnostic-ci-validation-activation-gate/extra.json",
    "packages/curriculum/src/diagnostic-ci-validation-runtime.ts",
    "apps/api/src/diagnostic-review/ci-validation.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "pnpm-lock.yaml",
  ];
  for (const forbiddenPath of forbiddenPaths) {
    assert.throws(
      () => validateCiValidationActivationGateChangedPaths([forbiddenPath]),
      /Wave 5 Slice 14 out-of-scope path changed/,
      forbiddenPath,
    );
  }
  const renamedPaths = normalizeCiValidationActivationGateStatusPaths(
    "R  .github/workflows/ci.yml -> docs/wave-5/slice-14-implementation-note.md",
  );
  assert.deepEqual(renamedPaths, [
    ".github/workflows/ci.yml",
    "docs/wave-5/slice-14-implementation-note.md",
  ]);
  assert.throws(
    () => validateCiValidationActivationGateChangedPaths(renamedPaths),
    /Wave 5 Slice 14 out-of-scope path changed: \.github\/workflows\/ci\.yml/,
  );
});

test("root test command registers the Slice 14 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../../../package.json", import.meta.url)));
  const registrations = [
    "node packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-ci-validation-activation-gate.test.mjs",
  ];
  for (const registration of registrations) {
    assert.equal(packageJson.scripts.test.split(registration).length - 1, 1, registration);
  }
});

test("Slice 14 validator contains no broad documentation curriculum API or runtime allowlist", async () => {
  const source = await readFile(
    new URL("../scripts/validate-diagnostic-ci-validation-activation-gate.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
  assert.doesNotMatch(source, /["']apps\/web\/["']/);
});
