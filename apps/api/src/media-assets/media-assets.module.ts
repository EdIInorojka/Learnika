import { Module } from "@nestjs/common";

import { AuthorizationModule } from "../authorization/authorization.module";
import { DatabaseModule } from "../database/database.module";
import { MediaStorageModule } from "../media-storage/media-storage.module";
import { MediaAssetsController } from "./media-assets.controller";
import { MediaAssetsService } from "./media-assets.service";

@Module({
  controllers: [MediaAssetsController],
  imports: [AuthorizationModule, DatabaseModule, MediaStorageModule],
  providers: [MediaAssetsService],
})
export class MediaAssetsModule {}
