import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  DiagnosticSessionStateService,
  diagnosticSessionTransitions,
  redactDiagnosticSessionStateDiagnostics,
} from "../dist/diagnostic-session-state/diagnostic-session-state.service.js";
import {
  diagnosticSessionStatePolicyVersion,
  diagnosticSessionStates,
} from "../dist/diagnostic-session-state/diagnostic-session-state.types.js";

const repositoryRoot = path.resolve(process.cwd(), "..", "..");
const lifecycleFixture = JSON.parse(
  fs.readFileSync(
    path.join(
      repositoryRoot,
      "packages",
      "curriculum",
      "diagnostic-session-lifecycle",
      "grade-7-9-math.session-lifecycle.fixtures.v1.json",
    ),
    "utf8",
  ),
);

function createService() {
  return new DiagnosticSessionStateService();
}

function linkedReferencesFromFixture(index) {
  const fixture = lifecycleFixture.sessions[index];
  return {
    blueprintSlotIds: [...fixture.blueprintSlotIds],
    diagnosticItemIds: [...fixture.selectedDiagnosticItemIds],
    evidenceIds: [...fixture.evidenceIds],
    responseIds: [...fixture.responseIds],
  };
}

function assertNoUnsafeOutputFields(value) {
  const serialized = JSON.stringify(value).toLowerCase();
  for (const forbidden of [
    "answer",
    "correct",
    "solution",
    "hint",
    "score",
    "mastery",
    "proficiency",
    "provider",
    "prompt",
    "completion",
    "payload",
    "child",
    "student",
    "learner",
    "email",
  ]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
}

test("state and transition constants match the Slice 6 lifecycle contract exactly", () => {
  assert.deepEqual(
    diagnosticSessionStates,
    lifecycleFixture.lifecycleStates.map((state) => state.id),
  );
  assert.deepEqual(
    diagnosticSessionTransitions,
    lifecycleFixture.stateTransitions.map((transition) => [transition.from, transition.to]),
  );
});

test("all contract transitions are accepted deterministically", () => {
  const service = createService();

  for (const [fromState, toState] of diagnosticSessionTransitions) {
    const first = service.transition({ fromState, toState });
    const second = service.transition({ fromState, toState });

    assert.deepEqual(second, first);
    assert.equal(first.accepted, true);
    assert.equal(first.fromState, fromState);
    assert.equal(first.toState, toState);
    assert.equal(first.metadataOnly, true);
    assert.equal(first.policyVersion, diagnosticSessionStatePolicyVersion);
    assert.equal(first.educationalInterpretation, "NONE");
  }
});

test("every transition outside the contract table is denied safely", () => {
  const service = createService();
  const allowed = new Set(
    diagnosticSessionTransitions.map(([fromState, toState]) => `${fromState}->${toState}`),
  );

  for (const fromState of diagnosticSessionStates) {
    for (const toState of diagnosticSessionStates) {
      if (allowed.has(`${fromState}->${toState}`)) {
        continue;
      }

      const result = service.transition({ fromState, toState });
      assert.equal(result.accepted, false);
      assert.equal(result.metadataOnly, true);
      assert.equal(result.fromState, fromState);
      assert.equal(result.toState, toState);
      assert.match(result.reason, /TERMINAL_STATE|TRANSITION_NOT_ALLOWED/);
      assertNoUnsafeOutputFields(result);
    }
  }
});

test("unknown states return bounded denial metadata without reflecting raw input", () => {
  const service = createService();
  const unsafeState = "final answer for LearnerA parent@example.test";
  const result = service.transition({ fromState: unsafeState, toState: "active" });

  assert.deepEqual(result, {
    accepted: false,
    fromState: "unknown",
    metadataOnly: true,
    policyVersion: diagnosticSessionStatePolicyVersion,
    reason: "FROM_STATE_INVALID",
    toState: "active",
  });
  assert.equal(JSON.stringify(result).includes(unsafeState), false);
  assert.deepEqual(service.transition(null), {
    accepted: false,
    fromState: "unknown",
    metadataOnly: true,
    policyVersion: diagnosticSessionStatePolicyVersion,
    reason: "FROM_STATE_INVALID",
    toState: "unknown",
  });
});

test("closed abandoned and invalidated cannot be reopened", () => {
  const service = createService();

  assert.deepEqual(service.transition({ fromState: "closed", toState: "active" }), {
    accepted: false,
    fromState: "closed",
    metadataOnly: true,
    policyVersion: diagnosticSessionStatePolicyVersion,
    reason: "TRANSITION_NOT_ALLOWED",
    toState: "active",
  });

  for (const fromState of ["abandoned", "invalidated"]) {
    const result = service.transition({ fromState, toState: "ready" });
    assert.equal(result.accepted, false);
    assert.equal(result.reason, "TERMINAL_STATE");
  }

  const contractException = service.transition({
    fromState: "closed",
    toState: "invalidated",
  });
  assert.equal(contractException.accepted, true);
  assert.equal(contractException.referenceDisposition, "EXCLUDED");
});

test("abandonment carries no failure or educational interpretation", () => {
  const service = createService();
  const emptyResult = service.transition({ fromState: "ready", toState: "abandoned" });

  assert.equal(emptyResult.accepted, true);
  assert.equal(emptyResult.isTerminal, true);
  assert.equal(emptyResult.referenceDisposition, "NO_LINKED_REFERENCES");
  assert.equal(emptyResult.educationalInterpretation, "NONE");
  assert.equal(JSON.stringify(emptyResult).toLowerCase().includes("fail"), false);

  const linkedResult = service.transition({
    fromState: "active",
    linkedReferences: linkedReferencesFromFixture(0),
    toState: "abandoned",
  });
  assert.equal(linkedResult.accepted, true);
  assert.equal(linkedResult.referenceDisposition, "STRUCTURAL_ONLY");
});

test("invalidation preserves linked references without mutating input metadata", () => {
  const service = createService();
  const linkedReferences = linkedReferencesFromFixture(2);
  const original = JSON.parse(JSON.stringify(linkedReferences));
  const result = service.transition({
    fromState: "active",
    linkedReferences,
    toState: "invalidated",
  });

  assert.equal(result.accepted, true);
  assert.equal(result.referenceDisposition, "EXCLUDED");
  assert.deepEqual(result.linkedReferences, original);
  assert.deepEqual(linkedReferences, original);
  assert.notEqual(result.linkedReferences, linkedReferences);
  assert.notEqual(result.linkedReferences.responseIds, linkedReferences.responseIds);
});

test("unsafe or duplicate reference metadata is denied without reflection", () => {
  const service = createService();
  const unsafeReference = "parent@example.test final answer";
  const unsafeResult = service.transition({
    fromState: "active",
    linkedReferences: {
      blueprintSlotIds: [],
      diagnosticItemIds: [],
      evidenceIds: [],
      responseIds: [unsafeReference],
    },
    toState: "closed",
  });

  assert.equal(unsafeResult.accepted, false);
  assert.equal(unsafeResult.reason, "REFERENCE_METADATA_INVALID");
  assert.equal(JSON.stringify(unsafeResult).includes(unsafeReference), false);

  const duplicateReferences = linkedReferencesFromFixture(0);
  duplicateReferences.responseIds.push(duplicateReferences.responseIds[0]);
  const duplicateResult = service.transition({
    fromState: "active",
    linkedReferences: duplicateReferences,
    toState: "closed",
  });
  assert.equal(duplicateResult.accepted, false);
  assert.equal(duplicateResult.reason, "REFERENCE_METADATA_INVALID");
});

test("service outputs remain metadata-only without learning or evaluation fields", () => {
  const service = createService();
  const accepted = service.transition({
    fromState: "active",
    linkedReferences: linkedReferencesFromFixture(0),
    toState: "closed",
  });
  const denied = service.transition({ fromState: "paused", toState: "ready" });

  assertNoUnsafeOutputFields(accepted);
  assertNoUnsafeOutputFields(denied);
});

test("diagnostic redaction removes sensitive fields and values", () => {
  const redacted = JSON.stringify(
    redactDiagnosticSessionStateDiagnostics({
      childName: "LearnerA",
      correctAnswer: "x = 2",
      nested: {
        providerPrompt: "synthetic provider text",
        rawContent: "full solution",
      },
      safe: "TRANSITION_NOT_ALLOWED",
      token: "synthetic-token",
      unsafeText: "parent@example.test",
    }),
  );

  for (const unsafeValue of [
    "LearnerA",
    "x = 2",
    "synthetic provider text",
    "full solution",
    "synthetic-token",
    "parent@example.test",
  ]) {
    assert.equal(redacted.includes(unsafeValue), false);
  }
  assert.equal(redacted.includes("TRANSITION_NOT_ALLOWED"), true);
});

test("Slice 7 remains internal without routes persistence network or module wiring", () => {
  const moduleDir = path.join(process.cwd(), "src", "diagnostic-session-state");
  const moduleFiles = fs.readdirSync(moduleDir);
  assert.equal(
    moduleFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModule = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModule.includes("DiagnosticSessionStateModule"), false);

  const openapi = JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  assert.equal(
    Object.keys(openapi.paths ?? {}).some((routePath) => /diagnostic/i.test(routePath)),
    false,
  );

  const schema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  assert.equal(schema.includes("model DiagnosticSession"), false);
  const migrations = fs
    .readdirSync(path.join(process.cwd(), "prisma", "migrations"))
    .filter((fileName) => fileName !== "migration_lock.toml");
  assert.deepEqual(migrations, [
    "20260708173051_initial_data_foundation",
    "20260708181231_auth_session_foundation",
    "20260710082038_homework_media_domain_foundation",
  ]);

  const serviceSource = fs.readFileSync(
    path.join(moduleDir, "diagnostic-session-state.service.ts"),
    "utf8",
  );
  assert.doesNotMatch(
    serviceSource,
    /@prisma|axios|fetch\s*\(|Math\.random|randomUUID|node:http|node:https/,
  );
});
