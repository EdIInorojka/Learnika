import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "./validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateDigestRegistry } from "./validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "./validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "./validate-diagnostic-review-gate-rubric.mjs";
import {
  readDiagnosticReviewWorkflowState,
  validateDiagnosticReviewWorkflowState,
} from "./validate-diagnostic-review-workflow-state.mjs";

const expectedAuthorityArtifactVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedAuthorityPolicyId = "diagnostic-review-authority-separation-of-duties";
const expectedAuthorityPolicyVersion = "wave-4.slice-8.diagnostic-review-authority.placeholder.v1";
const expectedCoverageArtifactVersion = "wave-4.slice-2.grade-7-9-math.v1";
const expectedEvidenceArtifactVersion = "wave-4.slice-3.grade-7-9-math.v1";
const expectedRubricArtifactVersion = "wave-4.slice-4.grade-7-9-math.v1";
const expectedRegistryArtifactVersion = "wave-4.slice-5.grade-7-9-math.v1";
const expectedCanonicalizationArtifactVersion = "wave-4.slice-6.grade-7-9-math.v1";
const expectedCanonicalizationPolicyVersion =
  "wave-4.slice-6.diagnostic-candidate-canonicalization.placeholder.v1";
const expectedWorkflowArtifactVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedWorkflowVersion = "wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const expectedRoleScopes = new Map([
  ["METHODOLOGY_REVIEWER_PLACEHOLDER", "methodology"],
  ["SAFETY_REVIEWER_PLACEHOLDER", "safety_no_answer"],
  ["RIGHTS_REVIEWER_PLACEHOLDER", "rights_copyright"],
  ["GRADE_PLACEMENT_REVIEWER_PLACEHOLDER", "grade_placement"],
  ["ACCESSIBILITY_REVIEWER_PLACEHOLDER", "accessibility_readability"],
  ["PRODUCTION_APPROVER_PLACEHOLDER", "production_approval"],
  ["AUDIT_OBSERVER_PLACEHOLDER", "audit_observation"],
]);
const expectedGateRoles = new Map([
  ["methodology", "METHODOLOGY_REVIEWER_PLACEHOLDER"],
  ["safety_no_answer", "SAFETY_REVIEWER_PLACEHOLDER"],
  ["rights_copyright", "RIGHTS_REVIEWER_PLACEHOLDER"],
  ["grade_placement", "GRADE_PLACEMENT_REVIEWER_PLACEHOLDER"],
  ["accessibility_readability", "ACCESSIBILITY_REVIEWER_PLACEHOLDER"],
  ["production_approval", "PRODUCTION_APPROVER_PLACEHOLDER"],
]);
const substantiveRoleIds = [
  "METHODOLOGY_REVIEWER_PLACEHOLDER",
  "SAFETY_REVIEWER_PLACEHOLDER",
  "RIGHTS_REVIEWER_PLACEHOLDER",
  "GRADE_PLACEMENT_REVIEWER_PLACEHOLDER",
  "ACCESSIBILITY_REVIEWER_PLACEHOLDER",
];
const decisionRoleIds = [...substantiveRoleIds, "PRODUCTION_APPROVER_PLACEHOLDER"];
const expectedSeparationRules = new Map([
  ["SUBSTANTIVE_REVIEWER_SEPARATE_FROM_PRODUCTION_APPROVER", decisionRoleIds],
  [
    "AUDIT_OBSERVER_SEPARATE_FROM_DECISION_ROLES",
    [...decisionRoleIds, "AUDIT_OBSERVER_PLACEHOLDER"],
  ],
  ["NO_SELF_REVIEW_OR_SELF_APPROVAL", decisionRoleIds],
]);
const requiredBlockingReasons = new Set(["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"]);
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
  "immutableDigest",
  "sha256",
  "contentHash",
  "canonicalizedContent",
  "normalizedStem",
];

