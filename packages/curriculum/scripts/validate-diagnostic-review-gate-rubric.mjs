import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";
import {
  readDiagnosticReviewEvidence,
  validateDiagnosticReviewEvidence,
} from "./validate-diagnostic-review-evidence.mjs";

const expectedRubricArtifactVersion = "wave-4.slice-4.grade-7-9-math.v1";
const expectedCoverageArtifactVersion = "wave-4.slice-2.grade-7-9-math.v1";
const expectedEvidenceArtifactVersion = "wave-4.slice-3.grade-7-9-math.v1";
const expectedBlueprintVersion = "wave-3.slice-3.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";

const requiredGateNames = [
  "methodology",
  "safety_no_answer",
  "rights_copyright",
  "grade_placement",
  "accessibility_readability",
  "production_approval",
];
const expectedPolicyVersionPins = new Map([
  ["methodology", "wave-4.slice-1.methodology-review.v1"],
  ["safety_no_answer", "wave-4.slice-1.safety-no-answer-review.v1"],
  ["rights_copyright", "wave-4.slice-1.rights-copyright-review.v1"],
  ["grade_placement", "wave-4.slice-1.grade-placement-review.v1"],
  ["accessibility_readability", "wave-4.slice-1.accessibility-readability-review.v1"],
  ["production_approval", "wave-4.slice-1.production-approval.v1"],
]);
const substantiveFutureStates = [
  "NOT_STARTED",
  "IN_REVIEW",
  "CHANGES_REQUIRED",
  "APPROVED",
  "INVALIDATED",
];
const productionFutureStates = ["NOT_ELIGIBLE", "PENDING", "APPROVED", "WITHDRAWN"];
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
  "ocrOutput",
  "sttOutput",
  "textbookContent",
  "copiedText",
  "studentName",
  "childName",
  "email",
  "reviewerEmail",
  "reviewerName",
];

const topLevelFields = new Set([
  "metadata",
  "readiness",
  "decisionBoundary",
  "aggregate",
  "gates",
  "reviewDecisionRecords",
  "reviewEvidenceRecords",
]);
const metadataFields = new Set([
  "schemaVersion",
  "rubricArtifactVersion",
  "status",
  "artifactKind",
  "subject",
  "locale",
  "audienceGrades",
  "reviewCoverageArtifactVersion",
  "reviewEvidenceArtifactVersion",
  "diagnosticBlueprintVersion",
  "diagnosticReadinessPolicyVersion",
  "sourceContract",
  "productionUseAllowed",
  "runtimeUseAllowed",
  "storageAllowed",
]);
const readinessFields = new Set([
  "status",
  "policyVersion",
  "blockingReasons",
  "productionUseAllowed",
]);
const decisionBoundaryFields = new Set([
  "reviewDecisionsRecorded",
  "reviewEvidenceRecorded",
  "productionApprovalsRecorded",
  "reviewerRoleAssignmentsRecorded",
]);
const aggregateFields = new Set([
  "gateCount",
  "criterionCount",
  "requiredEvidenceCategoryCount",
  "blockingIssueCategoryCount",
  "recordedDecisionCount",
  "recordedEvidenceCount",
  "productionApprovalCount",
]);
const gateFields = new Set([
  "gateId",
  "policyVersion",
  "rubricState",
  "reviewerRolePlaceholder",
  "requiredEvidenceCategories",
  "blockingIssueCategories",
  "allowedFutureDecisionStates",
  "criteria",
]);
const reviewerRolePlaceholderFields = new Set(["state", "roleId", "assignmentRef", "identityRef"]);
const criterionFields = new Set([
  "criterionId",
  "requirement",
  "requiredEvidenceCategory",
  "blockingIssueCategory",
]);
const approvedSlice4ChangedPaths = new Set([
  "docs/wave-4/closure-gate.md",
  "docs/wave-4/diagnostic-candidate-canonicalization-contract.md",
  "docs/wave-4/diagnostic-candidate-digest-contract.md",
  "docs/wave-4/diagnostic-review-authority-contract.md",
  "docs/wave-4/diagnostic-review-gate-rubric-contract.md",
  "docs/wave-4/diagnostic-review-workflow-state-contract.md",
  "docs/wave-4/slice-4-implementation-note.md",
  "docs/wave-4/slice-5-implementation-note.md",
  "docs/wave-4/slice-6-implementation-note.md",
  "docs/wave-4/slice-7-implementation-note.md",
  "docs/wave-4/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-candidate-canonicalization/grade-7-9-math.canonicalization-placeholder.v1.json",
  "packages/curriculum/diagnostic-candidate-digest/grade-7-9-math.candidate-digest-placeholder.v1.json",
  "packages/curriculum/diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
  "packages/curriculum/diagnostic-review-gate-rubric/grade-7-9-math.review-gate-rubric.v1.json",
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
  "packages/curriculum/test/diagnostic-review-gate-rubric.test.mjs",
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

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultReviewGateRubricPath = path.resolve(
  scriptDir,
  "../diagnostic-review-gate-rubric/grade-7-9-math.review-gate-rubric.v1.json",
);
export const repoRoot = path.resolve(scriptDir, "../../..");

export class DiagnosticReviewGateRubricValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiagnosticReviewGateRubricValidationError";
  }
}

