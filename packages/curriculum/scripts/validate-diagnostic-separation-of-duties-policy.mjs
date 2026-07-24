import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "./validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateCanonicalizationDigestPolicy } from "./validate-diagnostic-candidate-canonicalization-digest-policy.mjs";
import { readDiagnosticCandidateDigestRegistry } from "./validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticCandidateIdentityPolicy } from "./validate-diagnostic-candidate-identity-policy.mjs";
import { readDiagnosticReviewActivationPrerequisites } from "./validate-diagnostic-review-activation-prerequisites.mjs";
import { readDiagnosticReviewAuthority } from "./validate-diagnostic-review-authority.mjs";
import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "./validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "./validate-diagnostic-review-gate-rubric.mjs";
import { readDiagnosticReviewWorkflowState } from "./validate-diagnostic-review-workflow-state.mjs";
import {
  readDiagnosticReviewerRoleOwnershipPolicy,
  validateDiagnosticReviewerRoleOwnershipPolicy,
} from "./validate-diagnostic-reviewer-role-ownership-policy.mjs";

const expectedArtifactVersion = "wave-5.slice-6.grade-7-9-math.v1";
const expectedPolicyVersion =
  "wave-5.slice-6.diagnostic-separation-of-duties-enforcement.placeholder.v1";
const expectedActivationArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedRoleOwnershipArtifactVersion = "wave-5.slice-5.grade-7-9-math.v1";
const expectedRoleOwnershipPolicyVersion =
  "wave-5.slice-5.diagnostic-reviewer-role-ownership.placeholder.v1";
const expectedAuthorityArtifactVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedAuthorityPolicyVersion = "wave-4.slice-8.diagnostic-review-authority.placeholder.v1";
const expectedWorkflowArtifactVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedWorkflowVersion = "wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const substantiveRolePlaceholderIds = [
  "METHODOLOGY_REVIEWER_PLACEHOLDER",
  "SAFETY_REVIEWER_PLACEHOLDER",
  "RIGHTS_REVIEWER_PLACEHOLDER",
  "GRADE_PLACEMENT_REVIEWER_PLACEHOLDER",
  "ACCESSIBILITY_REVIEWER_PLACEHOLDER",
];
const decisionRolePlaceholderIds = [
  ...substantiveRolePlaceholderIds,
  "PRODUCTION_APPROVER_PLACEHOLDER",
];
const expectedRoles = new Map([
  ["METHODOLOGY_REVIEWER_PLACEHOLDER", "methodology"],
  ["SAFETY_REVIEWER_PLACEHOLDER", "safety_no_answer"],
  ["RIGHTS_REVIEWER_PLACEHOLDER", "rights_copyright"],
  ["GRADE_PLACEMENT_REVIEWER_PLACEHOLDER", "grade_placement"],
  ["ACCESSIBILITY_REVIEWER_PLACEHOLDER", "accessibility_readability"],
  ["PRODUCTION_APPROVER_PLACEHOLDER", "production_approval"],
  ["AUDIT_OBSERVER_PLACEHOLDER", "audit_observation"],
]);
const expectedDecisionRequirementIds = [
  "incompatible_role_combinations",
  "maker_checker_separation",
  "production_approver_separation",
  "reviewer_self_approval_prohibition",
  "candidate_author_and_reviewer_separation",
  "audit_observer_separation",
  "separation_enforcement_authority",
  "separation_violation_handling",
  "separation_waiver_and_exception_policy",
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
  "immutableDigest",
  "sha256",
  "contentHash",
  "canonicalizedContent",
  "normalizedStem",
];
const protectedRecordFields = [
  "policyDecisionRecords",
  "realCandidateRecords",
  "candidateAuthorshipRecords",
  "digestValueRecords",
  "reviewEvidenceRecords",
  "candidateAuthorIdentityRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "roleAssignmentRecords",
  "reviewerAssignmentRecords",
  "conflictRecords",
  "violationRecords",
  "waiverRecords",
  "exceptionRecords",
  "enforcementAuthorityAssignmentRecords",
  "activeEnforcementRuleRecords",
  "reviewDecisionRecords",
  "approvedDecisionRecords",
  "productionApprovalRecords",
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
export const defaultSeparationOfDutiesPolicyPath = path.resolve(
  scriptDir,
  "../diagnostic-separation-of-duties-policy/grade-7-9-math.separation-of-duties-policy-placeholder.v1.json",
);

export class DiagnosticSeparationOfDutiesPolicyValidationError extends Error {}

function fail(message) {
  throw new DiagnosticSeparationOfDutiesPolicyValidationError(message);
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
    expected.forEach((expectedValue, index) =>
      requireExactValue(actual[index], expectedValue, `${fieldPath}[${index}]`),
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
  if (actual !== expected) {
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
    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      for (const term of forbiddenTerms) {
        if (normalizedKey.includes(term.toLowerCase())) {
          fail(`${fieldPath}.${key} uses forbidden field term ${term}.`);
        }
      }
      scanForbiddenTermsAndPrivateValues(nestedValue, `${fieldPath}.${key}`);
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
  if (/\b[a-f0-9]{32,}\b/i.test(value)) {
    fail(`${fieldPath} contains a hash-like value, which is forbidden in Slice 6.`);
  }
  if (/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(value)) {
    fail(`${fieldPath} contains an email-like value, which is forbidden in Slice 6.`);
  }
  if (/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i.test(value)) {
    fail(`${fieldPath} contains a UUID-like value, which is forbidden in Slice 6.`);
  }
  if (/\b(?:user|account|reviewer)(?:[_:-]?id)?[._:-][a-z0-9_-]*\d[a-z0-9_-]*\b/i.test(value)) {
    fail(`${fieldPath} contains a user-id-like value, which is forbidden in Slice 6.`);
  }
  if (/^dcandidate\.[a-z0-9.-]+\.v[1-9][0-9]*$/i.test(value)) {
    fail(`${fieldPath} contains a concrete candidate ID, which is forbidden in Slice 6.`);
  }
}

function validateUpstreamArtifacts(upstream) {
  const roleOwnershipSummary = validateDiagnosticReviewerRoleOwnershipPolicy(
    upstream.roleOwnershipPolicy,
    upstream.canonicalizationDigestPolicy,
    upstream.identityPolicy,
    upstream.activationPrerequisites,
    upstream.coverage,
    upstream.evidence,
    upstream.rubric,
    upstream.registry,
    upstream.canonicalization,
    upstream.workflow,
    upstream.authority,
  );
  if (
    roleOwnershipSummary.policyArtifactVersion !== expectedRoleOwnershipArtifactVersion ||
    roleOwnershipSummary.policyVersion !== expectedRoleOwnershipPolicyVersion ||
    roleOwnershipSummary.policyState !== "UNRESOLVED_DEFERRED" ||
    roleOwnershipSummary.prerequisiteStatus !== "UNSATISFIED_DEFERRED" ||
    roleOwnershipSummary.activationStatus !== "BLOCKED" ||
    roleOwnershipSummary.reviewWorkflowStatus !== "INACTIVE" ||
    roleOwnershipSummary.readiness !== "NOT_READY" ||
    upstream.activationPrerequisites.metadata.activationPrerequisitesArtifactVersion !==
      expectedActivationArtifactVersion ||
    upstream.authority.metadata.authorityArtifactVersion !== expectedAuthorityArtifactVersion ||
    upstream.authority.authorityPolicy.policyVersion !== expectedAuthorityPolicyVersion ||
    upstream.authority.authorityPolicy.policyState !== "DEFERRED_NON_PRODUCTION" ||
    upstream.workflow.metadata.workflowArtifactVersion !== expectedWorkflowArtifactVersion ||
    upstream.workflow.workflowPolicy.workflowVersion !== expectedWorkflowVersion ||
    upstream.workflow.workflowPolicy.policyState !== "DEFERRED_NON_PRODUCTION"
  ) {
    fail("Upstream artifacts must remain pinned to the blocked Slice 2-5 and Wave 4 baseline.");
  }
  const prerequisite = upstream.activationPrerequisites.prerequisites.find(
    ({ prerequisiteId }) => prerequisiteId === "separation_of_duties_enforcement",
  );
  if (
    !prerequisite ||
    prerequisite.status !== "UNSATISFIED_DEFERRED" ||
    prerequisite.ownerPlaceholderId !== "UNASSIGNED_OWNER_PLACEHOLDER" ||
    prerequisite.evidenceRequirementDescription !==
      "Future fail-closed assignment-time and decision-time independence policy with positive and negative authorization tests." ||
    prerequisite.evidenceRecordRefs.length !== 0
  ) {
    fail("separation_of_duties_enforcement must remain the exact unsatisfied prerequisite.");
  }
  return { roleOwnershipSummary, prerequisite };
}

function expectedTaxonomy(upstream) {
  const taxonomy = upstream.roleOwnershipPolicy.roleTaxonomyPlaceholders.map((role) => ({
    rolePlaceholderId: role.rolePlaceholderId,
    scopeRef: role.scopeRef,
    recordState: "PLACEHOLDER_ONLY",
    identityPolicyReference: null,
    assignmentPolicyReference: null,
    separationEnforcementAllowed: false,
  }));
  if (
    taxonomy.length !== expectedRoles.size ||
    taxonomy.some(
      ({ rolePlaceholderId, scopeRef }) => expectedRoles.get(rolePlaceholderId) !== scopeRef,
    )
  ) {
    fail("Reviewer role taxonomy must remain the exact seven-role placeholder baseline.");
  }
  return taxonomy;
}

function expectedIncompatibleRolePlaceholders(upstream) {
  return upstream.authority.separationOfDutiesRules.map((rule) => ({
    ruleId: rule.ruleId,
    ruleState: "REFERENCE_ONLY_NOT_ENFORCED",
    participantRolePlaceholderIds: rule.participantRolePlaceholderIds,
    upstreamRuleState: "NON_AUTHORIZING_PLACEHOLDER",
    enforcementPolicyReference: null,
    runtimeEvaluationAllowed: false,
    decisionAuthorizationAllowed: false,
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

function buildExpectedArtifact(upstream, roleOwnershipSummary, prerequisite) {
  const expected = {
    metadata: {
      schemaVersion: "learnika.diagnosticSeparationOfDutiesPolicyPlaceholder.v1",
      policyArtifactVersion: expectedArtifactVersion,
      status: "placeholder_only_unsatisfied_non_production",
      artifactKind: "diagnostic_separation_of_duties_policy_placeholder",
      subject: "math",
      locale: "ru-RU",
      audienceGrades: [7, 8, 9],
      activationPrerequisitesArtifactVersion: expectedActivationArtifactVersion,
      reviewerRoleOwnershipPolicyArtifactVersion: expectedRoleOwnershipArtifactVersion,
      reviewAuthorityArtifactVersion: expectedAuthorityArtifactVersion,
      reviewWorkflowStateArtifactVersion: expectedWorkflowArtifactVersion,
      diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
      sourceContract: "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md",
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
      reviewDecisionAuthorizationAllowed: false,
      productionApprovalAllowed: false,
    },
    dependencyReferences: {
      activationPrerequisites: {
        artifactVersion: expectedActivationArtifactVersion,
        artifactStatus: upstream.activationPrerequisites.metadata.status,
        prerequisiteId: prerequisite.prerequisiteId,
        prerequisiteStatus: prerequisite.status,
        activationStatus: upstream.activationPrerequisites.activationBoundary.status,
        reviewWorkflowStatus:
          upstream.activationPrerequisites.activationBoundary.reviewWorkflowStatus,
        prerequisiteCount: upstream.activationPrerequisites.aggregate.prerequisiteCount,
        unsatisfiedPrerequisiteCount:
          upstream.activationPrerequisites.aggregate.unsatisfiedPrerequisiteCount,
        productionApprovalCount: upstream.activationPrerequisites.aggregate.productionApprovalCount,
      },
      reviewerRoleOwnershipPolicy: {
        artifactVersion: expectedRoleOwnershipArtifactVersion,
        policyVersion: expectedRoleOwnershipPolicyVersion,
        policyState: roleOwnershipSummary.policyState,
        prerequisiteStatus: roleOwnershipSummary.prerequisiteStatus,
        rolePlaceholderCount: upstream.roleOwnershipPolicy.aggregate.rolePlaceholderCount,
        roleOwnerCount: upstream.roleOwnershipPolicy.aggregate.roleOwnerCount,
        reviewerIdentityCount: upstream.roleOwnershipPolicy.aggregate.reviewerIdentityCount,
        auditIdentityCount: upstream.roleOwnershipPolicy.aggregate.auditIdentityCount,
        reviewerAssignmentCount: upstream.roleOwnershipPolicy.aggregate.reviewerAssignmentCount,
        activeRoleGrantCount: upstream.roleOwnershipPolicy.aggregate.activeRoleGrantCount,
        approvedDecisionCount: upstream.roleOwnershipPolicy.aggregate.approvedDecisionCount,
        productionApprovalCount: upstream.roleOwnershipPolicy.aggregate.productionApprovalCount,
      },
      reviewAuthority: {
        artifactVersion: expectedAuthorityArtifactVersion,
        policyVersion: expectedAuthorityPolicyVersion,
        policyState: upstream.authority.authorityPolicy.policyState,
        rolePlaceholderCount: upstream.authority.aggregate.rolePlaceholderCount,
        separationOfDutiesRuleCount: upstream.authority.aggregate.separationOfDutiesRuleCount,
        realReviewerRoleCount: upstream.authority.aggregate.realReviewerRoleCount,
        reviewerAssignmentCount: upstream.authority.aggregate.reviewerAssignmentCount,
        reviewerIdentityCount: upstream.authority.aggregate.reviewerIdentityCount,
        auditIdentityCount: upstream.authority.aggregate.auditIdentityCount,
        conflictRecordCount: upstream.authority.aggregate.conflictRecordCount,
        approvedDecisionCount: upstream.authority.aggregate.approvedDecisionCount,
        productionApprovalCount: upstream.authority.aggregate.productionApprovalCount,
      },
      reviewWorkflowState: {
        artifactVersion: expectedWorkflowArtifactVersion,
        workflowVersion: expectedWorkflowVersion,
        policyState: upstream.workflow.workflowPolicy.policyState,
        runtimeActivationAllowed: upstream.workflow.workflowPolicy.runtimeActivationAllowed,
        reviewDecisionCount: upstream.workflow.reviewDecisionRecords.length,
        productionApprovalCount: upstream.workflow.aggregate.productionApprovalCount,
        reviewerIdentityCount: upstream.workflow.aggregate.reviewerIdentityCount,
        auditIdentityCount: upstream.workflow.aggregate.auditIdentityCount,
      },
    },
    prerequisiteReference: {
      prerequisiteId: prerequisite.prerequisiteId,
      status: prerequisite.status,
      ownerPlaceholderId: prerequisite.ownerPlaceholderId,
      evidenceRequirementDescription: prerequisite.evidenceRequirementDescription,
      evidenceRecordRefs: [],
    },
    policyIdentity: {
      policyId: "diagnostic-separation-of-duties-enforcement",
      policyVersion: expectedPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      activeRulesetVersion: null,
      policyApprovalAllowed: false,
      runtimeEnforcementAllowed: false,
      assignmentTimeEnforcementAllowed: false,
      decisionTimeEnforcementAllowed: false,
      reviewDecisionAuthorizationAllowed: false,
      productionApprovalAuthorizationAllowed: false,
    },
    roleTaxonomyPlaceholders: expectedTaxonomy(upstream),
    incompatibleRoleCombinationsPlaceholders: expectedIncompatibleRolePlaceholders(upstream),
    makerCheckerSeparationPlaceholder: {
      requirementId: "maker_checker_separation",
      state: "TO_BE_DECIDED",
      makerActorClassPlaceholder: "CANDIDATE_AUTHOR_ACTOR_PLACEHOLDER",
      checkerActorClassPlaceholder: "SUBSTANTIVE_REVIEWER_ACTOR_PLACEHOLDER",
      identityComparisonPolicyReference: null,
      assignmentEvaluationPolicyReference: null,
      decisionEvaluationPolicyReference: null,
      separationRuleReferences: [],
      assignmentTimeEvaluationAllowed: false,
      decisionTimeEvaluationAllowed: false,
      quorumDeduplicationAllowed: false,
      enforcementAllowed: false,
    },
    productionApproverSeparationPlaceholder: {
      requirementId: "production_approver_separation",
      state: "TO_BE_DECIDED",
      substantiveReviewerRolePlaceholderIds: substantiveRolePlaceholderIds,
      productionApproverRolePlaceholderId: "PRODUCTION_APPROVER_PLACEHOLDER",
      identityComparisonPolicyReference: null,
      separationRuleReferences: [],
      missingGateSubstitutionAllowed: false,
      reviewerProductionApprovalAllowed: false,
      enforcementAllowed: false,
    },
    reviewerSelfApprovalProhibitionPlaceholder: {
      requirementId: "reviewer_self_approval_prohibition",
      state: "TO_BE_DECIDED",
      participantRolePlaceholderIds: decisionRolePlaceholderIds,
      identityComparisonPolicyReference: null,
      prohibitionRuleReferences: [],
      selfReviewAllowed: false,
      selfApprovalAllowed: false,
      enforcementAllowed: false,
    },
    candidateAuthorReviewerSeparationPlaceholder: {
      requirementId: "candidate_author_and_reviewer_separation",
      state: "TO_BE_DECIDED",
      candidateAuthorActorClassPlaceholder: "CANDIDATE_AUTHOR_ACTOR_PLACEHOLDER",
      reviewerActorClassPlaceholder: "SUBSTANTIVE_REVIEWER_ACTOR_PLACEHOLDER",
      authorshipPolicyReference: null,
      identityComparisonPolicyReference: null,
      separationRuleReferences: [],
      candidateAuthorshipRecordingAllowed: false,
      identityComparisonAllowed: false,
      enforcementAllowed: false,
    },
    auditObserverSeparationPlaceholder: {
      requirementId: "audit_observer_separation",
      state: "TO_BE_DECIDED",
      auditObserverRolePlaceholderId: "AUDIT_OBSERVER_PLACEHOLDER",
      decisionRolePlaceholderIds,
      auditIdentityPolicyReference: null,
      identityComparisonPolicyReference: null,
      separationRuleReferences: [],
      auditDecisionAuthorityAllowed: false,
      auditProductionApprovalAllowed: false,
      enforcementAllowed: false,
    },
    enforcementAuthorityPlaceholder: {
      requirementId: "separation_enforcement_authority",
      state: "TO_BE_DECIDED",
      authorityPlaceholderId: "UNASSIGNED_ENFORCEMENT_AUTHORITY_PLACEHOLDER",
      authorityOwnerReference: null,
      authorityAssignmentReference: null,
      enforcementPolicyReference: null,
      activeRuleReferences: [],
      policyApprovalAllowed: false,
      runtimeEnforcementAllowed: false,
      assignmentTimeEvaluationAllowed: false,
      decisionTimeEvaluationAllowed: false,
      decisionAuthorizationAllowed: false,
      productionApprovalAuthorizationAllowed: false,
    },
    violationHandlingPlaceholder: {
      requirementId: "separation_violation_handling",
      state: "TO_BE_DECIDED",
      detectionPolicyReference: null,
      containmentPolicyReference: null,
      invalidationPolicyReference: null,
      remediationPolicyReference: null,
      escalationPolicyReference: null,
      handlingRuleReferences: [],
      violationDetectionAllowed: false,
      violationRecordingAllowed: false,
      containmentAllowed: false,
      decisionInvalidationAllowed: false,
      remediationAllowed: false,
    },
    waiverExceptionPolicyPlaceholder: {
      requirementId: "separation_waiver_and_exception_policy",
      state: "TO_BE_DECIDED",
      waiverPolicyReference: null,
      exceptionPolicyReference: null,
      authorityPolicyReference: null,
      waiverRuleReferences: [],
      exceptionRuleReferences: [],
      waiverRecordingAllowed: false,
      exceptionRecordingAllowed: false,
      separationOverrideAllowed: false,
      missingGateSatisfactionAllowed: false,
      reviewDecisionAuthorizationAllowed: false,
      productionApprovalAuthorizationAllowed: false,
      readinessTransitionAllowed: false,
    },
    decisionRequirements: expectedDecisionRequirementIds.map(unresolvedRequirement),
    recordBoundary: {
      policyDecisionsRecorded: false,
      realCandidatesRecorded: false,
      candidateAuthorshipRecorded: false,
      digestValuesRecorded: false,
      reviewEvidenceRecorded: false,
      candidateAuthorIdentitiesRecorded: false,
      reviewerIdentitiesRecorded: false,
      auditIdentitiesRecorded: false,
      roleAssignmentsRecorded: false,
      reviewerAssignmentsRecorded: false,
      conflictsRecorded: false,
      violationsRecorded: false,
      waiversRecorded: false,
      exceptionsRecorded: false,
      enforcementAuthorityAssignmentsRecorded: false,
      activeEnforcementRulesRecorded: false,
      reviewDecisionsRecorded: false,
      approvedDecisionsRecorded: false,
      productionApprovalsRecorded: false,
      runtimeSeparationEnforcementEnabled: false,
    },
    readiness: {
      policyVersion: expectedReadinessPolicyVersion,
      status: "NOT_READY",
      blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
    },
    aggregate: {
      rolePlaceholderCount: 7,
      incompatibleRulePlaceholderCount: 3,
      decisionRequirementCount: 9,
      undecidedRequirementCount: 9,
      activeIncompatibleRuleCount: 0,
      activeEnforcementRuleCount: 0,
      policyDecisionCount: 0,
      realCandidateCount: 0,
      candidateAuthorshipRecordCount: 0,
      digestValueCount: 0,
      reviewEvidenceRecordCount: 0,
      candidateAuthorIdentityCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      roleAssignmentCount: 0,
      reviewerAssignmentCount: 0,
      conflictRecordCount: 0,
      violationRecordCount: 0,
      waiverRecordCount: 0,
      exceptionRecordCount: 0,
      enforcementAuthorityAssignmentCount: 0,
      reviewDecisionCount: 0,
      approvedDecisionCount: 0,
      productionApprovalCount: 0,
    },
  };
  for (const field of protectedRecordFields) {
    expected[field] = [];
  }
  return expected;
}

export function validateDiagnosticSeparationOfDutiesPolicy(
  artifact,
  roleOwnershipPolicy,
  canonicalizationDigestPolicy,
  identityPolicy,
  activationPrerequisites,
  coverage,
  evidence,
  rubric,
  registry,
  canonicalization,
  workflow,
  authority,
) {
  const upstream = {
    roleOwnershipPolicy,
    canonicalizationDigestPolicy,
    identityPolicy,
    activationPrerequisites,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    authority,
  };
  const { roleOwnershipSummary, prerequisite } = validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  requireExactValue(
    artifact,
    buildExpectedArtifact(upstream, roleOwnershipSummary, prerequisite),
    "$",
  );
  return {
    policyArtifactVersion: artifact.metadata.policyArtifactVersion,
    policyVersion: artifact.policyIdentity.policyVersion,
    policyState: artifact.policyIdentity.policyState,
    prerequisiteStatus: artifact.prerequisiteReference.status,
    rolePlaceholderCount: artifact.aggregate.rolePlaceholderCount,
    incompatibleRulePlaceholderCount: artifact.aggregate.incompatibleRulePlaceholderCount,
    decisionRequirementCount: artifact.aggregate.decisionRequirementCount,
    activeEnforcementRuleCount: artifact.aggregate.activeEnforcementRuleCount,
    reviewerIdentityCount: artifact.aggregate.reviewerIdentityCount,
    reviewerAssignmentCount: artifact.aggregate.reviewerAssignmentCount,
    conflictRecordCount: artifact.aggregate.conflictRecordCount,
    violationRecordCount: artifact.aggregate.violationRecordCount,
    waiverRecordCount: artifact.aggregate.waiverRecordCount,
    approvedDecisionCount: artifact.aggregate.approvedDecisionCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticSeparationOfDutiesPolicy(
  artifactPath = defaultSeparationOfDutiesPolicyPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateSeparationOfDutiesPolicyChangedPaths(changedPaths) {
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

export function validateSeparationOfDutiesPolicyWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateSeparationOfDutiesPolicyChangedPaths(changedPaths);
}

async function readUpstreamArtifacts() {
  const [
    roleOwnershipPolicy,
    canonicalizationDigestPolicy,
    identityPolicy,
    activationPrerequisites,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    authority,
  ] = await Promise.all([
    readDiagnosticReviewerRoleOwnershipPolicy(),
    readDiagnosticCandidateCanonicalizationDigestPolicy(),
    readDiagnosticCandidateIdentityPolicy(),
    readDiagnosticReviewActivationPrerequisites(),
    readDiagnosticReviewCoverage(),
    readDiagnosticReviewEvidence(),
    readDiagnosticReviewGateRubric(),
    readDiagnosticCandidateDigestRegistry(),
    readDiagnosticCandidateCanonicalization(),
    readDiagnosticReviewWorkflowState(),
    readDiagnosticReviewAuthority(),
  ]);
  return {
    roleOwnershipPolicy,
    canonicalizationDigestPolicy,
    identityPolicy,
    activationPrerequisites,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    authority,
  };
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [artifact, upstream] = await Promise.all([
    readDiagnosticSeparationOfDutiesPolicy(),
    readUpstreamArtifacts(),
  ]);
  const summary = validateDiagnosticSeparationOfDutiesPolicy(
    artifact,
    upstream.roleOwnershipPolicy,
    upstream.canonicalizationDigestPolicy,
    upstream.identityPolicy,
    upstream.activationPrerequisites,
    upstream.coverage,
    upstream.evidence,
    upstream.rubric,
    upstream.registry,
    upstream.canonicalization,
    upstream.workflow,
    upstream.authority,
  );
  if (checkWorktreeScope) {
    validateSeparationOfDutiesPolicyWorktreeScope();
  }
  console.log(
    `[curriculum] Separation-of-duties policy ${summary.policyArtifactVersion} validated: ${summary.rolePlaceholderCount} role placeholders, ${summary.incompatibleRulePlaceholderCount} reference-only rules, ${summary.decisionRequirementCount} undecided requirements, ${summary.activeEnforcementRuleCount} active enforcement rules, ${summary.reviewerIdentityCount} reviewer identities, ${summary.reviewerAssignmentCount} reviewer assignments, ${summary.conflictRecordCount} conflicts, ${summary.violationRecordCount} violations, ${summary.waiverRecordCount} waivers, ${summary.approvedDecisionCount} approved decisions, ${summary.productionApprovalCount} production approvals; policy ${summary.policyState}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, readiness ${summary.readiness}.`,
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
