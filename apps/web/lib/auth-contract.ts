export interface AuthenticatedParent {
  accountRole: "PARENT";
  email: string;
  id: string;
  locale: string;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  tokenType: "Bearer";
}

export interface AuthResponse {
  data: {
    tokens: AuthTokens;
    user: AuthenticatedParent;
  };
}

export interface MeResponse {
  data: {
    user: AuthenticatedParent;
  };
}

export class AuthContractError extends Error {
  constructor() {
    super("Authentication response did not match the expected contract.");
    this.name = "AuthContractError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new AuthContractError();
  }

  return value;
}

function validDateTime(value: unknown): string {
  const text = requiredString(value);
  if (!Number.isFinite(Date.parse(text))) {
    throw new AuthContractError();
  }

  return text;
}

function parseUser(value: unknown): AuthenticatedParent {
  if (!isRecord(value) || value.accountRole !== "PARENT") {
    throw new AuthContractError();
  }

  const email = requiredString(value.email);
  if (!email.includes("@")) {
    throw new AuthContractError();
  }

  return {
    accountRole: "PARENT",
    email,
    id: requiredString(value.id),
    locale: requiredString(value.locale),
  };
}

function parseTokens(value: unknown): AuthTokens {
  if (!isRecord(value) || value.tokenType !== "Bearer") {
    throw new AuthContractError();
  }

  const accessToken = requiredString(value.accessToken);
  const refreshToken = requiredString(value.refreshToken);
  if (accessToken.length < 32 || refreshToken.length < 32) {
    throw new AuthContractError();
  }

  return {
    accessToken,
    accessTokenExpiresAt: validDateTime(value.accessTokenExpiresAt),
    refreshToken,
    refreshTokenExpiresAt: validDateTime(value.refreshTokenExpiresAt),
    tokenType: "Bearer",
  };
}

export function parseAuthResponse(value: unknown): AuthResponse {
  if (!isRecord(value) || !isRecord(value.data)) {
    throw new AuthContractError();
  }

  return {
    data: {
      tokens: parseTokens(value.data.tokens),
      user: parseUser(value.data.user),
    },
  };
}

export function parseMeResponse(value: unknown): MeResponse {
  if (!isRecord(value) || !isRecord(value.data)) {
    throw new AuthContractError();
  }

  return { data: { user: parseUser(value.data.user) } };
}
