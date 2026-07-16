import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticProductionApprovalAuthorityPolicy,
  readDiagnosticProductionApprovalAuthorityPolicyUpstreamArtifacts,
  validateDiagnosticProductionApprovalAuthorityPolicy,
  validateProductionApprovalAuthorityPolicyChangedPaths,
} from "../scripts/validate-diagnostic-production-approval-authority-policy.mjs";

const expectedGateIds = [
  "methodology",
  "safety_no_answer",
  "rights_copyright",
  "grade_placement",
  "accessibility_readability",
];
const expectedRequirementIds = [
  "production_approver_role_and_eligibility",
  "approval_quorum_and_decision_aggregation",
  "required_substantive_gate_completion",
  "required_evidence_linkage_and_sufficiency",
  "required_candidate_canonicalization_and_digest_linkage",
  "required_audit_identity_linkage",
  "required_conflict_of_interest_clearance",
  "required_separation_of_duties_clearance",
  "production_authority_grant_and_lifecycle",
  "production_approval_decision_record_schema",
  "production_approval_revocation_withdrawal_and_reapproval",
  "production_approval_escalation_and_appeal",
];
const expectedChangedPaths = [
  "docs/wave-5/diagnostic-production-approval-authority-policy-contract.md",
  "docs/wave-5/slice-10-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-production-approval-authority-policy/grade-7-9-math.production-approval-authority-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
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
];
const protectedRecordFields = [
  "policyDecisionRecords",
  "realCandidateRecords",
  "approvedCandidateRecords",
  "digestValueRecords",
  "canonicalizationOutputRecords",
  "reviewEvidenceRecords",
  "evidenceFileRecords",
  "storageObjectRecords",
  "gateDecisionRecords",
  "gateCompletionRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "productionApproverRecords",
  "authorityGrantRecords",
  "quorumEvaluationRecords",
  "auditIdentityLinkRecords",
  "conflictClearanceRecords",
  "separationClearanceRecords",
  "approvalDecisionRecords",
  "approvedDecisionRecords",
  "productionApprovalRecords",
  "authorityRevocationRecords",
  "approvalWithdrawalRecords",
  "reapprovalRecords",
  "escalationRecords",
  "appealRecords",
  "auditLogRecords",
  "auditEventRecords",
];

async function loadFixture() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticProductionApprovalAuthorityPolicy(),
    readDiagnosticProductionApprovalAuthorityPolicyUpstreamArtifacts(),
  ]);
  return { artifact, upstream };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("production approval authority policy placeholder is valid and unresolved", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(validateDiagnosticProductionApprovalAuthorityPolicy(artifact, upstream), {
    policyArtifactVersion: "wave-5.slice-10.grade-7-9-math.v1",
    policyVersion: "wave-5.slice-10.diagnostic-production-approval-authority.placeholder.v1",
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
  });
});

test("production approval authority prerequisite remains exact and unsatisfied", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(artifact.prerequisiteReference, {
    prerequisiteId: "production_approval_authority",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future independent approval eligibility, quorum, explicit decision, withdrawal and re-approval policy with authorization tests.",
    evidenceRecordRefs: [],
  });
  for (const status of ["SATISFIED", "APPROVED", "ACTIVE"]) {
    const changed = clone(artifact);
    changed.prerequisiteReference.status = status;
    assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream));
  }
});

test("all exact Slice 2 through Slice 9 and Wave 4 pins remain unchanged", async () => {
  const { artifact, upstream } = await loadFixture();
  const mutations = [
    ["activationPrerequisites", "artifactVersion"],
    ["candidateIdentityPolicy", "artifactVersion"],
    ["candidateIdentityPolicy", "policyVersion"],
    ["canonicalizationDigestPolicy", "artifactVersion"],
    ["canonicalizationDigestPolicy", "policyVersion"],
    ["reviewerRoleOwnershipPolicy", "artifactVersion"],
    ["separationOfDutiesPolicy", "artifactVersion"],
    ["conflictOfInterestPolicy", "artifactVersion"],
    ["auditIdentityPolicy", "artifactVersion"],
    ["evidenceStorageRetentionPolicy", "artifactVersion"],
    ["reviewAuthority", "artifactVersion"],
    ["reviewWorkflowState", "artifactVersion"],
    ["reviewGateRubric", "artifactVersion"],
  ];
  for (const [group, field] of mutations) {
    const changed = clone(artifact);
    changed.dependencyReferences[group][field] = "wrong.version";
    assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream));
  }
  const changedUpstream = clone(upstream);
  changedUpstream.evidenceUpstream.auditUpstream.authority.productionApprovalAuthority.status =
    "ACTIVE";
  assert.throws(() =>
    validateDiagnosticProductionApprovalAuthorityPolicy(artifact, changedUpstream),
  );
});

