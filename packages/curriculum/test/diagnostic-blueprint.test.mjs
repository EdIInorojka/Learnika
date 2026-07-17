import assert from "node:assert/strict";
import test from "node:test";

import {
  readDiagnosticBlueprint,
  validateDiagnosticBlueprint,
  validateDiagnosticWorktreeScope,
} from "../scripts/validate-diagnostic-blueprint.mjs";
import { readSkillGraph } from "../scripts/validate-skill-graph.mjs";

const wave5DocumentationPathsThroughSlice10 = new Set([
  "docs/wave-6/diagnostic-candidate-identity-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/scope-and-non-goals.md",
  "docs/wave-6/slice-1-implementation-note.md",
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [blueprint, skillGraph] = await Promise.all([readDiagnosticBlueprint(), readSkillGraph()]);
  return { blueprint, skillGraph };
}

test("grade 7-9 math diagnostic blueprint is structurally valid", async () => {
  const { blueprint, skillGraph } = await readArtifacts();
  const summary = validateDiagnosticBlueprint(blueprint, skillGraph);

  assert.equal(summary.blueprintVersion, "wave-3.slice-3.grade-7-9-math.v1");
  assert.equal(summary.itemCount, 11);
  assert.deepEqual(summary.strands, ["algebra", "data", "functions", "geometry", "number"]);
  assert.deepEqual(summary.evidenceCategories, [
    "concept_recognition",
    "multi_step_organization",
    "procedure_selection",
    "reasoning_justification",
    "representation_interpretation",
  ]);
});

test("diagnostic validator rejects unknown canonical skill IDs", async () => {
  const { blueprint, skillGraph } = await readArtifacts();
  blueprint.items[0].primarySkillId = "math.number.unknown.v1";

  assert.throws(() => validateDiagnosticBlueprint(blueprint, skillGraph), /unknown primary skill/);
});

test("diagnostic validator rejects duplicate item IDs", async () => {
  const { blueprint, skillGraph } = await readArtifacts();
  blueprint.items[1].id = blueprint.items[0].id;

  assert.throws(
    () => validateDiagnosticBlueprint(blueprint, skillGraph),
    /Duplicate diagnostic item ID/,
  );
});

test("diagnostic validator rejects invalid item IDs", async () => {
  const { blueprint, skillGraph } = await readArtifacts();
  blueprint.items[0].id = "diag.math.g6.number.invalid.v1";

  assert.throws(
    () => validateDiagnosticBlueprint(blueprint, skillGraph),
    /diagnostic item ID pattern/,
  );
});

test("diagnostic validator rejects invalid grade bands", async () => {
  const { blueprint, skillGraph } = await readArtifacts();
  blueprint.items[0].gradeBand = { min: 6, max: 9 };

  assert.throws(() => validateDiagnosticBlueprint(blueprint, skillGraph), /grades 7-9/);
});

test("diagnostic validator scans forbidden fields and terms", async () => {
  const { blueprint, skillGraph } = await readArtifacts();
  const fieldBlueprint = clone(blueprint);
  fieldBlueprint.items[0].finalAnswer = "blocked";
  assert.throws(
    () => validateDiagnosticBlueprint(fieldBlueprint, skillGraph),
    /forbidden field term finalAnswer/,
  );

  const valueBlueprint = clone(blueprint);
  valueBlueprint.metadata.notes.push("A hidden answer is blocked.");
  assert.throws(
    () => validateDiagnosticBlueprint(valueBlueprint, skillGraph),
    /forbidden content term answer/,
  );
});

test("diagnostic validator requires coverage across canonical strands", async () => {
  const { blueprint, skillGraph } = await readArtifacts();
  blueprint.items = blueprint.items.filter((item) => item.strand !== "data");

  assert.throws(
    () => validateDiagnosticBlueprint(blueprint, skillGraph),
    /Missing diagnostic coverage for canonical strand data/,
  );
});

test("diagnostic validator keeps item strand aligned with canonical skill", async () => {
  const { blueprint, skillGraph } = await readArtifacts();
  blueprint.items[0].primarySkillId = "math.algebra.expression-value.v1";

  assert.throws(() => validateDiagnosticBlueprint(blueprint, skillGraph), /primary skill strand/);
});

test("diagnostic validator pins the canonical skill graph version", async () => {
  const { blueprint, skillGraph } = await readArtifacts();
  blueprint.metadata.canonicalSkillGraphVersion = "wave-3.slice-2.grade-7-9-math.v2";

  assert.throws(
    () => validateDiagnosticBlueprint(blueprint, skillGraph),
    /does not match the canonical skill graph/,
  );
});

test("diagnostic validator rejects runtime-shaped fields", async () => {
  const { blueprint, skillGraph } = await readArtifacts();
  blueprint.runtimeAttempts = [];

  assert.throws(
    () => validateDiagnosticBlueprint(blueprint, skillGraph),
    /unexpected field for a static blueprint/,
  );
});

test("diagnostic result semantics remain non-scoring placeholders", async () => {
  const { blueprint, skillGraph } = await readArtifacts();
  blueprint.nonScoringResultSemantics.claimsMastery = true;

  assert.throws(() => validateDiagnosticBlueprint(blueprint, skillGraph), /cannot claim mastery/);
});

test("slice scope guard rejects runtime and out-of-scope worktree paths", () => {
  const changedPaths = validateDiagnosticWorktreeScope();

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
