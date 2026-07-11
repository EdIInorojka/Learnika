import { BadRequestException } from "@nestjs/common";

export interface CreateHomeworkSessionInput {
  childProfileId: string;
  gradeLevel?: number;
  sourceType: "IMAGE" | "MANUAL" | "PDF" | "SCREENSHOT" | "UNKNOWN";
  subject: "math";
}

export interface CreateHomeworkAttemptInput {
  status: "CREATED";
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const supportedSourceTypes = new Set(["IMAGE", "MANUAL", "PDF", "SCREENSHOT", "UNKNOWN"]);
const allowedSessionKeys = new Set(["childProfileId", "gradeLevel", "sourceType", "subject"]);
const allowedAttemptKeys = new Set(["status"]);
const forbiddenFieldPattern =
  /answer|completion|exactsolution|finalanswer|fullsolution|generatedhint|hinttext|llmcompletion|llmprompt|media|modeloutput|ocr|prompt|providerpayload|raw|solution|stt|textbookcontent|transcript|upload/i;

function invalid(message: string): never {
  throw new BadRequestException({
    code: "HOMEWORK_INVALID_INPUT",
    message,
  });
}

function asRecord(value: unknown, allowEmpty = false): Record<string, unknown> {
  if (allowEmpty && value === undefined) {
    return {};
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    invalid("Request body is invalid.");
  }

  return value as Record<string, unknown>;
}

function optionalTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function parseGradeLevel(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^[0-9]+$/.test(value.trim())
        ? Number.parseInt(value.trim(), 10)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 7 || parsed > 9) {
    invalid("Grade level must be between 7 and 9.");
  }

  return parsed;
}

function assertAllowedKeys(body: Record<string, unknown>, allowedKeys: ReadonlySet<string>): void {
  rejectForbiddenFields(body);

  for (const key of Object.keys(body)) {
    if (!allowedKeys.has(key)) {
      invalid("Request body contains an unsupported field.");
    }
  }
}

function rejectForbiddenFields(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      rejectForbiddenFields(item);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    if (forbiddenFieldPattern.test(key)) {
      invalid("Request body contains a forbidden field.");
    }

    rejectForbiddenFields(item);
  }
}

export function parseCreateHomeworkSessionInput(value: unknown): CreateHomeworkSessionInput {
  const body = asRecord(value);
  assertAllowedKeys(body, allowedSessionKeys);

  const childProfileId = parseIdParam(body.childProfileId, "Child profile identifier");
  const subject = optionalTrimmedString(body.subject) ?? "math";

  if (subject !== "math") {
    invalid("Subject is not supported in Slice 10.");
  }

  const sourceType = optionalTrimmedString(body.sourceType) ?? "UNKNOWN";

  if (!supportedSourceTypes.has(sourceType)) {
    invalid("Homework source type is invalid.");
  }

  const gradeLevel = parseGradeLevel(body.gradeLevel);

  return {
    childProfileId,
    sourceType: sourceType as CreateHomeworkSessionInput["sourceType"],
    subject: "math",
    ...(gradeLevel === undefined ? {} : { gradeLevel }),
  };
}

export function parseCreateHomeworkAttemptInput(value: unknown): CreateHomeworkAttemptInput {
  const body = asRecord(value, true);
  assertAllowedKeys(body, allowedAttemptKeys);

  const status = optionalTrimmedString(body.status) ?? "CREATED";

  if (status !== "CREATED") {
    invalid("Homework attempt status is invalid for metadata creation.");
  }

  return { status: "CREATED" };
}

export function parseOptionalChildProfileQuery(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return parseIdParam(value, "Child profile identifier");
}

export function parseIdParam(value: unknown, fieldName = "Identifier"): string {
  if (typeof value !== "string" || !uuidPattern.test(value)) {
    invalid(`${fieldName} is invalid.`);
  }

  return value;
}
