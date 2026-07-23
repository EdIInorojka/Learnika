import assert from "node:assert/strict";
import fs from "node:fs";
import { createServer } from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, test } from "node:test";
import { URL } from "node:url";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const apiPortRangeStart = 5800;
const apiPortRangeSize = 500;
const startupDiagnosticMaxChars = 2_048;
const runId = Date.now();
const parentAEmail = `mock-ocr-parent-a-${runId}@example.test`;
const parentBEmail = `mock-ocr-parent-b-${runId}@example.test`;
const childANickname = `MockOcrLearnerA${runId}`;
const childBNickname = `MockOcrLearnerB${runId}`;
const password = "SyntheticParentPassword42!";
const candidateText = "2x + 3 = 7";
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://learnika_local:learnika_local_password@127.0.0.1:5432/learnika_local";
const authSecret = "learnika_test_mock_ocr_candidate_secret_local_only";
const routeTemplate =
  "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/mock-ocr-candidate";
const forbiddenResponseTerms = [
  "answer",
  "base64",
  "completion",
  "finalAnswer",
  "fullSolution",
  "generatedHint",
  "hintText",
  "llm",
  "originalFilename",
  "prompt",
  "providerName",
  "providerPayload",
  "rawMedia",
  "solution",
  "storageKey",
  "transcript",
];

process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});
const serverOutput = [];
let apiPort;
let baseUrl;
let server;

function authHeader(accessToken) {
  return { authorization: `Bearer ${accessToken}` };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sensitiveDiagnosticValues() {
  const values = [
    password,
    candidateText,
    parentAEmail,
    parentBEmail,
    childANickname,
    childBNickname,
    authSecret,
    databaseUrl,
  ];

  for (const [key, value] of Object.entries(process.env)) {
    if (
      /AUTHORIZATION|COOKIE|DATABASE_URL|EMAIL|NICKNAME|PASSWORD|SECRET|STORAGE_KEY|TOKEN/i.test(
        key,
      ) &&
      typeof value === "string"
    ) {
      values.push(value);
    }
  }

  for (const value of [databaseUrl, process.env.DATABASE_URL]) {
    if (!value) {
      continue;
    }
    try {
      const parsed = new URL(value);
      values.push(decodeURIComponent(parsed.username), decodeURIComponent(parsed.password));
    } catch {
      values.push(value);
    }
  }

  return [
    ...new Set(values.filter((value) => typeof value === "string" && value.length >= 4)),
  ].sort((left, right) => right.length - left.length);
}

function sanitizeServerOutput(rawOutput) {
  let sanitized = String(rawOutput);

  for (const value of sensitiveDiagnosticValues()) {
    sanitized = sanitized.replace(new RegExp(escapeRegExp(value), "g"), "[redacted]");
  }

  sanitized = sanitized
    .replace(/\bBearer\s+[^\s,;]+/gi, "[redacted-auth]")
    .replace(/\b(?:set-)?cookie\s*[:=]\s*[^\r\n]*/gi, "[redacted-header]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]")
    .replace(/\bpostgres(?:ql)?:\/\/[^\s"'`]+/gi, "[redacted-database-url]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[redacted-token]")
    .replace(/\b(?:families|children)\/[^\s"'`]+/gi, "[redacted-storage-key]")
    .replace(
      /\b(authorization|candidateText|childNickname|databaseUrl|email|mediaBinary|ocrText|password|providerPayload|rawMedia|secret|storageKey|token)\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;}]+)/gi,
      "$1=[redacted]",
    )
    .trim();

  if (!sanitized) {
    return "[no server output captured]";
  }
  if (sanitized.length <= startupDiagnosticMaxChars) {
    return sanitized;
  }
  return `[truncated]\n${sanitized.slice(-startupDiagnosticMaxChars)}`;
}

function apiStartupError(reason, rawOutput = serverOutput.join("")) {
  return new Error(
    `${reason}\nSanitized server output (bounded):\n${sanitizeServerOutput(rawOutput)}`,
  );
}

function canBindApiPort(port) {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.unref();
    probe.once("error", () => resolve(false));
    probe.listen({ exclusive: true, host: "127.0.0.1", port }, () => {
      probe.close((error) => resolve(error === undefined));
    });
  });
}

