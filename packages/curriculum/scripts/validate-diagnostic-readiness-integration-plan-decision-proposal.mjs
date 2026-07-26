import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const expectedArtifactVersion = "wave-6.slice-10.grade-7-9-math.v1";
const expectedProposalVersion = "wave-6.slice-10.diagnostic-readiness-integration-plan.proposal.v1";
const expectedDecisionIds = [
  "readiness_input_contract_and_version_pins",
  "activation_prerequisite_reconciliation",
  "blocker_reconciliation_and_reopening",
  "production_approval_input_requirements",
  "coverage_completion_input_requirements",
  "evidence_digest_identity_dependency_requirements",
  "readiness_transition_guard_and_authority",
  "withdrawal_and_readiness_rollback",
  "ci_validation_gate_and_negative_vectors",
  "readiness_policy_change_and_activation_sequencing",
];
const blockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];
const placeholderIds = [
  "readiness_input_contract_and_version_pins",
  "activation_prerequisite_reconciliation",
  "blocker_reconciliation_and_reopening",
  "production_approval_input_requirements",
  "coverage_completion_input_requirements",
  "evidence_digest_identity_dependency_requirements",
  "readiness_transition_guard_and_authority",
  "withdrawal_and_readiness_rollback",
  "ci_validation_gate_and_negative_vectors",
  "readiness_policy_change_and_activation_sequencing",
];
const forbiddenTerms = [
  "finalanswer",
  "correctanswer",
  "workedsolution",
  "solution",
  "hint",
  "scoring",
  "mastery",
  "proficiency",
  "providerpayload",
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
  "rawmedia",
  "apiroute",
  "openapi",
  "prisma",
  "migration",
  "runtime",
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
const slice9ChangedPaths = [
  "docs/wave-6/open-decisions.md",
  "package.json",
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
  "docs/wave-6/diagnostic-coverage-gap-closure-plan-decision-proposal.md",
  "docs/wave-6/slice-9-implementation-note.md",
  "packages/curriculum/diagnostic-coverage-gap-closure-plan-decision-proposal/grade-7-9-math.coverage-gap-closure-plan-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-coverage-gap-closure-plan-decision-proposal.test.mjs",
];
const slice9PrimaryPaths = new Set([
  "docs/wave-6/diagnostic-coverage-gap-closure-plan-decision-proposal.md",
  "docs/wave-6/slice-9-implementation-note.md",
  "packages/curriculum/diagnostic-coverage-gap-closure-plan-decision-proposal/grade-7-9-math.coverage-gap-closure-plan-decision-proposal.v1.json",
]);
const slice10PrimaryPaths = [
  "docs/wave-6/diagnostic-readiness-integration-plan-decision-proposal.md",
  "docs/wave-6/slice-10-implementation-note.md",
  "packages/curriculum/diagnostic-readiness-integration-plan-decision-proposal/grade-7-9-math.readiness-integration-plan-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan-decision-proposal.test.mjs",
];
const slice11PrimaryPaths = [
  "docs/wave-6/diagnostic-rollback-withdrawal-policy-decision-proposal.md",
  "docs/wave-6/slice-11-implementation-note.md",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy-decision-proposal/grade-7-9-math.rollback-withdrawal-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy-decision-proposal.test.mjs",
];
export const changedPaths = [
  ...slice9ChangedPaths.filter((changedPath) => !slice9PrimaryPaths.has(changedPath)),
  ...slice10PrimaryPaths,
];
const slice11ChangedPaths = [
  ...changedPaths.filter((changedPath) => !new Set(slice10PrimaryPaths).has(changedPath)),
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs",
  ...slice11PrimaryPaths,
];
const slice11ChangedPathSet = new Set(slice11ChangedPaths);
const changedPathSet = new Set(changedPaths);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../../..");
export const defaultProposalPath = path.resolve(
  scriptDirectory,
  "../diagnostic-readiness-integration-plan-decision-proposal/grade-7-9-math.readiness-integration-plan-decision-proposal.v1.json",
);

export class DiagnosticReadinessIntegrationPlanDecisionProposalValidationError extends Error {}

function fail(message) {
  throw new DiagnosticReadinessIntegrationPlanDecisionProposalValidationError(message);
}

function exact(actual, expected, label) {
  if (!Object.is(actual, expected)) fail(`${label} must equal ${JSON.stringify(expected)}.`);
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(`${label} must be an object.`);
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(required)) {
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
        fail(`${fieldPath} contains forbidden/private content.`);
      }
      if (/(?:https?|s3|minio|file):\/\//i.test(value)) fail(`${fieldPath} contains a URL.`);
      if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)) fail(`${fieldPath} contains contact data.`);
      if (
        /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i.test(value)
      ) {
        fail(`${fieldPath} contains an identity value.`);
      }
      if (/\b[0-9a-f]{32,}\b/i.test(value)) fail(`${fieldPath} contains an immutable value.`);
    }
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    const lower = key.toLowerCase();
    if (forbiddenExactFields.has(lower) || forbiddenTerms.some((term) => lower === term)) {
      fail(`${fieldPath}.${key} is forbidden.`);
    }
    rejectForbidden(nested, `${fieldPath}.${key}`);
  }
}

