import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticCoverageGapClosurePlan,
  readDiagnosticCoverageGapClosurePlanUpstreamArtifacts,
  validateCoverageGapClosurePlanChangedPaths,
  validateDiagnosticCoverageGapClosurePlan,
} from "../scripts/validate-diagnostic-coverage-gap-closure-plan.mjs";

const expectedRequirementIds = [
  "coverage_threshold_and_balance",
  "per_gap_authoring_sequence",
  "draft_fixture_disposition",
  "rights_safe_candidate_authoring",
  "review_evidence_requirements",
  "substantive_gate_review_requirements",
  "production_approval_requirements",
  "no_silent_waiver_and_closure_validation",
  "coverage_reconciliation_and_invalidation",
  "partial_failure_rollback_and_recovery",
];
const expectedGapSlotIds = [
  "diag.math.g7-9.number.percent-ratio.v1",
  "diag.math.g7-9.algebra.linear-equation-one-variable.v1",
  "diag.math.g7-9.algebra.powers-and-roots.v1",
  "diag.math.g7-9.functions.linear-function.v1",
  "diag.math.g7-9.geometry.basic-objects-angles.v1",
  "diag.math.g7-9.geometry.triangle-properties.v1",
];
const expectedDraftOnlySlotIds = [
  "diag.math.g7-9.number.rational-number-operations.v1",
  "diag.math.g7-9.algebra.expression-transformations.v1",
  "diag.math.g7-9.functions.coordinate-plane-graphs.v1",
  "diag.math.g7-9.geometry.parallel-lines.v1",
  "diag.math.g7-9.data.probability-statistics-basic.v1",
];
const expectedChangedPaths = [
  "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
  "docs/wave-5/slice-13-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy/grade-7-9-math.rollback-withdrawal-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
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
  "realDiagnosticItemRecords",
  "realCandidateRecords",
  "candidateIdentityRecords",
  "canonicalizationOutputRecords",
  "digestValueRecords",
  "reviewEvidenceRecords",
  "evidenceFileRecords",
  "storageObjectRecords",
  "gateCompletionRecords",
  "gateDecisionRecords",
  "reviewDecisionRecords",
  "reviewerIdentityRecords",
  "auditIdentityRecords",
  "reviewerAssignmentRecords",
  "productionApproverRecords",
  "authorityGrantRecords",
  "approvalDecisionRecords",
  "productionApprovalRecords",
  "coverageClosureRecords",
  "coverageWaiverRecords",
  "auditLogRecords",
  "auditEventRecords",
];

async function loadFixture() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticCoverageGapClosurePlan(),
    readDiagnosticCoverageGapClosurePlanUpstreamArtifacts(),
  ]);
  return { artifact, upstream };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("coverage gap closure plan placeholder is valid and unresolved", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(validateDiagnosticCoverageGapClosurePlan(artifact, upstream), {
    planArtifactVersion: "wave-5.slice-11.grade-7-9-math.v1",
    planVersion: "wave-5.slice-11.diagnostic-coverage-gap-closure-plan.placeholder.v1",
    planState: "UNRESOLVED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    slotPlanEntryCount: 11,
    gapEntryCount: 6,
    draftOnlyEntryCount: 5,
    decisionRequirementCount: 10,
    closedGapCount: 0,
    productionApprovedSlotCount: 0,
    realDiagnosticItemCount: 0,
    realCandidateCount: 0,
    reviewEvidenceRecordCount: 0,
    reviewDecisionCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("coverage gap closure prerequisite remains exact and unsatisfied", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(artifact.prerequisiteReference, {
    prerequisiteId: "coverage_gap_closure_plan",
    status: "UNSATISFIED_DEFERRED",
    ownerPlaceholderId: "UNASSIGNED_OWNER_PLACEHOLDER",
    evidenceRequirementDescription:
      "Future per-slot rights-safe authoring and fixture-disposition plan with explicit coverage thresholds and no-silent-waiver checks.",
    evidenceRecordRefs: [],
  });
  const changed = clone(artifact);
  changed.prerequisiteReference.status = "SATISFIED";
  assert.throws(() => validateDiagnosticCoverageGapClosurePlan(changed, upstream));
});

test("all exact coverage activation authority evidence and rubric pins remain unchanged", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(artifact.dependencyReferences).map(([key, value]) => [
        key,
        value.artifactVersion,
      ]),
    ),
    {
      reviewCoverage: "wave-4.slice-2.grade-7-9-math.v1",
      activationPrerequisites: "wave-5.slice-2.grade-7-9-math.v1",
      productionApprovalAuthorityPolicy: "wave-5.slice-10.grade-7-9-math.v1",
      evidenceStorageRetentionPolicy: "wave-5.slice-9.grade-7-9-math.v1",
      reviewGateRubric: "wave-4.slice-4.grade-7-9-math.v1",
    },
  );
  const upstreamDrift = clone(upstream);
  upstreamDrift.productionUpstream.evidenceUpstream.auditUpstream.coverage.aggregate.statusCounts.GAP_CONFIRMED = 5;
  assert.throws(() => validateDiagnosticCoverageGapClosurePlan(artifact, upstreamDrift));
});

