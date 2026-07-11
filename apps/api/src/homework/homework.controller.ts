import { Body, Controller, Get, Headers, Param, Post, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { AuthorizationService } from "../authorization/authorization.service";
import {
  ApiErrorDto,
  CreateHomeworkAttemptRequestDto,
  CreateHomeworkSessionRequestDto,
  HomeworkAttemptResponseDto,
  HomeworkAttemptsResponseDto,
  HomeworkSessionResponseDto,
  HomeworkSessionsResponseDto,
} from "../openapi/api-schemas";
import { HomeworkService } from "./homework.service";
import type {
  HomeworkAttemptResponse,
  HomeworkAttemptsResponse,
  HomeworkSessionResponse,
  HomeworkSessionsResponse,
} from "./homework.types";
import {
  parseCreateHomeworkAttemptInput,
  parseCreateHomeworkSessionInput,
  parseIdParam,
  parseOptionalChildProfileQuery,
} from "./homework.validation";

@ApiTags("homework metadata")
@ApiBearerAuth("bearerAuth")
@Controller("homework")
export class HomeworkController {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly homeworkService: HomeworkService,
  ) {}

  @Post("sessions")
  @ApiOperation({ summary: "Create metadata for a homework session." })
  @ApiBody({ type: CreateHomeworkSessionRequestDto })
  @ApiCreatedResponse({ type: HomeworkSessionResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async createSession(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: unknown,
  ): Promise<HomeworkSessionResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.homeworkService.createSession(context, parseCreateHomeworkSessionInput(body));
  }

  @Get("sessions")
  @ApiOperation({ summary: "List homework session metadata for the authenticated family." })
  @ApiQuery({ format: "uuid", name: "childProfileId", required: false })
  @ApiOkResponse({ type: HomeworkSessionsResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async listSessions(
    @Headers("authorization") authorization: string | undefined,
    @Query("childProfileId") childProfileId: string | undefined,
  ): Promise<HomeworkSessionsResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.homeworkService.listSessions(
      context,
      parseOptionalChildProfileQuery(childProfileId),
    );
  }

  @Get("sessions/:homeworkSessionId")
  @ApiOperation({ summary: "Get one homework session metadata record." })
  @ApiParam({ format: "uuid", name: "homeworkSessionId" })
  @ApiOkResponse({ type: HomeworkSessionResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getSession(
    @Headers("authorization") authorization: string | undefined,
    @Param("homeworkSessionId") homeworkSessionId: string | undefined,
  ): Promise<HomeworkSessionResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.homeworkService.getSession(
      context,
      parseIdParam(homeworkSessionId, "Homework session identifier"),
    );
  }

  @Post("sessions/:homeworkSessionId/attempts")
  @ApiOperation({ summary: "Create metadata for a homework attempt." })
  @ApiParam({ format: "uuid", name: "homeworkSessionId" })
  @ApiBody({ required: false, type: CreateHomeworkAttemptRequestDto })
  @ApiCreatedResponse({ type: HomeworkAttemptResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async createAttempt(
    @Headers("authorization") authorization: string | undefined,
    @Param("homeworkSessionId") homeworkSessionId: string | undefined,
    @Body() body: unknown,
  ): Promise<HomeworkAttemptResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.homeworkService.createAttempt(
      context,
      parseIdParam(homeworkSessionId, "Homework session identifier"),
      parseCreateHomeworkAttemptInput(body),
    );
  }

  @Get("sessions/:homeworkSessionId/attempts")
  @ApiOperation({ summary: "List metadata for homework attempts in one session." })
  @ApiParam({ format: "uuid", name: "homeworkSessionId" })
  @ApiOkResponse({ type: HomeworkAttemptsResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async listAttempts(
    @Headers("authorization") authorization: string | undefined,
    @Param("homeworkSessionId") homeworkSessionId: string | undefined,
  ): Promise<HomeworkAttemptsResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.homeworkService.listAttempts(
      context,
      parseIdParam(homeworkSessionId, "Homework session identifier"),
    );
  }
}
