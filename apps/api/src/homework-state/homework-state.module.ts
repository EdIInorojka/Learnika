import { Module } from "@nestjs/common";

import { HomeworkStateService } from "./homework-state.service";

@Module({
  exports: [HomeworkStateService],
  providers: [HomeworkStateService],
})
export class HomeworkStateModule {}
