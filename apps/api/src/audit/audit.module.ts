import { Module } from "@nestjs/common";

import { AuditService } from "./audit.service";
import { DatabaseModule } from "../database/database.module";

@Module({
  exports: [AuditService],
  imports: [DatabaseModule],
  providers: [AuditService],
})
export class AuditModule {}
