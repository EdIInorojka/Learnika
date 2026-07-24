import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const expectedProposalArtifactVersion = "wave-6.slice-5.grade-7-9-math.v1";
const expectedProposalVersion = "wave-6.slice-5.diagnostic-conflict-of-interest-policy.proposal.v1";
const expectedActivationVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedConflictPlaceholderVersion = "wave-5.slice-7.grade-7-9-math.v1";
const expectedConflictPolicyVersion =
  "wave-5.slice-7.diagnostic-conflict-of-interest.placeholder.v1";
const expectedSeparationProposalVersion = "wave-6.slice-4.grade-7-9-math.v1";
const expectedRoleOwnershipProposalVersion = "wave-6.slice-3.grade-7-9-math.v1";
const expectedAuditPlaceholderVersion = "wave-5.slice-8.grade-7-9-math.v1";
const expectedEvidencePlaceholderVersion = "wave-5.slice-9.grade-7-9-math.v1";
const expectedAuthorityVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedWorkflowVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const requiredBlockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];

const expectedConflictTaxonomy = [
  ["CANDIDATE_AUTHOR_RELATIONSHIP_PLACEHOLDER", "candidate_author_relationship"],
  [
    "TEXTBOOK_OR_CONTENT_SOURCE_RELATIONSHIP_PLACEHOLDER",
    "textbook_or_content_source_relationship",
  ],
  [
    "FINANCIAL_VENDOR_OR_PROVIDER_RELATIONSHIP_PLACEHOLDER",
    "financial_vendor_or_provider_relationship",
  ],
  ["PERSONAL_OR_FAMILY_RELATIONSHIP_PLACEHOLDER", "personal_or_family_relationship"],
  [
    "ORGANIZATIONAL_OR_REPORTING_RELATIONSHIP_PLACEHOLDER",
    "organizational_or_reporting_relationship",
  ],
  [
    "PRIOR_DECISION_OR_ADVOCACY_RELATIONSHIP_PLACEHOLDER",
    "prior_decision_or_advocacy_relationship",
  ],
  [
    "OTHER_ACTUAL_POTENTIAL_OR_PERCEIVED_CONFLICT_PLACEHOLDER",
    "other_actual_potential_or_perceived_conflict",
  ],
];
const expectedDecisionIds = [
  "conflict_relationship_taxonomy",
  "self_disclosure_boundary",
  "candidate_content_source_relationships",
  "commercial_financial_relationships",
  "recusal_reassignment_requirements",
  "late_disclosure_handling",
  "waiver_exception_boundaries",
  "escalation_authority",
  "future_audit_evidence_requirements",
  "separation_of_duties_dependency",
];
const expectedMarkers = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NON_OPERATIONAL: true,
  NOT_ASSIGNED: true,
  NOT_EVALUATED: true,
  NOT_APPROVED: true,
  NOT_USABLE_FOR_REVIEW: true,
  NOT_USABLE_FOR_PRODUCTION: true,
};
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
  "userId",
  "accountId",
  "candidateId",
  "immutableDigest",
  "contentHash",
  "sha256",
  "storageObjectKey",
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
];
const candidateLikeValuePattern =
  /dcandidate\.math\.g7-9\.[a-z0-9-]+\.[a-z0-9-]+\.v[0-9]+(?:\.r[0-9]+)?/i;
const privateValuePatterns = [
  ["email-like value", /[^\s@]+@[^\s@]+\.[^\s@]+/],
  ["URL-like value", /\bhttps?:\/\//i],
  ["UUID-like value", /\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/i],
  ["phone-like value", /(?:\+?\d[\s().-]*){10,}/],
  ["principal-id-like value", /\b(?:user|account)[-_:]\d{3,}\b/i],
  ["principal-reference-like value", /\b(?:reviewer|audit):[a-z0-9]+\b/i],
  ["principal-reference-like value", /\b(?:reviewer|audit)[-_](?:id|ref)[-_:][a-z0-9]+\b/i],
  ["hash-like value", /\b[0-9a-f]{32,}\b/i],
];

const changedPaths = [
  "docs/wave-6/diagnostic-conflict-of-interest-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-5-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-conflict-of-interest-policy-decision-proposal/grade-7-9-math.conflict-of-interest-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
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
const slice5PrimaryOnlyPaths = new Set([
  "docs/wave-6/diagnostic-conflict-of-interest-policy-decision-proposal.md",
  "docs/wave-6/slice-5-implementation-note.md",
  "packages/curriculum/diagnostic-conflict-of-interest-policy-decision-proposal/grade-7-9-math.conflict-of-interest-policy-decision-proposal.v1.json",
]);
const slice6ChangedPaths = [
  ...changedPaths.filter((changedPath) => !slice5PrimaryOnlyPaths.has(changedPath)),
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy-decision-proposal.test.mjs",
];
const slice6ChangedPathSet = new Set(slice6ChangedPaths);
const slice6PrimaryOnlyPaths = new Set([
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
]);
const slice7ChangedPaths = [
  ...slice6ChangedPaths.filter((changedPath) => !slice6PrimaryOnlyPaths.has(changedPath)),
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
  "../diagnostic-conflict-of-interest-policy-decision-proposal/grade-7-9-math.conflict-of-interest-policy-decision-proposal.v1.json",
);
const upstreamPaths = {
  activationPrerequisites: path.resolve(
    scriptDir,
    "../diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  ),
  conflictPlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-conflict-of-interest-policy/grade-7-9-math.conflict-of-interest-policy-placeholder.v1.json",
  ),
  separationProposal: path.resolve(
    scriptDir,
    "../diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
  ),
  roleOwnershipProposal: path.resolve(
    scriptDir,
    "../diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
  ),
  auditPlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
  ),
  evidencePlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-evidence-storage-retention-policy/grade-7-9-math.evidence-storage-retention-policy-placeholder.v1.json",
  ),
  reviewAuthority: path.resolve(
    scriptDir,
    "../diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
  ),
  reviewWorkflow: path.resolve(
    scriptDir,
    "../diagnostic-review-workflow-state/grade-7-9-math.review-workflow-state-placeholder.v1.json",
  ),
};

