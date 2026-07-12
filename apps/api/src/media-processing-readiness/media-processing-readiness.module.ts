import { Module } from "@nestjs/common";

import { MediaStorageModule } from "../media-storage/media-storage.module";
import { MediaProcessingReadinessService } from "./media-processing-readiness.service";

@Module({
  exports: [MediaProcessingReadinessService],
  imports: [MediaStorageModule],
  providers: [MediaProcessingReadinessService],
})
export class MediaProcessingReadinessModule {}