function validateMetadata(artifact) {
  exactKeys(
    artifact.metadata,
    [
      "schemaVersion",
      "proposalArtifactVersion",
      "proposalVersion",
      "status",
      "artifactKind",
      "subject",
      "locale",
      "audienceGrades",
      "readinessIntegrationPlaceholderArtifactVersion",
      "readinessIntegrationPlaceholderPlanVersion",
      "activationPrerequisitesArtifactVersion",
      "readinessPolicyVersion",
      "readinessEvaluationVersion",
      "sourceContract",
      "sourceProposal",
      "productionUseAllowed",
      "runtimeUseAllowed",
      "inputEvaluationAllowed",
      "blockerClosureAllowed",
      "readinessTransitionAllowed",
      "policyChangeAllowed",
    ],
    "metadata",
  );
  exact(
    artifact.metadata.proposalArtifactVersion,
    expectedArtifactVersion,
    "metadata.proposalArtifactVersion",
  );
  exact(artifact.metadata.proposalVersion, expectedProposalVersion, "metadata.proposalVersion");
  exact(artifact.metadata.status, "PROPOSED_DEFERRED", "metadata.status");
  exact(artifact.metadata.productionUseAllowed, false, "metadata.productionUseAllowed");
  exact(artifact.metadata.runtimeUseAllowed, false, "metadata.runtimeUseAllowed");
  exact(artifact.metadata.inputEvaluationAllowed, false, "metadata.inputEvaluationAllowed");
  exact(artifact.metadata.blockerClosureAllowed, false, "metadata.blockerClosureAllowed");
  exact(artifact.metadata.readinessTransitionAllowed, false, "metadata.readinessTransitionAllowed");
  exact(artifact.metadata.policyChangeAllowed, false, "metadata.policyChangeAllowed");
}

