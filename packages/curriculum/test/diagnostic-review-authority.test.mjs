import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import { validateAuditIdentityPolicyChangedPaths } from "../scripts/validate-diagnostic-audit-identity-policy.mjs";
import {
  readDiagnosticCandidateCanonicalization,
  validateCandidateCanonicalizationChangedPaths,
} from "../scripts/validate-diagnostic-candidate-canonicalization.mjs";
import { validateCandidateCanonicalizationDigestPolicyChangedPaths } from "../scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs";
import {
  readDiagnosticCandidateDigestRegistry,
  validateCandidateDigestChangedPaths,
} from "../scripts/validate-diagnostic-candidate-digest.mjs";
import { validateCandidateIdentityPolicyChangedPaths } from "../scripts/validate-diagnostic-candidate-identity-policy.mjs";
import { validateCandidateIdentityDecisionProposalChangedPaths } from "../scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs";
import { validateCanonicalizationDigestDecisionProposalChangedPaths } from "../scripts/validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs";
import { validateCiValidationActivationGateChangedPaths } from "../scripts/validate-diagnostic-ci-validation-activation-gate.mjs";
import { validateConflictOfInterestPolicyChangedPaths } from "../scripts/validate-diagnostic-conflict-of-interest-policy.mjs";
import { validateCoverageGapClosurePlanChangedPaths } from "../scripts/validate-diagnostic-coverage-gap-closure-plan.mjs";
import { validateReadinessIntegrationPlanChangedPaths } from "../scripts/validate-diagnostic-readiness-integration-plan.mjs";
import { validateRollbackWithdrawalChangedPaths } from "../scripts/validate-diagnostic-rollback-withdrawal-policy.mjs";
import { validateEvidenceStorageRetentionPolicyChangedPaths } from "../scripts/validate-diagnostic-evidence-storage-retention-policy.mjs";
import { validateProductionApprovalAuthorityPolicyChangedPaths } from "../scripts/validate-diagnostic-production-approval-authority-policy.mjs";
import { validateReviewerRoleOwnershipPolicyChangedPaths } from "../scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs";
import { validateSeparationOfDutiesPolicyChangedPaths } from "../scripts/validate-diagnostic-separation-of-duties-policy.mjs";
import { validateActivationPrerequisitesChangedPaths } from "../scripts/validate-diagnostic-review-activation-prerequisites.mjs";
import {
  readDiagnosticReviewAuthority,
  validateDiagnosticReviewAuthority,
  validateReviewAuthorityChangedPaths,
} from "../scripts/validate-diagnostic-review-authority.mjs";
import {
  readDiagnosticReviewCoverage,
  validateReviewCoverageChangedPaths,
} from "../scripts/validate-diagnostic-review-coverage.mjs";
import {
  readDiagnosticReviewEvidence,
  validateReviewEvidenceChangedPaths,
} from "../scripts/validate-diagnostic-review-evidence.mjs";
import {
  readDiagnosticReviewGateRubric,
  validateReviewGateRubricChangedPaths,
} from "../scripts/validate-diagnostic-review-gate-rubric.mjs";
import {
  readDiagnosticReviewWorkflowState,
  validateReviewWorkflowStateChangedPaths,
} from "../scripts/validate-diagnostic-review-workflow-state.mjs";

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
  "userId",
  "accountId",
  "immutableDigest",
  "sha256",
  "contentHash",
  "canonicalizedContent",
  "normalizedStem",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readArtifacts() {
  const [authority, coverage, evidence, rubric, registry, canonicalization, workflow] =
    await Promise.all([
      readDiagnosticReviewAuthority(),
      readDiagnosticReviewCoverage(),
      readDiagnosticReviewEvidence(),
      readDiagnosticReviewGateRubric(),
      readDiagnosticCandidateDigestRegistry(),
      readDiagnosticCandidateCanonicalization(),
      readDiagnosticReviewWorkflowState(),
    ]);
  return { authority, coverage, evidence, rubric, registry, canonicalization, workflow };
}

function validate(artifacts, override = artifacts.authority) {
  return validateDiagnosticReviewAuthority(
    override,
    artifacts.coverage,
    artifacts.evidence,
    artifacts.rubric,
    artifacts.registry,
    artifacts.canonicalization,
    artifacts.workflow,
  );
}

