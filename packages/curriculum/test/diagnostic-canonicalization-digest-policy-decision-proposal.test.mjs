import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticCanonicalizationDigestPolicyDecisionProposal,
  readDiagnosticCanonicalizationDigestPolicyDecisionProposalUpstream,
  validateCanonicalizationDigestDecisionProposalChangedPaths,
  validateDiagnosticCanonicalizationDigestPolicyDecisionProposal,
} from "../scripts/validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs";

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
  NOT_REAL_CONTENT: true,
  NOT_A_REAL_CANDIDATE: true,
  NOT_A_REAL_DIGEST: true,
  NOT_APPROVED: true,
  NOT_USABLE_FOR_REVIEW: true,
  NOT_USABLE_FOR_PRODUCTION: true,
};
const approvedWave6Slice2ChangedPaths = [
  "docs/wave-6/diagnostic-canonicalization-digest-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-2-implementation-note.md",
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
  "docs/wave-6/diagnostic-conflict-of-interest-policy-decision-proposal.md",
  "docs/wave-6/slice-5-implementation-note.md",
  "packages/curriculum/diagnostic-conflict-of-interest-policy-decision-proposal/grade-7-9-math.conflict-of-interest-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-conflict-of-interest-policy-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-audit-identity-policy-decision-proposal.md",
  "docs/wave-6/slice-6-implementation-note.md",
  "packages/curriculum/diagnostic-audit-identity-policy-decision-proposal/grade-7-9-math.audit-identity-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-audit-identity-policy-decision-proposal.test.mjs",
  "docs/wave-6/diagnostic-evidence-storage-retention-policy-decision-proposal.md",
  "docs/wave-6/slice-7-implementation-note.md",
  "packages/curriculum/diagnostic-evidence-storage-retention-policy-decision-proposal/grade-7-9-math.evidence-storage-retention-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-evidence-storage-retention-policy-decision-proposal.test.mjs",
  "package.json",
  "packages/curriculum/diagnostic-canonicalization-digest-policy-decision-proposal/grade-7-9-math.canonicalization-digest-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs",
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
  "packages/curriculum/test/diagnostic-canonicalization-digest-policy-decision-proposal.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [artifact, upstream] = await Promise.all([
    readDiagnosticCanonicalizationDigestPolicyDecisionProposal(),
    readDiagnosticCanonicalizationDigestPolicyDecisionProposalUpstream(),
  ]);
  return { artifact, upstream };
}

function validate(artifacts, artifact = artifacts.artifact, upstream = artifacts.upstream) {
  return validateDiagnosticCanonicalizationDigestPolicyDecisionProposal(artifact, upstream);
}