export class DiagnosticConflictOfInterestDecisionProposalValidationError extends Error {}

function fail(message) {
  throw new DiagnosticConflictOfInterestDecisionProposalValidationError(message);
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
  if (actual !== expected) fail(`${fieldPath} must equal ${JSON.stringify(expected)}.`);
}

function requireExactFields(value, fields, fieldPath) {
  if (!isObject(value)) fail(`${fieldPath} must be an object.`);
  const expected = new Set(fields);
  for (const key of Object.keys(value)) {
    if (!expected.has(key)) fail(`${fieldPath}.${key} is unexpected.`);
  }
  for (const key of expected) {
    if (!Object.hasOwn(value, key)) fail(`${fieldPath}.${key} is required.`);
  }
}

function scan(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scan(item, `${fieldPath}[${index}]`));
    return;
  }
  if (isObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      for (const term of forbiddenTerms) {
        if (key.toLowerCase().includes(term.toLowerCase())) {
          fail(`${fieldPath}.${key} uses forbidden field term ${term}.`);
        }
      }
      scan(nested, `${fieldPath}.${key}`);
    }
    return;
  }
  if (typeof value !== "string") return;
  for (const term of forbiddenTerms) {
    if (value.toLowerCase().includes(term.toLowerCase())) {
      fail(`${fieldPath} uses forbidden content term ${term}.`);
    }
  }
  if (candidateLikeValuePattern.test(value)) fail(`${fieldPath} contains a concrete candidate ID.`);
  for (const [label, pattern] of privateValuePatterns) {
    if (pattern.test(value)) fail(`${fieldPath} contains a ${label}.`);
  }
}

function exactMetadata() {
  return {
    schemaVersion: "learnika.diagnosticConflictOfInterestPolicyDecisionProposal.v1",
    proposalArtifactVersion: expectedProposalArtifactVersion,
    proposalId: "diagnostic-conflict-of-interest-policy-decision-proposal",
    proposalVersion: expectedProposalVersion,
    status: "PROPOSED_DEFERRED",
    artifactKind: "diagnostic_conflict_of_interest_policy_decision_proposal",
    subject: "math",
    locale: "ru-RU",
    audienceGrades: [7, 8, 9],
    activationPrerequisitesArtifactVersion: expectedActivationVersion,
    conflictOfInterestPolicyPlaceholderArtifactVersion: expectedConflictPlaceholderVersion,
    separationOfDutiesDecisionProposalArtifactVersion: expectedSeparationProposalVersion,
    reviewerRoleOwnershipDecisionProposalArtifactVersion: expectedRoleOwnershipProposalVersion,
    auditIdentityPolicyPlaceholderArtifactVersion: expectedAuditPlaceholderVersion,
    evidenceStorageRetentionPolicyPlaceholderArtifactVersion: expectedEvidencePlaceholderVersion,
    reviewAuthorityArtifactVersion: expectedAuthorityVersion,
    reviewWorkflowStateArtifactVersion: expectedWorkflowVersion,
    diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
    sourceContract: "docs/wave-6/diagnostic-conflict-of-interest-policy-decision-proposal.md",
    productionUseAllowed: false,
    runtimeUseAllowed: false,
    storageAllowed: false,
  };
}

function exactUpstreamReferences() {
  return {
    activationPrerequisites: {
      artifactPath:
        "packages/curriculum/diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
      artifactVersion: expectedActivationVersion,
      artifactStatus: "blocked_prerequisites_only_non_production",
      prerequisiteId: "conflict_of_interest_policy",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
      evidenceRecordRefs: [],
      prerequisiteCount: 12,
      satisfiedPrerequisiteCount: 0,
      productionApprovalCount: 0,
    },
    conflictOfInterestPlaceholder: {
      artifactPath:
        "packages/curriculum/diagnostic-conflict-of-interest-policy/grade-7-9-math.conflict-of-interest-policy-placeholder.v1.json",
      artifactVersion: expectedConflictPlaceholderVersion,
      policyVersion: expectedConflictPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      conflictCategoryPlaceholderCount: 7,
      decisionRequirementCount: 10,
      activeConflictRuleCount: 0,
      conflictRecordCount: 0,
      disclosureRecordCount: 0,
      recusalRecordCount: 0,
      waiverRecordCount: 0,
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
      conflictDisclosureCount: 0,
      conflictEvaluationCount: 0,
      violationCount: 0,
      productionApprovalCount: 0,
    },
    reviewerRoleOwnershipDecisionProposal: {
      artifactPath:
        "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
      artifactVersion: expectedRoleOwnershipProposalVersion,
      proposalVersion: "wave-6.slice-3.diagnostic-reviewer-role-ownership-policy.proposal.v1",
      proposalStatus: "PROPOSED_DEFERRED",
      unresolvedDecisionCount: 8,
      ownerAssignmentCount: 0,
      reviewerIdentityCount: 0,
      reviewerAssignmentCount: 0,
      productionApprovalCount: 0,
    },
    auditIdentityPlaceholder: {
      artifactPath:
        "packages/curriculum/diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
      artifactVersion: expectedAuditPlaceholderVersion,
      policyVersion: "wave-5.slice-8.diagnostic-audit-identity.placeholder.v1",
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      activeIdentityRuleCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      auditEventCount: 0,
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
      reviewEvidenceRecordCount: 0,
      storageObjectCount: 0,
      retentionScheduleCount: 0,
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
      reviewDecisionCount: 0,
      productionApprovalCount: 0,
    },
  };
}

