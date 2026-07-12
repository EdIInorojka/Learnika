export const mediaAssetKinds = ["HOMEWORK_IMAGE", "HOMEWORK_PDF", "HOMEWORK_SCREENSHOT"] as const;
export const mediaMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

export type MediaAssetKind = (typeof mediaAssetKinds)[number];
export type MediaMimeType = (typeof mediaMimeTypes)[number];
export type MediaRetentionStatus =
  "DELETED" | "DELETION_REQUESTED" | "RETENTION_EXPIRED" | "TEMPORARY";

export interface CreateMediaAssetMetadataInput {
  assetKind: MediaAssetKind;
  checksumSha256?: string;
  mimeType: MediaMimeType;
  sizeBytes: number;
}

export interface MediaAssetView {
  assetKind: MediaAssetKind;
  checksumPresent: boolean;
  createdAt: string;
  id: string;
  mimeType: MediaMimeType;
  retentionStatus: MediaRetentionStatus;
  retentionUntil: string;
  sizeBytes: number;
  updatedAt: string;
}

export class MediaAssetContractError extends Error {
  constructor() {
    super("Media asset metadata did not match the expected contract.");
    this.name = "MediaAssetContractError";
  }
}

const maxSizeBytes = 10 * 1024 * 1024;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const checksumPattern = /^[0-9a-f]{64}$/i;
const kindSet = new Set<string>(mediaAssetKinds);
const mimeSet = new Set<string>(mediaMimeTypes);
const retentionStatusSet = new Set<string>([
  "DELETED",
  "DELETION_REQUESTED",
  "RETENTION_EXPIRED",
  "TEMPORARY",
]);
const mimeByKind: Record<MediaAssetKind, ReadonlySet<MediaMimeType>> = {
  HOMEWORK_IMAGE: new Set(["image/jpeg", "image/png", "image/webp"]),
  HOMEWORK_PDF: new Set(["application/pdf"]),
  HOMEWORK_SCREENSHOT: new Set(["image/jpeg", "image/png", "image/webp"]),
};
const allowedFormFields = new Set(["assetKind", "checksumSha256", "mimeType", "sizeBytes"]);
const forbiddenResponseKeyPattern =
  /answer|base64|binary|completion|download|filename|hint|llm|ocr|original|prompt|provider|raw|signed|solution|stt|transcript|upload/i;

function invalid(): never {
  throw new MediaAssetContractError();
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) invalid();
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

function parseMediaAssetId(value: unknown): string {
  const id = requiredString(value);
  if (!uuidPattern.test(id)) invalid();
  return id;
}

function parseMediaAsset(value: unknown): MediaAssetView {
  const item = record(value);
  const assetKind = requiredString(item.assetKind);
  const mimeType = requiredString(item.mimeType);
  const retentionStatus = requiredString(item.retentionStatus);
  if (
    !kindSet.has(assetKind) ||
    !mimeSet.has(mimeType) ||
    !retentionStatusSet.has(retentionStatus)
  ) {
    invalid();
  }
  if (!mimeByKind[assetKind as MediaAssetKind].has(mimeType as MediaMimeType)) invalid();
  if (!Number.isSafeInteger(item.sizeBytes) || (item.sizeBytes as number) < 0) invalid();
  if ((item.sizeBytes as number) > maxSizeBytes) invalid();

  const checksum = item.checksumSha256;
  if (checksum !== null && (typeof checksum !== "string" || !checksumPattern.test(checksum))) {
    invalid();
  }
  if (item.storageKey !== null && typeof item.storageKey !== "string") invalid();

  return {
    assetKind: assetKind as MediaAssetKind,
    checksumPresent: checksum !== null,
    createdAt: dateTime(item.createdAt),
    id: parseMediaAssetId(item.id),
    mimeType: mimeType as MediaMimeType,
    retentionStatus: retentionStatus as MediaRetentionStatus,
    retentionUntil: dateTime(item.retentionUntil),
    sizeBytes: item.sizeBytes as number,
    updatedAt: dateTime(item.updatedAt),
  };
}

export function parseMediaAssetResponse(value: unknown): MediaAssetView {
  assertNoForbiddenResponseFields(value);
  return parseMediaAsset(record(record(value).data).mediaAsset);
}

export function parseMediaAssetsResponse(value: unknown): MediaAssetView[] {
  assertNoForbiddenResponseFields(value);
  return array(record(record(value).data).mediaAssets).map(parseMediaAsset);
}

export function parseCreateMediaAssetForm(formData: FormData): CreateMediaAssetMetadataInput {
  for (const fieldName of formData.keys()) {
    if (!fieldName.startsWith("$ACTION_") && !allowedFormFields.has(fieldName)) invalid();
  }

  const assetKind = formData.get("assetKind");
  const mimeType = formData.get("mimeType");
  const sizeValue = formData.get("sizeBytes");
  const checksumValue = formData.get("checksumSha256");
  if (typeof assetKind !== "string" || !kindSet.has(assetKind)) invalid();
  if (typeof mimeType !== "string" || !mimeSet.has(mimeType)) invalid();
  if (!mimeByKind[assetKind as MediaAssetKind].has(mimeType as MediaMimeType)) invalid();
  if (typeof sizeValue !== "string" || !/^[0-9]+$/.test(sizeValue)) invalid();

  const sizeBytes = Number(sizeValue);
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 0 || sizeBytes > maxSizeBytes) invalid();
  if (typeof checksumValue !== "string") invalid();
  const checksumSha256 = checksumValue.trim();
  if (checksumSha256 !== "" && !checksumPattern.test(checksumSha256)) invalid();

  return {
    assetKind: assetKind as MediaAssetKind,
    ...(checksumSha256 === "" ? {} : { checksumSha256: checksumSha256.toLowerCase() }),
    mimeType: mimeType as MediaMimeType,
    sizeBytes,
  };
}
