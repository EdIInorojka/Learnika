import assert from "node:assert/strict";
import { Blob, Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, test } from "node:test";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const apiPort = 4900 + Math.floor(Math.random() * 400);
const FormDataConstructor = globalThis.FormData;
const baseUrl = `http://127.0.0.1:${apiPort}`;
const runId = Date.now();
const parentAEmail = `upload-parent-a-${runId}@example.test`;
const parentBEmail = `upload-parent-b-${runId}@example.test`;
const childANickname = `UploadLearnerA${runId}`;
const childBNickname = `UploadLearnerB${runId}`;
const password = "SyntheticParentPassword42!";
const authSecret = "learnika_test_media_upload_auth_token_secret_local_only";
const originalFilename = `${childANickname}-${parentAEmail}-worksheet.png`;
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://learnika_local:learnika_local_password@127.0.0.1:5432/learnika_local";
const pngBytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 0, 0, 0, 0]);
const pdfBytes = Buffer.from("%PDF-1.4\n%%EOF", "ascii");
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
  "transcript",
  "uploadedFile",
];

process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const serverOutput = [];
let server;

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function authHeader(accessToken) {
  return { authorization: `Bearer ${accessToken}` };
}

async function cleanupSyntheticUsers() {
  const users = await prisma.user.findMany({
    select: { id: true },
    where: { email: { in: [parentAEmail, parentBEmail] } },
  });
  const userIds = users.map((user) => user.id);
  if (userIds.length === 0) return;

  const memberships = await prisma.familyMember.findMany({
    select: { familyId: true },
    where: { userId: { in: userIds } },
  });
  const familyIds = [...new Set(memberships.map(({ familyId }) => familyId))];
  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorUserId: { in: userIds } },
        ...(familyIds.length ? [{ familyId: { in: familyIds } }] : []),
      ],
    },
  });
  if (familyIds.length) {
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
    if (server.exitCode !== null) throw new Error(`API exited with code ${server.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/health/live`);
      if (response.ok) return;
    } catch {
      await delay(250);
    }
  }
  throw new Error("API server did not become healthy.");
}