function fail(message) {
  throw new DiagnosticReviewGateRubricValidationError(message);
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

function scanForbiddenTerms(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbiddenTerms(item, `${fieldPath}[${index}]`));
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
      scanForbiddenTerms(nestedValue, `${fieldPath}.${key}`);
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
  }
}

function validateUpstreamArtifacts(coverage, evidence) {
  const evidenceSummary = validateDiagnosticReviewEvidence(evidence, coverage);
  if (coverage.metadata.coverageArtifactVersion !== expectedCoverageArtifactVersion) {
    fail(`Referenced review coverage must be ${expectedCoverageArtifactVersion}.`);
  }
  if (evidenceSummary.evidenceArtifactVersion !== expectedEvidenceArtifactVersion) {
    fail(`Referenced review evidence must be ${expectedEvidenceArtifactVersion}.`);
  }
  if (coverage.metadata.diagnosticBlueprintVersion !== expectedBlueprintVersion) {
    fail(`Referenced review coverage must pin blueprint ${expectedBlueprintVersion}.`);
  }
  if (
    evidenceSummary.evidenceRecordCount !== 0 ||
    evidenceSummary.approvedDecisionCount !== 0 ||
    evidenceSummary.productionApprovalCount !== 0
  ) {
    fail("Referenced review evidence must remain empty and non-approving.");
  }
}

