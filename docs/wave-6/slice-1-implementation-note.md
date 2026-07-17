# Wave 6 / Slice 1 implementation note

## Scope

Slice 1 adds only a static candidate identity policy decision proposal,
synthetic non-operational examples, a machine-readable proposal artifact, a
dependency-free validator, focused tests, exact root-test registration and
the cumulative exact scope-guard changes required by those files.

No runtime, API, OpenAPI, Prisma, migration, database, web, readiness-policy,
activation-workflow, provider, dependency or lockfile change is included.

## Preserved baseline

- proposal status: `PROPOSED_DEFERRED`;
- prerequisite `candidate_identity_policy`: `UNSATISFIED_DEFERRED`;
- readiness: `NOT_READY`;
- activation: `BLOCKED`;
- review workflow: `INACTIVE`;
- blockers: `INCOMPLETE_COVERAGE`, `NON_PRODUCTION_FIXTURES`;
- satisfied prerequisites: `0`;
- approved candidates: `0`;
- production approvals: `0`.

No real candidate or reserved ID, grammar approval, evidence, decision,
digest, identity, assignment, authority grant, approval, withdrawal,
supersession, tombstone or restoration record is created.

## Validation design

The validator pins the Wave 5 activation-prerequisites and candidate-identity
placeholder artifacts plus the Wave 4 candidate-digest registry and coverage
artifact. It enforces a closed-world proposal shape, exact baseline states,
synthetic-wrapper markers, positive and rejected grammar vectors, private
value rejection, forbidden-field rejection, protected empty record arrays,
zero aggregates and an exact worktree allowlist.

Final command evidence is reported in the Slice 1 handoff. This note does not
approve the proposal, satisfy a prerequisite, start Slice 2 or close Wave 6.
