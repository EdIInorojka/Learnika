import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  wave6ClosureContinuationPaths,
  preWave7Slice1ChangedPaths,
  wave7PrepContinuationPaths,
  wave7PrepFoundationPaths,
} from "./validate-skill-graph.mjs";

const expectedArtifactVersion = "wave-6.slice-11.grade-7-9-math.v1";
const expectedProposalVersion = "wave-6.slice-11.diagnostic-rollback-withdrawal-policy.proposal.v1";
const blockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];
const withdrawalScopes = [
  "candidate_revision",
  "policy_change",
  "expired_evidence",
  "rights_dispute",
  "safety_issue",
  "authorization_failure",
  "digest_incident",
];
const rollbackScopes = [
  "readiness_input_invalidation",
  "coverage_reconciliation_failure",
  "production_approval_withdrawal",
  "partial_propagation_failure",
  "policy_version_incompatibility",
];
const decisionIds = [
  "withdrawal_trigger_taxonomy",
  "rollback_trigger_taxonomy",
  "candidate_withdrawal_and_containment",
  "production_approval_withdrawal",
  "evidence_withdrawal_and_tombstone",
  "digest_invalidation_and_dependency_propagation",
  "readiness_rollback_and_blocker_reopening",
  "audit_trail_and_history_preservation",
  "notification_and_escalation",
  "restoration_reapproval_and_forward_fix",
  "partial_failure_reconciliation_and_recovery",
];
const placeholderKeys = [
  "withdrawalTriggerTaxonomyPlaceholder",
  "rollbackTriggerTaxonomyPlaceholder",
  "candidateWithdrawalAndContainmentPlaceholder",
  "productionApprovalWithdrawalPlaceholder",
  "evidenceWithdrawalTombstonePlaceholder",
  "digestInvalidationPropagationPlaceholder",
  "readinessRollbackPlaceholder",
  "auditHistoryPreservationPlaceholder",
  "notificationEscalationPlaceholder",
  "restorationReapprovalForwardFixPlaceholder",
  "partialFailureRecoveryPlaceholder",
];
const recordArrayKeys = [
  "triggerEvaluationRecords",
  "candidateWithdrawalRecords",
  "productionApprovalWithdrawalRecords",
  "evidenceWithdrawalRecords",
  "digestInvalidationRecords",
  "readinessRollbackRecords",
  "rollbackRecords",
  "revocationRecords",
  "tombstoneRecords",
  "restorationRecords",
  "reapprovalRecords",
  "blockerReopeningRecords",
  "notificationRecords",
  "escalationRecords",
  "auditEventRecords",
  "realCandidateRecords",
  "evidenceRecords",
  "identityRecords",
  "authorityGrantRecords",
  "productionApprovalRecords",
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
const slice10PrimaryPaths = new Set([
  "docs/wave-6/diagnostic-readiness-integration-plan-decision-proposal.md",
  "docs/wave-6/slice-10-implementation-note.md",
  "packages/curriculum/diagnostic-readiness-integration-plan-decision-proposal/grade-7-9-math.readiness-integration-plan-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-rollback-withdrawal-policy-decision-proposal.md",
  "docs/wave-6/slice-11-implementation-note.md",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy-decision-proposal/grade-7-9-math.rollback-withdrawal-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy-decision-proposal.test.mjs",
]);
const slice10ChangedPaths = [
  "docs/wave-6/open-decisions.md",
  "package.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs",
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
  "packages/curriculum/test/diagnostic-coverage-gap-closure-plan-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];
const slice11PrimaryPaths = [
  "docs/wave-6/diagnostic-rollback-withdrawal-policy-decision-proposal.md",
  "docs/wave-6/slice-11-implementation-note.md",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy-decision-proposal/grade-7-9-math.rollback-withdrawal-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy-decision-proposal.test.mjs",
];
const changedPaths = [
  ...slice10ChangedPaths.filter((value) => !slice10PrimaryPaths.has(value)),
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs",
  ...slice11PrimaryPaths,
];
const changedPathSet = new Set(changedPaths);
const slice12PrimaryPaths = [
  "docs/wave-6/diagnostic-ci-validation-activation-gate-decision-proposal.md",
  "docs/wave-6/slice-12-implementation-note.md",
  "packages/curriculum/diagnostic-ci-validation-activation-gate-decision-proposal/grade-7-9-math.ci-validation-activation-gate-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate-decision-proposal.test.mjs",
];
const slice12ChangedPaths = [
  ...changedPaths.filter((value) => !new Set(slice11PrimaryPaths).has(value)),
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs",
  ...slice12PrimaryPaths,
];
const slice12ChangedPathSet = new Set(slice12ChangedPaths);
const slice13PrimaryPaths = [
  "docs/wave-6/diagnostic-activation-slice-boundary-decision-proposal.md",
  "docs/wave-6/slice-13-implementation-note.md",
  "packages/curriculum/diagnostic-activation-slice-boundary-decision-proposal/grade-7-9-math.activation-slice-boundary-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-activation-slice-boundary-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-activation-slice-boundary-decision-proposal.test.mjs",
];
const slice13PrimaryPathSet = new Set(slice12PrimaryPaths);
const slice13ChangedPaths = [
  ...slice12ChangedPaths.filter((value) => !slice13PrimaryPathSet.has(value)),
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate-decision-proposal.test.mjs",
  ...slice13PrimaryPaths,
];
const slice13ChangedPathSet = new Set(slice13ChangedPaths);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../../..");
export const defaultProposalPath = path.resolve(
  scriptDirectory,
  "../diagnostic-rollback-withdrawal-policy-decision-proposal/grade-7-9-math.rollback-withdrawal-policy-decision-proposal.v1.json",
);

export class DiagnosticRollbackWithdrawalPolicyDecisionProposalValidationError extends Error {}

function fail(message) {
  throw new DiagnosticRollbackWithdrawalPolicyDecisionProposalValidationError(message);
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
      "rollbackWithdrawalPlaceholderArtifactVersion",
      "rollbackWithdrawalPlaceholderPolicyVersion",
      "readinessIntegrationProposalArtifactVersion",
      "readinessIntegrationProposalVersion",
      "readinessIntegrationPlaceholderArtifactVersion",
      "readinessIntegrationPlaceholderPlanVersion",
      "activationPrerequisitesArtifactVersion",
      "readinessPolicyVersion",
      "readinessEvaluationVersion",
      "sourceContract",
      "readinessIntegrationSourceContract",
      "productionUseAllowed",
      "runtimeUseAllowed",
      "rollbackExecutionAllowed",
      "withdrawalExecutionAllowed",
      "readinessTransitionAllowed",
      "prerequisiteSatisfactionAllowed",
      "policyChangeAllowed",
    ],
    "metadata",
  );
  exact(
    metadata.proposalArtifactVersion,
    expectedArtifactVersion,
    "metadata.proposalArtifactVersion",
  );
  exact(metadata.proposalVersion, expectedProposalVersion, "metadata.proposalVersion");
  exact(metadata.status, "PROPOSED_DEFERRED", "metadata.status");
  for (const key of [
    "productionUseAllowed",
    "runtimeUseAllowed",
    "rollbackExecutionAllowed",
    "withdrawalExecutionAllowed",
    "readinessTransitionAllowed",
    "prerequisiteSatisfactionAllowed",
    "policyChangeAllowed",
  ])
    exact(metadata[key], false, `metadata.${key}`);
}

