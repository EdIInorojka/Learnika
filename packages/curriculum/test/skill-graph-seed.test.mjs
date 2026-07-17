import assert from "node:assert/strict";
import test from "node:test";

import {
  readSkillGraph,
  validateChangedPathScope,
  validateSkillGraphChangedPaths,
  validateSkillGraph,
} from "../scripts/validate-skill-graph.mjs";

const wave5DocumentationPathsThroughClosure = [
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
];

function cloneGraph(graph) {
  return JSON.parse(JSON.stringify(graph));
}

test("grade 7-9 math skill graph seed is structurally valid", async () => {
  const graph = await readSkillGraph();
  const summary = validateSkillGraph(graph);

  assert.equal(summary.graphVersion, "wave-3.slice-2.grade-7-9-math.v1");
  assert.equal(summary.skillCount, 27);
  assert.deepEqual(summary.strands, ["algebra", "data", "functions", "geometry", "number"]);
});

test("skill graph validator rejects invalid IDs", async () => {
  const graph = cloneGraph(await readSkillGraph());
  graph.skills[0].id = "math.bad.invalid.v1";

  assert.throws(() => validateSkillGraph(graph), /canonical skill ID pattern/);
});

test("skill graph validator rejects duplicate IDs", async () => {
  const graph = cloneGraph(await readSkillGraph());
  graph.skills[1].id = graph.skills[0].id;

  assert.throws(() => validateSkillGraph(graph), /Duplicate skill ID/);
});

test("skill graph validator rejects invalid grade bands", async () => {
  const graph = cloneGraph(await readSkillGraph());
  graph.skills[0].gradeBand = { min: 6, max: 9 };

  assert.throws(() => validateSkillGraph(graph), /grades 7-9/);
});

test("skill graph validator rejects unknown prerequisite references", async () => {
  const graph = cloneGraph(await readSkillGraph());
  graph.skills[0].prerequisites = ["math.number.unknown.v1"];

  assert.throws(() => validateSkillGraph(graph), /unknown prerequisite/);
});

test("skill graph validator detects prerequisite cycles", async () => {
  const graph = cloneGraph(await readSkillGraph());
  graph.skills[0].prerequisites = [graph.skills[1].id];

  assert.throws(() => validateSkillGraph(graph), /cycle detected/);
});

test("skill graph validator scans forbidden fields and terms", async () => {
  const fieldGraph = cloneGraph(await readSkillGraph());
  fieldGraph.skills[0].finalAnswer = "blocked";
  assert.throws(() => validateSkillGraph(fieldGraph), /forbidden field term finalAnswer/);

  const valueGraph = cloneGraph(await readSkillGraph());
  valueGraph.skills[0].shortDescription = "This hidden answer is blocked.";
  assert.throws(() => validateSkillGraph(valueGraph), /forbidden content term answer/);
});

test("skill graph validator requires all high-level strands and probability coverage", async () => {
  const missingStrand = cloneGraph(await readSkillGraph());
  missingStrand.skills = missingStrand.skills.filter((skill) => skill.strand !== "functions");
  const remainingSkillIds = new Set(missingStrand.skills.map((skill) => skill.id));
  for (const skill of missingStrand.skills) {
    skill.prerequisites = skill.prerequisites.filter((prerequisiteId) =>
      remainingSkillIds.has(prerequisiteId),
    );
  }
  assert.throws(
    () => validateSkillGraph(missingStrand),
    /Missing high-level coverage for strand functions/,
  );

  const missingProbability = cloneGraph(await readSkillGraph());
  missingProbability.skills = missingProbability.skills.filter((skill) => skill.strand !== "data");
  missingProbability.skills.push({
    id: "math.data.statistics-basic.v1",
    title: "Basic statistics",
    shortDescription: "Use simple descriptive statistics for grade 7-9 work.",
    gradeBand: { min: 7, max: 9 },
    strand: "data",
    prerequisites: ["math.number.percent-ratio.v1"],
    safetyNotes: ["Draft parent skill; use only as reviewed structural metadata."],
  });
  assert.throws(() => validateSkillGraph(missingProbability), /data\/probability/);
});

test("slice scope guard rejects runtime and out-of-scope worktree paths", () => {
  const changedPaths = validateChangedPathScope();

  for (const changedPath of changedPaths) {
    const isLegacyStaticPath = /^(docs\/wave-(?:3|4)\/|packages\/curriculum\/|package\.json$)/.test(
      changedPath,
    );
    assert.equal(
      isLegacyStaticPath || wave5DocumentationPathsThroughClosure.includes(changedPath),
      true,
      changedPath,
    );
  }
});

test("Wave 5 scope guard permits only thirty exact documentation paths through closure", () => {
  assert.deepEqual(
    validateSkillGraphChangedPaths(wave5DocumentationPathsThroughClosure),
    wave5DocumentationPathsThroughClosure,
  );
  assert.equal(wave5DocumentationPathsThroughClosure.length, 30);

  const forbiddenPaths = [
    "docs/wave-5/slice-15-implementation-note.md",
    "docs/wave-5/nested/scope-and-non-goals.md",
    "docs/wave-5/scope-and-non-goals.md.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum-runtime/diagnostic-review.ts",
    "pnpm-lock.yaml",
  ];

  for (const forbiddenPath of forbiddenPaths) {
    assert.throws(
      () => validateSkillGraphChangedPaths([forbiddenPath]),
      /Runtime or out-of-scope path changed/,
      forbiddenPath,
    );
  }
});
