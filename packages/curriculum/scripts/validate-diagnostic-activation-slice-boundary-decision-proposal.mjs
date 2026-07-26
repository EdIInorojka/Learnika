import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  changedPaths as slice12ChangedPaths,
  readDiagnosticCiValidationActivationGateDecisionProposal,
  readDiagnosticCiValidationActivationGateDecisionProposalUpstreamArtifacts,
  validateDiagnosticCiValidationActivationGateDecisionProposal,
} from "./validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs";

const expectedArtifactVersion = "wave-6.slice-13.grade-7-9-math.v1";
const expectedProposalVersion = "wave-6.slice-13.diagnostic-activation-slice-boundary.proposal.v1";
const expectedSlice12ArtifactVersion = "wave-6.slice-12.grade-7-9-math.v1";
const expectedSlice12ProposalVersion =
  "wave-6.slice-12.diagnostic-ci-validation-activation-gate.proposal.v1";
const expectedDecisionIds = [
  "entry_criteria_snapshot",
  "minimal_capability_boundary",
  "exact_file_boundary",
  "prerequisite_satisfaction_handoff",
  "independent_activation_authority",
  "explicit_workflow_transition",
  "readiness_and_blocker_separation",
  "learner_surface_separation",
  "ci_release_evidence_handoff",
  "rollback_suspension_recovery_preconditions",
];
const expectedCapabilityPlaceholderIds = [
  "ENTRY_SNAPSHOT_PLACEHOLDER",
  "MINIMAL_CAPABILITY_SET_PLACEHOLDER",
  "EXACT_FILE_ALLOWLIST_PLACEHOLDER",
  "PREREQUISITE_HANDOFF_PLACEHOLDER",
  "INDEPENDENT_ACTIVATION_AUTHORITY_PLACEHOLDER",
  "EXPLICIT_WORKFLOW_TRANSITION_PLACEHOLDER",
  "READINESS_SEPARATION_GUARD_PLACEHOLDER",
  "LEARNER_SURFACE_EXCLUSION_GUARD_PLACEHOLDER",
  "CI_RELEASE_EVIDENCE_HANDOFF_PLACEHOLDER",
  "ROLLBACK_RECOVERY_PRECONDITION_PLACEHOLDER",
];
const operationalArrayKeys = [
  "activationEventRecords",
  "prerequisiteSatisfactionRecords",
  "readinessTransitionRecords",
  "workflowTransitionRecords",
  "learnerDiagnosticRecords",
  "reviewerAssignmentRecords",
  "evidenceRecords",
  "approvalRecords",
  "identityRecords",
  "digestRecords",
  "rollbackRecords",
  "ciGateExecutionRecords",
];
const forbiddenTerms = [
  "finalanswer",
  "correctanswer",
  "workedsolution",
  "solution",
  "hint",
  "scoring",
  "mastery",
  "proficiency",
  "providerpayload",
  "llmprompt",
  "llmcompletion",
  "textbookcontent",
  "copiedtext",
  "studentname",
  "childname",
  "email",
  "reviewerid",
  "auditid",
  "userid",
  "accountid",
  "candidateid",
  "storagekey",
  "contenthash",
  "rawmedia",
];
const forbiddenExactFields = new Set([
  "candidateid",
  "userid",
  "accountid",
  "reviewerid",
  "auditid",
  "email",
  "storagekey",
  "contenthash",
]);
const slice12PrimaryPaths = new Set([
  "docs/wave-6/diagnostic-ci-validation-activation-gate-decision-proposal.md",
  "docs/wave-6/slice-12-implementation-note.md",
  "packages/curriculum/diagnostic-ci-validation-activation-gate-decision-proposal/grade-7-9-math.ci-validation-activation-gate-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate-decision-proposal.test.mjs",
]);
const slice13PrimaryPaths = [
  "docs/wave-6/diagnostic-activation-slice-boundary-decision-proposal.md",
  "docs/wave-6/slice-13-implementation-note.md",
  "packages/curriculum/diagnostic-activation-slice-boundary-decision-proposal/grade-7-9-math.activation-slice-boundary-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-activation-slice-boundary-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-activation-slice-boundary-decision-proposal.test.mjs",
];
const changedPaths = [
  ...slice12ChangedPaths.filter((value) => !slice12PrimaryPaths.has(value)),
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate-decision-proposal.test.mjs",
  ...slice13PrimaryPaths,
];
const changedPathSet = new Set(changedPaths);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../../..");

export const defaultProposalPath = path.resolve(
  scriptDirectory,
  "../diagnostic-activation-slice-boundary-decision-proposal/grade-7-9-math.activation-slice-boundary-decision-proposal.v1.json",
);

