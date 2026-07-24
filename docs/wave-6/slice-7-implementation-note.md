# Wave 6 / Slice 7 implementation note

## Scope

Slice 7 adds only a static, non-production evidence storage and retention
policy decision proposal, one versioned JSON artifact, a dependency-free
validator, focused tests, exact root-test registration and cumulative exact
scope-guard updates.

The proposal covers evidence taxonomy, storage classification, record access,
retention and expiry, deletion, legal hold, audit trail, export/redaction,
recovery/restore and dependencies on audit identity, separation of duties and
conflict of interest.

## Preserved baseline

- proposal status: `PROPOSED_DEFERRED`;
- prerequisite `evidence_storage_and_retention_policy`:
  `UNSATISFIED_DEFERRED`;
- readiness: `NOT_READY`;
- activation: `BLOCKED`;
- workflow: `INACTIVE`;
- blockers: `INCOMPLETE_COVERAGE`, `NON_PRODUCTION_FIXTURES`;
- satisfied prerequisites: `0`;
- approved candidates: `0`;
- production approvals: `0`.

No evidence record, storage object, storage key, retention schedule, deletion,
legal hold, audit export, access log, identity, review decision, approval or
candidate content is created.

## Validation boundary

The validator pins the Wave 5 evidence-storage placeholder, Wave 6 Slice 4
separation-of-duties proposal, Slice 5 conflict-of-interest proposal and
Slice 6 audit identity proposal. It enforces unresolved decisions, disabled
capabilities, exact synthetic markers, rejected operational vectors, empty
records, zero operational counts, private/runtime/content rejection and the
exact cumulative Slice 7 worktree boundary.

Passing validation does not approve the policy, satisfy a prerequisite,
activate review, change readiness, close Wave 6 or start Slice 8.
