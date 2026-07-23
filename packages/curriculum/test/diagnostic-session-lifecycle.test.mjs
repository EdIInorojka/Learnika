import assert from "node:assert/strict";
import test from "node:test";

import { readDiagnosticBlueprint } from "../scripts/validate-diagnostic-blueprint.mjs";
import { readDiagnosticItemFixtures } from "../scripts/validate-diagnostic-items.mjs";
import { readDiagnosticResponseEvidenceFixtures } from "../scripts/validate-diagnostic-response-evidence.mjs";
import {
  readDiagnosticSessionLifecycleFixtures,
  validateDiagnosticSessionLifecycleFixtures,
  validateDiagnosticSessionLifecycleWorktreeScope,
} from "../scripts/validate-diagnostic-session-lifecycle.mjs";
import { readSkillGraph } from "../scripts/validate-skill-graph.mjs";

const wave5DocumentationPathsThroughSlice10 = new Set([
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
]);

const forbiddenFields = [
  "answer",
  "finalAnswer",
  "correctAnswer",
  "solution",
  "workedSolution",
  "hint",
  "correctOption",
  "scoringKey",
  "isCorrect",
  "score",
  "mastery",
  "proficiency",
  "providerPayload",
  "prompt",
  "completion",
  "textbookContent",
  "copiedText",
  "childName",
  "studentName",
  "email",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [fixtures, skillGraph, blueprint, diagnosticItems, responseEvidenceFixtures] =
    await Promise.all([
      readDiagnosticSessionLifecycleFixtures(),
      readSkillGraph(),
      readDiagnosticBlueprint(),
      readDiagnosticItemFixtures(),
      readDiagnosticResponseEvidenceFixtures(),
    ]);
  return { fixtures, skillGraph, blueprint, diagnosticItems, responseEvidenceFixtures };
}

function validate(artifacts, fixtures = artifacts.fixtures) {
  return validateDiagnosticSessionLifecycleFixtures(
    fixtures,
    artifacts.skillGraph,
    artifacts.blueprint,
    artifacts.diagnosticItems,
    artifacts.responseEvidenceFixtures,
  );
}

test("diagnostic session lifecycle fixtures are structurally valid", async () => {
  const artifacts = await readArtifacts();
  const summary = validate(artifacts);

  assert.equal(summary.fixtureSetVersion, "wave-3.slice-6.grade-7-9-math.v1");
  assert.equal(summary.sessionCount, 3);
  assert.equal(summary.lifecycleStateCount, 7);
  assert.equal(summary.transitionCount, 14);
  assert.deepEqual(summary.fixtureFinalStates, ["abandoned", "closed", "invalidated"]);
});

test("session lifecycle validator rejects duplicate session IDs", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[1].id = artifacts.fixtures.sessions[0].id;

  assert.throws(() => validate(artifacts), /Duplicate diagnostic session ID/);
});

test("session lifecycle validator rejects invalid session IDs", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].id = "dsession.math.grade-7.fixture-01.v1";

  assert.throws(() => validate(artifacts), /does not match the diagnostic session fixture ID/);
});

test("session lifecycle validator rejects invalid lifecycle states", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].lifecycleState = "finished";
  const statePath = artifacts.fixtures.sessions[0].statePath;
  statePath[statePath.length - 1] = "finished";

  assert.throws(() => validate(artifacts), /invalid lifecycle state/);
});

test("session lifecycle validator rejects unsupported transition definitions", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.stateTransitions[0] = {
    from: "drafted",
    to: "closed",
    policyNote: "Blocked transition.",
  };

  assert.throws(() => validate(artifacts), /Unsupported diagnostic session lifecycle transition/);
});

test("session lifecycle validator rejects invalid state paths", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].statePath = ["drafted", "ready", "closed"];

  assert.throws(() => validate(artifacts), /statePath uses invalid lifecycle transition/);
});

test("session lifecycle validator rejects unknown blueprint slot IDs", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].blueprintSlotIds[0] = "diag.math.g7-9.number.unknown.v1";

  assert.throws(() => validate(artifacts), /unknown blueprint slot/);
});

test("session lifecycle validator rejects unknown diagnostic item IDs", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].selectedDiagnosticItemIds[0] =
    "ditem.math.number.unknown.fixture-01.v1";

  assert.throws(() => validate(artifacts), /unknown diagnostic item/);
});

