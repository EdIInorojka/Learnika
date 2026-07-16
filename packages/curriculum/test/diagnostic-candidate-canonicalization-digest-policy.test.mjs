import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import { readDiagnosticCandidateCanonicalization } from "../scripts/validate-diagnostic-candidate-canonicalization.mjs";
import {
  readDiagnosticCandidateCanonicalizationDigestPolicy,
  validateCandidateCanonicalizationDigestPolicyChangedPaths,
  validateDiagnosticCandidateCanonicalizationDigestPolicy,
} from "../scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs";
import { readDiagnosticCandidateDigestRegistry } from "../scripts/validate-diagnostic-candidate-digest.mjs";
import { readDiagnosticCandidateIdentityPolicy } from "../scripts/validate-diagnostic-candidate-identity-policy.mjs";
import { readDiagnosticReviewActivationPrerequisites } from "../scripts/validate-diagnostic-review-activation-prerequisites.mjs";
import { readDiagnosticReviewAuthority } from "../scripts/validate-diagnostic-review-authority.mjs";
import { readDiagnosticReviewCoverage } from "../scripts/validate-diagnostic-review-coverage.mjs";
import { readDiagnosticReviewEvidence } from "../scripts/validate-diagnostic-review-evidence.mjs";
import { readDiagnosticReviewGateRubric } from "../scripts/validate-diagnostic-review-gate-rubric.mjs";
import { readDiagnosticReviewWorkflowState } from "../scripts/validate-diagnostic-review-workflow-state.mjs";

const expectedDecisionRequirementIds = [
  "candidate_field_inventory",
  "field_inclusion_and_exclusion",
  "deterministic_ordering_and_byte_serialization",
  "locale_unicode_language_and_line_endings",
  "mathematical_notation_symbol_unit_and_expression_serialization",
  "whitespace_and_punctuation_handling",
  "canonicalization_versioning_migration_and_invalidation",
  "digest_algorithm_encoding_and_domain_separation",
  "digest_collision_incident_and_algorithm_migration",
  "independent_reproducibility_and_synthetic_vectors",
];
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
  "immutableDigest",
  "sha256",
  "contentHash",
  "canonicalizedContent",
  "normalizedStem",
];
const approvedSlice4ChangedPaths = [
  "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md",
  "docs/wave-5/slice-4-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
  "packages/curriculum/scripts/validate-skill-graph.mjs",
  "packages/curriculum/test/diagnostic-blueprint.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
  "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
  "packages/curriculum/test/diagnostic-items.test.mjs",
  "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
  "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  "packages/curriculum/test/diagnostic-review-authority.test.mjs",
  "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
  "packages/curriculum/test/skill-graph-seed.test.mjs",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [
    artifact,
    identityPolicy,
    activationPrerequisites,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    authority,
  ] = await Promise.all([
    readDiagnosticCandidateCanonicalizationDigestPolicy(),
    readDiagnosticCandidateIdentityPolicy(),
    readDiagnosticReviewActivationPrerequisites(),
    readDiagnosticReviewCoverage(),
    readDiagnosticReviewEvidence(),
    readDiagnosticReviewGateRubric(),
    readDiagnosticCandidateDigestRegistry(),
    readDiagnosticCandidateCanonicalization(),
    readDiagnosticReviewWorkflowState(),
    readDiagnosticReviewAuthority(),
  ]);
  return {
    artifact,
    identityPolicy,
    activationPrerequisites,
    coverage,
    evidence,
    rubric,
    registry,
    canonicalization,
    workflow,
    authority,
  };
}

function validate(artifacts, artifact = artifacts.artifact) {
  return validateDiagnosticCandidateCanonicalizationDigestPolicy(
    artifact,
    artifacts.identityPolicy,
    artifacts.activationPrerequisites,
    artifacts.coverage,
    artifacts.evidence,
    artifacts.rubric,
    artifacts.registry,
    artifacts.canonicalization,
    artifacts.workflow,
    artifacts.authority,
  );
}

