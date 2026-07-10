import type { HomeworkAttemptStatus, HomeworkSessionStatus } from "@prisma/client";
import { Injectable } from "@nestjs/common";

import {
  type AttemptGateInput,
  type AttemptGateResult,
  type BuildHomeworkAttemptMetadataInput,
  type HomeworkAttemptMetadata,
  type HomeworkAttemptNumberInput,
  type HomeworkAttemptTransitionInput,
  type HomeworkAttemptTransitionResult,
  type HomeworkSessionTransitionInput,
  type HomeworkSessionTransitionResult,
  type HomeworkStateFailure,
  type MeaningfulAttemptInput,
  type MeaningfulAttemptResult,
  homeworkAttemptStatuses,
  homeworkSessionStatuses,
  homeworkStatePolicyVersion,
  meaningfulAttemptPolicyVersion,
} from "./homework-state.types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const terminalSessionStatuses = new Set<HomeworkSessionStatus>(["CANCELLED", "CLOSED"]);
const terminalAttemptStatuses = new Set<HomeworkAttemptStatus>(["CANCELLED", "SUBMITTED"]);

const allowedSessionTransitions: Record<
  HomeworkSessionStatus,
  ReadonlySet<HomeworkSessionStatus>
> = {
  CANCELLED: new Set<HomeworkSessionStatus>(),
  CLOSED: new Set<HomeworkSessionStatus>(),
  CREATED: new Set<HomeworkSessionStatus>(["WAITING_FOR_ATTEMPT", "PAUSED", "CANCELLED"]),
  PAUSED: new Set<HomeworkSessionStatus>(["WAITING_FOR_ATTEMPT", "CANCELLED"]),
  WAITING_FOR_ATTEMPT: new Set<HomeworkSessionStatus>(["PAUSED", "CANCELLED", "CLOSED"]),
};

const allowedAttemptTransitions: Record<
  HomeworkAttemptStatus,
  ReadonlySet<HomeworkAttemptStatus>
> = {
  CANCELLED: new Set<HomeworkAttemptStatus>(),
  CREATED: new Set<HomeworkAttemptStatus>(["SUBMITTED", "CANCELLED"]),
  SUBMITTED: new Set<HomeworkAttemptStatus>(),
};

const sensitiveDiagnosticFieldPattern =
  /answer|authorization|childnickname|content|cookie|email|filename|hint|llm|ocr|password|provider|raw|secret|signedurl|solution|stt|token|transcript/i;
const sensitiveDiagnosticTextPattern =
  /answer|bearer\s+[a-z0-9._~+/=-]+|final\s+answer|full\s+solution|hint|llm|ocr|password|provider|raw\s+media|secret|solution|stt|transcript|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

function safeHomeworkStateFailure(
  code: HomeworkStateFailure["code"],
  message: string,
  details: Record<string, unknown>,
): HomeworkStateFailure {
  return {
    code,
    details: redactHomeworkStateDiagnostics(details) as Record<string, unknown>,
    message,
  };
}

function assertUuid(value: string, fieldName: string): void {
  if (!uuidPattern.test(value)) {
    throw safeHomeworkStateFailure(
      "HOMEWORK_METADATA_INVALID",
      "Homework metadata must use opaque internal identifiers.",
      {
        fieldName,
      },
    );
  }
}

export function redactHomeworkStateDiagnostics(value: unknown): unknown {
  if (typeof value === "string") {
    return sensitiveDiagnosticTextPattern.test(value) ? "[redacted]" : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactHomeworkStateDiagnostics(item));
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  const safeValue: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (sensitiveDiagnosticFieldPattern.test(key)) {
      safeValue.redactedField = "[redacted]";
      continue;
    }

    safeValue[key] = redactHomeworkStateDiagnostics(item);
  }

  return safeValue;
}

