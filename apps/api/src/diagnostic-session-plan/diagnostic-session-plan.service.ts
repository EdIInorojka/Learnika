import { Injectable } from "@nestjs/common";

import { DiagnosticCatalogRegistryService } from "../diagnostic-catalog/diagnostic-catalog.service";
import type {
  DiagnosticBlueprintSlotProjection,
  DiagnosticCatalogArtifactVersions,
  DiagnosticCatalogLookupNotFound,
  DiagnosticItemFixtureProjection,
} from "../diagnostic-catalog/diagnostic-catalog.types";
import {
  type DiagnosticSessionPlanDenied,
  type DiagnosticSessionPlanDenialReason,
  type DiagnosticSessionPlanEntry,
  type DiagnosticSessionPlanInput,
  type DiagnosticSessionPlanResult,
  diagnosticSessionPlanBlueprintVersion,
  diagnosticSessionPlanPolicyVersion,
  diagnosticSessionPlanVersion,
} from "./diagnostic-session-plan.types";

interface BlueprintSlotFixtureReference {
  readonly blueprintSlotId: string;
  readonly itemFixtureId: string | null;
}

interface ResolvedPlanEntry {
  readonly resolved: true;
  readonly value: DiagnosticSessionPlanEntry;
}

interface UnresolvedPlanEntry {
  readonly reason: DiagnosticSessionPlanDenialReason;
  readonly resolved: false;
}

type PlanEntryResolution = ResolvedPlanEntry | UnresolvedPlanEntry;

const expectedArtifactVersions: DiagnosticCatalogArtifactVersions = Object.freeze({
  blueprint: diagnosticSessionPlanBlueprintVersion,
  itemFixtures: "wave-3.slice-4.grade-7-9-math.v1",
  skillGraph: "wave-3.slice-2.grade-7-9-math.v1",
});

