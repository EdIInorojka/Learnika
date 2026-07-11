import { Module } from "@nestjs/common";

import { AuthorizationModule } from "../authorization/authorization.module";
import { DatabaseModule } from "../database/database.module";
import { MediaStorageModule } from "../media-storage/media-storage.module";
import { MediaAssetUploadController } from "./media-asset-upload.controller";
import { MediaAssetUploadService } from "./media-asset-upload.service";
import { MediaAssetsController } from "./media-assets.controller";
import { MediaAssetsService } from "./media-assets.service";

@Module({
  controllers: [MediaAssetsController, MediaAssetUploadController],
  imports: [AuthorizationModule, DatabaseModule, MediaStorageModule],
  providers: [MediaAssetsService, MediaAssetUploadService],
})
export class MediaAssetsModule {}
