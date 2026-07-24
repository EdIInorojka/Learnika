import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const expectedProposalArtifactVersion = "wave-6.slice-6.grade-7-9-math.v1";
const expectedProposalVersion = "wave-6.slice-6.diagnostic-audit-identity-policy.proposal.v1";
const expectedActivationVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedAuditPlaceholderVersion = "wave-5.slice-8.grade-7-9-math.v1";
const expectedAuditPolicyVersion = "wave-5.slice-8.diagnostic-audit-identity.placeholder.v1";
const expectedRoleProposalVersion = "wave-6.slice-3.grade-7-9-math.v1";
const expectedSeparationProposalVersion = "wave-6.slice-4.grade-7-9-math.v1";
const expectedConflictProposalVersion = "wave-6.slice-5.grade-7-9-math.v1";
const expectedEvidencePlaceholderVersion = "wave-5.slice-9.grade-7-9-math.v1";
const expectedAuthorityVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedWorkflowVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const requiredBlockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];

const expectedDecisionIds = [
  "opaque_reviewer_reference_domain",
  "opaque_audit_reference_domain",
  "reviewer_audit_domain_separation",
  "identity_binding_authority",
  "attribution_requirements",
  "audit_actor_taxonomy",
  "authorization_snapshot_requirements",
  "privacy_and_data_exclusion",
  "correction_and_amendment_boundaries",
  "access_and_export_constraints",
  "retention_and_deletion_dependency",
  "separation_and_conflict_dependencies",
];

const expectedMarkers = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NON_OPERATIONAL: true,
  NOT_ISSUED: true,
  NOT_BOUND: true,
  NOT_ATTRIBUTED: true,
  NOT_AUTHORIZED: true,
  NOT_APPROVED: true,
  NOT_USABLE_FOR_REVIEW: true,
  NOT_USABLE_FOR_PRODUCTION: true,
};

const vectorSpecs = [
  [
    "synthetic-review-reference-domain-shape",
    "OPAQUE_REVIEW_REFERENCE_DOMAIN_SHAPE",
    ["SYNTHETIC_REFERENCE_DOMAIN", "SYNTHETIC_ALLOCATION_BOUNDARY"],
    "PROPOSED_NON_OPERATIONAL_REFERENCE",
    null,
  ],
  [
    "synthetic-audit-reference-domain-shape",
    "OPAQUE_AUDIT_REFERENCE_DOMAIN_SHAPE",
    ["SYNTHETIC_AUDIT_DOMAIN", "SYNTHETIC_RESOLUTION_BOUNDARY"],
    "PROPOSED_NON_OPERATIONAL_REFERENCE",
    null,
  ],
  [
    "synthetic-domain-separation-shape",
    "INDEPENDENT_REFERENCE_DOMAIN_SHAPE",
    ["SYNTHETIC_REVIEW_DOMAIN", "SYNTHETIC_AUDIT_DOMAIN"],
    "PROPOSED_NON_OPERATIONAL_REFERENCE",
    null,
  ],
  [
    "synthetic-attribution-requirement-shape",
    "ATTRIBUTION_AND_AUTHORIZATION_CONTEXT_SHAPE",
    ["SYNTHETIC_ACTOR_CLASS", "SYNTHETIC_AUTHORIZATION_CONTEXT"],
    "PROPOSED_NON_OPERATIONAL_REFERENCE",
    null,
  ],
  [
    "synthetic-rejected-binding-record",
    "IDENTITY_BINDING_RECORD_REQUEST",
    ["SYNTHETIC_BINDING_RECORD_REQUEST"],
    "REJECT",
    "IDENTITY_BINDING_FORBIDDEN",
  ],
  [
    "synthetic-rejected-audit-event",
    "AUDIT_EVENT_RECORD_REQUEST",
    ["SYNTHETIC_EVENT_RECORD_REQUEST"],
    "REJECT",
    "AUDIT_EVENT_RECORD_FORBIDDEN",
  ],
  [
    "synthetic-rejected-private-material",
    "PRIVATE_MATERIAL_EMBEDDING_REQUEST",
    ["SYNTHETIC_PRIVATE_MATERIAL_REQUEST"],
    "REJECT",
    "PRIVATE_MATERIAL_FORBIDDEN",
  ],
  [
    "synthetic-rejected-dependency-bypass",
    "UNRESOLVED_DEPENDENCY_BYPASS_REQUEST",
    ["SYNTHETIC_DEPENDENCY_BYPASS_REQUEST"],
    "REJECT",
    "UNSATISFIED_DEPENDENCY_MUST_FAIL_CLOSED",
  ],
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
  "candidateId",
  "storageKey",
  "presignedUrl",
  "downloadUrl",
  "uploadUrl",
  "runtimeHandler",
  "runtimeModule",
  "apiRoute",
  "openapiOperation",
  "prismaModel",
  "migrationName",
  "webPage",
  "immutableDigest",
  "contentHash",
  "sha256",
];

