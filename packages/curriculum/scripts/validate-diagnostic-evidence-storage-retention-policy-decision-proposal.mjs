import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const expectedArtifactVersion = "wave-6.slice-7.grade-7-9-math.v1";
const expectedProposalVersion =
  "wave-6.slice-7.diagnostic-evidence-storage-retention-policy.proposal.v1";
const expectedActivationVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedEvidencePlaceholderVersion = "wave-5.slice-9.grade-7-9-math.v1";
const expectedEvidencePolicyVersion =
  "wave-5.slice-9.diagnostic-evidence-storage-and-retention.placeholder.v1";
const expectedSeparationVersion = "wave-6.slice-4.grade-7-9-math.v1";
const expectedConflictVersion = "wave-6.slice-5.grade-7-9-math.v1";
const expectedAuditVersion = "wave-6.slice-6.grade-7-9-math.v1";
const expectedAuthorityVersion = "wave-4.slice-8.grade-7-9-math.v1";
const expectedWorkflowVersion = "wave-4.slice-7.grade-7-9-math.v1";
const expectedReadinessVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const blockingReasons = ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"];
const decisionIds = [
  "evidence_taxonomy",
  "storage_classification_taxonomy",
  "record_access_boundary",
  "retention_duration_expiry",
  "deletion_request_execution",
  "legal_hold_boundary",
  "audit_trail_boundary",
  "export_redaction_boundary",
  "recovery_restore_boundary",
  "identity_separation_dependencies",
];
const markerShape = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NON_OPERATIONAL: true,
  NOT_STORED: true,
  NOT_SCHEDULED: true,
  NOT_DELETED: true,
  NOT_EXPORTED: true,
  NOT_AUTHORIZED: true,
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
  "userId",
  "accountId",
  "reviewerId",
  "auditId",
  "candidateId",
  "storageKey",
  "storageObjectKey",
  "digest",
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
const recordFields = [
  "policyDecisionRecords",
  "realCandidateRecords",
  "digestValueRecords",
  "reviewEvidenceRecords",
  "realPrincipalRecords",
  "accountRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "identityBindingRecords",
  "authorizationSnapshotRecords",
  "attributionRecords",
  "evidenceRecordRecords",
  "evidenceFileRecords",
  "storageObjectRecords",
  "storageClassAssignmentRecords",
  "retentionScheduleRecords",
  "retentionExecutionRecords",
  "deletionRequestRecords",
  "deletionExecutionRecords",
  "withdrawalRecords",
  "legalHoldRecords",
  "accessGrantRecords",
  "accessLogRecords",
  "redactionRecords",
  "integrityChecksumRecords",
  "integrityVerificationRecords",
  "auditLogRecords",
  "auditEventRecords",
  "evidenceExportRecords",
  "evidenceReviewRecords",
  "correctionRecords",
  "amendmentRecords",
  "reviewerAssignmentRecords",
  "conflictRecords",
  "disclosureRecords",
  "recusalRecords",
  "waiverRecords",
  "exceptionRecords",
  "recoveryRecords",
  "restoreRecords",
  "reviewDecisionRecords",
  "approvedDecisionRecords",
  "productionApprovalRecords",
];

