import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuditModule } from "../audit/audit.module";
import { DatabaseModule } from "../database/database.module";

@Module({
  controllers: [AuthController],
  exports: [AuthService],
  imports: [AuditModule, DatabaseModule],
  providers: [AuthService],
})
export class AuthModule {}
