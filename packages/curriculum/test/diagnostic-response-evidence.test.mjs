import assert from "node:assert/strict";
import test from "node:test";

import { readDiagnosticBlueprint } from "../scripts/validate-diagnostic-blueprint.mjs";
import { readDiagnosticItemFixtures } from "../scripts/validate-diagnostic-items.mjs";
import {
  readDiagnosticResponseEvidenceFixtures,
  validateDiagnosticResponseEvidenceFixtures,
  validateDiagnosticResponseEvidenceWorktreeScope,
} from "../scripts/validate-diagnostic-response-evidence.mjs";
import {
  preWave7Slice1ChangedPaths,
  preWave7Slice2ChangedPaths,
  preWave7Slice3ChangedPaths,
  preWave7Slice4ChangedPaths,
  preWave7Slice5ChangedPaths,
  preWave7Slice6ChangedPaths,
  preWave7Slice7ChangedPaths,
  preWave7Slice8ChangedPaths,
  preWave7Slice9ChangedPaths,
  preWave7Slice10ChangedPaths,
  preWave7Slice11ChangedPaths,
  preWave7Slice12ChangedPaths,
  preWave7Slice13ChangedPaths,
  preWave7Slice14ChangedPaths,
  preWave7Slice15ChangedPaths,
  preWave7Slice16ChangedPaths,
  preWave7Slice17ChangedPaths,
  preWave7Slice18ChangedPaths,
  preWave7Slice19ChangedPaths,
  preWave7Slice20ChangedPaths,
  preWave7Slice21ChangedPaths,
  preWave7Slice22ChangedPaths,
  preWave7Slice23ChangedPaths,
  preWave7Slice24ChangedPaths,
  preWave7Slice25ChangedPaths,
  preWave7Slice26ChangedPaths,
  preWave7Slice27ChangedPaths,
  preWave7Slice28ChangedPaths,
  preWave7Slice29ChangedPaths,
  preWave7Slice30ChangedPaths,
  preWave7Slice31ChangedPaths,
  preWave7Slice32ChangedPaths,
  preWave7Slice33ChangedPaths,
  preWave7Slice34ChangedPaths,
  preWave7Slice35ChangedPaths,
  preWave7Slice36ChangedPaths,
  preWave7Slice37ChangedPaths,
  preWave7Slice38ChangedPaths,
  preWave7Slice39ChangedPaths,
  preWave7Slice40ChangedPaths,
  preWave7Slice41ChangedPaths,
  readSkillGraph,
  wave7PrepFoundationPaths,
} from "../scripts/validate-skill-graph.mjs";

