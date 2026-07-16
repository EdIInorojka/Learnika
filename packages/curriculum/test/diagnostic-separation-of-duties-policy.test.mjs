import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "../scripts/validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateCanonicalizationDigestPolicy } from "../scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs";
import { readDiagnosticCandidateDigestRegistry } from "../scripts/validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticCandidateIdentityPolicy } from "../scripts/validate-diagnostic-candidate-identity-policy.mjs";
import { readDiagnosticReviewActivationPrerequisites } from "../scripts/validate-diagnostic-review-activation-prerequisites.mjs";
import { readDiagnosticReviewAuthority } from "../scripts/validate-diagnostic-review-authority.mjs";
import { readDiagnosticReviewCoverage } from "../scripts/validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "../scripts/validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "../scripts/validate-diagnostic-review-gate-rubric.mjs";
import { readDiagnosticReviewWorkflowState } from "../scripts/validate-diagnostic-review-workflow-state.mjs";
import { readDiagnosticReviewerRoleOwnershipPolicy } from "../scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs";
import {
  readDiagnosticSeparationOfDutiesPolicy,
  validateDiagnosticSeparationOfDutiesPolicy,
  validateSeparationOfDutiesPolicyChangedPaths,
} from "../scripts/validate-diagnostic-separation-of-duties-policy.mjs";

