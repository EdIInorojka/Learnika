import { Injectable } from "@nestjs/common";

import {
  type DiagnosticSessionLinkedReferences,
  type DiagnosticSessionReferenceDisposition,
  type DiagnosticSessionState,
  type DiagnosticSessionTransitionDenied,
  type DiagnosticSessionTransitionDenialReason,
  type DiagnosticSessionTransitionInput,
  type DiagnosticSessionTransitionResult,
  diagnosticSessionStatePolicyVersion,
  diagnosticSessionStates,
} from "./diagnostic-session-state.types";

export const diagnosticSessionTransitions = [
  ["drafted", "ready"],
  ["drafted", "invalidated"],
  ["ready", "active"],
  ["ready", "abandoned"],
  ["ready", "invalidated"],
  ["active", "paused"],
  ["active", "closed"],
  ["active", "abandoned"],
  ["active", "invalidated"],
  ["paused", "active"],
  ["paused", "closed"],
  ["paused", "abandoned"],
  ["paused", "invalidated"],
  ["closed", "invalidated"],
] as const satisfies readonly (readonly [DiagnosticSessionState, DiagnosticSessionState])[];

const terminalStates = new Set<DiagnosticSessionState>(["abandoned", "invalidated"]);
const allowedTransitions = Object.fromEntries(
  diagnosticSessionStates.map((state) => [state, new Set<DiagnosticSessionState>()]),
) as Record<DiagnosticSessionState, Set<DiagnosticSessionState>>;

for (const [fromState, toState] of diagnosticSessionTransitions) {
  allowedTransitions[fromState].add(toState);
}

const referencePatterns: Record<keyof DiagnosticSessionLinkedReferences, RegExp> = {
  blueprintSlotIds:
    /^diag\.math\.g7-9\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.v[1-9][0-9]*$/,
  diagnosticItemIds:
    /^ditem\.math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.fixture-[0-9]{2}\.v[1-9][0-9]*$/,
  evidenceIds:
    /^devidence\.math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.fixture-[0-9]{2}\.v[1-9][0-9]*$/,
  responseIds:
    /^dresponse\.math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.fixture-[0-9]{2}\.v[1-9][0-9]*$/,
};
const referenceFields = Object.keys(
  referencePatterns,
) as (keyof DiagnosticSessionLinkedReferences)[];
const sensitiveDiagnosticFieldPattern =
  /answer|authorization|child|completion|content|cookie|correct|email|family|filename|hint|learner|llm|mastery|ocr|password|prompt|provider|proficiency|raw|score|secret|sessionid|solution|stt|student|token|transcript|user/i;
const sensitiveDiagnosticTextPattern =
  /answer|bearer\s+[a-z0-9._~+/=-]+|completion|correct\s+answer|email|final\s+answer|full\s+solution|hint|llm|mastery|ocr|password|prompt|provider|proficiency|raw\s+media|score|secret|solution|stt|transcript|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

function emptyLinkedReferences(): DiagnosticSessionLinkedReferences {
  return {
    blueprintSlotIds: [],
    diagnosticItemIds: [],
    evidenceIds: [],
    responseIds: [],
  };
}

function normalizeLinkedReferences(
  value: DiagnosticSessionLinkedReferences | undefined,
): DiagnosticSessionLinkedReferences | null {
  if (value === undefined) {
    return emptyLinkedReferences();
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const normalized: Record<keyof DiagnosticSessionLinkedReferences, string[]> = {
    blueprintSlotIds: [],
    diagnosticItemIds: [],
    evidenceIds: [],
    responseIds: [],
  };

  for (const field of referenceFields) {
    const references = value[field];
    if (!Array.isArray(references)) {
      return null;
    }

    const seen = new Set<string>();
    for (const reference of references) {
      if (
        typeof reference !== "string" ||
        !referencePatterns[field].test(reference) ||
        seen.has(reference)
      ) {
        return null;
      }
      seen.add(reference);
      normalized[field].push(reference);
    }
  }

  return normalized;
}

function referenceDisposition(
  toState: DiagnosticSessionState,
  references: DiagnosticSessionLinkedReferences,
): DiagnosticSessionReferenceDisposition {
  if (toState === "invalidated") {
    return "EXCLUDED";
  }

  if (toState === "abandoned") {
    const hasLinkedReferences = referenceFields.some((field) => references[field].length > 0);
    return hasLinkedReferences ? "STRUCTURAL_ONLY" : "NO_LINKED_REFERENCES";
  }

  if (toState === "closed") {
    return "STRUCTURAL_ONLY";
  }

  return "PENDING";
}

function isDiagnosticSessionState(value: unknown): value is DiagnosticSessionState {
  return (
    typeof value === "string" && (diagnosticSessionStates as readonly string[]).includes(value)
  );
}

function denial(
  fromState: DiagnosticSessionState | "unknown",
  toState: DiagnosticSessionState | "unknown",
  reason: DiagnosticSessionTransitionDenialReason,
): DiagnosticSessionTransitionDenied {
  return {
    accepted: false,
    fromState,
    metadataOnly: true,
    policyVersion: diagnosticSessionStatePolicyVersion,
    reason,
    toState,
  };
}

export function redactDiagnosticSessionStateDiagnostics(value: unknown): unknown {
  return redactDiagnosticSessionStateDiagnosticsInner(value, new WeakSet<object>());
}

function redactDiagnosticSessionStateDiagnosticsInner(
  value: unknown,
  seen: WeakSet<object>,
): unknown {
  if (typeof value === "string") {
    return sensitiveDiagnosticTextPattern.test(value) ? "[redacted]" : value;
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }
  if (seen.has(value)) {
    return "[circular]";
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactDiagnosticSessionStateDiagnosticsInner(item, seen));
  }

  const safeValue: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (sensitiveDiagnosticFieldPattern.test(key)) {
      safeValue.redactedField = "[redacted]";
      continue;
    }
    safeValue[key] = redactDiagnosticSessionStateDiagnosticsInner(item, seen);
  }
  return safeValue;
}

@Injectable()
export class DiagnosticSessionStateService {
  transition(
    input: DiagnosticSessionTransitionInput | null | undefined,
  ): DiagnosticSessionTransitionResult {
    if (typeof input !== "object" || input === null) {
      return denial("unknown", "unknown", "FROM_STATE_INVALID");
    }

    const fromState = isDiagnosticSessionState(input.fromState) ? input.fromState : "unknown";
    const toState = isDiagnosticSessionState(input.toState) ? input.toState : "unknown";

    if (fromState === "unknown") {
      return denial(fromState, toState, "FROM_STATE_INVALID");
    }
    if (toState === "unknown") {
      return denial(fromState, toState, "TO_STATE_INVALID");
    }
    if (terminalStates.has(fromState)) {
      return denial(fromState, toState, "TERMINAL_STATE");
    }
    if (!allowedTransitions[fromState].has(toState)) {
      return denial(fromState, toState, "TRANSITION_NOT_ALLOWED");
    }

    const linkedReferences = normalizeLinkedReferences(input.linkedReferences);
    if (!linkedReferences) {
      return denial(fromState, toState, "REFERENCE_METADATA_INVALID");
    }

    return {
      accepted: true,
      educationalInterpretation: "NONE",
      fromState,
      isTerminal: terminalStates.has(toState),
      linkedReferences,
      metadataOnly: true,
      policyVersion: diagnosticSessionStatePolicyVersion,
      reason: "TRANSITION_ALLOWED",
      referenceDisposition: referenceDisposition(toState, linkedReferences),
      toState,
    };
  }
}
