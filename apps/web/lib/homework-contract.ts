export const homeworkSourceTypes = ["IMAGE", "MANUAL", "PDF", "SCREENSHOT", "UNKNOWN"] as const;

export type HomeworkSourceType = (typeof homeworkSourceTypes)[number];
export type HomeworkSessionStatus =
  "CANCELLED" | "CLOSED" | "CREATED" | "PAUSED" | "WAITING_FOR_ATTEMPT";
export type HomeworkAttemptStatus = "CANCELLED" | "CREATED" | "SUBMITTED";

export interface CreateHomeworkSessionInput {
  childProfileId: string;
  gradeLevel: 7 | 8 | 9;
  sourceType: HomeworkSourceType;
  subject: "math";
}

export interface CreateHomeworkAttemptInput {
  status: "CREATED";
}

export interface ChildProfileChoice {
  gradeLevel: number | null;
  id: string;
}

export interface HomeworkSessionView {
  archivedAt: string | null;
  createdAt: string;
  gradeLevel: number | null;
  id: string;
  sourceType: HomeworkSourceType;
  status: HomeworkSessionStatus;
  subject: "math";
  updatedAt: string;
}

export interface HomeworkAttemptView {
  attemptNumber: number;
  createdAt: string;
  status: HomeworkAttemptStatus;
  updatedAt: string;
}

export class HomeworkContractError extends Error {
  constructor() {
    super("Homework metadata did not match the expected contract.");
    this.name = "HomeworkContractError";
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sourceTypeSet = new Set<string>(homeworkSourceTypes);
const sessionStatusSet = new Set<string>([
  "CANCELLED",
  "CLOSED",
  "CREATED",
  "PAUSED",
  "WAITING_FOR_ATTEMPT",
]);
const attemptStatusSet = new Set<string>(["CANCELLED", "CREATED", "SUBMITTED"]);
const forbiddenResponseKeyPattern =
  /answer|completion|hint|llm|media|ocr|prompt|provider|raw|solution|stt|textbook|transcript/i;
const allowedFormFields = new Set(["childProfileId", "gradeLevel", "sourceType"]);
const allowedAttemptFormFields = new Set<string>();

function invalid(): never {
  throw new HomeworkContractError();
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    invalid();
  }
  return value as Record<string, unknown>;
}

function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) invalid();
  return value;
}

function requiredString(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) invalid();
  return value;
}

function dateTime(value: unknown): string {
  const text = requiredString(value);
  if (!Number.isFinite(Date.parse(text))) invalid();
  return text;
}

function nullableDateTime(value: unknown): string | null {
  return value === null ? null : dateTime(value);
}

function nullableGradeLevel(value: unknown): number | null {
  if (value === null) return null;
  if (!Number.isInteger(value) || (value as number) < 7 || (value as number) > 9) invalid();
  return value as number;
}

function assertNoForbiddenResponseFields(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) assertNoForbiddenResponseFields(item);
    return;
  }
  if (typeof value !== "object" || value === null) return;

  for (const [key, item] of Object.entries(value)) {
    if (forbiddenResponseKeyPattern.test(key)) invalid();
    assertNoForbiddenResponseFields(item);
  }
}

function parseSession(value: unknown): HomeworkSessionView {
  const item = record(value);
  const sourceType = requiredString(item.sourceType);
  const status = requiredString(item.status);
  if (!sourceTypeSet.has(sourceType) || !sessionStatusSet.has(status) || item.subject !== "math") {
    invalid();
  }

  return {
    archivedAt: nullableDateTime(item.archivedAt),
    createdAt: dateTime(item.createdAt),
    gradeLevel: nullableGradeLevel(item.gradeLevel),
    id: parseHomeworkSessionId(item.id),
    sourceType: sourceType as HomeworkSourceType,
    status: status as HomeworkSessionStatus,
    subject: "math",
    updatedAt: dateTime(item.updatedAt),
  };
}

function parseAttempt(value: unknown): HomeworkAttemptView {
  const item = record(value);
  const status = requiredString(item.status);
  if (!attemptStatusSet.has(status) || !Number.isInteger(item.attemptNumber)) invalid();
  if ((item.attemptNumber as number) < 1) invalid();

  return {
    attemptNumber: item.attemptNumber as number,
    createdAt: dateTime(item.createdAt),
    status: status as HomeworkAttemptStatus,
    updatedAt: dateTime(item.updatedAt),
  };
}

export function parseHomeworkSessionId(value: unknown): string {
  const id = requiredString(value);
  if (!uuidPattern.test(id)) invalid();
  return id;
}

export function parseHomeworkSessionResponse(value: unknown): HomeworkSessionView {
  assertNoForbiddenResponseFields(value);
  return parseSession(record(record(value).data).session);
}

export function parseHomeworkSessionsResponse(value: unknown): HomeworkSessionView[] {
  assertNoForbiddenResponseFields(value);
  return array(record(record(value).data).sessions).map(parseSession);
}

export function parseHomeworkAttemptsResponse(value: unknown): HomeworkAttemptView[] {
  assertNoForbiddenResponseFields(value);
  return array(record(record(value).data).attempts).map(parseAttempt);
}

export function parseHomeworkAttemptResponse(value: unknown): HomeworkAttemptView {
  assertNoForbiddenResponseFields(value);
  return parseAttempt(record(record(value).data).attempt);
}

export function parseChildProfileChoices(value: unknown): ChildProfileChoice[] {
  const children = array(record(record(value).data).children);
  return children.flatMap((childValue) => {
    const child = record(childValue);
    if (child.archivedAt !== null) return [];
    return [
      {
        gradeLevel: nullableGradeLevel(child.gradeLevel),
        id: parseHomeworkSessionId(child.id),
      },
    ];
  });
}

export function parseCreateHomeworkSessionForm(formData: FormData): CreateHomeworkSessionInput {
  for (const fieldName of formData.keys()) {
    if (!fieldName.startsWith("$ACTION_") && !allowedFormFields.has(fieldName)) invalid();
  }

  const childProfileId = parseHomeworkSessionId(formData.get("childProfileId"));
  const gradeValue = formData.get("gradeLevel");
  const sourceType = formData.get("sourceType");
  if (gradeValue !== "7" && gradeValue !== "8" && gradeValue !== "9") invalid();
  if (typeof sourceType !== "string" || !sourceTypeSet.has(sourceType)) invalid();

  return {
    childProfileId,
    gradeLevel: Number(gradeValue) as 7 | 8 | 9,
    sourceType: sourceType as HomeworkSourceType,
    subject: "math",
  };
}

export function parseCreateHomeworkAttemptForm(formData: FormData): CreateHomeworkAttemptInput {
  for (const fieldName of formData.keys()) {
    if (!fieldName.startsWith("$ACTION_") && !allowedAttemptFormFields.has(fieldName)) invalid();
  }

  return { status: "CREATED" };
}

export function canViewHomework(status: string): status is "authenticated" {
  return status === "authenticated";
}