const recordBoundaryFields = [
  "policyDecisionRecords",
  "realPrincipalRecords",
  "accountRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerReferenceRecords",
  "auditReferenceRecords",
  "identityBindingRecords",
  "identityResolutionRecords",
  "roleAssignmentRecords",
  "reviewerAssignmentRecords",
  "conflictDisclosureRecords",
  "authorizationSnapshotRecords",
  "auditEventRecords",
  "attributionRecords",
  "accessGrantRecords",
  "accessLogRecords",
  "exportRecords",
  "correctionRecords",
  "amendmentRecords",
  "retentionPolicyRecords",
  "deletionPolicyRecords",
  "evidenceRecords",
  "reviewDecisionRecords",
  "approvedDecisionRecords",
  "productionApprovalRecords",
];

const changedPaths = [
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
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
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];
const changedPathSet = new Set(changedPaths);
const slice6PrimaryOnlyPaths = new Set([
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
]);
const slice7ChangedPaths = [
  ...changedPaths.filter((changedPath) => !slice6PrimaryOnlyPaths.has(changedPath)),
  "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
  "docs/wave-6/slice-7-implementation-note.md",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
];
const slice7ChangedPathSet = new Set(slice7ChangedPaths);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultProposalPath = path.resolve(
  scriptDir,
  "../diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
);
const upstreamPaths = {
  activation: path.resolve(
    scriptDir,
    "../diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  ),
  auditPlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
  ),
  roleProposal: path.resolve(
    scriptDir,
    "../diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
  ),
  separationProposal: path.resolve(
    scriptDir,
    "../diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
  ),
  conflictProposal: path.resolve(
    scriptDir,
    "../diagnostic-conflict-of-interest-policy-decision-proposal/grade-7-9-math.conflict-of-interest-policy-decision-proposal.v1.json",
  ),
  evidencePlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-evidence-storage-retention-policy/grade-7-9-math.evidence-storage-retention-policy-placeholder.v1.json",
  ),
  authority: path.resolve(
    scriptDir,
    "../diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
  ),
  workflow: path.resolve(
    scriptDir,
    "../diagnostic-review-workflow-state/grade-7-9-math.review-workflow-state-placeholder.v1.json",
  ),
};

export class DiagnosticAuditIdentityDecisionProposalValidationError extends Error {}

function fail(message) {
  throw new DiagnosticAuditIdentityDecisionProposalValidationError(message);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function exact(actual, expected, fieldPath) {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      fail(`${fieldPath} must contain exactly ${expected.length} values.`);
    }
    expected.forEach((value, index) => exact(actual[index], value, `${fieldPath}[${index}]`));
    return;
  }
  if (isObject(expected)) {
    if (!isObject(actual)) fail(`${fieldPath} must be an object.`);
    for (const key of Object.keys(actual)) {
      if (!Object.hasOwn(expected, key)) fail(`${fieldPath}.${key} is unexpected.`);
    }
    for (const key of Object.keys(expected)) {
      if (!Object.hasOwn(actual, key)) fail(`${fieldPath}.${key} is required.`);
      exact(actual[key], expected[key], `${fieldPath}.${key}`);
    }
    return;
  }
  if (!Object.is(actual, expected)) fail(`${fieldPath} must equal ${JSON.stringify(expected)}.`);
}