function validateUpstream(upstream) {
  const expected = {
    readinessIntegrationPlaceholder: [
      "artifactVersion",
      "planVersion",
      "planState",
      "prerequisiteId",
      "prerequisiteStatus",
      "integrationEvaluationAllowed",
      "readinessTransitionAllowed",
      "blockerClosureAllowed",
    ],
    activationPrerequisites: [
      "artifactVersion",
      "prerequisiteCount",
      "unsatisfiedPrerequisiteCount",
      "satisfiedPrerequisiteCount",
      "activationStatus",
      "workflowStatus",
      "productionApprovalCount",
    ],
    candidateIdentity: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "allocationAllowed",
      "candidateRecordCount",
    ],
    canonicalizationDigest: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "policyActivationAllowed",
      "selectedAlgorithmCount",
      "digestValueCount",
    ],
    reviewerRoleOwnership: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "roleOwnerCount",
      "reviewerAssignmentCount",
    ],
    separationOfDuties: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "enforcementAllowed",
    ],
    conflictOfInterest: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "identityComparisonAllowed",
    ],
    auditIdentity: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "identityBindingAllowed",
      "auditEventCount",
    ],
    evidenceStorageRetention: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "evidenceRecordCount",
      "retentionScheduleCount",
    ],
    productionApprovalAuthority: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "authorityGrantCount",
      "approvalDecisionCount",
      "productionApprovalCount",
      "approvalInputAllowed",
    ],
    coverageGapClosure: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "slotCount",
      "draftOnlySlotCount",
      "gapConfirmedSlotCount",
      "closedGapCount",
      "coverageClosureAllowed",
    ],
    rollbackWithdrawal: [
      "artifactVersion",
      "policyVersion",
      "prerequisiteStatus",
      "activeRuleCount",
      "rollbackExecutionAllowed",
    ],
    ciValidationGate: [
      "artifactVersion",
      "gateVersion",
      "prerequisiteStatus",
      "activeRuleCount",
      "gateExecutionCount",
      "readinessAuthorizationAllowed",
    ],
  };
  exactKeys(upstream, Object.keys(expected), "upstreamReferences");
  for (const [name, keys] of Object.entries(expected))
    exactKeys(upstream[name], keys, `upstreamReferences.${name}`);
  exact(
    upstream.readinessIntegrationPlaceholder.artifactVersion,
    "wave-5.slice-12.grade-7-9-math.v1",
    "readiness placeholder pin",
  );
  exact(
    upstream.readinessIntegrationPlaceholder.planVersion,
    "wave-5.slice-12.diagnostic-readiness-integration-plan.placeholder.v1",
    "readiness placeholder plan pin",
  );
  exact(
    upstream.readinessIntegrationPlaceholder.prerequisiteStatus,
    "UNSATISFIED_DEFERRED",
    "readiness placeholder prerequisite",
  );
  exact(
    upstream.activationPrerequisites.artifactVersion,
    "wave-5.slice-2.grade-7-9-math.v1",
    "activation pin",
  );
  exact(
    upstream.activationPrerequisites.satisfiedPrerequisiteCount,
    0,
    "activation satisfied count",
  );
  exact(
    upstream.candidateIdentity.artifactVersion,
    "wave-6.slice-1.grade-7-9-math.v1",
    "Slice 1 pin",
  );
  exact(
    upstream.canonicalizationDigest.artifactVersion,
    "wave-6.slice-2.grade-7-9-math.v1",
    "Slice 2 pin",
  );
  exact(
    upstream.reviewerRoleOwnership.artifactVersion,
    "wave-6.slice-3.grade-7-9-math.v1",
    "Slice 3 pin",
  );
  exact(
    upstream.separationOfDuties.artifactVersion,
    "wave-6.slice-4.grade-7-9-math.v1",
    "Slice 4 pin",
  );
  exact(
    upstream.conflictOfInterest.artifactVersion,
    "wave-6.slice-5.grade-7-9-math.v1",
    "Slice 5 pin",
  );
  exact(upstream.auditIdentity.artifactVersion, "wave-6.slice-6.grade-7-9-math.v1", "Slice 6 pin");
  exact(
    upstream.evidenceStorageRetention.artifactVersion,
    "wave-6.slice-7.grade-7-9-math.v1",
    "Slice 7 pin",
  );
  exact(
    upstream.productionApprovalAuthority.artifactVersion,
    "wave-6.slice-8.grade-7-9-math.v1",
    "Slice 8 pin",
  );
  exact(
    upstream.coverageGapClosure.artifactVersion,
    "wave-6.slice-9.grade-7-9-math.v1",
    "Slice 9 pin",
  );
  exact(
    upstream.rollbackWithdrawal.artifactVersion,
    "wave-5.slice-13.grade-7-9-math.v1",
    "rollback pin",
  );
  exact(upstream.ciValidationGate.artifactVersion, "wave-5.slice-14.grade-7-9-math.v1", "CI pin");
  for (const [name, value] of Object.entries(upstream)) {
    if ("prerequisiteStatus" in value)
      exact(
        value.prerequisiteStatus,
        "UNSATISFIED_DEFERRED",
        `upstreamReferences.${name}.prerequisiteStatus`,
      );
  }
  for (const key of [
    "integrationEvaluationAllowed",
    "readinessTransitionAllowed",
    "blockerClosureAllowed",
    "allocationAllowed",
    "policyActivationAllowed",
    "enforcementAllowed",
    "identityComparisonAllowed",
    "identityBindingAllowed",
    "approvalInputAllowed",
    "coverageClosureAllowed",
    "rollbackExecutionAllowed",
    "readinessAuthorizationAllowed",
  ]) {
    const value = Object.values(upstream).find((entry) => Object.hasOwn(entry, key));
    if (value) exact(value[key], false, `upstream non-authorizing ${key}`);
  }
  for (const key of [
    "candidateRecordCount",
    "selectedAlgorithmCount",
    "digestValueCount",
    "roleOwnerCount",
    "reviewerAssignmentCount",
    "auditEventCount",
    "evidenceRecordCount",
    "retentionScheduleCount",
    "authorityGrantCount",
    "approvalDecisionCount",
    "productionApprovalCount",
    "closedGapCount",
    "activeRuleCount",
    "gateExecutionCount",
  ]) {
    for (const entry of Object.values(upstream))
      if (Object.hasOwn(entry, key)) exact(entry[key], 0, `upstream zero ${key}`);
  }
}

