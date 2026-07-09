import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { FamilySetupController } from "./family-setup.controller";
import { FamilySetupService } from "./family-setup.service";

@Module({
  controllers: [FamilySetupController],
  imports: [AuthModule, DatabaseModule],
  providers: [FamilySetupService],
})
export class FamilySetupModule {}
