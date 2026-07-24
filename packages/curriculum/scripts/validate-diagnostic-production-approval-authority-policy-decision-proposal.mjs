import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const expectedArtifactVersion = "wave-6.slice-8.grade-7-9-math.v1";
const expectedProposalVersion =
  "wave-6.slice-8.diagnostic-production-approval-authority-policy.proposal.v1";
const expectedActivationVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedAuthorityPlaceholderVersion = "wave-5.slice-10.grade-7-9-math.v1";
const expectedAuthorityPolicyVersion =
  "wave-5.slice-10.diagnostic-production-approval-authority.placeholder.v1";
const expectedSeparationVersion = "wave-6.slice-4.grade-7-9-math.v1";
const expectedConflictVersion = "wave-6.slice-5.grade-7-9-math.v1";
const expectedAuditVersion = "wave-6.slice-6.grade-7-9-math.v1";
const expectedEvidenceVersion = "wave-6.slice-7.grade-7-9-math.v1";
const expectedReviewAuthorityVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedWorkflowVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedReadinessVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const decisionIds = [
  "production_approver_taxonomy",
  "quorum_and_gate_requirements",
  "evidence_linkage_candidate_digest_review_chain",
  "authority_grant_boundaries",
  "approval_decision_schema",
  "revocation_withdrawal_appeal_boundaries",
  "conflict_separation_clearances",
  "policy_maintenance_access_review",
  "future_enforcement_audit",
  "upstream_policy_dependencies",
];
const recordFields = [
  "productionApproverRecords",
  "approverIdentityRecords",
  "authorityGrantRecords",
  "quorumEvaluationRecords",
  "evidenceLinkageRecords",
  "approvalDecisionRecords",
  "appealRecords",
  "revocationRecords",
  "withdrawalRecords",
  "conflictClearanceRecords",
  "separationClearanceRecords",
  "auditIdentityRecords",
  "evidenceRecords",
  "digestValueRecords",
  "policyMaintenanceRecords",
  "accessReviewRecords",
  "auditEventRecords",
];
const markerShape = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NON_OPERATIONAL: true,
  NOT_ASSIGNED: true,
  NOT_GRANTED: true,
  NOT_APPROVED: true,
  NOT_USABLE_FOR_REVIEW: true,
  NOT_USABLE_FOR_PRODUCTION: true,
};
const forbiddenTerms = [
  "finalAnswer",
  "correctAnswer",
  "workedSolution",
  "solution",
  "hint",
  "scoring",
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
  "userId",
  "accountId",
  "reviewerId",
  "auditId",
  "approverId",
  "candidateId",
  "storageKey",
  "storageObjectKey",
  "contentHash",
  "sha256",
  "rawMedia",
  "apiRoute",
  "openapiOperation",
  "prismaModel",
  "migrationName",
  "runtimeModule",
  "webPage",
];

