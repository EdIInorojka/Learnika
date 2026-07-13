import { Module } from "@nestjs/common";

import { DiagnosticCatalogModule } from "../diagnostic-catalog/diagnostic-catalog.module";
import { DiagnosticSessionPlanService } from "./diagnostic-session-plan.service";

@Module({
  exports: [DiagnosticSessionPlanService],
  imports: [DiagnosticCatalogModule],
  providers: [DiagnosticSessionPlanService],
})
export class DiagnosticSessionPlanModule {}
