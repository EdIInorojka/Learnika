import { BadRequestException } from "@nestjs/common";

export interface CreateMediaAssetInput {
  assetKind: "HOMEWORK_IMAGE" | "HOMEWORK_PDF" | "HOMEWORK_SCREENSHOT";
  checksumSha256?: string;
  mimeType: string;
  sizeBytes: number;
}

export interface UpdateMediaAssetRetentionInput {
  retentionStatus: "DELETION_REQUESTED";
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const checksumPattern = /^[0-9a-f]{64}$/i;
const supportedAssetKinds = new Set(["HOMEWORK_IMAGE", "HOMEWORK_PDF", "HOMEWORK_SCREENSHOT"]);
const allowedCreateKeys = new Set(["assetKind", "checksumSha256", "mimeType", "sizeBytes"]);
const allowedRetentionKeys = new Set(["retentionStatus"]);
const forbiddenFieldPattern =
  /answer|base64|binary|childhealth|childlocation|completion|content|exactsolution|filename|finalanswer|fullsolution|generatedhint|health|hinttext|llmcompletion|llmprompt|location|modeloutput|ocr|originalfilename|prompt|providerpayload|raw|sensitive|solution|stt|textbookcontent|transcript|upload/i;

function invalid(message: string): never {
  throw new BadRequestException({
    code: "MEDIA_ASSET_INVALID_INPUT",
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

function parseSizeBytes(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    invalid("Media size is invalid.");
  }

  return value;
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

export function parseCreateMediaAssetInput(value: unknown): CreateMediaAssetInput {
  const body = asRecord(value);
  assertAllowedKeys(body, allowedCreateKeys);

  const assetKind = requiredTrimmedString(body.assetKind, "Media asset kind");
  if (!supportedAssetKinds.has(assetKind)) {
    invalid("Media asset kind is invalid.");
  }

  const mimeType = requiredTrimmedString(body.mimeType, "MIME type");
  const sizeBytes = parseSizeBytes(body.sizeBytes);
  const checksumSha256 = optionalTrimmedString(body.checksumSha256);

  if (checksumSha256 !== undefined && !checksumPattern.test(checksumSha256)) {
    invalid("Checksum metadata is invalid.");
  }

  return {
    assetKind: assetKind as CreateMediaAssetInput["assetKind"],
    ...(checksumSha256 === undefined ? {} : { checksumSha256: checksumSha256.toLowerCase() }),
    mimeType,
    sizeBytes,
  };
}

export function parseUpdateMediaAssetRetentionInput(
  value: unknown,
): UpdateMediaAssetRetentionInput {
  const body = asRecord(value);
  assertAllowedKeys(body, allowedRetentionKeys);

  const retentionStatus = requiredTrimmedString(body.retentionStatus, "Retention status");

  if (retentionStatus !== "DELETION_REQUESTED") {
    invalid("Retention status update is invalid for Slice 11.");
  }

  return { retentionStatus: "DELETION_REQUESTED" };
}

export function parseIdParam(value: unknown, fieldName = "Identifier"): string {
  if (typeof value !== "string" || !uuidPattern.test(value)) {
    invalid(`${fieldName} is invalid.`);
  }

  return value;
}