function exactBaseline() {
  return {
    readiness: {
      policyVersion: expectedReadinessPolicyVersion,
      status: "NOT_READY",
      blockingReasons: requiredBlockingReasons,
    },
    activation: { status: "BLOCKED", workflowStatus: "INACTIVE" },
    conflictOfInterestPrerequisite: {
      prerequisiteId: "conflict_of_interest_policy",
      status: "UNSATISFIED_DEFERRED",
      ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
      evidenceRecordRefs: [],
    },
    satisfiedPrerequisiteCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
  };
}

function exactProposalBoundary() {
  return {
    proposalStatus: "PROPOSED_DEFERRED",
    policyApproved: false,
    taxonomyApproved: false,
    rulesetApproved: false,
    disclosureCollectionAllowed: false,
    relationshipEvaluationAllowed: false,
    identityComparisonAllowed: false,
    recusalProcessingAllowed: false,
    reassignmentAllowed: false,
    waiverAllowed: false,
    exceptionAllowed: false,
    escalationProcessingAllowed: false,
    evidenceRecordingAllowed: false,
    reviewUseAllowed: false,
    workflowActivationAllowed: false,
    prerequisiteSatisfactionAllowed: false,
    productionApprovalAllowed: false,
    readinessTransitionAllowed: false,
  };
}

function exactProposedPolicy() {
  return {
    state: "PROPOSED_NOT_APPROVED",
    conflictRelationshipTaxonomy: {
      decisionId: "conflict_relationship_taxonomy",
      decisionState: "UNRESOLVED_DEFERRED",
      taxonomyShape: "CLOSED_ACTUAL_POTENTIAL_PERCEIVED_RELATIONSHIP_TAXONOMY",
      unclassifiedRelationshipFailsClosed: true,
      activeCategoryCount: 0,
      ruleActive: false,
    },
    selfDisclosureBoundary: {
      decisionId: "self_disclosure_boundary",
      decisionState: "UNRESOLVED_DEFERRED",
      boundaryShape: "FUTURE_PRIVATE_MINIMUM_NECESSARY_DECLARATION",
      selfClearanceAllowed: false,
      collectionAllowed: false,
      evaluationAllowed: false,
      ruleActive: false,
    },
    candidateContentSourceRelationships: {
      decisionId: "candidate_content_source_relationships",
      decisionState: "UNRESOLVED_DEFERRED",
      relationshipShape: "AUTHOR_AND_SOURCE_RELATIONSHIP_EVALUATION",
      authorshipRecordingAllowed: false,
      sourceRelationshipRecordingAllowed: false,
      identityComparisonAllowed: false,
      ruleActive: false,
    },
    commercialFinancialRelationships: {
      decisionId: "commercial_financial_relationships",
      decisionState: "UNRESOLVED_DEFERRED",
      relationshipShape: "COMMERCIAL_FINANCIAL_VENDOR_PROVIDER_MATERIALITY_REVIEW",
      materialityBoundaryApproved: false,
      relationshipRecordingAllowed: false,
      providerIntegrationAllowed: false,
      ruleActive: false,
    },
    recusalReassignmentRequirements: {
      decisionId: "recusal_reassignment_requirements",
      decisionState: "UNRESOLVED_DEFERRED",
      requirementShape: "FAIL_CLOSED_RECUSAL_THEN_INDEPENDENT_REASSIGNMENT",
      unresolvedConflictFailsClosed: true,
      recusalProcessingAllowed: false,
      reassignmentAllowed: false,
      ruleActive: false,
    },
    lateDisclosureHandling: {
      decisionId: "late_disclosure_handling",
      decisionState: "UNRESOLVED_DEFERRED",
      handlingShape: "CONTAIN_REEVALUATE_AFFECTED_DECISIONS_REMEDIATE",
      affectedDecisionAuthorizationAllowed: false,
      processingActive: false,
    },
    waiverExceptionBoundaries: {
      decisionId: "waiver_exception_boundaries",
      decisionState: "UNRESOLVED_DEFERRED",
      boundaryShape: "SEPARATE_TIME_BOUND_INDEPENDENT_REVIEW",
      selfAuthorizationAllowed: false,
      disclosureSuppressionAllowed: false,
      missingGateBypassAllowed: false,
      productionBypassAllowed: false,
      ruleActive: false,
    },
    escalationAuthority: {
      decisionId: "escalation_authority",
      decisionState: "UNRESOLVED_DEFERRED",
      authorityShape: "SEPARATE_UNASSIGNED_ORGANIZATIONAL_AUTHORITY",
      authorityAssigned: false,
      appealBoundaryApproved: false,
      processingActive: false,
    },
    futureAuditEvidenceRequirements: {
      decisionId: "future_audit_evidence_requirements",
      decisionState: "UNRESOLVED_DEFERRED",
      evidenceShape: "FUTURE_MINIMUM_NECESSARY_ACCESS_CONTROLLED_RETAINED_EVIDENCE",
      evidenceRecorded: false,
      auditProven: false,
    },
    separationOfDutiesDependency: {
      decisionId: "separation_of_duties_dependency",
      decisionState: "UNRESOLVED_DEFERRED",
      dependencyShape: "EXACT_SLICE_4_PROPOSAL_NON_AUTHORIZING",
      dependencySatisfied: false,
      enforcementActive: false,
      ruleActive: false,
    },
  };
}

