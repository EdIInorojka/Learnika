import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  readDiagnosticReviewerRoleOwnershipDecisionProposal,
  readDiagnosticReviewerRoleOwnershipDecisionProposalUpstream,
  collectReviewerRoleOwnershipDecisionProposalChangedPaths,
  validateDiagnosticReviewerRoleOwnershipDecisionProposal,
  validateReviewerRoleOwnershipDecisionProposalChangedPaths,
  validateReviewerRoleOwnershipDecisionProposalSlice4ChangedPaths,
  validateReviewerRoleOwnershipDecisionProposalWorktreeScope,
} from "../scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs";

const expectedMarkers = {
  SYNTHETIC_EXAMPLE_ONLY: true,
  NOT_A_REAL_ROLE_OWNER: true,
  NOT_ASSIGNED: true,
  NOT_AUTHORIZED: true,
  NOT_ACTIVE: true,
  NOT_USABLE_FOR_REVIEW: true,
  NOT_USABLE_FOR_PRODUCTION: true,
};
const approvedWave6Slice3ChangedPaths = [
  "docs/wave-6/diagnostic-reviewer-role-ownership-policy-decision-proposal.md",
  "docs/wave-6/open-decisions.md",
  "docs/wave-6/slice-3-implementation-note.md",
  "package.json",
  "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-audit-identity-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization.mjs",
  "packages/curriculum/scripts/validate-diagnostic-candidate-canonicalization-digest-policy.mjs",
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
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy.mjs",
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-evidence.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-gate-rubric.mjs",
  "packages/curriculum/scripts/validate-diagnostic-review-workflow-state.mjs",
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
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
];
const approvedWave6Slice3FollowUpPaths = [
  "packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
];
const slice3PrimaryOnlyPaths = new Set([
  "docs/wave-6/diagnostic-reviewer-role-ownership-policy-decision-proposal.md",
  "docs/wave-6/slice-3-implementation-note.md",
  "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/grade-7-9-math.reviewer-role-ownership-policy-decision-proposal.v1.json",
]);
const approvedWave6Slice4ChangedPaths = [
  ...approvedWave6Slice3ChangedPaths.filter((path) => !slice3PrimaryOnlyPaths.has(path)),
  "docs/wave-6/diagnostic-separation-of-duties-policy-decision-proposal.md",
  "docs/wave-6/slice-4-implementation-note.md",
  "packages/curriculum/diagnostic-separation-of-duties-policy-decision-proposal/grade-7-9-math.separation-of-duties-policy-decision-proposal.v1.json",
  "packages/curriculum/scripts/validate-diagnostic-separation-of-duties-policy-decision-proposal.mjs",
  "packages/curriculum/test/diagnostic-separation-of-duties-policy-decision-proposal.test.mjs",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nameStatusOutput(paths, status = "M") {
  return paths.map((path) => `${status}\0${path}\0`).join("");
}

async function readArtifacts() {
  return {
    artifact: await readDiagnosticReviewerRoleOwnershipDecisionProposal(),
    upstream: await readDiagnosticReviewerRoleOwnershipDecisionProposalUpstream(),
  };
}

test("proposal remains deferred and non-production", async () => {
  const artifacts = await readArtifacts();
  assert.deepEqual(
    validateDiagnosticReviewerRoleOwnershipDecisionProposal(artifacts.artifact, artifacts.upstream),
    {
      proposalArtifactVersion: "wave-6.slice-3.grade-7-9-math.v1",
      proposalVersion: "wave-6.slice-3.diagnostic-reviewer-role-ownership-policy.proposal.v1",
      proposalStatus: "PROPOSED_DEFERRED",
      prerequisiteStatus: "UNSATISFIED_DEFERRED",
      syntheticExampleCount: 8,
      acceptedSyntheticExampleCount: 4,
      rejectedSyntheticExampleCount: 4,
      unresolvedDecisionCount: 8,
      roleTaxonomyPlaceholderCount: 7,
      ownerAssignmentCount: 0,
      reviewerAssignmentCount: 0,
      productionApprovalCount: 0,
      activationStatus: "BLOCKED",
      workflowStatus: "INACTIVE",
      readiness: "NOT_READY",
    },
  );
});

test("upstream pins, role taxonomy and eight decisions are exact", async () => {
  const artifacts = await readArtifacts();
  assert.equal(artifacts.artifact.roleTaxonomyPlaceholders.length, 7);
  assert.deepEqual(
    artifacts.artifact.unresolvedDecisions.map(({ decisionId }) => decisionId),
    [
      "accountable_role_ownership",
      "role_eligibility_competence_and_independence",
      "appointment_and_assignment_authority",
      "scope_minimum_counts_quorum_and_decision_aggregation",
      "reviewer_lifecycle_expiry_suspension_and_reassignment",
      "delegation_revocation_and_emergency_coverage",
      "policy_maintenance_and_access_review_ownership",
      "reviewer_and_audit_identity_separation",
    ],
  );
  for (const mutate of [
    (artifact) => (artifact.metadata.reviewAuthorityArtifactVersion = "stale"),
    (artifact) =>
      (artifact.upstreamReferences.canonicalizationDigestDecisionProposal.proposalStatus =
        "APPROVED"),
    (artifact) => artifact.roleTaxonomyPlaceholders.pop(),
    (artifact) => (artifact.unresolvedDecisions[0].state = "APPROVED"),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() =>
      validateDiagnosticReviewerRoleOwnershipDecisionProposal(invalid, artifacts.upstream),
    );
  }
});

test("baseline, proposal boundary and zero operational records are fail-closed", async () => {
  const artifacts = await readArtifacts();
  for (const mutate of [
    (artifact) => (artifact.currentBaseline.readiness.status = "READY"),
    (artifact) => (artifact.currentBaseline.activation.status = "ACTIVE"),
    (artifact) => (artifact.currentBaseline.reviewerRoleOwnershipPrerequisite.status = "SATISFIED"),
    (artifact) => (artifact.proposalBoundary.policyApproved = true),
    (artifact) => (artifact.aggregate.roleOwnerCount = 1),
    (artifact) => artifact.roleOwnerRecords.push({ synthetic: true }),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() =>
      validateDiagnosticReviewerRoleOwnershipDecisionProposal(invalid, artifacts.upstream),
    );
  }
});

test("synthetic markers and rejected vectors are complete", async () => {
  const artifacts = await readArtifacts();
  const vectors = artifacts.artifact.syntheticExamples;
  assert.equal(
    vectors.filter(({ vectorType }) => vectorType === "PROPOSED_ACCEPTED_SYMBOLIC_VECTOR").length,
    4,
  );
  assert.equal(
    vectors.filter(({ vectorType }) => vectorType === "EXPLICITLY_REJECTED_SYMBOLIC_VECTOR").length,
    4,
  );
  for (const vector of vectors) assert.deepEqual(vector.markers, expectedMarkers);
  for (const mutate of [
    (artifact) => delete artifact.syntheticExamples[0].markers.NOT_ACTIVE,
    (artifact) => (artifact.syntheticExamples[4].rejectionReasonCode = ""),
    (artifact) => (artifact.syntheticExamples[0].abstractInputTokens[0] = "REAL_ROLE"),
  ]) {
    const invalid = clone(artifacts.artifact);
    mutate(invalid);
    assert.throws(() =>
      validateDiagnosticReviewerRoleOwnershipDecisionProposal(invalid, artifacts.upstream),
    );
  }
});

test("role-placeholder literals are allowed only in their exact taxonomy fields", async () => {
  const artifacts = await readArtifacts();
  const outsideTaxonomy = clone(artifacts.artifact);
  outsideTaxonomy.syntheticExamples[0].vectorRef = "METHODOLOGY_REVIEWER_PLACEHOLDER";
  assert.throws(
    () =>
      validateDiagnosticReviewerRoleOwnershipDecisionProposal(outsideTaxonomy, artifacts.upstream),
    /outside its intended taxonomy field/,
  );

  const wrongTaxonomyPosition = clone(artifacts.artifact);
  wrongTaxonomyPosition.roleTaxonomyPlaceholders[0].rolePlaceholderId =
    "SAFETY_REVIEWER_PLACEHOLDER";
  assert.throws(
    () =>
      validateDiagnosticReviewerRoleOwnershipDecisionProposal(
        wrongTaxonomyPosition,
        artifacts.upstream,
      ),
    /outside its intended taxonomy field/,
  );

  const nearMiss = clone(artifacts.artifact);
  nearMiss.roleTaxonomyPlaceholders[0].rolePlaceholderId = "METHODOLOGY_REVIEWER_PLACEHOLDER_EXTRA";
  assert.throws(
    () => validateDiagnosticReviewerRoleOwnershipDecisionProposal(nearMiss, artifacts.upstream),
    /exact static role-placeholder literal/,
  );
});

test("forbidden, identity-like and hash-like values fail closed", async () => {
  const artifacts = await readArtifacts();
  for (const value of [
    "person@example.invalid",
    "https://example.invalid/path",
    "00000000-0000-0000-0000-000000000000",
    "reviewer:abc",
    "reviewer_identity_abc",
    "audit-id-abc",
    "account_123",
    "+7 (912) 345-67-89",
    "0123456789abcdef0123456789abcdef",
    "dcandidate.math.g7-9.algebra.example.v1",
    "finalAnswer",
  ]) {
    const invalid = clone(artifacts.artifact);
    invalid.syntheticExamples[0].vectorRef = value;
    assert.throws(
      () => validateDiagnosticReviewerRoleOwnershipDecisionProposal(invalid, artifacts.upstream),
      undefined,
      value,
    );
  }
});

test("scope guard admits only the exact cumulative Slice 3 worktree", () => {
  assert.equal(approvedWave6Slice3ChangedPaths.length, 38);
  assert.deepEqual(
    validateReviewerRoleOwnershipDecisionProposalChangedPaths(approvedWave6Slice3ChangedPaths),
    approvedWave6Slice3ChangedPaths,
  );
  assert.throws(
    () =>
      validateReviewerRoleOwnershipDecisionProposalChangedPaths(
        approvedWave6Slice3ChangedPaths.slice(0, -1),
      ),
    /requires exactly 38 changed paths/,
  );
  assert.throws(
    () =>
      validateReviewerRoleOwnershipDecisionProposalChangedPaths([
        ...approvedWave6Slice3ChangedPaths,
        approvedWave6Slice3ChangedPaths[0],
      ]),
    /must not contain duplicates/,
  );
  for (const forbiddenPath of [
    "docs/wave-6/archive/diagnostic-reviewer-role-ownership-policy-decision-proposal.md",
    "docs/wave-6/slice-3-implementation-note.md.bak",
    "packages/curriculum/diagnostic-reviewer-role-ownership-policy-decision-proposal/extra.json",
    "apps/api/src/diagnostic-reviewer/controller.ts",
    "packages/contracts/openapi.json",
    "apps/api/prisma/schema.prisma",
    "apps/web/app/diagnostic/reviewer/page.tsx",
    "packages/curriculum/src/diagnostic-reviewer-runtime.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.throws(
      () => validateReviewerRoleOwnershipDecisionProposalChangedPaths([forbiddenPath]),
      /Wave 6 Slice 3 out-of-scope path changed/,
    );
  }
});

test("Slice 3 guard admits the exact cumulative Slice 4 continuation separately", () => {
  assert.equal(approvedWave6Slice4ChangedPaths.length, 40);
  assert.deepEqual(
    validateReviewerRoleOwnershipDecisionProposalSlice4ChangedPaths(
      approvedWave6Slice4ChangedPaths,
    ),
    approvedWave6Slice4ChangedPaths,
  );
  assert.deepEqual(
    validateReviewerRoleOwnershipDecisionProposalWorktreeScope(approvedWave6Slice4ChangedPaths, {
      env: {},
    }),
    approvedWave6Slice4ChangedPaths,
  );
  assert.throws(
    () =>
      validateReviewerRoleOwnershipDecisionProposalSlice4ChangedPaths(
        approvedWave6Slice4ChangedPaths.slice(1),
      ),
    /requires exactly 40 changed paths/,
  );
});

test("changed-path collection uses local dirty-worktree status outside GitHub Actions", () => {
  const calls = [];
  const paths = collectReviewerRoleOwnershipDecisionProposalChangedPaths({
    cwd: "fixture-repo",
    env: {},
    runGit: (args, cwd) => {
      calls.push({ args, cwd });
      return {
        status: 0,
        stdout:
          " M packages/curriculum/scripts/validate-skill-graph.mjs\n?? docs/wave-6/open-decisions.md\n",
        stderr: "",
      };
    },
  });
  assert.deepEqual(paths, [
    "packages/curriculum/scripts/validate-skill-graph.mjs",
    "docs/wave-6/open-decisions.md",
  ]);
  assert.deepEqual(calls, [
    { args: ["status", "--short", "--untracked-files=all"], cwd: "fixture-repo" },
  ]);
});

test("clean local checkout passes worktree scope without inventing changed paths", () => {
  const paths = collectReviewerRoleOwnershipDecisionProposalChangedPaths({
    cwd: "fixture-repo",
    env: {},
    runGit: () => ({ status: 0, stdout: "", stderr: "" }),
  });
  assert.deepEqual(paths, []);
  assert.deepEqual(
    validateReviewerRoleOwnershipDecisionProposalWorktreeScope(paths, { env: {} }),
    [],
  );
});

test("local dirty worktree admits only narrow Slice 3 remediation paths", () => {
  const expected = approvedWave6Slice3FollowUpPaths.slice(0, 2);
  const paths = collectReviewerRoleOwnershipDecisionProposalChangedPaths({
    cwd: "fixture-repo",
    env: {},
    runGit: () => ({
      status: 0,
      stdout: expected.map((path) => ` M ${path}\n`).join(""),
      stderr: "",
    }),
  });
  assert.deepEqual(paths, expected);
  assert.deepEqual(
    validateReviewerRoleOwnershipDecisionProposalWorktreeScope(paths, { env: {} }),
    expected,
  );
});

test("local dirty worktree rejects an out-of-scope path", () => {
  assert.throws(
    () =>
      validateReviewerRoleOwnershipDecisionProposalWorktreeScope(
        [approvedWave6Slice3FollowUpPaths[0], "apps/api/src/diagnostic-reviewer/controller.ts"],
        { env: {} },
      ),
    /local remediation out-of-scope path changed/,
  );
});

test("changed-path collection uses the clean GitHub push event range", () => {
  const base = "a".repeat(40);
  const head = "b".repeat(40);
  const calls = [];
  const paths = collectReviewerRoleOwnershipDecisionProposalChangedPaths({
    cwd: "fixture-repo",
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_NAME: "push",
      GITHUB_EVENT_PATH: "event.json",
      GITHUB_SHA: head,
    },
    readEvent: () => ({ before: base, after: head }),
    runGit: (args, cwd) => {
      calls.push({ args, cwd });
      if (args[0] === "diff") {
        return {
          status: 0,
          stdout: nameStatusOutput(approvedWave6Slice3ChangedPaths),
          stderr: "",
        };
      }
      return { status: 0, stdout: "", stderr: "" };
    },
  });
  assert.deepEqual(paths, approvedWave6Slice3ChangedPaths);
  assert.deepEqual(calls, [
    { args: ["cat-file", "-e", `${base}^{commit}`], cwd: "fixture-repo" },
    { args: ["cat-file", "-e", `${head}^{commit}`], cwd: "fixture-repo" },
    {
      args: ["diff", "--name-status", "--find-renames", "--no-ext-diff", "-z", base, head],
      cwd: "fixture-repo",
    },
  ]);
});

