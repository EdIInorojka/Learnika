import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  diagnosticReadinessEvaluationVersion,
  diagnosticReadinessPolicyVersion,
} from "../dist/diagnostic-readiness-policy/diagnostic-readiness-policy.types.js";
import { DiagnosticReadinessPolicyService } from "../dist/diagnostic-readiness-policy/diagnostic-readiness-policy.service.js";
import { DiagnosticCatalogRegistryService } from "../dist/diagnostic-catalog/diagnostic-catalog.service.js";
import { DiagnosticSessionDraftService } from "../dist/diagnostic-session-draft/diagnostic-session-draft.service.js";
import { diagnosticSessionDraftVersion } from "../dist/diagnostic-session-draft/diagnostic-session-draft.types.js";
import { DiagnosticSessionPlanService } from "../dist/diagnostic-session-plan/diagnostic-session-plan.service.js";
import { diagnosticSessionPlanBlueprintVersion } from "../dist/diagnostic-session-plan/diagnostic-session-plan.types.js";
import { DiagnosticSessionStateService } from "../dist/diagnostic-session-state/diagnostic-session-state.service.js";

const repositoryRoot = path.resolve(process.cwd(), "..", "..");

function readCurriculumJson(...segments) {
  return JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, "packages", "curriculum", ...segments), "utf8"),
  );
}

function loadArtifacts() {
  return {
    diagnosticBlueprint: readCurriculumJson(
      "diagnostic-blueprints",
      "grade-7-9-math.draft.v1.json",
    ),
    diagnosticItems: readCurriculumJson("diagnostic-items", "grade-7-9-math.fixtures.v1.json"),
    skillGraph: readCurriculumJson("skill-graph", "grade-7-9-math.seed.v1.json"),
  };
}

function createDraftService(artifacts = loadArtifacts()) {
  const catalog = new DiagnosticCatalogRegistryService(artifacts);
  return new DiagnosticSessionDraftService(
    new DiagnosticSessionPlanService(catalog),
    new DiagnosticSessionStateService(),
  );
}

function currentDraft(service = createDraftService()) {
  return service.previewDraft({ blueprintVersion: diagnosticSessionPlanBlueprintVersion });
}

function createPolicy() {
  return new DiagnosticReadinessPolicyService(new DiagnosticSessionStateService());
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
    "payload",
    "textbook",
    "copiedtext",
    "student",
    "child",
    "learner",
    "email",
    "family",
    "tenant",
  ]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
}

test("current Slice 10 draft is deterministically NOT_READY", () => {
  const policy = createPolicy();
  const draft = currentDraft();
  const first = policy.evaluateDraft(draft);
  const second = policy.evaluateDraft(draft);

  assert.deepEqual(second, first);
  assert.deepEqual(first, {
    availableItemFixtureCount: 5,
    blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
    blueprintVersion: diagnosticSessionPlanBlueprintVersion,
    eligibleForReadyTransition: false,
    evaluated: true,
    evaluationVersion: diagnosticReadinessEvaluationVersion,
    expectedBlueprintSlotCount: 11,
    gapCount: 6,
    lifecycleState: "drafted",
    lifecycleTransitionAllowed: true,
    metadataOnly: true,
    policyVersion: diagnosticReadinessPolicyVersion,
    productionUseAllowed: false,
    readiness: "NOT_READY",
    runtimeUseAllowed: false,
    storageAllowed: false,
  });
  assertNoUnsafeOutputFields(first);
});

test("incomplete coverage blocks readiness without educational interpretation", () => {
  const result = createPolicy().evaluateDraft(currentDraft());

  assert.equal(result.evaluated, true);
  assert.equal(result.readiness, "NOT_READY");
  assert.equal(result.eligibleForReadyTransition, false);
  assert.equal(result.gapCount, 6);
  assert.equal(result.blockingReasons.includes("INCOMPLETE_COVERAGE"), true);
  assert.equal("interpretation" in result, false);
});

test("non-production fixtures block production readiness safely", () => {
  const draft = currentDraft();
  const result = createPolicy().evaluateDraft(draft);

  assert.equal(draft.available, true);
  assert.equal(
    draft.plan.entries.some((entry) => entry.itemFixtureState === "DRAFT_NON_PRODUCTION"),
    true,
  );
  assert.equal(result.evaluated, true);
  assert.equal(result.blockingReasons.includes("NON_PRODUCTION_FIXTURES"), true);
  assert.equal(result.productionUseAllowed, false);
});

test("invalid lifecycle state blocks readiness without changing state", () => {
  const draft = clone(currentDraft());
  draft.lifecycleState = "active";
  const result = createPolicy().evaluateDraft(draft);

  assert.equal(result.evaluated, true);
  assert.equal(result.readiness, "NOT_READY");
  assert.equal(result.lifecycleState, "active");
  assert.equal(result.lifecycleTransitionAllowed, false);
  assert.equal(result.blockingReasons[0], "LIFECYCLE_NOT_DRAFTED");
  assert.equal(draft.lifecycleState, "active");
});

