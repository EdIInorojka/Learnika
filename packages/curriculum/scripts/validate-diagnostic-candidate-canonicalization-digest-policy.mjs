import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "./validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateDigestRegistry } from "./validate-diagnostic-candidate-digest.mjs";
import {
  readDiagnosticCandidateIdentityPolicy,
  validateDiagnosticCandidateIdentityPolicy,
} from "./validate-diagnostic-candidate-identity-policy.mjs";
import { readDiagnosticReviewActivationPrerequisites } from "./validate-diagnostic-review-activation-prerequisites.mjs";
import { readDiagnosticReviewAuthority } from "./validate-diagnostic-review-authority.mjs";
import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "./validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "./validate-diagnostic-review-gate-rubric.mjs";
import { readDiagnosticReviewWorkflowState } from "./validate-diagnostic-review-workflow-state.mjs";

const expectedArtifactVersion = "wave-5.slice-4.grade-7-9-math.v1";
const expectedPolicyVersion =
  "wave-5.slice-4.diagnostic-candidate-canonicalization-and-digest.placeholder.v1";
const expectedActivationArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedIdentityArtifactVersion = "wave-5.slice-3.grade-7-9-math.v1";
const expectedDigestRegistryVersion = "wave-4.slice-5.grade-7-9-math.v1";
const expectedCanonicalizationArtifactVersion = "wave-4.slice-6.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const requiredBlockingReasons = new Set(["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"]);
const expectedDecisionRequirementIds = new Set([
  "candidate_field_inventory",
  "field_inclusion_and_exclusion",
  "deterministic_ordering_and_byte_serialization",
  "locale_unicode_language_and_line_endings",
  "mathematical_notation_symbol_unit_and_expression_serialization",
  "whitespace_and_punctuation_handling",
  "canonicalization_versioning_migration_and_invalidation",
  "digest_algorithm_encoding_and_domain_separation",
  "digest_collision_incident_and_algorithm_migration",
  "independent_reproducibility_and_synthetic_vectors",
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
const approvedSlice4ChangedPaths = new Set([
  "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md",
  "docs/wave-5/slice-4-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
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
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultCandidateCanonicalizationDigestPolicyPath = path.resolve(
  scriptDir,
  "../diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json",
);

export class DiagnosticCandidateCanonicalizationDigestPolicyValidationError extends Error {}

function fail(message) {
  throw new DiagnosticCandidateCanonicalizationDigestPolicyValidationError(message);
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
      fail(`${fieldPath} contains a hash-like value, which is forbidden in Slice 4.`);
    }
    if (/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(value)) {
      fail(`${fieldPath} contains an email-like value, which is forbidden in Slice 4.`);
    }
    if (/^dcandidate\.[a-z0-9.-]+\.v[1-9][0-9]*$/i.test(value)) {
      fail(`${fieldPath} contains a concrete candidate ID, which is forbidden in Slice 4.`);
    }
  }
}

function validateUpstreamArtifacts(upstream) {
  const identitySummary = validateDiagnosticCandidateIdentityPolicy(
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
    identitySummary.policyArtifactVersion !== expectedIdentityArtifactVersion ||
    identitySummary.policyState !== "UNRESOLVED_DEFERRED" ||
    identitySummary.prerequisiteStatus !== "UNSATISFIED_DEFERRED" ||
    identitySummary.realCandidateIdCount !== 0 ||
    identitySummary.submittedCandidateCount !== 0 ||
    identitySummary.approvedCandidateCount !== 0 ||
    identitySummary.productionApprovalCount !== 0 ||
    identitySummary.activationStatus !== "BLOCKED" ||
    identitySummary.reviewWorkflowStatus !== "INACTIVE" ||
    identitySummary.readiness !== "NOT_READY" ||
    upstream.activationPrerequisites.metadata.activationPrerequisitesArtifactVersion !==
      expectedActivationArtifactVersion ||
    upstream.registry.metadata.registryArtifactVersion !== expectedDigestRegistryVersion ||
    upstream.canonicalization.metadata.policyArtifactVersion !==
      expectedCanonicalizationArtifactVersion
  ) {
    fail("Upstream artifacts must remain pinned to the blocked Slice 3 and Wave 4 baseline.");
  }
  const prerequisite = upstream.activationPrerequisites.prerequisites.find(
    ({ prerequisiteId }) => prerequisiteId === "canonicalization_and_digest_policy",
  );
  if (
    !prerequisite ||
    prerequisite.status !== "UNSATISFIED_DEFERRED" ||
    prerequisite.ownerPlaceholderId !== "UNASSIGNED_OWNER_PLACEHOLDER" ||
    prerequisite.evidenceRecordRefs.length !== 0
  ) {
    fail(
      "canonicalization_and_digest_policy must remain the exact unsatisfied Slice 2 prerequisite.",
    );
  }
  return { identitySummary, prerequisite };
}

function expectedMetadata(upstream) {
  return {
    schemaVersion: "learnika.diagnosticCandidateCanonicalizationDigestPolicyPlaceholder.v1",
    policyArtifactVersion: expectedArtifactVersion,
    status: "placeholder_only_unsatisfied_non_production",
    artifactKind: "diagnostic_candidate_canonicalization_digest_policy_placeholder",
    subject: "math",
    locale: "ru-RU",
    audienceGrades: [7, 8, 9],
    activationPrerequisitesArtifactVersion:
      upstream.activationPrerequisites.metadata.activationPrerequisitesArtifactVersion,
    candidateIdentityPolicyArtifactVersion: upstream.identityPolicy.metadata.policyArtifactVersion,
    candidateDigestRegistryArtifactVersion: upstream.registry.metadata.registryArtifactVersion,
    candidateCanonicalizationArtifactVersion:
      upstream.canonicalization.metadata.policyArtifactVersion,
    diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
    sourceContract: "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md",
    productionUseAllowed: false,
    runtimeUseAllowed: false,
    storageAllowed: false,
  };
}

function expectedDependencies(upstream, identitySummary, prerequisite) {
  const { activationPrerequisites, identityPolicy, registry, canonicalization } = upstream;
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
    candidateIdentityPolicy: {
      artifactVersion: identityPolicy.metadata.policyArtifactVersion,
      policyVersion: identityPolicy.policyIdentity.policyVersion,
      policyState: identitySummary.policyState,
      prerequisiteStatus: identitySummary.prerequisiteStatus,
      realCandidateIdCount: identitySummary.realCandidateIdCount,
      submittedCandidateCount: identitySummary.submittedCandidateCount,
      approvedCandidateCount: identitySummary.approvedCandidateCount,
      productionApprovalCount: identitySummary.productionApprovalCount,
    },
    candidateDigestRegistry: {
      artifactVersion: registry.metadata.registryArtifactVersion,
      digestAlgorithmPolicyVersion: registry.policies.digestAlgorithm.policyVersion,
      digestAlgorithmState: registry.policies.digestAlgorithm.state,
      algorithmId: registry.policies.digestAlgorithm.algorithmId,
      valueEncoding: registry.policies.digestAlgorithm.valueEncoding,
      canonicalizationPolicyVersion: registry.policies.canonicalization.policyVersion,
      canonicalizationState: registry.policies.canonicalization.state,
      rulesetVersion: registry.policies.canonicalization.rulesetVersion,
      assignedCandidateIdentityCount: registry.aggregate.assignedCandidateIdentityCount,
      digestValueCount: registry.aggregate.digestValueCount,
      productionApprovedCandidateCount: registry.aggregate.productionApprovedCandidateCount,
    },
    candidateCanonicalization: {
      artifactVersion: canonicalization.metadata.policyArtifactVersion,
      policyVersion: canonicalization.policyIdentity.policyVersion,
      policyState: canonicalization.policyIdentity.status,
      activeRulesetVersion: canonicalization.policyIdentity.activeRulesetVersion,
      activeRuleCount: canonicalization.aggregate.activeRuleCount,
      transformedCandidateRecordCount: canonicalization.aggregate.transformedCandidateRecordCount,
      digestValueCount: canonicalization.aggregate.digestValueCount,
      productionApprovedCandidateCount: canonicalization.aggregate.productionApprovedCandidateCount,
    },
  };
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
        testVectorReferences: [],
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
  if (!isPlainObject(readiness)) {
    fail("readiness must be an object.");
  }
  const expectedFields = new Set(["policyVersion", "status", "blockingReasons"]);
  for (const key of Object.keys(readiness)) {
    if (!expectedFields.has(key)) {
      fail(`readiness.${key} is an unexpected field.`);
    }
  }
  for (const field of expectedFields) {
    if (!Object.hasOwn(readiness, field)) {
      fail(`readiness.${field} is required.`);
    }
  }
  if (
    readiness.policyVersion !== expectedReadinessPolicyVersion ||
    readiness.policyVersion !== upstream.activationPrerequisites.readiness.policyVersion ||
    readiness.policyVersion !== upstream.identityPolicy.readiness.policyVersion ||
    readiness.policyVersion !== upstream.canonicalization.readiness.policyVersion
  ) {
    fail("readiness.policyVersion must remain pinned to the Wave 3 policy.");
  }
  if (readiness.status !== "NOT_READY") {
    fail("readiness.status must remain NOT_READY.");
  }
  if (
    !Array.isArray(readiness.blockingReasons) ||
    readiness.blockingReasons.length !== requiredBlockingReasons.size ||
    new Set(readiness.blockingReasons).size !== requiredBlockingReasons.size ||
    [...requiredBlockingReasons].some((reason) => !readiness.blockingReasons.includes(reason))
  ) {
    fail("readiness.blockingReasons must remain exactly the two approved blockers.");
  }
}

function validateEmptyRecordsAndAggregate(artifact, requirementCount) {
  const recordFields = [
    "selectedContentFieldRecords",
    "activeCanonicalizationRuleRecords",
    "selectedDigestAlgorithmRecords",
    "selectedDigestEncodingRecords",
    "reproducibilityVectorRecords",
    "transformedCandidateRecords",
    "candidateIdentityRecords",
    "candidateSubmissionRecords",
    "candidateApprovalRecords",
    "generatedHashRecords",
    "digestValueRecords",
    "policyDecisionRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "ownerAssignmentRecords",
    "productionApprovalRecords",
  ];
  for (const field of recordFields) {
    if (!Array.isArray(artifact[field]) || artifact[field].length !== 0) {
      fail(`${field} must remain empty in Slice 4.`);
    }
  }
  requireExactValue(
    artifact.recordBoundary,
    {
      policyDecisionsRecorded: false,
      policyOwnerAssigned: false,
      contentFieldsSelected: false,
      canonicalizationRulesRecorded: false,
      canonicalizationRulesetActivated: false,
      digestAlgorithmSelected: false,
      digestEncodingSelected: false,
      deterministicSerializationEnabled: false,
      reproducibilityVectorsRecorded: false,
      transformedCandidateRecordsRecorded: false,
      candidateIdentitiesRecorded: false,
      candidateSubmissionsRecorded: false,
      candidateApprovalsRecorded: false,
      generatedHashesRecorded: false,
      digestValuesRecorded: false,
      reviewEvidenceRecorded: false,
      reviewDecisionsRecorded: false,
      reviewerIdentitiesRecorded: false,
      auditIdentitiesRecorded: false,
      ownerAssignmentsRecorded: false,
      productionApprovalsRecorded: false,
      runtimeCanonicalizationEnabled: false,
      runtimeDigestGenerationEnabled: false,
    },
    "recordBoundary",
  );
  requireExactValue(
    artifact.aggregate,
    {
      decisionRequirementCount: requirementCount,
      undecidedRequirementCount: requirementCount,
      selectedContentFieldCount: artifact.selectedContentFieldRecords.length,
      activeCanonicalizationRuleCount: artifact.activeCanonicalizationRuleRecords.length,
      activeCanonicalizationRulesetCount: 0,
      selectedDigestAlgorithmCount: artifact.selectedDigestAlgorithmRecords.length,
      selectedDigestEncodingCount: artifact.selectedDigestEncodingRecords.length,
      reproducibilityVectorCount: artifact.reproducibilityVectorRecords.length,
      transformedCandidateRecordCount: artifact.transformedCandidateRecords.length,
      realCandidateIdCount: artifact.candidateIdentityRecords.length,
      submittedCandidateCount: artifact.candidateSubmissionRecords.length,
      approvedCandidateCount: artifact.candidateApprovalRecords.length,
      generatedHashCount: artifact.generatedHashRecords.length,
      digestValueCount: artifact.digestValueRecords.length,
      policyDecisionCount: artifact.policyDecisionRecords.length,
      reviewEvidenceRecordCount: artifact.reviewEvidenceRecords.length,
      reviewDecisionCount: artifact.reviewDecisionRecords.length,
      reviewerIdentityCount: artifact.reviewerIdentityRecords.length,
      auditIdentityCount: artifact.auditIdentityRecords.length,
      ownerAssignmentCount: artifact.ownerAssignmentRecords.length,
      productionApprovalCount: artifact.productionApprovalRecords.length,
    },
    "aggregate",
  );
}

export function validateDiagnosticCandidateCanonicalizationDigestPolicy(
  artifact,
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
    fail("Diagnostic candidate canonicalization and digest policy placeholder must be an object.");
  }
  const upstream = {
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
  const { identitySummary, prerequisite } = validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  const topLevelFields = new Set([
    "metadata",
    "activationBoundary",
    "dependencyReferences",
    "prerequisiteReference",
    "policyIdentity",
    "policyOwnerPlaceholder",
    "candidateFieldInventoryPlaceholder",
    "fieldInclusionExclusionPlaceholder",
    "canonicalizationRulesetPlaceholder",
    "localeLanguageNormalizationPlaceholder",
    "mathNotationNormalizationPlaceholder",
    "whitespacePunctuationNormalizationPlaceholder",
    "deterministicSerializationPlaceholder",
    "digestAlgorithmDecisionPlaceholder",
    "digestEncodingPlaceholder",
    "digestInvalidationRegenerationPlaceholder",
    "reproducibilityPlaceholder",
    "decisionRequirements",
    "recordBoundary",
    "readiness",
    "aggregate",
    "selectedContentFieldRecords",
    "activeCanonicalizationRuleRecords",
    "selectedDigestAlgorithmRecords",
    "selectedDigestEncodingRecords",
    "reproducibilityVectorRecords",
    "transformedCandidateRecords",
    "candidateIdentityRecords",
    "candidateSubmissionRecords",
    "candidateApprovalRecords",
    "generatedHashRecords",
    "digestValueRecords",
    "policyDecisionRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "ownerAssignmentRecords",
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
    expectedDependencies(upstream, identitySummary, prerequisite),
    "dependencyReferences",
  );
  requireExactValue(artifact.prerequisiteReference, prerequisite, "prerequisiteReference");
  requireExactValue(
    artifact.policyIdentity,
    {
      policyId: "diagnostic-candidate-canonicalization-and-digest",
      policyVersion: expectedPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      fieldInventoryVersion: null,
      activeRulesetVersion: null,
      serializationFormatId: null,
      selectedDigestAlgorithmId: null,
      selectedDigestEncodingId: null,
      policyApprovalAllowed: false,
      candidateProcessingAllowed: false,
      canonicalizationAllowed: false,
      digestGenerationAllowed: false,
      productionApprovalAllowed: false,
    },
    "policyIdentity",
  );
  requireExactValue(
    artifact.policyOwnerPlaceholder,
    {
      state: "TO_BE_DECIDED",
      ownerPlaceholderId: "UNASSIGNED_POLICY_OWNER_PLACEHOLDER",
      ownerReference: null,
      assignmentReference: null,
      authorityAllowed: false,
    },
    "policyOwnerPlaceholder",
  );
  requireExactValue(
    artifact.candidateFieldInventoryPlaceholder,
    {
      requirementId: "candidate_field_inventory",
      state: "TO_BE_DECIDED",
      inventoryVersion: null,
      inventoryPolicyReference: null,
      selectedFieldReferences: [],
      inventoryApproved: false,
      applicationAllowed: false,
    },
    "candidateFieldInventoryPlaceholder",
  );
  requireExactValue(
    artifact.fieldInclusionExclusionPlaceholder,
    {
      requirementId: "field_inclusion_and_exclusion",
      state: "TO_BE_DECIDED",
      inclusionPolicyReference: null,
      exclusionPolicyReference: null,
      includedFieldReferences: [],
      excludedFieldReferences: [],
      policyApproved: false,
      applicationAllowed: false,
    },
    "fieldInclusionExclusionPlaceholder",
  );
  requireExactValue(
    artifact.canonicalizationRulesetPlaceholder,
    {
      requirementId: "canonicalization_versioning_migration_and_invalidation",
      state: "TO_BE_DECIDED",
      rulesetVersion: null,
      rulesetPolicyReference: null,
      migrationPolicyReference: null,
      invalidationPolicyReference: null,
      activeRuleReferences: [],
      rulesetApproved: false,
      rulesetActive: false,
      canonicalizationAllowed: false,
    },
    "canonicalizationRulesetPlaceholder",
  );
  requireExactValue(
    artifact.localeLanguageNormalizationPlaceholder,
    {
      requirementId: "locale_unicode_language_and_line_endings",
      state: "TO_BE_DECIDED",
      targetLocale: "ru-RU",
      unicodePolicyReference: null,
      russianLanguagePolicyReference: null,
      lineEndingPolicyReference: null,
      activeRuleReferences: [],
      normalizationAllowed: false,
    },
    "localeLanguageNormalizationPlaceholder",
  );
  requireExactValue(
    artifact.mathNotationNormalizationPlaceholder,
    {
      requirementId: "mathematical_notation_symbol_unit_and_expression_serialization",
      state: "TO_BE_DECIDED",
      notationPolicyReference: null,
      symbolPolicyReference: null,
      unitPolicyReference: null,
      expressionSerializationPolicyReference: null,
      activeRuleReferences: [],
      normalizationAllowed: false,
    },
    "mathNotationNormalizationPlaceholder",
  );
  requireExactValue(
    artifact.whitespacePunctuationNormalizationPlaceholder,
    {
      requirementId: "whitespace_and_punctuation_handling",
      state: "TO_BE_DECIDED",
      whitespacePolicyReference: null,
      punctuationPolicyReference: null,
      activeRuleReferences: [],
      normalizationAllowed: false,
    },
    "whitespacePunctuationNormalizationPlaceholder",
  );
  requireExactValue(
    artifact.deterministicSerializationPlaceholder,
    {
      requirementId: "deterministic_ordering_and_byte_serialization",
      state: "TO_BE_DECIDED",
      orderingPolicyReference: null,
      byteSerializationPolicyReference: null,
      serializationFormatId: null,
      testVectorReferences: [],
      serializationAllowed: false,
    },
    "deterministicSerializationPlaceholder",
  );
  requireExactValue(
    artifact.digestAlgorithmDecisionPlaceholder,
    {
      requirementId: "digest_algorithm_encoding_and_domain_separation",
      state: "TO_BE_DECIDED",
      algorithmDecisionReference: null,
      algorithmPolicyReference: null,
      algorithmId: null,
      domainSeparationPolicyReference: null,
      algorithmApproved: false,
      algorithmActive: false,
    },
    "digestAlgorithmDecisionPlaceholder",
  );
  requireExactValue(
    artifact.digestEncodingPlaceholder,
    {
      requirementId: "digest_algorithm_encoding_and_domain_separation",
      state: "TO_BE_DECIDED",
      encodingDecisionReference: null,
      encodingPolicyReference: null,
      encodingId: null,
      encodingApproved: false,
      encodingActive: false,
    },
    "digestEncodingPlaceholder",
  );
  requireExactValue(
    artifact.digestInvalidationRegenerationPlaceholder,
    {
      requirementId: "digest_collision_incident_and_algorithm_migration",
      state: "TO_BE_DECIDED",
      collisionResponsePolicyReference: null,
      incidentPolicyReference: null,
      algorithmMigrationPolicyReference: null,
      regenerationPolicyReference: null,
      triggerDefinitions: [],
      invalidationAllowed: false,
      regenerationAllowed: false,
    },
    "digestInvalidationRegenerationPlaceholder",
  );
  requireExactValue(
    artifact.reproducibilityPlaceholder,
    {
      requirementId: "independent_reproducibility_and_synthetic_vectors",
      state: "TO_BE_DECIDED",
      reproducibilityPolicyReference: null,
      syntheticVectorPolicyReference: null,
      testVectorReferences: [],
      reproducibilityClaimAllowed: false,
      vectorGenerationAllowed: false,
    },
    "reproducibilityPlaceholder",
  );
  const requirementCount = validateDecisionRequirements(artifact.decisionRequirements);
  validateReadiness(artifact.readiness, upstream);
  validateEmptyRecordsAndAggregate(artifact, requirementCount);

  return {
    policyArtifactVersion: artifact.metadata.policyArtifactVersion,
    policyVersion: artifact.policyIdentity.policyVersion,
    policyState: artifact.policyIdentity.policyState,
    prerequisiteStatus: artifact.prerequisiteReference.status,
    decisionRequirementCount: requirementCount,
    activeCanonicalizationRuleCount: artifact.aggregate.activeCanonicalizationRuleCount,
    selectedDigestAlgorithmCount: artifact.aggregate.selectedDigestAlgorithmCount,
    generatedHashCount: artifact.aggregate.generatedHashCount,
    digestValueCount: artifact.aggregate.digestValueCount,
    approvedCandidateCount: artifact.aggregate.approvedCandidateCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticCandidateCanonicalizationDigestPolicy(
  artifactPath = defaultCandidateCanonicalizationDigestPolicyPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateCandidateCanonicalizationDigestPolicyChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice4ChangedPaths.has(changedPath) &&
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
      fail(`Wave 5 Slice 4 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateCandidateCanonicalizationDigestPolicyWorktreeScope({
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
  return validateCandidateCanonicalizationDigestPolicyChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [
    artifact,
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
  const summary = validateDiagnosticCandidateCanonicalizationDigestPolicy(
    artifact,
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
    validateCandidateCanonicalizationDigestPolicyWorktreeScope();
  }
  console.log(
    `[curriculum] Candidate canonicalization and digest policy ${summary.policyArtifactVersion} validated: ${summary.decisionRequirementCount} undecided requirements, ${summary.activeCanonicalizationRuleCount} active canonicalization rules, ${summary.selectedDigestAlgorithmCount} selected digest algorithms, ${summary.generatedHashCount} generated hashes, ${summary.digestValueCount} digest values, ${summary.approvedCandidateCount} approved candidates, ${summary.productionApprovalCount} production approvals; policy ${summary.policyState}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, readiness ${summary.readiness}.`,
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
