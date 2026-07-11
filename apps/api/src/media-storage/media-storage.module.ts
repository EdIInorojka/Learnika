import { Module } from "@nestjs/common";

import { LocalMediaObjectStorageService } from "./local-media-object-storage.service";
import { MediaStorageService } from "./media-storage.service";

@Module({
  exports: [LocalMediaObjectStorageService, MediaStorageService],
  providers: [
    {
      provide: LocalMediaObjectStorageService,
      useFactory: () => new LocalMediaObjectStorageService(),
    },
    {
      provide: MediaStorageService,
      useFactory: () => new MediaStorageService(),
    },
  ],
})
export class MediaStorageModule {}
