import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";
import {
  readDiagnosticReviewEvidence,
  validateDiagnosticReviewEvidence,
} from "./validate-diagnostic-review-evidence.mjs";
import {
  readDiagnosticReviewGateRubric,
  validateDiagnosticReviewGateRubric,
} from "./validate-diagnostic-review-gate-rubric.mjs";

const expectedRegistryArtifactVersion = "wave-4.slice-5.grade-7-9-math.v1";
const expectedCoverageArtifactVersion = "wave-4.slice-2.grade-7-9-math.v1";
const expectedEvidenceArtifactVersion = "wave-4.slice-3.grade-7-9-math.v1";
const expectedRubricArtifactVersion = "wave-4.slice-4.grade-7-9-math.v1";
const expectedBlueprintVersion = "wave-3.slice-3.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const expectedIdentityPolicyVersion = "wave-4.slice-5.candidate-identity-format.placeholder.v1";
const expectedAlgorithmPolicyVersion = "wave-4.slice-5.candidate-digest-algorithm.placeholder.v1";
const expectedCanonicalizationPolicyVersion =
  "wave-4.slice-5.candidate-canonicalization.placeholder.v1";
const pendingDigestState = "PENDING_IMMUTABLE_CANDIDATE";
const allowedPlaceholderDigestStates = [pendingDigestState, "DIGEST_DEFERRED"];
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
];

const topLevelFields = new Set([
  "metadata",
  "policies",
  "recordBoundary",
  "readiness",
  "aggregate",
  "candidatePlaceholders",
  "reviewEvidenceRecords",
  "reviewDecisionRecords",
  "productionApprovalRecords",
]);
const metadataFields = new Set([
  "schemaVersion",
  "registryArtifactVersion",
  "status",
  "artifactKind",
  "subject",
  "locale",
  "audienceGrades",
  "reviewCoverageArtifactVersion",
  "reviewEvidenceArtifactVersion",
  "reviewGateRubricArtifactVersion",
  "diagnosticBlueprintVersion",
  "diagnosticReadinessPolicyVersion",
  "sourceContract",
  "productionUseAllowed",
  "runtimeUseAllowed",
  "storageAllowed",
]);
const policyFields = new Set([
  "candidateIdentityFormat",
  "digestAlgorithm",
  "canonicalization",
  "allowedPlaceholderDigestStates",
]);
const identityPolicyFields = new Set([
  "state",
  "policyVersion",
  "formatTemplate",
  "assignedIdentityCount",
]);
const algorithmPolicyFields = new Set(["state", "policyVersion", "algorithmId", "valueEncoding"]);
const canonicalizationPolicyFields = new Set(["state", "policyVersion", "rulesetVersion"]);
const recordBoundaryFields = new Set([
  "candidateIdentitiesAssigned",
  "digestValuesRecorded",
  "reviewEvidenceRecorded",
  "reviewDecisionsRecorded",
  "productionApprovalsRecorded",
  "candidateContentEmbedded",
]);
const readinessFields = new Set([
  "status",
  "policyVersion",
  "blockingReasons",
  "productionUseAllowed",
]);
const aggregateFields = new Set([
  "blueprintSlotReferenceCount",
  "candidatePlaceholderCount",
  "assignedCandidateIdentityCount",
  "digestValueCount",
  "reviewEvidenceRecordCount",
  "reviewDecisionCount",
  "productionApprovedCandidateCount",
]);
const candidatePlaceholderFields = new Set([
  "registryEntryId",
  "recordState",
  "candidateIdentity",
  "blueprintReference",
  "reviewCoverageReference",
  "reviewEvidenceReference",
  "reviewGateRubricReference",
  "digestPlaceholder",
  "reviewDecisionState",
  "productionApprovalState",
  "candidateContentEmbedded",
  "productionUseAllowed",
]);
const candidateIdentityFields = new Set(["state", "candidateId", "formatPolicyVersion"]);
const blueprintReferenceFields = new Set(["blueprintVersion", "blueprintSlotId"]);
const coverageReferenceFields = new Set(["artifactVersion", "blueprintSlotId", "coverageStatus"]);
const evidenceReferenceFields = new Set([
  "artifactVersion",
  "blueprintSlotId",
  "recordState",
  "recordId",
]);
const rubricReferenceFields = new Set(["artifactVersion", "gateCount"]);
const digestPlaceholderFields = new Set([
  "state",
  "algorithmPolicyVersion",
  "canonicalizationPolicyVersion",
  "algorithmId",
  "value",
]);
const approvedSlice5ChangedPaths = new Set([
  "docs/wave-4/closure-gate.md",
  "docs/wave-4/diagnostic-candidate-canonicalization-contract.md",
  "docs/wave-4/diagnostic-candidate-digest-contract.md",
  "docs/wave-4/diagnostic-review-authority-contract.md",
  "docs/wave-4/diagnostic-review-workflow-state-contract.md",
  "docs/wave-4/slice-5-implementation-note.md",
  "docs/wave-4/slice-6-implementation-note.md",
  "docs/wave-4/slice-7-implementation-note.md",
  "docs/wave-4/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-candidate-canonicalization/grade-7-9-math.canonicalization-placeholder.v1.json",
  "packages/curriculum/diagnostic-candidate-digest/grade-7-9-math.candidate-digest-placeholder.v1.json",
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
  "packages/curriculum/test/diagnostic-candidate-digest.test.mjs",
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
export const defaultCandidateDigestRegistryPath = path.resolve(
  scriptDir,
  "../diagnostic-candidate-digest/grade-7-9-math.candidate-digest-placeholder.v1.json",
);
export const repoRoot = path.resolve(scriptDir, "../../..");

export class DiagnosticCandidateDigestValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiagnosticCandidateDigestValidationError";
  }
}

