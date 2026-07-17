import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  readDiagnosticCoverageGapClosurePlan,
  readDiagnosticCoverageGapClosurePlanUpstreamArtifacts,
  validateDiagnosticCoverageGapClosurePlan,
} from "./validate-diagnostic-coverage-gap-closure-plan.mjs";

const expectedArtifactVersion = "wave-5.slice-12.grade-7-9-math.v1";
const expectedPlanVersion = "wave-5.slice-12.diagnostic-readiness-integration-plan.placeholder.v1";
const expectedActivationArtifactVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedCoveragePlanArtifactVersion = "wave-5.slice-11.grade-7-9-math.v1";
const expectedCoveragePlanVersion =
  "wave-5.slice-11.diagnostic-coverage-gap-closure-plan.placeholder.v1";
const expectedProductionAuthorityArtifactVersion = "wave-5.slice-10.grade-7-9-math.v1";
const expectedProductionAuthorityPolicyVersion =
  "wave-5.slice-10.diagnostic-production-approval-authority.placeholder.v1";
const expectedCoverageArtifactVersion = "wave-4.slice-2.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const expectedReadinessEvaluationVersion = "wave-3.slice-11.grade-7-9-math.v1";
const expectedReadinessPolicySourcePath =
  "apps/api/src/diagnostic-readiness-policy/diagnostic-readiness-policy.types.ts";
const expectedBlockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];
const expectedDecisionRequirementIds = [
  "readiness_input_contract_and_version_pins",
  "activation_prerequisite_reconciliation",
  "blocker_reconciliation_and_reopening",
  "production_approval_input_requirements",
  "coverage_completion_input_requirements",
  "evidence_digest_identity_dependency_requirements",
  "readiness_transition_guard_and_authority",
  "withdrawal_and_readiness_rollback",
  "ci_validation_gate_and_negative_vectors",
  "readiness_policy_change_and_activation_sequencing",
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
  "readinessInputRecords",
  "blockerReconciliationRecords",
  "blockerClosureRecords",
  "productionApprovalInputRecords",
  "coverageCompletionInputRecords",
  "evidenceDependencyRecords",
  "digestDependencyRecords",
  "identityDependencyRecords",
  "readinessTransitionRecords",
  "readinessRollbackRecords",
  "prerequisiteSatisfactionRecords",
  "ciGateExecutionRecords",
  "readyStateRecords",
  "realDiagnosticItemRecords",
  "realCandidateRecords",
  "approvedCandidateRecords",
  "productionApproverRecords",
  "productionApprovalRecords",
  "reviewEvidenceRecords",
  "reviewDecisionRecords",
  "digestValueRecords",
  "candidateIdentityRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "authorityGrantRecords",
  "approvalDecisionRecords",
  "auditLogRecords",
  "auditEventRecords",
];
const recordBoundaryFields = [
  "readinessIntegrationRecorded",
  "readinessIntegrationActivated",
  "readinessPolicyImplementationChanged",
  "readinessInputsRecorded",
  "blockerReconciliationsRecorded",
  "blockerClosuresRecorded",
  "productionApprovalInputsRecorded",
  "coverageCompletionInputsRecorded",
  "evidenceDependenciesRecorded",
  "digestDependenciesRecorded",
  "identityDependenciesRecorded",
  "readinessTransitionsRecorded",
  "readinessRollbacksRecorded",
  "prerequisiteSatisfactionsRecorded",
  "ciGateExecutionsRecorded",
  "readyStateRecorded",
  "productionUseEnabled",
  "runtimeReadinessIntegrationEnabled",
];
const zeroAggregateFields = [
  "closedBlockingReasonCount",
  "satisfiedPrerequisiteCount",
  "activeIntegrationRuleCount",
  "readinessInputRecordCount",
  "blockerReconciliationRecordCount",
  "blockerClosureRecordCount",
  "productionApprovalInputRecordCount",
  "coverageCompletionInputRecordCount",
  "evidenceDependencyRecordCount",
  "digestDependencyRecordCount",
  "identityDependencyRecordCount",
  "readinessTransitionRecordCount",
  "readinessRollbackRecordCount",
  "prerequisiteSatisfactionRecordCount",
  "ciGateExecutionRecordCount",
  "readyStateRecordCount",
  "realDiagnosticItemCount",
  "realCandidateCount",
  "approvedCandidateCount",
  "productionApproverCount",
  "productionApprovalCount",
  "reviewEvidenceRecordCount",
  "reviewDecisionCount",
  "digestValueCount",
  "candidateIdentityCount",
  "reviewerIdentityCount",
  "auditIdentityCount",
  "reviewerAssignmentCount",
  "authorityGrantCount",
  "approvalDecisionCount",
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
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
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
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultReadinessIntegrationPlanPath = path.resolve(
  scriptDir,
  "../diagnostic-readiness-integration-plan/grade-7-9-math.readiness-integration-plan-placeholder.v1.json",
);
export const defaultReadinessPolicySourcePath = path.resolve(
  repoRoot,
  expectedReadinessPolicySourcePath,
);

export class DiagnosticReadinessIntegrationPlanValidationError extends Error {}

function fail(message) {
  throw new DiagnosticReadinessIntegrationPlanValidationError(message);
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
  if (value === "READY") {
    fail(`${fieldPath} cannot contain an enabled readiness state.`);
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

function expectedBlocker(blockingReason) {
  return {
    blockingReason,
    blockerState: "OPEN_UNRESOLVED",
    closureRecorded: false,
    closureEvidenceReferences: [],
    readinessRemovalAllowed: false,
  };
}

function findReadinessIntegrationPrerequisite(activationPrerequisites) {
  const matches = activationPrerequisites.prerequisites.filter(
    (item) => item.prerequisiteId === "readiness_integration_plan",
  );
  if (matches.length !== 1) {
    fail("Activation prerequisites must contain exactly one readiness_integration_plan row.");
  }
  const expected = {
    prerequisiteId: "readiness_integration_plan",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future fail-closed readiness reconciliation design with stale-reference, invalidation and withdrawal tests.",
    evidenceRecordRefs: [],
  };
  requireExactValue(matches[0], expected, "activationPrerequisites.readiness_integration_plan");
  return matches[0];
}

function validateReadinessPolicySource(source) {
  requireString(source, "readinessPolicySource");
  const expectedPolicyDeclaration = `export const diagnosticReadinessPolicyVersion = "${expectedReadinessPolicyVersion}";`;
  const expectedEvaluationDeclaration = `export const diagnosticReadinessEvaluationVersion = "${expectedReadinessEvaluationVersion}";`;
  if (source.split(expectedPolicyDeclaration).length - 1 !== 1) {
    fail("Readiness policy source must declare the exact current policy version once.");
  }
  if (source.split(expectedEvaluationDeclaration).length - 1 !== 1) {
    fail("Readiness policy source must declare the exact current evaluation version once.");
  }
}

function validateUpstreamArtifacts(upstream) {
  if (
    !isPlainObject(upstream) ||
    !isPlainObject(upstream.coverageGapClosureUpstream) ||
    typeof upstream.readinessPolicySource !== "string"
  ) {
    fail("Upstream artifacts must include the coverage plan chain and readiness policy source.");
  }
  const coveragePlanSummary = validateDiagnosticCoverageGapClosurePlan(
    upstream.coverageGapClosurePlan,
    upstream.coverageGapClosureUpstream,
  );
  requireExactValue(
    coveragePlanSummary,
    {
      planArtifactVersion: expectedCoveragePlanArtifactVersion,
      planVersion: expectedCoveragePlanVersion,
      planState: "UNRESOLVED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      slotPlanEntryCount: 11,
      gapEntryCount: 6,
      draftOnlyEntryCount: 5,
      decisionRequirementCount: 10,
      closedGapCount: 0,
      productionApprovedSlotCount: 0,
      realDiagnosticItemCount: 0,
      realCandidateCount: 0,
      reviewEvidenceRecordCount: 0,
      reviewDecisionCount: 0,
      productionApprovalCount: 0,
      activationStatus: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      readiness: "NOT_READY",
    },
    "coverageGapClosurePlanSummary",
  );
  validateReadinessPolicySource(upstream.readinessPolicySource);
  const chain =
    upstream.coverageGapClosureUpstream.productionUpstream.evidenceUpstream.auditUpstream;
  const activation = chain.activationPrerequisites;
  const coverage = chain.coverage;
  const productionPolicy = upstream.coverageGapClosureUpstream.productionPolicy;
  return {
    activation,
    coverage,
    coverageGapClosurePlan: upstream.coverageGapClosurePlan,
    coveragePlanSummary,
    prerequisite: findReadinessIntegrationPrerequisite(activation),
    productionPolicy,
  };
}

function buildExpectedArtifact({
  activation,
  coverage,
  coverageGapClosurePlan,
  coveragePlanSummary,
  prerequisite,
  productionPolicy,
}) {
  const expected = {
    metadata: {
      schemaVersion: "learnika.diagnosticReadinessIntegrationPlanPlaceholder.v1",
      planArtifactVersion: expectedArtifactVersion,
      status: "placeholder_only_unsatisfied_non_production",
      artifactKind: "diagnostic_readiness_integration_plan_placeholder",
      subject: "math",
      locale: "ru-RU",
      audienceGrades: [7, 8, 9],
      activationPrerequisitesArtifactVersion: expectedActivationArtifactVersion,
      coverageGapClosurePlanArtifactVersion: expectedCoveragePlanArtifactVersion,
      productionApprovalAuthorityPolicyArtifactVersion: expectedProductionAuthorityArtifactVersion,
      reviewCoverageArtifactVersion: expectedCoverageArtifactVersion,
      diagnosticReadinessPolicyVersion: expectedReadinessPolicyVersion,
      diagnosticReadinessEvaluationVersion: expectedReadinessEvaluationVersion,
      readinessPolicySourcePath: expectedReadinessPolicySourcePath,
      sourceContract: "docs/wave-5/diagnostic-readiness-integration-plan-contract.md",
      productionUseAllowed: false,
      runtimeUseAllowed: false,
      storageAllowed: false,
    },
    activationBoundary: {
      status: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      activationAllowed: false,
      reviewWorkflowActivationAllowed: false,
      readinessIntegrationAllowed: false,
      readinessTransitionAllowed: false,
      readyStateAllowed: false,
      blockerClosureAllowed: false,
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
      coverageGapClosurePlan: {
        artifactVersion: coveragePlanSummary.planArtifactVersion,
        planVersion: coveragePlanSummary.planVersion,
        planState: coveragePlanSummary.planState,
        prerequisiteStatus: coveragePlanSummary.prerequisiteStatus,
        slotPlanEntryCount: coveragePlanSummary.slotPlanEntryCount,
        gapEntryCount: coveragePlanSummary.gapEntryCount,
        draftOnlyEntryCount: coveragePlanSummary.draftOnlyEntryCount,
        closedGapCount: coveragePlanSummary.closedGapCount,
        productionApprovedSlotCount: coveragePlanSummary.productionApprovedSlotCount,
        realDiagnosticItemCount: coveragePlanSummary.realDiagnosticItemCount,
        realCandidateCount: coveragePlanSummary.realCandidateCount,
        reviewEvidenceRecordCount: coveragePlanSummary.reviewEvidenceRecordCount,
        reviewDecisionCount: coveragePlanSummary.reviewDecisionCount,
        productionApprovalCount: coveragePlanSummary.productionApprovalCount,
      },
      productionApprovalAuthorityPolicy: {
        artifactVersion: expectedProductionAuthorityArtifactVersion,
        policyVersion: expectedProductionAuthorityPolicyVersion,
        policyState: productionPolicy.policyIdentity.policyState,
        prerequisiteStatus: productionPolicy.prerequisiteReference.status,
        activeApprovalRuleCount: productionPolicy.aggregate.activeApprovalRuleCount,
        productionApproverCount: productionPolicy.aggregate.productionApproverCount,
        authorityGrantCount: productionPolicy.aggregate.authorityGrantCount,
        approvalDecisionCount: productionPolicy.aggregate.approvalDecisionCount,
        productionApprovalCount: productionPolicy.aggregate.productionApprovalCount,
        approvedCandidateCount: productionPolicy.aggregate.approvedCandidateCount,
      },
      reviewCoverage: {
        artifactVersion: expectedCoverageArtifactVersion,
        artifactStatus: coverage.metadata.status,
        blueprintSlotCount: coverage.aggregate.blueprintSlotCount,
        draftOnlySlotCount: coverage.aggregate.statusCounts.DRAFT_ONLY,
        gapConfirmedSlotCount: coverage.aggregate.statusCounts.GAP_CONFIRMED,
        productionApprovedSlotCount: coverage.aggregate.statusCounts.PRODUCTION_APPROVED,
      },
      diagnosticReadinessPolicySource: {
        policyVersion: expectedReadinessPolicyVersion,
        evaluationVersion: expectedReadinessEvaluationVersion,
        policySourcePath: expectedReadinessPolicySourcePath,
        currentEvaluationContractMode: "METADATA_ONLY_FAIL_CLOSED",
        policyImplementationChangeAllowed: false,
        runtimeIntegrationAllowed: false,
      },
    },
    prerequisiteReference: { ...prerequisite, evidenceRecordRefs: [] },
    planIdentity: {
      planId: "diagnostic-readiness-integration-plan",
      planVersion: expectedPlanVersion,
      planState: "UNRESOLVED_DEFERRED",
      activeIntegrationVersion: null,
      integrationApprovalAllowed: false,
      integrationActivationAllowed: false,
      policyImplementationChangeAllowed: false,
      integrationEvaluationAllowed: false,
      readyStateAllowed: false,
      blockerClosureAllowed: false,
      prerequisiteSatisfactionAllowed: false,
      activationTransitionAllowed: false,
      rollbackExecutionAllowed: false,
      futureCiGateActivationAllowed: false,
    },
    currentReadinessBaseline: {
      policyVersion: expectedReadinessPolicyVersion,
      evaluationVersion: expectedReadinessEvaluationVersion,
      status: "NOT_READY",
      blockingReasons: expectedBlockingReasons,
      blockingReasonCount: 2,
      openBlockingReasonCount: 2,
      closedBlockingReasonCount: 0,
      activationStatus: "BLOCKED",
      reviewWorkflowStatus: "INACTIVE",
      eligibleForReadyTransition: false,
      readyStateRecorded: false,
      readinessTransitionRecorded: false,
      policyImplementationChanged: false,
    },
    currentBlockers: expectedBlockingReasons.map(expectedBlocker),
    readinessInputPrerequisitesPlaceholder: {
      requirementId: "readiness_input_prerequisites",
      state: "TO_BE_DECIDED",
      prerequisiteInputPolicyReference: null,
      versionPinPolicyReference: null,
      staleInputPolicyReference: null,
      currentPrerequisiteCount: 12,
      currentUnsatisfiedPrerequisiteCount: 12,
      currentSatisfiedPrerequisiteCount: 0,
      activeRuleReferences: [],
      inputEvaluationAllowed: false,
      prerequisiteSatisfactionRecordingAllowed: false,
      readinessConsumptionAllowed: false,
    },
    blockerReconciliationPlaceholder: {
      requirementId: "blocker_reconciliation",
      state: "TO_BE_DECIDED",
      currentBlockingReasons: expectedBlockingReasons,
      reconciliationPolicyReference: null,
      reopeningPolicyReference: null,
      closureEvidencePolicyReference: null,
      closureEvidenceReferences: [],
      activeRuleReferences: [],
      blockerEvaluationAllowed: false,
      blockerClosureRecordingAllowed: false,
      blockerRemovalAllowed: false,
      silentBlockerClosureAllowed: false,
    },
    productionApprovalInputPlaceholder: {
      requirementId: "production_approval_input",
      state: "TO_BE_DECIDED",
      pinnedAuthorityPolicyVersion: expectedProductionAuthorityPolicyVersion,
      inputPolicyReference: null,
      authorityValidationPolicyReference: null,
      withdrawalPolicyReference: null,
      productionApprovalReferences: [],
      currentProductionApprovalCount: 0,
      currentApprovedCandidateCount: 0,
      activeRuleReferences: [],
      inputEvaluationAllowed: false,
      approvalInputRecordingAllowed: false,
      readinessConsumptionAllowed: false,
    },
    coverageCompletionInputPlaceholder: {
      requirementId: "coverage_completion_input",
      state: "TO_BE_DECIDED",
      pinnedCoverageArtifactVersion: expectedCoverageArtifactVersion,
      pinnedClosurePlanVersion: expectedCoveragePlanVersion,
      currentBlueprintSlotCount: 11,
      currentDraftOnlySlotCount: 5,
      currentGapConfirmedSlotCount: 6,
      currentProductionApprovedSlotCount: 0,
      currentClosedGapCount: 0,
      completionPolicyReference: null,
      perSlotReconciliationPolicyReference: null,
      invalidationPolicyReference: null,
      coverageCompletionReferences: [],
      activeRuleReferences: [],
      completionEvaluationAllowed: false,
      completionRecordingAllowed: false,
      readinessConsumptionAllowed: false,
    },
    evidenceDigestIdentityDependencyPlaceholder: {
      requirementId: "evidence_digest_identity_dependencies",
      state: "TO_BE_DECIDED",
      dependencyPolicyReference: null,
      evidencePolicyReference: null,
      digestPolicyReference: null,
      identityPolicyReference: null,
      evidenceReferences: [],
      digestReferences: [],
      identityReferences: [],
      currentEvidenceRecordCount: 0,
      currentDigestValueCount: 0,
      currentIdentityRecordCount: 0,
      activeRuleReferences: [],
      dependencyValidationAllowed: false,
      dependencyLinkageAllowed: false,
      readinessConsumptionAllowed: false,
    },
    readinessTransitionGuardPlaceholder: {
      requirementId: "readiness_transition_guard",
      state: "TO_BE_DECIDED",
      currentReadiness: "NOT_READY",
      transitionPolicyReference: null,
      transitionAuthorityPolicyReference: null,
      transitionTestVectorReferences: [],
      activeRuleReferences: [],
      readinessTransitionEvaluationAllowed: false,
      readinessTransitionRecordingAllowed: false,
      directActivationTransitionAllowed: false,
      workflowEventTransitionAllowed: false,
      inferredTransitionAllowed: false,
      productionTransitionAllowed: false,
    },
    readinessRollbackPlaceholder: {
      requirementId: "readiness_rollback_after_future_transition",
      state: "TO_BE_DECIDED",
      rollbackPolicyReference: null,
      withdrawalPropagationPolicyReference: null,
      blockerReopenPolicyReference: null,
      recoveryTestVectorReferences: [],
      currentReadinessRollbackCount: 0,
      activeRuleReferences: [],
      rollbackEvaluationAllowed: false,
      rollbackExecutionAllowed: false,
      readinessStateMutationAllowed: false,
      productionStateMutationAllowed: false,
    },
    ciValidationGatePlaceholder: {
      requirementId: "ci_readiness_validation_gate",
      state: "TO_BE_DECIDED",
      gatePolicyReference: null,
      requiredCheckDefinitionReferences: [],
      negativeTestVectorReferences: [],
      provenanceReference: null,
      activeRuleReferences: [],
      gateConfigurationAllowed: false,
      gateExecutionAllowed: false,
      gatePassRecordingAllowed: false,
      readinessAuthorizationAllowed: false,
      ciSuccessMayImplyReadiness: false,
    },
    decisionRequirements: expectedDecisionRequirementIds.map(unresolvedRequirement),
    recordBoundary: falseFields(recordBoundaryFields),
    readiness: {
      policyVersion: expectedReadinessPolicyVersion,
      evaluationVersion: expectedReadinessEvaluationVersion,
      status: "NOT_READY",
      blockingReasons: expectedBlockingReasons,
    },
    aggregate: {
      decisionRequirementCount: 10,
      undecidedRequirementCount: 10,
      blockingReasonCount: 2,
      openBlockingReasonCount: 2,
      ...zeroFields(zeroAggregateFields),
    },
  };
  requireExactValue(
    coverageGapClosurePlan.coverageBaseline.statusCounts,
    { DRAFT_ONLY: 5, GAP_CONFIRMED: 6, PRODUCTION_APPROVED: 0 },
    "coverageGapClosurePlan.coverageBaseline.statusCounts",
  );
  for (const field of protectedRecordFields) {
    expected[field] = [];
  }
  return expected;
}

export function validateDiagnosticReadinessIntegrationPlan(artifact, upstream) {
  const validatedUpstream = validateUpstreamArtifacts(upstream);
  scanForbiddenTermsAndPrivateValues(artifact);
  requireExactValue(artifact, buildExpectedArtifact(validatedUpstream), "$");
  return {
    planArtifactVersion: artifact.metadata.planArtifactVersion,
    planVersion: artifact.planIdentity.planVersion,
    planState: artifact.planIdentity.planState,
    prerequisiteStatus: artifact.prerequisiteReference.status,
    blockingReasonCount: artifact.aggregate.blockingReasonCount,
    openBlockingReasonCount: artifact.aggregate.openBlockingReasonCount,
    closedBlockingReasonCount: artifact.aggregate.closedBlockingReasonCount,
    decisionRequirementCount: artifact.aggregate.decisionRequirementCount,
    satisfiedPrerequisiteCount: artifact.aggregate.satisfiedPrerequisiteCount,
    activeIntegrationRuleCount: artifact.aggregate.activeIntegrationRuleCount,
    readinessTransitionRecordCount: artifact.aggregate.readinessTransitionRecordCount,
    readyStateRecordCount: artifact.aggregate.readyStateRecordCount,
    approvedCandidateCount: artifact.aggregate.approvedCandidateCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.activationBoundary.status,
    reviewWorkflowStatus: artifact.activationBoundary.reviewWorkflowStatus,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticReadinessIntegrationPlan(
  artifactPath = defaultReadinessIntegrationPlanPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticReadinessIntegrationPlanUpstreamArtifacts() {
  const [coverageGapClosurePlan, coverageGapClosureUpstream, readinessPolicySource] =
    await Promise.all([
      readDiagnosticCoverageGapClosurePlan(),
      readDiagnosticCoverageGapClosurePlanUpstreamArtifacts(),
      readFile(defaultReadinessPolicySourcePath, "utf8"),
    ]);
  return { coverageGapClosurePlan, coverageGapClosureUpstream, readinessPolicySource };
}

export function normalizeReadinessIntegrationPlanStatusPaths(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  return rawPath.split(" -> ").map((path) => path.replaceAll("\\", "/"));
}

export function validateReadinessIntegrationPlanChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (!approvedSlice13ChangedPaths.has(changedPath)) {
      fail(`Wave 5 Slice 13 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateReadinessIntegrationPlanWorktreeScope({ cwd = repoRoot } = {}) {
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
    .flatMap(normalizeReadinessIntegrationPlanStatusPaths);
  return validateReadinessIntegrationPlanChangedPaths(changedPaths);
}

async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticReadinessIntegrationPlan(),
    readDiagnosticReadinessIntegrationPlanUpstreamArtifacts(),
  ]);
  const summary = validateDiagnosticReadinessIntegrationPlan(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    validateReadinessIntegrationPlanWorktreeScope();
  }
  console.log(
    `[curriculum] Readiness integration plan ${summary.planArtifactVersion} validated: ${summary.blockingReasonCount} blockers, ${summary.openBlockingReasonCount} open, ${summary.closedBlockingReasonCount} closed, ${summary.decisionRequirementCount} undecided requirements, ${summary.satisfiedPrerequisiteCount} satisfied prerequisites, ${summary.activeIntegrationRuleCount} active integration rules, ${summary.readinessTransitionRecordCount} readiness transitions, ${summary.readyStateRecordCount} ready-state records, ${summary.approvedCandidateCount} approved candidates, ${summary.productionApprovalCount} production approvals; plan ${summary.planState}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.reviewWorkflowStatus}, readiness ${summary.readiness}.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`[curriculum] ${error.message}`);
    process.exitCode = 1;
  });
}
