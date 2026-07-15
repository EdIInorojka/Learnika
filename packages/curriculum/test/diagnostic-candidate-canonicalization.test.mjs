import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticCandidateCanonicalization,
  validateCandidateCanonicalizationChangedPaths,
  validateDiagnosticCandidateCanonicalization,
} from "../scripts/validate-diagnostic-candidate-canonicalization.mjs";
import { readDiagnosticCandidateDigestRegistry } from "../scripts/validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticReviewCoverage } from "../scripts/validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "../scripts/validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "../scripts/validate-diagnostic-review-gate-rubric.mjs";

const forbiddenFields = [
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
  "immutableDigest",
  "sha256",
  "contentHash",
  "canonicalizedContent",
  "normalizedStem",
  "itemStem",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [canonicalization, registry, coverage, evidence, rubric] = await Promise.all([
    readDiagnosticCandidateCanonicalization(),
    readDiagnosticCandidateDigestRegistry(),
    readDiagnosticReviewCoverage(),
    readDiagnosticReviewEvidence(),
    readDiagnosticReviewGateRubric(),
  ]);
  return { canonicalization, registry, coverage, evidence, rubric };
}

function validate(artifacts, override = artifacts.canonicalization) {
  return validateDiagnosticCandidateCanonicalization(
    override,
    artifacts.registry,
    artifacts.coverage,
    artifacts.evidence,
    artifacts.rubric,
  );
}

test("candidate canonicalization policy is valid and unresolved", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    policyArtifactVersion: "wave-4.slice-6.grade-7-9-math.v1",
    policyId: "diagnostic-candidate-canonicalization",
    policyVersion: "wave-4.slice-6.diagnostic-candidate-canonicalization.placeholder.v1",
    policyStatus: "UNRESOLVED_DEFERRED",
    candidateDigestRegistryArtifactVersion: "wave-4.slice-5.grade-7-9-math.v1",
    normalizationCategoryPlaceholderCount: 5,
    inclusionCategoryPlaceholderCount: 4,
    exclusionCategoryPlaceholderCount: 4,
    activeRuleCount: 0,
    transformedCandidateRecordCount: 0,
    digestValueCount: 0,
    reviewDecisionCount: 0,
    productionApprovedCandidateCount: 0,
    readiness: "NOT_READY",
  });
});

test("artifact pins the exact Slice 5 candidate digest registry", async () => {
  const artifacts = await readArtifacts();
  const invalid = clone(artifacts.canonicalization);
  invalid.metadata.candidateDigestRegistryArtifactVersion = "wave-4.invalid-registry.v1";
  assert.throws(() => validate(artifacts, invalid), /must be wave-4\.slice-5/);
});

test("policy identity remains unresolved deferred and inactive", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["status", "ACTIVE"],
    ["activeRulesetVersion", "ruleset.v1"],
    ["activationAllowed", true],
  ];
  for (const [field, value] of mutations) {
    const invalid = clone(artifacts.canonicalization);
    invalid.policyIdentity[field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      /unresolved and inactive Slice 6 placeholder/,
      field,
    );
  }
});

test("dependency references match every unresolved Slice 5 policy pin", async () => {
  const artifacts = await readArtifacts();

  const registryCount = clone(artifacts.canonicalization);
  registryCount.dependencyReferences.candidateDigestRegistry.candidatePlaceholderCount = 10;
  assert.throws(() => validate(artifacts, registryCount), /must match the Slice 5 placeholder/);

  for (const field of [
    "candidateIdentityPolicy",
    "digestAlgorithmPolicy",
    "priorCanonicalizationPolicy",
  ]) {
    const invalid = clone(artifacts.canonicalization);
    invalid.dependencyReferences[field].policyVersion = "wave-4.invalid-policy.v1";
    assert.throws(
      () => validate(artifacts, invalid),
      /must match the unresolved Slice 5 policy/,
      field,
    );
  }
});