function validateUpstream(upstream) {
  const prerequisite = upstream.activationPrerequisites.prerequisites?.find(
    ({ prerequisiteId }) => prerequisiteId === "conflict_of_interest_policy",
  );
  exact(
    {
      artifactVersion:
        upstream.activationPrerequisites.metadata?.activationPrerequisitesArtifactVersion,
      artifactStatus: upstream.activationPrerequisites.metadata?.status,
      readiness: upstream.activationPrerequisites.readiness,
      activationBoundary: upstream.activationPrerequisites.activationBoundary,
      prerequisite,
      prerequisiteCount: upstream.activationPrerequisites.aggregate?.prerequisiteCount,
      satisfiedPrerequisiteCount:
        upstream.activationPrerequisites.aggregate?.satisfiedPrerequisiteCount,
      productionApprovalCount: upstream.activationPrerequisites.aggregate?.productionApprovalCount,
    },
    {
      artifactVersion: expectedActivationVersion,
      artifactStatus: "blocked_prerequisites_only_non_production",
      readiness: {
        policyVersion: expectedReadinessPolicyVersion,
        status: "NOT_READY",
        blockingReasons: requiredBlockingReasons,
      },
      activationBoundary: {
        status: "BLOCKED",
        reviewWorkflowStatus: "INACTIVE",
        activationAllowed: false,
        reviewWorkflowActivationAllowed: false,
        readinessTransitionAllowed: false,
        productionApprovalAllowed: false,
      },
      prerequisite: {
        prerequisiteId: "conflict_of_interest_policy",
        status: "UNSATISFIED_DEFERRED",
        ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
        evidenceRequirementDescription:
          "Future versioned disclosure, evaluation, recusal, reassignment, escalation and late-disclosure handling policy.",
        evidenceRecordRefs: [],
      },
      prerequisiteCount: 12,
      satisfiedPrerequisiteCount: 0,
      productionApprovalCount: 0,
    },
    "upstream.activationPrerequisites",
  );

  exact(
    {
      artifactVersion: upstream.conflictPlaceholder.metadata?.policyArtifactVersion,
      policyVersion: upstream.conflictPlaceholder.policyIdentity?.policyVersion,
      policyState: upstream.conflictPlaceholder.policyIdentity?.policyState,
      prerequisite: upstream.conflictPlaceholder.prerequisiteReference,
      readiness: upstream.conflictPlaceholder.readiness,
      activationStatus: upstream.conflictPlaceholder.activationBoundary?.status,
      workflowStatus: upstream.conflictPlaceholder.activationBoundary?.reviewWorkflowStatus,
      activeConflictRuleCount: upstream.conflictPlaceholder.aggregate?.activeConflictRuleCount,
      conflictRecordCount: upstream.conflictPlaceholder.aggregate?.conflictRecordCount,
      disclosureRecordCount: upstream.conflictPlaceholder.aggregate?.disclosureRecordCount,
      recusalRecordCount: upstream.conflictPlaceholder.aggregate?.recusalRecordCount,
      waiverRecordCount: upstream.conflictPlaceholder.aggregate?.waiverRecordCount,
      productionApprovalCount: upstream.conflictPlaceholder.aggregate?.productionApprovalCount,
    },
    {
      artifactVersion: expectedConflictPlaceholderVersion,
      policyVersion: expectedConflictPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisite: {
        prerequisiteId: "conflict_of_interest_policy",
        status: "UNSATISFIED_DEFERRED",
        ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
        evidenceRequirementDescription:
          "Future versioned disclosure, evaluation, recusal, reassignment, escalation and late-disclosure handling policy.",
        evidenceRecordRefs: [],
      },
      readiness: {
        policyVersion: expectedReadinessPolicyVersion,
        status: "NOT_READY",
        blockingReasons: requiredBlockingReasons,
      },
      activationStatus: "BLOCKED",
      workflowStatus: "INACTIVE",
      activeConflictRuleCount: 0,
      conflictRecordCount: 0,
      disclosureRecordCount: 0,
      recusalRecordCount: 0,
      waiverRecordCount: 0,
      productionApprovalCount: 0,
    },
    "upstream.conflictPlaceholder",
  );

  exact(
    {
      artifactVersion: upstream.separationProposal.metadata?.proposalArtifactVersion,
      proposalVersion: upstream.separationProposal.metadata?.proposalVersion,
      proposalStatus: upstream.separationProposal.metadata?.status,
      readiness: upstream.separationProposal.currentBaseline?.readiness,
      activation: upstream.separationProposal.currentBaseline?.activation,
      prerequisite: upstream.separationProposal.currentBaseline?.separationOfDutiesPrerequisite,
      boundary: upstream.separationProposal.proposalBoundary,
      satisfiedPrerequisiteCount: upstream.separationProposal.aggregate?.satisfiedPrerequisiteCount,
      activeEnforcementRuleCount: upstream.separationProposal.aggregate?.activeEnforcementRuleCount,
      productionApprovalCount: upstream.separationProposal.aggregate?.productionApprovalCount,
    },
    {
      artifactVersion: expectedSeparationProposalVersion,
      proposalVersion: "wave-6.slice-4.diagnostic-separation-of-duties-policy.proposal.v1",
      proposalStatus: "PROPOSED_DEFERRED",
      readiness: {
        policyVersion: expectedReadinessPolicyVersion,
        status: "NOT_READY",
        blockingReasons: requiredBlockingReasons,
      },
      activation: { status: "BLOCKED", workflowStatus: "INACTIVE" },
      prerequisite: {
        prerequisiteId: "separation_of_duties_enforcement",
        status: "UNSATISFIED_DEFERRED",
        ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
        evidenceRecordRefs: [],
      },
      boundary: {
        proposalStatus: "PROPOSED_DEFERRED",
        policyApproved: false,
        rulesetApproved: false,
        enforcementAllowed: false,
        assignmentEvaluationAllowed: false,
        decisionEvaluationAllowed: false,
        identityComparisonAllowed: false,
        exceptionAllowed: false,
        violationProcessingAllowed: false,
        reviewUseAllowed: false,
        workflowActivationAllowed: false,
        prerequisiteSatisfactionAllowed: false,
        productionApprovalAllowed: false,
        readinessTransitionAllowed: false,
      },
      satisfiedPrerequisiteCount: 0,
      activeEnforcementRuleCount: 0,
      productionApprovalCount: 0,
    },
    "upstream.separationProposal",
  );

  exact(
    {
      artifactVersion: upstream.roleOwnershipProposal.metadata?.proposalArtifactVersion,
      proposalVersion: upstream.roleOwnershipProposal.metadata?.proposalVersion,
      proposalStatus: upstream.roleOwnershipProposal.metadata?.status,
      readiness: upstream.roleOwnershipProposal.currentBaseline?.readiness,
      activation: upstream.roleOwnershipProposal.currentBaseline?.activation,
      satisfiedPrerequisiteCount:
        upstream.roleOwnershipProposal.aggregate?.satisfiedPrerequisiteCount,
      ownerAssignmentCount: upstream.roleOwnershipProposal.aggregate?.ownerAssignmentCount,
      reviewerIdentityCount: upstream.roleOwnershipProposal.aggregate?.reviewerIdentityCount,
      reviewerAssignmentCount: upstream.roleOwnershipProposal.aggregate?.reviewerAssignmentCount,
      productionApprovalCount: upstream.roleOwnershipProposal.aggregate?.productionApprovalCount,
    },
    {
      artifactVersion: expectedRoleOwnershipProposalVersion,
      proposalVersion: "wave-6.slice-3.diagnostic-reviewer-role-ownership-policy.proposal.v1",
      proposalStatus: "PROPOSED_DEFERRED",
      readiness: {
        policyVersion: expectedReadinessPolicyVersion,
        status: "NOT_READY",
        blockingReasons: requiredBlockingReasons,
      },
      activation: { status: "BLOCKED", workflowStatus: "INACTIVE" },
      satisfiedPrerequisiteCount: 0,
      ownerAssignmentCount: 0,
      reviewerIdentityCount: 0,
      reviewerAssignmentCount: 0,
      productionApprovalCount: 0,
    },
    "upstream.roleOwnershipProposal",
  );

  for (const [
    name,
    artifact,
    artifactVersion,
    policyVersion,
    prerequisiteId,
    extraActual,
    extraExpected,
  ] of [
    [
      "auditPlaceholder",
      upstream.auditPlaceholder,
      expectedAuditPlaceholderVersion,
      "wave-5.slice-8.diagnostic-audit-identity.placeholder.v1",
      "audit_identity_policy",
      {
        activeRuleCount: upstream.auditPlaceholder.aggregate?.activeIdentityRuleCount,
        auditEventCount: upstream.auditPlaceholder.aggregate?.auditEventCount,
      },
      { activeRuleCount: 0, auditEventCount: 0 },
    ],
    [
      "evidencePlaceholder",
      upstream.evidencePlaceholder,
      expectedEvidencePlaceholderVersion,
      "wave-5.slice-9.diagnostic-evidence-storage-and-retention.placeholder.v1",
      "evidence_storage_and_retention_policy",
      {
        activeRuleCount: upstream.evidencePlaceholder.aggregate?.activeStorageRuleCount,
        auditEventCount: upstream.evidencePlaceholder.aggregate?.auditEventCount,
      },
      { activeRuleCount: 0, auditEventCount: 0 },
    ],
  ]) {
    exact(
      {
        artifactVersion: artifact.metadata?.policyArtifactVersion,
        policyVersion: artifact.policyIdentity?.policyVersion,
        policyState: artifact.policyIdentity?.policyState,
        prerequisiteId: artifact.prerequisiteReference?.prerequisiteId,
        prerequisiteStatus: artifact.prerequisiteReference?.status,
        readiness: artifact.readiness,
        activationStatus: artifact.activationBoundary?.status,
        workflowStatus: artifact.activationBoundary?.reviewWorkflowStatus,
        productionApprovalCount: artifact.aggregate?.productionApprovalCount,
        ...extraActual,
      },
      {
        artifactVersion,
        policyVersion,
        policyState: "UNRESOLVED_DEFERRED",
        prerequisiteId,
        prerequisiteStatus: "UNSATISFIED_DEFERRED",
        readiness: {
          policyVersion: expectedReadinessPolicyVersion,
          status: "NOT_READY",
          blockingReasons: requiredBlockingReasons,
        },
        activationStatus: "BLOCKED",
        workflowStatus: "INACTIVE",
        productionApprovalCount: 0,
        ...extraExpected,
      },
      `upstream.${name}`,
    );
  }

  exact(
    {
      artifactVersion: upstream.reviewAuthority.metadata?.authorityArtifactVersion,
      policyVersion: upstream.reviewAuthority.authorityPolicy?.policyVersion,
      policyState: upstream.reviewAuthority.authorityPolicy?.policyState,
      runtimeAuthorityAllowed: upstream.reviewAuthority.authorityPolicy?.runtimeAuthorityAllowed,
      reviewDecisionAuthorityAllowed:
        upstream.reviewAuthority.authorityPolicy?.reviewDecisionAuthorityAllowed,
      productionApprovalAuthorityAllowed:
        upstream.reviewAuthority.authorityPolicy?.productionApprovalAuthorityAllowed,
      productionApprovalCount: upstream.reviewAuthority.aggregate?.productionApprovalCount,
    },
    {
      artifactVersion: expectedAuthorityVersion,
      policyVersion: "wave-4.slice-8.diagnostic-review-authority.placeholder.v1",
      policyState: "DEFERRED_NON_PRODUCTION",
      runtimeAuthorityAllowed: false,
      reviewDecisionAuthorityAllowed: false,
      productionApprovalAuthorityAllowed: false,
      productionApprovalCount: 0,
    },
    "upstream.reviewAuthority",
  );
  exact(
    {
      artifactVersion: upstream.reviewWorkflow.metadata?.workflowArtifactVersion,
      workflowVersion: upstream.reviewWorkflow.workflowPolicy?.workflowVersion,
      policyState: upstream.reviewWorkflow.workflowPolicy?.policyState,
      runtimeActivationAllowed: upstream.reviewWorkflow.workflowPolicy?.runtimeActivationAllowed,
      activeReviewCount: upstream.reviewWorkflow.aggregate?.activeReviewCount,
      productionApprovalCount: upstream.reviewWorkflow.aggregate?.productionApprovalCount,
    },
    {
      artifactVersion: expectedWorkflowVersion,
      workflowVersion: "wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1",
      policyState: "DEFERRED_NON_PRODUCTION",
      runtimeActivationAllowed: false,
      activeReviewCount: 0,
      productionApprovalCount: 0,
    },
    "upstream.reviewWorkflow",
  );
}

