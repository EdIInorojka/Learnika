import type {
  AssistanceCategory,
  AssistanceContract,
  AssistanceLevel,
} from "../assistance-contract/assistance-contract.types";
import type { AttemptGateResult } from "../homework-state/homework-state.types";

export const llmBoundaryPolicyVersion = "wave-2-slice-8-llm-boundary-v1";
export const llmBoundarySchemaVersion = "llm-safe-intent-boundary-v1";
export const localMockLlmProviderName = "local-mock-llm";
export const localMockLlmModelVersion = "local-mock-llm-v1";

export const llmRequestKinds = ["SAFE_ASSISTANCE_INTENT", "SAFE_REFUSAL_CLASSIFICATION"] as const;

export type LlmRequestKind = (typeof llmRequestKinds)[number];

export const forbiddenLlmRequestKinds = [
  "ANSWER_CHECKING",
  "DIRECT_ANSWER_REQUEST",
  "FULL_SOLUTION_REQUEST",
  "SOLUTION_GENERATION",
  "STEP_BY_STEP_SOURCE_SOLUTION",
] as const;

export type ForbiddenLlmRequestKind = (typeof forbiddenLlmRequestKinds)[number];

export const llmSourceInputTrustLevels = [
  "INTERNAL_POLICY_ONLY",
  "LEARNER_CONFIRMED_TEXT",
] as const;

export type LlmSourceInputTrust = (typeof llmSourceInputTrustLevels)[number];

export const forbiddenLlmSourceInputTrustLevels = [
  "UNCONFIRMED_OCR_CANDIDATE",
  "UNCONFIRMED_STT_TRANSCRIPT",
] as const;

export type ForbiddenLlmSourceInputTrust = (typeof forbiddenLlmSourceInputTrustLevels)[number];

export const llmMockFixtureIds = [
  "provider-failure",
  "safe-concept-reminder",
  "safe-refusal",
] as const;

export type LlmMockFixtureId = (typeof llmMockFixtureIds)[number];

export type LlmConfidenceBand = "HIGH" | "MEDIUM" | "UNKNOWN";

export type LlmFailureReason =
  | "INVALID_ASSISTANCE_CONTRACT"
  | "INVALID_REQUEST"
  | "MISSING_ATTEMPT_ELIGIBILITY"
  | "PROVIDER_FAILURE"
  | "UNCONFIRMED_INPUT"
  | "UNSAFE_REQUEST";

export interface LlmPolicyContext {
  gradeBand: "GRADES_7_9";
  locale: "ru-RU";
  subject: "MATHEMATICS";
}

export interface LlmSafeRequestMetadata {
  assistanceContract: AssistanceContract;
  attemptGate: AttemptGateResult;
  mockFixtureId: LlmMockFixtureId;
  policyContext: LlmPolicyContext;
  requestKind: LlmRequestKind;
  sourceInputTrust: LlmSourceInputTrust;
}

export interface LlmBoundaryBaseResult {
  modelVersion: typeof localMockLlmModelVersion;
  noLearnerFacingText: true;
  policyVersion: typeof llmBoundaryPolicyVersion;
  providerName: typeof localMockLlmProviderName;
  requiresPostValidation: true;
  schemaVersion: typeof llmBoundarySchemaVersion;
}

export interface LlmSafeIntentResult extends LlmBoundaryBaseResult {
  assistanceCategory: AssistanceCategory;
  assistanceLevel: AssistanceLevel;
  confidence: "HIGH" | "MEDIUM";
  status: "SAFE_INTENT_READY";
}

export interface LlmRefusalResult extends LlmBoundaryBaseResult {
  confidence: "HIGH";
  refusalReason:
    "ATTEMPT_GATE_REQUIRED" | "DIRECT_ANSWER_REQUEST" | "POLICY_BOUNDARY" | "UNCONFIRMED_INPUT";
  status: "REFUSED";
}

export interface LlmFailureResult extends LlmBoundaryBaseResult {
  confidence: "UNKNOWN";
  reason: Exclude<LlmFailureReason, "UNSAFE_REQUEST">;
  safeMessage: string;
  status: "FAILED";
}

export type LlmBoundaryResult = LlmFailureResult | LlmRefusalResult | LlmSafeIntentResult;

export interface LlmProvider {
  evaluate(input: LlmSafeRequestMetadata): Promise<LlmBoundaryResult>;
}

export interface LlmBoundaryFailure {
  code:
    | "LLM_ASSISTANCE_CONTRACT_INVALID"
    | "LLM_ATTEMPT_GATE_REQUIRED"
    | "LLM_INPUT_UNCONFIRMED"
    | "LLM_PROVIDER_FAILURE"
    | "LLM_REQUEST_FORBIDDEN"
    | "LLM_REQUEST_INVALID"
    | "LLM_RESULT_SCHEMA_INVALID";
  details: Record<string, unknown>;
  message: string;
}
