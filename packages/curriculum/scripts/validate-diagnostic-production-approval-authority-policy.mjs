import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  readDiagnosticEvidenceStorageRetentionPolicy,
  readDiagnosticEvidenceStorageRetentionPolicyUpstreamArtifacts,
  validateDiagnosticEvidenceStorageRetentionPolicy,
} from "./validate-diagnostic-evidence-storage-retention-policy.mjs";

const expectedArtifactVersion = "wave-5.slice-10.grade-7-9-math.v1";
const expectedPolicyVersion =
  "wave-5.slice-10.diagnostic-production-approval-authority.placeholder.v1";
const expectedActivationArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedIdentityArtifactVersion = "wave-5.slice-3.grade-7-9-math.v1";
const expectedIdentityPolicyVersion = "wave-5.slice-3.diagnostic-candidate-identity.placeholder.v1";
const expectedCanonicalizationDigestArtifactVersion = "wave-5.slice-4.grade-7-9-math.v1";
const expectedCanonicalizationDigestPolicyVersion =
  "wave-5.slice-4.diagnostic-candidate-canonicalization-and-digest.placeholder.v1";
const expectedRoleOwnershipArtifactVersion = "wave-5.slice-5.grade-7-9-math.v1";
const expectedRoleOwnershipPolicyVersion =
  "wave-5.slice-5.diagnostic-reviewer-role-ownership.placeholder.v1";
const expectedSeparationArtifactVersion = "wave-5.slice-6.grade-7-9-math.v1";
const expectedSeparationPolicyVersion =
  "wave-5.slice-6.diagnostic-separation-of-duties-enforcement.placeholder.v1";
const expectedConflictArtifactVersion = "wave-5.slice-7.grade-7-9-math.v1";
const expectedConflictPolicyVersion =
  "wave-5.slice-7.diagnostic-conflict-of-interest.placeholder.v1";
const expectedAuditArtifactVersion = "wave-5.slice-8.grade-7-9-math.v1";
const expectedAuditPolicyVersion = "wave-5.slice-8.diagnostic-audit-identity.placeholder.v1";
const expectedEvidenceArtifactVersion = "wave-5.slice-9.grade-7-9-math.v1";
const expectedEvidencePolicyVersion =
  "wave-5.slice-9.diagnostic-evidence-storage-and-retention.placeholder.v1";
const expectedAuthorityArtifactVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedAuthorityPolicyVersion = "wave-4.slice-8.diagnostic-review-authority.placeholder.v1";
const expectedWorkflowArtifactVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedWorkflowVersion = "wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1";
const expectedRubricArtifactVersion = "wave-4.slice-4.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";

