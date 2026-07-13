import { readFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  type DiagnosticBlueprintSlotProjection,
  type DiagnosticCatalogArtifacts,
  type DiagnosticCatalogArtifactVersions,
  type DiagnosticCatalogGradeBand,
  type DiagnosticCatalogLookupKind,
  type DiagnosticCatalogLookupNotFound,
  type DiagnosticCatalogLookupResult,
  type DiagnosticCatalogStrand,
  type DiagnosticItemFixtureProjection,
  type DiagnosticSkillProjection,
  diagnosticCatalogPolicyVersion,
} from "./diagnostic-catalog.types";

type JsonObject = Record<string, unknown>;

interface DiagnosticCatalogRegistry {
  readonly blueprintSlotsById: ReadonlyMap<string, DiagnosticBlueprintSlotProjection>;
  readonly itemFixturesById: ReadonlyMap<string, DiagnosticItemFixtureProjection>;
  readonly skillsById: ReadonlyMap<string, DiagnosticSkillProjection>;
  readonly versions: DiagnosticCatalogArtifactVersions;
}

const skillIdPattern =
  /^math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.v[1-9][0-9]*$/;
const blueprintSlotIdPattern =
  /^diag\.math\.g7-9\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.v[1-9][0-9]*$/;
const itemFixtureIdPattern =
  /^ditem\.math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.fixture-[0-9]{2}\.v[1-9][0-9]*$/;
const strands = new Set<DiagnosticCatalogStrand>([
  "algebra",
  "data",
  "functions",
  "geometry",
  "number",
]);

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStrand(value: unknown): value is DiagnosticCatalogStrand {
  return typeof value === "string" && strands.has(value as DiagnosticCatalogStrand);
}

function readStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => !isNonEmptyString(item))) {
    return null;
  }
  return [...value];
}

function readObjectArray(value: unknown): JsonObject[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => !isJsonObject(item))) {
    return null;
  }
  return value;
}

function readGradeBand(value: unknown): DiagnosticCatalogGradeBand | null {
  if (!isJsonObject(value)) {
    return null;
  }
  const { max, min } = value;
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    (min as number) < 7 ||
    (max as number) > 9 ||
    (min as number) > (max as number)
  ) {
    return null;
  }
  return Object.freeze({ max: max as number, min: min as number });
}

function hasExpectedAudienceGrades(metadata: JsonObject): boolean {
  return (
    Array.isArray(metadata.audienceGrades) &&
    metadata.audienceGrades.length === 3 &&
    metadata.audienceGrades.every((grade, index) => grade === index + 7)
  );
}

function gradeBandContains(
  containing: DiagnosticCatalogGradeBand,
  candidate: DiagnosticCatalogGradeBand,
): boolean {
  return containing.min <= candidate.min && containing.max >= candidate.max;
}

