export interface HomeworkSessionSummary {
  archivedAt: string | null;
  childProfileId: string;
  createdAt: string;
  createdByUserId: string | null;
  familyId: string;
  gradeLevel: number | null;
  id: string;
  sourceType: "IMAGE" | "MANUAL" | "PDF" | "SCREENSHOT" | "UNKNOWN";
  status: "CANCELLED" | "CLOSED" | "CREATED" | "PAUSED" | "WAITING_FOR_ATTEMPT";
  subject: "math";
  updatedAt: string;
}

export interface HomeworkAttemptSummary {
  childProfileId: string;
  createdAt: string;
  createdByUserId: string | null;
  familyId: string;
  homeworkSessionId: string;
  id: string;
  attemptNumber: number;
  status: "CANCELLED" | "CREATED" | "SUBMITTED";
  updatedAt: string;
}

export interface HomeworkSessionResponse {
  data: {
    session: HomeworkSessionSummary;
  };
}

export interface HomeworkSessionsResponse {
  data: {
    sessions: HomeworkSessionSummary[];
  };
}

export interface HomeworkAttemptResponse {
  data: {
    attempt: HomeworkAttemptSummary;
  };
}

export interface HomeworkAttemptsResponse {
  data: {
    attempts: HomeworkAttemptSummary[];
  };
}