function validateUpstream(upstream) {
  const expectedGroups = [
    "rollbackWithdrawalPlaceholder",
    "readinessIntegrationProposal",
    "readinessIntegrationPlaceholder",
    "activationPrerequisites",
    "coverageGapClosure",
    "productionApprovalAuthority",
    "evidenceStorageRetention",
    "auditIdentity",
    "conflictOfInterest",
    "separationOfDuties",
    "reviewerRoleOwnership",
    "canonicalizationDigest",
    "candidateIdentity",
    "ciValidationGate",
  ];
  exactKeys(upstream, expectedGroups, "upstreamReferences");
  const expectedKeys = {
    rollbackWithdrawalPlaceholder: [
      "artifactVersion",
      "policyVersion",
      "policyState",
      "prerequisiteStatus",
      "activeRuleCount",
      "rollbackExecutionAllowed",
      "withdrawalExecutionAllowed",
      "rollbackRecordCount",
      "withdrawalRecordCount",
    ],
    readinessIntegrationProposal: [
      "artifactVersion",
      "proposalVersion",
      "status",
      "prerequisiteStatus",
      "readinessIntegrationAllowed",
      "rollbackExecutionAllowed",
      "decisionRequirementCount",
      "unresolvedDecisionCount",
      "readinessInputRecordCount",
      "readinessTransitionRecordCount",
    ],
    readinessIntegrationPlaceholder: [
      "artifactVersion",
      "planVersion",
      "planState",
      "prerequisiteStatus",
      "integrationEvaluationAllowed",
      "readinessTransitionAllowed",
      "rollbackExecutionAllowed",
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
    coverageGapClosure: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "closedGapCount",
      "productionApprovalCount",
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
    evidenceStorageRetention: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "evidenceRecordCount",
      "retentionScheduleCount",
    ],
    auditIdentity: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "identityBindingAllowed",
      "auditEventCount",
    ],
    conflictOfInterest: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "identityComparisonAllowed",
    ],
    separationOfDuties: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "enforcementAllowed",
    ],
    reviewerRoleOwnership: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "reviewerAssignmentCount",
    ],
    canonicalizationDigest: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "policyActivationAllowed",
      "digestValueCount",
    ],
    candidateIdentity: [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "candidateRecordCount",
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
  for (const [group, keys] of Object.entries(expectedKeys)) {
    exactKeys(upstream[group], keys, `upstreamReferences.${group}`);
    if (Object.hasOwn(upstream[group], "prerequisiteStatus")) {
      exact(
        upstream[group].prerequisiteStatus,
        "UNSATISFIED_DEFERRED",
        `${group}.prerequisiteStatus`,
      );
    }
  }
  exact(
    upstream.rollbackWithdrawalPlaceholder.artifactVersion,
    "wave-5.slice-13.grade-7-9-math.v1",
    "rollback placeholder pin",
  );
  exact(
    upstream.rollbackWithdrawalPlaceholder.policyVersion,
    "wave-5.slice-13.diagnostic-rollback-and-withdrawal.placeholder.v1",
    "rollback policy pin",
  );
  exact(
    upstream.readinessIntegrationProposal.artifactVersion,
    "wave-6.slice-10.grade-7-9-math.v1",
    "Slice 10 pin",
  );
  exact(
    upstream.readinessIntegrationProposal.proposalVersion,
    "wave-6.slice-10.diagnostic-readiness-integration-plan.proposal.v1",
    "Slice 10 proposal pin",
  );
  exact(
    upstream.readinessIntegrationPlaceholder.artifactVersion,
    "wave-5.slice-12.grade-7-9-math.v1",
    "readiness placeholder pin",
  );
  exact(
    upstream.readinessIntegrationPlaceholder.planVersion,
    "wave-5.slice-12.diagnostic-readiness-integration-plan.placeholder.v1",
    "readiness plan pin",
  );
  exact(
    upstream.activationPrerequisites.artifactVersion,
    "wave-5.slice-2.grade-7-9-math.v1",
    "activation pin",
  );
  exact(
    upstream.coverageGapClosure.artifactVersion,
    "wave-6.slice-9.grade-7-9-math.v1",
    "Slice 9 pin",
  );
  exact(
    upstream.productionApprovalAuthority.artifactVersion,
    "wave-6.slice-8.grade-7-9-math.v1",
    "Slice 8 pin",
  );
  exact(
    upstream.evidenceStorageRetention.artifactVersion,
    "wave-6.slice-7.grade-7-9-math.v1",
    "Slice 7 pin",
  );
  exact(upstream.auditIdentity.artifactVersion, "wave-6.slice-6.grade-7-9-math.v1", "Slice 6 pin");
  exact(
    upstream.conflictOfInterest.artifactVersion,
    "wave-6.slice-5.grade-7-9-math.v1",
    "Slice 5 pin",
  );
  exact(
    upstream.separationOfDuties.artifactVersion,
    "wave-6.slice-4.grade-7-9-math.v1",
    "Slice 4 pin",
  );
  exact(
    upstream.reviewerRoleOwnership.artifactVersion,
    "wave-6.slice-3.grade-7-9-math.v1",
    "Slice 3 pin",
  );
  exact(
    upstream.canonicalizationDigest.artifactVersion,
    "wave-6.slice-2.grade-7-9-math.v1",
    "Slice 2 pin",
  );
  exact(
    upstream.candidateIdentity.artifactVersion,
    "wave-6.slice-1.grade-7-9-math.v1",
    "Slice 1 pin",
  );
  exact(upstream.ciValidationGate.artifactVersion, "wave-5.slice-14.grade-7-9-math.v1", "CI pin");
  for (const value of Object.values(upstream)) {
    for (const key of Object.keys(value)) {
      if (key.endsWith("Allowed")) exact(value[key], false, `upstreamReferences.${key}`);
      if (
        key.endsWith("Count") &&
        ![
          "prerequisiteCount",
          "unsatisfiedPrerequisiteCount",
          "satisfiedPrerequisiteCount",
          "decisionRequirementCount",
          "unresolvedDecisionCount",
        ].includes(key)
      ) {
        exact(value[key], 0, `upstreamReferences.${key}`);
      }
    }
  }
  exact(upstream.activationPrerequisites.prerequisiteCount, 12, "activation prerequisite count");
  exact(
    upstream.activationPrerequisites.unsatisfiedPrerequisiteCount,
    12,
    "activation unsatisfied count",
  );
  exact(
    upstream.activationPrerequisites.satisfiedPrerequisiteCount,
    0,
    "activation satisfied count",
  );
  exact(upstream.activationPrerequisites.activationStatus, "BLOCKED", "activation status");
  exact(upstream.activationPrerequisites.workflowStatus, "INACTIVE", "workflow status");
}

