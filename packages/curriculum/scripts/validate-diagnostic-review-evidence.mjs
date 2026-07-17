import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readDiagnosticReviewCoverage } from "./validate-diagnostic-review-coverage.mjs";

const expectedEvidenceArtifactVersion = "wave-4.slice-3.grade-7-9-math.v1";
const expectedCoverageArtifactVersion = "wave-4.slice-2.grade-7-9-math.v1";
const expectedBlueprintVersion = "wave-3.slice-3.grade-7-9-math.v1";
const expectedReadinessPolicyVersion = "wave-3-slice-11-diagnostic-readiness-policy-v1";
const pendingDigest = "PENDING_IMMUTABLE_CANDIDATE";

const requiredGateNames = [
  "methodology",
  "safety_no_answer",
  "rights_copyright",
  "grade_placement",
  "accessibility_readability",
  "production_approval",
];
const requiredBlockingReasons = new Set(["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"]);
const forbiddenTerms = [
  "finalAnswer",
  "correctAnswer",
  "workedSolution",
  "solution",
  "hint",
  "scoringKey",
  "isCorrect",
  "score",
  "mastery",
  "proficiency",
  "providerPayload",
  "llmPrompt",
  "llmCompletion",
  "ocrOutput",
  "sttOutput",
  "textbookContent",
  "copiedText",
  "studentName",
  "childName",
  "email",
  "reviewerName",
  "reviewerEmail",
];

