import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { DiagnosticCatalogRegistryService } from "../dist/diagnostic-catalog/diagnostic-catalog.service.js";
import { DiagnosticSessionDraftService } from "../dist/diagnostic-session-draft/diagnostic-session-draft.service.js";
import {
  diagnosticSessionDraftPolicyVersion,
  diagnosticSessionDraftVersion,
} from "../dist/diagnostic-session-draft/diagnostic-session-draft.types.js";
import { DiagnosticSessionPlanService } from "../dist/diagnostic-session-plan/diagnostic-session-plan.service.js";
import { diagnosticSessionPlanBlueprintVersion } from "../dist/diagnostic-session-plan/diagnostic-session-plan.types.js";
import { DiagnosticSessionStateService } from "../dist/diagnostic-session-state/diagnostic-session-state.service.js";
import { diagnosticSessionStatePolicyVersion } from "../dist/diagnostic-session-state/diagnostic-session-state.types.js";

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
  const catalog = new DiagnosticCatalogRegistryService(artifacts);
  return new DiagnosticSessionDraftService(
    new DiagnosticSessionPlanService(catalog),
    new DiagnosticSessionStateService(),
  );
}

function previewCurrentDraft(service = createService()) {
  return service.previewDraft({ blueprintVersion: diagnosticSessionPlanBlueprintVersion });
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

test("valid blueprint produces a deterministic metadata-only draft preview", () => {
  const service = createService();
  const first = previewCurrentDraft(service);
  const second = previewCurrentDraft(service);

  assert.deepEqual(second, first);
  assert.equal(first.available, true);
  assert.equal(first.metadataOnly, true);
  assert.equal(first.draftVersion, diagnosticSessionDraftVersion);
  assert.equal(first.policyVersion, diagnosticSessionDraftPolicyVersion);
  assert.equal(first.productionUseAllowed, false);
  assert.equal(first.runtimeUseAllowed, false);
  assert.equal(first.storageAllowed, false);
  assertNoUnsafeOutputFields(first);
});

test("draft starts in the lifecycle contract initial state", () => {
  const draft = previewCurrentDraft();

  assert.equal(draft.available, true);
  assert.equal(draft.lifecycleState, "drafted");
  assert.equal("sessionId" in draft, false);
  assert.equal("statePath" in draft, false);
});

test("direct activation remains a safe state-service denial", () => {
  const draft = previewCurrentDraft();

  assert.equal(draft.available, true);
  assert.deepEqual(draft.directActivationGuard, {
    accepted: false,
    fromState: "drafted",
    metadataOnly: true,
    policyVersion: diagnosticSessionStatePolicyVersion,
    reason: "TRANSITION_NOT_ALLOWED",
    toState: "active",
  });
  assertNoUnsafeOutputFields(draft.directActivationGuard);
});

test("draft preserves incomplete plan coverage without interpretation", () => {
  const draft = previewCurrentDraft();

  assert.equal(draft.available, true);
  assert.equal(draft.planReadiness, "INCOMPLETE");
  assert.equal(draft.reason, "DRAFT_PREVIEW_INCOMPLETE");
  assert.equal(draft.plan.planState, "INCOMPLETE");
  assert.equal(draft.plan.reason, "INCOMPLETE_COVERAGE");
  assert.equal(draft.plan.expectedBlueprintSlotCount, 11);
  assert.equal(draft.plan.availableItemFixtureCount, 5);
  assert.equal(draft.plan.missingBlueprintSlotIds.length, 6);
  assert.equal(draft.plan.interpretationMode, "NONE");
});

test("unknown blueprint returns bounded denial without reflecting input", () => {
  const unsafeVersion = "unknown parent@example.test final answer";
  const result = createService().previewDraft({ blueprintVersion: unsafeVersion });

  assert.deepEqual(result, {
    available: false,
    draftVersion: diagnosticSessionDraftVersion,
    metadataOnly: true,
    policyVersion: diagnosticSessionDraftPolicyVersion,
    productionUseAllowed: false,
    reason: "BLUEPRINT_UNKNOWN",
    runtimeUseAllowed: false,
    storageAllowed: false,
  });
  assert.equal(JSON.stringify(result).includes(unsafeVersion), false);
  assertNoUnsafeOutputFields(result);
});

test("unavailable catalog returns safe draft denial", () => {
  const planService = new DiagnosticSessionPlanService(new DiagnosticCatalogRegistryService(null));
  const service = new DiagnosticSessionDraftService(
    planService,
    new DiagnosticSessionStateService(),
  );
  const result = previewCurrentDraft(service);

  assert.equal(result.available, false);
  assert.equal(result.reason, "CATALOG_UNAVAILABLE");
  assertNoUnsafeOutputFields(result);
});

test("identity response evaluation and provider-shaped input is rejected", () => {
  const service = createService();
  const unsafeInputs = [
    { childId: "child-1" },
    { studentId: "student-1" },
    { email: "parent@example.test" },
    { familyId: "family-1" },
    { tenantId: "tenant-1" },
    { learnerIdentity: "learner-1" },
    { learnerAnswer: "x = 2" },
    { freeformContent: "raw response" },
    { score: 1 },
    { mastery: true },
    { providerPayload: "opaque" },
  ].map((extra) => ({
    blueprintVersion: diagnosticSessionPlanBlueprintVersion,
    ...extra,
  }));

  for (const input of unsafeInputs) {
    const result = service.previewDraft(input);
    assert.equal(result.available, false);
    assert.equal(result.reason, "INPUT_INVALID");
    for (const value of Object.values(input)) {
      if (typeof value === "string" && value !== diagnosticSessionPlanBlueprintVersion) {
        assert.equal(JSON.stringify(result).includes(String(value)), false);
      }
    }
    assertNoUnsafeOutputFields(result);
  }
});

test("draft output omits item stems and caller mutation does not persist", () => {
  const service = createService();
  const first = previewCurrentDraft(service);
  const baseline = previewCurrentDraft(service);
  const artifacts = loadArtifacts();
  const serialized = JSON.stringify(first);

  for (const item of artifacts.diagnosticItems.items) {
    assert.equal(serialized.includes(item.stem), false);
  }
  first.plan.entries[0].supportingSkillIds.push("unsafe-mutation");
  first.plan.missingBlueprintSlotIds.push("unsafe-mutation");
  assert.deepEqual(previewCurrentDraft(service), baseline);
});

test("Slice 10 remains internal read-only and exactly scope-guarded", () => {
  const moduleDir = path.join(process.cwd(), "src", "diagnostic-session-draft");
  const moduleFiles = fs.readdirSync(moduleDir);
  assert.equal(
    moduleFiles.some((fileName) => fileName.endsWith(".controller.ts")),
    false,
  );

  const appModule = fs.readFileSync(path.join(process.cwd(), "src", "app.module.ts"), "utf8");
  assert.equal(appModule.includes("DiagnosticSessionDraftModule"), false);

  const openapi = JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  assert.equal(
    Object.keys(openapi.paths ?? {}).some((routePath) =>
      /diagnostic-session-draft/i.test(routePath),
    ),
    false,
  );

  const schema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  assert.doesNotMatch(schema, /model\s+DiagnosticSessionDraft/i);
  const migrations = fs
    .readdirSync(path.join(process.cwd(), "prisma", "migrations"))
    .filter((fileName) => fileName !== "migration_lock.toml");
  assert.deepEqual(migrations, [
    "20260708173051_initial_data_foundation",
    "20260708181231_auth_session_foundation",
    "20260710082038_homework_media_domain_foundation",
  ]);

  const serviceSource = fs.readFileSync(
    path.join(moduleDir, "diagnostic-session-draft.service.ts"),
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
  assert.match(scopeGuard, /apps\/api\/src\/diagnostic-session-draft\//);
  assert.match(scopeGuard, /apps\/api\/test\/diagnostic-session-draft\.test\.mjs/);
  assert.doesNotMatch(scopeGuard, /["'`]apps\/api\/(?:\*\*|\*)?["'`]/);

  const apiPackage = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
  assert.equal(apiPackage.scripts.test.includes("diagnostic-session-draft.test.mjs"), true);
});
