import { cookies } from "next/headers";

import type { AuthTokens } from "./auth-contract";

const accessCookieName = "learnika_access_token";
const refreshCookieName = "learnika_refresh_token";

function cookieOptions(expiresAt: string) {
  return {
    expires: new Date(expiresAt),
    httpOnly: true,
    path: "/",
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function storeAuthSession(tokens: AuthTokens): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(accessCookieName, tokens.accessToken, cookieOptions(tokens.accessTokenExpiresAt));
  cookieStore.set(
    refreshCookieName,
    tokens.refreshToken,
    cookieOptions(tokens.refreshTokenExpiresAt),
  );
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(accessCookieName);
  cookieStore.delete(refreshCookieName);
}

export async function readAccessToken(): Promise<string | null> {
  return (await cookies()).get(accessCookieName)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  return (await cookies()).get(refreshCookieName)?.value ?? null;
}
