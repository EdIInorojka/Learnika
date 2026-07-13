import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { DiagnosticCatalogRegistryService } from "../dist/diagnostic-catalog/diagnostic-catalog.service.js";
import { diagnosticCatalogPolicyVersion } from "../dist/diagnostic-catalog/diagnostic-catalog.types.js";

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

function createService(artifacts = loadArtifacts()) {
  return new DiagnosticCatalogRegistryService(artifacts);
}

function cloneArtifacts(artifacts = loadArtifacts()) {
  return JSON.parse(JSON.stringify(artifacts));
}

function assertExactKeys(value, expectedKeys) {
  assert.deepEqual(Object.keys(value).sort(), [...expectedKeys].sort());
}

function assertNoUnsafeOutputFields(value) {
  const visit = (candidate) => {
    if (!candidate || typeof candidate !== "object") {
      return;
    }
    if (Array.isArray(candidate)) {
      candidate.forEach(visit);
      return;
    }
    for (const [key, nestedValue] of Object.entries(candidate)) {
      assert.doesNotMatch(
        key,
        /answer|correct|solution|hint|scor|mastery|proficiency|provider|prompt|completion|payload|textbook|copied|student|child|learner/i,
      );
      visit(nestedValue);
    }
  };
  visit(value);
}

test("skill lookup returns only the approved metadata projection", () => {
  const artifacts = loadArtifacts();
  const skill = artifacts.skillGraph.skills[0];
  const result = createService(artifacts).findSkillById(skill.id);

  assert.equal(result.found, true);
  assert.equal(result.kind, "SKILL");
  assert.equal(result.metadataOnly, true);
  assert.equal(result.policyVersion, diagnosticCatalogPolicyVersion);
  assertExactKeys(result.value, [
    "gradeBand",
    "id",
    "prerequisiteIds",
    "shortDescription",
    "strand",
    "title",
  ]);
  assert.deepEqual(result.value, {
    gradeBand: skill.gradeBand,
    id: skill.id,
    prerequisiteIds: skill.prerequisites,
    shortDescription: skill.shortDescription,
    strand: skill.strand,
    title: skill.title,
  });
  assert.equal("safetyNotes" in result.value, false);
});

test("blueprint slot lookup returns only structural metadata", () => {
  const artifacts = loadArtifacts();
  const slot = artifacts.diagnosticBlueprint.items[0];
  const result = createService(artifacts).findBlueprintSlotById(slot.id);

  assert.equal(result.found, true);
  assert.equal(result.kind, "BLUEPRINT_SLOT");
  assertExactKeys(result.value, [
    "coverageStatus",
    "difficultyBand",
    "evidenceCategory",
    "gradeBand",
    "id",
    "primarySkillId",
    "status",
    "strand",
    "supportingSkillIds",
  ]);
  assert.equal("sourcePolicy" in result.value, false);
  assert.equal("safetyNotes" in result.value, false);
});

test("item lookup omits content and preserves non-production markers", () => {
  const artifacts = loadArtifacts();
  const item = artifacts.diagnosticItems.items[0];
  const result = createService(artifacts).findItemFixtureById(item.id);

  assert.equal(result.found, true);
  assert.equal(result.kind, "ITEM_FIXTURE");
  assertExactKeys(result.value, [
    "blueprintSlotId",
    "contentOrigin",
    "coverageStatus",
    "evidenceCategory",
    "gradeBand",
    "id",
    "primarySkillId",
    "productionUseAllowed",
    "status",
    "strand",
    "supportingSkillIds",
  ]);
  assert.equal(result.value.status, "draft_non_production_fixture");
  assert.equal(result.value.productionUseAllowed, false);
  assert.equal("stem" in result.value, false);
  assert.equal("evaluationPlaceholder" in result.value, false);
  assert.equal("safetyNotes" in result.value, false);
  assert.equal(JSON.stringify(result).includes(item.stem), false);
});

test("unknown identifiers return bounded metadata without reflecting input", () => {
  const service = createService();
  const unsafeId = "parent@example.test final answer";

  for (const result of [
    service.findSkillById(unsafeId),
    service.findBlueprintSlotById(unsafeId),
    service.findItemFixtureById(unsafeId),
  ]) {
    assert.equal(result.found, false);
    assert.equal(result.metadataOnly, true);
    assert.equal(result.reason, "NOT_FOUND");
    assert.equal(JSON.stringify(result).includes(unsafeId), false);
    assertNoUnsafeOutputFields(result);
  }
});