const changedPaths = [
  "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-7-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
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
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
];
const changedPathSet = new Set(changedPaths);
const slice7PrimaryOnlyPaths = new Set([
  "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
  "docs/wave-6/slice-7-implementation-note.md",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
]);
const slice8ChangedPaths = [
  ...changedPaths.filter((changedPath) => !slice7PrimaryOnlyPaths.has(changedPath)),
  "docs/wave-6/diagnostic-production-approval-authority-policy-decision-proposal.md",
  "docs/wave-6/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-production-approval-authority-policy-decision-proposal/grade-7-9-math.production-approval-authority-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy-decision-proposal.test.mjs",
];
const slice8ChangedPathSet = new Set(slice8ChangedPaths);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultProposalPath = path.resolve(
  scriptDir,
  "../diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
);
const upstreamPaths = {
  activation: path.resolve(
    scriptDir,
    "../diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  ),
  evidence: path.resolve(
    scriptDir,
    "../diagnostic-evidence-storage-retention-policy/grade-7-9-math.evidence-storage-retention-policy-placeholder.v1.json",
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
  authority: path.resolve(
    scriptDir,
    "../diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
  ),
  workflow: path.resolve(
    scriptDir,
    "../diagnostic-review-workflow-state/grade-7-9-math.review-workflow-state-placeholder.v1.json",
  ),
};

export class DiagnosticEvidenceStorageRetentionDecisionProposalValidationError extends Error {}
function fail(message) {
  throw new DiagnosticEvidenceStorageRetentionDecisionProposalValidationError(message);
}
function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function exact(actual, expected, fieldPath) {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      fail(`${fieldPath} must contain exactly ${expected.length} values.`);
    }
    expected.forEach((value, index) => exact(actual[index], value, `${fieldPath}[${index}]`));
    return;
  }
  if (isObject(expected)) {
    if (!isObject(actual)) fail(`${fieldPath} must be an object.`);
    for (const key of Object.keys(actual)) {
      if (!Object.hasOwn(expected, key)) fail(`${fieldPath}.${key} is unexpected.`);
    }
    for (const key of Object.keys(expected)) {
      if (!Object.hasOwn(actual, key)) fail(`${fieldPath}.${key} is required.`);
      exact(actual[key], expected[key], `${fieldPath}.${key}`);
    }
    return;
  }
  if (!Object.is(actual, expected)) fail(`${fieldPath} must equal ${JSON.stringify(expected)}.`);
}
function scanForbidden(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbidden(item, `${fieldPath}[${index}]`));
    return;
  }
  if (isObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      if (forbiddenTerms.some((term) => key.toLowerCase() === term.toLowerCase())) {
        fail(`${fieldPath}.${key} uses a forbidden field term.`);
      }
      scanForbidden(nested, `${fieldPath}.${key}`);
    }
    return;
  }
  if (typeof value !== "string") return;
  for (const term of forbiddenTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^a-z])${escaped}($|[^a-z])`, "i").test(value)) {
      fail(`${fieldPath} uses forbidden content term ${term}.`);
    }
  }
  const privatePatterns = [
    [/[^\s@]+@[^\s@]+\.[^\s@]+/i, "email-like value"],
    [/\bhttps?:\/\//i, "URL-like value"],
    [/\b(?:s3|minio|file):\/\//i, "storage locator"],
    [/\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/i, "UUID-like value"],
    [/\b[0-9a-f]{32,}\b/i, "hash-like value"],
    [/\b(?:user|account)[-_:][a-z0-9]+\b/i, "account-like value"],
    [/\b(?:reviewer|audit)[-_](?:ref|id)[-_:][a-z0-9]+\b/i, "identity reference"],
    [/\bdcandidate\.math\./i, "candidate-like value"],
  ];
  for (const [pattern, label] of privatePatterns) {
    if (pattern.test(value)) fail(`${fieldPath} contains a ${label}.`);
  }
}
function expectedMetadata() {
  return {
    schemaVersion: "learnika.diagnosticEvidenceStorageRetentionPolicyDecisionProposal.v1",
    proposalArtifactVersion: expectedArtifactVersion,
    proposalId: "diagnostic-evidence-storage-retention-policy-decision-proposal",
    proposalVersion: expectedProposalVersion,
    status: "PROPOSED_DEFERRED",
    artifactKind: "diagnostic_evidence_storage_retention_policy_decision_proposal",
    subject: "math",
    locale: "ru-RU",
    audienceGrades: [7, 8, 9],
    activationPrerequisitesArtifactVersion: expectedActivationVersion,
    evidenceStorageRetentionPolicyPlaceholderArtifactVersion: expectedEvidencePlaceholderVersion,
    separationOfDutiesDecisionProposalArtifactVersion: expectedSeparationVersion,
    conflictOfInterestDecisionProposalArtifactVersion: expectedConflictVersion,
    auditIdentityDecisionProposalArtifactVersion: expectedAuditVersion,
    reviewAuthorityArtifactVersion: expectedAuthorityVersion,
    reviewWorkflowStateArtifactVersion: expectedWorkflowVersion,
    diagnosticReadinessPolicyVersion: expectedReadinessVersion,
    sourceContract: "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
    productionUseAllowed: false,
    runtimeUseAllowed: false,
    storageAllowed: false,
  };
}
function expectedBaseline() {
  return {
    readiness: {
      policyVersion: expectedReadinessVersion,
      status: "NOT_READY",
      blockingReasons,
    },
    activation: { status: "BLOCKED", workflowStatus: "INACTIVE" },
    evidenceStorageRetentionPrerequisite: {
      prerequisiteId: "evidence_storage_and_retention_policy",
      status: "UNSATISFIED_DEFERRED",
      ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
      evidenceRecordRefs: [],
    },
    satisfiedPrerequisiteCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
  };
}
function expectedBoundary() {
  return {
    proposalStatus: "PROPOSED_DEFERRED",
    policyApproved: false,
    evidenceTaxonomyApproved: false,
    storageClassificationApproved: false,
    recordAccessAllowed: false,
    retentionSchedulingAllowed: false,
    expiryEnforcementAllowed: false,
    deletionRequestAllowed: false,
    deletionExecutionAllowed: false,
    legalHoldAllowed: false,
    auditTrailRecordingAllowed: false,
    exportAllowed: false,
    redactionAllowed: false,
    recoveryAllowed: false,
    restoreAllowed: false,
    prerequisiteSatisfactionAllowed: false,
    workflowActivationAllowed: false,
    productionApprovalAllowed: false,
    readinessTransitionAllowed: false,
  };
}
const expectedEvidenceTypes = [
  ["METHODOLOGY_EVIDENCE_PLACEHOLDER", "methodology"],
  ["SAFETY_NO_ANSWER_EVIDENCE_PLACEHOLDER", "safety"],
  ["RIGHTS_COPYRIGHT_EVIDENCE_PLACEHOLDER", "rights"],
  ["GRADE_PLACEMENT_EVIDENCE_PLACEHOLDER", "placement"],
  ["ACCESSIBILITY_READABILITY_EVIDENCE_PLACEHOLDER", "accessibility"],
  ["PRODUCTION_APPROVAL_SUPPORTING_EVIDENCE_PLACEHOLDER", "production_approval_support"],
];
const expectedStorageClasses = [
  ["REVIEW_EVIDENCE_STORAGE_CLASS_PLACEHOLDER", "review_evidence"],
  ["RIGHTS_SENSITIVE_EVIDENCE_STORAGE_CLASS_PLACEHOLDER", "rights_sensitive"],
  ["IDENTITY_LINKAGE_STORAGE_CLASS_PLACEHOLDER", "identity_linkage"],
];
function expectedTaxonomy() {
  return {
    evidenceTaxonomyPlaceholders: expectedEvidenceTypes.map(([typePlaceholderId, scope]) => ({
      typePlaceholderId,
      scope,
      recordState: "TAXONOMY_ONLY",
      schemaReference: null,
      collectionAllowed: false,
    })),
    storageClassificationPlaceholders: expectedStorageClasses.map(
      ([classPlaceholderId, scope]) => ({
        classPlaceholderId,
        scope,
        recordState: "TAXONOMY_ONLY",
        locationReference: null,
        encryptionReference: null,
        accessReference: null,
        storageAllowed: false,
      }),
    ),
  };
}
function expectedProposedPolicy() {
  const base = (decisionId, shape) => ({ decisionId, decisionState: "UNRESOLVED_DEFERRED", shape });
  return {
    state: "PROPOSED_NOT_APPROVED",
    evidenceTaxonomy: {
      ...base("evidence_taxonomy", "CLOSED_EVIDENCE_CLASS_AND_SUFFICIENCY_BOUNDARY"),
      ruleActive: false,
    },
    storageClassificationTaxonomy: {
      ...base("storage_classification_taxonomy", "SENSITIVITY_LOCATION_AND_ACCESS_CLASSIFICATION"),
      ruleActive: false,
    },
    recordAccessBoundary: {
      ...base("record_access_boundary", "PURPOSE_LIMITED_LEAST_PRIVILEGE_ACCESS"),
      accessRuleActive: false,
    },
    retentionDurationExpiry: {
      ...base("retention_duration_expiry", "CATEGORY_TRIGGER_DURATION_EXPIRY_RENEWAL"),
      schedulingAllowed: false,
    },
    deletionRequestExecution: {
      ...base("deletion_request_execution", "VERIFIED_BOUNDED_IDEMPOTENT_DELETION"),
      executionAllowed: false,
    },
    legalHoldBoundary: {
      ...base("legal_hold_boundary", "SCOPED_AUTHORIZED_PRECEDENCE_AND_RELEASE"),
      enforcementAllowed: false,
    },
    auditTrailBoundary: {
      ...base("audit_trail_boundary", "MINIMUM_ATTRIBUTED_LIFECYCLE_EVENT_METADATA"),
      recordingAllowed: false,
    },
    exportRedactionBoundary: {
      ...base("export_redaction_boundary", "ELIGIBLE_RECIPIENT_REVIEWED_BOUNDED_DISCLOSURE"),
      exportAllowed: false,
    },
    recoveryRestoreBoundary: {
      ...base("recovery_restore_boundary", "PROTECTED_RESTORE_ORPHAN_AND_REPLAY_RECONCILIATION"),
      recoveryAllowed: false,
    },
    identitySeparationDependencies: {
      ...base("identity_separation_dependencies", "AUDIT_IDENTITY_AND_ROLE_CONFLICT_GATES"),
      dependencySatisfied: false,
    },
  };
}
function expectedExamples() {
  const specs = [
    [
      "synthetic-evidence-taxonomy-shape",
      "EVIDENCE_TAXONOMY_SHAPE",
      ["SYNTHETIC_EVIDENCE_CLASS", "SYNTHETIC_SUFFICIENCY_BOUNDARY"],
      "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
      null,
    ],
    [
      "synthetic-storage-class-shape",
      "STORAGE_CLASSIFICATION_SHAPE",
      ["SYNTHETIC_STORAGE_CLASS", "SYNTHETIC_ACCESS_BOUNDARY"],
      "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
      null,
    ],
    [
      "synthetic-retention-expiry-shape",
      "RETENTION_EXPIRY_SHAPE",
      ["SYNTHETIC_RETENTION_TRIGGER", "SYNTHETIC_EXPIRY_BOUNDARY"],
      "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
      null,
    ],
    [
      "synthetic-recovery-restore-shape",
      "RECOVERY_RESTORE_SHAPE",
      ["SYNTHETIC_BACKUP_BOUNDARY", "SYNTHETIC_RECONCILIATION_BOUNDARY"],
      "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR",
      null,
    ],
    [
      "synthetic-rejected-evidence-record",
      "EVIDENCE_RECORD_REQUEST",
      ["SYNTHETIC_EVIDENCE_RECORD_REQUEST"],
      "REJECT",
      "EVIDENCE_RECORD_FORBIDDEN",
    ],
    [
      "synthetic-rejected-retention-schedule",
      "RETENTION_SCHEDULE_REQUEST",
      ["SYNTHETIC_RETENTION_SCHEDULE_REQUEST"],
      "REJECT",
      "RETENTION_SCHEDULE_FORBIDDEN",
    ],
    [
      "synthetic-rejected-legal-hold",
      "LEGAL_HOLD_REQUEST",
      ["SYNTHETIC_LEGAL_HOLD_REQUEST"],
      "REJECT",
      "LEGAL_HOLD_FORBIDDEN",
    ],
    [
      "synthetic-rejected-private-content",
      "PRIVATE_OR_CONTENT_REQUEST",
      ["SYNTHETIC_PRIVATE_CONTENT_REQUEST"],
      "REJECT",
      "PRIVATE_CONTENT_FORBIDDEN",
    ],
  ];
  return specs.map(
    ([vectorRef, scenarioCode, abstractInputTokens, expectedDisposition, rejectionReasonCode]) => ({
      vectorRef,
      scenarioCode,
      abstractInputTokens,
      expectedDisposition,
      rejectionReasonCode,
      markers: markerShape,
    }),
  );
}
function expectedAggregate() {
  return {
    syntheticExampleCount: 8,
    acceptedSyntheticExampleCount: 4,
    rejectedSyntheticExampleCount: 4,
    unresolvedDecisionCount: 10,
    evidenceTypePlaceholderCount: 6,
    storageClassPlaceholderCount: 3,
    satisfiedPrerequisiteCount: 0,
    evidenceRecordCount: 0,
    storageObjectCount: 0,
    retentionScheduleCount: 0,
    retentionExecutionCount: 0,
    deletionRequestCount: 0,
    deletionExecutionCount: 0,
    legalHoldCount: 0,
    policyDecisionCount: 0,
    realCandidateCount: 0,
    digestValueCount: 0,
    reviewEvidenceCount: 0,
    realPrincipalCount: 0,
    accountRecordCount: 0,
    reviewerIdentityCount: 0,
    auditIdentityCount: 0,
    identityBindingCount: 0,
    authorizationSnapshotCount: 0,
    attributionCount: 0,
    accessGrantCount: 0,
    accessLogCount: 0,
    evidenceFileCount: 0,
    storageClassAssignmentCount: 0,
    withdrawalCount: 0,
    redactionCount: 0,
    integrityChecksumCount: 0,
    integrityVerificationCount: 0,
    auditLogCount: 0,
    auditEventCount: 0,
    exportCount: 0,
    evidenceReviewCount: 0,
    correctionCount: 0,
    amendmentCount: 0,
    reviewerAssignmentCount: 0,
    conflictCount: 0,
    disclosureCount: 0,
    recusalCount: 0,
    waiverCount: 0,
    exceptionCount: 0,
    recoveryCount: 0,
    restoreCount: 0,
    reviewDecisionCount: 0,
    approvedDecisionCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
    activeStorageRuleCount: 0,
  };
}
function validateUpstream(upstream) {
  const { activation, evidence, separation, conflict, audit, authority, workflow } = upstream;
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
    evidence.metadata.policyArtifactVersion,
    expectedEvidencePlaceholderVersion,
    "evidence.version",
  );
  exact(evidence.metadata.status, "placeholder_only_unsatisfied_non_production", "evidence.status");
  exact(
    evidence.policyIdentity.policyVersion,
    expectedEvidencePolicyVersion,
    "evidence.policy.version",
  );
  exact(evidence.policyIdentity.policyState, "UNRESOLVED_DEFERRED", "evidence.policy.state");
  exact(
    evidence.prerequisiteReference.status,
    "UNSATISFIED_DEFERRED",
    "evidence.prerequisite.status",
  );
  exact(evidence.aggregate.activeStorageRuleCount, 0, "evidence.aggregate.active");
  exact(evidence.aggregate.storageObjectCount, 0, "evidence.aggregate.objects");
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
  exact(authority.metadata.authorityArtifactVersion, expectedAuthorityVersion, "authority.version");
  exact(authority.authorityPolicy.reviewDecisionAuthorityAllowed, false, "authority.decision");
  exact(workflow.metadata.workflowArtifactVersion, expectedWorkflowVersion, "workflow.version");
  exact(workflow.workflowPolicy.runtimeActivationAllowed, false, "workflow.activation");
}

export function validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposal(
  artifact,
  upstream,
) {
  if (!isObject(artifact) || !isObject(upstream)) fail("Artifact and upstream must be objects.");
  validateUpstream(upstream);
  scanForbidden(artifact);
  const expectedTopLevel = [
    "metadata",
    "upstreamReferences",
    "currentBaseline",
    "proposalBoundary",
    "evidenceTaxonomyPlaceholders",
    "storageClassificationPlaceholders",
    "proposedPolicy",
    "unresolvedDecisions",
    "syntheticExamples",
    "recordBoundary",
    "aggregate",
    ...recordFields,
  ];
  exact(Object.keys(artifact).sort(), [...expectedTopLevel].sort(), "topLevel");
  exact(artifact.metadata, expectedMetadata(), "metadata");
  exact(artifact.currentBaseline, expectedBaseline(), "currentBaseline");
  exact(artifact.proposalBoundary, expectedBoundary(), "proposalBoundary");
  const taxonomy = expectedTaxonomy();
  exact(
    artifact.evidenceTaxonomyPlaceholders,
    taxonomy.evidenceTaxonomyPlaceholders,
    "evidenceTaxonomyPlaceholders",
  );
  exact(
    artifact.storageClassificationPlaceholders,
    taxonomy.storageClassificationPlaceholders,
    "storageClassificationPlaceholders",
  );
  exact(artifact.proposedPolicy, expectedProposedPolicy(), "proposedPolicy");
  exact(
    artifact.unresolvedDecisions,
    decisionIds.map((decisionId) => ({
      decisionId,
      state: "UNRESOLVED_DEFERRED",
      decisionRecordRef: null,
    })),
    "unresolvedDecisions",
  );
  exact(artifact.syntheticExamples, expectedExamples(), "syntheticExamples");
  exact(
    artifact.recordBoundary,
    {
      runtimeStorageEnabled: false,
      evidenceCollectionEnabled: false,
      storageObjectCreationEnabled: false,
      retentionSchedulingEnabled: false,
      deletionExecutionEnabled: false,
      legalHoldRecordingEnabled: false,
      auditTrailRecordingEnabled: false,
      exportExecutionEnabled: false,
      recoveryExecutionEnabled: false,
    },
    "recordBoundary",
  );
  exact(artifact.aggregate, expectedAggregate(), "aggregate");
  for (const field of recordFields) exact(artifact[field], [], field);
  exact(
    artifact.upstreamReferences.activationPrerequisites.artifactVersion,
    expectedActivationVersion,
    "upstream.activation",
  );
  exact(
    artifact.upstreamReferences.evidenceStorageRetentionPlaceholder.artifactVersion,
    expectedEvidencePlaceholderVersion,
    "upstream.evidence",
  );
  exact(
    artifact.upstreamReferences.separationOfDutiesDecisionProposal.artifactVersion,
    expectedSeparationVersion,
    "upstream.separation",
  );
  exact(
    artifact.upstreamReferences.separationOfDutiesDecisionProposal.enforcementAllowed,
    false,
    "upstream.separation.enforcementAllowed",
  );
  exact(
    artifact.upstreamReferences.conflictOfInterestDecisionProposal.artifactVersion,
    expectedConflictVersion,
    "upstream.conflict",
  );
  exact(
    artifact.upstreamReferences.conflictOfInterestDecisionProposal.identityComparisonAllowed,
    false,
    "upstream.conflict.identityComparisonAllowed",
  );
  exact(
    artifact.upstreamReferences.auditIdentityDecisionProposal.artifactVersion,
    expectedAuditVersion,
    "upstream.audit",
  );
  exact(
    artifact.upstreamReferences.auditIdentityDecisionProposal.identityBindingAllowed,
    false,
    "upstream.audit.identityBindingAllowed",
  );
  exact(
    artifact.upstreamReferences.auditIdentityDecisionProposal.auditEventRecordingAllowed,
    false,
    "upstream.audit.auditEventRecordingAllowed",
  );
  return {
    proposalArtifactVersion: artifact.metadata.proposalArtifactVersion,
    proposalVersion: artifact.metadata.proposalVersion,
    proposalStatus: artifact.metadata.status,
    prerequisiteStatus: artifact.currentBaseline.evidenceStorageRetentionPrerequisite.status,
    evidenceTypePlaceholderCount: artifact.aggregate.evidenceTypePlaceholderCount,
    storageClassPlaceholderCount: artifact.aggregate.storageClassPlaceholderCount,
    unresolvedDecisionCount: artifact.aggregate.unresolvedDecisionCount,
    activeStorageRuleCount: artifact.aggregate.activeStorageRuleCount,
    evidenceRecordCount: artifact.aggregate.evidenceRecordCount,
    retentionScheduleCount: artifact.aggregate.retentionScheduleCount,
    deletionExecutionCount: artifact.aggregate.deletionExecutionCount,
    legalHoldCount: artifact.aggregate.legalHoldCount,
    auditEventCount: artifact.aggregate.auditEventCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    activationStatus: artifact.currentBaseline.activation.status,
    workflowStatus: artifact.currentBaseline.activation.workflowStatus,
    readiness: artifact.currentBaseline.readiness.status,
  };
}

export async function readDiagnosticEvidenceStorageRetentionPolicyDecisionProposal(
  artifactPath = defaultProposalPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}
export async function readDiagnosticEvidenceStorageRetentionPolicyDecisionProposalUpstream() {
  const entries = await Promise.all(
    Object.entries(upstreamPaths).map(async ([key, value]) => [
      key,
      JSON.parse(await readFile(value, "utf8")),
    ]),
  );
  return Object.fromEntries(entries);
}
export function validateEvidenceStorageRetentionDecisionProposalChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !changedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 7 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== changedPaths.length) {
    fail(`Wave 6 Slice 7 requires exactly ${changedPaths.length} changed paths.`);
  }
  return normalized;
}
export const validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposalChangedPaths =
  validateEvidenceStorageRetentionDecisionProposalChangedPaths;
export function validateEvidenceStorageRetentionDecisionProposalSlice8ChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !slice8ChangedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 8 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== slice8ChangedPaths.length)
    fail(`Wave 6 Slice 8 requires exactly ${slice8ChangedPaths.length} changed paths.`);
  return normalized;
}
function defaultGitRunner(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { status: result.status ?? 1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}
function localWorktreePaths({ cwd, runGit }) {
  const result = runGit(["status", "--short", "--untracked-files=all"], cwd);
  if (result.status !== 0) fail(`Unable to inspect git status: ${result.stderr || result.stdout}`);
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .map((value) => value.replaceAll("\\", "/"));
}
function readCiEvent(eventPath) {
  try {
    return JSON.parse(readFileSync(eventPath, "utf8"));
  } catch (error) {
    fail(
      `BLOCK: GitHub Actions event metadata is unavailable or invalid: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