test("missing CI commit is fetched by exact SHA before range calculation", () => {
  const base = "1".repeat(40);
  const head = "2".repeat(40);
  const calls = [];
  let baseFetched = false;
  const paths = collectReviewerRoleOwnershipDecisionProposalChangedPaths({
    cwd: "fixture-repo",
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_NAME: "push",
      GITHUB_EVENT_PATH: "event.json",
      GITHUB_SHA: head,
    },
    readEvent: () => ({ before: base, after: head }),
    runGit: (args, cwd) => {
      calls.push({ args, cwd });
      if (args[0] === "cat-file") {
        if (args[2] === `${base}^{commit}` && !baseFetched)
          return { status: 1, stdout: "", stderr: "missing object" };
        return { status: 0, stdout: "", stderr: "" };
      }
      if (args[0] === "fetch") {
        baseFetched = true;
        return { status: 0, stdout: "", stderr: "" };
      }
      return {
        status: 0,
        stdout: nameStatusOutput(approvedWave6Slice3ChangedPaths, "A"),
        stderr: "",
      };
    },
  });
  assert.deepEqual(paths, approvedWave6Slice3ChangedPaths);
  assert.deepEqual(calls, [
    { args: ["cat-file", "-e", `${base}^{commit}`], cwd: "fixture-repo" },
    { args: ["fetch", "--no-tags", "--depth=1", "origin", base], cwd: "fixture-repo" },
    { args: ["cat-file", "-e", `${base}^{commit}`], cwd: "fixture-repo" },
    { args: ["cat-file", "-e", `${head}^{commit}`], cwd: "fixture-repo" },
    {
      args: ["diff", "--name-status", "--find-renames", "--no-ext-diff", "-z", base, head],
      cwd: "fixture-repo",
    },
  ]);
});

