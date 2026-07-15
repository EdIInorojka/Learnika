# Wave 4 Slice 3 implementation note

## Status

This slice adds a static contract, placeholder artifact and dependency-free
validator for future diagnostic review evidence records. It records no review
evidence, reviewer identity, decision or production approval. It adds no
diagnostic content or runtime behavior.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. The Prisma schema was
valid, all three migrations were already applied, OpenAPI was current and
contract scope/privacy validation passed.

## Contract

The contract defines a future evidence record as one immutable candidate,
blueprint slot and review gate. It describes required version pins, opaque
evidence and identity references, decision metadata, fail-closed identity and
authorization requirements, safety exclusions and unresolved decisions.

Slice 3 activates none of those future record fields. Reviewer identity and
audit identity remain separately deferred, with no policy version, reference
format or real reviewer data.

## Placeholder artifact

The artifact pins review coverage
`wave-4.slice-2.grade-7-9-math.v1`, blueprint
`wave-3.slice-3.grade-7-9-math.v1` and the existing Wave 3 readiness policy.

- All 11 coverage slots appear exactly once.
- Each slot has six gate placeholders, for 66 total.
- Candidate digests remain `PENDING_IMMUTABLE_CANDIDATE` with null values.
- Gate records remain `NOT_RECORDED` with `NO_DECISION`.
- Evidence, reviewer identity, audit identity and decision timestamp references
  remain null.
- The `evidenceRecords` array remains empty.
- Evidence records, approved decisions and production approvals all remain
  zero.

## Validator

The dependency-free validator checks exact artifact fields and version pins,
alignment with every Slice 2 coverage slot and coverage status, all six gate
keys and policy pins, pending digest semantics, identity deferrals, empty
evidence records, exact zero aggregates, forbidden fields and content, and the
existing readiness blockers.

Focused tests cover valid baseline behavior, missing, duplicate and unknown
slots, coverage mismatches, missing gates, policy mismatches, populated
digests, identity-policy claims, evidence and decision claims, readiness
changes, forbidden terms and exact worktree scope.

## Repository boundary

The worktree guard permits only the seven exact Slice 3 static and registration
paths: this note, the contract, placeholder artifact, new validator and test,
the existing coverage validator required to extend its exact guard, and root
`package.json`. API, OpenAPI, Prisma, web, lockfile and runtime paths remain
rejected. No broad application allowlist is introduced.

## Readiness

Readiness remains `NOT_READY` under
`wave-3-slice-11-diagnostic-readiness-policy-v1`. Blocking reasons remain
`INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. Production approval count
remains zero.

## Deferred

- immutable candidate digests and canonicalization;
- evidence identifier, reference and storage formats;
- reviewer ownership, authorization and separation of duties;
- reviewer and audit identity policies;
- gate rubrics, accepted evidence and expiry rules;
- decision transitions, withdrawal and production approval authority;
- persistence, API, UI and administrative tooling;
- readiness-policy integration and any move toward `READY`;
- Slice 4 pending explicit approval.