test("malformed unknown and unavailable drafts return bounded denials", () => {
  const policy = createPolicy();
  const unsafeVersion = "unknown parent@example.test final answer";
  const unknownVersionDraft = { ...currentDraft(), draftVersion: unsafeVersion };
  const unavailableDraft = createDraftService().previewDraft({ blueprintVersion: unsafeVersion });
  const cases = [
    [null, "DRAFT_INPUT_INVALID"],
    [{}, "DRAFT_INPUT_INVALID"],
    [unknownVersionDraft, "DRAFT_VERSION_UNKNOWN"],
    [unavailableDraft, "DRAFT_UNAVAILABLE"],
  ];

  for (const [draft, reason] of cases) {
    const result = policy.evaluateDraft(draft);
    assert.deepEqual(result, {
      evaluated: false,
      evaluationVersion: diagnosticReadinessEvaluationVersion,
      metadataOnly: true,
      policyVersion: diagnosticReadinessPolicyVersion,
      productionUseAllowed: false,
      reason,
      runtimeUseAllowed: false,
      storageAllowed: false,
    });
    assert.equal(JSON.stringify(result).includes(unsafeVersion), false);
    assertNoUnsafeOutputFields(result);
  }
});

test("identity response evaluation and provider-shaped additions are rejected", () => {
  const policy = createPolicy();
  const draft = currentDraft();
  const unsafeAdditions = [
    { childId: "child-1" },
    { studentId: "student-1" },
    { email: "parent@example.test" },
    { familyId: "family-1" },
    { tenantId: "tenant-1" },
    { learnerIdentity: "learner-1" },
    { learnerAnswer: "x = 2" },
    { response: "raw response" },
    { answer: "2" },
    { correctness: true },
    { score: 1 },
    { mastery: true },
    { providerPayload: "opaque" },
  ];

  for (const extra of unsafeAdditions) {
    const result = policy.evaluateDraft({ ...draft, ...extra });
    assert.equal(result.evaluated, false);
    assert.equal(result.reason, "DRAFT_INPUT_INVALID");
    assertNoUnsafeOutputFields(result);
  }

  const nestedUnsafeDraft = clone(draft);
  nestedUnsafeDraft.plan.entries[0].freeformContent = "raw content";
  assert.equal(policy.evaluateDraft(nestedUnsafeDraft).reason, "DRAFT_INPUT_INVALID");
});

test("inconsistent draft counts are denied without raw internals", () => {
  const draft = clone(currentDraft());
  draft.plan.availableItemFixtureCount = 99;
  const result = createPolicy().evaluateDraft(draft);

  assert.equal(result.evaluated, false);
  assert.equal(result.reason, "DRAFT_INPUT_INVALID");
  assert.equal(JSON.stringify(result).includes("99"), false);
  assertNoUnsafeOutputFields(result);
});

test("readiness output omits plan entries item stems and caller content", () => {
  const artifacts = loadArtifacts();
  const result = createPolicy().evaluateDraft(currentDraft());
  const serialized = JSON.stringify(result);

  for (const item of artifacts.diagnosticItems.items) {
    assert.equal(serialized.includes(item.stem), false);
    assert.equal(serialized.includes(item.id), false);
  }
  assert.equal("plan" in result, false);
  assertNoUnsafeOutputFields(result);
});

test("Slice 11 remains internal read-only and exactly scope-guarded", () => {
  const moduleDir = path.join(process.cwd(), "src", "diagnostic-readiness-policy");
  const moduleFiles = fs.readdirSync(moduleDir);
  assert.equal(
    moduleFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModule = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModule.includes("DiagnosticReadinessPolicyModule"), false);

  const openapi = JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  assert.equal(
    Object.keys(openapi.paths ?? {}).some((routePath) =>
      /diagnostic-readiness-policy/i.test(routePath),
    ),
    false,
  );

  const schema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  assert.doesNotMatch(schema, /model\s+DiagnosticReadiness/i);
  const migrations = fs
    .readdirSync(path.join(process.cwd(), "prisma", "migrations"))
    .filter((fileName) => fileName !== "migration_lock.toml");
  assert.deepEqual(migrations, [
    "20260708173051_initial_data_foundation",
    "20260708181231_auth_session_foundation",
    "20260710082038_homework_media_domain_foundation",
  ]);

  const serviceSource = fs.readFileSync(
    path.join(moduleDir, "diagnostic-readiness-policy.service.ts"),
    "utf8",
  );
  assert.doesNotMatch(
    serviceSource,
    /@prisma|node:fs|writeFile|appendFile|createWriteStream|axios|fetch\s*\(|Math\.random|randomUUID|node:http|node:https|Date\.now/,
  );

  const scopeGuard = fs.readFileSync(
    path.join(repositoryRoot, "packages", "curriculum", "scripts", "validate-skill-graph.mjs"),
    "utf8",
  );
  assert.match(scopeGuard, /apps\/api\/src\/diagnostic-readiness-policy\//);
  assert.match(scopeGuard, /apps\/api\/test\/diagnostic-readiness-policy\.test\.mjs/);
  assert.doesNotMatch(scopeGuard, /["'`]apps\/api\/(?:\*\*|\*)?["'`]/);

  const apiPackage = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
  assert.equal(apiPackage.scripts.test.includes("diagnostic-readiness-policy.test.mjs"), true);
  assert.equal(diagnosticSessionDraftVersion, "wave-3.slice-10.grade-7-9-math.v1");
});
