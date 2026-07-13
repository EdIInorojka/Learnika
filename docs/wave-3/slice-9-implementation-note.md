# Wave 3 Slice 9 implementation note

## Status

This slice adds an internal-only diagnostic session plan service foundation.
It does not create runtime sessions, select production items, collect
responses, persist data or add learner-facing behavior.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. Database validation and
migration deployment passed with no pending migrations, and both contract
checks passed before editing.

## Implemented foundation

- `DiagnosticSessionPlanService` accepts only the exact known blueprint
  version and rejects additional identity- or response-shaped input fields.
- The service uses only `DiagnosticCatalogRegistryService` projections; it does
  not read static files directly.
- The plan preserves all 11 Slice 3 blueprint slots in their artifact order.
- Five slots reference existing Slice 4 item fixture IDs. Six slots are marked
  as missing fixture coverage, so the current result is safely
  `INCOMPLETE_COVERAGE` rather than being presented as ready.
- Every primary and supporting canonical skill is rechecked through catalog
  lookup, along with graph, blueprint and item fixture version pins.
- Item-to-slot strand, skill, grade-band and evidence-category alignment is
  checked before a fixture ID enters the plan.
- Outputs are metadata-only defensive copies with no session identity, item
  stem, response content or educational interpretation.
- Every entry and result remains non-production, runtime-disabled and
  storage-disabled.
- Unknown blueprints, unavailable catalogs, invalid references and version
  mismatches return bounded denial metadata without reflecting caller input or
  throwing raw internals.

## Validation harness

Focused tests cover deterministic plan construction, known reference
alignment, incomplete coverage, unknown blueprint denial, exact input
allowlisting, unavailable catalogs, defensive copying, forbidden output fields
and internal-only boundaries. They also confirm the absence of controllers,
AppModule wiring, OpenAPI paths, Prisma models or migrations, filesystem or
network writes, random behavior and a broad API scope allowlist.

The API test command registers the focused test. The curriculum scope guard is
extended only for the exact approved Slice 9 service directory and test file;
it does not allow `apps/api/**`. No dependency or lockfile change is required.

## Deferred

Production item review, complete slot coverage, grade-specific blueprints,
diagnostic length, ordering, selection and stop rules, session identity,
authorization, tenant isolation, persistence, caching, response collection,
checking, interpretation, accessibility and interrupted-flow recovery remain
open decisions. Slice 9 does not authorize Slice 10.
