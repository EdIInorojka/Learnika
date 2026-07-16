import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "./validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateCanonicalizationDigestPolicy } from "./validate-diagnostic-candidate-canonicalization-digest-policy.mjs";
import { readDiagnosticCandidateDigestRegistry } from "./validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticCandidateIdentityPolicy } from "./validate-diagnostic-candidate-identity-policy.mjs";
import {
  readDiagnosticConflictOfInterestPolicy,
  validateDiagnosticConflictOfInterestPolicy,
} from "./validate-diagnostic-conflict-of-interest-policy.mjs";
import { readDiagnosticReviewActivationPrerequisites } from "./validate-diagnostic-review-activation-prerequisites.mjs";
import { readDiagnosticReviewAuthority } from "./validate-diagnostic-review-authority.mjs";
import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "./validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "./validate-diagnostic-review-gate-rubric.mjs";
import { readDiagnosticReviewWorkflowState } from "./validate-diagnostic-review-workflow-state.mjs";
import { readDiagnosticReviewerRoleOwnershipPolicy } from "./validate-diagnostic-reviewer-role-ownership-policy.mjs";
import { readDiagnosticSeparationOfDutiesPolicy } from "./validate-diagnostic-separation-of-duties-policy.mjs";

const expectedArtifactVersion = "wave-5.slice-8.grade-7-9-math.v1";
const expectedPolicyVersion = "wave-5.slice-8.diagnostic-audit-identity.placeholder.v1";
const expectedActivationArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedRoleOwnershipArtifactVersion = "wave-5.slice-5.grade-7-9-math.v1";
const expectedRoleOwnershipPolicyVersion =
  "wave-5.slice-5.diagnostic-reviewer-role-ownership.placeholder.v1";
const expectedSeparationArtifactVersion = "wave-5.slice-6.grade-7-9-math.v1";
const expectedSeparationPolicyVersion =
  "wave-5.slice-6.diagnostic-separation-of-duties-enforcement.placeholder.v1";
const expectedConflictArtifactVersion = "wave-5.slice-7.grade-7-9-math.v1";
const expectedConflictPolicyVersion =
  "wave-5.slice-7.diagnostic-conflict-of-interest.placeholder.v1";
const expectedAuthorityArtifactVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedAuthorityPolicyVersion = "wave-4.slice-8.diagnostic-review-authority.placeholder.v1";
const expectedWorkflowArtifactVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedWorkflowVersion = "wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";

