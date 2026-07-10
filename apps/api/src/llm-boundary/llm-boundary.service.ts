import { Injectable } from "@nestjs/common";

import { AssistanceContractService } from "../assistance-contract/assistance-contract.service";
import {
  type AssistanceContract,
  assistanceContractPolicyVersion,
} from "../assistance-contract/assistance-contract.types";
import {
  type AttemptGateResult,
  homeworkStatePolicyVersion,
} from "../homework-state/homework-state.types";
import {
  type ForbiddenLlmRequestKind,
  type ForbiddenLlmSourceInputTrust,
  type LlmBoundaryFailure,
  type LlmBoundaryResult,
  type LlmMockFixtureId,
  type LlmPolicyContext,
  type LlmProvider,
  type LlmRequestKind,
  type LlmSafeRequestMetadata,
  type LlmSourceInputTrust,
  forbiddenLlmRequestKinds,
  forbiddenLlmSourceInputTrustLevels,
  llmBoundaryPolicyVersion,
  llmBoundarySchemaVersion,
  llmMockFixtureIds,
  llmRequestKinds,
  llmSourceInputTrustLevels,
  localMockLlmModelVersion,
  localMockLlmProviderName,
} from "./llm-boundary.types";

const allowedRequestKeys = new Set([
  "assistanceContract",
  "attemptGate",
  "mockFixtureId",
  "policyContext",
  "requestKind",
  "sourceInputTrust",
]);

const allowedPolicyContextKeys = new Set(["gradeBand", "locale", "subject"]);
const allowedSafetyContractKeys = new Set([
  "allowed",
  "assistanceContract",
  "attemptGate",
  "category",
  "constraints",
  "contractKind",
  "gradeBand",
  "lastAttemptId",
  "lastAttemptNumber",
  "level",
  "locale",
  "mockFixtureId",
  "noFinalAnswer",
  "noFullSolution",
  "noGeneratedTextPersistence",
  "noProviderPayload",
  "noRawMedia",
  "policyContext",
  "policyVersion",
  "reason",
  "requestKind",
  "requiresMeaningfulAttempt",
  "similarExampleMustUseDifferentData",
  "sourceInputTrust",
  "subject",
]);

const forbiddenFieldPattern =
  /answer|completion|exactsolution|finalanswer|fullsolution|generatedhint|hinttext|llmcompletion|llmprompt|modeloutput|ocr|prompt|providerpayload|raw|solution|stt|textbookcontent|transcript/i;
const forbiddenResultFieldPattern =
  /answer|completion|exactsolution|finalanswer|fullsolution|generatedhint|hinttext|llmcompletion|llmprompt|modeloutput|ocr|prompt|providerpayload|solution|stt|transcript/i;
const sensitiveDiagnosticFieldPattern =
  /authorization|childnickname|completion|cookie|email|llm|password|prompt|providerpayload|raw|secret|solution|text|token|transcript|ocr|stt|answer|hint|textbook/i;
const sensitiveDiagnosticTextPattern =
  /bearer\s+[a-z0-9._~+/=-]+|password|secret|token|final\s+answer|full\s+solution|hint\s+text|prompt|completion|provider\s+payload|raw\s+media|raw\s+audio|transcript|ocr|stt|textbook|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

