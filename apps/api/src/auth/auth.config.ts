import { loadLocalEnvironment } from "../config/local-env";

export interface AuthConfig {
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
  tokenSecret: string;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getAuthConfig(): AuthConfig {
  loadLocalEnvironment();

  const tokenSecret = process.env.AUTH_TOKEN_SECRET;

  if (!tokenSecret || tokenSecret.length < 32) {
    throw new Error("AUTH_TOKEN_SECRET must be set to at least 32 characters.");
  }

  return {
    accessTokenTtlSeconds: parsePositiveInteger(process.env.AUTH_ACCESS_TOKEN_TTL_SECONDS, 900),
    refreshTokenTtlSeconds: parsePositiveInteger(
      process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS,
      604800,
    ),
    tokenSecret,
  };
}
