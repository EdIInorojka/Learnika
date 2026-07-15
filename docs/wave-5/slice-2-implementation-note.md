# Wave 5 Slice 2 implementation note

## Slice

`WAVE 5 / SLICE 2 - DIAGNOSTIC REVIEW ACTIVATION PREREQUISITES ARTIFACT AND VALIDATOR`

## Status

Static contract-data validation foundation only. This slice records the 12
Wave 5 activation prerequisites as unsatisfied and validates that the review
workflow remains inactive and blocked. It does not satisfy a prerequisite,
activate a workflow, grant authority, create a real record or change diagnostic
readiness.

## Static artifact

The versioned artifact
`wave-5.slice-2.grade-7-9-math.v1` contains exactly the prerequisite IDs fixed
by the Slice 1 contract. Every entry remains `UNSATISFIED_DEFERRED`, uses the
generic `UNASSIGNED_OWNER_PLACEHOLDER`, and carries one controlled description
of future evidence requirements with an empty evidence-reference array.

The artifact pins the seven Wave 4 governance artifact versions and their
closed non-production aggregates. Its local candidate, digest-value, evidence,
decision, reviewer identity, audit identity, reviewer assignment, owner
assignment and production approval record arrays are empty.

## Deterministic validator

The dependency-free Node validator fails closed on:

- missing, duplicate or unknown prerequisite IDs;
- any prerequisite state other than the exact deferred baseline;
- changed owner placeholders or evidence descriptions and any evidence record
  reference;
- activation, workflow, production, runtime or storage enablement;
- readiness other than `NOT_READY` or blockers other than exactly
  `INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`;
- stale Wave 4 pins or aggregate drift;
- non-empty real-record arrays, non-zero activity counts or unknown fields;
- forbidden learner, answer, scoring, provider, copied-content, identity and
  digest-value terms, hash-like values and email-like values;
- any worktree path outside the 19 exact Slice 2 implementation paths.

Existing Wave 4 validators continue to validate the upstream chain before the
Slice 2 artifact is accepted.

## Scope-guard changes

The skill-graph guard adds only this exact implementation-note path. Each of
the seven Wave 4 governance guards adds a separate exact four-path Slice 2 set
for this note, the artifact, the validator and its focused test. The new
validator has no broad path prefix and enumerates the complete 19-path local
change set, including registration and deterministic scope-test maintenance.

Focused tests retain rejection of near-miss Wave 5, API, OpenAPI, Prisma, web,
runtime and lockfile paths. No broad `docs/wave-5/`, `packages/curriculum/` or
`apps/api/` allowlist is introduced for Slice 2.

## Preserved baseline

- activation remains `BLOCKED` and review workflow status remains `INACTIVE`;
- all 12 prerequisites remain unsatisfied;
- readiness remains `NOT_READY`;
- blocking reasons remain exactly `INCOMPLETE_COVERAGE` and
  `NON_PRODUCTION_FIXTURES`;
- production approval count remains zero;
- real candidates, digest values, evidence, decisions, identities and
  assignments remain absent;
- no policy approval, workflow activation or production-content artifact is
  created.

## Excluded implementation

No dependency, lockfile, Prisma schema, migration, API, OpenAPI, web, runtime,
provider, analytics, deployment, content-candidate or student-data change is
part of this slice. README remains unchanged.

## Validation and rollback

The complete validation chain from the approved Slice 2 prompt is required and
is reported in the handoff. A green local validator proves only static internal
consistency; it is not review evidence, production approval, workflow
activation or CI evidence.

Before commit, rollback is deletion of the four new Slice 2 files and reversion
of their exact guard, test and `package.json` registrations. There is no
database, API or runtime state to roll back.

## Handoff boundary

Approval of Slice 2 approves only this blocked static artifact and its
validator. Slice 3 and any policy satisfaction, real identity, reviewer
assignment, evidence, decision, digest value, approval, activation or readiness
change require separate user authorization.