async function selectAvailableApiPort() {
  const firstOffset = process.pid % apiPortRangeSize;
  for (let offset = 0; offset < apiPortRangeSize; offset += 1) {
    const candidate = apiPortRangeStart + ((firstOffset + offset) % apiPortRangeSize);
    if (await canBindApiPort(candidate)) {
      return candidate;
    }
  }
  throw new Error("No available port exists in the isolated mock OCR E2E range.");
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
      throw apiStartupError(`API server exited early with code ${server.exitCode}.`);
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
  throw apiStartupError("API server did not become healthy.");
}

async function request(urlPath, init = {}) {
  const response = await fetch(`${baseUrl}${urlPath}`, {
    ...init,
    headers: {
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
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

async function createHomeworkSession(accessToken, childProfileId) {
  const response = await request("/homework/sessions", {
    body: JSON.stringify({ childProfileId, sourceType: "IMAGE", subject: "math" }),
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
      checksumSha256: "a".repeat(64),
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

async function candidateRequest(accessToken, sessionId, mediaAssetId, body) {
  return request(
    `/homework/sessions/${sessionId}/media-assets/${mediaAssetId}/mock-ocr-candidate`,
    {
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      ...(accessToken ? { headers: authHeader(accessToken) } : {}),
      method: "POST",
    },
  );
}

function assertNoForbiddenResponse(value) {
  const lower = JSON.stringify(value).toLowerCase();
  for (const term of forbiddenResponseTerms) {
    assert.equal(lower.includes(term.toLowerCase()), false, term);
  }
}

function assertCandidateResponse(response, mediaAssetId) {
  assert.equal(response.status, 200);
  const candidate = response.body.data.candidate;
  assert.equal(candidate.status, "CANDIDATE_REQUIRES_CONFIRMATION");
  assert.equal(candidate.mediaAssetId, mediaAssetId);
  assert.equal(candidate.learnerConfirmationRequired, true);
  assert.equal(candidate.downstreamUseAllowed, false);
  assert.equal(candidate.objectExistence, "UNKNOWN_NOT_VERIFIED");
  assert.equal(candidate.metadataOnly, true);
  assert.equal(candidate.candidates.length, 1);
  assert.equal(candidate.candidates[0].trust, "UNTRUSTED_OCR_CANDIDATE");
  assert.equal(candidate.candidates[0].text, candidateText);
  assertNoForbiddenResponse(candidate);
}

before(async () => {
  await cleanupSyntheticUsers();
  apiPort = await selectAvailableApiPort();
  baseUrl = `http://127.0.0.1:${apiPort}`;
  server = spawn(process.execPath, ["dist/main.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      API_PORT: String(apiPort),
      AUTH_TOKEN_SECRET: authSecret,
      DATABASE_URL: databaseUrl,
      NODE_ENV: "test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (chunk) => serverOutput.push(String(chunk)));
  server.stderr.on("data", (chunk) => serverOutput.push(String(chunk)));
  server.on("error", (error) => serverOutput.push(`${error.name}: ${error.message}`));
  await waitForApi();
});

after(async () => {
  await cleanupSyntheticUsers();
  await prisma.$disconnect();
  if (server && server.exitCode === null) {
    server.kill();
  }
});

test("mock OCR candidate API is tenant-safe untrusted read-only and scope-limited", async () => {
  const syntheticId = "11111111-1111-4111-8111-111111111111";
  assert.equal((await candidateRequest(undefined, syntheticId, syntheticId)).status, 401);

  const parentA = await registerParent(parentAEmail);
  const parentB = await registerParent(parentBEmail);
  const tokenA = parentA.tokens.accessToken;
  const tokenB = parentB.tokens.accessToken;
  const familyA = await createFamily(tokenA, "Mock OCR Family A");
  const familyB = await createFamily(tokenB, "Mock OCR Family B");
  const childA = await createChild(tokenA, childANickname);
  const childB = await createChild(tokenB, childBNickname);
  const sessionA = await createHomeworkSession(tokenA, childA.id);
  const sessionB = await createHomeworkSession(tokenB, childB.id);

  const image = await createMediaAsset(tokenA, sessionA.id);
  const storedBefore = await prisma.mediaAsset.findUniqueOrThrow({ where: { id: image.id } });
  const imageCandidate = await candidateRequest(tokenA, sessionA.id, image.id);
  assertCandidateResponse(imageCandidate, image.id);
  const storedAfter = await prisma.mediaAsset.findUniqueOrThrow({ where: { id: image.id } });
  assert.deepEqual(storedAfter, storedBefore);
  assert.equal(
    JSON.stringify(storedAfter, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ).includes(candidateText),
    false,
  );

  const screenshot = await createMediaAsset(tokenA, sessionA.id, {
    assetKind: "HOMEWORK_SCREENSHOT",
    checksumSha256: "b".repeat(64),
    mimeType: "image/webp",
  });
  assertCandidateResponse(
    await candidateRequest(tokenA, sessionA.id, screenshot.id),
    screenshot.id,
  );

  const pdf = await createMediaAsset(tokenA, sessionA.id, {
    assetKind: "HOMEWORK_PDF",
    checksumSha256: "c".repeat(64),
    mimeType: "application/pdf",
  });
  assertCandidateResponse(await candidateRequest(tokenA, sessionA.id, pdf.id), pdf.id);

  const mediaB = await createMediaAsset(tokenB, sessionB.id);
  const crossFamily = await candidateRequest(tokenA, sessionB.id, mediaB.id);
  assert.equal(crossFamily.status, 404);
  for (const value of [mediaB.id, sessionB.id, familyB.id, childB.id, childBNickname]) {
    assert.equal(crossFamily.text.includes(value), false);
  }

  const unsupported = await prisma.mediaAsset.create({
    data: {
      assetKind: "OTHER",
      checksumSha256: "d".repeat(64),
      childProfileId: childA.id,
      createdByUserId: parentA.user.id,
      familyId: familyA.id,
      homeworkSessionId: sessionA.id,
      mimeType: "application/octet-stream",
      retentionStatus: "TEMPORARY",
      retentionUntil: new Date(Date.now() + 60_000),
      sizeBytes: 512n,
    },
  });
  assert.equal((await candidateRequest(tokenA, sessionA.id, unsupported.id)).status, 409);

  const unsafe = await createMediaAsset(tokenA, sessionA.id);
  await prisma.mediaAsset.update({
    data: { deletionRequestedAt: new Date(), retentionStatus: "DELETION_REQUESTED" },
    where: { id: unsafe.id },
  });
  assert.equal((await candidateRequest(tokenA, sessionA.id, unsafe.id)).status, 409);

  const notReady = await createMediaAsset(tokenA, sessionA.id, { checksumSha256: undefined });
  assert.equal((await candidateRequest(tokenA, sessionA.id, notReady.id)).status, 409);

  const lowConfidence = await candidateRequest(tokenA, sessionA.id, image.id, {
    mockFixtureId: "low-confidence-equation",
  });
  assert.equal(lowConfidence.status, 200);
  assert.equal(lowConfidence.body.data.candidate.status, "NEEDS_REVIEW");
  assert.equal(lowConfidence.body.data.candidate.reason, "LOW_CONFIDENCE");
  assert.equal(lowConfidence.body.data.candidate.learnerConfirmationRequired, true);
  assert.equal(lowConfidence.body.data.candidate.downstreamUseAllowed, false);
  assert.equal(Object.hasOwn(lowConfidence.body.data.candidate, "candidates"), false);
  assert.equal(lowConfidence.text.includes(candidateText), false);
  assertNoForbiddenResponse(lowConfidence.body.data.candidate);

  const mockFailure = await candidateRequest(tokenA, sessionA.id, image.id, {
    mockFixtureId: "provider-failure",
  });
  assert.equal(mockFailure.status, 200);
  assert.equal(mockFailure.body.data.candidate.status, "FAILED");
  assert.equal(mockFailure.body.data.candidate.reason, "PROVIDER_FAILURE");
  assert.equal(mockFailure.body.data.candidate.learnerConfirmationRequired, true);
  assert.equal(mockFailure.body.data.candidate.downstreamUseAllowed, false);
  assert.equal(Object.hasOwn(mockFailure.body.data.candidate, "candidates"), false);
  assert.equal(Object.hasOwn(mockFailure.body.data.candidate, "providerPayload"), false);

  const forbiddenBody = await candidateRequest(tokenA, sessionA.id, image.id, {
    answer: "synthetic answer",
    mockFixtureId: "clear-linear-equation",
  });
  assert.equal(forbiddenBody.status, 400);
  assert.equal(forbiddenBody.text.includes("synthetic answer"), false);

  const denied = await prisma.auditLog.findMany({
    where: {
      actorUserId: parentA.user.id,
      outcome: "DENIED",
      targetId: { in: [sessionB.id, mediaB.id] },
    },
  });
  assert.ok(denied.length >= 1);

  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const openapi = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "packages", "contracts", "openapi.json"), "utf8"),
  );
  const operation = openapi.paths[routeTemplate]?.post;
  assert.ok(operation);
  assert.equal(
    operation.security.some((entry) => Object.hasOwn(entry, "bearerAuth")),
    true,
  );
  assert.equal(operation.requestBody.required, false);
  assert.deepEqual(
    openapi.components.schemas.MockOcrCandidateRequestDto.properties.mockFixtureId.enum,
    ["clear-linear-equation", "low-confidence-equation", "provider-failure"],
  );
  const publicContract = JSON.stringify([
    operation,
    openapi.components.schemas.MockOcrCandidateSummaryDto,
    openapi.components.schemas.MockOcrCandidateTextDto,
  ]).toLowerCase();
  for (const forbidden of forbiddenResponseTerms) {
    assert.equal(publicContract.includes(forbidden.toLowerCase()), false, forbidden);
  }

  const source = fs.readFileSync(
    path.join(process.cwd(), "src", "media-assets", "mock-ocr-candidate.service.ts"),
    "utf8",
  );
  for (const forbiddenOperation of [
    "getObject(",
    "statObject(",
    "listObjects(",
    "removeObject(",
    "presignedGetObject(",
    ".create({ data: { candidate",
    ".update({ data: { candidate",
    ".transcribe(",
    ".complete(",
  ]) {
    assert.equal(source.includes(forbiddenOperation), false, forbiddenOperation);
  }

  const output = serverOutput.join("");
  for (const leakedValue of [
    candidateText,
    parentAEmail,
    parentBEmail,
    childANickname,
    childBNickname,
    tokenA,
    tokenB,
    authSecret,
    "Bearer",
    "Authorization",
    "Cookie",
  ]) {
    assert.equal(output.includes(leakedValue), false);
  }
});

test("early API exit diagnostics are bounded and sanitize forbidden values", () => {
  const rawDiagnostic = [
    `Bearer synthetic-header-token`,
    `Cookie: session=synthetic-cookie`,
    parentAEmail,
    parentBEmail,
    childANickname,
    childBNickname,
    authSecret,
    databaseUrl,
    candidateText,
    "password=synthetic-database-password",
    "storageKey=families/11111111-1111-4111-8111-111111111111/raw.png",
    'providerPayload={"rawMedia":"synthetic-provider-data"}',
    "EADDRINUSE: address already in use",
  ].join("\n");
  const error = apiStartupError("API server exited early with code 1.", rawDiagnostic);
  const diagnostic = error.message.split("Sanitized server output (bounded):\n")[1];
  const bounded = sanitizeServerOutput(
    `${"x".repeat(startupDiagnosticMaxChars * 2)}\nEADDRINUSE: address already in use`,
  );

  assert.match(error.message, /API server exited early with code 1\./);
  assert.match(diagnostic, /EADDRINUSE/);
  assert.match(bounded, /^\[truncated\]\n/);
  assert.match(bounded, /EADDRINUSE/);
  assert.ok(bounded.length <= startupDiagnosticMaxChars + "[truncated]\n".length);
  for (const forbiddenValue of [
    "Bearer",
    "Cookie",
    "synthetic-header-token",
    "synthetic-cookie",
    parentAEmail,
    parentBEmail,
    childANickname,
    childBNickname,
    authSecret,
    databaseUrl,
    "learnika_local_password",
    candidateText,
    "synthetic-database-password",
    "families/11111111-1111-4111-8111-111111111111/raw.png",
    "synthetic-provider-data",
  ]) {
    assert.equal(diagnostic.includes(forbiddenValue), false);
  }
});
