import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { afterEach, test } from "node:test";

import { ApiClientError, apiRequest, resolveApiUrl } from "../lib/api-client.server.ts";
import { AuthContractError, parseAuthResponse, parseMeResponse } from "../lib/auth-contract.ts";

const originalFetch = globalThis.fetch;
const originalApiBaseUrl = process.env.LEARNIKA_API_BASE_URL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiBaseUrl === undefined) {
    delete process.env.LEARNIKA_API_BASE_URL;
  } else {
    process.env.LEARNIKA_API_BASE_URL = originalApiBaseUrl;
  }
});

function validAuthResponse() {
  return {
    data: {
      tokens: {
        accessToken: "a".repeat(43),
        accessTokenExpiresAt: "2026-07-12T12:00:00.000Z",
        refreshToken: "r".repeat(43),
        refreshTokenExpiresAt: "2026-07-19T12:00:00.000Z",
        tokenType: "Bearer",
      },
      user: {
        accountRole: "PARENT",
        email: "parent@example.test",
        id: "11111111-1111-4111-8111-111111111111",
        locale: "ru",
      },
    },
  };
}

test("API client accepts only relative API paths on the configured origin", () => {
  process.env.LEARNIKA_API_BASE_URL = "http://127.0.0.1:3001";
  assert.equal(resolveApiUrl("/auth/me").href, "http://127.0.0.1:3001/auth/me");

  for (const invalidPath of [
    "auth/me",
    "//example.test/auth/me",
    "https://example.test/auth/me",
    "/auth\\me",
    "/auth me",
  ]) {
    assert.throws(
      () => resolveApiUrl(invalidPath),
      (error) => error instanceof ApiClientError && error.code === "API_PATH_INVALID",
    );
  }
});

test("API client sends auth server-side and sanitizes API error bodies", async () => {
  process.env.LEARNIKA_API_BASE_URL = "http://127.0.0.1:3001";
  let authorizationHeader;
  globalThis.fetch = async (_url, init) => {
    authorizationHeader = new globalThis.Headers(init?.headers).get("authorization");
    return new Response(
      JSON.stringify({
        code: "AUTH_UNAUTHORIZED",
        message: "sensitive response body token=do-not-expose",
      }),
      { headers: { "content-type": "application/json" }, status: 401 },
    );
  };

  await assert.rejects(
    () => apiRequest("/auth/me", { accessToken: "synthetic-access-token", method: "GET" }),
    (error) => {
      assert.equal(error instanceof ApiClientError, true);
      assert.equal(error.status, 401);
      assert.equal(error.code, "AUTH_UNAUTHORIZED");
      assert.equal(error.message, "Authentication is required.");
      assert.equal(error.message.includes("do-not-expose"), false);
      assert.equal(Object.hasOwn(error, "body"), false);
      return true;
    },
  );
  assert.equal(authorizationHeader, "Bearer synthetic-access-token");
});

test("auth response parsers enforce the parent and token contract", () => {
  const response = parseAuthResponse(validAuthResponse());
  assert.equal(response.data.user.accountRole, "PARENT");
  assert.equal(response.data.tokens.tokenType, "Bearer");
  assert.equal(
    parseMeResponse({ data: { user: response.data.user } }).data.user.email,
    response.data.user.email,
  );

  for (const invalid of [
    null,
    { data: {} },
    { data: { ...validAuthResponse().data, user: { accountRole: "CHILD" } } },
    {
      data: {
        ...validAuthResponse().data,
        tokens: { ...validAuthResponse().data.tokens, accessToken: "short" },
      },
    },
  ]) {
    assert.throws(() => parseAuthResponse(invalid), AuthContractError);
  }
});

test("web auth foundation keeps tokens server-side and scope-limited", () => {
  const appDir = path.resolve(process.cwd(), "app");
  const libDir = path.resolve(process.cwd(), "lib");
  const sourceFiles = [
    ...fs
      .readdirSync(appDir)
      .filter((fileName) => /\.(ts|tsx)$/.test(fileName))
      .map((fileName) => path.join(appDir, fileName)),
    ...fs
      .readdirSync(libDir)
      .filter((fileName) => fileName.endsWith(".ts"))
      .map((fileName) => path.join(libDir, fileName)),
  ];
  const source = sourceFiles.map((fileName) => fs.readFileSync(fileName, "utf8")).join("\n");
  for (const forbidden of [
    "localStorage",
    "sessionStorage",
    "document.cookie",
    "console.log",
    "console.error",
    "dangerouslySetInnerHTML",
    "accessToken=",
    "refreshToken=",
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }

  const sessionSource = fs.readFileSync(path.join(libDir, "auth-session.server.ts"), "utf8");
  assert.equal(sessionSource.includes("httpOnly: true"), true);
  assert.equal(sessionSource.includes('sameSite: "strict"'), true);
  assert.equal(sessionSource.includes("cookies()"), true);

  const actionsSource = fs.readFileSync(path.join(appDir, "auth-actions.ts"), "utf8");
  for (const route of [
    "/auth/login",
    "/auth/logout",
    "/auth/me",
    "/auth/refresh",
    "/auth/register-parent",
  ]) {
    const combinedServerSource = `${actionsSource}\n${source}`;
    assert.equal(combinedServerSource.includes(route), true, route);
  }

  const pageSource = fs.readFileSync(path.join(appDir, "page.tsx"), "utf8").toLowerCase();
  for (const forbiddenScope of ["homework", "media upload", "mock ocr", "voice", "billing"]) {
    assert.equal(pageSource.includes(forbiddenScope), false, forbiddenScope);
  }
});