export async function readDiagnosticConflictOfInterestPolicyDecisionProposal(
  artifactPath = defaultProposalPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticConflictOfInterestPolicyDecisionProposalUpstream() {
  const entries = await Promise.all(
    Object.entries(upstreamPaths).map(async ([name, artifactPath]) => [
      name,
      JSON.parse(await readFile(artifactPath, "utf8")),
    ]),
  );
  return Object.fromEntries(entries);
}

export function validateDiagnosticConflictOfInterestPolicyDecisionProposal(artifact, upstream) {
  if (!isObject(artifact)) fail("Decision proposal must be a JSON object.");
  if (!isObject(upstream)) fail("Upstream artifacts must be an object.");
  scan(artifact);
  const recordFields = [
    "policyDecisionRecords",
    "realPrincipalRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "roleAssignmentRecords",
    "reviewerAssignmentRecords",
    "conflictRelationshipRecords",
    "conflictDisclosureRecords",
    "conflictEvaluationRecords",
    "recusalRecords",
    "reassignmentRecords",
    "lateDisclosureRecords",
    "waiverRecords",
    "exceptionRecords",
    "escalationAuthorityAssignmentRecords",
    "escalationRecords",
    "auditEvidenceRecords",
    "separationEnforcementRecords",
    "activeConflictRuleRecords",
    "reviewDecisionRecords",
    "approvedDecisionRecords",
    "productionApprovalRecords",
  ];
  requireExactFields(
    artifact,
    [
      "metadata",
      "upstreamReferences",
      "currentBaseline",
      "proposalBoundary",
      "conflictCategoryTaxonomyPlaceholders",
      "proposedPolicy",
      "unresolvedDecisions",
      "syntheticExamples",
      "recordBoundary",
      "aggregate",
      ...recordFields,
    ],
    "$",
  );
  exact(artifact.metadata, exactMetadata(), "metadata");
  exact(artifact.upstreamReferences, exactUpstreamReferences(), "upstreamReferences");
  exact(artifact.currentBaseline, exactBaseline(), "currentBaseline");
  exact(artifact.proposalBoundary, exactProposalBoundary(), "proposalBoundary");
  exact(
    artifact.conflictCategoryTaxonomyPlaceholders,
    expectedConflictTaxonomy.map(([categoryPlaceholderId, categoryScope]) => ({
      categoryPlaceholderId,
      categoryScope,
      recordState: "TAXONOMY_ONLY",
    })),
    "conflictCategoryTaxonomyPlaceholders",
  );
  exact(artifact.proposedPolicy, exactProposedPolicy(), "proposedPolicy");
  exact(
    artifact.unresolvedDecisions,
    expectedDecisionIds.map((decisionId) => ({
      decisionId,
      state: "UNRESOLVED_DEFERRED",
      decisionRecordRef: null,
    })),
    "unresolvedDecisions",
  );

  if (!Array.isArray(artifact.syntheticExamples) || artifact.syntheticExamples.length !== 8) {
    fail("syntheticExamples must contain exactly 8 values.");
  }
  const seenVectorRefs = new Set();
  let acceptedCount = 0;
  let rejectedCount = 0;
  for (const [index, vector] of artifact.syntheticExamples.entries()) {
    const fieldPath = `syntheticExamples[${index}]`;
    requireExactFields(
      vector,
      [
        "vectorRef",
        "vectorType",
        "scenarioCode",
        "abstractInputTokens",
        "expectedDisposition",
        "rejectionReasonCode",
        "markers",
      ],
      fieldPath,
    );
    if (!/^synthetic-[a-z0-9-]+$/.test(vector.vectorRef)) {
      fail(`${fieldPath}.vectorRef must be a synthetic reference.`);
    }
    if (seenVectorRefs.has(vector.vectorRef)) fail(`${fieldPath}.vectorRef must be unique.`);
    seenVectorRefs.add(vector.vectorRef);
    if (!/^[A-Z_]+$/.test(vector.scenarioCode)) {
      fail(`${fieldPath}.scenarioCode must be symbolic.`);
    }
    if (
      !Array.isArray(vector.abstractInputTokens) ||
      vector.abstractInputTokens.length === 0 ||
      vector.abstractInputTokens.some((token) => !/^SYNTHETIC_[A-Z_]+$/.test(token))
    ) {
      fail(`${fieldPath}.abstractInputTokens must contain only synthetic tokens.`);
    }
    exact(vector.markers, expectedMarkers, `${fieldPath}.markers`);
    if (vector.vectorType === "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR") {
      acceptedCount += 1;
      exact(
        {
          expectedDisposition: vector.expectedDisposition,
          rejectionReasonCode: vector.rejectionReasonCode,
        },
        {
          expectedDisposition: "PROPOSED_NON_OPERATIONAL_REFERENCE",
          rejectionReasonCode: null,
        },
        fieldPath,
      );
    } else if (vector.vectorType === "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR") {
      rejectedCount += 1;
      if (
        vector.expectedDisposition !== "REJECT" ||
        !/^[A-Z_]+$/.test(vector.rejectionReasonCode ?? "")
      ) {
        fail(`${fieldPath} rejected vector must carry an exact reason code.`);
      }
    } else {
      fail(`${fieldPath}.vectorType is not allowed.`);
    }
  }
  if (acceptedCount !== 4 || rejectedCount !== 4) {
    fail("Synthetic examples must remain 4 accepted and 4 rejected.");
  }

  exact(
    artifact.recordBoundary,
    {
      ...Object.fromEntries(recordFields.map((field) => [field, false])),
      runtimeConflictEvaluationEnabled: false,
    },
    "recordBoundary",
  );
  exact(
    artifact.aggregate,
    {
      syntheticExampleCount: 8,
      acceptedSyntheticExampleCount: 4,
      rejectedSyntheticExampleCount: 4,
      unresolvedDecisionCount: 10,
      conflictCategoryPlaceholderCount: 7,
      satisfiedPrerequisiteCount: 0,
      policyDecisionCount: 0,
      realPrincipalCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      roleAssignmentCount: 0,
      reviewerAssignmentCount: 0,
      conflictRelationshipCount: 0,
      conflictDisclosureCount: 0,
      conflictEvaluationCount: 0,
      recusalCount: 0,
      reassignmentCount: 0,
      lateDisclosureCount: 0,
      waiverCount: 0,
      exceptionCount: 0,
      escalationAuthorityAssignmentCount: 0,
      escalationCount: 0,
      auditEvidenceCount: 0,
      separationEnforcementCount: 0,
      activeConflictRuleCount: 0,
      reviewDecisionCount: 0,
      approvedDecisionCount: 0,
      approvedCandidateCount: 0,
      productionApprovalCount: 0,
    },
    "aggregate",
  );
  for (const field of recordFields) exact(artifact[field], [], field);
  validateUpstream(upstream);

  return {
    proposalArtifactVersion: expectedProposalArtifactVersion,
    proposalVersion: expectedProposalVersion,
    proposalStatus: artifact.metadata.status,
    prerequisiteStatus: artifact.currentBaseline.conflictOfInterestPrerequisite.status,
    separationDependencyStatus: artifact.proposedPolicy.separationOfDutiesDependency.decisionState,
    syntheticExampleCount: artifact.aggregate.syntheticExampleCount,
    acceptedSyntheticExampleCount: artifact.aggregate.acceptedSyntheticExampleCount,
    rejectedSyntheticExampleCount: artifact.aggregate.rejectedSyntheticExampleCount,
    unresolvedDecisionCount: artifact.aggregate.unresolvedDecisionCount,
    activeConflictRuleCount: artifact.aggregate.activeConflictRuleCount,
    satisfiedPrerequisiteCount: artifact.aggregate.satisfiedPrerequisiteCount,
    conflictDisclosureCount: artifact.aggregate.conflictDisclosureCount,
    recusalCount: artifact.aggregate.recusalCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.currentBaseline.activation.status,
    workflowStatus: artifact.currentBaseline.activation.workflowStatus,
    readiness: artifact.currentBaseline.readiness.status,
  };
}

export function validateConflictOfInterestDecisionProposalChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length) {
    fail("Changed paths must not contain duplicates.");
  }
  const unexpected = normalized.filter((value) => !changedPathSet.has(value));
  if (unexpected.length > 0) {
    fail(`Wave 6 Slice 5 out-of-scope path changed: ${unexpected[0]}.`);
  }
  if (normalized.length !== changedPaths.length) {
    fail(`Wave 6 Slice 5 requires exactly ${changedPaths.length} changed paths.`);
  }
  return normalized;
}

