import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { DiagnosticCatalogRegistryService } from "../dist/diagnostic-catalog/diagnostic-catalog.service.js";
import { DiagnosticSessionPlanService } from "../dist/diagnostic-session-plan/diagnostic-session-plan.service.js";
import {
  diagnosticSessionPlanBlueprintVersion,
  diagnosticSessionPlanPolicyVersion,
  diagnosticSessionPlanVersion,
} from "../dist/diagnostic-session-plan/diagnostic-session-plan.types.js";

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

function cloneArtifacts(artifacts = loadArtifacts()) {
  return JSON.parse(JSON.stringify(artifacts));
}

function createService(artifacts = loadArtifacts()) {
  return new DiagnosticSessionPlanService(new DiagnosticCatalogRegistryService(artifacts));
}

function buildCurrentPlan(service = createService()) {
  return service.buildPlan({ blueprintVersion: diagnosticSessionPlanBlueprintVersion });
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
  ]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
}

test("valid catalog produces a deterministic metadata-only plan", () => {
  const service = createService();
  const first = buildCurrentPlan(service);
  const second = buildCurrentPlan(service);

  assert.deepEqual(second, first);
  assert.equal(first.available, true);
  assert.equal(first.metadataOnly, true);
  assert.equal(first.planVersion, diagnosticSessionPlanVersion);
  assert.equal(first.policyVersion, diagnosticSessionPlanPolicyVersion);
  assert.equal(first.blueprintVersion, diagnosticSessionPlanBlueprintVersion);
  assert.equal(first.productionUseAllowed, false);
  assert.equal(first.runtimeUseAllowed, false);
  assert.equal(first.storageAllowed, false);
  assert.equal(first.interpretationMode, "NONE");
  assert.equal(first.expectedBlueprintSlotCount, 11);
  assert.equal(first.entries.length, 11);
  assertNoUnsafeOutputFields(first);
});

test("plan references only known slots item fixtures and canonical skills", () => {
  const artifacts = loadArtifacts();
  const plan = buildCurrentPlan(createService(artifacts));
  const slotsById = new Map(artifacts.diagnosticBlueprint.items.map((slot) => [slot.id, slot]));
  const itemsById = new Map(artifacts.diagnosticItems.items.map((item) => [item.id, item]));
  const skillIds = new Set(artifacts.skillGraph.skills.map((skill) => skill.id));

  assert.equal(plan.available, true);
  assert.deepEqual(
    plan.entries.map((entry) => entry.blueprintSlotId),
    artifacts.diagnosticBlueprint.items.map((slot) => slot.id),
  );

  for (const entry of plan.entries) {
    const slot = slotsById.get(entry.blueprintSlotId);
    assert.ok(slot);
    assert.equal(skillIds.has(entry.primarySkillId), true);
    assert.equal(
      entry.supportingSkillIds.every((id) => skillIds.has(id)),
      true,
    );
    assert.equal(entry.primarySkillId, slot.primarySkillId);
    assert.deepEqual(entry.supportingSkillIds, slot.supportingSkillIds);
    assert.equal(entry.strand, slot.strand);
    assert.equal(entry.evidenceCategory, slot.evidenceCategory);

    if (entry.itemFixtureId === null) {
      assert.equal(entry.itemFixtureState, "MISSING");
      continue;
    }
    const item = itemsById.get(entry.itemFixtureId);
    assert.ok(item);
    assert.equal(item.blueprintSlotId, entry.blueprintSlotId);
    assert.equal(entry.itemFixtureState, "DRAFT_NON_PRODUCTION");
    assert.equal(entry.productionUseAllowed, false);
  }
});

test("current fixture coverage returns safe incomplete-plan metadata", () => {
  const artifacts = loadArtifacts();
  const plan = buildCurrentPlan(createService(artifacts));
  const coveredSlots = new Set(artifacts.diagnosticItems.items.map((item) => item.blueprintSlotId));
  const expectedMissing = artifacts.diagnosticBlueprint.items
    .map((slot) => slot.id)
    .filter((slotId) => !coveredSlots.has(slotId));

  assert.equal(plan.available, true);
  assert.equal(plan.planState, "INCOMPLETE");
  assert.equal(plan.reason, "INCOMPLETE_COVERAGE");
  assert.equal(plan.availableItemFixtureCount, 5);
  assert.deepEqual(plan.missingBlueprintSlotIds, expectedMissing);
  assert.equal(plan.missingBlueprintSlotIds.length, 6);
});

