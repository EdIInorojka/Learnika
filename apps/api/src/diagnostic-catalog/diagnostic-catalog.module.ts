import { Module } from "@nestjs/common";

import { DiagnosticCatalogRegistryService } from "./diagnostic-catalog.service";

@Module({
  exports: [DiagnosticCatalogRegistryService],
  providers: [
    {
      provide: DiagnosticCatalogRegistryService,
      useFactory: () => DiagnosticCatalogRegistryService.fromRepository(),
    },
  ],
})
export class DiagnosticCatalogModule {}