function validateBaseline(baseline) {
  exactKeys(
    baseline,
    [
      "readiness",
      "activation",
      "rollbackWithdrawalPrerequisite",
      "prerequisiteCount",
      "unsatisfiedPrerequisiteCount",
      "satisfiedPrerequisiteCount",
      "coverage",
    ],
    "baseline",
  );
  exact(baseline.readiness.status, "NOT_READY", "baseline.readiness.status");
  exactArray(
    baseline.readiness.blockingReasons,
    blockingReasons,
    "baseline.readiness.blockingReasons",
  );
  exact(baseline.activation.status, "BLOCKED", "baseline.activation.status");
  exact(baseline.activation.workflowStatus, "INACTIVE", "baseline.activation.workflowStatus");
  exact(
    baseline.rollbackWithdrawalPrerequisite.prerequisiteId,
    "rollback_and_withdrawal_policy",
    "baseline.prerequisite.id",
  );
  exact(
    baseline.rollbackWithdrawalPrerequisite.status,
    "UNSATISFIED_DEFERRED",
    "baseline.prerequisite.status",
  );
  emptyArray(
    baseline.rollbackWithdrawalPrerequisite.evidenceRecordRefs,
    "baseline.prerequisite.evidenceRecordRefs",
  );
  exact(baseline.prerequisiteCount, 12, "baseline.prerequisiteCount");
  exact(baseline.unsatisfiedPrerequisiteCount, 12, "baseline.unsatisfiedPrerequisiteCount");
  exact(baseline.satisfiedPrerequisiteCount, 0, "baseline.satisfiedPrerequisiteCount");
  exact(baseline.coverage.slotCount, 11, "baseline.coverage.slotCount");
  exact(baseline.coverage.draftOnlySlotCount, 5, "baseline.coverage.draftOnlySlotCount");
  exact(baseline.coverage.gapConfirmedSlotCount, 6, "baseline.coverage.gapConfirmedSlotCount");
  exact(
    baseline.coverage.productionApprovedSlotCount,
    0,
    "baseline.coverage.productionApprovedSlotCount",
  );
  exact(baseline.coverage.closedGapCount, 0, "baseline.coverage.closedGapCount");
}