test("changed-path collection uses the clean GitHub current-commit parent range", () => {
  const base = "e".repeat(40);
  const head = "f".repeat(40);
  const paths = collectReviewerRoleOwnershipDecisionProposalChangedPaths({
    cwd: "fixture-repo",
    env: { GITHUB_ACTIONS: "true", GITHUB_SHA: head },
    runGit: (args) => {
      if (args[0] === "rev-list") return { status: 0, stdout: `${head} ${base}\n`, stderr: "" };
      if (args[0] === "diff")
        return {
          status: 0,
          stdout: nameStatusOutput(approvedWave6Slice3ChangedPaths, "A"),
          stderr: "",
        };
      return { status: 0, stdout: "", stderr: "" };
    },
  });
  assert.deepEqual(paths, approvedWave6Slice3ChangedPaths);
});

test("follow-up CI range validates the cumulative original 38-path baseline", () => {
  const base = "3".repeat(40);
  const baseline = "4".repeat(40);
  const head = "5".repeat(40);
  let diffCount = 0;
  const paths = collectReviewerRoleOwnershipDecisionProposalChangedPaths({
    cwd: "fixture-repo",
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_NAME: "push",
      GITHUB_EVENT_PATH: "event.json",
      GITHUB_SHA: head,
    },
    readEvent: () => ({ before: base, after: head }),
    runGit: (args) => {
      if (args[0] === "cat-file" && args[1] === "-p")
        return { status: 0, stdout: `tree synthetic\nparent ${baseline}\n`, stderr: "" };
      if (args[0] === "diff") {
        diffCount += 1;
        return {
          status: 0,
          stdout:
            diffCount === 1
              ? nameStatusOutput(approvedWave6Slice3FollowUpPaths)
              : nameStatusOutput(approvedWave6Slice3ChangedPaths),
          stderr: "",
        };
      }
      return { status: 0, stdout: "", stderr: "" };
    },
  });
  assert.deepEqual(paths, approvedWave6Slice3ChangedPaths);
});

