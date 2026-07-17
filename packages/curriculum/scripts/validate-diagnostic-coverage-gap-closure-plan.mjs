import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  readDiagnosticProductionApprovalAuthorityPolicy,
  readDiagnosticProductionApprovalAuthorityPolicyUpstreamArtifacts,
  validateDiagnosticProductionApprovalAuthorityPolicy,
} from "./validate-diagnostic-production-approval-authority-policy.mjs";

const expectedArtifactVersion = "wave-5.slice-11.grade-7-9-math.v1";
const expectedPlanVersion = "wave-5.slice-11.diagnostic-coverage-gap-closure-plan.placeholder.v1";
const expectedCoverageArtifactVersion = "wave-4.slice-2.grade-7-9-math.v1";
const expectedActivationArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedProductionAuthorityArtifactVersion = "wave-5.slice-10.grade-7-9-math.v1";
const expectedProductionAuthorityPolicyVersion =
  "wave-5.slice-10.diagnostic-production-approval-authority.placeholder.v1";
const expectedEvidenceArtifactVersion = "wave-5.slice-9.grade-7-9-math.v1";
const expectedEvidencePolicyVersion =
  "wave-5.slice-9.diagnostic-evidence-storage-and-retention.placeholder.v1";
const expectedRubricArtifactVersion = "wave-4.slice-4.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const expectedSubstantiveGateIds = [
  "methodology",
  "safety_no_answer",
  "rights_copyright",
  "grade_placement",
  "accessibility_readability",
];
const expectedDecisionRequirementIds = [
  "coverage_threshold_and_balance",
  "per_gap_authoring_sequence",
  "draft_fixture_disposition",
  "rights_safe_candidate_authoring",
  "review_evidence_requirements",
  "substantive_gate_review_requirements",
  "production_approval_requirements",
  "no_silent_waiver_and_closure_validation",
  "coverage_reconciliation_and_invalidation",
  "partial_failure_rollback_and_recovery",
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
const protectedRecordFields = [
  "realDiagnosticItemRecords",
  "realCandidateRecords",
  "candidateIdentityRecords",
  "canonicalizationOutputRecords",
  "digestValueRecords",
  "reviewEvidenceRecords",
  "evidenceFileRecords",
  "storageObjectRecords",
  "gateCompletionRecords",
  "gateDecisionRecords",
  "reviewDecisionRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "productionApproverRecords",
  "authorityGrantRecords",
  "approvalDecisionRecords",
  "productionApprovalRecords",
  "coverageClosureRecords",
  "coverageWaiverRecords",
  "auditLogRecords",
  "auditEventRecords",
];
const recordBoundaryFields = [
  "realDiagnosticItemsRecorded",
  "realCandidatesRecorded",
  "candidateIdentitiesRecorded",
  "canonicalizationOutputsRecorded",
  "digestValuesRecorded",
  "reviewEvidenceRecorded",
  "evidenceFilesRecorded",
  "storageObjectsRecorded",
  "gateCompletionsRecorded",
  "gateDecisionsRecorded",
  "reviewDecisionsRecorded",
  "reviewerIdentitiesRecorded",
  "auditIdentitiesRecorded",
  "reviewerAssignmentsRecorded",
  "productionApproversRecorded",
  "authorityGrantsRecorded",
  "approvalDecisionsRecorded",
  "productionApprovalsRecorded",
  "coverageClosuresRecorded",
  "coverageWaiversRecorded",
  "auditLogsRecorded",
  "auditEventsRecorded",
  "runtimeCoverageEnabled",
  "runtimeAuthoringEnabled",
  "runtimeReviewEnabled",
];
const zeroAggregateFields = [
  "closedGapCount",
  "advancedDraftOnlySlotCount",
  "productionApprovedSlotCount",
  "activePlanRuleCount",
  "realDiagnosticItemCount",
  "realCandidateCount",
  "candidateIdentityCount",
  "canonicalizationOutputCount",
  "digestValueCount",
  "reviewEvidenceRecordCount",
  "evidenceFileCount",
  "storageObjectCount",
  "gateCompletionCount",
  "gateDecisionCount",
  "reviewDecisionCount",
  "reviewerIdentityCount",
  "auditIdentityCount",
  "reviewerAssignmentCount",
  "productionApproverCount",
  "authorityGrantCount",
  "approvalDecisionCount",
  "productionApprovalCount",
  "coverageClosureRecordCount",
  "coverageWaiverRecordCount",
  "auditLogCount",
  "auditEventCount",
];
const approvedSlice13ChangedPaths = new Set([
  "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
  "docs/wave-5/slice-13-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy/grade-7-9-math.rollback-withdrawal-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-coverage-gap-closure-plan.test.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy.test.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
]);
const wave5Slice14ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-ci-validation-activation-gate-contract.md",
  "docs/wave-5/slice-14-implementation-note.md",
  "packages/curriculum/diagnostic-ci-validation-activation-gate/grade-7-9-math.ci-validation-activation-gate-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate.test.mjs",
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultCoverageGapClosurePlanPath = path.resolve(
  scriptDir,
  "../diagnostic-coverage-gap-closure-plan/grade-7-9-math.coverage-gap-closure-plan-placeholder.v1.json",
);

export class DiagnosticCoverageGapClosurePlanValidationError extends Error {}

function fail(message) {
  throw new DiagnosticCoverageGapClosurePlanValidationError(message);
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
  if (typeof value !== "string") {
    return;
  }
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
    [/\bcandidate[-_:][a-z0-9]{6,}\b/i, "candidate-id-like value"],
    [/\b[0-9a-f]{32,}\b/i, "hash-like value"],
  ];
  for (const [pattern, label] of privatePatterns) {
    if (pattern.test(value)) {
      fail(`${fieldPath} contains a ${label}.`);
    }
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

function findCoverageGapClosurePrerequisite(activationPrerequisites) {
  const matches = activationPrerequisites.prerequisites.filter(
    (item) => item.prerequisiteId === "coverage_gap_closure_plan",
  );
  if (matches.length !== 1) {
    fail("Activation prerequisites must contain exactly one coverage_gap_closure_plan row.");
  }
  const expected = {
    prerequisiteId: "coverage_gap_closure_plan",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future per-slot rights-safe authoring and fixture-disposition plan with explicit coverage thresholds and no-silent-waiver checks.",
    evidenceRecordRefs: [],
  };
  requireExactValue(matches[0], expected, "activationPrerequisites.coverage_gap_closure_plan");
  return matches[0];
}

function validateUpstreamArtifacts(upstream) {
  if (!isPlainObject(upstream) || !isPlainObject(upstream.productionUpstream)) {
    fail("Upstream artifacts must include the production authority dependency chain.");
  }
  const productionSummary = validateDiagnosticProductionApprovalAuthorityPolicy(
    upstream.productionPolicy,
    upstream.productionUpstream,
  );
  requireExactValue(
    productionSummary,
    {
      policyArtifactVersion: expectedProductionAuthorityArtifactVersion,
      policyVersion: expectedProductionAuthorityPolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      productionApproverRolePlaceholderCount: 1,
      requiredSubstantiveGatePlaceholderCount: 5,
      decisionRequirementCount: 12,
      activeApprovalRuleCount: 0,
      productionApproverCount: 0,
      authorityGrantCount: 0,
      approvalDecisionCount: 0,
      productionApprovalCount: 0,
      approvedCandidateCount: 0,
      reviewerIdentityCount: 0,
      auditIdentityCount: 0,
      reviewEvidenceRecordCount: 0,
      digestValueCount: 0,
      activationStatus: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      readiness: "NOT_READY",
      upstreamProductionApprovalCount: 0,
    },
    "productionAuthoritySummary",
  );
  const chain = upstream.productionUpstream.evidenceUpstream.auditUpstream;
  const coverage = chain.coverage;
  const activation = chain.activationPrerequisites;
  const evidence = upstream.productionUpstream.evidencePolicy;
  const rubric = chain.rubric;
  requireExactValue(
    {
      artifactVersion: coverage.metadata.coverageArtifactVersion,
      artifactStatus: coverage.metadata.status,
      blueprintSlotCount: coverage.aggregate.blueprintSlotCount,
      statusCounts: coverage.aggregate.statusCounts,
      slotCount: coverage.slots.length,
    },
    {
      artifactVersion: expectedCoverageArtifactVersion,
      artifactStatus: "draft_non_production_review_coverage",
      blueprintSlotCount: 11,
      statusCounts: { DRAFT_ONLY: 5, GAP_CONFIRMED: 6, PRODUCTION_APPROVED: 0 },
      slotCount: 11,
    },
    "reviewCoverageSummary",
  );
  requireExactValue(
    {
      artifactVersion: evidence.metadata.policyArtifactVersion,
      policyVersion: evidence.policyIdentity.policyVersion,
      policyState: evidence.policyIdentity.policyState,
      prerequisiteStatus: evidence.prerequisiteReference.status,
      reviewEvidenceRecordCount: evidence.aggregate.reviewEvidenceRecordCount,
      evidenceFileCount: evidence.aggregate.evidenceFileCount,
      storageObjectCount: evidence.aggregate.storageObjectCount,
      productionApprovalCount: evidence.aggregate.productionApprovalCount,
    },
    {
      artifactVersion: expectedEvidenceArtifactVersion,
      policyVersion: expectedEvidencePolicyVersion,
      policyState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      reviewEvidenceRecordCount: 0,
      evidenceFileCount: 0,
      storageObjectCount: 0,
      productionApprovalCount: 0,
    },
    "evidencePolicySummary",
  );
  requireExactValue(
    {
      artifactVersion: rubric.metadata.rubricArtifactVersion,
      artifactStatus: rubric.metadata.status,
      gateCount: rubric.aggregate.gateCount,
      criterionCount: rubric.aggregate.criterionCount,
      recordedDecisionCount: rubric.aggregate.recordedDecisionCount,
      recordedEvidenceCount: rubric.aggregate.recordedEvidenceCount,
      productionApprovalCount: rubric.aggregate.productionApprovalCount,
    },
    {
      artifactVersion: expectedRubricArtifactVersion,
      artifactStatus: "rubric_definition_non_decision",
      gateCount: 6,
      criterionCount: 23,
      recordedDecisionCount: 0,
      recordedEvidenceCount: 0,
      productionApprovalCount: 0,
    },
    "reviewGateRubricSummary",
  );
  return {
    activation,
    coverage,
    evidence,
    productionSummary,
    prerequisite: findCoverageGapClosurePrerequisite(activation),
    rubric,
  };
}

function expectedSlotPlanEntry(slot) {
  return {
    blueprintSlotId: slot.blueprintSlotId,
    baselineCoverageStatus: slot.coverageStatus,
    planEntryKind:
      slot.coverageStatus === "GAP_CONFIRMED"
        ? "GAP_CLOSURE_PLACEHOLDER"
        : "DRAFT_ONLY_DISPOSITION_PLACEHOLDER",
    planEntryState: "UNRESOLVED_DEFERRED",
    authoringRequirementState: "TO_BE_DECIDED",
    reviewEvidenceRequirementState: "TO_BE_DECIDED",
    gateReviewRequirementState: "TO_BE_DECIDED",
    productionApprovalRequirementState: "TO_BE_DECIDED",
    gapClosureRecorded: false,
    draftDispositionRecorded: false,
    slotAdvanceAllowed: false,
    productionCoverageAllowed: false,
  };
}

function expectedGapEntry(slot) {
  return {
    blueprintSlotId: slot.blueprintSlotId,
    baselineCoverageStatus: "GAP_CONFIRMED",
    gapState: "OPEN_UNRESOLVED",
    authoringRequirementState: "TO_BE_DECIDED",
    reviewRequirementState: "TO_BE_DECIDED",
    gapClosed: false,
    waiverRecorded: false,
    productionApproved: false,
  };
}

function expectedDraftOnlyEntry(slot) {
  return {
    blueprintSlotId: slot.blueprintSlotId,
    baselineCoverageStatus: "DRAFT_ONLY",
    draftState: "UNRESOLVED_NON_PRODUCTION",
    fixtureDispositionState: "TO_BE_DECIDED",
    reviewRequirementState: "TO_BE_DECIDED",
    draftAdvanced: false,
    fixtureProductionUseAllowed: false,
    productionApproved: false,
  };
}

function buildExpectedArtifact({ activation, coverage, evidence, prerequisite, rubric }) {
  const gapSlots = coverage.slots.filter((slot) => slot.coverageStatus === "GAP_CONFIRMED");
  const draftOnlySlots = coverage.slots.filter((slot) => slot.coverageStatus === "DRAFT_ONLY");
  const expected = {
    metadata: {
      schemaVersion: "learnika.diagnosticCoverageGapClosurePlanPlaceholder.v1",
      planArtifactVersion: expectedArtifactVersion,
      status: "placeholder_only_unsatisfied_non_production",
      artifactKind: "diagnostic_coverage_gap_closure_plan_placeholder",
      subject: "math",
      locale: "ru-RU",
      audienceGrades: [7, 8, 9],
      reviewCoverageArtifactVersion: expectedCoverageArtifactVersion,
      activationPrerequisitesArtifactVersion: expectedActivationArtifactVersion,
      productionApprovalAuthorityPolicyArtifactVersion: expectedProductionAuthorityArtifactVersion,
      evidenceStorageRetentionPolicyArtifactVersion: expectedEvidenceArtifactVersion,
      reviewGateRubricArtifactVersion: expectedRubricArtifactVersion,
      diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
      sourceContract: "docs/wave-5/diagnostic-coverage-gap-closure-plan-contract.md",
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
      coverageAdvanceAllowed: false,
      candidateAuthoringAllowed: false,
      reviewEvidenceRecordingAllowed: false,
      gateDecisionRecordingAllowed: false,
      productionApprovalAllowed: false,
    },
    dependencyReferences: {
      reviewCoverage: {
        artifactVersion: expectedCoverageArtifactVersion,
        artifactStatus: coverage.metadata.status,
        blueprintSlotCount: coverage.aggregate.blueprintSlotCount,
        draftOnlySlotCount: coverage.aggregate.statusCounts.DRAFT_ONLY,
        gapConfirmedSlotCount: coverage.aggregate.statusCounts.GAP_CONFIRMED,
        productionApprovedSlotCount: coverage.aggregate.statusCounts.PRODUCTION_APPROVED,
      },
      activationPrerequisites: {
        artifactVersion: expectedActivationArtifactVersion,
        artifactStatus: activation.metadata.status,
        prerequisiteId: prerequisite.prerequisiteId,
        prerequisiteStatus: prerequisite.status,
        activationStatus: activation.activationBoundary.status,
        reviewWorkflowStatus: activation.activationBoundary.reviewWorkflowStatus,
        prerequisiteCount: activation.aggregate.prerequisiteCount,
        unsatisfiedPrerequisiteCount: activation.aggregate.unsatisfiedPrerequisiteCount,
        productionApprovalCount: activation.aggregate.productionApprovalCount,
      },
      productionApprovalAuthorityPolicy: {
        artifactVersion: expectedProductionAuthorityArtifactVersion,
        policyVersion: expectedProductionAuthorityPolicyVersion,
        policyState: "UNRESOLVED_DEFERRED",
        prerequisiteStatus: "UNSATISFIED_DEFERRED",
        activeApprovalRuleCount: 0,
        productionApproverCount: 0,
        authorityGrantCount: 0,
        approvalDecisionCount: 0,
        productionApprovalCount: 0,
        approvedCandidateCount: 0,
      },
      evidenceStorageRetentionPolicy: {
        artifactVersion: expectedEvidenceArtifactVersion,
        policyVersion: expectedEvidencePolicyVersion,
        policyState: evidence.policyIdentity.policyState,
        prerequisiteStatus: evidence.prerequisiteReference.status,
        reviewEvidenceRecordCount: evidence.aggregate.reviewEvidenceRecordCount,
        evidenceFileCount: evidence.aggregate.evidenceFileCount,
        storageObjectCount: evidence.aggregate.storageObjectCount,
        productionApprovalCount: evidence.aggregate.productionApprovalCount,
      },
      reviewGateRubric: {
        artifactVersion: expectedRubricArtifactVersion,
        artifactStatus: rubric.metadata.status,
        gateCount: rubric.aggregate.gateCount,
        substantiveGateCount: 5,
        criterionCount: rubric.aggregate.criterionCount,
        recordedDecisionCount: rubric.aggregate.recordedDecisionCount,
        recordedEvidenceCount: rubric.aggregate.recordedEvidenceCount,
        productionApprovalCount: rubric.aggregate.productionApprovalCount,
      },
    },
    prerequisiteReference: { ...prerequisite, evidenceRecordRefs: [] },
    planIdentity: {
      planId: "diagnostic-coverage-gap-closure-plan",
      planVersion: expectedPlanVersion,
      planState: "UNRESOLVED_DEFERRED",
      activeRulesetVersion: null,
      planApprovalAllowed: false,
      planActivationAllowed: false,
      slotAdvanceAllowed: false,
      gapClosureAllowed: false,
      candidateAuthoringAllowed: false,
      reviewEvidenceRecordingAllowed: false,
      gateReviewRecordingAllowed: false,
      productionApprovalRecordingAllowed: false,
      productionCoverageAllowed: false,
    },
    coverageBaseline: {
      reviewCoverageArtifactVersion: expectedCoverageArtifactVersion,
      blueprintSlotCount: 11,
      statusCounts: { DRAFT_ONLY: 5, GAP_CONFIRMED: 6, PRODUCTION_APPROVED: 0 },
      baselineClosureRecorded: false,
      coverageAdvanceAllowed: false,
      productionCoverageAllowed: false,
    },
    slotPlanEntries: coverage.slots.map(expectedSlotPlanEntry),
    gapEntries: gapSlots.map(expectedGapEntry),
    draftOnlyEntries: draftOnlySlots.map(expectedDraftOnlyEntry),
    gapClosureRequirementPlaceholder: {
      requirementId: "coverage_threshold_and_gap_closure",
      state: "TO_BE_DECIDED",
      thresholdPolicyReference: null,
      gradeBalancePolicyReference: null,
      strandBalancePolicyReference: null,
      sequencePolicyReference: null,
      waiverPolicyReference: null,
      reconciliationPolicyReference: null,
      activeRuleReferences: [],
      gapClosureEvaluationAllowed: false,
      gapClosureRecordingAllowed: false,
      silentWaiverAllowed: false,
      coverageAdvanceAllowed: false,
    },
    candidateAuthoringRequirementPlaceholder: {
      requirementId: "rights_safe_candidate_authoring",
      state: "TO_BE_DECIDED",
      authoringPolicyReference: null,
      originalityPolicyReference: null,
      rightsPolicyReference: null,
      provenancePolicyReference: null,
      versioningPolicyReference: null,
      fixtureDispositionPolicyReference: null,
      activeRuleReferences: [],
      candidateAuthoringAllowed: false,
      diagnosticItemCreationAllowed: false,
      fixtureReplacementAllowed: false,
      productionUseAllowed: false,
    },
    reviewEvidenceRequirementPlaceholder: {
      requirementId: "review_evidence_requirements",
      state: "TO_BE_DECIDED",
      pinnedEvidencePolicyVersion: expectedEvidencePolicyVersion,
      evidenceSchemaPolicyReference: null,
      evidenceSufficiencyPolicyReference: null,
      evidenceFreshnessPolicyReference: null,
      evidenceIntegrityPolicyReference: null,
      evidenceInvalidationPolicyReference: null,
      activeRuleReferences: [],
      evidenceReferenceRecordingAllowed: false,
      evidenceSufficiencyEvaluationAllowed: false,
      evidenceLinkageAllowed: false,
      coverageAdvanceAllowed: false,
    },
    gateReviewRequirementPlaceholder: {
      requirementId: "substantive_gate_review_requirements",
      state: "TO_BE_DECIDED",
      pinnedReviewGateRubricArtifactVersion: expectedRubricArtifactVersion,
      requiredSubstantiveGateCount: 5,
      requiredGateIds: expectedSubstantiveGateIds,
      gateCompletionPolicyReference: null,
      gateFreshnessPolicyReference: null,
      gateInvalidationPolicyReference: null,
      activeRuleReferences: [],
      gateEvaluationAllowed: false,
      gateDecisionRecordingAllowed: false,
      missingGateSubstitutionAllowed: false,
      coverageAdvanceAllowed: false,
    },
    productionApprovalRequirementPlaceholder: {
      requirementId: "production_approval_requirements",
      state: "TO_BE_DECIDED",
      pinnedProductionAuthorityPolicyVersion: expectedProductionAuthorityPolicyVersion,
      authorityPolicyReference: null,
      quorumPolicyReference: null,
      decisionSchemaPolicyReference: null,
      withdrawalPolicyReference: null,
      reapprovalPolicyReference: null,
      activeRuleReferences: [],
      authorityEvaluationAllowed: false,
      approvalDecisionRecordingAllowed: false,
      productionApprovalRecordingAllowed: false,
      productionCoverageAllowed: false,
    },
    decisionRequirements: expectedDecisionRequirementIds.map(unresolvedRequirement),
    recordBoundary: falseFields(recordBoundaryFields),
    readiness: {
      policyVersion: expectedReadinessPolicyVersion,
      status: "NOT_READY",
      blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
    },
    aggregate: {
      slotPlanEntryCount: 11,
      gapEntryCount: 6,
      draftOnlyEntryCount: 5,
      decisionRequirementCount: 10,
      undecidedRequirementCount: 10,
      ...zeroFields(zeroAggregateFields),
    },
  };
  for (const field of protectedRecordFields) {
    expected[field] = [];
  }
  return expected;
}

export function validateDiagnosticCoverageGapClosurePlan(artifact, upstream) {
  const validatedUpstream = validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  requireExactValue(artifact, buildExpectedArtifact(validatedUpstream), "$");
  return {
    planArtifactVersion: artifact.metadata.planArtifactVersion,
    planVersion: artifact.planIdentity.planVersion,
    planState: artifact.planIdentity.planState,
    prerequisiteStatus: artifact.prerequisiteReference.status,
    slotPlanEntryCount: artifact.aggregate.slotPlanEntryCount,
    gapEntryCount: artifact.aggregate.gapEntryCount,
    draftOnlyEntryCount: artifact.aggregate.draftOnlyEntryCount,
    decisionRequirementCount: artifact.aggregate.decisionRequirementCount,
    closedGapCount: artifact.aggregate.closedGapCount,
    productionApprovedSlotCount: artifact.aggregate.productionApprovedSlotCount,
    realDiagnosticItemCount: artifact.aggregate.realDiagnosticItemCount,
    realCandidateCount: artifact.aggregate.realCandidateCount,
    reviewEvidenceRecordCount: artifact.aggregate.reviewEvidenceRecordCount,
    reviewDecisionCount: artifact.aggregate.reviewDecisionCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticCoverageGapClosurePlan(
  artifactPath = defaultCoverageGapClosurePlanPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticCoverageGapClosurePlanUpstreamArtifacts() {
  const [productionPolicy, productionUpstream] = await Promise.all([
    readDiagnosticProductionApprovalAuthorityPolicy(),
    readDiagnosticProductionApprovalAuthorityPolicyUpstreamArtifacts(),
  ]);
  return { productionPolicy, productionUpstream };
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateCoverageGapClosurePlanChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice13ChangedPaths.has(changedPath) &&
      !wave5Slice14ScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 5 Slice 13 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateCoverageGapClosurePlanWorktreeScope({ cwd = repoRoot } = {}) {
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
  return validateCoverageGapClosurePlanChangedPaths(changedPaths);
}

async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticCoverageGapClosurePlan(),
    readDiagnosticCoverageGapClosurePlanUpstreamArtifacts(),
  ]);
  const summary = validateDiagnosticCoverageGapClosurePlan(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    validateCoverageGapClosurePlanWorktreeScope();
  }
  console.log(
    `[curriculum] Coverage gap closure plan ${summary.planArtifactVersion} validated: ${summary.slotPlanEntryCount} slot plan entries, ${summary.gapEntryCount} open gaps, ${summary.draftOnlyEntryCount} draft-only entries, ${summary.decisionRequirementCount} undecided requirements, ${summary.closedGapCount} closed gaps, ${summary.productionApprovedSlotCount} production-approved slots, ${summary.realDiagnosticItemCount} real diagnostic items, ${summary.realCandidateCount} real candidates, ${summary.reviewEvidenceRecordCount} evidence records, ${summary.reviewDecisionCount} review decisions, ${summary.productionApprovalCount} production approvals; plan ${summary.planState}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, readiness ${summary.readiness}.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`[curriculum] ${error.message}`);
    process.exitCode = 1;
  });
}