function fail(message) {
  throw new DiagnosticCandidateDigestValidationError(message);
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
      fail(`${fieldPath} contains a hash-like value, which is forbidden in Slice 5.`);
    }
  }
}

function validateUpstreamArtifacts(coverage, evidence, rubric) {
  const evidenceSummary = validateDiagnosticReviewEvidence(evidence, coverage);
  const rubricSummary = validateDiagnosticReviewGateRubric(rubric, coverage, evidence);

  if (coverage.metadata.coverageArtifactVersion !== expectedCoverageArtifactVersion) {
    fail(`Referenced review coverage must be ${expectedCoverageArtifactVersion}.`);
  }
  if (evidenceSummary.evidenceArtifactVersion !== expectedEvidenceArtifactVersion) {
    fail(`Referenced review evidence must be ${expectedEvidenceArtifactVersion}.`);
  }
  if (rubricSummary.rubricArtifactVersion !== expectedRubricArtifactVersion) {
    fail(`Referenced review gate rubric must be ${expectedRubricArtifactVersion}.`);
  }
  if (coverage.metadata.diagnosticBlueprintVersion !== expectedBlueprintVersion) {
    fail(`Referenced review coverage must pin blueprint ${expectedBlueprintVersion}.`);
  }
  if (
    evidenceSummary.evidenceRecordCount !== 0 ||
    evidenceSummary.approvedDecisionCount !== 0 ||
    evidenceSummary.productionApprovalCount !== 0 ||
    rubricSummary.recordedDecisionCount !== 0 ||
    rubricSummary.recordedEvidenceCount !== 0 ||
    rubricSummary.productionApprovalCount !== 0
  ) {
    fail("Upstream review artifacts must remain empty and non-approving.");
  }
}

