import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, test } from "node:test";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const apiPort = 3800 + Math.floor(Math.random() * 500);
const baseUrl = `http://127.0.0.1:${apiPort}`;
const runId = Date.now();
const parentAEmail = `homework-parent-a-${runId}@example.test`;
const parentBEmail = `homework-parent-b-${runId}@example.test`;
const password = "SyntheticParentPassword42!";
const childANickname = `HomeworkLearnerA${runId}`;
const childBNickname = `HomeworkLearnerB${runId}`;
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://learnika_local:learnika_local_password@127.0.0.1:5432/learnika_local";
const authSecret = "learnika_test_homework_auth_token_secret_local_only";
const forbiddenResponseTerms = [
  "answer",
  "completion",
  "exactSolution",
  "finalAnswer",
  "fullSolution",
  "generatedHint",
  "hintText",
  "llmCompletion",
  "llmPrompt",
  "mediaBinary",
  "modelOutput",
  "ocrResult",
  "providerPayload",
  "rawMedia",
  "solution",
  "sttResult",
  "textbookContent",
  "transcript",
  "uploadedFile",
];

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
    await prisma.mediaAsset.deleteMany({ where: { familyId: { in: familyIds } } });
    await prisma.homeworkAttempt.deleteMany({ where: { familyId: { in: familyIds } } });
    await prisma.homeworkSession.deleteMany({ where: { familyId: { in: familyIds } } });
    await prisma.textbookSelection.deleteMany({ where: { familyId: { in: familyIds } } });
    await prisma.consentRecord.deleteMany({ where: { familyId: { in: familyIds } } });
    await prisma.childProfile.deleteMany({ where: { familyId: { in: familyIds } } });
    await prisma.familyMember.deleteMany({ where: { familyId: { in: familyIds } } });
    await prisma.family.deleteMany({ where: { id: { in: familyIds } } });
  }

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

