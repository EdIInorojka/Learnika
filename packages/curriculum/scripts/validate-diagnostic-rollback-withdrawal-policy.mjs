import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  readDiagnosticReadinessIntegrationPlan,
  readDiagnosticReadinessIntegrationPlanUpstreamArtifacts,
  validateDiagnosticReadinessIntegrationPlan,
} from "./validate-diagnostic-readiness-integration-plan.mjs";

const expectedArtifactVersion = "wave-5.slice-13.grade-7-9-math.v1";
const expectedPolicyVersion = "wave-5.slice-13.diagnostic-rollback-and-withdrawal.placeholder.v1";
const expectedActivationArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedReadinessPlanArtifactVersion = "wave-5.slice-12.grade-7-9-math.v1";
const expectedReadinessPlanVersion =
  "wave-5.slice-12.diagnostic-readiness-integration-plan.placeholder.v1";
const expectedCoveragePlanArtifactVersion = "wave-5.slice-11.grade-7-9-math.v1";
const expectedCoveragePlanVersion =
  "wave-5.slice-11.diagnostic-coverage-gap-closure-plan.placeholder.v1";
const expectedProductionAuthorityArtifactVersion = "wave-5.slice-10.grade-7-9-math.v1";
const expectedProductionAuthorityPolicyVersion =
  "wave-5.slice-10.diagnostic-production-approval-authority.placeholder.v1";
const expectedEvidencePolicyArtifactVersion = "wave-5.slice-9.grade-7-9-math.v1";
const expectedEvidencePolicyVersion =
  "wave-5.slice-9.diagnostic-evidence-storage-and-retention.placeholder.v1";
