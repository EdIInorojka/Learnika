import { Body, Controller, Get, Headers, HttpCode, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { parseBearerToken, parseCredentials, parseRefreshToken } from "./auth.validation";
import type { AuthResponse, MeResponse } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register-parent")
  async registerParent(@Body() body: unknown): Promise<AuthResponse> {
    return this.authService.registerParent(parseCredentials(body));
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() body: unknown): Promise<AuthResponse> {
    const { email, password } = parseCredentials(body);
    return this.authService.login({ email, password });
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Body() body: unknown): Promise<AuthResponse> {
    return this.authService.refresh(parseRefreshToken(body));
  }

  @Post("logout")
  @HttpCode(200)
  async logout(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<{ data: { ok: true } }> {
    return this.authService.logout(parseBearerToken(authorization));
  }

  @Get("me")
  async me(@Headers("authorization") authorization: string | undefined): Promise<MeResponse> {
    return this.authService.me(parseBearerToken(authorization));
  }
}
