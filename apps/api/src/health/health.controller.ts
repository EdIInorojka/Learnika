import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { HealthResponseDto } from "../openapi/api-schemas";

type HealthResponse = Readonly<{
  service: "api";
  status: "ok";
}>;

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get("live")
  @ApiOperation({ summary: "Check API liveness." })
  @ApiOkResponse({ type: HealthResponseDto })
  live(): HealthResponse {
    return {
      service: "api",
      status: "ok",
    };
  }

  @Get("ready")
  @ApiOperation({ summary: "Check API readiness." })
  @ApiOkResponse({ type: HealthResponseDto })
  ready(): HealthResponse {
    return {
      service: "api",
      status: "ok",
    };
  }
}
