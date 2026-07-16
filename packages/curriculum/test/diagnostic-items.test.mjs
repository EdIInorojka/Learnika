import assert from "node:assert/strict";
import test from "node:test";

import { readDiagnosticBlueprint } from "../scripts/validate-diagnostic-blueprint.mjs";
import {
  readDiagnosticItemFixtures,
  validateDiagnosticItemFixtures,
  validateDiagnosticItemWorktreeScope,
} from "../scripts/validate-diagnostic-items.mjs";
import { readSkillGraph } from "../scripts/validate-skill-graph.mjs";

const wave5DocumentationPathsThroughSlice10 = new Set([
  "docs/wave-5/diagnostic-audit-identity-policy-contract.md",
  "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md",
  "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md",
  "docs/wave-5/diagnostic-evidence-storage-retention-policy-contract.md",
  "docs/wave-5/diagnostic-production-approval-authority-policy-contract.md",
  "docs/wave-5/diagnostic-coverage-gap-closure-plan-contract.md",
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
]);

const forbiddenFields = [
  "answer",
  "finalAnswer",
  "solution",
  "workedSolution",
  "hint",
  "promptCompletion",
  "providerPayload",
  "textbookContent",
  "copiedText",
  "correctOption",
  "scoringKey",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [fixtures, skillGraph, blueprint] = await Promise.all([
    readDiagnosticItemFixtures(),
    readSkillGraph(),
    readDiagnosticBlueprint(),
  ]);
  return { fixtures, skillGraph, blueprint };
}

test("grade 7-9 diagnostic item fixtures are structurally valid", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  const summary = validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint);

  assert.equal(summary.fixtureSetVersion, "wave-3.slice-4.grade-7-9-math.v1");
  assert.equal(summary.itemCount, 5);
  assert.deepEqual(summary.strands, ["algebra", "data", "functions", "geometry", "number"]);
  assert.equal(summary.blueprintVersion, "wave-3.slice-3.grade-7-9-math.v1");
  assert.equal(summary.graphVersion, "wave-3.slice-2.grade-7-9-math.v1");
});

test("diagnostic item validator rejects duplicate item IDs", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  fixtures.items[1].id = fixtures.items[0].id;

  assert.throws(
    () => validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint),
    /Duplicate diagnostic item ID/,
  );
});

test("diagnostic item validator rejects invalid item IDs", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  fixtures.items[0].id = "ditem.math.number.invalid.v1";

  assert.throws(
    () => validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint),
    /diagnostic item fixture ID pattern/,
  );
});

test("diagnostic item validator rejects unknown skill IDs", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  fixtures.items[0].primarySkillId = "math.number.unknown.v1";

  assert.throws(
    () => validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint),
    /unknown primary skill/,
  );
});

test("diagnostic item validator rejects unknown blueprint slot IDs", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  fixtures.items[0].blueprintSlotId = "diag.math.g7-9.number.unknown.v1";

  assert.throws(
    () => validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint),
    /unknown blueprint slot/,
  );
});

test("diagnostic item validator rejects invalid grade bands", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  fixtures.items[0].gradeBand = { min: 6, max: 9 };

  assert.throws(
    () => validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint),
    /grades 7-9/,
  );
});

test("diagnostic item validator rejects every forbidden field term", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();

  for (const forbiddenField of forbiddenFields) {
    const unsafeFixtures = clone(fixtures);
    unsafeFixtures.items[0][forbiddenField] = "blocked";
    assert.throws(
      () => validateDiagnosticItemFixtures(unsafeFixtures, skillGraph, blueprint),
      /forbidden field term/,
      forbiddenField,
    );
  }
});

test("diagnostic item validator scans forbidden stem content", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  fixtures.items[0].stem = "This fixture contains a hidden answer.";

  assert.throws(
    () => validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint),
    /forbidden content term answer/,
  );
});

test("diagnostic item fixtures require Russian-language stems", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  fixtures.items[0].stem = "Describe one mathematical relation.";

  assert.throws(
    () => validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint),
    /must contain Russian-language Cyrillic text/,
  );
});

test("diagnostic item validator rejects runtime attempt result and student fields", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  const runtimeFields = ["runtimeAttempt", "diagnosticResult", "studentData", "learnerResponse"];

  for (const runtimeField of runtimeFields) {
    const unsafeFixtures = clone(fixtures);
    unsafeFixtures.items[0][runtimeField] = "blocked";
    assert.throws(
      () => validateDiagnosticItemFixtures(unsafeFixtures, skillGraph, blueprint),
      /forbidden runtime or student data field term/,
      runtimeField,
    );
  }
});

test("diagnostic item fixtures remain explicitly non-production", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  const enabledSet = clone(fixtures);
  enabledSet.metadata.productionUseAllowed = true;
  assert.throws(
    () => validateDiagnosticItemFixtures(enabledSet, skillGraph, blueprint),
    /metadata.productionUseAllowed must be false/,
  );

  const enabledItem = clone(fixtures);
  enabledItem.items[0].status = "reviewed";
  assert.throws(
    () => validateDiagnosticItemFixtures(enabledItem, skillGraph, blueprint),
    /status must be draft_non_production_fixture/,
  );
});

test("diagnostic item evidence category must match the blueprint slot", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  fixtures.items[0].evidenceCategory = "procedure_selection";

  assert.throws(
    () => validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint),
    /evidenceCategory must match its blueprint slot/,
  );
});

test("diagnostic item evaluation remains deferred", async () => {
  const { fixtures, skillGraph, blueprint } = await readArtifacts();
  fixtures.items[0].evaluationPlaceholder = {
    status: "active",
    mode: "deterministic",
    policyNote: "Blocked in Slice 4.",
  };

  assert.throws(
    () => validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint),
    /must keep evaluation deferred with mode none/,
  );
});

test("slice scope guard rejects API OpenAPI Prisma web and other runtime paths", () => {
  const changedPaths = validateDiagnosticItemWorktreeScope();

  for (const changedPath of changedPaths) {
    const isLegacyStaticPath = /^(docs\/wave-(?:3|4)\/|packages\/curriculum\/|package\.json$)/.test(
      changedPath,
    );
    assert.equal(
      isLegacyStaticPath || wave5DocumentationPathsThroughSlice10.has(changedPath),
      true,
      changedPath,
    );
  }
});