export class DiagnosticActivationSliceBoundaryDecisionProposalValidationError extends Error {}

function fail(message) {
  throw new DiagnosticActivationSliceBoundaryDecisionProposalValidationError(message);
}

function exact(actual, expected, label) {
  if (!Object.is(actual, expected)) fail(`${label} must equal ${JSON.stringify(expected)}.`);
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object.`);
  }
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) {
    fail(`${label} must contain exactly the declared fields.`);
  }
}

function exactArray(actual, expected, label) {
  if (!Array.isArray(actual) || JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} must match the exact expected array.`);
  }
}

function emptyArray(value, label) {
  if (!Array.isArray(value) || value.length !== 0) fail(`${label} must remain empty.`);
}

function rejectForbidden(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectForbidden(item, `${fieldPath}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") {
    if (typeof value !== "string") return;
    if (value === "READY") fail(`${fieldPath} cannot contain READY.`);
    const lower = value.toLowerCase();
    if (forbiddenTerms.some((term) => lower.includes(term))) {
      fail(`${fieldPath} contains forbidden/private/content material.`);
    }
    if (/(?:https?|s3|minio|file):\/\//i.test(value)) fail(`${fieldPath} contains a URL.`);
    if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)) fail(`${fieldPath} contains contact data.`);
    if (
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i.test(value)
    ) {
      fail(`${fieldPath} contains an identity value.`);
    }
    if (/\b[0-9a-f]{32,}\b/i.test(value)) fail(`${fieldPath} contains an immutable value.`);
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    const lower = key.toLowerCase();
    if (forbiddenExactFields.has(lower) || forbiddenTerms.includes(lower)) {
      fail(`${fieldPath}.${key} is forbidden.`);
    }
    rejectForbidden(nested, `${fieldPath}.${key}`);
  }
}

function validateMetadata(metadata) {
  exactKeys(
    metadata,
    [
      "schemaVersion",
      "proposalArtifactVersion",
      "proposalVersion",
      "status",
      "artifactKind",
      "subject",
      "locale",
      "audienceGrades",
      "sourceDecisionId",
      "sourceDecisionDocument",
      "activationPrerequisitesContract",
      "ciActivationGateContract",
      "closureGateDocument",
      "workflowSourcePath",
      "workflowFileChangeAllowed",
      "productionUseAllowed",
      "runtimeUseAllowed",
      "storageAllowed",
    ],
    "metadata",
  );
  exact(
    metadata.schemaVersion,
    "learnika.diagnosticActivationSliceBoundaryDecisionProposal.v1",
    "metadata.schemaVersion",
  );
  exact(
    metadata.proposalArtifactVersion,
    expectedArtifactVersion,
    "metadata.proposalArtifactVersion",
  );
  exact(metadata.proposalVersion, expectedProposalVersion, "metadata.proposalVersion");
  exact(metadata.status, "PROPOSED_DEFERRED", "metadata.status");
  exact(
    metadata.artifactKind,
    "diagnostic_activation_slice_boundary_decision_proposal",
    "metadata.artifactKind",
  );
  exact(metadata.subject, "math", "metadata.subject");
  exact(metadata.locale, "ru-RU", "metadata.locale");
  exactArray(metadata.audienceGrades, [7, 8, 9], "metadata.audienceGrades");
  exact(metadata.sourceDecisionId, "W5-OD-ACTIVATION-SLICE", "metadata.sourceDecisionId");
  exact(
    metadata.sourceDecisionDocument,
    "docs/wave-5/open-decisions.md",
    "metadata.sourceDecisionDocument",
  );
  exact(
    metadata.activationPrerequisitesContract,
    "docs/wave-5/diagnostic-review-activation-prerequisites-contract.md",
    "metadata.activationPrerequisitesContract",
  );
  exact(
    metadata.ciActivationGateContract,
    "docs/wave-5/diagnostic-ci-validation-activation-gate-contract.md",
    "metadata.ciActivationGateContract",
  );
  exact(
    metadata.closureGateDocument,
    "docs/wave-5/closure-gate.md",
    "metadata.closureGateDocument",
  );
  exact(metadata.workflowSourcePath, ".github/workflows/ci.yml", "metadata.workflowSourcePath");
  for (const key of [
    "workflowFileChangeAllowed",
    "productionUseAllowed",
    "runtimeUseAllowed",
    "storageAllowed",
  ]) {
    exact(metadata[key], false, `metadata.${key}`);
  }
}

function validateUpstreamReferences(references, upstream) {
  exactKeys(
    references,
    ["activationPrerequisites", "ciActivationGatePlaceholder", "slice12CiActivationGateProposal"],
    "upstreamReferences",
  );
  exactKeys(
    references.activationPrerequisites,
    [
      "artifactVersion",
      "totalPrerequisiteCount",
      "unsatisfiedPrerequisiteCount",
      "satisfiedPrerequisiteCount",
      "activationStatus",
      "workflowStatus",
    ],
    "upstreamReferences.activationPrerequisites",
  );
  exactArray(
    Object.values(references.activationPrerequisites),
    ["wave-5.slice-2.grade-7-9-math.v1", 12, 12, 0, "BLOCKED", "INACTIVE"],
    "upstreamReferences.activationPrerequisites",
  );
  exactKeys(
    references.ciActivationGatePlaceholder,
    ["artifactVersion", "gateVersion", "gateState", "prerequisiteStatus"],
    "upstreamReferences.ciActivationGatePlaceholder",
  );
  exactArray(
    Object.values(references.ciActivationGatePlaceholder),
    [
      "wave-5.slice-14.grade-7-9-math.v1",
      "wave-5.slice-14.diagnostic-ci-and-deterministic-validation-activation-gate.placeholder.v1",
      "UNRESOLVED_DEFERRED",
      "UNSATISFIED_DEFERRED",
    ],
    "upstreamReferences.ciActivationGatePlaceholder",
  );
  exactKeys(
    references.slice12CiActivationGateProposal,
    [
      "artifactVersion",
      "proposalVersion",
      "proposalStatus",
      "prerequisiteStatus",
      "activationStatus",
      "workflowStatus",
    ],
    "upstreamReferences.slice12CiActivationGateProposal",
  );
  exactArray(
    Object.values(references.slice12CiActivationGateProposal),
    [
      expectedSlice12ArtifactVersion,
      expectedSlice12ProposalVersion,
      "PROPOSED_DEFERRED",
      "UNSATISFIED_DEFERRED",
      "BLOCKED",
      "INACTIVE",
    ],
    "upstreamReferences.slice12CiActivationGateProposal",
  );
  exact(
    upstream.slice12Summary.proposalArtifactVersion,
    expectedSlice12ArtifactVersion,
    "Slice 12 artifact version",
  );
  exact(
    upstream.slice12Summary.proposalVersion,
    expectedSlice12ProposalVersion,
    "Slice 12 proposal version",
  );
  exact(
    upstream.slice12Summary.prerequisiteStatus,
    "UNSATISFIED_DEFERRED",
    "Slice 12 prerequisite",
  );
  exact(upstream.slice12Summary.activationStatus, "BLOCKED", "Slice 12 activation");
  exact(upstream.slice12Summary.workflowStatus, "INACTIVE", "Slice 12 workflow");
  exact(upstream.slice12Summary.readiness, "NOT_READY", "Slice 12 readiness");
  exact(upstream.slice12Summary.satisfiedPrerequisiteCount, 0, "Slice 12 satisfied count");
}

function validateBaseline(baseline) {
  exactKeys(
    baseline,
    [
      "readiness",
      "activation",
      "prerequisiteCounts",
      "blockerCounts",
      "approvedCandidateCount",
      "productionApprovalCount",
    ],
    "baseline",
  );
  exactKeys(
    baseline.readiness,
    ["policyVersion", "status", "blockingReasons"],
    "baseline.readiness",
  );
  exact(
    baseline.readiness.policyVersion,
    "wave-3-slice-11-diagnostic-readiness-policy-v1",
    "baseline.readiness.policyVersion",
  );
  exact(baseline.readiness.status, "NOT_READY", "baseline.readiness.status");
  exactArray(
    baseline.readiness.blockingReasons,
    ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
    "baseline.readiness.blockingReasons",
  );
  exactKeys(baseline.activation, ["status", "workflowStatus"], "baseline.activation");
  exactArray(Object.values(baseline.activation), ["BLOCKED", "INACTIVE"], "baseline.activation");
  exactKeys(
    baseline.prerequisiteCounts,
    ["total", "unsatisfied", "satisfied"],
    "baseline.prerequisiteCounts",
  );
  exactArray(Object.values(baseline.prerequisiteCounts), [12, 12, 0], "prerequisite counts");
  exactKeys(baseline.blockerCounts, ["total", "open", "closed"], "baseline.blockerCounts");
  exactArray(Object.values(baseline.blockerCounts), [2, 2, 0], "blocker counts");
  exact(baseline.approvedCandidateCount, 0, "baseline.approvedCandidateCount");
  exact(baseline.productionApprovalCount, 0, "baseline.productionApprovalCount");
}

function validateFutureBoundary(boundary) {
  exactKeys(
    boundary,
    [
      "state",
      "capabilityPlaceholderIds",
      "approvedCapabilityReferences",
      "approvedPathReferences",
      "activeRuleReferences",
      "boundaryDecisionRecorded",
      "implementationAllowed",
      "gateEvaluationAllowed",
    ],
    "futureBoundaryPlaceholder",
  );
  exact(boundary.state, "UNRESOLVED_DEFERRED", "futureBoundaryPlaceholder.state");
  exactArray(
    boundary.capabilityPlaceholderIds,
    expectedCapabilityPlaceholderIds,
    "futureBoundaryPlaceholder.capabilityPlaceholderIds",
  );
  for (const key of [
    "approvedCapabilityReferences",
    "approvedPathReferences",
    "activeRuleReferences",
  ]) {
    emptyArray(boundary[key], `futureBoundaryPlaceholder.${key}`);
  }
  for (const key of [
    "boundaryDecisionRecorded",
    "implementationAllowed",
    "gateEvaluationAllowed",
  ]) {
    exact(boundary[key], false, `futureBoundaryPlaceholder.${key}`);
  }
}

function validateDecisions(requirements) {
  if (!Array.isArray(requirements)) fail("decisionRequirements must be an array.");
  exactArray(
    requirements.map((entry) => entry.decisionId),
    expectedDecisionIds,
    "decisionRequirements decision IDs",
  );
  for (const [index, requirement] of requirements.entries()) {
    exactKeys(
      requirement,
      [
        "decisionId",
        "state",
        "decisionReference",
        "policyReference",
        "activeRuleReferences",
        "decisionRecorded",
      ],
      `decisionRequirements[${index}]`,
    );
    exact(requirement.state, "UNRESOLVED_DEFERRED", `decisionRequirements[${index}].state`);
    exact(requirement.decisionReference, null, `decisionRequirements[${index}].decisionReference`);
    exact(requirement.policyReference, null, `decisionRequirements[${index}].policyReference`);
    emptyArray(
      requirement.activeRuleReferences,
      `decisionRequirements[${index}].activeRuleReferences`,
    );
    exact(requirement.decisionRecorded, false, `decisionRequirements[${index}].decisionRecorded`);
  }
}

function validateBoundaries(artifact) {
  exactKeys(
    artifact.activationBoundary,
    [
      "status",
      "workflowStatus",
      "prerequisiteSatisfactionAllowed",
      "activationEvaluationAllowed",
      "activationDecisionAllowed",
      "workflowTransitionAllowed",
      "readinessEvaluationAllowed",
      "readinessTransitionAllowed",
      "blockerClosureAllowed",
      "learnerDiagnosticAllowed",
      "runtimeChangeAllowed",
      "publicInterfaceChangeAllowed",
      "persistenceChangeAllowed",
      "featureFlagChangeAllowed",
      "productionApprovalAllowed",
      "rollbackExecutionAllowed",
      "ciGateExecutionAllowed",
    ],
    "activationBoundary",
  );
  exact(artifact.activationBoundary.status, "BLOCKED", "activationBoundary.status");
  exact(
    artifact.activationBoundary.workflowStatus,
    "INACTIVE",
    "activationBoundary.workflowStatus",
  );
  for (const [key, value] of Object.entries(artifact.activationBoundary)) {
    if (key !== "status" && key !== "workflowStatus") {
      exact(value, false, `activationBoundary.${key}`);
    }
  }
  exactKeys(
    artifact.recordBoundary,
    operationalArrayKeys.map((key) => `${key}Allowed`),
    "recordBoundary",
  );
  for (const [key, value] of Object.entries(artifact.recordBoundary)) {
    exact(value, false, `recordBoundary.${key}`);
  }
  exactKeys(artifact.operationalRecords, operationalArrayKeys, "operationalRecords");
  for (const key of operationalArrayKeys) {
    emptyArray(artifact.operationalRecords[key], `operationalRecords.${key}`);
  }
}

function validateAggregate(aggregate) {
  const expected = {
    capabilityPlaceholderCount: 10,
    decisionRequirementCount: 10,
    unresolvedDecisionCount: 10,
    prerequisiteCount: 12,
    unsatisfiedPrerequisiteCount: 12,
    satisfiedPrerequisiteCount: 0,
    openBlockingReasonCount: 2,
    closedBlockingReasonCount: 0,
    activationEventCount: 0,
    prerequisiteSatisfactionRecordCount: 0,
    readinessTransitionCount: 0,
    workflowTransitionCount: 0,
    learnerDiagnosticRecordCount: 0,
    reviewerAssignmentCount: 0,
    evidenceRecordCount: 0,
    approvalRecordCount: 0,
    identityRecordCount: 0,
    digestRecordCount: 0,
    rollbackRecordCount: 0,
    ciGateExecutionCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
  };
  exactKeys(aggregate, Object.keys(expected), "aggregate");
  for (const [key, value] of Object.entries(expected)) {
    exact(aggregate[key], value, `aggregate.${key}`);
  }
}

export function validateDiagnosticActivationSliceBoundaryDecisionProposal(artifact, upstream) {
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) {
    fail("artifact must be an object.");
  }
  exactKeys(
    artifact,
    [
      "metadata",
      "upstreamReferences",
      "baseline",
      "futureBoundaryPlaceholder",
      "decisionRequirements",
      "activationBoundary",
      "recordBoundary",
      "operationalRecords",
      "aggregate",
    ],
    "artifact",
  );
  rejectForbidden(artifact);
  validateMetadata(artifact.metadata);
  validateUpstreamReferences(artifact.upstreamReferences, upstream);
  validateBaseline(artifact.baseline);
  validateFutureBoundary(artifact.futureBoundaryPlaceholder);
  validateDecisions(artifact.decisionRequirements);
  validateBoundaries(artifact);
  validateAggregate(artifact.aggregate);
  return {
    proposalArtifactVersion: artifact.metadata.proposalArtifactVersion,
    proposalVersion: artifact.metadata.proposalVersion,
    proposalStatus: artifact.metadata.status,
    decisionRequirementCount: artifact.aggregate.decisionRequirementCount,
    capabilityPlaceholderCount: artifact.aggregate.capabilityPlaceholderCount,
    readiness: artifact.baseline.readiness.status,
    activationStatus: artifact.baseline.activation.status,
    workflowStatus: artifact.baseline.activation.workflowStatus,
    satisfiedPrerequisiteCount: artifact.aggregate.satisfiedPrerequisiteCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
  };
}

export async function readDiagnosticActivationSliceBoundaryDecisionProposal(
  artifactPath = defaultProposalPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export async function readDiagnosticActivationSliceBoundaryDecisionProposalUpstreamArtifacts() {
  const [slice12Artifact, slice12Upstream] = await Promise.all([
    readDiagnosticCiValidationActivationGateDecisionProposal(),
    readDiagnosticCiValidationActivationGateDecisionProposalUpstreamArtifacts(),
  ]);
  const slice12Summary = validateDiagnosticCiValidationActivationGateDecisionProposal(
    slice12Artifact,
    slice12Upstream,
  );
  return { slice12Summary };
}

function localPaths(cwd) {
  const result = spawnSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0) fail(`Unable to inspect git status: ${result.stderr || result.stdout}`);
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => line.slice(3).trim().split(" -> "))
    .map((value) => value.replaceAll("\\", "/"));
}

export function validateDiagnosticActivationSliceBoundaryDecisionProposalChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length) {
    fail("Changed paths must not contain duplicates.");
  }
  const unexpected = normalized.filter((value) => !changedPathSet.has(value));
  if (unexpected.length > 0) {
    fail(`Wave 6 Slice 13 out-of-scope path changed: ${unexpected[0]}.`);
  }
  if (normalized.length !== changedPaths.length) {
    fail(`Wave 6 Slice 13 requires exactly ${changedPaths.length} changed paths.`);
  }
  return normalized;
}

export function validateDiagnosticActivationSliceBoundaryDecisionProposalWorktreeScope(
  paths,
  { ci = false } = {},
) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  if (!ci && paths.length === 0) return [];
  return validateDiagnosticActivationSliceBoundaryDecisionProposalChangedPaths(paths);
}

export { changedPaths };

export async function main() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticActivationSliceBoundaryDecisionProposal(),
    readDiagnosticActivationSliceBoundaryDecisionProposalUpstreamArtifacts(),
  ]);
  const summary = validateDiagnosticActivationSliceBoundaryDecisionProposal(artifact, upstream);
  if (process.argv.includes("--check-worktree-scope")) {
    validateDiagnosticActivationSliceBoundaryDecisionProposalWorktreeScope(
      localPaths(repositoryRoot),
    );
  }
  console.log(
    `[curriculum] Activation-slice boundary decision proposal validated: ${summary.capabilityPlaceholderCount} capability placeholders, ${summary.decisionRequirementCount} unresolved requirements, ${summary.satisfiedPrerequisiteCount} satisfied prerequisites, ${summary.productionApprovalCount} production approvals; proposal ${summary.proposalStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
  );
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    console.error(`[curriculum] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
