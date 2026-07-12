import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { MediaAsset } from "@prisma/client";

import { AuthorizationService } from "../authorization/authorization.service";
import type { AuthorizedParentContext } from "../authorization/authorization.types";
import { PrismaService } from "../database/prisma.service";
import { MockOcrProcessingOrchestrationService } from "../mock-ocr-processing/mock-ocr-processing.service";
import {
  localMockOcrModelVersion,
  ocrBoundaryPolicyVersion,
  ocrBoundarySchemaVersion,
} from "../ocr-boundary/ocr-boundary.types";
import type { MockOcrCandidateResponse, MockOcrCandidateSummary } from "./mock-ocr-candidate.types";
import type { MockOcrCandidateInput } from "./media-assets.validation";

const authorizationAction = "authorization.media_asset.mock_ocr_candidate";

@Injectable()
export class MockOcrCandidateService {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly orchestration: MockOcrProcessingOrchestrationService,
    private readonly prisma: PrismaService,
  ) {}

  async createCandidate(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
    mediaAssetId: string,
    input: MockOcrCandidateInput,
  ): Promise<MockOcrCandidateResponse> {
    const mediaAsset = await this.requireMediaAssetAccess(context, homeworkSessionId, mediaAssetId);
    const result = await this.orchestration.process(
      {
        mediaAsset: {
          assetKind: mediaAsset.assetKind,
          checksumSha256: mediaAsset.checksumSha256,
          childProfileId: mediaAsset.childProfileId,
          deletedAt: mediaAsset.deletedAt,
          deletionRequestedAt: mediaAsset.deletionRequestedAt,
          familyId: mediaAsset.familyId,
          homeworkSessionId: mediaAsset.homeworkSessionId,
          id: mediaAsset.id,
          mimeType: mediaAsset.mimeType,
          retentionStatus: mediaAsset.retentionStatus,
          retentionUntil: mediaAsset.retentionUntil,
          sizeBytes: mediaAsset.sizeBytes,
          storageKey: mediaAsset.storageKey,
        },
        mockFixtureId: input.mockFixtureId,
      },
      new Date(),
    );

    if (result.status === "BLOCKED") {
      throw new ConflictException({
        code: "MOCK_OCR_MEDIA_NOT_READY",
        message: "Media asset is not ready for mock recognition.",
      });
    }

    const common = {
      boundaryPolicyVersion: ocrBoundaryPolicyVersion,
      confidence: result.confidence,
      downstreamUseAllowed: false,
      learnerConfirmationRequired: true,
      mediaAssetId: result.mediaAssetId ?? mediaAsset.id,
      metadataOnly: true,
      modelVersion: localMockOcrModelVersion,
      objectExistence: "UNKNOWN_NOT_VERIFIED",
      orchestrationPolicyVersion: result.orchestrationPolicyVersion,
      schemaVersion: ocrBoundarySchemaVersion,
    } as const;

    let candidate: MockOcrCandidateSummary;
    if (result.status === "CANDIDATE_REQUIRES_CONFIRMATION") {
      candidate = {
        ...common,
        candidates: result.candidates.map((item) => ({
          candidateId: item.candidateId,
          confidence: item.confidence,
          source: item.source,
          text: item.text,
          trust: item.trust,
        })),
        status: result.status,
      };
    } else if (result.status === "NEEDS_REVIEW") {
      candidate = {
        ...common,
        reason: result.reason,
        status: result.status,
      };
    } else {
      candidate = {
        ...common,
        reason: result.reason === "PROVIDER_FAILURE" ? "PROVIDER_FAILURE" : "BOUNDARY_REJECTED",
        status: result.status,
      };
    }

    return { data: { candidate } };
  }

  private async requireMediaAssetAccess(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
    mediaAssetId: string,
  ): Promise<MediaAsset> {
    const familyContext = await this.authorization.requireParentFamily(
      context,
      authorizationAction,
    );
    const session = await this.prisma.homeworkSession.findFirst({
      where: {
        archivedAt: null,
        familyId: familyContext.familyId,
        id: homeworkSessionId,
      },
    });

    if (!session) {
      await this.recordDenied(
        context,
        familyContext.familyId,
        homeworkSessionId,
        "HomeworkSession",
      );
      throw this.resourceNotFound();
    }

    const mediaAsset = await this.prisma.mediaAsset.findFirst({
      where: {
        familyId: familyContext.familyId,
        homeworkSessionId: session.id,
        id: mediaAssetId,
      },
    });

    if (!mediaAsset) {
      await this.recordDenied(context, familyContext.familyId, mediaAssetId, "MediaAsset");
      throw this.resourceNotFound();
    }

    return mediaAsset;
  }

  private async recordDenied(
    context: AuthorizedParentContext,
    familyId: string,
    targetId: string,
    targetType: string,
  ): Promise<void> {
    await this.authorization.recordDeniedAccess({
      action: authorizationAction,
      familyId,
      targetId,
      targetType,
      userId: context.user.id,
    });
  }

  private resourceNotFound(): NotFoundException {
    return new NotFoundException({
      code: "AUTHZ_RESOURCE_NOT_FOUND",
      message: "Resource was not found.",
    });
  }
}