test("canonicalization and digest decision proposal is valid deferred and non-production", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    proposalArtifactVersion: "wave-6.slice-2.grade-7-9-math.v1",
    proposalVersion:
      "wave-6.slice-2.diagnostic-candidate-canonicalization-digest-policy.proposal.v1",
    proposalStatus: "PROPOSED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    syntheticExampleCount: 9,
    acceptedSyntheticExampleCount: 4,
    rejectedSyntheticExampleCount: 5,
    selectedDigestAlgorithmCount: 0,
    digestValueCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    workflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("proposal pins the exact five upstream artifacts", async () => {
  const artifacts = await readArtifacts();
  const expectedVersions = [
    ["activationPrerequisites", "wave-5.slice-2.grade-7-9-math.v1"],
    ["placeholder", "wave-5.slice-4.grade-7-9-math.v1"],
    ["identityProposal", "wave-6.slice-1.grade-7-9-math.v1"],
    ["digestRegistry", "wave-4.slice-5.grade-7-9-math.v1"],
    ["canonicalization", "wave-4.slice-6.grade-7-9-math.v1"],
  ];
  for (const [name] of expectedVersions) {
    const invalidUpstream = clone(artifacts.upstream);
    if (name === "activationPrerequisites") {
      invalidUpstream[name].metadata.activationPrerequisitesArtifactVersion = "stale";
    } else if (name === "placeholder") {
      invalidUpstream[name].metadata.policyArtifactVersion = "stale";
    } else if (name === "identityProposal") {
      invalidUpstream[name].metadata.proposalArtifactVersion = "stale";
    } else if (name === "digestRegistry") {
      invalidUpstream[name].metadata.registryArtifactVersion = "stale";
    } else {
      invalidUpstream[name].metadata.policyArtifactVersion = "stale";
    }
    assert.throws(
      () => validate(artifacts, artifacts.artifact, invalidUpstream),
      /baseline|empty|deferred|non-operational/,
    );
  }
  assert.equal(
    artifacts.artifact.upstreamReferences.canonicalizationDigestPolicyPlaceholder.policyVersion,
    "wave-5.slice-4.diagnostic-candidate-canonicalization-and-digest.placeholder.v1",
  );
  assert.equal(
    artifacts.artifact.upstreamReferences.candidateIdentityDecisionProposal.proposalVersion,
    "wave-6.slice-1.diagnostic-candidate-identity-policy.proposal.v1",
  );
});

test("baseline remains blocked with the exact prerequisite and readiness reasons", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(artifacts.artifact.currentBaseline, {
    readiness: {
      policyVersion: "wave-3-slice-11-diagnostic-readiness-policy-v1",
      status: "NOT_READY",
      blockingReasons: ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES"],
    },
    activation: { status: "BLOCKED", workflowStatus: "INACTIVE" },
    canonicalizationDigestPrerequisite: {
      prerequisiteId: "canonicalization_and_digest_policy",
      status: "UNSATISFIED_DEFERRED",
    },
    satisfiedPrerequisiteCount: 0,
    productionApprovalCount: 0,
    approvedCandidateCount: 0,
  });
  for (const mutate of [
    (artifact) => (artifact.currentBaseline.readiness.status = "READY"),
    (artifact) => artifact.currentBaseline.readiness.blockingReasons.pop(),
    (artifact) => (artifact.currentBaseline.activation.status = "ACTIVE"),
    (artifact) => (artifact.currentBaseline.activation.workflowStatus = "ACTIVE"),
    (artifact) =>
      (artifact.currentBaseline.canonicalizationDigestPrerequisite.status = "SATISFIED"),
    (artifact) => (artifact.currentBaseline.satisfiedPrerequisiteCount = 1),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() => validate(artifacts, invalid));
  }
});

test("every proposal boundary claim remains false and deferred", async () => {
  const artifacts = await readArtifacts();
  assert.equal(artifacts.artifact.proposalBoundary.proposalStatus, "PROPOSED_DEFERRED");
  for (const [key, value] of Object.entries(artifacts.artifact.proposalBoundary)) {
    if (key === "proposalStatus") continue;
    assert.equal(value, false, key);
    const invalid = clone(artifacts.artifact);
    invalid.proposalBoundary[key] = true;
    assert.throws(() => validate(artifacts, invalid), undefined, key);
  }
});

test("field inventory ordering serialization and normalization stay exact proposals", async () => {
  const artifacts = await readArtifacts();
  const policy = artifacts.artifact.proposedPolicy;
  assert.equal(policy.state, "PROPOSED_NOT_APPROVED");
  assert.equal(policy.canonicalFieldInventory.fieldClasses.length, 16);
  assert.equal(
    policy.canonicalFieldInventory.fieldClasses.filter(
      ({ disposition }) => disposition === "PROPOSED_INCLUDE",
    ).length,
    9,
  );
  assert.equal(
    policy.canonicalFieldInventory.fieldClasses.filter(
      ({ disposition }) => disposition === "PROPOSED_EXCLUDE",
    ).length,
    7,
  );
  assert.equal(policy.byteSerialization.serializationAllowed, false);
  assert.equal(policy.localeUnicodeRussianNormalization.normalizationApproved, false);
  assert.equal(policy.mathNotationNormalization.semanticEquivalenceRewritingAllowed, false);
  assert.equal(policy.mathNotationNormalization.expressionEvaluationAllowed, false);

  for (const mutate of [
    (artifact) => artifact.proposedPolicy.canonicalFieldInventory.fieldClasses.reverse(),
    (artifact) => artifact.proposedPolicy.deterministicOrdering.canonicalFieldOrder.pop(),
    (artifact) => (artifact.proposedPolicy.byteSerialization.serializationAllowed = true),
    (artifact) =>
      (artifact.proposedPolicy.localeUnicodeRussianNormalization.transliterationAllowed = true),
    (artifact) =>
      (artifact.proposedPolicy.mathNotationNormalization.expressionEvaluationAllowed = true),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() => validate(artifacts, invalid));
  }
});