test("version mismatch and missing metadata deny every lookup safely", () => {
  const mismatched = cloneArtifacts();
  mismatched.diagnosticItems.metadata.canonicalSkillGraphVersion = "mismatched.v1";
  const missingMetadata = cloneArtifacts();
  delete missingMetadata.diagnosticBlueprint.metadata.blueprintVersion;

  for (const service of [createService(mismatched), createService(missingMetadata)]) {
    for (const result of [
      service.findSkillById("math.number.integer-operations.v1"),
      service.findBlueprintSlotById("diag.math.g7-9.number.rational-number-operations.v1"),
      service.findItemFixtureById("ditem.math.number.rational-number-operations.fixture-01.v1"),
    ]) {
      assert.equal(result.found, false);
      assert.equal(result.reason, "CATALOG_UNAVAILABLE");
      assertExactKeys(result, ["found", "kind", "metadataOnly", "policyVersion", "reason"]);
      assertNoUnsafeOutputFields(result);
    }
  }
});

test("lookups are deterministic and caller mutation cannot alter the registry", () => {
  const service = createService();
  const skillId = "math.algebra.linear-equation-one-variable.v1";
  const first = service.findSkillById(skillId);
  const second = service.findSkillById(skillId);

  assert.deepEqual(second, first);
  assert.notEqual(second, first);
  assert.notEqual(second.value, first.value);
  first.value.prerequisiteIds.push("unsafe-mutation");
  first.value.gradeBand.min = 1;

  const third = service.findSkillById(skillId);
  assert.deepEqual(third, second);
});

test("all successful catalog outputs exclude learning and evaluation fields", () => {
  const artifacts = loadArtifacts();
  const service = createService(artifacts);
  const outputs = [
    ...artifacts.skillGraph.skills.map((skill) => service.findSkillById(skill.id)),
    ...artifacts.diagnosticBlueprint.items.map((slot) => service.findBlueprintSlotById(slot.id)),
    ...artifacts.diagnosticItems.items.map((item) => service.findItemFixtureById(item.id)),
  ];

  assert.equal(
    outputs.every((result) => result.found),
    true,
  );
  outputs.forEach(assertNoUnsafeOutputFields);
});

test("repository loader pins all three artifact versions", () => {
  const artifacts = loadArtifacts();
  const result = DiagnosticCatalogRegistryService.fromRepository().findItemFixtureById(
    artifacts.diagnosticItems.items[0].id,
  );

  assert.equal(result.found, true);
  assert.deepEqual(result.artifactVersions, {
    blueprint: artifacts.diagnosticBlueprint.metadata.blueprintVersion,
    itemFixtures: artifacts.diagnosticItems.metadata.fixtureSetVersion,
    skillGraph: artifacts.skillGraph.metadata.graphVersion,
  });
});

test("Slice 8 remains internal read-only and exactly scope-guarded", () => {
  const moduleDir = path.join(process.cwd(), "src", "diagnostic-catalog");
  const moduleFiles = fs.readdirSync(moduleDir);
  assert.equal(
    moduleFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModule = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModule.includes("DiagnosticCatalogModule"), false);

  const openapi = JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  assert.equal(
    Object.keys(openapi.paths ?? {}).some((routePath) => /diagnostic-catalog/i.test(routePath)),
    false,
  );

  const schema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  assert.doesNotMatch(schema, /model\s+DiagnosticCatalog/i);
  const migrations = fs
    .readdirSync(path.join(process.cwd(), "prisma", "migrations"))
    .filter((fileName) => fileName !== "migration_lock.toml");
  assert.deepEqual(migrations, [
    "20260708173051_initial_data_foundation",
    "20260708181231_auth_session_foundation",
    "20260710082038_homework_media_domain_foundation",
  ]);

  const serviceSource = fs.readFileSync(
    path.join(moduleDir, "diagnostic-catalog.service.ts"),
    "utf8",
  );
  assert.doesNotMatch(
    serviceSource,
    /@prisma|writeFile|appendFile|createWriteStream|mkdir|renameSync|unlink|rmSync|axios|fetch\s*\(|Math\.random|randomUUID|node:http|node:https/,
  );

  const scopeGuard = fs.readFileSync(
    path.join(repositoryRoot, "packages", "curriculum", "scripts", "validate-skill-graph.mjs"),
    "utf8",
  );
  assert.match(scopeGuard, /apps\/api\/src\/diagnostic-catalog\//);
  assert.match(scopeGuard, /apps\/api\/test\/diagnostic-catalog\.test\.mjs/);
  assert.doesNotMatch(scopeGuard, /["'`]apps\/api\/(?:\*\*|\*)?["'`]/);
});
