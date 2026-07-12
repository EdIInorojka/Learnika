import { Module } from "@nestjs/common";

import { MediaProcessingReadinessService } from "../media-processing-readiness/media-processing-readiness.service";
import { OcrBoundaryService } from "../ocr-boundary/ocr-boundary.service";
import { MockOcrProcessingOrchestrationService } from "./mock-ocr-processing.service";

@Module({
  exports: [MockOcrProcessingOrchestrationService],
  providers: [
    {
      provide: MediaProcessingReadinessService,
      useFactory: () => new MediaProcessingReadinessService(),
    },
    {
      provide: OcrBoundaryService,
      useFactory: () => new OcrBoundaryService(),
    },
    MockOcrProcessingOrchestrationService,
  ],
})
export class MockOcrProcessingModule {}
