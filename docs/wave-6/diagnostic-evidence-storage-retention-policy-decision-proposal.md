# Diagnostic evidence storage and retention policy decision proposal

## Status and boundary

This is a static, non-production Wave 6 / Slice 7 governance proposal. It
describes future evidence storage and retention decisions without approving a
policy or enabling a storage capability.

The proposal remains `PROPOSED_DEFERRED`. The
`evidence_storage_and_retention_policy` prerequisite remains
`UNSATISFIED_DEFERRED`; diagnostic readiness remains `NOT_READY`, activation
remains `BLOCKED`, and the review workflow remains `INACTIVE`.

No evidence record, storage object, retention schedule, deletion request,
legal hold, export, access log, audit event, identity, approval or candidate
content is created by this slice.

## Exact upstream pins

The proposal pins the Wave 5 evidence-storage placeholder and the Wave 6
Slice 4 separation-of-duties, Slice 5 conflict-of-interest and Slice 6 audit
identity proposals. Those dependencies are consumed as unresolved,
non-authorizing references only. They cannot satisfy a prerequisite or
activate review.

## Proposed policy areas

The following areas are intentionally unresolved:

1. evidence taxonomy and sufficiency boundary;
2. storage classification taxonomy and protected-location boundary;
3. record access and least-privilege boundary;
4. retention duration, trigger and expiry semantics;
5. deletion-request intake, authorization and execution boundary;
6. legal-hold authority, scope, precedence and release;
7. audit-trail event boundary and attribution dependency;
8. export and redaction boundary;
9. recovery, restore, orphan and partial-failure behavior;
10. dependency on audit identity, separation-of-duties and
    conflict-of-interest gates.

Every area remains `UNRESOLVED_DEFERRED`. No active ruleset, duration,
authority, backend, location, key, export recipient or legal decision is
selected.

## Evidence and storage taxonomy

Future evidence classes must distinguish methodology, safety, rights,
placement, accessibility and production-approval support. These are
vocabulary placeholders only. No evidence schema, payload, source reference,
storage locator or sufficiency result is present.

Future storage classes must describe sensitivity and access constraints
without embedding a bucket, region, object address, key, provider or
environment-specific value. Storage classification must not itself authorize
object creation.

## Access, retention and deletion

Future access must be purpose-limited, least-privilege and separately audited.
Bulk lookup, export, emergency access and support access require an approved
authority and privacy review.

Retention must define category, trigger, duration, expiry, renewal and
failure handling. Expiry is not deletion by itself; deletion must define
verification, retries, orphan handling and historical traceability.

Deletion requests must require verified authority, bounded scope and
idempotent execution evidence. No request or execution exists in this
proposal.

## Legal hold and audit trail

Legal hold remains a future decision about authority, trigger, scope,
precedence, release and reconciliation. It cannot silently extend unrelated
records or bypass deletion governance.

The audit trail boundary must specify only the minimum event metadata needed
to prove access, retention and deletion handling. It depends on the separate
audit identity policy and must not introduce identity values or raw evidence.

## Export, redaction and recovery

Export must define eligible recipients, review, redaction, disclosure limits
and access logging. Redaction must not be treated as a substitute for
deletion or rights review.

Recovery and restore must define protected backups, bounded retention,
deletion propagation, orphan detection, replay safety and partial-failure
reconciliation. No backup, restore, legal hold or recovery operation is
enabled.

## Dependency gates

Evidence storage and retention policy approval must remain separate from:

- audit identity issuance or binding;
- maker/checker and role separation;
- conflict disclosure, recusal or reassignment;
- review decisions and production approvals;
- readiness transition and workflow activation.

An unresolved dependency fails closed. A later policy approval still cannot
automatically satisfy the activation prerequisite.

## Synthetic validation boundary

The machine-readable artifact contains only abstract, marker-complete
synthetic vectors. Accepted vectors describe policy shapes; rejected vectors
prove that evidence records, storage keys, retention schedules, legal holds,
exports, identities, raw media, provider payloads and content are forbidden.

Passing validation proves only internal consistency, closed-world shape and
non-production status. It does not prove storage security, legal compliance,
retention correctness, deletion completeness, recovery safety or policy
approval.
