"use server";

import { redirect } from "next/navigation";

import { ApiClientError } from "../lib/api-client.server";
import {
  loginParent,
  logoutParent,
  refreshParentSession,
  registerParent,
} from "../lib/auth-service.server";
import {
  clearAuthSession,
  readAccessToken,
  readRefreshToken,
  storeAuthSession,
} from "../lib/auth-session.server";
import type { AuthResponse } from "../lib/auth-contract";

type AuthErrorKey = "credentials" | "exists" | "invalid" | "service" | "session";

function formText(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value : "";
}

function authErrorKey(error: unknown): AuthErrorKey {
  if (error instanceof ApiClientError) {
    if (error.code === "AUTH_INVALID_CREDENTIALS") return "credentials";
    if (error.code === "AUTH_EMAIL_ALREADY_REGISTERED") return "exists";
    if (error.code === "AUTH_INVALID_INPUT") return "invalid";
  }

  return "service";
}

async function authOrRedirect(request: () => Promise<AuthResponse>): Promise<AuthResponse> {
  try {
    return await request();
  } catch (error: unknown) {
    redirect(`/?authError=${authErrorKey(error)}`);
  }
}

export async function loginParentAction(formData: FormData): Promise<never> {
  const response = await authOrRedirect(() =>
    loginParent({
      email: formText(formData, "email"),
      password: formText(formData, "password"),
    }),
  );
  await storeAuthSession(response.data.tokens);
  redirect("/");
}

export async function registerParentAction(formData: FormData): Promise<never> {
  const response = await authOrRedirect(() =>
    registerParent({
      email: formText(formData, "email"),
      locale: "ru",
      password: formText(formData, "password"),
    }),
  );
  await storeAuthSession(response.data.tokens);
  redirect("/");
}

export async function refreshParentSessionAction(): Promise<never> {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) {
    await clearAuthSession();
    redirect("/?authError=session");
  }

  const response = await authOrRedirect(() => refreshParentSession(refreshToken));
  await storeAuthSession(response.data.tokens);
  redirect("/");
}

export async function logoutParentAction(): Promise<never> {
  const accessToken = await readAccessToken();
  if (accessToken) {
    try {
      await logoutParent(accessToken);
    } catch {
      // Local cookies are cleared even when the API session is already invalid.
    }
  }

  await clearAuthSession();
  redirect("/");
}
