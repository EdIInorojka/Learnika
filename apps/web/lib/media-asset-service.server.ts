import { authenticatedApiRequest } from "./auth-service.server";
import { parseHomeworkSessionId } from "./homework-contract";
import {
  type CreateMediaAssetMetadataInput,
  type MediaAssetView,
  parseMediaAssetResponse,
  parseMediaAssetsResponse,
} from "./media-asset-contract";

export async function createMediaAssetMetadata(
  homeworkSessionId: string,
  input: CreateMediaAssetMetadataInput,
): Promise<MediaAssetView> {
  const sessionId = parseHomeworkSessionId(homeworkSessionId);
  return parseMediaAssetResponse(
    await authenticatedApiRequest<unknown>(`/homework/sessions/${sessionId}/media-assets`, {
      body: input,
      method: "POST",
    }),
  );
}

export async function listMediaAssetMetadata(homeworkSessionId: string): Promise<MediaAssetView[]> {
  const sessionId = parseHomeworkSessionId(homeworkSessionId);
  return parseMediaAssetsResponse(
    await authenticatedApiRequest<unknown>(`/homework/sessions/${sessionId}/media-assets`, {
      method: "GET",
    }),
  );
}