@Injectable()
export class HomeworkStateService {
  validateSessionStatus(status: string): HomeworkSessionStatus {
    if (!this.isSessionStatus(status)) {
      throw safeHomeworkStateFailure(
        "HOMEWORK_SESSION_STATUS_INVALID",
        "Unsupported homework session status.",
        {
          status,
        },
      );
    }

    return status;
  }

  validateAttemptStatus(status: string): HomeworkAttemptStatus {
    if (!this.isAttemptStatus(status)) {
      throw safeHomeworkStateFailure(
        "HOMEWORK_ATTEMPT_STATUS_INVALID",
        "Unsupported homework attempt status.",
        {
          status,
        },
      );
    }

    return status;
  }

  transitionSession(input: HomeworkSessionTransitionInput): HomeworkSessionTransitionResult {
    const fromStatus = this.validateSessionStatus(input.fromStatus);
    const toStatus = this.validateSessionStatus(input.toStatus);

    if (!allowedSessionTransitions[fromStatus].has(toStatus)) {
      throw safeHomeworkStateFailure(
        "HOMEWORK_SESSION_TRANSITION_INVALID",
        "Invalid homework session state transition.",
        {
          fromStatus,
          toStatus,
        },
      );
    }

    return {
      fromStatus,
      isTerminal: terminalSessionStatuses.has(toStatus),
      policyVersion: homeworkStatePolicyVersion,
      toStatus,
    };
  }

  transitionAttempt(input: HomeworkAttemptTransitionInput): HomeworkAttemptTransitionResult {
    const fromStatus = this.validateAttemptStatus(input.fromStatus);
    const toStatus = this.validateAttemptStatus(input.toStatus);

    if (!allowedAttemptTransitions[fromStatus].has(toStatus)) {
      throw safeHomeworkStateFailure(
        "HOMEWORK_ATTEMPT_TRANSITION_INVALID",
        "Invalid homework attempt state transition.",
        {
          fromStatus,
          toStatus,
        },
      );
    }

    return {
      fromStatus,
      isTerminal: terminalAttemptStatuses.has(toStatus),
      policyVersion: homeworkStatePolicyVersion,
      toStatus,
    };
  }

  nextAttemptNumber(existingAttempts: readonly HomeworkAttemptNumberInput[]): number {
    let maxAttemptNumber = 0;

    for (const attempt of existingAttempts) {
      this.validateAttemptNumber(attempt.attemptNumber);
      maxAttemptNumber = Math.max(maxAttemptNumber, attempt.attemptNumber);
    }

    if (maxAttemptNumber >= Number.MAX_SAFE_INTEGER) {
      throw safeHomeworkStateFailure(
        "HOMEWORK_ATTEMPT_NUMBER_INVALID",
        "Next homework attempt number would exceed the safe integer range.",
        {
          attemptNumber: maxAttemptNumber,
        },
      );
    }

    return maxAttemptNumber + 1;
  }

  buildAttemptMetadata(input: BuildHomeworkAttemptMetadataInput): HomeworkAttemptMetadata {
    assertUuid(input.familyId, "familyId");
    assertUuid(input.childProfileId, "childProfileId");
    assertUuid(input.homeworkSessionId, "homeworkSessionId");
    if (input.createdByUserId) {
      assertUuid(input.createdByUserId, "createdByUserId");
    }

    return {
      attemptNumber: this.validateAttemptNumber(input.attemptNumber),
      childProfileId: input.childProfileId,
      familyId: input.familyId,
      homeworkSessionId: input.homeworkSessionId,
      status: this.validateAttemptStatus(input.status),
      ...(input.createdByUserId ? { createdByUserId: input.createdByUserId } : {}),
    };
  }