const baseResult = {
  modelVersion: localMockLlmModelVersion,
  noLearnerFacingText: true,
  policyVersion: llmBoundaryPolicyVersion,
  providerName: localMockLlmProviderName,
  requiresPostValidation: true,
  schemaVersion: llmBoundarySchemaVersion,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeLlmBoundaryFailure(
  code: LlmBoundaryFailure["code"],
  message: string,
  details: Record<string, unknown>,
): LlmBoundaryFailure {
  return {
    code,
    details: redactLlmDiagnostics(details) as Record<string, unknown>,
    message,
  };
}

function validateMockFixtureId(value: unknown): LlmMockFixtureId {
  if (typeof value !== "string" || !(llmMockFixtureIds as readonly string[]).includes(value)) {
    throw safeLlmBoundaryFailure("LLM_REQUEST_INVALID", "LLM mock fixture ID is not recognized.", {
      mockFixtureId: value,
    });
  }

  return value as LlmMockFixtureId;
}

function validatePolicyContext(value: unknown): LlmPolicyContext {
  if (!isRecord(value)) {
    throw safeLlmBoundaryFailure("LLM_REQUEST_INVALID", "LLM policy context must be an object.", {
      policyContext: value,
    });
  }

  for (const key of Object.keys(value)) {
    if (!allowedPolicyContextKeys.has(key)) {
      throw safeLlmBoundaryFailure(
        "LLM_REQUEST_INVALID",
        "LLM policy context contains an unsupported field.",
        { fieldName: key },
      );
    }
  }

  if (
    value.gradeBand !== "GRADES_7_9" ||
    value.locale !== "ru-RU" ||
    value.subject !== "MATHEMATICS"
  ) {
    throw safeLlmBoundaryFailure("LLM_REQUEST_INVALID", "LLM policy context is unsupported.", {
      policyContext: value,
    });
  }

  return {
    gradeBand: "GRADES_7_9",
    locale: "ru-RU",
    subject: "MATHEMATICS",
  };
}

function validateRequestKind(value: unknown): LlmRequestKind {
  if ((forbiddenLlmRequestKinds as readonly string[]).includes(String(value))) {
    throw safeLlmBoundaryFailure(
      "LLM_REQUEST_FORBIDDEN",
      "LLM request kind is outside the no-answer boundary.",
      { requestKind: value },
    );
  }

  if (typeof value !== "string" || !(llmRequestKinds as readonly string[]).includes(value)) {
    throw safeLlmBoundaryFailure("LLM_REQUEST_INVALID", "LLM request kind is not recognized.", {
      requestKind: value,
    });
  }

  return value as LlmRequestKind;
}

function validateSourceInputTrust(value: unknown): LlmSourceInputTrust {
  if ((forbiddenLlmSourceInputTrustLevels as readonly string[]).includes(String(value))) {
    throw safeLlmBoundaryFailure(
      "LLM_INPUT_UNCONFIRMED",
      "LLM boundary requires learner-confirmed or policy-only input.",
      { sourceInputTrust: value },
    );
  }

  if (
    typeof value !== "string" ||
    !(llmSourceInputTrustLevels as readonly string[]).includes(value)
  ) {
    throw safeLlmBoundaryFailure(
      "LLM_REQUEST_INVALID",
      "LLM source input trust is not recognized.",
      {
        sourceInputTrust: value,
      },
    );
  }

  return value as LlmSourceInputTrust;
}

function validateAttemptGate(value: unknown): AttemptGateResult {
  if (!isRecord(value)) {
    throw safeLlmBoundaryFailure("LLM_REQUEST_INVALID", "LLM attempt gate must be an object.", {
      attemptGate: value,
    });
  }

  if (value.policyVersion !== homeworkStatePolicyVersion) {
    throw safeLlmBoundaryFailure(
      "LLM_ATTEMPT_GATE_REQUIRED",
      "LLM boundary requires a current homework attempt gate.",
      { attemptGate: value },
    );
  }

  if (typeof value.allowed !== "boolean" || typeof value.reason !== "string") {
    throw safeLlmBoundaryFailure("LLM_REQUEST_INVALID", "LLM attempt gate shape is invalid.", {
      attemptGate: value,
    });
  }

  const result: AttemptGateResult = {
    allowed: value.allowed,
    policyVersion: homeworkStatePolicyVersion,
    reason: value.reason as AttemptGateResult["reason"],
    ...(typeof value.lastAttemptId === "string" ? { lastAttemptId: value.lastAttemptId } : {}),
    ...(typeof value.lastAttemptNumber === "number"
      ? { lastAttemptNumber: value.lastAttemptNumber }
      : {}),
  };

  return result;
}

function rejectForbiddenFields(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      rejectForbiddenFields(item);
    }
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    if (!allowedSafetyContractKeys.has(key) && forbiddenFieldPattern.test(key)) {
      throw safeLlmBoundaryFailure(
        "LLM_REQUEST_FORBIDDEN",
        "LLM request contains a forbidden field.",
        { fieldName: key },
      );
    }

    rejectForbiddenFields(item);
  }
}

function validateNoForbiddenResultFields(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      validateNoForbiddenResultFields(item);
    }
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    if (forbiddenResultFieldPattern.test(key)) {
      throw safeLlmBoundaryFailure(
        "LLM_RESULT_SCHEMA_INVALID",
        "LLM result contains a forbidden output field.",
        { fieldName: key },
      );
    }

    validateNoForbiddenResultFields(item);
  }
}

function isAssistanceContractFailure(error: unknown): error is { code: string; details?: unknown } {
  return isRecord(error) && typeof error.code === "string" && error.code.startsWith("ASSISTANCE_");
}

function ensureNoAnswerContract(contract: AssistanceContract): void {
  if (
    contract.policyVersion !== assistanceContractPolicyVersion ||
    contract.requiresMeaningfulAttempt !== true ||
    contract.constraints.noFinalAnswer !== true ||
    contract.constraints.noFullSolution !== true ||
    contract.constraints.noGeneratedTextPersistence !== true ||
    contract.constraints.noProviderPayload !== true ||
    contract.constraints.noRawMedia !== true
  ) {
    throw safeLlmBoundaryFailure(
      "LLM_ASSISTANCE_CONTRACT_INVALID",
      "LLM boundary requires the Slice 5 no-answer assistance contract.",
      { assistanceContract: contract },
    );
  }
}

