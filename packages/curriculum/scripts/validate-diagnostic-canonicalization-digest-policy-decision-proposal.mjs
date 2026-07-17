import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const expectedProposalArtifactVersion = "wave-6.slice-2.grade-7-9-math.v1";
const expectedProposalVersion =
  "wave-6.slice-2.diagnostic-candidate-canonicalization-digest-policy.proposal.v1";
const expectedActivationVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedPlaceholderArtifactVersion = "wave-5.slice-4.grade-7-9-math.v1";
const expectedPlaceholderPolicyVersion =
  "wave-5.slice-4.diagnostic-candidate-canonicalization-and-digest.placeholder.v1";
const expectedIdentityProposalArtifactVersion = "wave-6.slice-1.grade-7-9-math.v1";
const expectedIdentityProposalVersion =
  "wave-6.slice-1.diagnostic-candidate-identity-policy.proposal.v1";
const expectedDigestRegistryVersion = "wave-4.slice-5.grade-7-9-math.v1";
const expectedDigestAlgorithmPolicyVersion =
  "wave-4.slice-5.candidate-digest-algorithm.placeholder.v1";
const expectedCanonicalizationArtifactVersion = "wave-4.slice-6.grade-7-9-math.v1";
const expectedCanonicalizationPolicyVersion =
  "wave-4.slice-6.diagnostic-candidate-canonicalization.placeholder.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const requiredBlockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];

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

const expectedSyntheticMarkers = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NOT_REAL_CONTENT: true,
  NOT_A_REAL_CANDIDATE: true,
  NOT_A_REAL_DIGEST: true,
  NOT_APPROVED: true,
  NOT_USABLE_FOR_REVIEW: true,
  NOT_USABLE_FOR_PRODUCTION: true,
};
const expectedSyntheticVectors = [
  {
    vectorRef: "synthetic-ordering-01",
    vectorType: "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
    scenarioCode: "FIELD_ORDER_VARIANT",
    abstractInputTokens: ["SYNTHETIC_FIELD_SET_ALPHA", "SYNTHETIC_ORDER_VARIANT_BETA"],
    expectedSymbolicDisposition: "SAME_SERIALIZATION_SYMBOL_CLASS",
    rejectionReasonCode: null,
  },
  {
    vectorRef: "synthetic-unicode-02",
    vectorType: "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
    scenarioCode: "RUSSIAN_UNICODE_VARIANT",
    abstractInputTokens: ["SYNTHETIC_RUSSIAN_TOKEN_VARIANT", "SYNTHETIC_NFC_TARGET_TOKEN"],
    expectedSymbolicDisposition: "SAME_SERIALIZATION_SYMBOL_CLASS",
    rejectionReasonCode: null,
  },
  {
    vectorRef: "synthetic-math-03",
    vectorType: "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
    scenarioCode: "MATH_GLYPH_ALIAS_VARIANT",
    abstractInputTokens: ["SYNTHETIC_MATH_GLYPH_ALIAS_TOKEN", "SYNTHETIC_DECLARED_ALIAS_TARGET"],
    expectedSymbolicDisposition: "SAME_SERIALIZATION_SYMBOL_CLASS",
    rejectionReasonCode: null,
  },
  {
    vectorRef: "synthetic-whitespace-04",
    vectorType: "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
    scenarioCode: "WHITESPACE_LINE_ENDING_VARIANT",
    abstractInputTokens: ["SYNTHETIC_SPACE_VARIANT_TOKEN", "SYNTHETIC_LF_TARGET_TOKEN"],
    expectedSymbolicDisposition: "SAME_SERIALIZATION_SYMBOL_CLASS",
    rejectionReasonCode: null,
  },
  {
    vectorRef: "synthetic-rejected-unknown-field",
    vectorType: "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR",
    scenarioCode: "UNKNOWN_FIELD_CLASS",
    abstractInputTokens: ["SYNTHETIC_UNKNOWN_FIELD_TOKEN"],
    expectedSymbolicDisposition: "REJECT",
    rejectionReasonCode: "UNKNOWN_FIELD_FORBIDDEN",
  },
  {
    vectorRef: "synthetic-rejected-personal-data",
    vectorType: "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR",
    scenarioCode: "EXCLUDED_PERSONAL_DATA_CLASS",
    abstractInputTokens: ["SYNTHETIC_EXCLUDED_PERSONAL_DATA_TOKEN"],
    expectedSymbolicDisposition: "REJECT",
    rejectionReasonCode: "EXCLUDED_FIELD_CLASS_FORBIDDEN",
  },
  {
    vectorRef: "synthetic-rejected-ambiguous-math",
    vectorType: "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR",
    scenarioCode: "AMBIGUOUS_MATH_REWRITE",
    abstractInputTokens: ["SYNTHETIC_AMBIGUOUS_MATH_TOKEN"],
    expectedSymbolicDisposition: "REJECT",
    rejectionReasonCode: "AMBIGUOUS_NOTATION_FORBIDDEN",
  },
  {
    vectorRef: "synthetic-rejected-concrete-output",
    vectorType: "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR",
    scenarioCode: "CONCRETE_OUTPUT_REQUEST",
    abstractInputTokens: ["SYNTHETIC_CONCRETE_OUTPUT_REQUEST_TOKEN"],
    expectedSymbolicDisposition: "REJECT",
    rejectionReasonCode: "CANONICAL_OR_DIGEST_OUTPUT_FORBIDDEN",
  },
  {
    vectorRef: "synthetic-rejected-candidate-reference",
    vectorType: "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR",
    scenarioCode: "REAL_CANDIDATE_REFERENCE_REQUEST",
    abstractInputTokens: ["SYNTHETIC_REAL_CANDIDATE_REFERENCE_REQUEST_TOKEN"],
    expectedSymbolicDisposition: "REJECT",
    rejectionReasonCode: "REAL_CANDIDATE_REFERENCE_FORBIDDEN",
  },
];
const expectedUnresolvedDecisionIds = new Set([
  "canonical_field_inventory",
  "field_inclusion_and_exclusion",
  "deterministic_field_ordering",
  "byte_serialization_and_framing",
  "unicode_russian_locale_and_line_endings",
  "math_notation_symbol_unit_and_expression_handling",
  "whitespace_and_punctuation_handling",
  "digest_algorithm_family_selection",
  "digest_encoding_selection",
  "domain_separation_tag_and_framing",
  "invalidation_regeneration_and_migration",
  "independent_reproducibility_vectors",
  "policy_approval_and_prerequisite_satisfaction_gate",
]);

