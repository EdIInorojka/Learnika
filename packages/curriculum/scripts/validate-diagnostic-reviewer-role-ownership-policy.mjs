import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "./validate-diagnostic-candidate-canonicalization.mjs";
import {
  readDiagnosticCandidateCanonicalizationDigestPolicy,
  validateDiagnosticCandidateCanonicalizationDigestPolicy,
} from "./validate-diagnostic-candidate-canonicalization-digest-policy.mjs";
import { readDiagnosticCandidateDigestRegistry } from "./validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticCandidateIdentityPolicy } from "./validate-diagnostic-candidate-identity-policy.mjs";
import { readDiagnosticReviewActivationPrerequisites } from "./validate-diagnostic-review-activation-prerequisites.mjs";
import { readDiagnosticReviewAuthority } from "./validate-diagnostic-review-authority.mjs";
import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "./validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "./validate-diagnostic-review-gate-rubric.mjs";
import { readDiagnosticReviewWorkflowState } from "./validate-diagnostic-review-workflow-state.mjs";

const expectedArtifactVersion = "wave-5.slice-5.grade-7-9-math.v1";
const expectedPolicyVersion = "wave-5.slice-5.diagnostic-reviewer-role-ownership.placeholder.v1";
const expectedActivationArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedAuthorityArtifactVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedAuthorityPolicyVersion = "wave-4.slice-8.diagnostic-review-authority.placeholder.v1";
const expectedIdentityArtifactVersion = "wave-5.slice-3.grade-7-9-math.v1";
const expectedCanonicalizationDigestArtifactVersion = "wave-5.slice-4.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const requiredBlockingReasons = new Set(["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"]);
const expectedRoles = new Map([
  ["METHODOLOGY_REVIEWER_PLACEHOLDER", "methodology"],
  ["SAFETY_REVIEWER_PLACEHOLDER", "safety_no_answer"],
  ["RIGHTS_REVIEWER_PLACEHOLDER", "rights_copyright"],
  ["GRADE_PLACEMENT_REVIEWER_PLACEHOLDER", "grade_placement"],
  ["ACCESSIBILITY_REVIEWER_PLACEHOLDER", "accessibility_readability"],
  ["PRODUCTION_APPROVER_PLACEHOLDER", "production_approval"],
  ["AUDIT_OBSERVER_PLACEHOLDER", "audit_observation"],
]);
const expectedDecisionRequirementIds = new Set([
  "accountable_role_ownership",
  "role_eligibility_competence_and_independence",
  "appointment_and_assignment_authority",
  "scope_minimum_counts_quorum_and_decision_aggregation",
  "reviewer_lifecycle_expiry_suspension_and_reassignment",
  "delegation_revocation_and_emergency_coverage",
  "policy_maintenance_and_access_review_ownership",
  "reviewer_and_audit_identity_separation",
]);
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
const approvedSlice12ChangedPaths = new Set([
  "docs/wave-5/diagnostic-readiness-integration-plan-contract.md",
  "docs/wave-5/slice-12-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-readiness-integration-plan/grade-7-9-math.readiness-integration-plan-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
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

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultReviewerRoleOwnershipPolicyPath = path.resolve(
  scriptDir,
  "../diagnostic-reviewer-role-ownership-policy/grade-7-9-math.reviewer-role-ownership-policy-placeholder.v1.json",
);

export class DiagnosticReviewerRoleOwnershipPolicyValidationError extends Error {}

function fail(message) {
  throw new DiagnosticReviewerRoleOwnershipPolicyValidationError(message);
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
  if (typeof value === "string") {
    const normalizedValue = value.toLowerCase();
    for (const term of forbiddenTerms) {
      if (normalizedValue.includes(term.toLowerCase())) {
        fail(`${fieldPath} uses forbidden content term ${term}.`);
      }
    }
    if (/\b[a-f0-9]{32,}\b/i.test(value)) {
      fail(`${fieldPath} contains a hash-like value, which is forbidden in Slice 5.`);
    }
    if (/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(value)) {
      fail(`${fieldPath} contains an email-like value, which is forbidden in Slice 5.`);
    }
    if (
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i.test(value)
    ) {
      fail(`${fieldPath} contains a UUID-like value, which is forbidden in Slice 5.`);
    }
    if (/\b(?:user|account|reviewer)(?:[_:-]?id)?[._:-][a-z0-9_-]*\d[a-z0-9_-]*\b/i.test(value)) {
      fail(`${fieldPath} contains a user-id-like value, which is forbidden in Slice 5.`);
    }
    if (/^dcandidate\.[a-z0-9.-]+\.v[1-9][0-9]*$/i.test(value)) {
      fail(`${fieldPath} contains a concrete candidate ID, which is forbidden in Slice 5.`);
    }
  }
}

function validateUpstreamArtifacts(upstream) {
  const canonicalizationDigestSummary = validateDiagnosticCandidateCanonicalizationDigestPolicy(
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
    canonicalizationDigestSummary.policyArtifactVersion !==
      expectedCanonicalizationDigestArtifactVersion ||
    canonicalizationDigestSummary.policyState !== "UNRESOLVED_DEFERRED" ||
    canonicalizationDigestSummary.prerequisiteStatus !== "UNSATISFIED_DEFERRED" ||
    canonicalizationDigestSummary.activationStatus !== "BLOCKED" ||
    canonicalizationDigestSummary.reviewWorkflowStatus !== "INACTIVE" ||
    canonicalizationDigestSummary.readiness !== "NOT_READY" ||
    upstream.activationPrerequisites.metadata.activationPrerequisitesArtifactVersion !==
      expectedActivationArtifactVersion ||
    upstream.authority.metadata.authorityArtifactVersion !== expectedAuthorityArtifactVersion ||
    upstream.authority.authorityPolicy.policyVersion !== expectedAuthorityPolicyVersion ||
    upstream.authority.authorityPolicy.policyState !== "DEFERRED_NON_PRODUCTION" ||
    upstream.identityPolicy.metadata.policyArtifactVersion !== expectedIdentityArtifactVersion
  ) {
    fail("Upstream artifacts must remain pinned to the blocked Slice 2-4 and Wave 4 baseline.");
  }
  const prerequisite = upstream.activationPrerequisites.prerequisites.find(
    ({ prerequisiteId }) => prerequisiteId === "reviewer_role_ownership",
  );
  if (
    !prerequisite ||
    prerequisite.status !== "UNSATISFIED_DEFERRED" ||
    prerequisite.ownerPlaceholderId !== "UNASSIGNED_OWNER_PLACEHOLDER" ||
    prerequisite.evidenceRequirementDescription !==
      "Future versioned policy for accountable ownership, eligibility, appointment, revocation, scope, minimum counts and quorum." ||
    prerequisite.evidenceRecordRefs.length !== 0
  ) {
    fail("reviewer_role_ownership must remain the exact unsatisfied Slice 2 prerequisite.");
  }
  return { canonicalizationDigestSummary, prerequisite };
}

function expectedMetadata(upstream) {
  return {
    schemaVersion: "learnika.diagnosticReviewerRoleOwnershipPolicyPlaceholder.v1",
    policyArtifactVersion: expectedArtifactVersion,
    status: "placeholder_only_unsatisfied_non_production",
    artifactKind: "diagnostic_reviewer_role_ownership_policy_placeholder",
    subject: "math",
    locale: "ru-RU",
    audienceGrades: [7, 8, 9],
    activationPrerequisitesArtifactVersion:
      upstream.activationPrerequisites.metadata.activationPrerequisitesArtifactVersion,
    reviewAuthorityArtifactVersion: upstream.authority.metadata.authorityArtifactVersion,
    candidateIdentityPolicyArtifactVersion: upstream.identityPolicy.metadata.policyArtifactVersion,
    canonicalizationDigestPolicyArtifactVersion:
      upstream.canonicalizationDigestPolicy.metadata.policyArtifactVersion,
    diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
    sourceContract: "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md",
    productionUseAllowed: false,
    runtimeUseAllowed: false,
    storageAllowed: false,
  };
}

function expectedDependencies(upstream, canonicalizationDigestSummary, prerequisite) {
  const { activationPrerequisites, authority, identityPolicy, canonicalizationDigestPolicy } =
    upstream;
  return {
    activationPrerequisites: {
      artifactVersion: activationPrerequisites.metadata.activationPrerequisitesArtifactVersion,
      artifactStatus: activationPrerequisites.metadata.status,
      prerequisiteId: prerequisite.prerequisiteId,
      prerequisiteStatus: prerequisite.status,
      activationStatus: activationPrerequisites.activationBoundary.status,
      reviewWorkflowStatus: activationPrerequisites.activationBoundary.reviewWorkflowStatus,
      prerequisiteCount: activationPrerequisites.aggregate.prerequisiteCount,
      unsatisfiedPrerequisiteCount: activationPrerequisites.aggregate.unsatisfiedPrerequisiteCount,
      productionApprovalCount: activationPrerequisites.aggregate.productionApprovalCount,
    },
    reviewAuthority: {
      artifactVersion: authority.metadata.authorityArtifactVersion,
      policyVersion: authority.authorityPolicy.policyVersion,
      policyState: authority.authorityPolicy.policyState,
      rolePlaceholderCount: authority.aggregate.rolePlaceholderCount,
      realReviewerRoleCount: authority.aggregate.realReviewerRoleCount,
      reviewerAssignmentCount: authority.aggregate.reviewerAssignmentCount,
      reviewerIdentityCount: authority.aggregate.reviewerIdentityCount,
      auditIdentityCount: authority.aggregate.auditIdentityCount,
      reviewDecisionCount: authority.aggregate.reviewDecisionCount,
      approvedDecisionCount: authority.aggregate.approvedDecisionCount,
      productionApprovalCount: authority.aggregate.productionApprovalCount,
    },
    candidateIdentityPolicy: {
      artifactVersion: identityPolicy.metadata.policyArtifactVersion,
      policyVersion: identityPolicy.policyIdentity.policyVersion,
      policyState: identityPolicy.policyIdentity.policyState,
      prerequisiteStatus: identityPolicy.prerequisiteReference.status,
      realCandidateIdCount: identityPolicy.aggregate.realCandidateIdCount,
      submittedCandidateCount: identityPolicy.aggregate.submittedCandidateCount,
      approvedCandidateCount: identityPolicy.aggregate.approvedCandidateCount,
      productionApprovalCount: identityPolicy.aggregate.productionApprovalCount,
    },
    canonicalizationDigestPolicy: {
      artifactVersion: canonicalizationDigestPolicy.metadata.policyArtifactVersion,
      policyVersion: canonicalizationDigestPolicy.policyIdentity.policyVersion,
      policyState: canonicalizationDigestSummary.policyState,
      prerequisiteStatus: canonicalizationDigestSummary.prerequisiteStatus,
      activeCanonicalizationRuleCount:
        canonicalizationDigestSummary.activeCanonicalizationRuleCount,
      selectedDigestAlgorithmCount: canonicalizationDigestSummary.selectedDigestAlgorithmCount,
      generatedHashCount: canonicalizationDigestSummary.generatedHashCount,
      digestValueCount: canonicalizationDigestSummary.digestValueCount,
      approvedCandidateCount: canonicalizationDigestSummary.approvedCandidateCount,
      productionApprovalCount: canonicalizationDigestSummary.productionApprovalCount,
    },
  };
}

function expectedTaxonomy(upstream) {
  const taxonomy = upstream.authority.roleTaxonomyPlaceholders.map((role) => ({
    rolePlaceholderId: role.rolePlaceholderId,
    scopeRef: role.scopeRef,
    recordState: "PLACEHOLDER_ONLY",
    identityPolicyReference: null,
    assignmentPolicyReference: null,
    reviewDecisionAuthorityAllowed: false,
    productionApprovalAuthorityAllowed: false,
  }));
  if (
    taxonomy.length !== expectedRoles.size ||
    taxonomy.some(
      ({ rolePlaceholderId, scopeRef }) => expectedRoles.get(rolePlaceholderId) !== scopeRef,
    )
  ) {
    fail("Wave 4 role taxonomy must remain the exact seven-role placeholder baseline.");
  }
  return taxonomy;
}

function expectedOwnershipPlaceholders() {
  return [...expectedRoles].map(([rolePlaceholderId, scopeRef]) => ({
    rolePlaceholderId,
    scopeRef,
    state: "TO_BE_DECIDED",
    ownerPlaceholderId: "UNASSIGNED_ROLE_OWNER_PLACEHOLDER",
    roleOwnerReference: null,
    ownerAssignmentReference: null,
    ownershipActive: false,
    roleGrantAllowed: false,
  }));
}

function validateDecisionRequirements(requirements) {
  if (!Array.isArray(requirements) || requirements.length !== expectedDecisionRequirementIds.size) {
    fail(
      `decisionRequirements must contain exactly ${expectedDecisionRequirementIds.size} entries.`,
    );
  }
  const actualIds = new Set();
  for (let index = 0; index < requirements.length; index += 1) {
    const requirement = requirements[index];
    const fieldPath = `decisionRequirements[${index}]`;
    if (!isPlainObject(requirement)) {
      fail(`${fieldPath} must be an object.`);
    }
    requireString(requirement.requirementId, `${fieldPath}.requirementId`);
    if (!expectedDecisionRequirementIds.has(requirement.requirementId)) {
      fail(`${fieldPath}.requirementId is unknown: ${requirement.requirementId}.`);
    }
    if (actualIds.has(requirement.requirementId)) {
      fail(`${fieldPath}.requirementId is duplicated: ${requirement.requirementId}.`);
    }
    actualIds.add(requirement.requirementId);
    requireExactValue(
      requirement,
      {
        requirementId: requirement.requirementId,
        state: "TO_BE_DECIDED",
        decisionReference: null,
        policyReference: null,
        activeRuleReferences: [],
        decisionRecorded: false,
      },
      fieldPath,
    );
  }
  for (const requirementId of expectedDecisionRequirementIds) {
    if (!actualIds.has(requirementId)) {
      fail(`decisionRequirements is missing ${requirementId}.`);
    }
  }
  return actualIds.size;
}

function validateReadiness(readiness, upstream) {
  requireExactValue(
    readiness,
    {
      policyVersion: expectedReadinessPolicyVersion,
      status: "NOT_READY",
      blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
    },
    "readiness",
  );
  if (
    readiness.policyVersion !== upstream.activationPrerequisites.readiness.policyVersion ||
    readiness.policyVersion !== upstream.identityPolicy.readiness.policyVersion ||
    readiness.policyVersion !== upstream.canonicalizationDigestPolicy.readiness.policyVersion ||
    readiness.blockingReasons.length !== requiredBlockingReasons.size ||
    [...requiredBlockingReasons].some((reason) => !readiness.blockingReasons.includes(reason))
  ) {
    fail("readiness must remain pinned to the exact Wave 3 blocked baseline.");
  }
}

function validateEmptyRecordsAndAggregate(artifact, requirementCount) {
  const recordFields = [
    "policyDecisionRecords",
    "roleOwnerRecords",
    "ownerAssignmentRecords",
    "roleEligibilityRecords",
    "assignmentAuthorityRecords",
    "reviewerLifecycleRecords",
    "delegationRecords",
    "revocationRecords",
    "realReviewerRoleRecords",
    "activeRoleGrantRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "reviewerAssignmentRecords",
    "reviewDecisionRecords",
    "approvedDecisionRecords",
    "productionApprovalRecords",
  ];
  for (const field of recordFields) {
    if (!Array.isArray(artifact[field]) || artifact[field].length !== 0) {
      fail(`${field} must remain empty in Slice 5.`);
    }
  }
  requireExactValue(
    artifact.recordBoundary,
    {
      policyDecisionsRecorded: false,
      roleOwnersRecorded: false,
      ownerAssignmentsRecorded: false,
      roleEligibilityRecorded: false,
      assignmentAuthorityRecorded: false,
      reviewerLifecycleRecorded: false,
      delegationsRecorded: false,
      revocationsRecorded: false,
      realReviewerRolesCreated: false,
      activeRoleGrantsRecorded: false,
      reviewerIdentitiesRecorded: false,
      auditIdentitiesRecorded: false,
      reviewerAssignmentsRecorded: false,
      reviewDecisionsRecorded: false,
      approvedDecisionsRecorded: false,
      productionApprovalsRecorded: false,
      runtimeRoleOwnershipEnabled: false,
    },
    "recordBoundary",
  );
  requireExactValue(
    artifact.aggregate,
    {
      rolePlaceholderCount: artifact.roleTaxonomyPlaceholders.length,
      roleOwnershipPlaceholderCount: artifact.roleOwnershipPlaceholders.length,
      decisionRequirementCount: requirementCount,
      undecidedRequirementCount: requirementCount,
      policyDecisionCount: artifact.policyDecisionRecords.length,
      roleOwnerCount: artifact.roleOwnerRecords.length,
      ownerAssignmentCount: artifact.ownerAssignmentRecords.length,
      roleEligibilityRecordCount: artifact.roleEligibilityRecords.length,
      assignmentAuthorityRecordCount: artifact.assignmentAuthorityRecords.length,
      reviewerLifecycleRecordCount: artifact.reviewerLifecycleRecords.length,
      delegationRecordCount: artifact.delegationRecords.length,
      revocationRecordCount: artifact.revocationRecords.length,
      realReviewerRoleCount: artifact.realReviewerRoleRecords.length,
      activeRoleGrantCount: artifact.activeRoleGrantRecords.length,
      reviewerIdentityCount: artifact.reviewerIdentityRecords.length,
      auditIdentityCount: artifact.auditIdentityRecords.length,
      reviewerAssignmentCount: artifact.reviewerAssignmentRecords.length,
      reviewDecisionCount: artifact.reviewDecisionRecords.length,
      approvedDecisionCount: artifact.approvedDecisionRecords.length,
      productionApprovalCount: artifact.productionApprovalRecords.length,
    },
    "aggregate",
  );
}

export function validateDiagnosticReviewerRoleOwnershipPolicy(
  artifact,
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
  if (!isPlainObject(artifact)) {
    fail("Diagnostic reviewer role ownership policy placeholder must be an object.");
  }
  const upstream = {
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
  const { canonicalizationDigestSummary, prerequisite } = validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  const topLevelFields = new Set([
    "metadata",
    "activationBoundary",
    "dependencyReferences",
    "prerequisiteReference",
    "policyIdentity",
    "roleTaxonomyPlaceholders",
    "roleOwnershipPlaceholders",
    "roleEligibilityPlaceholder",
    "assignmentAuthorityPlaceholder",
    "scopeQuorumPlaceholder",
    "reviewerLifecyclePlaceholder",
    "delegationRevocationPlaceholder",
    "auditIdentitySeparationPlaceholder",
    "decisionRequirements",
    "recordBoundary",
    "readiness",
    "aggregate",
    "policyDecisionRecords",
    "roleOwnerRecords",
    "ownerAssignmentRecords",
    "roleEligibilityRecords",
    "assignmentAuthorityRecords",
    "reviewerLifecycleRecords",
    "delegationRecords",
    "revocationRecords",
    "realReviewerRoleRecords",
    "activeRoleGrantRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "reviewerAssignmentRecords",
    "reviewDecisionRecords",
    "approvedDecisionRecords",
    "productionApprovalRecords",
  ]);
  for (const key of Object.keys(artifact)) {
    if (!topLevelFields.has(key)) {
      fail(`$.${key} is an unexpected field.`);
    }
  }
  for (const field of topLevelFields) {
    if (!Object.hasOwn(artifact, field)) {
      fail(`$.${field} is required.`);
    }
  }
  requireExactValue(artifact.metadata, expectedMetadata(upstream), "metadata");
  requireExactValue(
    artifact.activationBoundary,
    {
      status: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      activationAllowed: false,
      reviewWorkflowActivationAllowed: false,
      readinessTransitionAllowed: false,
      productionApprovalAllowed: false,
    },
    "activationBoundary",
  );
  requireExactValue(
    artifact.dependencyReferences,
    expectedDependencies(upstream, canonicalizationDigestSummary, prerequisite),
    "dependencyReferences",
  );
  requireExactValue(artifact.prerequisiteReference, prerequisite, "prerequisiteReference");
  requireExactValue(
    artifact.policyIdentity,
    {
      policyId: "diagnostic-reviewer-role-ownership",
      policyVersion: expectedPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      activeRulesetVersion: null,
      policyApprovalAllowed: false,
      roleOwnershipActivationAllowed: false,
      reviewerAssignmentAllowed: false,
      activeRoleGrantAllowed: false,
      reviewDecisionAuthorityAllowed: false,
      productionApprovalAuthorityAllowed: false,
    },
    "policyIdentity",
  );
  requireExactValue(
    artifact.roleTaxonomyPlaceholders,
    expectedTaxonomy(upstream),
    "roleTaxonomyPlaceholders",
  );
  requireExactValue(
    artifact.roleOwnershipPlaceholders,
    expectedOwnershipPlaceholders(),
    "roleOwnershipPlaceholders",
  );
  requireExactValue(
    artifact.roleEligibilityPlaceholder,
    {
      requirementId: "role_eligibility_competence_and_independence",
      state: "TO_BE_DECIDED",
      eligibilityPolicyReference: null,
      competencePolicyReference: null,
      independencePolicyReference: null,
      criteriaReferences: [],
      eligibilityEvaluationAllowed: false,
    },
    "roleEligibilityPlaceholder",
  );
  requireExactValue(
    artifact.assignmentAuthorityPlaceholder,
    {
      requirementId: "appointment_and_assignment_authority",
      state: "TO_BE_DECIDED",
      appointmentAuthorityPolicyReference: null,
      assignmentAuthorityPolicyReference: null,
      authorityRuleReferences: [],
      appointmentAllowed: false,
      assignmentAllowed: false,
    },
    "assignmentAuthorityPlaceholder",
  );
  requireExactValue(
    artifact.scopeQuorumPlaceholder,
    {
      requirementId: "scope_minimum_counts_quorum_and_decision_aggregation",
      state: "TO_BE_DECIDED",
      scopePolicyReference: null,
      minimumCountPolicyReference: null,
      quorumPolicyReference: null,
      decisionAggregationPolicyReference: null,
      scopeRuleReferences: [],
      quorumEvaluationAllowed: false,
      decisionAggregationAllowed: false,
    },
    "scopeQuorumPlaceholder",
  );
  requireExactValue(
    artifact.reviewerLifecyclePlaceholder,
    {
      requirementId: "reviewer_lifecycle_expiry_suspension_and_reassignment",
      state: "TO_BE_DECIDED",
      appointmentLifecyclePolicyReference: null,
      expiryPolicyReference: null,
      renewalPolicyReference: null,
      suspensionPolicyReference: null,
      reassignmentPolicyReference: null,
      lifecycleRuleReferences: [],
      lifecycleProcessingAllowed: false,
    },
    "reviewerLifecyclePlaceholder",
  );
  requireExactValue(
    artifact.delegationRevocationPlaceholder,
    {
      requirementId: "delegation_revocation_and_emergency_coverage",
      state: "TO_BE_DECIDED",
      delegationPolicyReference: null,
      revocationPolicyReference: null,
      emergencyCoveragePolicyReference: null,
      delegationRuleReferences: [],
      revocationRuleReferences: [],
      delegationAllowed: false,
      revocationProcessingAllowed: false,
      emergencyCoverageAllowed: false,
    },
    "delegationRevocationPlaceholder",
  );
  requireExactValue(
    artifact.auditIdentitySeparationPlaceholder,
    {
      requirementId: "reviewer_and_audit_identity_separation",
      state: "TO_BE_DECIDED",
      reviewerIdentityPolicyReference: null,
      auditIdentityPolicyReference: null,
      separationPolicyReference: null,
      separationRuleReferences: [],
      reviewerIdentityRecordsAllowed: false,
      auditIdentityRecordsAllowed: false,
      identityLinkageAllowed: false,
      separationEnforcementAllowed: false,
    },
    "auditIdentitySeparationPlaceholder",
  );
  const requirementCount = validateDecisionRequirements(artifact.decisionRequirements);
  validateReadiness(artifact.readiness, upstream);
  validateEmptyRecordsAndAggregate(artifact, requirementCount);

  return {
    policyArtifactVersion: artifact.metadata.policyArtifactVersion,
    policyVersion: artifact.policyIdentity.policyVersion,
    policyState: artifact.policyIdentity.policyState,
    prerequisiteStatus: artifact.prerequisiteReference.status,
    rolePlaceholderCount: artifact.aggregate.rolePlaceholderCount,
    decisionRequirementCount: requirementCount,
    roleOwnerCount: artifact.aggregate.roleOwnerCount,
    reviewerIdentityCount: artifact.aggregate.reviewerIdentityCount,
    reviewerAssignmentCount: artifact.aggregate.reviewerAssignmentCount,
    activeRoleGrantCount: artifact.aggregate.activeRoleGrantCount,
    approvedDecisionCount: artifact.aggregate.approvedDecisionCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticReviewerRoleOwnershipPolicy(
  artifactPath = defaultReviewerRoleOwnershipPolicyPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateReviewerRoleOwnershipPolicyChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (!approvedSlice12ChangedPaths.has(changedPath)) {
      fail(`Wave 5 Slice 12 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateReviewerRoleOwnershipPolicyWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateReviewerRoleOwnershipPolicyChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [
    artifact,
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
  const summary = validateDiagnosticReviewerRoleOwnershipPolicy(
    artifact,
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
  );
  if (checkWorktreeScope) {
    validateReviewerRoleOwnershipPolicyWorktreeScope();
  }
  console.log(
    `[curriculum] Reviewer role ownership policy ${summary.policyArtifactVersion} validated: ${summary.rolePlaceholderCount} role placeholders, ${summary.decisionRequirementCount} undecided requirements, ${summary.roleOwnerCount} role owners, ${summary.reviewerIdentityCount} reviewer identities, ${summary.reviewerAssignmentCount} reviewer assignments, ${summary.activeRoleGrantCount} active role grants, ${summary.approvedDecisionCount} approved decisions, ${summary.productionApprovalCount} production approvals; policy ${summary.policyState}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, readiness ${summary.readiness}.`,
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
