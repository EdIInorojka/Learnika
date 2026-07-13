import { Module } from "@nestjs/common";

import { DiagnosticSessionStateModule } from "../diagnostic-session-state/diagnostic-session-state.module";
import { DiagnosticReadinessPolicyService } from "./diagnostic-readiness-policy.service";

@Module({
  exports: [DiagnosticReadinessPolicyService],
  imports: [DiagnosticSessionStateModule],
  providers: [DiagnosticReadinessPolicyService],
})
export class DiagnosticReadinessPolicyModule {}