test("session lifecycle validator rejects unknown response IDs", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].responseIds[0] = "dresponse.math.number.unknown.fixture-01.v1";

  assert.throws(() => validate(artifacts), /unknown response/);
});

test("session lifecycle validator rejects unknown evidence IDs", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].evidenceIds[0] = "devidence.math.number.unknown.fixture-01.v1";

  assert.throws(() => validate(artifacts), /unknown evidence/);
});

test("session lifecycle validator rejects invalid grade bands", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].gradeBand = { min: 6, max: 9 };

  assert.throws(() => validate(artifacts), /grades 7-9/);
});

test("session lifecycle validator rejects every required forbidden field term", async () => {
  const artifacts = await readArtifacts();

  for (const forbiddenField of forbiddenFields) {
    const unsafeFixtures = clone(artifacts.fixtures);
    unsafeFixtures.sessions[0][forbiddenField] = "blocked";
    assert.throws(
      () => validate(artifacts, unsafeFixtures),
      /forbidden field term/,
      forbiddenField,
    );
  }
});

test("session lifecycle validator scans forbidden content terms", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].lifecycleNote = "This synthetic fixture contains an answer.";

  assert.throws(() => validate(artifacts), /forbidden content term answer/);
});

test("session lifecycle validator rejects runtime persistence and identity fields", async () => {
  const artifacts = await readArtifacts();
  const runtimeFields = [
    "attemptId",
    "databaseId",
    "persistedAt",
    "createdAt",
    "timestamp",
    "tenantId",
    "familyId",
    "childId",
    "learnerId",
    "storageKey",
    "sessionToken",
  ];

  for (const runtimeField of runtimeFields) {
    const unsafeFixtures = clone(artifacts.fixtures);
    unsafeFixtures.sessions[0][runtimeField] = "blocked";
    assert.throws(
      () => validate(artifacts, unsafeFixtures),
      /forbidden runtime or persistence field term/,
      runtimeField,
    );
  }
});

test("session lifecycle fixtures remain synthetic non-production and storage-disabled", async () => {
  const artifacts = await readArtifacts();
  const runtimeEnabled = clone(artifacts.fixtures);
  runtimeEnabled.metadata.runtimeUseAllowed = true;
  assert.throws(() => validate(artifacts, runtimeEnabled), /storage-disabled fixtures/);

  const storedSession = clone(artifacts.fixtures);
  storedSession.sessions[0].storageAllowed = true;
  assert.throws(() => validate(artifacts, storedSession), /storage-disabled/);
});

test("session lifecycle validator enforces upstream version pins", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.metadata.diagnosticResponseEvidenceFixtureSetVersion =
    "wave-3.slice-5.unknown.v1";

  assert.throws(() => validate(artifacts), /does not match response\/evidence fixtures/);
});

test("session lifecycle validator aligns selected items and blueprint slots", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].blueprintSlotIds[0] = "diag.math.g7-9.number.percent-ratio.v1";

  assert.throws(() => validate(artifacts), /must equal the slots implied by selected items/);
});

test("session lifecycle validator aligns response and evidence references", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].evidenceIds[0] =
    "devidence.math.geometry.parallel-lines.fixture-01.v1";

  assert.throws(() => validate(artifacts), /must include the paired evidence/);
});

test("session lifecycle validator enforces abandonment and invalidation dispositions", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[1].referenceDisposition = "structural_only";

  assert.throws(() => validate(artifacts), /referenceDisposition must be no_linked_records/);
});

test("session lifecycle validator rejects duplicate references", async () => {
  const artifacts = await readArtifacts();
  artifacts.fixtures.sessions[0].responseIds.push(artifacts.fixtures.sessions[0].responseIds[0]);

  assert.throws(() => validate(artifacts), /contains duplicate reference/);
});

test("slice scope guard rejects API OpenAPI Prisma web and other runtime paths", () => {
  const changedPaths = validateDiagnosticSessionLifecycleWorktreeScope();

  for (const changedPath of changedPaths) {
    const isLegacyStaticPath = /^(docs\/wave-(?:3|4)\/|packages\/curriculum\/|package\.json$)/.test(
      changedPath,
    );
    assert.equal(
      isLegacyStaticPath || wave5DocumentationPathsThroughSlice10.has(changedPath),
      true,
      changedPath,
    );
  }
});
