import { Body, Controller, Get, Headers, HttpCode, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import {
  ApiErrorDto,
  AuthResponseDto,
  CredentialsRequestDto,
  LogoutResponseDto,
  MeResponseDto,
  RefreshTokenRequestDto,
} from "../openapi/api-schemas";
import { AuthService } from "./auth.service";
import { parseBearerToken, parseCredentials, parseRefreshToken } from "./auth.validation";
import type { AuthResponse, MeResponse } from "./auth.types";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register-parent")
  @ApiOperation({ summary: "Register a local development parent account." })
  @ApiBody({ type: CredentialsRequestDto })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiConflictResponse({ type: ApiErrorDto })
  async registerParent(@Body() body: unknown): Promise<AuthResponse> {
    return this.authService.registerParent(parseCredentials(body));
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Log in a local development parent account." })
  @ApiBody({ type: CredentialsRequestDto })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async login(@Body() body: unknown): Promise<AuthResponse> {
    const { email, password } = parseCredentials(body);
    return this.authService.login({ email, password });
  }

  @Post("refresh")
  @HttpCode(200)
  @ApiOperation({ summary: "Rotate a parent refresh token." })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async refresh(@Body() body: unknown): Promise<AuthResponse> {
    return this.authService.refresh(parseRefreshToken(body));
  }

  @Post("logout")
  @HttpCode(200)
  @ApiBearerAuth("bearerAuth")
  @ApiOperation({ summary: "Revoke the current parent access session." })
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async logout(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<{ data: { ok: true } }> {
    return this.authService.logout(parseBearerToken(authorization));
  }

  @Get("me")
  @ApiBearerAuth("bearerAuth")
  @ApiOperation({ summary: "Read the current authenticated parent context." })
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async me(@Headers("authorization") authorization: string | undefined): Promise<MeResponse> {
    return this.authService.me(parseBearerToken(authorization));
  }
}
