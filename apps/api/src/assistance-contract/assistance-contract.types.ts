import type { AttemptGateResult } from "../homework-state/homework-state.types";

export const assistanceContractPolicyVersion = "wave-2-slice-5-safe-assistance-contract-v1";

export const assistanceLevels = [
  "REFUSAL_ONLY",
  "LEVEL_1_RESTATE_OR_FOCUS",
  "LEVEL_2_CONCEPT_REMINDER",
  "LEVEL_3_NEXT_STEP_QUESTION",
  "LEVEL_4_SIMILAR_EXAMPLE",
  "LEVEL_5_SCAFFOLD",
  "LEVEL_6_PREREQUISITE_OR_ESCALATION",
] as const;

export type AssistanceLevel = (typeof assistanceLevels)[number];

export const allowedAssistanceCategories = [
  "PROBLEM_RESTATEMENT",
  "CONCEPT_REMINDER",
  "NEXT_STEP_QUESTION",
  "WORKED_SIMILAR_EXAMPLE_DIFFERENT_DATA",
  "CHECK_YOUR_WORK_PROMPT",
  "STRATEGY_SUGGESTION",
  "PREREQUISITE_REVIEW",
  "SAFE_REFUSAL_FALLBACK",
] as const;

export type AssistanceCategory = (typeof allowedAssistanceCategories)[number];

export const forbiddenContentCategories = [
  "DIRECT_FINAL_RESULT",
  "COMPLETE_SOURCE_WORK",
  "EXACT_PROBLEM_STEP_SEQUENCE",
  "PERSISTED_GENERATED_HELP_TEXT",
  "MODEL_REQUEST_OR_RESPONSE_PAYLOAD",
  "RECOGNITION_OR_TRANSCRIPTION_PAYLOAD",
  "COPIED_PROTECTED_TEXTBOOK_CONTENT",
  "CORRECTNESS_OR_SCORING_RESULT",
] as const;

export type ForbiddenContentCategory = (typeof forbiddenContentCategories)[number];

export interface AssistanceContractConstraints {
  noFinalAnswer: true;
  noFullSolution: true;
  noGeneratedTextPersistence: true;
  noProviderPayload: true;
  noRawMedia: true;
  similarExampleMustUseDifferentData?: true;
}

export interface AssistanceContract {
  category: AssistanceCategory;
  constraints: AssistanceContractConstraints;
  contractKind: "ASSISTANCE_CONTRACT";
  level: AssistanceLevel;
  policyVersion: typeof assistanceContractPolicyVersion;
  requiresMeaningfulAttempt: true;
}

export interface AssistanceEligibilityInput {
  attemptGate: AttemptGateResult;
}

export interface AssistanceEligibilityResult {
  eligible: boolean;
  policyVersion: typeof assistanceContractPolicyVersion;
  reason:
    | "ATTEMPT_GATE_SATISFIED"
    | "ATTEMPT_REQUIRED"
    | "ATTEMPT_STATE_NOT_READY"
    | "MEANINGFUL_ATTEMPT_REQUIRED";
}

export interface SafeAssistanceFallback {
  category: "SAFE_REFUSAL_FALLBACK";
  contractKind: "ASSISTANCE_FALLBACK";
  eligible: false;
  policyVersion: typeof assistanceContractPolicyVersion;
  reason:
    | "ATTEMPT_REQUIRED"
    | "ATTEMPT_STATE_NOT_READY"
    | "MEANINGFUL_ATTEMPT_REQUIRED"
    | "POLICY_BOUNDARY";
}

export interface AssistanceContractFailure {
  code:
    | "ASSISTANCE_ATTEMPT_GATE_REQUIRED"
    | "ASSISTANCE_CONTRACT_INVALID"
    | "ASSISTANCE_CONTRACT_UNSAFE_CATEGORY"
    | "ASSISTANCE_CONTRACT_UNSAFE_FIELD";
  details: Record<string, unknown>;
  message: string;
}