test("two consecutive CI follow-up commits recover the original 38-path baseline", () => {
  const beforeSlice = "1".repeat(40);
  const sliceCommit = "2".repeat(40);
  const firstFollowUp = "3".repeat(40);
  const secondFollowUp = "4".repeat(40);
  let diffCount = 0;
  const paths = collectReviewerRoleOwnershipDecisionProposalChangedPaths({
    cwd: "fixture-repo",
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_NAME: "push",
      GITHUB_EVENT_PATH: "event.json",
      GITHUB_SHA: secondFollowUp,
    },
    readEvent: () => ({ before: firstFollowUp, after: secondFollowUp }),
    runGit: (args) => {
      if (args[0] === "cat-file" && args[1] === "-p") {
        const parent = args[2] === firstFollowUp ? sliceCommit : beforeSlice;
        return { status: 0, stdout: `tree synthetic\nparent ${parent}\n`, stderr: "" };
      }
      if (args[0] === "diff") {
        diffCount += 1;
        return {
          status: 0,
          stdout:
            diffCount < 3
              ? nameStatusOutput(approvedWave6Slice3FollowUpPaths.slice(0, 2))
              : nameStatusOutput(approvedWave6Slice3ChangedPaths),
          stderr: "",
        };
      }
      return { status: 0, stdout: "", stderr: "" };
    },
  });
  assert.equal(diffCount, 3);
  assert.deepEqual(paths, approvedWave6Slice3ChangedPaths);
});