export function validateConflictOfInterestDecisionProposalSlice6ChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length) {
    fail("Changed paths must not contain duplicates.");
  }
  const unexpected = normalized.filter((value) => !slice6ChangedPathSet.has(value));
  if (unexpected.length > 0) {
    fail(`Wave 6 Slice 6 out-of-scope path changed: ${unexpected[0]}.`);
  }
  if (normalized.length !== slice6ChangedPaths.length) {
    fail(`Wave 6 Slice 6 requires exactly ${slice6ChangedPaths.length} changed paths.`);
  }
  return normalized;
}

export function validateConflictOfInterestDecisionProposalSlice7ChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length) {
    fail("Changed paths must not contain duplicates.");
  }
  const unexpected = normalized.filter((value) => !slice7ChangedPathSet.has(value));
  if (unexpected.length > 0) {
    fail(`Wave 6 Slice 7 out-of-scope path changed: ${unexpected[0]}.`);
  }
  if (normalized.length !== slice7ChangedPaths.length) {
    fail(`Wave 6 Slice 7 requires exactly ${slice7ChangedPaths.length} changed paths.`);
  }
  return normalized;
}

function defaultGitRunner(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
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
  if (!isCommitSha(sha)) {
    fail(
      `BLOCK: CI ${label} commit is unavailable or invalid; exact changed-path range cannot be determined.`,
    );
  }
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
  if (!isCommitSha(base) || !isCommitSha(head)) {
    fail("BLOCK: exact GitHub Actions base/head range is unavailable.");
  }
  requireCommitObject(base, "base", { cwd, runGit });
  requireCommitObject(head, "head", { cwd, runGit });
  return { base, head };
}

