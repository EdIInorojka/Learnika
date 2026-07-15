import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticBlueprint } from "./validate-diagnostic-blueprint.mjs";
import { readDiagnosticItemFixtures } from "./validate-diagnostic-items.mjs";

const expectedCoverageArtifactVersion = "wave-4.slice-2.grade-7-9-math.v1";
const expectedBlueprintVersion = "wave-3.slice-3.grade-7-9-math.v1";
const expectedFixtureSetVersion = "wave-3.slice-4.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const pendingDigest = "PENDING_IMMUTABLE_CANDIDATE";

const requiredGateNames = [
  "methodology",
  "safety_no_answer",
  "rights_copyright",
  "grade_placement",
  "accessibility_readability",
  "production_approval",
];
const expectedPolicyVersionPins = new Map([
  ["methodology", "wave-4.slice-1.methodology-review.v1"],
  ["safety_no_answer", "wave-4.slice-1.safety-no-answer-review.v1"],
  ["rights_copyright", "wave-4.slice-1.rights-copyright-review.v1"],
  ["grade_placement", "wave-4.slice-1.grade-placement-review.v1"],
  ["accessibility_readability", "wave-4.slice-1.accessibility-readability-review.v1"],
  ["production_approval", "wave-4.slice-1.production-approval.v1"],
]);
const requiredBlockingReasons = new Set(["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"]);
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
];

const topLevelFields = new Set([
  "metadata",
  "policyVersionPins",
  "readiness",
  "aggregate",
  "slots",
]);
const metadataFields = new Set([
  "schemaVersion",
  "coverageArtifactVersion",
  "status",
  "artifactKind",
  "subject",
  "locale",
  "audienceGrades",
  "diagnosticBlueprintVersion",
  "diagnosticItemFixtureSetVersion",
  "diagnosticReadinessPolicyVersion",
  "sourceContract",
  "productionUseAllowed",
  "runtimeUseAllowed",
  "storageAllowed",
]);
const readinessFields = new Set([
  "status",
  "policyVersion",
  "blockingReasons",
  "productionUseAllowed",
]);
const aggregateFields = new Set(["blueprintSlotCount", "statusCounts"]);
const statusCountFields = new Set(["DRAFT_ONLY", "GAP_CONFIRMED", "PRODUCTION_APPROVED"]);
const slotFields = new Set([
  "blueprintSlotId",
  "coverageStatus",
  "candidateFixtureIds",
  "candidateDigest",
  "artifactVersionPins",
  "reviewGates",
]);
const candidateDigestFields = new Set(["state", "algorithm", "value"]);
const artifactVersionPinFields = new Set([
  "diagnosticBlueprintVersion",
  "diagnosticItemFixtureSetVersion",
]);
const gateFields = new Set([
  "status",
  "policyVersion",
  "candidateDigest",
  "reviewerRole",
  "evidenceRef",
  "decidedAt",
]);
const approvedSlice2ChangedPaths = new Set([
  "docs/wave-4/closure-gate.md",
  "docs/wave-4/diagnostic-candidate-canonicalization-contract.md",
  "docs/wave-4/diagnostic-candidate-digest-contract.md",
  "docs/wave-4/diagnostic-review-authority-contract.md",
  "docs/wave-4/diagnostic-review-evidence-contract.md",
  "docs/wave-4/diagnostic-review-gate-rubric-contract.md",
  "docs/wave-4/diagnostic-review-workflow-state-contract.md",
  "docs/wave-4/slice-2-implementation-note.md",
  "docs/wave-4/slice-3-implementation-note.md",
  "docs/wave-4/slice-4-implementation-note.md",
  "docs/wave-4/slice-5-implementation-note.md",
  "docs/wave-4/slice-6-implementation-note.md",
  "docs/wave-4/slice-7-implementation-note.md",
  "docs/wave-4/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-candidate-canonicalization/grade-7-9-math.canonicalization-placeholder.v1.json",
  "packages/curriculum/diagnostic-candidate-digest/grade-7-9-math.candidate-digest-placeholder.v1.json",
  "packages/curriculum/diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
  "packages/curriculum/diagnostic-review-coverage/grade-7-9-math.review-coverage.v1.json",
  "packages/curriculum/diagnostic-review-evidence/grade-7-9-math.review-evidence.v1.json",
  "packages/curriculum/diagnostic-review-gate-rubric/grade-7-9-math.review-gate-rubric.v1.json",
  "packages/curriculum/diagnostic-review-workflow-state/grade-7-9-math.review-workflow-state-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/test/diagnostic-candidate-canonicalization.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-digest.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-review-coverage.test.mjs",
  "packages/curriculum/test/diagnostic-review-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-gate-rubric.test.mjs",
  "packages/curriculum/test/diagnostic-review-workflow-state.test.mjs",
  "package.json",
]);
const wave5Slice1ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-review-activation-prerequisites-contract.md",
  "docs/wave-5/open-decisions.md",
  "docs/wave-5/scope-and-non-goals.md",
  "docs/wave-5/slice-1-implementation-note.md",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultReviewCoveragePath = path.resolve(
  scriptDir,
  "../diagnostic-review-coverage/grade-7-9-math.review-coverage.v1.json",
);
export const repoRoot = path.resolve(scriptDir, "../../..");

export class DiagnosticReviewCoverageValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiagnosticReviewCoverageValidationError";
  }
}

function fail(message) {
  throw new DiagnosticReviewCoverageValidationError(message);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, fieldPath) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${fieldPath} must be a non-empty string.`);
  }
}

function requireExactFields(value, expectedFields, fieldPath) {
  if (!isPlainObject(value)) {
    fail(`${fieldPath} must be an object.`);
  }

  for (const key of Object.keys(value)) {
    if (!expectedFields.has(key)) {
      fail(`${fieldPath}.${key} is an unexpected field.`);
    }
  }
  for (const field of expectedFields) {
    if (!Object.hasOwn(value, field)) {
      fail(`${fieldPath}.${field} is required.`);
    }
  }
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
        if (normalizedKey.includes(term.toLowerCase())) {
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
      if (normalizedValue.includes(term.toLowerCase())) {
        fail(`${fieldPath} uses forbidden content term ${term}.`);
      }
    }
  }
}

function validateMetadata(metadata, blueprint, fixtures) {
  requireExactFields(metadata, metadataFields, "metadata");

  const expectedValues = new Map([
    ["schemaVersion", "learnika.diagnosticReviewCoverage.v1"],
    ["coverageArtifactVersion", expectedCoverageArtifactVersion],
    ["status", "draft_non_production_review_coverage"],
    ["artifactKind", "diagnostic_review_coverage"],
    ["subject", "math"],
    ["locale", "ru-RU"],
    ["diagnosticBlueprintVersion", expectedBlueprintVersion],
    ["diagnosticItemFixtureSetVersion", expectedFixtureSetVersion],
    ["diagnosticReadinessPolicyVersion", expectedReadinessPolicyVersion],
    ["sourceContract", "docs/wave-4/reviewed-diagnostic-content-contract.md"],
  ]);

  for (const [field, expectedValue] of expectedValues) {
    if (metadata[field] !== expectedValue) {
      fail(`metadata.${field} must be ${expectedValue}.`);
    }
  }

  if (
    !Array.isArray(metadata.audienceGrades) ||
    metadata.audienceGrades.length !== 3 ||
    metadata.audienceGrades.some((grade, index) => grade !== index + 7)
  ) {
    fail("metadata.audienceGrades must be exactly [7, 8, 9].");
  }
  if (
    metadata.productionUseAllowed !== false ||
    metadata.runtimeUseAllowed !== false ||
    metadata.storageAllowed !== false
  ) {
    fail("metadata must keep production, runtime and storage use disabled.");
  }
  if (blueprint.metadata.blueprintVersion !== metadata.diagnosticBlueprintVersion) {
    fail("metadata.diagnosticBlueprintVersion must match the referenced blueprint artifact.");
  }
  if (fixtures.metadata.fixtureSetVersion !== metadata.diagnosticItemFixtureSetVersion) {
    fail("metadata.diagnosticItemFixtureSetVersion must match the referenced fixture set.");
  }
}

function validatePolicyVersionPins(policyVersionPins) {
  requireExactFields(policyVersionPins, new Set(requiredGateNames), "policyVersionPins");

  for (const gateName of requiredGateNames) {
    if (policyVersionPins[gateName] !== expectedPolicyVersionPins.get(gateName)) {
      fail(`policyVersionPins.${gateName} does not match the Slice 1 contract pin.`);
    }
  }
}

function validateReadiness(readiness) {
  requireExactFields(readiness, readinessFields, "readiness");
  if (readiness.status !== "NOT_READY") {
    fail("readiness.status must remain NOT_READY.");
  }
  if (readiness.policyVersion !== expectedReadinessPolicyVersion) {
    fail("readiness.policyVersion must remain pinned to the Wave 3 policy.");
  }
  if (readiness.productionUseAllowed !== false) {
    fail("readiness.productionUseAllowed must be false.");
  }
  if (!Array.isArray(readiness.blockingReasons)) {
    fail("readiness.blockingReasons must be an array.");
  }

  const reasons = new Set(readiness.blockingReasons);
  if (
    reasons.size !== requiredBlockingReasons.size ||
    [...requiredBlockingReasons].some((reason) => !reasons.has(reason))
  ) {
    fail("readiness.blockingReasons must contain the two current Wave 3 blockers.");
  }
}

function validateAggregateShape(aggregate) {
  requireExactFields(aggregate, aggregateFields, "aggregate");
  requireExactFields(aggregate.statusCounts, statusCountFields, "aggregate.statusCounts");
  if (aggregate.blueprintSlotCount !== 11) {
    fail("aggregate.blueprintSlotCount must be 11.");
  }
  if (
    aggregate.statusCounts.DRAFT_ONLY !== 5 ||
    aggregate.statusCounts.GAP_CONFIRMED !== 6 ||
    aggregate.statusCounts.PRODUCTION_APPROVED !== 0
  ) {
    fail("aggregate.statusCounts must remain 5 DRAFT_ONLY, 6 GAP_CONFIRMED and 0 approved.");
  }
}

function validateCandidateDigest(candidateDigest, fieldPath) {
  requireExactFields(candidateDigest, candidateDigestFields, fieldPath);
  if (
    candidateDigest.state !== pendingDigest ||
    candidateDigest.algorithm !== "sha256" ||
    candidateDigest.value !== null
  ) {
    fail(`${fieldPath} must remain an unpopulated immutable-candidate digest placeholder.`);
  }
}

function validateArtifactVersionPins(artifactVersionPins, fieldPath) {
  requireExactFields(artifactVersionPins, artifactVersionPinFields, fieldPath);
  if (
    artifactVersionPins.diagnosticBlueprintVersion !== expectedBlueprintVersion ||
    artifactVersionPins.diagnosticItemFixtureSetVersion !== expectedFixtureSetVersion
  ) {
    fail(`${fieldPath} must pin the current blueprint and fixture set versions.`);
  }
}

function validateReviewGates(reviewGates, policyVersionPins, fieldPath) {
  requireExactFields(reviewGates, new Set(requiredGateNames), fieldPath);

  for (const gateName of requiredGateNames) {
    const gate = reviewGates[gateName];
    const gatePath = `${fieldPath}.${gateName}`;
    requireExactFields(gate, gateFields, gatePath);

    const expectedStatus = gateName === "production_approval" ? "NOT_ELIGIBLE" : "NOT_STARTED";
    if (gate.status !== expectedStatus) {
      fail(`${gatePath}.status must remain ${expectedStatus}.`);
    }
    if (gate.policyVersion !== policyVersionPins[gateName]) {
      fail(`${gatePath}.policyVersion must match its top-level policy pin.`);
    }
    if (gate.candidateDigest !== pendingDigest) {
      fail(`${gatePath}.candidateDigest must remain pending.`);
    }
    if (gate.reviewerRole !== null || gate.evidenceRef !== null || gate.decidedAt !== null) {
      fail(`${gatePath} must not claim review evidence or a reviewer decision.`);
    }
  }
}

function validateSlotFixtureReferences(slot, fixturesById, referencedFixtureIds, fieldPath) {
  if (!Array.isArray(slot.candidateFixtureIds)) {
    fail(`${fieldPath}.candidateFixtureIds must be an array.`);
  }

  if (slot.coverageStatus === "GAP_CONFIRMED") {
    if (slot.candidateFixtureIds.length !== 0) {
      fail(`${fieldPath} is a confirmed gap and cannot reference candidate fixtures.`);
    }
    return;
  }

  if (slot.coverageStatus !== "DRAFT_ONLY") {
    fail(`${fieldPath}.coverageStatus must be DRAFT_ONLY or GAP_CONFIRMED.`);
  }
  if (slot.candidateFixtureIds.length !== 1) {
    fail(`${fieldPath} must reference exactly one existing draft fixture.`);
  }

  const fixtureId = slot.candidateFixtureIds[0];
  requireString(fixtureId, `${fieldPath}.candidateFixtureIds[0]`);
  const fixture = fixturesById.get(fixtureId);
  if (!fixture) {
    fail(`${fieldPath} references unknown fixture ${fixtureId}.`);
  }
  if (fixture.blueprintSlotId !== slot.blueprintSlotId) {
    fail(`${fieldPath} references a fixture assigned to another blueprint slot.`);
  }
  if (fixture.productionUseAllowed !== false) {
    fail(`${fieldPath} can reference only a non-production fixture.`);
  }
  if (referencedFixtureIds.has(fixtureId)) {
    fail(`Fixture ${fixtureId} is referenced more than once.`);
  }
  referencedFixtureIds.add(fixtureId);
}

function validateSlots(artifact, blueprint, fixtures) {
  if (!Array.isArray(artifact.slots)) {
    fail("slots must be an array.");
  }

  const blueprintSlotsById = new Map(blueprint.items.map((slot) => [slot.id, slot]));
  const fixturesById = new Map(fixtures.items.map((fixture) => [fixture.id, fixture]));
  if (blueprintSlotsById.size !== 11 || artifact.slots.length !== blueprintSlotsById.size) {
    fail("slots must represent all 11 blueprint slots exactly once.");
  }

  const seenSlotIds = new Set();
  const referencedFixtureIds = new Set();
  const derivedCounts = { DRAFT_ONLY: 0, GAP_CONFIRMED: 0, PRODUCTION_APPROVED: 0 };

  for (const [index, slot] of artifact.slots.entries()) {
    const fieldPath = `slots[${index}]`;
    requireExactFields(slot, slotFields, fieldPath);
    requireString(slot.blueprintSlotId, `${fieldPath}.blueprintSlotId`);

    if (!blueprintSlotsById.has(slot.blueprintSlotId)) {
      fail(`${fieldPath} references unknown blueprint slot ${slot.blueprintSlotId}.`);
    }
    if (seenSlotIds.has(slot.blueprintSlotId)) {
      fail(`Duplicate blueprint slot ${slot.blueprintSlotId}.`);
    }
    seenSlotIds.add(slot.blueprintSlotId);

    if (!Object.hasOwn(derivedCounts, slot.coverageStatus)) {
      fail(`${fieldPath}.coverageStatus is not permitted in the Slice 2 baseline.`);
    }
    if (slot.coverageStatus === "PRODUCTION_APPROVED") {
      fail(`${fieldPath} cannot claim production approval in Slice 2.`);
    }
    derivedCounts[slot.coverageStatus] += 1;

    validateSlotFixtureReferences(slot, fixturesById, referencedFixtureIds, fieldPath);
    validateCandidateDigest(slot.candidateDigest, `${fieldPath}.candidateDigest`);
    validateArtifactVersionPins(slot.artifactVersionPins, `${fieldPath}.artifactVersionPins`);
    validateReviewGates(slot.reviewGates, artifact.policyVersionPins, `${fieldPath}.reviewGates`);
  }

  for (const blueprintSlotId of blueprintSlotsById.keys()) {
    if (!seenSlotIds.has(blueprintSlotId)) {
      fail(`Missing blueprint slot ${blueprintSlotId}.`);
    }
  }
  for (const fixtureId of fixturesById.keys()) {
    if (!referencedFixtureIds.has(fixtureId)) {
      fail(`Existing draft fixture ${fixtureId} is missing from DRAFT_ONLY coverage.`);
    }
  }

  if (
    derivedCounts.DRAFT_ONLY !== 5 ||
    derivedCounts.GAP_CONFIRMED !== 6 ||
    derivedCounts.PRODUCTION_APPROVED !== 0
  ) {
    fail("Derived coverage must remain 5 DRAFT_ONLY, 6 GAP_CONFIRMED and 0 approved.");
  }
  if (
    artifact.aggregate.blueprintSlotCount !== artifact.slots.length ||
    artifact.aggregate.statusCounts.DRAFT_ONLY !== derivedCounts.DRAFT_ONLY ||
    artifact.aggregate.statusCounts.GAP_CONFIRMED !== derivedCounts.GAP_CONFIRMED ||
    artifact.aggregate.statusCounts.PRODUCTION_APPROVED !== derivedCounts.PRODUCTION_APPROVED
  ) {
    fail("aggregate must match coverage derived from slots.");
  }

  return derivedCounts;
}

export function validateDiagnosticReviewCoverage(artifact, blueprint, fixtures) {
  if (!isPlainObject(artifact)) {
    fail("Review coverage artifact must be a JSON object.");
  }
  if (!isPlainObject(blueprint) || !Array.isArray(blueprint.items)) {
    fail("Referenced diagnostic blueprint is invalid.");
  }
  if (!isPlainObject(fixtures) || !Array.isArray(fixtures.items)) {
    fail("Referenced diagnostic fixture set is invalid.");
  }

  scanForbiddenTerms(artifact);
  requireExactFields(artifact, topLevelFields, "$");
  validateMetadata(artifact.metadata, blueprint, fixtures);
  validatePolicyVersionPins(artifact.policyVersionPins);
  validateReadiness(artifact.readiness);
  validateAggregateShape(artifact.aggregate);
  const counts = validateSlots(artifact, blueprint, fixtures);

  return {
    coverageArtifactVersion: artifact.metadata.coverageArtifactVersion,
    blueprintSlotCount: artifact.slots.length,
    draftOnlyCount: counts.DRAFT_ONLY,
    gapCount: counts.GAP_CONFIRMED,
    productionApprovedCount: counts.PRODUCTION_APPROVED,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticReviewCoverage(artifactPath = defaultReviewCoveragePath) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateReviewCoverageChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }

  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice2ChangedPaths.has(changedPath) &&
      !wave5Slice1ScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 4 Slice 2 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateReviewCoverageWorktreeScope({ cwd = repoRoot } = {}) {
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

  return validateReviewCoverageChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [artifact, blueprint, fixtures] = await Promise.all([
    readDiagnosticReviewCoverage(),
    readDiagnosticBlueprint(),
    readDiagnosticItemFixtures(),
  ]);
  const summary = validateDiagnosticReviewCoverage(artifact, blueprint, fixtures);

  if (checkWorktreeScope) {
    validateReviewCoverageWorktreeScope();
  }

  console.log(
    `[curriculum] Review coverage ${summary.coverageArtifactVersion} validated: ${summary.blueprintSlotCount} slots, ${summary.draftOnlyCount} draft-only, ${summary.gapCount} gaps, ${summary.productionApprovedCount} production-approved; readiness ${summary.readiness}.`,
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
