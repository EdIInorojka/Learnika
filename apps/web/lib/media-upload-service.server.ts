import { authenticatedMultipartApiRequest } from "./auth-service.server";
import { parseHomeworkSessionId } from "./homework-contract";
import {
  type MediaAssetView,
  parseMediaAssetId,
  parseMediaAssetResponse,
} from "./media-asset-contract";
import { buildSafeMediaUploadBody } from "./media-upload-contract";

export async function uploadMediaAssetFile(
  homeworkSessionId: string,
  mediaAssetId: string,
  file: File,
): Promise<MediaAssetView> {
  const sessionId = parseHomeworkSessionId(homeworkSessionId);
  const assetId = parseMediaAssetId(mediaAssetId);
  const multipartBody = buildSafeMediaUploadBody(file);
  return parseMediaAssetResponse(
    await authenticatedMultipartApiRequest<unknown>(
      `/homework/sessions/${sessionId}/media-assets/${assetId}/upload`,
      multipartBody,
    ),
  );
}
