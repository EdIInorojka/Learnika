import { Injectable } from "@nestjs/common";

import type {
  MediaAssetLifecycleMetadata,
  MediaCleanupCandidate,
  MediaCleanupSelection,
  MediaLifecycleAuditMetadata,
  MediaLifecycleEvent,
  MediaLifecycleFailure,
  MediaLifecyclePatch,
  MediaLifecycleTransitionResult,
  MediaRetentionPolicyInput,
  MediaRetentionStatus,
} from "./media-lifecycle.types";
import { mediaLifecycleEvents, mediaRetentionStatuses } from "./media-lifecycle.types";

export const mediaLifecyclePolicyVersion = "wave-2-slice-12-media-lifecycle-v1";

const maxCleanupBatchSize = 1_000;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sensitiveDiagnosticFieldPattern =
  /answer|authorization|base64|binary|buffer|childnickname|completion|content|cookie|email|filename|hint|llm|ocr|password|prompt|provider|raw|secret|signedurl|solution|storagekey|stt|token|transcript/i;
const sensitiveDiagnosticValuePattern =
  /bearer\s|families\/[0-9a-f-]{36}\/children\/|session=|signed.?url|token|secret|@/i;

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function safeFailure(
  code: MediaLifecycleFailure["code"],
  message: string,
  details: Record<string, unknown>,
): MediaLifecycleFailure {
  return {
    code,
    details: redactMediaLifecycleDiagnostics(details) as Record<string, unknown>,
    message,
  };
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function isMediaRetentionStatus(value: unknown): value is MediaRetentionStatus {
  return typeof value === "string" && (mediaRetentionStatuses as readonly string[]).includes(value);
}

function isMediaLifecycleEvent(value: unknown): value is MediaLifecycleEvent {
  return typeof value === "string" && (mediaLifecycleEvents as readonly string[]).includes(value);
}

export function redactMediaLifecycleDiagnostics(value: unknown): unknown {
  if (typeof value === "string") {
    return sensitiveDiagnosticValuePattern.test(value) ? "[redacted]" : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactMediaLifecycleDiagnostics(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value.toISOString() : "[invalid-date]";
  }

  const safeValue: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (sensitiveDiagnosticFieldPattern.test(key)) {
      safeValue.redactedField = "[redacted]";
      continue;
    }

    safeValue[key] = redactMediaLifecycleDiagnostics(item);
  }

  return safeValue;
}

@Injectable()
export class MediaLifecycleService {
  computeRetentionDeadline(input: MediaRetentionPolicyInput): Date {
    if (
      !isValidDate(input.startsAt) ||
      !Number.isSafeInteger(input.retentionDurationMs) ||
      input.retentionDurationMs <= 0
    ) {
      throw safeFailure(
        "MEDIA_LIFECYCLE_INVALID_POLICY",
        "Media retention policy input is invalid.",
        { input },
      );
    }

    const retentionUntil = new Date(input.startsAt.getTime() + input.retentionDurationMs);
    if (!isValidDate(retentionUntil)) {
      throw safeFailure("MEDIA_LIFECYCLE_INVALID_POLICY", "Media retention deadline is invalid.", {
        input,
      });
    }

    return retentionUntil;
  }

  transition(
    metadata: MediaAssetLifecycleMetadata,
    event: MediaLifecycleEvent,
    occurredAt: Date,
  ): MediaLifecycleTransitionResult {
    this.assertMetadata(metadata);

    if (!isMediaLifecycleEvent(event) || !isValidDate(occurredAt)) {
      throw safeFailure("MEDIA_LIFECYCLE_INVALID_EVENT", "Media lifecycle event is invalid.", {
        event,
        metadata,
        occurredAt,
      });
    }

    const patch = this.transitionPatch(metadata, event, occurredAt);

    return {
      event,
      mediaAssetId: metadata.id,
      metadataOnly: true,
      nextStatus: patch.retentionStatus,
      objectDeletionState: "NOT_PERFORMED_OR_VERIFIED",
      occurredAt: cloneDate(occurredAt),
      patch,
      previousStatus: metadata.retentionStatus,
    };
  }

  selectCleanupCandidates(
    records: readonly MediaAssetLifecycleMetadata[],
    evaluatedAt: Date,
    limit = 100,
  ): MediaCleanupSelection {
    if (
      !isValidDate(evaluatedAt) ||
      !Number.isSafeInteger(limit) ||
      limit <= 0 ||
      limit > maxCleanupBatchSize
    ) {
      throw safeFailure(
        "MEDIA_LIFECYCLE_INVALID_POLICY",
        "Media cleanup selection input is invalid.",
        { evaluatedAt, limit },
      );
    }

    const candidates: MediaCleanupCandidate[] = [];
    let skippedInvalidCount = 0;

    for (const metadata of records) {
      try {
        this.assertMetadata(metadata);
      } catch {
        skippedInvalidCount += 1;
        continue;
      }

      const candidate = this.toCleanupCandidate(metadata, evaluatedAt);
      if (candidate) {
        candidates.push(candidate);
      }
    }

    candidates.sort(
      (left, right) =>
        left.eligibleAt.getTime() - right.eligibleAt.getTime() ||
        left.mediaAssetId.localeCompare(right.mediaAssetId),
    );

    return {
      candidates: candidates.slice(0, limit),
      evaluatedAt: cloneDate(evaluatedAt),
      metadataOnly: true,
      skippedInvalidCount,
    };
  }

  toAuditMetadata(result: MediaLifecycleTransitionResult): MediaLifecycleAuditMetadata {
    return {
      action: "media.lifecycle.transition",
      event: result.event,
      mediaAssetId: result.mediaAssetId,
      metadataOnly: true,
      nextStatus: result.nextStatus,
      occurredAt: result.occurredAt.toISOString(),
      policyVersion: mediaLifecyclePolicyVersion,
      previousStatus: result.previousStatus,
    };
  }

  private assertMetadata(metadata: MediaAssetLifecycleMetadata): void {
    const valid =
      metadata !== null &&
      typeof metadata === "object" &&
      uuidPattern.test(metadata.id) &&
      isMediaRetentionStatus(metadata.retentionStatus) &&
      isValidDate(metadata.retentionUntil) &&
      (metadata.deletionRequestedAt === null || isValidDate(metadata.deletionRequestedAt)) &&
      (metadata.deletedAt === null || isValidDate(metadata.deletedAt)) &&
      (metadata.storageKey === null || typeof metadata.storageKey === "string") &&
      (metadata.retentionStatus !== "DELETION_REQUESTED" ||
        metadata.deletionRequestedAt !== null) &&
      (metadata.retentionStatus !== "DELETED" || metadata.deletedAt !== null) &&
      (metadata.retentionStatus === "DELETED" || metadata.deletedAt === null);

    if (!valid) {
      throw safeFailure(
        "MEDIA_LIFECYCLE_INVALID_METADATA",
        "Media lifecycle metadata is invalid.",
        { metadata },
      );
    }
  }

  private transitionPatch(
    metadata: MediaAssetLifecycleMetadata,
    event: MediaLifecycleEvent,
    occurredAt: Date,
  ): MediaLifecyclePatch {
    if (event === "REQUEST_DELETION") {
      if (metadata.retentionStatus === "DELETED") {
        throw this.invalidTransition(metadata, event);
      }

      return {
        deletedAt: null,
        deletionRequestedAt: cloneDate(metadata.deletionRequestedAt ?? occurredAt),
        retentionStatus: "DELETION_REQUESTED",
        retentionUntil: cloneDate(metadata.retentionUntil),
      };
    }

    if (event === "EXPIRE_RETENTION") {
      if (
        metadata.retentionStatus !== "TEMPORARY" &&
        metadata.retentionStatus !== "RETENTION_EXPIRED"
      ) {
        throw this.invalidTransition(metadata, event);
      }

      if (occurredAt.getTime() < metadata.retentionUntil.getTime()) {
        throw safeFailure("MEDIA_LIFECYCLE_NOT_EXPIRED", "Media retention has not expired.", {
          event,
          metadata,
          occurredAt,
        });
      }

      return {
        deletedAt: null,
        deletionRequestedAt: metadata.deletionRequestedAt
          ? cloneDate(metadata.deletionRequestedAt)
          : null,
        retentionStatus: "RETENTION_EXPIRED",
        retentionUntil: cloneDate(metadata.retentionUntil),
      };
    }

    if (
      event === "MARK_METADATA_DELETED" &&
      (metadata.retentionStatus === "DELETION_REQUESTED" ||
        metadata.retentionStatus === "RETENTION_EXPIRED")
    ) {
      return {
        deletedAt: cloneDate(occurredAt),
        deletionRequestedAt: metadata.deletionRequestedAt
          ? cloneDate(metadata.deletionRequestedAt)
          : null,
        retentionStatus: "DELETED",
        retentionUntil: cloneDate(metadata.retentionUntil),
      };
    }

    throw this.invalidTransition(metadata, event);
  }

  private invalidTransition(
    metadata: MediaAssetLifecycleMetadata,
    event: MediaLifecycleEvent,
  ): MediaLifecycleFailure {
    return safeFailure(
      "MEDIA_LIFECYCLE_INVALID_TRANSITION",
      "Media lifecycle transition is not allowed.",
      { event, metadata },
    );
  }

  private toCleanupCandidate(
    metadata: MediaAssetLifecycleMetadata,
    evaluatedAt: Date,
  ): MediaCleanupCandidate | null {
    let eligibilityReason: MediaCleanupCandidate["eligibilityReason"];
    let eligibleAt: Date;

    if (metadata.retentionStatus === "DELETION_REQUESTED") {
      if (
        !metadata.deletionRequestedAt ||
        metadata.deletionRequestedAt.getTime() > evaluatedAt.getTime()
      ) {
        return null;
      }
      eligibilityReason = "DELETION_REQUESTED";
      eligibleAt = metadata.deletionRequestedAt;
    } else if (metadata.retentionStatus === "RETENTION_EXPIRED") {
      if (metadata.retentionUntil.getTime() > evaluatedAt.getTime()) {
        return null;
      }
      eligibilityReason = "RETENTION_EXPIRED";
      eligibleAt = metadata.retentionUntil;
    } else {
      return null;
    }

    return {
      eligibilityReason,
      eligibleAt: cloneDate(eligibleAt),
      internalStorageKey: metadata.storageKey,
      mediaAssetId: metadata.id,
      metadataOnly: true,
      objectDeletionRequired: metadata.storageKey !== null,
      objectDeletionState: "NOT_PERFORMED_OR_VERIFIED",
    };
  }
}