const topLevelFields = new Set([
  "metadata",
  "identityPolicyDeferrals",
  "readiness",
  "aggregate",
  "slots",
  "evidenceRecords",
]);
const metadataFields = new Set([
  "schemaVersion",
  "evidenceArtifactVersion",
  "status",
  "artifactKind",
  "subject",
  "locale",
  "audienceGrades",
  "reviewCoverageArtifactVersion",
  "diagnosticBlueprintVersion",
  "diagnosticReadinessPolicyVersion",
  "sourceContract",
  "productionUseAllowed",
  "runtimeUseAllowed",
  "storageAllowed",
]);
const identityPolicyDeferralFields = new Set(["reviewerIdentity", "auditIdentity"]);
const identityPolicyFields = new Set(["status", "policyVersion", "referenceFormat"]);
const readinessFields = new Set([
  "status",
  "policyVersion",
  "blockingReasons",
  "productionUseAllowed",
]);
const aggregateFields = new Set([
  "blueprintSlotCount",
  "gatePlaceholderCount",
  "evidenceRecordCount",
  "approvedDecisionCount",
  "productionApprovalCount",
]);
const slotFields = new Set([
  "blueprintSlotId",
  "coverageStatus",
  "candidateDigest",
  "gateEvidencePlaceholders",
]);
const candidateDigestFields = new Set(["state", "algorithm", "value"]);
const gatePlaceholderFields = new Set([
  "recordState",
  "policyVersion",
  "candidateDigest",
  "decisionStatus",
  "evidenceRef",
  "reviewerIdentityRef",
  "auditIdentityRef",
  "decidedAt",
]);
const approvedSlice3ChangedPaths = new Set([
  "docs/wave-4/closure-gate.md",
  "docs/wave-4/diagnostic-candidate-canonicalization-contract.md",
  "docs/wave-4/diagnostic-candidate-digest-contract.md",
  "docs/wave-4/diagnostic-review-authority-contract.md",
  "docs/wave-4/diagnostic-review-evidence-contract.md",
  "docs/wave-4/diagnostic-review-gate-rubric-contract.md",
  "docs/wave-4/diagnostic-review-workflow-state-contract.md",
  "docs/wave-4/slice-3-implementation-note.md",
  "docs/wave-4/slice-4-implementation-note.md",
  "docs/wave-4/slice-5-implementation-note.md",
  "docs/wave-4/slice-6-implementation-note.md",
  "docs/wave-4/slice-7-implementation-note.md",
  "docs/wave-4/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-candidate-canonicalization/grade-7-9-math.canonicalization-placeholder.v1.json",
  "packages/curriculum/diagnostic-candidate-digest/grade-7-9-math.candidate-digest-placeholder.v1.json",
  "packages/curriculum/diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
  "packages/curriculum/diagnostic-review-evidence/grade-7-9-math.review-evidence.v1.json",
  "packages/curriculum/diagnostic-review-gate-rubric/grade-7-9-math.review-gate-rubric.v1.json",
  "packages/curriculum/diagnostic-review-workflow-state/grade-7-9-math.review-workflow-state-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/test/diagnostic-candidate-canonicalization.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-digest.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-review-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-gate-rubric.test.mjs",
  "packages/curriculum/test/diagnostic-review-workflow-state.test.mjs",
  "package.json",
]);
const wave5Slice1ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-review-activation-prerequisites-contract.md",
  "docs/wave-5/open-decisions.md",
  "docs/wave-5/scope-and-non-goals.md",
  "docs/wave-5/slice-1-implementation-note.md",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
]);
const wave5Slice2ScopeUnblockPaths = new Set([
  "docs/wave-5/slice-2-implementation-note.md",
  "packages/curriculum/diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
]);
const wave5Slice3ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-candidate-identity-policy-contract.md",
  "docs/wave-5/slice-3-implementation-note.md",
  "packages/curriculum/diagnostic-candidate-identity-policy/grade-7-9-math.candidate-identity-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
]);
const wave5Slice4ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md",
  "docs/wave-5/slice-4-implementation-note.md",
  "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
]);
const wave5Slice5ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md",
  "docs/wave-5/slice-5-implementation-note.md",
  "packages/curriculum/diagnostic-reviewer-role-ownership-policy/grade-7-9-math.reviewer-role-ownership-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
]);
const wave5Slice6ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md",
  "docs/wave-5/slice-6-implementation-note.md",
  "packages/curriculum/diagnostic-separation-of-duties-policy/grade-7-9-math.separation-of-duties-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
]);
const wave5Slice7ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md",
  "docs/wave-5/slice-7-implementation-note.md",
  "packages/curriculum/diagnostic-conflict-of-interest-policy/grade-7-9-math.conflict-of-interest-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
]);
const wave5Slice8ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-audit-identity-policy-contract.md",
  "docs/wave-5/slice-8-implementation-note.md",
  "packages/curriculum/diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs",
]);
const wave5Slice9ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-evidence-storage-retention-policy-contract.md",
  "docs/wave-5/slice-9-implementation-note.md",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy/grade-7-9-math.evidence-storage-retention-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs",
]);
const wave5Slice10ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-production-approval-authority-policy-contract.md",
  "docs/wave-5/slice-10-implementation-note.md",
  "packages/curriculum/diagnostic-production-approval-authority-policy/grade-7-9-math.production-approval-authority-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
  "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
]);
const wave5Slice11ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-coverage-gap-closure-plan-contract.md",
  "docs/wave-5/slice-11-implementation-note.md",
  "packages/curriculum/diagnostic-coverage-gap-closure-plan/grade-7-9-math.coverage-gap-closure-plan-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs",
  "packages/curriculum/test/diagnostic-coverage-gap-closure-plan.test.mjs",
]);
const wave5Slice12ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-readiness-integration-plan-contract.md",
  "docs/wave-5/slice-12-implementation-note.md",
  "packages/curriculum/diagnostic-readiness-integration-plan/grade-7-9-math.readiness-integration-plan-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
  "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
]);
const wave5Slice13ScopeUnblockPaths = new Set([
  "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
  "docs/wave-5/slice-13-implementation-note.md",
  "packages/curriculum/diagnostic-rollback-withdrawal-policy/grade-7-9-math.rollback-withdrawal-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/test/diagnostic-rollback-withdrawal-policy.test.mjs",
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultReviewEvidencePath = path.resolve(
  scriptDir,
  "../diagnostic-review-evidence/grade-7-9-math.review-evidence.v1.json",
);
export const repoRoot = path.resolve(scriptDir, "../../..");

export class DiagnosticReviewEvidenceValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiagnosticReviewEvidenceValidationError";
  }
}

