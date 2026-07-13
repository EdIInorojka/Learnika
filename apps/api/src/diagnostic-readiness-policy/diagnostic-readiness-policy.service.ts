import { Injectable } from "@nestjs/common";

import {
  diagnosticSessionDraftPolicyVersion,
  diagnosticSessionDraftVersion,
} from "../diagnostic-session-draft/diagnostic-session-draft.types";
import {
  diagnosticSessionPlanBlueprintVersion,
  diagnosticSessionPlanPolicyVersion,
  diagnosticSessionPlanVersion,
} from "../diagnostic-session-plan/diagnostic-session-plan.types";
import { DiagnosticSessionStateService } from "../diagnostic-session-state/diagnostic-session-state.service";
import {
  type DiagnosticSessionState,
  diagnosticSessionStatePolicyVersion,
  diagnosticSessionStates,
} from "../diagnostic-session-state/diagnostic-session-state.types";
import {
  type DiagnosticReadinessBlockingReason,
  type DiagnosticReadinessDenied,
  type DiagnosticReadinessDenialReason,
  type DiagnosticReadinessResult,
  diagnosticReadinessEvaluationVersion,
  diagnosticReadinessPolicyVersion,
} from "./diagnostic-readiness-policy.types";

const availableDraftKeys = [
  "available",
  "directActivationGuard",
  "draftVersion",
  "lifecycleState",
  "metadataOnly",
  "plan",
  "planReadiness",
  "policyVersion",
  "productionUseAllowed",
  "reason",
  "runtimeUseAllowed",
  "storageAllowed",
] as const;
const deniedDraftKeys = [
  "available",
  "draftVersion",
  "metadataOnly",
  "policyVersion",
  "productionUseAllowed",
  "reason",
  "runtimeUseAllowed",
  "storageAllowed",
] as const;
const planKeys = [
  "artifactVersions",
  "available",
  "availableItemFixtureCount",
  "blueprintVersion",
  "entries",
  "expectedBlueprintSlotCount",
  "interpretationMode",
  "metadataOnly",
  "missingBlueprintSlotIds",
  "planState",
  "planVersion",
  "policyVersion",
  "productionUseAllowed",
  "reason",
  "runtimeUseAllowed",
  "storageAllowed",
] as const;
const planEntryKeys = [
  "blueprintSlotId",
  "evidenceCategory",
  "gradeBand",
  "itemFixtureId",
  "itemFixtureState",
  "primarySkillId",
  "productionUseAllowed",
  "strand",
  "supportingSkillIds",
] as const;
const knownDraftDenialReasons = new Set([
  "BLUEPRINT_UNKNOWN",
  "CATALOG_REFERENCE_INVALID",
  "CATALOG_UNAVAILABLE",
  "CATALOG_VERSION_MISMATCH",
  "INPUT_INVALID",
  "ORCHESTRATION_UNAVAILABLE",
  "STATE_GUARD_INVALID",
]);
const knownEvidenceCategories = new Set([
  "concept_recognition",
  "multi_step_organization",
  "procedure_selection",
  "reasoning_justification",
  "representation_interpretation",
]);
const knownStrands = new Set(["algebra", "data", "functions", "geometry", "number"]);
const expectedArtifactVersions = {
  blueprint: diagnosticSessionPlanBlueprintVersion,
  itemFixtures: "wave-3.slice-4.grade-7-9-math.v1",
  skillGraph: "wave-3.slice-2.grade-7-9-math.v1",
} as const;
const blueprintSlotIdPattern =
  /^diag\.math\.g7-9\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.v[1-9][0-9]*$/;
const itemFixtureIdPattern =
  /^ditem\.math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.fixture-[0-9]{2}\.v[1-9][0-9]*$/;
const skillIdPattern =
  /^math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.v[1-9][0-9]*$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actualKeys = Object.keys(value);
  return (
    actualKeys.length === keys.length &&
    keys.every((key) => Object.prototype.hasOwnProperty.call(value, key))
  );
}

function isUniqueStringArray(value: unknown, pattern: RegExp): value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return false;
  }
  const strings = value as string[];
  return strings.every((item) => pattern.test(item)) && new Set(strings).size === strings.length;
}

function isGradeBand(value: unknown): boolean {
  return (
    isPlainObject(value) &&
    hasExactKeys(value, ["max", "min"]) &&
    Number.isInteger(value.min) &&
    Number.isInteger(value.max) &&
    Number(value.min) >= 7 &&
    Number(value.max) <= 9 &&
    Number(value.min) <= Number(value.max)
  );
}