const wave5DocumentationPathsThroughSlice10 = new Set([
  "docs/wave-6/diagnostic-canonicalization-digest-policy-decision-proposal.md",
  "docs/wave-6/diagnostic-candidate-identity-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/scope-and-non-goals.md",
  "docs/wave-6/slice-1-implementation-note.md",
  "docs/wave-6/slice-2-implementation-note.md",
  "docs/wave-6/diagnostic-reviewer-role-ownership-policy-decision-proposal.md",
  "docs/wave-6/slice-3-implementation-note.md",
  "docs/wave-6/diagnostic-separation-of-duties-policy-decision-proposal.md",
  "docs/wave-6/slice-4-implementation-note.md",
  "docs/wave-6/diagnostic-conflict-of-interest-policy-decision-proposal.md",
  "docs/wave-6/slice-5-implementation-note.md",
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
  "docs/wave-6/slice-7-implementation-note.md",
  "docs/wave-6/diagnostic-production-approval-authority-policy-decision-proposal.md",
  "docs/wave-6/slice-8-implementation-note.md",
  "docs/wave-6/diagnostic-coverage-gap-closure-plan-decision-proposal.md",
  "docs/wave-6/slice-9-implementation-note.md",
  "docs/wave-6/diagnostic-readiness-integration-plan-decision-proposal.md",
  "docs/wave-6/slice-10-implementation-note.md",
  "packages/curriculum/diagnostic-readiness-integration-plan-decision-proposal/grade-7-9-math.readiness-integration-plan-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-rollback-withdrawal-policy-decision-proposal.md",
  "docs/wave-6/slice-11-implementation-note.md",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy-decision-proposal/grade-7-9-math.rollback-withdrawal-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-ci-validation-activation-gate-decision-proposal.md",
  "docs/wave-6/slice-12-implementation-note.md",
  "packages/curriculum/diagnostic-ci-validation-activation-gate-decision-proposal/grade-7-9-math.ci-validation-activation-gate-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-activation-slice-boundary-decision-proposal.md",
  "docs/wave-6/slice-13-implementation-note.md",
  "packages/curriculum/diagnostic-activation-slice-boundary-decision-proposal/grade-7-9-math.activation-slice-boundary-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-activation-slice-boundary-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-activation-slice-boundary-decision-proposal.test.mjs",
  "docs/wave-5/closure-gate.md",
  "docs/wave-5/diagnostic-audit-identity-policy-contract.md",
  "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md",
  "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md",
  "docs/wave-5/diagnostic-evidence-storage-retention-policy-contract.md",
  "docs/wave-5/diagnostic-production-approval-authority-policy-contract.md",
  "docs/wave-5/diagnostic-coverage-gap-closure-plan-contract.md",
  "docs/wave-5/diagnostic-ci-validation-activation-gate-contract.md",
  "docs/wave-5/diagnostic-readiness-integration-plan-contract.md",
  "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
  "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md",
  "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md",
  "docs/wave-5/diagnostic-candidate-identity-policy-contract.md",
  "docs/wave-5/diagnostic-review-activation-prerequisites-contract.md",
  "docs/wave-5/open-decisions.md",
  "docs/wave-5/scope-and-non-goals.md",
  "docs/wave-5/slice-1-implementation-note.md",
  "docs/wave-5/slice-2-implementation-note.md",
  "docs/wave-5/slice-3-implementation-note.md",
  "docs/wave-5/slice-4-implementation-note.md",
  "docs/wave-5/slice-5-implementation-note.md",
  "docs/wave-5/slice-6-implementation-note.md",
  "docs/wave-5/slice-7-implementation-note.md",
  "docs/wave-5/slice-8-implementation-note.md",
  "docs/wave-5/slice-9-implementation-note.md",
  "docs/wave-5/slice-10-implementation-note.md",
  "docs/wave-5/slice-11-implementation-note.md",
  "docs/wave-5/slice-12-implementation-note.md",
  "docs/wave-5/slice-13-implementation-note.md",
  "docs/wave-5/slice-14-implementation-note.md",
]);

const forbiddenFields = [
  "answer",
  "finalAnswer",
  "correctAnswer",
  "solution",
  "workedSolution",
  "hint",
  "correctOption",
  "scoringKey",
  "isCorrect",
  "score",
  "mastery",
  "proficiency",
  "providerPayload",
  "prompt",
  "completion",
  "textbookContent",
  "copiedText",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [fixtures, skillGraph, blueprint, diagnosticItems] = await Promise.all([
    readDiagnosticResponseEvidenceFixtures(),
    readSkillGraph(),
    readDiagnosticBlueprint(),
    readDiagnosticItemFixtures(),
  ]);
  return { fixtures, skillGraph, blueprint, diagnosticItems };
}

test("diagnostic response and evidence fixtures are structurally valid", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  const summary = validateDiagnosticResponseEvidenceFixtures(
    fixtures,
    skillGraph,
    blueprint,
    diagnosticItems,
  );

  assert.equal(summary.fixtureSetVersion, "wave-3.slice-5.grade-7-9-math.v1");
  assert.equal(summary.responseCount, 3);
  assert.equal(summary.evidenceCount, 3);
  assert.equal(summary.transitionCount, 7);
  assert.deepEqual(summary.strands, ["data", "geometry", "number"]);
});

test("response/evidence validator rejects duplicate response IDs", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  fixtures.responses[1].id = fixtures.responses[0].id;

  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(fixtures, skillGraph, blueprint, diagnosticItems),
    /Duplicate diagnostic response ID/,
  );
});

