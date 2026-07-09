import { Body, Controller, Get, Headers, Param, Post, Put } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import { parseBearerToken } from "../auth/auth.validation";
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
    private readonly authService: AuthService,
    private readonly familySetupService: FamilySetupService,
  ) {}

  @Get("family")
  async getCurrentFamily(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<CurrentFamilyResponse> {
    const user = await this.authService.authenticateParent(parseBearerToken(authorization));
    return this.familySetupService.getCurrentFamily(user);
  }

  @Post("family")
  async createOrGetCurrentFamily(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: unknown,
  ): Promise<CurrentFamilyResponse> {
    const user = await this.authService.authenticateParent(parseBearerToken(authorization));
    return this.familySetupService.createOrGetCurrentFamily(user, parseFamilyInput(body));
  }

  @Get("children")
  async listChildProfiles(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<ChildProfilesResponse> {
    const user = await this.authService.authenticateParent(parseBearerToken(authorization));
    return this.familySetupService.listChildProfiles(user);
  }

  @Post("children")
  async createChildProfile(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: unknown,
  ): Promise<ChildProfileResponse> {
    const user = await this.authService.authenticateParent(parseBearerToken(authorization));
    return this.familySetupService.createChildProfile(user, parseChildProfileInput(body));
  }

  @Post("consents")
  async createConsent(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: unknown,
  ): Promise<ConsentResponse> {
    const user = await this.authService.authenticateParent(parseBearerToken(authorization));
    return this.familySetupService.createConsent(user, parseConsentInput(body));
  }

  @Get("consent-status")
  async getConsentStatus(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<ConsentStatusResponse> {
    const user = await this.authService.authenticateParent(parseBearerToken(authorization));
    return this.familySetupService.getConsentStatus(user);
  }

  @Put("children/:childProfileId/learning-context")
  async upsertLearningContext(
    @Headers("authorization") authorization: string | undefined,
    @Param("childProfileId") childProfileId: string | undefined,
    @Body() body: unknown,
  ): Promise<LearningContextResponse> {
    const user = await this.authService.authenticateParent(parseBearerToken(authorization));
    return this.familySetupService.upsertLearningContext(
      user,
      parseIdParam(childProfileId, "Child profile identifier"),
      parseLearningContextInput(body),
    );
  }

  @Get("status")
  async getSetupStatus(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<SetupStatusResponse> {
    const user = await this.authService.authenticateParent(parseBearerToken(authorization));
    return this.familySetupService.getSetupStatus(user);
  }
}
