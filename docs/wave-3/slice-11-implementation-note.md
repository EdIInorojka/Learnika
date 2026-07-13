# Wave 3 Slice 11 implementation note

## Status

This slice adds an internal-only diagnostic readiness policy foundation. It
evaluates an existing Slice 10 draft preview but does not change lifecycle
state, create or persist a session, or add learner-facing behavior.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. Database validation and
migration deployment passed with no pending migrations, and both contract
checks passed before editing.

## Implemented foundation

- `DiagnosticReadinessPolicyService` accepts the existing Slice 10 draft
  preview shape and returns a bounded metadata-only readiness evaluation.
- Exact key allowlists, known version pins, structural counters and safe ID
  formats reject malformed drafts and any identity-, response-, evaluation- or
  provider-shaped additions.
- The policy consults the Slice 7 state service to confirm that
  `drafted -> ready` is a contract-valid transition without applying it.
- A lifecycle state other than `drafted` blocks readiness and remains unchanged.
- The current Slice 10 preview remains `NOT_READY`: all 11 blueprint slots are
  represented structurally, but only five have item fixtures and six remain
  gaps. The five available fixtures are explicitly non-production.
- Blocking reasons are deterministic and ordered. The current reasons are
  `INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`.
- The output contains only the pinned blueprint version, lifecycle state,
  counts, policy metadata and blocking reasons. Plan entries, item fixture IDs,
  stems and caller content are not returned.
- Unknown versions, upstream draft denials and malformed input return bounded
  denial metadata without reflecting caller values or throwing raw internals.

## Validation harness

Focused tests cover deterministic current-draft evaluation, incomplete
coverage, non-production fixture blocking, invalid lifecycle state, malformed
and unknown drafts, exact input shape rejection, count consistency, no-stem
output and internal-only boundaries. They also confirm the absence of
controllers, AppModule wiring, OpenAPI paths, Prisma models or migrations,
filesystem or network writes, random behavior and a broad API scope allowlist.

The API test command registers the focused test. The curriculum scope guard is
extended only for the exact approved Slice 11 service directory and test file;
it does not allow `apps/api/**`. No dependency or lockfile change is required.

## Deferred

Complete reviewed item coverage, production fixture approval, any policy
version that can return `READY`, real session creation, identity,
authorization, tenant isolation, idempotency, persistence, retention,
interruption recovery, response collection, checking, interpretation and
learner-facing diagnostics remain open decisions. Slice 11 does not authorize
Slice 12.