function isPlanEntry(value: unknown): value is Record<string, unknown> {
  if (!isPlainObject(value) || !hasExactKeys(value, planEntryKeys)) {
    return false;
  }
  if (
    typeof value.blueprintSlotId !== "string" ||
    !blueprintSlotIdPattern.test(value.blueprintSlotId) ||
    typeof value.evidenceCategory !== "string" ||
    !knownEvidenceCategories.has(value.evidenceCategory) ||
    !isGradeBand(value.gradeBand) ||
    typeof value.primarySkillId !== "string" ||
    !skillIdPattern.test(value.primarySkillId) ||
    value.productionUseAllowed !== false ||
    typeof value.strand !== "string" ||
    !knownStrands.has(value.strand) ||
    !isUniqueStringArray(value.supportingSkillIds, skillIdPattern)
  ) {
    return false;
  }

  if (value.itemFixtureState === "MISSING") {
    return value.itemFixtureId === null;
  }
  return (
    value.itemFixtureState === "DRAFT_NON_PRODUCTION" &&
    typeof value.itemFixtureId === "string" &&
    itemFixtureIdPattern.test(value.itemFixtureId)
  );
}

function isArtifactVersions(value: unknown): boolean {
  return (
    isPlainObject(value) &&
    hasExactKeys(value, ["blueprint", "itemFixtures", "skillGraph"]) &&
    value.blueprint === expectedArtifactVersions.blueprint &&
    value.itemFixtures === expectedArtifactVersions.itemFixtures &&
    value.skillGraph === expectedArtifactVersions.skillGraph
  );
}

function isDirectActivationGuard(value: unknown): boolean {
  return (
    isPlainObject(value) &&
    hasExactKeys(value, [
      "accepted",
      "fromState",
      "metadataOnly",
      "policyVersion",
      "reason",
      "toState",
    ]) &&
    value.accepted === false &&
    value.fromState === "drafted" &&
    value.metadataOnly === true &&
    value.policyVersion === diagnosticSessionStatePolicyVersion &&
    value.reason === "TRANSITION_NOT_ALLOWED" &&
    value.toState === "active"
  );
}

function isKnownLifecycleState(value: unknown): value is DiagnosticSessionState {
  return (
    typeof value === "string" && (diagnosticSessionStates as readonly string[]).includes(value)
  );
}

function isPlan(value: unknown): value is Record<string, unknown> & {
  availableItemFixtureCount: number;
  blueprintVersion: string;
  entries: Record<string, unknown>[];
  expectedBlueprintSlotCount: number;
  missingBlueprintSlotIds: string[];
  planState: "INCOMPLETE" | "READY";
} {
  if (!isPlainObject(value) || !hasExactKeys(value, planKeys)) {
    return false;
  }
  if (
    !isArtifactVersions(value.artifactVersions) ||
    value.available !== true ||
    !Number.isInteger(value.availableItemFixtureCount) ||
    Number(value.availableItemFixtureCount) < 0 ||
    value.blueprintVersion !== diagnosticSessionPlanBlueprintVersion ||
    !Array.isArray(value.entries) ||
    !value.entries.every(isPlanEntry) ||
    !Number.isInteger(value.expectedBlueprintSlotCount) ||
    Number(value.expectedBlueprintSlotCount) <= 0 ||
    value.interpretationMode !== "NONE" ||
    value.metadataOnly !== true ||
    !isUniqueStringArray(value.missingBlueprintSlotIds, blueprintSlotIdPattern) ||
    value.planVersion !== diagnosticSessionPlanVersion ||
    value.policyVersion !== diagnosticSessionPlanPolicyVersion ||
    value.productionUseAllowed !== false ||
    value.runtimeUseAllowed !== false ||
    value.storageAllowed !== false
  ) {
    return false;
  }

  const entries = value.entries as Record<string, unknown>[];
  const missingIds = value.missingBlueprintSlotIds as string[];
  const expectedMissingIds = entries
    .filter((entry) => entry.itemFixtureState === "MISSING")
    .map((entry) => String(entry.blueprintSlotId));
  const availableCount = entries.length - expectedMissingIds.length;
  const stateAndReasonAlign =
    (value.planState === "INCOMPLETE" && value.reason === "INCOMPLETE_COVERAGE") ||
    (value.planState === "READY" && value.reason === "PLAN_READY");

  return (
    stateAndReasonAlign &&
    Number(value.expectedBlueprintSlotCount) === entries.length &&
    Number(value.availableItemFixtureCount) === availableCount &&
    missingIds.length === expectedMissingIds.length &&
    missingIds.every((id, index) => id === expectedMissingIds[index]) &&
    ((value.planState === "INCOMPLETE" && missingIds.length > 0) ||
      (value.planState === "READY" && missingIds.length === 0)) &&
    new Set(entries.map((entry) => entry.blueprintSlotId)).size === entries.length
  );
}

function isAvailableDraft(value: Record<string, unknown>): value is Record<string, unknown> & {
  lifecycleState: DiagnosticSessionState;
  plan: ReturnTypePlan;
  planReadiness: "INCOMPLETE" | "READY";
} {
  if (!hasExactKeys(value, availableDraftKeys) || !isPlan(value.plan)) {
    return false;
  }
  const plan = value.plan;
  return (
    value.available === true &&
    isDirectActivationGuard(value.directActivationGuard) &&
    value.draftVersion === diagnosticSessionDraftVersion &&
    isKnownLifecycleState(value.lifecycleState) &&
    value.metadataOnly === true &&
    value.planReadiness === plan.planState &&
    value.policyVersion === diagnosticSessionDraftPolicyVersion &&
    value.productionUseAllowed === false &&
    value.runtimeUseAllowed === false &&
    value.storageAllowed === false &&
    ((value.planReadiness === "INCOMPLETE" && value.reason === "DRAFT_PREVIEW_INCOMPLETE") ||
      (value.planReadiness === "READY" && value.reason === "DRAFT_PREVIEW_READY"))
  );
}

