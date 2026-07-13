import type { MediaAssetView, MediaMimeType } from "./media-asset-contract";

export const mockOcrScenarios = ["candidate", "review", "failure"] as const;

export type MockOcrScenario = (typeof mockOcrScenarios)[number];
export type MockOcrConfidence = "HIGH" | "LOW" | "MEDIUM" | "UNKNOWN";

export interface MockOcrCandidateTextView {
  confidence: MockOcrConfidence;
  text: string;
  trust: "UNTRUSTED_OCR_CANDIDATE";
}

interface MockOcrResultBase {
  confidence: MockOcrConfidence;
  downstreamUseAllowed: false;
  learnerConfirmationRequired: true;
}

export type MockOcrCandidateResultView =
  | (MockOcrResultBase & {
      candidates: readonly MockOcrCandidateTextView[];
      status: "CANDIDATE_REQUIRES_CONFIRMATION";
    })
  | (MockOcrResultBase & {
      status: "FAILED";
    })
  | (MockOcrResultBase & {
      status: "NEEDS_REVIEW";
    });

export type MockOcrCandidateActionState =
  | { status: "IDLE" | "INVALID" | "NOT_READY" | "UNAVAILABLE" }
  | { result: MockOcrCandidateResultView; status: "RESULT" };

export const initialMockOcrCandidateActionState: MockOcrCandidateActionState = {
  status: "IDLE",
};

export class MockOcrCandidateContractError extends Error {
  constructor() {
    super("Mock OCR candidate did not match the expected contract.");
    this.name = "MockOcrCandidateContractError";
  }
}

const scenarioSet = new Set<string>(mockOcrScenarios);
const confidenceSet = new Set<string>(["HIGH", "LOW", "MEDIUM", "UNKNOWN"]);
const supportedMimeByKind: Record<MediaAssetView["assetKind"], ReadonlySet<MediaMimeType>> = {
  HOMEWORK_IMAGE: new Set(["image/jpeg", "image/png", "image/webp"]),
  HOMEWORK_PDF: new Set(["application/pdf"]),
  HOMEWORK_SCREENSHOT: new Set(["image/jpeg", "image/png", "image/webp"]),
};
const allowedFormFields = new Set(["scenario"]);
const summaryKeys = new Set([
  "boundaryPolicyVersion",
  "candidates",
  "confidence",
  "downstreamUseAllowed",
  "learnerConfirmationRequired",
  "mediaAssetId",
  "metadataOnly",
  "modelVersion",
  "objectExistence",
  "orchestrationPolicyVersion",
  "reason",
  "schemaVersion",
  "status",
]);
const candidateKeys = new Set(["candidateId", "confidence", "source", "text", "trust"]);

function invalid(): never {
  throw new MockOcrCandidateContractError();
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}

function assertOnlyKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) invalid();
  }
}

function boundedString(value: unknown, maxLength: number): string {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) invalid();
  return value;
}

function confidence(value: unknown): MockOcrConfidence {
  const parsed = boundedString(value, 16);
  if (!confidenceSet.has(parsed)) invalid();
  return parsed as MockOcrConfidence;
}

function assertCommonSummary(
  summary: Record<string, unknown>,
  expectedMediaAssetId: string,
): MockOcrResultBase {
  assertOnlyKeys(summary, summaryKeys);
  boundedString(summary.boundaryPolicyVersion, 120);
  boundedString(summary.modelVersion, 120);
  boundedString(summary.orchestrationPolicyVersion, 120);
  boundedString(summary.schemaVersion, 120);
  if (boundedString(summary.mediaAssetId, 120) !== expectedMediaAssetId) invalid();
  if (summary.metadataOnly !== true) invalid();
  if (summary.objectExistence !== "UNKNOWN_NOT_VERIFIED") invalid();
  if (summary.learnerConfirmationRequired !== true) invalid();
  if (summary.downstreamUseAllowed !== false) invalid();

  return {
    confidence: confidence(summary.confidence),
    downstreamUseAllowed: false,
    learnerConfirmationRequired: true,
  };
}

function parseCandidateText(value: unknown): MockOcrCandidateTextView {
  const candidate = record(value);
  assertOnlyKeys(candidate, candidateKeys);
  boundedString(candidate.candidateId, 120);
  if (candidate.source !== "MOCK_FIXTURE") invalid();
  if (candidate.trust !== "UNTRUSTED_OCR_CANDIDATE") invalid();

  return {
    confidence: confidence(candidate.confidence),
    text: boundedString(candidate.text, 4096),
    trust: "UNTRUSTED_OCR_CANDIDATE",
  };
}

export function parseMockOcrCandidateForm(formData: FormData): MockOcrScenario {
  for (const fieldName of formData.keys()) {
    if (!fieldName.startsWith("$ACTION_") && !allowedFormFields.has(fieldName)) invalid();
  }

  const values = formData.getAll("scenario");
  if (values.length !== 1 || typeof values[0] !== "string" || !scenarioSet.has(values[0])) {
    invalid();
  }
  return values[0] as MockOcrScenario;
}

export function parseMockOcrCandidateResponse(
  value: unknown,
  expectedMediaAssetId: string,
): MockOcrCandidateResultView {
  const response = record(value);
  assertOnlyKeys(response, new Set(["data"]));
  const data = record(response.data);
  assertOnlyKeys(data, new Set(["candidate"]));
  const summary = record(data.candidate);
  const common = assertCommonSummary(summary, expectedMediaAssetId);
  const status = boundedString(summary.status, 40);

  if (status === "CANDIDATE_REQUIRES_CONFIRMATION") {
    if (Object.hasOwn(summary, "reason") || !Array.isArray(summary.candidates)) invalid();
    if (summary.candidates.length === 0 || summary.candidates.length > 5) invalid();
    return {
      ...common,
      candidates: summary.candidates.map(parseCandidateText),
      status,
    };
  }

  if (Object.hasOwn(summary, "candidates")) invalid();
  if (status === "NEEDS_REVIEW" && summary.reason === "LOW_CONFIDENCE") {
    return { ...common, status };
  }
  if (
    status === "FAILED" &&
    (summary.reason === "BOUNDARY_REJECTED" || summary.reason === "PROVIDER_FAILURE")
  ) {
    return { ...common, status };
  }
  return invalid();
}

export function isMockOcrCandidateAvailable(
  mediaAsset: MediaAssetView,
  nowMilliseconds = Date.now(),
): boolean {
  const retentionUntil = Date.parse(mediaAsset.retentionUntil);
  return (
    mediaAsset.checksumPresent &&
    mediaAsset.retentionStatus === "TEMPORARY" &&
    Number.isFinite(retentionUntil) &&
    retentionUntil > nowMilliseconds &&
    mediaAsset.sizeBytes > 0 &&
    supportedMimeByKind[mediaAsset.assetKind].has(mediaAsset.mimeType)
  );
}
