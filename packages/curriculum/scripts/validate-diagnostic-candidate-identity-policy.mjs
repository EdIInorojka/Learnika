import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "./validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateDigestRegistry } from "./validate-diagnostic-candidate-digest.mjs";
import {
  readDiagnosticReviewActivationPrerequisites,
  validateDiagnosticReviewActivationPrerequisites,
} from "./validate-diagnostic-review-activation-prerequisites.mjs";
import { readDiagnosticReviewAuthority } from "./validate-diagnostic-review-authority.mjs";
import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "./validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "./validate-diagnostic-review-gate-rubric.mjs";
import { readDiagnosticReviewWorkflowState } from "./validate-diagnostic-review-workflow-state.mjs";

const expectedArtifactVersion = "wave-5.slice-3.grade-7-9-math.v1";
const expectedPolicyVersion = "wave-5.slice-3.diagnostic-candidate-identity.placeholder.v1";
const expectedActivationArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedDigestRegistryVersion = "wave-4.slice-5.grade-7-9-math.v1";
const expectedCoverageVersion = "wave-4.slice-2.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const requiredBlockingReasons = new Set(["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"]);
const expectedDecisionRequirementIds = new Set([
  "namespace_and_allocation_ownership",
  "identity_format_and_validation_grammar",
  "uniqueness_reservation_collision_and_non_reuse",
  "version_and_revision_semantics",
  "candidate_artifact_blueprint_and_skill_linkage",
  "new_version_and_invalidation_triggers",
  "retirement_and_tombstone_semantics",
  "identifier_data_exclusions",
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
const approvedSlice3ChangedPaths = new Set([
  "docs/wave-5/diagnostic-candidate-identity-policy-contract.md",
  "docs/wave-5/slice-3-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-candidate-identity-policy/grade-7-9-math.candidate-identity-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
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
  "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
  "docs/wave-6/slice-7-implementation-note.md",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
  "apps/api/test/mock-ocr-candidate-api.e2e.mjs",
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

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultCandidateIdentityPolicyPath = path.resolve(
  scriptDir,
  "../diagnostic-candidate-identity-policy/grade-7-9-math.candidate-identity-policy-placeholder.v1.json",
);

export class DiagnosticCandidateIdentityPolicyValidationError extends Error {}

function fail(message) {
  throw new DiagnosticCandidateIdentityPolicyValidationError(message);
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
      fail(`${fieldPath} contains a hash-like value, which is forbidden in Slice 3.`);
    }
    if (/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(value)) {
      fail(`${fieldPath} contains an email-like value, which is forbidden in Slice 3.`);
    }
    if (/^dcandidate\.[a-z0-9.-]+\.v[1-9][0-9]*$/i.test(value)) {
      fail(`${fieldPath} contains a concrete candidate ID, which is forbidden in Slice 3.`);
    }
  }
}

function validateUpstreamArtifacts(upstream) {
  const activationSummary = validateDiagnosticReviewActivationPrerequisites(
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
    activationSummary.activationPrerequisitesArtifactVersion !==
      expectedActivationArtifactVersion ||
    activationSummary.activationStatus !== "BLOCKED" ||
    activationSummary.reviewWorkflowStatus !== "INACTIVE" ||
    activationSummary.readiness !== "NOT_READY" ||
    upstream.registry.metadata.registryArtifactVersion !== expectedDigestRegistryVersion ||
    upstream.coverage.metadata.coverageArtifactVersion !== expectedCoverageVersion
  ) {
    fail("Upstream artifacts must remain pinned to the blocked Slice 2 and Wave 4 baseline.");
  }
  const candidatePrerequisite = upstream.activationPrerequisites.prerequisites.find(
    ({ prerequisiteId }) => prerequisiteId === "candidate_identity_policy",
  );
  if (
    !candidatePrerequisite ||
    candidatePrerequisite.status !== "UNSATISFIED_DEFERRED" ||
    candidatePrerequisite.ownerPlaceholderId !== "UNASSIGNED_OWNER_PLACEHOLDER" ||
    candidatePrerequisite.evidenceRecordRefs.length !== 0
  ) {
    fail("candidate_identity_policy must remain the exact unsatisfied Slice 2 prerequisite.");
  }
  return { activationSummary, candidatePrerequisite };
}

function expectedMetadata(upstream) {
  return {
    schemaVersion: "learnika.diagnosticCandidateIdentityPolicyPlaceholder.v1",
    policyArtifactVersion: expectedArtifactVersion,
    status: "placeholder_only_unsatisfied_non_production",
    artifactKind: "diagnostic_candidate_identity_policy_placeholder",
    subject: "math",
    locale: "ru-RU",
    audienceGrades: [7, 8, 9],
    activationPrerequisitesArtifactVersion:
      upstream.activationPrerequisites.metadata.activationPrerequisitesArtifactVersion,
    candidateDigestRegistryArtifactVersion: upstream.registry.metadata.registryArtifactVersion,
    reviewCoverageArtifactVersion: upstream.coverage.metadata.coverageArtifactVersion,
    diagnosticBlueprintVersion: upstream.coverage.metadata.diagnosticBlueprintVersion,
    diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
    sourceContract: "docs/wave-5/diagnostic-candidate-identity-policy-contract.md",
    productionUseAllowed: false,
    runtimeUseAllowed: false,
    storageAllowed: false,
  };
}

function expectedDependencies(upstream, candidatePrerequisite) {
  const { activationPrerequisites, registry, coverage } = upstream;
  return {
    activationPrerequisites: {
      artifactVersion: activationPrerequisites.metadata.activationPrerequisitesArtifactVersion,
      artifactStatus: activationPrerequisites.metadata.status,
      prerequisiteId: candidatePrerequisite.prerequisiteId,
      prerequisiteStatus: candidatePrerequisite.status,
      activationStatus: activationPrerequisites.activationBoundary.status,
      reviewWorkflowStatus: activationPrerequisites.activationBoundary.reviewWorkflowStatus,
      prerequisiteCount: activationPrerequisites.aggregate.prerequisiteCount,
      unsatisfiedPrerequisiteCount: activationPrerequisites.aggregate.unsatisfiedPrerequisiteCount,
      productionApprovalCount: activationPrerequisites.aggregate.productionApprovalCount,
    },
    candidateDigestRegistry: {
      artifactVersion: registry.metadata.registryArtifactVersion,
      candidateIdentityFormatPolicyVersion: registry.policies.candidateIdentityFormat.policyVersion,
      candidateIdentityFormatState: registry.policies.candidateIdentityFormat.state,
      candidatePlaceholderCount: registry.aggregate.candidatePlaceholderCount,
      assignedCandidateIdentityCount: registry.aggregate.assignedCandidateIdentityCount,
      digestValueCount: registry.aggregate.digestValueCount,
      productionApprovedCandidateCount: registry.aggregate.productionApprovedCandidateCount,
    },
    reviewCoverage: {
      artifactVersion: coverage.metadata.coverageArtifactVersion,
      blueprintVersion: coverage.metadata.diagnosticBlueprintVersion,
      coverageSlotIds: coverage.slots.map(({ blueprintSlotId }) => blueprintSlotId),
      blueprintSlotCount: coverage.aggregate.blueprintSlotCount,
      draftOnlySlotCount: coverage.aggregate.statusCounts.DRAFT_ONLY,
      gapConfirmedSlotCount: coverage.aggregate.statusCounts.GAP_CONFIRMED,
      productionApprovedSlotCount: coverage.aggregate.statusCounts.PRODUCTION_APPROVED,
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
    readiness.policyVersion !== upstream.coverage.readiness.policyVersion
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

function validateEmptyRecordsAndAggregate(artifact, requirementCount, coverageSlotCount) {
  const recordFields = [
    "policyDecisionRecords",
    "candidateIdentityRecords",
    "identityReservationRecords",
    "identityAllocationRecords",
    "candidateSubmissionRecords",
    "candidateApprovalRecords",
    "digestValueRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "ownerAssignmentRecords",
    "withdrawalRecords",
    "supersessionRecords",
    "productionApprovalRecords",
  ];
  for (const field of recordFields) {
    if (!Array.isArray(artifact[field]) || artifact[field].length !== 0) {
      fail(`${field} must remain empty in Slice 3.`);
    }
  }
  requireExactValue(
    artifact.recordBoundary,
    {
      policyDecisionsRecorded: false,
      candidateIdentitiesAssigned: false,
      identityReservationsRecorded: false,
      identityAllocationsRecorded: false,
      candidateSubmissionsRecorded: false,
      candidateApprovalsRecorded: false,
      digestValuesRecorded: false,
      reviewEvidenceRecorded: false,
      reviewDecisionsRecorded: false,
      ownerAssignmentsRecorded: false,
      withdrawalsRecorded: false,
      supersessionsRecorded: false,
      productionApprovalsRecorded: false,
      runtimeIdentityEnabled: false,
    },
    "recordBoundary",
  );
  requireExactValue(
    artifact.aggregate,
    {
      decisionRequirementCount: requirementCount,
      undecidedRequirementCount: requirementCount,
      activeRuleCount: 0,
      coverageSlotReferenceCount: coverageSlotCount,
      policyDecisionCount: artifact.policyDecisionRecords.length,
      realCandidateIdCount: artifact.candidateIdentityRecords.length,
      identityReservationCount: artifact.identityReservationRecords.length,
      identityAllocationCount: artifact.identityAllocationRecords.length,
      submittedCandidateCount: artifact.candidateSubmissionRecords.length,
      approvedCandidateCount: artifact.candidateApprovalRecords.length,
      digestValueCount: artifact.digestValueRecords.length,
      reviewEvidenceRecordCount: artifact.reviewEvidenceRecords.length,
      reviewDecisionCount: artifact.reviewDecisionRecords.length,
      ownerAssignmentCount: artifact.ownerAssignmentRecords.length,
      withdrawalRecordCount: artifact.withdrawalRecords.length,
      supersessionRecordCount: artifact.supersessionRecords.length,
      productionApprovalCount: artifact.productionApprovalRecords.length,
    },
    "aggregate",
  );
}

export function validateDiagnosticCandidateIdentityPolicy(
  artifact,
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
    fail("Diagnostic candidate identity policy placeholder must be a JSON object.");
  }
  const upstream = {
    activationPrerequisites,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    authority,
  };
  const { candidatePrerequisite } = validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  const topLevelFields = new Set([
    "metadata",
    "activationBoundary",
    "dependencyReferences",
    "prerequisiteReference",
    "policyIdentity",
    "candidateIdPatternPlaceholder",
    "namespaceOwnershipPlaceholder",
    "collisionPreventionPlaceholder",
    "versioningPolicyPlaceholder",
    "withdrawalSupersessionPlaceholder",
    "decisionRequirements",
    "recordBoundary",
    "readiness",
    "aggregate",
    "policyDecisionRecords",
    "candidateIdentityRecords",
    "identityReservationRecords",
    "identityAllocationRecords",
    "candidateSubmissionRecords",
    "candidateApprovalRecords",
    "digestValueRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "ownerAssignmentRecords",
    "withdrawalRecords",
    "supersessionRecords",
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
    expectedDependencies(upstream, candidatePrerequisite),
    "dependencyReferences",
  );
  requireExactValue(artifact.prerequisiteReference, candidatePrerequisite, "prerequisiteReference");
  requireExactValue(
    artifact.policyIdentity,
    {
      policyId: "diagnostic-candidate-identity",
      policyVersion: expectedPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      activeRulesetVersion: null,
      policyApprovalAllowed: false,
      candidateIdentityAssignmentAllowed: false,
      candidateSubmissionAllowed: false,
      productionApprovalAllowed: false,
    },
    "policyIdentity",
  );
  requireExactValue(
    artifact.candidateIdPatternPlaceholder,
    {
      state: "REFERENCE_ONLY_NOT_APPROVED",
      sourcePolicyVersion: upstream.registry.policies.candidateIdentityFormat.policyVersion,
      sourcePolicyState: upstream.registry.policies.candidateIdentityFormat.state,
      patternTemplate: upstream.registry.policies.candidateIdentityFormat.formatTemplate,
      activePatternVersion: null,
      patternApproved: false,
      instantiationAllowed: false,
      validationAllowed: false,
    },
    "candidateIdPatternPlaceholder",
  );
  requireExactValue(
    artifact.namespaceOwnershipPlaceholder,
    {
      requirementId: "namespace_and_allocation_ownership",
      state: "TO_BE_DECIDED",
      ownerPlaceholderId: "UNASSIGNED_NAMESPACE_OWNER_PLACEHOLDER",
      ownerReference: null,
      assignmentReference: null,
      allocationAuthorityAllowed: false,
    },
    "namespaceOwnershipPlaceholder",
  );
  requireExactValue(
    artifact.collisionPreventionPlaceholder,
    {
      requirementId: "uniqueness_reservation_collision_and_non_reuse",
      state: "TO_BE_DECIDED",
      reservationPolicyReference: null,
      collisionPreventionPolicyReference: null,
      nonReusePolicyReference: null,
      enforcementAllowed: false,
    },
    "collisionPreventionPlaceholder",
  );
  requireExactValue(
    artifact.versioningPolicyPlaceholder,
    {
      requirementId: "version_and_revision_semantics",
      state: "TO_BE_DECIDED",
      versioningPolicyReference: null,
      revisionRulesReference: null,
      invalidationRulesReference: null,
      enforcementAllowed: false,
    },
    "versioningPolicyPlaceholder",
  );
  requireExactValue(
    artifact.withdrawalSupersessionPlaceholder,
    {
      requirementId: "retirement_and_tombstone_semantics",
      state: "TO_BE_DECIDED",
      withdrawalReferenceFormat: null,
      supersessionReferenceFormat: null,
      withdrawalPolicyReference: null,
      supersessionPolicyReference: null,
      recordingAllowed: false,
    },
    "withdrawalSupersessionPlaceholder",
  );
  const requirementCount = validateDecisionRequirements(artifact.decisionRequirements);
  validateReadiness(artifact.readiness, upstream);
  const coverageSlotCount = artifact.dependencyReferences.reviewCoverage.coverageSlotIds.length;
  validateEmptyRecordsAndAggregate(artifact, requirementCount, coverageSlotCount);

  return {
    policyArtifactVersion: artifact.metadata.policyArtifactVersion,
    policyVersion: artifact.policyIdentity.policyVersion,
    policyState: artifact.policyIdentity.policyState,
    prerequisiteStatus: artifact.prerequisiteReference.status,
    decisionRequirementCount: requirementCount,
    coverageSlotReferenceCount: coverageSlotCount,
    realCandidateIdCount: artifact.aggregate.realCandidateIdCount,
    submittedCandidateCount: artifact.aggregate.submittedCandidateCount,
    approvedCandidateCount: artifact.aggregate.approvedCandidateCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticCandidateIdentityPolicy(
  artifactPath = defaultCandidateIdentityPolicyPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateCandidateIdentityPolicyChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice3ChangedPaths.has(changedPath) &&
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
      fail(`Wave 5 Slice 3 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateCandidateIdentityPolicyWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateCandidateIdentityPolicyChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [
    artifact,
    activationPrerequisites,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    authority,
  ] = await Promise.all([
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
  const summary = validateDiagnosticCandidateIdentityPolicy(
    artifact,
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
    validateCandidateIdentityPolicyWorktreeScope();
  }
  console.log(
    `[curriculum] Candidate identity policy ${summary.policyArtifactVersion} validated: ${summary.decisionRequirementCount} undecided requirements, ${summary.coverageSlotReferenceCount} coverage slot references, ${summary.realCandidateIdCount} real candidate IDs, ${summary.submittedCandidateCount} submitted candidates, ${summary.approvedCandidateCount} approved candidates, ${summary.productionApprovalCount} production approvals; policy ${summary.policyState}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, readiness ${summary.readiness}.`,
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
