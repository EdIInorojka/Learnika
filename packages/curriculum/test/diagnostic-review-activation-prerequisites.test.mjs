import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticReviewActivationPrerequisites,
  validateActivationPrerequisitesChangedPaths,
  validateDiagnosticReviewActivationPrerequisites,
} from "../scripts/validate-diagnostic-review-activation-prerequisites.mjs";
import { readDiagnosticCandidateCanonicalization } from "../scripts/validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateDigestRegistry } from "../scripts/validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticReviewAuthority } from "../scripts/validate-diagnostic-review-authority.mjs";
import { readDiagnosticReviewCoverage } from "../scripts/validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "../scripts/validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "../scripts/validate-diagnostic-review-gate-rubric.mjs";
import { readDiagnosticReviewWorkflowState } from "../scripts/validate-diagnostic-review-workflow-state.mjs";

const expectedPrerequisiteIds = [
  "candidate_identity_policy",
  "canonicalization_and_digest_policy",
  "reviewer_role_ownership",
  "separation_of_duties_enforcement",
  "conflict_of_interest_policy",
  "audit_identity_policy",
  "evidence_storage_and_retention_policy",
  "production_approval_authority",
  "coverage_gap_closure_plan",
  "readiness_integration_plan",
  "rollback_and_withdrawal_policy",
  "ci_and_deterministic_validation",
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
const approvedSlice2ChangedPaths = [
  "docs/wave-5/slice-2-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
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
  const [artifact, coverage, evidence, rubric, registry, canonicalization, workflow, authority] =
    await Promise.all([
      readDiagnosticReviewActivationPrerequisites(),
      readDiagnosticReviewCoverage(),
      readDiagnosticReviewEvidence(),
      readDiagnosticReviewGateRubric(),
      readDiagnosticCandidateDigestRegistry(),
      readDiagnosticCandidateCanonicalization(),
      readDiagnosticReviewWorkflowState(),
      readDiagnosticReviewAuthority(),
    ]);
  return { artifact, coverage, evidence, rubric, registry, canonicalization, workflow, authority };
}

function validate(artifacts, artifact = artifacts.artifact) {
  return validateDiagnosticReviewActivationPrerequisites(
    artifact,
    artifacts.coverage,
    artifacts.evidence,
    artifacts.rubric,
    artifacts.registry,
    artifacts.canonicalization,
    artifacts.workflow,
    artifacts.authority,
  );
}

test("activation prerequisites artifact is valid and remains blocked", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    activationPrerequisitesArtifactVersion: "wave-5.slice-2.grade-7-9-math.v1",
    prerequisiteCount: 12,
    unsatisfiedPrerequisiteCount: 12,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    productionApprovalCount: 0,
    readiness: "NOT_READY",
    blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
  });
  assert.deepEqual(
    artifacts.artifact.prerequisites.map(({ prerequisiteId }) => prerequisiteId),
    expectedPrerequisiteIds,
  );
});

test("validator requires the exact unique prerequisite IDs", async () => {
  const artifacts = await readArtifacts();

  const missing = clone(artifacts.artifact);
  missing.prerequisites.pop();
  assert.throws(() => validate(artifacts, missing), /must contain exactly 12 entries/);

  const unknown = clone(artifacts.artifact);
  unknown.prerequisites[0].prerequisiteId = "unknown_policy";
  assert.throws(() => validate(artifacts, unknown), /prerequisiteId is unknown/);

  const duplicate = clone(artifacts.artifact);
  duplicate.prerequisites[11] = clone(duplicate.prerequisites[0]);
  assert.throws(() => validate(artifacts, duplicate), /prerequisiteId is duplicated/);
});