function isCommitSha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
}
function requireCommitObject(sha, label, { cwd, runGit }) {
  if (!isCommitSha(sha))
    fail(
      `BLOCK: CI ${label} commit is unavailable or invalid; exact changed-path range cannot be determined.`,
    );
  const objectArgs = ["cat-file", "-e", `${sha}^{commit}`];
  if (runGit(objectArgs, cwd).status === 0) return;
  const fetchResult = runGit(["fetch", "--no-tags", "--depth=1", "origin", sha], cwd);
  if (fetchResult.status !== 0)
    fail(
      `BLOCK: CI ${label} commit is unavailable and could not be fetched from origin; exact changed-path range cannot be determined.`,
    );
  if (runGit(objectArgs, cwd).status !== 0)
    fail(
      `BLOCK: CI ${label} commit remains unavailable after fetching the exact SHA; exact changed-path range cannot be determined.`,
    );
}
function ciCommitRange({ cwd, env, runGit, readEvent }) {
  const event = env.GITHUB_EVENT_PATH ? readEvent(env.GITHUB_EVENT_PATH) : undefined;
  let base;
  let head;
  if (env.GITHUB_EVENT_NAME === "pull_request" || event?.pull_request) {
    base = event?.pull_request?.base?.sha;
    head = event?.pull_request?.head?.sha;
  } else if (env.GITHUB_EVENT_NAME === "push" || event?.before || event?.after) {
    base = event?.before;
    head = event?.after ?? env.GITHUB_SHA;
  } else {
    head = env.GITHUB_SHA;
    requireCommitObject(head, "head", { cwd, runGit });
    const result = runGit(["rev-list", "--parents", "-n", "1", head], cwd);
    const commits = result.status === 0 ? result.stdout.trim().split(/\s+/).filter(Boolean) : [];
    base = commits.length === 2 && commits[0] === head ? commits[1] : undefined;
  }
  if (!isCommitSha(base) || !isCommitSha(head))
    fail("BLOCK: exact GitHub Actions base/head range is unavailable.");
  requireCommitObject(base, "base", { cwd, runGit });
  requireCommitObject(head, "head", { cwd, runGit });
  return { base, head };
}
function diffPaths({ cwd, base, head, runGit }) {
  const result = runGit(
    ["diff", "--name-status", "--find-renames", "--no-ext-diff", "-z", base, head],
    cwd,
  );
  if (result.status !== 0)
    fail(`BLOCK: CI changed-path range could not be read: ${result.stderr || result.stdout}`);
  const tokens = result.stdout.split("\0").filter(Boolean);
  const paths = [];
  for (let index = 0; index < tokens.length;) {
    const status = tokens[index++];
    const pathCount = /^[RC]/.test(status) ? 2 : 1;
    if (tokens.length - index < pathCount)
      fail("BLOCK: CI changed-path range was malformed; exact scope cannot be determined.");
    for (let pathIndex = 0; pathIndex < pathCount; pathIndex += 1)
      paths.push(tokens[index++].replaceAll("\\", "/"));
  }
  if (paths.length === 0) fail("BLOCK: CI changed-path collection returned an empty path list.");
  return paths;
}
export function collectDiagnosticEvidenceStorageRetentionDecisionProposalChangedPaths({
  cwd = repoRoot,
  env = process.env,
  runGit = defaultGitRunner,
  readEvent = readCiEvent,
} = {}) {
  if (String(env.GITHUB_ACTIONS ?? "").toLowerCase() !== "true")
    return localWorktreePaths({ cwd, runGit });
  const { base, head } = ciCommitRange({ cwd, env, runGit, readEvent });
  return diffPaths({ cwd, base, head, runGit });
}
export function validateDiagnosticEvidenceStorageRetentionDecisionProposalWorktreeScope(
  paths,
  { env = process.env } = {},
) {
  const inGitHubActions = String(env.GITHUB_ACTIONS ?? "").toLowerCase() === "true";
  if (!inGitHubActions && Array.isArray(paths) && paths.length === 0) return [];
  if (
    Array.isArray(paths) &&
    paths.length === slice8ChangedPaths.length &&
    paths.every((value) => slice8ChangedPathSet.has(String(value).replaceAll("\\", "/")))
  ) {
    return validateEvidenceStorageRetentionDecisionProposalSlice8ChangedPaths(paths);
  }
  return validateEvidenceStorageRetentionDecisionProposalChangedPaths(paths);
}
export async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticEvidenceStorageRetentionPolicyDecisionProposal(),
    readDiagnosticEvidenceStorageRetentionPolicyDecisionProposalUpstream(),
  ]);
  const summary = validateDiagnosticEvidenceStorageRetentionPolicyDecisionProposal(
    artifact,
    upstream,
  );
  if (process.argv.includes("--check-worktree-scope")) {
    const paths = collectDiagnosticEvidenceStorageRetentionDecisionProposalChangedPaths();
    validateDiagnosticEvidenceStorageRetentionDecisionProposalWorktreeScope(paths);
  }
  console.log(
    `[curriculum] Evidence storage retention decision proposal ${summary.proposalArtifactVersion} validated: ${summary.evidenceTypePlaceholderCount} evidence types, ${summary.storageClassPlaceholderCount} storage classes, ${summary.unresolvedDecisionCount} unresolved decisions, ${summary.evidenceRecordCount} evidence records, ${summary.retentionScheduleCount} retention schedules, ${summary.deletionExecutionCount} deletion executions, ${summary.legalHoldCount} legal holds, ${summary.auditEventCount} audit events, ${summary.productionApprovalCount} production approvals; proposal ${summary.proposalStatus}, prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
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
