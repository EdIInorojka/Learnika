"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiClientError } from "../../lib/api-client.server";
import { HomeworkContractError, parseCreateHomeworkSessionForm } from "../../lib/homework-contract";
import { createHomeworkSession } from "../../lib/homework-service.server";

function redirectForFailure(error: unknown): never {
  if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
    redirect("/?authError=session");
  }
  if (
    error instanceof HomeworkContractError ||
    (error instanceof ApiClientError && error.status === 400)
  ) {
    redirect("/homework?homeworkError=invalid");
  }
  if (error instanceof ApiClientError && error.status === 404) {
    redirect("/homework?homeworkError=child");
  }
  redirect("/homework?homeworkError=service");
}

export async function createHomeworkSessionAction(formData: FormData): Promise<never> {
  try {
    const session = await createHomeworkSession(parseCreateHomeworkSessionForm(formData));
    revalidatePath("/homework");
    redirect(`/homework/${session.id}?created=1`);
  } catch (error: unknown) {
    redirectForFailure(error);
  }
}
