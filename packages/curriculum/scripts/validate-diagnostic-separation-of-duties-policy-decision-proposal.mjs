import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const expectedProposalArtifactVersion = "wave-6.slice-4.grade-7-9-math.v1";
const expectedProposalVersion = "wave-6.slice-4.diagnostic-separation-of-duties-policy.proposal.v1";
const expectedActivationVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedSeparationPlaceholderVersion = "wave-5.slice-6.grade-7-9-math.v1";
const expectedSeparationPolicyVersion =
  "wave-5.slice-6.diagnostic-separation-of-duties-enforcement.placeholder.v1";
const expectedRoleOwnershipProposalVersion = "wave-6.slice-3.grade-7-9-math.v1";
const expectedConflictPlaceholderVersion = "wave-5.slice-7.grade-7-9-math.v1";
const expectedConflictPolicyVersion =
  "wave-5.slice-7.diagnostic-conflict-of-interest.placeholder.v1";
const expectedAuditPlaceholderVersion = "wave-5.slice-8.grade-7-9-math.v1";
const expectedAuditPolicyVersion = "wave-5.slice-8.diagnostic-audit-identity.placeholder.v1";
const expectedAuthorityVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedWorkflowVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const requiredBlockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];

const expectedRoleTaxonomy = [
  ["METHODOLOGY_REVIEWER_PLACEHOLDER", "methodology"],
  ["SAFETY_REVIEWER_PLACEHOLDER", "safety_no_answer"],
  ["RIGHTS_REVIEWER_PLACEHOLDER", "rights_copyright"],
  ["GRADE_PLACEMENT_REVIEWER_PLACEHOLDER", "grade_placement"],
  ["ACCESSIBILITY_REVIEWER_PLACEHOLDER", "accessibility_readability"],
  ["PRODUCTION_APPROVER_PLACEHOLDER", "production_approval"],
  ["AUDIT_OBSERVER_PLACEHOLDER", "audit_observation"],
];
const expectedDecisionIds = [
  "maker_checker_separation",
  "author_reviewer_approver_separation",
  "reviewer_role_incompatibilities",
  "audit_observer_separation",
  "conflict_of_interest_dependency",
  "emergency_exception_boundaries",
  "violation_handling",
  "future_enforcement_evidence",
  "future_policy_gate_requirements",
];
const expectedMarkers = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NON_OPERATIONAL: true,
  NOT_ASSIGNED: true,
  NOT_ENFORCED: true,
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
  "docs/wave-6/diagnostic-separation-of-duties-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-4-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
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
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-canonicalization-digest-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];
const changedPathSet = new Set(changedPaths);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultProposalPath = path.resolve(
  scriptDir,
  "../diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
);
const upstreamPaths = {
  activationPrerequisites: path.resolve(
    scriptDir,
    "../diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  ),
  separationPlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-separation-of-duties-policy/grade-7-9-math.separation-of-duties-policy-placeholder.v1.json",
  ),
  reviewerRoleOwnershipProposal: path.resolve(
    scriptDir,
    "../diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
  ),
  conflictPlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-conflict-of-interest-policy/grade-7-9-math.conflict-of-interest-policy-placeholder.v1.json",
  ),
  auditPlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
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

export class DiagnosticSeparationOfDutiesDecisionProposalValidationError extends Error {}

