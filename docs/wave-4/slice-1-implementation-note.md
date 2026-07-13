# Wave 4 Slice 1 implementation note

## Status

This slice adds documentation-only foundations for reviewed diagnostic content
coverage. It does not add content candidates, runtime behavior or production
approval.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. Database validation and
migration deployment passed with no pending migrations, and both contract
checks passed before editing.

## Implemented foundation

- The Wave 4 scope is limited to review and coverage contract documentation for
  Russian mathematics in grades 7-9.
- Six independent gates cover methodology, safety and no-answer policy, rights,
  grade placement, accessibility and readability, and final production
  approval.
- Review evidence is pinned to an immutable candidate, artifact version,
  blueprint version and digest. Missing or stale evidence fails closed.
- Coverage is tracked per blueprint slot rather than inferred from strand-level
  totals or fixture presence.
- The Wave 3 baseline records five draft-only slots and six confirmed gaps.
- Existing fixtures remain non-production, and no actual item content is added
  or revised.
- The legacy mobile Wave 4 bootstrap prompt conflict is recorded as an open
  roadmap decision; no mobile work is activated.

## Readiness

Readiness remains `NOT_READY`. The current deterministic blockers remain
`INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. This slice does not edit the
readiness policy, permit a `READY` result or approve any candidate for
production.

## Repository boundary

No dependency, lockfile, Prisma, migration, API, OpenAPI, web, mobile or runtime
product file is changed. The existing curriculum scope guard requires only a
narrow static-path update so that `docs/wave-4/**` is recognized; it does not
authorize any additional application path.

## Deferred

Review artifacts and validators, actual candidate authoring, named review
owners, detailed rubrics, rights evidence retention, full reviewed coverage,
readiness-policy integration and all runtime delivery remain deferred. Slice 2
must not start without explicit approval.