function validateMetadata(metadata, coverage, evidence) {
  requireExactFields(metadata, metadataFields, "metadata");

  const expectedValues = new Map([
    ["schemaVersion", "learnika.diagnosticReviewGateRubric.v1"],
    ["rubricArtifactVersion", expectedRubricArtifactVersion],
    ["status", "rubric_definition_non_decision"],
    ["artifactKind", "diagnostic_review_gate_rubric"],
    ["subject", "math"],
    ["locale", "ru-RU"],
    ["reviewCoverageArtifactVersion", expectedCoverageArtifactVersion],
    ["reviewEvidenceArtifactVersion", expectedEvidenceArtifactVersion],
    ["diagnosticBlueprintVersion", expectedBlueprintVersion],
    ["diagnosticReadinessPolicyVersion", expectedReadinessPolicyVersion],
    ["sourceContract", "docs/wave-4/diagnostic-review-gate-rubric-contract.md"],
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
}

function validateReadiness(readiness, evidence) {
  requireExactFields(readiness, readinessFields, "readiness");
  if (readiness.status !== "NOT_READY") {
    fail("readiness.status must remain NOT_READY.");
  }
  if (
    readiness.policyVersion !== expectedReadinessPolicyVersion ||
    readiness.policyVersion !== evidence.readiness.policyVersion
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

function validateDecisionBoundary(decisionBoundary) {
  requireExactFields(decisionBoundary, decisionBoundaryFields, "decisionBoundary");
  for (const field of decisionBoundaryFields) {
    if (decisionBoundary[field] !== false) {
      fail(`decisionBoundary.${field} must remain false.`);
    }
  }
}

function validateEmptyRecordArrays(artifact) {
  if (!Array.isArray(artifact.reviewDecisionRecords) || artifact.reviewDecisionRecords.length > 0) {
    fail("reviewDecisionRecords must remain empty in Slice 4.");
  }
  if (!Array.isArray(artifact.reviewEvidenceRecords) || artifact.reviewEvidenceRecords.length > 0) {
    fail("reviewEvidenceRecords must remain empty in Slice 4.");
  }
}

function validateReviewerRolePlaceholder(placeholder, fieldPath) {
  requireExactFields(placeholder, reviewerRolePlaceholderFields, fieldPath);
  if (
    placeholder.state !== "DEFERRED" ||
    placeholder.roleId !== null ||
    placeholder.assignmentRef !== null ||
    placeholder.identityRef !== null
  ) {
    fail(`${fieldPath} must remain a PII-free deferred placeholder.`);
  }
}

function validateCategoryList(categories, fieldPath) {
  if (!Array.isArray(categories) || categories.length === 0) {
    fail(`${fieldPath} must be a non-empty array.`);
  }
  const seen = new Set();
  for (const [index, category] of categories.entries()) {
    requireString(category, `${fieldPath}[${index}]`);
    if (!/^[A-Z][A-Z0-9_]*$/.test(category)) {
      fail(`${fieldPath}[${index}] must be an uppercase category code.`);
    }
    if (seen.has(category)) {
      fail(`${fieldPath} contains duplicate category ${category}.`);
    }
    seen.add(category);
  }
  return seen;
}

function validateAllowedFutureStates(gate, fieldPath) {
  const expectedStates =
    gate.gateId === "production_approval" ? productionFutureStates : substantiveFutureStates;
  if (
    !Array.isArray(gate.allowedFutureDecisionStates) ||
    gate.allowedFutureDecisionStates.length !== expectedStates.length ||
    gate.allowedFutureDecisionStates.some((state, index) => state !== expectedStates[index])
  ) {
    fail(`${fieldPath}.allowedFutureDecisionStates must match the future enum contract.`);
  }
}

function validateCriteria(
  gate,
  evidenceCategories,
  blockingCategories,
  seenCriterionIds,
  fieldPath,
) {
  if (!Array.isArray(gate.criteria) || gate.criteria.length === 0) {
    fail(`${fieldPath}.criteria must be a non-empty array.`);
  }
  if (
    gate.criteria.length !== evidenceCategories.size ||
    gate.criteria.length !== blockingCategories.size
  ) {
    fail(`${fieldPath}.criteria must map every evidence and blocking category exactly once.`);
  }

  const usedEvidenceCategories = new Set();
  const usedBlockingCategories = new Set();
  for (const [index, criterion] of gate.criteria.entries()) {
    const criterionPath = `${fieldPath}.criteria[${index}]`;
    requireExactFields(criterion, criterionFields, criterionPath);
    requireString(criterion.criterionId, `${criterionPath}.criterionId`);
    requireString(criterion.requirement, `${criterionPath}.requirement`);
    if (!criterion.criterionId.startsWith(`rubric.${gate.gateId}.`)) {
      fail(`${criterionPath}.criterionId must be namespaced by gate ${gate.gateId}.`);
    }
    if (!/^rubric\.[a-z0-9_]+\.[a-z0-9-]+\.v1$/.test(criterion.criterionId)) {
      fail(`${criterionPath}.criterionId is invalid.`);
    }
    if (seenCriterionIds.has(criterion.criterionId)) {
      fail(`Duplicate criterion ID ${criterion.criterionId}.`);
    }
    seenCriterionIds.add(criterion.criterionId);
    if (!/^[A-Z][A-Z0-9_]*$/.test(criterion.requirement)) {
      fail(`${criterionPath}.requirement must be an uppercase requirement code.`);
    }
    if (!evidenceCategories.has(criterion.requiredEvidenceCategory)) {
      fail(`${criterionPath}.requiredEvidenceCategory must reference its gate taxonomy.`);
    }
    if (!blockingCategories.has(criterion.blockingIssueCategory)) {
      fail(`${criterionPath}.blockingIssueCategory must reference its gate taxonomy.`);
    }
    if (usedEvidenceCategories.has(criterion.requiredEvidenceCategory)) {
      fail(`${criterionPath}.requiredEvidenceCategory is mapped more than once.`);
    }
    if (usedBlockingCategories.has(criterion.blockingIssueCategory)) {
      fail(`${criterionPath}.blockingIssueCategory is mapped more than once.`);
    }
    usedEvidenceCategories.add(criterion.requiredEvidenceCategory);
    usedBlockingCategories.add(criterion.blockingIssueCategory);
  }
}

function validateGatePolicyPin(gate, coverage, evidence, fieldPath) {
  const expectedPolicyVersion = expectedPolicyVersionPins.get(gate.gateId);
  if (
    gate.policyVersion !== expectedPolicyVersion ||
    gate.policyVersion !== coverage.policyVersionPins[gate.gateId]
  ) {
    fail(`${fieldPath}.policyVersion must match the approved gate policy pin.`);
  }
  for (const [slotIndex, slot] of evidence.slots.entries()) {
    if (slot.gateEvidencePlaceholders?.[gate.gateId]?.policyVersion !== gate.policyVersion) {
      fail(`${fieldPath}.policyVersion must match evidence slot ${slotIndex}.`);
    }
  }
}

function validateGates(artifact, coverage, evidence) {
  if (!Array.isArray(artifact.gates) || artifact.gates.length !== requiredGateNames.length) {
    fail("gates must contain exactly the six approved gate IDs.");
  }

  const seenGateIds = new Set();
  const seenCriterionIds = new Set();
  let requiredEvidenceCategoryCount = 0;
  let blockingIssueCategoryCount = 0;

  for (const [index, gate] of artifact.gates.entries()) {
    const fieldPath = `gates[${index}]`;
    requireExactFields(gate, gateFields, fieldPath);
    requireString(gate.gateId, `${fieldPath}.gateId`);
    if (!requiredGateNames.includes(gate.gateId)) {
      fail(`${fieldPath} uses unknown gate ID ${gate.gateId}.`);
    }
    if (seenGateIds.has(gate.gateId)) {
      fail(`Duplicate gate ID ${gate.gateId}.`);
    }
    seenGateIds.add(gate.gateId);
    if (gate.rubricState !== "NON_DECISION_DEFINITION") {
      fail(`${fieldPath}.rubricState must remain NON_DECISION_DEFINITION.`);
    }

    validateGatePolicyPin(gate, coverage, evidence, fieldPath);
    validateReviewerRolePlaceholder(
      gate.reviewerRolePlaceholder,
      `${fieldPath}.reviewerRolePlaceholder`,
    );
    const evidenceCategories = validateCategoryList(
      gate.requiredEvidenceCategories,
      `${fieldPath}.requiredEvidenceCategories`,
    );
    const blockingCategories = validateCategoryList(
      gate.blockingIssueCategories,
      `${fieldPath}.blockingIssueCategories`,
    );
    validateAllowedFutureStates(gate, fieldPath);
    validateCriteria(gate, evidenceCategories, blockingCategories, seenCriterionIds, fieldPath);

    requiredEvidenceCategoryCount += evidenceCategories.size;
    blockingIssueCategoryCount += blockingCategories.size;
  }

  for (const gateId of requiredGateNames) {
    if (!seenGateIds.has(gateId)) {
      fail(`Missing approved gate ID ${gateId}.`);
    }
  }

  return {
    criterionCount: seenCriterionIds.size,
    requiredEvidenceCategoryCount,
    blockingIssueCategoryCount,
  };
}

function validateAggregate(aggregate, gateCounts) {
  requireExactFields(aggregate, aggregateFields, "aggregate");
  if (aggregate.gateCount !== requiredGateNames.length) {
    fail("aggregate.gateCount must be 6.");
  }
  if (
    aggregate.criterionCount !== gateCounts.criterionCount ||
    aggregate.requiredEvidenceCategoryCount !== gateCounts.requiredEvidenceCategoryCount ||
    aggregate.blockingIssueCategoryCount !== gateCounts.blockingIssueCategoryCount
  ) {
    fail("aggregate rubric counts must match values derived from the six gates.");
  }
  if (
    aggregate.recordedDecisionCount !== 0 ||
    aggregate.recordedEvidenceCount !== 0 ||
    aggregate.productionApprovalCount !== 0
  ) {
    fail("aggregate must remain at zero recorded decisions, evidence and approvals.");
  }
}

export function validateDiagnosticReviewGateRubric(artifact, coverage, evidence) {
  if (!isPlainObject(artifact)) {
    fail("Review gate rubric artifact must be a JSON object.");
  }

  validateUpstreamArtifacts(coverage, evidence);
  scanForbiddenTerms(artifact);
  requireExactFields(artifact, topLevelFields, "$");
  validateMetadata(artifact.metadata, coverage, evidence);
  validateReadiness(artifact.readiness, evidence);
  validateDecisionBoundary(artifact.decisionBoundary);
  validateEmptyRecordArrays(artifact);
  const gateCounts = validateGates(artifact, coverage, evidence);
  validateAggregate(artifact.aggregate, gateCounts);

  return {
    rubricArtifactVersion: artifact.metadata.rubricArtifactVersion,
    reviewCoverageArtifactVersion: artifact.metadata.reviewCoverageArtifactVersion,
    reviewEvidenceArtifactVersion: artifact.metadata.reviewEvidenceArtifactVersion,
    gateCount: artifact.gates.length,
    criterionCount: gateCounts.criterionCount,
    requiredEvidenceCategoryCount: gateCounts.requiredEvidenceCategoryCount,
    blockingIssueCategoryCount: gateCounts.blockingIssueCategoryCount,
    recordedDecisionCount: artifact.reviewDecisionRecords.length,
    recordedEvidenceCount: artifact.reviewEvidenceRecords.length,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticReviewGateRubric(artifactPath = defaultReviewGateRubricPath) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateReviewGateRubricChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }

  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice4ChangedPaths.has(changedPath) &&
      !wave5Slice1ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice2ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice3ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice4ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice5ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice6ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice7ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice8ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice9ScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 4 Slice 4 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateReviewGateRubricWorktreeScope({ cwd = repoRoot } = {}) {
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

  return validateReviewGateRubricChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [artifact, coverage, evidence] = await Promise.all([
    readDiagnosticReviewGateRubric(),
    readDiagnosticReviewCoverage(),
    readDiagnosticReviewEvidence(),
  ]);
  const summary = validateDiagnosticReviewGateRubric(artifact, coverage, evidence);

  if (checkWorktreeScope) {
    validateReviewGateRubricWorktreeScope();
  }

  console.log(
    `[curriculum] Review gate rubric ${summary.rubricArtifactVersion} validated: ${summary.gateCount} gates, ${summary.criterionCount} criteria, ${summary.requiredEvidenceCategoryCount} evidence categories, ${summary.blockingIssueCategoryCount} blocking categories, ${summary.recordedDecisionCount} decisions, ${summary.recordedEvidenceCount} evidence records, ${summary.productionApprovalCount} production approvals; readiness ${summary.readiness}.`,
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