function scanForbidden(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbidden(item, `${fieldPath}[${index}]`));
    return;
  }
  if (isObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      for (const term of forbiddenTerms) {
        if (key.toLowerCase() === term.toLowerCase()) {
          fail(`${fieldPath}.${key} uses forbidden field term ${term}.`);
        }
      }
      scanForbidden(nested, `${fieldPath}.${key}`);
    }
    return;
  }
  if (typeof value !== "string") return;
  for (const term of forbiddenTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^a-z])${escaped}($|[^a-z])`, "i").test(value)) {
      fail(`${fieldPath} uses forbidden content term ${term}.`);
    }
  }
  const privatePatterns = [
    [/[^\s@]+@[^\s@]+\.[^\s@]+/i, "email-like value"],
    [/\bhttps?:\/\//i, "URL-like value"],
    [/\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/i, "UUID-like value"],
    [/(?:\+?\d[\s().-]*){10,}/, "phone-like value"],
    [/\b(?:user|account)[-_:]\d{3,}\b/i, "private account-like value"],
    [/(?:^|[^a-z])(?:reviewerId|auditId)(?:$|[^a-z])/i, "private identity field-like value"],
    [/\b(?:reviewer|audit)[-_](?:id|ref)[-_:][a-z0-9]+\b/i, "private identity reference"],
    [/\b[0-9a-f]{32,}\b/i, "hash-like value"],
    [/\bdcandidate\.math\./i, "candidate-like value"],
  ];
  for (const [pattern, label] of privatePatterns) {
    if (pattern.test(value)) fail(`${fieldPath} contains a ${label}.`);
  }
}

function unresolved(decisionId) {
  return { decisionId, state: "UNRESOLVED_DEFERRED", decisionRecordRef: null };
}

function expectedMetadata() {
  return {
    schemaVersion: "learnika.diagnosticAuditIdentityPolicyDecisionProposal.v1",
    proposalArtifactVersion: expectedProposalArtifactVersion,
    proposalId: "diagnostic-audit-identity-policy-decision-proposal",
    proposalVersion: expectedProposalVersion,
    status: "PROPOSED_DEFERRED",
    artifactKind: "diagnostic_audit_identity_policy_decision_proposal",
    subject: "math",
    locale: "ru-RU",
    audienceGrades: [7, 8, 9],
    activationPrerequisitesArtifactVersion: expectedActivationVersion,
    auditIdentityPolicyPlaceholderArtifactVersion: expectedAuditPlaceholderVersion,
    reviewerRoleOwnershipDecisionProposalArtifactVersion: expectedRoleProposalVersion,
    separationOfDutiesDecisionProposalArtifactVersion: expectedSeparationProposalVersion,
    conflictOfInterestDecisionProposalArtifactVersion: expectedConflictProposalVersion,
    evidenceStorageRetentionPolicyPlaceholderArtifactVersion: expectedEvidencePlaceholderVersion,
    reviewAuthorityArtifactVersion: expectedAuthorityVersion,
    reviewWorkflowStateArtifactVersion: expectedWorkflowVersion,
    diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
    sourceContract: "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
    productionUseAllowed: false,
    runtimeUseAllowed: false,
    storageAllowed: false,
  };
}

function expectedUpstreamReferences() {
  return {
    activationPrerequisites: {
      artifactPath:
        "packages/curriculum/diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
      artifactVersion: expectedActivationVersion,
      artifactStatus: "blocked_prerequisites_only_non_production",
      prerequisiteId: "audit_identity_policy",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
      evidenceRecordRefs: [],
      prerequisiteCount: 12,
      satisfiedPrerequisiteCount: 0,
      productionApprovalCount: 0,
    },
    auditIdentityPlaceholder: {
      artifactPath:
        "packages/curriculum/diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
      artifactVersion: expectedAuditPlaceholderVersion,
      policyVersion: expectedAuditPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      decisionRequirementCount: 10,
      activeIdentityRuleCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      identityBindingCount: 0,
      authorizationSnapshotCount: 0,
      auditEventCount: 0,
      productionApprovalCount: 0,
    },
    reviewerRoleOwnershipDecisionProposal: {
      artifactPath:
        "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
      artifactVersion: expectedRoleProposalVersion,
      proposalVersion: "wave-6.slice-3.diagnostic-reviewer-role-ownership-policy.proposal.v1",
      proposalStatus: "PROPOSED_DEFERRED",
      unresolvedDecisionCount: 8,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      reviewerAssignmentCount: 0,
      productionApprovalCount: 0,
    },
    separationOfDutiesDecisionProposal: {
      artifactPath:
        "packages/curriculum/diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
      artifactVersion: expectedSeparationProposalVersion,
      proposalVersion: "wave-6.slice-4.diagnostic-separation-of-duties-policy.proposal.v1",
      proposalStatus: "PROPOSED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      unresolvedDecisionCount: 9,
      activeEnforcementRuleCount: 0,
      auditIdentityCount: 0,
      violationCount: 0,
      productionApprovalCount: 0,
    },
    conflictOfInterestDecisionProposal: {
      artifactPath:
        "packages/curriculum/diagnostic-conflict-of-interest-policy-decision-proposal/grade-7-9-math.conflict-of-interest-policy-decision-proposal.v1.json",
      artifactVersion: expectedConflictProposalVersion,
      proposalVersion: "wave-6.slice-5.diagnostic-conflict-of-interest-policy.proposal.v1",
      proposalStatus: "PROPOSED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      unresolvedDecisionCount: 10,
      activeConflictRuleCount: 0,
      conflictDisclosureCount: 0,
      recusalCount: 0,
      productionApprovalCount: 0,
    },
    evidenceStorageRetentionPlaceholder: {
      artifactPath:
        "packages/curriculum/diagnostic-evidence-storage-retention-policy/grade-7-9-math.evidence-storage-retention-policy-placeholder.v1.json",
      artifactVersion: expectedEvidencePlaceholderVersion,
      policyVersion: "wave-5.slice-9.diagnostic-evidence-storage-and-retention.placeholder.v1",
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      activeStorageRuleCount: 0,
      retentionScheduleCount: 0,
      deletionExecutionCount: 0,
      auditEventCount: 0,
      productionApprovalCount: 0,
    },
    reviewAuthority: {
      artifactPath:
        "packages/curriculum/diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
      artifactVersion: expectedAuthorityVersion,
      policyVersion: "wave-4.slice-8.diagnostic-review-authority.placeholder.v1",
      policyState: "DEFERRED_NON_PRODUCTION",
      reviewerAssignmentCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      reviewDecisionCount: 0,
      productionApprovalCount: 0,
    },
    reviewWorkflowState: {
      artifactPath:
        "packages/curriculum/diagnostic-review-workflow-state/grade-7-9-math.review-workflow-state-placeholder.v1.json",
      artifactVersion: expectedWorkflowVersion,
      workflowVersion: "wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1",
      policyState: "DEFERRED_NON_PRODUCTION",
      runtimeActivationAllowed: false,
      activeReviewCount: 0,
      auditIdentityCount: 0,
      reviewDecisionCount: 0,
      productionApprovalCount: 0,
    },
  };
}

function expectedBaseline() {
  return {
    readiness: {
      policyVersion: expectedReadinessPolicyVersion,
      status: "NOT_READY",
      blockingReasons: requiredBlockingReasons,
    },
    activation: { status: "BLOCKED", workflowStatus: "INACTIVE" },
    auditIdentityPrerequisite: {
      prerequisiteId: "audit_identity_policy",
      status: "UNSATISFIED_DEFERRED",
      ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
      evidenceRecordRefs: [],
    },
    satisfiedPrerequisiteCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
  };
}

function expectedBoundary() {
  return {
    proposalStatus: "PROPOSED_DEFERRED",
    policyApproved: false,
    referenceDomainApproved: false,
    actorTaxonomyApproved: false,
    identityBindingAllowed: false,
    referenceIssuanceAllowed: false,
    identityResolutionAllowed: false,
    attributionAllowed: false,
    authorizationSnapshotAllowed: false,
    auditEventRecordingAllowed: false,
    accessAllowed: false,
    exportAllowed: false,
    correctionAllowed: false,
    amendmentAllowed: false,
    retentionEnforcementAllowed: false,
    deletionExecutionAllowed: false,
    reviewUseAllowed: false,
    workflowActivationAllowed: false,
    prerequisiteSatisfactionAllowed: false,
    productionApprovalAllowed: false,
    readinessTransitionAllowed: false,
  };
}

function expectedTaxonomies() {
  return {
    referenceDomainTaxonomyPlaceholders: [
      {
        domainPlaceholderId: "REVIEWER_REFERENCE_DOMAIN_PLACEHOLDER",
        domainScope: "review_decision_attribution",
        recordState: "TAXONOMY_ONLY",
        referenceFormat: null,
        allocationAuthorityReference: null,
        resolverReference: null,
        issuanceAllowed: false,
        bindingAllowed: false,
        lookupAllowed: false,
      },
      {
        domainPlaceholderId: "AUDIT_REFERENCE_DOMAIN_PLACEHOLDER",
        domainScope: "audit_event_attribution",
        recordState: "TAXONOMY_ONLY",
        referenceFormat: null,
        allocationAuthorityReference: null,
        resolverReference: null,
        issuanceAllowed: false,
        bindingAllowed: false,
        lookupAllowed: false,
      },
    ],
    auditActorTaxonomyPlaceholders: [
      {
        actorPlaceholderId: "SUBSTANTIVE_REVIEW_ACTOR_PLACEHOLDER",
        actorScope: "substantive_review_attribution",
        recordState: "TAXONOMY_ONLY",
        decisionAuthorityAllowed: false,
        productionAuthorityAllowed: false,
      },
      {
        actorPlaceholderId: "PRODUCTION_APPROVAL_ACTOR_PLACEHOLDER",
        actorScope: "production_approval_attribution",
        recordState: "TAXONOMY_ONLY",
        decisionAuthorityAllowed: false,
        productionAuthorityAllowed: false,
      },
      {
        actorPlaceholderId: "AUDIT_OBSERVATION_ACTOR_PLACEHOLDER",
        actorScope: "audit_observation",
        recordState: "TAXONOMY_ONLY",
        decisionAuthorityAllowed: false,
        productionAuthorityAllowed: false,
      },
    ],
  };
}

function expectedProposedPolicy() {
  const base = (decisionId) => ({ decisionId, decisionState: "UNRESOLVED_DEFERRED" });
  return {
    state: "PROPOSED_NOT_APPROVED",
    opaqueReviewerReferenceDomain: {
      ...base("opaque_reviewer_reference_domain"),
      domainShape: "OPAQUE_NONSEMANTIC_VERSIONED_REFERENCE_DOMAIN",
      personalDataEmbeddingAllowed: false,
      referenceIssuanceAllowed: false,
      ruleActive: false,
    },
    opaqueAuditReferenceDomain: {
      ...base("opaque_audit_reference_domain"),
      domainShape: "SEPARATE_OPAQUE_NONSEMANTIC_AUDIT_REFERENCE_DOMAIN",
      reviewerDomainSubstitutionAllowed: false,
      referenceIssuanceAllowed: false,
      ruleActive: false,
    },
    reviewerAuditDomainSeparation: {
      ...base("reviewer_audit_domain_separation"),
      separationShape: "INDEPENDENT_REFERENCE_DOMAINS_WITH_CONTROLLED_BINDING",
      crossDomainLookupAllowed: false,
      domainSubstitutionAllowed: false,
      ruleActive: false,
    },
    identityBindingAuthority: {
      ...base("identity_binding_authority"),
      authorityShape: "SEPARATE_PROOFING_BINDING_REVOCATION_REVIEW_AUTHORITY",
      authorityAssigned: false,
      selfBindingAllowed: false,
      bindingAllowed: false,
      ruleActive: false,
    },
    attributionRequirements: {
      ...base("attribution_requirements"),
      attributionShape: "ACTOR_CLASS_REFERENCE_POLICY_TIME_AUTHORIZATION_CONTEXT",
      attributionRecordingAllowed: false,
      eventGenerationAllowed: false,
      ruleActive: false,
    },
    auditActorTaxonomy: {
      ...base("audit_actor_taxonomy"),
      taxonomyShape: "CLOSED_SUBSTANTIVE_APPROVAL_OBSERVATION_ACTOR_TAXONOMY",
      activeActorClassCount: 0,
      taxonomyApproved: false,
      ruleActive: false,
    },
    authorizationSnapshotRequirements: {
      ...base("authorization_snapshot_requirements"),
      snapshotShape: "MINIMUM_NECESSARY_DECISION_TIME_AUTHORIZATION_CONTEXT",
      snapshotRecordingAllowed: false,
      historicalResolutionAllowed: false,
      ruleActive: false,
    },
    privacyDataExclusion: {
      ...base("privacy_and_data_exclusion"),
      exclusionShape: "MINIMUM_NECESSARY_EXTERNAL_CONTROLLED_RESOLUTION",
      personalDataRecordingAllowed: false,
      curriculumResolutionAllowed: false,
      ruleActive: false,
    },
    correctionAmendmentBoundaries: {
      ...base("correction_and_amendment_boundaries"),
      boundaryShape: "APPEND_ONLY_ATTRIBUTED_HISTORICALLY_PRESERVED_CHANGE",
      silentMutationAllowed: false,
      historicalReplacementAllowed: false,
      processingActive: false,
    },
    accessExportConstraints: {
      ...base("access_and_export_constraints"),
      constraintShape: "LEAST_PRIVILEGE_PURPOSE_LIMITED_BOUNDED_DISCLOSURE",
      lookupAllowed: false,
      bulkExportAllowed: false,
      processingActive: false,
    },
    retentionDeletionDependency: {
      ...base("retention_and_deletion_dependency"),
      dependencyShape: "EXACT_WAVE_5_STORAGE_RETENTION_PLACEHOLDER_NON_AUTHORIZING",
      dependencySatisfied: false,
      storageAllowed: false,
      deletionExecutionAllowed: false,
      ruleActive: false,
    },
    separationConflictDependencies: {
      ...base("separation_and_conflict_dependencies"),
      dependencyShape: "EXACT_SLICE_4_AND_SLICE_5_PROPOSALS_NON_AUTHORIZING",
      separationDependencySatisfied: false,
      conflictDependencySatisfied: false,
      identityUseAllowed: false,
      ruleActive: false,
    },
  };
}

function expectedRecordBoundary() {
  return Object.fromEntries([
    ...recordBoundaryFields.map((field) => [field, false]),
    ["runtimeAuditIdentityEnabled", false],
  ]);
}

function expectedAggregate() {
  const aggregate = {
    syntheticExampleCount: 8,
    acceptedSyntheticExampleCount: 4,
    rejectedSyntheticExampleCount: 4,
    unresolvedDecisionCount: 12,
    referenceDomainPlaceholderCount: 2,
    auditActorPlaceholderCount: 3,
  };
  const zeroFields = [
    "satisfiedPrerequisiteCount",
    "policyDecisionCount",
    "realPrincipalCount",
    "accountRecordCount",
    "reviewerIdentityCount",
    "auditIdentityCount",
    "reviewerReferenceCount",
    "auditReferenceCount",
    "identityBindingCount",
    "identityResolutionCount",
    "roleAssignmentCount",
    "reviewerAssignmentCount",
    "conflictDisclosureCount",
    "authorizationSnapshotCount",
    "auditEventCount",
    "attributionCount",
    "accessGrantCount",
    "accessLogCount",
    "exportCount",
    "correctionCount",
    "amendmentCount",
    "retentionPolicyCount",
    "deletionPolicyCount",
    "evidenceCount",
    "reviewDecisionCount",
    "approvedDecisionCount",
    "approvedCandidateCount",
    "productionApprovalCount",
    "activeIdentityRuleCount",
  ];
  for (const field of zeroFields) aggregate[field] = 0;
  return aggregate;
}

function expectedSyntheticExamples() {
  return vectorSpecs.map(
    ([vectorRef, scenarioCode, abstractInputTokens, expectedDisposition, rejectionReasonCode]) => ({
      vectorRef,
      vectorType:
        expectedDisposition === "REJECT"
          ? "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR"
          : "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
      scenarioCode,
      abstractInputTokens,
      expectedDisposition,
      rejectionReasonCode,
      markers: expectedMarkers,
    }),
  );
}

function validateUpstream(upstream) {
  const activation = upstream.activation;
  const audit = upstream.auditPlaceholder;
  const role = upstream.roleProposal;
  const separation = upstream.separationProposal;
  const conflict = upstream.conflictProposal;
  const evidence = upstream.evidencePlaceholder;
  const authority = upstream.authority;
  const workflow = upstream.workflow;
  exact(
    activation.metadata.activationPrerequisitesArtifactVersion,
    expectedActivationVersion,
    "activation.metadata.version",
  );
  exact(
    activation.metadata.status,
    "blocked_prerequisites_only_non_production",
    "activation.metadata.status",
  );
  exact(activation.activationBoundary.status, "BLOCKED", "activation.activationBoundary.status");
  exact(
    activation.activationBoundary.reviewWorkflowStatus,
    "INACTIVE",
    "activation.activationBoundary.reviewWorkflowStatus",
  );
  exact(
    activation.aggregate.satisfiedPrerequisiteCount,
    0,
    "activation.aggregate.satisfiedPrerequisiteCount",
  );
  const auditPrereq = audit.prerequisiteReference;
  exact(
    audit.metadata.policyArtifactVersion,
    expectedAuditPlaceholderVersion,
    "audit.metadata.version",
  );
  exact(audit.policyIdentity.policyVersion, expectedAuditPolicyVersion, "audit.policy.version");
  exact(audit.policyIdentity.policyState, "UNRESOLVED_DEFERRED", "audit.policy.state");
  exact(auditPrereq.status, "UNSATISFIED_DEFERRED", "audit.prerequisite.status");
  exact(audit.aggregate.activeIdentityRuleCount, 0, "audit.aggregate.activeIdentityRuleCount");
  exact(audit.aggregate.auditIdentityCount, 0, "audit.aggregate.auditIdentityCount");
  exact(
    role.metadata.proposalArtifactVersion,
    expectedRoleProposalVersion,
    "role.metadata.version",
  );
  exact(role.metadata.status, "PROPOSED_DEFERRED", "role.metadata.status");
  exact(role.currentBaseline.readiness.status, "NOT_READY", "role.readiness");
  exact(role.currentBaseline.activation.status, "BLOCKED", "role.activation");
  exact(role.aggregate.reviewerIdentityCount, 0, "role.aggregate.reviewerIdentityCount");
  exact(
    separation.metadata.proposalArtifactVersion,
    expectedSeparationProposalVersion,
    "separation.metadata.version",
  );
  exact(separation.metadata.status, "PROPOSED_DEFERRED", "separation.metadata.status");
  exact(separation.currentBaseline.activation.status, "BLOCKED", "separation.activation");
  exact(
    separation.proposalBoundary.enforcementAllowed,
    false,
    "separation.proposalBoundary.enforcementAllowed",
  );
  exact(
    conflict.metadata.proposalArtifactVersion,
    expectedConflictProposalVersion,
    "conflict.metadata.version",
  );
  exact(conflict.metadata.status, "PROPOSED_DEFERRED", "conflict.metadata.status");
  exact(conflict.currentBaseline.activation.status, "BLOCKED", "conflict.activation");
  exact(
    conflict.proposalBoundary.identityComparisonAllowed,
    false,
    "conflict.proposalBoundary.identityComparisonAllowed",
  );
  exact(
    evidence.metadata.policyArtifactVersion,
    expectedEvidencePlaceholderVersion,
    "evidence.metadata.version",
  );
  exact(
    evidence.metadata.status,
    "placeholder_only_unsatisfied_non_production",
    "evidence.metadata.status",
  );
  exact(evidence.aggregate.activeStorageRuleCount, 0, "evidence.aggregate.activeStorageRuleCount");
  exact(evidence.aggregate.deletionExecutionCount, 0, "evidence.aggregate.deletionExecutionCount");
  exact(
    authority.metadata.authorityArtifactVersion,
    expectedAuthorityVersion,
    "authority.metadata.version",
  );
  exact(authority.authorityPolicy.policyState, "DEFERRED_NON_PRODUCTION", "authority.policy.state");
  exact(
    authority.authorityPolicy.reviewDecisionAuthorityAllowed,
    false,
    "authority.policy.reviewDecisionAuthorityAllowed",
  );
  exact(
    workflow.metadata.workflowArtifactVersion,
    expectedWorkflowVersion,
    "workflow.metadata.version",
  );
  exact(workflow.workflowPolicy.policyState, "DEFERRED_NON_PRODUCTION", "workflow.policy.state");
  exact(
    workflow.workflowPolicy.runtimeActivationAllowed,
    false,
    "workflow.policy.runtimeActivationAllowed",
  );
}

export function validateDiagnosticAuditIdentityPolicyDecisionProposal(artifact, upstream) {
  if (!isObject(artifact) || !isObject(upstream)) fail("Artifact and upstream must be objects.");
  validateUpstream(upstream);
  scanForbidden(artifact);
  const expectedTopLevelFields = [
    "metadata",
    "upstreamReferences",
    "currentBaseline",
    "proposalBoundary",
    "referenceDomainTaxonomyPlaceholders",
    "auditActorTaxonomyPlaceholders",
    "proposedPolicy",
    "unresolvedDecisions",
    "syntheticExamples",
    "recordBoundary",
    "aggregate",
    ...recordBoundaryFields,
  ];
  for (const field of Object.keys(artifact)) {
    if (!expectedTopLevelFields.includes(field)) fail(`$.${field} is unexpected.`);
  }
  for (const field of expectedTopLevelFields) {
    if (!Object.hasOwn(artifact, field)) fail(`$.${field} is required.`);
  }
  exact(artifact.metadata, expectedMetadata(), "metadata");
  exact(artifact.upstreamReferences, expectedUpstreamReferences(), "upstreamReferences");
  exact(artifact.currentBaseline, expectedBaseline(), "currentBaseline");
  exact(artifact.proposalBoundary, expectedBoundary(), "proposalBoundary");
  const taxonomies = expectedTaxonomies();
  exact(
    artifact.referenceDomainTaxonomyPlaceholders,
    taxonomies.referenceDomainTaxonomyPlaceholders,
    "referenceDomainTaxonomyPlaceholders",
  );
  exact(
    artifact.auditActorTaxonomyPlaceholders,
    taxonomies.auditActorTaxonomyPlaceholders,
    "auditActorTaxonomyPlaceholders",
  );
  exact(artifact.proposedPolicy, expectedProposedPolicy(), "proposedPolicy");
  exact(artifact.unresolvedDecisions, expectedDecisionIds.map(unresolved), "unresolvedDecisions");
  exact(artifact.syntheticExamples, expectedSyntheticExamples(), "syntheticExamples");
  exact(artifact.recordBoundary, expectedRecordBoundary(), "recordBoundary");
  exact(artifact.aggregate, expectedAggregate(), "aggregate");
  for (const field of recordBoundaryFields) exact(artifact[field], [], field);
  return {
    proposalArtifactVersion: artifact.metadata.proposalArtifactVersion,
    proposalVersion: artifact.metadata.proposalVersion,
    proposalStatus: artifact.metadata.status,
    prerequisiteStatus: artifact.currentBaseline.auditIdentityPrerequisite.status,
    syntheticExampleCount: artifact.aggregate.syntheticExampleCount,
    unresolvedDecisionCount: artifact.aggregate.unresolvedDecisionCount,
    activeIdentityRuleCount: artifact.aggregate.activeIdentityRuleCount,
    satisfiedPrerequisiteCount: artifact.aggregate.satisfiedPrerequisiteCount,
    auditEventCount: artifact.aggregate.auditEventCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.currentBaseline.activation.status,
    workflowStatus: artifact.currentBaseline.activation.workflowStatus,
    readiness: artifact.currentBaseline.readiness.status,
  };
}

export async function readDiagnosticAuditIdentityPolicyDecisionProposal(
  artifactPath = defaultProposalPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticAuditIdentityPolicyDecisionProposalUpstream() {
  const entries = await Promise.all(
    Object.entries(upstreamPaths).map(async ([key, value]) => [
      key,
      JSON.parse(await readFile(value, "utf8")),
    ]),
  );
  return Object.fromEntries(entries);
}

export function validateAuditIdentityDecisionProposalChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !changedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 6 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== changedPaths.length) {
    fail(`Wave 6 Slice 6 requires exactly ${changedPaths.length} changed paths.`);
  }
  return normalized;
}

export const validateDiagnosticAuditIdentityDecisionProposalChangedPaths =
  validateAuditIdentityDecisionProposalChangedPaths;

export function validateDiagnosticAuditIdentityDecisionProposalSlice7ChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !slice7ChangedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 7 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== slice7ChangedPaths.length)
    fail(`Wave 6 Slice 7 requires exactly ${slice7ChangedPaths.length} changed paths.`);
  return normalized;
}

function defaultGitRunner(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { status: result.status ?? 1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function localWorktreePaths({ cwd, runGit }) {
  const result = runGit(["status", "--short", "--untracked-files=all"], cwd);
  if (result.status !== 0) fail(`Unable to inspect git status: ${result.stderr || result.stdout}`);
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .map((value) => value.replaceAll("\\", "/"));
}

function readCiEvent(eventPath) {
  try {
    return JSON.parse(readFileSync(eventPath, "utf8"));
  } catch (error) {
    fail(
      `BLOCK: GitHub Actions event metadata is unavailable or invalid: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function isCommitSha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
}

