import type {
  DiagnosticCatalogArtifactVersions,
  DiagnosticCatalogGradeBand,
  DiagnosticCatalogStrand,
} from "../diagnostic-catalog/diagnostic-catalog.types";

export const diagnosticSessionPlanPolicyVersion = "wave-3-slice-9-diagnostic-session-plan-v1";
export const diagnosticSessionPlanVersion = "wave-3.slice-9.grade-7-9-math.v1";
export const diagnosticSessionPlanBlueprintVersion = "wave-3.slice-3.grade-7-9-math.v1";

export interface DiagnosticSessionPlanInput {
  readonly blueprintVersion: string;
}

export type DiagnosticSessionPlanItemFixtureState = "DRAFT_NON_PRODUCTION" | "MISSING";

export interface DiagnosticSessionPlanEntry {
  readonly blueprintSlotId: string;
  readonly evidenceCategory: string;
  readonly gradeBand: DiagnosticCatalogGradeBand;
  readonly itemFixtureId: string | null;
  readonly itemFixtureState: DiagnosticSessionPlanItemFixtureState;
  readonly primarySkillId: string;
  readonly productionUseAllowed: false;
  readonly strand: DiagnosticCatalogStrand;
  readonly supportingSkillIds: readonly string[];
}

export interface DiagnosticSessionPlanAvailable {
  readonly artifactVersions: DiagnosticCatalogArtifactVersions;
  readonly available: true;
  readonly availableItemFixtureCount: number;
  readonly blueprintVersion: typeof diagnosticSessionPlanBlueprintVersion;
  readonly entries: readonly DiagnosticSessionPlanEntry[];
  readonly expectedBlueprintSlotCount: number;
  readonly interpretationMode: "NONE";
  readonly metadataOnly: true;
  readonly missingBlueprintSlotIds: readonly string[];
  readonly planState: "INCOMPLETE" | "READY";
  readonly planVersion: typeof diagnosticSessionPlanVersion;
  readonly policyVersion: typeof diagnosticSessionPlanPolicyVersion;
  readonly productionUseAllowed: false;
  readonly reason: "INCOMPLETE_COVERAGE" | "PLAN_READY";
  readonly runtimeUseAllowed: false;
  readonly storageAllowed: false;
}

export type DiagnosticSessionPlanDenialReason =
  | "BLUEPRINT_UNKNOWN"
  | "CATALOG_REFERENCE_INVALID"
  | "CATALOG_UNAVAILABLE"
  | "CATALOG_VERSION_MISMATCH"
  | "INPUT_INVALID";

export interface DiagnosticSessionPlanDenied {
  readonly available: false;
  readonly metadataOnly: true;
  readonly planVersion: typeof diagnosticSessionPlanVersion;
  readonly policyVersion: typeof diagnosticSessionPlanPolicyVersion;
  readonly productionUseAllowed: false;
  readonly reason: DiagnosticSessionPlanDenialReason;
  readonly runtimeUseAllowed: false;
  readonly storageAllowed: false;
}

export type DiagnosticSessionPlanResult =
  DiagnosticSessionPlanAvailable | DiagnosticSessionPlanDenied;
