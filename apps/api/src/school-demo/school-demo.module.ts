import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { SchoolDemoController } from "./school-demo.controller";
import { SchoolDemoService } from "./school-demo.service";

@Module({
  controllers: [SchoolDemoController],
  imports: [DatabaseModule],
  providers: [SchoolDemoService],
})
export class SchoolDemoModule {}