const wave6Slice2ChangedPaths = new Set([
  "docs/wave-6/diagnostic-canonicalization-digest-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-2-implementation-note.md",
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

const expectedFieldClasses = [
  { fieldRef: "content_schema_version", disposition: "PROPOSED_INCLUDE" },
  { fieldRef: "candidate_identity_reference", disposition: "PROPOSED_INCLUDE" },
  { fieldRef: "candidate_version_revision", disposition: "PROPOSED_INCLUDE" },
  { fieldRef: "blueprint_slot_reference", disposition: "PROPOSED_INCLUDE" },
  { fieldRef: "canonical_skill_reference_set", disposition: "PROPOSED_INCLUDE" },
  { fieldRef: "diagnostic_task_payload", disposition: "PROPOSED_INCLUDE" },
  { fieldRef: "interaction_contract_metadata", disposition: "PROPOSED_INCLUDE" },
  { fieldRef: "accessibility_metadata", disposition: "PROPOSED_INCLUDE" },
  { fieldRef: "rights_provenance_reference", disposition: "PROPOSED_INCLUDE" },
  { fieldRef: "review_workflow_metadata", disposition: "PROPOSED_EXCLUDE" },
  { fieldRef: "runtime_delivery_metadata", disposition: "PROPOSED_EXCLUDE" },
  { fieldRef: "personal_data", disposition: "PROPOSED_EXCLUDE" },
  { fieldRef: "provider_data", disposition: "PROPOSED_EXCLUDE" },
  { fieldRef: "transient_storage_references", disposition: "PROPOSED_EXCLUDE" },
  { fieldRef: "policy_decision_metadata", disposition: "PROPOSED_EXCLUDE" },
  { fieldRef: "governance_trace_metadata", disposition: "PROPOSED_EXCLUDE" },
];
const expectedCanonicalFieldOrder = expectedFieldClasses
  .filter(({ disposition }) => disposition === "PROPOSED_INCLUDE")
  .map(({ fieldRef }) => fieldRef);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultCanonicalizationDigestDecisionProposalPath = path.resolve(
  scriptDir,
  "../diagnostic-canonicalization-digest-policy-decision-proposal/grade-7-9-math.canonicalization-digest-policy-decision-proposal.v1.json",
);
const defaultUpstreamPaths = {
  activationPrerequisites: path.resolve(
    scriptDir,
    "../diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  ),
  placeholder: path.resolve(
    scriptDir,
    "../diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json",
  ),
  identityProposal: path.resolve(
    scriptDir,
    "../diagnostic-candidate-identity-policy-decision-proposal/grade-7-9-math.candidate-identity-policy-decision-proposal.v1.json",
  ),
  digestRegistry: path.resolve(
    scriptDir,
    "../diagnostic-candidate-digest/grade-7-9-math.candidate-digest-placeholder.v1.json",
  ),
  canonicalization: path.resolve(
    scriptDir,
    "../diagnostic-candidate-canonicalization/grade-7-9-math.canonicalization-placeholder.v1.json",
  ),
};

export class DiagnosticCanonicalizationDigestDecisionProposalValidationError extends Error {}

function fail(message) {
  throw new DiagnosticCanonicalizationDigestDecisionProposalValidationError(message);
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
  const compactAlgorithmToken = normalizedValue.replaceAll(/[^a-z0-9]/g, "");
  for (const algorithmToken of forbiddenConcreteAlgorithmTokens) {
    if (compactAlgorithmToken.includes(algorithmToken)) {
      fail(`${fieldPath} contains a concrete digest algorithm token.`);
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
  if (candidateLikeValuePattern.test(value)) {
    fail(`${fieldPath} contains a candidate-like value.`);
  }
}

function validateUpstream(upstream) {
  if (!isPlainObject(upstream)) {
    fail("upstream must be an object.");
  }
  const {
    activationPrerequisites,
    placeholder,
    identityProposal,
    digestRegistry,
    canonicalization,
  } = upstream;
  for (const [name, artifact] of Object.entries(upstream)) {
    if (!isPlainObject(artifact)) {
      fail(`upstream.${name} must be an object.`);
    }
  }
  const prerequisite = activationPrerequisites.prerequisites?.find(
    ({ prerequisiteId }) => prerequisiteId === "canonicalization_and_digest_policy",
  );
  if (
    activationPrerequisites.metadata?.activationPrerequisitesArtifactVersion !==
      expectedActivationVersion ||
    activationPrerequisites.activationBoundary?.status !== "BLOCKED" ||
    activationPrerequisites.activationBoundary?.reviewWorkflowStatus !== "INACTIVE" ||
    activationPrerequisites.readiness?.status !== "NOT_READY" ||
    activationPrerequisites.aggregate?.satisfiedPrerequisiteCount !== 0 ||
    activationPrerequisites.aggregate?.productionApprovalCount !== 0 ||
    !prerequisite ||
    prerequisite.status !== "UNSATISFIED_DEFERRED" ||
    prerequisite.evidenceRecordRefs?.length !== 0
  ) {
    fail("Activation prerequisites must remain the exact blocked Wave 5 baseline.");
  }
  if (
    placeholder.metadata?.policyArtifactVersion !== expectedPlaceholderArtifactVersion ||
    placeholder.policyIdentity?.policyVersion !== expectedPlaceholderPolicyVersion ||
    placeholder.policyIdentity?.policyState !== "UNRESOLVED_DEFERRED" ||
    placeholder.prerequisiteReference?.status !== "UNSATISFIED_DEFERRED" ||
    placeholder.aggregate?.selectedDigestAlgorithmCount !== 0 ||
    placeholder.aggregate?.selectedDigestEncodingCount !== 0 ||
    placeholder.aggregate?.digestValueCount !== 0 ||
    placeholder.aggregate?.approvedCandidateCount !== 0 ||
    placeholder.aggregate?.productionApprovalCount !== 0
  ) {
    fail("Canonicalization and digest placeholder must remain unresolved and empty.");
  }
  if (
    identityProposal.metadata?.proposalArtifactVersion !==
      expectedIdentityProposalArtifactVersion ||
    identityProposal.metadata?.proposalVersion !== expectedIdentityProposalVersion ||
    identityProposal.metadata?.status !== "PROPOSED_DEFERRED" ||
    identityProposal.aggregate?.realCandidateIdCount !== 0 ||
    identityProposal.aggregate?.reservedCandidateIdCount !== 0 ||
    identityProposal.aggregate?.approvedCandidateCount !== 0 ||
    identityProposal.aggregate?.productionApprovalCount !== 0
  ) {
    fail("Candidate identity decision proposal must remain deferred and non-operational.");
  }
  if (
    digestRegistry.metadata?.registryArtifactVersion !== expectedDigestRegistryVersion ||
    digestRegistry.policies?.digestAlgorithm?.policyVersion !==
      expectedDigestAlgorithmPolicyVersion ||
    digestRegistry.policies?.digestAlgorithm?.state !== "DEFERRED" ||
    digestRegistry.policies?.digestAlgorithm?.algorithmId !== null ||
    digestRegistry.policies?.digestAlgorithm?.valueEncoding !== null ||
    digestRegistry.aggregate?.assignedCandidateIdentityCount !== 0 ||
    digestRegistry.aggregate?.digestValueCount !== 0 ||
    digestRegistry.aggregate?.productionApprovedCandidateCount !== 0
  ) {
    fail("Candidate digest registry must remain the exact empty Wave 4 baseline.");
  }
  if (
    canonicalization.metadata?.policyArtifactVersion !== expectedCanonicalizationArtifactVersion ||
    canonicalization.policyIdentity?.policyVersion !== expectedCanonicalizationPolicyVersion ||
    canonicalization.policyIdentity?.status !== "UNRESOLVED_DEFERRED" ||
    canonicalization.aggregate?.activeRuleCount !== 0 ||
    canonicalization.aggregate?.transformedCandidateRecordCount !== 0 ||
    canonicalization.aggregate?.digestValueCount !== 0 ||
    canonicalization.aggregate?.productionApprovedCandidateCount !== 0
  ) {
    fail("Candidate canonicalization placeholder must remain unresolved and empty.");
  }
}

function expectedMetadata() {
  return {
    schemaVersion: "learnika.diagnosticCandidateCanonicalizationDigestPolicyDecisionProposal.v1",
    proposalArtifactVersion: expectedProposalArtifactVersion,
    proposalId: "diagnostic-candidate-canonicalization-digest-policy-decision-proposal",
    proposalVersion: expectedProposalVersion,
    status: "PROPOSED_DEFERRED",
    artifactKind: "diagnostic_candidate_canonicalization_digest_policy_decision_proposal",
    subject: "math",
    locale: "ru-RU",
    audienceGrades: [7, 8, 9],
    activationPrerequisitesArtifactVersion: expectedActivationVersion,
    canonicalizationDigestPolicyPlaceholderArtifactVersion: expectedPlaceholderArtifactVersion,
    candidateIdentityDecisionProposalArtifactVersion: expectedIdentityProposalArtifactVersion,
    candidateDigestRegistryArtifactVersion: expectedDigestRegistryVersion,
    candidateCanonicalizationArtifactVersion: expectedCanonicalizationArtifactVersion,
    diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
    sourceContract: "docs/wave-6/diagnostic-canonicalization-digest-policy-decision-proposal.md",
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
      prerequisiteId: "canonicalization_and_digest_policy",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
    },
    canonicalizationDigestPolicyPlaceholder: {
      artifactPath:
        "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json",
      artifactVersion: expectedPlaceholderArtifactVersion,
      policyVersion: expectedPlaceholderPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
    },
    candidateIdentityDecisionProposal: {
      artifactPath:
        "packages/curriculum/diagnostic-candidate-identity-policy-decision-proposal/grade-7-9-math.candidate-identity-policy-decision-proposal.v1.json",
      artifactVersion: expectedIdentityProposalArtifactVersion,
      proposalVersion: expectedIdentityProposalVersion,
      proposalStatus: "PROPOSED_DEFERRED",
      realCandidateIdCount: 0,
      reservedCandidateIdCount: 0,
    },
    candidateDigestRegistry: {
      artifactPath:
        "packages/curriculum/diagnostic-candidate-digest/grade-7-9-math.candidate-digest-placeholder.v1.json",
      artifactVersion: expectedDigestRegistryVersion,
      algorithmPolicyVersion: expectedDigestAlgorithmPolicyVersion,
      algorithmState: "DEFERRED",
      algorithmId: null,
      valueEncoding: null,
      assignedCandidateIdentityCount: 0,
      digestValueCount: 0,
    },
    candidateCanonicalization: {
      artifactPath:
        "packages/curriculum/diagnostic-candidate-canonicalization/grade-7-9-math.canonicalization-placeholder.v1.json",
      artifactVersion: expectedCanonicalizationArtifactVersion,
      policyVersion: expectedCanonicalizationPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      activeRuleCount: 0,
      transformedCandidateRecordCount: 0,
      digestValueCount: 0,
    },
  };
}

function expectedProposedPolicy() {
  return {
    state: "PROPOSED_NOT_APPROVED",
    canonicalFieldInventory: {
      state: "PROPOSED_NOT_APPROVED",
      inventoryVersionProposal: "wave-6.slice-2.canonical-field-inventory.proposal.v1",
      fieldClasses: expectedFieldClasses,
      unknownFieldDisposition: "REJECT",
      inventoryApproved: false,
      applicationAllowed: false,
    },
    deterministicOrdering: {
      state: "PROPOSED_NOT_APPROVED",
      canonicalFieldOrder: expectedCanonicalFieldOrder,
      setOrderingProposal: "ASCII_CODE_POINT_ASCENDING",
      duplicateFieldDisposition: "REJECT",
      orderingApproved: false,
    },
    byteSerialization: {
      state: "PROPOSED_NOT_APPROVED",
      formatProposal: "LENGTH_PREFIXED_TYPED_FIELD_SEQUENCE_V1",
      byteEncodingProposal: "UTF8",
      nullRepresentationProposal: "EXPLICIT_NULL_TAG",
      integerRepresentationProposal: "MINIMAL_DECIMAL",
      serializationApproved: false,
      serializationAllowed: false,
    },
    localeUnicodeRussianNormalization: {
      state: "PROPOSED_NOT_APPROVED",
      targetLocale: "ru-RU",
      unicodeNormalizationProposal: "NFC",
      lineEndingProposal: "LF",
      localeSensitiveCaseConversionAllowed: false,
      transliterationAllowed: false,
      normalizationApproved: false,
    },
    mathNotationNormalization: {
      state: "PROPOSED_NOT_APPROVED",
      proposedRuleIds: [
        "normalize_predeclared_glyph_aliases_only",
        "preserve_operator_order",
        "preserve_expression_structure",
        "preserve_unit_tokens",
        "reject_ambiguous_notation",
      ],
      semanticEquivalenceRewritingAllowed: false,
      expressionEvaluationAllowed: false,
      normalizationApproved: false,
    },
    whitespacePunctuationNormalization: {
      state: "PROPOSED_NOT_APPROVED",
      proposedRuleIds: [
        "trim_field_boundary_space",
        "map_supported_space_tokens_to_ascii_space",
        "collapse_repeated_inline_space",
        "preserve_paragraph_boundaries",
        "preserve_punctuation_code_points",
      ],
      unclassifiedPunctuationDisposition: "PRESERVE",
      normalizationApproved: false,
    },
    digestAlgorithmFamily: {
      state: "PROPOSED_NOT_APPROVED",
      familyRequirement: "FUTURE_SECURITY_REVIEWED_CRYPTOGRAPHIC_DIGEST_FAMILY",
      algorithmId: null,
      algorithmSelected: false,
      algorithmApproved: false,
      digestGenerationAllowed: false,
    },
    digestEncoding: {
      state: "PROPOSED_NOT_APPROVED",
      encodingProposal: "lowercase_base32_without_padding",
      encodingId: null,
      encodingSelected: false,
      encodingApproved: false,
    },
    domainSeparation: {
      state: "PROPOSED_NOT_APPROVED",
      domainTagProposal: "LEARNIKA-DIAGNOSTIC-CANDIDATE-DIGEST-PROPOSAL-V1",
      domainTagApproved: false,
      applicationAllowed: false,
    },
    invalidationRegeneration: {
      state: "PROPOSED_NOT_APPROVED",
      proposedTriggerIds: [
        "included_field_value_change",
        "candidate_version_or_revision_change",
        "field_inventory_version_change",
        "canonicalization_ruleset_change",
        "serialization_format_change",
        "digest_algorithm_change",
        "digest_encoding_change",
        "domain_separation_tag_change",
      ],
      invalidationApproved: false,
      regenerationApproved: false,
      invalidationExecutionAllowed: false,
      regenerationExecutionAllowed: false,
      migrationAllowed: false,
    },
  };
}

function validateSyntheticExamples(examples) {
  if (!Array.isArray(examples) || examples.length !== expectedSyntheticVectors.length) {
    fail(`syntheticExamples must contain exactly ${expectedSyntheticVectors.length} vectors.`);
  }
  let acceptedCount = 0;
  let rejectedCount = 0;
  for (let index = 0; index < examples.length; index += 1) {
    const fieldPath = `syntheticExamples[${index}]`;
    const vector = examples[index];
    requireExactValue(
      vector,
      { ...expectedSyntheticVectors[index], markers: expectedSyntheticMarkers },
      fieldPath,
    );
    for (const token of vector.abstractInputTokens) {
      if (!/^SYNTHETIC_[A-Z0-9_]+$/.test(token)) {
        fail(`${fieldPath}.abstractInputTokens must contain symbolic tokens only.`);
      }
    }
    if (vector.vectorType === "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR") {
      acceptedCount += 1;
      if (vector.rejectionReasonCode !== null) {
        fail(`${fieldPath}.rejectionReasonCode must be null for an accepted vector.`);
      }
    } else {
      rejectedCount += 1;
      requireString(vector.rejectionReasonCode, `${fieldPath}.rejectionReasonCode`);
      if (vector.expectedSymbolicDisposition !== "REJECT") {
        fail(`${fieldPath} must fail closed.`);
      }
    }
  }
  if (acceptedCount !== 4 || rejectedCount !== 5) {
    fail("syntheticExamples must contain exactly 4 accepted and 5 rejected vectors.");
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
    if (!expectedUnresolvedDecisionIds.has(row?.decisionId) || actualIds.has(row.decisionId)) {
      fail(`${fieldPath}.decisionId is unknown or duplicated.`);
    }
    actualIds.add(row.decisionId);
    requireExactValue(
      row,
      { decisionId: row.decisionId, state: "UNRESOLVED_DEFERRED", decisionRecordRef: null },
      fieldPath,
    );
  }
  return actualIds.size;
}

const protectedRecordFields = [
  "policyDecisionRecords",
  "canonicalRepresentationRecords",
  "digestValueRecords",
  "candidateIdentityRecords",
  "candidateReservationRecords",
  "candidateApprovalRecords",
  "reviewEvidenceRecords",
  "reviewDecisionRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "ownerAssignmentRecords",
  "authorityGrantRecords",
  "productionApprovalRecords",
  "algorithmSelectionRecords",
  "encodingSelectionRecords",
  "invalidationExecutionRecords",
  "regenerationExecutionRecords",
];

export function validateDiagnosticCanonicalizationDigestPolicyDecisionProposal(artifact, upstream) {
  if (!isPlainObject(artifact)) {
    fail("Canonicalization and digest policy decision proposal must be a JSON object.");
  }
  validateUpstream(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
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
    ...protectedRecordFields,
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
      canonicalizationDigestPrerequisite: {
        prerequisiteId: "canonicalization_and_digest_policy",
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
      fieldInventoryApproved: false,
      canonicalizationRulesetApproved: false,
      canonicalizationRulesetActive: false,
      digestAlgorithmSelected: false,
      digestAlgorithmApproved: false,
      digestEncodingSelected: false,
      digestEncodingApproved: false,
      canonicalizationAllowed: false,
      digestGenerationAllowed: false,
      reviewUseAllowed: false,
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
  for (const field of protectedRecordFields) {
    if (!Array.isArray(artifact[field]) || artifact[field].length !== 0) {
      fail(`${field} must remain empty in Wave 6 Slice 2.`);
    }
  }
  requireExactValue(
    artifact.recordBoundary,
    {
      policyDecisionsRecorded: false,
      canonicalRepresentationsRecorded: false,
      digestValuesRecorded: false,
      candidateIdentitiesRecorded: false,
      candidateReservationsRecorded: false,
      candidateApprovalsRecorded: false,
      reviewEvidenceRecorded: false,
      reviewDecisionsRecorded: false,
      reviewerIdentitiesRecorded: false,
      auditIdentitiesRecorded: false,
      reviewerAssignmentsRecorded: false,
      ownerAssignmentsRecorded: false,
      authorityGrantsRecorded: false,
      productionApprovalsRecorded: false,
      algorithmSelectionsRecorded: false,
      encodingSelectionsRecorded: false,
      invalidationExecutionsRecorded: false,
      regenerationExecutionsRecorded: false,
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
      selectedContentFieldCount: 0,
      activeCanonicalizationRuleCount: 0,
      activeCanonicalizationRulesetCount: 0,
      selectedDigestAlgorithmCount: 0,
      selectedDigestEncodingCount: 0,
      canonicalRepresentationCount: 0,
      realCandidateIdCount: 0,
      reservedCandidateIdCount: 0,
      approvedCandidateCount: 0,
      policyDecisionCount: 0,
      reviewEvidenceRecordCount: 0,
      reviewDecisionCount: 0,
      digestValueCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      reviewerAssignmentCount: 0,
      ownerAssignmentCount: 0,
      authorityGrantCount: 0,
      productionApprovalCount: 0,
      invalidationExecutionCount: 0,
      regenerationExecutionCount: 0,
    },
    "aggregate",
  );
  return {
    proposalArtifactVersion: artifact.metadata.proposalArtifactVersion,
    proposalVersion: artifact.metadata.proposalVersion,
    proposalStatus: artifact.metadata.status,
    prerequisiteStatus: artifact.currentBaseline.canonicalizationDigestPrerequisite.status,
    syntheticExampleCount: artifact.syntheticExamples.length,
    acceptedSyntheticExampleCount: acceptedCount,
    rejectedSyntheticExampleCount: rejectedCount,
    selectedDigestAlgorithmCount: artifact.aggregate.selectedDigestAlgorithmCount,
    digestValueCount: artifact.aggregate.digestValueCount,
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

export async function readDiagnosticCanonicalizationDigestPolicyDecisionProposal(
  artifactPath = defaultCanonicalizationDigestDecisionProposalPath,
) {
  return readJson(artifactPath);
}

export async function readDiagnosticCanonicalizationDigestPolicyDecisionProposalUpstream(
  upstreamPaths = defaultUpstreamPaths,
) {
  const [activationPrerequisites, placeholder, identityProposal, digestRegistry, canonicalization] =
    await Promise.all([
      readJson(upstreamPaths.activationPrerequisites),
      readJson(upstreamPaths.placeholder),
      readJson(upstreamPaths.identityProposal),
      readJson(upstreamPaths.digestRegistry),
      readJson(upstreamPaths.canonicalization),
    ]);
  return {
    activationPrerequisites,
    placeholder,
    identityProposal,
    digestRegistry,
    canonicalization,
  };
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateCanonicalizationDigestDecisionProposalChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (!wave6Slice2ChangedPaths.has(changedPath)) {
      fail(`Wave 6 Slice 2 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateCanonicalizationDigestDecisionProposalWorktreeScope({
  cwd = repoRoot,
} = {}) {
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
  return validateCanonicalizationDigestDecisionProposalChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [artifact, upstream] = await Promise.all([
    readDiagnosticCanonicalizationDigestPolicyDecisionProposal(),
    readDiagnosticCanonicalizationDigestPolicyDecisionProposalUpstream(),
  ]);
  const summary = validateDiagnosticCanonicalizationDigestPolicyDecisionProposal(
    artifact,
    upstream,
  );
  if (checkWorktreeScope) {
    validateCanonicalizationDigestDecisionProposalWorktreeScope();
  }
  console.log(
    `[curriculum] Canonicalization and digest decision proposal ${summary.proposalArtifactVersion} validated: ${summary.syntheticExampleCount} synthetic vectors (${summary.acceptedSyntheticExampleCount} accepted, ${summary.rejectedSyntheticExampleCount} rejected), ${summary.selectedDigestAlgorithmCount} selected algorithms, ${summary.digestValueCount} digest values, ${summary.approvedCandidateCount} approved candidates, ${summary.productionApprovalCount} production approvals; proposal ${summary.proposalStatus}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
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