test("review authority placeholder is valid and non-authorizing", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(validate(artifacts), {
    authorityArtifactVersion: "wave-4.slice-8.grade-7-9-math.v1",
    authorityPolicyId: "diagnostic-review-authority-separation-of-duties",
    authorityPolicyVersion: "wave-4.slice-8.diagnostic-review-authority.placeholder.v1",
    authorityPolicyState: "DEFERRED_NON_PRODUCTION",
    rolePlaceholderCount: 7,
    gateAuthorityPlaceholderCount: 6,
    separationOfDutiesRuleCount: 3,
    reviewerAssignmentCount: 0,
    reviewerIdentityCount: 0,
    auditIdentityCount: 0,
    approvedDecisionCount: 0,
    productionApprovalCount: 0,
    readiness: "NOT_READY",
  });
});

test("metadata pins every exact upstream artifact version", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "reviewCoverageArtifactVersion",
    "reviewEvidenceArtifactVersion",
    "reviewGateRubricArtifactVersion",
    "candidateDigestRegistryArtifactVersion",
    "candidateCanonicalizationArtifactVersion",
    "reviewWorkflowStateArtifactVersion",
  ]) {
    const invalid = clone(artifacts.authority);
    invalid.metadata[field] = "wave-4.invalid-artifact.v1";
    assert.throws(
      () => validate(artifacts, invalid),
      new RegExp(`metadata\\.${field} must be`),
      field,
    );
  }
});

test("authority policy remains deferred inactive and non-authorizing", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["policyState", "ACTIVE"],
    ["activationAllowed", true],
    ["runtimeAuthorityAllowed", true],
    ["reviewerAssignmentAllowed", true],
    ["reviewDecisionAuthorityAllowed", true],
    ["productionApprovalAuthorityAllowed", true],
  ];
  for (const [field, value] of mutations) {
    const invalid = clone(artifacts.authority);
    invalid.authorityPolicy[field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      /inactive non-authorizing Slice 8 placeholder/,
      field,
    );
  }
});

test("dependency references preserve all upstream zero-record boundaries", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["reviewCoverage", "productionApprovedSlotCount", 1],
    ["reviewEvidence", "approvedDecisionCount", 1],
    ["reviewGateRubric", "recordedDecisionCount", 1],
    ["candidateDigestRegistry", "digestValueCount", 1],
    ["candidateCanonicalization", "activeRuleCount", 1],
    ["reviewWorkflowState", "activeReviewCount", 1],
  ];
  for (const [dependency, field, value] of mutations) {
    const invalid = clone(artifacts.authority);
    invalid.dependencyReferences[dependency][field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      new RegExp(`dependencyReferences\\.${dependency}`),
      `${dependency}.${field}`,
    );
  }
});

test("role taxonomy contains exactly seven unique approved placeholders", async () => {
  const artifacts = await readArtifacts();

  const missing = clone(artifacts.authority);
  missing.roleTaxonomyPlaceholders.pop();
  assert.throws(() => validate(artifacts, missing), /exactly seven role placeholders/);

  const unknown = clone(artifacts.authority);
  unknown.roleTaxonomyPlaceholders[0].rolePlaceholderId = "REAL_REVIEWER";
  assert.throws(() => validate(artifacts, unknown), /unknown role placeholder/);

  const duplicate = clone(artifacts.authority);
  duplicate.roleTaxonomyPlaceholders[1].rolePlaceholderId =
    duplicate.roleTaxonomyPlaceholders[0].rolePlaceholderId;
  assert.throws(() => validate(artifacts, duplicate), /Duplicate role placeholder/);
});

test("role placeholders contain no identity assignment or authority", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["identityPolicyRef", "identity-policy.v1"],
    ["assignmentPolicyRef", "assignment-policy.v1"],
    ["reviewDecisionAuthorityAllowed", true],
    ["productionApprovalAuthorityAllowed", true],
  ];
  for (const [field, value] of mutations) {
    const invalid = clone(artifacts.authority);
    invalid.roleTaxonomyPlaceholders[0][field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      /non-authorizing role placeholder without identity data/,
      field,
    );
  }
});

test("gate authority placeholders cover the exact six rubric gates", async () => {
  const artifacts = await readArtifacts();

  const missing = clone(artifacts.authority);
  missing.gateAuthorityPlaceholders.pop();
  assert.throws(() => validate(artifacts, missing), /exactly six gate placeholders/);

  const unknown = clone(artifacts.authority);
  unknown.gateAuthorityPlaceholders[0].gateId = "unknown_gate";
  assert.throws(() => validate(artifacts, unknown), /unknown gate/);

  const mismatch = clone(artifacts.authority);
  mismatch.gateAuthorityPlaceholders[0].gatePolicyVersion = "wave-4.invalid-policy.v1";
  assert.throws(() => validate(artifacts, mismatch), /must match its Slice 4 gate/);
});

