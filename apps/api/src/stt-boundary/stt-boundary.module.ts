import { Module } from "@nestjs/common";

import { LocalMockSttProvider, SttBoundaryService } from "./stt-boundary.service";

@Module({
  exports: [SttBoundaryService],
  providers: [LocalMockSttProvider, SttBoundaryService],
})
export class SttBoundaryModule {}
