# Wave 4 Slice 7 implementation note

## Status

This slice adds a static diagnostic review workflow state contract, placeholder
artifact and dependency-free validator. It defines future non-production state
vocabulary and conservative transition metadata without submitting candidates,
starting reviews, recording decisions or granting approvals.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. The Prisma schema was
valid, all three migrations were already applied, OpenAPI was current and
contract scope/privacy validation passed. A parallel contract-check attempt
encountered a transient Windows `EPERM` while reading local TypeScript; both
contract commands passed when rerun sequentially.

## Contract

The contract establishes a fail-closed workflow definition:

- policy identity and workflow version are stable but deferred and inactive;
- seven non-production placeholder states define future vocabulary only;
- every transition row is deferred, unauthorised and production-disabled;
- the reserved approved placeholder has no inbound or outbound transition;
- all current slot entries remain `NOT_SUBMITTED`;
- reviewer and audit identity policies remain deferred and unpopulated.

## Placeholder artifact

The artifact pins review coverage
`wave-4.slice-2.grade-7-9-math.v1`, review evidence
`wave-4.slice-3.grade-7-9-math.v1`, review gate rubric
`wave-4.slice-4.grade-7-9-math.v1`, candidate digest registry
`wave-4.slice-5.grade-7-9-math.v1`, candidate canonicalization
`wave-4.slice-6.grade-7-9-math.v1` and the existing Wave 3 readiness policy.

- All 11 review-coverage slots appear exactly once.
- Each entry references its matching coverage, evidence and candidate-registry
  placeholder plus the shared rubric and canonicalization versions.
- Every entry is `PLACEHOLDER_ONLY` and `NOT_SUBMITTED`.
- Candidate-submitted and active-review flags remain false.
- Review-decision state is `NO_DECISION`; production-approval state is
  `NOT_ELIGIBLE`.
- Reviewer and audit identity references remain null.
- Submission, review, evidence, decision, approval and identity arrays remain
  empty.
- Submitted candidates, active reviews, evidence records, approved decisions,
  production approvals and identity records all remain zero.
- Production, runtime and storage use remain disabled.

## Validator and tests

The validator checks every upstream artifact and exact version pin, policy
inactivity, the exact seven-state enum, the conservative transition graph,
absence of any path to the reserved approved placeholder, complete and unique
11-slot coverage, matching per-entry upstream references, `NOT_SUBMITTED`
state, empty activity and identity records, zero aggregates, forbidden fields
and content, hash-like values, unchanged readiness blockers and exact worktree
scope.

Focused tests cover the valid baseline, upstream pin mismatches, policy
activation, missing, unknown and duplicate states and slots, unsafe transitions,
reference mismatches, submission and active-review claims, decision and
approval claims, reviewer and audit identity claims, populated records,
non-zero boundaries and aggregates, forbidden terms, readiness changes and
repository scope.

## Repository boundary

The worktree guard permits only 11 exact Slice 7 static and registration paths:
this note, the contract, artifact, validator, focused test, five existing
review/candidate validators whose cumulative exact guards require the new
paths, and root `package.json`. API, OpenAPI, Prisma, web, lockfile and runtime
paths remain rejected. No broad application allowlist is introduced.

No dependency or lockfile change is required.

## Readiness

Readiness remains `NOT_READY` under
`wave-3-slice-11-diagnostic-readiness-policy-v1`. Blocking reasons remain
`INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. Production approval count
remains zero.

## Deferred

- workflow ownership, authorization and activation;
- candidate submission authority and intake requirements;
- transition retry, withdrawal and invalidation rules;
- reviewer eligibility, assignment and separation of duties;
- reviewer and audit identity policies;
- evidence linkage and decision authorization;
- production approval authority and withdrawal;
- persistence, access control, retention, API, UI and administrative tooling;
- readiness-policy integration;
- Slice 8 pending explicit approval.
