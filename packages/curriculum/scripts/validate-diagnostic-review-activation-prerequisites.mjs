import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "./validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateDigestRegistry } from "./validate-diagnostic-candidate-digest.mjs";
import {
  readDiagnosticReviewAuthority,
  validateDiagnosticReviewAuthority,
} from "./validate-diagnostic-review-authority.mjs";
import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "./validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "./validate-diagnostic-review-gate-rubric.mjs";
import { readDiagnosticReviewWorkflowState } from "./validate-diagnostic-review-workflow-state.mjs";

const expectedArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
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
  "userId",
  "accountId",
  "immutableDigest",
  "sha256",
  "contentHash",
  "canonicalizedContent",
  "normalizedStem",
];
const expectedPrerequisites = new Map([
  [
    "candidate_identity_policy",
    "Future versioned policy for identity allocation, uniqueness, non-reuse, revision, invalidation and synthetic negative validation.",
  ],
  [
    "canonicalization_and_digest_policy",
    "Future approved field inventory, deterministic byte serialization, algorithm and encoding policy, and synthetic reproducibility vectors.",
  ],
  [
    "reviewer_role_ownership",
    "Future versioned policy for accountable ownership, eligibility, appointment, revocation, scope, minimum counts and quorum.",
  ],
  [
    "separation_of_duties_enforcement",
    "Future fail-closed assignment-time and decision-time independence policy with positive and negative authorization tests.",
  ],
  [
    "conflict_of_interest_policy",
    "Future versioned disclosure, evaluation, recusal, reassignment, escalation and late-disclosure handling policy.",
  ],
  [
    "audit_identity_policy",
    "Future opaque identity binding, authorization, revocation, controlled lookup, access and privacy policy with synthetic validation.",
  ],
  [
    "evidence_storage_and_retention_policy",
    "Future evidence schema, integrity pins, access controls, retention and deletion matrix, recovery and orphan-reference tests.",
  ],
  [
    "production_approval_authority",
    "Future independent approval eligibility, quorum, explicit decision, withdrawal and re-approval policy with authorization tests.",
  ],
  [
    "coverage_gap_closure_plan",
    "Future per-slot rights-safe authoring and fixture-disposition plan with explicit coverage thresholds and no-silent-waiver checks.",
  ],
  [
    "readiness_integration_plan",
    "Future fail-closed readiness reconciliation design with stale-reference, invalidation and withdrawal tests.",
  ],
  [
    "rollback_and_withdrawal_policy",
    "Future trigger, containment, propagation, history-preservation, restoration and partial-failure test matrix.",
  ],
  [
    "ci_and_deterministic_validation",
    "Future deterministic schema, version-pin, negative-fixture, exact-scope and provenance checks in CI.",
  ],
]);
const approvedSlice2ChangedPaths = new Set([
  "docs/wave-5/slice-2-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
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
export const defaultActivationPrerequisitesPath = path.resolve(
  scriptDir,
  "../diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
);

export class DiagnosticReviewActivationPrerequisitesValidationError extends Error {}

function fail(message) {
  throw new DiagnosticReviewActivationPrerequisitesValidationError(message);
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
    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual);
    for (const key of actualKeys) {
      if (!Object.hasOwn(expected, key)) {
        fail(`${fieldPath}.${key} is an unexpected field.`);
      }
    }
    for (const key of expectedKeys) {
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
      fail(`${fieldPath} contains a hash-like value, which is forbidden in Slice 2.`);
    }
    if (/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(value)) {
      fail(`${fieldPath} contains an email-like value, which is forbidden in Slice 2.`);
    }
  }
}

function validateUpstreamArtifacts(upstream) {
  const authoritySummary = validateDiagnosticReviewAuthority(
    upstream.authority,
    upstream.coverage,
    upstream.evidence,
    upstream.rubric,
    upstream.registry,
    upstream.canonicalization,
    upstream.workflow,
  );
  if (
    upstream.coverage.metadata.coverageArtifactVersion !== "wave-4.slice-2.grade-7-9-math.v1" ||
    upstream.evidence.metadata.evidenceArtifactVersion !== "wave-4.slice-3.grade-7-9-math.v1" ||
    upstream.rubric.metadata.rubricArtifactVersion !== "wave-4.slice-4.grade-7-9-math.v1" ||
    upstream.registry.metadata.registryArtifactVersion !== "wave-4.slice-5.grade-7-9-math.v1" ||
    upstream.canonicalization.metadata.policyArtifactVersion !==
      "wave-4.slice-6.grade-7-9-math.v1" ||
    upstream.workflow.metadata.workflowArtifactVersion !== "wave-4.slice-7.grade-7-9-math.v1" ||
    upstream.authority.metadata.authorityArtifactVersion !== "wave-4.slice-8.grade-7-9-math.v1"
  ) {
    fail("Wave 4 dependency versions must remain pinned to the closed baseline.");
  }
  return authoritySummary;
}

