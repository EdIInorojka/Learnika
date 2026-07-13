import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  readSkillGraph,
  validateChangedPathScope,
  validateSkillGraph,
} from "./validate-skill-graph.mjs";

const itemIdPattern =
  /^diag\.math\.g7-9\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.v[1-9][0-9]*$/;
const requiredStrands = new Set(["number", "algebra", "functions", "geometry", "data"]);
const allowedEvidenceCategories = new Set([
  "concept_recognition",
  "procedure_selection",
  "representation_interpretation",
  "reasoning_justification",
  "multi_step_organization",
]);
const allowedDifficultyBands = new Set(["foundation", "core", "extension"]);
const requiredResultStates = new Set([
  "not_collected",
  "observed",
  "uncertain",
  "not_reached",
  "invalidated",
]);
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
const topLevelFields = new Set([
  "metadata",
  "evidenceCategories",
  "nonScoringResultSemantics",
  "items",
]);
const metadataFields = new Set([
  "schemaVersion",
  "blueprintVersion",
  "status",
  "artifactKind",
  "subject",
  "locale",
  "audienceGrades",
  "canonicalSkillGraphVersion",
  "coverageReviewState",
  "safetyPolicyVersion",
  "sourceContract",
  "openDecisionRefs",
  "notes",
]);
const evidenceCategoryFields = new Set(["id", "description"]);
const resultSemanticsFields = new Set([
  "policyVersion",
  "claimsMastery",
  "claimsProficiency",
  "numericScore",
  "states",
  "policyNote",
]);
const itemFields = new Set([
  "id",
  "status",
  "gradeBand",
  "strand",
  "primarySkillId",
  "supportingSkillIds",
  "evidenceCategory",
  "difficultyBand",
  "coverageStatus",
  "sourcePolicy",
  "safetyNotes",
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultBlueprintPath = path.resolve(
  scriptDir,
  "../diagnostic-blueprints/grade-7-9-math.draft.v1.json",
);

export class DiagnosticBlueprintValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiagnosticBlueprintValidationError";
  }
}

