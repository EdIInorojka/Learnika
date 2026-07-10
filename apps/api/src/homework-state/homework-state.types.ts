import type { HomeworkAttemptStatus, HomeworkSessionStatus } from "@prisma/client";

export const homeworkSessionStatuses = [
  "CREATED",
  "WAITING_FOR_ATTEMPT",
  "PAUSED",
  "CANCELLED",
  "CLOSED",
] as const satisfies readonly HomeworkSessionStatus[];

export const homeworkAttemptStatuses = [
  "CREATED",
  "SUBMITTED",
  "CANCELLED",
] as const satisfies readonly HomeworkAttemptStatus[];

export const homeworkStatePolicyVersion = "wave-2-slice-4-homework-state-v1";
export const meaningfulAttemptPolicyVersion = "wave-2-slice-4-meaningful-attempt-placeholder-v1";

export interface HomeworkSessionTransitionInput {
  fromStatus: string;
  toStatus: string;
}

export interface HomeworkSessionTransitionResult {
  fromStatus: HomeworkSessionStatus;
  isTerminal: boolean;
  policyVersion: typeof homeworkStatePolicyVersion;
  toStatus: HomeworkSessionStatus;
}

export interface HomeworkAttemptTransitionInput {
  fromStatus: string;
  toStatus: string;
}

export interface HomeworkAttemptTransitionResult {
  fromStatus: HomeworkAttemptStatus;
  isTerminal: boolean;
  policyVersion: typeof homeworkStatePolicyVersion;
  toStatus: HomeworkAttemptStatus;
}

export interface HomeworkAttemptNumberInput {
  attemptNumber: number;
}

export interface BuildHomeworkAttemptMetadataInput {
  attemptNumber: number;
  childProfileId: string;
  createdByUserId?: string;
  familyId: string;
  homeworkSessionId: string;
  status: string;
}

export interface HomeworkAttemptMetadata {
  attemptNumber: number;
  childProfileId: string;
  createdByUserId?: string;
  familyId: string;
  homeworkSessionId: string;
  status: HomeworkAttemptStatus;
}

export interface HomeworkAttemptSummary {
  attemptNumber: number;
  id?: string;
  status: string;
}

export interface MeaningfulAttemptInput {
  attemptStatus: string;
  hasLearnerWork: boolean;
}

export interface MeaningfulAttemptResult {
  isMeaningful: boolean;
  policyVersion: typeof meaningfulAttemptPolicyVersion;
  reason: "ATTEMPT_NOT_SUBMITTED" | "LEARNER_WORK_REQUIRED" | "PLACEHOLDER_ACCEPTED_SUBMITTED_WORK";
}

export interface AttemptGateInput {
  attempts: readonly HomeworkAttemptSummary[];
  meaningfulAttempt: MeaningfulAttemptResult;
  sessionStatus: string;
}

export interface AttemptGateResult {
  allowed: boolean;
  lastAttemptId?: string;
  lastAttemptNumber?: number;
  policyVersion: typeof homeworkStatePolicyVersion;
  reason:
    | "ATTEMPT_ABANDONED_OR_INVALID"
    | "ATTEMPT_NOT_SUBMITTED"
    | "ATTEMPT_REQUIRED"
    | "MEANINGFUL_ATTEMPT_REQUIRED"
    | "READY_AFTER_MEANINGFUL_ATTEMPT"
    | "SESSION_NOT_WAITING_FOR_ATTEMPT";
}

export interface HomeworkStateFailure {
  code:
    | "HOMEWORK_ATTEMPT_NUMBER_INVALID"
    | "HOMEWORK_ATTEMPT_STATUS_INVALID"
    | "HOMEWORK_ATTEMPT_TRANSITION_INVALID"
    | "HOMEWORK_METADATA_INVALID"
    | "HOMEWORK_SESSION_STATUS_INVALID"
    | "HOMEWORK_SESSION_TRANSITION_INVALID";
  details: Record<string, unknown>;
  message: string;
}
