import { Module } from "@nestjs/common";

import { DiagnosticSessionPlanModule } from "../diagnostic-session-plan/diagnostic-session-plan.module";
import { DiagnosticSessionStateModule } from "../diagnostic-session-state/diagnostic-session-state.module";
import { DiagnosticSessionDraftService } from "./diagnostic-session-draft.service";

@Module({
  exports: [DiagnosticSessionDraftService],
  imports: [DiagnosticSessionPlanModule, DiagnosticSessionStateModule],
  providers: [DiagnosticSessionDraftService],
})
export class DiagnosticSessionDraftModule {}
