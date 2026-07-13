import { authenticatedApiRequest } from "./auth-service.server";
import { parseHomeworkSessionId } from "./homework-contract";
import { parseMediaAssetId } from "./media-asset-contract";
import {
  type MockOcrCandidateResultView,
  type MockOcrScenario,
  parseMockOcrCandidateResponse,
} from "./mock-ocr-candidate-contract";

const fixtureByScenario = {
  candidate: "clear-linear-equation",
  failure: "provider-failure",
  review: "low-confidence-equation",
} as const satisfies Record<MockOcrScenario, string>;

export async function requestMockOcrCandidate(
  homeworkSessionId: string,
  mediaAssetId: string,
  scenario: MockOcrScenario,
): Promise<MockOcrCandidateResultView> {
  const sessionId = parseHomeworkSessionId(homeworkSessionId);
  const assetId = parseMediaAssetId(mediaAssetId);
  const response = await authenticatedApiRequest<unknown>(
    `/homework/sessions/${sessionId}/media-assets/${assetId}/mock-ocr-candidate`,
    {
      body: { mockFixtureId: fixtureByScenario[scenario] },
      method: "POST",
    },
  );
  return parseMockOcrCandidateResponse(response, assetId);
}
