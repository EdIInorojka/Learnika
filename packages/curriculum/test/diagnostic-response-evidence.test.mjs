import assert from "node:assert/strict";
import test from "node:test";

import { readDiagnosticBlueprint } from "../scripts/validate-diagnostic-blueprint.mjs";
import { readDiagnosticItemFixtures } from "../scripts/validate-diagnostic-items.mjs";
import {
  readDiagnosticResponseEvidenceFixtures,
  validateDiagnosticResponseEvidenceFixtures,
  validateDiagnosticResponseEvidenceWorktreeScope,
} from "../scripts/validate-diagnostic-response-evidence.mjs";
import { readSkillGraph } from "../scripts/validate-skill-graph.mjs";

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
    assert.match(changedPath, /^(docs\/wave-(?:3|4)\/|packages\/curriculum\/|package\.json$)/);
  }
});
