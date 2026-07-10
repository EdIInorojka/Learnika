import { Module } from "@nestjs/common";

import { AssistanceContractService } from "./assistance-contract.service";

@Module({
  exports: [AssistanceContractService],
  providers: [AssistanceContractService],
})
export class AssistanceContractModule {}