test("canonicalization and digest policy placeholder is valid and unresolved", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    policyArtifactVersion: "wave-5.slice-4.grade-7-9-math.v1",
    policyVersion: "wave-5.slice-4.diagnostic-candidate-canonicalization-and-digest.placeholder.v1",
    policyState: "UNRESOLVED_DEFERRED",
    prerequisiteStatus: "UNSATISFIED_DEFERRED",
    decisionRequirementCount: 10,
    activeCanonicalizationRuleCount: 0,
    selectedDigestAlgorithmCount: 0,
    generatedHashCount: 0,
    digestValueCount: 0,
    approvedCandidateCount: 0,
    productionApprovalCount: 0,
    activationStatus: "BLOCKED",
    reviewWorkflowStatus: "INACTIVE",
    readiness: "NOT_READY",
  });
});

test("validator requires the exact ten unique unresolved requirements", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    artifacts.artifact.decisionRequirements.map(({ requirementId }) => requirementId),
    expectedDecisionRequirementIds,
  );

  const missing = clone(artifacts.artifact);
  missing.decisionRequirements.pop();
  assert.throws(() => validate(artifacts, missing), /must contain exactly 10 entries/);

  const unknown = clone(artifacts.artifact);
  unknown.decisionRequirements[0].requirementId = "unknown_requirement";
  assert.throws(() => validate(artifacts, unknown), /requirementId is unknown/);

  const duplicate = clone(artifacts.artifact);
  duplicate.decisionRequirements[9] = clone(duplicate.decisionRequirements[0]);
  assert.throws(() => validate(artifacts, duplicate), /requirementId is duplicated/);

  for (const state of ["DECIDED", "APPROVED", "ACTIVE"]) {
    const invalid = clone(artifacts.artifact);
    invalid.decisionRequirements[0].state = state;
    assert.throws(() => validate(artifacts, invalid), /state must equal/);
  }
});

test("canonicalization and digest prerequisite remains unchanged and unsatisfied", async () => {
  const artifacts = await readArtifacts();

  const satisfied = clone(artifacts.artifact);
  satisfied.prerequisiteReference.status = "SATISFIED";
  assert.throws(() => validate(artifacts, satisfied), /prerequisiteReference.status/);

  const evidence = clone(artifacts.artifact);
  evidence.prerequisiteReference.evidenceRecordRefs.push("future-evidence");
  assert.throws(() => validate(artifacts, evidence), /must contain exactly 0 values/);

  const upstream = clone(artifacts);
  const prerequisite = upstream.activationPrerequisites.prerequisites.find(
    ({ prerequisiteId }) => prerequisiteId === "canonicalization_and_digest_policy",
  );
  prerequisite.status = "SATISFIED";
  assert.throws(() => validate(upstream), /UNSATISFIED_DEFERRED|status must equal/);
});

