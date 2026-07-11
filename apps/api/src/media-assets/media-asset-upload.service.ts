import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import type { HomeworkSession, MediaAsset } from "@prisma/client";

import { AuthorizationService } from "../authorization/authorization.service";
import type { AuthorizedParentContext } from "../authorization/authorization.types";
import { PrismaService } from "../database/prisma.service";
import { LocalMediaObjectStorageService } from "../media-storage/local-media-object-storage.service";
import { MediaStorageService, createSha256Hex } from "../media-storage/media-storage.service";
import { hasExpectedMediaSignature } from "./media-asset-upload.validation";
import type { ParsedMediaUpload, PreparedMediaUploadTarget } from "./media-asset-upload.types";
import type { MediaAssetResponse, MediaAssetSummary } from "./media-assets.types";

@Injectable()
export class MediaAssetUploadService {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly localObjectStorage: LocalMediaObjectStorageService,
    private readonly mediaStorage: MediaStorageService,
    private readonly prisma: PrismaService,
  ) {}

  getMaxFileSizeBytes(): number {
    return this.mediaStorage.getConfig().maxFileSizeBytes;
  }

  async prepareUpload(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
    mediaAssetId: string,
  ): Promise<PreparedMediaUploadTarget> {
    const familyContext = await this.authorization.requireParentFamily(
      context,
      "authorization.media_asset.upload",
    );
    const session = await this.requireHomeworkSession(
      context,
      familyContext.familyId,
      homeworkSessionId,
    );
    const mediaAsset = await this.prisma.mediaAsset.findFirst({
      where: {
        familyId: familyContext.familyId,
        homeworkSessionId: session.id,
        id: mediaAssetId,
      },
    });

    if (!mediaAsset) {
      await this.authorization.recordDeniedAccess({
        action: "authorization.media_asset.upload",
        familyId: familyContext.familyId,
        targetId: mediaAssetId,
        targetType: "MediaAsset",
        userId: context.user.id,
      });
      throw this.resourceNotFound();
    }

    this.assertUploadState(mediaAsset);
    return mediaAsset;
  }

  async storeUpload(
    target: PreparedMediaUploadTarget,
    upload: ParsedMediaUpload,
  ): Promise<MediaAssetResponse> {
    const current = await this.prisma.mediaAsset.findFirst({
      where: {
        familyId: target.familyId,
        homeworkSessionId: target.homeworkSessionId,
        id: target.id,
      },
    });

    if (!current) {
      throw this.resourceNotFound();
    }

    this.assertUploadState(current);
    this.validateUpload(current, upload);

    const checksumSha256 = createSha256Hex(upload.content);
    if (current.checksumSha256 && current.checksumSha256 !== checksumSha256) {
      throw new BadRequestException({
        code: "MEDIA_UPLOAD_CHECKSUM_MISMATCH",
        message: "Media checksum does not match its metadata.",
      });
    }

    try {
      await this.localObjectStorage.putObject({
        content: upload.content,
        mimeType: upload.mimeType,
        sizeBytes: upload.sizeBytes,
        storageKey: current.storageKey as string,
      });
    } catch {
      throw new ServiceUnavailableException({
        code: "MEDIA_UPLOAD_STORAGE_UNAVAILABLE",
        message: "Local media storage is unavailable.",
      });
    }

    const updated = await this.prisma.mediaAsset.update({
      data: { checksumSha256 },
      where: { id: current.id },
    });
    return { data: { mediaAsset: this.toMediaAssetSummary(updated) } };
  }

  private async requireHomeworkSession(
    context: AuthorizedParentContext,
    familyId: string,
    homeworkSessionId: string,
  ): Promise<HomeworkSession> {
    const session = await this.prisma.homeworkSession.findFirst({
      where: { archivedAt: null, familyId, id: homeworkSessionId },
    });

    if (!session) {
      await this.authorization.recordDeniedAccess({
        action: "authorization.media_asset.upload",
        familyId,
        targetId: homeworkSessionId,
        targetType: "HomeworkSession",
        userId: context.user.id,
      });
      throw this.resourceNotFound();
    }

    return session;
  }

  private assertUploadState(mediaAsset: MediaAsset): void {
    if (
      mediaAsset.retentionStatus !== "TEMPORARY" ||
      mediaAsset.deletionRequestedAt !== null ||
      mediaAsset.deletedAt !== null ||
      mediaAsset.retentionUntil.getTime() <= Date.now() ||
      !mediaAsset.storageKey
    ) {
      throw new ConflictException({
        code: "MEDIA_UPLOAD_STATE_UNSAFE",
        message: "Media asset state does not allow upload.",
      });
    }
  }

  private validateUpload(mediaAsset: MediaAsset, upload: ParsedMediaUpload): void {
    if (!this.mediaStorage.isSupportedMimeType(upload.mimeType)) {
      throw new BadRequestException({
        code: "MEDIA_UPLOAD_MIME_UNSUPPORTED",
        message: "Media MIME type is unsupported.",
      });
    }

    if (upload.mimeType !== mediaAsset.mimeType) {
      throw new BadRequestException({
        code: "MEDIA_UPLOAD_METADATA_MISMATCH",
        message: "Media file does not match its metadata.",
      });
    }

    try {
      this.mediaStorage.validateAsset({
        assetKind: mediaAsset.assetKind as
          "HOMEWORK_IMAGE" | "HOMEWORK_PDF" | "HOMEWORK_SCREENSHOT",
        mimeType: upload.mimeType,
        sizeBytes: upload.sizeBytes,
      });
      this.mediaStorage.validateStorageKey(mediaAsset.storageKey as string);
    } catch {
      throw new BadRequestException({
        code: "MEDIA_UPLOAD_METADATA_INVALID",
        message: "Media upload metadata is invalid.",
      });
    }

    if (upload.sizeBytes !== Number(mediaAsset.sizeBytes)) {
      throw new BadRequestException({
        code: "MEDIA_UPLOAD_SIZE_MISMATCH",
        message: "Media size does not match its metadata.",
      });
    }

    if (!hasExpectedMediaSignature(upload.mimeType, upload.content)) {
      throw new BadRequestException({
        code: "MEDIA_UPLOAD_SIGNATURE_INVALID",
        message: "Media file signature is invalid.",
      });
    }
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
