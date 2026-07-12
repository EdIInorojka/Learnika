import { Injectable } from "@nestjs/common";

import { MediaProcessingReadinessService } from "../media-processing-readiness/media-processing-readiness.service";
import type { MediaProcessingReadyResult } from "../media-processing-readiness/media-processing-readiness.types";
import { OcrBoundaryService } from "../ocr-boundary/ocr-boundary.service";
import type {
  OcrMediaMetadataRequest,
  OcrSupportedMediaKind,
} from "../ocr-boundary/ocr-boundary.types";
import {
  type MockOcrProcessingRequest,
  type MockOcrProcessingResult,
  mockOcrProcessingPolicyVersion,
} from "./mock-ocr-processing.types";

@Injectable()
export class MockOcrProcessingOrchestrationService {
  constructor(
    private readonly readiness: MediaProcessingReadinessService = new MediaProcessingReadinessService(),
    private readonly ocrBoundary: OcrBoundaryService = new OcrBoundaryService(),
  ) {}

  async process(
    input: MockOcrProcessingRequest,
    evaluatedAt: Date,
  ): Promise<MockOcrProcessingResult> {
    const readiness = this.readiness.evaluate(input.mediaAsset, evaluatedAt);
    if (readiness.status === "BLOCKED") {
      return {
        downstreamUseAllowed: false,
        mediaAssetId: readiness.mediaAssetId,
        metadataOnly: true,
        objectExistence: "UNKNOWN_NOT_VERIFIED",
        orchestrationPolicyVersion: mockOcrProcessingPolicyVersion,
        readinessReason: readiness.reason,
        status: "BLOCKED",
      };
    }

    try {
      const result = await this.ocrBoundary.recognize(this.toBoundaryRequest(input, readiness));
      return {
        ...result,
        downstreamUseAllowed: false,
        metadataOnly: true,
        objectExistence: "UNKNOWN_NOT_VERIFIED",
        orchestrationPolicyVersion: mockOcrProcessingPolicyVersion,
      };
    } catch {
      return {
        confidence: "UNKNOWN",
        downstreamUseAllowed: false,
        mediaAssetId: readiness.mediaAssetId,
        metadataOnly: true,
        objectExistence: "UNKNOWN_NOT_VERIFIED",
        orchestrationPolicyVersion: mockOcrProcessingPolicyVersion,
        reason: "BOUNDARY_REJECTED",
        safeMessage: "Mock recognition boundary rejected the metadata request safely.",
        status: "FAILED",
      };
    }
  }

  private toBoundaryRequest(
    input: MockOcrProcessingRequest,
    readiness: MediaProcessingReadyResult,
  ): OcrMediaMetadataRequest {
    const metadata = input.mediaAsset;
    const request: OcrMediaMetadataRequest = {
      assetKind: metadata.assetKind as OcrSupportedMediaKind,
      checksumSha256: metadata.checksumSha256 as string,
      childProfileId: metadata.childProfileId as string,
      familyId: metadata.familyId,
      mediaAssetId: readiness.mediaAssetId as string,
      mimeType: metadata.mimeType,
      mockFixtureId: input.mockFixtureId,
      sizeBytes: Number(metadata.sizeBytes),
      storageKey: metadata.storageKey as string,
      ...(input.pageCount === undefined ? {} : { pageCount: input.pageCount }),
    };

    return request;
  }
}
