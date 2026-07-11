export const mediaRetentionStatuses = [
  "TEMPORARY",
  "RETENTION_EXPIRED",
  "DELETION_REQUESTED",
  "DELETED",
] as const;

export type MediaRetentionStatus = (typeof mediaRetentionStatuses)[number];

export const mediaLifecycleEvents = [
  "REQUEST_DELETION",
  "EXPIRE_RETENTION",
  "MARK_METADATA_DELETED",
] as const;

export type MediaLifecycleEvent = (typeof mediaLifecycleEvents)[number];

export interface MediaAssetLifecycleMetadata {
  deletedAt: Date | null;
  deletionRequestedAt: Date | null;
  id: string;
  retentionStatus: MediaRetentionStatus;
  retentionUntil: Date;
  storageKey: string | null;
}

export interface MediaRetentionPolicyInput {
  retentionDurationMs: number;
  startsAt: Date;
}

export interface MediaLifecyclePatch {
  deletedAt: Date | null;
  deletionRequestedAt: Date | null;
  retentionStatus: MediaRetentionStatus;
  retentionUntil: Date;
}

export interface MediaLifecycleTransitionResult {
  event: MediaLifecycleEvent;
  mediaAssetId: string;
  metadataOnly: true;
  nextStatus: MediaRetentionStatus;
  objectDeletionState: "NOT_PERFORMED_OR_VERIFIED";
  occurredAt: Date;
  patch: MediaLifecyclePatch;
  previousStatus: MediaRetentionStatus;
}

export interface MediaLifecycleAuditMetadata {
  action: "media.lifecycle.transition";
  event: MediaLifecycleEvent;
  mediaAssetId: string;
  metadataOnly: true;
  nextStatus: MediaRetentionStatus;
  occurredAt: string;
  policyVersion: string;
  previousStatus: MediaRetentionStatus;
}

export interface MediaCleanupCandidate {
  eligibilityReason: "DELETION_REQUESTED" | "RETENTION_EXPIRED";
  eligibleAt: Date;
  internalStorageKey: string | null;
  mediaAssetId: string;
  metadataOnly: true;
  objectDeletionRequired: boolean;
  objectDeletionState: "NOT_PERFORMED_OR_VERIFIED";
}

export interface MediaCleanupSelection {
  candidates: MediaCleanupCandidate[];
  evaluatedAt: Date;
  metadataOnly: true;
  skippedInvalidCount: number;
}

export interface MediaLifecycleFailure {
  code:
    | "MEDIA_LIFECYCLE_INVALID_EVENT"
    | "MEDIA_LIFECYCLE_INVALID_METADATA"
    | "MEDIA_LIFECYCLE_INVALID_POLICY"
    | "MEDIA_LIFECYCLE_INVALID_TRANSITION"
    | "MEDIA_LIFECYCLE_NOT_EXPIRED";
  details: Record<string, unknown>;
  message: string;
}
