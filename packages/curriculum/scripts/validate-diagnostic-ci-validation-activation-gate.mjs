import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  readDiagnosticRollbackWithdrawalPolicy,
  readDiagnosticRollbackWithdrawalPolicyUpstreamArtifacts,
  validateDiagnosticRollbackWithdrawalPolicy,
} from "./validate-diagnostic-rollback-withdrawal-policy.mjs";

const expectedArtifactVersion = "wave-5.slice-14.grade-7-9-math.v1";
const expectedGateVersion =
  "wave-5.slice-14.diagnostic-ci-and-deterministic-validation-activation-gate.placeholder.v1";
const expectedActivationArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedReadinessPlanArtifactVersion = "wave-5.slice-12.grade-7-9-math.v1";
const expectedReadinessPlanVersion =
  "wave-5.slice-12.diagnostic-readiness-integration-plan.placeholder.v1";
const expectedRollbackPolicyArtifactVersion = "wave-5.slice-13.grade-7-9-math.v1";
const expectedRollbackPolicyVersion =
  "wave-5.slice-13.diagnostic-rollback-and-withdrawal.placeholder.v1";
const expectedCoveragePlanArtifactVersion = "wave-5.slice-11.grade-7-9-math.v1";
const expectedCoveragePlanVersion =
  "wave-5.slice-11.diagnostic-coverage-gap-closure-plan.placeholder.v1";
const expectedProductionAuthorityArtifactVersion = "wave-5.slice-10.grade-7-9-math.v1";
const expectedProductionAuthorityPolicyVersion =
  "wave-5.slice-10.diagnostic-production-approval-authority.placeholder.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const expectedBlockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];
