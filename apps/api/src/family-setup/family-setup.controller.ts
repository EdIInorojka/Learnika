import { Body, Controller, Get, Headers, Param, Post, Put } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
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
  ChildProfileRequestDto,
  ChildProfileResponseDto,
  ChildProfilesResponseDto,
  ConsentRequestDto,
  ConsentResponseDto,
  ConsentStatusResponseDto,
  CurrentFamilyResponseDto,
  FamilyRequestDto,
  LearningContextRequestDto,
  LearningContextResponseDto,
  SetupStatusResponseDto,
} from "../openapi/api-schemas";
import type {
  ChildProfileResponse,
  ChildProfilesResponse,
  ConsentResponse,
  ConsentStatusResponse,
  CurrentFamilyResponse,
  LearningContextResponse,
  SetupStatusResponse,
} from "./family-setup.types";
import {
  parseChildProfileInput,
  parseConsentInput,
  parseFamilyInput,
  parseIdParam,
  parseLearningContextInput,
} from "./family-setup.validation";
import { FamilySetupService } from "./family-setup.service";

@ApiTags("family setup")
@ApiBearerAuth("bearerAuth")
@Controller("family-setup")
export class FamilySetupController {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly familySetupService: FamilySetupService,
  ) {}

  @Get("family")
  @ApiOperation({ summary: "Get the authenticated parent's current family setup." })
  @ApiOkResponse({ type: CurrentFamilyResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async getCurrentFamily(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<CurrentFamilyResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.getCurrentFamily(context);
  }

  @Post("family")
  @ApiOperation({ summary: "Create or return the authenticated parent's family setup." })
  @ApiBody({ type: FamilyRequestDto })
  @ApiCreatedResponse({ type: CurrentFamilyResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  async createOrGetCurrentFamily(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: unknown,
  ): Promise<CurrentFamilyResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.createOrGetCurrentFamily(context, parseFamilyInput(body));
  }

  @Get("children")
  @ApiOperation({ summary: "List child profiles in the authenticated parent's family." })
  @ApiOkResponse({ type: ChildProfilesResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async listChildProfiles(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<ChildProfilesResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.listChildProfiles(context);
  }

  @Post("children")
  @ApiOperation({ summary: "Create a minimal child profile in the authenticated parent's family." })
  @ApiBody({ type: ChildProfileRequestDto })
  @ApiCreatedResponse({ type: ChildProfileResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  @ApiConflictResponse({ type: ApiErrorDto })
  async createChildProfile(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: unknown,
  ): Promise<ChildProfileResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.createChildProfile(context, parseChildProfileInput(body));
  }

  @Post("consents")
  @ApiOperation({ summary: "Record versioned family or child consent." })
  @ApiBody({ type: ConsentRequestDto })
  @ApiCreatedResponse({ type: ConsentResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async createConsent(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: unknown,
  ): Promise<ConsentResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.createConsent(context, parseConsentInput(body));
  }

  @Get("consent-status")
  @ApiOperation({ summary: "Get current versioned consent status for the parent's family." })
  @ApiOkResponse({ type: ConsentStatusResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getConsentStatus(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<ConsentStatusResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.getConsentStatus(context);
  }

  @Put("children/:childProfileId/learning-context")
  @ApiOperation({ summary: "Create or update child learning context metadata." })
  @ApiParam({ format: "uuid", name: "childProfileId" })
  @ApiBody({ type: LearningContextRequestDto })
  @ApiOkResponse({ type: LearningContextResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async upsertLearningContext(
    @Headers("authorization") authorization: string | undefined,
    @Param("childProfileId") childProfileId: string | undefined,
    @Body() body: unknown,
  ): Promise<LearningContextResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.upsertLearningContext(
      context,
      parseIdParam(childProfileId, "Child profile identifier"),
      parseLearningContextInput(body),
    );
  }

  @Get("status")
  @ApiOperation({ summary: "Get authenticated parent onboarding and family setup status." })
  @ApiOkResponse({ type: SetupStatusResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async getSetupStatus(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<SetupStatusResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.getSetupStatus(context);
  }
}
