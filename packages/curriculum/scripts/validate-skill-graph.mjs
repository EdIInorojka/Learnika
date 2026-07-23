import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const skillIdPattern =
  /^math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.v[1-9][0-9]*$/;
const requiredStrands = new Set(["number", "algebra", "functions", "geometry", "data"]);
const forbiddenTerms = [
  "providerPayload",
  "textbookContent",
  "copiedText",
  "finalAnswer",
  "answer",
  "solution",
  "hint",
  "prompt",
  "completion",
];
const allowedChangedPathPrefixes = ["docs/wave-3/", "docs/wave-4/", "packages/curriculum/"];
const allowedChangedPaths = new Set([
  "docs/wave-6/diagnostic-canonicalization-digest-policy-decision-proposal.md",
  "docs/wave-6/diagnostic-candidate-identity-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/scope-and-non-goals.md",
  "docs/wave-6/slice-1-implementation-note.md",
  "docs/wave-6/slice-2-implementation-note.md",
  "docs/wave-6/diagnostic-reviewer-role-ownership-policy-decision-proposal.md",
  "docs/wave-6/slice-3-implementation-note.md",
  "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-separation-of-duties-policy-decision-proposal.md",
  "docs/wave-6/slice-4-implementation-note.md",
  "packages/curriculum/diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "docs/wave-5/closure-gate.md",
  "docs/wave-5/diagnostic-audit-identity-policy-contract.md",
  "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md",
  "docs/wave-5/diagnostic-evidence-storage-retention-policy-contract.md",
  "docs/wave-5/diagnostic-production-approval-authority-policy-contract.md",
  "docs/wave-5/diagnostic-coverage-gap-closure-plan-contract.md",
  "docs/wave-5/diagnostic-ci-validation-activation-gate-contract.md",
  "docs/wave-5/diagnostic-readiness-integration-plan-contract.md",
  "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
  "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md",
  "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md",
  "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md",
  "docs/wave-5/diagnostic-review-activation-prerequisites-contract.md",
  "docs/wave-5/diagnostic-candidate-identity-policy-contract.md",
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
  "package.json",
]);
const approvedSlice7ChangedPathPrefixes = ["apps/api/src/diagnostic-session-state/"];
const approvedSlice7ChangedPaths = new Set([
  "apps/api/package.json",
  "apps/api/test/diagnostic-session-state.test.mjs",
]);
const approvedSlice8ChangedPathPrefixes = ["apps/api/src/diagnostic-catalog/"];
const approvedSlice8ChangedPaths = new Set([
  "apps/api/package.json",
  "apps/api/test/diagnostic-catalog.test.mjs",
]);
const approvedSlice9ChangedPathPrefixes = ["apps/api/src/diagnostic-session-plan/"];
const approvedSlice9ChangedPaths = new Set([
  "apps/api/package.json",
  "apps/api/test/diagnostic-session-plan.test.mjs",
]);
const approvedSlice10ChangedPathPrefixes = ["apps/api/src/diagnostic-session-draft/"];
const approvedSlice10ChangedPaths = new Set([
  "apps/api/package.json",
  "apps/api/test/diagnostic-session-draft.test.mjs",
]);
const approvedSlice11ChangedPathPrefixes = ["apps/api/src/diagnostic-readiness-policy/"];
const approvedSlice11ChangedPaths = new Set([
  "apps/api/package.json",
  "apps/api/test/diagnostic-readiness-policy.test.mjs",
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultArtifactPath = path.resolve(
  scriptDir,
  "../skill-graph/grade-7-9-math.seed.v1.json",
);
export const repoRoot = path.resolve(scriptDir, "../../..");

export class SkillGraphValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "SkillGraphValidationError";
  }
}

