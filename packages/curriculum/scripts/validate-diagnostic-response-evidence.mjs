import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticBlueprint } from "./validate-diagnostic-blueprint.mjs";
import {
  readDiagnosticItemFixtures,
  validateDiagnosticItemFixtures,
  validateDiagnosticItemWorktreeScope,
} from "./validate-diagnostic-items.mjs";
import { readSkillGraph } from "./validate-skill-graph.mjs";

const responseIdPattern =
  /^dresponse\.math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.fixture-[0-9]{2}\.v[1-9][0-9]*$/;
const evidenceIdPattern =
  /^devidence\.math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.fixture-[0-9]{2}\.v[1-9][0-9]*$/;
const cyrillicPattern = /\p{Script=Cyrillic}/u;
const requiredStrands = new Set(["number", "algebra", "functions", "geometry", "data"]);
const forbiddenTerms = [
  "workedSolution",
  "correctAnswer",
  "finalAnswer",
  "correctOption",
  "scoringKey",
  "isCorrect",
  "providerPayload",
  "textbookContent",
  "copiedText",
  "solution",
  "answer",
  "hint",
  "score",
  "mastery",
  "proficiency",
  "prompt",
  "completion",
];
const forbiddenRuntimeFieldTerms = [
  "attempt",
  "session",
  "result",
  "student",
  "learnerId",
  "childId",
  "userId",
  "familyId",
  "email",
  "phone",
  "name",
  "timestamp",
  "submittedAt",
  "completedAt",
];
const requiredTransitionKeys = new Set([
  "not_collected->observed",
  "not_collected->uncertain",
  "not_collected->not_reached",
  "observed->uncertain",
  "observed->invalidated",
  "uncertain->observed",
  "uncertain->invalidated",
]);
const topLevelFields = new Set(["metadata", "stateTransitions", "responses", "evidenceRecords"]);
const metadataFields = new Set([
  "schemaVersion",
  "fixtureSetVersion",
  "status",
  "artifactKind",
  "subject",
  "locale",
  "canonicalSkillGraphVersion",
  "diagnosticBlueprintVersion",
  "diagnosticItemFixtureSetVersion",
  "syntheticOnly",
  "productionUseAllowed",
  "sourceContract",
  "openDecisionRefs",
  "notes",
]);
const transitionFields = new Set(["from", "to", "policyNote"]);
const responseFields = new Set([
  "id",
  "status",
  "gradeBand",
  "strand",
  "diagnosticItemId",
  "blueprintSlotId",
  "primarySkillId",
  "evidenceCategory",
  "observationState",
  "contentMode",
  "content",
  "syntheticOnly",
  "productionUseAllowed",
  "evaluationMode",
  "safetyNotes",
]);
const evidenceFields = new Set([
  "id",
  "status",
  "responseId",
  "gradeBand",
  "strand",
  "diagnosticItemId",
  "blueprintSlotId",
  "canonicalSkillId",
  "evidenceCategory",
  "observationState",
  "syntheticOnly",
  "productionUseAllowed",
  "aggregationMode",
  "safetyNotes",
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultResponseEvidencePath = path.resolve(
  scriptDir,
  "../diagnostic-response-evidence/grade-7-9-math.response-evidence.fixtures.v1.json",
);

export class DiagnosticResponseEvidenceValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiagnosticResponseEvidenceValidationError";
  }
}

