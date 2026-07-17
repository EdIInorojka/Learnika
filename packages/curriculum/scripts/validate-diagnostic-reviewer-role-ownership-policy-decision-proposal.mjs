import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const expectedProposalArtifactVersion = "wave-6.slice-3.grade-7-9-math.v1";
const expectedProposalVersion =
  "wave-6.slice-3.diagnostic-reviewer-role-ownership-policy.proposal.v1";
const expectedActivationVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedAuthorityVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedRolePlaceholderVersion = "wave-5.slice-5.grade-7-9-math.v1";
const expectedIdentityPlaceholderVersion = "wave-5.slice-3.grade-7-9-math.v1";
const expectedCanonicalizationPlaceholderVersion = "wave-5.slice-4.grade-7-9-math.v1";
const expectedIdentityProposalVersion = "wave-6.slice-1.grade-7-9-math.v1";
const expectedCanonicalizationProposalVersion = "wave-6.slice-2.grade-7-9-math.v1";
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
  "accountable_role_ownership",
  "role_eligibility_competence_and_independence",
  "appointment_and_assignment_authority",
  "scope_minimum_counts_quorum_and_decision_aggregation",
  "reviewer_lifecycle_expiry_suspension_and_reassignment",
  "delegation_revocation_and_emergency_coverage",
  "policy_maintenance_and_access_review_ownership",
  "reviewer_and_audit_identity_separation",
];
const expectedMarkers = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NOT_A_REAL_ROLE_OWNER: true,
  NOT_ASSIGNED: true,
  NOT_AUTHORIZED: true,
  NOT_ACTIVE: true,
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
const forbiddenConcreteAlgorithmTokens = new Set([
  "md5",
  "sha1",
  "sha224",
  "sha256",
  "sha384",
  "sha512",
  "sha3256",
  "sha3512",
  "blake2",
  "blake3",
  "shake128",
  "shake256",
]);
const candidateLikeValuePattern =
  /dcandidate\.math\.g7-9\.[a-z0-9-]+\.[a-z0-9-]+\.v[0-9]+(?:\.r[0-9]+)?/i;

const changedPaths = [
  "docs/wave-6/diagnostic-reviewer-role-ownership-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-3-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
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
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
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
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
];
const changedPathSet = new Set(changedPaths);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultProposalPath = path.resolve(
  scriptDir,
  "../diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
);
const upstreamPaths = {
  activationPrerequisites: path.resolve(
    scriptDir,
    "../diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  ),
  reviewAuthority: path.resolve(
    scriptDir,
    "../diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
  ),
  reviewerRoleOwnershipPlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-reviewer-role-ownership-policy/grade-7-9-math.reviewer-role-ownership-policy-placeholder.v1.json",
  ),
  identityPlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-candidate-identity-policy/grade-7-9-math.candidate-identity-policy-placeholder.v1.json",
  ),
  canonicalizationPlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json",
  ),
  identityProposal: path.resolve(
    scriptDir,
    "../diagnostic-candidate-identity-policy-decision-proposal/grade-7-9-math.candidate-identity-policy-decision-proposal.v1.json",
  ),
  canonicalizationProposal: path.resolve(
    scriptDir,
    "../diagnostic-canonicalization-digest-policy-decision-proposal/grade-7-9-math.canonicalization-digest-policy-decision-proposal.v1.json",
  ),
};

export class DiagnosticReviewerRoleOwnershipDecisionProposalValidationError extends Error {}