async function request(urlPath, init = {}) {
  const headers = {
    ...(init.body ? { "content-type": "application/json" } : {}),
    ...(init.headers ?? {}),
  };
  const response = await fetch(`${baseUrl}${urlPath}`, {
    ...init,
    headers,
  });
  const text = await response.text();

  return {
    body: text ? JSON.parse(text) : undefined,
    headers: response.headers,
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

function assertNoForbiddenMetadata(value) {
  const serialized = JSON.stringify(value);
  const lower = serialized.toLowerCase();

  for (const term of forbiddenResponseTerms) {
    assert.equal(lower.includes(term.toLowerCase()), false);
  }
}

function assertNoLeak(response, values) {
  for (const value of values) {
    assert.equal(response.text.includes(value), false);
  }
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

test("homework metadata API requires auth enforces tenancy and exposes no unsafe fields", async () => {
  assert.equal((await request("/homework/sessions")).status, 401);
  assert.equal(
    (
      await request("/homework/sessions", {
        body: JSON.stringify({ childProfileId: "11111111-1111-4111-8111-111111111111" }),
        method: "POST",
      })
    ).status,
    401,
  );

  const parentA = await registerParent(parentAEmail);
  const parentB = await registerParent(parentBEmail);
  const parentAToken = parentA.tokens.accessToken;
  const parentBToken = parentB.tokens.accessToken;
  const familyA = await createFamily(parentAToken, "Homework Family A");
  const familyB = await createFamily(parentBToken, "Homework Family B");
  const childA = await createChild(parentAToken, childANickname);
  const childB = await createChild(parentBToken, childBNickname);

  const malformedChild = await request("/homework/sessions", {
    body: JSON.stringify({ childProfileId: "not-a-uuid", sourceType: "MANUAL" }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(malformedChild.status, 400);
  assert.equal(malformedChild.text.includes("not-a-uuid"), false);

  const forbiddenSessionField = await request("/homework/sessions", {
    body: JSON.stringify({
      childProfileId: childA.id,
      finalAnswer: "x = 2",
      sourceType: "MANUAL",
    }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(forbiddenSessionField.status, 400);
  assert.equal(forbiddenSessionField.text.includes("x = 2"), false);

  const forgedFamilyId = await request("/homework/sessions", {
    body: JSON.stringify({
      childProfileId: childA.id,
      familyId: familyB.id,
      sourceType: "MANUAL",
    }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(forgedFamilyId.status, 400);
  assertNoLeak(forgedFamilyId, [familyB.id, childBNickname]);

  const createSession = await request("/homework/sessions", {
    body: JSON.stringify({
      childProfileId: childA.id,
      gradeLevel: 8,
      sourceType: "MANUAL",
      subject: "math",
    }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(createSession.status, 201);
  const sessionA = createSession.body.data.session;
  assert.equal(sessionA.familyId, familyA.id);
  assert.equal(sessionA.childProfileId, childA.id);
  assert.equal(sessionA.createdByUserId, parentA.user.id);
  assert.equal(sessionA.gradeLevel, 8);
  assert.equal(sessionA.sourceType, "MANUAL");
  assert.equal(sessionA.status, "CREATED");
  assert.equal(sessionA.subject, "math");
  assertNoForbiddenMetadata(createSession.body);

  const listSessions = await request("/homework/sessions", {
    headers: authHeader(parentAToken),
  });
  assert.equal(listSessions.status, 200);
  assert.equal(
    listSessions.body.data.sessions.some((session) => session.id === sessionA.id),
    true,
  );
  assert.equal(listSessions.text.includes(familyB.id), false);
  assert.equal(listSessions.text.includes(childB.id), false);
  assertNoForbiddenMetadata(listSessions.body);

  const listChildSessions = await request(`/homework/sessions?childProfileId=${childA.id}`, {
    headers: authHeader(parentAToken),
  });
  assert.equal(listChildSessions.status, 200);
  assert.equal(listChildSessions.body.data.sessions.length, 1);
  assert.equal(listChildSessions.body.data.sessions[0].id, sessionA.id);

  const parentAListsChildB = await request(`/homework/sessions?childProfileId=${childB.id}`, {
    headers: authHeader(parentAToken),
  });
  assert.equal(parentAListsChildB.status, 404);
  assertNoLeak(parentAListsChildB, [childB.id, childBNickname, familyB.id]);

  const getSession = await request(`/homework/sessions/${sessionA.id}`, {
    headers: authHeader(parentAToken),
  });
  assert.equal(getSession.status, 200);
  assert.equal(getSession.body.data.session.id, sessionA.id);
  assertNoForbiddenMetadata(getSession.body);

  const badSessionId = await request("/homework/sessions/not-a-uuid", {
    headers: authHeader(parentAToken),
  });
  assert.equal(badSessionId.status, 400);
  assert.equal(badSessionId.text.includes("not-a-uuid"), false);

  const createAttemptOne = await request(`/homework/sessions/${sessionA.id}/attempts`, {
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(createAttemptOne.status, 201);
  const attemptOne = createAttemptOne.body.data.attempt;
  assert.equal(attemptOne.familyId, familyA.id);
  assert.equal(attemptOne.homeworkSessionId, sessionA.id);
  assert.equal(attemptOne.childProfileId, childA.id);
  assert.equal(attemptOne.createdByUserId, parentA.user.id);
  assert.equal(attemptOne.attemptNumber, 1);
  assert.equal(attemptOne.status, "CREATED");
  assertNoForbiddenMetadata(createAttemptOne.body);

  const createAttemptTwo = await request(`/homework/sessions/${sessionA.id}/attempts`, {
    body: JSON.stringify({ status: "CREATED" }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(createAttemptTwo.status, 201);
  assert.equal(createAttemptTwo.body.data.attempt.attemptNumber, 2);

  const invalidAttemptStatus = await request(`/homework/sessions/${sessionA.id}/attempts`, {
    body: JSON.stringify({ status: "SUBMITTED" }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(invalidAttemptStatus.status, 400);

  const forbiddenAttemptField = await request(`/homework/sessions/${sessionA.id}/attempts`, {
    body: JSON.stringify({ providerPayload: "raw provider payload" }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(forbiddenAttemptField.status, 400);
  assert.equal(forbiddenAttemptField.text.includes("raw provider payload"), false);

  const listAttempts = await request(`/homework/sessions/${sessionA.id}/attempts`, {
    headers: authHeader(parentAToken),
  });
  assert.equal(listAttempts.status, 200);
  assert.deepEqual(
    listAttempts.body.data.attempts.map((attempt) => attempt.attemptNumber),
    [1, 2],
  );
  assertNoForbiddenMetadata(listAttempts.body);

  const createSessionB = await request("/homework/sessions", {
    body: JSON.stringify({
      childProfileId: childB.id,
      gradeLevel: 8,
      sourceType: "MANUAL",
      subject: "math",
    }),
    headers: authHeader(parentBToken),
    method: "POST",
  });
  assert.equal(createSessionB.status, 201);
  const sessionB = createSessionB.body.data.session;
  const createAttemptB = await request(`/homework/sessions/${sessionB.id}/attempts`, {
    headers: authHeader(parentBToken),
    method: "POST",
  });
  assert.equal(createAttemptB.status, 201);
  const attemptB = createAttemptB.body.data.attempt;

  const parentAReadsSessionB = await request(`/homework/sessions/${sessionB.id}`, {
    headers: authHeader(parentAToken),
  });
  assert.equal(parentAReadsSessionB.status, 404);
  assertNoLeak(parentAReadsSessionB, [sessionB.id, familyB.id, childB.id, childBNickname]);

  const parentAListsAttemptsB = await request(`/homework/sessions/${sessionB.id}/attempts`, {
    headers: authHeader(parentAToken),
  });
  assert.equal(parentAListsAttemptsB.status, 404);
  assertNoLeak(parentAListsAttemptsB, [attemptB.id, sessionB.id, familyB.id, childB.id]);

  const parentACreatesAttemptB = await request(`/homework/sessions/${sessionB.id}/attempts`, {
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(parentACreatesAttemptB.status, 404);
  assertNoLeak(parentACreatesAttemptB, [attemptB.id, sessionB.id, familyB.id, childB.id]);

  const deniedHomeworkEvents = await prisma.auditLog.findMany({
    select: { outcome: true, policyVersion: true, targetId: true, targetType: true },
    where: {
      actorUserId: parentA.user.id,
      outcome: "DENIED",
      targetId: sessionB.id,
    },
  });
  assert.ok(deniedHomeworkEvents.length >= 1);
  assert.ok(
    deniedHomeworkEvents.every(
      (event) =>
        event.outcome === "DENIED" &&
        event.policyVersion === "slice-7-family-tenant-v1" &&
        (event.targetType === null || event.targetType === "HomeworkSession"),
    ),
  );

  const openapi = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "..", "..", "packages", "contracts", "openapi.json"),
      "utf8",
    ),
  );
  const homeworkPaths = Object.keys(openapi.paths ?? {})
    .filter((pathName) => pathName.startsWith("/homework"))
    .sort();
  assert.deepEqual(homeworkPaths, [
    "/homework/sessions",
    "/homework/sessions/{homeworkSessionId}",
    "/homework/sessions/{homeworkSessionId}/attempts",
  ]);
  for (const [method, pathName] of [
    ["post", "/homework/sessions"],
    ["get", "/homework/sessions"],
    ["get", "/homework/sessions/{homeworkSessionId}"],
    ["post", "/homework/sessions/{homeworkSessionId}/attempts"],
    ["get", "/homework/sessions/{homeworkSessionId}/attempts"],
  ]) {
    assert.equal(
      openapi.paths[pathName][method].security.some((entry) => Object.hasOwn(entry, "bearerAuth")),
      true,
    );
  }
  assertNoForbiddenMetadata(openapi.paths["/homework/sessions"]);
  assertNoForbiddenMetadata(openapi.components.schemas.HomeworkSessionSummaryDto);
  assertNoForbiddenMetadata(openapi.components.schemas.HomeworkAttemptSummaryDto);

  const output = serverOutput.join("");
  for (const leakedValue of [
    password,
    parentAToken,
    parentBToken,
    parentAEmail,
    parentBEmail,
    childANickname,
    childBNickname,
    authSecret,
    "Bearer",
    "Authorization",
    "Cookie",
    "raw provider payload",
    "x = 2",
  ]) {
    assert.equal(output.includes(leakedValue), false);
  }
});
