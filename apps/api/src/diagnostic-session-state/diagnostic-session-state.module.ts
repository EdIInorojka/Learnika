import { Module } from "@nestjs/common";

import { DiagnosticSessionStateService } from "./diagnostic-session-state.service";

@Module({
  exports: [DiagnosticSessionStateService],
  providers: [DiagnosticSessionStateService],
})
export class DiagnosticSessionStateModule {}
