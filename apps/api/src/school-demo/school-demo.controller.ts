import { Controller, Get } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { ApiErrorDto, SchoolDemoSnapshotResponseDto } from "../openapi/api-schemas";
import { SchoolDemoService } from "./school-demo.service";
import type { SchoolDemoSnapshotResponse } from "./school-demo.types";

@ApiTags("school demo")
@Controller("demo")
export class SchoolDemoController {
  constructor(private readonly schoolDemoService: SchoolDemoService) {}

  @Get("school-snapshot")
  @ApiOperation({
    summary: "Read the synthetic non-production school demo snapshot.",
  })
  @ApiOkResponse({ type: SchoolDemoSnapshotResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getSchoolSnapshot(): Promise<SchoolDemoSnapshotResponse> {
    return this.schoolDemoService.getSyntheticSchoolSnapshot();
  }
}