test("production approver taxonomy remains one non-authorizing placeholder", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.equal(
    artifact.productionApproverRolePlaceholder.rolePlaceholderId,
    "PRODUCTION_APPROVER_PLACEHOLDER",
  );
  for (const [field, value] of [
    ["recordState", "ACTIVE"],
    ["roleOwnerReference", "owner-placeholder"],
    ["roleAssignmentAllowed", true],
    ["productionApprovalAuthorityAllowed", true],
  ]) {
    const changed = clone(artifact);
    changed.productionApproverRolePlaceholder[field] = value;
    assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream));
  }
});

test("approval quorum remains null undecided and disabled", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.equal(artifact.approvalQuorumPlaceholder.minimumApproverCount, null);
  for (const [field, value] of [
    ["minimumApproverCount", 1],
    ["quorumPolicyReference", "quorum-policy-placeholder"],
    ["quorumEvaluationAllowed", true],
    ["approvalAuthorizationAllowed", true],
  ]) {
    const changed = clone(artifact);
    changed.approvalQuorumPlaceholder[field] = value;
    assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream));
  }
});

test("exactly five substantive gates remain unevaluated placeholders", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(
    artifact.requiredGateCompletionPlaceholder.requiredGatePlaceholders.map((item) => item.gateId),
    expectedGateIds,
  );
  for (const mutation of [
    (changed) => changed.requiredGateCompletionPlaceholder.requiredGatePlaceholders.pop(),
    (changed) => {
      changed.requiredGateCompletionPlaceholder.requiredGatePlaceholders[0].gateId =
        "production_approval";
    },
    (changed) => {
      changed.requiredGateCompletionPlaceholder.requiredGatePlaceholders[0].gateCompletionRecorded = true;
    },
    (changed) => {
      changed.requiredGateCompletionPlaceholder.productionGateSelfSatisfactionAllowed = true;
    },
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream));
  }
});

test("evidence candidate digest and audit linkages remain value-free and disabled", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const [group, field, value] of [
    ["requiredEvidenceLinkagePlaceholder", "evidenceSufficiencyPolicyReference", "policy.v1"],
    ["requiredEvidenceLinkagePlaceholder", "evidenceLinkageAllowed", true],
    [
      "requiredCanonicalizationDigestLinkagePlaceholder",
      "candidateReferencePolicyReference",
      "candidate-ref",
    ],
    ["requiredCanonicalizationDigestLinkagePlaceholder", "digestGenerationAllowed", true],
    [
      "requiredAuditIdentityLinkagePlaceholder",
      "authorizationSnapshotPolicyReference",
      "snapshot-policy",
    ],
    ["requiredAuditIdentityLinkagePlaceholder", "auditIdentityReferenceRecordingAllowed", true],
  ]) {
    const changed = clone(artifact);
    changed[group][field] = value;
    assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream));
  }
});

test("conflict and separation clearances remain absent and non-bypassable", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const [group, field] of [
    ["requiredConflictClearancePlaceholder", "clearanceRecordingAllowed"],
    ["requiredConflictClearancePlaceholder", "conflictEvaluationAllowed"],
    ["requiredConflictClearancePlaceholder", "waiverAllowed"],
    ["requiredSeparationClearancePlaceholder", "clearanceRecordingAllowed"],
    ["requiredSeparationClearancePlaceholder", "identityComparisonAllowed"],
    ["requiredSeparationClearancePlaceholder", "missingGateSubstitutionAllowed"],
  ]) {
    const changed = clone(artifact);
    changed[group][field] = true;
    assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream));
  }
});

test("authority grant and approval decision schema remain placeholder-only", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const [group, field, value] of [
    ["authorityGrantPlaceholder", "grantSchemaReference", "grant-schema.v1"],
    ["authorityGrantPlaceholder", "authorityGrantIssuanceAllowed", true],
    ["authorityGrantPlaceholder", "productionApprovalAuthorityAllowed", true],
    ["approvalDecisionSchemaPlaceholder", "schemaVersionReference", "decision-schema.v1"],
    ["approvalDecisionSchemaPlaceholder", "decisionRecordCreationAllowed", true],
    ["approvalDecisionSchemaPlaceholder", "productionApprovalRecordingAllowed", true],
  ]) {
    const changed = clone(artifact);
    changed[group][field] = value;
    assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream));
  }
});