test("unknown blueprint returns bounded denial without reflecting input", () => {
  const unsafeVersion = "unknown parent@example.test final answer";
  const result = createService().buildPlan({ blueprintVersion: unsafeVersion });

  assert.deepEqual(result, {
    available: false,
    metadataOnly: true,
    planVersion: diagnosticSessionPlanVersion,
    policyVersion: diagnosticSessionPlanPolicyVersion,
    productionUseAllowed: false,
    reason: "BLUEPRINT_UNKNOWN",
    runtimeUseAllowed: false,
    storageAllowed: false,
  });
  assert.equal(JSON.stringify(result).includes(unsafeVersion), false);
  assertNoUnsafeOutputFields(result);
});

test("input allowlist rejects identity and response-shaped fields safely", () => {
  const service = createService();
  for (const input of [
    null,
    { blueprintVersion: diagnosticSessionPlanBlueprintVersion, childId: "child-1" },
    { blueprintVersion: diagnosticSessionPlanBlueprintVersion, learnerAnswer: "x = 2" },
  ]) {
    const result = service.buildPlan(input);
    assert.equal(result.available, false);
    assert.equal(result.reason, "INPUT_INVALID");
    assertNoUnsafeOutputFields(result);
  }
});

test("catalog unavailable and invalid version pins are denied safely", () => {
  const unavailable = new DiagnosticSessionPlanService(new DiagnosticCatalogRegistryService(null));
  const mismatchedArtifacts = cloneArtifacts();
  mismatchedArtifacts.diagnosticItems.metadata.canonicalSkillGraphVersion = "mismatched.v1";
  const mismatched = createService(mismatchedArtifacts);

  for (const service of [unavailable, mismatched]) {
    const result = buildCurrentPlan(service);
    assert.equal(result.available, false);
    assert.equal(result.reason, "CATALOG_UNAVAILABLE");
    assertNoUnsafeOutputFields(result);
  }
});

test("caller mutation cannot alter later deterministic plans", () => {
  const service = createService();
  const first = buildCurrentPlan(service);
  const baseline = buildCurrentPlan(service);

  first.entries[0].supportingSkillIds.push("unsafe-mutation");
  first.entries[0].gradeBand.min = 1;
  first.missingBlueprintSlotIds.push("unsafe-mutation");

  assert.deepEqual(buildCurrentPlan(service), baseline);
});

test("plan does not expose fixture stems or other unsafe catalog fields", () => {
  const artifacts = loadArtifacts();
  const plan = buildCurrentPlan(createService(artifacts));
  const serialized = JSON.stringify(plan);

  for (const item of artifacts.diagnosticItems.items) {
    assert.equal(serialized.includes(item.stem), false);
  }
  assert.equal(serialized.includes("evaluationPlaceholder"), false);
  assert.equal(serialized.includes("safetyNotes"), false);
  assertNoUnsafeOutputFields(plan);
});

test("Slice 9 remains internal read-only and exactly scope-guarded", () => {
  const moduleDir = path.join(process.cwd(), "src", "diagnostic-session-plan");
  const moduleFiles = fs.readdirSync(moduleDir);
  assert.equal(
    moduleFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModule = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModule.includes("DiagnosticSessionPlanModule"), false);

  const openapi = JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  assert.equal(
    Object.keys(openapi.paths ?? {}).some((routePath) =>
      /diagnostic-session-plan/i.test(routePath),
    ),
    false,
  );

  const schema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  assert.doesNotMatch(schema, /model\s+DiagnosticSessionPlan/i);
  const migrations = fs
    .readdirSync(path.join(process.cwd(), "prisma", "migrations"))
    .filter((fileName) => fileName !== "migration_lock.toml");
  assert.deepEqual(migrations, [
    "20260708173051_initial_data_foundation",
    "20260708181231_auth_session_foundation",
    "20260710082038_homework_media_domain_foundation",
  ]);

  const serviceSource = fs.readFileSync(
    path.join(moduleDir, "diagnostic-session-plan.service.ts"),
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
  assert.match(scopeGuard, /apps\/api\/src\/diagnostic-session-plan\//);
  assert.match(scopeGuard, /apps\/api\/test\/diagnostic-session-plan\.test\.mjs/);
  assert.doesNotMatch(scopeGuard, /["'`]apps\/api\/(?:\*\*|\*)?["'`]/);

  const apiPackage = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
  assert.equal(apiPackage.scripts.test.includes("diagnostic-session-plan.test.mjs"), true);
});
