import { Module } from "@nestjs/common";

import { AuthorizationModule } from "../authorization/authorization.module";
import { DatabaseModule } from "../database/database.module";
import { FamilySetupController } from "./family-setup.controller";
import { FamilySetupService } from "./family-setup.service";

@Module({
  controllers: [FamilySetupController],
  imports: [AuthorizationModule, DatabaseModule],
  providers: [FamilySetupService],
})
export class FamilySetupModule {}
