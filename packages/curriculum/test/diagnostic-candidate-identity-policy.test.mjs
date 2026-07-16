import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "../scripts/validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateDigestRegistry } from "../scripts/validate-diagnostic-candidate-digest.mjs";
import {
  readDiagnosticCandidateIdentityPolicy,
  validateCandidateIdentityPolicyChangedPaths,
  validateDiagnosticCandidateIdentityPolicy,
} from "../scripts/validate-diagnostic-candidate-identity-policy.mjs";
import { readDiagnosticReviewActivationPrerequisites } from "../scripts/validate-diagnostic-review-activation-prerequisites.mjs";
import { readDiagnosticReviewAuthority } from "../scripts/validate-diagnostic-review-authority.mjs";
import { readDiagnosticReviewCoverage } from "../scripts/validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "../scripts/validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "../scripts/validate-diagnostic-review-gate-rubric.mjs";
import { readDiagnosticReviewWorkflowState } from "../scripts/validate-diagnostic-review-workflow-state.mjs";

const expectedDecisionRequirementIds = [
  "namespace_and_allocation_ownership",
  "identity_format_and_validation_grammar",
  "uniqueness_reservation_collision_and_non_reuse",
  "version_and_revision_semantics",
  "candidate_artifact_blueprint_and_skill_linkage",
  "new_version_and_invalidation_triggers",
  "retirement_and_tombstone_semantics",
  "identifier_data_exclusions",
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
const approvedSlice3ChangedPaths = [
  "docs/wave-5/diagnostic-candidate-identity-policy-contract.md",
  "docs/wave-5/slice-3-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-candidate-identity-policy/grade-7-9-math.candidate-identity-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [
    artifact,
    activationPrerequisites,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    authority,
  ] = await Promise.all([
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
  return validateDiagnosticCandidateIdentityPolicy(
    artifact,
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

test("candidate identity policy placeholder is valid and unresolved", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    policyArtifactVersion: "wave-5.slice-3.grade-7-9-math.v1",
    policyVersion: "wave-5.slice-3.diagnostic-candidate-identity.placeholder.v1",
    policyState: "UNRESOLVED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    decisionRequirementCount: 8,
    coverageSlotReferenceCount: 11,
    realCandidateIdCount: 0,
    submittedCandidateCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("validator requires the exact eight unique undecided requirements", async () => {
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

  for (const state of ["DECIDED", "APPROVED", "ACTIVE"]) {
    const invalid = clone(artifacts.artifact);
    invalid.decisionRequirements[0].state = state;
    assert.throws(() => validate(artifacts, invalid), /state must equal/);
  }
});

test("candidate identity activation prerequisite remains unchanged and unsatisfied", async () => {
  const artifacts = await readArtifacts();

  const satisfied = clone(artifacts.artifact);
  satisfied.prerequisiteReference.status = "SATISFIED";
  assert.throws(() => validate(artifacts, satisfied), /prerequisiteReference.status/);

  const evidence = clone(artifacts.artifact);
  evidence.prerequisiteReference.evidenceRecordRefs.push("future-evidence");
  assert.throws(() => validate(artifacts, evidence), /must contain exactly 0 values/);

  const upstream = clone(artifacts);
  upstream.activationPrerequisites.prerequisites[0].status = "SATISFIED";
  assert.throws(() => validate(upstream), /UNSATISFIED_DEFERRED|status must equal/);
});

test("Wave 4 candidate format remains reference-only and non-instantiating", async () => {
  const artifacts = await readArtifacts();
  for (const [field, value] of [
    ["state", "APPROVED"],
    ["activePatternVersion", "active.v1"],
    ["patternApproved", true],
    ["instantiationAllowed", true],
    ["validationAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.candidateIdPatternPlaceholder[field] = value;
    assert.throws(() => validate(artifacts, invalid), /candidateIdPatternPlaceholder/);
  }
});

test("ownership collision versioning and withdrawal placeholders remain unresolved", async () => {
  const artifacts = await readArtifacts();

  const owner = clone(artifacts.artifact);
  owner.namespaceOwnershipPlaceholder.ownerPlaceholderId = "REAL_OWNER";
  assert.throws(() => validate(artifacts, owner), /ownerPlaceholderId/);

  const ownerReference = clone(artifacts.artifact);
  ownerReference.namespaceOwnershipPlaceholder.ownerReference = "private-owner-ref";
  assert.throws(() => validate(artifacts, ownerReference), /ownerReference/);

  const collision = clone(artifacts.artifact);
  collision.collisionPreventionPlaceholder.enforcementAllowed = true;
  assert.throws(() => validate(artifacts, collision), /enforcementAllowed/);

  const versioning = clone(artifacts.artifact);
  versioning.versioningPolicyPlaceholder.versioningPolicyReference = "policy.v1";
  assert.throws(() => validate(artifacts, versioning), /versioningPolicyReference/);

  const withdrawal = clone(artifacts.artifact);
  withdrawal.withdrawalSupersessionPlaceholder.recordingAllowed = true;
  assert.throws(() => validate(artifacts, withdrawal), /recordingAllowed/);
});

test("upstream versions and all 11 coverage slot references remain exact", async () => {
  const artifacts = await readArtifacts();

  const activationPin = clone(artifacts.artifact);
  activationPin.metadata.activationPrerequisitesArtifactVersion = "wave-5.slice-2.changed";
  assert.throws(() => validate(artifacts, activationPin), /activationPrerequisitesArtifactVersion/);

  const registryPin = clone(artifacts.artifact);
  registryPin.dependencyReferences.candidateDigestRegistry.artifactVersion = "wave-4.changed";
  assert.throws(() => validate(artifacts, registryPin), /candidateDigestRegistry.artifactVersion/);

  const missingSlot = clone(artifacts.artifact);
  missingSlot.dependencyReferences.reviewCoverage.coverageSlotIds.pop();
  assert.throws(() => validate(artifacts, missingSlot), /coverageSlotIds/);

  const unknownSlot = clone(artifacts.artifact);
  unknownSlot.dependencyReferences.reviewCoverage.coverageSlotIds[0] = "diag.math.unknown.v1";
  assert.throws(() => validate(artifacts, unknownSlot), /coverageSlotIds/);
});

test("activation and readiness remain blocked with the exact two reasons", async () => {
  const artifacts = await readArtifacts();

  const active = clone(artifacts.artifact);
  active.activationBoundary.activationAllowed = true;
  assert.throws(() => validate(artifacts, active), /activationBoundary.activationAllowed/);

  const ready = clone(artifacts.artifact);
  ready.readiness.status = "READY";
  assert.throws(() => validate(artifacts, ready), /must remain NOT_READY/);

  for (const reasons of [
    ["INCOMPLETE_COVERAGE"],
    ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES", "EXTRA"],
    ["INCOMPLETE_COVERAGE", "INCOMPLETE_COVERAGE"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.readiness.blockingReasons = reasons;
    assert.throws(() => validate(artifacts, invalid), /exactly the two approved blockers/);
  }
});

test("policy and activation enablement claims fail closed", async () => {
  const artifacts = await readArtifacts();

  for (const field of [
    "policyApprovalAllowed",
    "candidateIdentityAssignmentAllowed",
    "candidateSubmissionAllowed",
    "productionApprovalAllowed",
  ]) {
    const enabled = clone(artifacts.artifact);
    enabled.policyIdentity[field] = true;
    assert.throws(() => validate(artifacts, enabled), new RegExp(`policyIdentity\\.${field}`));
  }

  for (const field of [
    "activationAllowed",
    "reviewWorkflowActivationAllowed",
    "readinessTransitionAllowed",
    "productionApprovalAllowed",
  ]) {
    const enabled = clone(artifacts.artifact);
    enabled.activationBoundary[field] = true;
    assert.throws(() => validate(artifacts, enabled), new RegExp(`activationBoundary\\.${field}`));
  }

  const activePolicy = clone(artifacts.artifact);
  activePolicy.policyIdentity.policyState = "ACTIVE";
  assert.throws(() => validate(artifacts, activePolicy), /policyIdentity\.policyState/);

  const activeWorkflow = clone(artifacts.artifact);
  activeWorkflow.activationBoundary.reviewWorkflowStatus = "ACTIVE";
  assert.throws(
    () => validate(artifacts, activeWorkflow),
    /activationBoundary\.reviewWorkflowStatus/,
  );
});

test("all identity policy and candidate activity records and counts remain zero", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "policyDecisionRecords",
    "candidateIdentityRecords",
    "identityReservationRecords",
    "identityAllocationRecords",
    "candidateSubmissionRecords",
    "candidateApprovalRecords",
    "digestValueRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "ownerAssignmentRecords",
    "withdrawalRecords",
    "supersessionRecords",
    "productionApprovalRecords",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[field].push({ recordState: "REAL" });
    assert.throws(() => validate(artifacts, invalid), /must remain empty/, field);
  }

  const count = clone(artifacts.artifact);
  count.aggregate.realCandidateIdCount = 1;
  assert.throws(() => validate(artifacts, count), /realCandidateIdCount must equal 0/);

  const boundary = clone(artifacts.artifact);
  boundary.recordBoundary.candidateSubmissionsRecorded = true;
  assert.throws(() => validate(artifacts, boundary), /candidateSubmissionsRecorded/);
});

test("unknown fields and every forbidden field or content term fail closed", async () => {
  const artifacts = await readArtifacts();

  const unknown = clone(artifacts.artifact);
  unknown.unexpected = true;
  assert.throws(() => validate(artifacts, unknown), /unexpected field/);

  for (const term of forbiddenTerms) {
    const forbiddenField = clone(artifacts.artifact);
    forbiddenField.policyIdentity[term] = "blocked";
    assert.throws(
      () => validate(artifacts, forbiddenField),
      /forbidden field term/,
      `field ${term}`,
    );

    const forbiddenContent = clone(artifacts.artifact);
    forbiddenContent.metadata.status = `blocked ${term}`;
    assert.throws(
      () => validate(artifacts, forbiddenContent),
      /forbidden content term/,
      `content ${term}`,
    );
  }

  const hashLike = clone(artifacts.artifact);
  hashLike.metadata.status = "0123456789abcdef0123456789abcdef";
  assert.throws(() => validate(artifacts, hashLike), /hash-like value/);

  const emailLike = clone(artifacts.artifact);
  emailLike.metadata.status = "person@example.invalid";
  assert.throws(() => validate(artifacts, emailLike), /email-like value/);

  const concreteId = clone(artifacts.artifact);
  concreteId.metadata.status = "dcandidate.math.g7-9.algebra.example.v1";
  assert.throws(() => validate(artifacts, concreteId), /concrete candidate ID/);
});

test("Slice 3 worktree guard permits only the exact 22 implementation paths", () => {
  assert.deepEqual(
    validateCandidateIdentityPolicyChangedPaths(approvedSlice3ChangedPaths),
    approvedSlice3ChangedPaths,
  );

  for (const forbiddenPath of [
    "README.md",
    "docs/wave-5/slice-7-implementation-note.md",
    "docs/wave-5/nested/diagnostic-candidate-identity-policy-contract.md",
    "docs/wave-5/diagnostic-candidate-identity-policy-contract.md.bak",
    "packages/curriculum/diagnostic-candidate-identity-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateCandidateIdentityPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 3 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 3 guard admits only the exact five Slice 4 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md",
    "docs/wave-5/slice-4-implementation-note.md",
    "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
    "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
  ];
  assert.deepEqual(validateCandidateIdentityPolicyChangedPaths(approvedPaths), approvedPaths);

  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md.bak",
    "docs/wave-5/nested/slice-4-implementation-note.md",
    "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateCandidateIdentityPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 3 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 3 guard admits only the exact five Slice 5 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md",
    "docs/wave-5/slice-5-implementation-note.md",
    "packages/curriculum/diagnostic-reviewer-role-ownership-policy/grade-7-9-math.reviewer-role-ownership-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
    "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  ];
  assert.deepEqual(validateCandidateIdentityPolicyChangedPaths(approvedPaths), approvedPaths);

  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md.bak",
    "docs/wave-5/nested/slice-5-implementation-note.md",
    "packages/curriculum/diagnostic-reviewer-role-ownership-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateCandidateIdentityPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 3 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 3 guard admits only the exact five Slice 6 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md",
    "docs/wave-5/slice-6-implementation-note.md",
    "packages/curriculum/diagnostic-separation-of-duties-policy/grade-7-9-math.separation-of-duties-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
    "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  ];
  assert.deepEqual(validateCandidateIdentityPolicyChangedPaths(approvedPaths), approvedPaths);

  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md.bak",
    "docs/wave-5/nested/slice-6-implementation-note.md",
    "packages/curriculum/diagnostic-separation-of-duties-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/authorization.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-separation-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateCandidateIdentityPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 3 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root test command registers the Slice 3 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");

  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
  ]) {
    assert.equal(
      testCommand.split(exactRegistration).length - 1,
      1,
      `${exactRegistration} must occur exactly once`,
    );
  }
});

test("Slice 3 validator contains no broad documentation curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL("../scripts/validate-diagnostic-candidate-identity-policy.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