test("all exact Slice 2 Slice 3 and Wave 4 dependency pins remain unchanged", async () => {
  const artifacts = await readArtifacts();

  for (const [field, value] of [
    ["activationPrerequisitesArtifactVersion", "wave-5.slice-2.changed"],
    ["candidateIdentityPolicyArtifactVersion", "wave-5.slice-3.changed"],
    ["candidateDigestRegistryArtifactVersion", "wave-4.slice-5.changed"],
    ["candidateCanonicalizationArtifactVersion", "wave-4.slice-6.changed"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.metadata[field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(`metadata\\.${field}`));
  }

  const registry = clone(artifacts.artifact);
  registry.dependencyReferences.candidateDigestRegistry.digestAlgorithmState = "APPROVED";
  assert.throws(() => validate(artifacts, registry), /digestAlgorithmState/);

  const canonicalization = clone(artifacts.artifact);
  canonicalization.dependencyReferences.candidateCanonicalization.activeRuleCount = 1;
  assert.throws(() => validate(artifacts, canonicalization), /activeRuleCount/);
});

test("digest algorithm and encoding remain unselected unapproved and inactive", async () => {
  const artifacts = await readArtifacts();
  for (const [objectName, field, value] of [
    ["digestAlgorithmDecisionPlaceholder", "algorithmDecisionReference", "decision.v1"],
    ["digestAlgorithmDecisionPlaceholder", "algorithmPolicyReference", "policy.v1"],
    ["digestAlgorithmDecisionPlaceholder", "algorithmId", "algorithm.v1"],
    ["digestAlgorithmDecisionPlaceholder", "algorithmApproved", true],
    ["digestAlgorithmDecisionPlaceholder", "algorithmActive", true],
    ["digestEncodingPlaceholder", "encodingDecisionReference", "decision.v1"],
    ["digestEncodingPlaceholder", "encodingPolicyReference", "policy.v1"],
    ["digestEncodingPlaceholder", "encodingId", "encoding.v1"],
    ["digestEncodingPlaceholder", "encodingApproved", true],
    ["digestEncodingPlaceholder", "encodingActive", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[objectName][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(`${objectName}\\.${field}`));
  }
});

test("canonicalization and normalization placeholders contain no active rules", async () => {
  const artifacts = await readArtifacts();
  for (const [objectName, field, value] of [
    ["canonicalizationRulesetPlaceholder", "rulesetVersion", "ruleset.v1"],
    ["canonicalizationRulesetPlaceholder", "rulesetApproved", true],
    ["canonicalizationRulesetPlaceholder", "rulesetActive", true],
    ["canonicalizationRulesetPlaceholder", "canonicalizationAllowed", true],
    ["localeLanguageNormalizationPlaceholder", "normalizationAllowed", true],
    ["mathNotationNormalizationPlaceholder", "normalizationAllowed", true],
    ["whitespacePunctuationNormalizationPlaceholder", "normalizationAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[objectName][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(`${objectName}\\.${field}`));
  }

  const rule = clone(artifacts.artifact);
  rule.canonicalizationRulesetPlaceholder.activeRuleReferences.push("rule.v1");
  assert.throws(() => validate(artifacts, rule), /activeRuleReferences/);
});

test("field serialization invalidation and reproducibility remain placeholders", async () => {
  const artifacts = await readArtifacts();
  for (const [objectName, field, value] of [
    ["candidateFieldInventoryPlaceholder", "inventoryVersion", "inventory.v1"],
    ["candidateFieldInventoryPlaceholder", "inventoryApproved", true],
    ["fieldInclusionExclusionPlaceholder", "policyApproved", true],
    ["deterministicSerializationPlaceholder", "serializationFormatId", "format.v1"],
    ["deterministicSerializationPlaceholder", "serializationAllowed", true],
    ["digestInvalidationRegenerationPlaceholder", "regenerationAllowed", true],
    ["digestInvalidationRegenerationPlaceholder", "invalidationAllowed", true],
    ["reproducibilityPlaceholder", "reproducibilityClaimAllowed", true],
    ["reproducibilityPlaceholder", "vectorGenerationAllowed", true],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[objectName][field] = value;
    assert.throws(() => validate(artifacts, invalid), new RegExp(`${objectName}\\.${field}`));
  }

  const field = clone(artifacts.artifact);
  field.candidateFieldInventoryPlaceholder.selectedFieldReferences.push("field.v1");
  assert.throws(() => validate(artifacts, field), /selectedFieldReferences/);

  const vector = clone(artifacts.artifact);
  vector.reproducibilityPlaceholder.testVectorReferences.push("vector.v1");
  assert.throws(() => validate(artifacts, vector), /testVectorReferences/);

  const trigger = clone(artifacts.artifact);
  trigger.digestInvalidationRegenerationPlaceholder.triggerDefinitions.push("trigger.v1");
  assert.throws(() => validate(artifacts, trigger), /triggerDefinitions/);
});

test("policy and activation enablement claims fail closed", async () => {
  const artifacts = await readArtifacts();

  for (const field of [
    "policyApprovalAllowed",
    "candidateProcessingAllowed",
    "canonicalizationAllowed",
    "digestGenerationAllowed",
    "productionApprovalAllowed",
  ]) {
    const enabled = clone(artifacts.artifact);
    enabled.policyIdentity[field] = true;
    assert.throws(() => validate(artifacts, enabled), new RegExp(`policyIdentity\\.${field}`));
  }

  for (const field of [
    "activationAllowed",
    "reviewWorkflowActivationAllowed",
    "readinessTransitionAllowed",
    "productionApprovalAllowed",
  ]) {
    const enabled = clone(artifacts.artifact);
    enabled.activationBoundary[field] = true;
    assert.throws(() => validate(artifacts, enabled), new RegExp(`activationBoundary\\.${field}`));
  }

  const activePolicy = clone(artifacts.artifact);
  activePolicy.policyIdentity.policyState = "ACTIVE";
  assert.throws(() => validate(artifacts, activePolicy), /policyIdentity\.policyState/);

  const activeWorkflow = clone(artifacts.artifact);
  activeWorkflow.activationBoundary.reviewWorkflowStatus = "ACTIVE";
  assert.throws(
    () => validate(artifacts, activeWorkflow),
    /activationBoundary\.reviewWorkflowStatus/,
  );
});

test("readiness remains blocked with the exact two reasons", async () => {
  const artifacts = await readArtifacts();

  const ready = clone(artifacts.artifact);
  ready.readiness.status = "READY";
  assert.throws(() => validate(artifacts, ready), /must remain NOT_READY/);

  for (const reasons of [
    ["INCOMPLETE_COVERAGE"],
    ["INCOMPLETE_COVERAGE", "NON_PRODUCTION_FIXTURES", "EXTRA"],
    ["INCOMPLETE_COVERAGE", "INCOMPLETE_COVERAGE"],
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.readiness.blockingReasons = reasons;
    assert.throws(() => validate(artifacts, invalid), /exactly the two approved blockers/);
  }
});

test("all policy candidate digest identity and approval records remain empty", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "selectedContentFieldRecords",
    "activeCanonicalizationRuleRecords",
    "selectedDigestAlgorithmRecords",
    "selectedDigestEncodingRecords",
    "reproducibilityVectorRecords",
    "transformedCandidateRecords",
    "candidateIdentityRecords",
    "candidateSubmissionRecords",
    "candidateApprovalRecords",
    "generatedHashRecords",
    "digestValueRecords",
    "policyDecisionRecords",
    "reviewEvidenceRecords",
    "reviewDecisionRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "ownerAssignmentRecords",
    "productionApprovalRecords",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid[field].push({ recordState: "REAL" });
    assert.throws(() => validate(artifacts, invalid), /must remain empty/, field);
  }

  const count = clone(artifacts.artifact);
  count.aggregate.generatedHashCount = 1;
  assert.throws(() => validate(artifacts, count), /generatedHashCount must equal 0/);

  const boundary = clone(artifacts.artifact);
  boundary.recordBoundary.digestValuesRecorded = true;
  assert.throws(() => validate(artifacts, boundary), /digestValuesRecorded/);
});

test("unknown fields forbidden terms PII hashes and candidate IDs fail closed", async () => {
  const artifacts = await readArtifacts();

  const unknown = clone(artifacts.artifact);
  unknown.unexpected = true;
  assert.throws(() => validate(artifacts, unknown), /unexpected field/);

  for (const term of forbiddenTerms) {
    const forbiddenField = clone(artifacts.artifact);
    forbiddenField.policyIdentity[term] = "blocked";
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

  const owner = clone(artifacts.artifact);
  owner.policyOwnerPlaceholder.ownerPlaceholderId = "person@example.invalid";
  assert.throws(() => validate(artifacts, owner), /email-like value/);

  const hashLike = clone(artifacts.artifact);
  hashLike.metadata.status = "0123456789abcdef0123456789abcdef";
  assert.throws(() => validate(artifacts, hashLike), /hash-like value/);

  const concreteId = clone(artifacts.artifact);
  concreteId.metadata.status = "dcandidate.math.g7-9.algebra.example.v1";
  assert.throws(() => validate(artifacts, concreteId), /concrete candidate ID/);
});

test("Slice 4 worktree guard permits only the exact 24 implementation paths", () => {
  assert.deepEqual(
    validateCandidateCanonicalizationDigestPolicyChangedPaths(approvedSlice4ChangedPaths),
    approvedSlice4ChangedPaths,
  );

  for (const forbiddenPath of [
    "README.md",
    "docs/wave-5/slice-11-implementation-note.md",
    "docs/wave-5/nested/diagnostic-canonicalization-digest-policy-contract.md",
    "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md.bak",
    "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/extra.v1.json",
    "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json.bak",
    "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "apps/api/package.json",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
  ]) {
    assert.throws(
      () => validateCandidateCanonicalizationDigestPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 4 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 4 guard admits only the exact five Slice 5 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md",
    "docs/wave-5/slice-5-implementation-note.md",
    "packages/curriculum/diagnostic-reviewer-role-ownership-policy/grade-7-9-math.reviewer-role-ownership-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
    "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  ];
  assert.deepEqual(
    validateCandidateCanonicalizationDigestPolicyChangedPaths(approvedPaths),
    approvedPaths,
  );

  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md.bak",
    "docs/wave-5/nested/slice-5-implementation-note.md",
    "packages/curriculum/diagnostic-reviewer-role-ownership-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateCandidateCanonicalizationDigestPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 4 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 4 guard admits only the exact five Slice 6 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md",
    "docs/wave-5/slice-6-implementation-note.md",
    "packages/curriculum/diagnostic-separation-of-duties-policy/grade-7-9-math.separation-of-duties-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
    "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  ];
  assert.deepEqual(
    validateCandidateCanonicalizationDigestPolicyChangedPaths(approvedPaths),
    approvedPaths,
  );

  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md.bak",
    "docs/wave-5/nested/slice-6-implementation-note.md",
    "packages/curriculum/diagnostic-separation-of-duties-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/authorization.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-separation-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateCandidateCanonicalizationDigestPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 4 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 4 guard admits only the exact five Slice 7 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md",
    "docs/wave-5/slice-7-implementation-note.md",
    "packages/curriculum/diagnostic-conflict-of-interest-policy/grade-7-9-math.conflict-of-interest-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
    "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
  ];
  assert.deepEqual(
    validateCandidateCanonicalizationDigestPolicyChangedPaths(approvedPaths),
    approvedPaths,
  );

  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md.bak",
    "docs/wave-5/nested/slice-7-implementation-note.md",
    "packages/curriculum/diagnostic-conflict-of-interest-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/conflict-of-interest.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-conflict-of-interest-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateCandidateCanonicalizationDigestPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 4 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 4 guard admits only the exact five Slice 8 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-audit-identity-policy-contract.md",
    "docs/wave-5/slice-8-implementation-note.md",
    "packages/curriculum/diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
    "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs",
  ];
  assert.deepEqual(
    validateCandidateCanonicalizationDigestPolicyChangedPaths(approvedPaths),
    approvedPaths,
  );

  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-audit-identity-policy-contract.md.bak",
    "docs/wave-5/nested/slice-8-implementation-note.md",
    "packages/curriculum/diagnostic-audit-identity-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/audit-identity.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-audit-identity-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateCandidateCanonicalizationDigestPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 4 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("Slice 4 guard admits only the exact five Slice 10 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-production-approval-authority-policy-contract.md",
    "docs/wave-5/slice-10-implementation-note.md",
    "packages/curriculum/diagnostic-production-approval-authority-policy/grade-7-9-math.production-approval-authority-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-production-approval-authority-policy.mjs",
    "packages/curriculum/test/diagnostic-production-approval-authority-policy.test.mjs",
  ];
  assert.deepEqual(
    validateCandidateCanonicalizationDigestPolicyChangedPaths(approvedPaths),
    approvedPaths,
  );
  for (const forbiddenPath of [
    "docs/wave-5/diagnostic-evidence-storage-retention-policy-contract.md.bak",
    "docs/wave-5/nested/slice-9-implementation-note.md",
    "packages/curriculum/diagnostic-evidence-storage-retention-policy/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-evidence-storage-retention-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-evidence-storage-retention-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/evidence-storage.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateCandidateCanonicalizationDigestPolicyChangedPaths([forbiddenPath]),
      /Wave 5 Slice 4 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("root test command registers the Slice 4 validator and focused test exactly once", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  const testCommand = packageJson.scripts?.test;
  assert.equal(typeof testCommand, "string");

  for (const exactRegistration of [
    "node packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
  ]) {
    assert.equal(
      testCommand.split(exactRegistration).length - 1,
      1,
      `${exactRegistration} must occur exactly once`,
    );
  }
});

test("Slice 4 validator contains no broad documentation curriculum or API allowlist", async () => {
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /["']apps\/api\/["']/);
});