function validateTriggers(artifact) {
  for (const [key, expectedScopes] of [
    ["withdrawalTriggerTaxonomyPlaceholders", withdrawalScopes],
    ["rollbackTriggerTaxonomyPlaceholders", rollbackScopes],
  ]) {
    const entries = artifact[key];
    exactArray(
      entries.map((entry) => entry.triggerScope),
      expectedScopes,
      `${key}.triggerScope`,
    );
    for (const entry of entries) {
      exact(entry.state, "UNRESOLVED_DEFERRED", `${key}.state`);
      exact(entry.recordState, "PLACEHOLDER_ONLY", `${key}.recordState`);
      exactArray(entry.activeRuleReferences, [], `${key}.activeRuleReferences`);
      exact(entry.evaluationAllowed, false, `${key}.evaluationAllowed`);
      exact(entry.executionAllowed, false, `${key}.executionAllowed`);
    }
  }
}

function validateDecisions(artifact) {
  exactArray(
    artifact.decisionRequirements.map((item) => item.decisionId),
    decisionIds,
    "decision IDs",
  );
  exact(artifact.decisionRequirements.length, decisionIds.length, "decision count");
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
  for (const [index, key] of placeholderKeys.entries()) {
    const placeholder = artifact[key];
    exact(placeholder.requirementId, decisionIds[index], `${key}.requirementId`);
    exact(placeholder.state, "UNRESOLVED_DEFERRED", `${key}.state`);
    exact(placeholder.policyReference, null, `${key}.policyReference`);
    exactArray(placeholder.activeRuleReferences, [], `${key}.activeRuleReferences`);
    exact(placeholder.evaluationAllowed, false, `${key}.evaluationAllowed`);
    exact(placeholder.executionAllowed, false, `${key}.executionAllowed`);
  }
}

