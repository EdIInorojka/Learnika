import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, test } from "node:test";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const apiPort = 3300 + Math.floor(Math.random() * 500);
const baseUrl = `http://127.0.0.1:${apiPort}`;
const email = `parent-${Date.now()}@example.test`;
const password = "SyntheticParentPassword42!";
const wrongPassword = "SyntheticParentPassword43!";
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://learnika_local:learnika_local_password@127.0.0.1:5432/learnika_local";
const authSecret = "learnika_test_auth_token_secret_local_only_please_replace_before_real_use";

process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});
const serverOutput = [];
let server;

async function cleanupSyntheticUser() {
  const user = await prisma.user.findUnique({
    select: { id: true },
    where: { email },
  });

  if (!user) {
    return;
  }

  await prisma.auditLog.deleteMany({
    where: {
      OR: [{ actorUserId: user.id }, { targetId: user.id }],
    },
  });
  await prisma.authSession.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

async function waitForApi() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`API server exited early with code ${server.exitCode}`);
    }

    try {
      const response = await fetch(`${baseUrl}/health/live`);

      if (response.ok) {
        return;
      }
    } catch {
      await delay(250);
    }
  }

  throw new Error("API server did not become healthy.");
}

async function request(path, init = {}) {
  const headers = {
    ...(init.body ? { "content-type": "application/json" } : {}),
    ...(init.headers ?? {}),
  };
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });
  const text = await response.text();

  return {
    body: text ? JSON.parse(text) : undefined,
    status: response.status,
    text,
  };
}

before(async () => {
  process.env.DATABASE_URL = databaseUrl;
  await cleanupSyntheticUser();

  server = spawn(process.execPath, ["dist/main.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      API_PORT: String(apiPort),
      AUTH_ACCESS_TOKEN_TTL_SECONDS: "900",
      AUTH_REFRESH_TOKEN_TTL_SECONDS: "604800",
      AUTH_TOKEN_SECRET: authSecret,
      DATABASE_URL: databaseUrl,
      NODE_ENV: "test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (chunk) => serverOutput.push(String(chunk)));
  server.stderr.on("data", (chunk) => serverOutput.push(String(chunk)));

  await waitForApi();
});

after(async () => {
  await cleanupSyntheticUser();
  await prisma.$disconnect();

  if (server && server.exitCode === null) {
    server.kill();
  }
});

test("parent auth HTTP flow stores only password and token hashes", async () => {
  const unauthenticatedMe = await request("/auth/me");
  assert.equal(unauthenticatedMe.status, 401);

  const malformed = await request("/auth/register-parent", {
    body: JSON.stringify({ email: "bad", password: "short" }),
    method: "POST",
  });
  assert.equal(malformed.status, 400);
  assert.equal(malformed.text.includes("short"), false);

  const registered = await request("/auth/register-parent", {
    body: JSON.stringify({ email, locale: "ru", password }),
    method: "POST",
  });
  assert.equal(registered.status, 201);
  assert.equal(registered.body.data.user.email, email);
  assert.equal(registered.body.data.user.accountRole, "PARENT");
  assert.equal("passwordHash" in registered.body.data.user, false);
  assert.equal(typeof registered.body.data.tokens.accessToken, "string");
  assert.equal(typeof registered.body.data.tokens.refreshToken, "string");

  const duplicate = await request("/auth/register-parent", {
    body: JSON.stringify({ email, password }),
    method: "POST",
  });
  assert.equal(duplicate.status, 409);

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });
  assert.equal(user.passwordHash === password, false);
  assert.match(user.passwordHash ?? "", /^\$argon2id\$/);

  const sessions = await prisma.authSession.findMany({
    where: { userId: user.id },
  });
  assert.ok(sessions.length > 0);
  assert.equal(
    sessions.some((session) => session.accessTokenHash === registered.body.data.tokens.accessToken),
    false,
  );
  assert.equal(
    sessions.some(
      (session) => session.refreshTokenHash === registered.body.data.tokens.refreshToken,
    ),
    false,
  );

  const failedLogin = await request("/auth/login", {
    body: JSON.stringify({ email, password: wrongPassword }),
    method: "POST",
  });
  assert.equal(failedLogin.status, 401);

  const login = await request("/auth/login", {
    body: JSON.stringify({ email, password }),
    method: "POST",
  });
  assert.equal(login.status, 200);

  const me = await request("/auth/me", {
    headers: { authorization: `Bearer ${login.body.data.tokens.accessToken}` },
  });
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, email);
  assert.equal("passwordHash" in me.body.data.user, false);

  const refreshed = await request("/auth/refresh", {
    body: JSON.stringify({ refreshToken: login.body.data.tokens.refreshToken }),
    method: "POST",
  });
  assert.equal(refreshed.status, 200);

  const reusedRefresh = await request("/auth/refresh", {
    body: JSON.stringify({ refreshToken: login.body.data.tokens.refreshToken }),
    method: "POST",
  });
  assert.equal(reusedRefresh.status, 401);

  const logout = await request("/auth/logout", {
    headers: { authorization: `Bearer ${refreshed.body.data.tokens.accessToken}` },
    method: "POST",
  });
  assert.equal(logout.status, 200);
  assert.equal(logout.body.data.ok, true);

  const revokedMe = await request("/auth/me", {
    headers: { authorization: `Bearer ${refreshed.body.data.tokens.accessToken}` },
  });
  assert.equal(revokedMe.status, 401);

  const output = serverOutput.join("");
  assert.equal(output.includes(password), false);
  assert.equal(output.includes(registered.body.data.tokens.accessToken), false);
  assert.equal(output.includes(registered.body.data.tokens.refreshToken), false);
  assert.equal(output.includes(login.body.data.tokens.accessToken), false);
  assert.equal(output.includes(refreshed.body.data.tokens.refreshToken), false);
  assert.equal(output.includes("Authorization"), false);
  assert.equal(output.includes("Cookie"), false);
  assert.equal(output.includes(email), false);
});
