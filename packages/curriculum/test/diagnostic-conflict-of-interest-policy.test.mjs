import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "../scripts/validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateCanonicalizationDigestPolicy } from "../scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs";
import { readDiagnosticCandidateDigestRegistry } from "../scripts/validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticCandidateIdentityPolicy } from "../scripts/validate-diagnostic-candidate-identity-policy.mjs";
import {
  readDiagnosticConflictOfInterestPolicy,
  validateConflictOfInterestPolicyChangedPaths,
  validateDiagnosticConflictOfInterestPolicy,
} from "../scripts/validate-diagnostic-conflict-of-interest-policy.mjs";
import { readDiagnosticReviewActivationPrerequisites } from "../scripts/validate-diagnostic-review-activation-prerequisites.mjs";
import { readDiagnosticReviewAuthority } from "../scripts/validate-diagnostic-review-authority.mjs";
import { readDiagnosticReviewCoverage } from "../scripts/validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "../scripts/validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "../scripts/validate-diagnostic-review-gate-rubric.mjs";
import { readDiagnosticReviewWorkflowState } from "../scripts/validate-diagnostic-review-workflow-state.mjs";
import { readDiagnosticReviewerRoleOwnershipPolicy } from "../scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs";
import { readDiagnosticSeparationOfDutiesPolicy } from "../scripts/validate-diagnostic-separation-of-duties-policy.mjs";

