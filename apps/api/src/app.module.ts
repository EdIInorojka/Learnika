import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { FamilySetupModule } from "./family-setup/family-setup.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [HealthModule, AuthModule, FamilySetupModule],
})
export class AppModule {}
