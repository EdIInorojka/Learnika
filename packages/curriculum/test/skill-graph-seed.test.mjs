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
  validateChangedPathScope,
  matchesExactPathSet,
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

test("scope guard permits only the exact Pre-Wave 7 Slice 7 presentation-flow worktree", () => {
  const slice7Paths = [...preWave7Slice7ChangedPaths];

  assert.equal(slice7Paths.length, preWave7Slice7ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice7Paths), slice7Paths);
  assert.equal(slice7Paths.includes("docs/wave-7-prep/school-demo-presentation-flow.md"), true);
  assert.equal(slice7Paths.includes("apps/web/lib/school-demo-view.ts"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice7Paths,
        "apps/web/app/school-demo/presentation-action.ts",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 8 guided-presentation worktree", () => {
  const slice8Paths = [...preWave7Slice8ChangedPaths];

  assert.equal(slice8Paths.length, preWave7Slice8ChangedPaths.size);
  assert.equal(matchesExactPathSet(slice8Paths, preWave7Slice1ChangedPaths), true);
  assert.deepEqual(validateSkillGraphChangedPaths(slice8Paths), slice8Paths);
  assert.equal(slice8Paths.includes("apps/web/app/school-demo/page.tsx"), true);
  assert.equal(slice8Paths.includes("apps/web/app/school-demo/classes/[classCode]/page.tsx"), true);
  assert.equal(slice8Paths.includes("apps/web/lib/school-demo-view.ts"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice8Paths,
        "apps/web/app/school-demo/classes/should-not-exist/page.tsx",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 9 compact-summary worktree", () => {
  const slice9Paths = [...preWave7Slice9ChangedPaths];

  assert.equal(slice9Paths.length, preWave7Slice9ChangedPaths.size);
  assert.equal(matchesExactPathSet(slice9Paths, preWave7Slice2ChangedPaths), true);
  assert.deepEqual(validateSkillGraphChangedPaths(slice9Paths), slice9Paths);
  assert.equal(slice9Paths.includes("apps/web/app/school-demo/summary/page.tsx"), true);
  assert.equal(slice9Paths.includes("apps/web/app/globals.css"), true);
  assert.equal(slice9Paths.includes("apps/web/lib/school-demo-view.ts"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice9Paths,
        "apps/web/app/school-demo/summary/export-action.ts",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 10 handoff worktree", () => {
  const slice10Paths = [...preWave7Slice10ChangedPaths];

  assert.equal(slice10Paths.length, preWave7Slice10ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice10Paths), slice10Paths);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice10Paths,
        "apps/web/app/school-demo/handoff/extra.tsx",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 11 guided-walkthrough worktree", () => {
  const slice11Paths = [...preWave7Slice11ChangedPaths];

  assert.equal(slice11Paths.length, preWave7Slice11ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice11Paths), slice11Paths);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice11Paths,
        "apps/web/app/school-demo/walkthrough/extra.tsx",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 12 pilot-checklist worktree", () => {
  const slice12Paths = [...preWave7Slice12ChangedPaths];

  assert.equal(slice12Paths.length, 9);
  assert.equal(slice12Paths.length, preWave7Slice12ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice12Paths), slice12Paths);
  assert.equal(slice12Paths.includes("apps/web/app/school-demo/pilot/page.tsx"), true);
  assert.equal(slice12Paths.includes("apps/web/lib/school-demo-view.ts"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice12Paths,
        "apps/web/app/school-demo/pilot/submit-action.ts",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 13 pilot-config worktree", () => {
  const slice13Paths = [...preWave7Slice13ChangedPaths];

  assert.equal(slice13Paths.length, 9);
  assert.equal(slice13Paths.length, preWave7Slice13ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice13Paths), slice13Paths);
  assert.equal(slice13Paths.includes("apps/web/app/school-demo/pilot-config/page.tsx"), true);
  assert.equal(slice13Paths.includes("apps/web/lib/school-demo-view.ts"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice13Paths,
        "apps/web/app/school-demo/pilot-config/extra.tsx",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 14 rollout worktree", () => {
  const slice14Paths = [...preWave7Slice14ChangedPaths];

  assert.equal(slice14Paths.length, 9);
  assert.equal(slice14Paths.length, preWave7Slice14ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice14Paths), slice14Paths);
  assert.equal(slice14Paths.includes("apps/web/app/school-demo/rollout/page.tsx"), true);
  assert.equal(slice14Paths.includes("apps/web/lib/school-demo-view.ts"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice14Paths,
        "apps/web/app/school-demo/rollout/action.ts",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 15 closure-gate worktree", () => {
  const slice15Paths = [...preWave7Slice15ChangedPaths];

  assert.equal(slice15Paths.length, 7);
  assert.equal(slice15Paths.length, preWave7Slice15ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice15Paths), slice15Paths);
  assert.equal(slice15Paths.includes("docs/wave-7-prep/school-demo-closure-gate.md"), true);
  assert.equal(slice15Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice15Paths,
        "docs/wave-7-prep/school-demo-closure-evidence.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 16 business-design-partner gate worktree", () => {
  const slice16Paths = [...preWave7Slice16ChangedPaths];

  assert.equal(slice16Paths.length, 7);
  assert.equal(slice16Paths.length, preWave7Slice16ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice16Paths), slice16Paths);
  assert.equal(
    slice16Paths.includes("docs/wave-7-prep/school-beta-business-design-partner-gate.md"),
    true,
  );
  assert.equal(slice16Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice16Paths,
        "docs/wave-7-prep/school-beta-design-partner-roster.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 17 data-processing privacy gate worktree", () => {
  const slice17Paths = [...preWave7Slice17ChangedPaths];

  assert.equal(slice17Paths.length, 7);
  assert.equal(slice17Paths.length, preWave7Slice17ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice17Paths), slice17Paths);
  assert.equal(
    slice17Paths.includes("docs/wave-7-prep/school-beta-data-processing-privacy-gate.md"),
    true,
  );
  assert.equal(slice17Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice17Paths,
        "docs/wave-7-prep/school-beta-legal-approval-record.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 18 security-isolation gate worktree", () => {
  const slice18Paths = [...preWave7Slice18ChangedPaths];

  assert.equal(slice18Paths.length, 7);
  assert.equal(slice18Paths.length, preWave7Slice18ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice18Paths), slice18Paths);
  assert.equal(
    slice18Paths.includes("docs/wave-7-prep/school-beta-security-isolation-review-gate.md"),
    true,
  );
  assert.equal(slice18Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice18Paths,
        "docs/wave-7-prep/school-beta-security-approval-record.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 19 teacher-workflow validation gate worktree", () => {
  const slice19Paths = [...preWave7Slice19ChangedPaths];

  assert.equal(slice19Paths.length, 7);
  assert.equal(slice19Paths.length, preWave7Slice19ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice19Paths), slice19Paths);
  assert.equal(
    slice19Paths.includes("docs/wave-7-prep/school-beta-teacher-workflow-validation-gate.md"),
    true,
  );
  assert.equal(slice19Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice19Paths,
        "docs/wave-7-prep/school-beta-teacher-workflow-approval-record.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 20 restore-readiness gate worktree", () => {
  const slice20Paths = [...preWave7Slice20ChangedPaths];

  assert.equal(slice20Paths.length, 7);
  assert.equal(slice20Paths.length, preWave7Slice20ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice20Paths), slice20Paths);
  assert.equal(
    slice20Paths.includes("docs/wave-7-prep/school-beta-restore-readiness-gate.md"),
    true,
  );
  assert.equal(slice20Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice20Paths,
        "docs/wave-7-prep/school-beta-restore-readiness-approval-record.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 21 independent-review approval gate worktree", () => {
  const slice21Paths = [...preWave7Slice21ChangedPaths];

  assert.equal(slice21Paths.length, 7);
  assert.equal(slice21Paths.length, preWave7Slice21ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice21Paths), slice21Paths);
  assert.equal(
    slice21Paths.includes("docs/wave-7-prep/school-beta-independent-review-approval-gate.md"),
    true,
  );
  assert.equal(slice21Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice21Paths,
        "docs/wave-7-prep/school-beta-independent-review-approval-record.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 22 school-beta gate foundation closure worktree", () => {
  const slice22Paths = [...preWave7Slice22ChangedPaths];

  assert.equal(slice22Paths.length, 7);
  assert.equal(slice22Paths.length, preWave7Slice22ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice22Paths), slice22Paths);
  assert.equal(
    slice22Paths.includes("docs/wave-7-prep/school-beta-gate-foundation-closure-gate.md"),
    true,
  );
  assert.equal(slice22Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice22Paths,
        "docs/wave-7-prep/school-beta-activation-approval-record.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 23 activation-packet template worktree", () => {
  const slice23Paths = [...preWave7Slice23ChangedPaths];

  assert.equal(slice23Paths.length, 7);
  assert.equal(slice23Paths.length, preWave7Slice23ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice23Paths), slice23Paths);
  assert.equal(
    slice23Paths.includes("docs/wave-7-prep/school-beta-activation-packet-template.md"),
    true,
  );
  assert.equal(slice23Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice23Paths,
        "docs/wave-7-prep/school-beta-activation-approved-packet.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 24 activation-packet template closure worktree", () => {
  const slice24Paths = [...preWave7Slice24ChangedPaths];

  assert.equal(slice24Paths.length, 7);
  assert.equal(slice24Paths.length, preWave7Slice24ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice24Paths), slice24Paths);
  assert.equal(
    slice24Paths.includes(
      "docs/wave-7-prep/school-beta-activation-packet-template-closure-gate.md",
    ),
    true,
  );
  assert.equal(slice24Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice24Paths,
        "docs/wave-7-prep/school-beta-activation-approval-record.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 25 acceleration roadmap worktree", () => {
  const slice25Paths = [...preWave7Slice25ChangedPaths];

  assert.equal(slice25Paths.length, 7);
  assert.equal(slice25Paths.length, preWave7Slice25ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice25Paths), slice25Paths);
  assert.equal(slice25Paths.includes("docs/wave-7-prep/school-beta-acceleration-roadmap.md"), true);
  assert.equal(slice25Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice25Paths,
        "apps/api/src/school-beta/activation.service.ts",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 26 activation-packet checklist worktree", () => {
  const slice26Paths = [...preWave7Slice26ChangedPaths];

  assert.equal(slice26Paths.length, 7);
  assert.equal(slice26Paths.length, preWave7Slice26ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice26Paths), slice26Paths);
  assert.equal(
    slice26Paths.includes("docs/wave-7-prep/school-beta-activation-packet-checklist.md"),
    true,
  );
  assert.equal(slice26Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice26Paths,
        "docs/wave-7-prep/school-beta-activation-evidence.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 27 future implementation slice-map worktree", () => {
  const slice27Paths = [...preWave7Slice27ChangedPaths];

  assert.equal(slice27Paths.length, 7);
  assert.equal(slice27Paths.length, preWave7Slice27ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice27Paths), slice27Paths);
  assert.equal(
    slice27Paths.includes("docs/wave-7-prep/school-beta-future-implementation-slice-map.md"),
    true,
  );
  assert.equal(slice27Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice27Paths,
        "apps/api/src/school-beta/implementation.service.ts",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 28 synthetic demo regression-matrix worktree", () => {
  const slice28Paths = [...preWave7Slice28ChangedPaths];

  assert.equal(slice28Paths.length, 7);
  assert.equal(slice28Paths.length, preWave7Slice28ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice28Paths), slice28Paths);
  assert.equal(slice28Paths.includes("docs/wave-7-prep/school-demo-regression-matrix.md"), true);
  assert.equal(slice28Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice28Paths,
        "apps/web/app/school-demo/regression-action.ts",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 29 school beta risk-register worktree", () => {
  const slice29Paths = [...preWave7Slice29ChangedPaths];

  assert.equal(slice29Paths.length, 7);
  assert.equal(slice29Paths.length, preWave7Slice29ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice29Paths), slice29Paths);
  assert.equal(slice29Paths.includes("docs/wave-7-prep/school-beta-risk-register.md"), true);
  assert.equal(slice29Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice29Paths,
        "docs/wave-7-prep/school-beta-risk-acceptance-record.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 30 school beta stop/go rubric worktree", () => {
  const slice30Paths = [...preWave7Slice30ChangedPaths];

  assert.equal(slice30Paths.length, 7);
  assert.equal(slice30Paths.length, preWave7Slice30ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice30Paths), slice30Paths);
  assert.equal(
    slice30Paths.includes("docs/wave-7-prep/school-beta-pre-activation-stop-go-rubric.md"),
    true,
  );
  assert.equal(slice30Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice30Paths,
        "docs/wave-7-prep/school-beta-pre-activation-approval-record.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 31 school beta acceleration closure worktree", () => {
  const slice31Paths = [...preWave7Slice31ChangedPaths];

  assert.equal(slice31Paths.length, 7);
  assert.equal(slice31Paths.length, preWave7Slice31ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice31Paths), slice31Paths);
  assert.equal(
    slice31Paths.includes("docs/wave-7-prep/school-beta-acceleration-closure-gate.md"),
    true,
  );
  assert.equal(slice31Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice31Paths,
        "docs/wave-7-prep/school-beta-activation-approval-record.md",
      ]),
    /Runtime or out-of-scope path changed/,
  );
});

test("scope guard permits only the exact Pre-Wave 7 Slice 32 external decision request worktree", () => {
  const slice32Paths = [...preWave7Slice32ChangedPaths];

  assert.equal(slice32Paths.length, 7);
  assert.equal(slice32Paths.length, preWave7Slice32ChangedPaths.size);
  assert.deepEqual(validateSkillGraphChangedPaths(slice32Paths), slice32Paths);
  assert.equal(
    slice32Paths.includes("docs/wave-7-prep/school-beta-external-decision-request.md"),
    true,
  );
  assert.equal(slice32Paths.includes("packages/curriculum/scripts/validate-skill-graph.mjs"), true);
  assert.throws(
    () =>
      validateSkillGraphChangedPaths([
        ...slice32Paths,
        "docs/wave-7-prep/school-beta-external-decision-answers.md",
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
