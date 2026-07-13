# Wave 3 Slice 10 implementation note

## Status

This slice adds an internal-only diagnostic session draft orchestration
foundation. It produces a safe preview only; it does not create, activate or
persist a diagnostic session and does not add learner-facing behavior.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. Database validation and
migration deployment passed with no pending migrations, and both contract
checks passed before editing.

## Implemented foundation

- `DiagnosticSessionDraftService` composes the existing Slice 9 plan service
  and Slice 7 lifecycle state service without reading curriculum files
  directly.
- It accepts only the blueprint-only input already allowlisted by the plan
  service. Identity-, response-, evaluation- and provider-shaped additions are
  denied before a draft preview is returned.
- A successful preview always starts at lifecycle state `drafted`, contains no
  session identifier or state path, and remains non-production,
  runtime-disabled and storage-disabled.
- The nested metadata-only plan preserves all 11 blueprint slots, five
  available non-production item fixture IDs and six explicit coverage gaps.
- The current draft is therefore `DRAFT_PREVIEW_INCOMPLETE`; it cannot be
  represented as ready or active.
- `directActivationGuard` is produced by the existing state service from the
  invalid `drafted -> active` transition and remains the bounded
  `TRANSITION_NOT_ALLOWED` denial defined by the Slice 6/7 contract.
- Unknown blueprints, unavailable catalogs, plan reference failures and state
  contract failures return bounded denial metadata without reflecting input or
  throwing raw internals.
- Outputs contain identifiers and structural metadata only. Item stems,
  response content and educational interpretation remain absent.

## Validation harness

Focused tests cover deterministic draft previews, initial lifecycle state,
direct-activation denial, incomplete plan metadata, unknown blueprint and
catalog failures, exact input allowlisting, defensive copying, no-stem output
and internal-only boundaries. They also confirm the absence of controllers,
AppModule wiring, OpenAPI paths, Prisma models or migrations, filesystem or
network writes, random behavior and a broad API scope allowlist.

The API test command registers the focused test. The curriculum scope guard is
extended only for the exact approved Slice 10 service directory and test file;
it does not allow `apps/api/**`. No dependency or lockfile change is required.

## Deferred

Complete item coverage, production content review, draft-to-ready policy,
session identity, authorization, tenant isolation, idempotency, persistence,
retention, interruption recovery, response collection, checking,
interpretation and learner-facing diagnostics remain open decisions. Slice 10
does not authorize Slice 11.
