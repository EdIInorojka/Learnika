import { Body, Controller, Get, Headers, Param, Post, Put } from "@nestjs/common";

import { AuthorizationService } from "../authorization/authorization.service";
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

@Controller("family-setup")
export class FamilySetupController {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly familySetupService: FamilySetupService,
  ) {}

  @Get("family")
  async getCurrentFamily(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<CurrentFamilyResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.getCurrentFamily(context);
  }

  @Post("family")
  async createOrGetCurrentFamily(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: unknown,
  ): Promise<CurrentFamilyResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.createOrGetCurrentFamily(context, parseFamilyInput(body));
  }

  @Get("children")
  async listChildProfiles(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<ChildProfilesResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.listChildProfiles(context);
  }

  @Post("children")
  async createChildProfile(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: unknown,
  ): Promise<ChildProfileResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.createChildProfile(context, parseChildProfileInput(body));
  }

  @Post("consents")
  async createConsent(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: unknown,
  ): Promise<ConsentResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.createConsent(context, parseConsentInput(body));
  }

  @Get("consent-status")
  async getConsentStatus(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<ConsentStatusResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.getConsentStatus(context);
  }

  @Put("children/:childProfileId/learning-context")
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
  async getSetupStatus(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<SetupStatusResponse> {
    const context = await this.authorization.authorizeParent(authorization);
    return this.familySetupService.getSetupStatus(context);
  }
}