const changedPaths = [
  "docs/wave-6/diagnostic-production-approval-authority-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-8-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-production-approval-authority-policy-decision-proposal/grade-7-9-math.production-approval-authority-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-canonicalization-digest-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy-decision-proposal.test.mjs",
];
const changedPathSet = new Set(changedPaths);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultProposalPath = path.resolve(
  scriptDir,
  "../diagnostic-production-approval-authority-policy-decision-proposal/grade-7-9-math.production-approval-authority-policy-decision-proposal.v1.json",
);
const upstreamPaths = {
  activation: path.resolve(
    scriptDir,
    "../diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  ),
  authority: path.resolve(
    scriptDir,
    "../diagnostic-production-approval-authority-policy/grade-7-9-math.production-approval-authority-policy-placeholder.v1.json",
  ),
  separation: path.resolve(
    scriptDir,
    "../diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
  ),
  conflict: path.resolve(
    scriptDir,
    "../diagnostic-conflict-of-interest-policy-decision-proposal/grade-7-9-math.conflict-of-interest-policy-decision-proposal.v1.json",
  ),
  audit: path.resolve(
    scriptDir,
    "../diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
  ),
  evidence: path.resolve(
    scriptDir,
    "../diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
  ),
  reviewAuthority: path.resolve(
    scriptDir,
    "../diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
  ),
  workflow: path.resolve(
    scriptDir,
    "../diagnostic-review-workflow-state/grade-7-9-math.review-workflow-state-placeholder.v1.json",
  ),
};

export class DiagnosticProductionApprovalAuthorityDecisionProposalValidationError extends Error {}
function fail(message) {
  throw new DiagnosticProductionApprovalAuthorityDecisionProposalValidationError(message);
}
function object(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function exact(actual, expected, fieldPath) {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length)
      fail(`${fieldPath} must contain exactly ${expected.length} values.`);
    expected.forEach((value, index) => exact(actual[index], value, `${fieldPath}[${index}]`));
    return;
  }
  if (object(expected)) {
    if (!object(actual)) fail(`${fieldPath} must be an object.`);
    for (const key of Object.keys(actual))
      if (!Object.hasOwn(expected, key)) fail(`${fieldPath}.${key} is unexpected.`);
    for (const key of Object.keys(expected)) {
      if (!Object.hasOwn(actual, key)) fail(`${fieldPath}.${key} is required.`);
      exact(actual[key], expected[key], `${fieldPath}.${key}`);
    }
    return;
  }
  if (!Object.is(actual, expected)) fail(`${fieldPath} must equal ${JSON.stringify(expected)}.`);
}
function scanForbidden(value, fieldPath = "$") {
  if (Array.isArray(value))
    return value.forEach((item, index) => scanForbidden(item, `${fieldPath}[${index}]`));
  if (object(value)) {
    for (const [key, nested] of Object.entries(value)) {
      if (forbiddenTerms.some((term) => key.toLowerCase() === term.toLowerCase()))
        fail(`${fieldPath}.${key} uses a forbidden field term.`);
      scanForbidden(nested, `${fieldPath}.${key}`);
    }
    return;
  }
  if (typeof value !== "string") return;
  for (const term of forbiddenTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^a-z])${escaped}($|[^a-z])`, "i").test(value))
      fail(`${fieldPath} uses forbidden content term ${term}.`);
  }
  const privatePatterns = [
    [/[^\s@]+@[^\s@]+\.[^\s@]+/i, "email-like value"],
    [/\bhttps?:\/\//i, "URL-like value"],
    [/\b(?:s3|minio|file):\/\//i, "storage locator"],
    [/\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/i, "UUID-like value"],
    [/\b[0-9a-f]{32,}\b/i, "hash-like value"],
    [
      /\b(?:user|account|reviewer|audit|approver)[-_](?:ref|id)[-_:][a-z0-9]+\b/i,
      "identity reference",
    ],
    [/\bdcandidate\.math\./i, "candidate-like value"],
  ];
  for (const [pattern, label] of privatePatterns)
    if (pattern.test(value)) fail(`${fieldPath} contains a ${label}.`);
}
async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}
export async function readDiagnosticProductionApprovalAuthorityDecisionProposal(
  proposalPath = defaultProposalPath,
) {
  return readJson(proposalPath);
}
export async function readDiagnosticProductionApprovalAuthorityDecisionProposalUpstream() {
  const entries = await Promise.all(
    Object.entries(upstreamPaths).map(async ([key, filePath]) => [key, await readJson(filePath)]),
  );
  return Object.fromEntries(entries);
}

function expectedMetadata() {
  return {
    schemaVersion: "learnika.diagnosticProductionApprovalAuthorityPolicyDecisionProposal.v1",
    proposalArtifactVersion: expectedArtifactVersion,
    proposalId: "diagnostic-production-approval-authority-policy-decision-proposal",
    proposalVersion: expectedProposalVersion,
    status: "PROPOSED_DEFERRED",
    artifactKind: "diagnostic_production_approval_authority_policy_decision_proposal",
    subject: "math",
    locale: "ru-RU",
    audienceGrades: [7, 8, 9],
    activationPrerequisitesArtifactVersion: expectedActivationVersion,
    productionApprovalAuthorityPolicyPlaceholderArtifactVersion:
      expectedAuthorityPlaceholderVersion,
    separationOfDutiesDecisionProposalArtifactVersion: expectedSeparationVersion,
    conflictOfInterestDecisionProposalArtifactVersion: expectedConflictVersion,
    auditIdentityDecisionProposalArtifactVersion: expectedAuditVersion,
    evidenceStorageRetentionDecisionProposalArtifactVersion: expectedEvidenceVersion,
    reviewAuthorityArtifactVersion: expectedReviewAuthorityVersion,
    reviewWorkflowStateArtifactVersion: expectedWorkflowVersion,
    diagnosticReadinessPolicyVersion: expectedReadinessVersion,
    sourceContract:
      "docs/wave-6/diagnostic-production-approval-authority-policy-decision-proposal.md",
    productionUseAllowed: false,
    runtimeUseAllowed: false,
    authorityGrantAllowed: false,
  };
}
function expectedBoundary() {
  return {
    proposalStatus: "PROPOSED_DEFERRED",
    policyApproved: false,
    productionApproverTaxonomyApproved: false,
    quorumRequirementsApproved: false,
    evidenceLinkageAllowed: false,
    authorityGrantAllowed: false,
    approvalDecisionRecordingAllowed: false,
    revocationWithdrawalAllowed: false,
    appealAllowed: false,
    conflictSeparationClearanceAllowed: false,
    policyMaintenanceAllowed: false,
    accessReviewAllowed: false,
    prerequisiteSatisfactionAllowed: false,
    workflowActivationAllowed: false,
    productionApprovalAllowed: false,
    readinessTransitionAllowed: false,
  };
}
function validateUpstream(upstream) {
  const {
    activation,
    authority,
    separation,
    conflict,
    audit,
    evidence,
    reviewAuthority,
    workflow,
  } = upstream;
  exact(
    activation.metadata.activationPrerequisitesArtifactVersion,
    expectedActivationVersion,
    "activation.version",
  );
  exact(
    activation.metadata.status,
    "blocked_prerequisites_only_non_production",
    "activation.status",
  );
  exact(activation.activationBoundary.status, "BLOCKED", "activation.boundary.status");
  exact(
    activation.activationBoundary.reviewWorkflowStatus,
    "INACTIVE",
    "activation.boundary.workflow",
  );
  exact(activation.aggregate.satisfiedPrerequisiteCount, 0, "activation.aggregate.satisfied");
  exact(
    authority.metadata.policyArtifactVersion,
    expectedAuthorityPlaceholderVersion,
    "authority.version",
  );
  exact(
    authority.metadata.status,
    "placeholder_only_unsatisfied_non_production",
    "authority.status",
  );
  exact(
    authority.policyIdentity.policyVersion,
    expectedAuthorityPolicyVersion,
    "authority.policy.version",
  );
  exact(authority.policyIdentity.policyState, "UNRESOLVED_DEFERRED", "authority.policy.state");
  exact(
    authority.prerequisiteReference.status,
    "UNSATISFIED_DEFERRED",
    "authority.prerequisite.status",
  );
  exact(authority.aggregate.activeApprovalRuleCount, 0, "authority.aggregate.active");
  exact(authority.aggregate.productionApprovalCount, 0, "authority.aggregate.approvals");
  exact(
    separation.metadata.proposalArtifactVersion,
    expectedSeparationVersion,
    "separation.version",
  );
  exact(separation.metadata.status, "PROPOSED_DEFERRED", "separation.status");
  exact(separation.proposalBoundary.enforcementAllowed, false, "separation.enforcement");
  exact(conflict.metadata.proposalArtifactVersion, expectedConflictVersion, "conflict.version");
  exact(conflict.metadata.status, "PROPOSED_DEFERRED", "conflict.status");
  exact(conflict.proposalBoundary.identityComparisonAllowed, false, "conflict.identityComparison");
  exact(audit.metadata.proposalArtifactVersion, expectedAuditVersion, "audit.version");
  exact(audit.metadata.status, "PROPOSED_DEFERRED", "audit.status");
  exact(audit.proposalBoundary.identityBindingAllowed, false, "audit.binding");
  exact(audit.proposalBoundary.auditEventRecordingAllowed, false, "audit.events");
  exact(evidence.metadata.proposalArtifactVersion, expectedEvidenceVersion, "evidence.version");
  exact(evidence.metadata.status, "PROPOSED_DEFERRED", "evidence.status");
  exact(evidence.proposalBoundary.productionApprovalAllowed, false, "evidence.approval");
  exact(evidence.aggregate.productionApprovalCount, 0, "evidence.aggregate.approvals");
  exact(
    reviewAuthority.metadata.authorityArtifactVersion,
    expectedReviewAuthorityVersion,
    "reviewAuthority.version",
  );
  exact(
    reviewAuthority.authorityPolicy.reviewDecisionAuthorityAllowed,
    false,
    "reviewAuthority.decision",
  );
  exact(workflow.metadata.workflowArtifactVersion, expectedWorkflowVersion, "workflow.version");
  exact(workflow.workflowPolicy.runtimeActivationAllowed, false, "workflow.activation");
}

export function validateDiagnosticProductionApprovalAuthorityDecisionProposal(artifact, upstream) {
  if (!object(artifact) || !object(upstream)) fail("Artifact and upstream must be objects.");
  validateUpstream(upstream);
  scanForbidden(artifact);
  const expectedTopLevel = [
    "metadata",
    "upstreamReferences",
    "currentBaseline",
    "proposalBoundary",
    "productionApproverTaxonomyPlaceholders",
    "quorumAndGatePlaceholder",
    "evidenceLinkagePlaceholder",
    "authorityGrantPlaceholder",
    "approvalDecisionSchemaPlaceholder",
    "lifecycleAndAppealPlaceholder",
    "clearanceDependenciesPlaceholder",
    "policyMaintenancePlaceholder",
    "futureEnforcementAuditPlaceholder",
    "dependencyOrderPlaceholder",
    "unresolvedDecisions",
    "syntheticExamples",
    "recordBoundary",
    "aggregate",
    ...recordFields,
  ];
  exact(Object.keys(artifact).sort(), [...expectedTopLevel].sort(), "topLevel");
  exact(artifact.metadata, expectedMetadata(), "metadata");
  exact(
    artifact.currentBaseline,
    {
      readiness: {
        policyVersion: expectedReadinessVersion,
        status: "NOT_READY",
        blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
      },
      activation: { status: "BLOCKED", workflowStatus: "INACTIVE" },
      productionApprovalAuthorityPrerequisite: {
        prerequisiteId: "production_approval_authority",
        status: "UNSATISFIED_DEFERRED",
        ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
        evidenceRecordRefs: [],
      },
      satisfiedPrerequisiteCount: 0,
      approvedCandidateCount: 0,
      productionApprovalCount: 0,
    },
    "currentBaseline",
  );
  exact(artifact.proposalBoundary, expectedBoundary(), "proposalBoundary");
  exact(
    artifact.productionApproverTaxonomyPlaceholders,
    [
      ["PRODUCTION_APPROVER_PLACEHOLDER", "production_approval"],
      ["INDEPENDENT_APPROVAL_CHECKER_PLACEHOLDER", "approval_check"],
      ["APPROVAL_APPEAL_AUTHORITY_PLACEHOLDER", "approval_appeal"],
    ].map(([rolePlaceholderId, roleScope]) => ({
      rolePlaceholderId,
      roleScope,
      recordState: "TAXONOMY_ONLY",
      ownerReference: null,
      identityReference: null,
      assignmentAllowed: false,
      authorityGrantAllowed: false,
    })),
    "productionApproverTaxonomyPlaceholders",
  );
  exact(
    artifact.quorumAndGatePlaceholder,
    {
      decisionId: "quorum_and_gate_requirements",
      state: "UNRESOLVED_DEFERRED",
      minimumApproverCount: null,
      quorumPolicyReference: null,
      substantiveGatePolicyReference: null,
      ruleActive: false,
      quorumEvaluationAllowed: false,
      approvalAuthorizationAllowed: false,
    },
    "quorumAndGatePlaceholder",
  );
  exact(
    artifact.evidenceLinkagePlaceholder,
    {
      decisionId: "evidence_linkage_candidate_digest_review_chain",
      state: "UNRESOLVED_DEFERRED",
      candidateDigestReferencePolicy: null,
      reviewChainReferencePolicy: null,
      evidenceSufficiencyPolicy: null,
      linkageAllowed: false,
      sufficiencyEvaluationAllowed: false,
    },
    "evidenceLinkagePlaceholder",
  );
  exact(
    artifact.authorityGrantPlaceholder,
    {
      decisionId: "authority_grant_boundaries",
      state: "UNRESOLVED_DEFERRED",
      grantPolicyReference: null,
      grantOwnerReference: null,
      grantIssuanceAllowed: false,
      delegationAllowed: false,
      revocationAllowed: false,
      accessReviewAllowed: false,
    },
    "authorityGrantPlaceholder",
  );
  exact(
    artifact.approvalDecisionSchemaPlaceholder,
    {
      decisionId: "approval_decision_schema",
      state: "UNRESOLVED_DEFERRED",
      schemaReference: null,
      outcomeSetReference: null,
      decisionRecordCreationAllowed: false,
      approvalAuthorizationAllowed: false,
      appealRecordAllowed: false,
    },
    "approvalDecisionSchemaPlaceholder",
  );
  exact(
    artifact.lifecycleAndAppealPlaceholder,
    {
      decisionId: "revocation_withdrawal_appeal_boundaries",
      state: "UNRESOLVED_DEFERRED",
      revocationPolicyReference: null,
      withdrawalPolicyReference: null,
      appealPolicyReference: null,
      revocationAllowed: false,
      withdrawalAllowed: false,
      appealAllowed: false,
    },
    "lifecycleAndAppealPlaceholder",
  );
  exact(
    artifact.clearanceDependenciesPlaceholder,
    {
      decisionId: "conflict_separation_clearances",
      state: "UNRESOLVED_DEFERRED",
      separationProposalVersion:
        "wave-6.slice-4.diagnostic-separation-of-duties-policy.proposal.v1",
      conflictProposalVersion: "wave-6.slice-5.diagnostic-conflict-of-interest-policy.proposal.v1",
      clearanceEvaluationAllowed: false,
      bypassAllowed: false,
    },
    "clearanceDependenciesPlaceholder",
  );
  exact(
    artifact.policyMaintenancePlaceholder,
    {
      decisionId: "policy_maintenance_access_review",
      state: "UNRESOLVED_DEFERRED",
      maintenanceOwnerReference: null,
      accessReviewPolicyReference: null,
      auditRequirementReference: null,
      policyUpdateAllowed: false,
      accessReviewAllowed: false,
    },
    "policyMaintenancePlaceholder",
  );
  exact(
    artifact.futureEnforcementAuditPlaceholder,
    {
      decisionId: "future_enforcement_audit",
      state: "UNRESOLVED_DEFERRED",
      enforcementEvidencePolicyReference: null,
      auditEvidencePolicyReference: null,
      enforcementAllowed: false,
      auditRecordingAllowed: false,
    },
    "futureEnforcementAuditPlaceholder",
  );
  exact(
    artifact.dependencyOrderPlaceholder,
    {
      decisionId: "upstream_policy_dependencies",
      state: "UNRESOLVED_DEFERRED",
      separationProposalVersion: expectedSeparationVersion,
      conflictProposalVersion: expectedConflictVersion,
      auditIdentityProposalVersion: expectedAuditVersion,
      evidenceRetentionProposalVersion: expectedEvidenceVersion,
      dependencySatisfied: false,
      dependencyBypassAllowed: false,
    },
    "dependencyOrderPlaceholder",
  );
  const unresolved = (decisionId) => ({
    decisionId,
    state: "UNRESOLVED_DEFERRED",
    decisionRecordRef: null,
  });
  exact(artifact.unresolvedDecisions, decisionIds.map(unresolved), "unresolvedDecisions");
  exact(artifact.syntheticExamples.length, 8, "syntheticExamples.length");
  artifact.syntheticExamples.forEach((example, index) => {
    exact(example.markers, markerShape, `syntheticExamples[${index}].markers`);
    if (typeof example.vectorRef !== "string" || typeof example.scenarioCode !== "string")
      fail(`syntheticExamples[${index}] must contain symbolic identifiers.`);
    if (example.expectedDisposition === "REJECT" && example.rejectionReasonCode === null)
      fail(`syntheticExamples[${index}] rejected vectors require a reason.`);
  });
  exact(
    artifact.recordBoundary,
    Object.fromEntries(
      [
        "productionApproverRecords",
        "approverIdentityRecords",
        "authorityGrantRecords",
        "quorumEvaluationRecords",
        "evidenceLinkageRecords",
        "approvalDecisionRecords",
        "appealRecords",
        "revocationRecords",
        "withdrawalRecords",
        "conflictClearanceRecords",
        "separationClearanceRecords",
        "auditIdentityRecords",
        "evidenceRecords",
        "digestValueRecords",
        "policyMaintenanceRecords",
        "accessReviewRecords",
        "auditEventRecords",
        "runtimeProductionApprovalEnabled",
      ].map((key) => [key, false]),
    ),
    "recordBoundary",
  );
  exact(
    artifact.aggregate,
    {
      syntheticExampleCount: 8,
      acceptedSyntheticExampleCount: 4,
      rejectedSyntheticExampleCount: 4,
      unresolvedDecisionCount: 10,
      approverRolePlaceholderCount: 3,
      satisfiedPrerequisiteCount: 0,
      productionApproverCount: 0,
      approverIdentityCount: 0,
      authorityGrantCount: 0,
      quorumEvaluationCount: 0,
      evidenceLinkageCount: 0,
      approvalDecisionCount: 0,
      appealCount: 0,
      revocationCount: 0,
      withdrawalCount: 0,
      conflictClearanceCount: 0,
      separationClearanceCount: 0,
      auditIdentityCount: 0,
      evidenceRecordCount: 0,
      digestValueCount: 0,
      policyMaintenanceCount: 0,
      accessReviewCount: 0,
      auditEventCount: 0,
      approvedCandidateCount: 0,
      productionApprovalCount: 0,
    },
    "aggregate",
  );
  for (const field of recordFields) exact(artifact[field], [], field);
  exact(
    artifact.upstreamReferences.productionApprovalAuthorityPlaceholder.artifactVersion,
    expectedAuthorityPlaceholderVersion,
    "upstream.authority",
  );
  exact(
    artifact.upstreamReferences.productionApprovalAuthorityPlaceholder.policyVersion,
    expectedAuthorityPolicyVersion,
    "upstream.authority.policy",
  );
  exact(
    artifact.upstreamReferences.separationOfDutiesDecisionProposal.artifactVersion,
    expectedSeparationVersion,
    "upstream.separation",
  );
  exact(
    artifact.upstreamReferences.separationOfDutiesDecisionProposal.enforcementAllowed,
    false,
    "upstream.separation.enforcement",
  );
  exact(
    artifact.upstreamReferences.conflictOfInterestDecisionProposal.artifactVersion,
    expectedConflictVersion,
    "upstream.conflict",
  );
  exact(
    artifact.upstreamReferences.conflictOfInterestDecisionProposal.identityComparisonAllowed,
    false,
    "upstream.conflict.identityComparison",
  );
  exact(
    artifact.upstreamReferences.auditIdentityDecisionProposal.artifactVersion,
    expectedAuditVersion,
    "upstream.audit",
  );
  exact(
    artifact.upstreamReferences.auditIdentityDecisionProposal.identityBindingAllowed,
    false,
    "upstream.audit.identityBinding",
  );
  exact(
    artifact.upstreamReferences.auditIdentityDecisionProposal.auditEventRecordingAllowed,
    false,
    "upstream.audit.auditEvents",
  );
  exact(
    artifact.upstreamReferences.evidenceStorageRetentionDecisionProposal.artifactVersion,
    expectedEvidenceVersion,
    "upstream.evidence",
  );
  return {
    proposalArtifactVersion: artifact.metadata.proposalArtifactVersion,
    proposalVersion: artifact.metadata.proposalVersion,
    unresolvedDecisionCount: artifact.aggregate.unresolvedDecisionCount,
    approverRolePlaceholderCount: artifact.aggregate.approverRolePlaceholderCount,
    productionApproverCount: artifact.aggregate.productionApproverCount,
    authorityGrantCount: artifact.aggregate.authorityGrantCount,
    approvalDecisionCount: artifact.aggregate.approvalDecisionCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    prerequisiteStatus: artifact.currentBaseline.productionApprovalAuthorityPrerequisite.status,
    activationStatus: artifact.currentBaseline.activation.status,
    workflowStatus: artifact.currentBaseline.activation.workflowStatus,
    readiness: artifact.currentBaseline.readiness.status,
  };
}

export function validateDiagnosticProductionApprovalAuthorityDecisionProposalChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !changedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 8 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== changedPaths.length)
    fail(`Wave 6 Slice 8 requires exactly ${changedPaths.length} changed paths.`);
  return normalized;
}

function git(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { status: result.status ?? 1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}
function localPaths(cwd) {
  const result = git(["status", "--short", "--untracked-files=all"], cwd);
  if (result.status !== 0) fail(`Unable to inspect git status: ${result.stderr || result.stdout}`);
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim().replaceAll("\\", "/"));
}
function event(pathName) {
  try {
    return JSON.parse(readFileSync(pathName, "utf8"));
  } catch (error) {
    fail(
      `BLOCK: GitHub Actions event metadata is unavailable or invalid: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
