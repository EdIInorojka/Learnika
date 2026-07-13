import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  readDiagnosticBlueprint,
  validateDiagnosticBlueprint,
  validateDiagnosticWorktreeScope,
} from "./validate-diagnostic-blueprint.mjs";
import { readSkillGraph } from "./validate-skill-graph.mjs";

const itemIdPattern =
  /^ditem\.math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.fixture-[0-9]{2}\.v[1-9][0-9]*$/;
const cyrillicPattern = /\p{Script=Cyrillic}/u;
const requiredStrands = new Set(["number", "algebra", "functions", "geometry", "data"]);
const forbiddenTerms = [
  "workedSolution",
  "promptCompletion",
  "providerPayload",
  "textbookContent",
  "finalAnswer",
  "correctOption",
  "scoringKey",
  "copiedText",
  "solution",
  "answer",
  "hint",
];
const forbiddenRuntimeFieldTerms = [
  "attempt",
  "result",
  "student",
  "learnerResponse",
  "childId",
  "userId",
  "submittedAt",
  "completedAt",
];
const topLevelFields = new Set(["metadata", "items"]);
const metadataFields = new Set([
  "schemaVersion",
  "fixtureSetVersion",
  "status",
  "artifactKind",
  "subject",
  "locale",
  "canonicalSkillGraphVersion",
  "diagnosticBlueprintVersion",
  "productionUseAllowed",
  "sourceContract",
  "openDecisionRefs",
  "notes",
]);
const itemFields = new Set([
  "id",
  "status",
  "gradeBand",
  "strand",
  "blueprintSlotId",
  "primarySkillId",
  "supportingSkillIds",
  "evidenceCategory",
  "stem",
  "contentOrigin",
  "coverageStatus",
  "productionUseAllowed",
  "evaluationPlaceholder",
  "safetyNotes",
]);
const evaluationPlaceholderFields = new Set(["status", "mode", "policyNote"]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultDiagnosticItemsPath = path.resolve(
  scriptDir,
  "../diagnostic-items/grade-7-9-math.fixtures.v1.json",
);

export class DiagnosticItemValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiagnosticItemValidationError";
  }
}

function fail(message) {
  throw new DiagnosticItemValidationError(message);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, fieldPath) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${fieldPath} must be a non-empty string.`);
  }
}

function requireExactFields(value, allowedFields, fieldPath) {
  for (const key of Object.keys(value)) {
    if (!allowedFields.has(key)) {
      fail(`${fieldPath}.${key} is an unexpected field for static diagnostic item fixtures.`);
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

function scanRuntimeAndStudentFields(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanRuntimeAndStudentFields(item, `${fieldPath}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();
    for (const term of forbiddenRuntimeFieldTerms) {
      if (normalizedKey.includes(term.toLowerCase())) {
        fail(`${fieldPath}.${key} uses forbidden runtime or student data field term ${term}.`);
      }
    }
    scanRuntimeAndStudentFields(nestedValue, `${fieldPath}.${key}`);
  }
}

function validateGradeBand(item, slot, primarySkill) {
  if (!isPlainObject(item.gradeBand)) {
    fail(`${item.id}.gradeBand must be an object.`);
  }

  const { min, max } = item.gradeBand;
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    fail(`${item.id}.gradeBand min and max must be integers.`);
  }
  if (min < 7 || max > 9 || min > max) {
    fail(`${item.id}.gradeBand must stay within grades 7-9.`);
  }
  if (
    min < slot.gradeBand.min ||
    max > slot.gradeBand.max ||
    min < primarySkill.gradeBand.min ||
    max > primarySkill.gradeBand.max
  ) {
    fail(`${item.id}.gradeBand must stay within its blueprint slot and primary skill bands.`);
  }
}

function validateEvaluationPlaceholder(item) {
  const placeholder = item.evaluationPlaceholder;
  if (!isPlainObject(placeholder)) {
    fail(`${item.id}.evaluationPlaceholder must be an object.`);
  }
  requireExactFields(placeholder, evaluationPlaceholderFields, `${item.id}.evaluationPlaceholder`);
  requireString(placeholder.policyNote, `${item.id}.evaluationPlaceholder.policyNote`);

  if (placeholder.status !== "deferred" || placeholder.mode !== "none") {
    fail(`${item.id}.evaluationPlaceholder must keep evaluation deferred with mode none.`);
  }
}