test("validator rejects prerequisite satisfaction and activation claims", async () => {
  const artifacts = await readArtifacts();
  for (const status of ["SATISFIED", "APPROVED", "ACTIVE"]) {
    const invalid = clone(artifacts.artifact);
    invalid.prerequisites[0].status = status;
    assert.throws(() => validate(artifacts, invalid), /status must equal/);
  }

  for (const [field, value] of [
    ["status", "ACTIVE"],
    ["reviewWorkflowStatus", "ACTIVE"],
    ["activationAllowed", true],
    ["reviewWorkflowActivationAllowed", true],
    ["readinessTransitionAllowed", true],
    ["productionApprovalAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.activationBoundary[field] = value;
    assert.throws(() => validate(artifacts, invalid), /activationBoundary/);
  }
});

test("owners remain generic placeholders and evidence remains descriptive only", async () => {
  const artifacts = await readArtifacts();

  const owner = clone(artifacts.artifact);
  owner.prerequisites[0].ownerPlaceholderId = "REAL_REVIEWER";
  assert.throws(() => validate(artifacts, owner), /ownerPlaceholderId must equal/);

  const description = clone(artifacts.artifact);
  description.prerequisites[0].evidenceRequirementDescription = "Recorded evidence exists.";
  assert.throws(() => validate(artifacts, description), /evidenceRequirementDescription/);

  const reference = clone(artifacts.artifact);
  reference.prerequisites[0].evidenceRecordRefs.push("future-ref");
  assert.throws(() => validate(artifacts, reference), /must contain exactly 0 values/);
});

test("readiness and blocking reasons remain exact", async () => {
  const artifacts = await readArtifacts();

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

test("all real record collections and declared counts remain empty", async () => {
  const artifacts = await readArtifacts();

  for (const field of [
    "realCandidateRecords",
    "digestValueRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "reviewerAssignmentRecords",
    "ownerAssignmentRecords",
    "productionApprovalRecords",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[field].push({ recordState: "REAL" });
    assert.throws(() => validate(artifacts, invalid), /must remain empty/, field);
  }

  const count = clone(artifacts.artifact);
  count.aggregate.productionApprovalCount = 1;
  assert.throws(() => validate(artifacts, count), /productionApprovalCount must equal 0/);

  const boundary = clone(artifacts.artifact);
  boundary.recordBoundary.reviewerAssignmentsRecorded = true;
  assert.throws(() => validate(artifacts, boundary), /reviewerAssignmentsRecorded/);
});

test("metadata and dependency references pin the exact Wave 4 baseline", async () => {
  const artifacts = await readArtifacts();

  const metadata = clone(artifacts.artifact);
  metadata.metadata.reviewAuthorityArtifactVersion = "wave-4.slice-8.changed";
  assert.throws(() => validate(artifacts, metadata), /reviewAuthorityArtifactVersion/);

  const dependency = clone(artifacts.artifact);
  dependency.dependencyReferences.reviewCoverage.gapConfirmedSlotCount = 5;
  assert.throws(() => validate(artifacts, dependency), /gapConfirmedSlotCount/);

  const upstreamDrift = clone(artifacts);
  upstreamDrift.coverage.aggregate.statusCounts.GAP_CONFIRMED = 5;
  assert.throws(() => validate(upstreamDrift), /status counts|coverage/i);
});

test("unknown fields and every forbidden field or content term fail closed", async () => {
  const artifacts = await readArtifacts();

  const unknown = clone(artifacts.artifact);
  unknown.unexpected = true;
  assert.throws(() => validate(artifacts, unknown), /unexpected field/);

  for (const term of forbiddenTerms) {
    const forbiddenField = clone(artifacts.artifact);
    forbiddenField.prerequisites[0][term] = "blocked";
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
});

test("Slice 2 worktree guard admits the cumulative exact Slice 12 scope", () => {
  assert.deepEqual(
    validateActivationPrerequisitesChangedPaths(approvedSlice2ChangedPaths),
    approvedSlice2ChangedPaths,
  );

  const forbiddenPaths = [
    "README.md",
    "docs/wave-5/nested/slice-2-implementation-note.md",
    "docs/wave-5/slice-2-implementation-note.md.bak",
    "packages/curriculum/diagnostic-review-activation-prerequisites/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs.bak",
    "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
  ];
  for (const forbiddenPath of forbiddenPaths) {
    assert.throws(
      () => validateActivationPrerequisitesChangedPaths([forbiddenPath]),
      /Wave 5 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 2 guard admits only the exact five Slice 3 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-candidate-identity-policy-contract.md",
    "docs/wave-5/slice-3-implementation-note.md",
    "packages/curriculum/diagnostic-candidate-identity-policy/grade-7-9-math.candidate-identity-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
    "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
  ];
  assert.deepEqual(validateActivationPrerequisitesChangedPaths(approvedPaths), approvedPaths);

  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-candidate-identity-policy-contract.md.bak",
    "docs/wave-5/nested/slice-3-implementation-note.md",
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
      () => validateActivationPrerequisitesChangedPaths([forbiddenPath]),
      /Wave 5 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 2 guard admits only the exact five Slice 4 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md",
    "docs/wave-5/slice-4-implementation-note.md",
    "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
    "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
  ];
  assert.deepEqual(validateActivationPrerequisitesChangedPaths(approvedPaths), approvedPaths);

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
      () => validateActivationPrerequisitesChangedPaths([forbiddenPath]),
      /Wave 5 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 2 guard admits only the exact five Slice 5 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md",
    "docs/wave-5/slice-5-implementation-note.md",
    "packages/curriculum/diagnostic-reviewer-role-ownership-policy/grade-7-9-math.reviewer-role-ownership-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
    "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  ];
  assert.deepEqual(validateActivationPrerequisitesChangedPaths(approvedPaths), approvedPaths);

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
      () => validateActivationPrerequisitesChangedPaths([forbiddenPath]),
      /Wave 5 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 2 guard admits only the exact five Slice 6 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md",
    "docs/wave-5/slice-6-implementation-note.md",
    "packages/curriculum/diagnostic-separation-of-duties-policy/grade-7-9-math.separation-of-duties-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
    "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  ];
  assert.deepEqual(validateActivationPrerequisitesChangedPaths(approvedPaths), approvedPaths);

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
      () => validateActivationPrerequisitesChangedPaths([forbiddenPath]),
      /Wave 5 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 2 guard admits only the exact five Slice 7 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md",
    "docs/wave-5/slice-7-implementation-note.md",
    "packages/curriculum/diagnostic-conflict-of-interest-policy/grade-7-9-math.conflict-of-interest-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
    "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
  ];
  assert.deepEqual(validateActivationPrerequisitesChangedPaths(approvedPaths), approvedPaths);

  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md.bak",
    "docs/wave-5/nested/slice-7-implementation-note.md",
    "packages/curriculum/diagnostic-conflict-of-interest-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/conflict-of-interest.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-conflict-of-interest-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateActivationPrerequisitesChangedPaths([forbiddenPath]),
      /Wave 5 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 2 guard admits only the exact five Slice 8 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-audit-identity-policy-contract.md",
    "docs/wave-5/slice-8-implementation-note.md",
    "packages/curriculum/diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
    "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs",
  ];
  assert.deepEqual(validateActivationPrerequisitesChangedPaths(approvedPaths), approvedPaths);

  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-audit-identity-policy-contract.md.bak",
    "docs/wave-5/nested/slice-8-implementation-note.md",
    "packages/curriculum/diagnostic-audit-identity-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/audit-identity.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-audit-identity-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateActivationPrerequisitesChangedPaths([forbiddenPath]),
      /Wave 5 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 2 guard admits only the exact five Slice 10 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-production-approval-authority-policy-contract.md",
    "docs/wave-5/slice-10-implementation-note.md",
    "packages/curriculum/diagnostic-production-approval-authority-policy/grade-7-9-math.production-approval-authority-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
    "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  ];
  assert.deepEqual(validateActivationPrerequisitesChangedPaths(approvedPaths), approvedPaths);
  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-evidence-storage-retention-policy-contract.md.bak",
    "docs/wave-5/nested/slice-9-implementation-note.md",
    "packages/curriculum/diagnostic-evidence-storage-retention-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/evidence-storage.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateActivationPrerequisitesChangedPaths([forbiddenPath]),
      /Wave 5 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root test command registers the Slice 2 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");

  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  ]) {
    assert.equal(
      testCommand.split(exactRegistration).length - 1,
      1,
      `${exactRegistration} must occur exactly once`,
    );
  }
});

test("Slice 2 validator contains no broad documentation, curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL("../scripts/validate-diagnostic-review-activation-prerequisites.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});

test("Slice 2 guard admits only the exact five Slice 11 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-coverage-gap-closure-plan-contract.md",
    "docs/wave-5/slice-11-implementation-note.md",
    "packages/curriculum/diagnostic-coverage-gap-closure-plan/grade-7-9-math.coverage-gap-closure-plan-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs",
    "packages/curriculum/test/diagnostic-coverage-gap-closure-plan.test.mjs",
  ];
  assert.deepEqual(validateActivationPrerequisitesChangedPaths(approvedPaths), approvedPaths);
  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-coverage-gap-closure-plan-contract.md.bak",
    "docs/wave-5/nested/slice-11-implementation-note.md",
    "packages/curriculum/diagnostic-coverage-gap-closure-plan/extra.v1.json",
    "apps/api/src/diagnostic-review/coverage.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateActivationPrerequisitesChangedPaths([forbiddenPath]),
      /Wave 5 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 2 guard admits only the exact five Slice 12 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-readiness-integration-plan-contract.md",
    "docs/wave-5/slice-12-implementation-note.md",
    "packages/curriculum/diagnostic-readiness-integration-plan/grade-7-9-math.readiness-integration-plan-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
    "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
  ];
  assert.deepEqual(validateActivationPrerequisitesChangedPaths(approvedPaths), approvedPaths);
  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-readiness-integration-plan-contract.md.bak",
    "docs/wave-5/nested/slice-12-implementation-note.md",
    "packages/curriculum/diagnostic-readiness-integration-plan/extra.v1.json",
    "apps/api/src/diagnostic-readiness-policy/integration.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateActivationPrerequisitesChangedPaths([forbiddenPath]),
      /Wave 5 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});
