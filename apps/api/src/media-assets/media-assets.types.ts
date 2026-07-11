export type MediaAssetKind = "HOMEWORK_IMAGE" | "HOMEWORK_PDF" | "HOMEWORK_SCREENSHOT";

export type MediaRetentionStatus =
  "DELETED" | "DELETION_REQUESTED" | "RETENTION_EXPIRED" | "TEMPORARY";

export interface MediaAssetSummary {
  checksumSha256: string | null;
  childProfileId: string | null;
  createdAt: string;
  createdByUserId: string | null;
  deletedAt: string | null;
  deletionRequestedAt: string | null;
  familyId: string;
  homeworkSessionId: string | null;
  id: string;
  assetKind: MediaAssetKind;
  mimeType: string;
  retentionStatus: MediaRetentionStatus;
  retentionUntil: string;
  sizeBytes: number;
  storageKey: string | null;
  updatedAt: string;
}

export interface MediaAssetResponse {
  data: {
    mediaAsset: MediaAssetSummary;
  };
}

export interface MediaAssetsResponse {
  data: {
    mediaAssets: MediaAssetSummary[];
  };
}
