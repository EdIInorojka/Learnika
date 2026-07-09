import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthorizationModule } from "../authorization/authorization.module";
import { DatabaseModule } from "../database/database.module";
import { FamilySetupController } from "./family-setup.controller";
import { FamilySetupService } from "./family-setup.service";

@Module({
  controllers: [FamilySetupController],
  imports: [AuditModule, AuthorizationModule, DatabaseModule],
  providers: [FamilySetupService],
})
export class FamilySetupModule {}
