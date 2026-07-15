# Wave 4 Slice 8 implementation note

## Status

This slice adds a static diagnostic review authority and separation-of-duties
contract, placeholder artifact and dependency-free validator. It defines role
and governance vocabulary without creating identities, assignments, decisions,
approvals or runtime behavior.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. The Prisma schema was
valid, all three migrations were already applied, OpenAPI was current and
contract scope/privacy validation passed.

## Contract

The contract establishes a fail-closed authority boundary:

- policy identity is stable but deferred, inactive and non-authorizing;
- seven role names are placeholders rather than people or entitlements;
- each review gate has a deferred authority and minimum-count placeholder;
- separation-of-duties rules are future requirements, not proof or runtime
  enforcement;
- conflict-of-interest policy remains deferred and inactive;
- reviewer identity, audit identity and production authority remain unresolved;
- no placeholder grants a review decision or production approval.

## Placeholder artifact

The artifact pins review coverage
`wave-4.slice-2.grade-7-9-math.v1`, review evidence
`wave-4.slice-3.grade-7-9-math.v1`, review gate rubric
`wave-4.slice-4.grade-7-9-math.v1`, candidate digest registry
`wave-4.slice-5.grade-7-9-math.v1`, candidate canonicalization
`wave-4.slice-6.grade-7-9-math.v1`, review workflow state
`wave-4.slice-7.grade-7-9-math.v1` and the existing Wave 3 readiness policy.

- Exactly seven approved role placeholders appear once each.
- Exactly six gate-authority placeholders match the Slice 4 gates and policies.
- Every minimum reviewer count remains `null` and `TO_BE_DECIDED`.
- Three separation-of-duties requirement groups are present and
  non-authorizing.
- Reviewer and audit identity policies remain deferred with no reference
  formats.
- Conflict-of-interest policy is placeholder-only and inactive.
- Production-approval authority remains deferred with no approver count or
  authorization.
- Assignment, identity, conflict, decision and approval arrays remain empty.
- Real roles, assignments, identities, conflicts, approved decisions and
  production approvals all remain zero.
- Production, runtime and storage use remain disabled.

## Validator and tests

The validator checks the complete upstream Slice 2-7 chain and exact version
pins, policy inactivity, the exact seven-role taxonomy, six gate mappings and
policy versions, unresolved reviewer counts, exact separation-of-duties rules,
deferred identity and conflict policies, deferred production authority, empty
record arrays, zero aggregates, forbidden fields and content, hash-like values,
unchanged readiness blockers and exact worktree scope.

Focused tests cover the valid baseline, upstream pin mismatches, authority
activation, missing, unknown and duplicate roles and gates, identity and
assignment claims, reviewer-count decisions, unsafe separation rules,
conflict-policy activation, production-authority activation, populated records,
non-zero boundaries and aggregates, forbidden terms, readiness changes and
repository scope.

## Repository boundary

The worktree guard permits only 12 exact Slice 8 static and registration paths:
this note, the contract, artifact, validator, focused test, six existing
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

- accountable role owners and reviewer eligibility;
- minimum reviewer counts, quorum and exception policies;
- assignment, delegation, expiry and revocation;
- separation-of-duties enforcement and audit proof;
- conflict disclosure, recusal, escalation and retention;
- reviewer and audit identity formats and authorization;
- production approval authority and withdrawal;
- persistence, access control, API, UI and administrative tooling;
- readiness-policy integration;
- Slice 9 pending explicit approval.
