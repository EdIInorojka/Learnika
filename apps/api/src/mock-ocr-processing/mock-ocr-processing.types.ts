import type { MediaProcessingReadinessMetadata } from "../media-processing-readiness/media-processing-readiness.types";
import type { OcrMockFixtureId, OcrRecognitionResult } from "../ocr-boundary/ocr-boundary.types";

export const mockOcrProcessingPolicyVersion = "wave-2-slice-15-mock-ocr-processing-v1";

export interface MockOcrProcessingRequest {
  mediaAsset: MediaProcessingReadinessMetadata;
  mockFixtureId: OcrMockFixtureId;
  pageCount?: number;
}

interface MockOcrProcessingBaseResult {
  downstreamUseAllowed: false;
  metadataOnly: true;
  objectExistence: "UNKNOWN_NOT_VERIFIED";
  orchestrationPolicyVersion: typeof mockOcrProcessingPolicyVersion;
}

export interface MockOcrProcessingBlockedResult extends MockOcrProcessingBaseResult {
  mediaAssetId: string | null;
  readinessReason: string;
  status: "BLOCKED";
}

export interface MockOcrProcessingRejectedResult extends MockOcrProcessingBaseResult {
  confidence: "UNKNOWN";
  mediaAssetId: string | null;
  reason: "BOUNDARY_REJECTED";
  safeMessage: string;
  status: "FAILED";
}

export type MockOcrProcessingBoundaryResult = OcrRecognitionResult & MockOcrProcessingBaseResult;

export type MockOcrProcessingResult =
  | MockOcrProcessingBlockedResult
  | MockOcrProcessingBoundaryResult
  | MockOcrProcessingRejectedResult;