function validateBoundary(artifact) {
  for (const value of Object.values(artifact.activationBoundary))
    exact(value, false, "activation boundary");
  for (const value of Object.values(artifact.recordBoundary))
    exact(value, false, "record boundary");
  for (const key of recordArrayKeys) emptyArray(artifact[key], key);
  exact(artifact.aggregate.withdrawalTriggerPlaceholderCount, 7, "withdrawal trigger count");
  exact(artifact.aggregate.rollbackTriggerPlaceholderCount, 5, "rollback trigger count");
  exact(artifact.aggregate.decisionRequirementCount, 11, "decision requirement count");
  exact(artifact.aggregate.unresolvedDecisionCount, 11, "unresolved decision count");
  exact(artifact.aggregate.blockingReasonCount, 2, "blocking reason count");
  exact(artifact.aggregate.openBlockingReasonCount, 2, "open blocking reason count");
  exact(artifact.aggregate.closedBlockingReasonCount, 0, "closed blocking reason count");
  exact(artifact.aggregate.prerequisiteCount, 12, "aggregate prerequisite count");
  exact(artifact.aggregate.unsatisfiedPrerequisiteCount, 12, "aggregate unsatisfied count");
  exact(artifact.aggregate.satisfiedPrerequisiteCount, 0, "aggregate satisfied count");
  exact(artifact.aggregate.slotCount, 11, "aggregate slot count");
  exact(artifact.aggregate.draftOnlySlotCount, 5, "aggregate draft-only count");
  exact(artifact.aggregate.gapConfirmedSlotCount, 6, "aggregate gap count");
  exact(artifact.aggregate.productionApprovedSlotCount, 0, "aggregate approved count");
  exact(artifact.aggregate.closedGapCount, 0, "aggregate closed gap count");
  for (const [key, value] of Object.entries(artifact.aggregate)) {
    if (
      key.endsWith("Count") &&
      ![
        "withdrawalTriggerPlaceholderCount",
        "rollbackTriggerPlaceholderCount",
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
    )
      exact(value, 0, `aggregate.${key}`);
  }
}

export async function readDiagnosticRollbackWithdrawalPolicyDecisionProposal(
  artifactPath = defaultProposalPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export function validateDiagnosticRollbackWithdrawalPolicyDecisionProposal(artifact) {
  exactKeys(
    artifact,
    [
      "metadata",
      "upstreamReferences",
      "baseline",
      "withdrawalTriggerTaxonomyPlaceholders",
      "rollbackTriggerTaxonomyPlaceholders",
      "decisionRequirements",
      ...placeholderKeys,
      "activationBoundary",
      "recordBoundary",
      "aggregate",
      ...recordArrayKeys,
    ],
    "artifact",
  );
  rejectForbidden(artifact);
  validateMetadata(artifact.metadata);
  validateUpstream(artifact.upstreamReferences);
  validateBaseline(artifact.baseline);
  validateTriggers(artifact);
  validateDecisions(artifact);
  validateBoundary(artifact);
  return {
    proposalArtifactVersion: expectedArtifactVersion,
    proposalVersion: expectedProposalVersion,
    withdrawalTriggerPlaceholderCount: 7,
    rollbackTriggerPlaceholderCount: 5,
    decisionRequirementCount: 11,
    prerequisiteStatus: artifact.baseline.rollbackWithdrawalPrerequisite.status,
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

export { changedPaths };

export function validateDiagnosticRollbackWithdrawalPolicyDecisionProposalChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !changedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 11 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== changedPaths.length) {
    fail(`Wave 6 Slice 11 requires exactly ${changedPaths.length} changed paths.`);
  }
  return normalized;
}

function validateSlice12ChangedPaths(paths) {
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !slice12ChangedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 12 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== slice12ChangedPaths.length)
    fail(`Wave 6 Slice 12 requires exactly ${slice12ChangedPaths.length} changed paths.`);
  return normalized;
}

export function validateDiagnosticRollbackWithdrawalPolicyDecisionProposalWorktreeScope(
  paths,
  { ci = false } = {},
) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  if (!ci && paths.length === 0) return [];
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (
    normalized.length === wave6ClosureContinuationPaths.size &&
    new Set(normalized).size === normalized.length &&
    normalized.every((value) => wave6ClosureContinuationPaths.has(value))
  )
    return normalized;
  if (
    normalized.length === wave7PrepFoundationPaths.size &&
    new Set(normalized).size === normalized.length &&
    normalized.every((value) => wave7PrepFoundationPaths.has(value))
  )
    return normalized;
  if (
    normalized.length === wave7PrepContinuationPaths.size &&
    new Set(normalized).size === normalized.length &&
    normalized.every((value) => wave7PrepContinuationPaths.has(value))
  )
    return normalized;
  if (
    normalized.length === preWave7Slice1ChangedPaths.size &&
    new Set(normalized).size === normalized.length &&
    normalized.every((value) => preWave7Slice1ChangedPaths.has(value))
  )
    return normalized;
  if (
    normalized.length === slice13ChangedPaths.length &&
    new Set(normalized).size === normalized.length &&
    normalized.every((value) => slice13ChangedPathSet.has(value))
  ) {
    return normalized;
  }
  if (
    normalized.length === slice12ChangedPaths.length &&
    normalized.every((value) => slice12ChangedPathSet.has(value))
  ) {
    return validateSlice12ChangedPaths(normalized);
  }
  return validateDiagnosticRollbackWithdrawalPolicyDecisionProposalChangedPaths(paths);
}

export async function main() {
  const artifact = await readDiagnosticRollbackWithdrawalPolicyDecisionProposal();
  const summary = validateDiagnosticRollbackWithdrawalPolicyDecisionProposal(artifact);
  if (process.argv.includes("--check-worktree-scope")) {
    validateDiagnosticRollbackWithdrawalPolicyDecisionProposalWorktreeScope(
      localPaths(repositoryRoot),
    );
  }
  console.log(
    `[curriculum] Rollback/withdrawal decision proposal validated: ${summary.withdrawalTriggerPlaceholderCount} withdrawal triggers, ${summary.rollbackTriggerPlaceholderCount} rollback triggers, ${summary.decisionRequirementCount} unresolved requirements; prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
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
