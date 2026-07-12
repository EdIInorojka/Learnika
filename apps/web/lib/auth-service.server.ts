import { apiRequest, ApiClientError, type ApiRequestOptions } from "./api-client.server";
import {
  type AuthenticatedParent,
  type AuthResponse,
  type MeResponse,
  parseAuthResponse,
  parseMeResponse,
} from "./auth-contract";
import { readAccessToken, readRefreshToken } from "./auth-session.server";

export interface ParentCredentials {
  email: string;
  locale?: string;
  password: string;
}

export type AuthShellState =
  | { canRefresh: boolean; status: "anonymous"; user: null }
  | { canRefresh: false; status: "authenticated"; user: AuthenticatedParent }
  | { canRefresh: boolean; status: "unavailable"; user: null };

export async function registerParent(credentials: ParentCredentials): Promise<AuthResponse> {
  return parseAuthResponse(
    await apiRequest<unknown>("/auth/register-parent", {
      body: { ...credentials, locale: credentials.locale ?? "ru" },
      method: "POST",
    }),
  );
}

export async function loginParent(credentials: ParentCredentials): Promise<AuthResponse> {
  return parseAuthResponse(
    await apiRequest<unknown>("/auth/login", {
      body: { email: credentials.email, password: credentials.password },
      method: "POST",
    }),
  );
}

export async function refreshParentSession(refreshToken: string): Promise<AuthResponse> {
  return parseAuthResponse(
    await apiRequest<unknown>("/auth/refresh", {
      body: { refreshToken },
      method: "POST",
    }),
  );
}

export async function logoutParent(accessToken: string): Promise<void> {
  await apiRequest<unknown>("/auth/logout", { accessToken, method: "POST" });
}

export async function authenticatedApiRequest<T>(
  apiPath: string,
  options: Omit<ApiRequestOptions, "accessToken"> = {},
): Promise<T> {
  const accessToken = await readAccessToken();
  if (!accessToken) {
    throw new ApiClientError(401, "AUTH_REQUIRED", "Authentication is required.");
  }

  return apiRequest<T>(apiPath, { ...options, accessToken });
}

export async function readAuthShellState(): Promise<AuthShellState> {
  const accessToken = await readAccessToken();
  const canRefresh = (await readRefreshToken()) !== null;
  if (!accessToken) {
    return { canRefresh, status: "anonymous", user: null };
  }

  try {
    const response = parseMeResponse(
      await apiRequest<unknown>("/auth/me", { accessToken, method: "GET" }),
    ) satisfies MeResponse;
    return { canRefresh: false, status: "authenticated", user: response.data.user };
  } catch (error: unknown) {
    if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
      return { canRefresh, status: "anonymous", user: null };
    }

    return { canRefresh, status: "unavailable", user: null };
  }
}