function fail(message) {
  throw new SkillGraphValidationError(message);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, fieldPath) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${fieldPath} must be a non-empty string.`);
  }
}

function normalizeForbiddenTerm(term) {
  return term.toLowerCase();
}

function scanForbiddenTerms(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbiddenTerms(item, `${fieldPath}[${index}]`));
    return;
  }

  if (isPlainObject(value)) {
    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      for (const term of forbiddenTerms) {
        if (normalizedKey.includes(normalizeForbiddenTerm(term))) {
          fail(`${fieldPath}.${key} uses forbidden field term ${term}.`);
        }
      }
      scanForbiddenTerms(nestedValue, `${fieldPath}.${key}`);
    }
    return;
  }

  if (typeof value === "string") {
    const normalizedValue = value.toLowerCase();
    for (const term of forbiddenTerms) {
      if (normalizedValue.includes(normalizeForbiddenTerm(term))) {
        fail(`${fieldPath} uses forbidden content term ${term}.`);
      }
    }
  }
}

function validateGradeBand(skill) {
  if (!isPlainObject(skill.gradeBand)) {
    fail(`${skill.id}.gradeBand must be an object.`);
  }

  const { min, max } = skill.gradeBand;
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    fail(`${skill.id}.gradeBand min and max must be integers.`);
  }
  if (min < 7 || max > 9 || min > max) {
    fail(`${skill.id}.gradeBand must stay within grades 7-9.`);
  }
}

function validatePrerequisites(skillsById) {
  for (const skill of skillsById.values()) {
    if (!Array.isArray(skill.prerequisites)) {
      fail(`${skill.id}.prerequisites must be an array.`);
    }

    const seenPrerequisites = new Set();
    for (const prerequisiteId of skill.prerequisites) {
      if (typeof prerequisiteId !== "string") {
        fail(`${skill.id}.prerequisites must contain only skill IDs.`);
      }
      if (!skillsById.has(prerequisiteId)) {
        fail(`${skill.id} references unknown prerequisite ${prerequisiteId}.`);
      }
      if (seenPrerequisites.has(prerequisiteId)) {
        fail(`${skill.id} repeats prerequisite ${prerequisiteId}.`);
      }
      seenPrerequisites.add(prerequisiteId);
    }
  }
}

function detectPrerequisiteCycles(skillsById) {
  const visiting = new Set();
  const visited = new Set();

  function visit(skillId, pathStack) {
    if (visited.has(skillId)) {
      return;
    }
    if (visiting.has(skillId)) {
      fail(`Prerequisite cycle detected: ${[...pathStack, skillId].join(" -> ")}.`);
    }

    visiting.add(skillId);
    const skill = skillsById.get(skillId);
    for (const prerequisiteId of skill.prerequisites) {
      visit(prerequisiteId, [...pathStack, skillId]);
    }
    visiting.delete(skillId);
    visited.add(skillId);
  }

  for (const skillId of skillsById.keys()) {
    visit(skillId, []);
  }
}

function validateCoverage(skills) {
  const presentStrands = new Set(skills.map((skill) => skill.strand));
  for (const requiredStrand of requiredStrands) {
    if (!presentStrands.has(requiredStrand)) {
      fail(`Missing high-level coverage for strand ${requiredStrand}.`);
    }
  }

  const hasProbabilityCoverage = skills.some(
    (skill) =>
      skill.strand === "data" &&
      `${skill.id} ${skill.title} ${skill.shortDescription}`.toLowerCase().includes("probability"),
  );
  if (!hasProbabilityCoverage) {
    fail("Missing data/probability high-level coverage.");
  }
}

export function validateSkillGraph(graph) {
  if (!isPlainObject(graph)) {
    fail("Skill graph seed must be a JSON object.");
  }
  scanForbiddenTerms(graph);

  if (!isPlainObject(graph.metadata)) {
    fail("metadata must be an object.");
  }
  requireString(graph.metadata.schemaVersion, "metadata.schemaVersion");
  requireString(graph.metadata.graphVersion, "metadata.graphVersion");
  requireString(graph.metadata.status, "metadata.status");
  if (graph.metadata.subject !== "math") {
    fail("metadata.subject must be math.");
  }
  if (!Array.isArray(graph.metadata.audienceGrades)) {
    fail("metadata.audienceGrades must be an array.");
  }
  if (
    graph.metadata.audienceGrades.some(
      (grade) => !Number.isInteger(grade) || grade < 7 || grade > 9,
    )
  ) {
    fail("metadata.audienceGrades must stay within grades 7-9.");
  }

  if (!Array.isArray(graph.skills) || graph.skills.length === 0) {
    fail("skills must be a non-empty array.");
  }

  const skillsById = new Map();
  for (const [index, skill] of graph.skills.entries()) {
    if (!isPlainObject(skill)) {
      fail(`skills[${index}] must be an object.`);
    }

    requireString(skill.id, `skills[${index}].id`);
    if (!skillIdPattern.test(skill.id)) {
      fail(`${skill.id} does not match the canonical skill ID pattern.`);
    }
    if (skillsById.has(skill.id)) {
      fail(`Duplicate skill ID ${skill.id}.`);
    }

    requireString(skill.title, `${skill.id}.title`);
    requireString(skill.shortDescription, `${skill.id}.shortDescription`);
    requireString(skill.strand, `${skill.id}.strand`);

    const idStrand = skill.id.split(".")[1];
    if (skill.strand !== idStrand || !requiredStrands.has(skill.strand)) {
      fail(`${skill.id}.strand must match its ID namespace.`);
    }

    validateGradeBand(skill);

    if (!Array.isArray(skill.safetyNotes)) {
      fail(`${skill.id}.safetyNotes must be an array.`);
    }
    for (const [noteIndex, note] of skill.safetyNotes.entries()) {
      requireString(note, `${skill.id}.safetyNotes[${noteIndex}]`);
    }

    skillsById.set(skill.id, skill);
  }

  validatePrerequisites(skillsById);
  detectPrerequisiteCycles(skillsById);
  validateCoverage(graph.skills);

  return {
    graphVersion: graph.metadata.graphVersion,
    skillCount: graph.skills.length,
    strands: [...new Set(graph.skills.map((skill) => skill.strand))].sort(),
  };
}

export async function readSkillGraph(artifactPath = defaultArtifactPath) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateSkillGraphChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }
  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    const isStaticSlicePath =
      allowedChangedPaths.has(changedPath) ||
      allowedChangedPathPrefixes.some((prefix) => changedPath.startsWith(prefix));
    const isApprovedSlice7Path =
      approvedSlice7ChangedPaths.has(changedPath) ||
      approvedSlice7ChangedPathPrefixes.some((prefix) => changedPath.startsWith(prefix));
    const isApprovedSlice8Path =
      approvedSlice8ChangedPaths.has(changedPath) ||
      approvedSlice8ChangedPathPrefixes.some((prefix) => changedPath.startsWith(prefix));
    const isApprovedSlice9Path =
      approvedSlice9ChangedPaths.has(changedPath) ||
      approvedSlice9ChangedPathPrefixes.some((prefix) => changedPath.startsWith(prefix));
    const isApprovedSlice10Path =
      approvedSlice10ChangedPaths.has(changedPath) ||
      approvedSlice10ChangedPathPrefixes.some((prefix) => changedPath.startsWith(prefix));
    const isApprovedSlice11Path =
      approvedSlice11ChangedPaths.has(changedPath) ||
      approvedSlice11ChangedPathPrefixes.some((prefix) => changedPath.startsWith(prefix));
    if (
      !isStaticSlicePath &&
      !isApprovedSlice7Path &&
      !isApprovedSlice8Path &&
      !isApprovedSlice9Path &&
      !isApprovedSlice10Path &&
      !isApprovedSlice11Path
    ) {
      fail(`Runtime or out-of-scope path changed: ${changedPath}.`);
    }
  }

  return changedPaths.filter(
    (changedPath) =>
      allowedChangedPaths.has(changedPath) ||
      allowedChangedPathPrefixes.some((prefix) => changedPath.startsWith(prefix)),
  );
}

export function validateChangedPathScope({ cwd = repoRoot } = {}) {
  const result = spawnSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    fail(`Unable to inspect git status: ${result.stderr || result.stdout}`);
  }

  const changedPaths = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map(normalizeStatusPath);

  return validateSkillGraphChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const graph = await readSkillGraph();
  const summary = validateSkillGraph(graph);

  if (checkWorktreeScope) {
    validateChangedPathScope();
  }

  console.log(
    `[curriculum] Skill graph seed ${summary.graphVersion} validated: ${summary.skillCount} skills across ${summary.strands.join(", ")}.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    console.error(`[curriculum] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