function fail(message) {
  throw new DiagnosticReviewerRoleOwnershipDecisionProposalValidationError(message);
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
  const roleTaxonomyFieldMatch = fieldPath.match(
    /^\$\.roleTaxonomyPlaceholders\[([0-6])\]\.rolePlaceholderId$/,
  );
  const rolePlaceholderIndex = expectedRoleTaxonomy.findIndex(
    ([rolePlaceholderId]) => value === rolePlaceholderId,
  );
  if (rolePlaceholderIndex >= 0) {
    if (!roleTaxonomyFieldMatch || Number(roleTaxonomyFieldMatch[1]) !== rolePlaceholderIndex) {
      fail(`${fieldPath} uses a role-placeholder literal outside its intended taxonomy field.`);
    }
    return;
  }
  if (roleTaxonomyFieldMatch) {
    fail(`${fieldPath} must use its exact static role-placeholder literal.`);
  }
  for (const term of forbiddenTerms) {
    if (value.toLowerCase().includes(term.toLowerCase())) {
      fail(`${fieldPath} uses forbidden content term ${term}.`);
    }
  }
  const compact = value.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
  if ([...forbiddenConcreteAlgorithmTokens].some((token) => compact.includes(token))) {
    fail(`${fieldPath} contains a concrete digest algorithm token.`);
  }
  if (/\b[^\s@]+@[^\s@]+\b/.test(value)) fail(`${fieldPath} contains an email-like value.`);
  if (
    /\b[a-z][a-z0-9+.-]*:\/\/|\burn:[a-z0-9][a-z0-9:.-]*|\bwww\./i.test(value) ||
    /\b(?:[a-z0-9-]+\.)+(?:com|org|net|ru|io|dev|app|edu|gov|invalid|test)(?::[0-9]{1,5})?(?:\/[^\s]*)?/i.test(
      value,
    ) ||
    /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?\/[^\s]*/.test(value)
  ) {
    fail(`${fieldPath} contains a URL-like value.`);
  }
  if (/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i.test(value)) {
    fail(`${fieldPath} contains a UUID-like value.`);
  }
  const exactIdentitySeparationDecision =
    value === "reviewer_and_audit_identity_separation" &&
    (fieldPath === "$.proposedPolicy.reviewerAuditIdentitySeparation.decisionId" ||
      fieldPath === "$.unresolvedDecisions[7].decisionId");
  if (
    !exactIdentitySeparationDecision &&
    (/\b(?:usr|user|acct|account|learner|student|child)(?:(?:[-_:](?:id[-_:]?)?[a-z0-9][a-z0-9_-]{2,})|(?:(?:id)?[0-9][a-z0-9_-]{2,}))\b/i.test(
      value,
    ) ||
      /\b(?:reviewer|audit)(?::[a-z0-9][a-z0-9_-]{2,}|[-_](?:id|identity|account)[-_:][a-z0-9][a-z0-9_-]{2,}|(?:id)?[0-9][a-z0-9_-]{2,})\b/i.test(
        value,
      ))
  ) {
    fail(`${fieldPath} contains a principal-like value.`);
  }
  if (
    /(?:^|[^0-9])(?:\+?7|8)[\s().-]*[0-9]{3}[\s().-]*[0-9]{3}[\s.-]*[0-9]{2}[\s.-]*[0-9]{2}(?:$|[^0-9])/.test(
      value,
    )
  ) {
    fail(`${fieldPath} contains a phone-like value.`);
  }
  if (/(?<![\p{L}])\p{Lu}\p{Ll}{1,}(?:\s+\p{Lu}\p{Ll}{1,}){1,2}(?![\p{L}])/u.test(value)) {
    fail(`${fieldPath} contains a person-name-like value.`);
  }
  const longTokens = value.match(/[A-Za-z0-9+/_-]{40,}={0,2}/g) ?? [];
  if (
    /\b[0-9a-f]{32,}\b/i.test(value) ||
    longTokens.some(
      (token) => /[A-Z]/.test(token) && /[a-z]/.test(token) && /[0-9+/_-]/.test(token),
    )
  ) {
    fail(`${fieldPath} contains a hash-like value.`);
  }
  if (candidateLikeValuePattern.test(value)) fail(`${fieldPath} contains a candidate-like value.`);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function readDiagnosticReviewerRoleOwnershipDecisionProposal(
  filePath = defaultProposalPath,
) {
  return readJson(filePath);
}

export async function readDiagnosticReviewerRoleOwnershipDecisionProposalUpstream() {
  const entries = await Promise.all(
    Object.entries(upstreamPaths).map(async ([name, filePath]) => [name, await readJson(filePath)]),
  );
  return Object.fromEntries(entries);
}

function validateUpstream(upstream) {
  const a = upstream.activationPrerequisites;
  const authority = upstream.reviewAuthority;
  const role = upstream.reviewerRoleOwnershipPlaceholder;
  const identity = upstream.identityPlaceholder;
  const canonical = upstream.canonicalizationPlaceholder;
  const identityProposal = upstream.identityProposal;
  const canonicalProposal = upstream.canonicalizationProposal;
  if (
    a.metadata?.activationPrerequisitesArtifactVersion !== expectedActivationVersion ||
    a.metadata?.status !== "blocked_prerequisites_only_non_production" ||
    a.aggregate?.satisfiedPrerequisiteCount !== 0 ||
    a.aggregate?.productionApprovalCount !== 0 ||
    a.readiness?.status !== "NOT_READY"
  )
    fail("Activation prerequisites baseline is not exact.");
  const prerequisite = a.prerequisites?.find(
    (item) => item.prerequisiteId === "reviewer_role_ownership",
  );
  if (
    !prerequisite ||
    prerequisite.status !== "UNSATISFIED_DEFERRED" ||
    prerequisite.ownerPlaceholderId !== "UNASSIGNED_OWNER_PLACEHOLDER" ||
    prerequisite.evidenceRecordRefs?.length !== 0
  )
    fail("Reviewer ownership prerequisite must remain unsatisfied and unowned.");
  if (
    authority.metadata?.authorityArtifactVersion !== expectedAuthorityVersion ||
    authority.authorityPolicy?.policyVersion !==
      "wave-4.slice-8.diagnostic-review-authority.placeholder.v1" ||
    authority.authorityPolicy?.policyState !== "DEFERRED_NON_PRODUCTION" ||
    authority.aggregate?.rolePlaceholderCount !== 7 ||
    authority.aggregate?.realReviewerRoleCount !== 0 ||
    authority.aggregate?.reviewerAssignmentCount !== 0 ||
    authority.aggregate?.reviewerIdentityCount !== 0 ||
    authority.aggregate?.auditIdentityCount !== 0 ||
    authority.aggregate?.reviewDecisionCount !== 0 ||
    authority.aggregate?.productionApprovalCount !== 0
  )
    fail("Review authority baseline is not exact.");
  if (
    role.metadata?.policyArtifactVersion !== expectedRolePlaceholderVersion ||
    role.policyIdentity?.policyVersion !==
      "wave-5.slice-5.diagnostic-reviewer-role-ownership.placeholder.v1" ||
    role.policyIdentity?.policyState !== "UNRESOLVED_DEFERRED" ||
    role.prerequisiteReference?.status !== "UNSATISFIED_DEFERRED" ||
    role.aggregate?.rolePlaceholderCount !== 7 ||
    role.aggregate?.decisionRequirementCount !== 8 ||
    role.aggregate?.roleOwnerCount !== 0 ||
    role.aggregate?.ownerAssignmentCount !== 0 ||
    role.aggregate?.productionApprovalCount !== 0
  )
    fail("Reviewer role ownership placeholder baseline is not exact.");
  if (
    identity.metadata?.policyArtifactVersion !== expectedIdentityPlaceholderVersion ||
    identity.metadata?.status !== "placeholder_only_unsatisfied_non_production" ||
    identity.aggregate?.realCandidateIdCount !== 0 ||
    identity.aggregate?.approvedCandidateCount !== 0 ||
    identity.aggregate?.productionApprovalCount !== 0
  )
    fail("Candidate identity placeholder baseline is not exact.");
  if (
    canonical.metadata?.policyArtifactVersion !== expectedCanonicalizationPlaceholderVersion ||
    canonical.metadata?.status !== "placeholder_only_unsatisfied_non_production" ||
    canonical.aggregate?.activeCanonicalizationRuleCount !== 0 ||
    canonical.aggregate?.selectedDigestAlgorithmCount !== 0 ||
    canonical.aggregate?.digestValueCount !== 0 ||
    canonical.aggregate?.approvedCandidateCount !== 0 ||
    canonical.aggregate?.productionApprovalCount !== 0
  )
    fail("Canonicalization placeholder baseline is not exact.");
  if (
    identityProposal.metadata?.proposalArtifactVersion !== expectedIdentityProposalVersion ||
    identityProposal.metadata?.status !== "PROPOSED_DEFERRED" ||
    identityProposal.aggregate?.realCandidateIdCount !== 0 ||
    identityProposal.aggregate?.reservedCandidateIdCount !== 0 ||
    identityProposal.aggregate?.approvedCandidateCount !== 0 ||
    identityProposal.aggregate?.productionApprovalCount !== 0
  )
    fail("Slice 1 proposal baseline is not exact.");
  if (
    canonicalProposal.metadata?.proposalArtifactVersion !==
      expectedCanonicalizationProposalVersion ||
    canonicalProposal.metadata?.status !== "PROPOSED_DEFERRED" ||
    canonicalProposal.aggregate?.selectedDigestAlgorithmCount !== 0 ||
    canonicalProposal.aggregate?.digestValueCount !== 0 ||
    canonicalProposal.aggregate?.approvedCandidateCount !== 0 ||
    canonicalProposal.aggregate?.productionApprovalCount !== 0
  )
    fail("Slice 2 proposal baseline is not exact.");
}

function validateTaxonomy(rows, fieldPath) {
  exact(
    rows,
    expectedRoleTaxonomy.map(([rolePlaceholderId, scopeRef]) => ({
      rolePlaceholderId,
      scopeRef,
      recordState: "TAXONOMY_ONLY",
    })),
    fieldPath,
  );
}

export function validateDiagnosticReviewerRoleOwnershipDecisionProposal(artifact, upstream) {
  if (!isObject(artifact) || !isObject(upstream)) fail("Artifact and upstream must be objects.");
  scan(artifact);
  validateUpstream(upstream);
  exact(
    artifact.metadata,
    {
      schemaVersion: "learnika.diagnosticReviewerRoleOwnershipPolicyDecisionProposal.v1",
      proposalArtifactVersion: expectedProposalArtifactVersion,
      proposalId: "diagnostic-reviewer-role-ownership-policy-decision-proposal",
      proposalVersion: expectedProposalVersion,
      status: "PROPOSED_DEFERRED",
      artifactKind: "diagnostic_reviewer_role_ownership_policy_decision_proposal",
      subject: "math",
      locale: "ru-RU",
      audienceGrades: [7, 8, 9],
      activationPrerequisitesArtifactVersion: expectedActivationVersion,
      reviewAuthorityArtifactVersion: expectedAuthorityVersion,
      reviewerRoleOwnershipPolicyPlaceholderArtifactVersion: expectedRolePlaceholderVersion,
      candidateIdentityPolicyPlaceholderArtifactVersion: expectedIdentityPlaceholderVersion,
      canonicalizationDigestPolicyPlaceholderArtifactVersion:
        expectedCanonicalizationPlaceholderVersion,
      candidateIdentityDecisionProposalArtifactVersion: expectedIdentityProposalVersion,
      canonicalizationDigestDecisionProposalArtifactVersion:
        expectedCanonicalizationProposalVersion,
      diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
      sourceContract: "docs/wave-6/diagnostic-reviewer-role-ownership-policy-decision-proposal.md",
      productionUseAllowed: false,
      runtimeUseAllowed: false,
      storageAllowed: false,
    },
    "artifact.metadata",
  );
  const refs = artifact.upstreamReferences;
  const referencePins = [
    ["activationPrerequisites", expectedActivationVersion, "UNSATISFIED_DEFERRED"],
    ["reviewAuthority", expectedAuthorityVersion, "DEFERRED_NON_PRODUCTION"],
    ["reviewerRoleOwnershipPlaceholder", expectedRolePlaceholderVersion, "UNRESOLVED_DEFERRED"],
    [
      "candidateIdentityPolicyPlaceholder",
      expectedIdentityPlaceholderVersion,
      "UNRESOLVED_DEFERRED",
    ],
    [
      "canonicalizationDigestPolicyPlaceholder",
      expectedCanonicalizationPlaceholderVersion,
      "UNRESOLVED_DEFERRED",
    ],
    ["candidateIdentityDecisionProposal", expectedIdentityProposalVersion, "PROPOSED_DEFERRED"],
    [
      "canonicalizationDigestDecisionProposal",
      expectedCanonicalizationProposalVersion,
      "PROPOSED_DEFERRED",
    ],
  ];
  for (const [name, artifactVersion, state] of referencePins) {
    if (refs?.[name]?.artifactVersion !== artifactVersion)
      fail(`upstreamReferences.${name}.artifactVersion is not exact.`);
    const actualState =
      name === "activationPrerequisites"
        ? refs[name].prerequisiteStatus
        : name.includes("Proposal")
          ? refs[name].proposalStatus
          : refs[name].policyState;
    if (actualState !== state) fail(`upstreamReferences.${name} state is not exact.`);
  }
  if (
    refs.activationPrerequisites.prerequisiteId !== "reviewer_role_ownership" ||
    refs.activationPrerequisites.ownerPlaceholderId !== "UNASSIGNED_OWNER_PLACEHOLDER" ||
    refs.activationPrerequisites.evidenceRecordRefs.length !== 0
  )
    fail("Activation prerequisite pin is not exact.");
  if (
    refs.reviewAuthority.policyVersion !==
      "wave-4.slice-8.diagnostic-review-authority.placeholder.v1" ||
    refs.reviewAuthority.rolePlaceholderCount !== 7 ||
    refs.reviewAuthority.realReviewerRoleCount !== 0 ||
    refs.reviewAuthority.reviewerAssignmentCount !== 0 ||
    refs.reviewAuthority.reviewerIdentityCount !== 0 ||
    refs.reviewAuthority.auditIdentityCount !== 0 ||
    refs.reviewAuthority.reviewDecisionCount !== 0 ||
    refs.reviewAuthority.productionApprovalCount !== 0
  )
    fail("Review authority pin is not exact.");
  if (
    refs.reviewerRoleOwnershipPlaceholder.policyVersion !==
      "wave-5.slice-5.diagnostic-reviewer-role-ownership.placeholder.v1" ||
    refs.reviewerRoleOwnershipPlaceholder.rolePlaceholderCount !== 7 ||
    refs.reviewerRoleOwnershipPlaceholder.decisionRequirementCount !== 8 ||
    refs.reviewerRoleOwnershipPlaceholder.roleOwnerCount !== 0 ||
    refs.reviewerRoleOwnershipPlaceholder.ownerAssignmentCount !== 0
  )
    fail("Reviewer ownership placeholder pin is not exact.");
  if (
    refs.candidateIdentityDecisionProposal.proposalVersion !==
      "wave-6.slice-1.diagnostic-candidate-identity-policy.proposal.v1" ||
    refs.canonicalizationDigestDecisionProposal.proposalVersion !==
      "wave-6.slice-2.diagnostic-candidate-canonicalization-digest-policy.proposal.v1"
  )
    fail("Wave 6 proposal pins are not exact.");
  exact(
    artifact.currentBaseline,
    {
      readiness: {
        policyVersion: expectedReadinessPolicyVersion,
        status: "NOT_READY",
        blockingReasons: requiredBlockingReasons,
      },
      activation: { status: "BLOCKED", workflowStatus: "INACTIVE" },
      reviewerRoleOwnershipPrerequisite: {
        prerequisiteId: "reviewer_role_ownership",
        status: "UNSATISFIED_DEFERRED",
        ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
        evidenceRecordRefs: [],
      },
      satisfiedPrerequisiteCount: 0,
      productionApprovalCount: 0,
      approvedCandidateCount: 0,
    },
    "artifact.currentBaseline",
  );
  exact(
    artifact.proposalBoundary,
    {
      proposalStatus: "PROPOSED_DEFERRED",
      policyApproved: false,
      roleOwnershipApproved: false,
      eligibilityApproved: false,
      appointmentAuthorityApproved: false,
      assignmentAllowed: false,
      authorityGrantAllowed: false,
      reviewUseAllowed: false,
      workflowActivationAllowed: false,
      prerequisiteSatisfactionAllowed: false,
      productionApprovalAllowed: false,
      readinessTransitionAllowed: false,
    },
    "artifact.proposalBoundary",
  );
  validateTaxonomy(artifact.roleTaxonomyPlaceholders, "artifact.roleTaxonomyPlaceholders");
  const policyKeys = [
    "accountableRoleOwnership",
    "roleEligibilityCompetenceIndependence",
    "appointmentAssignmentAuthority",
    "scopeMinimumCountsQuorumAggregation",
    "reviewerLifecycleExpirySuspensionReassignment",
    "delegationRevocationEmergencyCoverage",
    "policyMaintenanceAccessReviewOwnership",
    "reviewerAuditIdentitySeparation",
  ];
  if (
    !isObject(artifact.proposedPolicy) ||
    artifact.proposedPolicy.state !== "PROPOSED_NOT_APPROVED" ||
    Object.keys(artifact.proposedPolicy).sort().join("|") !==
      ["state", ...policyKeys].sort().join("|")
  )
    fail("Exactly eight proposal areas are required.");
  for (const key of policyKeys) {
    if (
      !isObject(artifact.proposedPolicy[key]) ||
      artifact.proposedPolicy[key].decisionId !== expectedDecisionIds[policyKeys.indexOf(key)]
    )
      fail(`Proposal area ${key} is not pinned to its decision.`);
  }
  if (
    artifact.proposedPolicy.accountableRoleOwnership.ownershipActive !== false ||
    artifact.proposedPolicy.appointmentAssignmentAuthority.assignmentsAllowed !== false ||
    artifact.proposedPolicy.appointmentAssignmentAuthority.authorityGrantsAllowed !== false ||
    artifact.proposedPolicy.reviewerLifecycleExpirySuspensionReassignment
      .lifecycleProcessingAllowed !== false ||
    artifact.proposedPolicy.delegationRevocationEmergencyCoverage.delegationAllowed !== false ||
    artifact.proposedPolicy.delegationRevocationEmergencyCoverage.revocationAllowed !== false ||
    artifact.proposedPolicy.delegationRevocationEmergencyCoverage.emergencyCoverageAllowed !==
      false ||
    artifact.proposedPolicy.reviewerAuditIdentitySeparation.identityBindingAllowed !== false ||
    artifact.proposedPolicy.reviewerAuditIdentitySeparation.separationEnforcementAllowed !== false
  )
    fail("Proposal areas must remain non-authorizing.");
  exact(
    artifact.unresolvedDecisions,
    expectedDecisionIds.map((decisionId) => ({
      decisionId,
      state: "UNRESOLVED_DEFERRED",
      decisionRecordRef: null,
    })),
    "artifact.unresolvedDecisions",
  );
  if (!Array.isArray(artifact.syntheticExamples) || artifact.syntheticExamples.length !== 8)
    fail("Exactly eight synthetic examples are required.");
  const accepted = artifact.syntheticExamples.filter(
    (item) => item.vectorType === "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
  );
  const rejected = artifact.syntheticExamples.filter(
    (item) => item.vectorType === "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR",
  );
  if (accepted.length !== 4 || rejected.length !== 4)
    fail("Synthetic examples must contain four accepted and four rejected vectors.");
  for (const item of artifact.syntheticExamples) {
    if (
      !/^synthetic-[a-z0-9-]+$/.test(item.vectorRef) ||
      !Array.isArray(item.abstractInputTokens) ||
      !item.abstractInputTokens.every((token) => /^SYNTHETIC_[A-Z0-9_]+$/.test(token))
    )
      fail("Synthetic vector tokens must be symbolic.");
    exact(item.markers, expectedMarkers, `syntheticExamples.${item.vectorRef}.markers`);
    if (item.vectorType === "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR") {
      if (
        item.expectedDisposition !== "PROPOSED_NON_AUTHORIZING_REFERENCE" ||
        item.rejectionReasonCode !== null
      )
        fail("Accepted vectors must remain non-authorizing.");
    } else if (item.vectorType === "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR") {
      if (
        item.expectedDisposition !== "REJECT" ||
        !/^[A-Z_]+$/.test(item.rejectionReasonCode ?? "")
      )
        fail("Rejected vectors require a reason code only.");
    } else fail("Unknown synthetic vector type.");
  }
  for (const [key, value] of Object.entries(artifact.recordBoundary))
    if (value !== false) fail(`${key} must remain false.`);
  const expectedAggregate = {
    syntheticExampleCount: 8,
    acceptedSyntheticExampleCount: 4,
    rejectedSyntheticExampleCount: 4,
    unresolvedDecisionCount: 8,
    roleTaxonomyPlaceholderCount: 7,
  };
  for (const [key, value] of Object.entries(expectedAggregate))
    if (artifact.aggregate?.[key] !== value) fail(`aggregate.${key} must equal ${value}.`);
  for (const [key, value] of Object.entries(artifact.aggregate ?? {}))
    if (!Object.hasOwn(expectedAggregate, key) && value !== 0)
      fail(`aggregate.${key} must remain zero.`);
  for (const [key, value] of Object.entries(artifact))
    if (key.endsWith("Records") && (!Array.isArray(value) || value.length !== 0))
      fail(`${key} must remain empty.`);
  return {
    proposalArtifactVersion: expectedProposalArtifactVersion,
    proposalVersion: expectedProposalVersion,
    proposalStatus: artifact.metadata.status,
    prerequisiteStatus: artifact.currentBaseline.reviewerRoleOwnershipPrerequisite.status,
    syntheticExampleCount: artifact.aggregate.syntheticExampleCount,
    acceptedSyntheticExampleCount: artifact.aggregate.acceptedSyntheticExampleCount,
    rejectedSyntheticExampleCount: artifact.aggregate.rejectedSyntheticExampleCount,
    unresolvedDecisionCount: artifact.aggregate.unresolvedDecisionCount,
    roleTaxonomyPlaceholderCount: artifact.aggregate.roleTaxonomyPlaceholderCount,
    ownerAssignmentCount: artifact.aggregate.ownerAssignmentCount,
    reviewerAssignmentCount: artifact.aggregate.reviewerAssignmentCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.currentBaseline.activation.status,
    workflowStatus: artifact.currentBaseline.activation.workflowStatus,
    readiness: artifact.currentBaseline.readiness.status,
  };
}

export function validateReviewerRoleOwnershipDecisionProposalChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  const unexpected = normalized.filter((value) => !changedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 3 out-of-scope path changed: ${unexpected[0]}`);
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  if (normalized.length !== changedPaths.length)
    fail(`Wave 6 Slice 3 requires exactly ${changedPaths.length} changed paths.`);
  return normalized;
}

function worktreePaths() {
  const result = spawnSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) fail(`git status failed: ${result.stderr || result.stdout}`);
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .map((value) => value.replaceAll("\\", "/"));
}

export async function main() {
  const artifact = await readDiagnosticReviewerRoleOwnershipDecisionProposal();
  const upstream = await readDiagnosticReviewerRoleOwnershipDecisionProposalUpstream();
  const summary = validateDiagnosticReviewerRoleOwnershipDecisionProposal(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope"))
    validateReviewerRoleOwnershipDecisionProposalChangedPaths(worktreePaths());
  console.log(
    `[curriculum] reviewer role ownership decision proposal valid: ${summary.proposalVersion}; prerequisite ${summary.prerequisiteStatus}; activation ${summary.activationStatus}; workflow ${summary.workflowStatus}; readiness ${summary.readiness}.`,
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