test("workflow dispatch current commit recovers through multiple remediation commits", () => {
  const beforeSlice = "6".repeat(40);
  const sliceCommit = "7".repeat(40);
  const firstFollowUp = "8".repeat(40);
  const secondFollowUp = "9".repeat(40);
  let diffCount = 0;
  const paths = collectReviewerRoleOwnershipDecisionProposalChangedPaths({
    cwd: "fixture-repo",
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_NAME: "workflow_dispatch",
      GITHUB_SHA: secondFollowUp,
    },
    runGit: (args) => {
      if (args[0] === "rev-list")
        return {
          status: 0,
          stdout: `${secondFollowUp} ${firstFollowUp}\n`,
          stderr: "",
        };
      if (args[0] === "cat-file" && args[1] === "-p") {
        const parent = args[2] === firstFollowUp ? sliceCommit : beforeSlice;
        return { status: 0, stdout: `tree synthetic\nparent ${parent}\n`, stderr: "" };
      }
      if (args[0] === "diff") {
        diffCount += 1;
        return {
          status: 0,
          stdout:
            diffCount < 3
              ? nameStatusOutput(approvedWave6Slice3FollowUpPaths)
              : nameStatusOutput(approvedWave6Slice3ChangedPaths, "A"),
          stderr: "",
        };
      }
      return { status: 0, stdout: "", stderr: "" };
    },
  });
  assert.equal(diffCount, 3);
  assert.deepEqual(paths, approvedWave6Slice3ChangedPaths);
});