test("revocation withdrawal escalation and appeal remain disabled", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const [group, field] of [
    ["revocationWithdrawalPlaceholder", "authorityRevocationRecordingAllowed"],
    ["revocationWithdrawalPlaceholder", "approvalWithdrawalRecordingAllowed"],
    ["revocationWithdrawalPlaceholder", "reapprovalAllowed"],
    ["escalationAppealPlaceholder", "escalationRecordingAllowed"],
    ["escalationAppealPlaceholder", "appealRecordingAllowed"],
    ["escalationAppealPlaceholder", "decisionOverrideAllowed"],
    ["escalationAppealPlaceholder", "quorumBypassAllowed"],
  ]) {
    const changed = clone(artifact);
    changed[group][field] = true;
    assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream));
  }
});

test("exact twelve decision requirements remain unresolved", async () => {
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
    assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream));
  }
});

test("policy activation workflow and readiness remain blocked", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const [group, field, value] of [
    ["policyIdentity", "policyState", "APPROVED"],
    ["policyIdentity", "productionApprovalAuthorizationAllowed", true],
    ["activationBoundary", "status", "ACTIVE"],
    ["activationBoundary", "reviewWorkflowStatus", "ACTIVE"],
    ["readiness", "status", "READY"],
    ["readiness", "blockingReasons", []],
  ]) {
    const changed = clone(artifact);
    changed[group][field] = value;
    assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream));
  }
});

test("all protected records and matching aggregates remain zero", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const field of protectedRecordFields) {
    assert.deepEqual(artifact[field], [], field);
    const changed = clone(artifact);
    changed[field] = [{ recordState: "SYNTHETIC" }];
    assert.throws(
      () => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream),
      field,
    );
  }
  for (const field of Object.keys(artifact.aggregate).filter((field) => field.endsWith("Count"))) {
    if (
      [
        "productionApproverRolePlaceholderCount",
        "requiredSubstantiveGatePlaceholderCount",
        "decisionRequirementCount",
        "undecidedRequirementCount",
      ].includes(field)
    ) {
      continue;
    }
    assert.equal(artifact.aggregate[field], 0, field);
    const changed = clone(artifact);
    changed.aggregate[field] = 1;
    assert.throws(
      () => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream),
      field,
    );
  }
});

test("unknown fields forbidden terms and private values fail closed", async () => {
  const { artifact, upstream } = await loadFixture();
  const unknown = clone(artifact);
  unknown.metadata.extra = false;
  assert.throws(() => validateDiagnosticProductionApprovalAuthorityPolicy(unknown, upstream));

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
      () => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream),
      undefined,
      forbiddenTerm,
    );
  }

  for (const privateValue of [
    "approver@example.org",
    "https://example.org/approval",
    "s3://example-bucket/approval",
    "minio://example-bucket/approval",
    "file://approval.txt",
    "550e8400-e29b-41d4-a716-446655440000",
    "user-abcdef12",
    "account-abcdef12",
    "dcandidate.math.g7-9.example.v1",
    "0123456789abcdef0123456789abcdef",
  ]) {
    const changed = clone(artifact);
    changed.metadata.sourceContract = privateValue;
    assert.throws(
      () => validateDiagnosticProductionApprovalAuthorityPolicy(changed, upstream),
      undefined,
      privateValue,
    );
  }
});

test("Slice 10 worktree guard permits only the exact 36 implementation paths", () => {
  assert.equal(expectedChangedPaths.length, 36);
  assert.equal(new Set(expectedChangedPaths).size, 36);
  assert.deepEqual(
    validateProductionApprovalAuthorityPolicyChangedPaths(expectedChangedPaths),
    expectedChangedPaths,
  );
  for (const forbiddenPath of [
    "README.md",
    "docs/wave-5/slice-11-implementation-note.md",
    "docs/wave-5/archive/diagnostic-production-approval-authority-policy-contract.md",
    "docs/wave-5/diagnostic-production-approval-authority-policy-contract.md.bak",
    "packages/curriculum/diagnostic-production-approval-authority-policy/extra.json",
    "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs.bak",
    "packages/curriculum/src/production-approval/runtime.mjs",
    "apps/api/src/production-approval/production-approval.controller.ts",
    "apps/api/package.json",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/api/prisma/migrations/999_slice10/migration.sql",
    "apps/web/app/diagnostic-production-approval/page.tsx",
    "infra/docker/docker-compose.yml",
    "packages/curriculum/package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
  ]) {
    assert.throws(
      () => validateProductionApprovalAuthorityPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 10 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root test command registers the Slice 10 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");
  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  ]) {
    assert.equal(
      testCommand.split(exactRegistration).length - 1,
      1,
      `${exactRegistration} must occur exactly once`,
    );
  }
});

test("Slice 10 validator contains no broad documentation curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-production-approval-authority-policy.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
