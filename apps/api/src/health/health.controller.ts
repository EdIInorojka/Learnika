import { Controller, Get } from "@nestjs/common";

type HealthResponse = Readonly<{
  service: "api";
  status: "ok";
}>;

@Controller("health")
export class HealthController {
  @Get("live")
  live(): HealthResponse {
    return {
      service: "api",
      status: "ok",
    };
  }

  @Get("ready")
  ready(): HealthResponse {
    return {
      service: "api",
      status: "ok",
    };
  }
}
