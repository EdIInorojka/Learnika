import { BadRequestException, UnauthorizedException } from "@nestjs/common";

interface CredentialsInput {
  email: string;
  locale: string;
  password: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new BadRequestException({
      code: "AUTH_INVALID_INPUT",
      message: "Request body is invalid.",
    });
  }

  return value as Record<string, unknown>;
}

export function parseCredentials(value: unknown): CredentialsInput {
  const body = asRecord(value);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const locale = typeof body.locale === "string" ? body.locale.trim() : "ru";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    throw new BadRequestException({
      code: "AUTH_INVALID_INPUT",
      message: "Email is invalid.",
    });
  }

  if (password.length < 12 || password.length > 128) {
    throw new BadRequestException({
      code: "AUTH_INVALID_INPUT",
      message: "Password is invalid.",
    });
  }

  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
    throw new BadRequestException({
      code: "AUTH_INVALID_INPUT",
      message: "Locale is invalid.",
    });
  }

  return { email, locale, password };
}

export function parseRefreshToken(value: unknown): string {
  const body = asRecord(value);
  const refreshToken = typeof body.refreshToken === "string" ? body.refreshToken : "";

  if (refreshToken.length < 32 || refreshToken.length > 512) {
    throw new BadRequestException({
      code: "AUTH_INVALID_INPUT",
      message: "Refresh token is invalid.",
    });
  }

  return refreshToken;
}

export function parseBearerToken(authorization: string | undefined): string {
  if (!authorization) {
    throw new UnauthorizedException({
      code: "AUTH_UNAUTHORIZED",
      message: "Authentication is required.",
    });
  }

  const [scheme, token, extra] = authorization.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token || extra) {
    throw new UnauthorizedException({
      code: "AUTH_UNAUTHORIZED",
      message: "Authentication is required.",
    });
  }

  return token;
}