test("minimum reviewer counts and gate decision authority remain unresolved", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["minimumReviewerCount", 1],
    ["minimumReviewerCountState", "DECIDED"],
    ["authorityPolicyRef", "authority-policy.v1"],
    ["assignmentAllowed", true],
    ["reviewDecisionAuthorityAllowed", true],
    ["productionApprovalAllowed", true],
  ];
  for (const [field, value] of mutations) {
    const invalid = clone(artifacts.authority);
    invalid.gateAuthorityPlaceholders[0][field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      /deferred without reviewer counts or decision authority/,
      field,
    );
  }
});

test("separation-of-duties rules are exact placeholder requirements", async () => {
  const artifacts = await readArtifacts();

  const missing = clone(artifacts.authority);
  missing.separationOfDutiesRules.pop();
  assert.throws(() => validate(artifacts, missing), /exactly three placeholder rules/);

  const unknown = clone(artifacts.authority);
  unknown.separationOfDutiesRules[0].ruleId = "ALLOW_SELF_APPROVAL";
  assert.throws(() => validate(artifacts, unknown), /unknown separation rule/);

  const roleMismatch = clone(artifacts.authority);
  roleMismatch.separationOfDutiesRules[0].participantRolePlaceholderIds.pop();
  assert.throws(() => validate(artifacts, roleMismatch), /must contain exactly 6 values/);
});

test("separation-of-duties rules cannot authorize or enforce runtime approvals", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["ruleState", "ACTIVE"],
    ["enforcementPolicyRef", "enforcement-policy.v1"],
    ["runtimeEnforcementAllowed", true],
    ["decisionAuthorizationGranted", true],
  ];
  for (const [field, value] of mutations) {
    const invalid = clone(artifacts.authority);
    invalid.separationOfDutiesRules[0][field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      /non-authorizing and runtime-disabled/,
      field,
    );
  }
});

test("reviewer and audit identity policies remain deferred", async () => {
  const artifacts = await readArtifacts();
  for (const identityType of ["reviewerIdentity", "auditIdentity"]) {
    const invalid = clone(artifacts.authority);
    invalid.identityPolicyDeferrals[identityType].policyVersion = "identity-policy.v1";
    assert.throws(
      () => validate(artifacts, invalid),
      /must remain deferred without identity records/,
      identityType,
    );
  }
});

test("conflict-of-interest policy remains deferred and placeholder-only", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["policyVersion", "conflict-policy.v1"],
    ["evaluationRulesActive", true],
    ["conflictRecordsAllowed", true],
    ["runtimeAssignmentBlockingAllowed", true],
  ];
  for (const [field, value] of mutations) {
    const invalid = clone(artifacts.authority);
    invalid.conflictOfInterestPolicy[field] = value;
    assert.throws(() => validate(artifacts, invalid), /deferred and placeholder-only/, field);
  }
});

test("production approval authority remains deferred and non-authorizing", async () => {
  const artifacts = await readArtifacts();
  const mutations = [
    ["policyVersion", "production-authority.v1"],
    ["minimumApproverCount", 1],
    ["reviewDecisionAuthorityAllowed", true],
    ["productionApprovalAllowed", true],
  ];
  for (const [field, value] of mutations) {
    const invalid = clone(artifacts.authority);
    invalid.productionApprovalAuthority[field] = value;
    assert.throws(
      () => validate(artifacts, invalid),
      /must remain deferred and non-authorizing/,
      field,
    );
  }
});

test("assignment identity conflict decision and approval records remain empty", async () => {
  const artifacts = await readArtifacts();
  for (const field of [
    "reviewerAssignmentRecords",
    "reviewerIdentityRecords",
    "auditIdentityRecords",
    "conflictOfInterestRecords",
    "reviewDecisionRecords",
    "productionApprovalRecords",
  ]) {
    const invalid = clone(artifacts.authority);
    invalid[field].push({ recordId: "record-1" });
    assert.throws(
      () => validate(artifacts, invalid),
      new RegExp(`${field} must remain empty`),
      field,
    );
  }
});

