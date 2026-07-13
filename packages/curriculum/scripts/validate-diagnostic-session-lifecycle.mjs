import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticBlueprint } from "./validate-diagnostic-blueprint.mjs";
import { readDiagnosticItemFixtures } from "./validate-diagnostic-items.mjs";
import {
  readDiagnosticResponseEvidenceFixtures,
  validateDiagnosticResponseEvidenceFixtures,
  validateDiagnosticResponseEvidenceWorktreeScope,
} from "./validate-diagnostic-response-evidence.mjs";
import { readSkillGraph } from "./validate-skill-graph.mjs";

const sessionIdPattern = /^dsession\.math\.g7-9\.fixture-[0-9]{2}\.v[1-9][0-9]*$/;
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
  "childName",
  "studentName",
  "solution",
  "answer",
  "hint",
  "score",
  "mastery",
  "proficiency",
  "prompt",
  "completion",
  "email",
];
const runtimePersistenceFieldTerms = [
  "attempt",
  "database",
  "persist",
  "createdAt",
  "updatedAt",
  "startedAt",
  "endedAt",
  "submittedAt",
  "recordedAt",
  "timestamp",
  "expiresAt",
  "tenantId",
  "familyId",
  "childId",
  "studentId",
  "learnerId",
  "userId",
  "accountId",
  "storageKey",
  "token",
  "device",
  "ipAddress",
  "duration",
  "eventId",
];
const requiredLifecycleStates = new Map([
  ["drafted", false],
  ["ready", false],
  ["active", false],
  ["paused", false],
  ["closed", false],
  ["abandoned", true],
  ["invalidated", true],
]);
const requiredTransitionKeys = new Set([
  "drafted->ready",
  "drafted->invalidated",
  "ready->active",
  "ready->abandoned",
  "ready->invalidated",
  "active->paused",
  "active->closed",
  "active->abandoned",
  "active->invalidated",
  "paused->active",
  "paused->closed",
  "paused->abandoned",
  "paused->invalidated",
  "closed->invalidated",
]);
const requiredFixtureFinalStates = new Set(["closed", "abandoned", "invalidated"]);
const topLevelFields = new Set(["metadata", "lifecycleStates", "stateTransitions", "sessions"]);
const metadataFields = new Set([
  "schemaVersion",
  "fixtureSetVersion",
  "status",
  "artifactKind",
  "subject",
  "locale",
  "gradeBand",
  "canonicalSkillGraphVersion",
  "diagnosticBlueprintVersion",
  "diagnosticItemFixtureSetVersion",
  "diagnosticResponseEvidenceFixtureSetVersion",
  "syntheticOnly",
  "productionUseAllowed",
  "runtimeUseAllowed",
  "storageAllowed",
  "sourceContract",
  "openDecisionRefs",
  "notes",
]);
const lifecycleStateFields = new Set(["id", "terminal", "policyNote"]);
const transitionFields = new Set(["from", "to", "policyNote"]);
const sessionFields = new Set([
  "id",
  "status",
  "gradeBand",
  "diagnosticBlueprintVersion",
  "blueprintSlotIds",
  "selectedDiagnosticItemIds",
  "responseIds",
  "evidenceIds",
  "lifecycleState",
  "statePath",
  "referenceDisposition",
  "interpretationMode",
  "syntheticOnly",
  "productionUseAllowed",
  "runtimeUseAllowed",
  "storageAllowed",
  "lifecycleNote",
  "safetyNotes",
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultDiagnosticSessionLifecyclePath = path.resolve(
  scriptDir,
  "../diagnostic-session-lifecycle/grade-7-9-math.session-lifecycle.fixtures.v1.json",
);

export class DiagnosticSessionLifecycleValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiagnosticSessionLifecycleValidationError";
  }
}

