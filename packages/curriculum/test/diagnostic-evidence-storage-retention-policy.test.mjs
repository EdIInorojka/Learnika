import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticEvidenceStorageRetentionPolicy,
  readDiagnosticEvidenceStorageRetentionPolicyUpstreamArtifacts,
  validateDiagnosticEvidenceStorageRetentionPolicy,
  validateEvidenceStorageRetentionPolicyChangedPaths,
} from "../scripts/validate-diagnostic-evidence-storage-retention-policy.mjs";

const expectedEvidenceTypeIds = [
  "METHODOLOGY_EVIDENCE_PLACEHOLDER",
  "SAFETY_NO_ANSWER_EVIDENCE_PLACEHOLDER",
  "RIGHTS_COPYRIGHT_EVIDENCE_PLACEHOLDER",
  "GRADE_PLACEMENT_EVIDENCE_PLACEHOLDER",
  "ACCESSIBILITY_READABILITY_EVIDENCE_PLACEHOLDER",
  "PRODUCTION_APPROVAL_SUPPORTING_EVIDENCE_PLACEHOLDER",
];
const expectedStorageClassIds = [
  "REVIEW_EVIDENCE_STORAGE_CLASS_PLACEHOLDER",
  "RIGHTS_SENSITIVE_EVIDENCE_STORAGE_CLASS_PLACEHOLDER",
  "IDENTITY_LINKAGE_STORAGE_CLASS_PLACEHOLDER",
];
const expectedRequirementIds = [
  "evidence_type_taxonomy",
  "evidence_reference_format",
  "evidence_storage_location_and_classification",
  "evidence_retention_period",
  "evidence_deletion_withdrawal_and_tombstone",
  "evidence_legal_hold",
  "evidence_access_control_and_least_privilege",
  "evidence_redaction_privacy_and_data_minimization",
  "evidence_integrity_and_checksum",
  "evidence_audit_trail",
  "evidence_export_and_review",
];
const expectedChangedPaths = [
  "docs/wave-5/diagnostic-evidence-storage-retention-policy-contract.md",
  "docs/wave-5/slice-9-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy/grade-7-9-math.evidence-storage-retention-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
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
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];
const protectedRecordFields = [
  "policyDecisionRecords",
  "realCandidateRecords",
  "digestValueRecords",
  "reviewEvidenceRecords",
  "evidenceReferenceRecords",
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
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "conflictRecords",
  "disclosureRecords",
  "recusalRecords",
  "waiverRecords",
  "exceptionRecords",
  "reviewDecisionRecords",
  "approvedDecisionRecords",
  "productionApprovalRecords",
];

async function loadFixture() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticEvidenceStorageRetentionPolicy(),
    readDiagnosticEvidenceStorageRetentionPolicyUpstreamArtifacts(),
  ]);
  return { artifact, upstream };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("evidence storage and retention policy placeholder is valid and unresolved", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(validateDiagnosticEvidenceStorageRetentionPolicy(artifact, upstream), {
    policyArtifactVersion: "wave-5.slice-9.grade-7-9-math.v1",
    policyVersion: "wave-5.slice-9.diagnostic-evidence-storage-and-retention.placeholder.v1",
    policyState: "UNRESOLVED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    evidenceTypePlaceholderCount: 6,
    storageClassPlaceholderCount: 3,
    decisionRequirementCount: 11,
    activeStorageRuleCount: 0,
    reviewEvidenceRecordCount: 0,
    evidenceFileCount: 0,
    storageObjectCount: 0,
    retentionScheduleCount: 0,
    deletionRequestCount: 0,
    legalHoldCount: 0,
    auditLogCount: 0,
    auditEventCount: 0,
    approvedDecisionCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("evidence storage prerequisite remains exact unchanged and unsatisfied", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(artifact.prerequisiteReference, {
    prerequisiteId: "evidence_storage_and_retention_policy",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future evidence schema, integrity pins, access controls, retention and deletion matrix, recovery and orphan-reference tests.",
    evidenceRecordRefs: [],
  });
  for (const status of ["SATISFIED", "APPROVED", "ACTIVE"]) {
    const changed = clone(artifact);
    changed.prerequisiteReference.status = status;
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream));
  }
});

