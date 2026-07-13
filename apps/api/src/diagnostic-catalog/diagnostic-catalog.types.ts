export const diagnosticCatalogPolicyVersion = "wave-3-slice-8-diagnostic-catalog-v1";

export type DiagnosticCatalogLookupKind = "BLUEPRINT_SLOT" | "ITEM_FIXTURE" | "SKILL";

export type DiagnosticCatalogStrand = "algebra" | "data" | "functions" | "geometry" | "number";

export interface DiagnosticCatalogGradeBand {
  readonly max: number;
  readonly min: number;
}

export interface DiagnosticCatalogArtifactVersions {
  readonly blueprint: string;
  readonly itemFixtures: string;
  readonly skillGraph: string;
}

export interface DiagnosticCatalogArtifacts {
  readonly diagnosticBlueprint: unknown;
  readonly diagnosticItems: unknown;
  readonly skillGraph: unknown;
}

export interface DiagnosticSkillProjection {
  readonly gradeBand: DiagnosticCatalogGradeBand;
  readonly id: string;
  readonly prerequisiteIds: readonly string[];
  readonly shortDescription: string;
  readonly strand: DiagnosticCatalogStrand;
  readonly title: string;
}

export interface DiagnosticBlueprintSlotProjection {
  readonly coverageStatus: string;
  readonly difficultyBand: string;
  readonly evidenceCategory: string;
  readonly gradeBand: DiagnosticCatalogGradeBand;
  readonly id: string;
  readonly primarySkillId: string;
  readonly status: "draft_slot";
  readonly strand: DiagnosticCatalogStrand;
  readonly supportingSkillIds: readonly string[];
}

export interface DiagnosticItemFixtureProjection {
  readonly blueprintSlotId: string;
  readonly contentOrigin: "original_minimal_fixture";
  readonly coverageStatus: string;
  readonly evidenceCategory: string;
  readonly gradeBand: DiagnosticCatalogGradeBand;
  readonly id: string;
  readonly primarySkillId: string;
  readonly productionUseAllowed: false;
  readonly status: "draft_non_production_fixture";
  readonly strand: DiagnosticCatalogStrand;
  readonly supportingSkillIds: readonly string[];
}

export interface DiagnosticCatalogLookupFound<TValue> {
  readonly artifactVersions: DiagnosticCatalogArtifactVersions;
  readonly found: true;
  readonly kind: DiagnosticCatalogLookupKind;
  readonly metadataOnly: true;
  readonly policyVersion: typeof diagnosticCatalogPolicyVersion;
  readonly value: TValue;
}

export interface DiagnosticCatalogLookupNotFound {
  readonly found: false;
  readonly kind: DiagnosticCatalogLookupKind;
  readonly metadataOnly: true;
  readonly policyVersion: typeof diagnosticCatalogPolicyVersion;
  readonly reason: "CATALOG_UNAVAILABLE" | "NOT_FOUND";
}

export type DiagnosticCatalogLookupResult<TValue> =
  DiagnosticCatalogLookupFound<TValue> | DiagnosticCatalogLookupNotFound;
