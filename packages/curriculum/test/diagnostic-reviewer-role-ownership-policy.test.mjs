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
import {
  readDiagnosticReviewerRoleOwnershipPolicy,
  validateDiagnosticReviewerRoleOwnershipPolicy,
  validateReviewerRoleOwnershipPolicyChangedPaths,
} from "../scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs";
import { readDiagnosticReviewWorkflowState } from "../scripts/validate-diagnostic-review-workflow-state.mjs";

const expectedRoles = [
  ["METHODOLOGY_REVIEWER_PLACEHOLDER", "methodology"],
  ["SAFETY_REVIEWER_PLACEHOLDER", "safety_no_answer"],
  ["RIGHTS_REVIEWER_PLACEHOLDER", "rights_copyright"],
  ["GRADE_PLACEMENT_REVIEWER_PLACEHOLDER", "grade_placement"],
  ["ACCESSIBILITY_REVIEWER_PLACEHOLDER", "accessibility_readability"],
  ["PRODUCTION_APPROVER_PLACEHOLDER", "production_approval"],
  ["AUDIT_OBSERVER_PLACEHOLDER", "audit_observation"],
];
const expectedDecisionRequirementIds = [
  "accountable_role_ownership",
  "role_eligibility_competence_and_independence",
  "appointment_and_assignment_authority",
  "scope_minimum_counts_quorum_and_decision_aggregation",
  "reviewer_lifecycle_expiry_suspension_and_reassignment",
  "delegation_revocation_and_emergency_coverage",
  "policy_maintenance_and_access_review_ownership",
  "reviewer_and_audit_identity_separation",
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
  const [
    artifact,
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
  return validateDiagnosticReviewerRoleOwnershipPolicy(
    artifact,
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

test("reviewer role ownership policy placeholder is valid and unresolved", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    policyArtifactVersion: "wave-5.slice-5.grade-7-9-math.v1",
    policyVersion: "wave-5.slice-5.diagnostic-reviewer-role-ownership.placeholder.v1",
    policyState: "UNRESOLVED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    rolePlaceholderCount: 7,
    decisionRequirementCount: 8,
    roleOwnerCount: 0,
    reviewerIdentityCount: 0,
    reviewerAssignmentCount: 0,
    activeRoleGrantCount: 0,
    approvedDecisionCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("validator requires the exact eight unique unresolved requirements", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.decisionRequirements.map(({ requirementId }) => requirementId),
    expectedDecisionRequirementIds,
  );

  const missing = clone(artifacts.artifact);
  missing.decisionRequirements.pop();
  assert.throws(() => validate(artifacts, missing), /must contain exactly 8 entries/);

  const unknown = clone(artifacts.artifact);
  unknown.decisionRequirements[0].requirementId = "unknown_requirement";
  assert.throws(() => validate(artifacts, unknown), /requirementId is unknown/);

  const duplicate = clone(artifacts.artifact);
  duplicate.decisionRequirements[7] = clone(duplicate.decisionRequirements[0]);
  assert.throws(() => validate(artifacts, duplicate), /requirementId is duplicated/);

  const decided = clone(artifacts.artifact);
  decided.decisionRequirements[0].state = "APPROVED";
  assert.throws(() => validate(artifacts, decided), /state must equal/);
});

test("reviewer role ownership prerequisite remains unchanged and unsatisfied", async () => {
  const artifacts = await readArtifacts();

  const satisfied = clone(artifacts.artifact);
  satisfied.prerequisiteReference.status = "SATISFIED";
  assert.throws(() => validate(artifacts, satisfied), /prerequisiteReference.status/);

  const owner = clone(artifacts.artifact);
  owner.prerequisiteReference.ownerPlaceholderId = "ASSIGNED_OWNER";
  assert.throws(() => validate(artifacts, owner), /ownerPlaceholderId/);

  const evidence = clone(artifacts.artifact);
  evidence.prerequisiteReference.evidenceRecordRefs.push("future-evidence");
  assert.throws(() => validate(artifacts, evidence), /must contain exactly 0 values/);

  const upstream = clone(artifacts);
  const prerequisite = upstream.activationPrerequisites.prerequisites.find(
    ({ prerequisiteId }) => prerequisiteId === "reviewer_role_ownership",
  );
  prerequisite.status = "SATISFIED";
  assert.throws(() => validate(upstream), /UNSATISFIED_DEFERRED|status must equal/);
});

test("exact Slice 2 Slice 3 Slice 4 and Wave 4 authority pins remain unchanged", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["activationPrerequisitesArtifactVersion", "wave-5.slice-2.changed"],
    ["reviewAuthorityArtifactVersion", "wave-4.slice-8.changed"],
    ["candidateIdentityPolicyArtifactVersion", "wave-5.slice-3.changed"],
    ["canonicalizationDigestPolicyArtifactVersion", "wave-5.slice-4.changed"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.metadata[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(`metadata\\.${field}`));
  }

  const authority = clone(artifacts.artifact);
  authority.dependencyReferences.reviewAuthority.policyState = "ACTIVE";
  assert.throws(() => validate(artifacts, authority), /reviewAuthority.policyState/);

  const canonicalization = clone(artifacts.artifact);
  canonicalization.dependencyReferences.canonicalizationDigestPolicy.generatedHashCount = 1;
  assert.throws(() => validate(artifacts, canonicalization), /generatedHashCount/);
});

test("role taxonomy is the exact seven Wave 4 placeholders without authority", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.roleTaxonomyPlaceholders.map(({ rolePlaceholderId, scopeRef }) => [
      rolePlaceholderId,
      scopeRef,
    ]),
    expectedRoles,
  );

  const missing = clone(artifacts.artifact);
  missing.roleTaxonomyPlaceholders.pop();
  assert.throws(() => validate(artifacts, missing), /must contain exactly 7 values/);

  const changedScope = clone(artifacts.artifact);
  changedScope.roleTaxonomyPlaceholders[0].scopeRef = "changed";
  assert.throws(() => validate(artifacts, changedScope), /scopeRef/);

  const authority = clone(artifacts.artifact);
  authority.roleTaxonomyPlaceholders[0].reviewDecisionAuthorityAllowed = true;
  assert.throws(() => validate(artifacts, authority), /reviewDecisionAuthorityAllowed/);
});