function validateReferences(item, skillsById, slotsById) {
  const slot = slotsById.get(item.blueprintSlotId);
  if (!slot) {
    fail(`${item.id} references unknown blueprint slot ${item.blueprintSlotId}.`);
  }

  const primarySkill = skillsById.get(item.primarySkillId);
  if (!primarySkill) {
    fail(`${item.id} references unknown primary skill ${item.primarySkillId}.`);
  }

  if (
    item.strand !== slot.strand ||
    item.strand !== primarySkill.strand ||
    item.id.split(".")[2] !== item.strand
  ) {
    fail(`${item.id}.strand must match its item ID, blueprint slot and primary skill.`);
  }
  if (item.primarySkillId !== slot.primarySkillId) {
    fail(`${item.id}.primarySkillId must match its blueprint slot.`);
  }
  if (item.evidenceCategory !== slot.evidenceCategory) {
    fail(`${item.id}.evidenceCategory must match its blueprint slot.`);
  }

  validateGradeBand(item, slot, primarySkill);

  if (!Array.isArray(item.supportingSkillIds)) {
    fail(`${item.id}.supportingSkillIds must be an array.`);
  }
  const seenSkillIds = new Set([item.primarySkillId]);
  const allowedSupportingSkillIds = new Set(slot.supportingSkillIds);
  for (const supportingSkillId of item.supportingSkillIds) {
    if (typeof supportingSkillId !== "string") {
      fail(`${item.id}.supportingSkillIds must contain only skill IDs.`);
    }
    if (!skillsById.has(supportingSkillId)) {
      fail(`${item.id} references unknown supporting skill ${supportingSkillId}.`);
    }
    if (!allowedSupportingSkillIds.has(supportingSkillId)) {
      fail(`${item.id} references supporting skill outside its blueprint slot.`);
    }
    if (seenSkillIds.has(supportingSkillId)) {
      fail(`${item.id} repeats canonical skill reference ${supportingSkillId}.`);
    }
    seenSkillIds.add(supportingSkillId);
  }
}