function validateMetadata(metadata, coverage, evidence, rubric) {
  requireExactFields(metadata, metadataFields, "metadata");
  const expectedValues = new Map([
    ["schemaVersion", "learnika.diagnosticCandidateDigestPlaceholderRegistry.v1"],
    ["registryArtifactVersion", expectedRegistryArtifactVersion],
    ["status", "placeholder_only_non_production"],
    ["artifactKind", "diagnostic_candidate_digest_placeholder_registry"],
    ["subject", "math"],
    ["locale", "ru-RU"],
    ["reviewCoverageArtifactVersion", expectedCoverageArtifactVersion],
    ["reviewEvidenceArtifactVersion", expectedEvidenceArtifactVersion],
    ["reviewGateRubricArtifactVersion", expectedRubricArtifactVersion],
    ["diagnosticBlueprintVersion", expectedBlueprintVersion],
    ["diagnosticReadinessPolicyVersion", expectedReadinessPolicyVersion],
    ["sourceContract", "docs/wave-4/diagnostic-candidate-digest-contract.md"],
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
  if (metadata.reviewCoverageArtifactVersion !== coverage.metadata.coverageArtifactVersion) {
    fail("metadata.reviewCoverageArtifactVersion must match the coverage artifact.");
  }
  if (metadata.reviewEvidenceArtifactVersion !== evidence.metadata.evidenceArtifactVersion) {
    fail("metadata.reviewEvidenceArtifactVersion must match the evidence artifact.");
  }
  if (metadata.reviewGateRubricArtifactVersion !== rubric.metadata.rubricArtifactVersion) {
    fail("metadata.reviewGateRubricArtifactVersion must match the rubric artifact.");
  }
}

function validatePolicies(policies) {
  requireExactFields(policies, policyFields, "policies");
  requireExactFields(
    policies.candidateIdentityFormat,
    identityPolicyFields,
    "policies.candidateIdentityFormat",
  );
  if (
    policies.candidateIdentityFormat.state !== "FORMAT_DEFINED_ASSIGNMENT_DEFERRED" ||
    policies.candidateIdentityFormat.policyVersion !== expectedIdentityPolicyVersion ||
    policies.candidateIdentityFormat.formatTemplate !==
      "dcandidate.math.g7-9.{strand}.{candidate-key}.v{integer}" ||
    policies.candidateIdentityFormat.assignedIdentityCount !== 0
  ) {
    fail("policies.candidateIdentityFormat must remain defined but unassigned.");
  }

  requireExactFields(policies.digestAlgorithm, algorithmPolicyFields, "policies.digestAlgorithm");
  if (
    policies.digestAlgorithm.state !== "DEFERRED" ||
    policies.digestAlgorithm.policyVersion !== expectedAlgorithmPolicyVersion ||
    policies.digestAlgorithm.algorithmId !== null ||
    policies.digestAlgorithm.valueEncoding !== null
  ) {
    fail("policies.digestAlgorithm must remain deferred with no selected algorithm.");
  }

  requireExactFields(
    policies.canonicalization,
    canonicalizationPolicyFields,
    "policies.canonicalization",
  );
  if (
    policies.canonicalization.state !== "DEFERRED" ||
    policies.canonicalization.policyVersion !== expectedCanonicalizationPolicyVersion ||
    policies.canonicalization.rulesetVersion !== null
  ) {
    fail("policies.canonicalization must remain deferred without a ruleset.");
  }

  if (
    !Array.isArray(policies.allowedPlaceholderDigestStates) ||
    policies.allowedPlaceholderDigestStates.length !== allowedPlaceholderDigestStates.length ||
    policies.allowedPlaceholderDigestStates.some(
      (state, index) => state !== allowedPlaceholderDigestStates[index],
    )
  ) {
    fail("policies.allowedPlaceholderDigestStates must contain only the two placeholder states.");
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

function validateReadiness(readiness, coverage) {
  requireExactFields(readiness, readinessFields, "readiness");
  if (readiness.status !== "NOT_READY") {
    fail("readiness.status must remain NOT_READY.");
  }
  if (
    readiness.policyVersion !== expectedReadinessPolicyVersion ||
    readiness.policyVersion !== coverage.readiness.policyVersion
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
    ["reviewEvidenceRecords", artifact.reviewEvidenceRecords],
    ["reviewDecisionRecords", artifact.reviewDecisionRecords],
    ["productionApprovalRecords", artifact.productionApprovalRecords],
  ];
  for (const [field, records] of arrays) {
    if (!Array.isArray(records) || records.length !== 0) {
      fail(`${field} must remain empty in Slice 5.`);
    }
  }
}

function validateCandidateIdentity(candidateIdentity, fieldPath) {
  requireExactFields(candidateIdentity, candidateIdentityFields, fieldPath);
  if (
    candidateIdentity.state !== "UNASSIGNED" ||
    candidateIdentity.candidateId !== null ||
    candidateIdentity.formatPolicyVersion !== expectedIdentityPolicyVersion
  ) {
    fail(`${fieldPath} must remain an unassigned candidate identity placeholder.`);
  }
}

function validateReferences(placeholder, coverageSlot, evidenceSlot, rubric, fieldPath) {
  const slotId = coverageSlot.blueprintSlotId;
  requireExactFields(
    placeholder.blueprintReference,
    blueprintReferenceFields,
    `${fieldPath}.blueprintReference`,
  );
  if (
    placeholder.blueprintReference.blueprintVersion !== expectedBlueprintVersion ||
    placeholder.blueprintReference.blueprintSlotId !== slotId
  ) {
    fail(`${fieldPath}.blueprintReference must pin the known coverage slot.`);
  }

  requireExactFields(
    placeholder.reviewCoverageReference,
    coverageReferenceFields,
    `${fieldPath}.reviewCoverageReference`,
  );
  if (
    placeholder.reviewCoverageReference.artifactVersion !== expectedCoverageArtifactVersion ||
    placeholder.reviewCoverageReference.blueprintSlotId !== slotId ||
    placeholder.reviewCoverageReference.coverageStatus !== coverageSlot.coverageStatus
  ) {
    fail(`${fieldPath}.reviewCoverageReference must match the coverage artifact.`);
  }

  requireExactFields(
    placeholder.reviewEvidenceReference,
    evidenceReferenceFields,
    `${fieldPath}.reviewEvidenceReference`,
  );
  if (
    placeholder.reviewEvidenceReference.artifactVersion !== expectedEvidenceArtifactVersion ||
    placeholder.reviewEvidenceReference.blueprintSlotId !== slotId ||
    placeholder.reviewEvidenceReference.recordState !== "NOT_RECORDED" ||
    placeholder.reviewEvidenceReference.recordId !== null ||
    evidenceSlot.blueprintSlotId !== slotId
  ) {
    fail(`${fieldPath}.reviewEvidenceReference must match the unrecorded evidence slot.`);
  }

  requireExactFields(
    placeholder.reviewGateRubricReference,
    rubricReferenceFields,
    `${fieldPath}.reviewGateRubricReference`,
  );
  if (
    placeholder.reviewGateRubricReference.artifactVersion !== expectedRubricArtifactVersion ||
    placeholder.reviewGateRubricReference.gateCount !== 6 ||
    rubric.gates.length !== 6
  ) {
    fail(`${fieldPath}.reviewGateRubricReference must pin the six-gate rubric.`);
  }
}

function validateDigestPlaceholder(digestPlaceholder, coverageSlot, evidenceSlot, fieldPath) {
  requireExactFields(digestPlaceholder, digestPlaceholderFields, fieldPath);
  if (!allowedPlaceholderDigestStates.includes(digestPlaceholder.state)) {
    fail(`${fieldPath}.state must be an allowed non-approving placeholder state.`);
  }
  if (
    digestPlaceholder.state !== pendingDigestState ||
    digestPlaceholder.state !== coverageSlot.candidateDigest?.state ||
    digestPlaceholder.state !== evidenceSlot.candidateDigest?.state
  ) {
    fail(`${fieldPath}.state must preserve the upstream pending candidate state.`);
  }
  if (
    digestPlaceholder.algorithmPolicyVersion !== expectedAlgorithmPolicyVersion ||
    digestPlaceholder.canonicalizationPolicyVersion !== expectedCanonicalizationPolicyVersion
  ) {
    fail(`${fieldPath} must pin the deferred algorithm and canonicalization policies.`);
  }
  if (digestPlaceholder.algorithmId !== null || digestPlaceholder.value !== null) {
    fail(`${fieldPath} must contain no selected algorithm or digest value.`);
  }
  if (
    coverageSlot.candidateDigest?.value !== null ||
    evidenceSlot.candidateDigest?.value !== null
  ) {
    fail(`${fieldPath} requires null digest values in both upstream placeholders.`);
  }
}

function validateCandidatePlaceholders(artifact, coverage, evidence, rubric) {
  if (!Array.isArray(artifact.candidatePlaceholders)) {
    fail("candidatePlaceholders must be an array.");
  }
  const coverageSlotsById = new Map(coverage.slots.map((slot) => [slot.blueprintSlotId, slot]));
  const evidenceSlotsById = new Map(evidence.slots.map((slot) => [slot.blueprintSlotId, slot]));
  if (
    coverageSlotsById.size !== 11 ||
    evidenceSlotsById.size !== 11 ||
    artifact.candidatePlaceholders.length !== 11
  ) {
    fail("candidatePlaceholders must represent all 11 coverage slots exactly once.");
  }

  const seenEntryIds = new Set();
  const seenSlotIds = new Set();
  for (const [index, placeholder] of artifact.candidatePlaceholders.entries()) {
    const fieldPath = `candidatePlaceholders[${index}]`;
    requireExactFields(placeholder, candidatePlaceholderFields, fieldPath);
    requireString(placeholder.registryEntryId, `${fieldPath}.registryEntryId`);
    if (
      !/^digest-placeholder\.math\.g7-9\.[a-z0-9-]+\.[a-z0-9-]+\.v1$/.test(
        placeholder.registryEntryId,
      )
    ) {
      fail(`${fieldPath}.registryEntryId is invalid.`);
    }
    if (seenEntryIds.has(placeholder.registryEntryId)) {
      fail(`Duplicate registry entry ID ${placeholder.registryEntryId}.`);
    }
    seenEntryIds.add(placeholder.registryEntryId);
    if (placeholder.recordState !== "PLACEHOLDER_ONLY") {
      fail(`${fieldPath}.recordState must remain PLACEHOLDER_ONLY.`);
    }

    const slotId = placeholder.blueprintReference?.blueprintSlotId;
    requireString(slotId, `${fieldPath}.blueprintReference.blueprintSlotId`);
    const coverageSlot = coverageSlotsById.get(slotId);
    const evidenceSlot = evidenceSlotsById.get(slotId);
    if (!coverageSlot || !evidenceSlot) {
      fail(`${fieldPath} references unknown blueprint slot ${slotId}.`);
    }
    if (seenSlotIds.has(slotId)) {
      fail(`Duplicate blueprint slot ${slotId}.`);
    }
    seenSlotIds.add(slotId);

    validateCandidateIdentity(placeholder.candidateIdentity, `${fieldPath}.candidateIdentity`);
    validateReferences(placeholder, coverageSlot, evidenceSlot, rubric, fieldPath);
    validateDigestPlaceholder(
      placeholder.digestPlaceholder,
      coverageSlot,
      evidenceSlot,
      `${fieldPath}.digestPlaceholder`,
    );
    if (
      placeholder.reviewDecisionState !== "NO_DECISION" ||
      placeholder.productionApprovalState !== "NOT_ELIGIBLE"
    ) {
      fail(`${fieldPath} cannot claim a review decision or production approval.`);
    }
    if (
      placeholder.candidateContentEmbedded !== false ||
      placeholder.productionUseAllowed !== false
    ) {
      fail(`${fieldPath} must contain no candidate content and allow no production use.`);
    }
  }

  for (const slotId of coverageSlotsById.keys()) {
    if (!seenSlotIds.has(slotId)) {
      fail(`Missing review coverage slot ${slotId}.`);
    }
  }

  return { placeholderCount: seenEntryIds.size, slotReferenceCount: seenSlotIds.size };
}

function validateAggregate(aggregate, counts) {
  requireExactFields(aggregate, aggregateFields, "aggregate");
  if (
    aggregate.blueprintSlotReferenceCount !== counts.slotReferenceCount ||
    aggregate.blueprintSlotReferenceCount !== 11 ||
    aggregate.candidatePlaceholderCount !== counts.placeholderCount ||
    aggregate.candidatePlaceholderCount !== 11
  ) {
    fail("aggregate must match all 11 slot references and placeholders.");
  }
  if (
    aggregate.assignedCandidateIdentityCount !== 0 ||
    aggregate.digestValueCount !== 0 ||
    aggregate.reviewEvidenceRecordCount !== 0 ||
    aggregate.reviewDecisionCount !== 0 ||
    aggregate.productionApprovedCandidateCount !== 0
  ) {
    fail("aggregate must remain at zero identities, digests, evidence, decisions and approvals.");
  }
}

export function validateDiagnosticCandidateDigestRegistry(artifact, coverage, evidence, rubric) {
  if (!isPlainObject(artifact)) {
    fail("Candidate digest placeholder registry must be a JSON object.");
  }

  validateUpstreamArtifacts(coverage, evidence, rubric);
  scanForbiddenTermsAndHashLikeValues(artifact);
  requireExactFields(artifact, topLevelFields, "$");
  validateMetadata(artifact.metadata, coverage, evidence, rubric);
  validatePolicies(artifact.policies);
  validateRecordBoundary(artifact.recordBoundary);
  validateReadiness(artifact.readiness, coverage);
  validateEmptyRecordArrays(artifact);
  const counts = validateCandidatePlaceholders(artifact, coverage, evidence, rubric);
  validateAggregate(artifact.aggregate, counts);

  return {
    registryArtifactVersion: artifact.metadata.registryArtifactVersion,
    reviewCoverageArtifactVersion: artifact.metadata.reviewCoverageArtifactVersion,
    reviewEvidenceArtifactVersion: artifact.metadata.reviewEvidenceArtifactVersion,
    reviewGateRubricArtifactVersion: artifact.metadata.reviewGateRubricArtifactVersion,
    blueprintSlotReferenceCount: counts.slotReferenceCount,
    candidatePlaceholderCount: counts.placeholderCount,
    assignedCandidateIdentityCount: artifact.aggregate.assignedCandidateIdentityCount,
    digestValueCount: artifact.aggregate.digestValueCount,
    reviewEvidenceRecordCount: artifact.reviewEvidenceRecords.length,
    reviewDecisionCount: artifact.reviewDecisionRecords.length,
    productionApprovedCandidateCount: artifact.aggregate.productionApprovedCandidateCount,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticCandidateDigestRegistry(
  artifactPath = defaultCandidateDigestRegistryPath,
) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateCandidateDigestChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice5ChangedPaths.has(changedPath) &&
      !wave5Slice6ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice7ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice8ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice9ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice10ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice11ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice12ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice13ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice14ScopeUnblockPaths.has(changedPath) &&
      !wave5ClosureScopeUnblockPaths.has(changedPath) &&
      !wave5Slice1ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice2ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice3ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice4ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice5ScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 4 Slice 5 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateCandidateDigestWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateCandidateDigestChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [artifact, coverage, evidence, rubric] = await Promise.all([
    readDiagnosticCandidateDigestRegistry(),
    readDiagnosticReviewCoverage(),
    readDiagnosticReviewEvidence(),
    readDiagnosticReviewGateRubric(),
  ]);
  const summary = validateDiagnosticCandidateDigestRegistry(artifact, coverage, evidence, rubric);

  if (checkWorktreeScope) {
    validateCandidateDigestWorktreeScope();
  }

  console.log(
    `[curriculum] Candidate digest registry ${summary.registryArtifactVersion} validated: ${summary.blueprintSlotReferenceCount} slot references, ${summary.candidatePlaceholderCount} placeholders, ${summary.assignedCandidateIdentityCount} assigned identities, ${summary.digestValueCount} digest values, ${summary.reviewEvidenceRecordCount} evidence records, ${summary.reviewDecisionCount} review decisions, ${summary.productionApprovedCandidateCount} production-approved candidates; readiness ${summary.readiness}.`,
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
