"use server";

import { redirect } from "next/navigation";

import { ApiClientError } from "../../../lib/api-client.server";
import { HomeworkContractError, parseHomeworkSessionId } from "../../../lib/homework-contract";
import { MediaAssetContractError, parseMediaAssetId } from "../../../lib/media-asset-contract";
import {
  type MockOcrCandidateActionState,
  MockOcrCandidateContractError,
  type MockOcrScenario,
  parseMockOcrCandidateForm,
} from "../../../lib/mock-ocr-candidate-contract";
import { requestMockOcrCandidate } from "../../../lib/mock-ocr-candidate-service.server";

export async function requestMockOcrCandidateAction(
  homeworkSessionIdValue: string,
  mediaAssetIdValue: string,
  _previousState: MockOcrCandidateActionState,
  formData: FormData,
): Promise<MockOcrCandidateActionState> {
  let homeworkSessionId: string;
  let mediaAssetId: string;
  try {
    homeworkSessionId = parseHomeworkSessionId(homeworkSessionIdValue);
    mediaAssetId = parseMediaAssetId(mediaAssetIdValue);
  } catch (error: unknown) {
    if (error instanceof HomeworkContractError || error instanceof MediaAssetContractError) {
      redirect("/homework?homeworkError=invalid");
    }
    redirect("/homework?homeworkError=service");
  }

  let scenario: MockOcrScenario;
  try {
    scenario = parseMockOcrCandidateForm(formData);
  } catch (error: unknown) {
    if (error instanceof MockOcrCandidateContractError) return { status: "INVALID" };
    return { status: "UNAVAILABLE" };
  }

  try {
    return {
      result: await requestMockOcrCandidate(homeworkSessionId, mediaAssetId, scenario),
      status: "RESULT",
    };
  } catch (error: unknown) {
    if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
      redirect("/?authError=session");
    }
    if (error instanceof ApiClientError && error.status === 404) {
      redirect("/homework?homeworkError=service");
    }
    if (error instanceof ApiClientError && error.status === 409) return { status: "NOT_READY" };
    if (
      error instanceof MockOcrCandidateContractError ||
      (error instanceof ApiClientError && error.status === 400)
    ) {
      return { status: "INVALID" };
    }
    return { status: "UNAVAILABLE" };
  }
}
