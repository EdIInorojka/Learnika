import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  wave6ClosureContinuationPaths,
  preWave7Slice1ChangedPaths,
  wave7PrepContinuationPaths,
  wave7PrepFoundationPaths,
} from "./validate-skill-graph.mjs";

const expectedArtifactVersion = "wave-6.slice-9.grade-7-9-math.v1";
const expectedProposalVersion = "wave-6.slice-9.diagnostic-coverage-gap-closure-plan.proposal.v1";
const expectedCoverageVersion = "wave-4.slice-2.grade-7-9-math.v1";
const expectedPlanVersion = "wave-5.slice-11.grade-7-9-math.v1";
const expectedActivationVersion = "wave-5.slice-2.grade-7-9-math.v1";
const expectedReadinessVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const decisionIds = [
  "baseline_slot_taxonomy",
  "rights_safe_authoring",
  "review_evidence_requirements",
  "approval_waiver_boundary",
  "grade_strand_balance",
  "closure_gating",
  "draft_gap_sequencing",
  "production_approval_separation",
  "dependency_order",
  "audit_and_maintenance",
];
const forbiddenTerms = [
  "textbook",
  "answer",
  "solution",
  "hint",
  "scoring",
  "mastery",
  "proficiency",
  "provider",
  "email",
  "userId",
  "accountId",
  "reviewerId",
  "candidateId",
  "storageKey",
  "contentHash",
  "digestValue",
  "rawMedia",
  "apiRoute",
  "openapi",
  "prisma",
  "migration",
  "runtimeModule",
  "webPage",
];
const slice8ChangedPaths = [
  "docs/wave-6/diagnostic-production-approval-authority-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-8-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-production-approval-authority-policy-decision-proposal/grade-7-9-math.production-approval-authority-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-canonicalization-digest-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy-decision-proposal.test.mjs",
];
const slice9PrimaryPaths = [
  "docs/wave-6/diagnostic-coverage-gap-closure-plan-decision-proposal.md",
  "docs/wave-6/slice-9-implementation-note.md",
  "packages/curriculum/diagnostic-coverage-gap-closure-plan-decision-proposal/grade-7-9-math.coverage-gap-closure-plan-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-coverage-gap-closure-plan-decision-proposal.test.mjs",
];
const slice8PrimaryPaths = new Set([
  "docs/wave-6/diagnostic-production-approval-authority-policy-decision-proposal.md",
  "docs/wave-6/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-production-approval-authority-policy-decision-proposal/grade-7-9-math.production-approval-authority-policy-decision-proposal.v1.json",
]);
export const changedPaths = [
  ...slice8ChangedPaths.filter((value) => !slice8PrimaryPaths.has(value)),
  ...slice9PrimaryPaths,
];
const changedPathSet = new Set(changedPaths);
const slice9BaselinePrimaryPaths = new Set([
  "docs/wave-6/diagnostic-coverage-gap-closure-plan-decision-proposal.md",
  "docs/wave-6/slice-9-implementation-note.md",
  "packages/curriculum/diagnostic-coverage-gap-closure-plan-decision-proposal/grade-7-9-math.coverage-gap-closure-plan-decision-proposal.v1.json",
]);
const slice10ChangedPaths = changedPaths.filter(
  (changedPath) =>
    !slice9BaselinePrimaryPaths.has(changedPath) &&
    changedPath !==
      "packages/curriculum/test/diagnostic-production-approval-authority-policy-decision-proposal.test.mjs",
);
slice10ChangedPaths.push(
  "docs/wave-6/diagnostic-readiness-integration-plan-decision-proposal.md",
  "docs/wave-6/slice-10-implementation-note.md",
  "packages/curriculum/diagnostic-readiness-integration-plan-decision-proposal/grade-7-9-math.readiness-integration-plan-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan-decision-proposal.test.mjs",
);
const slice10ChangedPathSet = new Set(slice10ChangedPaths);
const slice11PrimaryPaths = [
  "docs/wave-6/diagnostic-rollback-withdrawal-policy-decision-proposal.md",
  "docs/wave-6/slice-11-implementation-note.md",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy-decision-proposal/grade-7-9-math.rollback-withdrawal-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy-decision-proposal.test.mjs",
];
const slice11BaselinePrimaryPaths = new Set([
  "docs/wave-6/diagnostic-readiness-integration-plan-decision-proposal.md",
  "docs/wave-6/slice-10-implementation-note.md",
  "packages/curriculum/diagnostic-readiness-integration-plan-decision-proposal/grade-7-9-math.readiness-integration-plan-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan-decision-proposal.test.mjs",
]);
const slice11ChangedPaths = [
  ...slice10ChangedPaths.filter((value) => !slice11BaselinePrimaryPaths.has(value)),
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan-decision-proposal.mjs",
  ...slice11PrimaryPaths,
];
const slice11ChangedPathSet = new Set(slice11ChangedPaths);
const slice12PrimaryPaths = [
  "docs/wave-6/diagnostic-ci-validation-activation-gate-decision-proposal.md",
  "docs/wave-6/slice-12-implementation-note.md",
  "packages/curriculum/diagnostic-ci-validation-activation-gate-decision-proposal/grade-7-9-math.ci-validation-activation-gate-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate-decision-proposal.test.mjs",
];
const slice12ChangedPaths = [
  ...slice11ChangedPaths.filter((value) => !new Set(slice11PrimaryPaths).has(value)),
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy-decision-proposal.mjs",
  ...slice12PrimaryPaths,
];
const slice12ChangedPathSet = new Set(slice12ChangedPaths);
const slice13PrimaryPaths = [
  "docs/wave-6/diagnostic-activation-slice-boundary-decision-proposal.md",
  "docs/wave-6/slice-13-implementation-note.md",
  "packages/curriculum/diagnostic-activation-slice-boundary-decision-proposal/grade-7-9-math.activation-slice-boundary-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-activation-slice-boundary-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-activation-slice-boundary-decision-proposal.test.mjs",
];
const slice13PrimaryPathSet = new Set(slice12PrimaryPaths);
const slice13ChangedPaths = [
  ...slice12ChangedPaths.filter((value) => !slice13PrimaryPathSet.has(value)),
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-ci-validation-activation-gate-decision-proposal.test.mjs",
  ...slice13PrimaryPaths,
];
const slice13ChangedPathSet = new Set(slice13ChangedPaths);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
export const defaultProposalPath = path.resolve(
  scriptDir,
  "../diagnostic-coverage-gap-closure-plan-decision-proposal/grade-7-9-math.coverage-gap-closure-plan-decision-proposal.v1.json",
);

