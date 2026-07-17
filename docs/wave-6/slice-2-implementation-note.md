# Wave 6 / Slice 2 implementation note

## Scope

Slice 2 adds only a static canonicalization and digest policy decision proposal,
abstract synthetic vectors, a machine-readable artifact, a dependency-free
validator, focused tests, exact root-test registration and the cumulative exact
scope-guard changes required by those files.

No runtime, API, OpenAPI, Prisma, migration, database, web, readiness-policy,
activation-workflow, provider, dependency or lockfile change is included.

## Preserved baseline

- proposal status: `PROPOSED_DEFERRED`;
- prerequisite `canonicalization_and_digest_policy`:
  `UNSATISFIED_DEFERRED`;
- readiness: `NOT_READY`;
- activation: `BLOCKED`;
- review workflow: `INACTIVE`;
- blockers: `INCOMPLETE_COVERAGE`, `NON_PRODUCTION_FIXTURES`;
- satisfied prerequisites: `0`;
- approved candidates: `0`;
- production approvals: `0`.

No real content, candidate ID, canonical representation, digest, selected
algorithm, evidence, decision, identity, assignment, authority grant or
approval is created.

## Validation design

The validator exact-pins the Wave 5 activation and canonicalization/digest
placeholder artifacts, the Wave 6 candidate identity proposal, and the Wave 4
digest and canonicalization placeholders. It enforces a closed-world proposal
shape, exact baseline states, exact symbolic-vector markers, rejected vectors,
private-value rejection, forbidden-field rejection, protected empty record
arrays, zero operational aggregates and an exact worktree allowlist.

Passing validation proves only internal consistency of a non-approved proposal.
This note does not satisfy a prerequisite, start Slice 3 or close Wave 6.