function diffPaths({ cwd, base, head, runGit }) {
  const result = runGit(
    ["diff", "--name-status", "--find-renames", "--no-ext-diff", "-z", base, head],
    cwd,
  );
  if (result.status !== 0) {
    fail(`BLOCK: CI changed-path range could not be read: ${result.stderr || result.stdout}`);
  }
  const tokens = result.stdout.split("\0").filter(Boolean);
  const paths = [];
  for (let index = 0; index < tokens.length;) {
    const status = tokens[index++];
    const pathCount = /^[RC]/.test(status) ? 2 : 1;
    if (tokens.length - index < pathCount) {
      fail("BLOCK: CI changed-path range was malformed; exact scope cannot be determined.");
    }
    for (let pathIndex = 0; pathIndex < pathCount; pathIndex += 1) {
      paths.push(tokens[index++].replaceAll("\\", "/"));
    }
  }
  if (paths.length === 0) {
    fail("BLOCK: CI changed-path collection returned an empty path list.");
  }
  return paths;
}

export function collectConflictOfInterestDecisionProposalChangedPaths({
  cwd = repoRoot,
  env = process.env,
  runGit = defaultGitRunner,
  readEvent = readCiEvent,
} = {}) {
  if (String(env.GITHUB_ACTIONS ?? "").toLowerCase() !== "true") {
    return localWorktreePaths({ cwd, runGit });
  }
  const { base, head } = ciCommitRange({ cwd, env, runGit, readEvent });
  const paths = diffPaths({ cwd, base, head, runGit });
  if (
    paths.length === slice7ChangedPaths.length &&
    paths.every((value) => slice7ChangedPathSet.has(value))
  ) {
    return validateConflictOfInterestDecisionProposalSlice7ChangedPaths(paths);
  }
  return paths.length === slice6ChangedPaths.length &&
    paths.every((value) => slice6ChangedPathSet.has(value))
    ? validateConflictOfInterestDecisionProposalSlice6ChangedPaths(paths)
    : paths;
}

