import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, test } from "node:test";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const apiPort = 4300 + Math.floor(Math.random() * 500);
const baseUrl = `http://127.0.0.1:${apiPort}`;
const runId = Date.now();
const parentAEmail = `media-parent-a-${runId}@example.test`;
const parentBEmail = `media-parent-b-${runId}@example.test`;
const password = "SyntheticParentPassword42!";
const childANickname = `MediaLearnerA${runId}`;
const childBNickname = `MediaLearnerB${runId}`;
const originalFilename = `worksheet-${childANickname}-${parentAEmail}.png`;
const unsafeRawMedia = "synthetic raw media bytes";
const checksumSha256 = "a".repeat(64);
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://learnika_local:learnika_local_password@127.0.0.1:5432/learnika_local";
const authSecret = "learnika_test_media_asset_auth_token_secret_local_only";
const forbiddenResponseTerms = [
  "answer",
  "base64Content",
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
  "originalFilename",
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

async function createHomeworkSession(accessToken, childProfileId) {
  const response = await request("/homework/sessions", {
    body: JSON.stringify({
      childProfileId,
      gradeLevel: 8,
      sourceType: "IMAGE",
      subject: "math",
    }),
    headers: authHeader(accessToken),
    method: "POST",
  });
  assert.equal(response.status, 201);
  return response.body.data.session;
}

async function createMediaAsset(accessToken, homeworkSessionId, overrides = {}) {
  const response = await request(`/homework/sessions/${homeworkSessionId}/media-assets`, {
    body: JSON.stringify({
      assetKind: "HOMEWORK_IMAGE",
      checksumSha256,
      mimeType: "image/png",
      sizeBytes: 4096,
      ...overrides,
    }),
    headers: authHeader(accessToken),
    method: "POST",
  });
  assert.equal(response.status, 201);
  return response.body.data.mediaAsset;
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

test("media asset metadata API requires auth enforces tenancy and exposes no unsafe fields", async () => {
  const syntheticSessionId = "11111111-1111-4111-8111-111111111111";
  assert.equal(
    (await request(`/homework/sessions/${syntheticSessionId}/media-assets`)).status,
    401,
  );
  assert.equal(
    (
      await request(`/homework/sessions/${syntheticSessionId}/media-assets`, {
        body: JSON.stringify({
          assetKind: "HOMEWORK_IMAGE",
          mimeType: "image/png",
          sizeBytes: 100,
        }),
        method: "POST",
      })
    ).status,
    401,
  );

  const parentA = await registerParent(parentAEmail);
  const parentB = await registerParent(parentBEmail);
  const parentAToken = parentA.tokens.accessToken;
  const parentBToken = parentB.tokens.accessToken;
  const familyA = await createFamily(parentAToken, "Media Family A");
  const familyB = await createFamily(parentBToken, "Media Family B");
  const childA = await createChild(parentAToken, childANickname);
  const childB = await createChild(parentBToken, childBNickname);
  const sessionA = await createHomeworkSession(parentAToken, childA.id);
  const sessionB = await createHomeworkSession(parentBToken, childB.id);

  const badSessionId = await request("/homework/sessions/not-a-uuid/media-assets", {
    headers: authHeader(parentAToken),
  });
  assert.equal(badSessionId.status, 400);
  assert.equal(badSessionId.text.includes("not-a-uuid"), false);

  const invalidMime = await request(`/homework/sessions/${sessionA.id}/media-assets`, {
    body: JSON.stringify({
      assetKind: "HOMEWORK_IMAGE",
      mimeType: "text/plain",
      sizeBytes: 100,
    }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(invalidMime.status, 400);
  assert.equal(invalidMime.text.includes("text/plain"), false);

  const oversized = await request(`/homework/sessions/${sessionA.id}/media-assets`, {
    body: JSON.stringify({
      assetKind: "HOMEWORK_PDF",
      mimeType: "application/pdf",
      sizeBytes: 10 * 1024 * 1024 + 1,
    }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(oversized.status, 400);

  const unsupportedKind = await request(`/homework/sessions/${sessionA.id}/media-assets`, {
    body: JSON.stringify({
      assetKind: "VOICE_AUDIO",
      mimeType: "audio/webm",
      sizeBytes: 100,
    }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(unsupportedKind.status, 400);

  const forbiddenField = await request(`/homework/sessions/${sessionA.id}/media-assets`, {
    body: JSON.stringify({
      assetKind: "HOMEWORK_IMAGE",
      mimeType: "image/png",
      originalFilename,
      rawMedia: unsafeRawMedia,
      sizeBytes: 100,
    }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(forbiddenField.status, 400);
  assertNoLeak(forbiddenField, [originalFilename, unsafeRawMedia, childANickname, parentAEmail]);

  const forgedFamily = await request(`/homework/sessions/${sessionA.id}/media-assets`, {
    body: JSON.stringify({
      assetKind: "HOMEWORK_IMAGE",
      childProfileId: childB.id,
      familyId: familyB.id,
      mimeType: "image/png",
      sizeBytes: 100,
    }),
    headers: authHeader(parentAToken),
    method: "POST",
  });
  assert.equal(forgedFamily.status, 400);
  assertNoLeak(forgedFamily, [familyB.id, childB.id, childBNickname]);

  const parentACreatesForSessionB = await request(
    `/homework/sessions/${sessionB.id}/media-assets`,
    {
      body: JSON.stringify({
        assetKind: "HOMEWORK_IMAGE",
        mimeType: "image/png",
        sizeBytes: 100,
      }),
      headers: authHeader(parentAToken),
      method: "POST",
    },
  );
  assert.equal(parentACreatesForSessionB.status, 404);
  assertNoLeak(parentACreatesForSessionB, [sessionB.id, familyB.id, childB.id, childBNickname]);

  const mediaAssetA = await createMediaAsset(parentAToken, sessionA.id);
  assert.equal(mediaAssetA.familyId, familyA.id);
  assert.equal(mediaAssetA.childProfileId, childA.id);
  assert.equal(mediaAssetA.homeworkSessionId, sessionA.id);
  assert.equal(mediaAssetA.createdByUserId, parentA.user.id);
  assert.equal(mediaAssetA.assetKind, "HOMEWORK_IMAGE");
  assert.equal(mediaAssetA.mimeType, "image/png");
  assert.equal(mediaAssetA.sizeBytes, 4096);
  assert.equal(mediaAssetA.checksumSha256, checksumSha256);
  assert.equal(mediaAssetA.retentionStatus, "TEMPORARY");
  assert.equal(typeof mediaAssetA.retentionUntil, "string");
  assert.equal(mediaAssetA.deletionRequestedAt, null);
  assert.equal(mediaAssetA.deletedAt, null);
  assert.equal(
    mediaAssetA.storageKey,
    `families/${familyA.id}/children/${childA.id}/media/homework-image/${mediaAssetA.id}.png`,
  );
  assert.equal(mediaAssetA.storageKey.includes(originalFilename), false);
  assert.equal(mediaAssetA.storageKey.includes(childANickname), false);
  assert.equal(mediaAssetA.storageKey.includes(parentAEmail), false);
  assertNoForbiddenMetadata(mediaAssetA);

  const storedMediaAsset = await prisma.mediaAsset.findUnique({
    where: { id: mediaAssetA.id },
  });
  assert.ok(storedMediaAsset);
  assert.equal(storedMediaAsset.familyId, familyA.id);
  assert.equal(storedMediaAsset.childProfileId, childA.id);
  assert.equal(storedMediaAsset.homeworkSessionId, sessionA.id);
  assert.equal(storedMediaAsset.storageKey.includes(originalFilename), false);
  assert.equal(storedMediaAsset.storageKey.includes(childANickname), false);
  assert.equal(storedMediaAsset.storageKey.includes(parentAEmail), false);

  const listMediaAssets = await request(`/homework/sessions/${sessionA.id}/media-assets`, {
    headers: authHeader(parentAToken),
  });
  assert.equal(listMediaAssets.status, 200);
  assert.equal(
    listMediaAssets.body.data.mediaAssets.some((mediaAsset) => mediaAsset.id === mediaAssetA.id),
    true,
  );
  assert.equal(listMediaAssets.text.includes(familyB.id), false);
  assert.equal(listMediaAssets.text.includes(childB.id), false);
  assertNoForbiddenMetadata(listMediaAssets.body);

  const getMediaAsset = await request(
    `/homework/sessions/${sessionA.id}/media-assets/${mediaAssetA.id}`,
    {
      headers: authHeader(parentAToken),
    },
  );
  assert.equal(getMediaAsset.status, 200);
  assert.equal(getMediaAsset.body.data.mediaAsset.id, mediaAssetA.id);
  assertNoForbiddenMetadata(getMediaAsset.body);

  const invalidRetentionUpdate = await request(
    `/homework/sessions/${sessionA.id}/media-assets/${mediaAssetA.id}/retention`,
    {
      body: JSON.stringify({ retentionStatus: "DELETED" }),
      headers: authHeader(parentAToken),
      method: "PATCH",
    },
  );
  assert.equal(invalidRetentionUpdate.status, 400);

  const deletionRequest = await request(
    `/homework/sessions/${sessionA.id}/media-assets/${mediaAssetA.id}/retention`,
    {
      body: JSON.stringify({ retentionStatus: "DELETION_REQUESTED" }),
      headers: authHeader(parentAToken),
      method: "PATCH",
    },
  );
  assert.equal(deletionRequest.status, 200);
  assert.equal(deletionRequest.body.data.mediaAsset.retentionStatus, "DELETION_REQUESTED");
  assert.equal(typeof deletionRequest.body.data.mediaAsset.deletionRequestedAt, "string");
  assert.equal(deletionRequest.body.data.mediaAsset.deletedAt, null);
  assertNoForbiddenMetadata(deletionRequest.body);

  const mediaAssetB = await createMediaAsset(parentBToken, sessionB.id, {
    assetKind: "HOMEWORK_PDF",
    checksumSha256: "b".repeat(64),
    mimeType: "application/pdf",
    sizeBytes: 1024,
  });

  const parentAListsSessionBMedia = await request(
    `/homework/sessions/${sessionB.id}/media-assets`,
    {
      headers: authHeader(parentAToken),
    },
  );
  assert.equal(parentAListsSessionBMedia.status, 404);
  assertNoLeak(parentAListsSessionBMedia, [mediaAssetB.id, sessionB.id, familyB.id, childB.id]);

  const parentAReadsMediaB = await request(
    `/homework/sessions/${sessionB.id}/media-assets/${mediaAssetB.id}`,
    {
      headers: authHeader(parentAToken),
    },
  );
  assert.equal(parentAReadsMediaB.status, 404);
  assertNoLeak(parentAReadsMediaB, [mediaAssetB.id, sessionB.id, familyB.id, childB.id]);

  const parentAReadsMediaBThroughSessionA = await request(
    `/homework/sessions/${sessionA.id}/media-assets/${mediaAssetB.id}`,
    {
      headers: authHeader(parentAToken),
    },
  );
  assert.equal(parentAReadsMediaBThroughSessionA.status, 404);
  assertNoLeak(parentAReadsMediaBThroughSessionA, [mediaAssetB.id, familyB.id, childB.id]);

  const deniedMediaEvents = await prisma.auditLog.findMany({
    select: { outcome: true, policyVersion: true, targetId: true, targetType: true },
    where: {
      actorUserId: parentA.user.id,
      outcome: "DENIED",
      targetId: { in: [sessionB.id, mediaAssetB.id] },
    },
  });
  assert.ok(deniedMediaEvents.length >= 1);
  assert.ok(
    deniedMediaEvents.every(
      (event) =>
        event.outcome === "DENIED" &&
        event.policyVersion === "slice-7-family-tenant-v1" &&
        (event.targetType === null ||
          event.targetType === "HomeworkSession" ||
          event.targetType === "MediaAsset"),
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
    "/homework/sessions/{homeworkSessionId}/media-assets",
    "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}",
    "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/retention",
  ]);
  for (const [method, pathName] of [
    ["post", "/homework/sessions/{homeworkSessionId}/media-assets"],
    ["get", "/homework/sessions/{homeworkSessionId}/media-assets"],
    ["get", "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}"],
    ["patch", "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/retention"],
  ]) {
    assert.equal(
      openapi.paths[pathName][method].security.some((entry) => Object.hasOwn(entry, "bearerAuth")),
      true,
    );
  }
  assertNoForbiddenMetadata(openapi.paths["/homework/sessions/{homeworkSessionId}/media-assets"]);
  assertNoForbiddenMetadata(openapi.components.schemas.MediaAssetSummaryDto);
  assertNoForbiddenMetadata(openapi.components.schemas.CreateMediaAssetRequestDto);

  const output = serverOutput.join("");
  for (const leakedValue of [
    password,
    parentAToken,
    parentBToken,
    parentAEmail,
    parentBEmail,
    childANickname,
    childBNickname,
    originalFilename,
    authSecret,
    "Bearer",
    "Authorization",
    "Cookie",
    unsafeRawMedia,
  ]) {
    assert.equal(output.includes(leakedValue), false);
  }
});