function requireCommitObject(sha, label, { cwd, runGit }) {
  if (!isCommitSha(sha))
    fail(
      `BLOCK: CI ${label} commit is unavailable or invalid; exact changed-path range cannot be determined.`,
    );
  const objectArgs = ["cat-file", "-e", `${sha}^{commit}`];
  if (runGit(objectArgs, cwd).status === 0) return;
  const fetchResult = runGit(["fetch", "--no-tags", "--depth=1", "origin", sha], cwd);
  if (fetchResult.status !== 0) {
    fail(
      `BLOCK: CI ${label} commit is unavailable and could not be fetched from origin; exact changed-path range cannot be determined: ${fetchResult.stderr || fetchResult.stdout}`,
    );
  }
  if (runGit(objectArgs, cwd).status !== 0) {
    fail(
      `BLOCK: CI ${label} commit remains unavailable after fetching the exact SHA; exact changed-path range cannot be determined.`,
    );
  }
}

function ciCommitRange({ cwd, env, runGit, readEvent }) {
  const event = env.GITHUB_EVENT_PATH ? readEvent(env.GITHUB_EVENT_PATH) : undefined;
  let base;
  let head;
  if (env.GITHUB_EVENT_NAME === "pull_request" || event?.pull_request) {
    base = event?.pull_request?.base?.sha;
    head = event?.pull_request?.head?.sha;
  } else if (env.GITHUB_EVENT_NAME === "push" || event?.before || event?.after) {
    base = event?.before;
    head = event?.after ?? env.GITHUB_SHA;
  } else {
    head = env.GITHUB_SHA;
    requireCommitObject(head, "head", { cwd, runGit });
    const result = runGit(["rev-list", "--parents", "-n", "1", head], cwd);
    const commits = result.status === 0 ? result.stdout.trim().split(/\s+/).filter(Boolean) : [];
    base = commits.length === 2 && commits[0] === head ? commits[1] : undefined;
  }
  if (!isCommitSha(base) || !isCommitSha(head))
    fail("BLOCK: exact GitHub Actions base/head range is unavailable.");
  requireCommitObject(base, "base", { cwd, runGit });
  requireCommitObject(head, "head", { cwd, runGit });
  return { base, head };
}