test("record boundary and all authority activity aggregates remain zero", async () => {
  const artifacts = await readArtifacts();

  const boundary = clone(artifacts.authority);
  boundary.recordBoundary.reviewerAssignmentsRecorded = true;
  assert.throws(
    () => validate(artifacts, boundary),
    /reviewerAssignmentsRecorded must remain false/,
  );

  const aggregate = clone(artifacts.authority);
  aggregate.aggregate.approvedDecisionCount = 1;
  assert.throws(
    () => validate(artifacts, aggregate),
    /role, assignment, identity, decision and approval counts must remain zero/,
  );
});

test("hash-like values are rejected", async () => {
  const artifacts = await readArtifacts();
  const invalid = clone(artifacts.authority);
  invalid.dependencyReferences.reviewCoverage.artifactVersion = "a".repeat(64);
  assert.throws(() => validate(artifacts, invalid), /hash-like value/);
});

test("authority artifact rejects every forbidden field term", async () => {
  const artifacts = await readArtifacts();
  for (const forbiddenField of forbiddenFields) {
    const invalid = clone(artifacts.authority);
    invalid.roleTaxonomyPlaceholders[0][forbiddenField] = "blocked";
    assert.throws(() => validate(artifacts, invalid), /forbidden field term/, forbiddenField);
  }
});

test("readiness remains NOT_READY with both Wave 3 blockers", async () => {
  const artifacts = await readArtifacts();

  const ready = clone(artifacts.authority);
  ready.readiness.status = "READY";
  assert.throws(() => validate(artifacts, ready), /readiness.status must remain NOT_READY/);

  const missingBlocker = clone(artifacts.authority);
  missingBlocker.readiness.blockingReasons = ["INCOMPLETE_COVERAGE"];
  assert.throws(() => validate(artifacts, missingBlocker), /two current Wave 3 blockers/);
});

test("Slice 8 worktree scope permits only the twelve exact static paths", () => {
  const approvedPaths = [
    "docs/wave-4/diagnostic-review-authority-contract.md",
    "docs/wave-4/slice-8-implementation-note.md",
    "packages/curriculum/diagnostic-review-authority/grade-7-9-math.review-authority-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
    "packages/curriculum/scripts/validate-diagnostic-candidate-digest.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-authority.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-coverage.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
    "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
    "packages/curriculum/test/diagnostic-review-authority.test.mjs",
    "package.json",
  ];
  assert.deepEqual(validateReviewAuthorityChangedPaths(approvedPaths), approvedPaths);

  const forbiddenPaths = [
    "apps/api/src/diagnostic-review/authority.controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "pnpm-lock.yaml",
    "packages/curriculum/src/diagnostic-review-authority.ts",
  ];
  for (const forbiddenPath of forbiddenPaths) {
    assert.throws(
      () => validateReviewAuthorityChangedPaths([forbiddenPath]),
      /Wave 4 Slice 8 out-of-scope path changed/,
      forbiddenPath,
    );
  }
});

