import { Body, Controller, Get, Headers, HttpCode, Param, Patch, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { AuthorizationService } from "../authorization/authorization.service";
import {
  ApiErrorDto,
  CreateMediaAssetRequestDto,
  MediaAssetResponseDto,
  MediaAssetsResponseDto,
  MockOcrCandidateRequestDto,
  MockOcrCandidateResponseDto,
  UpdateMediaAssetRetentionRequestDto,
} from "../openapi/api-schemas";
import { MediaAssetsService } from "./media-assets.service";
import type { MediaAssetResponse, MediaAssetsResponse } from "./media-assets.types";
import { MockOcrCandidateService } from "./mock-ocr-candidate.service";
import type { MockOcrCandidateResponse } from "./mock-ocr-candidate.types";
import {
  parseCreateMediaAssetInput,
  parseIdParam,
  parseMockOcrCandidateInput,
  parseUpdateMediaAssetRetentionInput,
} from "./media-assets.validation";

@ApiTags("media asset metadata")
@ApiBearerAuth("bearerAuth")
@Controller("homework/sessions/:homeworkSessionId/media-assets")
export class MediaAssetsController {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly mediaAssetsService: MediaAssetsService,
    private readonly mockOcrCandidateService: MockOcrCandidateService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create metadata for a homework media asset." })
  @ApiParam({ format: "uuid", name: "homeworkSessionId" })
  @ApiBody({ type: CreateMediaAssetRequestDto })
  @ApiCreatedResponse({ type: MediaAssetResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async createMediaAsset(
    @Headers("authorization") authorization: string | undefined,
    @Param("homeworkSessionId") homeworkSessionId: string | undefined,
    @Body() body: unknown,
  ): Promise<MediaAssetResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.mediaAssetsService.createForHomeworkSession(
      context,
      parseIdParam(homeworkSessionId, "Homework session identifier"),
      parseCreateMediaAssetInput(body),
    );
  }

  @Get()
  @ApiOperation({ summary: "List media asset metadata for one homework session." })
  @ApiParam({ format: "uuid", name: "homeworkSessionId" })
  @ApiOkResponse({ type: MediaAssetsResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async listMediaAssets(
    @Headers("authorization") authorization: string | undefined,
    @Param("homeworkSessionId") homeworkSessionId: string | undefined,
  ): Promise<MediaAssetsResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.mediaAssetsService.listForHomeworkSession(
      context,
      parseIdParam(homeworkSessionId, "Homework session identifier"),
    );
  }

  @Get(":mediaAssetId")
  @ApiOperation({ summary: "Get one homework media asset metadata record." })
  @ApiParam({ format: "uuid", name: "homeworkSessionId" })
  @ApiParam({ format: "uuid", name: "mediaAssetId" })
  @ApiOkResponse({ type: MediaAssetResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getMediaAsset(
    @Headers("authorization") authorization: string | undefined,
    @Param("homeworkSessionId") homeworkSessionId: string | undefined,
    @Param("mediaAssetId") mediaAssetId: string | undefined,
  ): Promise<MediaAssetResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.mediaAssetsService.getForHomeworkSession(
      context,
      parseIdParam(homeworkSessionId, "Homework session identifier"),
      parseIdParam(mediaAssetId, "Media asset identifier"),
    );
  }

  @Post(":mediaAssetId/mock-ocr-candidate")
  @HttpCode(200)
  @ApiOperation({ summary: "Create an untrusted mock OCR candidate for learner review." })
  @ApiParam({ format: "uuid", name: "homeworkSessionId" })
  @ApiParam({ format: "uuid", name: "mediaAssetId" })
  @ApiBody({ required: false, type: MockOcrCandidateRequestDto })
  @ApiOkResponse({ type: MockOcrCandidateResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  @ApiConflictResponse({ type: ApiErrorDto })
  async createMockOcrCandidate(
    @Headers("authorization") authorization: string | undefined,
    @Param("homeworkSessionId") homeworkSessionId: string | undefined,
    @Param("mediaAssetId") mediaAssetId: string | undefined,
    @Body() body: unknown,
  ): Promise<MockOcrCandidateResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.mockOcrCandidateService.createCandidate(
      context,
      parseIdParam(homeworkSessionId, "Homework session identifier"),
      parseIdParam(mediaAssetId, "Media asset identifier"),
      parseMockOcrCandidateInput(body),
    );
  }

  @Patch(":mediaAssetId/retention")
  @ApiOperation({ summary: "Request deletion for one homework media asset metadata record." })
  @ApiParam({ format: "uuid", name: "homeworkSessionId" })
  @ApiParam({ format: "uuid", name: "mediaAssetId" })
  @ApiBody({ type: UpdateMediaAssetRetentionRequestDto })
  @ApiOkResponse({ type: MediaAssetResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async requestDeletion(
    @Headers("authorization") authorization: string | undefined,
    @Param("homeworkSessionId") homeworkSessionId: string | undefined,
    @Param("mediaAssetId") mediaAssetId: string | undefined,
    @Body() body: unknown,
  ): Promise<MediaAssetResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    parseUpdateMediaAssetRetentionInput(body);

    return this.mediaAssetsService.requestDeletion(
      context,
      parseIdParam(homeworkSessionId, "Homework session identifier"),
      parseIdParam(mediaAssetId, "Media asset identifier"),
    );
  }
}