function diffPaths({ cwd, base, head, runGit }) {
  const result = runGit(
    ["diff", "--name-status", "--find-renames", "--no-ext-diff", "-z", base, head],
    cwd,
  );
  if (result.status !== 0)
    fail(`BLOCK: CI changed-path range could not be read: ${result.stderr || result.stdout}`);
  const tokens = result.stdout.split("\0").filter(Boolean);
  const paths = [];
  for (let index = 0; index < tokens.length;) {
    const status = tokens[index++];
    const pathCount = /^[RC]/.test(status) ? 2 : 1;
    if (tokens.length - index < pathCount)
      fail("BLOCK: CI changed-path range was malformed; exact scope cannot be determined.");
    for (let pathIndex = 0; pathIndex < pathCount; pathIndex += 1)
      paths.push(tokens[index++].replaceAll("\\", "/"));
  }
  if (paths.length === 0) fail("BLOCK: CI changed-path collection returned an empty path list.");
  return paths;
}

export function collectDiagnosticAuditIdentityDecisionProposalChangedPaths({
  cwd = repoRoot,
  env = process.env,
  runGit = defaultGitRunner,
  readEvent = readCiEvent,
} = {}) {
  if (String(env.GITHUB_ACTIONS ?? "").toLowerCase() !== "true")
    return localWorktreePaths({ cwd, runGit });
  const { base, head } = ciCommitRange({ cwd, env, runGit, readEvent });
  const paths = diffPaths({ cwd, base, head, runGit });
  if (
    paths.length === slice7ChangedPaths.length &&
    paths.every((value) => slice7ChangedPathSet.has(value))
  )
    return validateDiagnosticAuditIdentityDecisionProposalSlice7ChangedPaths(paths);
  return paths;
}

