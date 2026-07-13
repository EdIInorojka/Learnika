import { Injectable } from "@nestjs/common";

import { DiagnosticSessionPlanService } from "../diagnostic-session-plan/diagnostic-session-plan.service";
import { DiagnosticSessionStateService } from "../diagnostic-session-state/diagnostic-session-state.service";
import {
  type DiagnosticSessionDraftDenied,
  type DiagnosticSessionDraftDenialReason,
  type DiagnosticSessionDraftInput,
  type DiagnosticSessionDraftResult,
  diagnosticSessionDraftPolicyVersion,
  diagnosticSessionDraftVersion,
} from "./diagnostic-session-draft.types";

function denial(reason: DiagnosticSessionDraftDenialReason): DiagnosticSessionDraftDenied {
  return {
    available: false,
    draftVersion: diagnosticSessionDraftVersion,
    metadataOnly: true,
    policyVersion: diagnosticSessionDraftPolicyVersion,
    productionUseAllowed: false,
    reason,
    runtimeUseAllowed: false,
    storageAllowed: false,
  };
}

@Injectable()
export class DiagnosticSessionDraftService {
  constructor(
    private readonly planService: DiagnosticSessionPlanService,
    private readonly stateService: DiagnosticSessionStateService,
  ) {}

  previewDraft(
    input: DiagnosticSessionDraftInput | null | undefined,
  ): DiagnosticSessionDraftResult {
    try {
      const plan = this.planService.buildPlan(input);
      if (!plan.available) {
        return denial(plan.reason);
      }

      const directActivationGuard = this.stateService.transition({
        fromState: "drafted",
        toState: "active",
      });
      if (
        directActivationGuard.accepted ||
        directActivationGuard.reason !== "TRANSITION_NOT_ALLOWED"
      ) {
        return denial("STATE_GUARD_INVALID");
      }

      const isReady = plan.planState === "READY";
      return {
        available: true,
        directActivationGuard,
        draftVersion: diagnosticSessionDraftVersion,
        lifecycleState: "drafted",
        metadataOnly: true,
        plan,
        planReadiness: plan.planState,
        policyVersion: diagnosticSessionDraftPolicyVersion,
        productionUseAllowed: false,
        reason: isReady ? "DRAFT_PREVIEW_READY" : "DRAFT_PREVIEW_INCOMPLETE",
        runtimeUseAllowed: false,
        storageAllowed: false,
      };
    } catch {
      return denial("ORCHESTRATION_UNAVAILABLE");
    }
  }
}