test("coverage baseline remains exactly 5 draft-only 6 gaps and 0 approved", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(artifact.coverageBaseline.statusCounts, {
    DRAFT_ONLY: 5,
    GAP_CONFIRMED: 6,
    PRODUCTION_APPROVED: 0,
  });
  const changed = clone(artifact);
  changed.coverageBaseline.statusCounts.PRODUCTION_APPROVED = 1;
  assert.throws(() => validateDiagnosticCoverageGapClosurePlan(changed, upstream));
});

test("all 11 slot plan entries mirror the exact coverage slots", async () => {
  const { artifact, upstream } = await loadFixture();
  const coverage = upstream.productionUpstream.evidenceUpstream.auditUpstream.coverage;
  assert.equal(artifact.slotPlanEntries.length, 11);
  assert.deepEqual(
    artifact.slotPlanEntries.map((entry) => [entry.blueprintSlotId, entry.baselineCoverageStatus]),
    coverage.slots.map((slot) => [slot.blueprintSlotId, slot.coverageStatus]),
  );
  for (const mutation of [
    (changed) => changed.slotPlanEntries.pop(),
    (changed) => changed.slotPlanEntries.reverse(),
    (changed) => (changed.slotPlanEntries[0].baselineCoverageStatus = "GAP_CONFIRMED"),
    (changed) => (changed.slotPlanEntries[0].planEntryKind = "GAP_CLOSURE_PLACEHOLDER"),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticCoverageGapClosurePlan(changed, upstream));
  }
});

test("six gap entries match only current confirmed gaps and remain open", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(
    artifact.gapEntries.map((entry) => entry.blueprintSlotId),
    expectedGapSlotIds,
  );
  assert.ok(
    artifact.gapEntries.every(
      (entry) =>
        entry.gapState === "OPEN_UNRESOLVED" &&
        entry.gapClosed === false &&
        entry.waiverRecorded === false &&
        entry.productionApproved === false,
    ),
  );
  for (const mutation of [
    (changed) => changed.gapEntries.pop(),
    (changed) => changed.gapEntries.reverse(),
    (changed) => (changed.gapEntries[0].gapState = "CLOSED"),
    (changed) => (changed.gapEntries[0].gapClosed = true),
    (changed) => (changed.gapEntries[0].productionApproved = true),
    (changed) => (changed.gapEntries[0].waiverRecorded = true),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticCoverageGapClosurePlan(changed, upstream));
  }
});

test("five draft-only entries remain unresolved and non-production", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(
    artifact.draftOnlyEntries.map((entry) => entry.blueprintSlotId),
    expectedDraftOnlySlotIds,
  );
  assert.ok(
    artifact.draftOnlyEntries.every(
      (entry) =>
        entry.draftAdvanced === false &&
        entry.fixtureProductionUseAllowed === false &&
        entry.productionApproved === false,
    ),
  );
  for (const mutation of [
    (changed) => changed.draftOnlyEntries.pop(),
    (changed) => changed.draftOnlyEntries.reverse(),
    (changed) => (changed.draftOnlyEntries[0].draftState = "ADVANCED"),
    (changed) => (changed.draftOnlyEntries[0].draftAdvanced = true),
    (changed) => (changed.draftOnlyEntries[0].fixtureProductionUseAllowed = true),
    (changed) => (changed.draftOnlyEntries[0].productionApproved = true),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticCoverageGapClosurePlan(changed, upstream));
  }
});

test("authoring evidence gate and production requirement placeholders remain disabled", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.equal(artifact.candidateAuthoringRequirementPlaceholder.candidateAuthoringAllowed, false);
  assert.equal(artifact.reviewEvidenceRequirementPlaceholder.evidenceLinkageAllowed, false);
  assert.equal(artifact.gateReviewRequirementPlaceholder.gateEvaluationAllowed, false);
  assert.equal(
    artifact.productionApprovalRequirementPlaceholder.productionApprovalRecordingAllowed,
    false,
  );
  const changed = clone(artifact);
  changed.candidateAuthoringRequirementPlaceholder.diagnosticItemCreationAllowed = true;
  assert.throws(() => validateDiagnosticCoverageGapClosurePlan(changed, upstream));
});

test("exact ten coverage plan decisions remain unresolved", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.deepEqual(
    artifact.decisionRequirements.map((requirement) => requirement.requirementId),
    expectedRequirementIds,
  );
  assert.ok(
    artifact.decisionRequirements.every(
      (requirement) =>
        requirement.state === "TO_BE_DECIDED" &&
        requirement.decisionReference === null &&
        requirement.policyReference === null &&
        requirement.activeRuleReferences.length === 0 &&
        requirement.decisionRecorded === false,
    ),
  );
  const changed = clone(artifact);
  changed.decisionRequirements[0].decisionRecorded = true;
  assert.throws(() => validateDiagnosticCoverageGapClosurePlan(changed, upstream));
});

