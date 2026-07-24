import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  readDiagnosticAuditIdentityPolicy,
  readDiagnosticAuditIdentityPolicyUpstreamArtifacts,
  validateDiagnosticAuditIdentityPolicy,
} from "./validate-diagnostic-audit-identity-policy.mjs";

const expectedArtifactVersion = "wave-5.slice-9.grade-7-9-math.v1";
const expectedPolicyVersion =
  "wave-5.slice-9.diagnostic-evidence-storage-and-retention.placeholder.v1";
const expectedActivationArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedEvidenceArtifactVersion = "wave-4.slice-3.grade-7-9-math.v1";
const expectedAuditArtifactVersion = "wave-5.slice-8.grade-7-9-math.v1";
const expectedAuditPolicyVersion = "wave-5.slice-8.diagnostic-audit-identity.placeholder.v1";
const expectedConflictArtifactVersion = "wave-5.slice-7.grade-7-9-math.v1";
const expectedConflictPolicyVersion =
  "wave-5.slice-7.diagnostic-conflict-of-interest.placeholder.v1";
const expectedSeparationArtifactVersion = "wave-5.slice-6.grade-7-9-math.v1";
const expectedSeparationPolicyVersion =
  "wave-5.slice-6.diagnostic-separation-of-duties-enforcement.placeholder.v1";
const expectedRoleOwnershipArtifactVersion = "wave-5.slice-5.grade-7-9-math.v1";
const expectedRoleOwnershipPolicyVersion =
  "wave-5.slice-5.diagnostic-reviewer-role-ownership.placeholder.v1";
const expectedAuthorityArtifactVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedAuthorityPolicyVersion = "wave-4.slice-8.diagnostic-review-authority.placeholder.v1";
const expectedWorkflowArtifactVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedWorkflowVersion = "wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";