function expectedMetadata(upstream) {
  return {
    schemaVersion: "learnika.diagnosticReviewActivationPrerequisites.v1",
    activationPrerequisitesArtifactVersion: expectedArtifactVersion,
    status: "blocked_prerequisites_only_non_production",
    artifactKind: "diagnostic_review_activation_prerequisites",
    subject: "math",
    locale: "ru-RU",
    audienceGrades: [7, 8, 9],
    reviewCoverageArtifactVersion: upstream.coverage.metadata.coverageArtifactVersion,
    reviewEvidenceArtifactVersion: upstream.evidence.metadata.evidenceArtifactVersion,
    reviewGateRubricArtifactVersion: upstream.rubric.metadata.rubricArtifactVersion,
    candidateDigestRegistryArtifactVersion: upstream.registry.metadata.registryArtifactVersion,
    candidateCanonicalizationArtifactVersion:
      upstream.canonicalization.metadata.policyArtifactVersion,
    reviewWorkflowStateArtifactVersion: upstream.workflow.metadata.workflowArtifactVersion,
    reviewAuthorityArtifactVersion: upstream.authority.metadata.authorityArtifactVersion,
    diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
    wave4ClosureDocument: "docs/wave-4/closure-gate.md",
    sourceContract: "docs/wave-5/diagnostic-review-activation-prerequisites-contract.md",
    productionUseAllowed: false,
    runtimeUseAllowed: false,
    storageAllowed: false,
  };
}

function expectedDependencies(upstream) {
  const { coverage, evidence, rubric, registry, canonicalization, workflow, authority } = upstream;
  return {
    reviewCoverage: {
      artifactVersion: coverage.metadata.coverageArtifactVersion,
      blueprintSlotCount: coverage.aggregate.blueprintSlotCount,
      draftOnlySlotCount: coverage.aggregate.statusCounts.DRAFT_ONLY,
      gapConfirmedSlotCount: coverage.aggregate.statusCounts.GAP_CONFIRMED,
      productionApprovedSlotCount: coverage.aggregate.statusCounts.PRODUCTION_APPROVED,
    },
    reviewEvidence: {
      artifactVersion: evidence.metadata.evidenceArtifactVersion,
      gatePlaceholderCount: evidence.aggregate.gatePlaceholderCount,
      evidenceRecordCount: evidence.aggregate.evidenceRecordCount,
      approvedDecisionCount: evidence.aggregate.approvedDecisionCount,
      productionApprovalCount: evidence.aggregate.productionApprovalCount,
    },
    reviewGateRubric: {
      artifactVersion: rubric.metadata.rubricArtifactVersion,
      gateCount: rubric.aggregate.gateCount,
      criterionCount: rubric.aggregate.criterionCount,
      recordedDecisionCount: rubric.aggregate.recordedDecisionCount,
      recordedEvidenceCount: rubric.aggregate.recordedEvidenceCount,
      productionApprovalCount: rubric.aggregate.productionApprovalCount,
    },
    candidateDigestRegistry: {
      artifactVersion: registry.metadata.registryArtifactVersion,
      candidatePlaceholderCount: registry.aggregate.candidatePlaceholderCount,
      assignedCandidateIdentityCount: registry.aggregate.assignedCandidateIdentityCount,
      digestValueCount: registry.aggregate.digestValueCount,
      reviewEvidenceRecordCount: registry.aggregate.reviewEvidenceRecordCount,
      reviewDecisionCount: registry.aggregate.reviewDecisionCount,
      productionApprovedCandidateCount: registry.aggregate.productionApprovedCandidateCount,
    },
    candidateCanonicalization: {
      artifactVersion: canonicalization.metadata.policyArtifactVersion,
      policyVersion: canonicalization.policyIdentity.policyVersion,
      policyState: canonicalization.policyIdentity.status,
      activeRuleCount: canonicalization.aggregate.activeRuleCount,
      transformedCandidateRecordCount: canonicalization.aggregate.transformedCandidateRecordCount,
      digestValueCount: canonicalization.aggregate.digestValueCount,
      reviewDecisionCount: canonicalization.aggregate.reviewDecisionCount,
      productionApprovedCandidateCount: canonicalization.aggregate.productionApprovedCandidateCount,
    },
    reviewWorkflowState: {
      artifactVersion: workflow.metadata.workflowArtifactVersion,
      workflowVersion: workflow.workflowPolicy.workflowVersion,
      policyState: workflow.workflowPolicy.policyState,
      workflowEntryCount: workflow.aggregate.workflowEntryCount,
      submittedCandidateCount: workflow.aggregate.submittedCandidateCount,
      activeReviewCount: workflow.aggregate.activeReviewCount,
      reviewEvidenceRecordCount: workflow.aggregate.reviewEvidenceRecordCount,
      approvedDecisionCount: workflow.aggregate.approvedDecisionCount,
      productionApprovalCount: workflow.aggregate.productionApprovalCount,
      reviewerIdentityCount: workflow.aggregate.reviewerIdentityCount,
      auditIdentityCount: workflow.aggregate.auditIdentityCount,
    },
    reviewAuthority: {
      artifactVersion: authority.metadata.authorityArtifactVersion,
      policyVersion: authority.authorityPolicy.policyVersion,
      policyState: authority.authorityPolicy.policyState,
      rolePlaceholderCount: authority.aggregate.rolePlaceholderCount,
      gateAuthorityPlaceholderCount: authority.aggregate.gateAuthorityPlaceholderCount,
      separationOfDutiesRuleCount: authority.aggregate.separationOfDutiesRuleCount,
      realReviewerRoleCount: authority.aggregate.realReviewerRoleCount,
      reviewerAssignmentCount: authority.aggregate.reviewerAssignmentCount,
      reviewerIdentityCount: authority.aggregate.reviewerIdentityCount,
      auditIdentityCount: authority.aggregate.auditIdentityCount,
      conflictRecordCount: authority.aggregate.conflictRecordCount,
      reviewDecisionCount: authority.aggregate.reviewDecisionCount,
      approvedDecisionCount: authority.aggregate.approvedDecisionCount,
      productionApprovalCount: authority.aggregate.productionApprovalCount,
    },
  };
}

