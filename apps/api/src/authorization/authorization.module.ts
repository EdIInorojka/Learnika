import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { AuthorizationService } from "./authorization.service";

@Module({
  exports: [AuthorizationService],
  imports: [AuditModule, AuthModule, DatabaseModule],
  providers: [AuthorizationService],
})
export class AuthorizationModule {}
