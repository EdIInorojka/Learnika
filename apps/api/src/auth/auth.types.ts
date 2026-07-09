export interface AuthenticatedUser {
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
    user: AuthenticatedUser;
  };
}

export interface MeResponse {
  data: {
    user: AuthenticatedUser;
  };
}
