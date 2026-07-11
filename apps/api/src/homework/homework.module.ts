import { Module } from "@nestjs/common";

import { AuthorizationModule } from "../authorization/authorization.module";
import { DatabaseModule } from "../database/database.module";
import { HomeworkStateModule } from "../homework-state/homework-state.module";
import { HomeworkController } from "./homework.controller";
import { HomeworkService } from "./homework.service";

@Module({
  controllers: [HomeworkController],
  imports: [AuthorizationModule, DatabaseModule, HomeworkStateModule],
  providers: [HomeworkService],
})
export class HomeworkModule {}