const expectedCiJobPlaceholderIds = [
  "STATIC_GOVERNANCE_VALIDATION_JOB_PLACEHOLDER",
  "APPLICATION_QUALITY_VALIDATION_JOB_PLACEHOLDER",
  "DATABASE_CONTRACT_VALIDATION_JOB_PLACEHOLDER",
  "INFRASTRUCTURE_AVAILABILITY_VALIDATION_JOB_PLACEHOLDER",
  "SAFETY_PRIVACY_VALIDATION_JOB_PLACEHOLDER",
  "MANUAL_APPROVAL_HANDOFF_JOB_PLACEHOLDER",
];
const expectedValidatorMatrixRows = [
  ["EXACT_UPSTREAM_VERSION_PINS_VALIDATOR_PLACEHOLDER", "exact_upstream_version_pins"],
  ["CLOSED_WORLD_ARTIFACT_SCHEMA_VALIDATOR_PLACEHOLDER", "closed_world_artifact_schema"],
  ["EXACT_WORKTREE_SCOPE_VALIDATOR_PLACEHOLDER", "exact_worktree_scope"],
  ["GOVERNANCE_ARTIFACT_CONSISTENCY_VALIDATOR_PLACEHOLDER", "governance_artifact_consistency"],
  ["NO_ANSWER_NO_SCORING_SAFETY_VALIDATOR_PLACEHOLDER", "no_answer_no_scoring_safety"],
  ["PRIVACY_PII_SCAN_VALIDATOR_PLACEHOLDER", "privacy_pii_scan"],
  ["RUNTIME_INTERFACE_CHANGE_BOUNDARY_VALIDATOR_PLACEHOLDER", "runtime_interface_change_boundary"],
  ["MIGRATION_SCHEMA_DRIFT_VALIDATOR_PLACEHOLDER", "migration_schema_drift"],
  [
    "DOCKER_INFRASTRUCTURE_AVAILABILITY_VALIDATOR_PLACEHOLDER",
    "docker_infrastructure_availability",
  ],
  ["RERUN_REPRODUCIBILITY_VALIDATOR_PLACEHOLDER", "rerun_reproducibility"],
];
const expectedDecisionRequirementIds = [
  "current_validation_baseline_and_provenance",
  "required_ci_jobs_and_dependency_order",
  "deterministic_validator_matrix",
  "governance_artifact_consistency_gate",
  "no_answer_no_scoring_safety_gate",
  "privacy_and_pii_scan_gate",
  "runtime_api_openapi_web_change_gate",
  "migration_and_schema_drift_gate",
  "docker_and_infrastructure_availability_gate",
  "rerun_flakiness_and_reproducibility_policy",
  "manual_approval_handoff_and_activation_sequencing",
];
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
  "itemStem",
  "stemText",
  "candidateContent",
  "diagnosticItemContent",
];
const forbiddenExactKeys = new Set(["candidateid", "candidateids"]);
const placeholderFieldNames = [
  "governanceArtifactConsistencyGatePlaceholder",
  "safetyNoAnswerNoScoringGatePlaceholder",
  "privacyPiiScanGatePlaceholder",
  "runtimeInterfaceChangeGatePlaceholder",
  "migrationSchemaDriftGatePlaceholder",
  "dockerInfrastructureAvailabilityGatePlaceholder",
  "rerunFlakinessPolicyPlaceholder",
  "manualApprovalHandoffPlaceholder",
];
const recordBoundaryFields = [
  "ciGateDecisionsRecorded",
  "ciGateExecutionsRecorded",
  "ciJobExecutionsRecorded",
  "validatorExecutionsRecorded",
  "governanceConsistencyRecordsRecorded",
  "safetyScanRecordsRecorded",
  "privacyScanRecordsRecorded",
  "runtimeChangeAssessmentsRecorded",
  "schemaDriftAssessmentsRecorded",
  "infrastructureAvailabilityRecordsRecorded",
  "rerunsRecorded",
  "flakinessRecordsRecorded",
  "manualApprovalHandoffsRecorded",
  "prerequisiteSatisfactionsRecorded",
  "activationTransitionsRecorded",
  "readinessTransitionsRecorded",
  "realDiagnosticItemsRecorded",
  "realCandidatesRecorded",
  "approvedCandidatesRecorded",
  "reviewEvidenceRecorded",
  "reviewDecisionsRecorded",
  "digestValuesRecorded",
  "candidateIdentitiesRecorded",
  "reviewerIdentitiesRecorded",
  "auditIdentitiesRecorded",
  "reviewerAssignmentsRecorded",
  "authorityGrantsRecorded",
  "rollbackRecordsRecorded",
  "withdrawalRecordsRecorded",
  "productionApprovalsRecorded",
  "ciActivationGateActive",
  "ciWorkflowChanged",
  "runtimeValidationEnforcementEnabled",
];
const zeroAggregateFields = [
  "closedBlockingReasonCount",
  "satisfiedPrerequisiteCount",
  "activeCiJobCount",
  "activeDeterministicValidatorCount",
  "activeGateRuleCount",
  "ciGateDecisionCount",
  "ciGateExecutionCount",
  "ciJobExecutionCount",
  "validatorExecutionCount",
  "governanceConsistencyRecordCount",
  "safetyScanRecordCount",
  "privacyScanRecordCount",
  "runtimeChangeAssessmentCount",
  "schemaDriftAssessmentCount",
  "infrastructureAvailabilityRecordCount",
  "rerunRecordCount",
  "flakinessRecordCount",
  "manualApprovalHandoffCount",
  "prerequisiteSatisfactionRecordCount",
  "activationTransitionRecordCount",
  "readinessTransitionRecordCount",
  "realDiagnosticItemCount",
  "realCandidateCount",
  "approvedCandidateCount",
  "reviewEvidenceRecordCount",
  "reviewDecisionCount",
  "digestValueCount",
  "candidateIdentityCount",
  "reviewerIdentityCount",
  "auditIdentityCount",
  "reviewerAssignmentCount",
  "authorityGrantCount",
  "rollbackRecordCount",
  "withdrawalRecordCount",
  "productionApprovalCount",
];
const protectedRecordFields = [
  "ciGateDecisionRecords",
  "ciGateExecutionRecords",
  "ciJobExecutionRecords",
  "validatorExecutionRecords",
  "governanceConsistencyRecords",
  "safetyScanRecords",
  "privacyScanRecords",
  "runtimeChangeAssessmentRecords",
  "schemaDriftAssessmentRecords",
  "infrastructureAvailabilityRecords",
  "rerunRecords",
  "flakinessRecords",
  "manualApprovalHandoffRecords",
  "prerequisiteSatisfactionRecords",
  "activationTransitionRecords",
  "readinessTransitionRecords",
  "realDiagnosticItemRecords",
  "realCandidateRecords",
  "approvedCandidateRecords",
  "reviewEvidenceRecords",
  "reviewDecisionRecords",
  "digestValueRecords",
  "candidateIdentityRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "authorityGrantRecords",
  "rollbackRecords",
  "withdrawalRecords",
  "productionApprovalRecords",
];
const approvedSlice14ChangedPaths = new Set([
  "docs/wave-5/diagnostic-ci-validation-activation-gate-contract.md",
  "docs/wave-5/slice-14-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-ci-validation-activation-gate/grade-7-9-math.ci-validation-activation-gate-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
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
  "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate.test.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-coverage-gap-closure-plan.test.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
]);
const wave5ClosureScopeUnblockPaths = new Set(["docs/wave-5/closure-gate.md"]);
const wave6Slice1ScopeUnblockPaths = new Set([
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
  "docs/wave-6/diagnostic-separation-of-duties-policy-decision-proposal.md",
  "docs/wave-6/slice-4-implementation-note.md",
  "packages/curriculum/diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-conflict-of-interest-policy-decision-proposal.md",
  "docs/wave-6/slice-5-implementation-note.md",
  "packages/curriculum/diagnostic-conflict-of-interest-policy-decision-proposal/grade-7-9-math.conflict-of-interest-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy-decision-proposal.test.mjs",
  "apps/api/test/mock-ocr-candidate-api.e2e.mjs",
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
export const defaultCiValidationActivationGatePath = path.resolve(
  scriptDir,
  "../diagnostic-ci-validation-activation-gate/grade-7-9-math.ci-validation-activation-gate-placeholder.v1.json",
);
export const defaultCiWorkflowPath = path.resolve(repoRoot, ".github/workflows/ci.yml");

export class DiagnosticCiValidationActivationGateValidationError extends Error {}

function fail(message) {
  throw new DiagnosticCiValidationActivationGateValidationError(message);
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
    expected.forEach((value, index) =>
      requireExactValue(actual[index], value, `${fieldPath}[${index}]`),
    );
    return;
  }
  if (isPlainObject(expected)) {
    if (!isPlainObject(actual)) fail(`${fieldPath} must be an object.`);
    for (const key of Object.keys(actual)) {
      if (!Object.hasOwn(expected, key)) fail(`${fieldPath}.${key} is an unexpected field.`);
    }
    for (const key of Object.keys(expected)) {
      if (!Object.hasOwn(actual, key)) fail(`${fieldPath}.${key} is required.`);
      requireExactValue(actual[key], expected[key], `${fieldPath}.${key}`);
    }
    return;
  }
  if (!Object.is(actual, expected)) {
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
    for (const [key, nested] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      if (forbiddenExactKeys.has(normalizedKey)) {
        fail(`${fieldPath}.${key} uses a forbidden candidate identifier field.`);
      }
      for (const term of forbiddenTerms) {
        if (normalizedKey.includes(term.toLowerCase())) {
          fail(`${fieldPath}.${key} uses forbidden field term ${term}.`);
        }
      }
      scanForbiddenTermsAndPrivateValues(nested, `${fieldPath}.${key}`);
    }
    return;
  }
  if (typeof value !== "string") return;
  if (value === "READY") fail(`${fieldPath} cannot contain an enabled readiness state.`);
  const normalizedValue = value.toLowerCase();
  for (const term of forbiddenTerms) {
    if (normalizedValue.includes(term.toLowerCase())) {
      fail(`${fieldPath} uses forbidden content term ${term}.`);
    }
  }
  const privatePatterns = [
    [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "email-like value"],
    [/(?:https?|s3|minio|file):\/\//i, "URL-like value"],
    [/\bwww\.[a-z0-9.-]+\.[a-z]{2,}\b/i, "URL-like value"],
    [
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
      "UUID-like value",
    ],
    [/\buser[-_:]?[a-z0-9]{6,}\b/i, "user-id-like value"],
    [/\baccount[-_:]?[a-z0-9]{6,}\b/i, "account-id-like value"],
    [/\bdcandidate\.[a-z0-9.-]+\b/i, "candidate-id-like value"],
    [/\bcandidate[-_:](?=[a-z0-9]*\d)[a-z0-9]{6,}\b/i, "candidate-id-like value"],
    [/\b[0-9a-f]{32,}\b/i, "hash-like value"],
  ];
  for (const [pattern, label] of privatePatterns) {
    if (pattern.test(value)) fail(`${fieldPath} contains a ${label}.`);
  }
}

function falseFields(fieldNames) {
  return Object.fromEntries(fieldNames.map((field) => [field, false]));
}

function zeroFields(fieldNames) {
  return Object.fromEntries(fieldNames.map((field) => [field, 0]));
}

function unresolvedRequirement(requirementId) {
  return {
    requirementId,
    state: "TO_BE_DECIDED",
    decisionReference: null,
    policyReference: null,
    activeRuleReferences: [],
    decisionRecorded: false,
  };
}

function findCiValidationPrerequisite(activationPrerequisites) {
  const matches = activationPrerequisites.prerequisites.filter(
    (item) => item.prerequisiteId === "ci_and_deterministic_validation",
  );
  if (matches.length !== 1) {
    fail("Activation prerequisites must contain exactly one ci_and_deterministic_validation row.");
  }
  const expected = {
    prerequisiteId: "ci_and_deterministic_validation",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future deterministic schema, version-pin, negative-fixture, exact-scope and provenance checks in CI.",
    evidenceRecordRefs: [],
  };
  requireExactValue(
    matches[0],
    expected,
    "activationPrerequisites.ci_and_deterministic_validation",
  );
  return matches[0];
}

function validateCiWorkflowBaselineSource(source) {
  requireString(source, "ciWorkflowSource");
  const normalized = source.replaceAll("\r\n", "\n");
  const requiredSnippets = [
    "name: CI",
    "jobs:\n  validate:",
    "uses: actions/setup-node@v4",
    'node-version: "24"',
    "corepack prepare pnpm@11.7.0 --activate",
    "run: pnpm install --frozen-lockfile",
    "run: pnpm.cmd run db:generate",
    "run: pnpm.cmd run infra:validate",
    "run: pnpm.cmd run db:validate",
    "run: pnpm.cmd run db:migrate:deploy",
    "run: pnpm.cmd run validate",
  ];
  for (const snippet of requiredSnippets) {
    if (normalized.split(snippet).length - 1 !== 1) {
      fail(`ciWorkflowSource must contain exactly one ${JSON.stringify(snippet)} marker.`);
    }
  }
  const jobsIndex = normalized.indexOf("jobs:\n");
  const jobIds = [...normalized.slice(jobsIndex + 6).matchAll(/^ {2}([a-zA-Z0-9_-]+):\s*$/gm)].map(
    (match) => match[1],
  );
  requireExactValue(jobIds, ["validate"], "ciWorkflowSource.jobIds");
}

function validateUpstreamArtifacts(upstream) {
  if (!isPlainObject(upstream) || !isPlainObject(upstream.rollbackUpstream)) {
    fail("Upstream artifacts must include the rollback and withdrawal policy chain.");
  }
  validateCiWorkflowBaselineSource(upstream.ciWorkflowSource);
  const rollbackSummary = validateDiagnosticRollbackWithdrawalPolicy(
    upstream.rollbackPolicy,
    upstream.rollbackUpstream,
  );
  requireExactValue(
    rollbackSummary,
    {
      policyArtifactVersion: expectedRollbackPolicyArtifactVersion,
      policyVersion: expectedRollbackPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      withdrawalTriggerPlaceholderCount: 7,
      rollbackTriggerPlaceholderCount: 5,
      decisionRequirementCount: 11,
      openBlockingReasonCount: 2,
      closedBlockingReasonCount: 0,
      satisfiedPrerequisiteCount: 0,
      candidateWithdrawalCount: 0,
      rollbackRecordCount: 0,
      tombstoneRecordCount: 0,
      restorationRecordCount: 0,
      approvedCandidateCount: 0,
      productionApprovalCount: 0,
      activationStatus: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      readiness: "NOT_READY",
    },
    "rollbackWithdrawalPolicySummary",
  );
  const readinessUpstream = upstream.rollbackUpstream.readinessUpstream;
  const coverageUpstream = readinessUpstream.coverageGapClosureUpstream;
  const productionUpstream = coverageUpstream.productionUpstream;
  const activation = productionUpstream.evidenceUpstream.auditUpstream.activationPrerequisites;
  return {
    activation,
    readinessPlan: upstream.rollbackUpstream.readinessPlan,
    rollbackPolicy: upstream.rollbackPolicy,
    rollbackSummary,
    coveragePlan: readinessUpstream.coverageGapClosurePlan,
    productionPolicy: coverageUpstream.productionPolicy,
    prerequisite: findCiValidationPrerequisite(activation),
  };
}

function expectedCiJob(jobPlaceholderId) {
  return {
    jobPlaceholderId,
    state: "TO_BE_DECIDED",
    jobConfigurationReference: null,
    dependencyJobPlaceholderIds: [],
    workflowJobRecorded: false,
    executionAllowed: false,
    gateContributionAllowed: false,
  };
}

function expectedValidatorMatrixRow([validatorPlaceholderId, concernScope]) {
  return {
    validatorPlaceholderId,
    concernScope,
    state: "TO_BE_DECIDED",
    validatorReference: null,
    fixturePolicyReference: null,
    negativeFixtureReference: null,
    deterministicResultRequired: true,
    activeValidatorRecorded: false,
    executionAllowed: false,
    gateContributionAllowed: false,
  };
}

function buildExpectedArtifact({
  activation,
  readinessPlan,
  rollbackSummary,
  coveragePlan,
  productionPolicy,
  prerequisite,
}) {
  const expected = {
    metadata: {
      schemaVersion: "learnika.diagnosticCiValidationActivationGatePlaceholder.v1",
      gateArtifactVersion: expectedArtifactVersion,
      status: "placeholder_only_unsatisfied_non_production",
      artifactKind: "diagnostic_ci_validation_activation_gate_placeholder",
      subject: "math",
      locale: "ru-RU",
      audienceGrades: [7, 8, 9],
      activationPrerequisitesArtifactVersion: expectedActivationArtifactVersion,
      readinessIntegrationPlanArtifactVersion: expectedReadinessPlanArtifactVersion,
      rollbackWithdrawalPolicyArtifactVersion: expectedRollbackPolicyArtifactVersion,
      coverageGapClosurePlanArtifactVersion: expectedCoveragePlanArtifactVersion,
      productionApprovalAuthorityPolicyArtifactVersion: expectedProductionAuthorityArtifactVersion,
      diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
      sourceContract: "docs/wave-5/diagnostic-ci-validation-activation-gate-contract.md",
      workflowSourcePath: ".github/workflows/ci.yml",
      workflowFileChangeAllowed: false,
      productionUseAllowed: false,
      runtimeUseAllowed: false,
      storageAllowed: false,
    },
    activationBoundary: {
      status: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      activationAllowed: false,
      reviewWorkflowActivationAllowed: false,
      readinessTransitionAllowed: false,
      ciActivationGateAllowed: false,
      ciWorkflowChangeAllowed: false,
      runtimeValidationEnforcementAllowed: false,
      prerequisiteSatisfactionAllowed: false,
      productionApprovalAllowed: false,
    },
    dependencyReferences: {
      activationPrerequisites: {
        artifactVersion: expectedActivationArtifactVersion,
        artifactStatus: activation.metadata.status,
        prerequisiteId: prerequisite.prerequisiteId,
        prerequisiteStatus: prerequisite.status,
        activationStatus: activation.activationBoundary.status,
        reviewWorkflowStatus: activation.activationBoundary.reviewWorkflowStatus,
        prerequisiteCount: activation.aggregate.prerequisiteCount,
        unsatisfiedPrerequisiteCount: activation.aggregate.unsatisfiedPrerequisiteCount,
        satisfiedPrerequisiteCount: activation.aggregate.satisfiedPrerequisiteCount,
        productionApprovalCount: activation.aggregate.productionApprovalCount,
      },
      readinessIntegrationPlan: {
        artifactVersion: expectedReadinessPlanArtifactVersion,
        planVersion: expectedReadinessPlanVersion,
        planState: readinessPlan.planIdentity.planState,
        prerequisiteStatus: readinessPlan.prerequisiteReference.status,
        readinessStatus: readinessPlan.readiness.status,
        blockingReasonCount: readinessPlan.aggregate.blockingReasonCount,
        openBlockingReasonCount: readinessPlan.aggregate.openBlockingReasonCount,
        closedBlockingReasonCount: readinessPlan.aggregate.closedBlockingReasonCount,
        satisfiedPrerequisiteCount: readinessPlan.aggregate.satisfiedPrerequisiteCount,
        readinessTransitionRecordCount: readinessPlan.aggregate.readinessTransitionRecordCount,
        approvedCandidateCount: readinessPlan.aggregate.approvedCandidateCount,
        productionApprovalCount: readinessPlan.aggregate.productionApprovalCount,
      },
      rollbackWithdrawalPolicy: {
        artifactVersion: rollbackSummary.policyArtifactVersion,
        policyVersion: rollbackSummary.policyVersion,
        policyState: rollbackSummary.policyState,
        prerequisiteStatus: rollbackSummary.prerequisiteStatus,
        candidateWithdrawalCount: rollbackSummary.candidateWithdrawalCount,
        rollbackRecordCount: rollbackSummary.rollbackRecordCount,
        approvedCandidateCount: rollbackSummary.approvedCandidateCount,
        productionApprovalCount: rollbackSummary.productionApprovalCount,
      },
      coverageGapClosurePlan: {
        artifactVersion: expectedCoveragePlanArtifactVersion,
        planVersion: expectedCoveragePlanVersion,
        planState: coveragePlan.planIdentity.planState,
        prerequisiteStatus: coveragePlan.prerequisiteReference.status,
        gapEntryCount: coveragePlan.aggregate.gapEntryCount,
        draftOnlyEntryCount: coveragePlan.aggregate.draftOnlyEntryCount,
        closedGapCount: coveragePlan.aggregate.closedGapCount,
        productionApprovedSlotCount: coveragePlan.aggregate.productionApprovedSlotCount,
        realCandidateCount: coveragePlan.aggregate.realCandidateCount,
        productionApprovalCount: coveragePlan.aggregate.productionApprovalCount,
      },
      productionApprovalAuthorityPolicy: {
        artifactVersion: expectedProductionAuthorityArtifactVersion,
        policyVersion: expectedProductionAuthorityPolicyVersion,
        policyState: productionPolicy.policyIdentity.policyState,
        prerequisiteStatus: productionPolicy.prerequisiteReference.status,
        activeApprovalRuleCount: productionPolicy.aggregate.activeApprovalRuleCount,
        authorityGrantCount: productionPolicy.aggregate.authorityGrantCount,
        approvalDecisionCount: productionPolicy.aggregate.approvalDecisionCount,
        approvedCandidateCount: productionPolicy.aggregate.approvedCandidateCount,
        productionApprovalCount: productionPolicy.aggregate.productionApprovalCount,
      },
    },
    prerequisiteReference: { ...prerequisite, evidenceRecordRefs: [] },
    gateIdentity: {
      gateId: "diagnostic-ci-and-deterministic-validation-activation-gate",
      gateVersion: expectedGateVersion,
      gateState: "UNRESOLVED_DEFERRED",
      activeRulesetVersion: null,
      gateApprovalAllowed: false,
      gateActivationAllowed: false,
      ciWorkflowMutationAllowed: false,
      runtimeValidationEnforcementAllowed: false,
      gateEvaluationAllowed: false,
      gateDecisionRecordingAllowed: false,
      manualApprovalHandoffAllowed: false,
      prerequisiteSatisfactionAllowed: false,
      activationTransitionAllowed: false,
      readinessTransitionAllowed: false,
    },
    currentValidationBaselinePlaceholder: {
      state: "OBSERVED_CONFIGURATION_NOT_APPROVED",
      workflowSourcePath: ".github/workflows/ci.yml",
      observedWorkflowName: "CI",
      observedJobIds: ["validate"],
      observedNodeMajorVersion: "24",
      observedPnpmVersion: "11.7.0",
      frozenLockfileInstallObserved: true,
      databaseClientGenerationObserved: true,
      infrastructureValidationObserved: true,
      databaseValidationObserved: true,
      migrationDeployObserved: true,
      aggregateRepositoryValidationObserved: true,
      workflowMutationRecorded: false,
      baselineApprovalRecorded: false,
      baselineGatePassRecorded: false,
      baselineExecutionEvidenceRefs: [],
      activationUseAllowed: false,
    },
    futureRequiredCiJobPlaceholders: expectedCiJobPlaceholderIds.map(expectedCiJob),
    futureDeterministicValidatorMatrixPlaceholders: expectedValidatorMatrixRows.map(
      expectedValidatorMatrixRow,
    ),
    governanceArtifactConsistencyGatePlaceholder: {
      requirementId: "governance_artifact_consistency_gate",
      state: "TO_BE_DECIDED",
      consistencyRuleVersionReference: null,
      upstreamPinPolicyReference: null,
      closedWorldSchemaPolicyReference: null,
      activeRuleReferences: [],
      evaluationAllowed: false,
      gateDecisionRecordingAllowed: false,
    },
    safetyNoAnswerNoScoringGatePlaceholder: {
      requirementId: "no_answer_no_scoring_safety_gate",
      state: "TO_BE_DECIDED",
      safetyPolicyVersionReference: null,
      negativeFixturePolicyReference: null,
      failureRoutingPolicyReference: null,
      activeRuleReferences: [],
      evaluationAllowed: false,
      gateDecisionRecordingAllowed: false,
    },
    privacyPiiScanGatePlaceholder: {
      requirementId: "privacy_and_pii_scan_gate",
      state: "TO_BE_DECIDED",
      privacyPolicyVersionReference: null,
      scanRuleVersionReference: null,
      falsePositivePolicyReference: null,
      activeRuleReferences: [],
      evaluationAllowed: false,
      gateDecisionRecordingAllowed: false,
    },
    runtimeInterfaceChangeGatePlaceholder: {
      requirementId: "runtime_api_openapi_web_change_gate",
      state: "TO_BE_DECIDED",
      changeClassificationPolicyReference: null,
      reviewRoutingPolicyReference: null,
      activeRuleReferences: [],
      runtimeChangeAllowed: false,
      apiChangeAllowed: false,
      openapiChangeAllowed: false,
      webChangeAllowed: false,
      evaluationAllowed: false,
      gateDecisionRecordingAllowed: false,
    },
    migrationSchemaDriftGatePlaceholder: {
      requirementId: "migration_and_schema_drift_gate",
      state: "TO_BE_DECIDED",
      schemaBaselinePolicyReference: null,
      migrationReviewPolicyReference: null,
      driftFailurePolicyReference: null,
      activeRuleReferences: [],
      evaluationAllowed: false,
      migrationExecutionAllowed: false,
      gateDecisionRecordingAllowed: false,
    },
    dockerInfrastructureAvailabilityGatePlaceholder: {
      requirementId: "docker_and_infrastructure_availability_gate",
      state: "TO_BE_DECIDED",
      serviceAvailabilityPolicyReference: null,
      failureClassificationPolicyReference: null,
      retryPolicyReference: null,
      activeRuleReferences: [],
      evaluationAllowed: false,
      infrastructureMutationAllowed: false,
      gateDecisionRecordingAllowed: false,
    },
    rerunFlakinessPolicyPlaceholder: {
      requirementId: "rerun_flakiness_and_reproducibility_policy",
      state: "TO_BE_DECIDED",
      rerunLimitPolicyReference: null,
      failureClassificationPolicyReference: null,
      flakinessOwnershipPolicyReference: null,
      quarantinePolicyReference: null,
      activeRuleReferences: [],
      rerunExecutionAllowed: false,
      flakinessRecordingAllowed: false,
      gateDecisionRecordingAllowed: false,
    },
    manualApprovalHandoffPlaceholder: {
      requirementId: "manual_approval_handoff_and_activation_sequencing",
      state: "TO_BE_DECIDED",
      authorityPolicyReference: null,
      handoffSchemaReference: null,
      independencePolicyReference: null,
      activationSequencingPolicyReference: null,
      activeRuleReferences: [],
      handoffRecordingAllowed: false,
      manualApprovalAllowed: false,
      prerequisiteSatisfactionAllowed: false,
      activationTransitionAllowed: false,
      readinessTransitionAllowed: false,
    },
    decisionRequirements: expectedDecisionRequirementIds.map(unresolvedRequirement),
    recordBoundary: falseFields(recordBoundaryFields),
    readiness: {
      policyVersion: expectedReadinessPolicyVersion,
      status: "NOT_READY",
      blockingReasons: expectedBlockingReasons,
    },
    aggregate: {
      futureRequiredCiJobPlaceholderCount: 6,
      deterministicValidatorMatrixPlaceholderCount: 10,
      decisionRequirementCount: 11,
      undecidedRequirementCount: 11,
      blockingReasonCount: 2,
      openBlockingReasonCount: 2,
      ...zeroFields(zeroAggregateFields),
    },
  };
  for (const field of protectedRecordFields) expected[field] = [];
  return expected;
}

export function validateDiagnosticCiValidationActivationGate(artifact, upstream) {
  const validatedUpstream = validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  requireExactValue(artifact, buildExpectedArtifact(validatedUpstream), "$");
  for (const field of placeholderFieldNames) {
    requireExactValue(artifact[field].state, "TO_BE_DECIDED", `${field}.state`);
  }
  return {
    gateArtifactVersion: artifact.metadata.gateArtifactVersion,
    gateVersion: artifact.gateIdentity.gateVersion,
    gateState: artifact.gateIdentity.gateState,
    prerequisiteStatus: artifact.prerequisiteReference.status,
    ciJobPlaceholderCount: artifact.aggregate.futureRequiredCiJobPlaceholderCount,
    validatorMatrixPlaceholderCount:
      artifact.aggregate.deterministicValidatorMatrixPlaceholderCount,
    decisionRequirementCount: artifact.aggregate.decisionRequirementCount,
    openBlockingReasonCount: artifact.aggregate.openBlockingReasonCount,
    satisfiedPrerequisiteCount: artifact.aggregate.satisfiedPrerequisiteCount,
    approvedCandidateCount: artifact.aggregate.approvedCandidateCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticCiValidationActivationGate(
  artifactPath = defaultCiValidationActivationGatePath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticCiValidationActivationGateUpstreamArtifacts() {
  const [rollbackPolicy, rollbackUpstream, ciWorkflowSource] = await Promise.all([
    readDiagnosticRollbackWithdrawalPolicy(),
    readDiagnosticRollbackWithdrawalPolicyUpstreamArtifacts(),
    readFile(defaultCiWorkflowPath, "utf8"),
  ]);
  return { rollbackPolicy, rollbackUpstream, ciWorkflowSource };
}

export function normalizeCiValidationActivationGateStatusPaths(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  return rawPath.split(" -> ").map((changedPath) => changedPath.replaceAll("\\", "/"));
}

export function validateCiValidationActivationGateChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) fail("Changed paths must be an array.");
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice14ChangedPaths.has(changedPath) &&
      !wave5ClosureScopeUnblockPaths.has(changedPath) &&
      !wave6Slice1ScopeUnblockPaths.has(changedPath) &&
      !wave6Slice2ScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 5 Slice 14 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateCiValidationActivationGateWorktreeScope({ cwd = repoRoot } = {}) {
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
    .flatMap(normalizeCiValidationActivationGateStatusPaths);
  return validateCiValidationActivationGateChangedPaths(changedPaths);
}

async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticCiValidationActivationGate(),
    readDiagnosticCiValidationActivationGateUpstreamArtifacts(),
  ]);
  const summary = validateDiagnosticCiValidationActivationGate(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    validateCiValidationActivationGateWorktreeScope();
  }
  console.log(
    `[curriculum] CI validation activation gate ${summary.gateArtifactVersion} validated: ${summary.ciJobPlaceholderCount} future job placeholders, ${summary.validatorMatrixPlaceholderCount} validator matrix placeholders, ${summary.decisionRequirementCount} undecided requirements, ${summary.openBlockingReasonCount} open blockers, ${summary.satisfiedPrerequisiteCount} satisfied prerequisites, ${summary.approvedCandidateCount} approved candidates, ${summary.productionApprovalCount} production approvals; gate ${summary.gateState}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, readiness ${summary.readiness}.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`[curriculum] ${error.message}`);
    process.exitCode = 1;
  });
}