test("all exact Slice 2 Slice 5 through Slice 8 and Wave 4 pins remain unchanged", async () => {
  const { artifact, upstream } = await loadFixture();
  const mutations = [
    ["activationPrerequisites", "artifactVersion"],
    ["reviewEvidencePlaceholder", "artifactVersion"],
    ["auditIdentityPolicy", "artifactVersion"],
    ["auditIdentityPolicy", "policyVersion"],
    ["conflictOfInterestPolicy", "artifactVersion"],
    ["separationOfDutiesPolicy", "artifactVersion"],
    ["reviewerRoleOwnershipPolicy", "artifactVersion"],
    ["reviewAuthority", "artifactVersion"],
    ["reviewWorkflowState", "artifactVersion"],
  ];
  for (const [group, field] of mutations) {
    const changed = clone(artifact);
    changed.dependencyReferences[group][field] = "wrong.version";
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream));
  }
  const changedUpstream = clone(upstream);
  changedUpstream.auditUpstream.evidence.metadata.evidenceArtifactVersion = "wrong.version";
  assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(artifact, changedUpstream));
});

test("evidence taxonomy remains exactly six non-authorizing placeholders", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(
    artifact.evidenceTypeTaxonomyPlaceholders.map((item) => item.evidenceTypePlaceholderId),
    expectedEvidenceTypeIds,
  );
  for (const mutation of [
    (changed) => changed.evidenceTypeTaxonomyPlaceholders.pop(),
    (changed) => {
      changed.evidenceTypeTaxonomyPlaceholders[0].evidenceCollectionAllowed = true;
    },
    (changed) => {
      changed.evidenceTypeTaxonomyPlaceholders[0].evidenceSchemaReference = "schema.v1";
    },
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream));
  }
});

test("storage classification taxonomy is exactly three inactive placeholders", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(
    artifact.storageClassificationPlaceholders.map((item) => item.storageClassPlaceholderId),
    expectedStorageClassIds,
  );
  for (const mutation of [
    (changed) => changed.storageClassificationPlaceholders.reverse(),
    (changed) => {
      changed.storageClassificationPlaceholders[0].locationReference = "region-placeholder";
    },
    (changed) => {
      changed.storageClassificationPlaceholders[0].objectCreationAllowed = true;
    },
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream));
  }
});

test("exact eleven unique decision requirements remain unresolved", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(
    artifact.decisionRequirements.map((item) => item.requirementId),
    expectedRequirementIds,
  );
  for (const mutation of [
    (changed) => changed.decisionRequirements.pop(),
    (changed) => {
      changed.decisionRequirements[0].state = "DECIDED";
    },
    (changed) => {
      changed.decisionRequirements[0].decisionRecorded = true;
    },
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream));
  }
});

test("evidence references remain unallocated content-free and disabled", async () => {
  const { artifact, upstream } = await loadFixture();
  const placeholder = artifact.evidenceReferenceFormatPlaceholder;
  assert.equal(placeholder.referenceFormat, null);
  assert.equal(placeholder.evidenceReferenceIssuanceAllowed, false);
  for (const [field, value] of [
    ["referenceFormat", "reference-placeholder"],
    ["storageAddressEmbeddingAllowed", true],
    ["controlledLookupAllowed", true],
  ]) {
    const changed = clone(artifact);
    changed.evidenceReferenceFormatPlaceholder[field] = value;
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream));
  }
});

test("retention deletion withdrawal and legal hold remain deferred and disabled", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const [group, field, value] of [
    ["retentionPeriodPlaceholder", "durationValue", 30],
    ["retentionPeriodPlaceholder", "retentionScheduleCreationAllowed", true],
    ["deletionWithdrawalPlaceholder", "deletionRequestAllowed", true],
    ["deletionWithdrawalPlaceholder", "withdrawalRecordingAllowed", true],
    ["legalHoldPlaceholder", "legalHoldRecordingAllowed", true],
    ["legalHoldPlaceholder", "deletionBlockingAllowed", true],
  ]) {
    const changed = clone(artifact);
    changed[group][field] = value;
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream));
  }
});

test("access privacy and redaction capabilities remain disabled", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const [group, field] of [
    ["accessControlPlaceholder", "evidenceReadAllowed"],
    ["accessControlPlaceholder", "evidenceExportAllowed"],
    ["accessControlPlaceholder", "runtimeAuthorizationAllowed"],
    ["evidenceRedactionPrivacyPlaceholder", "learnerPersonalDataRecordingAllowed"],
    ["evidenceRedactionPrivacyPlaceholder", "reviewerPersonalDataRecordingAllowed"],
    ["evidenceRedactionPrivacyPlaceholder", "runtimeRedactionAllowed"],
  ]) {
    const changed = clone(artifact);
    changed[group][field] = true;
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream));
  }
});

