export const diagnosticSessionStates = [
  "drafted",
  "ready",
  "active",
  "paused",
  "closed",
  "abandoned",
  "invalidated",
] as const;

export type DiagnosticSessionState = (typeof diagnosticSessionStates)[number];

export const diagnosticSessionStatePolicyVersion = "wave-3-slice-7-diagnostic-session-state-v1";

export interface DiagnosticSessionLinkedReferences {
  readonly blueprintSlotIds: readonly string[];
  readonly diagnosticItemIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly responseIds: readonly string[];
}

export interface DiagnosticSessionTransitionInput {
  readonly fromState: string;
  readonly linkedReferences?: DiagnosticSessionLinkedReferences;
  readonly toState: string;
}

export type DiagnosticSessionReferenceDisposition =
  "EXCLUDED" | "NO_LINKED_REFERENCES" | "PENDING" | "STRUCTURAL_ONLY";

export interface DiagnosticSessionTransitionAccepted {
  readonly accepted: true;
  readonly educationalInterpretation: "NONE";
  readonly fromState: DiagnosticSessionState;
  readonly isTerminal: boolean;
  readonly linkedReferences: DiagnosticSessionLinkedReferences;
  readonly metadataOnly: true;
  readonly policyVersion: typeof diagnosticSessionStatePolicyVersion;
  readonly reason: "TRANSITION_ALLOWED";
  readonly referenceDisposition: DiagnosticSessionReferenceDisposition;
  readonly toState: DiagnosticSessionState;
}

export type DiagnosticSessionTransitionDenialReason =
  | "FROM_STATE_INVALID"
  | "REFERENCE_METADATA_INVALID"
  | "TERMINAL_STATE"
  | "TO_STATE_INVALID"
  | "TRANSITION_NOT_ALLOWED";

export interface DiagnosticSessionTransitionDenied {
  readonly accepted: false;
  readonly fromState: DiagnosticSessionState | "unknown";
  readonly metadataOnly: true;
  readonly policyVersion: typeof diagnosticSessionStatePolicyVersion;
  readonly reason: DiagnosticSessionTransitionDenialReason;
  readonly toState: DiagnosticSessionState | "unknown";
}

export type DiagnosticSessionTransitionResult =
  DiagnosticSessionTransitionAccepted | DiagnosticSessionTransitionDenied;