test("multi-follow-up cumulative scope fails closed on an out-of-scope path", () => {
  const baseline = "a".repeat(40);
  const followUp = "b".repeat(40);
  const head = "c".repeat(40);
  let diffCount = 0;
  assert.throws(
    () =>
      collectReviewerRoleOwnershipDecisionProposalChangedPaths({
        cwd: "fixture-repo",
        env: {
          GITHUB_ACTIONS: "true",
          GITHUB_EVENT_NAME: "push",
          GITHUB_EVENT_PATH: "event.json",
          GITHUB_SHA: head,
        },
        readEvent: () => ({ before: followUp, after: head }),
        runGit: (args) => {
          if (args[0] === "cat-file" && args[1] === "-p")
            return { status: 0, stdout: `tree synthetic\nparent ${baseline}\n`, stderr: "" };
          if (args[0] === "diff") {
            diffCount += 1;
            return {
              status: 0,
              stdout:
                diffCount === 1
                  ? nameStatusOutput(approvedWave6Slice3FollowUpPaths.slice(0, 1))
                  : nameStatusOutput([
                      ...approvedWave6Slice3FollowUpPaths,
                      "apps/web/app/diagnostic/page.tsx",
                    ]),
              stderr: "",
            };
          }
          return { status: 0, stdout: "", stderr: "" };
        },
      }),
    /BLOCK: CI follow-up cumulative Slice 3 range.*out-of-scope path changed/,
  );
});

test("shallow or unavailable GitHub ranges fail closed", () => {
  const base = "c".repeat(40);
  const head = "d".repeat(40);
  assert.throws(
    () =>
      collectReviewerRoleOwnershipDecisionProposalChangedPaths({
        cwd: "fixture-repo",
        env: { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "push", GITHUB_EVENT_PATH: "event.json" },
        readEvent: () => ({ before: base, after: head }),
        runGit: () => ({ status: 1, stdout: "", stderr: "missing object" }),
      }),
    /BLOCK: CI push base commit is unavailable/,
  );

  assert.throws(
    () =>
      collectReviewerRoleOwnershipDecisionProposalChangedPaths({
        cwd: "fixture-repo",
        env: { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "push", GITHUB_SHA: head },
        runGit: (args) => {
          if (args[0] === "cat-file") return { status: 0, stdout: "", stderr: "" };
          return { status: 1, stdout: "", stderr: "shallow repository" };
        },
      }),
    /BLOCK: CI parent commit is unavailable/,
  );
});

test("root registration is exact and validator has no broad allowlist", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  for (const registration of [
    "node packages/curriculum/scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs --check-worktree-scope",
    "packages/curriculum/test/diagnostic-reviewer-role-ownership-policy-decision-proposal.test.mjs",
  ])
    assert.equal(packageJson.scripts.test.split(registration).length - 1, 1, registration);
  const source = await readFile(
    new URL(
      "../scripts/validate-diagnostic-reviewer-role-ownership-policy-decision-proposal.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /["']docs\/wave-6\/["']/);
  assert.doesNotMatch(source, /["']packages\/curriculum\/["']/);
  assert.doesNotMatch(source, /startsWith\(["']docs\/wave-6\//);
  assert.doesNotMatch(source, /startsWith\(["']apps\/api\//);
});
