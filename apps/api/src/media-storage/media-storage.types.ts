export const mediaAssetKinds = ["HOMEWORK_IMAGE", "HOMEWORK_SCREENSHOT", "HOMEWORK_PDF"] as const;

export type MediaAssetKind = (typeof mediaAssetKinds)[number];

export interface MediaStorageConfig {
  bucket: string;
  endpoint: string;
  forcePathStyle: boolean;
  maxFileSizeBytes: number;
}

export interface MediaValidationInput {
  assetKind: MediaAssetKind;
  mimeType: string;
  sizeBytes: number;
}

export interface BuildStorageKeyInput {
  assetKind: MediaAssetKind;
  childProfileId: string;
  familyId: string;
  mediaAssetId: string;
  mimeType: string;
}

export interface BuildMediaAssetMetadataInput extends BuildStorageKeyInput {
  checksumSha256?: string;
  createdByUserId?: string;
  homeworkSessionId?: string;
  retentionUntil: Date;
  sizeBytes: number;
}

export interface MediaAssetMetadata {
  assetKind: MediaAssetKind;
  checksumSha256?: string;
  childProfileId: string;
  createdByUserId?: string;
  familyId: string;
  homeworkSessionId?: string;
  mimeType: string;
  retentionStatus: "TEMPORARY";
  retentionUntil: Date;
  sizeBytes: bigint;
  storageKey: string;
}

export interface MediaStorageFailure {
  code:
    | "MEDIA_ASSET_KIND_UNSUPPORTED"
    | "MEDIA_FILE_TOO_LARGE"
    | "MEDIA_KEY_INVALID"
    | "MEDIA_MIME_UNSUPPORTED";
  details: Record<string, unknown>;
  message: string;
}