function hasUniqueValues(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

function cloneGradeBand(value: DiagnosticCatalogGradeBand): DiagnosticCatalogGradeBand {
  return { max: value.max, min: value.min };
}

function cloneSkill(value: DiagnosticSkillProjection): DiagnosticSkillProjection {
  return {
    gradeBand: cloneGradeBand(value.gradeBand),
    id: value.id,
    prerequisiteIds: [...value.prerequisiteIds],
    shortDescription: value.shortDescription,
    strand: value.strand,
    title: value.title,
  };
}

function cloneBlueprintSlot(
  value: DiagnosticBlueprintSlotProjection,
): DiagnosticBlueprintSlotProjection {
  return {
    coverageStatus: value.coverageStatus,
    difficultyBand: value.difficultyBand,
    evidenceCategory: value.evidenceCategory,
    gradeBand: cloneGradeBand(value.gradeBand),
    id: value.id,
    primarySkillId: value.primarySkillId,
    status: value.status,
    strand: value.strand,
    supportingSkillIds: [...value.supportingSkillIds],
  };
}

function cloneItemFixture(value: DiagnosticItemFixtureProjection): DiagnosticItemFixtureProjection {
  return {
    blueprintSlotId: value.blueprintSlotId,
    contentOrigin: value.contentOrigin,
    coverageStatus: value.coverageStatus,
    evidenceCategory: value.evidenceCategory,
    gradeBand: cloneGradeBand(value.gradeBand),
    id: value.id,
    primarySkillId: value.primarySkillId,
    productionUseAllowed: false,
    status: value.status,
    strand: value.strand,
    supportingSkillIds: [...value.supportingSkillIds],
  };
}

function buildSkillRegistry(
  graph: JsonObject,
): ReadonlyMap<string, DiagnosticSkillProjection> | null {
  const skills = readObjectArray(graph.skills);
  if (!skills) {
    return null;
  }

  const skillsById = new Map<string, DiagnosticSkillProjection>();
  for (const skill of skills) {
    const { id, shortDescription, strand, title } = skill;
    const gradeBand = readGradeBand(skill.gradeBand);
    const prerequisiteIds = readStringArray(skill.prerequisites);
    if (
      !isNonEmptyString(id) ||
      !skillIdPattern.test(id) ||
      skillsById.has(id) ||
      !isNonEmptyString(title) ||
      !isNonEmptyString(shortDescription) ||
      !isStrand(strand) ||
      id.split(".")[1] !== strand ||
      !gradeBand ||
      !prerequisiteIds ||
      !hasUniqueValues(prerequisiteIds)
    ) {
      return null;
    }

    skillsById.set(
      id,
      Object.freeze({
        gradeBand,
        id,
        prerequisiteIds: Object.freeze(prerequisiteIds),
        shortDescription,
        strand,
        title,
      }),
    );
  }

  for (const skill of skillsById.values()) {
    if (skill.prerequisiteIds.some((id) => !skillsById.has(id))) {
      return null;
    }
  }
  return skillsById;
}

function readEvidenceCategoryIds(blueprint: JsonObject): Set<string> | null {
  const categories = readObjectArray(blueprint.evidenceCategories);
  if (!categories) {
    return null;
  }
  const categoryIds = new Set<string>();
  for (const category of categories) {
    if (!isNonEmptyString(category.id) || categoryIds.has(category.id)) {
      return null;
    }
    categoryIds.add(category.id);
  }
  return categoryIds;
}

function buildBlueprintRegistry(
  blueprint: JsonObject,
  skillsById: ReadonlyMap<string, DiagnosticSkillProjection>,
): ReadonlyMap<string, DiagnosticBlueprintSlotProjection> | null {
  const slots = readObjectArray(blueprint.items);
  const evidenceCategoryIds = readEvidenceCategoryIds(blueprint);
  if (!slots || !evidenceCategoryIds) {
    return null;
  }

  const slotsById = new Map<string, DiagnosticBlueprintSlotProjection>();
  for (const slot of slots) {
    const { coverageStatus, difficultyBand, evidenceCategory, id, primarySkillId, status, strand } =
      slot;
    const gradeBand = readGradeBand(slot.gradeBand);
    const supportingSkillIds = readStringArray(slot.supportingSkillIds);
    const primarySkill = isNonEmptyString(primarySkillId)
      ? skillsById.get(primarySkillId)
      : undefined;
    if (
      !isNonEmptyString(id) ||
      !blueprintSlotIdPattern.test(id) ||
      slotsById.has(id) ||
      status !== "draft_slot" ||
      !gradeBand ||
      !isStrand(strand) ||
      id.split(".")[3] !== strand ||
      !isNonEmptyString(primarySkillId) ||
      !primarySkill ||
      primarySkill.strand !== strand ||
      !gradeBandContains(primarySkill.gradeBand, gradeBand) ||
      !supportingSkillIds ||
      !hasUniqueValues(supportingSkillIds) ||
      supportingSkillIds.includes(primarySkillId) ||
      supportingSkillIds.some((skillId) => !skillsById.has(skillId)) ||
      !isNonEmptyString(evidenceCategory) ||
      !evidenceCategoryIds.has(evidenceCategory) ||
      !isNonEmptyString(difficultyBand) ||
      !isNonEmptyString(coverageStatus)
    ) {
      return null;
    }

    slotsById.set(
      id,
      Object.freeze({
        coverageStatus,
        difficultyBand,
        evidenceCategory,
        gradeBand,
        id,
        primarySkillId,
        status,
        strand,
        supportingSkillIds: Object.freeze(supportingSkillIds),
      }),
    );
  }
  return slotsById;
}

function buildItemFixtureRegistry(
  fixtureSet: JsonObject,
  skillsById: ReadonlyMap<string, DiagnosticSkillProjection>,
  blueprintSlotsById: ReadonlyMap<string, DiagnosticBlueprintSlotProjection>,
): ReadonlyMap<string, DiagnosticItemFixtureProjection> | null {
  const items = readObjectArray(fixtureSet.items);
  if (!items) {
    return null;
  }

  const itemsById = new Map<string, DiagnosticItemFixtureProjection>();
  for (const item of items) {
    const {
      blueprintSlotId,
      contentOrigin,
      coverageStatus,
      evidenceCategory,
      id,
      primarySkillId,
      productionUseAllowed,
      status,
      strand,
    } = item;
    const gradeBand = readGradeBand(item.gradeBand);
    const supportingSkillIds = readStringArray(item.supportingSkillIds);
    const slot = isNonEmptyString(blueprintSlotId)
      ? blueprintSlotsById.get(blueprintSlotId)
      : undefined;
    const primarySkill = isNonEmptyString(primarySkillId)
      ? skillsById.get(primarySkillId)
      : undefined;
    if (
      !isNonEmptyString(id) ||
      !itemFixtureIdPattern.test(id) ||
      itemsById.has(id) ||
      status !== "draft_non_production_fixture" ||
      productionUseAllowed !== false ||
      contentOrigin !== "original_minimal_fixture" ||
      !gradeBand ||
      !isStrand(strand) ||
      id.split(".")[2] !== strand ||
      !isNonEmptyString(blueprintSlotId) ||
      !slot ||
      slot.strand !== strand ||
      !isNonEmptyString(primarySkillId) ||
      !primarySkill ||
      primarySkill.strand !== strand ||
      slot.primarySkillId !== primarySkillId ||
      !gradeBandContains(slot.gradeBand, gradeBand) ||
      !gradeBandContains(primarySkill.gradeBand, gradeBand) ||
      !supportingSkillIds ||
      !hasUniqueValues(supportingSkillIds) ||
      supportingSkillIds.some(
        (skillId) => !skillsById.has(skillId) || !slot.supportingSkillIds.includes(skillId),
      ) ||
      evidenceCategory !== slot.evidenceCategory ||
      !isNonEmptyString(coverageStatus)
    ) {
      return null;
    }

    itemsById.set(
      id,
      Object.freeze({
        blueprintSlotId,
        contentOrigin,
        coverageStatus,
        evidenceCategory,
        gradeBand,
        id,
        primarySkillId,
        productionUseAllowed: false,
        status,
        strand,
        supportingSkillIds: Object.freeze(supportingSkillIds),
      }),
    );
  }
  return itemsById;
}

function buildRegistry(
  artifacts: DiagnosticCatalogArtifacts | null | undefined,
): DiagnosticCatalogRegistry | null {
  if (!artifacts) {
    return null;
  }
  const graph = isJsonObject(artifacts.skillGraph) ? artifacts.skillGraph : null;
  const blueprint = isJsonObject(artifacts.diagnosticBlueprint)
    ? artifacts.diagnosticBlueprint
    : null;
  const fixtureSet = isJsonObject(artifacts.diagnosticItems) ? artifacts.diagnosticItems : null;
  if (!graph || !blueprint || !fixtureSet) {
    return null;
  }

  const graphMetadata = isJsonObject(graph.metadata) ? graph.metadata : null;
  const blueprintMetadata = isJsonObject(blueprint.metadata) ? blueprint.metadata : null;
  const fixtureMetadata = isJsonObject(fixtureSet.metadata) ? fixtureSet.metadata : null;
  if (!graphMetadata || !blueprintMetadata || !fixtureMetadata) {
    return null;
  }

  const graphVersion = graphMetadata.graphVersion;
  const blueprintVersion = blueprintMetadata.blueprintVersion;
  const itemFixtureVersion = fixtureMetadata.fixtureSetVersion;
  if (
    graphMetadata.schemaVersion !== "learnika.skillGraphSeed.v1" ||
    graphMetadata.status !== "draft_static_seed" ||
    graphMetadata.subject !== "math" ||
    graphMetadata.locale !== "ru-RU" ||
    !hasExpectedAudienceGrades(graphMetadata) ||
    !isNonEmptyString(graphVersion) ||
    blueprintMetadata.schemaVersion !== "learnika.diagnosticBlueprint.v1" ||
    blueprintMetadata.status !== "draft_static_blueprint" ||
    blueprintMetadata.artifactKind !== "diagnostic_blueprint" ||
    blueprintMetadata.subject !== "math" ||
    blueprintMetadata.locale !== "ru-RU" ||
    !hasExpectedAudienceGrades(blueprintMetadata) ||
    !isNonEmptyString(blueprintVersion) ||
    blueprintMetadata.canonicalSkillGraphVersion !== graphVersion ||
    fixtureMetadata.schemaVersion !== "learnika.diagnosticItemFixtures.v1" ||
    fixtureMetadata.status !== "draft_non_production_fixture_set" ||
    fixtureMetadata.artifactKind !== "diagnostic_item_fixture_set" ||
    fixtureMetadata.subject !== "math" ||
    fixtureMetadata.locale !== "ru-RU" ||
    fixtureMetadata.productionUseAllowed !== false ||
    !isNonEmptyString(itemFixtureVersion) ||
    fixtureMetadata.canonicalSkillGraphVersion !== graphVersion ||
    fixtureMetadata.diagnosticBlueprintVersion !== blueprintVersion
  ) {
    return null;
  }

  const skillsById = buildSkillRegistry(graph);
  if (!skillsById) {
    return null;
  }
  const blueprintSlotsById = buildBlueprintRegistry(blueprint, skillsById);
  if (!blueprintSlotsById) {
    return null;
  }
  const itemFixturesById = buildItemFixtureRegistry(fixtureSet, skillsById, blueprintSlotsById);
  if (!itemFixturesById) {
    return null;
  }

  return {
    blueprintSlotsById,
    itemFixturesById,
    skillsById,
    versions: Object.freeze({
      blueprint: blueprintVersion,
      itemFixtures: itemFixtureVersion,
      skillGraph: graphVersion,
    }),
  };
}

function readRepositoryArtifacts(): DiagnosticCatalogArtifacts {
  const repositoryRoot = path.resolve(__dirname, "..", "..", "..", "..");
  const readJson = (...segments: string[]): unknown =>
    JSON.parse(readFileSync(path.join(repositoryRoot, ...segments), "utf8"));

  return {
    diagnosticBlueprint: readJson(
      "packages",
      "curriculum",
      "diagnostic-blueprints",
      "grade-7-9-math.draft.v1.json",
    ),
    diagnosticItems: readJson(
      "packages",
      "curriculum",
      "diagnostic-items",
      "grade-7-9-math.fixtures.v1.json",
    ),
    skillGraph: readJson("packages", "curriculum", "skill-graph", "grade-7-9-math.seed.v1.json"),
  };
}

function notFound(
  kind: DiagnosticCatalogLookupKind,
  reason: DiagnosticCatalogLookupNotFound["reason"],
): DiagnosticCatalogLookupNotFound {
  return {
    found: false,
    kind,
    metadataOnly: true,
    policyVersion: diagnosticCatalogPolicyVersion,
    reason,
  };
}

@Injectable()
export class DiagnosticCatalogRegistryService {
  private readonly registry: DiagnosticCatalogRegistry | null;

  constructor(artifacts?: DiagnosticCatalogArtifacts | null) {
    this.registry = buildRegistry(artifacts);
  }

  static fromRepository(): DiagnosticCatalogRegistryService {
    try {
      return new DiagnosticCatalogRegistryService(readRepositoryArtifacts());
    } catch {
      return new DiagnosticCatalogRegistryService(null);
    }
  }

  findSkillById(id: string): DiagnosticCatalogLookupResult<DiagnosticSkillProjection> {
    return this.find("SKILL", id, this.registry?.skillsById, cloneSkill);
  }

  findBlueprintSlotById(
    id: string,
  ): DiagnosticCatalogLookupResult<DiagnosticBlueprintSlotProjection> {
    return this.find("BLUEPRINT_SLOT", id, this.registry?.blueprintSlotsById, cloneBlueprintSlot);
  }

  findItemFixtureById(id: string): DiagnosticCatalogLookupResult<DiagnosticItemFixtureProjection> {
    return this.find("ITEM_FIXTURE", id, this.registry?.itemFixturesById, cloneItemFixture);
  }

  private find<TValue>(
    kind: DiagnosticCatalogLookupKind,
    id: string,
    registry: ReadonlyMap<string, TValue> | undefined,
    clone: (value: TValue) => TValue,
  ): DiagnosticCatalogLookupResult<TValue> {
    if (!this.registry || !registry) {
      return notFound(kind, "CATALOG_UNAVAILABLE");
    }
    if (typeof id !== "string" || !registry.has(id)) {
      return notFound(kind, "NOT_FOUND");
    }

    const value = registry.get(id);
    if (!value) {
      return notFound(kind, "NOT_FOUND");
    }
    return {
      artifactVersions: { ...this.registry.versions },
      found: true,
      kind,
      metadataOnly: true,
      policyVersion: diagnosticCatalogPolicyVersion,
      value: clone(value),
    };
  }
}