type ReturnTypePlan = Record<string, unknown> & {
  availableItemFixtureCount: number;
  blueprintVersion: string;
  entries: Record<string, unknown>[];
  expectedBlueprintSlotCount: number;
  missingBlueprintSlotIds: string[];
  planState: "INCOMPLETE" | "READY";
};

function isDeniedDraft(value: Record<string, unknown>): boolean {
  return (
    hasExactKeys(value, deniedDraftKeys) &&
    value.available === false &&
    value.draftVersion === diagnosticSessionDraftVersion &&
    value.metadataOnly === true &&
    value.policyVersion === diagnosticSessionDraftPolicyVersion &&
    value.productionUseAllowed === false &&
    typeof value.reason === "string" &&
    knownDraftDenialReasons.has(value.reason) &&
    value.runtimeUseAllowed === false &&
    value.storageAllowed === false
  );
}

function denial(reason: DiagnosticReadinessDenialReason): DiagnosticReadinessDenied {
  return {
    evaluated: false,
    evaluationVersion: diagnosticReadinessEvaluationVersion,
    metadataOnly: true,
    policyVersion: diagnosticReadinessPolicyVersion,
    productionUseAllowed: false,
    reason,
    runtimeUseAllowed: false,
    storageAllowed: false,
  };
}

@Injectable()
export class DiagnosticReadinessPolicyService {
  constructor(private readonly stateService: DiagnosticSessionStateService) {}

  evaluateDraft(draft: unknown): DiagnosticReadinessResult {
    try {
      if (!isPlainObject(draft) || typeof draft.available !== "boolean") {
        return denial("DRAFT_INPUT_INVALID");
      }

      const expectedKeys = draft.available ? availableDraftKeys : deniedDraftKeys;
      if (!hasExactKeys(draft, expectedKeys)) {
        return denial("DRAFT_INPUT_INVALID");
      }
      if (typeof draft.draftVersion !== "string") {
        return denial("DRAFT_INPUT_INVALID");
      }
      if (draft.draftVersion !== diagnosticSessionDraftVersion) {
        return denial("DRAFT_VERSION_UNKNOWN");
      }
      if (!draft.available) {
        return isDeniedDraft(draft) ? denial("DRAFT_UNAVAILABLE") : denial("DRAFT_INPUT_INVALID");
      }
      if (!isAvailableDraft(draft)) {
        return denial("DRAFT_INPUT_INVALID");
      }

      const blockingReasons: DiagnosticReadinessBlockingReason[] = [];
      let lifecycleTransitionAllowed = false;
      if (draft.lifecycleState !== "drafted") {
        blockingReasons.push("LIFECYCLE_NOT_DRAFTED");
      } else {
        const transition = this.stateService.transition({
          fromState: draft.lifecycleState,
          toState: "ready",
        });
        lifecycleTransitionAllowed =
          transition.accepted &&
          transition.fromState === "drafted" &&
          transition.toState === "ready";
        if (!lifecycleTransitionAllowed) {
          blockingReasons.push("LIFECYCLE_TRANSITION_BLOCKED");
        }
      }

      const gapCount = draft.plan.missingBlueprintSlotIds.length;
      if (draft.planReadiness !== "READY" || gapCount > 0) {
        blockingReasons.push("INCOMPLETE_COVERAGE");
      }
      if (
        draft.plan.entries.some(
          (entry) =>
            entry.itemFixtureState === "DRAFT_NON_PRODUCTION" &&
            entry.productionUseAllowed === false,
        )
      ) {
        blockingReasons.push("NON_PRODUCTION_FIXTURES");
      }

      const eligibleForReadyTransition = blockingReasons.length === 0;
      return {
        availableItemFixtureCount: draft.plan.availableItemFixtureCount,
        blockingReasons,
        blueprintVersion: draft.plan.blueprintVersion,
        eligibleForReadyTransition,
        evaluated: true,
        evaluationVersion: diagnosticReadinessEvaluationVersion,
        expectedBlueprintSlotCount: draft.plan.expectedBlueprintSlotCount,
        gapCount,
        lifecycleState: draft.lifecycleState,
        lifecycleTransitionAllowed,
        metadataOnly: true,
        policyVersion: diagnosticReadinessPolicyVersion,
        productionUseAllowed: false,
        readiness: eligibleForReadyTransition ? "READY" : "NOT_READY",
        runtimeUseAllowed: false,
        storageAllowed: false,
      };
    } catch {
      return denial("POLICY_UNAVAILABLE");
    }
  }
}