const expectedSubstantiveGates = new Map([
  ["methodology", "wave-4.slice-1.methodology-review.v1"],
  ["safety_no_answer", "wave-4.slice-1.safety-no-answer-review.v1"],
  ["rights_copyright", "wave-4.slice-1.rights-copyright-review.v1"],
  ["grade_placement", "wave-4.slice-1.grade-placement-review.v1"],
  ["accessibility_readability", "wave-4.slice-1.accessibility-readability-review.v1"],
]);
const expectedDecisionRequirementIds = [
  "production_approver_role_and_eligibility",
  "approval_quorum_and_decision_aggregation",
  "required_substantive_gate_completion",
  "required_evidence_linkage_and_sufficiency",
  "required_candidate_canonicalization_and_digest_linkage",
  "required_audit_identity_linkage",
  "required_conflict_of_interest_clearance",
  "required_separation_of_duties_clearance",
  "production_authority_grant_and_lifecycle",
  "production_approval_decision_record_schema",
  "production_approval_revocation_withdrawal_and_reapproval",
  "production_approval_escalation_and_appeal",
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
];
const protectedRecordFields = [
  "policyDecisionRecords",
  "realCandidateRecords",
  "approvedCandidateRecords",
  "digestValueRecords",
  "canonicalizationOutputRecords",
  "reviewEvidenceRecords",
  "evidenceFileRecords",
  "storageObjectRecords",
  "gateDecisionRecords",
  "gateCompletionRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "productionApproverRecords",
  "authorityGrantRecords",
  "quorumEvaluationRecords",
  "auditIdentityLinkRecords",
  "conflictClearanceRecords",
  "separationClearanceRecords",
  "approvalDecisionRecords",
  "approvedDecisionRecords",
  "productionApprovalRecords",
  "authorityRevocationRecords",
  "approvalWithdrawalRecords",
  "reapprovalRecords",
  "escalationRecords",
  "appealRecords",
  "auditLogRecords",
  "auditEventRecords",
];
const recordBoundaryFields = [
  "policyDecisionsRecorded",
  "realCandidatesRecorded",
  "approvedCandidatesRecorded",
  "digestValuesRecorded",
  "canonicalizationOutputsRecorded",
  "reviewEvidenceRecorded",
  "evidenceFilesRecorded",
  "storageObjectsRecorded",
  "gateDecisionsRecorded",
  "gateCompletionsRecorded",
  "reviewerIdentitiesRecorded",
  "auditIdentitiesRecorded",
  "reviewerAssignmentsRecorded",
  "productionApproversRecorded",
  "authorityGrantsRecorded",
  "quorumEvaluationsRecorded",
  "auditIdentityLinksRecorded",
  "conflictClearancesRecorded",
  "separationClearancesRecorded",
  "approvalDecisionsRecorded",
  "approvedDecisionsRecorded",
  "productionApprovalsRecorded",
  "authorityRevocationsRecorded",
  "approvalWithdrawalsRecorded",
  "reapprovalsRecorded",
  "escalationsRecorded",
  "appealsRecorded",
  "auditLogsRecorded",
  "auditEventsRecorded",
  "runtimeProductionAuthorityEnabled",
  "runtimeApprovalWorkflowEnabled",
];
const zeroAggregateFields = [
  "activeApprovalRuleCount",
  "policyDecisionCount",
  "realCandidateCount",
  "approvedCandidateCount",
  "digestValueCount",
  "canonicalizationOutputCount",
  "reviewEvidenceRecordCount",
  "evidenceFileCount",
  "storageObjectCount",
  "gateDecisionCount",
  "gateCompletionCount",
  "reviewerIdentityCount",
  "auditIdentityCount",
  "reviewerAssignmentCount",
  "productionApproverCount",
  "authorityGrantCount",
  "quorumEvaluationCount",
  "auditIdentityLinkCount",
  "conflictClearanceCount",
  "separationClearanceCount",
  "approvalDecisionCount",
  "approvedDecisionCount",
  "productionApprovalCount",
  "authorityRevocationCount",
  "approvalWithdrawalCount",
  "reapprovalCount",
  "escalationCount",
  "appealCount",
  "auditLogCount",
  "auditEventCount",
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
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-coverage-gap-closure-plan.test.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy.test.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultProductionApprovalAuthorityPolicyPath = path.resolve(
  scriptDir,
  "../diagnostic-production-approval-authority-policy/grade-7-9-math.production-approval-authority-policy-placeholder.v1.json",
);

export class DiagnosticProductionApprovalAuthorityPolicyValidationError extends Error {}

function fail(message) {
  throw new DiagnosticProductionApprovalAuthorityPolicyValidationError(message);
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
    [/\bdcandidate\.[a-z0-9.-]+\b/i, "concrete candidate ID"],
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

function nullFields(fieldNames) {
  return Object.fromEntries(fieldNames.map((field) => [field, null]));
}

function emptyArrayFields(fieldNames) {
  return Object.fromEntries(fieldNames.map((field) => [field, []]));
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

function findProductionAuthorityPrerequisite(activationPrerequisites) {
  const matches = activationPrerequisites.prerequisites.filter(
    (item) => item.prerequisiteId === "production_approval_authority",
  );
  if (matches.length !== 1) {
    fail("Activation prerequisites must contain exactly one production_approval_authority row.");
  }
  const expected = {
    prerequisiteId: "production_approval_authority",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future independent approval eligibility, quorum, explicit decision, withdrawal and re-approval policy with authorization tests.",
    evidenceRecordRefs: [],
  };
  requireExactValue(matches[0], expected, "activationPrerequisites.production_approval_authority");
  return matches[0];
}

function validateUpstreamArtifacts(upstream) {
  if (!isPlainObject(upstream) || !isPlainObject(upstream.evidenceUpstream)) {
    fail("Upstream artifacts must include the evidence storage dependency chain.");
  }
  const evidenceSummary = validateDiagnosticEvidenceStorageRetentionPolicy(
    upstream.evidencePolicy,
    upstream.evidenceUpstream,
  );
  requireExactValue(
    evidenceSummary,
    {
      policyArtifactVersion: expectedEvidenceArtifactVersion,
      policyVersion: expectedEvidencePolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      evidenceTypePlaceholderCount: 6,
      storageClassPlaceholderCount: 3,
      decisionRequirementCount: 11,
      activeStorageRuleCount: 0,
      reviewEvidenceRecordCount: 0,
      evidenceFileCount: 0,
      storageObjectCount: 0,
      retentionScheduleCount: 0,
      deletionRequestCount: 0,
      legalHoldCount: 0,
      auditLogCount: 0,
      auditEventCount: 0,
      approvedDecisionCount: 0,
      productionApprovalCount: 0,
      activationStatus: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      readiness: "NOT_READY",
    },
    "evidenceSummary",
  );
  const chain = upstream.evidenceUpstream.auditUpstream;
  requireExactValue(
    chain.authority.productionApprovalAuthority,
    {
      status: "DEFERRED",
      policyVersion: null,
      rolePlaceholderId: "PRODUCTION_APPROVER_PLACEHOLDER",
      minimumApproverCountState: "TO_BE_DECIDED",
      minimumApproverCount: null,
      reviewDecisionAuthorityAllowed: false,
      productionApprovalAllowed: false,
    },
    "reviewAuthority.productionApprovalAuthority",
  );
  requireExactValue(
    {
      artifactVersion: chain.rubric.metadata.rubricArtifactVersion,
      status: chain.rubric.metadata.status,
      gateCount: chain.rubric.aggregate.gateCount,
      criterionCount: chain.rubric.aggregate.criterionCount,
      recordedDecisionCount: chain.rubric.aggregate.recordedDecisionCount,
      recordedEvidenceCount: chain.rubric.aggregate.recordedEvidenceCount,
      productionApprovalCount: chain.rubric.aggregate.productionApprovalCount,
    },
    {
      artifactVersion: expectedRubricArtifactVersion,
      status: "rubric_definition_non_decision",
      gateCount: 6,
      criterionCount: 23,
      recordedDecisionCount: 0,
      recordedEvidenceCount: 0,
      productionApprovalCount: 0,
    },
    "reviewGateRubricSummary",
  );
  return {
    chain,
    evidenceSummary,
    prerequisite: findProductionAuthorityPrerequisite(chain.activationPrerequisites),
  };
}

function deferredPlaceholder(requirementId, { pins = {}, nulls = [], arrays = [], falses = [] }) {
  return {
    requirementId,
    state: "TO_BE_DECIDED",
    ...pins,
    ...nullFields(nulls),
    ...emptyArrayFields(arrays),
    ...falseFields(falses),
  };
}

function expectedGatePlaceholders() {
  return [...expectedSubstantiveGates].map(([gateId, rubricPolicyVersion]) => ({
    gateId,
    rubricPolicyVersion,
    state: "PLACEHOLDER_ONLY_NOT_EVALUATED",
    gateDecisionReference: null,
    gateEvidenceReference: null,
    gateCompletionRecorded: false,
    gateEvaluationAllowed: false,
  }));
}

function buildExpectedArtifact(upstream, evidenceSummary, prerequisite) {
  const chain = upstream.evidenceUpstream.auditUpstream;
  const activation = chain.activationPrerequisites;
  const identity = chain.identityPolicy;
  const canonicalizationDigest = chain.canonicalizationDigestPolicy;
  const role = chain.roleOwnershipPolicy;
  const separation = chain.separationPolicy;
  const conflict = chain.conflictPolicy;
  const audit = upstream.evidenceUpstream.auditPolicy;
  const evidence = upstream.evidencePolicy;
  const authority = chain.authority;
  const workflow = chain.workflow;
  const rubric = chain.rubric;
  const expected = {
    metadata: {
      schemaVersion: "learnika.diagnosticProductionApprovalAuthorityPolicyPlaceholder.v1",
      policyArtifactVersion: expectedArtifactVersion,
      status: "placeholder_only_unsatisfied_non_production",
      artifactKind: "diagnostic_production_approval_authority_policy_placeholder",
      subject: "math",
      locale: "ru-RU",
      audienceGrades: [7, 8, 9],
      activationPrerequisitesArtifactVersion: expectedActivationArtifactVersion,
      candidateIdentityPolicyArtifactVersion: expectedIdentityArtifactVersion,
      canonicalizationDigestPolicyArtifactVersion: expectedCanonicalizationDigestArtifactVersion,
      reviewerRoleOwnershipPolicyArtifactVersion: expectedRoleOwnershipArtifactVersion,
      separationOfDutiesPolicyArtifactVersion: expectedSeparationArtifactVersion,
      conflictOfInterestPolicyArtifactVersion: expectedConflictArtifactVersion,
      auditIdentityPolicyArtifactVersion: expectedAuditArtifactVersion,
      evidenceStorageRetentionPolicyArtifactVersion: expectedEvidenceArtifactVersion,
      reviewAuthorityArtifactVersion: expectedAuthorityArtifactVersion,
      reviewWorkflowStateArtifactVersion: expectedWorkflowArtifactVersion,
      reviewGateRubricArtifactVersion: expectedRubricArtifactVersion,
      diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
      sourceContract: "docs/wave-5/diagnostic-production-approval-authority-policy-contract.md",
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
      productionAuthorityGrantAllowed: false,
      approvalDecisionRecordingAllowed: false,
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
        productionApprovalCount: activation.aggregate.productionApprovalCount,
      },
      candidateIdentityPolicy: {
        artifactVersion: expectedIdentityArtifactVersion,
        policyVersion: expectedIdentityPolicyVersion,
        policyState: identity.policyIdentity.policyState,
        prerequisiteStatus: identity.prerequisiteReference.status,
        realCandidateIdCount: identity.aggregate.realCandidateIdCount,
        approvedCandidateCount: identity.aggregate.approvedCandidateCount,
        productionApprovalCount: identity.aggregate.productionApprovalCount,
      },
      canonicalizationDigestPolicy: {
        artifactVersion: expectedCanonicalizationDigestArtifactVersion,
        policyVersion: expectedCanonicalizationDigestPolicyVersion,
        policyState: canonicalizationDigest.policyIdentity.policyState,
        prerequisiteStatus: canonicalizationDigest.prerequisiteReference.status,
        activeCanonicalizationRuleCount:
          canonicalizationDigest.aggregate.activeCanonicalizationRuleCount,
        selectedDigestAlgorithmCount: canonicalizationDigest.aggregate.selectedDigestAlgorithmCount,
        generatedHashCount: canonicalizationDigest.aggregate.generatedHashCount,
        digestValueCount: canonicalizationDigest.aggregate.digestValueCount,
        approvedCandidateCount: canonicalizationDigest.aggregate.approvedCandidateCount,
        productionApprovalCount: canonicalizationDigest.aggregate.productionApprovalCount,
      },
      reviewerRoleOwnershipPolicy: {
        artifactVersion: expectedRoleOwnershipArtifactVersion,
        policyVersion: expectedRoleOwnershipPolicyVersion,
        policyState: role.policyIdentity.policyState,
        prerequisiteStatus: role.prerequisiteReference.status,
        rolePlaceholderCount: role.aggregate.rolePlaceholderCount,
        roleOwnerCount: role.aggregate.roleOwnerCount,
        reviewerIdentityCount: role.aggregate.reviewerIdentityCount,
        auditIdentityCount: role.aggregate.auditIdentityCount,
        reviewerAssignmentCount: role.aggregate.reviewerAssignmentCount,
        activeRoleGrantCount: role.aggregate.activeRoleGrantCount,
        approvedDecisionCount: role.aggregate.approvedDecisionCount,
        productionApprovalCount: role.aggregate.productionApprovalCount,
      },
      separationOfDutiesPolicy: {
        artifactVersion: expectedSeparationArtifactVersion,
        policyVersion: expectedSeparationPolicyVersion,
        policyState: separation.policyIdentity.policyState,
        prerequisiteStatus: separation.prerequisiteReference.status,
        activeEnforcementRuleCount: separation.aggregate.activeEnforcementRuleCount,
        reviewerIdentityCount: separation.aggregate.reviewerIdentityCount,
        auditIdentityCount: separation.aggregate.auditIdentityCount,
        reviewerAssignmentCount: separation.aggregate.reviewerAssignmentCount,
        approvedDecisionCount: separation.aggregate.approvedDecisionCount,
        productionApprovalCount: separation.aggregate.productionApprovalCount,
      },
      conflictOfInterestPolicy: {
        artifactVersion: expectedConflictArtifactVersion,
        policyVersion: expectedConflictPolicyVersion,
        policyState: conflict.policyIdentity.policyState,
        prerequisiteStatus: conflict.prerequisiteReference.status,
        activeConflictRuleCount: conflict.aggregate.activeConflictRuleCount,
        reviewerIdentityCount: conflict.aggregate.reviewerIdentityCount,
        auditIdentityCount: conflict.aggregate.auditIdentityCount,
        reviewerAssignmentCount: conflict.aggregate.reviewerAssignmentCount,
        conflictRecordCount: conflict.aggregate.conflictRecordCount,
        approvedDecisionCount: conflict.aggregate.approvedDecisionCount,
        productionApprovalCount: conflict.aggregate.productionApprovalCount,
      },
      auditIdentityPolicy: {
        artifactVersion: expectedAuditArtifactVersion,
        policyVersion: expectedAuditPolicyVersion,
        policyState: audit.policyIdentity.policyState,
        prerequisiteStatus: audit.prerequisiteReference.status,
        reviewerIdentityCount: audit.aggregate.reviewerIdentityCount,
        auditIdentityCount: audit.aggregate.auditIdentityCount,
        auditLogCount: audit.aggregate.auditLogCount,
        auditEventCount: audit.aggregate.auditEventCount,
        approvedDecisionCount: audit.aggregate.approvedDecisionCount,
        productionApprovalCount: audit.aggregate.productionApprovalCount,
      },
      evidenceStorageRetentionPolicy: {
        artifactVersion: expectedEvidenceArtifactVersion,
        policyVersion: expectedEvidencePolicyVersion,
        policyState: evidenceSummary.policyState,
        prerequisiteStatus: evidenceSummary.prerequisiteStatus,
        reviewEvidenceRecordCount: evidence.aggregate.reviewEvidenceRecordCount,
        evidenceReferenceCount: evidence.aggregate.evidenceReferenceCount,
        evidenceFileCount: evidence.aggregate.evidenceFileCount,
        storageObjectCount: evidence.aggregate.storageObjectCount,
        auditLogCount: evidence.aggregate.auditLogCount,
        auditEventCount: evidence.aggregate.auditEventCount,
        approvedDecisionCount: evidence.aggregate.approvedDecisionCount,
        productionApprovalCount: evidence.aggregate.productionApprovalCount,
      },
      reviewAuthority: {
        artifactVersion: expectedAuthorityArtifactVersion,
        policyVersion: expectedAuthorityPolicyVersion,
        policyState: authority.authorityPolicy.policyState,
        productionAuthorityStatus: authority.productionApprovalAuthority.status,
        productionApproverRolePlaceholderId:
          authority.productionApprovalAuthority.rolePlaceholderId,
        minimumApproverCountState: authority.productionApprovalAuthority.minimumApproverCountState,
        minimumApproverCount: authority.productionApprovalAuthority.minimumApproverCount,
        reviewerIdentityCount: authority.aggregate.reviewerIdentityCount,
        auditIdentityCount: authority.aggregate.auditIdentityCount,
        reviewerAssignmentCount: authority.aggregate.reviewerAssignmentCount,
        approvedDecisionCount: authority.aggregate.approvedDecisionCount,
        productionApprovalCount: authority.aggregate.productionApprovalCount,
      },
      reviewWorkflowState: {
        artifactVersion: expectedWorkflowArtifactVersion,
        workflowVersion: expectedWorkflowVersion,
        policyState: workflow.workflowPolicy.policyState,
        runtimeActivationAllowed: workflow.workflowPolicy.runtimeActivationAllowed,
        submittedCandidateCount: workflow.aggregate.submittedCandidateCount,
        activeReviewCount: workflow.aggregate.activeReviewCount,
        approvedDecisionCount: workflow.aggregate.approvedDecisionCount,
        productionApprovalCount: workflow.aggregate.productionApprovalCount,
      },
      reviewGateRubric: {
        artifactVersion: expectedRubricArtifactVersion,
        artifactStatus: rubric.metadata.status,
        gateCount: rubric.aggregate.gateCount,
        substantiveGateCount: 5,
        criterionCount: rubric.aggregate.criterionCount,
        recordedDecisionCount: rubric.aggregate.recordedDecisionCount,
        recordedEvidenceCount: rubric.aggregate.recordedEvidenceCount,
        productionApprovalCount: rubric.aggregate.productionApprovalCount,
      },
    },
    prerequisiteReference: { ...prerequisite, evidenceRecordRefs: [] },
    policyIdentity: {
      policyId: "diagnostic-production-approval-authority",
      policyVersion: expectedPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      activeRulesetVersion: null,
      policyApprovalAllowed: false,
      productionApproverAppointmentAllowed: false,
      quorumEvaluationAllowed: false,
      gateCompletionEvaluationAllowed: false,
      evidenceSufficiencyEvaluationAllowed: false,
      candidatePinEvaluationAllowed: false,
      auditIdentityEvaluationAllowed: false,
      conflictClearanceEvaluationAllowed: false,
      separationClearanceEvaluationAllowed: false,
      authorityGrantAllowed: false,
      approvalDecisionRecordingAllowed: false,
      revocationWithdrawalAllowed: false,
      escalationAppealAllowed: false,
      productionApprovalAuthorizationAllowed: false,
    },
    productionApproverRolePlaceholder: {
      rolePlaceholderId: "PRODUCTION_APPROVER_PLACEHOLDER",
      scopeRef: "production_approval",
      recordState: "PLACEHOLDER_ONLY",
      pinnedRoleOwnershipPolicyVersion: expectedRoleOwnershipPolicyVersion,
      roleOwnerReference: null,
      eligibilityPolicyReference: null,
      identityPolicyReference: null,
      assignmentPolicyReference: null,
      authorityGrantReference: null,
      realApproverCreationAllowed: false,
      roleAssignmentAllowed: false,
      reviewDecisionAuthorityAllowed: false,
      productionApprovalAuthorityAllowed: false,
    },
    approvalQuorumPlaceholder: deferredPlaceholder("approval_quorum_and_decision_aggregation", {
      pins: { minimumApproverCountState: "TO_BE_DECIDED", minimumApproverCount: null },
      nulls: [
        "quorumPolicyReference",
        "duplicateIdentityPolicyReference",
        "independencePolicyReference",
        "decisionAggregationPolicyReference",
        "tieHandlingPolicyReference",
        "delegationPolicyReference",
      ],
      arrays: ["quorumRuleReferences"],
      falses: [
        "quorumEvaluationAllowed",
        "duplicateIdentityCountingAllowed",
        "decisionAggregationAllowed",
        "delegationAllowed",
        "approvalAuthorizationAllowed",
      ],
    }),
    requiredGateCompletionPlaceholder: {
      ...deferredPlaceholder("required_substantive_gate_completion", {
        pins: {
          pinnedReviewGateRubricArtifactVersion: expectedRubricArtifactVersion,
          requiredSubstantiveGateCount: 5,
        },
        nulls: [
          "gateCompletionPolicyReference",
          "gateFreshnessPolicyReference",
          "gateInvalidationPolicyReference",
        ],
        arrays: ["gateCompletionRuleReferences"],
      }),
      requiredGatePlaceholders: expectedGatePlaceholders(),
      gateCompletionEvaluationAllowed: false,
      gateFreshnessEvaluationAllowed: false,
      missingGateSubstitutionAllowed: false,
      productionGateSelfSatisfactionAllowed: false,
      approvalAuthorizationAllowed: false,
    },
    requiredEvidenceLinkagePlaceholder: deferredPlaceholder(
      "required_evidence_linkage_and_sufficiency",
      {
        pins: { pinnedEvidencePolicyVersion: expectedEvidencePolicyVersion },
        nulls: [
          "evidenceReferenceFormatPolicyReference",
          "evidenceSufficiencyPolicyReference",
          "evidenceFreshnessPolicyReference",
          "evidenceIntegrityPolicyReference",
          "evidenceAccessPolicyReference",
          "evidenceRetentionPolicyReference",
          "evidenceInvalidationPolicyReference",
        ],
        arrays: ["evidenceLinkageRuleReferences"],
        falses: [
          "evidenceReferenceRecordingAllowed",
          "evidenceSufficiencyEvaluationAllowed",
          "evidenceFreshnessEvaluationAllowed",
          "evidenceLinkageAllowed",
          "approvalAuthorizationAllowed",
        ],
      },
    ),
    requiredCanonicalizationDigestLinkagePlaceholder: deferredPlaceholder(
      "required_candidate_canonicalization_and_digest_linkage",
      {
        pins: {
          pinnedCandidateIdentityPolicyVersion: expectedIdentityPolicyVersion,
          pinnedCanonicalizationDigestPolicyVersion: expectedCanonicalizationDigestPolicyVersion,
        },
        nulls: [
          "candidateReferencePolicyReference",
          "candidateVersionPolicyReference",
          "canonicalizationPolicyReference",
          "digestPolicyReference",
          "stalePinPolicyReference",
          "invalidationPolicyReference",
        ],
        arrays: ["linkageRuleReferences"],
        falses: [
          "candidateReferenceRecordingAllowed",
          "canonicalizationExecutionAllowed",
          "digestGenerationAllowed",
          "digestValueRecordingAllowed",
          "candidatePinEvaluationAllowed",
          "approvalAuthorizationAllowed",
        ],
      },
    ),
    requiredAuditIdentityLinkagePlaceholder: deferredPlaceholder(
      "required_audit_identity_linkage",
      {
        pins: { pinnedAuditIdentityPolicyVersion: expectedAuditPolicyVersion },
        nulls: [
          "auditIdentityReferenceFormatPolicyReference",
          "identityBindingPolicyReference",
          "authorizationSnapshotPolicyReference",
          "identityLifecyclePolicyReference",
          "controlledLookupPolicyReference",
        ],
        arrays: ["auditIdentityLinkageRuleReferences"],
        falses: [
          "auditIdentityReferenceRecordingAllowed",
          "identityBindingEvaluationAllowed",
          "authorizationSnapshotRecordingAllowed",
          "controlledLookupAllowed",
          "approvalAuthorizationAllowed",
        ],
      },
    ),
    requiredConflictClearancePlaceholder: deferredPlaceholder(
      "required_conflict_of_interest_clearance",
      {
        pins: { pinnedConflictPolicyVersion: expectedConflictPolicyVersion },
        nulls: [
          "clearancePolicyReference",
          "evaluationFreshnessPolicyReference",
          "lateDisclosurePolicyReference",
          "recusalPolicyReference",
          "waiverPolicyReference",
        ],
        arrays: ["clearanceRuleReferences"],
        falses: [
          "clearanceRecordingAllowed",
          "conflictEvaluationAllowed",
          "lateDisclosureEvaluationAllowed",
          "waiverAllowed",
          "approvalAuthorizationAllowed",
        ],
      },
    ),
    requiredSeparationClearancePlaceholder: deferredPlaceholder(
      "required_separation_of_duties_clearance",
      {
        pins: { pinnedSeparationPolicyVersion: expectedSeparationPolicyVersion },
        nulls: [
          "clearancePolicyReference",
          "candidateAuthorComparisonPolicyReference",
          "substantiveReviewerComparisonPolicyReference",
          "auditObserverComparisonPolicyReference",
          "quorumDeduplicationPolicyReference",
        ],
        arrays: ["clearanceRuleReferences"],
        falses: [
          "clearanceRecordingAllowed",
          "identityComparisonAllowed",
          "separationEvaluationAllowed",
          "missingGateSubstitutionAllowed",
          "approvalAuthorizationAllowed",
        ],
      },
    ),
    authorityGrantPlaceholder: deferredPlaceholder("production_authority_grant_and_lifecycle", {
      pins: {
        grantingAuthorityPlaceholderId: "UNASSIGNED_PRODUCTION_AUTHORITY_GRANTOR_PLACEHOLDER",
      },
      nulls: [
        "grantSchemaReference",
        "grantingAuthorityPolicyReference",
        "eligibilityPolicyReference",
        "scopePolicyReference",
        "startPolicyReference",
        "expiryPolicyReference",
        "suspensionPolicyReference",
        "revocationPolicyReference",
        "delegationPolicyReference",
        "authorizationSnapshotPolicyReference",
      ],
      arrays: ["authorityGrantRuleReferences"],
      falses: [
        "authorityGrantIssuanceAllowed",
        "authorityGrantRecordingAllowed",
        "authorityGrantActivationAllowed",
        "delegationAllowed",
        "runtimeAuthorizationAllowed",
        "productionApprovalAuthorityAllowed",
      ],
    }),
    approvalDecisionSchemaPlaceholder: deferredPlaceholder(
      "production_approval_decision_record_schema",
      {
        nulls: [
          "schemaVersionReference",
          "candidateReferenceFieldPolicyReference",
          "candidateVersionFieldPolicyReference",
          "canonicalizationPolicyFieldReference",
          "digestPolicyFieldReference",
          "gateCompletionFieldPolicyReference",
          "evidenceLinkageFieldPolicyReference",
          "approverAuditIdentityFieldPolicyReference",
          "authorityGrantFieldPolicyReference",
          "conflictClearanceFieldPolicyReference",
          "separationClearanceFieldPolicyReference",
          "decisionOutcomePolicyReference",
          "decisionTimestampPolicyReference",
          "decisionExpiryPolicyReference",
          "decisionInvalidationPolicyReference",
        ],
        arrays: ["decisionSchemaRuleReferences"],
        falses: [
          "decisionRecordCreationAllowed",
          "approvalOutcomeRecordingAllowed",
          "approvedCandidateRecordingAllowed",
          "productionApprovalRecordingAllowed",
          "productionUseAllowed",
        ],
      },
    ),
    revocationWithdrawalPlaceholder: deferredPlaceholder(
      "production_approval_revocation_withdrawal_and_reapproval",
      {
        nulls: [
          "authorityRevocationPolicyReference",
          "approvalSuspensionPolicyReference",
          "approvalWithdrawalPolicyReference",
          "containmentPolicyReference",
          "propagationPolicyReference",
          "historyPreservationPolicyReference",
          "restorationPolicyReference",
          "reapprovalPolicyReference",
          "recoveryPolicyReference",
        ],
        arrays: ["revocationWithdrawalRuleReferences"],
        falses: [
          "authorityRevocationRecordingAllowed",
          "approvalSuspensionAllowed",
          "approvalWithdrawalRecordingAllowed",
          "withdrawalExecutionAllowed",
          "restorationAllowed",
          "reapprovalAllowed",
          "runtimeRevocationWithdrawalAllowed",
        ],
      },
    ),
    escalationAppealPlaceholder: deferredPlaceholder("production_approval_escalation_and_appeal", {
      pins: {
        authorityPlaceholderId: "UNASSIGNED_PRODUCTION_APPROVAL_ESCALATION_AUTHORITY_PLACEHOLDER",
      },
      nulls: [
        "escalationPolicyReference",
        "appealPolicyReference",
        "eligibilityPolicyReference",
        "independencePolicyReference",
        "containmentPolicyReference",
        "finalityPolicyReference",
      ],
      arrays: ["escalationAppealRuleReferences"],
      falses: [
        "escalationRecordingAllowed",
        "appealRecordingAllowed",
        "decisionOverrideAllowed",
        "missingGateBypassAllowed",
        "conflictClearanceBypassAllowed",
        "separationClearanceBypassAllowed",
        "quorumBypassAllowed",
        "productionApprovalAuthorizationAllowed",
      ],
    }),
    decisionRequirements: expectedDecisionRequirementIds.map(unresolvedRequirement),
    recordBoundary: falseFields(recordBoundaryFields),
    readiness: {
      policyVersion: expectedReadinessPolicyVersion,
      status: "NOT_READY",
      blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
    },
    aggregate: {
      productionApproverRolePlaceholderCount: 1,
      requiredSubstantiveGatePlaceholderCount: 5,
      decisionRequirementCount: 12,
      undecidedRequirementCount: 12,
      ...zeroFields(zeroAggregateFields),
    },
  };
  for (const field of protectedRecordFields) {
    expected[field] = [];
  }
  return expected;
}

export function validateDiagnosticProductionApprovalAuthorityPolicy(artifact, upstream) {
  const { chain, evidenceSummary, prerequisite } = validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  requireExactValue(artifact, buildExpectedArtifact(upstream, evidenceSummary, prerequisite), "$");
  return {
    policyArtifactVersion: artifact.metadata.policyArtifactVersion,
    policyVersion: artifact.policyIdentity.policyVersion,
    policyState: artifact.policyIdentity.policyState,
    prerequisiteStatus: artifact.prerequisiteReference.status,
    productionApproverRolePlaceholderCount:
      artifact.aggregate.productionApproverRolePlaceholderCount,
    requiredSubstantiveGatePlaceholderCount:
      artifact.aggregate.requiredSubstantiveGatePlaceholderCount,
    decisionRequirementCount: artifact.aggregate.decisionRequirementCount,
    activeApprovalRuleCount: artifact.aggregate.activeApprovalRuleCount,
    productionApproverCount: artifact.aggregate.productionApproverCount,
    authorityGrantCount: artifact.aggregate.authorityGrantCount,
    approvalDecisionCount: artifact.aggregate.approvalDecisionCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    approvedCandidateCount: artifact.aggregate.approvedCandidateCount,
    reviewerIdentityCount: artifact.aggregate.reviewerIdentityCount,
    auditIdentityCount: artifact.aggregate.auditIdentityCount,
    reviewEvidenceRecordCount: artifact.aggregate.reviewEvidenceRecordCount,
    digestValueCount: artifact.aggregate.digestValueCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    readiness: artifact.readiness.status,
    upstreamProductionApprovalCount: chain.authority.aggregate.productionApprovalCount,
  };
}

export async function readDiagnosticProductionApprovalAuthorityPolicy(
  artifactPath = defaultProductionApprovalAuthorityPolicyPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticProductionApprovalAuthorityPolicyUpstreamArtifacts() {
  const [evidencePolicy, evidenceUpstream] = await Promise.all([
    readDiagnosticEvidenceStorageRetentionPolicy(),
    readDiagnosticEvidenceStorageRetentionPolicyUpstreamArtifacts(),
  ]);
  return { evidencePolicy, evidenceUpstream };
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateProductionApprovalAuthorityPolicyChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (!approvedSlice13ChangedPaths.has(changedPath)) {
      fail(`Wave 5 Slice 13 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateProductionApprovalAuthorityPolicyWorktreeScope({ cwd = repoRoot } = {}) {
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
    .map(normalizeStatusPath);
  return validateProductionApprovalAuthorityPolicyChangedPaths(changedPaths);
}

async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticProductionApprovalAuthorityPolicy(),
    readDiagnosticProductionApprovalAuthorityPolicyUpstreamArtifacts(),
  ]);
  const summary = validateDiagnosticProductionApprovalAuthorityPolicy(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    validateProductionApprovalAuthorityPolicyWorktreeScope();
  }
  console.log(
    `[curriculum] Production approval authority policy ${summary.policyArtifactVersion} validated: ${summary.productionApproverRolePlaceholderCount} production approver role placeholder, ${summary.requiredSubstantiveGatePlaceholderCount} required substantive gate placeholders, ${summary.decisionRequirementCount} undecided requirements, ${summary.activeApprovalRuleCount} active approval rules, ${summary.productionApproverCount} production approvers, ${summary.authorityGrantCount} authority grants, ${summary.approvalDecisionCount} approval decisions, ${summary.productionApprovalCount} production approvals, ${summary.approvedCandidateCount} approved candidates, ${summary.reviewerIdentityCount} reviewer identities, ${summary.auditIdentityCount} audit identities, ${summary.reviewEvidenceRecordCount} evidence records, ${summary.digestValueCount} digest values; policy ${summary.policyState}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, readiness ${summary.readiness}.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`[curriculum] ${error.message}`);
    process.exitCode = 1;
  });
}
