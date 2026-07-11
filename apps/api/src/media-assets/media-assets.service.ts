import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { HomeworkSession, MediaAsset } from "@prisma/client";

import { AuthorizationService } from "../authorization/authorization.service";
import type { AuthorizedParentContext } from "../authorization/authorization.types";
import { PrismaService } from "../database/prisma.service";
import { MediaStorageService } from "../media-storage/media-storage.service";
import type { BuildMediaAssetMetadataInput } from "../media-storage/media-storage.types";
import type { CreateMediaAssetInput } from "./media-assets.validation";
import type {
  MediaAssetResponse,
  MediaAssetSummary,
  MediaAssetsResponse,
} from "./media-assets.types";

const localMetadataRetentionMs = 24 * 60 * 60 * 1000;

@Injectable()
export class MediaAssetsService {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly mediaStorage: MediaStorageService,
    private readonly prisma: PrismaService,
  ) {}

  async createForHomeworkSession(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
    input: CreateMediaAssetInput,
  ): Promise<MediaAssetResponse> {
    const { familyId, session } = await this.requireHomeworkSessionAccess(
      context,
      homeworkSessionId,
      "authorization.media_asset.create_session.access",
    );
    const mediaAssetId = this.mediaStorage.createOpaqueMediaAssetId();
    const metadata = this.buildSafeMetadata({
      ...input,
      childProfileId: session.childProfileId,
      createdByUserId: context.user.id,
      familyId,
      homeworkSessionId: session.id,
      mediaAssetId,
      retentionUntil: new Date(Date.now() + localMetadataRetentionMs),
    });
    const mediaAsset = await this.prisma.mediaAsset.create({
      data: {
        id: mediaAssetId,
        ...metadata,
      },
    });

    return { data: { mediaAsset: this.toMediaAssetSummary(mediaAsset) } };
  }

  async listForHomeworkSession(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
  ): Promise<MediaAssetsResponse> {
    const { familyId, session } = await this.requireHomeworkSessionAccess(
      context,
      homeworkSessionId,
      "authorization.media_asset.list_session.access",
    );
    const mediaAssets = await this.prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        familyId,
        homeworkSessionId: session.id,
      },
    });

    return {
      data: {
        mediaAssets: mediaAssets.map((mediaAsset) => this.toMediaAssetSummary(mediaAsset)),
      },
    };
  }

  async getForHomeworkSession(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
    mediaAssetId: string,
  ): Promise<MediaAssetResponse> {
    const { mediaAsset } = await this.requireMediaAssetAccess(
      context,
      homeworkSessionId,
      mediaAssetId,
      "authorization.media_asset.read",
    );

    return { data: { mediaAsset: this.toMediaAssetSummary(mediaAsset) } };
  }

  async requestDeletion(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
    mediaAssetId: string,
  ): Promise<MediaAssetResponse> {
    const { mediaAsset } = await this.requireMediaAssetAccess(
      context,
      homeworkSessionId,
      mediaAssetId,
      "authorization.media_asset.request_deletion",
    );
    const deletionRequestedAt = mediaAsset.deletionRequestedAt ?? new Date();
    const updatedMediaAsset = await this.prisma.mediaAsset.update({
      data: {
        deletionRequestedAt,
        retentionStatus: "DELETION_REQUESTED",
      },
      where: { id: mediaAsset.id },
    });

    return { data: { mediaAsset: this.toMediaAssetSummary(updatedMediaAsset) } };
  }

  private buildSafeMetadata(input: BuildMediaAssetMetadataInput) {
    try {
      return this.mediaStorage.buildMediaAssetMetadata(input);
    } catch (error: unknown) {
      throw this.mediaAssetInvalid(error);
    }
  }

  private async requireHomeworkSessionAccess(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
    action: string,
  ): Promise<{ familyId: string; session: HomeworkSession }> {
    const familyContext = await this.authorization.requireParentFamily(context, action);
    const session = await this.prisma.homeworkSession.findFirst({
      where: {
        archivedAt: null,
        familyId: familyContext.familyId,
        id: homeworkSessionId,
      },
    });

    if (!session) {
      await this.authorization.recordDeniedAccess({
        action,
        familyId: familyContext.familyId,
        targetId: homeworkSessionId,
        targetType: "HomeworkSession",
        userId: context.user.id,
      });
      throw this.resourceNotFound();
    }

    return { familyId: familyContext.familyId, session };
  }

  private async requireMediaAssetAccess(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
    mediaAssetId: string,
    action: string,
  ): Promise<{ familyId: string; mediaAsset: MediaAsset; session: HomeworkSession }> {
    const { familyId, session } = await this.requireHomeworkSessionAccess(
      context,
      homeworkSessionId,
      action,
    );
    const mediaAsset = await this.prisma.mediaAsset.findFirst({
      where: {
        familyId,
        homeworkSessionId: session.id,
        id: mediaAssetId,
      },
    });

    if (!mediaAsset) {
      await this.authorization.recordDeniedAccess({
        action,
        familyId,
        targetId: mediaAssetId,
        targetType: "MediaAsset",
        userId: context.user.id,
      });
      throw this.resourceNotFound();
    }

    return { familyId, mediaAsset, session };
  }

  private mediaAssetInvalid(error: unknown): BadRequestException {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      "message" in error &&
      typeof error.code === "string" &&
      typeof error.message === "string" &&
      error.code.startsWith("MEDIA_")
    ) {
      return new BadRequestException({
        code: error.code,
        message: error.message,
      });
    }

    return new BadRequestException({
      code: "MEDIA_ASSET_INVALID_INPUT",
      message: "Media asset metadata is invalid.",
    });
  }

  private resourceNotFound(): NotFoundException {
    return new NotFoundException({
      code: "AUTHZ_RESOURCE_NOT_FOUND",
      message: "Resource was not found.",
    });
  }

  private toMediaAssetSummary(mediaAsset: MediaAsset): MediaAssetSummary {
    return {
      assetKind: mediaAsset.assetKind as MediaAssetSummary["assetKind"],
      checksumSha256: mediaAsset.checksumSha256,
      childProfileId: mediaAsset.childProfileId,
      createdAt: mediaAsset.createdAt.toISOString(),
      createdByUserId: mediaAsset.createdByUserId,
      deletedAt: mediaAsset.deletedAt?.toISOString() ?? null,
      deletionRequestedAt: mediaAsset.deletionRequestedAt?.toISOString() ?? null,
      familyId: mediaAsset.familyId,
      homeworkSessionId: mediaAsset.homeworkSessionId,
      id: mediaAsset.id,
      mimeType: mediaAsset.mimeType,
      retentionStatus: mediaAsset.retentionStatus,
      retentionUntil: mediaAsset.retentionUntil.toISOString(),
      sizeBytes: Number(mediaAsset.sizeBytes),
      storageKey: mediaAsset.storageKey,
      updatedAt: mediaAsset.updatedAt.toISOString(),
    };
  }
}