const expectedEvidenceTypes = new Map([
  ["METHODOLOGY_EVIDENCE_PLACEHOLDER", "methodology"],
  ["SAFETY_NO_ANSWER_EVIDENCE_PLACEHOLDER", "safety_no_answer"],
  ["RIGHTS_COPYRIGHT_EVIDENCE_PLACEHOLDER", "rights_copyright"],
  ["GRADE_PLACEMENT_EVIDENCE_PLACEHOLDER", "grade_placement"],
  ["ACCESSIBILITY_READABILITY_EVIDENCE_PLACEHOLDER", "accessibility_readability"],
  ["PRODUCTION_APPROVAL_SUPPORTING_EVIDENCE_PLACEHOLDER", "production_approval"],
]);
const expectedStorageClasses = new Map([
  ["REVIEW_EVIDENCE_STORAGE_CLASS_PLACEHOLDER", "review_evidence"],
  ["RIGHTS_SENSITIVE_EVIDENCE_STORAGE_CLASS_PLACEHOLDER", "rights_sensitive_evidence"],
  ["IDENTITY_LINKAGE_STORAGE_CLASS_PLACEHOLDER", "identity_linkage"],
]);
const expectedDecisionRequirementIds = [
  "evidence_type_taxonomy",
  "evidence_reference_format",
  "evidence_storage_location_and_classification",
  "evidence_retention_period",
  "evidence_deletion_withdrawal_and_tombstone",
  "evidence_legal_hold",
  "evidence_access_control_and_least_privilege",
  "evidence_redaction_privacy_and_data_minimization",
  "evidence_integrity_and_checksum",
  "evidence_audit_trail",
  "evidence_export_and_review",
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
  "digestValueRecords",
  "reviewEvidenceRecords",
  "evidenceReferenceRecords",
  "evidenceFileRecords",
  "storageObjectRecords",
  "storageClassAssignmentRecords",
  "retentionScheduleRecords",
  "retentionExecutionRecords",
  "deletionRequestRecords",
  "deletionExecutionRecords",
  "withdrawalRecords",
  "legalHoldRecords",
  "accessGrantRecords",
  "accessLogRecords",
  "redactionRecords",
  "integrityChecksumRecords",
  "integrityVerificationRecords",
  "auditLogRecords",
  "auditEventRecords",
  "evidenceExportRecords",
  "evidenceReviewRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "conflictRecords",
  "disclosureRecords",
  "recusalRecords",
  "waiverRecords",
  "exceptionRecords",
  "reviewDecisionRecords",
  "approvedDecisionRecords",
  "productionApprovalRecords",
];
const recordBoundaryFields = [
  "policyDecisionsRecorded",
  "realCandidatesRecorded",
  "digestValuesRecorded",
  "reviewEvidenceRecorded",
  "evidenceReferencesRecorded",
  "evidenceFilesRecorded",
  "storageObjectsRecorded",
  "storageClassAssignmentsRecorded",
  "retentionSchedulesRecorded",
  "retentionExecutionsRecorded",
  "deletionRequestsRecorded",
  "deletionExecutionsRecorded",
  "withdrawalsRecorded",
  "legalHoldsRecorded",
  "accessGrantsRecorded",
  "accessLogsRecorded",
  "redactionsRecorded",
  "integrityChecksumsRecorded",
  "integrityVerificationsRecorded",
  "auditLogsRecorded",
  "auditEventsRecorded",
  "evidenceExportsRecorded",
  "evidenceReviewsRecorded",
  "reviewerIdentitiesRecorded",
  "auditIdentitiesRecorded",
  "reviewerAssignmentsRecorded",
  "conflictsRecorded",
  "disclosuresRecorded",
  "recusalsRecorded",
  "waiversRecorded",
  "exceptionsRecorded",
  "reviewDecisionsRecorded",
  "approvedDecisionsRecorded",
  "productionApprovalsRecorded",
  "runtimeEvidenceStorageEnabled",
  "runtimeRetentionDeletionEnabled",
  "runtimeAuditLoggingEnabled",
];
const zeroAggregateFields = [
  "activeStorageRuleCount",
  "policyDecisionCount",
  "realCandidateCount",
  "digestValueCount",
  "reviewEvidenceRecordCount",
  "evidenceReferenceCount",
  "evidenceFileCount",
  "storageObjectCount",
  "storageClassAssignmentCount",
  "retentionScheduleCount",
  "retentionExecutionCount",
  "deletionRequestCount",
  "deletionExecutionCount",
  "withdrawalRecordCount",
  "legalHoldCount",
  "accessGrantCount",
  "accessLogCount",
  "redactionRecordCount",
  "integrityChecksumCount",
  "integrityVerificationCount",
  "auditLogCount",
  "auditEventCount",
  "evidenceExportCount",
  "evidenceReviewCount",
  "reviewerIdentityCount",
  "auditIdentityCount",
  "reviewerAssignmentCount",
  "conflictRecordCount",
  "disclosureRecordCount",
  "recusalRecordCount",
  "waiverRecordCount",
  "exceptionRecordCount",
  "reviewDecisionCount",
  "approvedDecisionCount",
  "productionApprovalCount",
];
const approvedSlice13ChangedPaths = new Set([
  "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
  "docs/wave-5/slice-13-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy/grade-7-9-math.rollback-withdrawal-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
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
  "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
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
  "docs/wave-6/diagnostic-conflict-of-interest-policy-decision-proposal.md",
  "docs/wave-6/slice-5-implementation-note.md",
  "packages/curriculum/diagnostic-conflict-of-interest-policy-decision-proposal/grade-7-9-math.conflict-of-interest-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
  "docs/wave-6/slice-7-implementation-note.md",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-production-approval-authority-policy-decision-proposal.md",
  "docs/wave-6/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-production-approval-authority-policy-decision-proposal/grade-7-9-math.production-approval-authority-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy-decision-proposal.test.mjs",
  "apps/api/test/mock-ocr-candidate-api.e2e.mjs",
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
export const defaultEvidenceStorageRetentionPolicyPath = path.resolve(
  scriptDir,
  "../diagnostic-evidence-storage-retention-policy/grade-7-9-math.evidence-storage-retention-policy-placeholder.v1.json",
);

export class DiagnosticEvidenceStorageRetentionPolicyValidationError extends Error {}

function fail(message) {
  throw new DiagnosticEvidenceStorageRetentionPolicyValidationError(message);
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

function expectedEvidenceTypeTaxonomy() {
  return [...expectedEvidenceTypes].map(([evidenceTypePlaceholderId, gateScope]) => ({
    evidenceTypePlaceholderId,
    gateScope,
    recordState: "PLACEHOLDER_ONLY",
    evidenceSchemaReference: null,
    contentDefinitionReference: null,
    referenceFormat: null,
    storageClassificationReference: null,
    retentionPolicyReference: null,
    evidenceCollectionAllowed: false,
    evidenceFileAllowed: false,
    storageObjectAllowed: false,
    evidenceEvaluationAllowed: false,
    reviewDecisionAuthorityAllowed: false,
    productionApprovalAuthorityAllowed: false,
  }));
}

function expectedStorageClassificationTaxonomy() {
  return [...expectedStorageClasses].map(([storageClassPlaceholderId, classificationScope]) => ({
    storageClassPlaceholderId,
    classificationScope,
    state: "PLACEHOLDER_ONLY",
    locationReference: null,
    backendReference: null,
    encryptionPolicyReference: null,
    keyFormatReference: null,
    accessPolicyReference: null,
    retentionPolicyReference: null,
    storageRuleReferences: [],
    storageAllowed: false,
    objectCreationAllowed: false,
    evidenceFileStorageAllowed: false,
    locatorAllocationAllowed: false,
    externalServiceUseAllowed: false,
  }));
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

function falseFields(fieldNames) {
  return Object.fromEntries(fieldNames.map((field) => [field, false]));
}

function zeroFields(fieldNames) {
  return Object.fromEntries(fieldNames.map((field) => [field, 0]));
}

function findEvidenceStoragePrerequisite(activationPrerequisites) {
  const matches = activationPrerequisites.prerequisites.filter(
    (item) => item.prerequisiteId === "evidence_storage_and_retention_policy",
  );
  if (matches.length !== 1) {
    fail(
      "Activation prerequisites must contain exactly one evidence_storage_and_retention_policy row.",
    );
  }
  const expected = {
    prerequisiteId: "evidence_storage_and_retention_policy",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future evidence schema, integrity pins, access controls, retention and deletion matrix, recovery and orphan-reference tests.",
    evidenceRecordRefs: [],
  };
  requireExactValue(
    matches[0],
    expected,
    "activationPrerequisites.evidence_storage_and_retention_policy",
  );
  return matches[0];
}

function validateUpstreamArtifacts(upstream) {
  if (!isPlainObject(upstream) || !isPlainObject(upstream.auditUpstream)) {
    fail("Upstream artifacts must include the audit identity dependency chain.");
  }
  const auditSummary = validateDiagnosticAuditIdentityPolicy(
    upstream.auditPolicy,
    upstream.auditUpstream,
  );
  requireExactValue(
    auditSummary,
    {
      policyArtifactVersion: expectedAuditArtifactVersion,
      policyVersion: expectedAuditPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      rolePlaceholderCount: 7,
      auditActorPlaceholderCount: 3,
      decisionRequirementCount: 10,
      activeIdentityRuleCount: 0,
      realPrincipalCount: 0,
      accountRecordCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      identityBindingCount: 0,
      auditLogCount: 0,
      auditEventCount: 0,
      approvedDecisionCount: 0,
      productionApprovalCount: 0,
      activationStatus: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      readiness: "NOT_READY",
    },
    "auditSummary",
  );
  const evidence = upstream.auditUpstream.evidence;
  requireExactValue(
    {
      artifactVersion: evidence.metadata.evidenceArtifactVersion,
      artifactStatus: evidence.metadata.status,
      productionUseAllowed: evidence.metadata.productionUseAllowed,
      runtimeUseAllowed: evidence.metadata.runtimeUseAllowed,
      storageAllowed: evidence.metadata.storageAllowed,
      blueprintSlotCount: evidence.aggregate.blueprintSlotCount,
      gatePlaceholderCount: evidence.aggregate.gatePlaceholderCount,
      evidenceRecordCount: evidence.aggregate.evidenceRecordCount,
      approvedDecisionCount: evidence.aggregate.approvedDecisionCount,
      productionApprovalCount: evidence.aggregate.productionApprovalCount,
    },
    {
      artifactVersion: expectedEvidenceArtifactVersion,
      artifactStatus: "placeholder_only_non_production",
      productionUseAllowed: false,
      runtimeUseAllowed: false,
      storageAllowed: false,
      blueprintSlotCount: 11,
      gatePlaceholderCount: 66,
      evidenceRecordCount: 0,
      approvedDecisionCount: 0,
      productionApprovalCount: 0,
    },
    "reviewEvidenceSummary",
  );
  return {
    auditSummary,
    prerequisite: findEvidenceStoragePrerequisite(upstream.auditUpstream.activationPrerequisites),
  };
}

function buildExpectedArtifact(upstream, auditSummary, prerequisite) {
  const chain = upstream.auditUpstream;
  const evidence = chain.evidence;
  const conflict = chain.conflictPolicy;
  const separation = chain.separationPolicy;
  const role = chain.roleOwnershipPolicy;
  const authority = chain.authority;
  const workflow = chain.workflow;
  const expected = {
    metadata: {
      schemaVersion: "learnika.diagnosticEvidenceStorageRetentionPolicyPlaceholder.v1",
      policyArtifactVersion: expectedArtifactVersion,
      status: "placeholder_only_unsatisfied_non_production",
      artifactKind: "diagnostic_evidence_storage_retention_policy_placeholder",
      subject: "math",
      locale: "ru-RU",
      audienceGrades: [7, 8, 9],
      activationPrerequisitesArtifactVersion: expectedActivationArtifactVersion,
      reviewEvidenceArtifactVersion: expectedEvidenceArtifactVersion,
      auditIdentityPolicyArtifactVersion: expectedAuditArtifactVersion,
      conflictOfInterestPolicyArtifactVersion: expectedConflictArtifactVersion,
      separationOfDutiesPolicyArtifactVersion: expectedSeparationArtifactVersion,
      reviewerRoleOwnershipPolicyArtifactVersion: expectedRoleOwnershipArtifactVersion,
      reviewAuthorityArtifactVersion: expectedAuthorityArtifactVersion,
      reviewWorkflowStateArtifactVersion: expectedWorkflowArtifactVersion,
      diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
      sourceContract: "docs/wave-5/diagnostic-evidence-storage-retention-policy-contract.md",
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
      evidenceCollectionAllowed: false,
      evidenceStorageAllowed: false,
      reviewDecisionAuthorizationAllowed: false,
      productionApprovalAllowed: false,
    },
    dependencyReferences: {
      activationPrerequisites: {
        artifactVersion: expectedActivationArtifactVersion,
        artifactStatus: chain.activationPrerequisites.metadata.status,
        prerequisiteId: prerequisite.prerequisiteId,
        prerequisiteStatus: prerequisite.status,
        activationStatus: chain.activationPrerequisites.activationBoundary.status,
        reviewWorkflowStatus: chain.activationPrerequisites.activationBoundary.reviewWorkflowStatus,
        prerequisiteCount: chain.activationPrerequisites.aggregate.prerequisiteCount,
        unsatisfiedPrerequisiteCount:
          chain.activationPrerequisites.aggregate.unsatisfiedPrerequisiteCount,
        productionApprovalCount: chain.activationPrerequisites.aggregate.productionApprovalCount,
      },
      reviewEvidencePlaceholder: {
        artifactVersion: expectedEvidenceArtifactVersion,
        artifactStatus: evidence.metadata.status,
        blueprintSlotCount: evidence.aggregate.blueprintSlotCount,
        gatePlaceholderCount: evidence.aggregate.gatePlaceholderCount,
        evidenceRecordCount: evidence.aggregate.evidenceRecordCount,
        approvedDecisionCount: evidence.aggregate.approvedDecisionCount,
        productionApprovalCount: evidence.aggregate.productionApprovalCount,
      },
      auditIdentityPolicy: {
        artifactVersion: expectedAuditArtifactVersion,
        policyVersion: expectedAuditPolicyVersion,
        policyState: auditSummary.policyState,
        prerequisiteStatus: auditSummary.prerequisiteStatus,
        auditIdentityCount: auditSummary.auditIdentityCount,
        auditLogCount: auditSummary.auditLogCount,
        auditEventCount: auditSummary.auditEventCount,
        approvedDecisionCount: auditSummary.approvedDecisionCount,
        productionApprovalCount: auditSummary.productionApprovalCount,
      },
      conflictOfInterestPolicy: {
        artifactVersion: expectedConflictArtifactVersion,
        policyVersion: expectedConflictPolicyVersion,
        policyState: conflict.policyIdentity.policyState,
        reviewEvidenceRecordCount: conflict.aggregate.reviewEvidenceRecordCount,
        reviewerIdentityCount: conflict.aggregate.reviewerIdentityCount,
        auditIdentityCount: conflict.aggregate.auditIdentityCount,
        approvedDecisionCount: conflict.aggregate.approvedDecisionCount,
        productionApprovalCount: conflict.aggregate.productionApprovalCount,
      },
      separationOfDutiesPolicy: {
        artifactVersion: expectedSeparationArtifactVersion,
        policyVersion: expectedSeparationPolicyVersion,
        policyState: separation.policyIdentity.policyState,
        reviewEvidenceRecordCount: separation.aggregate.reviewEvidenceRecordCount,
        reviewerIdentityCount: separation.aggregate.reviewerIdentityCount,
        auditIdentityCount: separation.aggregate.auditIdentityCount,
        approvedDecisionCount: separation.aggregate.approvedDecisionCount,
        productionApprovalCount: separation.aggregate.productionApprovalCount,
      },
      reviewerRoleOwnershipPolicy: {
        artifactVersion: expectedRoleOwnershipArtifactVersion,
        policyVersion: expectedRoleOwnershipPolicyVersion,
        policyState: role.policyIdentity.policyState,
        reviewerIdentityCount: role.aggregate.reviewerIdentityCount,
        auditIdentityCount: role.aggregate.auditIdentityCount,
        reviewerAssignmentCount: role.aggregate.reviewerAssignmentCount,
        approvedDecisionCount: role.aggregate.approvedDecisionCount,
        productionApprovalCount: role.aggregate.productionApprovalCount,
      },
      reviewAuthority: {
        artifactVersion: expectedAuthorityArtifactVersion,
        policyVersion: expectedAuthorityPolicyVersion,
        policyState: authority.authorityPolicy.policyState,
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
        reviewEvidenceRecordCount: workflow.aggregate.reviewEvidenceRecordCount,
        reviewerIdentityCount: workflow.aggregate.reviewerIdentityCount,
        auditIdentityCount: workflow.aggregate.auditIdentityCount,
        approvedDecisionCount: workflow.aggregate.approvedDecisionCount,
        productionApprovalCount: workflow.aggregate.productionApprovalCount,
      },
    },
    prerequisiteReference: { ...prerequisite, evidenceRecordRefs: [] },
    policyIdentity: {
      policyId: "diagnostic-evidence-storage-and-retention",
      policyVersion: expectedPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      activeRulesetVersion: null,
      policyApprovalAllowed: false,
      evidenceTaxonomyApprovalAllowed: false,
      evidenceReferenceIssuanceAllowed: false,
      storageClassificationApprovalAllowed: false,
      evidenceStorageAllowed: false,
      retentionSchedulingAllowed: false,
      deletionExecutionAllowed: false,
      legalHoldEnforcementAllowed: false,
      accessAuthorizationAllowed: false,
      integrityVerificationAllowed: false,
      auditTrailRecordingAllowed: false,
      evidenceExportAllowed: false,
      reviewDecisionAuthorizationAllowed: false,
      productionApprovalAuthorizationAllowed: false,
    },
    evidenceTypeTaxonomyPlaceholders: expectedEvidenceTypeTaxonomy(),
    evidenceReferenceFormatPlaceholder: {
      requirementId: "evidence_reference_format",
      state: "TO_BE_DECIDED",
      namespaceReference: null,
      referenceFormat: null,
      formatVersion: null,
      allocationPolicyReference: null,
      uniquenessPolicyReference: null,
      nonReusePolicyReference: null,
      resolverPolicyReference: null,
      linkagePolicyReference: null,
      referenceRuleReferences: [],
      evidenceReferenceIssuanceAllowed: false,
      realCandidateLinkageAllowed: false,
      digestValueLinkageAllowed: false,
      evidencePayloadEmbeddingAllowed: false,
      storageAddressEmbeddingAllowed: false,
      personalDataEmbeddingAllowed: false,
      controlledLookupAllowed: false,
    },
    storageClassificationPlaceholders: expectedStorageClassificationTaxonomy(),
    retentionPeriodPlaceholder: {
      requirementId: "evidence_retention_period",
      state: "TO_BE_DECIDED",
      durationValue: null,
      durationUnit: null,
      retentionTriggerReference: null,
      expiryPolicyReference: null,
      schedulePolicyReference: null,
      renewalPolicyReference: null,
      retentionRuleReferences: [],
      retentionScheduleCreationAllowed: false,
      retentionEnforcementAllowed: false,
      expiryExecutionAllowed: false,
      renewalExecutionAllowed: false,
      runtimeRetentionAllowed: false,
    },
    deletionWithdrawalPlaceholder: {
      requirementId: "evidence_deletion_withdrawal_and_tombstone",
      state: "TO_BE_DECIDED",
      deletionPolicyReference: null,
      withdrawalPolicyReference: null,
      deletionAuthorityPolicyReference: null,
      propagationPolicyReference: null,
      orphanHandlingPolicyReference: null,
      tombstonePolicyReference: null,
      deletionRuleReferences: [],
      deletionRequestAllowed: false,
      deletionExecutionAllowed: false,
      withdrawalRecordingAllowed: false,
      tombstoneRecordingAllowed: false,
      orphanCleanupAllowed: false,
      runtimeDeletionAllowed: false,
    },
    legalHoldPlaceholder: {
      requirementId: "evidence_legal_hold",
      state: "TO_BE_DECIDED",
      legalHoldPolicyReference: null,
      holdAuthorityPolicyReference: null,
      holdTriggerReference: null,
      holdScopePolicyReference: null,
      releasePolicyReference: null,
      precedencePolicyReference: null,
      legalHoldRuleReferences: [],
      legalHoldRecordingAllowed: false,
      legalHoldEnforcementAllowed: false,
      legalHoldReleaseAllowed: false,
      retentionOverrideAllowed: false,
      deletionBlockingAllowed: false,
    },
    accessControlPlaceholder: {
      requirementId: "evidence_access_control_and_least_privilege",
      state: "TO_BE_DECIDED",
      accessAuthorizationPolicyReference: null,
      leastPrivilegePolicyReference: null,
      emergencyAccessPolicyReference: null,
      accessLoggingPolicyReference: null,
      exportEligibilityPolicyReference: null,
      accessRuleReferences: [],
      evidenceCreateAllowed: false,
      evidenceReadAllowed: false,
      evidenceUpdateAllowed: false,
      evidenceDeleteAllowed: false,
      evidenceExportAllowed: false,
      bulkAccessAllowed: false,
      emergencyAccessAllowed: false,
      accessGrantRecordingAllowed: false,
      accessLogRecordingAllowed: false,
      runtimeAuthorizationAllowed: false,
    },
    evidenceRedactionPrivacyPlaceholder: {
      requirementId: "evidence_redaction_privacy_and_data_minimization",
      state: "TO_BE_DECIDED",
      dataClassificationPolicyReference: null,
      dataMinimizationPolicyReference: null,
      redactionPolicyReference: null,
      protectedContentPolicyReference: null,
      authorizedDisclosurePolicyReference: null,
      derivedViewPolicyReference: null,
      privacyRuleReferences: [],
      learnerPersonalDataRecordingAllowed: false,
      reviewerPersonalDataRecordingAllowed: false,
      auditPersonalDataRecordingAllowed: false,
      protectedContentRecordingAllowed: false,
      freeFormReviewNotesAllowed: false,
      runtimeRedactionAllowed: false,
      derivedViewGenerationAllowed: false,
    },
    evidenceIntegrityChecksumPlaceholder: {
      requirementId: "evidence_integrity_and_checksum",
      state: "TO_BE_DECIDED",
      checksumAlgorithmReference: null,
      checksumEncodingReference: null,
      integrityPolicyReference: null,
      signingPolicyReference: null,
      verificationPolicyReference: null,
      reconciliationPolicyReference: null,
      checksumRuleReferences: [],
      checksumValueRecordingAllowed: false,
      checksumGenerationAllowed: false,
      checksumVerificationAllowed: false,
      signingAllowed: false,
      integrityMismatchDecisionAllowed: false,
      runtimeIntegrityProcessingAllowed: false,
    },
    evidenceAuditTrailPlaceholder: {
      requirementId: "evidence_audit_trail",
      state: "TO_BE_DECIDED",
      eventSchemaReference: null,
      auditIdentityPolicyReference: expectedAuditPolicyVersion,
      eventAttributionPolicyReference: null,
      authorizationSnapshotPolicyReference: null,
      timestampPolicyReference: null,
      auditAccessPolicyReference: null,
      auditRuleReferences: [],
      auditLogRecordingAllowed: false,
      auditEventRecordingAllowed: false,
      auditIdentityAttributionAllowed: false,
      authorizationSnapshotRecordingAllowed: false,
      auditAccessRecordingAllowed: false,
      runtimeAuditTrailAllowed: false,
    },
    evidenceExportReviewPlaceholder: {
      requirementId: "evidence_export_and_review",
      state: "TO_BE_DECIDED",
      exportSchemaReference: null,
      recipientEligibilityPolicyReference: null,
      exportPolicyReference: null,
      evidenceReviewPolicyReference: null,
      reconciliationPolicyReference: null,
      correctionPolicyReference: null,
      exportRuleReferences: [],
      evidenceExportAllowed: false,
      evidenceDownloadAllowed: false,
      bulkDisclosureAllowed: false,
      evidenceReviewAllowed: false,
      reconciliationAllowed: false,
      correctionRecordingAllowed: false,
      reviewDecisionAuthorizationAllowed: false,
      productionApprovalAuthorizationAllowed: false,
    },
    decisionRequirements: expectedDecisionRequirementIds.map(unresolvedRequirement),
    recordBoundary: falseFields(recordBoundaryFields),
    readiness: {
      policyVersion: expectedReadinessPolicyVersion,
      status: "NOT_READY",
      blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
    },
    aggregate: {
      evidenceTypePlaceholderCount: 6,
      storageClassPlaceholderCount: 3,
      decisionRequirementCount: 11,
      undecidedRequirementCount: 11,
      ...zeroFields(zeroAggregateFields),
    },
  };
  for (const field of protectedRecordFields) {
    expected[field] = [];
  }
  return expected;
}

export function validateDiagnosticEvidenceStorageRetentionPolicy(artifact, upstream) {
  const { auditSummary, prerequisite } = validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  requireExactValue(artifact, buildExpectedArtifact(upstream, auditSummary, prerequisite), "$");
  return {
    policyArtifactVersion: artifact.metadata.policyArtifactVersion,
    policyVersion: artifact.policyIdentity.policyVersion,
    policyState: artifact.policyIdentity.policyState,
    prerequisiteStatus: artifact.prerequisiteReference.status,
    evidenceTypePlaceholderCount: artifact.aggregate.evidenceTypePlaceholderCount,
    storageClassPlaceholderCount: artifact.aggregate.storageClassPlaceholderCount,
    decisionRequirementCount: artifact.aggregate.decisionRequirementCount,
    activeStorageRuleCount: artifact.aggregate.activeStorageRuleCount,
    reviewEvidenceRecordCount: artifact.aggregate.reviewEvidenceRecordCount,
    evidenceFileCount: artifact.aggregate.evidenceFileCount,
    storageObjectCount: artifact.aggregate.storageObjectCount,
    retentionScheduleCount: artifact.aggregate.retentionScheduleCount,
    deletionRequestCount: artifact.aggregate.deletionRequestCount,
    legalHoldCount: artifact.aggregate.legalHoldCount,
    auditLogCount: artifact.aggregate.auditLogCount,
    auditEventCount: artifact.aggregate.auditEventCount,
    approvedDecisionCount: artifact.aggregate.approvedDecisionCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticEvidenceStorageRetentionPolicy(
  artifactPath = defaultEvidenceStorageRetentionPolicyPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticEvidenceStorageRetentionPolicyUpstreamArtifacts() {
  const [auditPolicy, auditUpstream] = await Promise.all([
    readDiagnosticAuditIdentityPolicy(),
    readDiagnosticAuditIdentityPolicyUpstreamArtifacts(),
  ]);
  return { auditPolicy, auditUpstream };
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateEvidenceStorageRetentionPolicyChangedPaths(changedPaths) {
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

export function validateEvidenceStorageRetentionPolicyWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateEvidenceStorageRetentionPolicyChangedPaths(changedPaths);
}

async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticEvidenceStorageRetentionPolicy(),
    readDiagnosticEvidenceStorageRetentionPolicyUpstreamArtifacts(),
  ]);
  const summary = validateDiagnosticEvidenceStorageRetentionPolicy(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    validateEvidenceStorageRetentionPolicyWorktreeScope();
  }
  console.log(
    `[curriculum] Evidence storage and retention policy ${summary.policyArtifactVersion} validated: ${summary.evidenceTypePlaceholderCount} evidence type placeholders, ${summary.storageClassPlaceholderCount} storage class placeholders, ${summary.decisionRequirementCount} undecided requirements, ${summary.activeStorageRuleCount} active storage rules, ${summary.reviewEvidenceRecordCount} evidence records, ${summary.evidenceFileCount} evidence files, ${summary.storageObjectCount} storage objects, ${summary.retentionScheduleCount} retention schedules, ${summary.deletionRequestCount} deletion requests, ${summary.legalHoldCount} legal holds, ${summary.auditLogCount} audit logs, ${summary.auditEventCount} audit events, ${summary.approvedDecisionCount} approved decisions, ${summary.productionApprovalCount} production approvals; policy ${summary.policyState}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, readiness ${summary.readiness}.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`[curriculum] ${error.message}`);
    process.exitCode = 1;
  });
}
