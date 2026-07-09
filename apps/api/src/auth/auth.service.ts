import { randomBytes, createHmac } from "node:crypto";

import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import argon2 from "argon2";

import { getAuthConfig, type AuthConfig } from "./auth.config";
import type { AuthResponse, AuthenticatedUser, MeResponse } from "./auth.types";
import { PrismaService } from "../database/prisma.service";

interface UserRecord {
  accountRole: string;
  disabledAt: Date | null;
  email: string | null;
  id: string;
  locale: string;
  passwordHash: string | null;
}

interface TokenPair {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  private readonly config: AuthConfig;

  constructor(private readonly prisma: PrismaService) {
    this.config = getAuthConfig();
  }

  async registerParent(input: {
    email: string;
    locale: string;
    password: string;
  }): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictException({
        code: "AUTH_EMAIL_ALREADY_REGISTERED",
        message: "A parent account already exists for this email.",
      });
    }

    const passwordHash = await argon2.hash(input.password, {
      parallelism: 1,
      type: argon2.argon2id,
    });

    const user = await this.prisma.user.create({
      data: {
        accountRole: "PARENT",
        email: input.email,
        locale: input.locale,
        passwordHash,
      },
    });
    await this.recordAuthEvent(user.id, "auth.register_parent", "SUCCESS");

    return this.createAuthResponse(user);
  }

  async login(input: { email: string; password: string }): Promise<AuthResponse> {
    // TODO: add Redis-backed rate limiting before public beta.
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user?.passwordHash || user.accountRole !== "PARENT" || user.disabledAt) {
      throw this.invalidCredentials();
    }

    const passwordMatches = await argon2.verify(user.passwordHash, input.password);

    if (!passwordMatches) {
      await this.recordAuthEvent(user.id, "auth.login", "DENIED");
      throw this.invalidCredentials();
    }

    await this.recordAuthEvent(user.id, "auth.login", "SUCCESS");
    return this.createAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const now = new Date();
    const session = await this.prisma.authSession.findUnique({
      include: { user: true },
      where: { refreshTokenHash: this.hashToken(refreshToken) },
    });

    if (
      !session ||
      session.revokedAt ||
      session.refreshTokenExpiresAt <= now ||
      session.user.accountRole !== "PARENT" ||
      session.user.disabledAt
    ) {
      throw this.unauthorized();
    }

    await this.prisma.authSession.update({
      data: { revokedAt: now },
      where: { id: session.id },
    });
    await this.recordAuthEvent(session.user.id, "auth.refresh", "SUCCESS");

    return this.createAuthResponse(session.user);
  }

  async logout(accessToken: string): Promise<{ data: { ok: true } }> {
    const session = await this.findValidAccessSession(accessToken);
    const now = new Date();

    await this.prisma.authSession.update({
      data: { revokedAt: now },
      where: { id: session.id },
    });
    await this.recordAuthEvent(session.user.id, "auth.logout", "SUCCESS");

    return { data: { ok: true } };
  }

  async me(accessToken: string): Promise<MeResponse> {
    return { data: { user: await this.authenticateParent(accessToken) } };
  }

  async authenticateParent(accessToken: string): Promise<AuthenticatedUser> {
    const session = await this.findValidAccessSession(accessToken);

    await this.prisma.authSession.update({
      data: { lastUsedAt: new Date() },
      where: { id: session.id },
    });

    return this.toAuthenticatedUser(session.user);
  }

  private async createAuthResponse(user: UserRecord): Promise<AuthResponse> {
    const tokens = this.createTokens();

    await this.prisma.authSession.create({
      data: {
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        accessTokenHash: this.hashToken(tokens.accessToken),
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        refreshTokenHash: this.hashToken(tokens.refreshToken),
        userId: user.id,
      },
    });

    return {
      data: {
        tokens: {
          accessToken: tokens.accessToken,
          accessTokenExpiresAt: tokens.accessTokenExpiresAt.toISOString(),
          refreshToken: tokens.refreshToken,
          refreshTokenExpiresAt: tokens.refreshTokenExpiresAt.toISOString(),
          tokenType: "Bearer",
        },
        user: this.toAuthenticatedUser(user),
      },
    };
  }

  private async findValidAccessSession(accessToken: string) {
    const now = new Date();
    const session = await this.prisma.authSession.findUnique({
      include: { user: true },
      where: { accessTokenHash: this.hashToken(accessToken) },
    });

    if (
      !session ||
      session.revokedAt ||
      session.accessTokenExpiresAt <= now ||
      session.user.accountRole !== "PARENT" ||
      session.user.disabledAt
    ) {
      throw this.unauthorized();
    }

    return session;
  }

  private createTokens(): TokenPair {
    const now = Date.now();

    return {
      accessToken: randomBytes(32).toString("base64url"),
      accessTokenExpiresAt: new Date(now + this.config.accessTokenTtlSeconds * 1000),
      refreshToken: randomBytes(32).toString("base64url"),
      refreshTokenExpiresAt: new Date(now + this.config.refreshTokenTtlSeconds * 1000),
    };
  }

  private hashToken(token: string): string {
    return createHmac("sha256", this.config.tokenSecret).update(token).digest("hex");
  }

  private invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException({
      code: "AUTH_INVALID_CREDENTIALS",
      message: "Email or password is invalid.",
    });
  }

  private unauthorized(): UnauthorizedException {
    return new UnauthorizedException({
      code: "AUTH_UNAUTHORIZED",
      message: "Authentication is required.",
    });
  }

  private async recordAuthEvent(
    userId: string,
    action: string,
    outcome: "DENIED" | "SUCCESS",
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          actorType: "USER",
          actorUserId: userId,
          outcome,
          targetType: "User",
          targetId: userId,
        },
      });
    } catch {
      // Auth must not fail because an audit write failed in local foundation work.
    }
  }

  private toAuthenticatedUser(user: UserRecord): AuthenticatedUser {
    if (!user.email || user.accountRole !== "PARENT") {
      throw this.unauthorized();
    }

    return {
      accountRole: "PARENT",
      email: user.email,
      id: user.id,
      locale: user.locale,
    };
  }
}
