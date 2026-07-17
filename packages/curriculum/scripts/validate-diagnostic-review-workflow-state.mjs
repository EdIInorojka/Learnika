import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  readDiagnosticCandidateCanonicalization,
  validateDiagnosticCandidateCanonicalization,
} from "./validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateDigestRegistry } from "./validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "./validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "./validate-diagnostic-review-gate-rubric.mjs";

const expectedWorkflowArtifactVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedWorkflowPolicyId = "diagnostic-review-workflow-state";
const expectedWorkflowVersion = "wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1";
const expectedCoverageArtifactVersion = "wave-4.slice-2.grade-7-9-math.v1";
const expectedEvidenceArtifactVersion = "wave-4.slice-3.grade-7-9-math.v1";
const expectedRubricArtifactVersion = "wave-4.slice-4.grade-7-9-math.v1";
const expectedRegistryArtifactVersion = "wave-4.slice-5.grade-7-9-math.v1";
const expectedCanonicalizationArtifactVersion = "wave-4.slice-6.grade-7-9-math.v1";
const expectedCanonicalizationPolicyVersion =
  "wave-4.slice-6.diagnostic-candidate-canonicalization.placeholder.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const expectedPlaceholderStates = [
  "NOT_SUBMITTED",
  "CANDIDATE_DEFERRED",
  "REVIEW_NOT_STARTED",
  "REVIEW_BLOCKED",
  "CHANGES_REQUIRED_DEFERRED",
  "REJECTED_DEFERRED",
  "APPROVED_DEFERRED_PLACEHOLDER",
];
const expectedTransitions = new Map([
  ["NOT_SUBMITTED", ["CANDIDATE_DEFERRED"]],
  ["CANDIDATE_DEFERRED", ["REVIEW_NOT_STARTED"]],
  ["REVIEW_NOT_STARTED", ["REVIEW_BLOCKED"]],
  ["REVIEW_BLOCKED", ["CHANGES_REQUIRED_DEFERRED", "REJECTED_DEFERRED"]],
  ["CHANGES_REQUIRED_DEFERRED", ["CANDIDATE_DEFERRED", "REJECTED_DEFERRED"]],
  ["REJECTED_DEFERRED", ["CANDIDATE_DEFERRED"]],
  ["APPROVED_DEFERRED_PLACEHOLDER", []],
]);
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
];

