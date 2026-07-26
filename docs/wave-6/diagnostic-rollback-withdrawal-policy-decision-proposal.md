# Wave 6 / Slice 11 — diagnostic rollback and withdrawal policy decision proposal

This document is a static, non-production governance proposal for a future
diagnostic rollback and withdrawal policy. It does not evaluate a trigger,
withdraw a candidate, roll back readiness, revoke authority, create evidence,
or authorize any lifecycle transition.

## Frozen baseline

The proposal keeps the exact current fail-closed baseline:

- diagnostic readiness is `NOT_READY`;
- blockers are exactly `INCOMPLETE_COVERAGE` and
  `NON_PRODUCTION_FIXTURES`, both open and unresolved;
- activation is `BLOCKED`;
- the review workflow is `INACTIVE`;
- all 12 activation prerequisites are unsatisfied;
- the rollback/withdrawal prerequisite is
  `UNSATISFIED_DEFERRED`;
- satisfied prerequisites, approved candidates, production approvals,
  rollbacks, withdrawals, evidence records and transitions are all zero.

## Decision surface

The eleven requirements from `W5-OD-ROLLBACK-WITHDRAWAL` remain unresolved:

1. withdrawal trigger taxonomy;
2. rollback trigger taxonomy;
3. candidate withdrawal and immediate containment;
4. production-approval withdrawal and downstream propagation;
5. evidence withdrawal, retention and tombstone boundaries;
6. digest invalidation and dependency propagation;
7. readiness rollback and blocker reopening;
8. audit trail and historical preservation;
9. notification, escalation and partial delivery;
10. restoration, re-approval and forward-fix rules;
11. partial-failure reconciliation and recovery.

Each requirement needs an independent policy decision, explicit authority,
negative vectors, preserved history and a fail-closed response to missing,
stale, revoked, withdrawn or conflicting inputs. This proposal approves none
of them.

## Future policy boundaries

A future policy must distinguish withdrawal from suspension, revocation,
rollback, tombstoning, restoration and forward-fix. It must bind each action
to one exact reviewed version without allowing a replacement to inherit
history or approval silently. Containment must precede downstream
propagation, and partial failure must leave an auditable unresolved state
until reconciled.

Candidate, evidence, digest, identity, review, approval and readiness
dependencies must be current and mutually consistent. A missing authority,
unresolved conflict, stale evidence, invalidated digest or incomplete
propagation must fail closed. A withdrawal event must never directly create a
`READY` state or activate review.

Future notification and escalation rules must minimize disclosure, preserve
tenant boundaries and avoid embedding contact or principal data in curriculum
artifacts. Audit history must preserve what happened without treating a
withdrawn or revoked state as current.

## Dependency order

This proposal pins the Wave 5 rollback/withdrawal placeholder and the Wave 5
readiness-integration chain, together with the unresolved Wave 6 governance
proposals for candidate identity, canonicalization/digest, reviewer ownership,
separation of duties, conflict of interest, audit identity, evidence
retention, production approval authority, coverage closure and readiness
integration. The dependency references are non-authorizing. None can satisfy
another prerequisite or activate a workflow.

## Non-production boundary

The machine-readable artifact contains only synthetic placeholder categories,
deferred decision requirements, zero counts and empty operational arrays. It
contains no candidate, evidence, digest, identity, authority grant, approval,
withdrawal, rollback, tombstone, restoration, notification, audit event,
readiness input or transition.

Passing static validation proves only internal consistency, exact dependency
pins and fail-closed boundaries. It is not policy approval, activation
evidence, production content or runtime implementation. Wave 6 / Slice 12 is
outside this slice.
