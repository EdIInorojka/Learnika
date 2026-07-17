# Wave 6 / Slice 1 candidate identity decision proposal scope

## Status

Wave 6 Slice 1 is a static, non-production proposal slice. It proposes a
candidate identity policy shape and synthetic validation vectors for later
review. It does not approve the proposal, allocate or reserve an identity,
satisfy an activation prerequisite, activate review or change readiness.

## Preserved baseline

- diagnostic readiness: `NOT_READY`;
- readiness blockers: `INCOMPLETE_COVERAGE`, `NON_PRODUCTION_FIXTURES`;
- activation: `BLOCKED`;
- review workflow: `INACTIVE`;
- activation prerequisites satisfied: `0/12`;
- `candidate_identity_policy`: `UNSATISFIED_DEFERRED`;
- approved candidates: `0`;
- production approvals: `0`.

The Wave 4 coverage baseline remains 11 slots: five `DRAFT_ONLY`, six
`GAP_CONFIRMED` and zero `PRODUCTION_APPROVED`.

## In scope

Slice 1 may propose, without approval or implementation:

- a namespace format and candidate-reference grammar;
- version and revision syntax;
- collision prevention and permanent non-reuse requirements;
- withdrawal and supersession reference shapes;
- relationships to blueprint slots, the placeholder digest registry and
  future canonicalization and digest policies;
- identifier data-exclusion rules;
- synthetic positive and rejected vectors that are unusable as real IDs.

The slice adds a closed-world machine-readable proposal, a dependency-free
validator, focused negative tests and the exact cumulative scope-guard
updates required to validate these files.

## Non-goals

Slice 1 does not:

- approve a candidate identity policy or grammar;
- define a real namespace owner or allocation authority;
- create, reserve, allocate, submit, withdraw or supersede a candidate ID;
- create real candidate content, a canonical representation or a digest;
- record evidence, review decisions, identities, assignments, authority
  grants, approvals, audit events, tombstones or restorations;
- satisfy `candidate_identity_policy` or any other activation prerequisite;
- activate review, close coverage, change readiness or remove a blocker;
- add Prisma persistence, migrations, API or OpenAPI operations, web UI or
  runtime candidate-identity behavior;
- add answers, scoring, mastery, hints, copied textbook material, providers,
  analytics or real learner data.

## Authorized primary files

The Slice 1 primary file boundary is exactly:

- `docs/wave-6/scope-and-non-goals.md`;
- `docs/wave-6/diagnostic-candidate-identity-policy-decision-proposal.md`;
- `docs/wave-6/open-decisions.md`;
- `docs/wave-6/slice-1-implementation-note.md`;
- `packages/curriculum/diagnostic-candidate-identity-policy-decision-proposal/grade-7-9-math.candidate-identity-policy-decision-proposal.v1.json`;
- `packages/curriculum/scripts/validate-diagnostic-candidate-identity-policy-decision-proposal.mjs`;
- `packages/curriculum/test/diagnostic-candidate-identity-policy-decision-proposal.test.mjs`;
- `package.json` only for exact validator and test registration.

Existing scope guards and their focused tests may change only to admit the
exact approved Slice 1 worktree paths. No broad `docs/wave-6/`, API or
curriculum prefix is authorized.

## Completion boundary

Passing validation proves only that the proposal is internally consistent,
synthetic and fail-closed. A later separately authorized slice must review
and explicitly decide the policy before any prerequisite could be considered
for satisfaction. Slice 2 is not started by this work.