function fail(message) {
  throw new DiagnosticSessionLifecycleValidationError(message);
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
      fail(`${fieldPath}.${key} is unexpected in static session lifecycle fixtures.`);
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

function scanRuntimePersistenceFields(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanRuntimePersistenceFields(item, `${fieldPath}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();
    for (const term of runtimePersistenceFieldTerms) {
      if (normalizedKey.includes(term.toLowerCase())) {
        fail(`${fieldPath}.${key} uses forbidden runtime or persistence field term ${term}.`);
      }
    }
    scanRuntimePersistenceFields(nestedValue, `${fieldPath}.${key}`);
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

function requireUniqueStringArray(value, fieldPath, { nonEmpty = false } = {}) {
  if (!Array.isArray(value) || (nonEmpty && value.length === 0)) {
    fail(`${fieldPath} must be ${nonEmpty ? "a non-empty" : "an"} array.`);
  }

  const values = new Set();
  for (const [index, item] of value.entries()) {
    requireString(item, `${fieldPath}[${index}]`);
    if (values.has(item)) {
      fail(`${fieldPath} contains duplicate reference ${item}.`);
    }
    values.add(item);
  }
  return values;
}

function setsEqual(left, right) {
  return left.size === right.size && [...left].every((value) => right.has(value));
}

function validateLifecycleStates(states) {
  if (!Array.isArray(states) || states.length !== requiredLifecycleStates.size) {
    fail(`lifecycleStates must contain exactly ${requiredLifecycleStates.size} states.`);
  }

  const stateIds = new Set();
  for (const [index, state] of states.entries()) {
    if (!isPlainObject(state)) {
      fail(`lifecycleStates[${index}] must be an object.`);
    }
    requireExactFields(state, lifecycleStateFields, `lifecycleStates[${index}]`);
    requireString(state.id, `lifecycleStates[${index}].id`);
    requireString(state.policyNote, `lifecycleStates[${index}].policyNote`);

    if (!requiredLifecycleStates.has(state.id)) {
      fail(`Unknown diagnostic session lifecycle state ${state.id}.`);
    }
    if (stateIds.has(state.id)) {
      fail(`Duplicate diagnostic session lifecycle state ${state.id}.`);
    }
    if (state.terminal !== requiredLifecycleStates.get(state.id)) {
      fail(`${state.id}.terminal does not match the Slice 6 lifecycle contract.`);
    }
    stateIds.add(state.id);
  }
  return stateIds;
}

function validateTransitions(transitions, stateIds) {
  if (!Array.isArray(transitions) || transitions.length !== requiredTransitionKeys.size) {
    fail(`stateTransitions must contain exactly ${requiredTransitionKeys.size} transitions.`);
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

    if (!stateIds.has(transition.from) || !stateIds.has(transition.to)) {
      fail(`stateTransitions[${index}] references an unknown lifecycle state.`);
    }
    const transitionKey = `${transition.from}->${transition.to}`;
    if (!requiredTransitionKeys.has(transitionKey)) {
      fail(`Unsupported diagnostic session lifecycle transition ${transitionKey}.`);
    }
    if (transitionKeys.has(transitionKey)) {
      fail(`Duplicate diagnostic session lifecycle transition ${transitionKey}.`);
    }
    transitionKeys.add(transitionKey);
  }

  for (const requiredTransitionKey of requiredTransitionKeys) {
    if (!transitionKeys.has(requiredTransitionKey)) {
      fail(`Missing diagnostic session lifecycle transition ${requiredTransitionKey}.`);
    }
  }
  return transitionKeys;
}

function validateStatePath(session, stateIds, transitionKeys) {
  const statePath = requireUniqueStringArray(session.statePath, `${session.id}.statePath`, {
    nonEmpty: true,
  });
  const orderedStates = session.statePath;

  for (const state of statePath) {
    if (!stateIds.has(state)) {
      fail(`${session.id}.statePath references unknown lifecycle state ${state}.`);
    }
  }
  if (orderedStates[0] !== "drafted") {
    fail(`${session.id}.statePath must start at drafted.`);
  }
  if (orderedStates.at(-1) !== session.lifecycleState) {
    fail(`${session.id}.statePath must end at its lifecycleState.`);
  }

  for (let index = 1; index < orderedStates.length; index += 1) {
    const transitionKey = `${orderedStates[index - 1]}->${orderedStates[index]}`;
    if (!transitionKeys.has(transitionKey)) {
      fail(`${session.id}.statePath uses invalid lifecycle transition ${transitionKey}.`);
    }
  }
}

function expectedReferenceDisposition(session) {
  if (session.lifecycleState === "invalidated") {
    return "excluded";
  }
  if (session.lifecycleState === "abandoned") {
    return session.responseIds.length === 0 && session.evidenceIds.length === 0
      ? "no_linked_records"
      : "structural_only";
  }
  if (session.lifecycleState === "closed") {
    return "structural_only";
  }
  return "pending";
}

function validateFixtureMarkers(record, fieldPath) {
  if (record.status !== "draft_synthetic_non_production_fixture") {
    fail(`${fieldPath}.status must be draft_synthetic_non_production_fixture.`);
  }
  if (
    record.syntheticOnly !== true ||
    record.productionUseAllowed !== false ||
    record.runtimeUseAllowed !== false ||
    record.storageAllowed !== false
  ) {
    fail(`${fieldPath} must remain synthetic, non-production, non-runtime and storage-disabled.`);
  }
  if (record.interpretationMode !== "none") {
    fail(`${fieldPath}.interpretationMode must be none.`);
  }
  requireString(record.lifecycleNote, `${fieldPath}.lifecycleNote`);
  if (record.lifecycleNote.length > 240 || record.lifecycleNote !== record.lifecycleNote.trim()) {
    fail(`${fieldPath}.lifecycleNote must be a trimmed note of at most 240 characters.`);
  }
  if (!Array.isArray(record.safetyNotes) || record.safetyNotes.length === 0) {
    fail(`${fieldPath}.safetyNotes must be a non-empty array.`);
  }
  record.safetyNotes.forEach((note, index) =>
    requireString(note, `${fieldPath}.safetyNotes[${index}]`),
  );
}

export function validateDiagnosticSessionLifecycleFixtures(
  fixtures,
  skillGraph,
  blueprint,
  diagnosticItems,
  responseEvidenceFixtures,
) {
  if (!isPlainObject(fixtures)) {
    fail("Diagnostic session lifecycle fixture set must be a JSON object.");
  }
  if (
    !isPlainObject(skillGraph) ||
    !isPlainObject(blueprint) ||
    !isPlainObject(diagnosticItems) ||
    !isPlainObject(responseEvidenceFixtures)
  ) {
    fail("Upstream curriculum artifacts must be JSON objects.");
  }

  scanForbiddenTerms(fixtures);
  scanRuntimePersistenceFields(fixtures);
  requireExactFields(fixtures, topLevelFields, "$");
  validateDiagnosticResponseEvidenceFixtures(
    responseEvidenceFixtures,
    skillGraph,
    blueprint,
    diagnosticItems,
  );

  if (!isPlainObject(fixtures.metadata)) {
    fail("metadata must be an object.");
  }
  requireExactFields(fixtures.metadata, metadataFields, "metadata");
  requireString(fixtures.metadata.schemaVersion, "metadata.schemaVersion");
  requireString(fixtures.metadata.fixtureSetVersion, "metadata.fixtureSetVersion");
  requireString(fixtures.metadata.sourceContract, "metadata.sourceContract");
  validateGradeBand(fixtures.metadata.gradeBand, "metadata.gradeBand");

  if (fixtures.metadata.status !== "draft_synthetic_non_production_fixture_set") {
    fail("metadata.status must be draft_synthetic_non_production_fixture_set.");
  }
  if (fixtures.metadata.artifactKind !== "diagnostic_session_lifecycle_fixture_set") {
    fail("metadata.artifactKind must be diagnostic_session_lifecycle_fixture_set.");
  }
  if (fixtures.metadata.subject !== "math" || fixtures.metadata.locale !== "ru-RU") {
    fail("metadata must stay within the Russian mathematics MVP context.");
  }
  if (
    fixtures.metadata.syntheticOnly !== true ||
    fixtures.metadata.productionUseAllowed !== false ||
    fixtures.metadata.runtimeUseAllowed !== false ||
    fixtures.metadata.storageAllowed !== false
  ) {
    fail(
      "metadata must require synthetic, non-production, non-runtime, storage-disabled fixtures.",
    );
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
    fixtures.metadata.diagnosticResponseEvidenceFixtureSetVersion !==
    responseEvidenceFixtures.metadata.fixtureSetVersion
  ) {
    fail(
      "metadata.diagnosticResponseEvidenceFixtureSetVersion does not match response/evidence fixtures.",
    );
  }

  if (
    !Array.isArray(fixtures.metadata.openDecisionRefs) ||
    fixtures.metadata.openDecisionRefs.length === 0
  ) {
    fail("metadata.openDecisionRefs must record unresolved lifecycle decisions.");
  }
  fixtures.metadata.openDecisionRefs.forEach((decisionRef, index) =>
    requireString(decisionRef, `metadata.openDecisionRefs[${index}]`),
  );
  if (!Array.isArray(fixtures.metadata.notes)) {
    fail("metadata.notes must be an array.");
  }
  fixtures.metadata.notes.forEach((note, index) => requireString(note, `metadata.notes[${index}]`));

  const stateIds = validateLifecycleStates(fixtures.lifecycleStates);
  const transitionKeys = validateTransitions(fixtures.stateTransitions, stateIds);

  if (!Array.isArray(fixtures.sessions) || fixtures.sessions.length === 0) {
    fail("sessions must be a non-empty array.");
  }
  if (fixtures.sessions.length > 3) {
    fail("Slice 6 session lifecycle fixture set must remain tiny with at most three records.");
  }

  const slotsById = new Map(blueprint.items.map((slot) => [slot.id, slot]));
  const itemsById = new Map(diagnosticItems.items.map((item) => [item.id, item]));
  const responsesById = new Map(
    responseEvidenceFixtures.responses.map((response) => [response.id, response]),
  );
  const evidenceById = new Map(
    responseEvidenceFixtures.evidenceRecords.map((evidence) => [evidence.id, evidence]),
  );
  const evidenceByResponseId = new Map(
    responseEvidenceFixtures.evidenceRecords.map((evidence) => [evidence.responseId, evidence]),
  );
  const sessionIds = new Set();
  const assignedResponseIds = new Set();
  const assignedEvidenceIds = new Set();
  const fixtureFinalStates = new Set();

  for (const [index, session] of fixtures.sessions.entries()) {
    if (!isPlainObject(session)) {
      fail(`sessions[${index}] must be an object.`);
    }
    requireExactFields(session, sessionFields, `sessions[${index}]`);
    requireString(session.id, `sessions[${index}].id`);
    if (!sessionIdPattern.test(session.id)) {
      fail(`${session.id} does not match the diagnostic session fixture ID pattern.`);
    }
    if (sessionIds.has(session.id)) {
      fail(`Duplicate diagnostic session ID ${session.id}.`);
    }
    sessionIds.add(session.id);

    requireString(session.diagnosticBlueprintVersion, `${session.id}.diagnosticBlueprintVersion`);
    requireString(session.lifecycleState, `${session.id}.lifecycleState`);
    requireString(session.referenceDisposition, `${session.id}.referenceDisposition`);
    if (!stateIds.has(session.lifecycleState)) {
      fail(`${session.id} uses invalid lifecycle state ${session.lifecycleState}.`);
    }
    fixtureFinalStates.add(session.lifecycleState);
    if (session.diagnosticBlueprintVersion !== blueprint.metadata.blueprintVersion) {
      fail(`${session.id}.diagnosticBlueprintVersion does not match the blueprint.`);
    }

    validateFixtureMarkers(session, session.id);
    validateStatePath(session, stateIds, transitionKeys);

    const slotIds = requireUniqueStringArray(
      session.blueprintSlotIds,
      `${session.id}.blueprintSlotIds`,
      { nonEmpty: true },
    );
    const itemIds = requireUniqueStringArray(
      session.selectedDiagnosticItemIds,
      `${session.id}.selectedDiagnosticItemIds`,
      { nonEmpty: true },
    );
    const responseIds = requireUniqueStringArray(session.responseIds, `${session.id}.responseIds`);
    const evidenceIds = requireUniqueStringArray(session.evidenceIds, `${session.id}.evidenceIds`);

    for (const slotId of slotIds) {
      if (!slotsById.has(slotId)) {
        fail(`${session.id} references unknown blueprint slot ${slotId}.`);
      }
    }

    const expectedSlotIds = new Set();
    const referenceBands = [fixtures.metadata.gradeBand];
    for (const itemId of itemIds) {
      const item = itemsById.get(itemId);
      if (!item) {
        fail(`${session.id} references unknown diagnostic item ${itemId}.`);
      }
      expectedSlotIds.add(item.blueprintSlotId);
      referenceBands.push(item.gradeBand);
    }
    if (!setsEqual(slotIds, expectedSlotIds)) {
      fail(`${session.id}.blueprintSlotIds must equal the slots implied by selected items.`);
    }
    validateGradeBand(session.gradeBand, `${session.id}.gradeBand`, ...referenceBands);

    for (const evidenceId of evidenceIds) {
      if (!evidenceById.has(evidenceId)) {
        fail(`${session.id} references unknown evidence ${evidenceId}.`);
      }
    }

    for (const responseId of responseIds) {
      const response = responsesById.get(responseId);
      if (!response) {
        fail(`${session.id} references unknown response ${responseId}.`);
      }
      if (!itemIds.has(response.diagnosticItemId) || !slotIds.has(response.blueprintSlotId)) {
        fail(
          `${session.id} response ${responseId} must align with selected item and slot references.`,
        );
      }
      if (assignedResponseIds.has(responseId)) {
        fail(`${responseId} is assigned to more than one session fixture.`);
      }
      assignedResponseIds.add(responseId);

      const pairedEvidence = evidenceByResponseId.get(responseId);
      if (!pairedEvidence || !evidenceIds.has(pairedEvidence.id)) {
        fail(`${session.id} must include the paired evidence for response ${responseId}.`);
      }
    }

    for (const evidenceId of evidenceIds) {
      const evidence = evidenceById.get(evidenceId);
      if (
        !responseIds.has(evidence.responseId) ||
        !itemIds.has(evidence.diagnosticItemId) ||
        !slotIds.has(evidence.blueprintSlotId)
      ) {
        fail(`${session.id} evidence ${evidenceId} must align with its response, item and slot.`);
      }
      if (assignedEvidenceIds.has(evidenceId)) {
        fail(`${evidenceId} is assigned to more than one session fixture.`);
      }
      assignedEvidenceIds.add(evidenceId);
    }

    const expectedDisposition = expectedReferenceDisposition(session);
    if (session.referenceDisposition !== expectedDisposition) {
      fail(
        `${session.id}.referenceDisposition must be ${expectedDisposition} for its lifecycle state and references.`,
      );
    }
  }

  for (const requiredFinalState of requiredFixtureFinalStates) {
    if (!fixtureFinalStates.has(requiredFinalState)) {
      fail(`Slice 6 fixtures must include a ${requiredFinalState} lifecycle example.`);
    }
  }

  return {
    fixtureSetVersion: fixtures.metadata.fixtureSetVersion,
    sessionCount: fixtures.sessions.length,
    lifecycleStateCount: fixtures.lifecycleStates.length,
    transitionCount: fixtures.stateTransitions.length,
    fixtureFinalStates: [...fixtureFinalStates].sort(),
  };
}

export async function readDiagnosticSessionLifecycleFixtures(
  artifactPath = defaultDiagnosticSessionLifecyclePath,
) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

export function validateDiagnosticSessionLifecycleWorktreeScope(options) {
  return validateDiagnosticResponseEvidenceWorktreeScope(options);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [fixtures, skillGraph, blueprint, diagnosticItems, responseEvidenceFixtures] =
    await Promise.all([
      readDiagnosticSessionLifecycleFixtures(),
      readSkillGraph(),
      readDiagnosticBlueprint(),
      readDiagnosticItemFixtures(),
      readDiagnosticResponseEvidenceFixtures(),
    ]);
  const summary = validateDiagnosticSessionLifecycleFixtures(
    fixtures,
    skillGraph,
    blueprint,
    diagnosticItems,
    responseEvidenceFixtures,
  );

  if (checkWorktreeScope) {
    validateDiagnosticSessionLifecycleWorktreeScope();
  }

  console.log(
    `[curriculum] Diagnostic session lifecycle fixtures ${summary.fixtureSetVersion} validated: ${summary.sessionCount} sessions, ${summary.lifecycleStateCount} states and ${summary.transitionCount} static transitions.`,
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
