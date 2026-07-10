import { createHash, randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

import { loadLocalEnvironment } from "../config/local-env";
import {
  type BuildMediaAssetMetadataInput,
  type BuildStorageKeyInput,
  type MediaAssetKind,
  type MediaAssetMetadata,
  type MediaStorageConfig,
  type MediaStorageFailure,
  type MediaValidationInput,
  mediaAssetKinds,
} from "./media-storage.types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const storageKeyPattern =
  /^families\/[0-9a-f-]{36}\/children\/[0-9a-f-]{36}\/media\/(homework-image|homework-screenshot|homework-pdf)\/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/i;
const defaultMaxFileSizeBytes = 10 * 1024 * 1024;

const mimeByKind: Record<MediaAssetKind, ReadonlySet<string>> = {
  HOMEWORK_IMAGE: new Set(["image/jpeg", "image/png", "image/webp"]),
  HOMEWORK_PDF: new Set(["application/pdf"]),
  HOMEWORK_SCREENSHOT: new Set(["image/jpeg", "image/png", "image/webp"]),
};

const extensionByMimeType: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const safeDiagnosticFieldPattern =
  /authorization|buffer|childnickname|content|cookie|email|filename|password|raw|secret|signedurl|storagekey|token/i;

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function assertUuid(value: string, fieldName: string): void {
  if (!uuidPattern.test(value)) {
    throw safeMediaStorageFailure("MEDIA_KEY_INVALID", `${fieldName} must be an opaque UUID.`, {
      fieldName,
    });
  }
}

function assetKindToSegment(assetKind: MediaAssetKind): string {
  return assetKind.toLowerCase().replaceAll("_", "-");
}

function safeMediaStorageFailure(
  code: MediaStorageFailure["code"],
  message: string,
  details: Record<string, unknown>,
): MediaStorageFailure {
  return {
    code,
    details: redactMediaStorageDiagnostics(details) as Record<string, unknown>,
    message,
  };
}

export function redactMediaStorageDiagnostics(value: unknown): unknown {
  if (typeof value === "string") {
    return safeDiagnosticFieldPattern.test(value) ? "[redacted]" : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactMediaStorageDiagnostics(item));
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  const safeValue: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (safeDiagnosticFieldPattern.test(key)) {
      safeValue.redactedField = "[redacted]";
      continue;
    }

    safeValue[key] = redactMediaStorageDiagnostics(item);
  }

  return safeValue;
}

export function createSha256Hex(content: Buffer | Uint8Array): string {
  return createHash("sha256").update(content).digest("hex");
}

export function getMediaStorageConfig(): MediaStorageConfig {
  loadLocalEnvironment();

  return {
    bucket: process.env.S3_BUCKET ?? "learnika-local",
    endpoint: process.env.S3_ENDPOINT ?? "http://127.0.0.1:9000",
    forcePathStyle: parseBoolean(process.env.S3_FORCE_PATH_STYLE, true),
    maxFileSizeBytes: parsePositiveInteger(
      process.env.MEDIA_MAX_FILE_SIZE_BYTES,
      defaultMaxFileSizeBytes,
    ),
  };
}

@Injectable()
export class MediaStorageService {
  constructor(private readonly config: MediaStorageConfig = getMediaStorageConfig()) {}

  getConfig(): MediaStorageConfig {
    return { ...this.config };
  }

  validateAsset(input: MediaValidationInput): void {
    if (!this.isSupportedAssetKind(input.assetKind)) {
      throw safeMediaStorageFailure(
        "MEDIA_ASSET_KIND_UNSUPPORTED",
        "Unsupported media asset kind.",
        {
          assetKind: input.assetKind,
        },
      );
    }

    if (!mimeByKind[input.assetKind].has(input.mimeType)) {
      throw safeMediaStorageFailure("MEDIA_MIME_UNSUPPORTED", "Unsupported media MIME type.", {
        assetKind: input.assetKind,
        mimeType: input.mimeType,
      });
    }

    if (!Number.isSafeInteger(input.sizeBytes) || input.sizeBytes < 0) {
      throw safeMediaStorageFailure("MEDIA_FILE_TOO_LARGE", "Invalid media file size.", {
        sizeBytes: input.sizeBytes,
      });
    }

    if (input.sizeBytes > this.config.maxFileSizeBytes) {
      throw safeMediaStorageFailure(
        "MEDIA_FILE_TOO_LARGE",
        "Media file exceeds the configured limit.",
        {
          limitBytes: this.config.maxFileSizeBytes,
          sizeBytes: input.sizeBytes,
        },
      );
    }
  }

  buildStorageKey(input: BuildStorageKeyInput): string {
    this.validateAsset({
      assetKind: input.assetKind,
      mimeType: input.mimeType,
      sizeBytes: 0,
    });
    assertUuid(input.familyId, "familyId");
    assertUuid(input.childProfileId, "childProfileId");
    assertUuid(input.mediaAssetId, "mediaAssetId");

    const extension = extensionByMimeType[input.mimeType];
    return [
      "families",
      input.familyId,
      "children",
      input.childProfileId,
      "media",
      assetKindToSegment(input.assetKind),
      `${input.mediaAssetId}.${extension}`,
    ].join("/");
  }

  validateStorageKey(storageKey: string): void {
    if (!storageKeyPattern.test(storageKey)) {
      throw safeMediaStorageFailure(
        "MEDIA_KEY_INVALID",
        "Media storage key is not tenant scoped.",
        {
          storageKey,
        },
      );
    }
  }

  buildMediaAssetMetadata(input: BuildMediaAssetMetadataInput): MediaAssetMetadata {
    this.validateAsset(input);
    const storageKey = this.buildStorageKey(input);
    this.validateStorageKey(storageKey);

    return {
      assetKind: input.assetKind,
      childProfileId: input.childProfileId,
      familyId: input.familyId,
      mimeType: input.mimeType,
      retentionStatus: "TEMPORARY",
      retentionUntil: input.retentionUntil,
      sizeBytes: BigInt(input.sizeBytes),
      storageKey,
      ...(input.checksumSha256 ? { checksumSha256: input.checksumSha256 } : {}),
      ...(input.createdByUserId ? { createdByUserId: input.createdByUserId } : {}),
      ...(input.homeworkSessionId ? { homeworkSessionId: input.homeworkSessionId } : {}),
    };
  }

  createOpaqueMediaAssetId(): string {
    return randomUUID();
  }

  private isSupportedAssetKind(assetKind: string): assetKind is MediaAssetKind {
    return (mediaAssetKinds as readonly string[]).includes(assetKind);
  }
}
