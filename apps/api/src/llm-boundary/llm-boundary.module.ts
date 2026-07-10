import { Module } from "@nestjs/common";

import { LocalMockLlmProvider, LlmBoundaryService } from "./llm-boundary.service";

@Module({
  exports: [LlmBoundaryService],
  providers: [LocalMockLlmProvider, LlmBoundaryService],
})
export class LlmBoundaryModule {}