function sha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
}
function requireCommit(value, label, cwd) {
  if (!sha(value))
    fail(
      `BLOCK: CI ${label} commit is unavailable; exact changed-path range cannot be determined.`,
    );
  const object = `${value}^{commit}`;
  if (git(["cat-file", "-e", object], cwd).status === 0) return;
  const fetched = git(["fetch", "--no-tags", "--depth=1", "origin", value], cwd);
  if (fetched.status !== 0 || git(["cat-file", "-e", object], cwd).status !== 0)
    fail(
      `BLOCK: CI ${label} commit remains unavailable after exact fetch; exact changed-path range cannot be determined.`,
    );
}
function ciRange(env, cwd) {
  const payload = env.GITHUB_EVENT_PATH ? event(env.GITHUB_EVENT_PATH) : undefined;
  let base;
  let head;
  if (env.GITHUB_EVENT_NAME === "pull_request" || payload?.pull_request) {
    base = payload?.pull_request?.base?.sha;
    head = payload?.pull_request?.head?.sha;
  } else if (env.GITHUB_EVENT_NAME === "push" || payload?.before || payload?.after) {
    base = payload?.before;
    head = payload?.after ?? env.GITHUB_SHA;
  } else {
    head = env.GITHUB_SHA;
    requireCommit(head, "head", cwd);
    const parents = git(["rev-list", "--parents", "-n", "1", head], cwd).stdout.trim().split(/\s+/);
    base = parents.length === 2 && parents[0] === head ? parents[1] : undefined;
  }
  if (!sha(base) || !sha(head)) fail("BLOCK: exact GitHub Actions base/head range is unavailable.");
  requireCommit(base, "base", cwd);
  requireCommit(head, "head", cwd);
  return { base, head };
}
function ciPaths(env, cwd) {
  const { base, head } = ciRange(env, cwd);
  const result = git(
    ["diff", "--name-status", "--find-renames", "--no-ext-diff", "-z", base, head],
    cwd,
  );
  if (result.status !== 0)
    fail(`BLOCK: CI changed-path range could not be read: ${result.stderr || result.stdout}`);
  const tokens = result.stdout.split("\0").filter(Boolean);
  const paths = [];
  for (let index = 0; index < tokens.length;) {
    const status = tokens[index++];
    const count = /^[RC]/.test(status) ? 2 : 1;
    if (tokens.length - index < count) fail("BLOCK: CI changed-path range was malformed.");
    for (let offset = 0; offset < count; offset += 1)
      paths.push(tokens[index++].replaceAll("\\", "/"));
  }
  if (paths.length === 0) fail("BLOCK: CI changed-path collection returned an empty path list.");
  return paths;
}
export function collectDiagnosticProductionApprovalAuthorityDecisionProposalChangedPaths({
  cwd = repoRoot,
  env = process.env,
} = {}) {
  if (String(env.GITHUB_ACTIONS ?? "").toLowerCase() !== "true") return localPaths(cwd);
  return ciPaths(env, cwd);
}
export function validateDiagnosticProductionApprovalAuthorityDecisionProposalWorktreeScope(
  paths,
  { env = process.env } = {},
) {
  if (String(env.GITHUB_ACTIONS ?? "").toLowerCase() !== "true" && paths.length === 0) return [];
  return validateDiagnosticProductionApprovalAuthorityDecisionProposalChangedPaths(paths);
}
export async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticProductionApprovalAuthorityDecisionProposal(),
    readDiagnosticProductionApprovalAuthorityDecisionProposalUpstream(),
  ]);
  const summary = validateDiagnosticProductionApprovalAuthorityDecisionProposal(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    const paths = collectDiagnosticProductionApprovalAuthorityDecisionProposalChangedPaths();
    validateDiagnosticProductionApprovalAuthorityDecisionProposalWorktreeScope(paths);
  }
  console.log(
    `[curriculum] Production approval authority decision proposal ${summary.proposalArtifactVersion} validated: ${summary.approverRolePlaceholderCount} approver roles, ${summary.unresolvedDecisionCount} unresolved decisions, ${summary.productionApproverCount} approvers, ${summary.authorityGrantCount} authority grants, ${summary.approvalDecisionCount} approval decisions, ${summary.productionApprovalCount} production approvals; prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
  );
  return summary;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    console.error(`[curriculum] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