test("no concrete digest algorithm encoding selection or generation is present", async () => {
  const artifacts = await readArtifacts();
  const policy = artifacts.artifact.proposedPolicy;
  assert.equal(policy.digestAlgorithmFamily.algorithmId, null);
  assert.equal(policy.digestAlgorithmFamily.algorithmSelected, false);
  assert.equal(policy.digestAlgorithmFamily.algorithmApproved, false);
  assert.equal(policy.digestAlgorithmFamily.digestGenerationAllowed, false);
  assert.equal(policy.digestEncoding.encodingId, null);
  assert.equal(policy.digestEncoding.encodingSelected, false);
  assert.equal(policy.digestEncoding.encodingApproved, false);
  assert.equal(policy.domainSeparation.domainTagApproved, false);
  assert.equal(policy.invalidationRegeneration.regenerationExecutionAllowed, false);

  for (const algorithmToken of ["sha256", "SHA-256", "SHA_256", "SHA 256", "BLAKE3"]) {
    const invalid = clone(artifacts.artifact);
    invalid.proposedPolicy.digestAlgorithmFamily.familyRequirement = algorithmToken;
    assert.throws(
      () => validate(artifacts, invalid),
      /forbidden content term|concrete digest algorithm token/,
    );
  }
});

test("all synthetic vectors are exact symbolic non-operational examples", async () => {
  const artifacts = await readArtifacts();
  const examples = artifacts.artifact.syntheticExamples;
  assert.equal(examples.length, 9);
  assert.equal(
    examples.filter(({ vectorType }) => vectorType === "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR").length,
    4,
  );
  assert.equal(
    examples.filter(({ vectorType }) => vectorType === "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR")
      .length,
    5,
  );
  for (const vector of examples) {
    assert.deepEqual(vector.markers, expectedMarkers);
    for (const token of vector.abstractInputTokens) {
      assert.match(token, /^SYNTHETIC_[A-Z0-9_]+$/);
    }
  }
  for (const mutate of [
    (artifact) => artifact.syntheticExamples.pop(),
    (artifact) => artifact.syntheticExamples.reverse(),
    (artifact) => (artifact.syntheticExamples[0].vectorRef = "synthetic-mutated"),
    (artifact) => delete artifact.syntheticExamples[0].markers.NOT_REAL_CONTENT,
    (artifact) => (artifact.syntheticExamples[0].markers.NOT_APPROVED = false),
    (artifact) => (artifact.syntheticExamples[4].rejectionReasonCode = "CHANGED"),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() => validate(artifacts, invalid));
  }
});

test("all thirteen decisions remain explicitly unresolved", async () => {
  const artifacts = await readArtifacts();
  assert.equal(artifacts.artifact.unresolvedDecisions.length, 13);
  assert.equal(
    new Set(artifacts.artifact.unresolvedDecisions.map(({ decisionId }) => decisionId)).size,
    13,
  );
  for (const row of artifacts.artifact.unresolvedDecisions) {
    assert.equal(row.state, "UNRESOLVED_DEFERRED");
    assert.equal(row.decisionRecordRef, null);
  }
  const invalid = clone(artifacts.artifact);
  invalid.unresolvedDecisions[0].state = "APPROVED";
  assert.throws(() => validate(artifacts, invalid));
});

test("all operational records remain empty and all operational counts remain zero", async () => {
  const artifacts = await readArtifacts();
  const nonOperationalAggregateKeys = new Set([
    "syntheticExampleCount",
    "acceptedSyntheticExampleCount",
    "rejectedSyntheticExampleCount",
    "unresolvedDecisionCount",
  ]);
  for (const [key, value] of Object.entries(artifacts.artifact.recordBoundary)) {
    assert.equal(value, false, key);
    const invalid = clone(artifacts.artifact);
    invalid.recordBoundary[key] = true;
    assert.throws(() => validate(artifacts, invalid));
  }
  for (const [key, value] of Object.entries(artifacts.artifact.aggregate)) {
    if (nonOperationalAggregateKeys.has(key)) continue;
    assert.equal(value, 0, key);
    const invalid = clone(artifacts.artifact);
    invalid.aggregate[key] = 1;
    assert.throws(() => validate(artifacts, invalid));
  }
  for (const [key, value] of Object.entries(artifacts.artifact)) {
    if (!key.endsWith("Records")) continue;
    assert.deepEqual(value, [], key);
    const invalid = clone(artifacts.artifact);
    invalid[key].push({ synthetic: true });
    assert.throws(() => validate(artifacts, invalid));
  }
});

