"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiClientError } from "../../../lib/api-client.server";
import {
  type CreateHomeworkAttemptInput,
  HomeworkContractError,
  parseCreateHomeworkAttemptForm,
  parseHomeworkSessionId,
} from "../../../lib/homework-contract";
import { createHomeworkAttempt } from "../../../lib/homework-service.server";

function redirectForFailure(homeworkSessionId: string, error: unknown): never {
  if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
    redirect("/?authError=session");
  }
  if (
    error instanceof HomeworkContractError ||
    (error instanceof ApiClientError && error.status === 400)
  ) {
    redirect(`/homework/${homeworkSessionId}?attemptError=invalid`);
  }
  if (error instanceof ApiClientError && error.status === 404) {
    redirect("/homework?homeworkError=service");
  }
  redirect(`/homework/${homeworkSessionId}?attemptError=service`);
}

export async function createHomeworkAttemptAction(
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

  let input: CreateHomeworkAttemptInput;
  try {
    input = parseCreateHomeworkAttemptForm(formData);
  } catch (error: unknown) {
    redirectForFailure(homeworkSessionId, error);
  }

  try {
    await createHomeworkAttempt(homeworkSessionId, input);
  } catch (error: unknown) {
    redirectForFailure(homeworkSessionId, error);
  }

  revalidatePath(`/homework/${homeworkSessionId}`);
  redirect(`/homework/${homeworkSessionId}?attemptCreated=1`);
}
