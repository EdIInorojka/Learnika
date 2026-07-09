import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { AuthorizationService } from "./authorization.service";

@Module({
  exports: [AuthorizationService],
  imports: [AuthModule, DatabaseModule],
  providers: [AuthorizationService],
})
export class AuthorizationModule {}