test("activation workflow and readiness remain blocked", async () => {
  const { artifact, upstream } = await loadFixture();
  assert.equal(artifact.activationBoundary.status, "BLOCKED");
  assert.equal(artifact.activationBoundary.reviewWorkflowStatus, "INACTIVE");
  assert.deepEqual(artifact.readiness, {
    policyVersion: "wave-3-slice-11-diagnostic-readiness-policy-v1",
    status: "NOT_READY",
    blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
  });
  for (const mutation of [
    (changed) => (changed.activationBoundary.activationAllowed = true),
    (changed) => (changed.activationBoundary.status = "ACTIVE"),
    (changed) => (changed.readiness.status = "READY"),
  ]) {
    const changed = clone(artifact);
    mutation(changed);
    assert.throws(() => validateDiagnosticCoverageGapClosurePlan(changed, upstream));
  }
});

test("all protected records and matching aggregates remain zero", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const field of protectedRecordFields) {
    assert.deepEqual(artifact[field], [], field);
  }
  assert.ok(Object.values(artifact.recordBoundary).every((value) => value === false));
  for (const [field, value] of Object.entries(artifact.aggregate)) {
    if (
      ![
        "slotPlanEntryCount",
        "gapEntryCount",
        "draftOnlyEntryCount",
        "decisionRequirementCount",
        "undecidedRequirementCount",
      ].includes(field)
    ) {
      assert.equal(value, 0, field);
    }
  }
  const changed = clone(artifact);
  changed.productionApprovalRecords.push({ state: "recorded" });
  assert.throws(() => validateDiagnosticCoverageGapClosurePlan(changed, upstream));
});

test("candidate identifiers and item payload fields fail closed", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const forbiddenField of [
    "candidateId",
    "candidateIds",
    "itemStem",
    "stemText",
    "candidateContent",
    "diagnosticItemContent",
  ]) {
    const changed = clone(artifact);
    changed.metadata[forbiddenField] = "forbidden";
    assert.throws(
      () => validateDiagnosticCoverageGapClosurePlan(changed, upstream),
      undefined,
      forbiddenField,
    );
  }
});

test("unknown fields and every requested forbidden term fail closed", async () => {
  const { artifact, upstream } = await loadFixture();
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
    "storageObjectKey",
    "presignedUrl",
    "downloadUrl",
    "uploadUrl",
  ];
  for (const forbiddenTerm of forbiddenTerms) {
    const changed = clone(artifact);
    changed.metadata[forbiddenTerm] = "forbidden";
    assert.throws(
      () => validateDiagnosticCoverageGapClosurePlan(changed, upstream),
      undefined,
      forbiddenTerm,
    );
  }
  const unknown = clone(artifact);
  unknown.metadata.unexpectedField = false;
  assert.throws(() => validateDiagnosticCoverageGapClosurePlan(unknown, upstream));
});

test("private identity location candidate and hash-like values fail closed", async () => {
  const { artifact, upstream } = await loadFixture();
  for (const privateValue of [
    "person@example.test",
    "https://example.test/evidence",
    "www.example.test",
    "123e4567-e89b-42d3-a456-426614174000",
    "user-abcdef12",
    "account_abcdef12",
    "dcandidate.math.fixture-01.v1",
    "candidate-abcdef12",
    "0123456789abcdef0123456789abcdef",
  ]) {
    const changed = clone(artifact);
    changed.metadata.sourceContract = privateValue;
    assert.throws(
      () => validateDiagnosticCoverageGapClosurePlan(changed, upstream),
      undefined,
      privateValue,
    );
  }
});

test("Slice 11 guard permits only the exact 42 Slice 13 implementation paths", () => {
  assert.equal(expectedChangedPaths.length, 42);
  assert.equal(new Set(expectedChangedPaths).size, 42);
  assert.deepEqual(
    validateCoverageGapClosurePlanChangedPaths(expectedChangedPaths),
    expectedChangedPaths,
  );
  for (const forbiddenPath of [
    "README.md",
    "docs/wave-5/slice-14-implementation-note.md",
    "docs/wave-5/archive/diagnostic-coverage-gap-closure-plan-contract.md",
    "docs/wave-5/diagnostic-coverage-gap-closure-plan-contract.md.bak",
    "packages/curriculum/diagnostic-coverage-gap-closure-plan/extra.json",
    "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs.bak",
    "packages/curriculum/test/diagnostic-coverage-gap-closure-plan.test.mjs.bak",
    "packages/curriculum/src/coverage/runtime.mjs",
    "apps/api/src/coverage/coverage.controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/api/prisma/migrations/999_slice11/migration.sql",
    "apps/web/app/diagnostic-coverage/page.tsx",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
  ]) {
    assert.throws(
      () => validateCoverageGapClosurePlanChangedPaths([forbiddenPath]),
      /Wave 5 Slice 13 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root test command registers the Slice 11 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");
  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-coverage-gap-closure-plan.test.mjs",
  ]) {
    assert.equal(
      testCommand.split(exactRegistration).length - 1,
      1,
      `${exactRegistration} must occur exactly once`,
    );
  }
});

test("Slice 11 validator contains no broad documentation curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL("../scripts/validate-diagnostic-coverage-gap-closure-plan.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
