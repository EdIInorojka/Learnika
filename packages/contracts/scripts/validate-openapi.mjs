import { readFile } from "node:fs/promises";
import { URL } from "node:url";

const openApiPath = new URL("../openapi.json", import.meta.url);
const requiredPaths = [
  "/health/live",
  "/health/ready",
  "/auth/register-parent",
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
  "/auth/me",
  "/family-setup/family",
  "/family-setup/children",
  "/family-setup/consents",
  "/family-setup/consent-status",
  "/family-setup/children/{childProfileId}/learning-context",
  "/family-setup/status",
  "/homework/sessions",
  "/homework/sessions/{homeworkSessionId}",
  "/homework/sessions/{homeworkSessionId}/attempts",
];
const protectedOperations = [
  ["post", "/auth/logout"],
  ["get", "/auth/me"],
  ["get", "/family-setup/family"],
  ["post", "/family-setup/family"],
  ["get", "/family-setup/children"],
  ["post", "/family-setup/children"],
  ["post", "/family-setup/consents"],
  ["get", "/family-setup/consent-status"],
  ["put", "/family-setup/children/{childProfileId}/learning-context"],
  ["get", "/family-setup/status"],
  ["post", "/homework/sessions"],
  ["get", "/homework/sessions"],
  ["get", "/homework/sessions/{homeworkSessionId}"],
  ["post", "/homework/sessions/{homeworkSessionId}/attempts"],
  ["get", "/homework/sessions/{homeworkSessionId}/attempts"],
];
const forbiddenPathFragments = [
  "admin",
  "asset",
  "billing",
  "hint",
  "llm",
  "media",
  "ocr",
  "school",
  "stt",
  "teacher",
  "upload",
  "voice",
];
const allowedHomeworkPaths = new Set([
  "/homework/sessions",
  "/homework/sessions/{homeworkSessionId}",
  "/homework/sessions/{homeworkSessionId}/attempts",
]);
const forbiddenContractTerms = [
  "AUTH_TOKEN_SECRET",
  "Cookie",
  "exactSolution",
  "finalAnswer",
  "fullSolution",
  "generatedHint",
  "learnika_local_password",
  "llmCompletion",
  "llmPrompt",
  "modelOutput",
  "ocrResult",
  "passwordHash",
  "providerPayload",
  "rawMedia",
  "refreshTokenHash",
  "accessTokenHash",
  "solutionText",
  "sourceAnswer",
  "sttResult",
  "textbookContent",
  "transcript",
];

function fail(message) {
  console.error(`[contracts] ${message}`);
  process.exitCode = 1;
}

function operationHasBearerAuth(operation) {
  return Array.isArray(operation.security)
    ? operation.security.some((entry) => Object.hasOwn(entry, "bearerAuth"))
    : false;
}

const raw = await readFile(openApiPath, "utf8");
const spec = JSON.parse(raw);

if (spec.openapi !== "3.0.0") {
  fail(`Expected OpenAPI 3.0.0, found ${String(spec.openapi)}.`);
}

for (const requiredPath of requiredPaths) {
  if (!spec.paths?.[requiredPath]) {
    fail(`Missing required path: ${requiredPath}`);
  }
}

for (const pathName of Object.keys(spec.paths ?? {})) {
  const normalized = pathName.toLowerCase();

  if (normalized.startsWith("/homework") && !allowedHomeworkPaths.has(pathName)) {
    fail(`Forbidden future-scope homework path is documented: ${pathName}`);
  }

  if (forbiddenPathFragments.some((fragment) => normalized.includes(fragment))) {
    fail(`Forbidden future-scope path is documented: ${pathName}`);
  }
}

for (const [method, pathName] of protectedOperations) {
  const operation = spec.paths?.[pathName]?.[method];

  if (!operation) {
    fail(`Missing protected operation: ${method.toUpperCase()} ${pathName}`);
    continue;
  }

  if (!operationHasBearerAuth(operation)) {
    fail(`Missing bearer auth metadata: ${method.toUpperCase()} ${pathName}`);
  }
}

if (spec.components?.securitySchemes?.bearerAuth?.scheme !== "bearer") {
  fail("Missing bearerAuth security scheme.");
}

for (const forbiddenTerm of forbiddenContractTerms) {
  if (raw.includes(forbiddenTerm)) {
    fail(`Forbidden sensitive term appears in OpenAPI artifact: ${forbiddenTerm}`);
  }
}

if (process.exitCode) {
  process.exit();
}

console.log("[contracts] OpenAPI scope and privacy validation passed.");
