import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticCandidateIdentityPolicyDecisionProposal,
  readDiagnosticCandidateIdentityPolicyDecisionProposalUpstream,
  validateCandidateIdentityDecisionProposalChangedPaths,
  validateDiagnosticCandidateIdentityPolicyDecisionProposal,
} from "../scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs";

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
  "textbookContent",
  "copiedText",
  "studentName",
  "childName",
  "email",
  "reviewerEmail",
  "reviewerName",
  "userId",
  "accountId",
  "auditUserId",
  "auditAccountId",
  "auditEmail",
  "immutableDigest",
  "sha256",
  "contentHash",
  "canonicalizedContent",
  "normalizedStem",
  "storageObjectKey",
  "presignedUrl",
  "downloadUrl",
  "uploadUrl",
];
const expectedMarkers = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NOT_A_REAL_CANDIDATE_ID: true,
  NOT_RESERVED: true,
  NOT_APPROVED: true,
  NOT_USABLE_FOR_REVIEW: true,
  NOT_USABLE_FOR_DIGEST: true,
};
const approvedWave6Slice1ChangedPaths = [
  "docs/wave-6/diagnostic-candidate-identity-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/scope-and-non-goals.md",
  "docs/wave-6/slice-1-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-candidate-identity-policy-decision-proposal/grade-7-9-math.candidate-identity-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-coverage-gap-closure-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "docs/wave-6/diagnostic-reviewer-role-ownership-policy-decision-proposal.md",
  "docs/wave-6/slice-3-implementation-note.md",
  "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-separation-of-duties-policy-decision-proposal.md",
  "docs/wave-6/slice-4-implementation-note.md",
  "packages/curriculum/diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticCandidateIdentityPolicyDecisionProposal(),
    readDiagnosticCandidateIdentityPolicyDecisionProposalUpstream(),
  ]);
  return { artifact, upstream };
}

function validate(artifacts, artifact = artifacts.artifact, upstream = artifacts.upstream) {
  return validateDiagnosticCandidateIdentityPolicyDecisionProposal(artifact, upstream);
}

