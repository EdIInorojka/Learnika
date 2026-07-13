export type ApiMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export interface ApiRequestOptions {
  accessToken?: string;
  body?: unknown;
  method?: ApiMethod;
}

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

function apiBaseUrl(): URL {
  const configured = process.env.LEARNIKA_API_BASE_URL ?? "http://127.0.0.1:3001";
  let baseUrl: URL;

  try {
    baseUrl = new URL(configured);
  } catch {
    throw new ApiClientError(0, "API_CONFIG_INVALID", "API configuration is unavailable.");
  }

  if (
    (baseUrl.protocol !== "http:" && baseUrl.protocol !== "https:") ||
    baseUrl.username !== "" ||
    baseUrl.password !== "" ||
    baseUrl.pathname !== "/" ||
    baseUrl.search !== "" ||
    baseUrl.hash !== ""
  ) {
    throw new ApiClientError(0, "API_CONFIG_INVALID", "API configuration is unavailable.");
  }

  return baseUrl;
}

export function resolveApiUrl(apiPath: string): URL {
  if (
    !apiPath.startsWith("/") ||
    apiPath.startsWith("//") ||
    apiPath.includes("\\") ||
    /\s/.test(apiPath)
  ) {
    throw new ApiClientError(0, "API_PATH_INVALID", "API request path is invalid.");
  }

  const baseUrl = apiBaseUrl();
  const url = new URL(apiPath, baseUrl);
  if (url.origin !== baseUrl.origin) {
    throw new ApiClientError(0, "API_PATH_INVALID", "API request path is invalid.");
  }

  return url;
}

function safeMessage(status: number): string {
  if (status === 400) return "The request was rejected.";
  if (status === 401 || status === 403) return "Authentication is required.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 409) return "The request could not be completed.";
  if (status >= 500) return "The API is temporarily unavailable.";
  return "The API request failed.";
}

async function safeErrorCode(response: Response): Promise<string> {
  try {
    const value: unknown = await response.json();
    if (
      typeof value === "object" &&
      value !== null &&
      "code" in value &&
      typeof value.code === "string" &&
      /^[A-Z0-9_]{1,80}$/.test(value.code)
    ) {
      return value.code;
    }
  } catch {
    // Deliberately discard malformed or sensitive response bodies.
  }

  return "API_REQUEST_FAILED";
}

export async function apiRequest<T>(apiPath: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers({ accept: "application/json" });
  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
  }
  if (options.accessToken) {
    headers.set("authorization", `Bearer ${options.accessToken}`);
  }

  return performApiRequest<T>(apiPath, {
    headers,
    method: options.method ?? "GET",
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });
}

export async function apiMultipartRequest<T>(
  apiPath: string,
  multipartBody: FormData,
  accessToken: string,
): Promise<T> {
  const headers = new Headers({
    accept: "application/json",
    authorization: `Bearer ${accessToken}`,
  });
  return performApiRequest<T>(apiPath, {
    body: multipartBody,
    headers,
    method: "POST",
  });
}

async function performApiRequest<T>(apiPath: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(resolveApiUrl(apiPath), {
      ...init,
      cache: "no-store",
      redirect: "error",
    });
  } catch {
    throw new ApiClientError(0, "API_UNAVAILABLE", "The API is temporarily unavailable.");
  }

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      await safeErrorCode(response),
      safeMessage(response.status),
    );
  }

  return (await response.json()) as T;
}
