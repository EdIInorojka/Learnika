# Wave 3 Slice 6 implementation note

## Status

This slice adds a static diagnostic session lifecycle contract foundation. It
does not authorize runtime diagnostic sessions, persistence, item selection,
answer checking, correctness evaluation, scoring, mastery, recommendations or
learner-facing product behavior.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. Database validation and
migration deployment passed with no pending migrations, and both contract
checks passed before editing.

## Implemented foundation

- `diagnostic-session-lifecycle-contract.md` defines stable synthetic session
  IDs, seven lifecycle states, fourteen conservative transitions and strict
  cross-artifact reference rules.
- `grade-7-9-math.session-lifecycle.fixtures.v1.json` contains three synthetic,
  non-production scenarios: ordinary closure, abandonment without linked
  response/evidence records and whole-session invalidation.
- Every selected item and blueprint slot references an existing static
  artifact. Linked responses and evidence use existing Slice 5 fixture IDs and
  remain structurally aligned.
- Session lifecycle states remain separate from response observation states.
- Closed, abandoned and invalidated fixtures carry no correctness, educational
  outcome, scoring, mastery or proficiency meaning.
- All fixtures explicitly disable production use, runtime use, storage and
  interpretation.

## Validation harness

The dependency-free validator:

- validates stable IDs, duplicate records and grade bands limited to grades
  7-9;
- validates the exact state catalog, transition catalog and each fixture state
  path;
- pins graph, blueprint, item and response/evidence artifact versions;
- validates blueprint slot, selected item, response and evidence references;
- prevents response/evidence fixture reuse across session fixtures;
- validates abandonment and invalidation reference dispositions;
- rejects every required forbidden field/content term, child PII and runtime or
  persistence fields;
- delegates the existing curriculum worktree guard to reject API, OpenAPI,
  Prisma and web changes.

The root test command registers both the validator and focused negative tests.
No dependency was added.

## Deferred

Runtime session identity, authorization, idempotency, persistence, concurrency,
interruption recovery, retention, deletion, item selection, response
collection, deterministic checking, outcome calculation, evidence aggregation,
mastery and all API/OpenAPI/Prisma/web behavior remain open decisions. Slice 6
does not authorize Slice 7 or any runtime implementation.