const topLevelFields = new Set([
  "metadata",
  "workflowPolicy",
  "dependencyReferences",
  "identityPolicyDeferrals",
  "recordBoundary",
  "readiness",
  "aggregate",
  "workflowEntries",
  "candidateSubmissionRecords",
  "activeReviewRecords",
  "reviewEvidenceRecords",
  "reviewDecisionRecords",
  "productionApprovalRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
]);
const metadataFields = new Set([
  "schemaVersion",
  "workflowArtifactVersion",
  "status",
  "artifactKind",
  "subject",
  "locale",
  "audienceGrades",
  "reviewCoverageArtifactVersion",
  "reviewEvidenceArtifactVersion",
  "reviewGateRubricArtifactVersion",
  "candidateDigestRegistryArtifactVersion",
  "candidateCanonicalizationArtifactVersion",
  "diagnosticReadinessPolicyVersion",
  "sourceContract",
  "productionUseAllowed",
  "runtimeUseAllowed",
  "storageAllowed",
]);
const workflowPolicyFields = new Set([
  "policyId",
  "workflowVersion",
  "policyState",
  "runtimeActivationAllowed",
  "productionReadinessTransitionAllowed",
  "allowedPlaceholderStates",
  "transitionTable",
]);
const transitionFields = new Set([
  "fromState",
  "allowedToStates",
  "definitionState",
  "authorizationPolicyRef",
  "productionReadinessAllowed",
]);
const dependencyReferenceFields = new Set([
  "reviewCoverage",
  "reviewEvidence",
  "reviewGateRubric",
  "candidateDigestRegistry",
  "candidateCanonicalization",
]);
const coverageDependencyFields = new Set([
  "artifactVersion",
  "blueprintSlotCount",
  "productionApprovedSlotCount",
]);
const evidenceDependencyFields = new Set([
  "artifactVersion",
  "evidenceRecordCount",
  "approvedDecisionCount",
  "productionApprovalCount",
]);
const rubricDependencyFields = new Set([
  "artifactVersion",
  "gateCount",
  "recordedDecisionCount",
  "recordedEvidenceCount",
  "productionApprovalCount",
]);
const registryDependencyFields = new Set([
  "artifactVersion",
  "candidatePlaceholderCount",
  "assignedCandidateIdentityCount",
  "digestValueCount",
  "reviewDecisionCount",
  "productionApprovedCandidateCount",
]);
const canonicalizationDependencyFields = new Set([
  "artifactVersion",
  "policyVersion",
  "policyState",
  "activeRuleCount",
  "transformedCandidateRecordCount",
  "digestValueCount",
  "reviewDecisionCount",
  "productionApprovedCandidateCount",
]);
const identityPolicyFields = new Set(["reviewerIdentity", "auditIdentity"]);
const identityDeferralFields = new Set(["status", "policyVersion", "referenceFormat"]);
const recordBoundaryFields = new Set([
  "candidateSubmissionsRecorded",
  "activeReviewsRecorded",
  "reviewEvidenceRecorded",
  "reviewDecisionsRecorded",
  "productionApprovalsRecorded",
  "reviewerIdentitiesRecorded",
  "auditIdentitiesRecorded",
  "runtimeWorkflowEnabled",
]);
const readinessFields = new Set([
  "status",
  "policyVersion",
  "blockingReasons",
  "productionUseAllowed",
]);
const aggregateFields = new Set([
  "blueprintSlotCount",
  "workflowEntryCount",
  "transitionDefinitionCount",
  "submittedCandidateCount",
  "activeReviewCount",
  "reviewEvidenceRecordCount",
  "approvedDecisionCount",
  "productionApprovalCount",
  "reviewerIdentityCount",
  "auditIdentityCount",
]);
const workflowEntryFields = new Set([
  "workflowEntryId",
  "recordState",
  "blueprintSlotId",
  "coverageReference",
  "evidenceReference",
  "rubricReference",
  "candidateRegistryReference",
  "canonicalizationReference",
  "workflowState",
  "candidateSubmitted",
  "activeReview",
  "reviewDecisionState",
  "productionApprovalState",
  "reviewerIdentityRef",
  "auditIdentityRef",
  "productionUseAllowed",
]);
const coverageReferenceFields = new Set(["artifactVersion", "blueprintSlotId", "coverageStatus"]);
const evidenceReferenceFields = new Set(["artifactVersion", "blueprintSlotId", "recordState"]);
const rubricReferenceFields = new Set(["artifactVersion", "gateCount"]);
const registryReferenceFields = new Set([
  "artifactVersion",
  "registryEntryId",
  "candidateIdentityState",
  "digestState",
]);
const canonicalizationReferenceFields = new Set([
  "artifactVersion",
  "policyVersion",
  "policyState",
]);
const approvedSlice7ChangedPaths = new Set([
  "docs/wave-4/closure-gate.md",
  "docs/wave-4/diagnostic-review-authority-contract.md",
  "docs/wave-4/diagnostic-review-workflow-state-contract.md",
  "docs/wave-4/slice-7-implementation-note.md",
  "docs/wave-4/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
  "packages/curriculum/diagnostic-review-workflow-state/grade-7-9-math.review-workflow-state-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/test/diagnostic-review-workflow-state.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
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

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultReviewWorkflowStatePath = path.resolve(
  scriptDir,
  "../diagnostic-review-workflow-state/grade-7-9-math.review-workflow-state-placeholder.v1.json",
);
export const repoRoot = path.resolve(scriptDir, "../../..");

export class DiagnosticReviewWorkflowStateValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiagnosticReviewWorkflowStateValidationError";
  }
}

function fail(message) {
  throw new DiagnosticReviewWorkflowStateValidationError(message);
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

function requireExactArrayMembers(value, expectedValues, fieldPath) {
  if (!Array.isArray(value) || value.length !== expectedValues.length) {
    fail(`${fieldPath} must contain exactly ${expectedValues.length} values.`);
  }
  const actual = new Set(value);
  if (
    actual.size !== expectedValues.length ||
    expectedValues.some((expectedValue) => !actual.has(expectedValue))
  ) {
    fail(`${fieldPath} must contain the exact approved placeholder values.`);
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
      fail(`${fieldPath} contains a hash-like value, which is forbidden in Slice 7.`);
    }
  }
}

