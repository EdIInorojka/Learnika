import { authenticatedApiRequest } from "./auth-service.server";
import {
  type ChildProfileChoice,
  type CreateHomeworkSessionInput,
  type HomeworkAttemptView,
  type HomeworkSessionView,
  parseChildProfileChoices,
  parseHomeworkAttemptsResponse,
  parseHomeworkSessionId,
  parseHomeworkSessionResponse,
  parseHomeworkSessionsResponse,
} from "./homework-contract";

export async function createHomeworkSession(
  input: CreateHomeworkSessionInput,
): Promise<HomeworkSessionView> {
  return parseHomeworkSessionResponse(
    await authenticatedApiRequest<unknown>("/homework/sessions", {
      body: input,
      method: "POST",
    }),
  );
}

export async function listHomeworkSessions(): Promise<HomeworkSessionView[]> {
  return parseHomeworkSessionsResponse(
    await authenticatedApiRequest<unknown>("/homework/sessions", { method: "GET" }),
  );
}

export async function getHomeworkSession(homeworkSessionId: string): Promise<HomeworkSessionView> {
  const id = parseHomeworkSessionId(homeworkSessionId);
  return parseHomeworkSessionResponse(
    await authenticatedApiRequest<unknown>(`/homework/sessions/${id}`, { method: "GET" }),
  );
}

export async function listHomeworkAttempts(
  homeworkSessionId: string,
): Promise<HomeworkAttemptView[]> {
  const id = parseHomeworkSessionId(homeworkSessionId);
  return parseHomeworkAttemptsResponse(
    await authenticatedApiRequest<unknown>(`/homework/sessions/${id}/attempts`, { method: "GET" }),
  );
}

export async function listChildProfileChoices(): Promise<ChildProfileChoice[]> {
  return parseChildProfileChoices(
    await authenticatedApiRequest<unknown>("/family-setup/children", { method: "GET" }),
  );
}