test("candidate identity decision proposal is valid, deferred and non-production", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    proposalArtifactVersion: "wave-6.slice-1.grade-7-9-math.v1",
    proposalVersion: "wave-6.slice-1.diagnostic-candidate-identity-policy.proposal.v1",
    proposalStatus: "PROPOSED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    syntheticExampleCount: 7,
    acceptedSyntheticExampleCount: 2,
    rejectedSyntheticExampleCount: 5,
    realCandidateIdCount: 0,
    reservedCandidateIdCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    workflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("proposal pins the exact four upstream artifacts", async () => {
  const artifacts = await readArtifacts();
  for (const [field, invalidValue] of [
    ["activationPrerequisitesArtifactVersion", "wave-5.changed"],
    ["candidateIdentityPolicyPlaceholderArtifactVersion", "wave-5.changed"],
    ["candidateDigestRegistryArtifactVersion", "wave-4.changed"],
    ["reviewCoverageArtifactVersion", "wave-4.changed"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.metadata[field] = invalidValue;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }

  const upstreamCases = [
    ["activationPrerequisites", "activationPrerequisitesArtifactVersion"],
    ["identityPlaceholder", "policyArtifactVersion"],
    ["digestRegistry", "registryArtifactVersion"],
    ["coverage", "coverageArtifactVersion"],
  ];
  for (const [artifactName, versionField] of upstreamCases) {
    const upstream = clone(artifacts.upstream);
    upstream[artifactName].metadata[versionField] = "changed.v1";
    assert.throws(() => validate(artifacts, artifacts.artifact, upstream), /baseline/);
  }
});

test("readiness, activation, workflow and prerequisite remain blocked", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["readiness", "status", "READY"],
    ["activation", "status", "ACTIVE"],
    ["activation", "workflowStatus", "ACTIVE"],
    ["candidateIdentityPrerequisite", "status", "SATISFIED"],
  ];
  for (const [section, field, value] of mutations) {
    const invalid = clone(artifacts.artifact);
    invalid.currentBaseline[section][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
  for (const reasons of [
    ["INCOMPLETE_COVERAGE"],
    ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES", "EXTRA"],
    ["INCOMPLETE_COVERAGE", "INCOMPLETE_COVERAGE"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.currentBaseline.readiness.blockingReasons = reasons;
    assert.throws(() => validate(artifacts, invalid), /blockingReasons/);
  }
});

test("proposed policy cannot claim approval, allocation or operational use", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "policyApproved",
    "grammarApproved",
    "candidateInstantiationAllowed",
    "candidateReservationAllowed",
    "candidateAllocationAllowed",
    "reviewUseAllowed",
    "digestUseAllowed",
    "prerequisiteSatisfactionAllowed",
    "activationAllowed",
    "workflowActivationAllowed",
    "readinessTransitionAllowed",
    "productionApprovalAllowed",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.proposalBoundary[field] = true;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
  const approvedGrammar = clone(artifacts.artifact);
  approvedGrammar.proposedPolicy.candidateReferenceGrammar.grammarApproved = true;
  assert.throws(() => validate(artifacts, approvedGrammar), /grammarApproved/);

  const reservation = clone(artifacts.artifact);
  reservation.proposedPolicy.collisionPrevention.reservationEnabled = true;
  assert.throws(() => validate(artifacts, reservation), /reservationEnabled/);
});

test("every example is synthetic, non-operational and classified deterministically", async () => {
  const artifacts = await readArtifacts();
  for (const vector of artifacts.artifact.syntheticExamples) {
    assert.deepEqual(vector.markers, expectedMarkers);
    assert.match(vector.renderedValue, /^SYNTHETIC_EXAMPLE_ONLY<.+>$/);
  }

  const missingMarker = clone(artifacts.artifact);
  delete missingMarker.syntheticExamples[0].markers.NOT_RESERVED;
  assert.throws(() => validate(artifacts, missingMarker), /NOT_RESERVED/);

  const unwrapped = clone(artifacts.artifact);
  unwrapped.syntheticExamples[0].renderedValue = "dcandidate.math.g7-9.algebra.c0123456789ab.v1.r0";
  assert.throws(() => validate(artifacts, unwrapped), /candidate-like value outside/);

  const rejectedMatching = clone(artifacts.artifact);
  rejectedMatching.syntheticExamples[2].renderedValue =
    "SYNTHETIC_EXAMPLE_ONLY<dcandidate.math.g7-9.algebra.c0123456789ab.v1.r0>";
  assert.throws(() => validate(artifacts, rejectedMatching), /renderedValue/);

  const changedVectorRef = clone(artifacts.artifact);
  changedVectorRef.syntheticExamples[0].vectorRef = "synthetic-positive-changed";
  assert.throws(() => validate(artifacts, changedVectorRef), /vectorRef/);
});

test("all ten proposal decisions remain explicitly unresolved", async () => {
  const artifacts = await readArtifacts();
  assert.equal(artifacts.artifact.unresolvedDecisions.length, 10);
  assert.equal(artifacts.artifact.aggregate.unresolvedDecisionCount, 10);
  assert.deepEqual(
    artifacts.artifact.unresolvedDecisions.map(({ state }) => state),
    Array(10).fill("UNRESOLVED_DEFERRED"),
  );

  const decided = clone(artifacts.artifact);
  decided.unresolvedDecisions[0].state = "APPROVED";
  assert.throws(() => validate(artifacts, decided), /state/);
});

test("all operational record collections and counts remain zero", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "policyDecisionRecords",
    "candidateIdentityRecords",
    "candidateReservationRecords",
    "candidateAllocationRecords",
    "candidateApprovalRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "digestValueRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "reviewerAssignmentRecords",
    "authorityGrantRecords",
    "productionApprovalRecords",
    "withdrawalRecords",
    "supersessionRecords",
    "tombstoneRecords",
    "restorationRecords",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[field].push({ state: "REAL" });
    assert.throws(() => validate(artifacts, invalid), /must remain empty/, field);
  }
  for (const field of [
    "satisfiedPrerequisiteCount",
    "realCandidateIdCount",
    "reservedCandidateIdCount",
    "approvedGrammarCount",
    "approvedCandidateCount",
    "productionApprovalCount",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.aggregate[field] = 1;
    assert.throws(() => validate(artifacts, invalid), new RegExp(field));
  }
});

test("unknown and every forbidden field or content term fail closed", async () => {
  const artifacts = await readArtifacts();
  const unknown = clone(artifacts.artifact);
  unknown.unexpected = true;
  assert.throws(() => validate(artifacts, unknown), /unexpected field/);

  for (const term of forbiddenTerms) {
    const forbiddenField = clone(artifacts.artifact);
    forbiddenField.proposalBoundary[term] = false;
    assert.throws(
      () => validate(artifacts, forbiddenField),
      /forbidden field term/,
      `field ${term}`,
    );

    const forbiddenContent = clone(artifacts.artifact);
    forbiddenContent.metadata.status = `blocked ${term}`;
    assert.throws(
      () => validate(artifacts, forbiddenContent),
      /forbidden content term/,
      `content ${term}`,
    );
  }
});

test("private, candidate-like and machine-identity-like values fail closed", async () => {
  const artifacts = await readArtifacts();
  const cases = [
    ["person@example.invalid", /email-like/],
    ["person@localhost", /email-like/],
    ["https://example.invalid/private", /URL-like/],
    ["s3://private-bucket/object", /URL-like/],
    ["file://private/path", /URL-like/],
    ["urn:uuid:018f22d8-7cc3-7f62-8f75-5812f92a06d7", /URL-like/],
    ["example.invalid/private", /URL-like/],
    ["123e4567-e89b-12d3-a456-426614174000", /UUID-like/],
    ["018f22d8-7cc3-7f62-8f75-5812f92a06d7", /UUID-like/],
    ["00000000-0000-0000-0000-000000000000", /UUID-like/],
    ["user-12345", /principal-like/],
    ["user-abc", /principal-like/],
    ["usr_alpha", /principal-like/],
    ["user12345", /principal-like/],
    ["account-abc123", /principal-like/],
    ["account-abc", /principal-like/],
    ["acct12345", /principal-like/],
    ["reviewer-12345", /principal-like/],
    ["audit-12345", /principal-like/],
    ["+7 (912) 345-67-89", /phone-like/],
    ["Иван Иванов", /person-name-like/],
    ["0123456789abcdef0123456789abcdef", /hash-like/],
    ["47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=", /hash-like/],
    ["ZmFrZWRpZ2VzdHZhbHVlZmFrZWRpZ2VzdHZhbHVl", /hash-like/],
    ["dcandidate.math.g7-9.algebra.c0123456789ab.v1.r0", /candidate-like/],
    ["ref=dcandidate.math.g7-9.algebra.c0123456789ab.v1.r0", /candidate-like/],
  ];
  for (const [value, error] of cases) {
    const invalid = clone(artifacts.artifact);
    invalid.syntheticExamples[0].vectorRef = value;
    assert.throws(() => validate(artifacts, invalid), error, value);
  }
});

test("scope guard retains exact cumulative admission through Wave 6 Slice 4", () => {
  assert.deepEqual(
    validateCandidateIdentityDecisionProposalChangedPaths(approvedWave6Slice1ChangedPaths),
    approvedWave6Slice1ChangedPaths,
  );
  for (const forbiddenPath of [
    "docs/wave-6/archive/scope-and-non-goals.md",
    "docs/wave-6/slice-5-implementation-note.md",
    "docs/wave-6/scope-and-non-goals.md.bak",
    "packages/curriculum/diagnostic-candidate-identity-policy-decision-proposal/extra.json",
    "apps/api/src/diagnostic-candidate-identity/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/candidates/page.tsx",
    "packages/curriculum/src/diagnostic-candidate-identity-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateCandidateIdentityDecisionProposalChangedPaths([forbiddenPath]),
      /Wave 6 Slice 1 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root test command registers the validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");
  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-candidate-identity-policy-decision-proposal.test.mjs",
  ]) {
    assert.equal(testCommand.split(exactRegistration).length - 1, 1, exactRegistration);
  }
});

test("validator contains no broad Wave 6, curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-6\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
  assert.doesNotMatch(source, /startsWith\(["']docs\/wave-6\//);
  assert.doesNotMatch(source, /startsWith\(["']apps\/api\//);
});
