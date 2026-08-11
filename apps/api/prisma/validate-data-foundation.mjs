import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prismaDir = path.dirname(fileURLToPath(import.meta.url));
const schema = fs.readFileSync(path.join(prismaDir, "schema.prisma"), "utf8");
const seedPath = path.join(prismaDir, "seed.mjs");

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
  "SchoolOrganization",
  "School",
  "AcademicYear",
  "SchoolClass",
  "SchoolSubjectGroup",
  "SchoolTeacher",
  "SchoolStudent",
  "TeacherAssignment",
  "StudentEnrollment",
  "SchoolAssignment",
  "SchoolAssignmentTarget",
  "SchoolLicense",
  "SchoolEntitlement",
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
  "SchoolLicenseStatus",
  "SchoolAssignmentStatus",
  "SchoolAssignmentDeliveryMode",
  "SchoolAssignmentTargetState",
];
const forbiddenModels = [
  "Organization",
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
  "/homework/sessions/{homeworkSessionId}/media-assets",
  "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}",
  "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/mock-ocr-candidate",
  "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/retention",
  "/homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/upload",
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
  "model SchoolOrganization",
  "model School",
  "organizationId",
  "model AcademicYear",
  "startsOn",
  "endsOn",
  "model SchoolClass",
  "gradeLevel",
  "model SchoolSubjectGroup",
  "subjectCode",
  "model SchoolTeacher",
  "demoCode",
  "model SchoolStudent",
  "model TeacherAssignment",
  "schoolClassId",
  "schoolTeacherId",
  "model StudentEnrollment",
  "schoolStudentId",
  "model SchoolAssignment",
  "assignmentCode",
  "packageCode",
  "attemptLimit",
  "durationMinutes",
  "availabilityDays",
  "model SchoolAssignmentTarget",
  "schoolAssignmentId",
  "SchoolAssignmentStatus",
  "SchoolAssignmentDeliveryMode",
  "SchoolAssignmentTargetState",
  "model SchoolLicense",
  "licenseCode",
  "model SchoolEntitlement",
  "capabilityCode",
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

assert(fs.existsSync(seedPath), "Missing approved synthetic demo school seed entrypoint.");

const seedSource = fs.readFileSync(seedPath, "utf8");
const requiredSeedSnippets = [
  "SYNTHETIC_DEMO_SCHOOL_SEED",
  'marker: "SYNTHETIC_NON_PRODUCTION"',
  'locale: "ru-RU"',
  "export async function seedSyntheticDemoSchool",
  "isApprovedSyntheticSeedDatabase",
  'parsed.pathname === "/learnika_local"',
  ".upsert(",
  'status: "PLANNED"',
  "synthetic-demo-school-ru-ru",
  'code: "7А"',
  'code: "8А"',
  'code: "9А"',
];
const forbiddenSeedPatterns = [
  [/\brandomUUID\b|\bMath\.random\b|\bDate\.now\b/, "random or time-derived seed data"],
  [/\.(?:user|family|childProfile)\.(?:create|upsert|update)/, "family tenant mutation"],
  [/\b(?:email|phone|address|userId|familyId|childProfileId)\s*:/, "PII or family field"],
  [/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https?:\/\//, "email or URL-like value"],
];

for (const snippet of requiredSeedSnippets) {
  assert(seedSource.includes(snippet), `Missing synthetic seed safety snippet: ${snippet}`);
}

for (const [pattern, label] of forbiddenSeedPatterns) {
  assert(!pattern.test(seedSource), `Forbidden ${label} exists in synthetic seed.`);
}

console.log(
  "[db] Prisma schema and local-only synthetic school seed preserve family/school tenancy and homework/media constraints.",
);