test("normalization categories are exact unique placeholders", async () => {
  const artifacts = await readArtifacts();

  const missing = clone(artifacts.canonicalization);
  missing.normalizationCategoryPlaceholders.pop();
  assert.throws(() => validate(artifacts, missing), /exactly five placeholder categories/);

  const unknown = clone(artifacts.canonicalization);
  unknown.normalizationCategoryPlaceholders[0].categoryId = "UNKNOWN_HANDLING";
  assert.throws(() => validate(artifacts, unknown), /unknown normalization category/);

  const duplicate = clone(artifacts.canonicalization);
  duplicate.normalizationCategoryPlaceholders[1].categoryId =
    duplicate.normalizationCategoryPlaceholders[0].categoryId;
  assert.throws(() => validate(artifacts, duplicate), /Duplicate normalization category/);
});

test("normalization categories cannot activate policies or rules", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["state", "ACTIVE"],
    ["policyRef", "policy.v1"],
    ["activeRuleRefs", ["rule.v1"]],
  ];
  for (const [field, value] of mutations) {
    const invalid = clone(artifacts.canonicalization);
    invalid.normalizationCategoryPlaceholders[0][field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      /unresolved placeholder without active rules/,
      field,
    );
  }
});

test("inclusion categories remain exact and contain no concrete fields", async () => {
  const artifacts = await readArtifacts();
  const categories =
    artifacts.canonicalization.contentFieldCategoryPlaceholders.inclusionCategoryPlaceholders;
  assert.equal(categories.length, 4);

  const missing = clone(artifacts.canonicalization);
  missing.contentFieldCategoryPlaceholders.inclusionCategoryPlaceholders.pop();
  assert.throws(() => validate(artifacts, missing), /exactly four placeholder categories/);

  const populated = clone(artifacts.canonicalization);
  populated.contentFieldCategoryPlaceholders.inclusionCategoryPlaceholders[0].fieldRefs.push(
    "candidate.identity",
  );
  assert.throws(
    () => validate(artifacts, populated),
    /unresolved without concrete field references/,
  );
});

test("exclusion categories remain exact and contain no concrete fields", async () => {
  const artifacts = await readArtifacts();
  const categories =
    artifacts.canonicalization.contentFieldCategoryPlaceholders.exclusionCategoryPlaceholders;
  assert.equal(categories.length, 4);

  const unknown = clone(artifacts.canonicalization);
  unknown.contentFieldCategoryPlaceholders.exclusionCategoryPlaceholders[0].categoryId =
    "UNKNOWN_FIELD_CLASS";
  assert.throws(() => validate(artifacts, unknown), /unknown field category/);

  const populated = clone(artifacts.canonicalization);
  populated.contentFieldCategoryPlaceholders.exclusionCategoryPlaceholders[0].fieldRefs.push(
    "review.runtime",
  );
  assert.throws(
    () => validate(artifacts, populated),
    /unresolved without concrete field references/,
  );
});

test("locale and language handling remains an unresolved ru-RU placeholder", async () => {
  const artifacts = await readArtifacts();
  const invalid = clone(artifacts.canonicalization);
  invalid.localeLanguageHandling.policyRef = "language-policy.v1";
  assert.throws(() => validate(artifacts, invalid), /unresolved ru-RU placeholder/);
});

test("math notation handling remains unresolved without rules", async () => {
  const artifacts = await readArtifacts();
  const invalid = clone(artifacts.canonicalization);
  invalid.mathNotationHandling.activeRuleRefs.push("notation-rule.v1");
  assert.throws(() => validate(artifacts, invalid), /mathNotationHandling must remain unresolved/);
});

test("whitespace and punctuation handling remains unresolved without rules", async () => {
  const artifacts = await readArtifacts();
  const invalid = clone(artifacts.canonicalization);
  invalid.whitespacePunctuationHandling.punctuationPolicyRef = "punctuation-policy.v1";
  assert.throws(
    () => validate(artifacts, invalid),
    /whitespacePunctuationHandling must remain unresolved/,
  );
});