const expectedAuditPolicyArtifactVersion = "wave-5.slice-8.grade-7-9-math.v1";
const expectedAuditPolicyVersion = "wave-5.slice-8.diagnostic-audit-identity.placeholder.v1";
const expectedWorkflowArtifactVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedWorkflowVersion = "wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const expectedBlockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];
const expectedWithdrawalTriggers = [
  ["CANDIDATE_REVISION_TRIGGER_PLACEHOLDER", "candidate_revision"],
  ["POLICY_CHANGE_TRIGGER_PLACEHOLDER", "policy_change"],
  ["EXPIRED_EVIDENCE_TRIGGER_PLACEHOLDER", "expired_evidence"],
  ["RIGHTS_DISPUTE_TRIGGER_PLACEHOLDER", "rights_dispute"],
  ["SAFETY_ISSUE_TRIGGER_PLACEHOLDER", "safety_issue"],
  ["AUTHORIZATION_FAILURE_TRIGGER_PLACEHOLDER", "authorization_failure"],
  ["DIGEST_INCIDENT_TRIGGER_PLACEHOLDER", "digest_incident"],
];
const expectedRollbackTriggers = [
  ["READINESS_INPUT_INVALIDATION_TRIGGER_PLACEHOLDER", "readiness_input_invalidation"],
  ["COVERAGE_RECONCILIATION_FAILURE_TRIGGER_PLACEHOLDER", "coverage_reconciliation_failure"],
  ["PRODUCTION_APPROVAL_WITHDRAWAL_TRIGGER_PLACEHOLDER", "production_approval_withdrawal"],
  ["PARTIAL_PROPAGATION_FAILURE_TRIGGER_PLACEHOLDER", "partial_propagation_failure"],
  ["POLICY_VERSION_INCOMPATIBILITY_TRIGGER_PLACEHOLDER", "policy_version_incompatibility"],
];
const expectedDecisionRequirementIds = [
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
const forbiddenTerms = [
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
  "email",
  "reviewerEmail",
  "reviewerName",
  "userId",
  "accountId",
  "auditUserId",
  "auditAccountId",
  "auditEmail",
  "immutableDigest",
  "sha256",
  "contentHash",
  "canonicalizedContent",
  "normalizedStem",
  "storageObjectKey",
  "presignedUrl",
  "downloadUrl",
  "uploadUrl",
  "itemStem",
  "stemText",
  "candidateContent",
  "diagnosticItemContent",
];
const forbiddenExactKeys = new Set(["candidateid", "candidateids"]);
const recordBoundaryFields = [
  "policyDecisionsRecorded",
  "withdrawalTriggerEvaluationsRecorded",
  "rollbackTriggerEvaluationsRecorded",
  "candidateWithdrawalsRecorded",
  "productionApprovalWithdrawalsRecorded",
  "evidenceWithdrawalsRecorded",
  "digestInvalidationsRecorded",
  "readinessRollbacksRecorded",
  "rollbacksRecorded",
  "revocationsRecorded",
  "tombstonesRecorded",
  "restorationsRecorded",
  "reapprovalsRecorded",
  "blockerReopeningsRecorded",
  "notificationsRecorded",
  "escalationsRecorded",
  "auditLogsRecorded",
  "auditEventsRecorded",
  "realDiagnosticItemsRecorded",
  "realCandidatesRecorded",
  "approvedCandidatesRecorded",
  "reviewEvidenceRecorded",
  "reviewDecisionsRecorded",
  "digestValuesRecorded",
  "candidateIdentitiesRecorded",
  "reviewerIdentitiesRecorded",
  "auditIdentitiesRecorded",
  "reviewerAssignmentsRecorded",
  "authorityGrantsRecorded",
  "productionApprovalsRecorded",
  "runtimeRollbackEnabled",
  "runtimeWithdrawalEnabled",
  "runtimeTombstoneEnabled",
  "runtimeNotificationEnabled",
  "runtimeRestorationEnabled",
  "runtimeReadinessIntegrationEnabled",
];
const zeroAggregateFields = [
  "closedBlockingReasonCount",
  "satisfiedPrerequisiteCount",
  "activePolicyRuleCount",
  "withdrawalTriggerEvaluationCount",
  "rollbackTriggerEvaluationCount",
  "candidateWithdrawalCount",
  "productionApprovalWithdrawalCount",
  "evidenceWithdrawalCount",
  "digestInvalidationCount",
  "readinessRollbackCount",
  "rollbackRecordCount",
  "revocationRecordCount",
  "tombstoneRecordCount",
  "restorationRecordCount",
  "reapprovalRecordCount",
  "blockerReopeningCount",
  "notificationRecordCount",
  "escalationRecordCount",
  "auditLogCount",
  "auditEventCount",
  "realDiagnosticItemCount",
  "realCandidateCount",
  "approvedCandidateCount",
  "reviewEvidenceRecordCount",
  "reviewDecisionCount",
  "digestValueCount",
  "candidateIdentityCount",
  "reviewerIdentityCount",
  "auditIdentityCount",
  "reviewerAssignmentCount",
  "authorityGrantCount",
  "productionApprovalCount",
];
const protectedRecordFields = [
  "policyDecisionRecords",
  "withdrawalTriggerEvaluationRecords",
  "rollbackTriggerEvaluationRecords",
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
  "auditLogRecords",
  "auditEventRecords",
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
  "productionApprovalRecords",
];
const approvedSlice13ChangedPaths = new Set([
  "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
  "docs/wave-5/slice-13-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy/grade-7-9-math.rollback-withdrawal-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
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
  "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-coverage-gap-closure-plan.test.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
]);
const wave5Slice14ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-ci-validation-activation-gate-contract.md",
  "docs/wave-5/slice-14-implementation-note.md",
  "packages/curriculum/diagnostic-ci-validation-activation-gate/grade-7-9-math.ci-validation-activation-gate-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate.test.mjs",
]);
const wave5ClosureScopeUnblockPaths = new Set(["docs/wave-5/closure-gate.md"]);
const wave6Slice1ScopeUnblockPaths = new Set([
  "docs/wave-6/diagnostic-candidate-identity-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/scope-and-non-goals.md",
  "docs/wave-6/slice-1-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-candidate-identity-policy-decision-proposal/grade-7-9-math.candidate-identity-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs",
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
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
]);
const wave6Slice2ScopeUnblockPaths = new Set([
  "docs/wave-6/diagnostic-canonicalization-digest-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-2-implementation-note.md",
  "docs/wave-6/diagnostic-reviewer-role-ownership-policy-decision-proposal.md",
  "docs/wave-6/slice-3-implementation-note.md",
  "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-separation-of-duties-policy-decision-proposal.md",
  "docs/wave-6/slice-4-implementation-note.md",
  "packages/curriculum/diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "package.json",
  "packages/curriculum/diagnostic-canonicalization-digest-policy-decision-proposal/grade-7-9-math.canonicalization-digest-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs",
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
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-canonicalization-digest-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultRollbackWithdrawalPolicyPath = path.resolve(
  scriptDir,
  "../diagnostic-rollback-withdrawal-policy/grade-7-9-math.rollback-withdrawal-policy-placeholder.v1.json",
);

export class DiagnosticRollbackWithdrawalPolicyValidationError extends Error {}

function fail(message) {
  throw new DiagnosticRollbackWithdrawalPolicyValidationError(message);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, fieldPath) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${fieldPath} must be a non-empty string.`);
  }
}

function requireExactValue(actual, expected, fieldPath) {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      fail(`${fieldPath} must contain exactly ${expected.length} values.`);
    }
    expected.forEach((value, index) =>
      requireExactValue(actual[index], value, `${fieldPath}[${index}]`),
    );
    return;
  }
  if (isPlainObject(expected)) {
    if (!isPlainObject(actual)) {
      fail(`${fieldPath} must be an object.`);
    }
    for (const key of Object.keys(actual)) {
      if (!Object.hasOwn(expected, key)) {
        fail(`${fieldPath}.${key} is an unexpected field.`);
      }
    }
    for (const key of Object.keys(expected)) {
      if (!Object.hasOwn(actual, key)) {
        fail(`${fieldPath}.${key} is required.`);
      }
      requireExactValue(actual[key], expected[key], `${fieldPath}.${key}`);
    }
    return;
  }
  if (!Object.is(actual, expected)) {
    fail(`${fieldPath} must equal ${JSON.stringify(expected)}.`);
  }
}

function scanForbiddenTermsAndPrivateValues(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      scanForbiddenTermsAndPrivateValues(item, `${fieldPath}[${index}]`),
    );
    return;
  }
  if (isPlainObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      if (forbiddenExactKeys.has(normalizedKey)) {
        fail(`${fieldPath}.${key} uses a forbidden candidate identifier field.`);
      }
      for (const term of forbiddenTerms) {
        if (normalizedKey.includes(term.toLowerCase())) {
          fail(`${fieldPath}.${key} uses forbidden field term ${term}.`);
        }
      }
      scanForbiddenTermsAndPrivateValues(nested, `${fieldPath}.${key}`);
    }
    return;
  }
  if (typeof value !== "string") {
    return;
  }
  if (value === "READY") {
    fail(`${fieldPath} cannot contain an enabled readiness state.`);
  }
  const normalizedValue = value.toLowerCase();
  for (const term of forbiddenTerms) {
    if (normalizedValue.includes(term.toLowerCase())) {
      fail(`${fieldPath} uses forbidden content term ${term}.`);
    }
  }
  const privatePatterns = [
    [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "email-like value"],
    [/(?:https?|s3|minio|file):\/\//i, "URL-like value"],
    [/\bwww\.[a-z0-9.-]+\.[a-z]{2,}\b/i, "URL-like value"],
    [
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
      "UUID-like value",
    ],
    [/\buser[-_:]?[a-z0-9]{6,}\b/i, "user-id-like value"],
    [/\baccount[-_:]?[a-z0-9]{6,}\b/i, "account-id-like value"],
    [/\bdcandidate\.[a-z0-9.-]+\b/i, "candidate-id-like value"],
    [/\bcandidate[-_:](?=[a-z0-9]*\d)[a-z0-9]{6,}\b/i, "candidate-id-like value"],
    [/\b[0-9a-f]{32,}\b/i, "hash-like value"],
  ];
  for (const [pattern, label] of privatePatterns) {
    if (pattern.test(value)) {
      fail(`${fieldPath} contains a ${label}.`);
    }
  }
}

function falseFields(fieldNames) {
  return Object.fromEntries(fieldNames.map((field) => [field, false]));
}

function zeroFields(fieldNames) {
  return Object.fromEntries(fieldNames.map((field) => [field, 0]));
}

function unresolvedRequirement(requirementId) {
  return {
    requirementId,
    state: "TO_BE_DECIDED",
    decisionReference: null,
    policyReference: null,
    activeRuleReferences: [],
    decisionRecorded: false,
  };
}

function triggerPlaceholder([triggerPlaceholderId, triggerScope]) {
  return {
    triggerPlaceholderId,
    triggerScope,
    recordState: "PLACEHOLDER_ONLY",
    triggerPolicyReference: null,
    authorityPolicyReference: null,
    evaluationAllowed: false,
    executionAllowed: false,
  };
}

function expectedBlocker(blockingReason) {
  return {
    blockingReason,
    blockerState: "OPEN_UNRESOLVED",
    closureRecorded: false,
    reopeningRecorded: false,
    closureEvidenceReferences: [],
    readinessRemovalAllowed: false,
  };
}

function findRollbackWithdrawalPrerequisite(activationPrerequisites) {
  const matches = activationPrerequisites.prerequisites.filter(
    (item) => item.prerequisiteId === "rollback_and_withdrawal_policy",
  );
  if (matches.length !== 1) {
    fail("Activation prerequisites must contain exactly one rollback_and_withdrawal_policy row.");
  }
  const expected = {
    prerequisiteId: "rollback_and_withdrawal_policy",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future trigger, containment, propagation, history-preservation, restoration and partial-failure test matrix.",
    evidenceRecordRefs: [],
  };
  requireExactValue(matches[0], expected, "activationPrerequisites.rollback_and_withdrawal_policy");
  return matches[0];
}

function validateUpstreamArtifacts(upstream) {
  if (!isPlainObject(upstream) || !isPlainObject(upstream.readinessUpstream)) {
    fail("Upstream artifacts must include the readiness integration plan chain.");
  }
  const readinessSummary = validateDiagnosticReadinessIntegrationPlan(
    upstream.readinessPlan,
    upstream.readinessUpstream,
  );
  requireExactValue(
    readinessSummary,
    {
      planArtifactVersion: expectedReadinessPlanArtifactVersion,
      planVersion: expectedReadinessPlanVersion,
      planState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      blockingReasonCount: 2,
      openBlockingReasonCount: 2,
      closedBlockingReasonCount: 0,
      decisionRequirementCount: 10,
      satisfiedPrerequisiteCount: 0,
      activeIntegrationRuleCount: 0,
      readinessTransitionRecordCount: 0,
      readyStateRecordCount: 0,
      approvedCandidateCount: 0,
      productionApprovalCount: 0,
      activationStatus: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      readiness: "NOT_READY",
    },
    "readinessIntegrationPlanSummary",
  );
  const coverageUpstream = upstream.readinessUpstream.coverageGapClosureUpstream;
  const productionUpstream = coverageUpstream.productionUpstream;
  const evidenceUpstream = productionUpstream.evidenceUpstream;
  const chain = evidenceUpstream.auditUpstream;
  return {
    activation: chain.activationPrerequisites,
    workflow: chain.workflow,
    readinessPlan: upstream.readinessPlan,
    readinessSummary,
    coveragePlan: upstream.readinessUpstream.coverageGapClosurePlan,
    productionPolicy: coverageUpstream.productionPolicy,
    evidencePolicy: productionUpstream.evidencePolicy,
    auditPolicy: evidenceUpstream.auditPolicy,
    prerequisite: findRollbackWithdrawalPrerequisite(chain.activationPrerequisites),
  };
}

function buildExpectedArtifact({
  activation,
  workflow,
  readinessPlan,
  readinessSummary,
  coveragePlan,
  productionPolicy,
  evidencePolicy,
  auditPolicy,
  prerequisite,
}) {
  const expected = {
    metadata: {
      schemaVersion: "learnika.diagnosticRollbackWithdrawalPolicyPlaceholder.v1",
      policyArtifactVersion: expectedArtifactVersion,
      status: "placeholder_only_unsatisfied_non_production",
      artifactKind: "diagnostic_rollback_withdrawal_policy_placeholder",
      subject: "math",
      locale: "ru-RU",
      audienceGrades: [7, 8, 9],
      activationPrerequisitesArtifactVersion: expectedActivationArtifactVersion,
      readinessIntegrationPlanArtifactVersion: expectedReadinessPlanArtifactVersion,
      coverageGapClosurePlanArtifactVersion: expectedCoveragePlanArtifactVersion,
      productionApprovalAuthorityPolicyArtifactVersion: expectedProductionAuthorityArtifactVersion,
      evidenceStorageRetentionPolicyArtifactVersion: expectedEvidencePolicyArtifactVersion,
      auditIdentityPolicyArtifactVersion: expectedAuditPolicyArtifactVersion,
      reviewWorkflowStateArtifactVersion: expectedWorkflowArtifactVersion,
      diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
      sourceContract: "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
      productionUseAllowed: false,
      runtimeUseAllowed: false,
      storageAllowed: false,
    },
    activationBoundary: {
      status: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      activationAllowed: false,
      reviewWorkflowActivationAllowed: false,
      readinessTransitionAllowed: false,
      policyActivationAllowed: false,
      rollbackExecutionAllowed: false,
      withdrawalExecutionAllowed: false,
      restorationExecutionAllowed: false,
      productionApprovalAllowed: false,
    },
    dependencyReferences: {
      activationPrerequisites: {
        artifactVersion: expectedActivationArtifactVersion,
        artifactStatus: activation.metadata.status,
        prerequisiteId: prerequisite.prerequisiteId,
        prerequisiteStatus: prerequisite.status,
        activationStatus: activation.activationBoundary.status,
        reviewWorkflowStatus: activation.activationBoundary.reviewWorkflowStatus,
        prerequisiteCount: activation.aggregate.prerequisiteCount,
        unsatisfiedPrerequisiteCount: activation.aggregate.unsatisfiedPrerequisiteCount,
        satisfiedPrerequisiteCount: activation.aggregate.satisfiedPrerequisiteCount,
        productionApprovalCount: activation.aggregate.productionApprovalCount,
      },
      readinessIntegrationPlan: {
        artifactVersion: readinessSummary.planArtifactVersion,
        planVersion: readinessSummary.planVersion,
        planState: readinessSummary.planState,
        prerequisiteStatus: readinessSummary.prerequisiteStatus,
        readinessStatus: readinessSummary.readiness,
        blockingReasonCount: readinessSummary.blockingReasonCount,
        openBlockingReasonCount: readinessSummary.openBlockingReasonCount,
        closedBlockingReasonCount: readinessSummary.closedBlockingReasonCount,
        satisfiedPrerequisiteCount: readinessSummary.satisfiedPrerequisiteCount,
        readinessTransitionRecordCount: readinessSummary.readinessTransitionRecordCount,
        readinessRollbackRecordCount: readinessPlan.aggregate.readinessRollbackRecordCount,
        approvedCandidateCount: readinessSummary.approvedCandidateCount,
        productionApprovalCount: readinessSummary.productionApprovalCount,
      },
      coverageGapClosurePlan: {
        artifactVersion: expectedCoveragePlanArtifactVersion,
        planVersion: expectedCoveragePlanVersion,
        planState: coveragePlan.planIdentity.planState,
        prerequisiteStatus: coveragePlan.prerequisiteReference.status,
        gapEntryCount: coveragePlan.aggregate.gapEntryCount,
        draftOnlyEntryCount: coveragePlan.aggregate.draftOnlyEntryCount,
        closedGapCount: coveragePlan.aggregate.closedGapCount,
        productionApprovedSlotCount: coveragePlan.aggregate.productionApprovedSlotCount,
        realCandidateCount: coveragePlan.aggregate.realCandidateCount,
        productionApprovalCount: coveragePlan.aggregate.productionApprovalCount,
      },
      productionApprovalAuthorityPolicy: {
        artifactVersion: expectedProductionAuthorityArtifactVersion,
        policyVersion: expectedProductionAuthorityPolicyVersion,
        policyState: productionPolicy.policyIdentity.policyState,
        prerequisiteStatus: productionPolicy.prerequisiteReference.status,
        activeApprovalRuleCount: productionPolicy.aggregate.activeApprovalRuleCount,
        approvedCandidateCount: productionPolicy.aggregate.approvedCandidateCount,
        productionApprovalCount: productionPolicy.aggregate.productionApprovalCount,
        authorityRevocationCount: productionPolicy.aggregate.authorityRevocationCount,
        approvalWithdrawalCount: productionPolicy.aggregate.approvalWithdrawalCount,
        reapprovalCount: productionPolicy.aggregate.reapprovalCount,
      },
      evidenceStorageRetentionPolicy: {
        artifactVersion: expectedEvidencePolicyArtifactVersion,
        policyVersion: expectedEvidencePolicyVersion,
        policyState: evidencePolicy.policyIdentity.policyState,
        prerequisiteStatus: evidencePolicy.prerequisiteReference.status,
        reviewEvidenceRecordCount: evidencePolicy.aggregate.reviewEvidenceRecordCount,
        evidenceFileCount: evidencePolicy.aggregate.evidenceFileCount,
        storageObjectCount: evidencePolicy.aggregate.storageObjectCount,
        withdrawalRecordCount: evidencePolicy.aggregate.withdrawalRecordCount,
        auditEventCount: evidencePolicy.aggregate.auditEventCount,
        productionApprovalCount: evidencePolicy.aggregate.productionApprovalCount,
      },
      auditIdentityPolicy: {
        artifactVersion: expectedAuditPolicyArtifactVersion,
        policyVersion: expectedAuditPolicyVersion,
        policyState: auditPolicy.policyIdentity.policyState,
        prerequisiteStatus: auditPolicy.prerequisiteReference.status,
        reviewerIdentityCount: auditPolicy.aggregate.reviewerIdentityCount,
        auditIdentityCount: auditPolicy.aggregate.auditIdentityCount,
        identityRevocationRecordCount: auditPolicy.aggregate.identityRevocationRecordCount,
        identityTombstoneRecordCount: auditPolicy.aggregate.identityTombstoneRecordCount,
        auditLogCount: auditPolicy.aggregate.auditLogCount,
        auditEventCount: auditPolicy.aggregate.auditEventCount,
        productionApprovalCount: auditPolicy.aggregate.productionApprovalCount,
      },
      reviewWorkflowState: {
        artifactVersion: expectedWorkflowArtifactVersion,
        workflowVersion: expectedWorkflowVersion,
        policyState: workflow.workflowPolicy.policyState,
        runtimeActivationAllowed: workflow.workflowPolicy.runtimeActivationAllowed,
        workflowEntryCount: workflow.aggregate.workflowEntryCount,
        submittedCandidateCount: workflow.aggregate.submittedCandidateCount,
        activeReviewCount: workflow.aggregate.activeReviewCount,
        reviewEvidenceRecordCount: workflow.aggregate.reviewEvidenceRecordCount,
        approvedDecisionCount: workflow.aggregate.approvedDecisionCount,
        productionApprovalCount: workflow.aggregate.productionApprovalCount,
      },
    },
    prerequisiteReference: { ...prerequisite, evidenceRecordRefs: [] },
    policyIdentity: {
      policyId: "diagnostic-rollback-and-withdrawal",
      policyVersion: expectedPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      activeRulesetVersion: null,
      policyApprovalAllowed: false,
      policyActivationAllowed: false,
      triggerTaxonomyApprovalAllowed: false,
      triggerEvaluationAllowed: false,
      candidateWithdrawalAllowed: false,
      productionApprovalWithdrawalAllowed: false,
      evidenceWithdrawalAllowed: false,
      digestInvalidationAllowed: false,
      readinessRollbackAllowed: false,
      auditTrailRecordingAllowed: false,
      notificationEscalationAllowed: false,
      restorationReapprovalAllowed: false,
      runtimeLifecycleProcessingAllowed: false,
    },
    currentBaseline: {
      readinessPolicyVersion: expectedReadinessPolicyVersion,
      readinessStatus: "NOT_READY",
      blockingReasons: expectedBlockingReasons,
      blockingReasonCount: 2,
      openBlockingReasonCount: 2,
      closedBlockingReasonCount: 0,
      activationStatus: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      prerequisiteCount: 12,
      unsatisfiedPrerequisiteCount: 12,
      satisfiedPrerequisiteCount: 0,
      productionApprovalCount: 0,
      approvedCandidateCount: 0,
      baselineTransitionRecorded: false,
    },
    currentBlockers: expectedBlockingReasons.map(expectedBlocker),
    withdrawalTriggerTaxonomyPlaceholders: expectedWithdrawalTriggers.map(triggerPlaceholder),
    rollbackTriggerTaxonomyPlaceholders: expectedRollbackTriggers.map(triggerPlaceholder),
    candidateWithdrawalPlaceholder: {
      requirementId: "candidate_withdrawal_and_containment",
      state: "TO_BE_DECIDED",
      triggerPolicyReference: null,
      withdrawalAuthorityPolicyReference: null,
      candidateVersionBindingPolicyReference: null,
      containmentPolicyReference: null,
      propagationPolicyReference: null,
      historyPreservationPolicyReference: null,
      replacementNonTransferPolicyReference: null,
      activeRuleReferences: [],
      currentWithdrawalCount: 0,
      candidateReferenceRecordingAllowed: false,
      withdrawalEvaluationAllowed: false,
      withdrawalRecordingAllowed: false,
      containmentExecutionAllowed: false,
      runtimeWithdrawalAllowed: false,
    },
    productionApprovalWithdrawalPlaceholder: {
      requirementId: "production_approval_withdrawal",
      state: "TO_BE_DECIDED",
      pinnedAuthorityPolicyVersion: expectedProductionAuthorityPolicyVersion,
      withdrawalAuthorityPolicyReference: null,
      suspensionPolicyReference: null,
      withdrawalPolicyReference: null,
      propagationPolicyReference: null,
      historyPreservationPolicyReference: null,
      reapprovalPolicyReference: null,
      activeRuleReferences: [],
      currentProductionApprovalCount: 0,
      currentApprovalWithdrawalCount: 0,
      suspensionEvaluationAllowed: false,
      withdrawalEvaluationAllowed: false,
      withdrawalRecordingAllowed: false,
      productionStateMutationAllowed: false,
      runtimeWithdrawalAllowed: false,
    },
    evidenceWithdrawalTombstonePlaceholder: {
      requirementId: "evidence_withdrawal_and_tombstone",
      state: "TO_BE_DECIDED",
      pinnedEvidencePolicyVersion: expectedEvidencePolicyVersion,
      withdrawalPolicyReference: null,
      retentionPolicyReference: null,
      deletionPolicyReference: null,
      legalHoldPolicyReference: null,
      orphanHandlingPolicyReference: null,
      tombstonePolicyReference: null,
      historyPreservationPolicyReference: null,
      activeRuleReferences: [],
      currentEvidenceRecordCount: 0,
      currentEvidenceWithdrawalCount: 0,
      currentTombstoneCount: 0,
      withdrawalRecordingAllowed: false,
      tombstoneRecordingAllowed: false,
      deletionExecutionAllowed: false,
      runtimeEvidenceLifecycleAllowed: false,
    },
    digestInvalidationPlaceholder: {
      requirementId: "digest_invalidation_and_dependency_propagation",
      state: "TO_BE_DECIDED",
      invalidationPolicyReference: null,
      candidateRevisionPolicyReference: null,
      canonicalizationChangePolicyReference: null,
      algorithmIncidentPolicyReference: null,
      staleLinkagePolicyReference: null,
      dependencyPropagationPolicyReference: null,
      activeRuleReferences: [],
      currentDigestValueCount: 0,
      currentDigestInvalidationCount: 0,
      digestGenerationAllowed: false,
      digestValueRecordingAllowed: false,
      invalidationEvaluationAllowed: false,
      invalidationRecordingAllowed: false,
      runtimeDigestProcessingAllowed: false,
    },
    readinessRollbackPlaceholder: {
      requirementId: "readiness_rollback_and_blocker_reopening",
      state: "TO_BE_DECIDED",
      pinnedReadinessPlanVersion: expectedReadinessPlanVersion,
      rollbackPolicyReference: null,
      transitionAuthorityPolicyReference: null,
      blockerReopeningPolicyReference: null,
      inputRemovalPolicyReference: null,
      containmentPolicyReference: null,
      recoveryPolicyReference: null,
      activeRuleReferences: [],
      currentReadinessRollbackCount: 0,
      currentBlockerReopeningCount: 0,
      rollbackEvaluationAllowed: false,
      rollbackExecutionAllowed: false,
      blockerReopeningRecordingAllowed: false,
      readinessStateMutationAllowed: false,
      runtimeReadinessIntegrationAllowed: false,
    },
    auditTrailRequirementPlaceholder: {
      requirementId: "audit_trail_and_history_preservation",
      state: "TO_BE_DECIDED",
      pinnedAuditIdentityPolicyVersion: expectedAuditPolicyVersion,
      eventSchemaReference: null,
      auditIdentityAttributionPolicyReference: null,
      authorizationSnapshotPolicyReference: null,
      integrityPolicyReference: null,
      retentionPolicyReference: null,
      accessPolicyReference: null,
      amendmentPolicyReference: null,
      activeRuleReferences: [],
      currentAuditLogCount: 0,
      currentAuditEventCount: 0,
      auditLogRecordingAllowed: false,
      auditEventRecordingAllowed: false,
      identityAttributionAllowed: false,
      historyMutationAllowed: false,
      runtimeAuditTrailAllowed: false,
    },
    notificationEscalationPlaceholder: {
      requirementId: "notification_and_escalation",
      state: "TO_BE_DECIDED",
      recipientEligibilityPolicyReference: null,
      dataMinimizationPolicyReference: null,
      severityPolicyReference: null,
      acknowledgementPolicyReference: null,
      retryPolicyReference: null,
      escalationAuthorityPolicyReference: null,
      partialFailurePolicyReference: null,
      activeRuleReferences: [],
      currentNotificationCount: 0,
      currentEscalationCount: 0,
      recipientRecordingAllowed: false,
      notificationRecordingAllowed: false,
      notificationDispatchAllowed: false,
      escalationRecordingAllowed: false,
      providerIntegrationAllowed: false,
      runtimeNotificationAllowed: false,
    },
    restorationReapprovalPlaceholder: {
      requirementId: "restoration_reapproval_and_forward_fix",
      state: "TO_BE_DECIDED",
      restorationEligibilityPolicyReference: null,
      forwardFixPolicyReference: null,
      newVersionPolicyReference: null,
      reReviewPolicyReference: null,
      evidenceReconciliationPolicyReference: null,
      independentReapprovalPolicyReference: null,
      partialFailureRecoveryPolicyReference: null,
      activeRuleReferences: [],
      currentRestorationCount: 0,
      currentReapprovalCount: 0,
      restorationEvaluationAllowed: false,
      restorationRecordingAllowed: false,
      reapprovalEvaluationAllowed: false,
      reapprovalRecordingAllowed: false,
      withdrawnStateReactivationAllowed: false,
      runtimeRestorationAllowed: false,
    },
    decisionRequirements: expectedDecisionRequirementIds.map(unresolvedRequirement),
    recordBoundary: falseFields(recordBoundaryFields),
    readiness: {
      policyVersion: expectedReadinessPolicyVersion,
      status: "NOT_READY",
      blockingReasons: expectedBlockingReasons,
    },
    aggregate: {
      withdrawalTriggerPlaceholderCount: 7,
      rollbackTriggerPlaceholderCount: 5,
      decisionRequirementCount: 11,
      undecidedRequirementCount: 11,
      blockingReasonCount: 2,
      openBlockingReasonCount: 2,
      ...zeroFields(zeroAggregateFields),
    },
  };
  for (const field of protectedRecordFields) {
    expected[field] = [];
  }
  return expected;
}

export function validateDiagnosticRollbackWithdrawalPolicy(artifact, upstream) {
  const validatedUpstream = validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  requireExactValue(artifact, buildExpectedArtifact(validatedUpstream), "$");
  return {
    policyArtifactVersion: artifact.metadata.policyArtifactVersion,
    policyVersion: artifact.policyIdentity.policyVersion,
    policyState: artifact.policyIdentity.policyState,
    prerequisiteStatus: artifact.prerequisiteReference.status,
    withdrawalTriggerPlaceholderCount: artifact.aggregate.withdrawalTriggerPlaceholderCount,
    rollbackTriggerPlaceholderCount: artifact.aggregate.rollbackTriggerPlaceholderCount,
    decisionRequirementCount: artifact.aggregate.decisionRequirementCount,
    openBlockingReasonCount: artifact.aggregate.openBlockingReasonCount,
    closedBlockingReasonCount: artifact.aggregate.closedBlockingReasonCount,
    satisfiedPrerequisiteCount: artifact.aggregate.satisfiedPrerequisiteCount,
    candidateWithdrawalCount: artifact.aggregate.candidateWithdrawalCount,
    rollbackRecordCount: artifact.aggregate.rollbackRecordCount,
    tombstoneRecordCount: artifact.aggregate.tombstoneRecordCount,
    restorationRecordCount: artifact.aggregate.restorationRecordCount,
    approvedCandidateCount: artifact.aggregate.approvedCandidateCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticRollbackWithdrawalPolicy(
  artifactPath = defaultRollbackWithdrawalPolicyPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticRollbackWithdrawalPolicyUpstreamArtifacts() {
  const [readinessPlan, readinessUpstream] = await Promise.all([
    readDiagnosticReadinessIntegrationPlan(),
    readDiagnosticReadinessIntegrationPlanUpstreamArtifacts(),
  ]);
  return { readinessPlan, readinessUpstream };
}

export function normalizeRollbackWithdrawalStatusPaths(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  return rawPath.split(" -> ").map((changedPath) => changedPath.replaceAll("\\", "/"));
}

export function validateRollbackWithdrawalChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice13ChangedPaths.has(changedPath) &&
      !wave5Slice14ScopeUnblockPaths.has(changedPath) &&
      !wave5ClosureScopeUnblockPaths.has(changedPath) &&
      !wave6Slice1ScopeUnblockPaths.has(changedPath) &&
      !wave6Slice2ScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 5 Slice 13 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateRollbackWithdrawalWorktreeScope({ cwd = repoRoot } = {}) {
  const result = spawnSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    fail(`Unable to inspect git status: ${result.stderr || result.stdout}`);
  }
  const changedPaths = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .flatMap(normalizeRollbackWithdrawalStatusPaths);
  return validateRollbackWithdrawalChangedPaths(changedPaths);
}

async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticRollbackWithdrawalPolicy(),
    readDiagnosticRollbackWithdrawalPolicyUpstreamArtifacts(),
  ]);
  const summary = validateDiagnosticRollbackWithdrawalPolicy(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    validateRollbackWithdrawalWorktreeScope();
  }
  console.log(
    `[curriculum] Rollback and withdrawal policy ${summary.policyArtifactVersion} validated: ${summary.withdrawalTriggerPlaceholderCount} withdrawal triggers, ${summary.rollbackTriggerPlaceholderCount} rollback triggers, ${summary.decisionRequirementCount} undecided requirements, ${summary.openBlockingReasonCount} open blockers, ${summary.closedBlockingReasonCount} closed blockers, ${summary.satisfiedPrerequisiteCount} satisfied prerequisites, ${summary.candidateWithdrawalCount} candidate withdrawals, ${summary.rollbackRecordCount} rollbacks, ${summary.tombstoneRecordCount} tombstones, ${summary.restorationRecordCount} restorations, ${summary.approvedCandidateCount} approved candidates, ${summary.productionApprovalCount} production approvals; policy ${summary.policyState}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, readiness ${summary.readiness}.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`[curriculum] ${error.message}`);
    process.exitCode = 1;
  });
}
