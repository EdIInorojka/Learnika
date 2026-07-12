import { Injectable } from "@nestjs/common";

import { MediaStorageService } from "../media-storage/media-storage.service";
import { type MediaAssetKind, mediaAssetKinds } from "../media-storage/media-storage.types";
import {
  type MediaProcessingBlockedResult,
  type MediaProcessingReadinessMetadata,
  type MediaProcessingReadinessReason,
  type MediaProcessingReadinessResult,
  mediaProcessingReadinessPolicyVersion,
} from "./media-processing-readiness.types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sha256HexPattern = /^[a-f0-9]{64}$/;
const sensitiveDiagnosticFieldPattern =
  /answer|authorization|base64|binary|buffer|child|completion|content|cookie|email|filename|hint|llm|ocr|password|prompt|provider|raw|secret|signedurl|solution|storagekey|stt|token|transcript/i;
const sensitiveDiagnosticValuePattern =
  /bearer\s|families\/[0-9a-f-]{36}\/children\/|session=|signed.?url|token|secret|@/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isSupportedAssetKind(value: unknown): value is MediaAssetKind {
  return typeof value === "string" && (mediaAssetKinds as readonly string[]).includes(value);
}

function asSafeSize(value: unknown): number | null {
  if (typeof value === "bigint") {
    if (value <= 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) {
      return null;
    }
    return Number(value);
  }

  return Number.isSafeInteger(value) && (value as number) > 0 ? (value as number) : null;
}

export function redactMediaProcessingReadinessDiagnostics(value: unknown): unknown {
  if (typeof value === "string") {
    return sensitiveDiagnosticValuePattern.test(value) ? "[redacted]" : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactMediaProcessingReadinessDiagnostics(item));
  }

  if (!isRecord(value)) {
    return value;
  }

  const safeValue: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (sensitiveDiagnosticFieldPattern.test(key)) {
      safeValue.redactedField = "[redacted]";
      continue;
    }

    safeValue[key] = redactMediaProcessingReadinessDiagnostics(item);
  }

  return safeValue;
}

@Injectable()
export class MediaProcessingReadinessService {
  constructor(private readonly mediaStorage: MediaStorageService = new MediaStorageService()) {}

  evaluate(
    metadata: MediaProcessingReadinessMetadata,
    evaluatedAt: Date,
  ): MediaProcessingReadinessResult {
    const mediaAssetId = uuidPattern.test(metadata?.id ?? "") ? metadata.id : null;

    if (!this.hasValidMetadataShape(metadata) || !isValidDate(evaluatedAt)) {
      return this.blocked(mediaAssetId, "INVALID_MEDIA_METADATA");
    }

    if (
      !uuidPattern.test(metadata.familyId) ||
      !metadata.homeworkSessionId ||
      !uuidPattern.test(metadata.homeworkSessionId) ||
      !metadata.childProfileId ||
      !uuidPattern.test(metadata.childProfileId)
    ) {
      return this.blocked(mediaAssetId, "INVALID_TENANT_SCOPE");
    }

    if (metadata.assetKind === "VOICE_AUDIO") {
      return this.blocked(mediaAssetId, "VOICE_MEDIA_DEFERRED");
    }

    if (!isSupportedAssetKind(metadata.assetKind)) {
      return this.blocked(mediaAssetId, "UNSUPPORTED_MEDIA_KIND");
    }

    const sizeBytes = asSafeSize(metadata.sizeBytes);
    if (sizeBytes === null) {
      return this.blocked(mediaAssetId, "INVALID_MEDIA_METADATA");
    }

    try {
      this.mediaStorage.validateAsset({
        assetKind: metadata.assetKind,
        mimeType: metadata.mimeType,
        sizeBytes,
      });
    } catch {
      return this.blocked(mediaAssetId, "KIND_MIME_MISMATCH");
    }

    if (
      metadata.retentionStatus !== "TEMPORARY" ||
      metadata.deletionRequestedAt !== null ||
      metadata.deletedAt !== null
    ) {
      return this.blocked(mediaAssetId, "UNSAFE_RETENTION_STATE");
    }

    if (metadata.retentionUntil.getTime() <= evaluatedAt.getTime()) {
      return this.blocked(mediaAssetId, "RETENTION_DEADLINE_PASSED");
    }

    if (!metadata.storageKey) {
      return this.blocked(mediaAssetId, "MISSING_STORAGE_KEY");
    }

    try {
      this.mediaStorage.validateStorageKey(metadata.storageKey);
      const expectedStorageKey = this.mediaStorage.buildStorageKey({
        assetKind: metadata.assetKind,
        childProfileId: metadata.childProfileId,
        familyId: metadata.familyId,
        mediaAssetId: metadata.id,
        mimeType: metadata.mimeType,
      });

      if (metadata.storageKey !== expectedStorageKey) {
        return this.blocked(mediaAssetId, "UNSAFE_STORAGE_KEY");
      }
    } catch {
      return this.blocked(mediaAssetId, "UNSAFE_STORAGE_KEY");
    }

    if (!metadata.checksumSha256) {
      return this.blocked(mediaAssetId, "MISSING_CHECKSUM");
    }

    if (!sha256HexPattern.test(metadata.checksumSha256)) {
      return this.blocked(mediaAssetId, "UNSAFE_CHECKSUM");
    }

    return {
      learnerConfirmationRequired: true,
      mediaAssetId,
      metadataOnly: true,
      objectExistence: "UNKNOWN_NOT_VERIFIED",
      policyVersion: mediaProcessingReadinessPolicyVersion,
      processingDisposition: "HOMEWORK_TEXT_RECOGNITION",
      status: "READY",
      trust: "UNTRUSTED_CANDIDATE_ONLY",
    };
  }

  private blocked(
    mediaAssetId: string | null,
    reason: MediaProcessingReadinessReason,
  ): MediaProcessingBlockedResult {
    return {
      learnerConfirmationRequired: false,
      mediaAssetId,
      metadataOnly: true,
      objectExistence: "UNKNOWN_NOT_VERIFIED",
      policyVersion: mediaProcessingReadinessPolicyVersion,
      processingDisposition: "NONE",
      reason,
      status: "BLOCKED",
      trust: "NOT_APPLICABLE",
    };
  }

  private hasValidMetadataShape(
    metadata: MediaProcessingReadinessMetadata,
  ): metadata is MediaProcessingReadinessMetadata {
    return (
      isRecord(metadata) &&
      typeof metadata.id === "string" &&
      typeof metadata.familyId === "string" &&
      (metadata.childProfileId === null || typeof metadata.childProfileId === "string") &&
      (metadata.homeworkSessionId === null || typeof metadata.homeworkSessionId === "string") &&
      typeof metadata.assetKind === "string" &&
      typeof metadata.mimeType === "string" &&
      (typeof metadata.sizeBytes === "number" || typeof metadata.sizeBytes === "bigint") &&
      (metadata.storageKey === null || typeof metadata.storageKey === "string") &&
      (metadata.checksumSha256 === null || typeof metadata.checksumSha256 === "string") &&
      typeof metadata.retentionStatus === "string" &&
      isValidDate(metadata.retentionUntil) &&
      (metadata.deletionRequestedAt === null || isValidDate(metadata.deletionRequestedAt)) &&
      (metadata.deletedAt === null || isValidDate(metadata.deletedAt))
    );
  }
}
