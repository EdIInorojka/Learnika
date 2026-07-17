import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  readDiagnosticCandidateDigestRegistry,
  validateDiagnosticCandidateDigestRegistry,
} from "./validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "./validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "./validate-diagnostic-review-gate-rubric.mjs";

const expectedPolicyArtifactVersion = "wave-4.slice-6.grade-7-9-math.v1";
const expectedPolicyId = "diagnostic-candidate-canonicalization";
const expectedPolicyVersion = "wave-4.slice-6.diagnostic-candidate-canonicalization.placeholder.v1";
const expectedRegistryArtifactVersion = "wave-4.slice-5.grade-7-9-math.v1";
const expectedIdentityPolicyVersion = "wave-4.slice-5.candidate-identity-format.placeholder.v1";
const expectedAlgorithmPolicyVersion = "wave-4.slice-5.candidate-digest-algorithm.placeholder.v1";
const expectedPriorCanonicalizationPolicyVersion =
  "wave-4.slice-5.candidate-canonicalization.placeholder.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const expectedNormalizationCategoryIds = [
  "LOCALE_LANGUAGE_HANDLING",
  "MATH_NOTATION_HANDLING",
  "WHITESPACE_HANDLING",
  "PUNCTUATION_HANDLING",
  "FIELD_ORDERING_HANDLING",
];
const expectedInclusionCategoryIds = [
  "CANDIDATE_IDENTITY_METADATA_FIELD_CLASS",
  "CURRICULUM_REFERENCE_METADATA_FIELD_CLASS",
  "DIAGNOSTIC_PAYLOAD_FIELD_CLASS",
  "ACCESSIBILITY_METADATA_FIELD_CLASS",
];
const expectedExclusionCategoryIds = [
  "REVIEW_WORKFLOW_METADATA_FIELD_CLASS",
  "RUNTIME_DELIVERY_METADATA_FIELD_CLASS",
  "PERSONAL_DATA_FIELD_CLASS",
  "PROVIDER_DATA_FIELD_CLASS",
];
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
  "immutableDigest",
  "sha256",
  "contentHash",
  "canonicalizedContent",
  "normalizedStem",
  "itemStem",
  "candidateStem",
  "ocrOutput",
  "sttOutput",
  "learnerResponse",
];

const topLevelFields = new Set([
  "metadata",
  "policyIdentity",
  "dependencyReferences",
  "normalizationCategoryPlaceholders",
  "contentFieldCategoryPlaceholders",
  "localeLanguageHandling",
  "mathNotationHandling",
  "whitespacePunctuationHandling",
  "recordBoundary",
  "readiness",
  "aggregate",
  "activeCanonicalizationRuleRecords",
  "transformedCandidateRecords",
  "reviewDecisionRecords",
  "productionApprovalRecords",
]);
const metadataFields = new Set([
  "schemaVersion",
  "policyArtifactVersion",
  "status",
  "artifactKind",
  "subject",
  "locale",
  "audienceGrades",
  "candidateDigestRegistryArtifactVersion",
  "diagnosticReadinessPolicyVersion",
  "sourceContract",
  "productionUseAllowed",
  "runtimeUseAllowed",
  "storageAllowed",
]);
const policyIdentityFields = new Set([
  "policyId",
  "policyVersion",
  "status",
  "activeRulesetVersion",
  "activationAllowed",
]);
const dependencyReferenceFields = new Set([
  "candidateDigestRegistry",
  "candidateIdentityPolicy",
  "digestAlgorithmPolicy",
  "priorCanonicalizationPolicy",
]);
const registryReferenceFields = new Set([
  "artifactVersion",
  "artifactStatus",
  "candidatePlaceholderCount",
  "digestValueCount",
]);
const policyReferenceFields = new Set(["policyVersion", "state"]);
const normalizationCategoryFields = new Set(["categoryId", "state", "policyRef", "activeRuleRefs"]);
const contentFieldCategoryFields = new Set([
  "inclusionCategoryPlaceholders",
  "exclusionCategoryPlaceholders",
]);
const fieldCategoryFields = new Set(["categoryId", "state", "fieldRefs"]);
const localeLanguageHandlingFields = new Set([
  "state",
  "targetLocale",
  "policyRef",
  "activeRuleRefs",
]);
const mathNotationHandlingFields = new Set(["state", "policyRef", "activeRuleRefs"]);
const whitespacePunctuationHandlingFields = new Set([
  "state",
  "whitespacePolicyRef",
  "punctuationPolicyRef",
  "activeRuleRefs",
]);
const recordBoundaryFields = new Set([
  "canonicalizationPolicyActivated",
  "canonicalizationRulesRecorded",
  "transformedCandidateRecordsRecorded",
  "digestValuesRecorded",
  "reviewDecisionsRecorded",
  "productionApprovalsRecorded",
]);
const readinessFields = new Set([
  "status",
  "policyVersion",
  "blockingReasons",
  "productionUseAllowed",
]);
const aggregateFields = new Set([
  "normalizationCategoryPlaceholderCount",
  "inclusionCategoryPlaceholderCount",
  "exclusionCategoryPlaceholderCount",
  "activeRuleCount",
  "transformedCandidateRecordCount",
  "digestValueCount",
  "reviewDecisionCount",
  "productionApprovedCandidateCount",
]);
const approvedSlice6ChangedPaths = new Set([
  "docs/wave-4/closure-gate.md",
  "docs/wave-4/diagnostic-candidate-canonicalization-contract.md",
  "docs/wave-4/diagnostic-review-authority-contract.md",
  "docs/wave-4/diagnostic-review-workflow-state-contract.md",
  "docs/wave-4/slice-6-implementation-note.md",
  "docs/wave-4/slice-7-implementation-note.md",
  "docs/wave-4/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-candidate-canonicalization/grade-7-9-math.canonicalization-placeholder.v1.json",
  "packages/curriculum/diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
  "packages/curriculum/diagnostic-review-workflow-state/grade-7-9-math.review-workflow-state-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/test/diagnostic-candidate-canonicalization.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-review-workflow-state.test.mjs",
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

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultCanonicalizationPolicyPath = path.resolve(
  scriptDir,
  "../diagnostic-candidate-canonicalization/grade-7-9-math.canonicalization-placeholder.v1.json",
);
export const repoRoot = path.resolve(scriptDir, "../../..");

export class DiagnosticCandidateCanonicalizationValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiagnosticCandidateCanonicalizationValidationError";
  }
}