function validateUpstreamArtifacts(coverage, evidence, rubric, registry, canonicalization) {
  const canonicalizationSummary = validateDiagnosticCandidateCanonicalization(
    canonicalization,
    registry,
    coverage,
    evidence,
    rubric,
  );
  if (
    coverage.metadata.coverageArtifactVersion !== expectedCoverageArtifactVersion ||
    coverage.aggregate.blueprintSlotCount !== 11 ||
    coverage.aggregate.statusCounts.PRODUCTION_APPROVED !== 0
  ) {
    fail("Referenced review coverage must remain the exact non-production Slice 2 baseline.");
  }
  if (
    evidence.metadata.evidenceArtifactVersion !== expectedEvidenceArtifactVersion ||
    evidence.aggregate.evidenceRecordCount !== 0 ||
    evidence.aggregate.approvedDecisionCount !== 0 ||
    evidence.aggregate.productionApprovalCount !== 0
  ) {
    fail("Referenced review evidence must remain the empty Slice 3 placeholder.");
  }
  if (
    rubric.metadata.rubricArtifactVersion !== expectedRubricArtifactVersion ||
    rubric.aggregate.gateCount !== 6 ||
    rubric.aggregate.recordedDecisionCount !== 0 ||
    rubric.aggregate.recordedEvidenceCount !== 0 ||
    rubric.aggregate.productionApprovalCount !== 0
  ) {
    fail("Referenced review rubric must remain the non-decision Slice 4 definition.");
  }
  if (
    registry.metadata.registryArtifactVersion !== expectedRegistryArtifactVersion ||
    registry.aggregate.candidatePlaceholderCount !== 11 ||
    registry.aggregate.assignedCandidateIdentityCount !== 0 ||
    registry.aggregate.digestValueCount !== 0 ||
    registry.aggregate.reviewDecisionCount !== 0 ||
    registry.aggregate.productionApprovedCandidateCount !== 0
  ) {
    fail("Referenced candidate registry must remain the empty Slice 5 placeholder.");
  }
  if (
    canonicalizationSummary.policyArtifactVersion !== expectedCanonicalizationArtifactVersion ||
    canonicalizationSummary.policyVersion !== expectedCanonicalizationPolicyVersion ||
    canonicalizationSummary.policyStatus !== "UNRESOLVED_DEFERRED" ||
    canonicalizationSummary.activeRuleCount !== 0 ||
    canonicalizationSummary.transformedCandidateRecordCount !== 0 ||
    canonicalizationSummary.digestValueCount !== 0 ||
    canonicalizationSummary.reviewDecisionCount !== 0 ||
    canonicalizationSummary.productionApprovedCandidateCount !== 0
  ) {
    fail("Referenced canonicalization policy must remain the unresolved Slice 6 placeholder.");
  }
  return canonicalizationSummary;
}

