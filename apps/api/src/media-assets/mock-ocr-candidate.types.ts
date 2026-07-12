export type MockOcrCandidateConfidence = "HIGH" | "LOW" | "MEDIUM" | "UNKNOWN";

export interface MockOcrCandidateText {
  candidateId: string;
  confidence: MockOcrCandidateConfidence;
  source: "MOCK_FIXTURE";
  text: string;
  trust: "UNTRUSTED_OCR_CANDIDATE";
}

export interface MockOcrCandidateSummary {
  boundaryPolicyVersion: string;
  candidates?: readonly MockOcrCandidateText[];
  confidence: MockOcrCandidateConfidence;
  downstreamUseAllowed: false;
  learnerConfirmationRequired: true;
  mediaAssetId: string;
  metadataOnly: true;
  modelVersion: string;
  objectExistence: "UNKNOWN_NOT_VERIFIED";
  orchestrationPolicyVersion: string;
  reason?: "BOUNDARY_REJECTED" | "LOW_CONFIDENCE" | "PROVIDER_FAILURE";
  schemaVersion: string;
  status: "CANDIDATE_REQUIRES_CONFIRMATION" | "FAILED" | "NEEDS_REVIEW";
}

export interface MockOcrCandidateResponse {
  data: {
    candidate: MockOcrCandidateSummary;
  };
}