  evaluateMeaningfulAttemptPlaceholder(input: MeaningfulAttemptInput): MeaningfulAttemptResult {
    const attemptStatus = this.validateAttemptStatus(input.attemptStatus);

    if (attemptStatus !== "SUBMITTED") {
      return {
        isMeaningful: false,
        policyVersion: meaningfulAttemptPolicyVersion,
        reason: "ATTEMPT_NOT_SUBMITTED",
      };
    }

    if (!input.hasLearnerWork) {
      return {
        isMeaningful: false,
        policyVersion: meaningfulAttemptPolicyVersion,
        reason: "LEARNER_WORK_REQUIRED",
      };
    }

    return {
      isMeaningful: true,
      policyVersion: meaningfulAttemptPolicyVersion,
      reason: "PLACEHOLDER_ACCEPTED_SUBMITTED_WORK",
    };
  }

  evaluateAttemptGate(input: AttemptGateInput): AttemptGateResult {
    const sessionStatus = this.validateSessionStatus(input.sessionStatus);
    if (sessionStatus !== "WAITING_FOR_ATTEMPT") {
      return {
        allowed: false,
        policyVersion: homeworkStatePolicyVersion,
        reason: "SESSION_NOT_WAITING_FOR_ATTEMPT",
      };
    }

    if (input.attempts.length === 0) {
      return {
        allowed: false,
        policyVersion: homeworkStatePolicyVersion,
        reason: "ATTEMPT_REQUIRED",
      };
    }

    const attempts = input.attempts.map((attempt) => ({
      ...attempt,
      attemptNumber: this.validateAttemptNumber(attempt.attemptNumber),
      status: this.validateAttemptStatus(attempt.status),
    }));
    attempts.sort((first, second) => first.attemptNumber - second.attemptNumber);

    const lastAttempt = attempts.at(-1);
    if (!lastAttempt) {
      return {
        allowed: false,
        policyVersion: homeworkStatePolicyVersion,
        reason: "ATTEMPT_REQUIRED",
      };
    }

    if (lastAttempt.status === "CANCELLED") {
      return this.withLastAttempt(lastAttempt, {
        allowed: false,
        policyVersion: homeworkStatePolicyVersion,
        reason: "ATTEMPT_ABANDONED_OR_INVALID",
      });
    }

    if (lastAttempt.status !== "SUBMITTED") {
      return this.withLastAttempt(lastAttempt, {
        allowed: false,
        policyVersion: homeworkStatePolicyVersion,
        reason: "ATTEMPT_NOT_SUBMITTED",
      });
    }

    if (!input.meaningfulAttempt.isMeaningful) {
      return this.withLastAttempt(lastAttempt, {
        allowed: false,
        policyVersion: homeworkStatePolicyVersion,
        reason: "MEANINGFUL_ATTEMPT_REQUIRED",
      });
    }

    return this.withLastAttempt(lastAttempt, {
      allowed: true,
      policyVersion: homeworkStatePolicyVersion,
      reason: "READY_AFTER_MEANINGFUL_ATTEMPT",
    });
  }

  private validateAttemptNumber(attemptNumber: number): number {
    if (!Number.isSafeInteger(attemptNumber) || attemptNumber < 1) {
      throw safeHomeworkStateFailure(
        "HOMEWORK_ATTEMPT_NUMBER_INVALID",
        "Homework attempt number must be a positive safe integer.",
        {
          attemptNumber,
        },
      );
    }

    return attemptNumber;
  }

  private isSessionStatus(status: string): status is HomeworkSessionStatus {
    return (homeworkSessionStatuses as readonly string[]).includes(status);
  }

  private isAttemptStatus(status: string): status is HomeworkAttemptStatus {
    return (homeworkAttemptStatuses as readonly string[]).includes(status);
  }

  private withLastAttempt(
    attempt: { attemptNumber: number; id?: string },
    result: Omit<AttemptGateResult, "lastAttemptId" | "lastAttemptNumber">,
  ): AttemptGateResult {
    return {
      ...result,
      lastAttemptNumber: attempt.attemptNumber,
      ...(attempt.id ? { lastAttemptId: attempt.id } : {}),
    };
  }
}