export class DiagnosticCoverageGapClosurePlanDecisionProposalValidationError extends Error {}
function fail(message) {
  throw new DiagnosticCoverageGapClosurePlanDecisionProposalValidationError(message);
}
function exact(actual, expected, label) {
  if (actual !== expected) fail(`${label} must equal ${String(expected)}.`);
}
function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(`${label} must be an object.`);
}
function array(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array.`);
}
function deepValues(value, visit) {
  if (typeof value === "string") visit(value);
  else if (Array.isArray(value)) value.forEach((entry) => deepValues(entry, visit));
  else if (value && typeof value === "object")
    Object.entries(value).forEach(([key, entry]) => {
      visit(key);
      deepValues(entry, visit);
    });
}
function rejectForbidden(value) {
  deepValues(value, (text) => {
    const normalized = text.toLowerCase();
    if (forbiddenTerms.some((term) => normalized.includes(term.toLowerCase())))
      fail(`Forbidden/private/runtime/content term detected: ${text}.`);
    if (/https?:\/\//i.test(text) || /(?:^|[^a-z0-9])[0-9a-f]{32,}(?:$|[^a-z0-9])/i.test(text))
      fail("Private or immutable value detected.");
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text)) fail("Contact identity value detected.");
  });
}
export async function readDiagnosticCoverageGapClosurePlanDecisionProposal(
  artifactPath = defaultProposalPath,
) {
  return JSON.parse(await readFile(artifactPath, "utf8"));
}

export function validateDiagnosticCoverageGapClosurePlanDecisionProposal(artifact) {
  object(artifact, "artifact");
  rejectForbidden(artifact);
  exact(
    Object.keys(artifact).sort().join(","),
    [
      "aggregate",
      "approvalDispositionBoundary",
      "candidateRecords",
      "closureGatingRequirements",
      "coverageBaseline",
      "coverageClosureRecords",
      "coverageApprovalRecords",
      "coverageWaiverRecords",
      "currentBaseline",
      "evidenceRecords",
      "gradeStrandBalanceConstraints",
      "identityRecords",
      "metadata",
      "productionApprovalRecords",
      "recordBoundary",
      "reviewDecisionRecords",
      "reviewEvidenceRequirements",
      "rightsSafeAuthoringRequirements",
      "syntheticExamples",
      "unresolvedDecisions",
      "upstreamReferences",
    ]
      .sort()
      .join(","),
    "top-level schema",
  );
  exact(
    artifact.metadata.proposalArtifactVersion,
    expectedArtifactVersion,
    "metadata.proposalArtifactVersion",
  );
  exact(artifact.metadata.proposalVersion, expectedProposalVersion, "metadata.proposalVersion");
  exact(artifact.metadata.status, "PROPOSED_DEFERRED", "metadata.status");
  exact(
    artifact.metadata.reviewCoverageArtifactVersion,
    expectedCoverageVersion,
    "metadata.reviewCoverageArtifactVersion",
  );
  exact(
    artifact.metadata.coverageGapClosurePlaceholderArtifactVersion,
    expectedPlanVersion,
    "metadata.coverageGapClosurePlaceholderArtifactVersion",
  );
  exact(artifact.metadata.productionUseAllowed, false, "metadata.productionUseAllowed");
  exact(artifact.metadata.runtimeUseAllowed, false, "metadata.runtimeUseAllowed");
  exact(artifact.metadata.coverageClosureAllowed, false, "metadata.coverageClosureAllowed");
  exact(
    artifact.currentBaseline.readiness.policyVersion,
    expectedReadinessVersion,
    "readiness.policyVersion",
  );
  exact(artifact.currentBaseline.readiness.status, "NOT_READY", "readiness.status");
  exact(artifact.currentBaseline.activation.status, "BLOCKED", "activation.status");
  exact(
    artifact.currentBaseline.activation.workflowStatus,
    "INACTIVE",
    "activation.workflowStatus",
  );
  exact(
    artifact.currentBaseline.coverageGapClosurePrerequisite.prerequisiteId,
    "coverage_gap_closure_plan",
    "prerequisite.id",
  );
  exact(
    artifact.currentBaseline.coverageGapClosurePrerequisite.status,
    "UNSATISFIED_DEFERRED",
    "prerequisite.status",
  );
  exact(artifact.currentBaseline.satisfiedPrerequisiteCount, 0, "satisfiedPrerequisiteCount");
  const upstream = artifact.upstreamReferences;
  exact(
    upstream.activationPrerequisites.artifactVersion,
    expectedActivationVersion,
    "upstream.activation",
  );
  exact(
    upstream.coverageGapClosurePlaceholder.artifactVersion,
    expectedPlanVersion,
    "upstream.coveragePlan",
  );
  exact(
    upstream.separationOfDuties.artifactVersion,
    "wave-6.slice-4.grade-7-9-math.v1",
    "upstream.separation",
  );
  exact(
    upstream.conflictOfInterest.artifactVersion,
    "wave-6.slice-5.grade-7-9-math.v1",
    "upstream.conflict",
  );
  exact(
    upstream.auditIdentity.artifactVersion,
    "wave-6.slice-6.grade-7-9-math.v1",
    "upstream.audit",
  );
  exact(
    upstream.evidenceStorageRetention.artifactVersion,
    "wave-6.slice-7.grade-7-9-math.v1",
    "upstream.evidence",
  );
  exact(
    upstream.productionApprovalAuthority.artifactVersion,
    "wave-6.slice-8.grade-7-9-math.v1",
    "upstream.productionAuthority",
  );
  exact(
    upstream.coverageGapClosurePlaceholder.gapClosureAllowed,
    false,
    "upstream.coveragePlan.gapClosureAllowed",
  );
  exact(
    upstream.coverageGapClosurePlaceholder.productionCoverageAllowed,
    false,
    "upstream.coveragePlan.productionCoverageAllowed",
  );
  exact(
    upstream.separationOfDuties.enforcementAllowed,
    false,
    "upstream.separation.enforcementAllowed",
  );
  exact(
    upstream.conflictOfInterest.identityComparisonAllowed,
    false,
    "upstream.conflict.identityComparisonAllowed",
  );
  exact(
    upstream.auditIdentity.identityBindingAllowed,
    false,
    "upstream.audit.identityBindingAllowed",
  );
  exact(
    upstream.auditIdentity.auditEventRecordingAllowed,
    false,
    "upstream.audit.auditEventRecordingAllowed",
  );
  exact(
    upstream.evidenceStorageRetention.evidenceRecordCount,
    0,
    "upstream.evidence.evidenceRecordCount",
  );
  exact(
    upstream.evidenceStorageRetention.storageObjectCount,
    0,
    "upstream.evidence.storageObjectCount",
  );
  exact(
    upstream.evidenceStorageRetention.retentionScheduleCount,
    0,
    "upstream.evidence.retentionScheduleCount",
  );
  exact(
    upstream.productionApprovalAuthority.authorityGrantCount,
    0,
    "upstream.productionAuthority.authorityGrantCount",
  );
  exact(
    upstream.productionApprovalAuthority.approvalDecisionCount,
    0,
    "upstream.productionAuthority.approvalDecisionCount",
  );
  exact(
    upstream.productionApprovalAuthority.productionApprovalCount,
    0,
    "upstream.productionAuthority.productionApprovalCount",
  );
  exact(
    upstream.productionApprovalAuthority.productionApprovalAllowed,
    false,
    "upstream.productionAuthority.productionApprovalAllowed",
  );
  for (const [name, ref] of Object.entries(upstream)) {
    if (name === "activationPrerequisites") continue;
    exact(ref.prerequisiteStatus, "UNSATISFIED_DEFERRED", `upstream.${name}.prerequisiteStatus`);
  }
  exact(
    artifact.coverageBaseline.artifactVersion,
    expectedCoverageVersion,
    "coverageBaseline.artifactVersion",
  );
  exact(artifact.coverageBaseline.slotCount, 11, "coverageBaseline.slotCount");
  exact(artifact.coverageBaseline.statusCounts.DRAFT_ONLY, 5, "coverageBaseline.DRAFT_ONLY");
  exact(artifact.coverageBaseline.statusCounts.GAP_CONFIRMED, 6, "coverageBaseline.GAP_CONFIRMED");
  exact(
    artifact.coverageBaseline.statusCounts.PRODUCTION_APPROVED,
    0,
    "coverageBaseline.PRODUCTION_APPROVED",
  );
  array(artifact.coverageBaseline.slots, "coverageBaseline.slots");
  exact(artifact.coverageBaseline.slots.length, 11, "coverageBaseline.slots.length");
  const statuses = artifact.coverageBaseline.slots.map((slot) => slot.coverageStatus);
  exact(statuses.filter((status) => status === "DRAFT_ONLY").length, 5, "draft-only slot count");
  exact(
    statuses.filter((status) => status === "GAP_CONFIRMED").length,
    6,
    "gap-confirmed slot count",
  );
  if (new Set(artifact.coverageBaseline.slots.map((slot) => slot.blueprintSlotId)).size !== 11)
    fail("coverageBaseline slots must have unique blueprintSlotId values.");
  for (const key of [
    "rightsSafeAuthoringRequirements",
    "reviewEvidenceRequirements",
    "approvalDispositionBoundary",
    "gradeStrandBalanceConstraints",
    "closureGatingRequirements",
  ])
    exact(artifact[key].state, "UNRESOLVED_DEFERRED", `${key}.state`);
  exact(
    artifact.approvalDispositionBoundary.waiverAllowed,
    false,
    "approvalDispositionBoundary.waiverAllowed",
  );
  exact(
    artifact.approvalDispositionBoundary.silentWaiverAllowed,
    false,
    "approvalDispositionBoundary.silentWaiverAllowed",
  );
  exact(
    artifact.closureGatingRequirements.noSilentWaiver,
    true,
    "closureGatingRequirements.noSilentWaiver",
  );
  array(artifact.unresolvedDecisions, "unresolvedDecisions");
  exact(artifact.unresolvedDecisions.length, decisionIds.length, "unresolved decision count");
  exact(
    JSON.stringify(artifact.unresolvedDecisions.map((item) => item.decisionId)),
    JSON.stringify(decisionIds),
    "decision ids",
  );
  for (const item of artifact.unresolvedDecisions) {
    exact(item.state, "UNRESOLVED_DEFERRED", `${item.decisionId}.state`);
    exact(item.decisionRecordRef, null, `${item.decisionId}.decisionRecordRef`);
  }
  array(artifact.syntheticExamples, "syntheticExamples");
  exact(artifact.syntheticExamples.length, 5, "syntheticExampleCount");
  for (const records of [
    "coverageClosureRecords",
    "coverageApprovalRecords",
    "coverageWaiverRecords",
    "candidateRecords",
    "evidenceRecords",
    "reviewDecisionRecords",
    "productionApprovalRecords",
    "identityRecords",
  ]) {
    array(artifact[records], records);
    exact(artifact[records].length, 0, records);
  }
  for (const [key, value] of Object.entries(artifact.recordBoundary))
    exact(value, false, `recordBoundary.${key}`);
  for (const [key, value] of Object.entries(artifact.aggregate)) {
    if (
      key.endsWith("Count") &&
      ![
        "slotCount",
        "draftOnlySlotCount",
        "gapConfirmedSlotCount",
        "unresolvedDecisionCount",
        "syntheticExampleCount",
      ].includes(key)
    )
      exact(value, 0, `aggregate.${key}`);
  }
  exact(artifact.aggregate.slotCount, 11, "aggregate.slotCount");
  exact(artifact.aggregate.draftOnlySlotCount, 5, "aggregate.draftOnlySlotCount");
  exact(artifact.aggregate.gapConfirmedSlotCount, 6, "aggregate.gapConfirmedSlotCount");
  exact(artifact.aggregate.unresolvedDecisionCount, 10, "aggregate.unresolvedDecisionCount");
  return {
    proposalArtifactVersion: expectedArtifactVersion,
    proposalVersion: expectedProposalVersion,
    slotCount: 11,
    draftOnlySlotCount: 5,
    gapConfirmedSlotCount: 6,
    unresolvedDecisionCount: 10,
    prerequisiteStatus: artifact.currentBaseline.coverageGapClosurePrerequisite.status,
    activationStatus: artifact.currentBaseline.activation.status,
    workflowStatus: artifact.currentBaseline.activation.workflowStatus,
    readiness: artifact.currentBaseline.readiness.status,
  };
}

function git(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { status: result.status ?? 1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}
function localPaths(cwd) {
  const result = git(["status", "--short", "--untracked-files=all"], cwd);
  if (result.status !== 0) fail(`Unable to inspect git status: ${result.stderr || result.stdout}`);
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim().replaceAll("\\", "/"));
}
function ciPaths(cwd, env) {
  const head = env.GITHUB_SHA;
  if (!/^[0-9a-f]{40}$/i.test(head ?? "")) fail("BLOCK: CI head SHA is unavailable.");
  let base;
  if (env.GITHUB_EVENT_PATH) {
    try {
      const payload = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, "utf8"));
      base = payload.pull_request?.base?.sha ?? payload.before;
    } catch {
      fail("BLOCK: CI event metadata is unavailable.");
    }
  }
  if (!/^[0-9a-f]{40}$/i.test(base ?? "")) {
    const parents = git(["rev-list", "--parents", "-n", "1", head], cwd).stdout.trim().split(/\s+/);
    base = parents.length === 2 ? parents[1] : undefined;
  }
  if (!/^[0-9a-f]{40}$/i.test(base ?? "")) fail("BLOCK: CI base SHA is unavailable.");
  for (const value of [base, head]) {
    if (git(["cat-file", "-e", `${value}^{commit}`], cwd).status !== 0)
      fail("BLOCK: CI commit object is unavailable.");
  }
  const result = git(["diff", "--name-only", base, head], cwd);
  if (result.status !== 0 || !result.stdout.trim())
    fail("BLOCK: CI changed-path range is unavailable or empty.");
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((value) => value.replaceAll("\\", "/"));
}
export function validateDiagnosticCoverageGapClosurePlanDecisionProposalChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !changedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 9 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== changedPaths.length)
    fail(`Wave 6 Slice 9 requires exactly ${changedPaths.length} changed paths.`);
  return normalized;
}
function validateDiagnosticCoverageGapClosurePlanDecisionProposalSlice10ChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !slice10ChangedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 10 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== slice10ChangedPaths.length)
    fail(`Wave 6 Slice 10 requires exactly ${slice10ChangedPaths.length} changed paths.`);
  return normalized;
}
function validateDiagnosticCoverageGapClosurePlanDecisionProposalSlice11ChangedPaths(paths) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (new Set(normalized).size !== normalized.length)
    fail("Changed paths must not contain duplicates.");
  const unexpected = normalized.filter((value) => !slice11ChangedPathSet.has(value));
  if (unexpected.length > 0) fail(`Wave 6 Slice 11 out-of-scope path changed: ${unexpected[0]}.`);
  if (normalized.length !== slice11ChangedPaths.length)
    fail(`Wave 6 Slice 11 requires exactly ${slice11ChangedPaths.length} changed paths.`);
  return normalized;
}
export function collectDiagnosticCoverageGapClosurePlanDecisionProposalChangedPaths({
  cwd = repoRoot,
  env = process.env,
} = {}) {
  return String(env.GITHUB_ACTIONS ?? "").toLowerCase() === "true"
    ? ciPaths(cwd, env)
    : localPaths(cwd);
}
export function validateDiagnosticCoverageGapClosurePlanDecisionProposalWorktreeScope(
  paths,
  { env = process.env } = {},
) {
  if (!Array.isArray(paths)) fail("Changed paths must be an array.");
  if (String(env.GITHUB_ACTIONS ?? "").toLowerCase() !== "true" && paths.length === 0) return [];
  const normalized = paths.map((value) => String(value).replaceAll("\\", "/"));
  if (
    normalized.length === wave6ClosureContinuationPaths.size &&
    new Set(normalized).size === normalized.length &&
    normalized.every((value) => wave6ClosureContinuationPaths.has(value))
  )
    return normalized;
  if (
    normalized.length === wave7PrepFoundationPaths.size &&
    new Set(normalized).size === normalized.length &&
    normalized.every((value) => wave7PrepFoundationPaths.has(value))
  )
    return normalized;
  if (
    normalized.length === wave7PrepContinuationPaths.size &&
    new Set(normalized).size === normalized.length &&
    normalized.every((value) => wave7PrepContinuationPaths.has(value))
  )
    return normalized;
  if (
    normalized.length === preWave7Slice1ChangedPaths.size &&
    new Set(normalized).size === normalized.length &&
    normalized.every((value) => preWave7Slice1ChangedPaths.has(value))
  )
    return normalized;
  if (
    paths.length === slice13ChangedPaths.length &&
    new Set(paths).size === paths.length &&
    paths.every((value) => slice13ChangedPathSet.has(String(value).replaceAll("\\", "/")))
  )
    return paths;
  if (
    paths.length === slice12ChangedPaths.length &&
    paths.every((value) => slice12ChangedPathSet.has(String(value).replaceAll("\\", "/")))
  )
    return paths;
  if (
    paths.length === slice11ChangedPaths.length &&
    paths.every((value) => slice11ChangedPathSet.has(String(value).replaceAll("\\", "/")))
  )
    return validateDiagnosticCoverageGapClosurePlanDecisionProposalSlice11ChangedPaths(paths);
  if (
    paths.length === slice10ChangedPaths.length &&
    paths.every((value) => slice10ChangedPathSet.has(String(value).replaceAll("\\", "/")))
  )
    return validateDiagnosticCoverageGapClosurePlanDecisionProposalSlice10ChangedPaths(paths);
  return validateDiagnosticCoverageGapClosurePlanDecisionProposalChangedPaths(paths);
}
export async function main() {
  const artifact = await readDiagnosticCoverageGapClosurePlanDecisionProposal();
  const summary = validateDiagnosticCoverageGapClosurePlanDecisionProposal(artifact);
  if (process.argv.includes("--check-worktree-scope")) {
    const paths = collectDiagnosticCoverageGapClosurePlanDecisionProposalChangedPaths();
    validateDiagnosticCoverageGapClosurePlanDecisionProposalWorktreeScope(paths);
  }
  console.log(
    `[curriculum] Coverage gap closure decision proposal validated: ${summary.slotCount} slots, ${summary.draftOnlySlotCount} draft-only, ${summary.gapConfirmedSlotCount} gap-confirmed, ${summary.unresolvedDecisionCount} unresolved decisions; prerequisite ${summary.prerequisiteStatus}, activation ${summary.activationStatus}, workflow ${summary.workflowStatus}, readiness ${summary.readiness}.`,
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
