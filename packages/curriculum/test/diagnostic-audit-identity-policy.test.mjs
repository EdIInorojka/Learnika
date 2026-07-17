import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticAuditIdentityPolicy,
  readDiagnosticAuditIdentityPolicyUpstreamArtifacts,
  validateAuditIdentityPolicyChangedPaths,
  validateDiagnosticAuditIdentityPolicy,
} from "../scripts/validate-diagnostic-audit-identity-policy.mjs";

const expectedRoleIds = [
  "METHODOLOGY_REVIEWER_PLACEHOLDER",
  "SAFETY_REVIEWER_PLACEHOLDER",
  "RIGHTS_REVIEWER_PLACEHOLDER",
  "GRADE_PLACEMENT_REVIEWER_PLACEHOLDER",
  "ACCESSIBILITY_REVIEWER_PLACEHOLDER",
  "PRODUCTION_APPROVER_PLACEHOLDER",
  "AUDIT_OBSERVER_PLACEHOLDER",
];
const expectedActorIds = [
  "SUBSTANTIVE_REVIEWER_AUDIT_ACTOR_PLACEHOLDER",
  "PRODUCTION_APPROVER_AUDIT_ACTOR_PLACEHOLDER",
  "AUDIT_OBSERVER_AUDIT_ACTOR_PLACEHOLDER",
];
const expectedRequirementIds = [
  "audit_actor_taxonomy",
  "audit_identity_binding",
  "pseudonymous_audit_reference",
  "reviewer_identity_separation",
  "audit_event_attribution",
  "audit_retention",
  "audit_access_control",
  "audit_redaction_and_privacy",
  "audit_export_and_review",
  "late_correction_and_amendment",
];
const protectedRecordFields = [
  "policyDecisionRecords",
  "realCandidateRecords",
  "digestValueRecords",
  "reviewEvidenceRecords",
  "realPrincipalRecords",
  "accountRecords",
  "serviceAccountRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "identityBindingRecords",
  "identityAliasRecords",
  "identityLookupRecords",
  "accessGrantRecords",
  "authorizationSnapshotRecords",
  "roleAssignmentRecords",
  "reviewerAssignmentRecords",
  "identityExpiryRecords",
  "identityRevocationRecords",
  "identityTombstoneRecords",
  "auditLogRecords",
  "auditEventRecords",
  "eventAttributionRecords",
  "auditAccessLogRecords",
  "auditExportRecords",
  "auditReviewRecords",
  "auditCorrectionRecords",
  "auditAmendmentRecords",
  "conflictRecords",
  "disclosureRecords",
  "recusalRecords",
  "waiverRecords",
  "exceptionRecords",
  "reviewDecisionRecords",
  "approvedDecisionRecords",
  "productionApprovalRecords",
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
];
const approvedSlice13ChangedPaths = [
  "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
  "docs/wave-5/slice-13-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy/grade-7-9-math.rollback-withdrawal-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
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
  "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticAuditIdentityPolicy(),
    readDiagnosticAuditIdentityPolicyUpstreamArtifacts(),
  ]);
  return { artifact, upstream };
}

function validate(artifacts, artifact = artifacts.artifact, upstream = artifacts.upstream) {
  return validateDiagnosticAuditIdentityPolicy(artifact, upstream);
}

