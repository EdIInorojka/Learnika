import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, test } from "node:test";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const apiPort = 3300 + Math.floor(Math.random() * 500);
const baseUrl = `http://127.0.0.1:${apiPort}`;
const runId = Date.now();
const parentAEmail = `parent-a-${runId}@example.test`;
const parentBEmail = `parent-b-${runId}@example.test`;
const password = "SyntheticParentPassword42!";
const wrongPassword = "SyntheticParentPassword43!";
const childANickname = `LearnerA${runId}`;
const childBNickname = `LearnerB${runId}`;
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

function authHeader(accessToken) {
  return { authorization: `Bearer ${accessToken}` };
}

async function cleanupSyntheticUsers() {
  const users = await prisma.user.findMany({
    select: { id: true },
    where: { email: { in: [parentAEmail, parentBEmail] } },
  });
  const userIds = users.map((user) => user.id);

  if (userIds.length === 0) {
    return;
  }

  const memberships = await prisma.familyMember.findMany({
    select: { familyId: true },
    where: { userId: { in: userIds } },
  });
  const familyIds = [...new Set(memberships.map((membership) => membership.familyId))];

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorUserId: { in: userIds } },
        ...(familyIds.length > 0 ? [{ familyId: { in: familyIds } }] : []),
      ],
    },
  });

  if (familyIds.length > 0) {
    await prisma.textbookSelection.deleteMany({ where: { familyId: { in: familyIds } } });
    await prisma.consentRecord.deleteMany({ where: { familyId: { in: familyIds } } });
    await prisma.childProfile.deleteMany({ where: { familyId: { in: familyIds } } });
    await prisma.familyMember.deleteMany({ where: { familyId: { in: familyIds } } });
    await prisma.family.deleteMany({ where: { id: { in: familyIds } } });
  }

  await prisma.consentRecord.deleteMany({ where: { grantedByUserId: { in: userIds } } });
  await prisma.authSession.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
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

async function registerParent(email) {
  const response = await request("/auth/register-parent", {
    body: JSON.stringify({ email, locale: "ru", password }),
    method: "POST",
  });
  assert.equal(response.status, 201);
  return response.body.data;
}

async function createFamily(accessToken, displayName) {
  const response = await request("/family-setup/family", {
    body: JSON.stringify({ displayName }),
    headers: authHeader(accessToken),
    method: "POST",
  });
  assert.equal(response.status, 201);
  return response.body.data.family;
}

async function createChild(accessToken, nickname) {
  const response = await request("/family-setup/children", {
    body: JSON.stringify({ gradeLevel: 8, locale: "ru", nickname }),
    headers: authHeader(accessToken),
    method: "POST",
  });
  assert.equal(response.status, 201);
  return response.body.data.child;
}

before(async () => {
  process.env.DATABASE_URL = databaseUrl;
  await cleanupSyntheticUsers();

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
  await cleanupSyntheticUsers();
  await prisma.$disconnect();

  if (server && server.exitCode === null) {
    server.kill();
  }
});