const expectedRoleIds = [
  "METHODOLOGY_REVIEWER_PLACEHOLDER",
  "SAFETY_REVIEWER_PLACEHOLDER",
  "RIGHTS_REVIEWER_PLACEHOLDER",
  "GRADE_PLACEMENT_REVIEWER_PLACEHOLDER",
  "ACCESSIBILITY_REVIEWER_PLACEHOLDER",
  "PRODUCTION_APPROVER_PLACEHOLDER",
  "AUDIT_OBSERVER_PLACEHOLDER",
];
const expectedRuleIds = [
  "SUBSTANTIVE_REVIEWER_SEPARATE_FROM_PRODUCTION_APPROVER",
  "AUDIT_OBSERVER_SEPARATE_FROM_DECISION_ROLES",
  "NO_SELF_REVIEW_OR_SELF_APPROVAL",
];
const expectedDecisionRequirementIds = [
  "incompatible_role_combinations",
  "maker_checker_separation",
  "production_approver_separation",
  "reviewer_self_approval_prohibition",
  "candidate_author_and_reviewer_separation",
  "audit_observer_separation",
  "separation_enforcement_authority",
  "separation_violation_handling",
  "separation_waiver_and_exception_policy",
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
  "immutableDigest",
  "sha256",
  "contentHash",
  "canonicalizedContent",
  "normalizedStem",
];
const protectedRecordFields = [
  "policyDecisionRecords",
  "realCandidateRecords",
  "candidateAuthorshipRecords",
  "digestValueRecords",
  "reviewEvidenceRecords",
  "candidateAuthorIdentityRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "roleAssignmentRecords",
  "reviewerAssignmentRecords",
  "conflictRecords",
  "violationRecords",
  "waiverRecords",
  "exceptionRecords",
  "enforcementAuthorityAssignmentRecords",
  "activeEnforcementRuleRecords",
  "reviewDecisionRecords",
  "approvedDecisionRecords",
  "productionApprovalRecords",
];
const approvedSlice10ChangedPaths = [
  "docs/wave-5/diagnostic-production-approval-authority-policy-contract.md",
  "docs/wave-5/slice-10-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-production-approval-authority-policy/grade-7-9-math.production-approval-authority-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
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
  const [
    artifact,
    roleOwnershipPolicy,
    canonicalizationDigestPolicy,
    identityPolicy,
    activationPrerequisites,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    authority,
  ] = await Promise.all([
    readDiagnosticSeparationOfDutiesPolicy(),
    readDiagnosticReviewerRoleOwnershipPolicy(),
    readDiagnosticCandidateCanonicalizationDigestPolicy(),
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
  return {
    artifact,
    roleOwnershipPolicy,
    canonicalizationDigestPolicy,
    identityPolicy,
    activationPrerequisites,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    authority,
  };
}

function validate(artifacts, artifact = artifacts.artifact) {
  return validateDiagnosticSeparationOfDutiesPolicy(
    artifact,
    artifacts.roleOwnershipPolicy,
    artifacts.canonicalizationDigestPolicy,
    artifacts.identityPolicy,
    artifacts.activationPrerequisites,
    artifacts.coverage,
    artifacts.evidence,
    artifacts.rubric,
    artifacts.registry,
    artifacts.canonicalization,
    artifacts.workflow,
    artifacts.authority,
  );
}

test("separation-of-duties policy placeholder is valid and unresolved", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    policyArtifactVersion: "wave-5.slice-6.grade-7-9-math.v1",
    policyVersion: "wave-5.slice-6.diagnostic-separation-of-duties-enforcement.placeholder.v1",
    policyState: "UNRESOLVED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    rolePlaceholderCount: 7,
    incompatibleRulePlaceholderCount: 3,
    decisionRequirementCount: 9,
    activeEnforcementRuleCount: 0,
    reviewerIdentityCount: 0,
    reviewerAssignmentCount: 0,
    conflictRecordCount: 0,
    violationRecordCount: 0,
    waiverRecordCount: 0,
    approvedDecisionCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("separation prerequisite remains exact unchanged and unsatisfied", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["status", "SATISFIED"],
    ["ownerPlaceholderId", "ASSIGNED_OWNER"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.prerequisiteReference[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
  const evidence = clone(artifacts.artifact);
  evidence.prerequisiteReference.evidenceRecordRefs.push("future-evidence");
  assert.throws(() => validate(artifacts, evidence), /must contain exactly 0 values/);

  const upstream = clone(artifacts);
  const prerequisite = upstream.activationPrerequisites.prerequisites.find(
    ({ prerequisiteId }) => prerequisiteId === "separation_of_duties_enforcement",
  );
  prerequisite.status = "SATISFIED";
  assert.throws(() => validate(upstream), /UNSATISFIED_DEFERRED|exact unsatisfied prerequisite/);
});

test("exact Slice 2 Slice 5 and Wave 4 pins remain unchanged", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["activationPrerequisitesArtifactVersion", "wave-5.slice-2.changed"],
    ["reviewerRoleOwnershipPolicyArtifactVersion", "wave-5.slice-5.changed"],
    ["reviewAuthorityArtifactVersion", "wave-4.slice-8.changed"],
    ["reviewWorkflowStateArtifactVersion", "wave-4.slice-7.changed"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.metadata[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
  const rolePolicy = clone(artifacts.artifact);
  rolePolicy.dependencyReferences.reviewerRoleOwnershipPolicy.policyState = "ACTIVE";
  assert.throws(() => validate(artifacts, rolePolicy), /policyState/);
  const workflow = clone(artifacts.artifact);
  workflow.dependencyReferences.reviewWorkflowState.runtimeActivationAllowed = true;
  assert.throws(() => validate(artifacts, workflow), /runtimeActivationAllowed/);
});

test("taxonomy remains exactly seven role placeholders without an author role", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.roleTaxonomyPlaceholders.map(({ rolePlaceholderId }) => rolePlaceholderId),
    expectedRoleIds,
  );
  assert.equal(
    artifacts.artifact.makerCheckerSeparationPlaceholder.makerActorClassPlaceholder,
    "CANDIDATE_AUTHOR_ACTOR_PLACEHOLDER",
  );
  const extra = clone(artifacts.artifact);
  extra.roleTaxonomyPlaceholders.push({ rolePlaceholderId: "CANDIDATE_AUTHOR" });
  assert.throws(() => validate(artifacts, extra), /must contain exactly 7 values/);
});

test("three Wave 4 separation requirements remain reference-only", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.incompatibleRoleCombinationsPlaceholders.map(({ ruleId }) => ruleId),
    expectedRuleIds,
  );
  for (const [field, value] of [
    ["ruleState", "ACTIVE"],
    ["enforcementPolicyReference", "policy.v1"],
    ["runtimeEvaluationAllowed", true],
    ["decisionAuthorizationAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.incompatibleRoleCombinationsPlaceholders[0][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("exact nine unique decision requirements remain unresolved", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.decisionRequirements.map(({ requirementId }) => requirementId),
    expectedDecisionRequirementIds,
  );
  const missing = clone(artifacts.artifact);
  missing.decisionRequirements.pop();
  assert.throws(() => validate(artifacts, missing), /must contain exactly 9 values/);
  const decided = clone(artifacts.artifact);
  decided.decisionRequirements[0].state = "APPROVED";
  assert.throws(() => validate(artifacts, decided), /state/);
  const duplicated = clone(artifacts.artifact);
  duplicated.decisionRequirements[8] = clone(duplicated.decisionRequirements[0]);
  assert.throws(() => validate(artifacts, duplicated), /requirementId/);
});

test("maker checker author reviewer approver and audit separation stay inactive", async () => {
  const artifacts = await readArtifacts();
  for (const [objectName, field, value] of [
    ["makerCheckerSeparationPlaceholder", "identityComparisonPolicyReference", "policy.v1"],
    ["makerCheckerSeparationPlaceholder", "assignmentTimeEvaluationAllowed", true],
    ["makerCheckerSeparationPlaceholder", "decisionTimeEvaluationAllowed", true],
    ["productionApproverSeparationPlaceholder", "reviewerProductionApprovalAllowed", true],
    ["productionApproverSeparationPlaceholder", "enforcementAllowed", true],
    ["reviewerSelfApprovalProhibitionPlaceholder", "selfReviewAllowed", true],
    ["reviewerSelfApprovalProhibitionPlaceholder", "enforcementAllowed", true],
    ["candidateAuthorReviewerSeparationPlaceholder", "candidateAuthorshipRecordingAllowed", true],
    ["candidateAuthorReviewerSeparationPlaceholder", "identityComparisonAllowed", true],
    ["auditObserverSeparationPlaceholder", "auditDecisionAuthorityAllowed", true],
    ["auditObserverSeparationPlaceholder", "auditProductionApprovalAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[objectName][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("enforcement authority remains generic unassigned and disabled", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["authorityPlaceholderId", "ASSIGNED_AUTHORITY"],
    ["authorityOwnerReference", "owner-ref"],
    ["authorityAssignmentReference", "assignment-ref"],
    ["enforcementPolicyReference", "policy.v1"],
    ["policyApprovalAllowed", true],
    ["runtimeEnforcementAllowed", true],
    ["assignmentTimeEvaluationAllowed", true],
    ["decisionTimeEvaluationAllowed", true],
    ["decisionAuthorizationAllowed", true],
    ["productionApprovalAuthorizationAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.enforcementAuthorityPlaceholder[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("violation handling remains unresolved and disabled", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["detectionPolicyReference", "policy.v1"],
    ["violationDetectionAllowed", true],
    ["violationRecordingAllowed", true],
    ["containmentAllowed", true],
    ["decisionInvalidationAllowed", true],
    ["remediationAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.violationHandlingPlaceholder[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("waiver and exception placeholder cannot authorize production or bypass a gate", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["waiverPolicyReference", "policy.v1"],
    ["exceptionPolicyReference", "policy.v1"],
    ["waiverRecordingAllowed", true],
    ["exceptionRecordingAllowed", true],
    ["separationOverrideAllowed", true],
    ["missingGateSatisfactionAllowed", true],
    ["reviewDecisionAuthorizationAllowed", true],
    ["productionApprovalAuthorizationAllowed", true],
    ["readinessTransitionAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.waiverExceptionPolicyPlaceholder[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("activation and readiness remain blocked with the exact two reasons", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "activationAllowed",
    "reviewWorkflowActivationAllowed",
    "readinessTransitionAllowed",
    "reviewDecisionAuthorizationAllowed",
    "productionApprovalAllowed",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.activationBoundary[field] = true;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
  const ready = clone(artifacts.artifact);
  ready.readiness.status = "READY";
  assert.throws(() => validate(artifacts, ready), /readiness.status/);
  for (const blockingReasons of [
    ["INCOMPLETE_COVERAGE"],
    ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES", "EXTRA"],
    ["NON_PRODUCTION_FIXTURES", "INCOMPLETE_COVERAGE"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.readiness.blockingReasons = blockingReasons;
    assert.throws(() => validate(artifacts, invalid), /blockingReasons/);
  }
});

test("all protected records and matching aggregates remain zero", async () => {
  const artifacts = await readArtifacts();
  for (const field of protectedRecordFields) {
    const invalid = clone(artifacts.artifact);
    invalid[field].push({ recordState: "REAL" });
    assert.throws(() => validate(artifacts, invalid), /must contain exactly 0 values/, field);
  }
  for (const countField of [
    "reviewerIdentityCount",
    "roleAssignmentCount",
    "conflictRecordCount",
    "violationRecordCount",
    "waiverRecordCount",
    "approvedDecisionCount",
    "productionApprovalCount",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.aggregate[countField] = 1;
    assert.throws(() => validate(artifacts, invalid), new RegExp(countField));
  }
});

test("unknown fields forbidden terms and private identifier patterns fail closed", async () => {
  const artifacts = await readArtifacts();
  const unknown = clone(artifacts.artifact);
  unknown.unexpected = true;
  assert.throws(() => validate(artifacts, unknown), /unexpected field/);

  for (const term of forbiddenTerms) {
    const forbiddenField = clone(artifacts.artifact);
    forbiddenField.policyIdentity[term] = "blocked";
    assert.throws(() => validate(artifacts, forbiddenField), /forbidden field term/);

    const forbiddenContent = clone(artifacts.artifact);
    forbiddenContent.metadata.status = `blocked ${term}`;
    assert.throws(() => validate(artifacts, forbiddenContent), /forbidden content term/);
  }
  for (const [value, pattern] of [
    ["person@example.invalid", /email-like value/],
    ["123e4567-e89b-42d3-a456-426614174000", /UUID-like value/],
    ["user-12345678", /user-id-like value/],
    ["0123456789abcdef0123456789abcdef", /hash-like value/],
    ["dcandidate.math.g7-9.algebra.example.v1", /concrete candidate ID/],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.metadata.status = value;
    assert.throws(() => validate(artifacts, invalid), pattern, value);
  }
});

test("Slice 6 worktree guard permits only the exact 36 Slice 10 implementation paths", () => {
  assert.deepEqual(
    validateSeparationOfDutiesPolicyChangedPaths(approvedSlice10ChangedPaths),
    approvedSlice10ChangedPaths,
  );
  for (const forbiddenPath of [
    "README.md",
    "docs/wave-5/slice-11-implementation-note.md",
    "docs/wave-5/nested/diagnostic-separation-of-duties-policy-contract.md",
    "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md.bak",
    "packages/curriculum/diagnostic-separation-of-duties-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/authorization.ts",
    "apps/api/package.json",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-separation-runtime.ts",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
  ]) {
    assert.throws(
      () => validateSeparationOfDutiesPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 10 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root test command registers the Slice 6 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");
  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  ]) {
    assert.equal(
      testCommand.split(exactRegistration).length - 1,
      1,
      `${exactRegistration} must occur exactly once`,
    );
  }
});

test("Slice 6 validator contains no broad documentation curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL("../scripts/validate-diagnostic-separation-of-duties-policy.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
