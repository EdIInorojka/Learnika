import type { MediaAssetKind } from "../media-storage/media-storage.types";

export const ocrBoundaryPolicyVersion = "wave-2-slice-6-ocr-boundary-v1";
export const ocrBoundarySchemaVersion = "ocr-candidate-boundary-v1";
export const localMockOcrProviderName = "local-mock-ocr";
export const localMockOcrModelVersion = "local-mock-ocr-v1";

export const ocrSupportedMediaKinds = [
  "HOMEWORK_IMAGE",
  "HOMEWORK_SCREENSHOT",
  "HOMEWORK_PDF",
] as const satisfies readonly MediaAssetKind[];

export type OcrSupportedMediaKind = (typeof ocrSupportedMediaKinds)[number];

export const ocrMockFixtureIds = [
  "clear-linear-equation",
  "low-confidence-equation",
  "prompt-injection-equation",
  "provider-failure",
] as const;

export type OcrMockFixtureId = (typeof ocrMockFixtureIds)[number];

export type OcrConfidenceBand = "HIGH" | "LOW" | "MEDIUM" | "UNKNOWN";

export type OcrFailureReason =
  "INVALID_REQUEST" | "LOW_CONFIDENCE" | "PROVIDER_FAILURE" | "UNSUPPORTED_MEDIA";

export interface OcrMediaMetadataRequest {
  assetKind: OcrSupportedMediaKind;
  checksumSha256?: string;
  childProfileId: string;
  familyId: string;
  mediaAssetId: string;
  mimeType: string;
  mockFixtureId: OcrMockFixtureId;
  pageCount?: number;
  sizeBytes: number;
  storageKey: string;
}

export interface OcrCandidate {
  candidateId: string;
  confidence: OcrConfidenceBand;
  requiresLearnerConfirmation: true;
  source: "MOCK_FIXTURE";
  text: string;
  trust: "UNTRUSTED_OCR_CANDIDATE";
}

export interface OcrBoundaryBaseResult {
  modelVersion: typeof localMockOcrModelVersion;
  policyVersion: typeof ocrBoundaryPolicyVersion;
  providerName: typeof localMockOcrProviderName;
  schemaVersion: typeof ocrBoundarySchemaVersion;
}

export interface OcrCandidateResult extends OcrBoundaryBaseResult {
  candidates: readonly OcrCandidate[];
  confidence: "HIGH" | "MEDIUM";
  mediaAssetId: string;
  requiresLearnerConfirmation: true;
  status: "CANDIDATE_REQUIRES_CONFIRMATION";
}

export interface OcrNeedsReviewResult extends OcrBoundaryBaseResult {
  confidence: "LOW";
  mediaAssetId: string;
  reason: "LOW_CONFIDENCE";
  requiresLearnerConfirmation: true;
  status: "NEEDS_REVIEW";
}

export interface OcrFailureResult extends OcrBoundaryBaseResult {
  confidence: "UNKNOWN";
  mediaAssetId?: string;
  reason: Exclude<OcrFailureReason, "LOW_CONFIDENCE">;
  safeMessage: string;
  status: "FAILED";
}

export type OcrRecognitionResult = OcrCandidateResult | OcrFailureResult | OcrNeedsReviewResult;

export interface OcrProvider {
  recognize(input: OcrMediaMetadataRequest): Promise<OcrRecognitionResult>;
}

export interface OcrBoundaryFailure {
  code:
    | "OCR_MEDIA_UNSUPPORTED"
    | "OCR_PROVIDER_FAILURE"
    | "OCR_REQUEST_INVALID"
    | "OCR_RESULT_SCHEMA_INVALID";
  details: Record<string, unknown>;
  message: string;
}
