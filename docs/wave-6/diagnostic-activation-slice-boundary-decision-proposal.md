# Diagnostic activation-slice boundary decision proposal

## Status and purpose

This Wave 6 / Slice 13 document is a static, non-production governance
proposal derived from `W5-OD-ACTIVATION-SLICE`. It defines the decision
surface that a separately authorized future activation slice would have to
resolve. It does not approve that boundary or authorize implementation.

The frozen baseline remains:

- proposal status: `PROPOSED_DEFERRED`;
- every boundary decision: `UNRESOLVED_DEFERRED`;
- readiness: `NOT_READY`;
- blockers: exactly `INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`;
- activation: `BLOCKED`;
- review workflow: `INACTIVE`;
- satisfied prerequisites: `0`;
- production approvals: `0`.

No prerequisite definition, proposal, successful validation run or future
prerequisite satisfaction may be interpreted as an activation event.

## Source and dependency chain

The source decision is `W5-OD-ACTIVATION-SLICE` in
`docs/wave-5/open-decisions.md`. Its controlling rule is that the exact
non-production capability and file boundary must be decided separately, and
that satisfying prerequisites must not automatically activate either review
or learner-facing diagnostics.

The proposal pins, without authorizing:

1. the Wave 5 / Slice 2 activation-prerequisites artifact;
2. the Wave 5 / Slice 14 CI and deterministic-validation gate placeholder;
3. the Wave 6 / Slice 12 CI activation-gate decision proposal.

Wave 5 closure proves only the static placeholder foundation. Slice 12 remains
deferred and records no CI execution or release evidence.

## Unresolved boundary decisions

The following decisions remain `UNRESOLVED_DEFERRED`:

- the exact entry-criteria snapshot and freshness requirements;
- the smallest capability set that a future activation slice may contain;
- the exact file allowlist and explicit exclusion of unrelated surfaces;
- the handoff between approved prerequisites and a separate activation
  decision;
- independent activation authority, quorum and decision evidence;
- the one explicit review-workflow transition, including denial behavior;
- separation of activation from diagnostic readiness and blocker closure;
- absolute separation from learner-facing diagnostic surfaces;
- CI/release evidence handoff and the rule that green CI is not authority;
- rollback, suspension and recovery preconditions required before activation.

None of these entries is a decision, rule, authority grant or acceptance
criterion satisfied by this proposal.

## Future capability boundary

A later approval may define a narrow activation slice only after all
prerequisites and their evidence are separately approved and current. That
future slice would still require:

- a version-pinned, fail-closed entry snapshot;
- explicit independent activation authority;
- one separately recorded activation decision;
- deterministic denial for missing, stale, conflicting, withdrawn or
  unverifiable inputs;
- an exact file allowlist reviewed before implementation;
- a separately approved rollback and recovery path;
- independent CI/release evidence that cannot itself grant authority.

The exact capabilities and paths remain undecided. This slice creates no
machine-readable activation record and authorizes no implementation.

## Explicit exclusions

This proposal does not permit:

- review activation or a review-workflow transition;
- learner diagnostic activation or any learner-facing diagnostic;
- readiness evaluation, blocker closure or a readiness transition;
- prerequisite satisfaction or ownership assignment;
- runtime modules, AppModule imports or feature flags;
- API, OpenAPI, Prisma, migration, database or web changes;
- routes, controllers, pages, actions or production flows;
- reviewer assignments, identities, evidence, decisions or approvals;
- candidate content, immutable digests, rollback events or CI gate
  executions;
- `.github/workflows/ci.yml`, dependency or lockfile changes.

All operational record collections remain empty. All operational counts remain
zero.

## Fail-closed interpretation

The future boundary remains blocked if an exact capability set, exact file
allowlist, authority, prerequisite snapshot, deterministic evidence,
workflow-transition rule, readiness separation or rollback precondition is
missing or unresolved.

No empty record set, repository merge, green CI run, closed Wave 5 gate or
approved prerequisite may be promoted into activation evidence. Any future
scope expansion requires a separate reviewed decision rather than a prefix,
directory or wildcard allowance.

## Open decision

`W5-OD-ACTIVATION-SLICE` remains unresolved. Slice 13 makes its future
decision boundary explicit and machine-validatable without beginning Wave 6
closure or activation work.