function fail(message) {
  throw new DiagnosticBlueprintValidationError(message);
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
      fail(`${fieldPath}.${key} is an unexpected field for a static blueprint.`);
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

function validateAudienceGrades(audienceGrades) {
  if (!Array.isArray(audienceGrades) || audienceGrades.length === 0) {
    fail("metadata.audienceGrades must be a non-empty array.");
  }

  const uniqueGrades = new Set(audienceGrades);
  if (
    uniqueGrades.size !== audienceGrades.length ||
    audienceGrades.some((grade) => !Number.isInteger(grade) || grade < 7 || grade > 9)
  ) {
    fail("metadata.audienceGrades must contain unique grades within 7-9.");
  }
}

function validateGradeBand(item, primarySkill) {
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
  if (min < primarySkill.gradeBand.min || max > primarySkill.gradeBand.max) {
    fail(`${item.id}.gradeBand must stay within its primary skill grade band.`);
  }
}

function validateEvidenceCategories(blueprint) {
  if (!Array.isArray(blueprint.evidenceCategories) || blueprint.evidenceCategories.length === 0) {
    fail("evidenceCategories must be a non-empty array.");
  }

  const categoryIds = new Set();
  for (const [index, category] of blueprint.evidenceCategories.entries()) {
    if (!isPlainObject(category)) {
      fail(`evidenceCategories[${index}] must be an object.`);
    }
    requireExactFields(category, evidenceCategoryFields, `evidenceCategories[${index}]`);
    requireString(category.id, `evidenceCategories[${index}].id`);
    requireString(category.description, `evidenceCategories[${index}].description`);
    if (!allowedEvidenceCategories.has(category.id)) {
      fail(`Unknown evidence category ${category.id}.`);
    }
    if (categoryIds.has(category.id)) {
      fail(`Duplicate evidence category ${category.id}.`);
    }
    categoryIds.add(category.id);
  }

  for (const categoryId of allowedEvidenceCategories) {
    if (!categoryIds.has(categoryId)) {
      fail(`Missing required evidence category ${categoryId}.`);
    }
  }

  return categoryIds;
}

function validateResultSemantics(semantics) {
  if (!isPlainObject(semantics)) {
    fail("nonScoringResultSemantics must be an object.");
  }
  requireExactFields(semantics, resultSemanticsFields, "nonScoringResultSemantics");
  requireString(semantics.policyVersion, "nonScoringResultSemantics.policyVersion");
  requireString(semantics.policyNote, "nonScoringResultSemantics.policyNote");

  if (
    semantics.claimsMastery !== false ||
    semantics.claimsProficiency !== false ||
    semantics.numericScore !== false
  ) {
    fail("Non-scoring result semantics cannot claim mastery, proficiency or numeric scoring.");
  }
  if (!Array.isArray(semantics.states)) {
    fail("nonScoringResultSemantics.states must be an array.");
  }

  const states = new Set(semantics.states);
  if (states.size !== semantics.states.length) {
    fail("nonScoringResultSemantics.states cannot contain duplicates.");
  }
  for (const requiredState of requiredResultStates) {
    if (!states.has(requiredState)) {
      fail(`Missing non-scoring result state ${requiredState}.`);
    }
  }
  if (states.size !== requiredResultStates.size) {
    fail("nonScoringResultSemantics.states contains an unsupported state.");
  }
}

function validateItemReferences(item, skillsById) {
  const primarySkill = skillsById.get(item.primarySkillId);
  if (!primarySkill) {
    fail(`${item.id} references unknown primary skill ${item.primarySkillId}.`);
  }
  if (item.strand !== primarySkill.strand) {
    fail(`${item.id}.strand must match its primary skill strand.`);
  }

  validateGradeBand(item, primarySkill);

  if (!Array.isArray(item.supportingSkillIds)) {
    fail(`${item.id}.supportingSkillIds must be an array.`);
  }
  const seenSkillIds = new Set([item.primarySkillId]);
  for (const supportingSkillId of item.supportingSkillIds) {
    if (typeof supportingSkillId !== "string") {
      fail(`${item.id}.supportingSkillIds must contain only skill IDs.`);
    }
    if (!skillsById.has(supportingSkillId)) {
      fail(`${item.id} references unknown supporting skill ${supportingSkillId}.`);
    }
    if (seenSkillIds.has(supportingSkillId)) {
      fail(`${item.id} repeats canonical skill reference ${supportingSkillId}.`);
    }
    seenSkillIds.add(supportingSkillId);
  }
}

function validateCoverage(items, audienceGrades, categoryIds) {
  const presentStrands = new Set(items.map((item) => item.strand));
  for (const requiredStrand of requiredStrands) {
    if (!presentStrands.has(requiredStrand)) {
      fail(`Missing diagnostic coverage for canonical strand ${requiredStrand}.`);
    }
  }

  for (const grade of audienceGrades) {
    const gradeIsCovered = items.some(
      (item) => item.gradeBand.min <= grade && item.gradeBand.max >= grade,
    );
    if (!gradeIsCovered) {
      fail(`Missing diagnostic coverage for grade ${grade}.`);
    }
  }

  const usedCategories = new Set(items.map((item) => item.evidenceCategory));
  for (const categoryId of categoryIds) {
    if (!usedCategories.has(categoryId)) {
      fail(`Evidence category ${categoryId} has no diagnostic item slot.`);
    }
  }
}

export function validateDiagnosticBlueprint(blueprint, skillGraph) {
  if (!isPlainObject(blueprint)) {
    fail("Diagnostic blueprint must be a JSON object.");
  }
  if (!isPlainObject(skillGraph)) {
    fail("Canonical skill graph must be a JSON object.");
  }

  scanForbiddenTerms(blueprint);
  requireExactFields(blueprint, topLevelFields, "$");
  validateSkillGraph(skillGraph);

  if (!isPlainObject(blueprint.metadata)) {
    fail("metadata must be an object.");
  }
  requireExactFields(blueprint.metadata, metadataFields, "metadata");
  requireString(blueprint.metadata.schemaVersion, "metadata.schemaVersion");
  requireString(blueprint.metadata.blueprintVersion, "metadata.blueprintVersion");
  requireString(blueprint.metadata.safetyPolicyVersion, "metadata.safetyPolicyVersion");
  requireString(blueprint.metadata.sourceContract, "metadata.sourceContract");

  if (blueprint.metadata.status !== "draft_static_blueprint") {
    fail("metadata.status must be draft_static_blueprint in Slice 3.");
  }
  if (blueprint.metadata.artifactKind !== "diagnostic_blueprint") {
    fail("metadata.artifactKind must be diagnostic_blueprint.");
  }
  if (blueprint.metadata.subject !== "math" || blueprint.metadata.locale !== "ru-RU") {
    fail("metadata must stay within the Russian mathematics MVP context.");
  }
  if (blueprint.metadata.coverageReviewState !== "open_decision") {
    fail("metadata.coverageReviewState must keep provisional coverage as an open decision.");
  }
  if (blueprint.metadata.canonicalSkillGraphVersion !== skillGraph.metadata.graphVersion) {
    fail("metadata.canonicalSkillGraphVersion does not match the canonical skill graph.");
  }
  validateAudienceGrades(blueprint.metadata.audienceGrades);

  if (
    !Array.isArray(blueprint.metadata.openDecisionRefs) ||
    blueprint.metadata.openDecisionRefs.length === 0
  ) {
    fail("metadata.openDecisionRefs must record unresolved coverage decisions.");
  }
  blueprint.metadata.openDecisionRefs.forEach((decisionRef, index) =>
    requireString(decisionRef, `metadata.openDecisionRefs[${index}]`),
  );
  if (!Array.isArray(blueprint.metadata.notes)) {
    fail("metadata.notes must be an array.");
  }
  blueprint.metadata.notes.forEach((note, index) =>
    requireString(note, `metadata.notes[${index}]`),
  );

  const categoryIds = validateEvidenceCategories(blueprint);
  validateResultSemantics(blueprint.nonScoringResultSemantics);

  if (!Array.isArray(blueprint.items) || blueprint.items.length === 0) {
    fail("items must be a non-empty array.");
  }

  const skillsById = new Map(skillGraph.skills.map((skill) => [skill.id, skill]));
  const itemIds = new Set();
  for (const [index, item] of blueprint.items.entries()) {
    if (!isPlainObject(item)) {
      fail(`items[${index}] must be an object.`);
    }
    requireExactFields(item, itemFields, `items[${index}]`);
    requireString(item.id, `items[${index}].id`);
    if (!itemIdPattern.test(item.id)) {
      fail(`${item.id} does not match the diagnostic item ID pattern.`);
    }
    if (itemIds.has(item.id)) {
      fail(`Duplicate diagnostic item ID ${item.id}.`);
    }
    itemIds.add(item.id);

    requireString(item.strand, `${item.id}.strand`);
    requireString(item.primarySkillId, `${item.id}.primarySkillId`);
    if (!requiredStrands.has(item.strand) || item.id.split(".")[3] !== item.strand) {
      fail(`${item.id}.strand must match its item ID namespace.`);
    }
    if (item.status !== "draft_slot") {
      fail(`${item.id}.status must be draft_slot in Slice 3.`);
    }
    if (item.coverageStatus !== "open_decision") {
      fail(`${item.id}.coverageStatus must be open_decision.`);
    }
    if (item.sourcePolicy !== "original_or_rights_cleared") {
      fail(`${item.id}.sourcePolicy must require original or rights-cleared material.`);
    }
    if (!categoryIds.has(item.evidenceCategory)) {
      fail(`${item.id} references unknown evidence category ${item.evidenceCategory}.`);
    }
    if (!allowedDifficultyBands.has(item.difficultyBand)) {
      fail(`${item.id} uses unsupported difficulty band ${item.difficultyBand}.`);
    }
    if (!Array.isArray(item.safetyNotes) || item.safetyNotes.length === 0) {
      fail(`${item.id}.safetyNotes must be a non-empty array.`);
    }
    item.safetyNotes.forEach((note, noteIndex) =>
      requireString(note, `${item.id}.safetyNotes[${noteIndex}]`),
    );

    validateItemReferences(item, skillsById);
  }

  validateCoverage(blueprint.items, blueprint.metadata.audienceGrades, categoryIds);

  return {
    blueprintVersion: blueprint.metadata.blueprintVersion,
    itemCount: blueprint.items.length,
    strands: [...new Set(blueprint.items.map((item) => item.strand))].sort(),
    evidenceCategories: [...categoryIds].sort(),
  };
}

export async function readDiagnosticBlueprint(artifactPath = defaultBlueprintPath) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

export function validateDiagnosticWorktreeScope(options) {
  return validateChangedPathScope(options);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [blueprint, skillGraph] = await Promise.all([readDiagnosticBlueprint(), readSkillGraph()]);
  const summary = validateDiagnosticBlueprint(blueprint, skillGraph);

  if (checkWorktreeScope) {
    validateDiagnosticWorktreeScope();
  }

  console.log(
    `[curriculum] Diagnostic blueprint ${summary.blueprintVersion} validated: ${summary.itemCount} static slots across ${summary.strands.join(", ")}.`,
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