function validateBaseline(artifact) {
  exactKeys(
    artifact.baseline,
    [
      "readiness",
      "activation",
      "readinessIntegrationPrerequisite",
      "prerequisiteCount",
      "unsatisfiedPrerequisiteCount",
      "satisfiedPrerequisiteCount",
      "coverage",
    ],
    "baseline",
  );
  exact(artifact.baseline.readiness.status, "NOT_READY", "baseline.readiness.status");
  exactArray(
    artifact.baseline.readiness.blockingReasons,
    blockingReasons,
    "baseline.readiness.blockingReasons",
  );
  exact(artifact.baseline.activation.status, "BLOCKED", "baseline.activation.status");
  exact(
    artifact.baseline.activation.workflowStatus,
    "INACTIVE",
    "baseline.activation.workflowStatus",
  );
  exact(
    artifact.baseline.readinessIntegrationPrerequisite.prerequisiteId,
    "readiness_integration_plan",
    "baseline.prerequisite.id",
  );
  exact(
    artifact.baseline.readinessIntegrationPrerequisite.status,
    "UNSATISFIED_DEFERRED",
    "baseline.prerequisite.status",
  );
  emptyArray(
    artifact.baseline.readinessIntegrationPrerequisite.evidenceRecordRefs,
    "baseline.prerequisite.evidenceRecordRefs",
  );
  exact(artifact.baseline.prerequisiteCount, 12, "baseline.prerequisiteCount");
  exact(
    artifact.baseline.unsatisfiedPrerequisiteCount,
    12,
    "baseline.unsatisfiedPrerequisiteCount",
  );
  exact(artifact.baseline.satisfiedPrerequisiteCount, 0, "baseline.satisfiedPrerequisiteCount");
  exact(artifact.baseline.coverage.slotCount, 11, "baseline.coverage.slotCount");
  exact(artifact.baseline.coverage.draftOnlySlotCount, 5, "baseline.coverage.draftOnlySlotCount");
  exact(
    artifact.baseline.coverage.gapConfirmedSlotCount,
    6,
    "baseline.coverage.gapConfirmedSlotCount",
  );
  exact(
    artifact.baseline.coverage.productionApprovedSlotCount,
    0,
    "baseline.coverage.productionApprovedSlotCount",
  );
  exact(artifact.baseline.coverage.closedGapCount, 0, "baseline.coverage.closedGapCount");
}

