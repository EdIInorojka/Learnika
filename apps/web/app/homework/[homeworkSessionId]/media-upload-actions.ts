"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiClientError } from "../../../lib/api-client.server";
import { HomeworkContractError, parseHomeworkSessionId } from "../../../lib/homework-contract";
import { MediaAssetContractError, parseMediaAssetId } from "../../../lib/media-asset-contract";
import { MediaUploadContractError, parseMediaUploadForm } from "../../../lib/media-upload-contract";
import { uploadMediaAssetFile } from "../../../lib/media-upload-service.server";

function redirectForUploadFailure(homeworkSessionId: string, error: unknown): never {
  if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
    redirect("/?authError=session");
  }
  if (
    error instanceof MediaUploadContractError ||
    (error instanceof ApiClientError && [400, 413, 415].includes(error.status))
  ) {
    redirect(`/homework/${homeworkSessionId}?uploadError=invalid`);
  }
  if (error instanceof ApiClientError && error.status === 409) {
    redirect(`/homework/${homeworkSessionId}?uploadError=state`);
  }
  if (error instanceof ApiClientError && error.status === 404) {
    redirect("/homework?homeworkError=service");
  }
  redirect(`/homework/${homeworkSessionId}?uploadError=service`);
}

export async function uploadMediaAssetAction(
  homeworkSessionIdValue: string,
  mediaAssetIdValue: string,
  expectedMimeType: string,
  expectedSizeBytes: number,
  formData: FormData,
): Promise<never> {
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

  let file: File;
  try {
    file = parseMediaUploadForm(formData, expectedMimeType, expectedSizeBytes);
  } catch (error: unknown) {
    redirectForUploadFailure(homeworkSessionId, error);
  }

  try {
    await uploadMediaAssetFile(homeworkSessionId, mediaAssetId, file);
  } catch (error: unknown) {
    redirectForUploadFailure(homeworkSessionId, error);
  }

  revalidatePath(`/homework/${homeworkSessionId}`);
  redirect(`/homework/${homeworkSessionId}?uploadSuccess=1`);
}
