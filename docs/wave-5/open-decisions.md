# Wave 5 diagnostic review activation open decisions

## Status

Every decision below remains unresolved after Slice 1. None is permission to
activate a workflow, assign a reviewer, create an identity or candidate,
record evidence or a decision, generate a digest, grant production approval,
advance coverage or change readiness.

## W5-OD-CANDIDATE-IDENTITY

Choose the accountable namespace owner, allocation process, identity grammar,
reservation and non-reuse rules, and exact revision semantics. Decide which
content or metadata changes require a new identity or version.

## W5-OD-CANONICAL-FIELD-INVENTORY

Approve the candidate field inventory and explicit inclusion or exclusion of
each field. Decide Unicode, Russian-language, mathematical notation,
whitespace, punctuation, line-ending, ordering and byte-serialization rules.

## W5-OD-DIGEST-POLICY

Choose the digest algorithm identifier, value encoding, domain separation,
collision response, reproducibility standard and algorithm migration policy.
No earlier `sha256` placeholder is an approved decision.

## W5-OD-ROLE-OWNERSHIP

Define accountable organizational ownership roles for the five substantive
gates, final production approval and audit observation. Define eligibility,
appointment, delegation, expiry, revocation, minimum counts and quorum.

## W5-OD-SEPARATION-ENFORCEMENT

Approve identity-comparison, assignment and decision-time enforcement for no
self-review, no self-approval, reviewer/approver independence, audit-observer
independence and quorum de-duplication. Decide whether any exception can exist.

## W5-OD-CONFLICT-OF-INTEREST

Define disqualifying relationships, disclosure timing, evaluation authority,
recusal, reassignment, escalation, late-disclosure invalidation, access,
retention and deletion.

## W5-OD-AUDIT-IDENTITY

Choose opaque reviewer and audit identity reference formats, their binding to
authenticated principals, authorized resolution, revocation, historical
traceability and privacy controls.

## W5-OD-EVIDENCE-LIFECYCLE

Approve the review-evidence schema, evidence sufficiency and freshness rules,
private storage boundary, integrity model, access control, retention and
deletion matrix, legal hold, recovery and orphan-reference handling.

## W5-OD-PRODUCTION-AUTHORITY

Define the independent production-approval owner, eligibility, quorum,
delegation, explicit decision schema, expiry, suspension, withdrawal and
re-approval rules.

## W5-OD-COVERAGE-CLOSURE

Approve the production-coverage threshold, grade and strand balance rules,
authoring sequence for the six gaps, disposition of the five non-production
fixtures and whether any explicit waiver mechanism is permitted. No slot may
be silently waived.

## W5-OD-READINESS-INTEGRATION

Define how a future validator will consume current coverage, review evidence,
authority, production approval, expiry and withdrawal. Decide the separately
gated policy transition required before readiness could ever change.

Until then readiness remains `NOT_READY`, with exactly
`INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`.

## W5-OD-ROLLBACK-WITHDRAWAL

Approve invalidation triggers, suspension and withdrawal authority,
containment, downstream propagation, audit preservation, rollback versus
forward-fix rules and recovery from partial failure.

## W5-OD-CI-ACTIVATION-GATE

Define the future machine-readable policy artifacts, synthetic fixtures,
negative authorization cases, reproducibility vectors, retention tests and
independent release evidence required before an activation proposal can be
reviewed.

## W5-OD-ACTIVATION-SLICE

Define the exact non-production capability and file boundary of a future
activation slice. Satisfying prerequisites must not automatically activate the
workflow or authorize learner-facing diagnostics.
