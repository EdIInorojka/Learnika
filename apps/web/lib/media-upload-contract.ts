import type { MediaAssetView, MediaMimeType } from "./media-asset-contract";

export class MediaUploadContractError extends Error {
  constructor() {
    super("Media upload did not match the expected contract.");
    this.name = "MediaUploadContractError";
  }
}

const maxSizeBytes = 10 * 1024 * 1024;
const allowedFormFields = new Set(["file"]);
const mediaMimeTypes: readonly MediaMimeType[] = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const supportedMimeTypes = new Set<string>(mediaMimeTypes);

function invalid(): never {
  throw new MediaUploadContractError();
}

function assertExpectedMetadata(
  mimeType: string,
  sizeBytes: number,
): asserts mimeType is MediaMimeType {
  if (!supportedMimeTypes.has(mimeType)) invalid();
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0 || sizeBytes > maxSizeBytes) invalid();
}

export function parseMediaUploadForm(
  formData: FormData,
  expectedMimeType: string,
  expectedSizeBytes: number,
): File {
  assertExpectedMetadata(expectedMimeType, expectedSizeBytes);
  for (const fieldName of formData.keys()) {
    if (!fieldName.startsWith("$ACTION_") && !allowedFormFields.has(fieldName)) invalid();
  }

  const files = formData.getAll("file");
  if (files.length !== 1) invalid();
  const file = files[0];
  if (!(file instanceof File) || file.size === 0 || file.size > maxSizeBytes) invalid();
  if (file.size !== expectedSizeBytes || file.type.toLowerCase() !== expectedMimeType) invalid();
  return file;
}

export function buildSafeMediaUploadBody(file: File): FormData {
  const multipartBody = new FormData();
  multipartBody.set("file", file, "upload.bin");
  return multipartBody;
}

export function isMediaAssetUploadAvailable(
  mediaAsset: MediaAssetView,
  nowMilliseconds = Date.now(),
): boolean {
  return (
    mediaAsset.retentionStatus === "TEMPORARY" &&
    Number.isFinite(Date.parse(mediaAsset.retentionUntil)) &&
    Date.parse(mediaAsset.retentionUntil) > nowMilliseconds &&
    mediaAsset.sizeBytes > 0 &&
    mediaAsset.sizeBytes <= maxSizeBytes &&
    supportedMimeTypes.has(mediaAsset.mimeType)
  );
}