export function validateDiagnosticAuditIdentityDecisionProposalWorktreeScope(
  paths,
  { env = process.env } = {},
) {
  const inGitHubActions = String(env.GITHUB_ACTIONS ?? "").toLowerCase() === "true";
  if (!inGitHubActions && Array.isArray(paths) && paths.length === 0) return [];
  if (
    Array.isArray(paths) &&
    paths.length === slice7ChangedPaths.length &&
    paths.every((value) => slice7ChangedPathSet.has(value))
  )
    return validateDiagnosticAuditIdentityDecisionProposalSlice7ChangedPaths(paths);
  return validateAuditIdentityDecisionProposalChangedPaths(paths);
}

export async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticAuditIdentityPolicyDecisionProposal(),
    readDiagnosticAuditIdentityPolicyDecisionProposalUpstream(),
  ]);
  const summary = validateDiagnosticAuditIdentityPolicyDecisionProposal(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    const paths = collectDiagnosticAuditIdentityDecisionProposalChangedPaths();
    validateDiagnosticAuditIdentityDecisionProposalWorktreeScope(paths);
  }
  console.log(
    `[curriculum] Audit identity decision proposal ${summary.proposalArtifactVersion} validated: ${summary.syntheticExampleCount} synthetic vectors, ${summary.unresolvedDecisionCount} unresolved decisions, ${summary.activeIdentityRuleCount} active rules, ${summary.satisfiedPrerequisiteCount} satisfied prerequisites, ${summary.auditEventCount} audit events, ${summary.productionApprovalCount} production approvals; proposal ${summary.proposalStatus}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
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
