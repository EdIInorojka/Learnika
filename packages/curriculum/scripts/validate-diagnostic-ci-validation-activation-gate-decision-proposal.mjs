import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  readDiagnosticCiValidationActivationGate,
  readDiagnosticCiValidationActivationGateUpstreamArtifacts,
  validateDiagnosticCiValidationActivationGate,
} from "./validate-diagnostic-ci-validation-activation-gate.mjs";
import {
  changedPaths as slice11ChangedPaths,
  readDiagnosticRollbackWithdrawalPolicyDecisionProposal,
  validateDiagnosticRollbackWithdrawalPolicyDecisionProposal,
} from "./validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs";

const expectedArtifactVersion = "wave-6.slice-12.grade-7-9-math.v1";
const expectedProposalVersion =
  "wave-6.slice-12.diagnostic-ci-validation-activation-gate.proposal.v1";
const expectedCiPlaceholderVersion = "wave-5.slice-14.grade-7-9-math.v1";
const expectedCiGateVersion =
  "wave-5.slice-14.diagnostic-ci-and-deterministic-validation-activation-gate.placeholder.v1";
const expectedSlice11ArtifactVersion = "wave-6.slice-11.grade-7-9-math.v1";
const expectedSlice11ProposalVersion =
  "wave-6.slice-11.diagnostic-rollback-withdrawal-policy.proposal.v1";
const expectedDecisionIds = [
  "ci_job_graph_and_dependency_order",
  "validator_ownership_and_fixture_policy",
  "governance_and_safety_privacy_rule_versions",
  "runtime_interface_change_review_routing",
  "migration_schema_drift_policy",
  "docker_infrastructure_failure_classification",
  "rerun_flakiness_thresholds_and_reproducibility",
  "independent_release_evidence_and_retention_tests",
];
const expectedJobPlaceholderIds = [
  "STATIC_GOVERNANCE_VALIDATION_JOB_PLACEHOLDER",
  "APPLICATION_QUALITY_VALIDATION_JOB_PLACEHOLDER",
  "DATABASE_CONTRACT_VALIDATION_JOB_PLACEHOLDER",
  "INFRASTRUCTURE_AVAILABILITY_VALIDATION_JOB_PLACEHOLDER",
  "SAFETY_PRIVACY_VALIDATION_JOB_PLACEHOLDER",
  "MANUAL_APPROVAL_HANDOFF_JOB_PLACEHOLDER",
];
const expectedValidatorPlaceholderIds = [
  "EXACT_UPSTREAM_VERSION_PINS_VALIDATOR_PLACEHOLDER",
  "CLOSED_WORLD_ARTIFACT_SCHEMA_VALIDATOR_PLACEHOLDER",
  "EXACT_WORKTREE_SCOPE_VALIDATOR_PLACEHOLDER",
  "GOVERNANCE_ARTIFACT_CONSISTENCY_VALIDATOR_PLACEHOLDER",
  "NO_ANSWER_NO_SCORING_SAFETY_VALIDATOR_PLACEHOLDER",
  "PRIVACY_PII_SCAN_VALIDATOR_PLACEHOLDER",
  "RUNTIME_INTERFACE_CHANGE_BOUNDARY_VALIDATOR_PLACEHOLDER",
  "MIGRATION_SCHEMA_DRIFT_VALIDATOR_PLACEHOLDER",
  "DOCKER_INFRASTRUCTURE_AVAILABILITY_VALIDATOR_PLACEHOLDER",
  "RERUN_REPRODUCIBILITY_VALIDATOR_PLACEHOLDER",
];
const operationalArrayKeys = [
  "ciExecutionRecords",
  "validatorExecutionRecords",
  "fixtureExecutionRecords",
  "negativeCaseExecutionRecords",
  "reproducibilityRecords",
  "retentionTestRecords",
  "releaseEvidenceRecords",
  "workflowMutationRecords",
  "activationDecisionRecords",
  "readinessTransitionRecords",
  "candidateRecords",
  "evidenceRecords",
  "identityRecords",
  "productionApprovalRecords",
];
const forbiddenTerms = [
  "finalanswer",
  "correctanswer",
  "workedsolution",
  "solution",
  "hint",
  "mastery",
  "proficiency",
  "providerpayload",
  "llmprompt",
  "llmcompletion",
  "textbookcontent",
  "copiedtext",
  "studentname",
  "childname",
  "email",
  "reviewerid",
  "auditid",
  "userid",
  "accountid",
  "candidateid",
  "storagekey",
  "contenthash",
  "immutable",
  "digest",
  "hash",
  "rawmedia",
  "apiroute",
  "openapi",
  "prisma",
];
const forbiddenExactFields = new Set([
  "candidateid",
  "candidateids",
  "userid",
  "accountid",
  "reviewerid",
  "auditid",
  "email",
  "storagekey",
  "contenthash",
]);
const slice11PrimaryPaths = new Set([
  "docs/wave-6/diagnostic-rollback-withdrawal-policy-decision-proposal.md",
  "docs/wave-6/slice-11-implementation-note.md",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy-decision-proposal/grade-7-9-math.rollback-withdrawal-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy-decision-proposal.test.mjs",
]);
const slice12PrimaryPaths = [
  "docs/wave-6/diagnostic-ci-validation-activation-gate-decision-proposal.md",
  "docs/wave-6/slice-12-implementation-note.md",
  "packages/curriculum/diagnostic-ci-validation-activation-gate-decision-proposal/grade-7-9-math.ci-validation-activation-gate-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate-decision-proposal.test.mjs",
];
const changedPaths = [
  ...slice11ChangedPaths.filter((value) => !slice11PrimaryPaths.has(value)),
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs",
  ...slice12PrimaryPaths,
];
const changedPathSet = new Set(changedPaths);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../../..");
export const defaultProposalPath = path.resolve(
  scriptDirectory,
  "../diagnostic-ci-validation-activation-gate-decision-proposal/grade-7-9-math.ci-validation-activation-gate-decision-proposal.v1.json",
);