function fail(message) {
  throw new DiagnosticSeparationOfDutiesDecisionProposalValidationError(message);
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
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    for (const key of actualKeys) {
      if (!Object.hasOwn(expected, key)) fail(`${fieldPath}.${key} is unexpected.`);
    }
    for (const key of expectedKeys) {
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
    schemaVersion: "learnika.diagnosticSeparationOfDutiesPolicyDecisionProposal.v1",
    proposalArtifactVersion: expectedProposalArtifactVersion,
    proposalId: "diagnostic-separation-of-duties-policy-decision-proposal",
    proposalVersion: expectedProposalVersion,
    status: "PROPOSED_DEFERRED",
    artifactKind: "diagnostic_separation_of_duties_policy_decision_proposal",
    subject: "math",
    locale: "ru-RU",
    audienceGrades: [7, 8, 9],
    activationPrerequisitesArtifactVersion: expectedActivationVersion,
    separationOfDutiesPolicyPlaceholderArtifactVersion: expectedSeparationPlaceholderVersion,
    reviewerRoleOwnershipDecisionProposalArtifactVersion: expectedRoleOwnershipProposalVersion,
    conflictOfInterestPolicyPlaceholderArtifactVersion: expectedConflictPlaceholderVersion,
    auditIdentityPolicyPlaceholderArtifactVersion: expectedAuditPlaceholderVersion,
    reviewAuthorityArtifactVersion: expectedAuthorityVersion,
    reviewWorkflowStateArtifactVersion: expectedWorkflowVersion,
    diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
    sourceContract: "docs/wave-6/diagnostic-separation-of-duties-policy-decision-proposal.md",
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
      prerequisiteId: "separation_of_duties_enforcement",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
      evidenceRecordRefs: [],
      prerequisiteCount: 12,
      satisfiedPrerequisiteCount: 0,
      productionApprovalCount: 0,
    },
    separationOfDutiesPlaceholder: {
      artifactPath:
        "packages/curriculum/diagnostic-separation-of-duties-policy/grade-7-9-math.separation-of-duties-policy-placeholder.v1.json",
      artifactVersion: expectedSeparationPlaceholderVersion,
      policyVersion: expectedSeparationPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      rolePlaceholderCount: 7,
      decisionRequirementCount: 9,
      activeEnforcementRuleCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      reviewerAssignmentCount: 0,
      conflictRecordCount: 0,
      violationRecordCount: 0,
      productionApprovalCount: 0,
    },
    reviewerRoleOwnershipDecisionProposal: {
      artifactPath:
        "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
      artifactVersion: expectedRoleOwnershipProposalVersion,
      proposalVersion: "wave-6.slice-3.diagnostic-reviewer-role-ownership-policy.proposal.v1",
      proposalStatus: "PROPOSED_DEFERRED",
      unresolvedDecisionCount: 8,
      roleTaxonomyPlaceholderCount: 7,
      ownerAssignmentCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      reviewerAssignmentCount: 0,
      productionApprovalCount: 0,
    },
    conflictOfInterestPlaceholder: {
      artifactPath:
        "packages/curriculum/diagnostic-conflict-of-interest-policy/grade-7-9-math.conflict-of-interest-policy-placeholder.v1.json",
      artifactVersion: expectedConflictPlaceholderVersion,
      policyVersion: expectedConflictPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      activeConflictRuleCount: 0,
      conflictRecordCount: 0,
      disclosureRecordCount: 0,
      recusalRecordCount: 0,
      productionApprovalCount: 0,
    },
    auditIdentityPlaceholder: {
      artifactPath:
        "packages/curriculum/diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
      artifactVersion: expectedAuditPlaceholderVersion,
      policyVersion: expectedAuditPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      activeIdentityRuleCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      identityBindingCount: 0,
      auditEventCount: 0,
      productionApprovalCount: 0,
    },
    reviewAuthority: {
      artifactPath:
        "packages/curriculum/diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
      artifactVersion: expectedAuthorityVersion,
      policyVersion: "wave-4.slice-8.diagnostic-review-authority.placeholder.v1",
      policyState: "DEFERRED_NON_PRODUCTION",
      separationOfDutiesRuleCount: 3,
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
    separationOfDutiesPrerequisite: {
      prerequisiteId: "separation_of_duties_enforcement",
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
  };
}

function exactProposedPolicy() {
  return {
    state: "PROPOSED_NOT_APPROVED",
    makerCheckerSeparation: {
      decisionId: "maker_checker_separation",
      decisionState: "UNRESOLVED_DEFERRED",
      makerShape: "ABSTRACT_AUTHORING_STAGE",
      checkerShape: "ABSTRACT_SUBSTANTIVE_REVIEW_STAGE",
      samePrincipalAllowed: false,
      ruleActive: false,
    },
    authorReviewerApproverSeparation: {
      decisionId: "author_reviewer_approver_separation",
      decisionState: "UNRESOLVED_DEFERRED",
      stageShape: "THREE_DISTINCT_GOVERNANCE_STAGES",
      authorMayReview: false,
      authorMayApprove: false,
      reviewerMayApprove: false,
      ruleActive: false,
    },
    reviewerRoleIncompatibilities: {
      decisionId: "reviewer_role_incompatibilities",
      decisionState: "UNRESOLVED_DEFERRED",
      ruleShape: "EXPLICIT_CLOSED_INCOMPATIBILITY_MATRIX",
      quorumDeduplicationRequired: true,
      activeRuleCount: 0,
      ruleActive: false,
    },
    auditObserverSeparation: {
      decisionId: "audit_observer_separation",
      decisionState: "UNRESOLVED_DEFERRED",
      observerShape: "NON_DECIDING_AUDIT_OBSERVATION_STAGE",
      observerMayReview: false,
      observerMayApprove: false,
      ruleActive: false,
    },
    conflictOfInterestDependency: {
      decisionId: "conflict_of_interest_dependency",
      decisionState: "UNRESOLVED_DEFERRED",
      dependencyShape: "SEPARATE_CONFLICT_POLICY_REQUIRED",
      unresolvedConflictFailsClosed: true,
      dependencySatisfied: false,
      ruleActive: false,
    },
    emergencyExceptionBoundaries: {
      decisionId: "emergency_exception_boundaries",
      decisionState: "UNRESOLVED_DEFERRED",
      boundaryShape: "TIME_BOUND_NON_PRODUCTION_EXCEPTION_REVIEW",
      missingGateBypassAllowed: false,
      productionBypassAllowed: false,
      exceptionRulesActive: false,
    },
    violationHandling: {
      decisionId: "violation_handling",
      decisionState: "UNRESOLVED_DEFERRED",
      handlingShape: "DETECT_CONTAIN_INVALIDATE_REVIEW_REMEDIATE",
      automaticProductionAuthorizationAllowed: false,
      processingActive: false,
    },
    futureEnforcementEvidence: {
      decisionId: "future_enforcement_evidence",
      decisionState: "UNRESOLVED_DEFERRED",
      evidenceShape: "FUTURE_SYNTHETIC_POSITIVE_NEGATIVE_AUTHORIZATION_VECTORS",
      evidenceRecorded: false,
      enforcementProven: false,
    },
    futurePolicyGateRequirements: {
      decisionId: "future_policy_gate_requirements",
      decisionState: "UNRESOLVED_DEFERRED",
      gateShape: "SEPARATE_GOVERNANCE_SECURITY_QA_APPROVAL",
      policyGatePassed: false,
      prerequisiteSatisfied: false,
      activationAllowed: false,
    },
  };
}

function validateUpstream(upstream) {
  const prerequisite = upstream.activationPrerequisites.prerequisites?.find(
    ({ prerequisiteId }) => prerequisiteId === "separation_of_duties_enforcement",
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
        prerequisiteId: "separation_of_duties_enforcement",
        status: "UNSATISFIED_DEFERRED",
        ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
        evidenceRequirementDescription:
          "Future fail-closed assignment-time and decision-time independence policy with positive and negative authorization tests.",
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
      artifactVersion: upstream.separationPlaceholder.metadata?.policyArtifactVersion,
      policyVersion: upstream.separationPlaceholder.policyIdentity?.policyVersion,
      policyState: upstream.separationPlaceholder.policyIdentity?.policyState,
      prerequisite: upstream.separationPlaceholder.prerequisiteReference,
      readiness: upstream.separationPlaceholder.readiness,
      activeEnforcementRuleCount:
        upstream.separationPlaceholder.aggregate?.activeEnforcementRuleCount,
      reviewerAssignmentCount: upstream.separationPlaceholder.aggregate?.reviewerAssignmentCount,
      conflictRecordCount: upstream.separationPlaceholder.aggregate?.conflictRecordCount,
      violationRecordCount: upstream.separationPlaceholder.aggregate?.violationRecordCount,
      productionApprovalCount: upstream.separationPlaceholder.aggregate?.productionApprovalCount,
    },
    {
      artifactVersion: expectedSeparationPlaceholderVersion,
      policyVersion: expectedSeparationPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisite: {
        prerequisiteId: "separation_of_duties_enforcement",
        status: "UNSATISFIED_DEFERRED",
        ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
        evidenceRequirementDescription:
          "Future fail-closed assignment-time and decision-time independence policy with positive and negative authorization tests.",
        evidenceRecordRefs: [],
      },
      readiness: {
        policyVersion: expectedReadinessPolicyVersion,
        status: "NOT_READY",
        blockingReasons: requiredBlockingReasons,
      },
      activeEnforcementRuleCount: 0,
      reviewerAssignmentCount: 0,
      conflictRecordCount: 0,
      violationRecordCount: 0,
      productionApprovalCount: 0,
    },
    "upstream.separationPlaceholder",
  );

  exact(
    {
      artifactVersion: upstream.reviewerRoleOwnershipProposal.metadata?.proposalArtifactVersion,
      proposalVersion: upstream.reviewerRoleOwnershipProposal.metadata?.proposalVersion,
      proposalStatus: upstream.reviewerRoleOwnershipProposal.metadata?.status,
      readiness: upstream.reviewerRoleOwnershipProposal.currentBaseline?.readiness,
      activation: upstream.reviewerRoleOwnershipProposal.currentBaseline?.activation,
      prerequisite:
        upstream.reviewerRoleOwnershipProposal.currentBaseline?.reviewerRoleOwnershipPrerequisite,
      satisfiedPrerequisiteCount:
        upstream.reviewerRoleOwnershipProposal.aggregate?.satisfiedPrerequisiteCount,
      ownerAssignmentCount: upstream.reviewerRoleOwnershipProposal.aggregate?.ownerAssignmentCount,
      reviewerAssignmentCount:
        upstream.reviewerRoleOwnershipProposal.aggregate?.reviewerAssignmentCount,
      productionApprovalCount:
        upstream.reviewerRoleOwnershipProposal.aggregate?.productionApprovalCount,
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
      prerequisite: {
        prerequisiteId: "reviewer_role_ownership",
        status: "UNSATISFIED_DEFERRED",
        ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
        evidenceRecordRefs: [],
      },
      satisfiedPrerequisiteCount: 0,
      ownerAssignmentCount: 0,
      reviewerAssignmentCount: 0,
      productionApprovalCount: 0,
    },
    "upstream.reviewerRoleOwnershipProposal",
  );

  for (const [name, artifact, expectedArtifactVersion, expectedPolicyVersion, prerequisiteId] of [
    [
      "conflictPlaceholder",
      upstream.conflictPlaceholder,
      expectedConflictPlaceholderVersion,
      expectedConflictPolicyVersion,
      "conflict_of_interest_policy",
    ],
    [
      "auditPlaceholder",
      upstream.auditPlaceholder,
      expectedAuditPlaceholderVersion,
      expectedAuditPolicyVersion,
      "audit_identity_policy",
    ],
  ]) {
    exact(
      {
        artifactVersion: artifact.metadata?.policyArtifactVersion,
        policyVersion: artifact.policyIdentity?.policyVersion,
        policyState: artifact.policyIdentity?.policyState,
        prerequisiteId: artifact.prerequisiteReference?.prerequisiteId,
        prerequisiteStatus: artifact.prerequisiteReference?.status,
        ownerPlaceholderId: artifact.prerequisiteReference?.ownerPlaceholderId,
        evidenceRecordRefs: artifact.prerequisiteReference?.evidenceRecordRefs,
        readiness: artifact.readiness,
        activationStatus: artifact.activationBoundary?.status,
        workflowStatus: artifact.activationBoundary?.reviewWorkflowStatus,
        productionApprovalCount: artifact.aggregate?.productionApprovalCount,
      },
      {
        artifactVersion: expectedArtifactVersion,
        policyVersion: expectedPolicyVersion,
        policyState: "UNRESOLVED_DEFERRED",
        prerequisiteId,
        prerequisiteStatus: "UNSATISFIED_DEFERRED",
        ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
        evidenceRecordRefs: [],
        readiness: {
          policyVersion: expectedReadinessPolicyVersion,
          status: "NOT_READY",
          blockingReasons: requiredBlockingReasons,
        },
        activationStatus: "BLOCKED",
        workflowStatus: "INACTIVE",
        productionApprovalCount: 0,
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

export async function readDiagnosticSeparationOfDutiesPolicyDecisionProposal(
  artifactPath = defaultProposalPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticSeparationOfDutiesPolicyDecisionProposalUpstream() {
  const entries = await Promise.all(
    Object.entries(upstreamPaths).map(async ([name, artifactPath]) => [
      name,
      JSON.parse(await readFile(artifactPath, "utf8")),
    ]),
  );
  return Object.fromEntries(entries);
}

export function validateDiagnosticSeparationOfDutiesPolicyDecisionProposal(artifact, upstream) {
  if (!isObject(artifact)) fail("Decision proposal must be a JSON object.");
  if (!isObject(upstream)) fail("Upstream artifacts must be an object.");
  scan(artifact);
  requireExactFields(
    artifact,
    [
      "metadata",
      "upstreamReferences",
      "currentBaseline",
      "proposalBoundary",
      "roleTaxonomyPlaceholders",
      "proposedPolicy",
      "unresolvedDecisions",
      "syntheticExamples",
      "recordBoundary",
      "aggregate",
      "policyDecisionRecords",
      "authorshipRecords",
      "realPrincipalRecords",
      "reviewerIdentityRecords",
      "auditIdentityRecords",
      "roleAssignmentRecords",
      "reviewerAssignmentRecords",
      "conflictDisclosureRecords",
      "conflictEvaluationRecords",
      "recusalRecords",
      "emergencyExceptionRecords",
      "violationRecords",
      "enforcementEvidenceRecords",
      "activeEnforcementRuleRecords",
      "policyGateRecords",
      "reviewDecisionRecords",
      "approvedDecisionRecords",
      "productionApprovalRecords",
    ],
    "$",
  );
  exact(artifact.metadata, exactMetadata(), "metadata");
  exact(artifact.upstreamReferences, exactUpstreamReferences(), "upstreamReferences");
  exact(artifact.currentBaseline, exactBaseline(), "currentBaseline");
  exact(artifact.proposalBoundary, exactProposalBoundary(), "proposalBoundary");
  exact(
    artifact.roleTaxonomyPlaceholders,
    expectedRoleTaxonomy.map(([rolePlaceholderId, scopeRef]) => ({
      rolePlaceholderId,
      scopeRef,
      recordState: "TAXONOMY_ONLY",
    })),
    "roleTaxonomyPlaceholders",
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

  const recordBoundaryFields = [
    "policyDecisionRecords",
    "authorshipRecords",
    "realPrincipalRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "roleAssignmentRecords",
    "reviewerAssignmentRecords",
    "conflictDisclosureRecords",
    "conflictEvaluationRecords",
    "recusalRecords",
    "emergencyExceptionRecords",
    "violationRecords",
    "enforcementEvidenceRecords",
    "activeEnforcementRuleRecords",
    "policyGateRecords",
    "reviewDecisionRecords",
    "approvedDecisionRecords",
    "productionApprovalRecords",
    "runtimeSeparationEnforcementEnabled",
  ];
  exact(
    artifact.recordBoundary,
    Object.fromEntries(recordBoundaryFields.map((field) => [field, false])),
    "recordBoundary",
  );
  const expectedAggregate = {
    syntheticExampleCount: 8,
    acceptedSyntheticExampleCount: 4,
    rejectedSyntheticExampleCount: 4,
    unresolvedDecisionCount: 9,
    roleTaxonomyPlaceholderCount: 7,
    satisfiedPrerequisiteCount: 0,
    policyDecisionCount: 0,
    authorshipRecordCount: 0,
    realPrincipalCount: 0,
    reviewerIdentityCount: 0,
    auditIdentityCount: 0,
    roleAssignmentCount: 0,
    reviewerAssignmentCount: 0,
    conflictDisclosureCount: 0,
    conflictEvaluationCount: 0,
    recusalCount: 0,
    emergencyExceptionCount: 0,
    violationCount: 0,
    enforcementEvidenceCount: 0,
    activeEnforcementRuleCount: 0,
    policyGateRecordCount: 0,
    reviewDecisionCount: 0,
    approvedDecisionCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
  };
  exact(artifact.aggregate, expectedAggregate, "aggregate");
  for (const field of recordBoundaryFields.filter((name) => name.endsWith("Records"))) {
    exact(artifact[field], [], field);
  }
  validateUpstream(upstream);

  return {
    proposalArtifactVersion: expectedProposalArtifactVersion,
    proposalVersion: expectedProposalVersion,
    proposalStatus: artifact.metadata.status,
    prerequisiteStatus: artifact.currentBaseline.separationOfDutiesPrerequisite.status,
    syntheticExampleCount: artifact.aggregate.syntheticExampleCount,
    acceptedSyntheticExampleCount: artifact.aggregate.acceptedSyntheticExampleCount,
    rejectedSyntheticExampleCount: artifact.aggregate.rejectedSyntheticExampleCount,
    unresolvedDecisionCount: artifact.aggregate.unresolvedDecisionCount,
    activeEnforcementRuleCount: artifact.aggregate.activeEnforcementRuleCount,
    satisfiedPrerequisiteCount: artifact.aggregate.satisfiedPrerequisiteCount,
    reviewerIdentityCount: artifact.aggregate.reviewerIdentityCount,
    reviewerAssignmentCount: artifact.aggregate.reviewerAssignmentCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.currentBaseline.activation.status,
    workflowStatus: artifact.currentBaseline.activation.workflowStatus,
    readiness: artifact.currentBaseline.readiness.status,
  };
}

export function validateSeparationOfDutiesDecisionProposalChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length) {
    fail("Changed paths must not contain duplicates.");
  }
  const unexpected = normalized.filter((value) => !changedPathSet.has(value));
  if (unexpected.length > 0) {
    fail(`Wave 6 Slice 4 out-of-scope path changed: ${unexpected[0]}.`);
  }
  if (normalized.length !== changedPaths.length) {
    fail(`Wave 6 Slice 4 requires exactly ${changedPaths.length} changed paths.`);
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
    if (!isCommitSha(head)) {
      fail("BLOCK: GITHUB_SHA is unavailable; exact CI changed-path range cannot be determined.");
    }
    requireCommitObject(head, "head", { cwd, runGit });
    const parentResult = runGit(["rev-list", "--parents", "-n", "1", head], cwd);
    const commits =
      parentResult.status === 0 ? parentResult.stdout.trim().split(/\s+/).filter(Boolean) : [];
    base = commits.length === 2 && commits[0] === head ? commits[1] : undefined;
  }
  if (!isCommitSha(base) || !isCommitSha(head)) {
    fail("BLOCK: exact GitHub Actions base/head range is unavailable.");
  }
  requireCommitObject(base, "base", { cwd, runGit });
  requireCommitObject(head, "head", { cwd, runGit });
  return { base, head };
}

function ciChangedPaths({ cwd, env, runGit, readEvent }) {
  const { base, head } = ciCommitRange({ cwd, env, runGit, readEvent });
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

export function collectSeparationOfDutiesDecisionProposalChangedPaths({
  cwd = repoRoot,
  env = process.env,
  runGit = defaultGitRunner,
  readEvent = readCiEvent,
} = {}) {
  return String(env.GITHUB_ACTIONS ?? "").toLowerCase() === "true"
    ? ciChangedPaths({ cwd, env, runGit, readEvent })
    : localWorktreePaths({ cwd, runGit });
}

export function validateSeparationOfDutiesDecisionProposalWorktreeScope(
  paths,
  { env = process.env } = {},
) {
  const inGitHubActions = String(env.GITHUB_ACTIONS ?? "").toLowerCase() === "true";
  if (!inGitHubActions && Array.isArray(paths) && paths.length === 0) return [];
  return validateSeparationOfDutiesDecisionProposalChangedPaths(paths);
}

export async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticSeparationOfDutiesPolicyDecisionProposal(),
    readDiagnosticSeparationOfDutiesPolicyDecisionProposalUpstream(),
  ]);
  const summary = validateDiagnosticSeparationOfDutiesPolicyDecisionProposal(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    const paths = collectSeparationOfDutiesDecisionProposalChangedPaths();
    validateSeparationOfDutiesDecisionProposalWorktreeScope(paths);
  }
  console.log(
    `[curriculum] Separation-of-duties decision proposal ${summary.proposalArtifactVersion} validated: ${summary.syntheticExampleCount} synthetic vectors, ${summary.unresolvedDecisionCount} unresolved decisions, ${summary.activeEnforcementRuleCount} active rules, ${summary.satisfiedPrerequisiteCount} satisfied prerequisites, ${summary.productionApprovalCount} production approvals; proposal ${summary.proposalStatus}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
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
