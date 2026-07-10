import { Injectable } from "@nestjs/common";

import {
  type AssistanceCategory,
  type AssistanceContract,
  type AssistanceContractConstraints,
  type AssistanceContractFailure,
  type AssistanceEligibilityInput,
  type AssistanceEligibilityResult,
  type AssistanceLevel,
  type SafeAssistanceFallback,
  allowedAssistanceCategories,
  assistanceContractPolicyVersion,
  assistanceLevels,
  forbiddenContentCategories,
} from "./assistance-contract.types";

const allowedContractKeys = new Set([
  "category",
  "constraints",
  "contractKind",
  "level",
  "policyVersion",
  "requiresMeaningfulAttempt",
]);

const allowedConstraintKeys = new Set([
  "noFinalAnswer",
  "noFullSolution",
  "noGeneratedTextPersistence",
  "noProviderPayload",
  "noRawMedia",
  "similarExampleMustUseDifferentData",
]);

const forbiddenFieldPattern =
  /answer|exactsolution|finalanswer|fullsolution|generatedhint|hinttext|llmcompletion|llmprompt|modeloutput|ocrresult|providerpayload|rawmedia|solution|sttresult|textbookcontent|transcript/i;
const sensitiveDiagnosticFieldPattern =
  /authorization|childnickname|cookie|email|password|secret|token|answer|solution|hint|transcript|ocr|stt|llm|provider|raw|textbook/i;
const sensitiveDiagnosticTextPattern =
  /bearer\s+[a-z0-9._~+/=-]+|password|secret|token|final\s+answer|full\s+solution|hint\s+text|transcript|ocr|stt|llm|provider|raw\s+media|textbook|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