function validatePrerequisites(prerequisites) {
  if (!Array.isArray(prerequisites) || prerequisites.length !== expectedPrerequisites.size) {
    fail(`prerequisites must contain exactly ${expectedPrerequisites.size} entries.`);
  }
  const actualIds = new Set();
  for (let index = 0; index < prerequisites.length; index += 1) {
    const prerequisite = prerequisites[index];
    const fieldPath = `prerequisites[${index}]`;
    if (!isPlainObject(prerequisite)) {
      fail(`${fieldPath} must be an object.`);
    }
    requireString(prerequisite.prerequisiteId, `${fieldPath}.prerequisiteId`);
    if (!expectedPrerequisites.has(prerequisite.prerequisiteId)) {
      fail(`${fieldPath}.prerequisiteId is unknown: ${prerequisite.prerequisiteId}.`);
    }
    if (actualIds.has(prerequisite.prerequisiteId)) {
      fail(`${fieldPath}.prerequisiteId is duplicated: ${prerequisite.prerequisiteId}.`);
    }
    actualIds.add(prerequisite.prerequisiteId);
    requireExactValue(
      prerequisite,
      {
        prerequisiteId: prerequisite.prerequisiteId,
        status: "UNSATISFIED_DEFERRED",
        ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
        evidenceRequirementDescription: expectedPrerequisites.get(prerequisite.prerequisiteId),
        evidenceRecordRefs: [],
      },
      fieldPath,
    );
  }
  for (const expectedId of expectedPrerequisites.keys()) {
    if (!actualIds.has(expectedId)) {
      fail(`prerequisites is missing ${expectedId}.`);
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
    readiness.policyVersion !== upstream.coverage.readiness.policyVersion ||
    readiness.policyVersion !== upstream.authority.readiness.policyVersion
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

function validateEmptyRecordsAndAggregate(artifact, prerequisiteCount) {
  const recordFields = [
    "realCandidateRecords",
    "digestValueRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "reviewerAssignmentRecords",
    "ownerAssignmentRecords",
    "productionApprovalRecords",
  ];
  for (const field of recordFields) {
    if (!Array.isArray(artifact[field]) || artifact[field].length !== 0) {
      fail(`${field} must remain empty in Slice 2.`);
    }
  }
  requireExactValue(
    artifact.recordBoundary,
    {
      realCandidatesRecorded: false,
      digestValuesRecorded: false,
      reviewEvidenceRecorded: false,
      reviewDecisionsRecorded: false,
      reviewerIdentitiesRecorded: false,
      auditIdentitiesRecorded: false,
      reviewerAssignmentsRecorded: false,
      ownerAssignmentsRecorded: false,
      productionApprovalsRecorded: false,
      activationRecorded: false,
      reviewWorkflowActivated: false,
      runtimeWorkflowEnabled: false,
    },
    "recordBoundary",
  );
  requireExactValue(
    artifact.aggregate,
    {
      prerequisiteCount,
      unsatisfiedPrerequisiteCount: prerequisiteCount,
      satisfiedPrerequisiteCount: 0,
      realCandidateCount: artifact.realCandidateRecords.length,
      digestValueCount: artifact.digestValueRecords.length,
      reviewEvidenceRecordCount: artifact.reviewEvidenceRecords.length,
      reviewDecisionCount: artifact.reviewDecisionRecords.length,
      reviewerIdentityCount: artifact.reviewerIdentityRecords.length,
      auditIdentityCount: artifact.auditIdentityRecords.length,
      reviewerAssignmentCount: artifact.reviewerAssignmentRecords.length,
      ownerAssignmentCount: artifact.ownerAssignmentRecords.length,
      productionApprovalCount: artifact.productionApprovalRecords.length,
    },
    "aggregate",
  );
}

export function validateDiagnosticReviewActivationPrerequisites(
  artifact,
  coverage,
  evidence,
  rubric,
  registry,
  canonicalization,
  workflow,
  authority,
) {
  if (!isPlainObject(artifact)) {
    fail("Diagnostic review activation prerequisites artifact must be a JSON object.");
  }
  const upstream = { coverage, evidence, rubric, registry, canonicalization, workflow, authority };
  validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  const topLevelFields = new Set([
    "metadata",
    "activationBoundary",
    "dependencyReferences",
    "prerequisites",
    "recordBoundary",
    "readiness",
    "aggregate",
    "realCandidateRecords",
    "digestValueRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "reviewerAssignmentRecords",
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
    expectedDependencies(upstream),
    "dependencyReferences",
  );
  const prerequisiteCount = validatePrerequisites(artifact.prerequisites);
  validateReadiness(artifact.readiness, upstream);
  validateEmptyRecordsAndAggregate(artifact, prerequisiteCount);

  return {
    activationPrerequisitesArtifactVersion:
      artifact.metadata.activationPrerequisitesArtifactVersion,
    prerequisiteCount,
    unsatisfiedPrerequisiteCount: artifact.aggregate.unsatisfiedPrerequisiteCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    readiness: artifact.readiness.status,
    blockingReasons: [...artifact.readiness.blockingReasons],
  };
}

export async function readDiagnosticReviewActivationPrerequisites(
  artifactPath = defaultActivationPrerequisitesPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateActivationPrerequisitesChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice2ChangedPaths.has(changedPath) &&
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
      !wave5ClosureScopeUnblockPaths.has(changedPath) &&
      !wave6Slice1ScopeUnblockPaths.has(changedPath) &&
      !wave6Slice2ScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 5 Slice 2 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateActivationPrerequisitesWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateActivationPrerequisitesChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [artifact, coverage, evidence, rubric, registry, canonicalization, workflow, authority] =
    await Promise.all([
      readDiagnosticReviewActivationPrerequisites(),
      readDiagnosticReviewCoverage(),
      readDiagnosticReviewEvidence(),
      readDiagnosticReviewGateRubric(),
      readDiagnosticCandidateDigestRegistry(),
      readDiagnosticCandidateCanonicalization(),
      readDiagnosticReviewWorkflowState(),
      readDiagnosticReviewAuthority(),
    ]);
  const summary = validateDiagnosticReviewActivationPrerequisites(
    artifact,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    authority,
  );
  if (checkWorktreeScope) {
    validateActivationPrerequisitesWorktreeScope();
  }
  console.log(
    `[curriculum] Review activation prerequisites ${summary.activationPrerequisitesArtifactVersion} validated: ${summary.prerequisiteCount} prerequisites, ${summary.unsatisfiedPrerequisiteCount} unsatisfied, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, ${summary.productionApprovalCount} production approvals, readiness ${summary.readiness}.`,
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