const expectedRoleIds = [
  "METHODOLOGY_REVIEWER_PLACEHOLDER",
  "SAFETY_REVIEWER_PLACEHOLDER",
  "RIGHTS_REVIEWER_PLACEHOLDER",
  "GRADE_PLACEMENT_REVIEWER_PLACEHOLDER",
  "ACCESSIBILITY_REVIEWER_PLACEHOLDER",
  "PRODUCTION_APPROVER_PLACEHOLDER",
  "AUDIT_OBSERVER_PLACEHOLDER",
];
const expectedCategoryIds = [
  "CANDIDATE_AUTHOR_RELATIONSHIP_PLACEHOLDER",
  "TEXTBOOK_OR_CONTENT_SOURCE_RELATIONSHIP_PLACEHOLDER",
  "FINANCIAL_VENDOR_OR_PROVIDER_RELATIONSHIP_PLACEHOLDER",
  "PERSONAL_OR_FAMILY_RELATIONSHIP_PLACEHOLDER",
  "ORGANIZATIONAL_OR_REPORTING_RELATIONSHIP_PLACEHOLDER",
  "PRIOR_DECISION_OR_ADVOCACY_RELATIONSHIP_PLACEHOLDER",
  "OTHER_ACTUAL_POTENTIAL_OR_PERCEIVED_CONFLICT_PLACEHOLDER",
];
const expectedDecisionRequirementIds = [
  "conflict_category_taxonomy",
  "reviewer_self_disclosure",
  "candidate_author_relationship",
  "textbook_and_content_source_relationship",
  "financial_vendor_and_provider_relationship",
  "recusal_and_reassignment",
  "waiver_and_exception_policy",
  "conflict_escalation_authority",
  "conflict_audit_trail",
  "assignment_decision_and_late_disclosure_enforcement_timing",
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
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "roleAssignmentRecords",
  "reviewerAssignmentRecords",
  "candidateAuthorRelationshipRecords",
  "contentSourceRelationshipRecords",
  "financialVendorProviderRelationshipRecords",
  "otherRelationshipRecords",
  "conflictRecords",
  "disclosureRecords",
  "recusalRecords",
  "reassignmentRecords",
  "waiverRecords",
  "exceptionRecords",
  "escalationAuthorityAssignmentRecords",
  "escalationRecords",
  "appealRecords",
  "auditTrailRecords",
  "activeConflictRuleRecords",
  "reviewDecisionRecords",
  "approvedDecisionRecords",
  "productionApprovalRecords",
];
const approvedSlice11ChangedPaths = [
  "docs/wave-5/diagnostic-coverage-gap-closure-plan-contract.md",
  "docs/wave-5/slice-11-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-coverage-gap-closure-plan/grade-7-9-math.coverage-gap-closure-plan-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs",
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
    separationPolicy,
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
    readDiagnosticConflictOfInterestPolicy(),
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
    separationPolicy,
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
  return validateDiagnosticConflictOfInterestPolicy(
    artifact,
    artifacts.separationPolicy,
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

test("conflict-of-interest policy placeholder is valid and unresolved", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    policyArtifactVersion: "wave-5.slice-7.grade-7-9-math.v1",
    policyVersion: "wave-5.slice-7.diagnostic-conflict-of-interest.placeholder.v1",
    policyState: "UNRESOLVED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    rolePlaceholderCount: 7,
    conflictCategoryPlaceholderCount: 7,
    decisionRequirementCount: 10,
    activeConflictRuleCount: 0,
    reviewerIdentityCount: 0,
    reviewerAssignmentCount: 0,
    conflictRecordCount: 0,
    disclosureRecordCount: 0,
    recusalRecordCount: 0,
    waiverRecordCount: 0,
    approvedDecisionCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("conflict prerequisite remains exact unchanged and unsatisfied", async () => {
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
    ({ prerequisiteId }) => prerequisiteId === "conflict_of_interest_policy",
  );
  prerequisite.status = "SATISFIED";
  assert.throws(() => validate(upstream), /UNSATISFIED_DEFERRED|exact unsatisfied prerequisite/);
});

test("exact Slice 2 Slice 5 Slice 6 and Wave 4 pins remain unchanged", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["activationPrerequisitesArtifactVersion", "wave-5.slice-2.changed"],
    ["reviewerRoleOwnershipPolicyArtifactVersion", "wave-5.slice-5.changed"],
    ["separationOfDutiesPolicyArtifactVersion", "wave-5.slice-6.changed"],
    ["reviewAuthorityArtifactVersion", "wave-4.slice-8.changed"],
    ["reviewWorkflowStateArtifactVersion", "wave-4.slice-7.changed"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.metadata[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
  const separation = clone(artifacts.artifact);
  separation.dependencyReferences.separationOfDutiesPolicy.policyState = "ACTIVE";
  assert.throws(() => validate(artifacts, separation), /policyState/);
  const authority = clone(artifacts.artifact);
  authority.dependencyReferences.reviewAuthority.conflictPolicyStatus = "ACTIVE";
  assert.throws(() => validate(artifacts, authority), /conflictPolicyStatus/);
});

test("role taxonomy remains exactly seven placeholders without conflict authority", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.roleTaxonomyPlaceholders.map(({ rolePlaceholderId }) => rolePlaceholderId),
    expectedRoleIds,
  );
  const extra = clone(artifacts.artifact);
  extra.roleTaxonomyPlaceholders.push({ rolePlaceholderId: "CONFLICT_EVALUATOR" });
  assert.throws(() => validate(artifacts, extra), /must contain exactly 7 values/);
  const authority = clone(artifacts.artifact);
  authority.roleTaxonomyPlaceholders[0].conflictEvaluationAllowed = true;
  assert.throws(() => validate(artifacts, authority), /conflictEvaluationAllowed/);
});

test("conflict taxonomy is the exact seven non-disqualifying placeholders", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.conflictCategoryTaxonomyPlaceholders.map(
      ({ categoryPlaceholderId }) => categoryPlaceholderId,
    ),
    expectedCategoryIds,
  );
  const missing = clone(artifacts.artifact);
  missing.conflictCategoryTaxonomyPlaceholders.pop();
  assert.throws(() => validate(artifacts, missing), /must contain exactly 7 values/);
  for (const [field, value] of [
    ["definitionPolicyReference", "policy.v1"],
    ["relationshipRecordingAllowed", true],
    ["runtimeEvaluationAllowed", true],
    ["disqualifyingStatusDefined", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.conflictCategoryTaxonomyPlaceholders[0][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("exact ten unique decision requirements remain unresolved", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.decisionRequirements.map(({ requirementId }) => requirementId),
    expectedDecisionRequirementIds,
  );
  const missing = clone(artifacts.artifact);
  missing.decisionRequirements.pop();
  assert.throws(() => validate(artifacts, missing), /must contain exactly 10 values/);
  const decided = clone(artifacts.artifact);
  decided.decisionRequirements[0].state = "APPROVED";
  assert.throws(() => validate(artifacts, decided), /state/);
  const duplicate = clone(artifacts.artifact);
  duplicate.decisionRequirements[9] = clone(duplicate.decisionRequirements[0]);
  assert.throws(() => validate(artifacts, duplicate), /requirementId/);
});

test("reviewer self-disclosure remains private unresolved and disabled", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.reviewerSelfDisclosurePlaceholder.subjectRolePlaceholderIds,
    expectedRoleIds,
  );
  for (const [field, value] of [
    ["disclosurePolicyReference", "policy.v1"],
    ["declarationReferenceFormat", "opaque.v1"],
    ["disclosureSubmissionAllowed", true],
    ["privateDisclosureStorageAllowed", true],
    ["selfClearanceAllowed", true],
    ["assignmentEvaluationAllowed", true],
    ["decisionEvaluationAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.reviewerSelfDisclosurePlaceholder[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("candidate content-source and commercial relationships remain unrecorded", async () => {
  const artifacts = await readArtifacts();
  for (const [objectName, field, value] of [
    ["candidateAuthorRelationshipPlaceholder", "authorshipPolicyReference", "policy.v1"],
    ["candidateAuthorRelationshipPlaceholder", "identityComparisonAllowed", true],
    ["candidateAuthorRelationshipPlaceholder", "runtimeEvaluationAllowed", true],
    ["contentSourceRelationshipPlaceholder", "contentSourceReferenceFormat", "source.v1"],
    ["contentSourceRelationshipPlaceholder", "rightsEvidenceRecordingAllowed", true],
    ["contentSourceRelationshipPlaceholder", "runtimeEvaluationAllowed", true],
    ["financialVendorProviderRelationshipPlaceholder", "materialityPolicyReference", "policy.v1"],
    ["financialVendorProviderRelationshipPlaceholder", "relationshipRecordingAllowed", true],
    ["financialVendorProviderRelationshipPlaceholder", "providerIntegrationAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[objectName][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("recusal reassignment and prior-decision handling remain disabled", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["recusalPolicyReference", "policy.v1"],
    ["recusalRecordingAllowed", true],
    ["reassignmentAllowed", true],
    ["assignmentBlockingAllowed", true],
    ["priorDecisionInvalidationAllowed", true],
    ["runtimeWorkflowAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.recusalPolicyPlaceholder[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("waiver and exception cannot clear conflicts authorize production or bypass gates", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["waiverPolicyReference", "policy.v1"],
    ["waiverRecordingAllowed", true],
    ["exceptionRecordingAllowed", true],
    ["conflictClearanceAllowed", true],
    ["disclosureSuppressionAllowed", true],
    ["missingGateSatisfactionAllowed", true],
    ["assignmentAuthorizationAllowed", true],
    ["reviewDecisionAuthorizationAllowed", true],
    ["productionApprovalAuthorizationAllowed", true],
    ["readinessTransitionAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.waiverExceptionPolicyPlaceholder[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("escalation authority and audit trail remain unassigned and inactive", async () => {
  const artifacts = await readArtifacts();
  for (const [objectName, field, value] of [
    ["escalationAuthorityPlaceholder", "authorityPlaceholderId", "ASSIGNED_AUTHORITY"],
    ["escalationAuthorityPlaceholder", "authorityOwnerReference", "owner-ref"],
    ["escalationAuthorityPlaceholder", "escalationAllowed", true],
    ["escalationAuthorityPlaceholder", "appealAllowed", true],
    ["escalationAuthorityPlaceholder", "decisionAuthorizationAllowed", true],
    ["auditTrailPlaceholder", "auditRecordSchemaReference", "schema.v1"],
    ["auditTrailPlaceholder", "auditRecordingAllowed", true],
    ["auditTrailPlaceholder", "privateReferenceLookupAllowed", true],
    ["auditTrailPlaceholder", "ordinaryCurriculumStorageAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[objectName][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("assignment decision and late-disclosure enforcement timing remains disabled", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["timingPolicyReference", "policy.v1"],
    ["assignmentTimeEvaluationAllowed", true],
    ["decisionTimeEvaluationAllowed", true],
    ["ongoingEvaluationAllowed", true],
    ["lateDisclosureEvaluationAllowed", true],
    ["priorDecisionInvalidationAllowed", true],
    ["runtimeAssignmentBlockingAllowed", true],
    ["runtimeDecisionBlockingAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.enforcementTimingPlaceholder[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("policy activation and readiness remain blocked with the exact two reasons", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "policyApprovalAllowed",
    "conflictTaxonomyApprovalAllowed",
    "disclosureCollectionAllowed",
    "runtimeEvaluationAllowed",
    "assignmentTimeEvaluationAllowed",
    "decisionTimeEvaluationAllowed",
    "lateDisclosureEvaluationAllowed",
    "reviewDecisionAuthorizationAllowed",
    "productionApprovalAuthorizationAllowed",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.policyIdentity[field] = true;
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
    "reviewerAssignmentCount",
    "candidateAuthorRelationshipCount",
    "contentSourceRelationshipCount",
    "financialVendorProviderRelationshipCount",
    "conflictRecordCount",
    "disclosureRecordCount",
    "recusalRecordCount",
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

test("Slice 7 worktree guard permits only the exact 38 Slice 11 implementation paths", () => {
  assert.deepEqual(
    validateConflictOfInterestPolicyChangedPaths(approvedSlice11ChangedPaths),
    approvedSlice11ChangedPaths,
  );
  for (const forbiddenPath of [
    "README.md",
    "docs/wave-5/slice-12-implementation-note.md",
    "docs/wave-5/nested/diagnostic-conflict-of-interest-policy-contract.md",
    "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md.bak",
    "packages/curriculum/diagnostic-conflict-of-interest-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/conflict-of-interest.ts",
    "apps/api/package.json",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/api/prisma/migrations/next/migration.sql",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-conflict-of-interest-runtime.ts",
    "packages/curriculum/package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
  ]) {
    assert.throws(
      () => validateConflictOfInterestPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 11 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root test command registers the Slice 7 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");
  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
  ]) {
    assert.equal(
      testCommand.split(exactRegistration).length - 1,
      1,
      `${exactRegistration} must occur exactly once`,
    );
  }
});

test("Slice 7 validator contains no broad documentation curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL("../scripts/validate-diagnostic-conflict-of-interest-policy.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