export function redactLlmDiagnostics(value: unknown): unknown {
  if (typeof value === "string") {
    return sensitiveDiagnosticTextPattern.test(value) ? "[redacted]" : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactLlmDiagnostics(item));
  }

  if (!isRecord(value)) {
    return value;
  }

  const safeValue: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (sensitiveDiagnosticFieldPattern.test(key)) {
      safeValue.redactedField = "[redacted]";
      continue;
    }

    safeValue[key] = redactLlmDiagnostics(item);
  }

  return safeValue;
}

@Injectable()
export class LocalMockLlmProvider implements LlmProvider {
  async evaluate(input: LlmSafeRequestMetadata): Promise<LlmBoundaryResult> {
    const request = validateLlmSafeRequestMetadata(input);

    if (request.mockFixtureId === "provider-failure") {
      return {
        ...baseResult,
        confidence: "UNKNOWN",
        reason: "PROVIDER_FAILURE",
        safeMessage: "LLM provider boundary returned a safe mock failure.",
        status: "FAILED",
      };
    }

    if (
      request.mockFixtureId === "safe-refusal" ||
      request.requestKind === "SAFE_REFUSAL_CLASSIFICATION"
    ) {
      return {
        ...baseResult,
        confidence: "HIGH",
        refusalReason: "POLICY_BOUNDARY",
        status: "REFUSED",
      };
    }

    const result = {
      ...baseResult,
      assistanceCategory: request.assistanceContract.category,
      assistanceLevel: request.assistanceContract.level,
      confidence: "HIGH",
      status: "SAFE_INTENT_READY",
    } as const satisfies LlmBoundaryResult;

    validateNoForbiddenResultFields(result);
    return result;
  }
}

@Injectable()
export class LlmBoundaryService {
  constructor(
    private readonly assistanceContractService = new AssistanceContractService(),
    private readonly provider: LlmProvider = new LocalMockLlmProvider(),
  ) {}

  async evaluate(input: unknown): Promise<LlmBoundaryResult> {
    try {
      const request = this.validateSafeRequest(input);
      const result = await this.provider.evaluate(request);
      validateNoForbiddenResultFields(result);
      return result;
    } catch (error) {
      if (isRecord(error) && typeof error.code === "string") {
        throw error;
      }

      throw safeLlmBoundaryFailure("LLM_PROVIDER_FAILURE", "LLM boundary failed safely.", {
        cause: error instanceof Error ? error.message : String(error),
      });
    }
  }

  validateSafeRequest(input: unknown): LlmSafeRequestMetadata {
    rejectForbiddenFields(input);

    if (!isRecord(input)) {
      throw safeLlmBoundaryFailure("LLM_REQUEST_INVALID", "LLM request must be an object.", {});
    }

    for (const key of Object.keys(input)) {
      if (!allowedRequestKeys.has(key)) {
        throw safeLlmBoundaryFailure(
          "LLM_REQUEST_INVALID",
          "LLM request contains an unsupported metadata field.",
          { fieldName: key },
        );
      }
    }

    let assistanceContract: AssistanceContract;
    try {
      assistanceContract = this.assistanceContractService.validateAssistanceContract(
        input.assistanceContract,
      );
      ensureNoAnswerContract(assistanceContract);
    } catch (error) {
      if (isAssistanceContractFailure(error)) {
        throw safeLlmBoundaryFailure(
          "LLM_ASSISTANCE_CONTRACT_INVALID",
          "LLM assistance contract is invalid.",
          { cause: error.code, details: error.details },
        );
      }

      throw error;
    }

    const attemptGate = validateAttemptGate(input.attemptGate);
    const eligibility = this.assistanceContractService.evaluateEligibility({ attemptGate });
    if (!eligibility.eligible) {
      throw safeLlmBoundaryFailure(
        "LLM_ATTEMPT_GATE_REQUIRED",
        "LLM boundary requires satisfied attempt eligibility.",
        { assistanceEligibility: eligibility },
      );
    }

    return {
      assistanceContract,
      attemptGate,
      mockFixtureId: validateMockFixtureId(input.mockFixtureId),
      policyContext: validatePolicyContext(input.policyContext),
      requestKind: validateRequestKind(input.requestKind),
      sourceInputTrust: validateSourceInputTrust(input.sourceInputTrust),
    };
  }
}

export function validateLlmSafeRequestMetadata(input: unknown): LlmSafeRequestMetadata {
  const service = new LlmBoundaryService();
  return service.validateSafeRequest(input);
}

export function isForbiddenLlmRequestKind(value: string): value is ForbiddenLlmRequestKind {
  return (forbiddenLlmRequestKinds as readonly string[]).includes(value);
}

export function isForbiddenLlmSourceInputTrust(
  value: string,
): value is ForbiddenLlmSourceInputTrust {
  return (forbiddenLlmSourceInputTrustLevels as readonly string[]).includes(value);
}