const blueprintSlotFixtureReferences = Object.freeze([
  {
    blueprintSlotId: "diag.math.g7-9.number.rational-number-operations.v1",
    itemFixtureId: "ditem.math.number.rational-number-operations.fixture-01.v1",
  },
  {
    blueprintSlotId: "diag.math.g7-9.number.percent-ratio.v1",
    itemFixtureId: null,
  },
  {
    blueprintSlotId: "diag.math.g7-9.algebra.expression-transformations.v1",
    itemFixtureId: "ditem.math.algebra.expression-transformations.fixture-01.v1",
  },
  {
    blueprintSlotId: "diag.math.g7-9.algebra.linear-equation-one-variable.v1",
    itemFixtureId: null,
  },
  {
    blueprintSlotId: "diag.math.g7-9.algebra.powers-and-roots.v1",
    itemFixtureId: null,
  },
  {
    blueprintSlotId: "diag.math.g7-9.functions.coordinate-plane-graphs.v1",
    itemFixtureId: "ditem.math.functions.coordinate-plane-graphs.fixture-01.v1",
  },
  {
    blueprintSlotId: "diag.math.g7-9.functions.linear-function.v1",
    itemFixtureId: null,
  },
  {
    blueprintSlotId: "diag.math.g7-9.geometry.basic-objects-angles.v1",
    itemFixtureId: null,
  },
  {
    blueprintSlotId: "diag.math.g7-9.geometry.triangle-properties.v1",
    itemFixtureId: null,
  },
  {
    blueprintSlotId: "diag.math.g7-9.geometry.parallel-lines.v1",
    itemFixtureId: "ditem.math.geometry.parallel-lines.fixture-01.v1",
  },
  {
    blueprintSlotId: "diag.math.g7-9.data.probability-statistics-basic.v1",
    itemFixtureId: "ditem.math.data.probability-statistics-basic.fixture-01.v1",
  },
] as const satisfies readonly BlueprintSlotFixtureReference[]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlanInput(value: unknown): value is DiagnosticSessionPlanInput {
  if (!isPlainObject(value)) {
    return false;
  }
  const keys = Object.keys(value);
  return (
    keys.length === 1 &&
    keys[0] === "blueprintVersion" &&
    typeof value.blueprintVersion === "string" &&
    value.blueprintVersion.trim().length > 0
  );
}

function versionsMatch(versions: DiagnosticCatalogArtifactVersions): boolean {
  return (
    versions.blueprint === expectedArtifactVersions.blueprint &&
    versions.itemFixtures === expectedArtifactVersions.itemFixtures &&
    versions.skillGraph === expectedArtifactVersions.skillGraph
  );
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameGradeBand(
  left: DiagnosticBlueprintSlotProjection["gradeBand"],
  right: DiagnosticItemFixtureProjection["gradeBand"],
): boolean {
  return left.min === right.min && left.max === right.max;
}

function catalogDenialReason(
  reason: DiagnosticCatalogLookupNotFound["reason"],
): DiagnosticSessionPlanDenialReason {
  return reason === "CATALOG_UNAVAILABLE" ? "CATALOG_UNAVAILABLE" : "CATALOG_REFERENCE_INVALID";
}

function denial(reason: DiagnosticSessionPlanDenialReason): DiagnosticSessionPlanDenied {
  return {
    available: false,
    metadataOnly: true,
    planVersion: diagnosticSessionPlanVersion,
    policyVersion: diagnosticSessionPlanPolicyVersion,
    productionUseAllowed: false,
    reason,
    runtimeUseAllowed: false,
    storageAllowed: false,
  };
}

@Injectable()
export class DiagnosticSessionPlanService {
  constructor(private readonly catalog: DiagnosticCatalogRegistryService) {}

  buildPlan(input: DiagnosticSessionPlanInput | null | undefined): DiagnosticSessionPlanResult {
    if (!isPlanInput(input)) {
      return denial("INPUT_INVALID");
    }
    if (input.blueprintVersion !== diagnosticSessionPlanBlueprintVersion) {
      return denial("BLUEPRINT_UNKNOWN");
    }

    try {
      const entries: DiagnosticSessionPlanEntry[] = [];
      for (const reference of blueprintSlotFixtureReferences) {
        const resolution = this.resolveEntry(reference);
        if (!resolution.resolved) {
          return denial(resolution.reason);
        }
        entries.push(resolution.value);
      }

      const missingBlueprintSlotIds = entries
        .filter((entry) => entry.itemFixtureId === null)
        .map((entry) => entry.blueprintSlotId);
      const isReady = missingBlueprintSlotIds.length === 0;

      return {
        artifactVersions: { ...expectedArtifactVersions },
        available: true,
        availableItemFixtureCount: entries.length - missingBlueprintSlotIds.length,
        blueprintVersion: diagnosticSessionPlanBlueprintVersion,
        entries,
        expectedBlueprintSlotCount: entries.length,
        interpretationMode: "NONE",
        metadataOnly: true,
        missingBlueprintSlotIds,
        planState: isReady ? "READY" : "INCOMPLETE",
        planVersion: diagnosticSessionPlanVersion,
        policyVersion: diagnosticSessionPlanPolicyVersion,
        productionUseAllowed: false,
        reason: isReady ? "PLAN_READY" : "INCOMPLETE_COVERAGE",
        runtimeUseAllowed: false,
        storageAllowed: false,
      };
    } catch {
      return denial("CATALOG_UNAVAILABLE");
    }
  }

  private resolveEntry(reference: BlueprintSlotFixtureReference): PlanEntryResolution {
    const slotLookup = this.catalog.findBlueprintSlotById(reference.blueprintSlotId);
    if (!slotLookup.found) {
      return { reason: catalogDenialReason(slotLookup.reason), resolved: false };
    }
    if (!versionsMatch(slotLookup.artifactVersions)) {
      return { reason: "CATALOG_VERSION_MISMATCH", resolved: false };
    }

    const slot = slotLookup.value;
    const skillIds = [slot.primarySkillId, ...slot.supportingSkillIds];
    for (const skillId of skillIds) {
      const skillLookup = this.catalog.findSkillById(skillId);
      if (!skillLookup.found) {
        return { reason: catalogDenialReason(skillLookup.reason), resolved: false };
      }
      if (!versionsMatch(skillLookup.artifactVersions)) {
        return { reason: "CATALOG_VERSION_MISMATCH", resolved: false };
      }
      if (skillLookup.value.id !== skillId) {
        return { reason: "CATALOG_REFERENCE_INVALID", resolved: false };
      }
    }

    if (reference.itemFixtureId === null) {
      return {
        resolved: true,
        value: this.toEntry(slot, null),
      };
    }

    const itemLookup = this.catalog.findItemFixtureById(reference.itemFixtureId);
    if (!itemLookup.found) {
      return { reason: catalogDenialReason(itemLookup.reason), resolved: false };
    }
    if (!versionsMatch(itemLookup.artifactVersions)) {
      return { reason: "CATALOG_VERSION_MISMATCH", resolved: false };
    }
    if (!this.itemMatchesSlot(itemLookup.value, slot, reference.itemFixtureId)) {
      return { reason: "CATALOG_REFERENCE_INVALID", resolved: false };
    }

    return {
      resolved: true,
      value: this.toEntry(slot, itemLookup.value.id),
    };
  }

  private itemMatchesSlot(
    item: DiagnosticItemFixtureProjection,
    slot: DiagnosticBlueprintSlotProjection,
    expectedItemId: string,
  ): boolean {
    return (
      item.id === expectedItemId &&
      item.blueprintSlotId === slot.id &&
      item.primarySkillId === slot.primarySkillId &&
      sameStrings(item.supportingSkillIds, slot.supportingSkillIds) &&
      item.strand === slot.strand &&
      item.evidenceCategory === slot.evidenceCategory &&
      sameGradeBand(item.gradeBand, slot.gradeBand) &&
      item.status === "draft_non_production_fixture" &&
      item.productionUseAllowed === false
    );
  }

  private toEntry(
    slot: DiagnosticBlueprintSlotProjection,
    itemFixtureId: string | null,
  ): DiagnosticSessionPlanEntry {
    return {
      blueprintSlotId: slot.id,
      evidenceCategory: slot.evidenceCategory,
      gradeBand: { ...slot.gradeBand },
      itemFixtureId,
      itemFixtureState: itemFixtureId === null ? "MISSING" : "DRAFT_NON_PRODUCTION",
      primarySkillId: slot.primarySkillId,
      productionUseAllowed: false,
      strand: slot.strand,
      supportingSkillIds: [...slot.supportingSkillIds],
    };
  }
}