test("active rules transformed candidates decisions and approvals remain absent", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "activeCanonicalizationRuleRecords",
    "transformedCandidateRecords",
    "reviewDecisionRecords",
    "productionApprovalRecords",
  ]) {
    const populated = clone(artifacts.canonicalization);
    populated[field].push({ recordId: "record-1" });
    assert.throws(
      () => validate(artifacts, populated),
      new RegExp(`${field} must remain empty`),
      field,
    );
  }
});

test("record boundary and aggregate counts remain zero", async () => {
  const artifacts = await readArtifacts();

  const boundary = clone(artifacts.canonicalization);
  boundary.recordBoundary.canonicalizationRulesRecorded = true;
  assert.throws(
    () => validate(artifacts, boundary),
    /canonicalizationRulesRecorded must remain false/,
  );

  const aggregate = clone(artifacts.canonicalization);
  aggregate.aggregate.digestValueCount = 1;
  assert.throws(
    () => validate(artifacts, aggregate),
    /zero rules, transforms, digests, decisions and approvals/,
  );
});

test("hash-like values are rejected", async () => {
  const artifacts = await readArtifacts();
  const invalid = clone(artifacts.canonicalization);
  invalid.dependencyReferences.candidateDigestRegistry.artifactStatus = "a".repeat(64);
  assert.throws(() => validate(artifacts, invalid), /hash-like value/);
});

test("canonicalization artifact rejects every forbidden field term", async () => {
  const artifacts = await readArtifacts();
  for (const forbiddenField of forbiddenFields) {
    const invalid = clone(artifacts.canonicalization);
    invalid.normalizationCategoryPlaceholders[0][forbiddenField] = "blocked";
    assert.throws(() => validate(artifacts, invalid), /forbidden field term/, forbiddenField);
  }
});

test("readiness remains NOT_READY with both Wave 3 blockers", async () => {
  const artifacts = await readArtifacts();

  const ready = clone(artifacts.canonicalization);
  ready.readiness.status = "READY";
  assert.throws(() => validate(artifacts, ready), /readiness.status must remain NOT_READY/);

  const missingBlocker = clone(artifacts.canonicalization);
  missingBlocker.readiness.blockingReasons = ["INCOMPLETE_COVERAGE"];
  assert.throws(() => validate(artifacts, missingBlocker), /two current Wave 3 blockers/);
});

test("Slice 6 worktree scope permits only the ten exact static paths", () => {
  const approvedPaths = [
    "docs/wave-4/diagnostic-candidate-canonicalization-contract.md",
    "docs/wave-4/slice-6-implementation-note.md",
    "packages/curriculum/diagnostic-candidate-canonicalization/grade-7-9-math.canonicalization-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
    "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
    "packages/curriculum/test/diagnostic-candidate-canonicalization.test.mjs",
    "package.json",
  ];
  assert.deepEqual(validateCandidateCanonicalizationChangedPaths(approvedPaths), approvedPaths);

  const forbiddenPaths = [
    "apps/api/src/diagnostic-review/canonicalization.controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "pnpm-lock.yaml",
    "packages/curriculum/src/diagnostic-canonicalization.ts",
  ];
  for (const forbiddenPath of forbiddenPaths) {
    assert.throws(
      () => validateCandidateCanonicalizationChangedPaths([forbiddenPath]),
      /Wave 4 Slice 6 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("review scope guards contain no broad API allowlist", async () => {
  const sources = await Promise.all([
    readFile(
      new URL("../scripts/validate-diagnostic-candidate-canonicalization.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-candidate-digest.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-review-gate-rubric.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-review-evidence.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-review-coverage.mjs", import.meta.url),
      "utf8",
    ),
  ]);
  for (const source of sources) {
    assert.doesNotMatch(source, /["']apps\/api\/["']/);
  }
});