function validatePlaceholders(artifact) {
  for (const [key, id] of [
    ["readinessInputContractPlaceholder", placeholderIds[0]],
    ["activationPrerequisiteReconciliationPlaceholder", placeholderIds[1]],
    ["blockerReconciliationPlaceholder", placeholderIds[2]],
    ["productionApprovalInputPlaceholder", placeholderIds[3]],
    ["coverageCompletionInputPlaceholder", placeholderIds[4]],
    ["evidenceDigestIdentityDependencyPlaceholder", placeholderIds[5]],
    ["readinessTransitionGuardPlaceholder", placeholderIds[6]],
    ["readinessRollbackPlaceholder", placeholderIds[7]],
    ["ciValidationGatePlaceholder", placeholderIds[8]],
    ["policyChangeActivationSequencingPlaceholder", placeholderIds[9]],
  ]) {
    const placeholder = artifact[key];
    exact(placeholder.requirementId, id, `${key}.requirementId`);
    exact(placeholder.state, "UNRESOLVED_DEFERRED", `${key}.state`);
    exactArray(placeholder.activeRuleReferences, [], `${key}.activeRuleReferences`);
    for (const [field, value] of Object.entries(placeholder)) {
      if (field.endsWith("Allowed")) exact(value, false, `${key}.${field}`);
      if (field.endsWith("Reference") || field.endsWith("References")) {
        if (Array.isArray(value)) emptyArray(value, `${key}.${field}`);
        else exact(value, null, `${key}.${field}`);
      }
    }
  }
}

function validateDecisions(artifact) {
  exactArray(
    artifact.decisionRequirements.map((item) => item.decisionId),
    expectedDecisionIds,
    "decision IDs",
  );
  exact(artifact.decisionRequirements.length, expectedDecisionIds.length, "decision count");
  for (const item of artifact.decisionRequirements) {
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
    exactArray(item.activeRuleReferences, [], `decision.${item.decisionId}.activeRuleReferences`);
    exact(item.decisionRecorded, false, `decision.${item.decisionId}.decisionRecorded`);
  }
}

function validateRecords(artifact) {
  exactKeys(
    artifact.recordBoundary,
    [
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
      "runtimeIntegrationEnabled",
    ],
    "recordBoundary",
  );
  for (const [key, value] of Object.entries(artifact.recordBoundary))
    exact(value, false, `recordBoundary.${key}`);
  const recordKeys = [
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
  ];
  for (const key of recordKeys) emptyArray(artifact[key], key);
}

function validateAggregate(artifact) {
  const expectedKeys = [
    "decisionRequirementCount",
    "unresolvedDecisionCount",
    "blockingReasonCount",
    "openBlockingReasonCount",
    "prerequisiteCount",
    "unsatisfiedPrerequisiteCount",
    "satisfiedPrerequisiteCount",
    "slotCount",
    "draftOnlySlotCount",
    "gapConfirmedSlotCount",
    "productionApprovedSlotCount",
    "closedGapCount",
    "readinessInputRecordCount",
    "blockerReconciliationRecordCount",
    "blockerClosureRecordCount",
    "productionApprovalInputRecordCount",
    "coverageCompletionInputRecordCount",
    "evidenceDependencyRecordCount",
    "digestDependencyRecordCount",
    "identityDependencyRecordCount",
    "readinessTransitionRecordCount",
    "readinessRollbackRecordCount",
    "ciGateExecutionCount",
    "readyStateRecordCount",
    "productionApprovalCount",
    "approvalDecisionCount",
    "authorityGrantCount",
    "auditEventCount",
  ];
  exactKeys(artifact.aggregate, expectedKeys, "aggregate");
  for (const key of expectedKeys) {
    if (
      key.endsWith("Count") &&
      ![
        "decisionRequirementCount",
        "unresolvedDecisionCount",
        "blockingReasonCount",
        "openBlockingReasonCount",
        "prerequisiteCount",
        "unsatisfiedPrerequisiteCount",
        "slotCount",
        "draftOnlySlotCount",
        "gapConfirmedSlotCount",
      ].includes(key)
    ) {
      exact(artifact.aggregate[key], 0, `aggregate.${key}`);
    }
  }
  exact(artifact.aggregate.decisionRequirementCount, 10, "aggregate.decisionRequirementCount");
  exact(artifact.aggregate.unresolvedDecisionCount, 10, "aggregate.unresolvedDecisionCount");
  exact(artifact.aggregate.blockingReasonCount, 2, "aggregate.blockingReasonCount");
  exact(artifact.aggregate.openBlockingReasonCount, 2, "aggregate.openBlockingReasonCount");
  exact(artifact.aggregate.prerequisiteCount, 12, "aggregate.prerequisiteCount");
  exact(
    artifact.aggregate.unsatisfiedPrerequisiteCount,
    12,
    "aggregate.unsatisfiedPrerequisiteCount",
  );
  exact(artifact.aggregate.slotCount, 11, "aggregate.slotCount");
  exact(artifact.aggregate.draftOnlySlotCount, 5, "aggregate.draftOnlySlotCount");
  exact(artifact.aggregate.gapConfirmedSlotCount, 6, "aggregate.gapConfirmedSlotCount");
}

