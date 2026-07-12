"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiClientError } from "../../../lib/api-client.server";
import { HomeworkContractError, parseHomeworkSessionId } from "../../../lib/homework-contract";
import {
  MediaAssetContractError,
  type CreateMediaAssetMetadataInput,
  parseCreateMediaAssetForm,
} from "../../../lib/media-asset-contract";
import { createMediaAssetMetadata } from "../../../lib/media-asset-service.server";

function redirectForFailure(homeworkSessionId: string, error: unknown): never {
  if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
    redirect("/?authError=session");
  }
  if (
    error instanceof MediaAssetContractError ||
    (error instanceof ApiClientError && error.status === 400)
  ) {
    redirect(`/homework/${homeworkSessionId}?mediaError=invalid`);
  }
  if (error instanceof ApiClientError && error.status === 404) {
    redirect("/homework?homeworkError=service");
  }
  redirect(`/homework/${homeworkSessionId}?mediaError=service`);
}

export async function createMediaAssetMetadataAction(
  homeworkSessionIdValue: string,
  formData: FormData,
): Promise<never> {
  let homeworkSessionId: string;
  try {
    homeworkSessionId = parseHomeworkSessionId(homeworkSessionIdValue);
  } catch (error: unknown) {
    if (error instanceof HomeworkContractError) {
      redirect("/homework?homeworkError=invalid");
    }
    redirect("/homework?homeworkError=service");
  }

  let input: CreateMediaAssetMetadataInput;
  try {
    input = parseCreateMediaAssetForm(formData);
  } catch (error: unknown) {
    if (error instanceof MediaAssetContractError) {
      redirect(`/homework/${homeworkSessionId}?mediaError=invalid`);
    }
    redirect(`/homework/${homeworkSessionId}?mediaError=service`);
  }

  try {
    await createMediaAssetMetadata(homeworkSessionId, input);
  } catch (error: unknown) {
    redirectForFailure(homeworkSessionId, error);
  }

  revalidatePath(`/homework/${homeworkSessionId}`);
  redirect(`/homework/${homeworkSessionId}?mediaCreated=1`);
}
