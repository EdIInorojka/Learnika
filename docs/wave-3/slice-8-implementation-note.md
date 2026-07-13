# Wave 3 Slice 8 implementation note

## Status

This slice adds an internal-only diagnostic catalog registry foundation. It
does not add routes, persistence, item selection, session creation, response
collection, checking, scoring, mastery, recommendations or learner-facing
behavior.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. Database validation and
migration deployment passed with no pending migrations, and both contract
checks passed before editing.

## Implemented foundation

- `DiagnosticCatalogRegistryService` loads the existing Slice 2, Slice 3 and
  Slice 4 static artifacts through read-only filesystem access.
- Required artifact metadata and graph/blueprint/item version pins are checked
  before any lookup is allowed.
- Canonical skill, blueprint slot and item fixture references are checked while
  the in-memory registry is built.
- Direct ID lookup returns deterministic metadata-only results and defensive
  copies. Unknown IDs return bounded `NOT_FOUND` metadata without reflecting
  caller input.
- Missing metadata, malformed references or version mismatch make the whole
  registry unavailable and return bounded `CATALOG_UNAVAILABLE` metadata.
- Skill projections expose only ID, title, short description, grade band,
  strand and prerequisite IDs.
- Blueprint projections expose only structural slot metadata.
- Item projections omit stems, evaluation placeholders and safety notes, and
  retain `draft_non_production_fixture` with `productionUseAllowed: false`.
- The internal module is not imported by `AppModule` and has no controller,
  persistence, network call, filesystem write or random behavior.

## Validation harness

Focused tests cover all three lookup types, exact projection allowlists,
unknown-ID handling, malformed version metadata, defensive copying,
determinism, repository version pins and forbidden output fields. Boundary
checks confirm there is no controller, AppModule wiring, OpenAPI path, Prisma
model or migration, network/write behavior, dependency addition or broad API
scope allowlist.

The API test command registers the focused test. The curriculum scope guard is
extended only for the exact approved Slice 8 service directory and test file;
it does not allow `apps/api/**`. No dependency or lockfile change is required.

## Deferred

Catalog publication and rollback policy, production content review, leaf-skill
granularity, grade placement, runtime authorization, tenant isolation,
persistence, caching, item selection, session/response handling and all
learning interpretation remain open decisions. Slice 8 does not authorize
Slice 9.