const expectedRoles = new Map([
  ["METHODOLOGY_REVIEWER_PLACEHOLDER", "methodology"],
  ["SAFETY_REVIEWER_PLACEHOLDER", "safety_no_answer"],
  ["RIGHTS_REVIEWER_PLACEHOLDER", "rights_copyright"],
  ["GRADE_PLACEMENT_REVIEWER_PLACEHOLDER", "grade_placement"],
  ["ACCESSIBILITY_REVIEWER_PLACEHOLDER", "accessibility_readability"],
  ["PRODUCTION_APPROVER_PLACEHOLDER", "production_approval"],
  ["AUDIT_OBSERVER_PLACEHOLDER", "audit_observation"],
]);
const substantiveRolePlaceholderIds = [...expectedRoles.keys()].slice(0, 5);
const reviewDecisionRolePlaceholderIds = [...expectedRoles.keys()].slice(0, 6);
const expectedAuditActors = [
  {
    actorPlaceholderId: "SUBSTANTIVE_REVIEWER_AUDIT_ACTOR_PLACEHOLDER",
    actorScope: "substantive_reviewer_audit_subject",
    rolePlaceholderIds: substantiveRolePlaceholderIds,
  },
  {
    actorPlaceholderId: "PRODUCTION_APPROVER_AUDIT_ACTOR_PLACEHOLDER",
    actorScope: "production_approver_audit_subject",
    rolePlaceholderIds: ["PRODUCTION_APPROVER_PLACEHOLDER"],
  },
  {
    actorPlaceholderId: "AUDIT_OBSERVER_AUDIT_ACTOR_PLACEHOLDER",
    actorScope: "audit_observer",
    rolePlaceholderIds: ["AUDIT_OBSERVER_PLACEHOLDER"],
  },
];
const expectedDecisionRequirementIds = [
  "audit_actor_taxonomy",
  "audit_identity_binding",
  "pseudonymous_audit_reference",
  "reviewer_identity_separation",
  "audit_event_attribution",
  "audit_retention",
  "audit_access_control",
  "audit_redaction_and_privacy",
  "audit_export_and_review",
  "late_correction_and_amendment",
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
];
const protectedRecordFields = [
  "policyDecisionRecords",
  "realCandidateRecords",
  "digestValueRecords",
  "reviewEvidenceRecords",
  "realPrincipalRecords",
  "accountRecords",
  "serviceAccountRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "identityBindingRecords",
  "identityAliasRecords",
  "identityLookupRecords",
  "accessGrantRecords",
  "authorizationSnapshotRecords",
  "roleAssignmentRecords",
  "reviewerAssignmentRecords",
  "identityExpiryRecords",
  "identityRevocationRecords",
  "identityTombstoneRecords",
  "auditLogRecords",
  "auditEventRecords",
  "eventAttributionRecords",
  "auditAccessLogRecords",
  "auditExportRecords",
  "auditReviewRecords",
  "auditCorrectionRecords",
  "auditAmendmentRecords",
  "conflictRecords",
  "disclosureRecords",
  "recusalRecords",
  "waiverRecords",
  "exceptionRecords",
  "reviewDecisionRecords",
  "approvedDecisionRecords",
  "productionApprovalRecords",
];
const approvedSlice8ChangedPaths = new Set([
  "docs/wave-5/diagnostic-audit-identity-policy-contract.md",
  "docs/wave-5/slice-8-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
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
export const defaultAuditIdentityPolicyPath = path.resolve(
  scriptDir,
  "../diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
);

export class DiagnosticAuditIdentityPolicyValidationError extends Error {}

function fail(message) {
  throw new DiagnosticAuditIdentityPolicyValidationError(message);
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
    [
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
      "UUID-like value",
    ],
    [/\buser[-_:]?[a-z0-9]{6,}\b/i, "user-id-like value"],
    [/\bservice[-_]?account[-_:]?[a-z0-9]{4,}\b/i, "service-account-like value"],
    [/\baccount[-_:]?[a-z0-9]{6,}\b/i, "account-id-like value"],
    [
      /\b(?:reviewer|principal|subject|employee)[-_:]?[a-z0-9]{6,}\b/i,
      "private identity-like value",
    ],
    [/\bdcandidate\.[a-z0-9.-]+\b/i, "concrete candidate ID"],
    [/\b[0-9a-f]{32,}\b/i, "hash-like value"],
    [/\b(?:token|credential|secret|session)[-_:][a-z0-9._-]{6,}\b/i, "credential-like value"],
    [/\b(?:\d{1,3}\.){3}\d{1,3}\b/, "IP-address-like value"],
  ];
  for (const [pattern, label] of privatePatterns) {
    if (pattern.test(value)) {
      fail(`${fieldPath} contains a ${label}.`);
    }
  }
}

function expectedRoleTaxonomy() {
  return [...expectedRoles].map(([rolePlaceholderId, scopeRef]) => ({
    rolePlaceholderId,
    scopeRef,
    recordState: "PLACEHOLDER_ONLY",
    identityPolicyReference: null,
    assignmentPolicyReference: null,
    identityLookupAllowed: false,
    auditDecisionAuthorityAllowed: false,
    reviewDecisionAuthorityAllowed: false,
    productionApprovalAuthorityAllowed: false,
  }));
}

function expectedAuditActorTaxonomy() {
  return expectedAuditActors.map((actor) => ({
    ...actor,
    recordState: "PLACEHOLDER_ONLY",
    identityDomainReference: null,
    referenceFormat: null,
    bindingPolicyReference: null,
    authorizationPolicyReference: null,
    realPrincipalAllowed: false,
    accountBindingAllowed: false,
    auditEventProductionAllowed: false,
    identityLookupAllowed: false,
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

function findAuditPrerequisite(activationPrerequisites) {
  const matches = activationPrerequisites.prerequisites.filter(
    (item) => item.prerequisiteId === "audit_identity_policy",
  );
  if (matches.length !== 1) {
    fail("Activation prerequisites must contain exactly one audit_identity_policy row.");
  }
  const expected = {
    prerequisiteId: "audit_identity_policy",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future opaque identity binding, authorization, revocation, controlled lookup, access and privacy policy with synthetic validation.",
    evidenceRecordRefs: [],
  };
  requireExactValue(matches[0], expected, "activationPrerequisites.audit_identity_policy");
  return matches[0];
}

function validateUpstreamArtifacts(upstream) {
  const conflictSummary = validateDiagnosticConflictOfInterestPolicy(
    upstream.conflictPolicy,
    upstream.separationPolicy,
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
  requireExactValue(
    conflictSummary,
    {
      policyArtifactVersion: expectedConflictArtifactVersion,
      policyVersion: expectedConflictPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      rolePlaceholderCount: 7,
      conflictCategoryPlaceholderCount: 7,
      decisionRequirementCount: 10,
      activeConflictRuleCount: 0,
      reviewerIdentityCount: 0,
      reviewerAssignmentCount: 0,
      conflictRecordCount: 0,
      disclosureRecordCount: 0,
      recusalRecordCount: 0,
      waiverRecordCount: 0,
      approvedDecisionCount: 0,
      productionApprovalCount: 0,
      activationStatus: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      readiness: "NOT_READY",
    },
    "conflictSummary",
  );
  return { conflictSummary, prerequisite: findAuditPrerequisite(upstream.activationPrerequisites) };
}

function buildExpectedArtifact(upstream, conflictSummary, prerequisite) {
  const roleAggregate = upstream.roleOwnershipPolicy.aggregate;
  const separationAggregate = upstream.separationPolicy.aggregate;
  const authorityIdentity = upstream.authority.identityPolicyDeferrals;
  const workflowIdentity = upstream.workflow.identityPolicyDeferrals;
  const expected = {
    metadata: {
      schemaVersion: "learnika.diagnosticAuditIdentityPolicyPlaceholder.v1",
      policyArtifactVersion: expectedArtifactVersion,
      status: "placeholder_only_unsatisfied_non_production",
      artifactKind: "diagnostic_audit_identity_policy_placeholder",
      subject: "math",
      locale: "ru-RU",
      audienceGrades: [7, 8, 9],
      activationPrerequisitesArtifactVersion: expectedActivationArtifactVersion,
      reviewerRoleOwnershipPolicyArtifactVersion: expectedRoleOwnershipArtifactVersion,
      separationOfDutiesPolicyArtifactVersion: expectedSeparationArtifactVersion,
      conflictOfInterestPolicyArtifactVersion: expectedConflictArtifactVersion,
      reviewAuthorityArtifactVersion: expectedAuthorityArtifactVersion,
      reviewWorkflowStateArtifactVersion: expectedWorkflowArtifactVersion,
      diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
      sourceContract: "docs/wave-5/diagnostic-audit-identity-policy-contract.md",
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
        policyState: upstream.roleOwnershipPolicy.policyIdentity.policyState,
        prerequisiteStatus: upstream.roleOwnershipPolicy.prerequisiteReference.status,
        rolePlaceholderCount: roleAggregate.rolePlaceholderCount,
        roleOwnerCount: roleAggregate.roleOwnerCount,
        reviewerIdentityCount: roleAggregate.reviewerIdentityCount,
        auditIdentityCount: roleAggregate.auditIdentityCount,
        reviewerAssignmentCount: roleAggregate.reviewerAssignmentCount,
        approvedDecisionCount: roleAggregate.approvedDecisionCount,
        productionApprovalCount: roleAggregate.productionApprovalCount,
      },
      separationOfDutiesPolicy: {
        artifactVersion: expectedSeparationArtifactVersion,
        policyVersion: expectedSeparationPolicyVersion,
        policyState: upstream.separationPolicy.policyIdentity.policyState,
        prerequisiteStatus: upstream.separationPolicy.prerequisiteReference.status,
        rolePlaceholderCount: separationAggregate.rolePlaceholderCount,
        activeEnforcementRuleCount: separationAggregate.activeEnforcementRuleCount,
        reviewerIdentityCount: separationAggregate.reviewerIdentityCount,
        auditIdentityCount: separationAggregate.auditIdentityCount,
        reviewerAssignmentCount: separationAggregate.reviewerAssignmentCount,
        approvedDecisionCount: separationAggregate.approvedDecisionCount,
        productionApprovalCount: separationAggregate.productionApprovalCount,
      },
      conflictOfInterestPolicy: {
        artifactVersion: expectedConflictArtifactVersion,
        policyVersion: expectedConflictPolicyVersion,
        policyState: conflictSummary.policyState,
        prerequisiteStatus: conflictSummary.prerequisiteStatus,
        rolePlaceholderCount: conflictSummary.rolePlaceholderCount,
        activeConflictRuleCount: conflictSummary.activeConflictRuleCount,
        reviewerIdentityCount: conflictSummary.reviewerIdentityCount,
        auditIdentityCount: upstream.conflictPolicy.aggregate.auditIdentityCount,
        reviewerAssignmentCount: conflictSummary.reviewerAssignmentCount,
        conflictRecordCount: conflictSummary.conflictRecordCount,
        disclosureRecordCount: conflictSummary.disclosureRecordCount,
        recusalRecordCount: conflictSummary.recusalRecordCount,
        waiverRecordCount: conflictSummary.waiverRecordCount,
        approvedDecisionCount: conflictSummary.approvedDecisionCount,
        productionApprovalCount: conflictSummary.productionApprovalCount,
      },
      reviewAuthority: {
        artifactVersion: expectedAuthorityArtifactVersion,
        policyVersion: expectedAuthorityPolicyVersion,
        policyState: upstream.authority.authorityPolicy.policyState,
        reviewerIdentityStatus: authorityIdentity.reviewerIdentity.status,
        reviewerIdentityPolicyVersion: authorityIdentity.reviewerIdentity.policyVersion,
        reviewerIdentityReferenceFormat: authorityIdentity.reviewerIdentity.referenceFormat,
        reviewerIdentityRecordsAllowed: authorityIdentity.reviewerIdentity.identityRecordsAllowed,
        auditIdentityStatus: authorityIdentity.auditIdentity.status,
        auditIdentityPolicyVersion: authorityIdentity.auditIdentity.policyVersion,
        auditIdentityReferenceFormat: authorityIdentity.auditIdentity.referenceFormat,
        auditIdentityRecordsAllowed: authorityIdentity.auditIdentity.identityRecordsAllowed,
        reviewerIdentityCount: upstream.authority.aggregate.reviewerIdentityCount,
        auditIdentityCount: upstream.authority.aggregate.auditIdentityCount,
        reviewerAssignmentCount: upstream.authority.aggregate.reviewerAssignmentCount,
        approvedDecisionCount: upstream.authority.aggregate.approvedDecisionCount,
        productionApprovalCount: upstream.authority.aggregate.productionApprovalCount,
      },
      reviewWorkflowState: {
        artifactVersion: expectedWorkflowArtifactVersion,
        workflowVersion: expectedWorkflowVersion,
        policyState: upstream.workflow.workflowPolicy.policyState,
        runtimeActivationAllowed: upstream.workflow.workflowPolicy.runtimeActivationAllowed,
        reviewerIdentityStatus: workflowIdentity.reviewerIdentity.status,
        reviewerIdentityPolicyVersion: workflowIdentity.reviewerIdentity.policyVersion,
        reviewerIdentityReferenceFormat: workflowIdentity.reviewerIdentity.referenceFormat,
        auditIdentityStatus: workflowIdentity.auditIdentity.status,
        auditIdentityPolicyVersion: workflowIdentity.auditIdentity.policyVersion,
        auditIdentityReferenceFormat: workflowIdentity.auditIdentity.referenceFormat,
        reviewerIdentityCount: upstream.workflow.aggregate.reviewerIdentityCount,
        auditIdentityCount: upstream.workflow.aggregate.auditIdentityCount,
        approvedDecisionCount: upstream.workflow.aggregate.approvedDecisionCount,
        productionApprovalCount: upstream.workflow.aggregate.productionApprovalCount,
      },
    },
    prerequisiteReference: { ...prerequisite, evidenceRecordRefs: [] },
    policyIdentity: {
      policyId: "diagnostic-audit-identity",
      policyVersion: expectedPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      activeRulesetVersion: null,
      policyApprovalAllowed: false,
      auditActorTaxonomyApprovalAllowed: false,
      auditIdentityBindingAllowed: false,
      pseudonymousReferenceIssuanceAllowed: false,
      auditEventAttributionAllowed: false,
      auditRecordingAllowed: false,
      runtimeLookupAllowed: false,
      reviewDecisionAuthorizationAllowed: false,
      productionApprovalAuthorizationAllowed: false,
    },
    roleTaxonomyPlaceholders: expectedRoleTaxonomy(),
    auditActorTaxonomyPlaceholders: expectedAuditActorTaxonomy(),
    auditIdentityBindingPlaceholder: {
      requirementId: "audit_identity_binding",
      state: "TO_BE_DECIDED",
      principalProofingPolicyReference: null,
      bindingAuthorityPolicyReference: null,
      authorizedRoleBindingPolicyReference: null,
      uniquenessPolicyReference: null,
      nonReusePolicyReference: null,
      aliasPolicyReference: null,
      revocationPolicyReference: null,
      historicalTraceabilityPolicyReference: null,
      bindingRuleReferences: [],
      identityAllocationAllowed: false,
      principalBindingAllowed: false,
      accountBindingAllowed: false,
      identityProofingAllowed: false,
      aliasRecordingAllowed: false,
      controlledLookupAllowed: false,
      revocationAllowed: false,
      historicalLookupAllowed: false,
      runtimeEnforcementAllowed: false,
    },
    pseudonymousAuditReferencePlaceholder: {
      requirementId: "pseudonymous_audit_reference",
      state: "TO_BE_DECIDED",
      namespaceReference: null,
      referenceFormat: null,
      formatVersion: null,
      allocationPolicyReference: null,
      rotationPolicyReference: null,
      retirementPolicyReference: null,
      lookupPolicyReference: null,
      referenceRuleReferences: [],
      opaqueReferenceIssuanceAllowed: false,
      pseudonymousReferenceIssuanceAllowed: false,
      realIdentityEmbeddingAllowed: false,
      rawAccountReferenceEmbeddingAllowed: false,
      reversibleEncodingAllowed: false,
      controlledLookupAllowed: false,
    },
    reviewerIdentitySeparationPlaceholder: {
      requirementId: "reviewer_identity_separation",
      state: "TO_BE_DECIDED",
      auditObserverRolePlaceholderId: "AUDIT_OBSERVER_PLACEHOLDER",
      reviewDecisionRolePlaceholderIds,
      reviewerIdentityPolicyReference: null,
      auditIdentityPolicyReference: null,
      identityComparisonPolicyReference: null,
      separationRuleReferences: [],
      crossDomainLinkageAllowed: false,
      identityDomainSubstitutionAllowed: false,
      runtimeIdentityComparisonAllowed: false,
      auditObserverReviewDecisionAllowed: false,
      auditObserverProductionApprovalAllowed: false,
    },
    auditEventAttributionPlaceholder: {
      requirementId: "audit_event_attribution",
      state: "TO_BE_DECIDED",
      eventSchemaReference: null,
      attributionPolicyReference: null,
      authorizationSnapshotPolicyReference: null,
      sourceClassificationPolicyReference: null,
      timestampPolicyReference: null,
      integrityPolicyReference: null,
      attributionRuleReferences: [],
      auditLogRecordingAllowed: false,
      auditEventRecordingAllowed: false,
      realAuditIdentityAttributionAllowed: false,
      reviewerIdentityAttributionAllowed: false,
      authorizationSnapshotRecordingAllowed: false,
      runtimeEventGenerationAllowed: false,
    },
    auditRetentionPlaceholder: {
      requirementId: "audit_retention",
      state: "TO_BE_DECIDED",
      storagePolicyReference: null,
      retentionPolicyReference: null,
      deletionPolicyReference: null,
      legalHoldPolicyReference: null,
      tombstonePolicyReference: null,
      historicalTraceabilityPolicyReference: null,
      retentionRuleReferences: [],
      auditStorageAllowed: false,
      retentionEnforcementAllowed: false,
      deletionExecutionAllowed: false,
      legalHoldAllowed: false,
      tombstoneRecordingAllowed: false,
    },
    auditAccessControlPlaceholder: {
      requirementId: "audit_access_control",
      state: "TO_BE_DECIDED",
      accessPolicyReference: null,
      lookupAuthorizationPolicyReference: null,
      leastPrivilegePolicyReference: null,
      emergencyAccessPolicyReference: null,
      accessAuditPolicyReference: null,
      accessRuleReferences: [],
      controlledLookupAllowed: false,
      bulkLookupAllowed: false,
      emergencyAccessAllowed: false,
      accessGrantRecordingAllowed: false,
      accessAuditRecordingAllowed: false,
      runtimeAuthorizationAllowed: false,
    },
    auditRedactionPrivacyPlaceholder: {
      requirementId: "audit_redaction_and_privacy",
      state: "TO_BE_DECIDED",
      personalDataClassificationPolicyReference: null,
      dataMinimizationPolicyReference: null,
      redactionPolicyReference: null,
      authorizedDisclosurePolicyReference: null,
      ordinaryCurriculumStoragePolicyReference: null,
      privacyRuleReferences: [],
      personalDetailsRecordingAllowed: false,
      rawAccountReferenceRecordingAllowed: false,
      authenticationMaterialRecordingAllowed: false,
      networkDeviceDataRecordingAllowed: false,
      ordinaryCurriculumStorageAllowed: false,
      runtimeRedactionAllowed: false,
    },
    auditExportReviewPlaceholder: {
      requirementId: "audit_export_and_review",
      state: "TO_BE_DECIDED",
      exportSchemaReference: null,
      exportPolicyReference: null,
      recipientEligibilityPolicyReference: null,
      auditReviewPolicyReference: null,
      reconciliationPolicyReference: null,
      integrityPolicyReference: null,
      exportRuleReferences: [],
      auditExportAllowed: false,
      auditReviewAllowed: false,
      reconciliationAllowed: false,
      bulkDisclosureAllowed: false,
      productionDecisionAuthorizationAllowed: false,
    },
    lateCorrectionAmendmentPlaceholder: {
      requirementId: "late_correction_and_amendment",
      state: "TO_BE_DECIDED",
      correctionPolicyReference: null,
      amendmentSchemaReference: null,
      amendmentAttributionPolicyReference: null,
      amendmentApprovalPolicyReference: null,
      historicalPreservationPolicyReference: null,
      correctionRuleReferences: [],
      silentMutationAllowed: false,
      correctionRecordingAllowed: false,
      amendmentRecordingAllowed: false,
      historicalRecordReplacementAllowed: false,
      reviewDecisionChangeAllowed: false,
      productionApprovalChangeAllowed: false,
    },
    decisionRequirements: expectedDecisionRequirementIds.map(unresolvedRequirement),
    recordBoundary: {
      policyDecisionsRecorded: false,
      realCandidatesRecorded: false,
      digestValuesRecorded: false,
      reviewEvidenceRecorded: false,
      realPrincipalsRecorded: false,
      accountsRecorded: false,
      serviceAccountsRecorded: false,
      reviewerIdentitiesRecorded: false,
      auditIdentitiesRecorded: false,
      identityBindingsRecorded: false,
      identityAliasesRecorded: false,
      identityLookupsRecorded: false,
      accessGrantsRecorded: false,
      authorizationSnapshotsRecorded: false,
      roleAssignmentsRecorded: false,
      reviewerAssignmentsRecorded: false,
      identityExpiryRecorded: false,
      identityRevocationsRecorded: false,
      identityTombstonesRecorded: false,
      auditLogsRecorded: false,
      auditEventsRecorded: false,
      eventAttributionsRecorded: false,
      auditAccessLogsRecorded: false,
      auditExportsRecorded: false,
      auditReviewsRecorded: false,
      auditCorrectionsRecorded: false,
      auditAmendmentsRecorded: false,
      conflictsRecorded: false,
      disclosuresRecorded: false,
      recusalsRecorded: false,
      waiversRecorded: false,
      exceptionsRecorded: false,
      reviewDecisionsRecorded: false,
      approvedDecisionsRecorded: false,
      productionApprovalsRecorded: false,
      runtimeAuditIdentityEnabled: false,
      runtimeAuditLoggingEnabled: false,
    },
    readiness: {
      policyVersion: expectedReadinessPolicyVersion,
      status: "NOT_READY",
      blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
    },
    aggregate: {
      rolePlaceholderCount: 7,
      auditActorPlaceholderCount: 3,
      decisionRequirementCount: 10,
      undecidedRequirementCount: 10,
      activeIdentityRuleCount: 0,
      policyDecisionCount: 0,
      realCandidateCount: 0,
      digestValueCount: 0,
      reviewEvidenceRecordCount: 0,
      realPrincipalCount: 0,
      accountRecordCount: 0,
      serviceAccountRecordCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      identityBindingCount: 0,
      identityAliasCount: 0,
      identityLookupCount: 0,
      accessGrantCount: 0,
      authorizationSnapshotCount: 0,
      roleAssignmentCount: 0,
      reviewerAssignmentCount: 0,
      identityExpiryRecordCount: 0,
      identityRevocationRecordCount: 0,
      identityTombstoneRecordCount: 0,
      auditLogCount: 0,
      auditEventCount: 0,
      eventAttributionCount: 0,
      auditAccessLogCount: 0,
      auditExportCount: 0,
      auditReviewCount: 0,
      auditCorrectionCount: 0,
      auditAmendmentCount: 0,
      conflictRecordCount: 0,
      disclosureRecordCount: 0,
      recusalRecordCount: 0,
      waiverRecordCount: 0,
      exceptionRecordCount: 0,
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

export function validateDiagnosticAuditIdentityPolicy(artifact, upstream) {
  if (!isPlainObject(upstream)) {
    fail("Upstream artifacts must be provided as an object.");
  }
  const { conflictSummary, prerequisite } = validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  requireExactValue(artifact, buildExpectedArtifact(upstream, conflictSummary, prerequisite), "$");
  return {
    policyArtifactVersion: artifact.metadata.policyArtifactVersion,
    policyVersion: artifact.policyIdentity.policyVersion,
    policyState: artifact.policyIdentity.policyState,
    prerequisiteStatus: artifact.prerequisiteReference.status,
    rolePlaceholderCount: artifact.aggregate.rolePlaceholderCount,
    auditActorPlaceholderCount: artifact.aggregate.auditActorPlaceholderCount,
    decisionRequirementCount: artifact.aggregate.decisionRequirementCount,
    activeIdentityRuleCount: artifact.aggregate.activeIdentityRuleCount,
    realPrincipalCount: artifact.aggregate.realPrincipalCount,
    accountRecordCount: artifact.aggregate.accountRecordCount,
    reviewerIdentityCount: artifact.aggregate.reviewerIdentityCount,
    auditIdentityCount: artifact.aggregate.auditIdentityCount,
    identityBindingCount: artifact.aggregate.identityBindingCount,
    auditLogCount: artifact.aggregate.auditLogCount,
    auditEventCount: artifact.aggregate.auditEventCount,
    approvedDecisionCount: artifact.aggregate.approvedDecisionCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticAuditIdentityPolicy(
  artifactPath = defaultAuditIdentityPolicyPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticAuditIdentityPolicyUpstreamArtifacts() {
  const [
    conflictPolicy,
    separationPolicy,
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
    readDiagnosticConflictOfInterestPolicy(),
    readDiagnosticSeparationOfDutiesPolicy(),
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
    conflictPolicy,
    separationPolicy,
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

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateAuditIdentityPolicyChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (!approvedSlice8ChangedPaths.has(changedPath)) {
      fail(`Wave 5 Slice 8 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateAuditIdentityPolicyWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateAuditIdentityPolicyChangedPaths(changedPaths);
}

async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticAuditIdentityPolicy(),
    readDiagnosticAuditIdentityPolicyUpstreamArtifacts(),
  ]);
  const summary = validateDiagnosticAuditIdentityPolicy(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    validateAuditIdentityPolicyWorktreeScope();
  }
  console.log(
    `[curriculum] Audit identity policy ${summary.policyArtifactVersion} validated: ${summary.rolePlaceholderCount} role placeholders, ${summary.auditActorPlaceholderCount} audit actor placeholders, ${summary.decisionRequirementCount} undecided requirements, ${summary.activeIdentityRuleCount} active identity rules, ${summary.realPrincipalCount} real principals, ${summary.accountRecordCount} accounts, ${summary.reviewerIdentityCount} reviewer identities, ${summary.auditIdentityCount} audit identities, ${summary.identityBindingCount} identity bindings, ${summary.auditLogCount} audit logs, ${summary.auditEventCount} audit events, ${summary.approvedDecisionCount} approved decisions, ${summary.productionApprovalCount} production approvals; policy ${summary.policyState}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, readiness ${summary.readiness}.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`[curriculum] ${error.message}`);
    process.exitCode = 1;
  });
}