test("response/evidence validator rejects duplicate evidence IDs", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  fixtures.evidenceRecords[1].id = fixtures.evidenceRecords[0].id;

  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(fixtures, skillGraph, blueprint, diagnosticItems),
    /Duplicate diagnostic evidence ID/,
  );
});

test("response/evidence validator rejects unknown diagnostic item IDs", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  fixtures.responses[0].diagnosticItemId = "ditem.math.number.unknown.fixture-01.v1";

  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(fixtures, skillGraph, blueprint, diagnosticItems),
    /unknown diagnostic item/,
  );
});

test("response/evidence validator rejects unknown canonical skill IDs", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  fixtures.evidenceRecords[0].canonicalSkillId = "math.number.unknown.v1";

  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(fixtures, skillGraph, blueprint, diagnosticItems),
    /unknown canonical skill/,
  );
});

test("response/evidence validator rejects unknown blueprint slot IDs", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  fixtures.responses[0].blueprintSlotId = "diag.math.g7-9.number.unknown.v1";

  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(fixtures, skillGraph, blueprint, diagnosticItems),
    /unknown blueprint slot/,
  );
});

test("response/evidence validator rejects invalid grade bands", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  const invalidResponse = clone(fixtures);
  invalidResponse.responses[0].gradeBand = { min: 6, max: 9 };
  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(
        invalidResponse,
        skillGraph,
        blueprint,
        diagnosticItems,
      ),
    /grades 7-9/,
  );

  const invalidEvidence = clone(fixtures);
  invalidEvidence.evidenceRecords[0].gradeBand = { min: 7, max: 10 };
  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(
        invalidEvidence,
        skillGraph,
        blueprint,
        diagnosticItems,
      ),
    /grades 7-9/,
  );
});

test("response/evidence validator rejects every forbidden field term", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();

  for (const forbiddenField of forbiddenFields) {
    const unsafeFixtures = clone(fixtures);
    unsafeFixtures.responses[0][forbiddenField] = "blocked";
    assert.throws(
      () =>
        validateDiagnosticResponseEvidenceFixtures(
          unsafeFixtures,
          skillGraph,
          blueprint,
          diagnosticItems,
        ),
      /forbidden field term/,
      forbiddenField,
    );
  }
});

test("response/evidence validator scans forbidden placeholder content", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  fixtures.responses[0].content = "This synthetic fixture contains an answer.";

  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(fixtures, skillGraph, blueprint, diagnosticItems),
    /forbidden content term answer/,
  );
});

test("response/evidence validator rejects runtime session and PII fields", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  const runtimeFields = [
    "attemptId",
    "sessionId",
    "diagnosticResult",
    "studentData",
    "childId",
    "email",
    "submittedAt",
  ];

  for (const runtimeField of runtimeFields) {
    const unsafeFixtures = clone(fixtures);
    unsafeFixtures.responses[0][runtimeField] = "blocked";
    assert.throws(
      () =>
        validateDiagnosticResponseEvidenceFixtures(
          unsafeFixtures,
          skillGraph,
          blueprint,
          diagnosticItems,
        ),
      /forbidden runtime or PII field term/,
      runtimeField,
    );
  }
});

test("response/evidence fixtures remain synthetic and non-production", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  const enabledSet = clone(fixtures);
  enabledSet.metadata.productionUseAllowed = true;
  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(
        enabledSet,
        skillGraph,
        blueprint,
        diagnosticItems,
      ),
    /synthetic-only non-production fixtures/,
  );

  const realResponse = clone(fixtures);
  realResponse.responses[0].syntheticOnly = false;
  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(
        realResponse,
        skillGraph,
        blueprint,
        diagnosticItems,
      ),
    /syntheticOnly must be true/,
  );
});

test("response/evidence validator rejects unsupported state transitions", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  fixtures.stateTransitions[0] = {
    from: "observed",
    to: "not_reached",
    policyNote: "Blocked transition.",
  };

  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(fixtures, skillGraph, blueprint, diagnosticItems),
    /Unsupported non-scoring state transition/,
  );
});