function fail(message) {
  throw new DiagnosticResponseEvidenceValidationError(message);
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
      fail(`${fieldPath}.${key} is unexpected in static response/evidence fixtures.`);
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

function scanRuntimeAndPiiFields(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanRuntimeAndPiiFields(item, `${fieldPath}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();
    for (const term of forbiddenRuntimeFieldTerms) {
      if (normalizedKey.includes(term.toLowerCase())) {
        fail(`${fieldPath}.${key} uses forbidden runtime or PII field term ${term}.`);
      }
    }
    scanRuntimeAndPiiFields(nestedValue, `${fieldPath}.${key}`);
  }
}

function validateGradeBand(gradeBand, fieldPath, ...referenceBands) {
  if (!isPlainObject(gradeBand)) {
    fail(`${fieldPath} must be an object.`);
  }

  const { min, max } = gradeBand;
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    fail(`${fieldPath} min and max must be integers.`);
  }
  if (min < 7 || max > 9 || min > max) {
    fail(`${fieldPath} must stay within grades 7-9.`);
  }
  for (const referenceBand of referenceBands) {
    if (min < referenceBand.min || max > referenceBand.max) {
      fail(`${fieldPath} must stay within every referenced contract band.`);
    }
  }
}

function validateFixtureMarkers(record, fieldPath) {
  if (record.status !== "draft_synthetic_non_production_fixture") {
    fail(`${fieldPath}.status must be draft_synthetic_non_production_fixture.`);
  }
  if (record.syntheticOnly !== true) {
    fail(`${fieldPath}.syntheticOnly must be true.`);
  }
  if (record.productionUseAllowed !== false) {
    fail(`${fieldPath}.productionUseAllowed must be false.`);
  }
  if (!Array.isArray(record.safetyNotes) || record.safetyNotes.length === 0) {
    fail(`${fieldPath}.safetyNotes must be a non-empty array.`);
  }
  record.safetyNotes.forEach((note, index) =>
    requireString(note, `${fieldPath}.safetyNotes[${index}]`),
  );
}

function validateIdAlignment(recordId, itemId, fieldPath) {
  const recordParts = recordId.split(".");
  const itemParts = itemId.split(".");
  if (
    recordParts[2] !== itemParts[2] ||
    recordParts[3] !== itemParts[3] ||
    recordParts[4] !== itemParts[4] ||
    recordParts[5] !== itemParts[5]
  ) {
    fail(`${fieldPath} must align with its diagnostic item namespace and version.`);
  }
}

function validateTransitions(transitions, allowedStates) {
  if (!Array.isArray(transitions) || transitions.length === 0) {
    fail("stateTransitions must be a non-empty array.");
  }

  const transitionKeys = new Set();
  for (const [index, transition] of transitions.entries()) {
    if (!isPlainObject(transition)) {
      fail(`stateTransitions[${index}] must be an object.`);
    }
    requireExactFields(transition, transitionFields, `stateTransitions[${index}]`);
    requireString(transition.from, `stateTransitions[${index}].from`);
    requireString(transition.to, `stateTransitions[${index}].to`);
    requireString(transition.policyNote, `stateTransitions[${index}].policyNote`);
    if (!allowedStates.has(transition.from) || !allowedStates.has(transition.to)) {
      fail(`stateTransitions[${index}] references an unknown observation state.`);
    }

    const transitionKey = `${transition.from}->${transition.to}`;
    if (!requiredTransitionKeys.has(transitionKey)) {
      fail(`Unsupported non-scoring state transition ${transitionKey}.`);
    }
    if (transitionKeys.has(transitionKey)) {
      fail(`Duplicate non-scoring state transition ${transitionKey}.`);
    }
    transitionKeys.add(transitionKey);
  }

  for (const requiredTransitionKey of requiredTransitionKeys) {
    if (!transitionKeys.has(requiredTransitionKey)) {
      fail(`Missing non-scoring state transition ${requiredTransitionKey}.`);
    }
  }
}

function validateResponseReferences(response, itemsById, slotsById, skillsById) {
  const item = itemsById.get(response.diagnosticItemId);
  if (!item) {
    fail(`${response.id} references unknown diagnostic item ${response.diagnosticItemId}.`);
  }
  const slot = slotsById.get(response.blueprintSlotId);
  if (!slot) {
    fail(`${response.id} references unknown blueprint slot ${response.blueprintSlotId}.`);
  }
  const skill = skillsById.get(response.primarySkillId);
  if (!skill) {
    fail(`${response.id} references unknown primary skill ${response.primarySkillId}.`);
  }

  if (
    response.blueprintSlotId !== item.blueprintSlotId ||
    response.primarySkillId !== item.primarySkillId ||
    response.evidenceCategory !== item.evidenceCategory
  ) {
    fail(`${response.id} references must match its diagnostic item.`);
  }
  if (
    response.strand !== item.strand ||
    response.strand !== slot.strand ||
    response.strand !== skill.strand ||
    response.id.split(".")[2] !== response.strand
  ) {
    fail(`${response.id}.strand must match its item, slot, skill and ID namespace.`);
  }

  validateIdAlignment(response.id, item.id, `${response.id}.id`);
  validateGradeBand(
    response.gradeBand,
    `${response.id}.gradeBand`,
    item.gradeBand,
    slot.gradeBand,
    skill.gradeBand,
  );
}

function validateEvidenceReferences(evidence, response, itemsById, slotsById, skillsById) {
  const item = itemsById.get(evidence.diagnosticItemId);
  if (!item) {
    fail(`${evidence.id} references unknown diagnostic item ${evidence.diagnosticItemId}.`);
  }
  const slot = slotsById.get(evidence.blueprintSlotId);
  if (!slot) {
    fail(`${evidence.id} references unknown blueprint slot ${evidence.blueprintSlotId}.`);
  }
  const skill = skillsById.get(evidence.canonicalSkillId);
  if (!skill) {
    fail(`${evidence.id} references unknown canonical skill ${evidence.canonicalSkillId}.`);
  }

  if (
    evidence.diagnosticItemId !== response.diagnosticItemId ||
    evidence.blueprintSlotId !== response.blueprintSlotId ||
    evidence.canonicalSkillId !== response.primarySkillId ||
    evidence.evidenceCategory !== response.evidenceCategory ||
    evidence.observationState !== response.observationState
  ) {
    fail(`${evidence.id} references and state must match its response.`);
  }
  if (
    evidence.strand !== response.strand ||
    evidence.strand !== item.strand ||
    evidence.strand !== slot.strand ||
    evidence.strand !== skill.strand ||
    evidence.id.split(".")[2] !== evidence.strand
  ) {
    fail(`${evidence.id}.strand must match its response and upstream references.`);
  }

  validateIdAlignment(evidence.id, item.id, `${evidence.id}.id`);
  validateGradeBand(
    evidence.gradeBand,
    `${evidence.id}.gradeBand`,
    item.gradeBand,
    slot.gradeBand,
    skill.gradeBand,
  );
  if (
    evidence.gradeBand.min !== response.gradeBand.min ||
    evidence.gradeBand.max !== response.gradeBand.max
  ) {
    fail(`${evidence.id}.gradeBand must equal its response grade band.`);
  }
}

export function validateDiagnosticResponseEvidenceFixtures(
  fixtures,
  skillGraph,
  blueprint,
  diagnosticItems,
) {
  if (!isPlainObject(fixtures)) {
    fail("Diagnostic response/evidence fixture set must be a JSON object.");
  }
  if (!isPlainObject(skillGraph) || !isPlainObject(blueprint) || !isPlainObject(diagnosticItems)) {
    fail("Upstream curriculum artifacts must be JSON objects.");
  }

  scanForbiddenTerms(fixtures);
  scanRuntimeAndPiiFields(fixtures);
  requireExactFields(fixtures, topLevelFields, "$");
  validateDiagnosticItemFixtures(diagnosticItems, skillGraph, blueprint);

  if (!isPlainObject(fixtures.metadata)) {
    fail("metadata must be an object.");
  }
  requireExactFields(fixtures.metadata, metadataFields, "metadata");
  requireString(fixtures.metadata.schemaVersion, "metadata.schemaVersion");
  requireString(fixtures.metadata.fixtureSetVersion, "metadata.fixtureSetVersion");
  requireString(fixtures.metadata.sourceContract, "metadata.sourceContract");

  if (fixtures.metadata.status !== "draft_synthetic_non_production_fixture_set") {
    fail("metadata.status must be draft_synthetic_non_production_fixture_set.");
  }
  if (fixtures.metadata.artifactKind !== "diagnostic_response_evidence_fixture_set") {
    fail("metadata.artifactKind must be diagnostic_response_evidence_fixture_set.");
  }
  if (fixtures.metadata.subject !== "math" || fixtures.metadata.locale !== "ru-RU") {
    fail("metadata must stay within the Russian mathematics MVP context.");
  }
  if (
    fixtures.metadata.syntheticOnly !== true ||
    fixtures.metadata.productionUseAllowed !== false
  ) {
    fail("metadata must require synthetic-only non-production fixtures.");
  }
  if (fixtures.metadata.canonicalSkillGraphVersion !== skillGraph.metadata.graphVersion) {
    fail("metadata.canonicalSkillGraphVersion does not match the canonical skill graph.");
  }
  if (fixtures.metadata.diagnosticBlueprintVersion !== blueprint.metadata.blueprintVersion) {
    fail("metadata.diagnosticBlueprintVersion does not match the diagnostic blueprint.");
  }
  if (
    fixtures.metadata.diagnosticItemFixtureSetVersion !== diagnosticItems.metadata.fixtureSetVersion
  ) {
    fail("metadata.diagnosticItemFixtureSetVersion does not match diagnostic items.");
  }

  if (
    !Array.isArray(fixtures.metadata.openDecisionRefs) ||
    fixtures.metadata.openDecisionRefs.length === 0
  ) {
    fail("metadata.openDecisionRefs must record unresolved response/evidence decisions.");
  }
  fixtures.metadata.openDecisionRefs.forEach((decisionRef, index) =>
    requireString(decisionRef, `metadata.openDecisionRefs[${index}]`),
  );
  if (!Array.isArray(fixtures.metadata.notes)) {
    fail("metadata.notes must be an array.");
  }
  fixtures.metadata.notes.forEach((note, index) => requireString(note, `metadata.notes[${index}]`));

  const allowedStates = new Set(blueprint.nonScoringResultSemantics.states);
  validateTransitions(fixtures.stateTransitions, allowedStates);

  if (!Array.isArray(fixtures.responses) || fixtures.responses.length === 0) {
    fail("responses must be a non-empty array.");
  }
  if (fixtures.responses.length > 3) {
    fail("Slice 5 response fixture set must remain tiny with at most three records.");
  }

  const itemsById = new Map(diagnosticItems.items.map((item) => [item.id, item]));
  const slotsById = new Map(blueprint.items.map((slot) => [slot.id, slot]));
  const skillsById = new Map(skillGraph.skills.map((skill) => [skill.id, skill]));
  const responsesById = new Map();

  for (const [index, response] of fixtures.responses.entries()) {
    if (!isPlainObject(response)) {
      fail(`responses[${index}] must be an object.`);
    }
    requireExactFields(response, responseFields, `responses[${index}]`);
    requireString(response.id, `responses[${index}].id`);
    if (!responseIdPattern.test(response.id)) {
      fail(`${response.id} does not match the diagnostic response fixture ID pattern.`);
    }
    if (responsesById.has(response.id)) {
      fail(`Duplicate diagnostic response ID ${response.id}.`);
    }

    requireString(response.strand, `${response.id}.strand`);
    requireString(response.diagnosticItemId, `${response.id}.diagnosticItemId`);
    requireString(response.blueprintSlotId, `${response.id}.blueprintSlotId`);
    requireString(response.primarySkillId, `${response.id}.primarySkillId`);
    requireString(response.evidenceCategory, `${response.id}.evidenceCategory`);
    requireString(response.observationState, `${response.id}.observationState`);
    requireString(response.content, `${response.id}.content`);

    if (!requiredStrands.has(response.strand)) {
      fail(`${response.id}.strand is outside the canonical strands.`);
    }
    if (!allowedStates.has(response.observationState)) {
      fail(`${response.id}.observationState is unknown.`);
    }
    if (response.contentMode !== "placeholder_only") {
      fail(`${response.id}.contentMode must be placeholder_only.`);
    }
    if (response.evaluationMode !== "none") {
      fail(`${response.id}.evaluationMode must be none.`);
    }
    if (response.content.length > 160 || response.content !== response.content.trim()) {
      fail(`${response.id}.content must be a trimmed placeholder of at most 160 characters.`);
    }
    if (!cyrillicPattern.test(response.content)) {
      fail(`${response.id}.content must contain Russian-language Cyrillic text.`);
    }

    validateFixtureMarkers(response, response.id);
    validateResponseReferences(response, itemsById, slotsById, skillsById);
    responsesById.set(response.id, response);
  }

  if (!Array.isArray(fixtures.evidenceRecords) || fixtures.evidenceRecords.length === 0) {
    fail("evidenceRecords must be a non-empty array.");
  }
  if (fixtures.evidenceRecords.length > 3) {
    fail("Slice 5 evidence fixture set must remain tiny with at most three records.");
  }

  const evidenceIds = new Set();
  const evidenceResponseIds = new Set();
  for (const [index, evidence] of fixtures.evidenceRecords.entries()) {
    if (!isPlainObject(evidence)) {
      fail(`evidenceRecords[${index}] must be an object.`);
    }
    requireExactFields(evidence, evidenceFields, `evidenceRecords[${index}]`);
    requireString(evidence.id, `evidenceRecords[${index}].id`);
    if (!evidenceIdPattern.test(evidence.id)) {
      fail(`${evidence.id} does not match the diagnostic evidence fixture ID pattern.`);
    }
    if (evidenceIds.has(evidence.id)) {
      fail(`Duplicate diagnostic evidence ID ${evidence.id}.`);
    }
    evidenceIds.add(evidence.id);

    requireString(evidence.responseId, `${evidence.id}.responseId`);
    const response = responsesById.get(evidence.responseId);
    if (!response) {
      fail(`${evidence.id} references unknown response ${evidence.responseId}.`);
    }
    if (evidenceResponseIds.has(evidence.responseId)) {
      fail(`${evidence.responseId} has more than one evidence fixture.`);
    }
    evidenceResponseIds.add(evidence.responseId);

    requireString(evidence.strand, `${evidence.id}.strand`);
    requireString(evidence.diagnosticItemId, `${evidence.id}.diagnosticItemId`);
    requireString(evidence.blueprintSlotId, `${evidence.id}.blueprintSlotId`);
    requireString(evidence.canonicalSkillId, `${evidence.id}.canonicalSkillId`);
    requireString(evidence.evidenceCategory, `${evidence.id}.evidenceCategory`);
    requireString(evidence.observationState, `${evidence.id}.observationState`);

    if (!allowedStates.has(evidence.observationState)) {
      fail(`${evidence.id}.observationState is unknown.`);
    }
    if (evidence.aggregationMode !== "none") {
      fail(`${evidence.id}.aggregationMode must be none.`);
    }

    validateFixtureMarkers(evidence, evidence.id);
    validateEvidenceReferences(evidence, response, itemsById, slotsById, skillsById);
  }

  for (const responseId of responsesById.keys()) {
    if (!evidenceResponseIds.has(responseId)) {
      fail(`${responseId} is missing its evidence fixture.`);
    }
  }

  return {
    fixtureSetVersion: fixtures.metadata.fixtureSetVersion,
    responseCount: fixtures.responses.length,
    evidenceCount: fixtures.evidenceRecords.length,
    transitionCount: fixtures.stateTransitions.length,
    strands: [...new Set(fixtures.responses.map((response) => response.strand))].sort(),
  };
}

export async function readDiagnosticResponseEvidenceFixtures(
  artifactPath = defaultResponseEvidencePath,
) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

export function validateDiagnosticResponseEvidenceWorktreeScope(options) {
  return validateDiagnosticItemWorktreeScope(options);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [fixtures, skillGraph, blueprint, diagnosticItems] = await Promise.all([
    readDiagnosticResponseEvidenceFixtures(),
    readSkillGraph(),
    readDiagnosticBlueprint(),
    readDiagnosticItemFixtures(),
  ]);
  const summary = validateDiagnosticResponseEvidenceFixtures(
    fixtures,
    skillGraph,
    blueprint,
    diagnosticItems,
  );

  if (checkWorktreeScope) {
    validateDiagnosticResponseEvidenceWorktreeScope();
  }

  console.log(
    `[curriculum] Diagnostic response/evidence fixtures ${summary.fixtureSetVersion} validated: ${summary.responseCount} responses, ${summary.evidenceCount} evidence records and ${summary.transitionCount} static transitions.`,
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
