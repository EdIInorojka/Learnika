export const mediaProcessingReadinessPolicyVersion =
  "wave-2-slice-14-media-processing-readiness-v1";

export type MediaProcessingReadinessReason =
  | "INVALID_MEDIA_METADATA"
  | "INVALID_TENANT_SCOPE"
  | "KIND_MIME_MISMATCH"
  | "MISSING_CHECKSUM"
  | "MISSING_STORAGE_KEY"
  | "RETENTION_DEADLINE_PASSED"
  | "UNSAFE_CHECKSUM"
  | "UNSAFE_RETENTION_STATE"
  | "UNSAFE_STORAGE_KEY"
  | "UNSUPPORTED_MEDIA_KIND"
  | "VOICE_MEDIA_DEFERRED";

export interface MediaProcessingReadinessMetadata {
  assetKind: string;
  checksumSha256: string | null;
  childProfileId: string | null;
  deletedAt: Date | null;
  deletionRequestedAt: Date | null;
  familyId: string;
  homeworkSessionId: string | null;
  id: string;
  mimeType: string;
  retentionStatus: string;
  retentionUntil: Date;
  sizeBytes: bigint | number;
  storageKey: string | null;
}

interface MediaProcessingReadinessBaseResult {
  mediaAssetId: string | null;
  metadataOnly: true;
  objectExistence: "UNKNOWN_NOT_VERIFIED";
  policyVersion: typeof mediaProcessingReadinessPolicyVersion;
}

export interface MediaProcessingReadyResult extends MediaProcessingReadinessBaseResult {
  learnerConfirmationRequired: true;
  processingDisposition: "HOMEWORK_TEXT_RECOGNITION";
  status: "READY";
  trust: "UNTRUSTED_CANDIDATE_ONLY";
}

export interface MediaProcessingBlockedResult extends MediaProcessingReadinessBaseResult {
  learnerConfirmationRequired: false;
  processingDisposition: "NONE";
  reason: MediaProcessingReadinessReason;
  status: "BLOCKED";
  trust: "NOT_APPLICABLE";
}

export type MediaProcessingReadinessResult =
  MediaProcessingBlockedResult | MediaProcessingReadyResult;