test("unknown fields and every forbidden key or content term fail closed", async () => {
  const artifacts = await readArtifacts();
  const unknown = clone(artifacts.artifact);
  unknown.unexpected = false;
  assert.throws(() => validate(artifacts, unknown), /unexpected field/);

  for (const term of forbiddenTerms) {
    const invalidKey = clone(artifacts.artifact);
    invalidKey.proposedPolicy[term] = false;
    assert.throws(() => validate(artifacts, invalidKey), /forbidden field term/, term);

    const invalidValue = clone(artifacts.artifact);
    invalidValue.syntheticExamples[0].vectorRef = term;
    assert.throws(() => validate(artifacts, invalidValue), /forbidden content term/, term);
  }
});

test("private machine candidate and hash-like values fail closed", async () => {
  const artifacts = await readArtifacts();
  const cases = [
    ["person@example.invalid", /email-like/],
    ["person@localhost", /email-like/],
    ["https://example.invalid/path", /URL-like/],
    ["s3://bucket/key", /URL-like/],
    ["file://local/path", /URL-like/],
    ["urn:example:test", /URL-like/],
    ["www.example.dev/path", /URL-like/],
    ["example.dev/path", /URL-like/],
    ["127.0.0.1/path", /URL-like/],
    ["00000000-0000-0000-0000-000000000000", /UUID-like/],
    ["018f22d8-7cc3-7f62-8f75-5812f92a06d7", /UUID-like/],
    ["user-abc", /principal-like/],
    ["account_123", /principal-like/],
    ["reviewer:abc", /principal-like/],
    ["audit-id-abc", /principal-like/],
    ["child123", /principal-like/],
    ["+7 (912) 345-67-89", /phone-like/],
    ["Иван Иванов", /person-name-like/],
    ["0123456789abcdef0123456789abcdef", /hash-like/],
    ["47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=", /hash-like/],
    ["dcandidate.math.g7-9.algebra.example.v1", /candidate-like/],
    ["dcandidate.math.g7-9.algebra.c0123456789ab.v1.r0", /candidate-like/],
    ["ref=dcandidate.math.g7-9.geometry.c0123456789ab.v2.r3", /candidate-like/],
  ];
  for (const [value, error] of cases) {
    const invalid = clone(artifacts.artifact);
    invalid.syntheticExamples[0].vectorRef = value;
    assert.throws(() => validate(artifacts, invalid), error, value);
  }
});

test("scope guard retains exact cumulative admission through Wave 6 Slice 7", () => {
  assert.equal(approvedWave6Slice2ChangedPaths.length, 61);
  assert.deepEqual(
    validateCanonicalizationDigestDecisionProposalChangedPaths(approvedWave6Slice2ChangedPaths),
    approvedWave6Slice2ChangedPaths,
  );
  for (const forbiddenPath of [
    "docs/wave-6/archive/diagnostic-canonicalization-digest-policy-decision-proposal.md",
    "docs/wave-6/slice-8-implementation-note.md",
    "docs/wave-6/slice-2-implementation-note.md.bak",
    "packages/curriculum/diagnostic-canonicalization-digest-policy-decision-proposal/extra.json",
    "apps/api/src/diagnostic-canonicalization/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/canonicalization/page.tsx",
    "packages/curriculum/src/diagnostic-digest-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateCanonicalizationDigestDecisionProposalChangedPaths([forbiddenPath]),
      /Wave 6 Slice 2 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root command registers Slice 2 exactly once and validator has no broad allowlist", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");
  for (const registration of [
    "node packages/curriculum/scripts/validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-canonicalization-digest-policy-decision-proposal.test.mjs",
  ]) {
    assert.equal(testCommand.split(registration).length - 1, 1, registration);
  }
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs",
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
