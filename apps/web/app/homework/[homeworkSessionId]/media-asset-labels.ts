import type { MediaAssetKind, MediaRetentionStatus } from "../../../lib/media-asset-contract";

const kindLabels: Record<MediaAssetKind, string> = {
  HOMEWORK_IMAGE: "Изображение задания",
  HOMEWORK_PDF: "PDF задания",
  HOMEWORK_SCREENSHOT: "Скриншот задания",
};

const retentionLabels: Record<MediaRetentionStatus, string> = {
  DELETED: "Удалено",
  DELETION_REQUESTED: "Запрошено удаление",
  RETENTION_EXPIRED: "Срок хранения истек",
  TEMPORARY: "Временное хранение",
};

const byteFormatter = new Intl.NumberFormat("ru-RU");

export function mediaAssetKindLabel(kind: MediaAssetKind): string {
  return kindLabels[kind];
}

export function mediaRetentionLabel(status: MediaRetentionStatus): string {
  return retentionLabels[status];
}

export function formatByteSize(sizeBytes: number): string {
  return `${byteFormatter.format(sizeBytes)} байт`;
}