async function requestJson(urlPath, init = {}) {
  const response = await fetch(`${baseUrl}${urlPath}`, {
    ...init,
    headers: {
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  return { body: text ? JSON.parse(text) : undefined, status: response.status, text };
}

async function upload(accessToken, sessionId, mediaAssetId, content, mimeType, filename) {
  const form = new FormDataConstructor();
  form.append("file", new Blob([content], { type: mimeType }), filename);
  const response = await fetch(
    `${baseUrl}/homework/sessions/${sessionId}/media-assets/${mediaAssetId}/upload`,
    {
      body: form,
      headers: accessToken ? authHeader(accessToken) : {},
      method: "POST",
    },
  );
  const text = await response.text();
  return { body: text ? JSON.parse(text) : undefined, status: response.status, text };
}

async function registerParent(email) {
  const response = await requestJson("/auth/register-parent", {
    body: JSON.stringify({ email, locale: "ru", password }),
    method: "POST",
  });
  assert.equal(response.status, 201);
  return response.body.data;
}

async function createFamily(accessToken, displayName) {
  const response = await requestJson("/family-setup/family", {
    body: JSON.stringify({ displayName }),
    headers: authHeader(accessToken),
    method: "POST",
  });
  assert.equal(response.status, 201);
  return response.body.data.family;
}

async function createChild(accessToken, nickname) {
  const response = await requestJson("/family-setup/children", {
    body: JSON.stringify({ gradeLevel: 8, locale: "ru", nickname }),
    headers: authHeader(accessToken),
    method: "POST",
  });
  assert.equal(response.status, 201);
  return response.body.data.child;
}

async function createSession(accessToken, childProfileId) {
  const response = await requestJson("/homework/sessions", {
    body: JSON.stringify({ childProfileId, gradeLevel: 8, sourceType: "IMAGE", subject: "math" }),
    headers: authHeader(accessToken),
    method: "POST",
  });
  assert.equal(response.status, 201);
  return response.body.data.session;
}

async function createMediaAsset(accessToken, sessionId, input) {
  const response = await requestJson(`/homework/sessions/${sessionId}/media-assets`, {
    body: JSON.stringify(input),
    headers: authHeader(accessToken),
    method: "POST",
  });
  assert.equal(response.status, 201);
  return response.body.data.mediaAsset;
}

function assertMetadataOnly(value) {
  const serialized = JSON.stringify(value);
  const lower = serialized.toLowerCase();
  for (const term of forbiddenResponseTerms) {
    assert.equal(lower.includes(term.toLowerCase()), false);
  }
}

before(async () => {
  await cleanupSyntheticUsers();
  server = spawn(process.execPath, ["dist/main.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      API_PORT: String(apiPort),
      AUTH_TOKEN_SECRET: authSecret,
      DATABASE_URL: databaseUrl,
      MEDIA_MAX_FILE_SIZE_BYTES: "64",
      NODE_ENV: "test",
      S3_ACCESS_KEY_ID: "learnika_local_minio",
      S3_BUCKET: "learnika-local",
      S3_ENDPOINT: "http://127.0.0.1:9000",
      S3_SECRET_ACCESS_KEY: "learnika_local_minio_password",
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
  if (server && server.exitCode === null) server.kill();
});

test("local media upload is authenticated tenant-safe validated and metadata-only", async () => {
  const syntheticId = "11111111-1111-4111-8111-111111111111";
  const unauthenticated = await upload(
    undefined,
    syntheticId,
    syntheticId,
    pngBytes,
    "image/png",
    originalFilename,
  );
  assert.equal(unauthenticated.status, 401);

  const parentA = await registerParent(parentAEmail);
  const parentB = await registerParent(parentBEmail);
  const tokenA = parentA.tokens.accessToken;
  const tokenB = parentB.tokens.accessToken;
  const familyA = await createFamily(tokenA, "Upload Family A");
  await createFamily(tokenB, "Upload Family B");
  const childA = await createChild(tokenA, childANickname);
  const childB = await createChild(tokenB, childBNickname);
  const sessionA = await createSession(tokenA, childA.id);
  const sessionB = await createSession(tokenB, childB.id);

  const mediaB = await createMediaAsset(tokenB, sessionB.id, {
    assetKind: "HOMEWORK_IMAGE",
    mimeType: "image/png",
    sizeBytes: pngBytes.byteLength,
  });
  const crossFamily = await upload(
    tokenA,
    sessionB.id,
    mediaB.id,
    pngBytes,
    "image/png",
    originalFilename,
  );
  assert.equal(crossFamily.status, 404);
  for (const value of [sessionB.id, mediaB.id, childB.id, childBNickname]) {
    assert.equal(crossFamily.text.includes(value), false);
  }

  const imageAsset = await createMediaAsset(tokenA, sessionA.id, {
    assetKind: "HOMEWORK_IMAGE",
    mimeType: "image/png",
    sizeBytes: pngBytes.byteLength,
  });
  const imageUpload = await upload(
    tokenA,
    sessionA.id,
    imageAsset.id,
    pngBytes,
    "image/png",
    originalFilename,
  );
  assert.equal(imageUpload.status, 200);
  assert.equal(imageUpload.body.data.mediaAsset.id, imageAsset.id);
  assert.equal(imageUpload.body.data.mediaAsset.checksumSha256, sha256(pngBytes));
  assertMetadataOnly(imageUpload.body);
  assert.equal(imageUpload.text.includes(originalFilename), false);
  assert.equal(imageUpload.text.includes(pngBytes.toString("base64")), false);

  const storedImage = await prisma.mediaAsset.findUnique({ where: { id: imageAsset.id } });
  assert.ok(storedImage);
  assert.equal(storedImage.checksumSha256, sha256(pngBytes));
  assert.equal(Object.hasOwn(storedImage, "originalFilename"), false);

  const pdfAsset = await createMediaAsset(tokenA, sessionA.id, {
    assetKind: "HOMEWORK_PDF",
    checksumSha256: sha256(pdfBytes),
    mimeType: "application/pdf",
    sizeBytes: pdfBytes.byteLength,
  });
  const pdfUpload = await upload(
    tokenA,
    sessionA.id,
    pdfAsset.id,
    pdfBytes,
    "application/pdf",
    `${childANickname}-worksheet.pdf`,
  );
  assert.equal(pdfUpload.status, 200);
  assertMetadataOnly(pdfUpload.body);

  const invalidMimeAsset = await createMediaAsset(tokenA, sessionA.id, {
    assetKind: "HOMEWORK_IMAGE",
    mimeType: "image/png",
    sizeBytes: pngBytes.byteLength,
  });
  assert.equal(
    (
      await upload(
        tokenA,
        sessionA.id,
        invalidMimeAsset.id,
        pngBytes,
        "text/plain",
        originalFilename,
      )
    ).status,
    400,
  );

  const kindMismatchAsset = await createMediaAsset(tokenA, sessionA.id, {
    assetKind: "HOMEWORK_PDF",
    mimeType: "application/pdf",
    sizeBytes: pngBytes.byteLength,
  });
  assert.equal(
    (
      await upload(
        tokenA,
        sessionA.id,
        kindMismatchAsset.id,
        pngBytes,
        "image/png",
        originalFilename,
      )
    ).status,
    400,
  );

  const oversizedBytes = Buffer.concat([pngBytes, Buffer.alloc(49)]);
  const oversizedAsset = await createMediaAsset(tokenA, sessionA.id, {
    assetKind: "HOMEWORK_IMAGE",
    mimeType: "image/png",
    sizeBytes: 64,
  });
  assert.equal(oversizedBytes.byteLength, 65);
  assert.equal(
    (
      await upload(
        tokenA,
        sessionA.id,
        oversizedAsset.id,
        oversizedBytes,
        "image/png",
        originalFilename,
      )
    ).status,
    413,
  );

  const unsafeAssets = [];
  for (let index = 0; index < 4; index += 1) {
    unsafeAssets.push(
      await createMediaAsset(tokenA, sessionA.id, {
        assetKind: "HOMEWORK_IMAGE",
        mimeType: "image/png",
        sizeBytes: pngBytes.byteLength,
      }),
    );
  }
  const now = new Date();
  await prisma.mediaAsset.update({
    data: { deletionRequestedAt: now, retentionStatus: "DELETION_REQUESTED" },
    where: { id: unsafeAssets[0].id },
  });
  await prisma.mediaAsset.update({
    data: { retentionStatus: "RETENTION_EXPIRED", retentionUntil: new Date(now.getTime() - 1) },
    where: { id: unsafeAssets[1].id },
  });
  await prisma.mediaAsset.update({
    data: { deletedAt: now, retentionStatus: "DELETED" },
    where: { id: unsafeAssets[2].id },
  });
  await prisma.mediaAsset.update({
    data: { retentionUntil: new Date(now.getTime() - 1) },
    where: { id: unsafeAssets[3].id },
  });
  for (const unsafeAsset of unsafeAssets) {
    const response = await upload(
      tokenA,
      sessionA.id,
      unsafeAsset.id,
      pngBytes,
      "image/png",
      originalFilename,
    );
    assert.equal(response.status, 409);
    assertMetadataOnly(response.body);
  }

  const denied = await prisma.auditLog.findMany({
    where: {
      actorUserId: parentA.user.id,
      outcome: "DENIED",
      targetId: { in: [sessionB.id, mediaB.id] },
    },
  });
  assert.ok(denied.length >= 1);

  const openapi = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "..", "..", "packages", "contracts", "openapi.json"),
      "utf8",
    ),
  );
  const uploadPath = "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/upload";
  const operation = openapi.paths[uploadPath].post;
  assert.equal(
    operation.security.some((entry) => Object.hasOwn(entry, "bearerAuth")),
    true,
  );
  assert.ok(operation.requestBody.content["multipart/form-data"]);
  assert.equal(
    operation.responses[200].content["application/json"].schema.$ref.endsWith(
      "MediaAssetResponseDto",
    ),
    true,
  );
  assertMetadataOnly(operation);
  for (const forbiddenPath of ["download", "presign", "public-url", "signed-url"]) {
    assert.equal(
      Object.keys(openapi.paths).some((routePath) => routePath.includes(forbiddenPath)),
      false,
    );
  }

  const output = serverOutput.join("");
  for (const leakedValue of [
    password,
    tokenA,
    tokenB,
    parentAEmail,
    parentBEmail,
    childANickname,
    childBNickname,
    originalFilename,
    authSecret,
    imageAsset.storageKey,
    pdfAsset.storageKey,
    pngBytes.toString("base64"),
    "Bearer",
    "Authorization",
    "Cookie",
    "learnika_local_minio_password",
  ]) {
    assert.equal(output.includes(leakedValue), false);
  }
  assert.equal(imageUpload.body.data.mediaAsset.familyId, familyA.id);
});