test("all Wave 4 scope guards retain the exact Wave 5 Slice 1 documentation admissions", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-review-activation-prerequisites-contract.md",
    "docs/wave-5/open-decisions.md",
    "docs/wave-5/scope-and-non-goals.md",
    "docs/wave-5/slice-1-implementation-note.md",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
  ];
  const unblockImplementationPaths = [
    "packages/curriculum/scripts/validate-skill-graph.mjs",
    "packages/curriculum/test/diagnostic-blueprint.test.mjs",
    "packages/curriculum/test/diagnostic-items.test.mjs",
    "packages/curriculum/test/diagnostic-response-evidence.test.mjs",
    "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
    "packages/curriculum/test/skill-graph-seed.test.mjs",
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
    assert.deepEqual(validateChangedPaths(unblockImplementationPaths), unblockImplementationPaths);
  }

  const forbiddenPaths = [
    "docs/wave-5/nested/scope-and-non-goals.md",
    "docs/wave-5/scope-and-non-goals.md.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all Wave 4 scope guards permit only the exact Wave 5 Slice 2 static files", () => {
  const approvedPaths = [
    "docs/wave-5/slice-2-implementation-note.md",
    "packages/curriculum/diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs",
    "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-5/nested/slice-2-implementation-note.md",
    "docs/wave-5/slice-2-implementation-note.md.bak",
    "packages/curriculum/diagnostic-review-activation-prerequisites/extra.v1.json",
    "packages/curriculum/diagnostic-review-activation-prerequisites/grade-7-9-math.review-activation-prerequisites.v1.json.bak",
    "packages/curriculum/scripts/validate-diagnostic-review-activation-prerequisites.mjs.bak",
    "packages/curriculum/test/diagnostic-review-activation-prerequisites.test.mjs.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards permit only the exact Wave 5 Slice 3 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-candidate-identity-policy-contract.md",
    "docs/wave-5/slice-3-implementation-note.md",
    "packages/curriculum/diagnostic-candidate-identity-policy/grade-7-9-math.candidate-identity-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs",
    "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-5/nested/diagnostic-candidate-identity-policy-contract.md",
    "docs/wave-5/diagnostic-candidate-identity-policy-contract.md.bak",
    "docs/wave-5/slice-3-implementation-note.md.bak",
    "packages/curriculum/diagnostic-candidate-identity-policy/extra.v1.json",
    "packages/curriculum/diagnostic-candidate-identity-policy/grade-7-9-math.candidate-identity-policy-placeholder.v1.json.bak",
    "packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-candidate-identity-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards permit only the exact Wave 5 Slice 4 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md",
    "docs/wave-5/slice-4-implementation-note.md",
    "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
    "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
    validateCandidateIdentityPolicyChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-5/nested/diagnostic-canonicalization-digest-policy-contract.md",
    "docs/wave-5/diagnostic-canonicalization-digest-policy-contract.md.bak",
    "docs/wave-5/slice-4-implementation-note.md.bak",
    "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/extra.v1.json",
    "packages/curriculum/diagnostic-candidate-canonicalization-digest-policy/grade-7-9-math.candidate-canonicalization-digest-policy-placeholder.v1.json.bak",
    "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-candidate-canonicalization-digest-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards permit only the exact Wave 5 Slice 5 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md",
    "docs/wave-5/slice-5-implementation-note.md",
    "packages/curriculum/diagnostic-reviewer-role-ownership-policy/grade-7-9-math.reviewer-role-ownership-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
    "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
    validateCandidateIdentityPolicyChangedPaths,
    validateCandidateCanonicalizationDigestPolicyChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-5/nested/diagnostic-reviewer-role-ownership-policy-contract.md",
    "docs/wave-5/diagnostic-reviewer-role-ownership-policy-contract.md.bak",
    "docs/wave-5/slice-5-implementation-note.md.bak",
    "packages/curriculum/diagnostic-reviewer-role-ownership-policy/extra.v1.json",
    "packages/curriculum/diagnostic-reviewer-role-ownership-policy/grade-7-9-math.reviewer-role-ownership-policy-placeholder.v1.json.bak",
    "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-review-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards permit only the exact Wave 5 Slice 6 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md",
    "docs/wave-5/slice-6-implementation-note.md",
    "packages/curriculum/diagnostic-separation-of-duties-policy/grade-7-9-math.separation-of-duties-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs",
    "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
    validateCandidateIdentityPolicyChangedPaths,
    validateCandidateCanonicalizationDigestPolicyChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-5/nested/diagnostic-separation-of-duties-policy-contract.md",
    "docs/wave-5/diagnostic-separation-of-duties-policy-contract.md.bak",
    "docs/wave-5/slice-6-implementation-note.md.bak",
    "packages/curriculum/diagnostic-separation-of-duties-policy/extra.v1.json",
    "packages/curriculum/diagnostic-separation-of-duties-policy/grade-7-9-math.separation-of-duties-policy-placeholder.v1.json.bak",
    "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-separation-of-duties-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/authorization.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-separation-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards permit only the exact Wave 5 Slice 7 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md",
    "docs/wave-5/slice-7-implementation-note.md",
    "packages/curriculum/diagnostic-conflict-of-interest-policy/grade-7-9-math.conflict-of-interest-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs",
    "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
    validateCandidateIdentityPolicyChangedPaths,
    validateCandidateCanonicalizationDigestPolicyChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-5/nested/diagnostic-conflict-of-interest-policy-contract.md",
    "docs/wave-5/diagnostic-conflict-of-interest-policy-contract.md.bak",
    "docs/wave-5/slice-7-implementation-note.md.bak",
    "packages/curriculum/diagnostic-conflict-of-interest-policy/extra.v1.json",
    "packages/curriculum/diagnostic-conflict-of-interest-policy/grade-7-9-math.conflict-of-interest-policy-placeholder.v1.json.bak",
    "packages/curriculum/scripts/validate-diagnostic-conflict-of-interest-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-conflict-of-interest-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/conflict-of-interest.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-conflict-of-interest-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards permit only the exact Wave 5 Slice 8 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-audit-identity-policy-contract.md",
    "docs/wave-5/slice-8-implementation-note.md",
    "packages/curriculum/diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
    "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
    validateCandidateIdentityPolicyChangedPaths,
    validateCandidateCanonicalizationDigestPolicyChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-5/nested/diagnostic-audit-identity-policy-contract.md",
    "docs/wave-5/diagnostic-audit-identity-policy-contract.md.bak",
    "docs/wave-5/slice-8-implementation-note.md.bak",
    "packages/curriculum/diagnostic-audit-identity-policy/extra.v1.json",
    "packages/curriculum/diagnostic-audit-identity-policy/grade-7-9-math.audit-identity-policy-placeholder.v1.json.bak",
    "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-audit-identity-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/audit-identity.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-audit-identity-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards permit only the exact Wave 5 Slice 12 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-readiness-integration-plan-contract.md",
    "docs/wave-5/slice-12-implementation-note.md",
    "packages/curriculum/diagnostic-readiness-integration-plan/grade-7-9-math.readiness-integration-plan-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs",
    "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
    validateCandidateIdentityPolicyChangedPaths,
    validateCandidateCanonicalizationDigestPolicyChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-5/nested/diagnostic-readiness-integration-plan-contract.md",
    "docs/wave-5/diagnostic-readiness-integration-plan-contract.md.bak",
    "docs/wave-5/slice-12-implementation-note.md.bak",
    "packages/curriculum/diagnostic-readiness-integration-plan/extra.v1.json",
    "packages/curriculum/diagnostic-readiness-integration-plan/grade-7-9-math.readiness-integration-plan-placeholder.v1.json.bak",
    "packages/curriculum/scripts/validate-diagnostic-readiness-integration-plan.mjs.bak",
    "packages/curriculum/test/diagnostic-readiness-integration-plan.test.mjs.bak",
    "apps/api/src/diagnostic-readiness-policy/integration.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-readiness-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards permit only the exact Wave 5 Slice 13 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md",
    "docs/wave-5/slice-13-implementation-note.md",
    "packages/curriculum/diagnostic-rollback-withdrawal-policy/grade-7-9-math.rollback-withdrawal-policy-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs",
    "packages/curriculum/test/diagnostic-rollback-withdrawal-policy.test.mjs",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
    validateCandidateIdentityPolicyChangedPaths,
    validateCandidateCanonicalizationDigestPolicyChangedPaths,
    validateReviewerRoleOwnershipPolicyChangedPaths,
    validateSeparationOfDutiesPolicyChangedPaths,
    validateConflictOfInterestPolicyChangedPaths,
    validateAuditIdentityPolicyChangedPaths,
    validateEvidenceStorageRetentionPolicyChangedPaths,
    validateProductionApprovalAuthorityPolicyChangedPaths,
    validateCoverageGapClosurePlanChangedPaths,
    validateReadinessIntegrationPlanChangedPaths,
    validateRollbackWithdrawalChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-5/nested/diagnostic-rollback-withdrawal-policy-contract.md",
    "docs/wave-5/diagnostic-rollback-withdrawal-policy-contract.md.bak",
    "docs/wave-5/slice-13-implementation-note.md.bak",
    "packages/curriculum/diagnostic-rollback-withdrawal-policy/extra.v1.json",
    "packages/curriculum/diagnostic-rollback-withdrawal-policy/grade-7-9-math.rollback-withdrawal-policy-placeholder.v1.json.bak",
    "packages/curriculum/scripts/validate-diagnostic-rollback-withdrawal-policy.mjs.bak",
    "packages/curriculum/test/diagnostic-rollback-withdrawal-policy.test.mjs.bak",
    "apps/api/src/diagnostic-review/rollback.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-rollback-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards permit only the exact Wave 5 Slice 14 static files", () => {
  const approvedPaths = [
    "docs/wave-5/diagnostic-ci-validation-activation-gate-contract.md",
    "docs/wave-5/slice-14-implementation-note.md",
    "packages/curriculum/diagnostic-ci-validation-activation-gate/grade-7-9-math.ci-validation-activation-gate-placeholder.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs",
    "packages/curriculum/test/diagnostic-ci-validation-activation-gate.test.mjs",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
    validateCandidateIdentityPolicyChangedPaths,
    validateCandidateCanonicalizationDigestPolicyChangedPaths,
    validateReviewerRoleOwnershipPolicyChangedPaths,
    validateSeparationOfDutiesPolicyChangedPaths,
    validateConflictOfInterestPolicyChangedPaths,
    validateAuditIdentityPolicyChangedPaths,
    validateEvidenceStorageRetentionPolicyChangedPaths,
    validateProductionApprovalAuthorityPolicyChangedPaths,
    validateCoverageGapClosurePlanChangedPaths,
    validateReadinessIntegrationPlanChangedPaths,
    validateRollbackWithdrawalChangedPaths,
    validateCiValidationActivationGateChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    ".github/workflows/ci.yml",
    "docs/wave-5/nested/diagnostic-ci-validation-activation-gate-contract.md",
    "docs/wave-5/diagnostic-ci-validation-activation-gate-contract.md.bak",
    "docs/wave-5/slice-14-implementation-note.md.bak",
    "packages/curriculum/diagnostic-ci-validation-activation-gate/extra.v1.json",
    "packages/curriculum/scripts/validate-diagnostic-ci-validation-activation-gate.mjs.bak",
    "packages/curriculum/test/diagnostic-ci-validation-activation-gate.test.mjs.bak",
    "apps/api/src/diagnostic-review/ci-validation.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-ci-validation-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards permit only the exact Wave 5 closure document", () => {
  const approvedPaths = ["docs/wave-5/closure-gate.md"];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
    validateCandidateIdentityPolicyChangedPaths,
    validateCandidateCanonicalizationDigestPolicyChangedPaths,
    validateReviewerRoleOwnershipPolicyChangedPaths,
    validateSeparationOfDutiesPolicyChangedPaths,
    validateConflictOfInterestPolicyChangedPaths,
    validateAuditIdentityPolicyChangedPaths,
    validateEvidenceStorageRetentionPolicyChangedPaths,
    validateProductionApprovalAuthorityPolicyChangedPaths,
    validateCoverageGapClosurePlanChangedPaths,
    validateReadinessIntegrationPlanChangedPaths,
    validateRollbackWithdrawalChangedPaths,
    validateCiValidationActivationGateChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-5/archive/closure-gate.md",
    "docs/wave-5/closure-gate.md.bak",
    "docs/wave-5/slice-15-implementation-note.md",
    "apps/api/src/diagnostic-review/closure.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/review/page.tsx",
    "packages/curriculum/src/diagnostic-closure-runtime.ts",
    "pnpm-lock.yaml",
  ];

  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards retain the exact Wave 6 Slice 1 worktree admission", () => {
  const approvedPaths = [
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
    "packages/curriculum/test/diagnostic-session-lifecycle.test.mjs",
    "packages/curriculum/test/skill-graph-seed.test.mjs",
  ];
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
    validateCandidateIdentityPolicyChangedPaths,
    validateCandidateCanonicalizationDigestPolicyChangedPaths,
    validateReviewerRoleOwnershipPolicyChangedPaths,
    validateSeparationOfDutiesPolicyChangedPaths,
    validateConflictOfInterestPolicyChangedPaths,
    validateAuditIdentityPolicyChangedPaths,
    validateEvidenceStorageRetentionPolicyChangedPaths,
    validateProductionApprovalAuthorityPolicyChangedPaths,
    validateCoverageGapClosurePlanChangedPaths,
    validateReadinessIntegrationPlanChangedPaths,
    validateRollbackWithdrawalChangedPaths,
    validateCiValidationActivationGateChangedPaths,
    validateCandidateIdentityDecisionProposalChangedPaths,
  ];

  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-6/archive/scope-and-non-goals.md",
    "docs/wave-6/slice-3-implementation-note.md",
    "docs/wave-6/scope-and-non-goals.md.bak",
    "apps/api/src/diagnostic-candidate-identity/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/candidates/page.tsx",
    "packages/curriculum/src/diagnostic-candidate-identity-runtime.ts",
    "pnpm-lock.yaml",
  ];
  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("all governance scope guards permit only the exact Wave 6 Slice 2 worktree", () => {
  const approvedPaths = [
    "docs/wave-6/diagnostic-canonicalization-digest-policy-decision-proposal.md",
    "docs/wave-6/open-decisions.md",
    "docs/wave-6/slice-2-implementation-note.md",
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
  assert.equal(approvedPaths.length, 36);
  const validators = [
    validateReviewCoverageChangedPaths,
    validateReviewEvidenceChangedPaths,
    validateReviewGateRubricChangedPaths,
    validateCandidateDigestChangedPaths,
    validateCandidateCanonicalizationChangedPaths,
    validateReviewWorkflowStateChangedPaths,
    validateReviewAuthorityChangedPaths,
    validateActivationPrerequisitesChangedPaths,
    validateCandidateIdentityPolicyChangedPaths,
    validateCandidateCanonicalizationDigestPolicyChangedPaths,
    validateReviewerRoleOwnershipPolicyChangedPaths,
    validateSeparationOfDutiesPolicyChangedPaths,
    validateConflictOfInterestPolicyChangedPaths,
    validateAuditIdentityPolicyChangedPaths,
    validateEvidenceStorageRetentionPolicyChangedPaths,
    validateProductionApprovalAuthorityPolicyChangedPaths,
    validateCoverageGapClosurePlanChangedPaths,
    validateReadinessIntegrationPlanChangedPaths,
    validateRollbackWithdrawalChangedPaths,
    validateCiValidationActivationGateChangedPaths,
    validateCandidateIdentityDecisionProposalChangedPaths,
    validateCanonicalizationDigestDecisionProposalChangedPaths,
  ];
  for (const validateChangedPaths of validators) {
    assert.deepEqual(validateChangedPaths(approvedPaths), approvedPaths);
  }

  const forbiddenPaths = [
    "docs/wave-6/archive/diagnostic-canonicalization-digest-policy-decision-proposal.md",
    "docs/wave-6/slice-3-implementation-note.md",
    "docs/wave-6/slice-2-implementation-note.md.bak",
    "packages/curriculum/diagnostic-canonicalization-digest-policy-decision-proposal/extra.json",
    "apps/api/src/diagnostic-canonicalization/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/canonicalization/page.tsx",
    "packages/curriculum/src/diagnostic-digest-runtime.ts",
    "pnpm-lock.yaml",
  ];
  for (const validateChangedPaths of validators) {
    for (const forbiddenPath of forbiddenPaths) {
      assert.throws(
        () => validateChangedPaths([forbiddenPath]),
        /out-of-scope path changed/,
        forbiddenPath,
      );
    }
  }
});

test("scope unblocks through Wave 6 Slice 2 contain no broad documentation prefix", async () => {
  const validatorFiles = [
    "validate-skill-graph.mjs",
    "validate-diagnostic-review-coverage.mjs",
    "validate-diagnostic-review-evidence.mjs",
    "validate-diagnostic-review-gate-rubric.mjs",
    "validate-diagnostic-candidate-digest.mjs",
    "validate-diagnostic-candidate-canonicalization.mjs",
    "validate-diagnostic-review-workflow-state.mjs",
    "validate-diagnostic-review-authority.mjs",
    "validate-diagnostic-review-activation-prerequisites.mjs",
    "validate-diagnostic-candidate-identity-policy.mjs",
    "validate-diagnostic-candidate-identity-policy-decision-proposal.mjs",
    "validate-diagnostic-canonicalization-digest-policy-decision-proposal.mjs",
    "validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
    "validate-diagnostic-reviewer-role-ownership-policy.mjs",
    "validate-diagnostic-separation-of-duties-policy.mjs",
    "validate-diagnostic-conflict-of-interest-policy.mjs",
    "validate-diagnostic-audit-identity-policy.mjs",
    "validate-diagnostic-evidence-storage-retention-policy.mjs",
    "validate-diagnostic-production-approval-authority-policy.mjs",
    "validate-diagnostic-coverage-gap-closure-plan.mjs",
    "validate-diagnostic-readiness-integration-plan.mjs",
    "validate-diagnostic-rollback-withdrawal-policy.mjs",
    "validate-diagnostic-ci-validation-activation-gate.mjs",
  ];
  const sources = await Promise.all(
    validatorFiles.map((fileName) =>
      readFile(new URL(`../scripts/${fileName}`, import.meta.url), "utf8"),
    ),
  );

  for (const source of sources) {
    assert.doesNotMatch(source, /["']docs\/wave-5\/["']/);
    assert.doesNotMatch(source, /["']docs\/wave-6\/["']/);
  }
});

test("review scope guards contain no broad API allowlist", async () => {
  const sources = await Promise.all([
    readFile(
      new URL("../scripts/validate-diagnostic-review-authority.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-review-workflow-state.mjs", import.meta.url),
      "utf8",
    ),
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
      new URL("../scripts/validate-diagnostic-candidate-identity-policy.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../scripts/validate-diagnostic-review-activation-prerequisites.mjs",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-separation-of-duties-policy.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-conflict-of-interest-policy.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../scripts/validate-diagnostic-audit-identity-policy.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../scripts/validate-diagnostic-evidence-storage-retention-policy.mjs",
        import.meta.url,
      ),
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
