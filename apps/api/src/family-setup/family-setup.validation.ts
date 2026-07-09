import { BadRequestException } from "@nestjs/common";

export type ConsentSubjectTypeInput = "CHILD" | "FAMILY";

export interface ChildProfileInput {
  gradeLevel: number;
  locale: string;
  nickname: string;
}

export interface ConsentInput {
  childProfileId?: string;
  documentVersion: string;
  policyVersion: string;
  purpose: string;
  subjectType: ConsentSubjectTypeInput;
}

export interface FamilyInput {
  displayName?: string;
}

export interface LearningContextInput {
  gradeLevel: number;
  subject: string;
  textbookCode: string;
}

function invalid(message: string): never {
  throw new BadRequestException({
    code: "FAMILY_SETUP_INVALID_INPUT",
    message,
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    invalid("Request body is invalid.");
  }

  return value as Record<string, unknown>;
}

function optionalTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function requiredTrimmedString(value: unknown, fieldName: string): string {
  const trimmed = optionalTrimmedString(value);

  if (!trimmed) {
    invalid(`${fieldName} is required.`);
  }

  return trimmed;
}

function parseGradeLevel(value: unknown): number {
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

export function parseFamilyInput(value: unknown): FamilyInput {
  const body = asRecord(value);
  const displayName = optionalTrimmedString(body.displayName);

  if (displayName && displayName.length > 120) {
    invalid("Family display name is invalid.");
  }

  return displayName ? { displayName } : {};
}

export function parseChildProfileInput(value: unknown): ChildProfileInput {
  const body = asRecord(value);
  const nickname = requiredTrimmedString(body.nickname, "Nickname");
  const locale = optionalTrimmedString(body.locale) ?? "ru";

  if (nickname.length > 120) {
    invalid("Nickname is invalid.");
  }

  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
    invalid("Locale is invalid.");
  }

  return {
    gradeLevel: parseGradeLevel(body.gradeLevel),
    locale,
    nickname,
  };
}

export function parseConsentInput(value: unknown): ConsentInput {
  const body = asRecord(value);
  const subjectType = requiredTrimmedString(body.subjectType, "Consent subject type");

  if (subjectType !== "CHILD" && subjectType !== "FAMILY") {
    invalid("Consent subject type is invalid.");
  }

  const input: ConsentInput = {
    documentVersion: requiredTrimmedString(body.documentVersion, "Document version"),
    policyVersion: requiredTrimmedString(body.policyVersion, "Policy version"),
    purpose: requiredTrimmedString(body.purpose, "Purpose"),
    subjectType,
  };
  const childProfileId = optionalTrimmedString(body.childProfileId);

  if (childProfileId) {
    input.childProfileId = childProfileId;
  }

  if (input.documentVersion.length > 80 || input.policyVersion.length > 80) {
    invalid("Consent version metadata is invalid.");
  }

  if (input.purpose.length > 80) {
    invalid("Consent purpose is invalid.");
  }

  if (input.subjectType === "CHILD" && !input.childProfileId) {
    invalid("Child consent requires a child profile.");
  }

  if (input.subjectType === "FAMILY" && input.childProfileId) {
    invalid("Family consent cannot reference a child profile.");
  }

  return input;
}

export function parseLearningContextInput(value: unknown): LearningContextInput {
  const body = asRecord(value);
  const subject = requiredTrimmedString(body.subject, "Subject");
  const textbookCode = requiredTrimmedString(body.textbookCode, "Textbook code");

  if (subject !== "math") {
    invalid("Subject is not supported in Slice 6.");
  }

  if (textbookCode.length > 120 || !/^[a-zA-Z0-9._:-]+$/.test(textbookCode)) {
    invalid("Textbook code is invalid.");
  }

  return {
    gradeLevel: parseGradeLevel(body.gradeLevel),
    subject,
    textbookCode,
  };
}

export function parseIdParam(value: string | undefined, fieldName = "Identifier"): string {
  if (
    !value ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    invalid(`${fieldName} is invalid.`);
  }

  return value;
}
