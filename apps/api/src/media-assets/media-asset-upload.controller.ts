import { Controller, Headers, HttpCode, HttpStatus, Param, Post, Req } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { AuthorizationService } from "../authorization/authorization.service";
import {
  ApiErrorDto,
  MediaAssetResponseDto,
  MediaAssetUploadRequestDto,
} from "../openapi/api-schemas";
import { MediaAssetUploadService } from "./media-asset-upload.service";
import { parseMultipartMediaUpload, type MultipartRequest } from "./media-asset-upload.validation";
import type { MediaAssetResponse } from "./media-assets.types";
import { parseIdParam } from "./media-assets.validation";

@ApiTags("local media upload")
@ApiBearerAuth("bearerAuth")
@Controller("homework/sessions/:homeworkSessionId/media-assets/:mediaAssetId")
export class MediaAssetUploadController {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly uploadService: MediaAssetUploadService,
  ) {}

  @Post("upload")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Upload one homework media file to local development storage." })
  @ApiParam({ format: "uuid", name: "homeworkSessionId" })
  @ApiParam({ format: "uuid", name: "mediaAssetId" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: MediaAssetUploadRequestDto })
  @ApiOkResponse({ type: MediaAssetResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiResponse({ status: 400, type: ApiErrorDto })
  @ApiResponse({ status: 404, type: ApiErrorDto })
  @ApiResponse({ status: 409, type: ApiErrorDto })
  @ApiResponse({ status: 413, type: ApiErrorDto })
  @ApiResponse({ status: 415, type: ApiErrorDto })
  @ApiResponse({ status: 503, type: ApiErrorDto })
  async uploadMediaAsset(
    @Headers("authorization") authorization: string | undefined,
    @Param("homeworkSessionId") homeworkSessionId: string | undefined,
    @Param("mediaAssetId") mediaAssetId: string | undefined,
    @Req() request: MultipartRequest,
  ): Promise<MediaAssetResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    const target = await this.uploadService.prepareUpload(
      context,
      parseIdParam(homeworkSessionId, "Homework session identifier"),
      parseIdParam(mediaAssetId, "Media asset identifier"),
    );
    const upload = await parseMultipartMediaUpload(
      request,
      this.uploadService.getMaxFileSizeBytes(),
    );

    return this.uploadService.storeUpload(target, upload);
  }
}