test("all seven role owners remain generic unassigned inactive placeholders", async () => {
  const artifacts = await readArtifacts();
  assert.equal(artifacts.artifact.roleOwnershipPlaceholders.length, 7);
  for (const placeholder of artifacts.artifact.roleOwnershipPlaceholders) {
    assert.equal(placeholder.ownerPlaceholderId, "UNASSIGNED_ROLE_OWNER_PLACEHOLDER");
    assert.equal(placeholder.roleOwnerReference, null);
    assert.equal(placeholder.ownerAssignmentReference, null);
    assert.equal(placeholder.ownershipActive, false);
    assert.equal(placeholder.roleGrantAllowed, false);
  }

  for (const [field, value] of [
    ["roleOwnerReference", "owner-ref"],
    ["ownerAssignmentReference", "assignment-ref"],
    ["ownershipActive", true],
    ["roleGrantAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.roleOwnershipPlaceholders[0][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("eligibility assignment authority scope and quorum remain unresolved", async () => {
  const artifacts = await readArtifacts();
  for (const [objectName, field, value] of [
    ["roleEligibilityPlaceholder", "eligibilityPolicyReference", "policy.v1"],
    ["roleEligibilityPlaceholder", "eligibilityEvaluationAllowed", true],
    ["assignmentAuthorityPlaceholder", "assignmentAuthorityPolicyReference", "policy.v1"],
    ["assignmentAuthorityPlaceholder", "appointmentAllowed", true],
    ["assignmentAuthorityPlaceholder", "assignmentAllowed", true],
    ["scopeQuorumPlaceholder", "minimumCountPolicyReference", "policy.v1"],
    ["scopeQuorumPlaceholder", "quorumEvaluationAllowed", true],
    ["scopeQuorumPlaceholder", "decisionAggregationAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[objectName][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(`${objectName}\\.${field}`));
  }
});

test("reviewer lifecycle delegation revocation and emergency coverage remain inactive", async () => {
  const artifacts = await readArtifacts();
  for (const [objectName, field, value] of [
    ["reviewerLifecyclePlaceholder", "expiryPolicyReference", "policy.v1"],
    ["reviewerLifecyclePlaceholder", "lifecycleProcessingAllowed", true],
    ["delegationRevocationPlaceholder", "delegationPolicyReference", "policy.v1"],
    ["delegationRevocationPlaceholder", "delegationAllowed", true],
    ["delegationRevocationPlaceholder", "revocationProcessingAllowed", true],
    ["delegationRevocationPlaceholder", "emergencyCoverageAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[objectName][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(`${objectName}\\.${field}`));
  }
});

test("reviewer and audit identity separation remains a non-enforcing placeholder", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["reviewerIdentityPolicyReference", "policy.v1"],
    ["auditIdentityPolicyReference", "policy.v1"],
    ["separationPolicyReference", "policy.v1"],
    ["reviewerIdentityRecordsAllowed", true],
    ["auditIdentityRecordsAllowed", true],
    ["identityLinkageAllowed", true],
    ["separationEnforcementAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.auditIdentitySeparationPlaceholder[field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      new RegExp(`auditIdentitySeparationPlaceholder\\.${field}`),
    );
  }
});

test("policy and activation enablement claims fail closed", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "policyApprovalAllowed",
    "roleOwnershipActivationAllowed",
    "reviewerAssignmentAllowed",
    "activeRoleGrantAllowed",
    "reviewDecisionAuthorityAllowed",
    "productionApprovalAuthorityAllowed",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.policyIdentity[field] = true;
    assert.throws(() => validate(artifacts, invalid), new RegExp(`policyIdentity\\.${field}`));
  }
  for (const field of [
    "activationAllowed",
    "reviewWorkflowActivationAllowed",
    "readinessTransitionAllowed",
    "productionApprovalAllowed",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.activationBoundary[field] = true;
    assert.throws(() => validate(artifacts, invalid), new RegExp(`activationBoundary\\.${field}`));
  }
});

test("readiness remains NOT_READY with the exact two blockers", async () => {
  const artifacts = await readArtifacts();
  const ready = clone(artifacts.artifact);
  ready.readiness.status = "READY";
  assert.throws(() => validate(artifacts, ready), /readiness.status/);

  for (const reasons of [
    ["INCOMPLETE_COVERAGE"],
    ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES", "EXTRA"],
    ["NON_PRODUCTION_FIXTURES", "INCOMPLETE_COVERAGE"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.readiness.blockingReasons = reasons;
    assert.throws(() => validate(artifacts, invalid), /readiness.blockingReasons/);
  }
});

test("all owner identity assignment grant decision and approval records remain empty", async () => {
  const artifacts = await readArtifacts();
  const recordFields = [
    "policyDecisionRecords",
    "roleOwnerRecords",
    "ownerAssignmentRecords",
    "roleEligibilityRecords",
    "assignmentAuthorityRecords",
    "reviewerLifecycleRecords",
    "delegationRecords",
    "revocationRecords",
    "realReviewerRoleRecords",
    "activeRoleGrantRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "reviewerAssignmentRecords",
    "reviewDecisionRecords",
    "approvedDecisionRecords",
    "productionApprovalRecords",
  ];
  for (const field of recordFields) {
    const invalid = clone(artifacts.artifact);
    invalid[field].push({ recordState: "REAL" });
    assert.throws(() => validate(artifacts, invalid), /must remain empty/, field);
  }

  const count = clone(artifacts.artifact);
  count.aggregate.activeRoleGrantCount = 1;
  assert.throws(() => validate(artifacts, count), /activeRoleGrantCount must equal 0/);

  const boundary = clone(artifacts.artifact);
  boundary.recordBoundary.reviewerAssignmentsRecorded = true;
  assert.throws(() => validate(artifacts, boundary), /reviewerAssignmentsRecorded/);
});

test("unknown fields forbidden terms and private identifier patterns fail closed", async () => {
  const artifacts = await readArtifacts();
  const unknown = clone(artifacts.artifact);
  unknown.unexpected = true;
  assert.throws(() => validate(artifacts, unknown), /unexpected field/);

  for (const term of forbiddenTerms) {
    const forbiddenField = clone(artifacts.artifact);
    forbiddenField.policyIdentity[term] = "blocked";
    assert.throws(() => validate(artifacts, forbiddenField), /forbidden field term/, term);

    const forbiddenContent = clone(artifacts.artifact);
    forbiddenContent.metadata.status = `blocked ${term}`;
    assert.throws(() => validate(artifacts, forbiddenContent), /forbidden content term/, term);
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

test("Slice 5 worktree guard permits only the exact 42 Slice 13 implementation paths", () => {
  assert.deepEqual(
    validateReviewerRoleOwnershipPolicyChangedPaths(approvedSlice13ChangedPaths),
    approvedSlice13ChangedPaths,
  );
  for (const forbiddenPath of [
    "README.md",
    "docs/wave-5/slice-14-implementation-note.md",
    "docs/wave-5/nested/diagnostic-reviewer-role-ownership-policy-contract.md",
    "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md.bak",
    "packages/curriculum/diagnostic-reviewer-role-ownership-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "apps/api/package.json",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
  ]) {
    assert.throws(
      () => validateReviewerRoleOwnershipPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 13 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root test command registers the Slice 5 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");
  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  ]) {
    assert.equal(
      testCommand.split(exactRegistration).length - 1,
      1,
      `${exactRegistration} must occur exactly once`,
    );
  }
});

test("Slice 5 validator contains no broad documentation curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL("../scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