export function validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint) {
  if (!isPlainObject(fixtures)) {
    fail("Diagnostic item fixture set must be a JSON object.");
  }
  if (!isPlainObject(skillGraph) || !isPlainObject(blueprint)) {
    fail("Canonical skill graph and diagnostic blueprint must be JSON objects.");
  }

  scanForbiddenTerms(fixtures);
  scanRuntimeAndStudentFields(fixtures);
  requireExactFields(fixtures, topLevelFields, "$");
  validateDiagnosticBlueprint(blueprint, skillGraph);

  if (!isPlainObject(fixtures.metadata)) {
    fail("metadata must be an object.");
  }
  requireExactFields(fixtures.metadata, metadataFields, "metadata");
  requireString(fixtures.metadata.schemaVersion, "metadata.schemaVersion");
  requireString(fixtures.metadata.fixtureSetVersion, "metadata.fixtureSetVersion");
  requireString(fixtures.metadata.sourceContract, "metadata.sourceContract");

  if (fixtures.metadata.status !== "draft_non_production_fixture_set") {
    fail("metadata.status must be draft_non_production_fixture_set.");
  }
  if (fixtures.metadata.artifactKind !== "diagnostic_item_fixture_set") {
    fail("metadata.artifactKind must be diagnostic_item_fixture_set.");
  }
  if (fixtures.metadata.subject !== "math" || fixtures.metadata.locale !== "ru-RU") {
    fail("metadata must stay within the Russian mathematics MVP context.");
  }
  if (fixtures.metadata.productionUseAllowed !== false) {
    fail("metadata.productionUseAllowed must be false.");
  }
  if (fixtures.metadata.canonicalSkillGraphVersion !== skillGraph.metadata.graphVersion) {
    fail("metadata.canonicalSkillGraphVersion does not match the canonical skill graph.");
  }
  if (fixtures.metadata.diagnosticBlueprintVersion !== blueprint.metadata.blueprintVersion) {
    fail("metadata.diagnosticBlueprintVersion does not match the diagnostic blueprint.");
  }

  if (
    !Array.isArray(fixtures.metadata.openDecisionRefs) ||
    fixtures.metadata.openDecisionRefs.length === 0
  ) {
    fail("metadata.openDecisionRefs must record unresolved item decisions.");
  }
  fixtures.metadata.openDecisionRefs.forEach((decisionRef, index) =>
    requireString(decisionRef, `metadata.openDecisionRefs[${index}]`),
  );
  if (!Array.isArray(fixtures.metadata.notes)) {
    fail("metadata.notes must be an array.");
  }
  fixtures.metadata.notes.forEach((note, index) => requireString(note, `metadata.notes[${index}]`));

  if (!Array.isArray(fixtures.items) || fixtures.items.length === 0) {
    fail("items must be a non-empty array.");
  }
  if (fixtures.items.length > 5) {
    fail("Slice 4 fixture set must remain tiny with at most five items.");
  }

  const skillsById = new Map(skillGraph.skills.map((skill) => [skill.id, skill]));
  const slotsById = new Map(blueprint.items.map((slot) => [slot.id, slot]));
  const itemIds = new Set();
  const stems = new Set();

  for (const [index, item] of fixtures.items.entries()) {
    if (!isPlainObject(item)) {
      fail(`items[${index}] must be an object.`);
    }
    requireExactFields(item, itemFields, `items[${index}]`);
    requireString(item.id, `items[${index}].id`);
    if (!itemIdPattern.test(item.id)) {
      fail(`${item.id} does not match the diagnostic item fixture ID pattern.`);
    }
    if (itemIds.has(item.id)) {
      fail(`Duplicate diagnostic item ID ${item.id}.`);
    }
    itemIds.add(item.id);

    requireString(item.strand, `${item.id}.strand`);
    requireString(item.blueprintSlotId, `${item.id}.blueprintSlotId`);
    requireString(item.primarySkillId, `${item.id}.primarySkillId`);
    requireString(item.evidenceCategory, `${item.id}.evidenceCategory`);
    requireString(item.stem, `${item.id}.stem`);

    if (!requiredStrands.has(item.strand)) {
      fail(`${item.id}.strand is outside the canonical strands.`);
    }
    if (item.status !== "draft_non_production_fixture") {
      fail(`${item.id}.status must be draft_non_production_fixture.`);
    }
    if (item.contentOrigin !== "original_minimal_fixture") {
      fail(`${item.id}.contentOrigin must be original_minimal_fixture.`);
    }
    if (item.coverageStatus !== "open_decision") {
      fail(`${item.id}.coverageStatus must be open_decision.`);
    }
    if (item.productionUseAllowed !== false) {
      fail(`${item.id}.productionUseAllowed must be false.`);
    }
    if (item.stem.length > 320 || item.stem !== item.stem.trim()) {
      fail(`${item.id}.stem must remain a trimmed minimal fixture of at most 320 characters.`);
    }
    if (!cyrillicPattern.test(item.stem)) {
      fail(`${item.id}.stem must contain Russian-language Cyrillic text.`);
    }
    if (stems.has(item.stem)) {
      fail(`${item.id}.stem duplicates another fixture stem.`);
    }
    stems.add(item.stem);

    if (!Array.isArray(item.safetyNotes) || item.safetyNotes.length === 0) {
      fail(`${item.id}.safetyNotes must be a non-empty array.`);
    }
    item.safetyNotes.forEach((note, noteIndex) =>
      requireString(note, `${item.id}.safetyNotes[${noteIndex}]`),
    );

    validateEvaluationPlaceholder(item);
    validateReferences(item, skillsById, slotsById);
  }

  return {
    fixtureSetVersion: fixtures.metadata.fixtureSetVersion,
    itemCount: fixtures.items.length,
    strands: [...new Set(fixtures.items.map((item) => item.strand))].sort(),
    blueprintVersion: blueprint.metadata.blueprintVersion,
    graphVersion: skillGraph.metadata.graphVersion,
  };
}

export async function readDiagnosticItemFixtures(artifactPath = defaultDiagnosticItemsPath) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

export function validateDiagnosticItemWorktreeScope(options) {
  return validateDiagnosticWorktreeScope(options);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [fixtures, skillGraph, blueprint] = await Promise.all([
    readDiagnosticItemFixtures(),
    readSkillGraph(),
    readDiagnosticBlueprint(),
  ]);
  const summary = validateDiagnosticItemFixtures(fixtures, skillGraph, blueprint);

  if (checkWorktreeScope) {
    validateDiagnosticItemWorktreeScope();
  }

  console.log(
    `[curriculum] Diagnostic item fixtures ${summary.fixtureSetVersion} validated: ${summary.itemCount} non-production items across ${summary.strands.join(", ")}.`,
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