function fail(message) {
  throw new DiagnosticReviewEvidenceValidationError(message);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, fieldPath) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${fieldPath} must be a non-empty string.`);
  }
}

function requireExactFields(value, expectedFields, fieldPath) {
  if (!isPlainObject(value)) {
    fail(`${fieldPath} must be an object.`);
  }

  for (const key of Object.keys(value)) {
    if (!expectedFields.has(key)) {
      fail(`${fieldPath}.${key} is an unexpected field.`);
    }
  }
  for (const field of expectedFields) {
    if (!Object.hasOwn(value, field)) {
      fail(`${fieldPath}.${field} is required.`);
    }
  }
}

function scanForbiddenTerms(value, fieldPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbiddenTerms(item, `${fieldPath}[${index}]`));
    return;
  }

  if (isPlainObject(value)) {
    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      for (const term of forbiddenTerms) {
        if (normalizedKey.includes(term.toLowerCase())) {
          fail(`${fieldPath}.${key} uses forbidden field term ${term}.`);
        }
      }
      scanForbiddenTerms(nestedValue, `${fieldPath}.${key}`);
    }
    return;
  }

  if (typeof value === "string") {
    const normalizedValue = value.toLowerCase();
    for (const term of forbiddenTerms) {
      if (normalizedValue.includes(term.toLowerCase())) {
        fail(`${fieldPath} uses forbidden content term ${term}.`);
      }
    }
  }
}

function validateCoverageReference(coverage) {
  if (
    !isPlainObject(coverage) ||
    !isPlainObject(coverage.metadata) ||
    !isPlainObject(coverage.policyVersionPins) ||
    !Array.isArray(coverage.slots)
  ) {
    fail("Referenced review coverage artifact is invalid.");
  }
  if (coverage.metadata.coverageArtifactVersion !== expectedCoverageArtifactVersion) {
    fail(`Referenced review coverage must be ${expectedCoverageArtifactVersion}.`);
  }
  if (coverage.metadata.diagnosticBlueprintVersion !== expectedBlueprintVersion) {
    fail(`Referenced review coverage must pin blueprint ${expectedBlueprintVersion}.`);
  }
  if (coverage.slots.length !== 11) {
    fail("Referenced review coverage must contain all 11 blueprint slots.");
  }
  for (const gateName of requiredGateNames) {
    requireString(coverage.policyVersionPins[gateName], `coverage.policyVersionPins.${gateName}`);
  }
}

function validateMetadata(metadata, coverage) {
  requireExactFields(metadata, metadataFields, "metadata");

  const expectedValues = new Map([
    ["schemaVersion", "learnika.diagnosticReviewEvidencePlaceholder.v1"],
    ["evidenceArtifactVersion", expectedEvidenceArtifactVersion],
    ["status", "placeholder_only_non_production"],
    ["artifactKind", "diagnostic_review_evidence_placeholder"],
    ["subject", "math"],
    ["locale", "ru-RU"],
    ["reviewCoverageArtifactVersion", expectedCoverageArtifactVersion],
    ["diagnosticBlueprintVersion", expectedBlueprintVersion],
    ["diagnosticReadinessPolicyVersion", expectedReadinessPolicyVersion],
    ["sourceContract", "docs/wave-4/diagnostic-review-evidence-contract.md"],
  ]);

  for (const [field, expectedValue] of expectedValues) {
    if (metadata[field] !== expectedValue) {
      fail(`metadata.${field} must be ${expectedValue}.`);
    }
  }
  if (
    !Array.isArray(metadata.audienceGrades) ||
    metadata.audienceGrades.length !== 3 ||
    metadata.audienceGrades.some((grade, index) => grade !== index + 7)
  ) {
    fail("metadata.audienceGrades must be exactly [7, 8, 9].");
  }
  if (
    metadata.productionUseAllowed !== false ||
    metadata.runtimeUseAllowed !== false ||
    metadata.storageAllowed !== false
  ) {
    fail("metadata must keep production, runtime and storage use disabled.");
  }
  if (metadata.reviewCoverageArtifactVersion !== coverage.metadata.coverageArtifactVersion) {
    fail("metadata.reviewCoverageArtifactVersion must match the referenced coverage artifact.");
  }
  if (metadata.diagnosticBlueprintVersion !== coverage.metadata.diagnosticBlueprintVersion) {
    fail("metadata.diagnosticBlueprintVersion must match the referenced coverage artifact.");
  }
}

function validateIdentityPolicyDeferrals(identityPolicyDeferrals) {
  requireExactFields(
    identityPolicyDeferrals,
    identityPolicyDeferralFields,
    "identityPolicyDeferrals",
  );

  for (const identityKind of identityPolicyDeferralFields) {
    const policy = identityPolicyDeferrals[identityKind];
    const fieldPath = `identityPolicyDeferrals.${identityKind}`;
    requireExactFields(policy, identityPolicyFields, fieldPath);
    if (
      policy.status !== "DEFERRED" ||
      policy.policyVersion !== null ||
      policy.referenceFormat !== null
    ) {
      fail(`${fieldPath} must remain explicitly DEFERRED and unresolved.`);
    }
  }
}

function validateReadiness(readiness, coverage) {
  requireExactFields(readiness, readinessFields, "readiness");
  if (readiness.status !== "NOT_READY") {
    fail("readiness.status must remain NOT_READY.");
  }
  if (
    readiness.policyVersion !== expectedReadinessPolicyVersion ||
    readiness.policyVersion !== coverage.readiness?.policyVersion
  ) {
    fail("readiness.policyVersion must remain pinned to the Wave 3 policy.");
  }
  if (readiness.productionUseAllowed !== false) {
    fail("readiness.productionUseAllowed must be false.");
  }
  if (!Array.isArray(readiness.blockingReasons)) {
    fail("readiness.blockingReasons must be an array.");
  }

  const reasons = new Set(readiness.blockingReasons);
  if (
    reasons.size !== requiredBlockingReasons.size ||
    [...requiredBlockingReasons].some((reason) => !reasons.has(reason))
  ) {
    fail("readiness.blockingReasons must contain the two current Wave 3 blockers.");
  }
}

function validateCandidateDigest(candidateDigest, fieldPath) {
  requireExactFields(candidateDigest, candidateDigestFields, fieldPath);
  if (
    candidateDigest.state !== pendingDigest ||
    candidateDigest.algorithm !== "sha256" ||
    candidateDigest.value !== null
  ) {
    fail(`${fieldPath} must remain an unpopulated immutable-candidate digest placeholder.`);
  }
}

function validateGatePlaceholders(gates, coverageSlot, policyVersionPins, fieldPath) {
  requireExactFields(gates, new Set(requiredGateNames), fieldPath);
  let gateCount = 0;

  for (const gateName of requiredGateNames) {
    const gate = gates[gateName];
    const gatePath = `${fieldPath}.${gateName}`;
    requireExactFields(gate, gatePlaceholderFields, gatePath);

    if (gate.recordState !== "NOT_RECORDED" || gate.decisionStatus !== "NO_DECISION") {
      fail(`${gatePath} must remain an unrecorded placeholder with no decision.`);
    }
    if (
      gate.policyVersion !== policyVersionPins[gateName] ||
      gate.policyVersion !== coverageSlot.reviewGates?.[gateName]?.policyVersion
    ) {
      fail(`${gatePath}.policyVersion must match the Slice 2 coverage policy pin.`);
    }
    if (gate.candidateDigest !== pendingDigest) {
      fail(`${gatePath}.candidateDigest must remain pending.`);
    }
    if (
      gate.evidenceRef !== null ||
      gate.reviewerIdentityRef !== null ||
      gate.auditIdentityRef !== null ||
      gate.decidedAt !== null
    ) {
      fail(`${gatePath} must not claim evidence, identity or a reviewer decision.`);
    }
    gateCount += 1;
  }

  return gateCount;
}

function validateSlots(artifact, coverage) {
  if (!Array.isArray(artifact.slots)) {
    fail("slots must be an array.");
  }

  const coverageSlotsById = new Map(coverage.slots.map((slot) => [slot.blueprintSlotId, slot]));
  if (coverageSlotsById.size !== 11 || artifact.slots.length !== coverageSlotsById.size) {
    fail("slots must represent all 11 review coverage slots exactly once.");
  }

  const seenSlotIds = new Set();
  let gatePlaceholderCount = 0;
  for (const [index, slot] of artifact.slots.entries()) {
    const fieldPath = `slots[${index}]`;
    requireExactFields(slot, slotFields, fieldPath);
    requireString(slot.blueprintSlotId, `${fieldPath}.blueprintSlotId`);

    const coverageSlot = coverageSlotsById.get(slot.blueprintSlotId);
    if (!coverageSlot) {
      fail(`${fieldPath} references unknown review coverage slot ${slot.blueprintSlotId}.`);
    }
    if (seenSlotIds.has(slot.blueprintSlotId)) {
      fail(`Duplicate blueprint slot ${slot.blueprintSlotId}.`);
    }
    seenSlotIds.add(slot.blueprintSlotId);

    if (slot.coverageStatus !== coverageSlot.coverageStatus) {
      fail(`${fieldPath}.coverageStatus must match the Slice 2 coverage artifact.`);
    }
    validateCandidateDigest(slot.candidateDigest, `${fieldPath}.candidateDigest`);
    if (
      coverageSlot.candidateDigest?.state !== pendingDigest ||
      coverageSlot.candidateDigest?.value !== null
    ) {
      fail(`${fieldPath} requires a pending candidate digest in the coverage artifact.`);
    }
    gatePlaceholderCount += validateGatePlaceholders(
      slot.gateEvidencePlaceholders,
      coverageSlot,
      coverage.policyVersionPins,
      `${fieldPath}.gateEvidencePlaceholders`,
    );
  }

  for (const blueprintSlotId of coverageSlotsById.keys()) {
    if (!seenSlotIds.has(blueprintSlotId)) {
      fail(`Missing review coverage slot ${blueprintSlotId}.`);
    }
  }

  return gatePlaceholderCount;
}

function validateEmptyEvidenceRecords(evidenceRecords) {
  if (!Array.isArray(evidenceRecords) || evidenceRecords.length !== 0) {
    fail("evidenceRecords must remain empty in the Slice 3 placeholder artifact.");
  }
}

function validateAggregate(aggregate, slotCount, gatePlaceholderCount) {
  requireExactFields(aggregate, aggregateFields, "aggregate");
  if (aggregate.blueprintSlotCount !== slotCount || aggregate.blueprintSlotCount !== 11) {
    fail("aggregate.blueprintSlotCount must match all 11 coverage slots.");
  }
  if (aggregate.gatePlaceholderCount !== gatePlaceholderCount || gatePlaceholderCount !== 66) {
    fail("aggregate.gatePlaceholderCount must match exactly 66 gate placeholders.");
  }
  if (
    aggregate.evidenceRecordCount !== 0 ||
    aggregate.approvedDecisionCount !== 0 ||
    aggregate.productionApprovalCount !== 0
  ) {
    fail("aggregate must remain at zero evidence records, approved decisions and approvals.");
  }
}

export function validateDiagnosticReviewEvidence(artifact, coverage) {
  if (!isPlainObject(artifact)) {
    fail("Review evidence placeholder artifact must be a JSON object.");
  }

  validateCoverageReference(coverage);
  scanForbiddenTerms(artifact);
  requireExactFields(artifact, topLevelFields, "$");
  validateMetadata(artifact.metadata, coverage);
  validateIdentityPolicyDeferrals(artifact.identityPolicyDeferrals);
  validateReadiness(artifact.readiness, coverage);
  validateEmptyEvidenceRecords(artifact.evidenceRecords);
  const gatePlaceholderCount = validateSlots(artifact, coverage);
  validateAggregate(artifact.aggregate, artifact.slots.length, gatePlaceholderCount);

  return {
    evidenceArtifactVersion: artifact.metadata.evidenceArtifactVersion,
    reviewCoverageArtifactVersion: artifact.metadata.reviewCoverageArtifactVersion,
    blueprintSlotCount: artifact.slots.length,
    gatePlaceholderCount,
    evidenceRecordCount: artifact.evidenceRecords.length,
    approvedDecisionCount: artifact.aggregate.approvedDecisionCount,
    productionApprovalCount: artifact.aggregate.productionApprovalCount,
    readiness: artifact.readiness.status,
  };
}

export async function readDiagnosticReviewEvidence(artifactPath = defaultReviewEvidencePath) {
  const raw = await readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

function normalizeStatusPath(statusLine) {
  const rawPath = statusLine.slice(3).trim();
  const normalizedPath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return normalizedPath.replaceAll("\\", "/");
}

export function validateReviewEvidenceChangedPaths(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    fail("Changed paths must be an array.");
  }

  for (const changedPath of changedPaths) {
    requireString(changedPath, "changedPath");
    if (
      !approvedSlice3ChangedPaths.has(changedPath) &&
      !wave5Slice1ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice2ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice3ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice4ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice5ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice6ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice7ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice8ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice9ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice10ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice11ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice12ScopeUnblockPaths.has(changedPath) &&
      !wave5Slice13ScopeUnblockPaths.has(changedPath)
    ) {
      fail(`Wave 4 Slice 3 out-of-scope path changed: ${changedPath}.`);
    }
  }
  return [...changedPaths];
}

export function validateReviewEvidenceWorktreeScope({ cwd = repoRoot } = {}) {
  const result = spawnSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    fail(`Unable to inspect git status: ${result.stderr || result.stdout}`);
  }

  const changedPaths = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map(normalizeStatusPath);

  return validateReviewEvidenceChangedPaths(changedPaths);
}

async function main() {
  const checkWorktreeScope = process.argv.includes("--check-worktree-scope");
  const [artifact, coverage] = await Promise.all([
    readDiagnosticReviewEvidence(),
    readDiagnosticReviewCoverage(),
  ]);
  const summary = validateDiagnosticReviewEvidence(artifact, coverage);

  if (checkWorktreeScope) {
    validateReviewEvidenceWorktreeScope();
  }

  console.log(
    `[curriculum] Review evidence ${summary.evidenceArtifactVersion} validated: ${summary.blueprintSlotCount} slots, ${summary.gatePlaceholderCount} gate placeholders, ${summary.evidenceRecordCount} evidence records, ${summary.approvedDecisionCount} approved decisions, ${summary.productionApprovalCount} production approvals; readiness ${summary.readiness}.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    console.error(`[curriculum] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