test("integrity audit trail export and review remain value-free and disabled", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const [group, field, value] of [
    ["evidenceIntegrityChecksumPlaceholder", "checksumAlgorithmReference", "algorithm.v1"],
    ["evidenceIntegrityChecksumPlaceholder", "checksumGenerationAllowed", true],
    ["evidenceAuditTrailPlaceholder", "auditLogRecordingAllowed", true],
    ["evidenceAuditTrailPlaceholder", "auditEventRecordingAllowed", true],
    ["evidenceExportReviewPlaceholder", "evidenceExportAllowed", true],
    ["evidenceExportReviewPlaceholder", "evidenceReviewAllowed", true],
  ]) {
    const changed = clone(artifact);
    changed[group][field] = value;
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream));
  }
});

test("policy activation workflow and readiness remain blocked", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const [group, field, value] of [
    ["policyIdentity", "policyState", "APPROVED"],
    ["policyIdentity", "evidenceStorageAllowed", true],
    ["activationBoundary", "status", "ACTIVE"],
    ["activationBoundary", "reviewWorkflowStatus", "ACTIVE"],
    ["readiness", "status", "READY"],
    ["readiness", "blockingReasons", []],
  ]) {
    const changed = clone(artifact);
    changed[group][field] = value;
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream));
  }
});

test("all protected records and matching aggregates remain zero", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const field of protectedRecordFields) {
    assert.deepEqual(artifact[field], [], field);
    const changed = clone(artifact);
    changed[field] = [{ recordState: "SYNTHETIC" }];
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream), field);
  }
  for (const field of Object.keys(artifact.aggregate).filter((field) => field.endsWith("Count"))) {
    if (
      [
        "evidenceTypePlaceholderCount",
        "storageClassPlaceholderCount",
        "decisionRequirementCount",
        "undecidedRequirementCount",
      ].includes(field)
    ) {
      continue;
    }
    assert.equal(artifact.aggregate[field], 0, field);
    const changed = clone(artifact);
    changed.aggregate[field] = 1;
    assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream), field);
  }
});

test("unknown fields forbidden terms and private values fail closed", async () => {
  const { artifact, upstream } = await loadFixture();
  const unknown = clone(artifact);
  unknown.metadata.extra = false;
  assert.throws(() => validateDiagnosticEvidenceStorageRetentionPolicy(unknown, upstream));

  for (const forbiddenTerm of [
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
  ]) {
    const changed = clone(artifact);
    changed.metadata[forbiddenTerm] = "forbidden";
    assert.throws(
      () => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream),
      undefined,
      forbiddenTerm,
    );
  }

  for (const privateValue of [
    "reviewer@example.org",
    "https://example.org/evidence",
    "s3://example-bucket/evidence",
    "minio://example-bucket/evidence",
    "file://evidence.txt",
    "550e8400-e29b-41d4-a716-446655440000",
    "user-abcdef12",
    "account-abcdef12",
    "dcandidate.math.g7-9.example.v1",
    "0123456789abcdef0123456789abcdef",
  ]) {
    const changed = clone(artifact);
    changed.metadata.sourceContract = privateValue;
    assert.throws(
      () => validateDiagnosticEvidenceStorageRetentionPolicy(changed, upstream),
      undefined,
      privateValue,
    );
  }
});

test("Slice 9 worktree guard permits only the exact 34 implementation paths", () => {
  assert.equal(expectedChangedPaths.length, 34);
  assert.equal(new Set(expectedChangedPaths).size, 34);
  assert.deepEqual(
    validateEvidenceStorageRetentionPolicyChangedPaths(expectedChangedPaths),
    expectedChangedPaths,
  );
  for (const forbiddenPath of [
    "README.md",
    "docs/wave-5/slice-10-implementation-note.md",
    "docs/wave-5/archive/diagnostic-evidence-storage-retention-policy-contract.md",
    "docs/wave-5/diagnostic-evidence-storage-retention-policy-contract.md.bak",
    "packages/curriculum/diagnostic-evidence-storage-retention-policy/extra.json",
    "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs.bak",
    "packages/curriculum/src/evidence-storage/runtime.mjs",
    "apps/api/src/evidence-storage/evidence-storage.controller.ts",
    "apps/api/package.json",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/api/prisma/migrations/999_slice9/migration.sql",
    "apps/web/app/diagnostic-review/page.tsx",
    "infra/docker/docker-compose.yml",
    "packages/curriculum/package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
  ]) {
    assert.throws(
      () => validateEvidenceStorageRetentionPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 9 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root test command registers the Slice 9 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");
  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs",
  ]) {
    assert.equal(
      testCommand.split(exactRegistration).length - 1,
      1,
      `${exactRegistration} must occur exactly once`,
    );
  }
});

test("Slice 9 validator contains no broad documentation curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
