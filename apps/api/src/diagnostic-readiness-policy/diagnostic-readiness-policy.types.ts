import type { DiagnosticSessionState } from "../diagnostic-session-state/diagnostic-session-state.types";

export const diagnosticReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
export const diagnosticReadinessEvaluationVersion = "wave-3.slice-11.grade-7-9-math.v1";

export type DiagnosticReadinessBlockingReason =
  | "INCOMPLETE_COVERAGE"
  | "LIFECYCLE_NOT_DRAFTED"
  | "LIFECYCLE_TRANSITION_BLOCKED"
  | "NON_PRODUCTION_FIXTURES";

export interface DiagnosticReadinessEvaluated {
  readonly availableItemFixtureCount: number;
  readonly blockingReasons: readonly DiagnosticReadinessBlockingReason[];
  readonly blueprintVersion: string;
  readonly eligibleForReadyTransition: boolean;
  readonly evaluated: true;
  readonly evaluationVersion: typeof diagnosticReadinessEvaluationVersion;
  readonly expectedBlueprintSlotCount: number;
  readonly gapCount: number;
  readonly lifecycleState: DiagnosticSessionState;
  readonly lifecycleTransitionAllowed: boolean;
  readonly metadataOnly: true;
  readonly policyVersion: typeof diagnosticReadinessPolicyVersion;
  readonly productionUseAllowed: false;
  readonly readiness: "NOT_READY" | "READY";
  readonly runtimeUseAllowed: false;
  readonly storageAllowed: false;
}

export type DiagnosticReadinessDenialReason =
  "DRAFT_INPUT_INVALID" | "DRAFT_UNAVAILABLE" | "DRAFT_VERSION_UNKNOWN" | "POLICY_UNAVAILABLE";

export interface DiagnosticReadinessDenied {
  readonly evaluated: false;
  readonly evaluationVersion: typeof diagnosticReadinessEvaluationVersion;
  readonly metadataOnly: true;
  readonly policyVersion: typeof diagnosticReadinessPolicyVersion;
  readonly productionUseAllowed: false;
  readonly reason: DiagnosticReadinessDenialReason;
  readonly runtimeUseAllowed: false;
  readonly storageAllowed: false;
}

export type DiagnosticReadinessResult = DiagnosticReadinessDenied | DiagnosticReadinessEvaluated;