test("parent auth and family setup flow keeps tenant boundaries and sensitive data safe", async () => {
  const unauthenticatedMe = await request("/auth/me");
  assert.equal(unauthenticatedMe.status, 401);

  const unauthenticatedSetup = await request("/family-setup/status");
  assert.equal(unauthenticatedSetup.status, 401);

  const malformed = await request("/auth/register-parent", {
    body: JSON.stringify({ email: "bad", password: "short" }),
    method: "POST",
  });
  assert.equal(malformed.status, 400);
  assert.equal(malformed.text.includes("short"), false);

  const parentA = await registerParent(parentAEmail);
  assert.equal(parentA.user.email, parentAEmail);
  assert.equal(parentA.user.accountRole, "PARENT");
  assert.equal("passwordHash" in parentA.user, false);
  assert.equal(typeof parentA.tokens.accessToken, "string");
  assert.equal(typeof parentA.tokens.refreshToken, "string");

  const duplicate = await request("/auth/register-parent", {
    body: JSON.stringify({ email: parentAEmail, password }),
    method: "POST",
  });
  assert.equal(duplicate.status, 409);

  const user = await prisma.user.findUniqueOrThrow({
    where: { email: parentAEmail },
  });
  assert.equal(user.passwordHash === password, false);
  assert.match(user.passwordHash ?? "", /^\$argon2id\$/);

  const sessions = await prisma.authSession.findMany({
    where: { userId: user.id },
  });
  assert.ok(sessions.length > 0);
  assert.equal(
    sessions.some((session) => session.accessTokenHash === parentA.tokens.accessToken),
    false,
  );
  assert.equal(
    sessions.some((session) => session.refreshTokenHash === parentA.tokens.refreshToken),
    false,
  );

  const failedLogin = await request("/auth/login", {
    body: JSON.stringify({ email: parentAEmail, password: wrongPassword }),
    method: "POST",
  });
  assert.equal(failedLogin.status, 401);

  const login = await request("/auth/login", {
    body: JSON.stringify({ email: parentAEmail, password }),
    method: "POST",
  });
  assert.equal(login.status, 200);
  const parentAToken = login.body.data.tokens.accessToken;

  const me = await request("/auth/me", {
    headers: authHeader(parentAToken),
  });
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, parentAEmail);
  assert.equal("passwordHash" in me.body.data.user, false);

  const initialStatus = await request("/family-setup/status", {
    headers: authHeader(parentAToken),
  });
  assert.equal(initialStatus.status, 200);
  assert.equal(initialStatus.body.data.family, null);
  assert.equal(initialStatus.body.data.setupComplete, false);

  const familyA = await createFamily(parentAToken, "Local Dev Family A");
  assert.equal(typeof familyA.id, "string");

  const getFamilyA = await request("/family-setup/family", {
    headers: authHeader(parentAToken),
  });
  assert.equal(getFamilyA.status, 200);
  assert.equal(getFamilyA.body.data.family.id, familyA.id);

  const invalidChild = await request("/family-setup/children", {
    body: JSON.stringify({ gradeLevel: 8 }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(invalidChild.status, 400);
  assert.equal(invalidChild.text.includes(childANickname), false);

  const invalidGrade = await request("/family-setup/children", {
    body: JSON.stringify({ gradeLevel: "8abc", locale: "ru", nickname: childANickname }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(invalidGrade.status, 400);
  assert.equal(invalidGrade.text.includes("8abc"), false);

  const childA = await createChild(parentAToken, childANickname);
  assert.equal(childA.nickname, childANickname);
  assert.equal(childA.gradeLevel, 8);
  assert.equal("familyId" in childA, false);

  const duplicateChild = await request("/family-setup/children", {
    body: JSON.stringify({ gradeLevel: 8, locale: "ru", nickname: childANickname }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(duplicateChild.status, 409);

  const listedChildren = await request("/family-setup/children", {
    headers: authHeader(parentAToken),
  });
  assert.equal(listedChildren.status, 200);
  assert.equal(listedChildren.body.data.children.length, 1);
  assert.equal(listedChildren.body.data.children[0].id, childA.id);

  const invalidConsent = await request("/family-setup/consents", {
    body: JSON.stringify({ purpose: "local_dev_family_onboarding", subjectType: "FAMILY" }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(invalidConsent.status, 400);

  const familyConsent = await request("/family-setup/consents", {
    body: JSON.stringify({
      documentVersion: "local-dev-consent-v1",
      policyVersion: "slice-6-local-policy-v1",
      purpose: "local_dev_family_onboarding",
      subjectType: "FAMILY",
    }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(familyConsent.status, 201);
  assert.equal(familyConsent.body.data.consent.subjectType, "FAMILY");
  assert.equal(familyConsent.body.data.consent.documentVersion, "local-dev-consent-v1");

  const childConsent = await request("/family-setup/consents", {
    body: JSON.stringify({
      childProfileId: childA.id,
      documentVersion: "local-dev-child-consent-v1",
      policyVersion: "slice-6-local-policy-v1",
      purpose: "local_dev_child_learning",
      subjectType: "CHILD",
    }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(childConsent.status, 201);
  assert.equal(childConsent.body.data.consent.childProfileId, childA.id);

  const consentStatus = await request("/family-setup/consent-status", {
    headers: authHeader(parentAToken),
  });
  assert.equal(consentStatus.status, 200);
  assert.equal(consentStatus.body.data.familyConsentGranted, true);
  assert.ok(consentStatus.body.data.consents.length >= 2);

  const learningContext = await request(`/family-setup/children/${childA.id}/learning-context`, {
    body: JSON.stringify({
      gradeLevel: 8,
      subject: "math",
      textbookCode: "math-8-local",
    }),
    headers: authHeader(parentAToken),
    method: "PUT",
  });
  assert.equal(learningContext.status, 200);
  assert.equal(learningContext.body.data.learningContext.childProfileId, childA.id);
  assert.equal(learningContext.body.data.learningContext.subject, "math");

  const finalStatus = await request("/family-setup/status", {
    headers: authHeader(parentAToken),
  });
  assert.equal(finalStatus.status, 200);
  assert.equal(finalStatus.body.data.childProfileCount, 1);
  assert.equal(finalStatus.body.data.familyConsentGranted, true);
  assert.equal(finalStatus.body.data.hasLearningContext, true);
  assert.equal(finalStatus.body.data.setupComplete, true);

  const parentB = await registerParent(parentBEmail);
  const familyB = await createFamily(parentB.tokens.accessToken, "Local Dev Family B");
  assert.notEqual(familyB.id, familyA.id);
  const childB = await createChild(parentB.tokens.accessToken, childBNickname);

  const parentBChildren = await request("/family-setup/children", {
    headers: authHeader(parentB.tokens.accessToken),
  });
  assert.equal(parentBChildren.status, 200);
  assert.equal(parentBChildren.body.data.children.length, 1);
  assert.equal(parentBChildren.body.data.children[0].id, childB.id);
  assert.notEqual(parentBChildren.body.data.children[0].id, childA.id);

  const parentAReadsChildB = await request(`/family-setup/children/${childB.id}/learning-context`, {
    body: JSON.stringify({
      gradeLevel: 8,
      subject: "math",
      textbookCode: "math-8-local",
    }),
    headers: authHeader(parentAToken),
    method: "PUT",
  });
  assert.equal(parentAReadsChildB.status, 404);

  const parentBReadsChildA = await request(`/family-setup/children/${childA.id}/learning-context`, {
    body: JSON.stringify({
      gradeLevel: 8,
      subject: "math",
      textbookCode: "math-8-local",
    }),
    headers: authHeader(parentB.tokens.accessToken),
    method: "PUT",
  });
  assert.equal(parentBReadsChildA.status, 404);

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
    headers: authHeader(refreshed.body.data.tokens.accessToken),
    method: "POST",
  });
  assert.equal(logout.status, 200);
  assert.equal(logout.body.data.ok, true);

  const revokedMe = await request("/auth/me", {
    headers: authHeader(refreshed.body.data.tokens.accessToken),
  });
  assert.equal(revokedMe.status, 401);

  const output = serverOutput.join("");
  assert.equal(output.includes(password), false);
  assert.equal(output.includes(parentA.tokens.accessToken), false);
  assert.equal(output.includes(parentA.tokens.refreshToken), false);
  assert.equal(output.includes(login.body.data.tokens.accessToken), false);
  assert.equal(output.includes(refreshed.body.data.tokens.refreshToken), false);
  assert.equal(output.includes(parentAEmail), false);
  assert.equal(output.includes(parentBEmail), false);
  assert.equal(output.includes(childANickname), false);
  assert.equal(output.includes(childBNickname), false);
  assert.equal(output.includes("Authorization"), false);
  assert.equal(output.includes("Cookie"), false);
});
