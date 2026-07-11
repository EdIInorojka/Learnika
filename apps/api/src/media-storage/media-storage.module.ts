import { Module } from "@nestjs/common";

import { MediaStorageService } from "./media-storage.service";

@Module({
  exports: [MediaStorageService],
  providers: [
    {
      provide: MediaStorageService,
      useFactory: () => new MediaStorageService(),
    },
  ],
})
export class MediaStorageModule {}
