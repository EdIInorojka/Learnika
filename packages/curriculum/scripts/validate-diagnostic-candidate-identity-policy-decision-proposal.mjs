import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const expectedProposalArtifactVersion = "wave-6.slice-1.grade-7-9-math.v1";
const expectedProposalVersion = "wave-6.slice-1.diagnostic-candidate-identity-policy.proposal.v1";
const expectedActivationVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedIdentityPlaceholderVersion = "wave-5.slice-3.grade-7-9-math.v1";
const expectedIdentityPolicyVersion = "wave-5.slice-3.diagnostic-candidate-identity.placeholder.v1";
const expectedDigestRegistryVersion = "wave-4.slice-5.grade-7-9-math.v1";
const expectedDigestFormatPolicyVersion = "wave-4.slice-5.candidate-identity-format.placeholder.v1";
const expectedCoverageVersion = "wave-4.slice-2.grade-7-9-math.v1";
const expectedBlueprintVersion = "wave-3.slice-3.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const requiredBlockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];
const proposedCandidatePattern =
  /^dcandidate\.math\.g7-9\.(number|algebra|functions|geometry|data)\.c[0-9a-hjkmnp-tv-z]{12}\.v[1-9][0-9]*\.r(?:0|[1-9][0-9]*)$/;
const syntheticWrapperPattern = /^SYNTHETIC_EXAMPLE_ONLY<(.+)>$/;
const candidateLikeValuePattern =
  /dcandidate\.math\.g7-9\.[a-z0-9-]+\.[a-z0-9-]+\.v[1-9][0-9]*(?:\.r(?:0|[1-9][0-9]*))?/i;
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
const expectedSyntheticMarkers = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NOT_A_REAL_CANDIDATE_ID: true,
  NOT_RESERVED: true,
  NOT_APPROVED: true,
  NOT_USABLE_FOR_REVIEW: true,
  NOT_USABLE_FOR_DIGEST: true,
};
const expectedSyntheticVectors = [
  {
    vectorRef: "synthetic-positive-01",
    vectorType: "ACCEPTED_BY_PROPOSED_GRAMMAR",
    renderedValue: "SYNTHETIC_EXAMPLE_ONLY<dcandidate.math.g7-9.algebra.c0123456789ab.v1.r0>",
    expectedGrammarMatch: true,
    rejectionReasonCode: null,
  },
  {
    vectorRef: "synthetic-positive-02",
    vectorType: "ACCEPTED_BY_PROPOSED_GRAMMAR",
    renderedValue: "SYNTHETIC_EXAMPLE_ONLY<dcandidate.math.g7-9.geometry.cabcdefghjkmn.v2.r3>",
    expectedGrammarMatch: true,
    rejectionReasonCode: null,
  },
  {
    vectorRef: "synthetic-rejected-unsupported-strand",
    vectorType: "REJECTED_BY_PROPOSED_GRAMMAR",
    renderedValue: "SYNTHETIC_EXAMPLE_ONLY<dcandidate.math.g7-9.calculus.c0123456789ab.v1.r0>",
    expectedGrammarMatch: false,
    rejectionReasonCode: "UNSUPPORTED_STRAND",
  },
  {
    vectorRef: "synthetic-rejected-readable-key",
    vectorType: "REJECTED_BY_PROPOSED_GRAMMAR",
    renderedValue: "SYNTHETIC_EXAMPLE_ONLY<dcandidate.math.g7-9.algebra.clinear-equation.v1.r0>",
    expectedGrammarMatch: false,
    rejectionReasonCode: "OPAQUE_TOKEN_REQUIRED",
  },
  {
    vectorRef: "synthetic-rejected-missing-revision",
    vectorType: "REJECTED_BY_PROPOSED_GRAMMAR",
    renderedValue: "SYNTHETIC_EXAMPLE_ONLY<dcandidate.math.g7-9.number.c0123456789ab.v1>",
    expectedGrammarMatch: false,
    rejectionReasonCode: "REVISION_REQUIRED",
  },
  {
    vectorRef: "synthetic-rejected-zero-version",
    vectorType: "REJECTED_BY_PROPOSED_GRAMMAR",
    renderedValue: "SYNTHETIC_EXAMPLE_ONLY<dcandidate.math.g7-9.data.c0123456789ab.v0.r0>",
    expectedGrammarMatch: false,
    rejectionReasonCode: "POSITIVE_MAJOR_VERSION_REQUIRED",
  },
  {
    vectorRef: "synthetic-rejected-blueprint-shaped-key",
    vectorType: "REJECTED_BY_PROPOSED_GRAMMAR",
    renderedValue: "SYNTHETIC_EXAMPLE_ONLY<dcandidate.math.g7-9.functions.cdiag-math-g7.v1.r0>",
    expectedGrammarMatch: false,
    rejectionReasonCode: "BLUEPRINT_SHAPED_KEY_FORBIDDEN",
  },
];
const expectedUnresolvedDecisionIds = new Set([
  "namespace_owner_and_allocator_authority",
  "final_candidate_reference_grammar",
  "version_revision_change_classification",
  "collision_reservation_and_reconciliation_design",
  "permanent_non_reuse_and_identity_root_semantics",
  "withdrawal_supersession_authority_and_references",
  "blueprint_and_digest_registry_linkage",
  "canonicalization_and_digest_policy_selection",
  "identifier_data_exclusion_policy",
  "policy_approval_and_prerequisite_satisfaction_gate",
]);
const wave6Slice1ChangedPaths = new Set([
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
export const defaultCandidateIdentityDecisionProposalPath = path.resolve(
  scriptDir,
  "../diagnostic-candidate-identity-policy-decision-proposal/grade-7-9-math.candidate-identity-policy-decision-proposal.v1.json",
);
const defaultUpstreamPaths = {
  activationPrerequisites: path.resolve(
    scriptDir,
    "../diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  ),
  identityPlaceholder: path.resolve(
    scriptDir,
    "../diagnostic-candidate-identity-policy/grade-7-9-math.candidate-identity-policy-placeholder.v1.json",
  ),
  digestRegistry: path.resolve(
    scriptDir,
    "../diagnostic-candidate-digest/grade-7-9-math.candidate-digest-placeholder.v1.json",
  ),
  coverage: path.resolve(
    scriptDir,
    "../diagnostic-review-coverage/grade-7-9-math.review-coverage.v1.json",
  ),
};

export class DiagnosticCandidateIdentityDecisionProposalValidationError extends Error {}

function fail(message) {
  throw new DiagnosticCandidateIdentityDecisionProposalValidationError(message);
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
  if (/\b[^\s@]+@[^\s@]+\b/.test(value)) {
    fail(`${fieldPath} contains an email-like value.`);
  }
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
  if (
    /\b(?:usr|user|acct|account|reviewer|audit|learner|student|child)(?:(?:[-_:](?:id[-_:]?)?[a-z0-9][a-z0-9_-]{2,})|(?:(?:id)?[0-9][a-z0-9_-]{2,}))\b/i.test(
      value,
    )
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
  const base64LikeTokens = value.match(/[A-Za-z0-9+/_-]{40,}={0,2}/g) ?? [];
  if (
    /\b[0-9a-f]{32,}\b/i.test(value) ||
    base64LikeTokens.some(
      (token) => /[A-Z]/.test(token) && /[a-z]/.test(token) && /[0-9+/_-]/.test(token),
    )
  ) {
    fail(`${fieldPath} contains a hash-like value.`);
  }
  const authorizedSyntheticRenderedValue =
    /^\$\.syntheticExamples\[[0-9]+\]\.renderedValue$/.test(fieldPath) &&
    syntheticWrapperPattern.test(value);
  if (!authorizedSyntheticRenderedValue && candidateLikeValuePattern.test(value)) {
    fail(`${fieldPath} contains a candidate-like value outside an approved synthetic wrapper.`);
  }
}

function validateUpstream(upstream) {
  if (!isPlainObject(upstream)) {
    fail("upstream must be an object.");
  }
  const { activationPrerequisites, identityPlaceholder, digestRegistry, coverage } = upstream;
  for (const [name, artifact] of Object.entries(upstream)) {
    if (!isPlainObject(artifact)) {
      fail(`upstream.${name} must be an object.`);
    }
  }
  const candidatePrerequisite = activationPrerequisites.prerequisites?.find(
    ({ prerequisiteId }) => prerequisiteId === "candidate_identity_policy",
  );
  if (
    activationPrerequisites.metadata?.activationPrerequisitesArtifactVersion !==
      expectedActivationVersion ||
    activationPrerequisites.activationBoundary?.status !== "BLOCKED" ||
    activationPrerequisites.activationBoundary?.reviewWorkflowStatus !== "INACTIVE" ||
    activationPrerequisites.readiness?.status !== "NOT_READY" ||
    activationPrerequisites.aggregate?.satisfiedPrerequisiteCount !== 0 ||
    activationPrerequisites.aggregate?.productionApprovalCount !== 0 ||
    !candidatePrerequisite ||
    candidatePrerequisite.status !== "UNSATISFIED_DEFERRED" ||
    candidatePrerequisite.ownerPlaceholderId !== "UNASSIGNED_OWNER_PLACEHOLDER" ||
    candidatePrerequisite.evidenceRecordRefs?.length !== 0
  ) {
    fail("Activation prerequisites must remain the exact blocked Wave 5 baseline.");
  }
  if (
    identityPlaceholder.metadata?.policyArtifactVersion !== expectedIdentityPlaceholderVersion ||
    identityPlaceholder.policyIdentity?.policyVersion !== expectedIdentityPolicyVersion ||
    identityPlaceholder.policyIdentity?.policyState !== "UNRESOLVED_DEFERRED" ||
    identityPlaceholder.prerequisiteReference?.status !== "UNSATISFIED_DEFERRED" ||
    identityPlaceholder.aggregate?.realCandidateIdCount !== 0 ||
    identityPlaceholder.aggregate?.approvedCandidateCount !== 0 ||
    identityPlaceholder.aggregate?.productionApprovalCount !== 0
  ) {
    fail("Candidate identity placeholder must remain the exact unresolved Wave 5 baseline.");
  }
  if (
    digestRegistry.metadata?.registryArtifactVersion !== expectedDigestRegistryVersion ||
    digestRegistry.policies?.candidateIdentityFormat?.policyVersion !==
      expectedDigestFormatPolicyVersion ||
    digestRegistry.policies?.candidateIdentityFormat?.state !==
      "FORMAT_DEFINED_ASSIGNMENT_DEFERRED" ||
    digestRegistry.aggregate?.assignedCandidateIdentityCount !== 0 ||
    digestRegistry.aggregate?.digestValueCount !== 0 ||
    digestRegistry.aggregate?.productionApprovedCandidateCount !== 0
  ) {
    fail("Candidate digest registry must remain the exact unassigned Wave 4 baseline.");
  }
  if (
    coverage.metadata?.coverageArtifactVersion !== expectedCoverageVersion ||
    coverage.metadata?.diagnosticBlueprintVersion !== expectedBlueprintVersion ||
    coverage.aggregate?.blueprintSlotCount !== 11 ||
    coverage.aggregate?.statusCounts?.DRAFT_ONLY !== 5 ||
    coverage.aggregate?.statusCounts?.GAP_CONFIRMED !== 6 ||
    coverage.aggregate?.statusCounts?.PRODUCTION_APPROVED !== 0 ||
    coverage.readiness?.status !== "NOT_READY"
  ) {
    fail("Review coverage must remain the exact Wave 4 non-production baseline.");
  }
  return { candidatePrerequisite };
}

function expectedMetadata() {
  return {
    schemaVersion: "learnika.diagnosticCandidateIdentityPolicyDecisionProposal.v1",
    proposalArtifactVersion: expectedProposalArtifactVersion,
    proposalId: "diagnostic-candidate-identity-policy-decision-proposal",
    proposalVersion: expectedProposalVersion,
    status: "PROPOSED_DEFERRED",
    artifactKind: "diagnostic_candidate_identity_policy_decision_proposal",
    subject: "math",
    locale: "ru-RU",
    audienceGrades: [7, 8, 9],
    activationPrerequisitesArtifactVersion: expectedActivationVersion,
    candidateIdentityPolicyPlaceholderArtifactVersion: expectedIdentityPlaceholderVersion,
    candidateDigestRegistryArtifactVersion: expectedDigestRegistryVersion,
    reviewCoverageArtifactVersion: expectedCoverageVersion,
    diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
    sourceContract: "docs/wave-6/diagnostic-candidate-identity-policy-decision-proposal.md",
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
      prerequisiteId: "candidate_identity_policy",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
    },
    candidateIdentityPolicyPlaceholder: {
      artifactPath:
        "packages/curriculum/diagnostic-candidate-identity-policy/grade-7-9-math.candidate-identity-policy-placeholder.v1.json",
      artifactVersion: expectedIdentityPlaceholderVersion,
      policyVersion: expectedIdentityPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
    },
    candidateDigestRegistry: {
      artifactPath:
        "packages/curriculum/diagnostic-candidate-digest/grade-7-9-math.candidate-digest-placeholder.v1.json",
      artifactVersion: expectedDigestRegistryVersion,
      formatPolicyVersion: expectedDigestFormatPolicyVersion,
      formatPolicyState: "FORMAT_DEFINED_ASSIGNMENT_DEFERRED",
    },
    reviewCoverage: {
      artifactPath:
        "packages/curriculum/diagnostic-review-coverage/grade-7-9-math.review-coverage.v1.json",
      artifactVersion: expectedCoverageVersion,
      blueprintVersion: expectedBlueprintVersion,
      blueprintSlotCount: 11,
      draftOnlySlotCount: 5,
      gapConfirmedSlotCount: 6,
      productionApprovedSlotCount: 0,
    },
  };
}

function expectedProposedPolicy() {
  return {
    state: "PROPOSED_NOT_APPROVED",
    namespaceFormat: {
      state: "PROPOSED_NOT_APPROVED",
      template: "dcandidate.math.g7-9",
      namespaceApproved: false,
      allocationAuthorityDefined: false,
    },
    candidateReferenceGrammar: {
      state: "PROPOSED_NOT_APPROVED",
      template: "dcandidate.math.g7-9.<strand>.c<opaque-token>.v<major>.r<revision>",
      anchoredPatternProposal:
        "^dcandidate\\.math\\.g7-9\\.(number|algebra|functions|geometry|data)\\.c[0-9a-hjkmnp-tv-z]{12}\\.v[1-9][0-9]*\\.r(0|[1-9][0-9]*)$",
      allowedStrandTokens: ["number", "algebra", "functions", "geometry", "data"],
      opaqueTokenLength: 12,
      grammarApproved: false,
      instantiationAllowed: false,
    },
    versionRevisionSyntax: {
      state: "PROPOSED_NOT_APPROVED",
      majorVersionSyntax: "v<positive-integer>",
      revisionSyntax: "r<non-negative-integer>",
      proposedMajorVersionTriggers: [
        "future_canonical_field_change",
        "blueprint_slot_relationship_change",
        "candidate_semantics_change",
      ],
      proposedRevisionBoundary: "future_policy_approved_non_canonical_metadata_only",
      classificationApproved: false,
    },
    collisionPrevention: {
      state: "PROPOSED_NOT_APPROVED",
      proposedRequirements: [
        "single_accountable_allocator",
        "lowercase_ascii_normalization_before_allocation",
        "atomic_full_reference_uniqueness_check",
        "opaque_token_collision_retry",
        "registry_reconciliation",
      ],
      reservationEnabled: false,
      enforcementEnabled: false,
    },
    nonReuse: {
      state: "PROPOSED_NOT_APPROVED",
      proposedRules: [
        "allocated_identity_root_never_reused",
        "allocated_full_reference_never_reused",
        "withdrawal_does_not_release_reference",
        "supersession_does_not_transfer_prior_review_state",
      ],
      nonReuseApproved: false,
      enforcementEnabled: false,
    },
    withdrawalSupersessionReferences: {
      state: "PROPOSED_NOT_APPROVED",
      withdrawalReferenceTemplate: "withdrawal.<candidate-reference>.event-<positive-integer>",
      supersessionReferenceTemplate: "supersession.<candidate-reference>.event-<positive-integer>",
      exactCandidateVersionRequired: true,
      exactCandidateRevisionRequired: true,
      historyPreservationRequired: true,
      recordingAllowed: false,
    },
    blueprintSlotRelationship: {
      state: "PROPOSED_NOT_APPROVED",
      proposedRules: [
        "candidate_reference_independent_from_blueprint_slot_id",
        "candidate_version_pins_exactly_one_blueprint_slot",
        "blueprint_slot_id_not_promoted_to_candidate_reference",
        "blueprint_slot_id_not_embedded_as_opaque_token",
      ],
      relationshipApproved: false,
    },
    candidateDigestRegistryRelationship: {
      state: "PROPOSED_NOT_APPROVED",
      proposedRules: [
        "future_registry_record_pins_exact_candidate_version",
        "future_registry_record_pins_exact_candidate_revision",
        "registry_entry_id_not_promoted_to_candidate_reference",
        "existing_registry_placeholders_remain_unassigned",
      ],
      relationshipApproved: false,
      registryWriteAllowed: false,
    },
    futureCanonicalizationDigestRelationship: {
      state: "PROPOSED_NOT_APPROVED",
      proposedRules: [
        "future_record_pins_separately_approved_canonicalization_policy_version",
        "future_record_pins_separately_approved_digest_policy_version",
        "included_field_change_requires_new_major_version",
        "policy_change_invalidates_stale_review_state",
      ],
      relationshipApproved: false,
      canonicalizationAllowed: false,
      digestGenerationAllowed: false,
    },
    piiExclusionRules: {
      state: "PROPOSED_NOT_APPROVED",
      excludedDataClasses: [
        "person_names",
        "personal_contact_data",
        "principal_identifiers",
        "credential_principal_references",
        "minor_profile_data",
        "governance_reviewer_profile_data",
        "governance_audit_profile_data",
        "source_content",
        "workflow_outcomes",
        "storage_references",
      ],
      opaqueAllocatorGeneratedTokenRequired: true,
      humanMeaningfulKeyAllowed: false,
      rulesApproved: false,
    },
  };
}

function validateSyntheticExamples(examples) {
  if (!Array.isArray(examples) || examples.length !== 7) {
    fail("syntheticExamples must contain exactly 7 vectors.");
  }
  const refs = new Set();
  let acceptedCount = 0;
  let rejectedCount = 0;
  for (let index = 0; index < examples.length; index += 1) {
    const vector = examples[index];
    const fieldPath = `syntheticExamples[${index}]`;
    if (!isPlainObject(vector)) {
      fail(`${fieldPath} must be an object.`);
    }
    requireExactValue(
      vector,
      { ...expectedSyntheticVectors[index], markers: expectedSyntheticMarkers },
      fieldPath,
    );
    requireString(vector.vectorRef, `${fieldPath}.vectorRef`);
    if (refs.has(vector.vectorRef)) {
      fail(`${fieldPath}.vectorRef is duplicated.`);
    }
    refs.add(vector.vectorRef);
    requireString(vector.renderedValue, `${fieldPath}.renderedValue`);
    const wrapperMatch = vector.renderedValue.match(syntheticWrapperPattern);
    if (!wrapperMatch) {
      fail(`${fieldPath}.renderedValue must use the non-operational synthetic wrapper.`);
    }
    if (proposedCandidatePattern.test(vector.renderedValue)) {
      fail(`${fieldPath}.renderedValue must not itself be usable as a candidate reference.`);
    }
    const innerMatches = proposedCandidatePattern.test(wrapperMatch[1]);
    if (vector.vectorType === "ACCEPTED_BY_PROPOSED_GRAMMAR") {
      acceptedCount += 1;
      if (!innerMatches || vector.expectedGrammarMatch !== true) {
        fail(`${fieldPath} must contain a matching synthetic inner value.`);
      }
      if (vector.rejectionReasonCode !== null) {
        fail(`${fieldPath}.rejectionReasonCode must be null for an accepted vector.`);
      }
    } else if (vector.vectorType === "REJECTED_BY_PROPOSED_GRAMMAR") {
      rejectedCount += 1;
      if (innerMatches || vector.expectedGrammarMatch !== false) {
        fail(`${fieldPath} must contain a rejected synthetic inner value.`);
      }
      requireString(vector.rejectionReasonCode, `${fieldPath}.rejectionReasonCode`);
    } else {
      fail(`${fieldPath}.vectorType is unknown.`);
    }
  }
  if (acceptedCount !== 2 || rejectedCount !== 5) {
    fail("syntheticExamples must contain exactly 2 accepted and 5 rejected vectors.");
  }
  return { acceptedCount, rejectedCount };
}

function validateUnresolvedDecisions(decisions) {
  if (!Array.isArray(decisions) || decisions.length !== expectedUnresolvedDecisionIds.size) {
    fail(`unresolvedDecisions must contain exactly ${expectedUnresolvedDecisionIds.size} rows.`);
  }
  const actualIds = new Set();
  for (let index = 0; index < decisions.length; index += 1) {
    const row = decisions[index];
    const fieldPath = `unresolvedDecisions[${index}]`;
    if (!expectedUnresolvedDecisionIds.has(row?.decisionId)) {
      fail(`${fieldPath}.decisionId is unknown.`);
    }
    if (actualIds.has(row.decisionId)) {
      fail(`${fieldPath}.decisionId is duplicated.`);
    }
    actualIds.add(row.decisionId);
    requireExactValue(
      row,
      {
        decisionId: row.decisionId,
        state: "UNRESOLVED_DEFERRED",
        decisionRecordRef: null,
      },
      fieldPath,
    );
  }
  return actualIds.size;
}

function validateEmptyRecords(artifact) {
  const recordFields = [
    "policyDecisionRecords",
    "candidateIdentityRecords",
    "candidateReservationRecords",
    "candidateAllocationRecords",
    "candidateApprovalRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "digestValueRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "reviewerAssignmentRecords",
    "authorityGrantRecords",
    "productionApprovalRecords",
    "withdrawalRecords",
    "supersessionRecords",
    "tombstoneRecords",
    "restorationRecords",
  ];
  for (const field of recordFields) {
    if (!Array.isArray(artifact[field]) || artifact[field].length !== 0) {
      fail(`${field} must remain empty in Wave 6 Slice 1.`);
    }
  }
  return recordFields;
}

export function validateDiagnosticCandidateIdentityPolicyDecisionProposal(artifact, upstream) {
  if (!isPlainObject(artifact)) {
    fail("Candidate identity policy decision proposal must be a JSON object.");
  }
  validateUpstream(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  const recordFields = [
    "policyDecisionRecords",
    "candidateIdentityRecords",
    "candidateReservationRecords",
    "candidateAllocationRecords",
    "candidateApprovalRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "digestValueRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "reviewerAssignmentRecords",
    "authorityGrantRecords",
    "productionApprovalRecords",
    "withdrawalRecords",
    "supersessionRecords",
    "tombstoneRecords",
    "restorationRecords",
  ];
  const topLevelFields = new Set([
    "metadata",
    "upstreamReferences",
    "currentBaseline",
    "proposalBoundary",
    "proposedPolicy",
    "syntheticExamples",
    "unresolvedDecisions",
    "recordBoundary",
    "aggregate",
    ...recordFields,
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
  requireExactValue(artifact.metadata, expectedMetadata(), "metadata");
  requireExactValue(
    artifact.upstreamReferences,
    expectedUpstreamReferences(),
    "upstreamReferences",
  );
  requireExactValue(
    artifact.currentBaseline,
    {
      readiness: {
        policyVersion: expectedReadinessPolicyVersion,
        status: "NOT_READY",
        blockingReasons: requiredBlockingReasons,
      },
      activation: { status: "BLOCKED", workflowStatus: "INACTIVE" },
      candidateIdentityPrerequisite: {
        prerequisiteId: "candidate_identity_policy",
        status: "UNSATISFIED_DEFERRED",
      },
      satisfiedPrerequisiteCount: 0,
      productionApprovalCount: 0,
      approvedCandidateCount: 0,
    },
    "currentBaseline",
  );
  requireExactValue(
    artifact.proposalBoundary,
    {
      proposalStatus: "PROPOSED_DEFERRED",
      policyApproved: false,
      grammarApproved: false,
      candidateInstantiationAllowed: false,
      candidateReservationAllowed: false,
      candidateAllocationAllowed: false,
      reviewUseAllowed: false,
      digestUseAllowed: false,
      prerequisiteSatisfactionAllowed: false,
      activationAllowed: false,
      workflowActivationAllowed: false,
      readinessTransitionAllowed: false,
      productionApprovalAllowed: false,
    },
    "proposalBoundary",
  );
  requireExactValue(artifact.proposedPolicy, expectedProposedPolicy(), "proposedPolicy");
  const { acceptedCount, rejectedCount } = validateSyntheticExamples(artifact.syntheticExamples);
  const unresolvedDecisionCount = validateUnresolvedDecisions(artifact.unresolvedDecisions);
  validateEmptyRecords(artifact);
  requireExactValue(
    artifact.recordBoundary,
    {
      policyDecisionsRecorded: false,
      candidateIdentitiesRecorded: false,
      candidateReservationsRecorded: false,
      candidateAllocationsRecorded: false,
      candidateApprovalsRecorded: false,
      reviewEvidenceRecorded: false,
      reviewDecisionsRecorded: false,
      digestValuesRecorded: false,
      reviewerIdentitiesRecorded: false,
      auditIdentitiesRecorded: false,
      reviewerAssignmentsRecorded: false,
      authorityGrantsRecorded: false,
      productionApprovalsRecorded: false,
      withdrawalsRecorded: false,
      supersessionsRecorded: false,
      tombstonesRecorded: false,
      restorationsRecorded: false,
    },
    "recordBoundary",
  );
  requireExactValue(
    artifact.aggregate,
    {
      syntheticExampleCount: artifact.syntheticExamples.length,
      acceptedSyntheticExampleCount: acceptedCount,
      rejectedSyntheticExampleCount: rejectedCount,
      unresolvedDecisionCount,
      satisfiedPrerequisiteCount: 0,
      realCandidateIdCount: 0,
      reservedCandidateIdCount: 0,
      approvedGrammarCount: 0,
      approvedCandidateCount: 0,
      policyDecisionCount: 0,
      reviewEvidenceRecordCount: 0,
      reviewDecisionCount: 0,
      digestValueCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      reviewerAssignmentCount: 0,
      authorityGrantCount: 0,
      productionApprovalCount: 0,
      withdrawalRecordCount: 0,
      supersessionRecordCount: 0,
      tombstoneRecordCount: 0,
      restorationRecordCount: 0,
    },
    "aggregate",
  );
  return {
    proposalArtifactVersion: artifact.metadata.proposalArtifactVersion,
    proposalVersion: artifact.metadata.proposalVersion,
    proposalStatus: artifact.metadata.status,
    prerequisiteStatus: artifact.currentBaseline.candidateIdentityPrerequisite.status,
    syntheticExampleCount: artifact.syntheticExamples.length,
    acceptedSyntheticExampleCount: acceptedCount,
    rejectedSyntheticExampleCount: rejectedCount,
    realCandidateIdCount: artifact.aggregate.realCandidateIdCount,
    reservedCandidateIdCount: artifact.aggregate.reservedCandidateIdCount,
    approvedCandidateCount: artifact.aggregate.approvedCandidateCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.currentBaseline.activation.status,
    workflowStatus: artifact.currentBaseline.activation.workflowStatus,
    readiness: artifact.currentBaseline.readiness.status,
  };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function readDiagnosticCandidateIdentityPolicyDecisionProposal(
  artifactPath = defaultCandidateIdentityDecisionProposalPath,
) {
  return readJson(artifactPath);
}

export async function readDiagnosticCandidateIdentityPolicyDecisionProposalUpstream(
  upstreamPaths = defaultUpstreamPaths,
) {
  const [activationPrerequisites, identityPlaceholder, digestRegistry, coverage] =
    await Promise.all([
      readJson(upstreamPaths.activationPrerequisites),
      readJson(upstreamPaths.identityPlaceholder),
      readJson(upstreamPaths.digestRegistry),
      readJson(upstreamPaths.coverage),
    ]);
  return { activationPrerequisites, identityPlaceholder, digestRegistry, coverage };
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateCandidateIdentityDecisionProposalChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !wave6Slice1ChangedPaths.has(changedPath) &&
      !wave6Slice2ScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 6 Slice 1 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateCandidateIdentityDecisionProposalWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateCandidateIdentityDecisionProposalChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [artifact, upstream] = await Promise.all([
    readDiagnosticCandidateIdentityPolicyDecisionProposal(),
    readDiagnosticCandidateIdentityPolicyDecisionProposalUpstream(),
  ]);
  const summary = validateDiagnosticCandidateIdentityPolicyDecisionProposal(artifact, upstream);
  if (checkWorktreeScope) {
    validateCandidateIdentityDecisionProposalWorktreeScope();
  }
  console.log(
    `[curriculum] Candidate identity decision proposal ${summary.proposalArtifactVersion} validated: ${summary.syntheticExampleCount} synthetic vectors (${summary.acceptedSyntheticExampleCount} accepted, ${summary.rejectedSyntheticExampleCount} rejected), ${summary.realCandidateIdCount} real IDs, ${summary.reservedCandidateIdCount} reserved IDs, ${summary.approvedCandidateCount} approved candidates, ${summary.productionApprovalCount} production approvals; proposal ${summary.proposalStatus}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
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
