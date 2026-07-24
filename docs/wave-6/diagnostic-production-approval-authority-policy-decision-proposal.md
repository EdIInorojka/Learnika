# Wave 6 / Slice 8 — production approval authority policy decision proposal

## Status and boundary

This is a static, non-production governance proposal. It describes the
questions that must be decided before a production approval authority can be
activated. It does not appoint an approver, grant authority, record a
decision, create evidence, or change diagnostic readiness.

The preserved baseline is:

- diagnostic readiness: `NOT_READY`;
- blockers: `INCOMPLETE_COVERAGE`, `NON_PRODUCTION_FIXTURES`;
- activation: `BLOCKED`;
- review workflow: `INACTIVE`;
- satisfied activation prerequisites: `0/12`;
- `production_approval_authority`: `UNSATISFIED_DEFERRED`.

All role, authority, decision, appeal, revocation, withdrawal and evidence
references in this proposal are placeholders only.

## Exact upstream pins

The proposal pins the Wave 5 production-approval-authority placeholder and
the non-authorizing Wave 6 proposals for separation of duties, conflict of
interest, audit identity and evidence storage/retention. It also preserves
the Wave 4 review-authority and workflow placeholders. Every dependency
remains unresolved, deferred and inactive.

No upstream proposal is interpreted as an approval, a clearance, an identity
binding, a digest value, an evidence record or an authority grant.

## Decision areas

The following areas remain unresolved:

1. production approver taxonomy and accountable ownership;
2. quorum and substantive gate requirements;
3. linkage to the candidate digest and review chain;
4. authority-grant scope, expiry, delegation and revocation;
5. approval decision record shape and outcomes;
6. revocation, withdrawal and appeal boundaries;
7. conflict-of-interest and separation-of-duties clearances;
8. policy maintenance and periodic access review;
9. future enforcement and audit evidence;
10. dependency ordering across the preceding governance proposals.

Each decision must receive an independent policy decision, an owner and
review evidence before it can be considered for activation. Slice 8 records
none of those operational facts.

## Future policy shape (not approved)

A future policy should fail closed unless one exact candidate revision is
linked to current canonicalization/digest and review-chain evidence, all
required substantive gates are current, and the approver is independently
authorized. The future policy must also define quorum, conflict and
separation checks, authority lifecycle, appeal handling and auditability.

Those statements are requirements for a later gate, not executable rules.

## Explicit non-goals

Slice 8 does not:

- create or assign a real approver, reviewer, auditor or authority owner;
- issue, activate, delegate, revoke or withdraw authority;
- create an approval, appeal, revocation, withdrawal or evidence record;
- select a quorum, digest algorithm, candidate, identity or storage location;
- add API, OpenAPI, Prisma, migration, web, runtime or dependency changes;
- satisfy any activation prerequisite, activate review or change readiness;
- add production diagnostic content or student data.

The machine-readable artifact contains only symbolic examples marked
`SYNTHETIC_EXAMPLE_ONLY` and `NON_OPERATIONAL`.
