import { Module } from "@nestjs/common";

import { AuthorizationModule } from "../authorization/authorization.module";
import { DatabaseModule } from "../database/database.module";
import { MediaStorageModule } from "../media-storage/media-storage.module";
import { MockOcrProcessingModule } from "../mock-ocr-processing/mock-ocr-processing.module";
import { MediaAssetUploadController } from "./media-asset-upload.controller";
import { MediaAssetUploadService } from "./media-asset-upload.service";
import { MediaAssetsController } from "./media-assets.controller";
import { MediaAssetsService } from "./media-assets.service";
import { MockOcrCandidateService } from "./mock-ocr-candidate.service";

@Module({
  controllers: [MediaAssetsController, MediaAssetUploadController],
  imports: [AuthorizationModule, DatabaseModule, MediaStorageModule, MockOcrProcessingModule],
  providers: [MediaAssetsService, MediaAssetUploadService, MockOcrCandidateService],
})
export class MediaAssetsModule {}
