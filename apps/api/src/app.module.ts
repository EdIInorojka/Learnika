import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { FamilySetupModule } from "./family-setup/family-setup.module";
import { HealthModule } from "./health/health.module";
import { HomeworkModule } from "./homework/homework.module";
import { MediaAssetsModule } from "./media-assets/media-assets.module";

@Module({
  imports: [HealthModule, AuthModule, FamilySetupModule, HomeworkModule, MediaAssetsModule],
})
export class AppModule {}
