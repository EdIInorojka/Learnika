import type {
  DiagnosticSessionPlanAvailable,
  DiagnosticSessionPlanDenialReason,
} from "../diagnostic-session-plan/diagnostic-session-plan.types";
import type { DiagnosticSessionTransitionDenied } from "../diagnostic-session-state/diagnostic-session-state.types";

export const diagnosticSessionDraftPolicyVersion = "wave-3-slice-10-diagnostic-session-draft-v1";
export const diagnosticSessionDraftVersion = "wave-3.slice-10.grade-7-9-math.v1";

export interface DiagnosticSessionDraftInput {
  readonly blueprintVersion: string;
}

export interface DiagnosticSessionDraftAvailable {
  readonly available: true;
  readonly directActivationGuard: DiagnosticSessionTransitionDenied;
  readonly draftVersion: typeof diagnosticSessionDraftVersion;
  readonly lifecycleState: "drafted";
  readonly metadataOnly: true;
  readonly plan: DiagnosticSessionPlanAvailable;
  readonly planReadiness: "INCOMPLETE" | "READY";
  readonly policyVersion: typeof diagnosticSessionDraftPolicyVersion;
  readonly productionUseAllowed: false;
  readonly reason: "DRAFT_PREVIEW_INCOMPLETE" | "DRAFT_PREVIEW_READY";
  readonly runtimeUseAllowed: false;
  readonly storageAllowed: false;
}

export type DiagnosticSessionDraftDenialReason =
  DiagnosticSessionPlanDenialReason | "ORCHESTRATION_UNAVAILABLE" | "STATE_GUARD_INVALID";

export interface DiagnosticSessionDraftDenied {
  readonly available: false;
  readonly draftVersion: typeof diagnosticSessionDraftVersion;
  readonly metadataOnly: true;
  readonly policyVersion: typeof diagnosticSessionDraftPolicyVersion;
  readonly productionUseAllowed: false;
  readonly reason: DiagnosticSessionDraftDenialReason;
  readonly runtimeUseAllowed: false;
  readonly storageAllowed: false;
}

export type DiagnosticSessionDraftResult =
  DiagnosticSessionDraftAvailable | DiagnosticSessionDraftDenied;
