export const sttBoundaryPolicyVersion = "wave-2-slice-7-stt-boundary-v1";
export const sttBoundarySchemaVersion = "stt-candidate-boundary-v1";
export const localMockSttProviderName = "local-mock-stt";
export const localMockSttModelVersion = "local-mock-stt-v1";

export const sttSupportedMediaKinds = ["VOICE_AUDIO"] as const;

export type SttSupportedMediaKind = (typeof sttSupportedMediaKinds)[number];

export const sttSupportedMimeTypes = ["audio/webm", "audio/ogg", "audio/mp4"] as const;

export type SttSupportedMimeType = (typeof sttSupportedMimeTypes)[number];

export const sttMockFixtureIds = [
  "clear-russian-step",
  "low-confidence-audio",
  "prompt-injection-audio",
  "provider-failure",
] as const;

export type SttMockFixtureId = (typeof sttMockFixtureIds)[number];

export const sttRequestPurposes = [
  "HOMEWORK_QUESTION",
  "LEARNING_PROMPT",
  "SOLUTION_STEP",
] as const;

export type SttRequestPurpose = (typeof sttRequestPurposes)[number];

export type SttConfidenceBand = "HIGH" | "LOW" | "MEDIUM" | "UNKNOWN";

export type SttFailureReason =
  "INVALID_REQUEST" | "LOW_CONFIDENCE" | "PROVIDER_FAILURE" | "UNSUPPORTED_MEDIA";

export interface SttAudioMetadataRequest {
  assetKind: SttSupportedMediaKind;
  audioAssetId: string;
  checksumSha256?: string;
  childProfileId: string;
  durationMs: number;
  familyId: string;
  locale: "ru-RU";
  mimeType: SttSupportedMimeType;
  mockFixtureId: SttMockFixtureId;
  purpose: SttRequestPurpose;
  sizeBytes: number;
  storageKey: string;
  voiceSessionId: string;
}

export interface SttUncertainFragment {
  endOffset: number;
  startOffset: number;
}

export interface SttTranscriptCandidate {
  candidateId: string;
  confidence: SttConfidenceBand;
  requiresEditableReview: true;
  requiresLearnerConfirmation: true;
  source: "MOCK_FIXTURE";
  text: string;
  trust: "UNTRUSTED_TRANSCRIPT_CANDIDATE";
  uncertainFragments: readonly SttUncertainFragment[];
}

export interface SttBoundaryBaseResult {
  modelVersion: typeof localMockSttModelVersion;
  policyVersion: typeof sttBoundaryPolicyVersion;
  providerName: typeof localMockSttProviderName;
  schemaVersion: typeof sttBoundarySchemaVersion;
}

export interface SttCandidateResult extends SttBoundaryBaseResult {
  audioAssetId: string;
  candidates: readonly SttTranscriptCandidate[];
  confidence: "HIGH" | "MEDIUM";
  requiresEditableReview: true;
  requiresLearnerConfirmation: true;
  status: "CANDIDATE_REQUIRES_CONFIRMATION";
  voiceSessionId: string;
}

export interface SttNeedsReviewResult extends SttBoundaryBaseResult {
  audioAssetId: string;
  confidence: "LOW";
  reason: "LOW_CONFIDENCE";
  requiresEditableReview: true;
  requiresLearnerConfirmation: true;
  status: "NEEDS_REVIEW";
  voiceSessionId: string;
}

export interface SttFailureResult extends SttBoundaryBaseResult {
  audioAssetId?: string;
  confidence: "UNKNOWN";
  reason: Exclude<SttFailureReason, "LOW_CONFIDENCE">;
  safeMessage: string;
  status: "FAILED";
  voiceSessionId?: string;
}

export type SttRecognitionResult = SttCandidateResult | SttFailureResult | SttNeedsReviewResult;

export interface SttProvider {
  transcribe(input: SttAudioMetadataRequest): Promise<SttRecognitionResult>;
}

export interface SttBoundaryFailure {
  code:
    | "STT_MEDIA_UNSUPPORTED"
    | "STT_PROVIDER_FAILURE"
    | "STT_REQUEST_INVALID"
    | "STT_RESULT_SCHEMA_INVALID";
  details: Record<string, unknown>;
  message: string;
}