function safeAssistanceContractFailure(
  code: AssistanceContractFailure["code"],
  message: string,
  details: Record<string, unknown>,
): AssistanceContractFailure {
  return {
    code,
    details: redactAssistanceContractDiagnostics(details) as Record<string, unknown>,
    message,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function redactAssistanceContractDiagnostics(value: unknown): unknown {
  if (typeof value === "string") {
    return sensitiveDiagnosticTextPattern.test(value) ? "[redacted]" : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactAssistanceContractDiagnostics(item));
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

    safeValue[key] = redactAssistanceContractDiagnostics(item);
  }

  return safeValue;
}

@Injectable()
export class AssistanceContractService {
  getAllowedAssistanceCategories(): readonly AssistanceCategory[] {
    return allowedAssistanceCategories;
  }

  getForbiddenContentCategories(): readonly string[] {
    return forbiddenContentCategories;
  }

  validateAssistanceContract(input: unknown): AssistanceContract {
    this.rejectForbiddenFields(input);

    if (!isRecord(input)) {
      throw safeAssistanceContractFailure(
        "ASSISTANCE_CONTRACT_INVALID",
        "Assistance contract must be an object.",
        {},
      );
    }

    for (const key of Object.keys(input)) {
      if (!allowedContractKeys.has(key)) {
        throw safeAssistanceContractFailure(
          "ASSISTANCE_CONTRACT_INVALID",
          "Assistance contract contains an unsupported field.",
          { fieldName: key },
        );
      }
    }

    if (input.contractKind !== "ASSISTANCE_CONTRACT") {
      throw safeAssistanceContractFailure(
        "ASSISTANCE_CONTRACT_INVALID",
        "Assistance contract kind is invalid.",
        { contractKind: input.contractKind },
      );
    }

    if (input.policyVersion !== assistanceContractPolicyVersion) {
      throw safeAssistanceContractFailure(
        "ASSISTANCE_CONTRACT_INVALID",
        "Assistance contract policy version is invalid.",
        { policyVersion: input.policyVersion },
      );
    }

    if (input.requiresMeaningfulAttempt !== true) {
      throw safeAssistanceContractFailure(
        "ASSISTANCE_ATTEMPT_GATE_REQUIRED",
        "Assistance contract must require a meaningful attempt.",
        {},
      );
    }

    const category = this.validateCategory(input.category);
    const level = this.validateLevel(input.level);
    const constraints = this.validateConstraints(input.constraints, category);

    return {
      category,
      constraints,
      contractKind: "ASSISTANCE_CONTRACT",
      level,
      policyVersion: assistanceContractPolicyVersion,
      requiresMeaningfulAttempt: true,
    };
  }

  evaluateEligibility(input: AssistanceEligibilityInput): AssistanceEligibilityResult {
    const gate = input.attemptGate;
    if (gate.allowed) {
      return {
        eligible: true,
        policyVersion: assistanceContractPolicyVersion,
        reason: "ATTEMPT_GATE_SATISFIED",
      };
    }

    if (gate.reason === "ATTEMPT_REQUIRED") {
      return {
        eligible: false,
        policyVersion: assistanceContractPolicyVersion,
        reason: "ATTEMPT_REQUIRED",
      };
    }

    if (gate.reason === "MEANINGFUL_ATTEMPT_REQUIRED") {
      return {
        eligible: false,
        policyVersion: assistanceContractPolicyVersion,
        reason: "MEANINGFUL_ATTEMPT_REQUIRED",
      };
    }

    return {
      eligible: false,
      policyVersion: assistanceContractPolicyVersion,
      reason: "ATTEMPT_STATE_NOT_READY",
    };
  }

  buildSafeFallback(reason: SafeAssistanceFallback["reason"]): SafeAssistanceFallback {
    return {
      category: "SAFE_REFUSAL_FALLBACK",
      contractKind: "ASSISTANCE_FALLBACK",
      eligible: false,
      policyVersion: assistanceContractPolicyVersion,
      reason,
    };
  }

  private rejectForbiddenFields(value: unknown): void {
    if (Array.isArray(value)) {
      for (const item of value) {
        this.rejectForbiddenFields(item);
      }
      return;
    }

    if (!isRecord(value)) {
      return;
    }

    for (const [key, item] of Object.entries(value)) {
      if (!allowedConstraintKeys.has(key) && forbiddenFieldPattern.test(key)) {
        throw safeAssistanceContractFailure(
          "ASSISTANCE_CONTRACT_UNSAFE_FIELD",
          "Assistance contract contains a forbidden field.",
          { fieldName: key },
        );
      }

      this.rejectForbiddenFields(item);
    }
  }

  private validateCategory(value: unknown): AssistanceCategory {
    if (
      typeof value !== "string" ||
      !(allowedAssistanceCategories as readonly string[]).includes(value)
    ) {
      throw safeAssistanceContractFailure(
        "ASSISTANCE_CONTRACT_UNSAFE_CATEGORY",
        "Assistance category is not allowed.",
        { category: value },
      );
    }

    return value as AssistanceCategory;
  }

  private validateLevel(value: unknown): AssistanceLevel {
    if (typeof value !== "string" || !(assistanceLevels as readonly string[]).includes(value)) {
      throw safeAssistanceContractFailure(
        "ASSISTANCE_CONTRACT_INVALID",
        "Assistance level is invalid.",
        { level: value },
      );
    }

    return value as AssistanceLevel;
  }

  private validateConstraints(
    value: unknown,
    category: AssistanceCategory,
  ): AssistanceContractConstraints {
    if (!isRecord(value)) {
      throw safeAssistanceContractFailure(
        "ASSISTANCE_CONTRACT_INVALID",
        "Assistance constraints must be an object.",
        {},
      );
    }

    for (const key of Object.keys(value)) {
      if (!allowedConstraintKeys.has(key)) {
        throw safeAssistanceContractFailure(
          "ASSISTANCE_CONTRACT_INVALID",
          "Assistance constraints contain an unsupported field.",
          { fieldName: key },
        );
      }
    }

    const constraints = {
      noFinalAnswer: value.noFinalAnswer,
      noFullSolution: value.noFullSolution,
      noGeneratedTextPersistence: value.noGeneratedTextPersistence,
      noProviderPayload: value.noProviderPayload,
      noRawMedia: value.noRawMedia,
      similarExampleMustUseDifferentData: value.similarExampleMustUseDifferentData,
    };

    for (const [key, item] of Object.entries(constraints)) {
      if (item !== true && !(key === "similarExampleMustUseDifferentData" && item === undefined)) {
        throw safeAssistanceContractFailure(
          "ASSISTANCE_CONTRACT_INVALID",
          "Assistance constraints must keep safety boundaries enabled.",
          { fieldName: key },
        );
      }
    }

    if (
      category === "WORKED_SIMILAR_EXAMPLE_DIFFERENT_DATA" &&
      constraints.similarExampleMustUseDifferentData !== true
    ) {
      throw safeAssistanceContractFailure(
        "ASSISTANCE_CONTRACT_INVALID",
        "Similar example contracts must require different data.",
        {},
      );
    }

    return {
      noFinalAnswer: true,
      noFullSolution: true,
      noGeneratedTextPersistence: true,
      noProviderPayload: true,
      noRawMedia: true,
      ...(constraints.similarExampleMustUseDifferentData
        ? { similarExampleMustUseDifferentData: true }
        : {}),
    };
  }
}
