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
  "AuditLog",
];
const requiredEnums = [
  "UserRole",
  "FamilyMemberRole",
  "ConsentSubjectType",
  "AuditActorType",
  "AuditOutcome",
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
const requiredSnippets = [
  "model FamilyMember",
  "model AuthSession",
  "passwordHash          String?",
  "accessTokenHash       String",
  "refreshTokenHash      String",
  "@@unique([familyId, userId])",
  "model ChildProfile",
  "familyId           String",
  "model ConsentRecord",
  "policyVersion   String",
  "documentVersion String",
  "model TextbookSelection",
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

assert(
  !fs.existsSync(path.join(prismaDir, "seed.mjs")),
  "Seed script exists; Slice 4 uses no seed data.",
);

console.log("[db] Prisma schema includes family tenant and auth-session constraints.");
