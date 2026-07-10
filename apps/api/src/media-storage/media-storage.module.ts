import { Module } from "@nestjs/common";

import { MediaStorageService } from "./media-storage.service";

@Module({
  exports: [MediaStorageService],
  providers: [MediaStorageService],
})
export class MediaStorageModule {}