function fail(message) {
  throw new DiagnosticCandidateCanonicalizationValidationError(message);
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
      fail(`${fieldPath} contains a hash-like value, which is forbidden in Slice 6.`);
    }
  }
}

function validateUpstreamRegistry(registry, coverage, evidence, rubric) {
  const summary = validateDiagnosticCandidateDigestRegistry(registry, coverage, evidence, rubric);
  if (summary.registryArtifactVersion !== expectedRegistryArtifactVersion) {
    fail(`Referenced candidate digest registry must be ${expectedRegistryArtifactVersion}.`);
  }
  if (
    summary.assignedCandidateIdentityCount !== 0 ||
    summary.digestValueCount !== 0 ||
    summary.reviewEvidenceRecordCount !== 0 ||
    summary.reviewDecisionCount !== 0 ||
    summary.productionApprovedCandidateCount !== 0
  ) {
    fail("Referenced candidate digest registry must remain empty and non-approving.");
  }
  return summary;
}

function validateMetadata(metadata, registry) {
  requireExactFields(metadata, metadataFields, "metadata");
  const expectedValues = new Map([
    ["schemaVersion", "learnika.diagnosticCandidateCanonicalizationPlaceholder.v1"],
    ["policyArtifactVersion", expectedPolicyArtifactVersion],
    ["status", "unresolved_placeholder_only_non_production"],
    ["artifactKind", "diagnostic_candidate_canonicalization_placeholder"],
    ["subject", "math"],
    ["locale", "ru-RU"],
    ["candidateDigestRegistryArtifactVersion", expectedRegistryArtifactVersion],
    ["diagnosticReadinessPolicyVersion", expectedReadinessPolicyVersion],
    ["sourceContract", "docs/wave-4/diagnostic-candidate-canonicalization-contract.md"],
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
  if (
    metadata.candidateDigestRegistryArtifactVersion !== registry.metadata.registryArtifactVersion
  ) {
    fail("metadata.candidateDigestRegistryArtifactVersion must match the registry artifact.");
  }
}

function validatePolicyIdentity(policyIdentity) {
  requireExactFields(policyIdentity, policyIdentityFields, "policyIdentity");
  if (
    policyIdentity.policyId !== expectedPolicyId ||
    policyIdentity.policyVersion !== expectedPolicyVersion ||
    policyIdentity.status !== "UNRESOLVED_DEFERRED" ||
    policyIdentity.activeRulesetVersion !== null ||
    policyIdentity.activationAllowed !== false
  ) {
    fail("policyIdentity must remain the unresolved and inactive Slice 6 placeholder.");
  }
}

function validateDependencyReferences(dependencies, registry) {
  requireExactFields(dependencies, dependencyReferenceFields, "dependencyReferences");
  requireExactFields(
    dependencies.candidateDigestRegistry,
    registryReferenceFields,
    "dependencyReferences.candidateDigestRegistry",
  );
  if (
    dependencies.candidateDigestRegistry.artifactVersion !== expectedRegistryArtifactVersion ||
    dependencies.candidateDigestRegistry.artifactStatus !== registry.metadata.status ||
    dependencies.candidateDigestRegistry.candidatePlaceholderCount !==
      registry.aggregate.candidatePlaceholderCount ||
    dependencies.candidateDigestRegistry.candidatePlaceholderCount !== 11 ||
    dependencies.candidateDigestRegistry.digestValueCount !== registry.aggregate.digestValueCount ||
    dependencies.candidateDigestRegistry.digestValueCount !== 0
  ) {
    fail("dependencyReferences.candidateDigestRegistry must match the Slice 5 placeholder.");
  }

  const policyDependencies = [
    [
      "candidateIdentityPolicy",
      expectedIdentityPolicyVersion,
      "FORMAT_DEFINED_ASSIGNMENT_DEFERRED",
      registry.policies.candidateIdentityFormat,
    ],
    [
      "digestAlgorithmPolicy",
      expectedAlgorithmPolicyVersion,
      "DEFERRED",
      registry.policies.digestAlgorithm,
    ],
    [
      "priorCanonicalizationPolicy",
      expectedPriorCanonicalizationPolicyVersion,
      "DEFERRED",
      registry.policies.canonicalization,
    ],
  ];
  for (const [field, expectedVersion, expectedState, registryPolicy] of policyDependencies) {
    const reference = dependencies[field];
    const fieldPath = `dependencyReferences.${field}`;
    requireExactFields(reference, policyReferenceFields, fieldPath);
    if (
      reference.policyVersion !== expectedVersion ||
      reference.policyVersion !== registryPolicy.policyVersion ||
      reference.state !== expectedState ||
      reference.state !== registryPolicy.state
    ) {
      fail(`${fieldPath} must match the unresolved Slice 5 policy.`);
    }
  }
}

function validateNormalizationCategories(categories) {
  if (!Array.isArray(categories) || categories.length !== expectedNormalizationCategoryIds.length) {
    fail("normalizationCategoryPlaceholders must contain exactly five placeholder categories.");
  }
  const expectedIds = new Set(expectedNormalizationCategoryIds);
  const seenIds = new Set();
  for (const [index, category] of categories.entries()) {
    const fieldPath = `normalizationCategoryPlaceholders[${index}]`;
    requireExactFields(category, normalizationCategoryFields, fieldPath);
    requireString(category.categoryId, `${fieldPath}.categoryId`);
    if (!expectedIds.has(category.categoryId)) {
      fail(`${fieldPath} uses unknown normalization category ${category.categoryId}.`);
    }
    if (seenIds.has(category.categoryId)) {
      fail(`Duplicate normalization category ${category.categoryId}.`);
    }
    seenIds.add(category.categoryId);
    if (
      category.state !== "TO_BE_DECIDED" ||
      category.policyRef !== null ||
      !Array.isArray(category.activeRuleRefs) ||
      category.activeRuleRefs.length !== 0
    ) {
      fail(`${fieldPath} must remain an unresolved placeholder without active rules.`);
    }
  }
  for (const categoryId of expectedIds) {
    if (!seenIds.has(categoryId)) {
      fail(`Missing normalization category ${categoryId}.`);
    }
  }
  return seenIds.size;
}

function validateFieldCategoryList(categories, expectedCategoryIds, fieldPath) {
  if (!Array.isArray(categories) || categories.length !== expectedCategoryIds.length) {
    fail(`${fieldPath} must contain exactly four placeholder categories.`);
  }
  const expectedIds = new Set(expectedCategoryIds);
  const seenIds = new Set();
  for (const [index, category] of categories.entries()) {
    const categoryPath = `${fieldPath}[${index}]`;
    requireExactFields(category, fieldCategoryFields, categoryPath);
    requireString(category.categoryId, `${categoryPath}.categoryId`);
    if (!expectedIds.has(category.categoryId)) {
      fail(`${categoryPath} uses unknown field category ${category.categoryId}.`);
    }
    if (seenIds.has(category.categoryId)) {
      fail(`${fieldPath} contains duplicate category ${category.categoryId}.`);
    }
    seenIds.add(category.categoryId);
    if (
      category.state !== "TO_BE_DECIDED" ||
      !Array.isArray(category.fieldRefs) ||
      category.fieldRefs.length !== 0
    ) {
      fail(`${categoryPath} must remain unresolved without concrete field references.`);
    }
  }
  return seenIds.size;
}

function validateContentFieldCategories(contentFieldCategories) {
  requireExactFields(
    contentFieldCategories,
    contentFieldCategoryFields,
    "contentFieldCategoryPlaceholders",
  );
  return {
    inclusionCount: validateFieldCategoryList(
      contentFieldCategories.inclusionCategoryPlaceholders,
      expectedInclusionCategoryIds,
      "contentFieldCategoryPlaceholders.inclusionCategoryPlaceholders",
    ),
    exclusionCount: validateFieldCategoryList(
      contentFieldCategories.exclusionCategoryPlaceholders,
      expectedExclusionCategoryIds,
      "contentFieldCategoryPlaceholders.exclusionCategoryPlaceholders",
    ),
  };
}

function validateSpecializedPlaceholders(artifact) {
  requireExactFields(
    artifact.localeLanguageHandling,
    localeLanguageHandlingFields,
    "localeLanguageHandling",
  );
  if (
    artifact.localeLanguageHandling.state !== "UNRESOLVED" ||
    artifact.localeLanguageHandling.targetLocale !== "ru-RU" ||
    artifact.localeLanguageHandling.policyRef !== null ||
    !Array.isArray(artifact.localeLanguageHandling.activeRuleRefs) ||
    artifact.localeLanguageHandling.activeRuleRefs.length !== 0
  ) {
    fail("localeLanguageHandling must remain an unresolved ru-RU placeholder.");
  }

  requireExactFields(
    artifact.mathNotationHandling,
    mathNotationHandlingFields,
    "mathNotationHandling",
  );
  if (
    artifact.mathNotationHandling.state !== "UNRESOLVED" ||
    artifact.mathNotationHandling.policyRef !== null ||
    !Array.isArray(artifact.mathNotationHandling.activeRuleRefs) ||
    artifact.mathNotationHandling.activeRuleRefs.length !== 0
  ) {
    fail("mathNotationHandling must remain unresolved without active rules.");
  }

  requireExactFields(
    artifact.whitespacePunctuationHandling,
    whitespacePunctuationHandlingFields,
    "whitespacePunctuationHandling",
  );
  if (
    artifact.whitespacePunctuationHandling.state !== "UNRESOLVED" ||
    artifact.whitespacePunctuationHandling.whitespacePolicyRef !== null ||
    artifact.whitespacePunctuationHandling.punctuationPolicyRef !== null ||
    !Array.isArray(artifact.whitespacePunctuationHandling.activeRuleRefs) ||
    artifact.whitespacePunctuationHandling.activeRuleRefs.length !== 0
  ) {
    fail("whitespacePunctuationHandling must remain unresolved without active rules.");
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

function validateReadiness(readiness, registry) {
  requireExactFields(readiness, readinessFields, "readiness");
  if (readiness.status !== "NOT_READY") {
    fail("readiness.status must remain NOT_READY.");
  }
  if (
    readiness.policyVersion !== expectedReadinessPolicyVersion ||
    readiness.policyVersion !== registry.readiness.policyVersion
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
    ["activeCanonicalizationRuleRecords", artifact.activeCanonicalizationRuleRecords],
    ["transformedCandidateRecords", artifact.transformedCandidateRecords],
    ["reviewDecisionRecords", artifact.reviewDecisionRecords],
    ["productionApprovalRecords", artifact.productionApprovalRecords],
  ];
  for (const [field, records] of arrays) {
    if (!Array.isArray(records) || records.length !== 0) {
      fail(`${field} must remain empty in Slice 6.`);
    }
  }
}

function validateAggregate(aggregate, categoryCounts) {
  requireExactFields(aggregate, aggregateFields, "aggregate");
  if (
    aggregate.normalizationCategoryPlaceholderCount !== categoryCounts.normalizationCount ||
    aggregate.normalizationCategoryPlaceholderCount !== 5 ||
    aggregate.inclusionCategoryPlaceholderCount !== categoryCounts.inclusionCount ||
    aggregate.inclusionCategoryPlaceholderCount !== 4 ||
    aggregate.exclusionCategoryPlaceholderCount !== categoryCounts.exclusionCount ||
    aggregate.exclusionCategoryPlaceholderCount !== 4
  ) {
    fail("aggregate category counts must match the placeholder definitions.");
  }
  if (
    aggregate.activeRuleCount !== 0 ||
    aggregate.transformedCandidateRecordCount !== 0 ||
    aggregate.digestValueCount !== 0 ||
    aggregate.reviewDecisionCount !== 0 ||
    aggregate.productionApprovedCandidateCount !== 0
  ) {
    fail("aggregate must remain at zero rules, transforms, digests, decisions and approvals.");
  }
}

export function validateDiagnosticCandidateCanonicalization(
  artifact,
  registry,
  coverage,
  evidence,
  rubric,
) {
  if (!isPlainObject(artifact)) {
    fail("Candidate canonicalization policy artifact must be a JSON object.");
  }

  validateUpstreamRegistry(registry, coverage, evidence, rubric);
  scanForbiddenTermsAndHashLikeValues(artifact);
  requireExactFields(artifact, topLevelFields, "$");
  validateMetadata(artifact.metadata, registry);
  validatePolicyIdentity(artifact.policyIdentity);
  validateDependencyReferences(artifact.dependencyReferences, registry);
  const normalizationCount = validateNormalizationCategories(
    artifact.normalizationCategoryPlaceholders,
  );
  const fieldCategoryCounts = validateContentFieldCategories(
    artifact.contentFieldCategoryPlaceholders,
  );
  validateSpecializedPlaceholders(artifact);
  validateRecordBoundary(artifact.recordBoundary);
  validateReadiness(artifact.readiness, registry);
  validateEmptyRecordArrays(artifact);
  validateAggregate(artifact.aggregate, { normalizationCount, ...fieldCategoryCounts });

  return {
    policyArtifactVersion: artifact.metadata.policyArtifactVersion,
    policyId: artifact.policyIdentity.policyId,
    policyVersion: artifact.policyIdentity.policyVersion,
    policyStatus: artifact.policyIdentity.status,
    candidateDigestRegistryArtifactVersion:
      artifact.metadata.candidateDigestRegistryArtifactVersion,
    normalizationCategoryPlaceholderCount: normalizationCount,
    inclusionCategoryPlaceholderCount: fieldCategoryCounts.inclusionCount,
    exclusionCategoryPlaceholderCount: fieldCategoryCounts.exclusionCount,
    activeRuleCount: artifact.activeCanonicalizationRuleRecords.length,
    transformedCandidateRecordCount: artifact.transformedCandidateRecords.length,
    digestValueCount: artifact.aggregate.digestValueCount,
    reviewDecisionCount: artifact.reviewDecisionRecords.length,
    productionApprovedCandidateCount: artifact.aggregate.productionApprovedCandidateCount,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticCandidateCanonicalization(
  artifactPath = defaultCanonicalizationPolicyPath,
) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateCandidateCanonicalizationChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice6ChangedPaths.has(changedPath) &&
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
      !wave5ClosureScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 4 Slice 6 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateCandidateCanonicalizationWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateCandidateCanonicalizationChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [artifact, registry, coverage, evidence, rubric] = await Promise.all([
    readDiagnosticCandidateCanonicalization(),
    readDiagnosticCandidateDigestRegistry(),
    readDiagnosticReviewCoverage(),
    readDiagnosticReviewEvidence(),
    readDiagnosticReviewGateRubric(),
  ]);
  const summary = validateDiagnosticCandidateCanonicalization(
    artifact,
    registry,
    coverage,
    evidence,
    rubric,
  );

  if (checkWorktreeScope) {
    validateCandidateCanonicalizationWorktreeScope();
  }

  console.log(
    `[curriculum] Candidate canonicalization ${summary.policyArtifactVersion} validated: ${summary.normalizationCategoryPlaceholderCount} normalization categories, ${summary.inclusionCategoryPlaceholderCount} inclusion categories, ${summary.exclusionCategoryPlaceholderCount} exclusion categories, ${summary.activeRuleCount} active rules, ${summary.transformedCandidateRecordCount} transformed candidates, ${summary.digestValueCount} digest values, ${summary.reviewDecisionCount} review decisions, ${summary.productionApprovedCandidateCount} production-approved candidates; status ${summary.policyStatus}, readiness ${summary.readiness}.`,
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
