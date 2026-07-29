import assert from "node:assert/strict";
import test from "node:test";

import {
  readSkillGraph,
  preWave7Slice1ChangedPaths,
  preWave7Slice2ChangedPaths,
  preWave7Slice3ChangedPaths,
  preWave7Slice4ChangedPaths,
  preWave7Slice5ChangedPaths,
  preWave7Slice6ChangedPaths,
  validateChangedPathScope,
  validateSkillGraphChangedPaths,
  validateSkillGraph,
  wave6ClosureContinuationPaths,
  wave7PrepFoundationPaths,
} from "../scripts/validate-skill-graph.mjs";

const staticDocumentationPathsThroughWave6Slice2 = [
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
      isLegacyStaticPath ||
        staticDocumentationPathsThroughWave6Slice2.includes(changedPath) ||
        wave7PrepFoundationPaths.has(changedPath) ||
        preWave7Slice1ChangedPaths.has(changedPath) ||
        preWave7Slice2ChangedPaths.has(changedPath) ||
        preWave7Slice3ChangedPaths.has(changedPath) ||
        preWave7Slice4ChangedPaths.has(changedPath) ||
        preWave7Slice5ChangedPaths.has(changedPath) ||
        preWave7Slice6ChangedPaths.has(changedPath) ||
        changedPath === "docs/wave-6/closure-gate.md" ||
        changedPath === "apps/api/test/mock-ocr-candidate-api.e2e.mjs",
      true,
      changedPath,
    );
  }
});

test("scope guard admits only the exact Pre-Wave 7 Slice 2 seed-data worktree", () => {
  const slice2Paths = [...preWave7Slice2ChangedPaths];

  assert.equal(slice2Paths.length, 44);
  assert.deepEqual(validateSkillGraphChangedPaths(slice2Paths), slice2Paths);
  assert.throws(
    () => validateSkillGraphChangedPaths(slice2Paths.slice(1)),
    /Runtime or out-of-scope path changed/,
  );
  assert.throws(
    () => validateSkillGraphChangedPaths([...slice2Paths, "apps/api/src/school/school.module.ts"]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 4 school drilldown worktree", () => {
  const slice4Paths = [...preWave7Slice4ChangedPaths];

  assert.equal(slice4Paths.length, preWave7Slice4ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice4Paths), slice4Paths);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice4Paths,
        "apps/web/app/school-demo/classes/should-not-exist/page.tsx",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 5 visual polish worktree", () => {
  const slice5Paths = [...preWave7Slice5ChangedPaths];

  assert.equal(slice5Paths.length, preWave7Slice5ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice5Paths), slice5Paths);
  assert.equal(slice5Paths.includes("apps/web/app/globals.css"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice5Paths,
        "apps/web/app/school-demo/marketing-hero.tsx",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 6 dual-theme worktree", () => {
  const slice6Paths = [...preWave7Slice6ChangedPaths];

  assert.equal(slice6Paths.length, preWave7Slice6ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice6Paths), slice6Paths);
  assert.equal(slice6Paths.includes("apps/web/app/globals.css"), true);
  assert.equal(slice6Paths.includes("apps/web/lib/school-demo-view.ts"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice6Paths,
        "apps/web/app/school-demo/theme-cookie-action.ts",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits exactly the five Wave 7 prep foundation documents", () => {
  const prepPaths = [...wave7PrepFoundationPaths];
  assert.equal(prepPaths.length, 5);
  assert.equal(
    prepPaths.every((path) => wave6ClosureContinuationPaths.has(path)),
    true,
  );
  assert.deepEqual(validateSkillGraphChangedPaths(prepPaths), prepPaths);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths(["docs/wave-7-prep/archive/school-demo-foundation-gate.md"]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only forty-eight exact documentation paths through Wave 6 Slice 8", () => {
  const slice8Only = staticDocumentationPathsThroughWave6Slice2.filter(
    (value) =>
      ![
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
      ].includes(value),
  );
  assert.deepEqual(validateSkillGraphChangedPaths(slice8Only), slice8Only);
  assert.equal(slice8Only.length, 48);

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