const topLevelFields = new Set([
  "metadata",
  "authorityPolicy",
  "dependencyReferences",
  "roleTaxonomyPlaceholders",
  "gateAuthorityPlaceholders",
  "separationOfDutiesRules",
  "identityPolicyDeferrals",
  "conflictOfInterestPolicy",
  "productionApprovalAuthority",
  "recordBoundary",
  "readiness",
  "aggregate",
  "reviewerAssignmentRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "conflictOfInterestRecords",
  "reviewDecisionRecords",
  "productionApprovalRecords",
]);
const metadataFields = new Set([
  "schemaVersion",
  "authorityArtifactVersion",
  "status",
  "artifactKind",
  "subject",
  "locale",
  "audienceGrades",
  "reviewCoverageArtifactVersion",
  "reviewEvidenceArtifactVersion",
  "reviewGateRubricArtifactVersion",
  "candidateDigestRegistryArtifactVersion",
  "candidateCanonicalizationArtifactVersion",
  "reviewWorkflowStateArtifactVersion",
  "diagnosticReadinessPolicyVersion",
  "sourceContract",
  "productionUseAllowed",
  "runtimeUseAllowed",
  "storageAllowed",
]);
const authorityPolicyFields = new Set([
  "policyId",
  "policyVersion",
  "policyState",
  "activationAllowed",
  "runtimeAuthorityAllowed",
  "reviewerAssignmentAllowed",
  "reviewDecisionAuthorityAllowed",
  "productionApprovalAuthorityAllowed",
]);
const dependencyReferenceFields = new Set([
  "reviewCoverage",
  "reviewEvidence",
  "reviewGateRubric",
  "candidateDigestRegistry",
  "candidateCanonicalization",
  "reviewWorkflowState",
]);
const coverageDependencyFields = new Set([
  "artifactVersion",
  "blueprintSlotCount",
  "productionApprovedSlotCount",
]);
const evidenceDependencyFields = new Set([
  "artifactVersion",
  "evidenceRecordCount",
  "approvedDecisionCount",
  "productionApprovalCount",
]);
const rubricDependencyFields = new Set([
  "artifactVersion",
  "gateCount",
  "recordedDecisionCount",
  "recordedEvidenceCount",
  "productionApprovalCount",
]);
const registryDependencyFields = new Set([
  "artifactVersion",
  "candidatePlaceholderCount",
  "assignedCandidateIdentityCount",
  "digestValueCount",
  "reviewDecisionCount",
  "productionApprovedCandidateCount",
]);
const canonicalizationDependencyFields = new Set([
  "artifactVersion",
  "policyVersion",
  "policyState",
  "activeRuleCount",
  "transformedCandidateRecordCount",
  "digestValueCount",
  "reviewDecisionCount",
  "productionApprovedCandidateCount",
]);
const workflowDependencyFields = new Set([
  "artifactVersion",
  "workflowVersion",
  "policyState",
  "workflowEntryCount",
  "submittedCandidateCount",
  "activeReviewCount",
  "approvedDecisionCount",
  "productionApprovalCount",
]);
const rolePlaceholderFields = new Set([
  "rolePlaceholderId",
  "recordState",
  "scopeRef",
  "identityPolicyRef",
  "assignmentPolicyRef",
  "reviewDecisionAuthorityAllowed",
  "productionApprovalAuthorityAllowed",
]);
const gateAuthorityFields = new Set([
  "gateId",
  "gatePolicyVersion",
  "rolePlaceholderId",
  "authorityState",
  "minimumReviewerCountState",
  "minimumReviewerCount",
  "authorityPolicyRef",
  "assignmentAllowed",
  "reviewDecisionAuthorityAllowed",
  "productionApprovalAllowed",
]);
const separationRuleFields = new Set([
  "ruleId",
  "ruleState",
  "participantRolePlaceholderIds",
  "enforcementPolicyRef",
  "runtimeEnforcementAllowed",
  "decisionAuthorizationGranted",
]);
const identityPolicyFields = new Set(["reviewerIdentity", "auditIdentity"]);
const identityDeferralFields = new Set([
  "status",
  "policyVersion",
  "referenceFormat",
  "identityRecordsAllowed",
]);
const conflictPolicyFields = new Set([
  "status",
  "policyVersion",
  "declarationReferenceFormat",
  "evaluationRulesActive",
  "conflictRecordsAllowed",
  "runtimeAssignmentBlockingAllowed",
]);
const productionAuthorityFields = new Set([
  "status",
  "policyVersion",
  "rolePlaceholderId",
  "minimumApproverCountState",
  "minimumApproverCount",
  "reviewDecisionAuthorityAllowed",
  "productionApprovalAllowed",
]);
const recordBoundaryFields = new Set([
  "authorityPolicyActivated",
  "realReviewerRolesCreated",
  "reviewerAssignmentsRecorded",
  "reviewerIdentitiesRecorded",
  "auditIdentitiesRecorded",
  "conflictRecordsRecorded",
  "reviewDecisionsRecorded",
  "productionApprovalsRecorded",
  "runtimeAuthorityEnabled",
]);
const readinessFields = new Set([
  "status",
  "policyVersion",
  "blockingReasons",
  "productionUseAllowed",
]);
const aggregateFields = new Set([
  "rolePlaceholderCount",
  "gateAuthorityPlaceholderCount",
  "separationOfDutiesRuleCount",
  "realReviewerRoleCount",
  "reviewerAssignmentCount",
  "reviewerIdentityCount",
  "auditIdentityCount",
  "conflictRecordCount",
  "reviewDecisionCount",
  "approvedDecisionCount",
  "productionApprovalCount",
]);
const approvedSlice8ChangedPaths = new Set([
  "docs/wave-4/closure-gate.md",
  "docs/wave-4/diagnostic-review-authority-contract.md",
  "docs/wave-4/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "package.json",
]);
const wave5Slice1ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-review-activation-prerequisites-contract.md",
  "docs/wave-5/open-decisions.md",
  "docs/wave-5/scope-and-non-goals.md",
  "docs/wave-5/slice-1-implementation-note.md",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
]);
const wave5Slice2ScopeUnblockPaths = new Set([
  "docs/wave-5/slice-2-implementation-note.md",
  "packages/curriculum/diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
]);
const wave5Slice3ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-candidate-identity-policy-contract.md",
  "docs/wave-5/slice-3-implementation-note.md",
  "packages/curriculum/diagnostic-candidate-identity-policy/grade-7-9-math.candidate-identity-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
]);
const wave5Slice4ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md",
  "docs/wave-5/slice-4-implementation-note.md",
  "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
]);
const wave5Slice5ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md",
  "docs/wave-5/slice-5-implementation-note.md",
  "packages/curriculum/diagnostic-reviewer-role-ownership-policy/grade-7-9-math.reviewer-role-ownership-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
]);
const wave5Slice6ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md",
  "docs/wave-5/slice-6-implementation-note.md",
  "packages/curriculum/diagnostic-separation-of-duties-policy/grade-7-9-math.separation-of-duties-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
]);
const wave5Slice7ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md",
  "docs/wave-5/slice-7-implementation-note.md",
  "packages/curriculum/diagnostic-conflict-of-interest-policy/grade-7-9-math.conflict-of-interest-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
]);
const wave5Slice8ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-audit-identity-policy-contract.md",
  "docs/wave-5/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs",
]);
const wave5Slice9ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-evidence-storage-retention-policy-contract.md",
  "docs/wave-5/slice-9-implementation-note.md",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy/grade-7-9-math.evidence-storage-retention-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs",
]);
const wave5Slice10ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-production-approval-authority-policy-contract.md",
  "docs/wave-5/slice-10-implementation-note.md",
  "packages/curriculum/diagnostic-production-approval-authority-policy/grade-7-9-math.production-approval-authority-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
]);
const wave5Slice11ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-coverage-gap-closure-plan-contract.md",
  "docs/wave-5/slice-11-implementation-note.md",
  "packages/curriculum/diagnostic-coverage-gap-closure-plan/grade-7-9-math.coverage-gap-closure-plan-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs",
  "packages/curriculum/test/diagnostic-coverage-gap-closure-plan.test.mjs",
]);
const wave5Slice12ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-readiness-integration-plan-contract.md",
  "docs/wave-5/slice-12-implementation-note.md",
  "packages/curriculum/diagnostic-readiness-integration-plan/grade-7-9-math.readiness-integration-plan-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
]);
const wave5Slice13ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
  "docs/wave-5/slice-13-implementation-note.md",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy/grade-7-9-math.rollback-withdrawal-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy.test.mjs",
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
export const defaultReviewAuthorityPath = path.resolve(
  scriptDir,
  "../diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
);
export const repoRoot = path.resolve(scriptDir, "../../..");

export class DiagnosticReviewAuthorityValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiagnosticReviewAuthorityValidationError";
  }
}

function fail(message) {
  throw new DiagnosticReviewAuthorityValidationError(message);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, fieldPath) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${fieldPath} must be a non-empty string.`);
  }
}

function requireExactFields(value, expectedFields, fieldPath) {
  if (!isPlainObject(value)) {
    fail(`${fieldPath} must be an object.`);
  }
  for (const key of Object.keys(value)) {
    if (!expectedFields.has(key)) {
      fail(`${fieldPath}.${key} is an unexpected field.`);
    }
  }
  for (const field of expectedFields) {
    if (!Object.hasOwn(value, field)) {
      fail(`${fieldPath}.${field} is required.`);
    }
  }
}

function requireExactArrayMembers(value, expectedValues, fieldPath) {
  if (!Array.isArray(value) || value.length !== expectedValues.length) {
    fail(`${fieldPath} must contain exactly ${expectedValues.length} values.`);
  }
  const actual = new Set(value);
  if (
    actual.size !== expectedValues.length ||
    expectedValues.some((expectedValue) => !actual.has(expectedValue))
  ) {
    fail(`${fieldPath} must contain the exact approved placeholder values.`);
  }
}

function scanForbiddenTermsAndHashLikeValues(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      scanForbiddenTermsAndHashLikeValues(item, `${fieldPath}[${index}]`),
    );
    return;
  }
  if (isPlainObject(value)) {
    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      for (const term of forbiddenTerms) {
        if (normalizedKey.includes(term.toLowerCase())) {
          fail(`${fieldPath}.${key} uses forbidden field term ${term}.`);
        }
      }
      scanForbiddenTermsAndHashLikeValues(nestedValue, `${fieldPath}.${key}`);
    }
    return;
  }
  if (typeof value === "string") {
    const normalizedValue = value.toLowerCase();
    for (const term of forbiddenTerms) {
      if (normalizedValue.includes(term.toLowerCase())) {
        fail(`${fieldPath} uses forbidden content term ${term}.`);
      }
    }
    if (/\b[a-f0-9]{32,}\b/i.test(value)) {
      fail(`${fieldPath} contains a hash-like value, which is forbidden in Slice 8.`);
    }
  }
}

function validateUpstreamArtifacts(
  coverage,
  evidence,
  rubric,
  registry,
  canonicalization,
  workflow,
) {
  const workflowSummary = validateDiagnosticReviewWorkflowState(
    workflow,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
  );
  if (
    coverage.metadata.coverageArtifactVersion !== expectedCoverageArtifactVersion ||
    coverage.aggregate.blueprintSlotCount !== 11 ||
    coverage.aggregate.statusCounts.PRODUCTION_APPROVED !== 0
  ) {
    fail("Referenced review coverage must remain the exact non-production Slice 2 baseline.");
  }
  if (
    evidence.metadata.evidenceArtifactVersion !== expectedEvidenceArtifactVersion ||
    evidence.aggregate.evidenceRecordCount !== 0 ||
    evidence.aggregate.approvedDecisionCount !== 0 ||
    evidence.aggregate.productionApprovalCount !== 0
  ) {
    fail("Referenced review evidence must remain the empty Slice 3 placeholder.");
  }
  if (
    rubric.metadata.rubricArtifactVersion !== expectedRubricArtifactVersion ||
    rubric.aggregate.gateCount !== 6 ||
    rubric.aggregate.recordedDecisionCount !== 0 ||
    rubric.aggregate.recordedEvidenceCount !== 0 ||
    rubric.aggregate.productionApprovalCount !== 0
  ) {
    fail("Referenced review rubric must remain the non-decision Slice 4 definition.");
  }
  if (
    registry.metadata.registryArtifactVersion !== expectedRegistryArtifactVersion ||
    registry.aggregate.candidatePlaceholderCount !== 11 ||
    registry.aggregate.assignedCandidateIdentityCount !== 0 ||
    registry.aggregate.digestValueCount !== 0 ||
    registry.aggregate.reviewDecisionCount !== 0 ||
    registry.aggregate.productionApprovedCandidateCount !== 0
  ) {
    fail("Referenced candidate registry must remain the empty Slice 5 placeholder.");
  }
  if (
    canonicalization.metadata.policyArtifactVersion !== expectedCanonicalizationArtifactVersion ||
    canonicalization.policyIdentity.policyVersion !== expectedCanonicalizationPolicyVersion ||
    canonicalization.policyIdentity.status !== "UNRESOLVED_DEFERRED" ||
    canonicalization.aggregate.activeRuleCount !== 0 ||
    canonicalization.aggregate.transformedCandidateRecordCount !== 0 ||
    canonicalization.aggregate.digestValueCount !== 0 ||
    canonicalization.aggregate.reviewDecisionCount !== 0 ||
    canonicalization.aggregate.productionApprovedCandidateCount !== 0
  ) {
    fail("Referenced canonicalization policy must remain the unresolved Slice 6 placeholder.");
  }
  if (
    workflowSummary.workflowArtifactVersion !== expectedWorkflowArtifactVersion ||
    workflowSummary.workflowVersion !== expectedWorkflowVersion ||
    workflowSummary.workflowPolicyState !== "DEFERRED_NON_PRODUCTION" ||
    workflowSummary.workflowEntryCount !== 11 ||
    workflowSummary.submittedCandidateCount !== 0 ||
    workflowSummary.activeReviewCount !== 0 ||
    workflowSummary.approvedDecisionCount !== 0 ||
    workflowSummary.productionApprovalCount !== 0
  ) {
    fail("Referenced review workflow must remain the inactive Slice 7 placeholder.");
  }
  return workflowSummary;
}

function validateMetadata(metadata, upstream) {
  requireExactFields(metadata, metadataFields, "metadata");
  const expectedValues = new Map([
    ["schemaVersion", "learnika.diagnosticReviewAuthorityPlaceholder.v1"],
    ["authorityArtifactVersion", expectedAuthorityArtifactVersion],
    ["status", "placeholder_only_non_production"],
    ["artifactKind", "diagnostic_review_authority_placeholder"],
    ["subject", "math"],
    ["locale", "ru-RU"],
    ["reviewCoverageArtifactVersion", expectedCoverageArtifactVersion],
    ["reviewEvidenceArtifactVersion", expectedEvidenceArtifactVersion],
    ["reviewGateRubricArtifactVersion", expectedRubricArtifactVersion],
    ["candidateDigestRegistryArtifactVersion", expectedRegistryArtifactVersion],
    ["candidateCanonicalizationArtifactVersion", expectedCanonicalizationArtifactVersion],
    ["reviewWorkflowStateArtifactVersion", expectedWorkflowArtifactVersion],
    ["diagnosticReadinessPolicyVersion", expectedReadinessPolicyVersion],
    ["sourceContract", "docs/wave-4/diagnostic-review-authority-contract.md"],
  ]);
  for (const [field, expectedValue] of expectedValues) {
    if (metadata[field] !== expectedValue) {
      fail(`metadata.${field} must be ${expectedValue}.`);
    }
  }
  if (
    !Array.isArray(metadata.audienceGrades) ||
    metadata.audienceGrades.length !== 3 ||
    metadata.audienceGrades.some((grade, index) => grade !== index + 7)
  ) {
    fail("metadata.audienceGrades must be exactly [7, 8, 9].");
  }
  if (
    metadata.productionUseAllowed !== false ||
    metadata.runtimeUseAllowed !== false ||
    metadata.storageAllowed !== false
  ) {
    fail("metadata must keep production, runtime and storage use disabled.");
  }
  const upstreamVersions = [
    ["reviewCoverageArtifactVersion", upstream.coverage.metadata.coverageArtifactVersion],
    ["reviewEvidenceArtifactVersion", upstream.evidence.metadata.evidenceArtifactVersion],
    ["reviewGateRubricArtifactVersion", upstream.rubric.metadata.rubricArtifactVersion],
    ["candidateDigestRegistryArtifactVersion", upstream.registry.metadata.registryArtifactVersion],
    [
      "candidateCanonicalizationArtifactVersion",
      upstream.canonicalization.metadata.policyArtifactVersion,
    ],
    ["reviewWorkflowStateArtifactVersion", upstream.workflow.metadata.workflowArtifactVersion],
  ];
  for (const [field, upstreamVersion] of upstreamVersions) {
    if (metadata[field] !== upstreamVersion) {
      fail(`metadata.${field} must match its upstream artifact.`);
    }
  }
}

function validateAuthorityPolicy(authorityPolicy) {
  requireExactFields(authorityPolicy, authorityPolicyFields, "authorityPolicy");
  if (
    authorityPolicy.policyId !== expectedAuthorityPolicyId ||
    authorityPolicy.policyVersion !== expectedAuthorityPolicyVersion ||
    authorityPolicy.policyState !== "DEFERRED_NON_PRODUCTION" ||
    authorityPolicy.activationAllowed !== false ||
    authorityPolicy.runtimeAuthorityAllowed !== false ||
    authorityPolicy.reviewerAssignmentAllowed !== false ||
    authorityPolicy.reviewDecisionAuthorityAllowed !== false ||
    authorityPolicy.productionApprovalAuthorityAllowed !== false
  ) {
    fail("authorityPolicy must remain the inactive non-authorizing Slice 8 placeholder.");
  }
}

function validateDependencyReferences(dependencies, upstream) {
  requireExactFields(dependencies, dependencyReferenceFields, "dependencyReferences");
  requireExactFields(
    dependencies.reviewCoverage,
    coverageDependencyFields,
    "dependencyReferences.reviewCoverage",
  );
  if (
    dependencies.reviewCoverage.artifactVersion !== expectedCoverageArtifactVersion ||
    dependencies.reviewCoverage.artifactVersion !==
      upstream.coverage.metadata.coverageArtifactVersion ||
    dependencies.reviewCoverage.blueprintSlotCount !== upstream.coverage.slots.length ||
    dependencies.reviewCoverage.blueprintSlotCount !== 11 ||
    dependencies.reviewCoverage.productionApprovedSlotCount !==
      upstream.coverage.aggregate.statusCounts.PRODUCTION_APPROVED ||
    dependencies.reviewCoverage.productionApprovedSlotCount !== 0
  ) {
    fail("dependencyReferences.reviewCoverage must match the Slice 2 baseline.");
  }

  requireExactFields(
    dependencies.reviewEvidence,
    evidenceDependencyFields,
    "dependencyReferences.reviewEvidence",
  );
  if (
    dependencies.reviewEvidence.artifactVersion !== expectedEvidenceArtifactVersion ||
    dependencies.reviewEvidence.artifactVersion !==
      upstream.evidence.metadata.evidenceArtifactVersion ||
    dependencies.reviewEvidence.evidenceRecordCount !==
      upstream.evidence.aggregate.evidenceRecordCount ||
    dependencies.reviewEvidence.approvedDecisionCount !==
      upstream.evidence.aggregate.approvedDecisionCount ||
    dependencies.reviewEvidence.productionApprovalCount !==
      upstream.evidence.aggregate.productionApprovalCount ||
    dependencies.reviewEvidence.evidenceRecordCount !== 0 ||
    dependencies.reviewEvidence.approvedDecisionCount !== 0 ||
    dependencies.reviewEvidence.productionApprovalCount !== 0
  ) {
    fail("dependencyReferences.reviewEvidence must match the empty Slice 3 placeholder.");
  }

  requireExactFields(
    dependencies.reviewGateRubric,
    rubricDependencyFields,
    "dependencyReferences.reviewGateRubric",
  );
  if (
    dependencies.reviewGateRubric.artifactVersion !== expectedRubricArtifactVersion ||
    dependencies.reviewGateRubric.artifactVersion !==
      upstream.rubric.metadata.rubricArtifactVersion ||
    dependencies.reviewGateRubric.gateCount !== upstream.rubric.aggregate.gateCount ||
    dependencies.reviewGateRubric.gateCount !== 6 ||
    dependencies.reviewGateRubric.recordedDecisionCount !==
      upstream.rubric.aggregate.recordedDecisionCount ||
    dependencies.reviewGateRubric.recordedEvidenceCount !==
      upstream.rubric.aggregate.recordedEvidenceCount ||
    dependencies.reviewGateRubric.productionApprovalCount !==
      upstream.rubric.aggregate.productionApprovalCount ||
    dependencies.reviewGateRubric.recordedDecisionCount !== 0 ||
    dependencies.reviewGateRubric.recordedEvidenceCount !== 0 ||
    dependencies.reviewGateRubric.productionApprovalCount !== 0
  ) {
    fail("dependencyReferences.reviewGateRubric must match the non-decision Slice 4 rubric.");
  }

  requireExactFields(
    dependencies.candidateDigestRegistry,
    registryDependencyFields,
    "dependencyReferences.candidateDigestRegistry",
  );
  const registryAggregate = upstream.registry.aggregate;
  if (
    dependencies.candidateDigestRegistry.artifactVersion !== expectedRegistryArtifactVersion ||
    dependencies.candidateDigestRegistry.artifactVersion !==
      upstream.registry.metadata.registryArtifactVersion ||
    dependencies.candidateDigestRegistry.candidatePlaceholderCount !==
      registryAggregate.candidatePlaceholderCount ||
    dependencies.candidateDigestRegistry.candidatePlaceholderCount !== 11 ||
    dependencies.candidateDigestRegistry.assignedCandidateIdentityCount !==
      registryAggregate.assignedCandidateIdentityCount ||
    dependencies.candidateDigestRegistry.digestValueCount !== registryAggregate.digestValueCount ||
    dependencies.candidateDigestRegistry.reviewDecisionCount !==
      registryAggregate.reviewDecisionCount ||
    dependencies.candidateDigestRegistry.productionApprovedCandidateCount !==
      registryAggregate.productionApprovedCandidateCount ||
    dependencies.candidateDigestRegistry.assignedCandidateIdentityCount !== 0 ||
    dependencies.candidateDigestRegistry.digestValueCount !== 0 ||
    dependencies.candidateDigestRegistry.reviewDecisionCount !== 0 ||
    dependencies.candidateDigestRegistry.productionApprovedCandidateCount !== 0
  ) {
    fail("dependencyReferences.candidateDigestRegistry must match the empty Slice 5 registry.");
  }

  requireExactFields(
    dependencies.candidateCanonicalization,
    canonicalizationDependencyFields,
    "dependencyReferences.candidateCanonicalization",
  );
  const canonicalization = upstream.canonicalization;
  if (
    dependencies.candidateCanonicalization.artifactVersion !==
      expectedCanonicalizationArtifactVersion ||
    dependencies.candidateCanonicalization.artifactVersion !==
      canonicalization.metadata.policyArtifactVersion ||
    dependencies.candidateCanonicalization.policyVersion !==
      expectedCanonicalizationPolicyVersion ||
    dependencies.candidateCanonicalization.policyVersion !==
      canonicalization.policyIdentity.policyVersion ||
    dependencies.candidateCanonicalization.policyState !== "UNRESOLVED_DEFERRED" ||
    dependencies.candidateCanonicalization.policyState !== canonicalization.policyIdentity.status ||
    dependencies.candidateCanonicalization.activeRuleCount !==
      canonicalization.aggregate.activeRuleCount ||
    dependencies.candidateCanonicalization.transformedCandidateRecordCount !==
      canonicalization.aggregate.transformedCandidateRecordCount ||
    dependencies.candidateCanonicalization.digestValueCount !==
      canonicalization.aggregate.digestValueCount ||
    dependencies.candidateCanonicalization.reviewDecisionCount !==
      canonicalization.aggregate.reviewDecisionCount ||
    dependencies.candidateCanonicalization.productionApprovedCandidateCount !==
      canonicalization.aggregate.productionApprovedCandidateCount ||
    dependencies.candidateCanonicalization.activeRuleCount !== 0 ||
    dependencies.candidateCanonicalization.transformedCandidateRecordCount !== 0 ||
    dependencies.candidateCanonicalization.digestValueCount !== 0 ||
    dependencies.candidateCanonicalization.reviewDecisionCount !== 0 ||
    dependencies.candidateCanonicalization.productionApprovedCandidateCount !== 0
  ) {
    fail(
      "dependencyReferences.candidateCanonicalization must match the unresolved Slice 6 policy.",
    );
  }

  requireExactFields(
    dependencies.reviewWorkflowState,
    workflowDependencyFields,
    "dependencyReferences.reviewWorkflowState",
  );
  const workflowSummary = upstream.workflowSummary;
  if (
    dependencies.reviewWorkflowState.artifactVersion !== expectedWorkflowArtifactVersion ||
    dependencies.reviewWorkflowState.artifactVersion !== workflowSummary.workflowArtifactVersion ||
    dependencies.reviewWorkflowState.workflowVersion !== expectedWorkflowVersion ||
    dependencies.reviewWorkflowState.workflowVersion !== workflowSummary.workflowVersion ||
    dependencies.reviewWorkflowState.policyState !== "DEFERRED_NON_PRODUCTION" ||
    dependencies.reviewWorkflowState.policyState !== workflowSummary.workflowPolicyState ||
    dependencies.reviewWorkflowState.workflowEntryCount !== workflowSummary.workflowEntryCount ||
    dependencies.reviewWorkflowState.workflowEntryCount !== 11 ||
    dependencies.reviewWorkflowState.submittedCandidateCount !==
      workflowSummary.submittedCandidateCount ||
    dependencies.reviewWorkflowState.activeReviewCount !== workflowSummary.activeReviewCount ||
    dependencies.reviewWorkflowState.approvedDecisionCount !==
      workflowSummary.approvedDecisionCount ||
    dependencies.reviewWorkflowState.productionApprovalCount !==
      workflowSummary.productionApprovalCount ||
    dependencies.reviewWorkflowState.submittedCandidateCount !== 0 ||
    dependencies.reviewWorkflowState.activeReviewCount !== 0 ||
    dependencies.reviewWorkflowState.approvedDecisionCount !== 0 ||
    dependencies.reviewWorkflowState.productionApprovalCount !== 0
  ) {
    fail("dependencyReferences.reviewWorkflowState must match the inactive Slice 7 workflow.");
  }
}

function validateRoleTaxonomy(rolePlaceholders) {
  if (!Array.isArray(rolePlaceholders) || rolePlaceholders.length !== expectedRoleScopes.size) {
    fail("roleTaxonomyPlaceholders must contain exactly seven role placeholders.");
  }
  const seenRoles = new Set();
  for (const [index, role] of rolePlaceholders.entries()) {
    const fieldPath = `roleTaxonomyPlaceholders[${index}]`;
    requireExactFields(role, rolePlaceholderFields, fieldPath);
    requireString(role.rolePlaceholderId, `${fieldPath}.rolePlaceholderId`);
    if (!expectedRoleScopes.has(role.rolePlaceholderId)) {
      fail(`${fieldPath} uses unknown role placeholder ${role.rolePlaceholderId}.`);
    }
    if (seenRoles.has(role.rolePlaceholderId)) {
      fail(`Duplicate role placeholder ${role.rolePlaceholderId}.`);
    }
    seenRoles.add(role.rolePlaceholderId);
    if (
      role.recordState !== "PLACEHOLDER_ONLY" ||
      role.scopeRef !== expectedRoleScopes.get(role.rolePlaceholderId) ||
      role.identityPolicyRef !== null ||
      role.assignmentPolicyRef !== null ||
      role.reviewDecisionAuthorityAllowed !== false ||
      role.productionApprovalAuthorityAllowed !== false
    ) {
      fail(`${fieldPath} must remain a non-authorizing role placeholder without identity data.`);
    }
  }
  for (const roleId of expectedRoleScopes.keys()) {
    if (!seenRoles.has(roleId)) {
      fail(`Missing role placeholder ${roleId}.`);
    }
  }
  return seenRoles;
}

function validateGateAuthorityPlaceholders(gatePlaceholders, rubric, knownRoles) {
  if (!Array.isArray(gatePlaceholders) || gatePlaceholders.length !== expectedGateRoles.size) {
    fail("gateAuthorityPlaceholders must contain exactly six gate placeholders.");
  }
  const rubricByGate = new Map(rubric.gates.map((gate) => [gate.gateId, gate]));
  const seenGates = new Set();
  for (const [index, gate] of gatePlaceholders.entries()) {
    const fieldPath = `gateAuthorityPlaceholders[${index}]`;
    requireExactFields(gate, gateAuthorityFields, fieldPath);
    if (!expectedGateRoles.has(gate.gateId)) {
      fail(`${fieldPath} uses unknown gate ${gate.gateId}.`);
    }
    if (seenGates.has(gate.gateId)) {
      fail(`Duplicate gate authority placeholder ${gate.gateId}.`);
    }
    seenGates.add(gate.gateId);
    const rubricGate = rubricByGate.get(gate.gateId);
    if (
      gate.gatePolicyVersion !== rubricGate.policyVersion ||
      gate.rolePlaceholderId !== expectedGateRoles.get(gate.gateId) ||
      !knownRoles.has(gate.rolePlaceholderId)
    ) {
      fail(`${fieldPath} must match its Slice 4 gate and role placeholder.`);
    }
    if (
      gate.authorityState !== "DEFERRED" ||
      gate.minimumReviewerCountState !== "TO_BE_DECIDED" ||
      gate.minimumReviewerCount !== null ||
      gate.authorityPolicyRef !== null ||
      gate.assignmentAllowed !== false ||
      gate.reviewDecisionAuthorityAllowed !== false ||
      gate.productionApprovalAllowed !== false
    ) {
      fail(`${fieldPath} must remain deferred without reviewer counts or decision authority.`);
    }
  }
  return seenGates.size;
}

function validateSeparationOfDutiesRules(rules, knownRoles) {
  if (!Array.isArray(rules) || rules.length !== expectedSeparationRules.size) {
    fail("separationOfDutiesRules must contain exactly three placeholder rules.");
  }
  const seenRules = new Set();
  for (const [index, rule] of rules.entries()) {
    const fieldPath = `separationOfDutiesRules[${index}]`;
    requireExactFields(rule, separationRuleFields, fieldPath);
    if (!expectedSeparationRules.has(rule.ruleId)) {
      fail(`${fieldPath} uses unknown separation rule ${rule.ruleId}.`);
    }
    if (seenRules.has(rule.ruleId)) {
      fail(`Duplicate separation-of-duties rule ${rule.ruleId}.`);
    }
    seenRules.add(rule.ruleId);
    requireExactArrayMembers(
      rule.participantRolePlaceholderIds,
      expectedSeparationRules.get(rule.ruleId),
      `${fieldPath}.participantRolePlaceholderIds`,
    );
    if (rule.participantRolePlaceholderIds.some((roleId) => !knownRoles.has(roleId))) {
      fail(`${fieldPath} references an unknown role placeholder.`);
    }
    if (
      rule.ruleState !== "NON_AUTHORIZING_PLACEHOLDER" ||
      rule.enforcementPolicyRef !== null ||
      rule.runtimeEnforcementAllowed !== false ||
      rule.decisionAuthorizationGranted !== false
    ) {
      fail(`${fieldPath} must remain non-authorizing and runtime-disabled.`);
    }
  }
  return seenRules.size;
}

function validateIdentityPolicyDeferrals(identityPolicies) {
  requireExactFields(identityPolicies, identityPolicyFields, "identityPolicyDeferrals");
  for (const field of identityPolicyFields) {
    const deferral = identityPolicies[field];
    const fieldPath = `identityPolicyDeferrals.${field}`;
    requireExactFields(deferral, identityDeferralFields, fieldPath);
    if (
      deferral.status !== "DEFERRED" ||
      deferral.policyVersion !== null ||
      deferral.referenceFormat !== null ||
      deferral.identityRecordsAllowed !== false
    ) {
      fail(`${fieldPath} must remain deferred without identity records.`);
    }
  }
}

function validateConflictOfInterestPolicy(policy) {
  requireExactFields(policy, conflictPolicyFields, "conflictOfInterestPolicy");
  if (
    policy.status !== "DEFERRED_PLACEHOLDER_ONLY" ||
    policy.policyVersion !== null ||
    policy.declarationReferenceFormat !== null ||
    policy.evaluationRulesActive !== false ||
    policy.conflictRecordsAllowed !== false ||
    policy.runtimeAssignmentBlockingAllowed !== false
  ) {
    fail("conflictOfInterestPolicy must remain deferred and placeholder-only.");
  }
}

function validateProductionApprovalAuthority(authority, knownRoles) {
  requireExactFields(authority, productionAuthorityFields, "productionApprovalAuthority");
  if (
    authority.status !== "DEFERRED" ||
    authority.policyVersion !== null ||
    authority.rolePlaceholderId !== "PRODUCTION_APPROVER_PLACEHOLDER" ||
    !knownRoles.has(authority.rolePlaceholderId) ||
    authority.minimumApproverCountState !== "TO_BE_DECIDED" ||
    authority.minimumApproverCount !== null ||
    authority.reviewDecisionAuthorityAllowed !== false ||
    authority.productionApprovalAllowed !== false
  ) {
    fail("productionApprovalAuthority must remain deferred and non-authorizing.");
  }
}

function validateRecordBoundary(recordBoundary) {
  requireExactFields(recordBoundary, recordBoundaryFields, "recordBoundary");
  for (const field of recordBoundaryFields) {
    if (recordBoundary[field] !== false) {
      fail(`recordBoundary.${field} must remain false.`);
    }
  }
}

function validateReadiness(readiness, upstream) {
  requireExactFields(readiness, readinessFields, "readiness");
  if (readiness.status !== "NOT_READY") {
    fail("readiness.status must remain NOT_READY.");
  }
  if (
    readiness.policyVersion !== expectedReadinessPolicyVersion ||
    readiness.policyVersion !== upstream.coverage.readiness.policyVersion ||
    readiness.policyVersion !== upstream.workflow.readiness.policyVersion
  ) {
    fail("readiness.policyVersion must remain pinned to the Wave 3 policy.");
  }
  if (readiness.productionUseAllowed !== false) {
    fail("readiness.productionUseAllowed must be false.");
  }
  if (!Array.isArray(readiness.blockingReasons)) {
    fail("readiness.blockingReasons must be an array.");
  }
  const reasons = new Set(readiness.blockingReasons);
  if (
    reasons.size !== requiredBlockingReasons.size ||
    [...requiredBlockingReasons].some((reason) => !reasons.has(reason))
  ) {
    fail("readiness.blockingReasons must contain the two current Wave 3 blockers.");
  }
}

function validateEmptyRecordArrays(artifact) {
  const arrays = [
    ["reviewerAssignmentRecords", artifact.reviewerAssignmentRecords],
    ["reviewerIdentityRecords", artifact.reviewerIdentityRecords],
    ["auditIdentityRecords", artifact.auditIdentityRecords],
    ["conflictOfInterestRecords", artifact.conflictOfInterestRecords],
    ["reviewDecisionRecords", artifact.reviewDecisionRecords],
    ["productionApprovalRecords", artifact.productionApprovalRecords],
  ];
  for (const [field, records] of arrays) {
    if (!Array.isArray(records) || records.length !== 0) {
      fail(`${field} must remain empty in Slice 8.`);
    }
  }
}

function validateAggregate(aggregate, roleCount, gateCount, separationRuleCount) {
  requireExactFields(aggregate, aggregateFields, "aggregate");
  if (
    aggregate.rolePlaceholderCount !== roleCount ||
    aggregate.rolePlaceholderCount !== 7 ||
    aggregate.gateAuthorityPlaceholderCount !== gateCount ||
    aggregate.gateAuthorityPlaceholderCount !== 6 ||
    aggregate.separationOfDutiesRuleCount !== separationRuleCount ||
    aggregate.separationOfDutiesRuleCount !== 3
  ) {
    fail("aggregate structural counts must match the authority definitions.");
  }
  if (
    aggregate.realReviewerRoleCount !== 0 ||
    aggregate.reviewerAssignmentCount !== 0 ||
    aggregate.reviewerIdentityCount !== 0 ||
    aggregate.auditIdentityCount !== 0 ||
    aggregate.conflictRecordCount !== 0 ||
    aggregate.reviewDecisionCount !== 0 ||
    aggregate.approvedDecisionCount !== 0 ||
    aggregate.productionApprovalCount !== 0
  ) {
    fail("aggregate role, assignment, identity, decision and approval counts must remain zero.");
  }
}

export function validateDiagnosticReviewAuthority(
  artifact,
  coverage,
  evidence,
  rubric,
  registry,
  canonicalization,
  workflow,
) {
  if (!isPlainObject(artifact)) {
    fail("Diagnostic review authority artifact must be a JSON object.");
  }
  const workflowSummary = validateUpstreamArtifacts(
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
  );
  scanForbiddenTermsAndHashLikeValues(artifact);
  requireExactFields(artifact, topLevelFields, "$");
  const upstream = {
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    workflowSummary,
  };
  validateMetadata(artifact.metadata, upstream);
  validateAuthorityPolicy(artifact.authorityPolicy);
  validateDependencyReferences(artifact.dependencyReferences, upstream);
  const knownRoles = validateRoleTaxonomy(artifact.roleTaxonomyPlaceholders);
  const gateCount = validateGateAuthorityPlaceholders(
    artifact.gateAuthorityPlaceholders,
    rubric,
    knownRoles,
  );
  const separationRuleCount = validateSeparationOfDutiesRules(
    artifact.separationOfDutiesRules,
    knownRoles,
  );
  validateIdentityPolicyDeferrals(artifact.identityPolicyDeferrals);
  validateConflictOfInterestPolicy(artifact.conflictOfInterestPolicy);
  validateProductionApprovalAuthority(artifact.productionApprovalAuthority, knownRoles);
  validateRecordBoundary(artifact.recordBoundary);
  validateReadiness(artifact.readiness, upstream);
  validateEmptyRecordArrays(artifact);
  validateAggregate(artifact.aggregate, knownRoles.size, gateCount, separationRuleCount);

  return {
    authorityArtifactVersion: artifact.metadata.authorityArtifactVersion,
    authorityPolicyId: artifact.authorityPolicy.policyId,
    authorityPolicyVersion: artifact.authorityPolicy.policyVersion,
    authorityPolicyState: artifact.authorityPolicy.policyState,
    rolePlaceholderCount: knownRoles.size,
    gateAuthorityPlaceholderCount: gateCount,
    separationOfDutiesRuleCount: separationRuleCount,
    reviewerAssignmentCount: artifact.reviewerAssignmentRecords.length,
    reviewerIdentityCount: artifact.reviewerIdentityRecords.length,
    auditIdentityCount: artifact.auditIdentityRecords.length,
    approvedDecisionCount: artifact.aggregate.approvedDecisionCount,
    productionApprovalCount: artifact.productionApprovalRecords.length,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticReviewAuthority(artifactPath = defaultReviewAuthorityPath) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateReviewAuthorityChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice8ChangedPaths.has(changedPath) &&
      !wave5Slice1ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice2ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice3ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice4ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice5ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice6ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice7ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice8ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice9ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice10ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice11ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice12ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice13ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice14ScopeUnblockPaths.has(changedPath) &&
      !wave5ClosureScopeUnblockPaths.has(changedPath) &&
      !wave6Slice1ScopeUnblockPaths.has(changedPath) &&
      !wave6Slice2ScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 4 Slice 8 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateReviewAuthorityWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateReviewAuthorityChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [artifact, coverage, evidence, rubric, registry, canonicalization, workflow] =
    await Promise.all([
      readDiagnosticReviewAuthority(),
      readDiagnosticReviewCoverage(),
      readDiagnosticReviewEvidence(),
      readDiagnosticReviewGateRubric(),
      readDiagnosticCandidateDigestRegistry(),
      readDiagnosticCandidateCanonicalization(),
      readDiagnosticReviewWorkflowState(),
    ]);
  const summary = validateDiagnosticReviewAuthority(
    artifact,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
  );

  if (checkWorktreeScope) {
    validateReviewAuthorityWorktreeScope();
  }

  console.log(
    `[curriculum] Review authority ${summary.authorityArtifactVersion} validated: ${summary.rolePlaceholderCount} role placeholders, ${summary.gateAuthorityPlaceholderCount} gate authority placeholders, ${summary.separationOfDutiesRuleCount} separation rules, ${summary.reviewerAssignmentCount} reviewer assignments, ${summary.reviewerIdentityCount} reviewer identities, ${summary.auditIdentityCount} audit identities, ${summary.approvedDecisionCount} approved decisions, ${summary.productionApprovalCount} production approvals; policy ${summary.authorityPolicyState}, readiness ${summary.readiness}.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    console.error(`[curriculum] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
