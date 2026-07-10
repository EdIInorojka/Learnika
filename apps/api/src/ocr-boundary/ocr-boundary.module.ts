import { Module } from "@nestjs/common";

import { LocalMockOcrProvider, OcrBoundaryService } from "./ocr-boundary.service";

@Module({
  exports: [OcrBoundaryService],
  providers: [LocalMockOcrProvider, OcrBoundaryService],
})
export class OcrBoundaryModule {}