function validateMetadata(metadata, upstream) {
  requireExactFields(metadata, metadataFields, "metadata");
  const expectedValues = new Map([
    ["schemaVersion", "learnika.diagnosticReviewWorkflowStatePlaceholder.v1"],
    ["workflowArtifactVersion", expectedWorkflowArtifactVersion],
    ["status", "placeholder_only_non_production"],
    ["artifactKind", "diagnostic_review_workflow_state_placeholder"],
    ["subject", "math"],
    ["locale", "ru-RU"],
    ["reviewCoverageArtifactVersion", expectedCoverageArtifactVersion],
    ["reviewEvidenceArtifactVersion", expectedEvidenceArtifactVersion],
    ["reviewGateRubricArtifactVersion", expectedRubricArtifactVersion],
    ["candidateDigestRegistryArtifactVersion", expectedRegistryArtifactVersion],
    ["candidateCanonicalizationArtifactVersion", expectedCanonicalizationArtifactVersion],
    ["diagnosticReadinessPolicyVersion", expectedReadinessPolicyVersion],
    ["sourceContract", "docs/wave-4/diagnostic-review-workflow-state-contract.md"],
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
  const upstreamVersions = [
    ["reviewCoverageArtifactVersion", upstream.coverage.metadata.coverageArtifactVersion],
    ["reviewEvidenceArtifactVersion", upstream.evidence.metadata.evidenceArtifactVersion],
    ["reviewGateRubricArtifactVersion", upstream.rubric.metadata.rubricArtifactVersion],
    ["candidateDigestRegistryArtifactVersion", upstream.registry.metadata.registryArtifactVersion],
    [
      "candidateCanonicalizationArtifactVersion",
      upstream.canonicalization.metadata.policyArtifactVersion,
    ],
  ];
  for (const [field, upstreamVersion] of upstreamVersions) {
    if (metadata[field] !== upstreamVersion) {
      fail(`metadata.${field} must match its upstream artifact.`);
    }
  }
}

function validateWorkflowPolicy(workflowPolicy) {
  requireExactFields(workflowPolicy, workflowPolicyFields, "workflowPolicy");
  if (
    workflowPolicy.policyId !== expectedWorkflowPolicyId ||
    workflowPolicy.workflowVersion !== expectedWorkflowVersion ||
    workflowPolicy.policyState !== "DEFERRED_NON_PRODUCTION" ||
    workflowPolicy.runtimeActivationAllowed !== false ||
    workflowPolicy.productionReadinessTransitionAllowed !== false
  ) {
    fail("workflowPolicy must remain the inactive non-production Slice 7 placeholder.");
  }
  requireExactArrayMembers(
    workflowPolicy.allowedPlaceholderStates,
    expectedPlaceholderStates,
    "workflowPolicy.allowedPlaceholderStates",
  );
  if (
    !Array.isArray(workflowPolicy.transitionTable) ||
    workflowPolicy.transitionTable.length !== expectedTransitions.size
  ) {
    fail("workflowPolicy.transitionTable must define exactly seven state rows.");
  }
  const allowedStates = new Set(expectedPlaceholderStates);
  const seenStates = new Set();
  for (const [index, transition] of workflowPolicy.transitionTable.entries()) {
    const fieldPath = `workflowPolicy.transitionTable[${index}]`;
    requireExactFields(transition, transitionFields, fieldPath);
    if (!allowedStates.has(transition.fromState)) {
      fail(`${fieldPath}.fromState uses an unknown placeholder state.`);
    }
    if (seenStates.has(transition.fromState)) {
      fail(`Duplicate transition row for ${transition.fromState}.`);
    }
    seenStates.add(transition.fromState);
    const expectedTargets = expectedTransitions.get(transition.fromState);
    requireExactArrayMembers(
      transition.allowedToStates,
      expectedTargets,
      `${fieldPath}.allowedToStates`,
    );
    if (transition.allowedToStates.some((state) => !allowedStates.has(state))) {
      fail(`${fieldPath}.allowedToStates contains an unknown placeholder state.`);
    }
    if (
      transition.definitionState !== "FUTURE_ONLY_DEFERRED" ||
      transition.authorizationPolicyRef !== null ||
      transition.productionReadinessAllowed !== false
    ) {
      fail(`${fieldPath} must remain deferred and prohibit production readiness.`);
    }
  }
  if (
    workflowPolicy.transitionTable.some((transition) =>
      transition.allowedToStates.includes("APPROVED_DEFERRED_PLACEHOLDER"),
    )
  ) {
    fail("The reserved approved placeholder must have no inbound transition.");
  }
  return {
    stateCount: allowedStates.size,
    transitionCount: seenStates.size,
  };
}

function validateDependencyReferences(dependencies, upstream) {
  requireExactFields(dependencies, dependencyReferenceFields, "dependencyReferences");

  requireExactFields(
    dependencies.reviewCoverage,
    coverageDependencyFields,
    "dependencyReferences.reviewCoverage",
  );
  if (
    dependencies.reviewCoverage.artifactVersion !== expectedCoverageArtifactVersion ||
    dependencies.reviewCoverage.artifactVersion !==
      upstream.coverage.metadata.coverageArtifactVersion ||
    dependencies.reviewCoverage.blueprintSlotCount !== upstream.coverage.slots.length ||
    dependencies.reviewCoverage.blueprintSlotCount !== 11 ||
    dependencies.reviewCoverage.productionApprovedSlotCount !==
      upstream.coverage.aggregate.statusCounts.PRODUCTION_APPROVED ||
    dependencies.reviewCoverage.productionApprovedSlotCount !== 0
  ) {
    fail("dependencyReferences.reviewCoverage must match the Slice 2 baseline.");
  }

  requireExactFields(
    dependencies.reviewEvidence,
    evidenceDependencyFields,
    "dependencyReferences.reviewEvidence",
  );
  if (
    dependencies.reviewEvidence.artifactVersion !== expectedEvidenceArtifactVersion ||
    dependencies.reviewEvidence.artifactVersion !==
      upstream.evidence.metadata.evidenceArtifactVersion ||
    dependencies.reviewEvidence.evidenceRecordCount !==
      upstream.evidence.aggregate.evidenceRecordCount ||
    dependencies.reviewEvidence.approvedDecisionCount !==
      upstream.evidence.aggregate.approvedDecisionCount ||
    dependencies.reviewEvidence.productionApprovalCount !==
      upstream.evidence.aggregate.productionApprovalCount ||
    dependencies.reviewEvidence.evidenceRecordCount !== 0 ||
    dependencies.reviewEvidence.approvedDecisionCount !== 0 ||
    dependencies.reviewEvidence.productionApprovalCount !== 0
  ) {
    fail("dependencyReferences.reviewEvidence must match the empty Slice 3 placeholder.");
  }

  requireExactFields(
    dependencies.reviewGateRubric,
    rubricDependencyFields,
    "dependencyReferences.reviewGateRubric",
  );
  if (
    dependencies.reviewGateRubric.artifactVersion !== expectedRubricArtifactVersion ||
    dependencies.reviewGateRubric.artifactVersion !==
      upstream.rubric.metadata.rubricArtifactVersion ||
    dependencies.reviewGateRubric.gateCount !== upstream.rubric.aggregate.gateCount ||
    dependencies.reviewGateRubric.gateCount !== 6 ||
    dependencies.reviewGateRubric.recordedDecisionCount !==
      upstream.rubric.aggregate.recordedDecisionCount ||
    dependencies.reviewGateRubric.recordedEvidenceCount !==
      upstream.rubric.aggregate.recordedEvidenceCount ||
    dependencies.reviewGateRubric.productionApprovalCount !==
      upstream.rubric.aggregate.productionApprovalCount ||
    dependencies.reviewGateRubric.recordedDecisionCount !== 0 ||
    dependencies.reviewGateRubric.recordedEvidenceCount !== 0 ||
    dependencies.reviewGateRubric.productionApprovalCount !== 0
  ) {
    fail("dependencyReferences.reviewGateRubric must match the non-decision Slice 4 rubric.");
  }

  requireExactFields(
    dependencies.candidateDigestRegistry,
    registryDependencyFields,
    "dependencyReferences.candidateDigestRegistry",
  );
  const registryAggregate = upstream.registry.aggregate;
  if (
    dependencies.candidateDigestRegistry.artifactVersion !== expectedRegistryArtifactVersion ||
    dependencies.candidateDigestRegistry.artifactVersion !==
      upstream.registry.metadata.registryArtifactVersion ||
    dependencies.candidateDigestRegistry.candidatePlaceholderCount !==
      registryAggregate.candidatePlaceholderCount ||
    dependencies.candidateDigestRegistry.candidatePlaceholderCount !== 11 ||
    dependencies.candidateDigestRegistry.assignedCandidateIdentityCount !==
      registryAggregate.assignedCandidateIdentityCount ||
    dependencies.candidateDigestRegistry.digestValueCount !== registryAggregate.digestValueCount ||
    dependencies.candidateDigestRegistry.reviewDecisionCount !==
      registryAggregate.reviewDecisionCount ||
    dependencies.candidateDigestRegistry.productionApprovedCandidateCount !==
      registryAggregate.productionApprovedCandidateCount ||
    dependencies.candidateDigestRegistry.assignedCandidateIdentityCount !== 0 ||
    dependencies.candidateDigestRegistry.digestValueCount !== 0 ||
    dependencies.candidateDigestRegistry.reviewDecisionCount !== 0 ||
    dependencies.candidateDigestRegistry.productionApprovedCandidateCount !== 0
  ) {
    fail("dependencyReferences.candidateDigestRegistry must match the empty Slice 5 registry.");
  }

  requireExactFields(
    dependencies.candidateCanonicalization,
    canonicalizationDependencyFields,
    "dependencyReferences.candidateCanonicalization",
  );
  const canonicalizationSummary = upstream.canonicalizationSummary;
  if (
    dependencies.candidateCanonicalization.artifactVersion !==
      expectedCanonicalizationArtifactVersion ||
    dependencies.candidateCanonicalization.artifactVersion !==
      canonicalizationSummary.policyArtifactVersion ||
    dependencies.candidateCanonicalization.policyVersion !==
      expectedCanonicalizationPolicyVersion ||
    dependencies.candidateCanonicalization.policyVersion !==
      canonicalizationSummary.policyVersion ||
    dependencies.candidateCanonicalization.policyState !== "UNRESOLVED_DEFERRED" ||
    dependencies.candidateCanonicalization.policyState !== canonicalizationSummary.policyStatus ||
    dependencies.candidateCanonicalization.activeRuleCount !==
      canonicalizationSummary.activeRuleCount ||
    dependencies.candidateCanonicalization.transformedCandidateRecordCount !==
      canonicalizationSummary.transformedCandidateRecordCount ||
    dependencies.candidateCanonicalization.digestValueCount !==
      canonicalizationSummary.digestValueCount ||
    dependencies.candidateCanonicalization.reviewDecisionCount !==
      canonicalizationSummary.reviewDecisionCount ||
    dependencies.candidateCanonicalization.productionApprovedCandidateCount !==
      canonicalizationSummary.productionApprovedCandidateCount ||
    dependencies.candidateCanonicalization.activeRuleCount !== 0 ||
    dependencies.candidateCanonicalization.transformedCandidateRecordCount !== 0 ||
    dependencies.candidateCanonicalization.digestValueCount !== 0 ||
    dependencies.candidateCanonicalization.reviewDecisionCount !== 0 ||
    dependencies.candidateCanonicalization.productionApprovedCandidateCount !== 0
  ) {
    fail(
      "dependencyReferences.candidateCanonicalization must match the unresolved Slice 6 policy.",
    );
  }
}

function validateIdentityPolicyDeferrals(identityPolicies) {
  requireExactFields(identityPolicies, identityPolicyFields, "identityPolicyDeferrals");
  for (const field of identityPolicyFields) {
    const deferral = identityPolicies[field];
    const fieldPath = `identityPolicyDeferrals.${field}`;
    requireExactFields(deferral, identityDeferralFields, fieldPath);
    if (
      deferral.status !== "DEFERRED" ||
      deferral.policyVersion !== null ||
      deferral.referenceFormat !== null
    ) {
      fail(`${fieldPath} must remain deferred without identity policy data.`);
    }
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

function validateReadiness(readiness, upstream) {
  requireExactFields(readiness, readinessFields, "readiness");
  if (readiness.status !== "NOT_READY") {
    fail("readiness.status must remain NOT_READY.");
  }
  if (
    readiness.policyVersion !== expectedReadinessPolicyVersion ||
    readiness.policyVersion !== upstream.coverage.readiness.policyVersion ||
    readiness.policyVersion !== upstream.canonicalization.readiness.policyVersion
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

function validateWorkflowEntries(entries, upstream, allowedStates) {
  if (!Array.isArray(entries) || entries.length !== 11) {
    fail("workflowEntries must contain exactly 11 blueprint-slot placeholders.");
  }
  const coverageBySlot = new Map(
    upstream.coverage.slots.map((slot) => [slot.blueprintSlotId, slot]),
  );
  const evidenceBySlot = new Map(
    upstream.evidence.slots.map((slot) => [slot.blueprintSlotId, slot]),
  );
  const registryBySlot = new Map(
    upstream.registry.candidatePlaceholders.map((entry) => [
      entry.blueprintReference.blueprintSlotId,
      entry,
    ]),
  );
  const seenSlots = new Set();
  const seenEntryIds = new Set();

  for (const [index, entry] of entries.entries()) {
    const fieldPath = `workflowEntries[${index}]`;
    requireExactFields(entry, workflowEntryFields, fieldPath);
    requireString(entry.workflowEntryId, `${fieldPath}.workflowEntryId`);
    requireString(entry.blueprintSlotId, `${fieldPath}.blueprintSlotId`);
    if (!coverageBySlot.has(entry.blueprintSlotId)) {
      fail(`${fieldPath}.blueprintSlotId references an unknown coverage slot.`);
    }
    if (seenSlots.has(entry.blueprintSlotId)) {
      fail(`Duplicate workflow entry for blueprint slot ${entry.blueprintSlotId}.`);
    }
    if (seenEntryIds.has(entry.workflowEntryId)) {
      fail(`Duplicate workflowEntryId ${entry.workflowEntryId}.`);
    }
    seenSlots.add(entry.blueprintSlotId);
    seenEntryIds.add(entry.workflowEntryId);

    const coverageSlot = coverageBySlot.get(entry.blueprintSlotId);
    const evidenceSlot = evidenceBySlot.get(entry.blueprintSlotId);
    const registryEntry = registryBySlot.get(entry.blueprintSlotId);
    const expectedEntryId = registryEntry.registryEntryId.replace(
      "digest-placeholder",
      "workflow-placeholder",
    );
    if (entry.workflowEntryId !== expectedEntryId || entry.recordState !== "PLACEHOLDER_ONLY") {
      fail(`${fieldPath} must remain the exact structural workflow placeholder.`);
    }

    requireExactFields(
      entry.coverageReference,
      coverageReferenceFields,
      `${fieldPath}.coverageReference`,
    );
    if (
      entry.coverageReference.artifactVersion !== expectedCoverageArtifactVersion ||
      entry.coverageReference.blueprintSlotId !== entry.blueprintSlotId ||
      entry.coverageReference.coverageStatus !== coverageSlot.coverageStatus
    ) {
      fail(`${fieldPath}.coverageReference must match the Slice 2 coverage slot.`);
    }

    requireExactFields(
      entry.evidenceReference,
      evidenceReferenceFields,
      `${fieldPath}.evidenceReference`,
    );
    if (
      entry.evidenceReference.artifactVersion !== expectedEvidenceArtifactVersion ||
      entry.evidenceReference.blueprintSlotId !== entry.blueprintSlotId ||
      entry.evidenceReference.recordState !== "NOT_RECORDED" ||
      evidenceSlot.gateEvidencePlaceholders.methodology.recordState !== "NOT_RECORDED"
    ) {
      fail(`${fieldPath}.evidenceReference must match the unrecorded Slice 3 placeholder.`);
    }

    requireExactFields(
      entry.rubricReference,
      rubricReferenceFields,
      `${fieldPath}.rubricReference`,
    );
    if (
      entry.rubricReference.artifactVersion !== expectedRubricArtifactVersion ||
      entry.rubricReference.gateCount !== upstream.rubric.gates.length ||
      entry.rubricReference.gateCount !== 6
    ) {
      fail(`${fieldPath}.rubricReference must match the six-gate Slice 4 rubric.`);
    }

    requireExactFields(
      entry.candidateRegistryReference,
      registryReferenceFields,
      `${fieldPath}.candidateRegistryReference`,
    );
    if (
      entry.candidateRegistryReference.artifactVersion !== expectedRegistryArtifactVersion ||
      entry.candidateRegistryReference.registryEntryId !== registryEntry.registryEntryId ||
      entry.candidateRegistryReference.candidateIdentityState !==
        registryEntry.candidateIdentity.state ||
      entry.candidateRegistryReference.candidateIdentityState !== "UNASSIGNED" ||
      entry.candidateRegistryReference.digestState !== registryEntry.digestPlaceholder.state ||
      entry.candidateRegistryReference.digestState !== "PENDING_IMMUTABLE_CANDIDATE"
    ) {
      fail(`${fieldPath}.candidateRegistryReference must match the unresolved Slice 5 entry.`);
    }

    requireExactFields(
      entry.canonicalizationReference,
      canonicalizationReferenceFields,
      `${fieldPath}.canonicalizationReference`,
    );
    if (
      entry.canonicalizationReference.artifactVersion !== expectedCanonicalizationArtifactVersion ||
      entry.canonicalizationReference.policyVersion !== expectedCanonicalizationPolicyVersion ||
      entry.canonicalizationReference.policyState !== "UNRESOLVED_DEFERRED" ||
      entry.canonicalizationReference.policyVersion !==
        upstream.canonicalization.policyIdentity.policyVersion ||
      entry.canonicalizationReference.policyState !==
        upstream.canonicalization.policyIdentity.status
    ) {
      fail(`${fieldPath}.canonicalizationReference must match the unresolved Slice 6 policy.`);
    }

    if (!allowedStates.has(entry.workflowState)) {
      fail(`${fieldPath}.workflowState uses a state outside the approved placeholder enum.`);
    }
    if (entry.workflowState !== "NOT_SUBMITTED") {
      fail(`${fieldPath}.workflowState must remain NOT_SUBMITTED in Slice 7.`);
    }
    if (
      entry.candidateSubmitted !== false ||
      entry.activeReview !== false ||
      entry.reviewDecisionState !== "NO_DECISION" ||
      entry.productionApprovalState !== "NOT_ELIGIBLE" ||
      entry.reviewerIdentityRef !== null ||
      entry.auditIdentityRef !== null ||
      entry.productionUseAllowed !== false
    ) {
      fail(`${fieldPath} must contain no submission, review, decision, identity or approval.`);
    }
  }

  for (const slotId of coverageBySlot.keys()) {
    if (!seenSlots.has(slotId)) {
      fail(`Missing workflow entry for blueprint slot ${slotId}.`);
    }
  }
  return seenSlots.size;
}

function validateEmptyRecordArrays(artifact) {
  const arrays = [
    ["candidateSubmissionRecords", artifact.candidateSubmissionRecords],
    ["activeReviewRecords", artifact.activeReviewRecords],
    ["reviewEvidenceRecords", artifact.reviewEvidenceRecords],
    ["reviewDecisionRecords", artifact.reviewDecisionRecords],
    ["productionApprovalRecords", artifact.productionApprovalRecords],
    ["reviewerIdentityRecords", artifact.reviewerIdentityRecords],
    ["auditIdentityRecords", artifact.auditIdentityRecords],
  ];
  for (const [field, records] of arrays) {
    if (!Array.isArray(records) || records.length !== 0) {
      fail(`${field} must remain empty in Slice 7.`);
    }
  }
}

function validateAggregate(aggregate, entryCount, transitionCount) {
  requireExactFields(aggregate, aggregateFields, "aggregate");
  if (
    aggregate.blueprintSlotCount !== entryCount ||
    aggregate.blueprintSlotCount !== 11 ||
    aggregate.workflowEntryCount !== entryCount ||
    aggregate.workflowEntryCount !== 11 ||
    aggregate.transitionDefinitionCount !== transitionCount ||
    aggregate.transitionDefinitionCount !== 7
  ) {
    fail("aggregate structural counts must match the workflow definitions.");
  }
  if (
    aggregate.submittedCandidateCount !== 0 ||
    aggregate.activeReviewCount !== 0 ||
    aggregate.reviewEvidenceRecordCount !== 0 ||
    aggregate.approvedDecisionCount !== 0 ||
    aggregate.productionApprovalCount !== 0 ||
    aggregate.reviewerIdentityCount !== 0 ||
    aggregate.auditIdentityCount !== 0
  ) {
    fail("aggregate activity, decision, approval and identity counts must remain zero.");
  }
}

export function validateDiagnosticReviewWorkflowState(
  artifact,
  coverage,
  evidence,
  rubric,
  registry,
  canonicalization,
) {
  if (!isPlainObject(artifact)) {
    fail("Diagnostic review workflow state artifact must be a JSON object.");
  }
  const canonicalizationSummary = validateUpstreamArtifacts(
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
  );
  scanForbiddenTermsAndHashLikeValues(artifact);
  requireExactFields(artifact, topLevelFields, "$");
  const upstream = {
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    canonicalizationSummary,
  };
  validateMetadata(artifact.metadata, upstream);
  const policySummary = validateWorkflowPolicy(artifact.workflowPolicy);
  validateDependencyReferences(artifact.dependencyReferences, upstream);
  validateIdentityPolicyDeferrals(artifact.identityPolicyDeferrals);
  validateRecordBoundary(artifact.recordBoundary);
  validateReadiness(artifact.readiness, upstream);
  const entryCount = validateWorkflowEntries(
    artifact.workflowEntries,
    upstream,
    new Set(expectedPlaceholderStates),
  );
  validateEmptyRecordArrays(artifact);
  validateAggregate(artifact.aggregate, entryCount, policySummary.transitionCount);

  return {
    workflowArtifactVersion: artifact.metadata.workflowArtifactVersion,
    workflowPolicyId: artifact.workflowPolicy.policyId,
    workflowVersion: artifact.workflowPolicy.workflowVersion,
    workflowPolicyState: artifact.workflowPolicy.policyState,
    allowedPlaceholderStateCount: policySummary.stateCount,
    transitionDefinitionCount: policySummary.transitionCount,
    workflowEntryCount: entryCount,
    submittedCandidateCount: artifact.aggregate.submittedCandidateCount,
    activeReviewCount: artifact.aggregate.activeReviewCount,
    approvedDecisionCount: artifact.aggregate.approvedDecisionCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticReviewWorkflowState(
  artifactPath = defaultReviewWorkflowStatePath,
) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateReviewWorkflowStateChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice7ChangedPaths.has(changedPath) &&
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
      !wave5Slice13ScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 4 Slice 7 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateReviewWorkflowStateWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateReviewWorkflowStateChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [artifact, coverage, evidence, rubric, registry, canonicalization] = await Promise.all([
    readDiagnosticReviewWorkflowState(),
    readDiagnosticReviewCoverage(),
    readDiagnosticReviewEvidence(),
    readDiagnosticReviewGateRubric(),
    readDiagnosticCandidateDigestRegistry(),
    readDiagnosticCandidateCanonicalization(),
  ]);
  const summary = validateDiagnosticReviewWorkflowState(
    artifact,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
  );

  if (checkWorktreeScope) {
    validateReviewWorkflowStateWorktreeScope();
  }

  console.log(
    `[curriculum] Review workflow state ${summary.workflowArtifactVersion} validated: ${summary.allowedPlaceholderStateCount} placeholder states, ${summary.transitionDefinitionCount} deferred transition rows, ${summary.workflowEntryCount} slot entries, ${summary.submittedCandidateCount} submitted candidates, ${summary.activeReviewCount} active reviews, ${summary.approvedDecisionCount} approved decisions, ${summary.productionApprovalCount} production approvals; policy ${summary.workflowPolicyState}, readiness ${summary.readiness}.`,
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