test("evidence records remain non-aggregating", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  fixtures.evidenceRecords[0].aggregationMode = "weighted";

  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(fixtures, skillGraph, blueprint, diagnosticItems),
    /aggregationMode must be none/,
  );
});

test("evidence references and state must match its response", async () => {
  const { fixtures, skillGraph, blueprint, diagnosticItems } = await readArtifacts();
  fixtures.evidenceRecords[0].observationState = "uncertain";

  assert.throws(
    () =>
      validateDiagnosticResponseEvidenceFixtures(fixtures, skillGraph, blueprint, diagnosticItems),
    /references and state must match its response/,
  );
});

test("slice scope guard rejects API OpenAPI Prisma web and other runtime paths", () => {
  const changedPaths = validateDiagnosticResponseEvidenceWorktreeScope();

  for (const changedPath of changedPaths) {
    const isLegacyStaticPath = /^(docs\/wave-(?:3|4)\/|packages\/curriculum\/|package\.json$)/.test(
      changedPath,
    );
    assert.equal(
      isLegacyStaticPath ||
        wave5DocumentationPathsThroughSlice10.has(changedPath) ||
        wave7PrepFoundationPaths.has(changedPath) ||
        preWave7Slice1ChangedPaths.has(changedPath) ||
        preWave7Slice2ChangedPaths.has(changedPath) ||
        preWave7Slice3ChangedPaths.has(changedPath) ||
        preWave7Slice4ChangedPaths.has(changedPath) ||
        preWave7Slice5ChangedPaths.has(changedPath) ||
        preWave7Slice6ChangedPaths.has(changedPath) ||
        preWave7Slice7ChangedPaths.has(changedPath) ||
        preWave7Slice8ChangedPaths.has(changedPath) ||
        preWave7Slice9ChangedPaths.has(changedPath) ||
        preWave7Slice10ChangedPaths.has(changedPath) ||
        preWave7Slice11ChangedPaths.has(changedPath) ||
        preWave7Slice12ChangedPaths.has(changedPath) ||
        preWave7Slice13ChangedPaths.has(changedPath) ||
        preWave7Slice14ChangedPaths.has(changedPath) ||
        preWave7Slice15ChangedPaths.has(changedPath) ||
        preWave7Slice16ChangedPaths.has(changedPath) ||
        preWave7Slice17ChangedPaths.has(changedPath) ||
        preWave7Slice18ChangedPaths.has(changedPath) ||
        preWave7Slice19ChangedPaths.has(changedPath) ||
        preWave7Slice20ChangedPaths.has(changedPath) ||
        preWave7Slice21ChangedPaths.has(changedPath) ||
        preWave7Slice22ChangedPaths.has(changedPath) ||
        preWave7Slice23ChangedPaths.has(changedPath) ||
        preWave7Slice24ChangedPaths.has(changedPath) ||
        preWave7Slice25ChangedPaths.has(changedPath) ||
        preWave7Slice26ChangedPaths.has(changedPath) ||
        preWave7Slice27ChangedPaths.has(changedPath) ||
        preWave7Slice28ChangedPaths.has(changedPath) ||
        preWave7Slice29ChangedPaths.has(changedPath) ||
        preWave7Slice30ChangedPaths.has(changedPath) ||
        preWave7Slice31ChangedPaths.has(changedPath) ||
        preWave7Slice32ChangedPaths.has(changedPath) ||
        preWave7Slice33ChangedPaths.has(changedPath) ||
        preWave7Slice34ChangedPaths.has(changedPath) ||
        preWave7Slice35ChangedPaths.has(changedPath) ||
        preWave7Slice36ChangedPaths.has(changedPath) ||
        preWave7Slice37ChangedPaths.has(changedPath) ||
        preWave7Slice38ChangedPaths.has(changedPath) ||
        preWave7Slice39ChangedPaths.has(changedPath) ||
        preWave7Slice40ChangedPaths.has(changedPath) ||
        preWave7Slice41ChangedPaths.has(changedPath) ||
        changedPath === "docs/wave-6/closure-gate.md" ||
        changedPath === "apps/api/test/mock-ocr-candidate-api.e2e.mjs",
      true,
      changedPath,
    );
  }
});