export function validateConflictOfInterestDecisionProposalWorktreeScope(
  paths,
  { env = process.env } = {},
) {
  const inGitHubActions = String(env.GITHUB_ACTIONS ?? "").toLowerCase() === "true";
  if (!inGitHubActions && Array.isArray(paths) && paths.length === 0) return [];
  if (
    Array.isArray(paths) &&
    paths.length === slice7ChangedPaths.length &&
    paths.every((value) => slice7ChangedPathSet.has(value))
  ) {
    return validateConflictOfInterestDecisionProposalSlice7ChangedPaths(paths);
  }
  if (
    Array.isArray(paths) &&
    paths.length === slice6ChangedPaths.length &&
    paths.every((value) => slice6ChangedPathSet.has(value))
  ) {
    return validateConflictOfInterestDecisionProposalSlice6ChangedPaths(paths);
  }
  return validateConflictOfInterestDecisionProposalChangedPaths(paths);
}

export async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticConflictOfInterestPolicyDecisionProposal(),
    readDiagnosticConflictOfInterestPolicyDecisionProposalUpstream(),
  ]);
  const summary = validateDiagnosticConflictOfInterestPolicyDecisionProposal(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    const paths = collectConflictOfInterestDecisionProposalChangedPaths();
    validateConflictOfInterestDecisionProposalWorktreeScope(paths);
  }
  console.log(
    `[curriculum] Conflict-of-interest decision proposal ${summary.proposalArtifactVersion} validated: ${summary.syntheticExampleCount} synthetic vectors, ${summary.unresolvedDecisionCount} unresolved decisions, ${summary.activeConflictRuleCount} active rules, ${summary.satisfiedPrerequisiteCount} satisfied prerequisites, ${summary.productionApprovalCount} production approvals; proposal ${summary.proposalStatus}, prerequisite ${summary.prerequisiteStatus}, separation dependency ${summary.separationDependencyStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
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
