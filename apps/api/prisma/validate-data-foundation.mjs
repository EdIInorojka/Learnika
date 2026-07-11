import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prismaDir = path.dirname(fileURLToPath(import.meta.url));
const schema = fs.readFileSync(path.join(prismaDir, "schema.prisma"), "utf8");

const requiredModels = [
  "User",
  "AuthSession",
  "Family",
  "FamilyMember",
  "ChildProfile",
  "ConsentRecord",
  "TextbookSelection",
  "HomeworkSession",
  "HomeworkAttempt",
  "MediaAsset",
  "AuditLog",
];
const requiredEnums = [
  "UserRole",
  "FamilyMemberRole",
  "ConsentSubjectType",
  "AuditActorType",
  "AuditOutcome",
  "HomeworkSessionStatus",
  "HomeworkSourceType",
  "HomeworkAttemptStatus",
  "MediaAssetKind",
  "MediaRetentionStatus",
];
const forbiddenModels = [
  "Organization",
  "SchoolClass",
  "Enrollment",
  "HomeworkUpload",
  "HomeworkAsset",
  "VoiceInputSession",
  "PaymentReference",
  "Subscription",
  "ProviderRequest",
];
const forbiddenFieldNames = [
  "answer",
  "solution",
  "hint",
  "transcript",
  "ocrResult",
  "sttResult",
  "llmPrompt",
  "llmCompletion",
  "providerPayload",
];
const forbiddenRoutePrefixes = ["/voice", "/assets", "/billing", "/school", "/teacher", "/admin"];
const allowedHomeworkRoutes = new Set([
  "/homework/sessions",
  "/homework/sessions/{homeworkSessionId}",
  "/homework/sessions/{homeworkSessionId}/attempts",
]);
const requiredSnippets = [
  "model FamilyMember",
  "model AuthSession",
  "passwordHash",
  "accessTokenHash",
  "refreshTokenHash",
  "@@unique([familyId, userId])",
  "model ChildProfile",
  "familyId",
  "model ConsentRecord",
  "policyVersion",
  "documentVersion",
  "model TextbookSelection",
  "model HomeworkSession",
  "childProfileId",
  "sourceType",
  "model HomeworkAttempt",
  "homeworkSessionId",
  "@@unique([homeworkSessionId, attemptNumber])",
  "model MediaAsset",
  "assetKind",
  "storageKey",
  "mimeType",
  "sizeBytes",
  "retentionStatus",
  "retentionUntil",
  "deletedAt",
  "model AuditLog",
];

function assert(condition, message) {
  if (!condition) {
    console.error(`[db] ${message}`);
    process.exit(1);
  }
}

for (const model of requiredModels) {
  assert(schema.includes(`model ${model} `), `Missing required model ${model}.`);
}

for (const enumName of requiredEnums) {
  assert(schema.includes(`enum ${enumName} `), `Missing required enum ${enumName}.`);
}

for (const forbiddenModel of forbiddenModels) {
  assert(!schema.includes(`model ${forbiddenModel} `), `Forbidden model ${forbiddenModel} exists.`);
}

for (const snippet of requiredSnippets) {
  assert(schema.includes(snippet), `Missing tenant or versioning schema snippet: ${snippet}`);
}

for (const fieldName of forbiddenFieldNames) {
  const fieldPattern = new RegExp(`^\\s*${fieldName}\\s+`, "im");
  assert(!fieldPattern.test(schema), `Forbidden homework/media field ${fieldName} exists.`);
}

const openapiPath = path.resolve(prismaDir, "../../../packages/contracts/openapi.json");
if (fs.existsSync(openapiPath)) {
  const openapi = JSON.parse(fs.readFileSync(openapiPath, "utf8"));
  const paths = Object.keys(openapi.paths ?? {});
  for (const routePath of paths) {
    assert(
      !routePath.startsWith("/homework") || allowedHomeworkRoutes.has(routePath),
      `Forbidden future homework API route ${routePath} exists in OpenAPI contracts.`,
    );
  }
  for (const routePrefix of forbiddenRoutePrefixes) {
    assert(
      !paths.some((routePath) => routePath.startsWith(routePrefix)),
      `Forbidden future API route ${routePrefix} exists in OpenAPI contracts.`,
    );
  }
}

assert(
  !fs.existsSync(path.join(prismaDir, "seed.mjs")),
  "Seed script exists; the current foundation uses no seed data.",
);

console.log(
  "[db] Prisma schema includes family tenant, auth-session and homework/media metadata constraints.",
);