test("audit identity policy placeholder is valid and unresolved", async () => {
  const artifacts = await readArtifacts();
  const summary = validate(artifacts);
  assert.deepEqual(summary, {
    policyArtifactVersion: "wave-5.slice-8.grade-7-9-math.v1",
    policyVersion: "wave-5.slice-8.diagnostic-audit-identity.placeholder.v1",
    policyState: "UNRESOLVED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    rolePlaceholderCount: 7,
    auditActorPlaceholderCount: 3,
    decisionRequirementCount: 10,
    activeIdentityRuleCount: 0,
    realPrincipalCount: 0,
    accountRecordCount: 0,
    reviewerIdentityCount: 0,
    auditIdentityCount: 0,
    identityBindingCount: 0,
    auditLogCount: 0,
    auditEventCount: 0,
    approvedDecisionCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("audit identity prerequisite remains exact unchanged and unsatisfied", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(artifacts.artifact.prerequisiteReference, {
    prerequisiteId: "audit_identity_policy",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future opaque identity binding, authorization, revocation, controlled lookup, access and privacy policy with synthetic validation.",
    evidenceRecordRefs: [],
  });
  for (const [field, value] of [
    ["status", "SATISFIED"],
    ["ownerPlaceholderId", "ASSIGNED_OWNER"],
    ["evidenceRequirementDescription", "Changed evidence."],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.prerequisiteReference[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("all exact Slice 2 Slice 5 Slice 6 Slice 7 and Wave 4 pins remain unchanged", async () => {
  const artifacts = await readArtifacts();
  const cases = [
    ["activationPrerequisites", "artifactVersion", "wave-5.slice-2.grade-7-9-math.v2"],
    ["reviewerRoleOwnershipPolicy", "artifactVersion", "wave-5.slice-5.grade-7-9-math.v2"],
    ["separationOfDutiesPolicy", "artifactVersion", "wave-5.slice-6.grade-7-9-math.v2"],
    ["conflictOfInterestPolicy", "artifactVersion", "wave-5.slice-7.grade-7-9-math.v2"],
    ["reviewAuthority", "artifactVersion", "wave-4.slice-8.grade-7-9-math.v2"],
    ["reviewWorkflowState", "artifactVersion", "wave-4.slice-7.grade-7-9-math.v2"],
  ];
  for (const [dependency, field, value] of cases) {
    const invalid = clone(artifacts.artifact);
    invalid.dependencyReferences[dependency][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(dependency));
  }
});

test("role taxonomy remains exactly seven non-authorizing placeholders", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.roleTaxonomyPlaceholders.map((role) => role.rolePlaceholderId),
    expectedRoleIds,
  );
  for (const role of artifacts.artifact.roleTaxonomyPlaceholders) {
    assert.equal(role.recordState, "PLACEHOLDER_ONLY");
    assert.equal(role.identityPolicyReference, null);
    assert.equal(role.assignmentPolicyReference, null);
    assert.equal(role.identityLookupAllowed, false);
    assert.equal(role.auditDecisionAuthorityAllowed, false);
    assert.equal(role.reviewDecisionAuthorityAllowed, false);
    assert.equal(role.productionApprovalAuthorityAllowed, false);
  }
});

test("audit actor taxonomy is exactly three abstract placeholder classes", async () => {
  const artifacts = await readArtifacts();
  const actors = artifacts.artifact.auditActorTaxonomyPlaceholders;
  assert.deepEqual(
    actors.map((actor) => actor.actorPlaceholderId),
    expectedActorIds,
  );
  assert.deepEqual(actors[0].rolePlaceholderIds, expectedRoleIds.slice(0, 5));
  assert.deepEqual(actors[1].rolePlaceholderIds, ["PRODUCTION_APPROVER_PLACEHOLDER"]);
  assert.deepEqual(actors[2].rolePlaceholderIds, ["AUDIT_OBSERVER_PLACEHOLDER"]);
  for (const actor of actors) {
    assert.equal(actor.recordState, "PLACEHOLDER_ONLY");
    assert.equal(actor.realPrincipalAllowed, false);
    assert.equal(actor.accountBindingAllowed, false);
    assert.equal(actor.auditEventProductionAllowed, false);
    assert.equal(actor.identityLookupAllowed, false);
  }
});

test("exact ten unique decision requirements remain unresolved", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.decisionRequirements.map((item) => item.requirementId),
    expectedRequirementIds,
  );
  for (const requirement of artifacts.artifact.decisionRequirements) {
    assert.deepEqual(requirement, {
      requirementId: requirement.requirementId,
      state: "TO_BE_DECIDED",
      decisionReference: null,
      policyReference: null,
      activeRuleReferences: [],
      decisionRecorded: false,
    });
  }
  const duplicate = clone(artifacts.artifact);
  duplicate.decisionRequirements[1].requirementId = duplicate.decisionRequirements[0].requirementId;
  assert.throws(() => validate(artifacts, duplicate), /requirementId/);
});

test("identity binding and pseudonymous references remain unallocated and disabled", async () => {
  const artifacts = await readArtifacts();
  for (const [section, field] of [
    ["auditIdentityBindingPlaceholder", "identityAllocationAllowed"],
    ["auditIdentityBindingPlaceholder", "principalBindingAllowed"],
    ["auditIdentityBindingPlaceholder", "accountBindingAllowed"],
    ["auditIdentityBindingPlaceholder", "controlledLookupAllowed"],
    ["pseudonymousAuditReferencePlaceholder", "opaqueReferenceIssuanceAllowed"],
    ["pseudonymousAuditReferencePlaceholder", "realIdentityEmbeddingAllowed"],
    ["pseudonymousAuditReferencePlaceholder", "controlledLookupAllowed"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[section][field] = true;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("reviewer and audit identity domains remain separate and non-authorizing", async () => {
  const artifacts = await readArtifacts();
  const section = artifacts.artifact.reviewerIdentitySeparationPlaceholder;
  assert.deepEqual(section.reviewDecisionRolePlaceholderIds, expectedRoleIds.slice(0, 6));
  for (const field of [
    "crossDomainLinkageAllowed",
    "identityDomainSubstitutionAllowed",
    "runtimeIdentityComparisonAllowed",
    "auditObserverReviewDecisionAllowed",
    "auditObserverProductionApprovalAllowed",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.reviewerIdentitySeparationPlaceholder[field] = true;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("audit event attribution logging and authorization snapshots remain disabled", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "auditLogRecordingAllowed",
    "auditEventRecordingAllowed",
    "realAuditIdentityAttributionAllowed",
    "reviewerIdentityAttributionAllowed",
    "authorizationSnapshotRecordingAllowed",
    "runtimeEventGenerationAllowed",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.auditEventAttributionPlaceholder[field] = true;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("retention access and privacy capabilities remain deferred", async () => {
  const artifacts = await readArtifacts();
  for (const [section, field] of [
    ["auditRetentionPlaceholder", "auditStorageAllowed"],
    ["auditRetentionPlaceholder", "retentionEnforcementAllowed"],
    ["auditAccessControlPlaceholder", "controlledLookupAllowed"],
    ["auditAccessControlPlaceholder", "emergencyAccessAllowed"],
    ["auditRedactionPrivacyPlaceholder", "personalDetailsRecordingAllowed"],
    ["auditRedactionPrivacyPlaceholder", "authenticationMaterialRecordingAllowed"],
    ["auditRedactionPrivacyPlaceholder", "ordinaryCurriculumStorageAllowed"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[section][field] = true;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("export review correction and amendment remain disabled", async () => {
  const artifacts = await readArtifacts();
  for (const [section, field] of [
    ["auditExportReviewPlaceholder", "auditExportAllowed"],
    ["auditExportReviewPlaceholder", "auditReviewAllowed"],
    ["auditExportReviewPlaceholder", "productionDecisionAuthorizationAllowed"],
    ["lateCorrectionAmendmentPlaceholder", "silentMutationAllowed"],
    ["lateCorrectionAmendmentPlaceholder", "correctionRecordingAllowed"],
    ["lateCorrectionAmendmentPlaceholder", "amendmentRecordingAllowed"],
    ["lateCorrectionAmendmentPlaceholder", "productionApprovalChangeAllowed"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[section][field] = true;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("policy activation workflow and readiness remain blocked", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(artifacts.artifact.readiness, {
    policyVersion: "wave-3-slice-11-diagnostic-readiness-policy-v1",
    status: "NOT_READY",
    blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
  });
  for (const [section, field, value] of [
    ["activationBoundary", "status", "ACTIVE"],
    ["activationBoundary", "reviewWorkflowStatus", "ACTIVE"],
    ["activationBoundary", "activationAllowed", true],
    ["activationBoundary", "reviewWorkflowActivationAllowed", true],
    ["activationBoundary", "productionApprovalAllowed", true],
    ["policyIdentity", "policyState", "ACTIVE"],
    ["policyIdentity", "auditRecordingAllowed", true],
    ["readiness", "status", "READY"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[section][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("all protected records and matching aggregates remain zero", async () => {
  const artifacts = await readArtifacts();
  for (const field of protectedRecordFields) {
    assert.deepEqual(artifacts.artifact[field], [], field);
    const invalid = clone(artifacts.artifact);
    invalid[field].push({ placeholder: "blocked" });
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
  for (const [key, value] of Object.entries(artifacts.artifact.aggregate)) {
    if (
      ![
        "rolePlaceholderCount",
        "auditActorPlaceholderCount",
        "decisionRequirementCount",
        "undecidedRequirementCount",
      ].includes(key)
    ) {
      assert.equal(value, 0, key);
    }
  }
});

test("unknown fields forbidden terms and private identity patterns fail closed", async () => {
  const artifacts = await readArtifacts();
  const unknown = clone(artifacts.artifact);
  unknown.unexpected = false;
  assert.throws(() => validate(artifacts, unknown), /unexpected field/);

  for (const term of forbiddenTerms) {
    const forbiddenField = clone(artifacts.artifact);
    forbiddenField[term] = "blocked";
    assert.throws(() => validate(artifacts, forbiddenField), /forbidden field term/, term);

    const forbiddenContent = clone(artifacts.artifact);
    forbiddenContent.metadata.status = `blocked ${term}`;
    assert.throws(() => validate(artifacts, forbiddenContent), /forbidden content term/, term);
  }

  for (const [value, pattern] of [
    ["person@example.invalid", /email-like value/],
    ["123e4567-e89b-42d3-a456-426614174000", /UUID-like value/],
    ["user-12345678", /user-id-like value/],
    ["account-12345678", /account-id-like value/],
    ["principal-12345678", /private identity-like value/],
    ["service-account-123456", /service-account-like value/],
    ["dcandidate.math.g7-9.algebra.example.v1", /concrete candidate ID/],
    ["0123456789abcdef0123456789abcdef", /hash-like value/],
    ["token:supersecret", /credential-like value/],
    ["192.168.10.20", /IP-address-like value/],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.metadata.status = value;
    assert.throws(() => validate(artifacts, invalid), pattern, value);
  }
});

test("Slice 8 worktree guard permits only the exact 42 Slice 13 implementation paths", () => {
  assert.deepEqual(
    validateAuditIdentityPolicyChangedPaths(approvedSlice13ChangedPaths),
    approvedSlice13ChangedPaths,
  );
  for (const forbiddenPath of [
    "README.md",
    "docs/wave-5/slice-14-implementation-note.md",
    "docs/wave-5/nested/diagnostic-audit-identity-policy-contract.md",
    "docs/wave-5/diagnostic-audit-identity-policy-contract.md.bak",
    "packages/curriculum/diagnostic-audit-identity-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/audit-identity.ts",
    "apps/api/package.json",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/api/prisma/migrations/next/migration.sql",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-audit-identity-runtime.ts",
    "packages/curriculum/package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
  ]) {
    assert.throws(
      () => validateAuditIdentityPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 13 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root test command registers the Slice 8 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");
  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs",
  ]) {
    assert.equal(
      testCommand.split(exactRegistration).length - 1,
      1,
      `${exactRegistration} must occur exactly once`,
    );
  }
});

test("Slice 8 validator contains no broad documentation curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL("../scripts/validate-diagnostic-audit-identity-policy.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
