import { Module } from "@nestjs/common";

import { MediaLifecycleService } from "./media-lifecycle.service";

@Module({
  exports: [MediaLifecycleService],
  providers: [MediaLifecycleService],
})
export class MediaLifecycleModule {}