export async function readDiagnosticReadinessIntegrationPlanDecisionProposal(
  artifactPath = defaultProposalPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export function validateDiagnosticReadinessIntegrationPlanDecisionProposal(artifact) {
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact))
    fail("Artifact must be an object.");
  exactKeys(
    artifact,
    [
      "metadata",
      "upstreamReferences",
      "baseline",
      "decisionRequirements",
      "readinessInputContractPlaceholder",
      "activationPrerequisiteReconciliationPlaceholder",
      "blockerReconciliationPlaceholder",
      "productionApprovalInputPlaceholder",
      "coverageCompletionInputPlaceholder",
      "evidenceDigestIdentityDependencyPlaceholder",
      "readinessTransitionGuardPlaceholder",
      "readinessRollbackPlaceholder",
      "ciValidationGatePlaceholder",
      "policyChangeActivationSequencingPlaceholder",
      "recordBoundary",
      "aggregate",
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
    ],
    "artifact",
  );
  rejectForbidden(artifact);
  validateMetadata(artifact);
  validateUpstream(artifact.upstreamReferences);
  validateBaseline(artifact);
  validateDecisions(artifact);
  validatePlaceholders(artifact);
  validateRecords(artifact);
  validateAggregate(artifact);
  return {
    proposalArtifactVersion: expectedArtifactVersion,
    proposalVersion: expectedProposalVersion,
    decisionRequirementCount: 10,
    prerequisiteStatus: artifact.baseline.readinessIntegrationPrerequisite.status,
    activationStatus: artifact.baseline.activation.status,
    workflowStatus: artifact.baseline.activation.workflowStatus,
    readiness: artifact.baseline.readiness.status,
  };
}

function git(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { status: result.status ?? 1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function localPaths(cwd) {
  const result = git(["status", "--short", "--untracked-files=all"], cwd);
  if (result.status !== 0) fail(`Unable to inspect git status: ${result.stderr || result.stdout}`);
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => line.slice(3).trim().split(" -> "))
    .map((value) => value.replaceAll("\\", "/"));
}

export function validateDiagnosticReadinessIntegrationPlanDecisionProposalChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !changedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 10 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== changedPaths.length) {
    fail(`Wave 6 Slice 10 requires exactly ${changedPaths.length} changed paths.`);
  }
  return normalized;
}

export function validateDiagnosticReadinessIntegrationPlanDecisionProposalWorktreeScope(
  paths,
  { ci = false } = {},
) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  if (!ci && paths.length === 0) return [];
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (
    normalized.length === slice11ChangedPaths.length &&
    new Set(normalized).size === normalized.length &&
    normalized.every((value) => slice11ChangedPathSet.has(value))
  ) {
    return normalized;
  }
  return validateDiagnosticReadinessIntegrationPlanDecisionProposalChangedPaths(paths);
}

export async function main() {
  const artifact = await readDiagnosticReadinessIntegrationPlanDecisionProposal();
  const summary = validateDiagnosticReadinessIntegrationPlanDecisionProposal(artifact);
  if (process.argv.includes("--check-worktree-scope")) {
    validateDiagnosticReadinessIntegrationPlanDecisionProposalWorktreeScope(
      localPaths(repositoryRoot),
    );
  }
  console.log(
    `[curriculum] Readiness integration decision proposal validated: ${summary.decisionRequirementCount} unresolved requirements; prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
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