export class DiagnosticCiValidationActivationGateDecisionProposalValidationError extends Error {}

function fail(message) {
  throw new DiagnosticCiValidationActivationGateDecisionProposalValidationError(message);
}

function exact(actual, expected, label) {
  if (!Object.is(actual, expected)) fail(`${label} must equal ${JSON.stringify(expected)}.`);
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object.`);
  }
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) {
    fail(`${label} must contain exactly the declared fields.`);
  }
}

function exactArray(actual, expected, label) {
  if (!Array.isArray(actual) || JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} must match the exact expected array.`);
  }
}

function emptyArray(value, label) {
  if (!Array.isArray(value) || value.length !== 0) fail(`${label} must remain empty.`);
}

function rejectForbidden(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectForbidden(item, `${fieldPath}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") {
    if (typeof value === "string") {
      if (value === "READY") fail(`${fieldPath} cannot contain READY.`);
      const lower = value.toLowerCase();
      if (forbiddenTerms.some((term) => lower.includes(term))) {
        fail(`${fieldPath} contains forbidden/private/runtime content.`);
      }
      if (/(?:https?|s3|minio|file):\/\//i.test(value)) fail(`${fieldPath} contains a URL.`);
      if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)) {
        fail(`${fieldPath} contains contact data.`);
      }
      if (
        /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i.test(value)
      ) {
        fail(`${fieldPath} contains an identity value.`);
      }
      if (/\b[0-9a-f]{32,}\b/i.test(value)) {
        fail(`${fieldPath} contains an immutable value.`);
      }
    }
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    const lower = key.toLowerCase();
    if (forbiddenExactFields.has(lower) || forbiddenTerms.includes(lower)) {
      fail(`${fieldPath}.${key} is forbidden.`);
    }
    rejectForbidden(nested, `${fieldPath}.${key}`);
  }
}

function validateMetadata(metadata) {
  exactKeys(
    metadata,
    [
      "schemaVersion",
      "proposalArtifactVersion",
      "proposalVersion",
      "status",
      "artifactKind",
      "subject",
      "locale",
      "audienceGrades",
      "sourceContract",
      "workflowSourcePath",
      "workflowFileChangeAllowed",
      "productionUseAllowed",
      "runtimeUseAllowed",
      "storageAllowed",
    ],
    "metadata",
  );
  exact(
    metadata.schemaVersion,
    "learnika.diagnosticCiValidationActivationGateDecisionProposal.v1",
    "metadata.schemaVersion",
  );
  exact(
    metadata.proposalArtifactVersion,
    expectedArtifactVersion,
    "metadata.proposalArtifactVersion",
  );
  exact(metadata.proposalVersion, expectedProposalVersion, "metadata.proposalVersion");
  exact(metadata.status, "PROPOSED_DEFERRED", "metadata.status");
  exact(
    metadata.artifactKind,
    "diagnostic_ci_validation_activation_gate_decision_proposal",
    "metadata.artifactKind",
  );
  exact(metadata.subject, "math", "metadata.subject");
  exact(metadata.locale, "ru-RU", "metadata.locale");
  exactArray(metadata.audienceGrades, [7, 8, 9], "metadata.audienceGrades");
  exact(
    metadata.sourceContract,
    "docs/wave-5/diagnostic-ci-validation-activation-gate-contract.md",
    "metadata.sourceContract",
  );
  exact(metadata.workflowSourcePath, ".github/workflows/ci.yml", "metadata.workflowSourcePath");
  for (const key of [
    "workflowFileChangeAllowed",
    "productionUseAllowed",
    "runtimeUseAllowed",
    "storageAllowed",
  ]) {
    exact(metadata[key], false, `metadata.${key}`);
  }
}

function validateUpstreamReferences(references, upstream) {
  exactKeys(
    references,
    [
      "activationPrerequisites",
      "productionApprovalAuthority",
      "coverageGapClosure",
      "readinessIntegration",
      "rollbackWithdrawal",
      "ciActivationGatePlaceholder",
      "slice11RollbackWithdrawalProposal",
    ],
    "upstreamReferences",
  );
  exact(
    upstream.ciSummary.gateArtifactVersion,
    expectedCiPlaceholderVersion,
    "W5 CI artifact version",
  );
  exact(upstream.ciSummary.gateVersion, expectedCiGateVersion, "W5 CI gate version");
  exact(upstream.ciSummary.prerequisiteStatus, "UNSATISFIED_DEFERRED", "W5 CI prerequisite");
  exact(upstream.ciSummary.activationStatus, "BLOCKED", "W5 CI activation");
  exact(upstream.ciSummary.reviewWorkflowStatus, "INACTIVE", "W5 CI workflow");
  exact(
    upstream.slice11Summary.proposalArtifactVersion,
    expectedSlice11ArtifactVersion,
    "Slice 11 artifact version",
  );
  exact(
    upstream.slice11Summary.proposalVersion,
    expectedSlice11ProposalVersion,
    "Slice 11 proposal version",
  );
  for (const [key, expected] of [
    [
      "activationPrerequisites",
      ["wave-5.slice-2.grade-7-9-math.v1", "UNSATISFIED_DEFERRED", "BLOCKED", "INACTIVE"],
    ],
    [
      "productionApprovalAuthority",
      [
        "wave-5.slice-10.grade-7-9-math.v1",
        "wave-5.slice-10.diagnostic-production-approval-authority.placeholder.v1",
        "UNRESOLVED_DEFERRED",
        "UNSATISFIED_DEFERRED",
      ],
    ],
    [
      "coverageGapClosure",
      [
        "wave-5.slice-11.grade-7-9-math.v1",
        "wave-5.slice-11.diagnostic-coverage-gap-closure-plan.placeholder.v1",
        "UNRESOLVED_DEFERRED",
        "UNSATISFIED_DEFERRED",
      ],
    ],
    [
      "readinessIntegration",
      [
        "wave-5.slice-12.grade-7-9-math.v1",
        "wave-5.slice-12.diagnostic-readiness-integration-plan.placeholder.v1",
        "UNRESOLVED_DEFERRED",
        "UNSATISFIED_DEFERRED",
      ],
    ],
    [
      "rollbackWithdrawal",
      [
        "wave-5.slice-13.grade-7-9-math.v1",
        "wave-5.slice-13.diagnostic-rollback-and-withdrawal.placeholder.v1",
        "UNRESOLVED_DEFERRED",
        "UNSATISFIED_DEFERRED",
      ],
    ],
    [
      "ciActivationGatePlaceholder",
      [
        expectedCiPlaceholderVersion,
        expectedCiGateVersion,
        "UNRESOLVED_DEFERRED",
        "UNSATISFIED_DEFERRED",
      ],
    ],
    [
      "slice11RollbackWithdrawalProposal",
      [
        expectedSlice11ArtifactVersion,
        expectedSlice11ProposalVersion,
        "PROPOSED_DEFERRED",
        "UNSATISFIED_DEFERRED",
      ],
    ],
  ]) {
    const value = references[key];
    const versionKey =
      key === "ciActivationGatePlaceholder"
        ? "gateVersion"
        : key === "slice11RollbackWithdrawalProposal"
          ? "proposalVersion"
          : key === "productionApprovalAuthority" || key === "rollbackWithdrawal"
            ? "policyVersion"
            : "planVersion";
    const stateKey =
      key === "ciActivationGatePlaceholder"
        ? "gateState"
        : key === "slice11RollbackWithdrawalProposal"
          ? "proposalStatus"
          : key === "productionApprovalAuthority" || key === "rollbackWithdrawal"
            ? "policyState"
            : "planState";
    exactKeys(
      value,
      key === "activationPrerequisites"
        ? [
            "artifactVersion",
            "prerequisiteId",
            "prerequisiteStatus",
            "activationStatus",
            "workflowStatus",
          ]
        : ["artifactVersion", versionKey, stateKey, "prerequisiteStatus"],
      `upstreamReferences.${key}`,
    );
    const actual =
      key === "activationPrerequisites"
        ? [
            value.artifactVersion,
            value.prerequisiteStatus,
            value.activationStatus,
            value.workflowStatus,
          ]
        : [value.artifactVersion, value[versionKey], value[stateKey], value.prerequisiteStatus];
    exactArray(actual, expected, `upstreamReferences.${key}`);
  }
}

function validateBaseline(baseline) {
  exactKeys(
    baseline,
    [
      "readiness",
      "activation",
      "ciAndDeterministicValidationPrerequisite",
      "prerequisiteCounts",
      "blockerCounts",
      "approvedCandidateCount",
      "productionApprovalCount",
    ],
    "baseline",
  );
  exactKeys(
    baseline.readiness,
    ["policyVersion", "status", "blockingReasons"],
    "baseline.readiness",
  );
  exact(
    baseline.readiness.policyVersion,
    "wave-3-slice-11-diagnostic-readiness-policy-v1",
    "baseline.readiness.policyVersion",
  );
  exact(baseline.readiness.status, "NOT_READY", "baseline.readiness.status");
  exactArray(
    baseline.readiness.blockingReasons,
    ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
    "baseline.readiness.blockingReasons",
  );
  exactKeys(baseline.activation, ["status", "workflowStatus"], "baseline.activation");
  exactArray(
    [baseline.activation.status, baseline.activation.workflowStatus],
    ["BLOCKED", "INACTIVE"],
    "baseline.activation",
  );
  exactKeys(
    baseline.ciAndDeterministicValidationPrerequisite,
    ["prerequisiteId", "status", "ownerPlaceholderId", "evidenceRecordRefs"],
    "baseline.ciAndDeterministicValidationPrerequisite",
  );
  exact(
    baseline.ciAndDeterministicValidationPrerequisite.prerequisiteId,
    "ci_and_deterministic_validation",
    "baseline prerequisite id",
  );
  exact(
    baseline.ciAndDeterministicValidationPrerequisite.status,
    "UNSATISFIED_DEFERRED",
    "baseline prerequisite status",
  );
  exact(
    baseline.ciAndDeterministicValidationPrerequisite.ownerPlaceholderId,
    "UNASSIGNED_OWNER_PLACEHOLDER",
    "baseline owner",
  );
  emptyArray(
    baseline.ciAndDeterministicValidationPrerequisite.evidenceRecordRefs,
    "baseline evidence refs",
  );
  exactKeys(
    baseline.prerequisiteCounts,
    ["total", "unsatisfied", "satisfied"],
    "baseline.prerequisiteCounts",
  );
  exactArray(
    Object.values(baseline.prerequisiteCounts),
    [12, 12, 0],
    "baseline.prerequisiteCounts",
  );
  exactKeys(baseline.blockerCounts, ["total", "open", "closed"], "baseline.blockerCounts");
  exactArray(Object.values(baseline.blockerCounts), [2, 2, 0], "baseline.blockerCounts");
  exact(baseline.approvedCandidateCount, 0, "baseline.approvedCandidateCount");
  exact(baseline.productionApprovalCount, 0, "baseline.productionApprovalCount");
}

function validatePlaceholders(artifact) {
  exactKeys(
    artifact.ciJobGraphPlaceholder,
    [
      "state",
      "jobPlaceholderIds",
      "dependencyEdges",
      "activeRuleReferences",
      "workflowMutationRecorded",
      "executionAllowed",
      "gateContributionAllowed",
    ],
    "ciJobGraphPlaceholder",
  );
  exact(artifact.ciJobGraphPlaceholder.state, "UNRESOLVED_DEFERRED", "ciJobGraphPlaceholder.state");
  exactArray(
    artifact.ciJobGraphPlaceholder.jobPlaceholderIds,
    expectedJobPlaceholderIds,
    "ciJobGraphPlaceholder.jobPlaceholderIds",
  );
  emptyArray(
    artifact.ciJobGraphPlaceholder.dependencyEdges,
    "ciJobGraphPlaceholder.dependencyEdges",
  );
  emptyArray(
    artifact.ciJobGraphPlaceholder.activeRuleReferences,
    "ciJobGraphPlaceholder.activeRuleReferences",
  );
  for (const key of ["workflowMutationRecorded", "executionAllowed", "gateContributionAllowed"])
    exact(artifact.ciJobGraphPlaceholder[key], false, `ciJobGraphPlaceholder.${key}`);
  exactKeys(
    artifact.deterministicValidatorMatrixPlaceholder,
    [
      "state",
      "validatorPlaceholderIds",
      "activeRuleReferences",
      "matrixExecutionAllowed",
      "gateContributionAllowed",
    ],
    "deterministicValidatorMatrixPlaceholder",
  );
  exact(
    artifact.deterministicValidatorMatrixPlaceholder.state,
    "UNRESOLVED_DEFERRED",
    "validator matrix state",
  );
  exactArray(
    artifact.deterministicValidatorMatrixPlaceholder.validatorPlaceholderIds,
    expectedValidatorPlaceholderIds,
    "validator matrix ids",
  );
  emptyArray(
    artifact.deterministicValidatorMatrixPlaceholder.activeRuleReferences,
    "validator matrix active rules",
  );
  exact(
    artifact.deterministicValidatorMatrixPlaceholder.matrixExecutionAllowed,
    false,
    "validator matrix execution",
  );
  exact(
    artifact.deterministicValidatorMatrixPlaceholder.gateContributionAllowed,
    false,
    "validator matrix contribution",
  );
  for (const key of [
    "syntheticFixturePolicyPlaceholder",
    "negativeAuthorizationCasePolicyPlaceholder",
    "reproducibilityVectorPolicyPlaceholder",
    "retentionTestPolicyPlaceholder",
    "independentReleaseEvidencePolicyPlaceholder",
  ]) {
    const value = artifact[key];
    if (!value || value.state !== "UNRESOLVED_DEFERRED")
      fail(`${key}.state must remain UNRESOLVED_DEFERRED.`);
    for (const [field, nested] of Object.entries(value)) {
      if (field.endsWith("Reference")) exact(nested, null, `${key}.${field}`);
      if (field.endsWith("References") || field.endsWith("RecordRefs"))
        emptyArray(nested, `${key}.${field}`);
      if (field.endsWith("Allowed")) exact(nested, false, `${key}.${field}`);
    }
  }
}

function validateDecisions(decisions) {
  if (!Array.isArray(decisions)) fail("decisionRequirements must be an array.");
  exactArray(
    decisions.map((item) => item.decisionId),
    expectedDecisionIds,
    "decision IDs",
  );
  for (const item of decisions) {
    exactKeys(
      item,
      [
        "decisionId",
        "state",
        "decisionReference",
        "policyReference",
        "activeRuleReferences",
        "decisionRecorded",
      ],
      `decision.${item.decisionId}`,
    );
    exact(item.state, "UNRESOLVED_DEFERRED", `decision.${item.decisionId}.state`);
    exact(item.decisionReference, null, `decision.${item.decisionId}.decisionReference`);
    exact(item.policyReference, null, `decision.${item.decisionId}.policyReference`);
    emptyArray(item.activeRuleReferences, `decision.${item.decisionId}.activeRuleReferences`);
    exact(item.decisionRecorded, false, `decision.${item.decisionId}.decisionRecorded`);
  }
}

function validateBoundaries(artifact) {
  exactKeys(
    artifact.activationBoundary,
    [
      "status",
      "workflowStatus",
      "gateActivationAllowed",
      "workflowMutationAllowed",
      "gateEvaluationAllowed",
      "gateDecisionRecordingAllowed",
      "manualApprovalAllowed",
      "prerequisiteSatisfactionAllowed",
      "activationTransitionAllowed",
      "readinessTransitionAllowed",
      "productionApprovalAllowed",
    ],
    "activationBoundary",
  );
  exactArray(
    [artifact.activationBoundary.status, artifact.activationBoundary.workflowStatus],
    ["BLOCKED", "INACTIVE"],
    "activation boundary status",
  );
  for (const [key, value] of Object.entries(artifact.activationBoundary))
    if (key.endsWith("Allowed")) exact(value, false, `activationBoundary.${key}`);
  exactKeys(
    artifact.recordBoundary,
    [
      "ciExecutionRecordsAllowed",
      "validatorExecutionRecordsAllowed",
      "fixtureExecutionRecordsAllowed",
      "negativeCaseExecutionRecordsAllowed",
      "reproducibilityRecordsAllowed",
      "retentionTestRecordsAllowed",
      "releaseEvidenceRecordsAllowed",
      "workflowMutationRecordsAllowed",
      "activationDecisionRecordsAllowed",
      "readinessTransitionRecordsAllowed",
      "productionApprovalRecordsAllowed",
    ],
    "recordBoundary",
  );
  for (const value of Object.values(artifact.recordBoundary)) exact(value, false, "recordBoundary");
  exactKeys(artifact.operationalRecords, operationalArrayKeys, "operationalRecords");
  for (const key of operationalArrayKeys)
    emptyArray(artifact.operationalRecords[key], `operationalRecords.${key}`);
}

function validateAggregate(aggregate) {
  const expected = {
    ciJobPlaceholderCount: 6,
    validatorMatrixPlaceholderCount: 10,
    decisionRequirementCount: 8,
    unresolvedDecisionCount: 8,
    prerequisiteCount: 12,
    unsatisfiedPrerequisiteCount: 12,
    satisfiedPrerequisiteCount: 0,
    openBlockingReasonCount: 2,
    closedBlockingReasonCount: 0,
    ciExecutionCount: 0,
    validatorExecutionCount: 0,
    fixtureExecutionCount: 0,
    negativeCaseExecutionCount: 0,
    reproducibilityRecordCount: 0,
    retentionTestRecordCount: 0,
    releaseEvidenceRecordCount: 0,
    activationDecisionCount: 0,
    readinessTransitionCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
  };
  exactKeys(aggregate, Object.keys(expected), "aggregate");
  for (const [key, value] of Object.entries(expected))
    exact(aggregate[key], value, `aggregate.${key}`);
}

export function validateDiagnosticCiValidationActivationGateDecisionProposal(artifact, upstream) {
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact))
    fail("artifact must be an object.");
  exactKeys(
    artifact,
    [
      "metadata",
      "upstreamReferences",
      "baseline",
      "ciJobGraphPlaceholder",
      "deterministicValidatorMatrixPlaceholder",
      "syntheticFixturePolicyPlaceholder",
      "negativeAuthorizationCasePolicyPlaceholder",
      "reproducibilityVectorPolicyPlaceholder",
      "retentionTestPolicyPlaceholder",
      "independentReleaseEvidencePolicyPlaceholder",
      "decisionRequirements",
      "activationBoundary",
      "recordBoundary",
      "operationalRecords",
      "aggregate",
    ],
    "artifact",
  );
  rejectForbidden(artifact);
  validateMetadata(artifact.metadata);
  validateUpstreamReferences(artifact.upstreamReferences, upstream);
  validateBaseline(artifact.baseline);
  validatePlaceholders(artifact);
  validateDecisions(artifact.decisionRequirements);
  validateBoundaries(artifact);
  validateAggregate(artifact.aggregate);
  return {
    proposalArtifactVersion: artifact.metadata.proposalArtifactVersion,
    proposalVersion: artifact.metadata.proposalVersion,
    decisionRequirementCount: artifact.aggregate.decisionRequirementCount,
    ciJobPlaceholderCount: artifact.aggregate.ciJobPlaceholderCount,
    validatorMatrixPlaceholderCount: artifact.aggregate.validatorMatrixPlaceholderCount,
    prerequisiteStatus: artifact.baseline.ciAndDeterministicValidationPrerequisite.status,
    activationStatus: artifact.baseline.activation.status,
    workflowStatus: artifact.baseline.activation.workflowStatus,
    readiness: artifact.baseline.readiness.status,
    satisfiedPrerequisiteCount: artifact.aggregate.satisfiedPrerequisiteCount,
  };
}

export async function readDiagnosticCiValidationActivationGateDecisionProposal(
  artifactPath = defaultProposalPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticCiValidationActivationGateDecisionProposalUpstreamArtifacts() {
  const [ciArtifact, ciUpstream, slice11Artifact] = await Promise.all([
    readDiagnosticCiValidationActivationGate(),
    readDiagnosticCiValidationActivationGateUpstreamArtifacts(),
    readDiagnosticRollbackWithdrawalPolicyDecisionProposal(),
  ]);
  const ciSummary = validateDiagnosticCiValidationActivationGate(ciArtifact, ciUpstream);
  const slice11Summary =
    validateDiagnosticRollbackWithdrawalPolicyDecisionProposal(slice11Artifact);
  return { ciSummary, slice11Summary };
}

function localPaths(cwd) {
  const result = spawnSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0) fail(`Unable to inspect git status: ${result.stderr || result.stdout}`);
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => line.slice(3).trim().split(" -> "))
    .map((value) => value.replaceAll("\\", "/"));
}

export function validateDiagnosticCiValidationActivationGateDecisionProposalChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !changedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 12 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== changedPaths.length)
    fail(`Wave 6 Slice 12 requires exactly ${changedPaths.length} changed paths.`);
  return normalized;
}

export function validateDiagnosticCiValidationActivationGateDecisionProposalWorktreeScope(
  paths,
  { ci = false } = {},
) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  if (!ci && paths.length === 0) return [];
  return validateDiagnosticCiValidationActivationGateDecisionProposalChangedPaths(paths);
}

export { changedPaths };

export async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticCiValidationActivationGateDecisionProposal(),
    readDiagnosticCiValidationActivationGateDecisionProposalUpstreamArtifacts(),
  ]);
  const summary = validateDiagnosticCiValidationActivationGateDecisionProposal(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    validateDiagnosticCiValidationActivationGateDecisionProposalWorktreeScope(
      localPaths(repositoryRoot),
    );
  }
  console.log(
    `[curriculum] CI activation gate decision proposal validated: ${summary.ciJobPlaceholderCount} job placeholders, ${summary.validatorMatrixPlaceholderCount} validator placeholders, ${summary.decisionRequirementCount} unresolved requirements; prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
  );
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    console.error(`[curriculum] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
