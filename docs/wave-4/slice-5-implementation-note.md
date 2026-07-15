# Wave 4 Slice 5 implementation note

## Status

This slice adds a static diagnostic content candidate digest contract,
placeholder registry and dependency-free validator. It defines future identity,
algorithm, canonicalization and upstream-reference boundaries without assigning
a candidate, recording a digest, embedding content, recording review activity
or granting production approval.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. The Prisma schema was
valid, all three migrations were already applied, OpenAPI was current and
contract scope/privacy validation passed.

## Contract

The contract distinguishes a structural placeholder from an exact candidate:

- a registry-entry ID identifies only the placeholder row;
- the future candidate identity format is defined, but every candidate ID is
  null and unassigned;
- digest algorithm and canonicalization policies are versioned but deferred;
- allowed digest states are non-approving vocabulary only;
- no digest value, review evidence, decision or production approval exists;
- a placeholder cannot change the referenced coverage status.

## Placeholder registry

The artifact pins review coverage
`wave-4.slice-2.grade-7-9-math.v1`, review evidence
`wave-4.slice-3.grade-7-9-math.v1`, review gate rubric
`wave-4.slice-4.grade-7-9-math.v1`, blueprint
`wave-3.slice-3.grade-7-9-math.v1` and the existing Wave 3 readiness policy.

- All 11 review-coverage slots appear exactly once as structural placeholders.
- Coverage statuses remain five `DRAFT_ONLY` and six `GAP_CONFIRMED` through
  exact references to the Slice 2 artifact.
- Candidate identities remain `UNASSIGNED` with null IDs.
- Current digest placeholders remain `PENDING_IMMUTABLE_CANDIDATE` and aligned
  with the Slice 2 and Slice 3 placeholders.
- Algorithm identifiers, canonicalization ruleset versions and digest values
  remain null.
- Evidence references remain `NOT_RECORDED` with null record IDs.
- Review decision state is `NO_DECISION`; production approval state is
  `NOT_ELIGIBLE`.
- Review evidence, review decision and production approval arrays remain empty.
- Assigned identities, digest values, evidence, decisions and production-
  approved candidates all remain zero.

## Validator and tests

The validator checks exact upstream version pins, complete and unique coverage-
slot references, unchanged coverage states, matching evidence and rubric
references, identity-format and deferred-policy pins, null identity and digest
values, non-approving states, empty record arrays, zero aggregates, forbidden
fields and content, hash-like values, exact readiness blockers and exact
worktree scope.

Focused tests cover the valid baseline, upstream pin mismatches, missing,
unknown and duplicate slots, identity assignment, algorithm and
canonicalization activation, invalid digest states, populated and hash-like
digest values, reference mismatches, content and approval claims, populated
record arrays, non-zero boundaries and aggregates, readiness changes,
forbidden terms and repository scope. All 16 focused tests pass.

## Repository boundary

The worktree guard permits only nine exact Slice 5 static and registration
paths: this note, the contract, registry, validator, focused test, three existing
review validators whose exact guards require the new paths, and root
`package.json`. API, OpenAPI, Prisma, web, lockfile and runtime paths remain
rejected. No broad application allowlist is introduced.

No dependency or lockfile change is required.

## Readiness

Readiness remains `NOT_READY` under
`wave-3-slice-11-diagnostic-readiness-policy-v1`. Blocking reasons remain
`INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. Production-approved
candidate count remains zero.

## Deferred

- candidate identity ownership, assignment and revision semantics;
- digest algorithm, encoding, collision and migration policy;
- canonicalization field set, ordering, normalization and reproducibility;
- digest creation authority and invalidation triggers;
- exact candidate content and rights-cleared provenance;
- evidence, decision, reviewer and audit identity records;
- production approval authority and withdrawal;
- persistence, access control, retention, API, UI and administrative tooling;
- readiness-policy integration;
- Slice 6 pending explicit approval.
