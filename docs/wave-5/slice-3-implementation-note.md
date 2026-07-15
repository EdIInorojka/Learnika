# Wave 5 Slice 3 implementation note

## Slice

`WAVE 5 / SLICE 3 - DIAGNOSTIC CANDIDATE IDENTITY POLICY PLACEHOLDER`

## Status

Static contract-data validation foundation only. This slice adds an unresolved
candidate identity policy placeholder and does not create or approve an
identity policy, candidate ID, namespace owner or runtime identity capability.

## Added foundation

Slice 3 adds:

- the candidate identity policy placeholder contract;
- one versioned global placeholder artifact;
- one dependency-free deterministic validator;
- focused artifact, negative and exact-scope tests;
- this implementation note.

The artifact links to the Slice 2 activation prerequisites, Wave 4 candidate
digest registry and all 11 Wave 4 coverage slots. It references the Wave 4
format template only as `REFERENCE_ONLY_NOT_APPROVED`; it does not instantiate
per-slot candidate identities.

## Preserved prerequisite and product boundary

- `candidate_identity_policy` remains `UNSATISFIED_DEFERRED`;
- its owner remains `UNASSIGNED_OWNER_PLACEHOLDER`;
- its evidence references remain empty;
- all eight identity-policy requirements remain `TO_BE_DECIDED`;
- activation remains `BLOCKED` and workflow remains `INACTIVE`;
- readiness remains `NOT_READY` with exactly `INCOMPLETE_COVERAGE` and
  `NON_PRODUCTION_FIXTURES`;
- real candidate IDs, submissions, approved candidates and production
  approvals remain zero;
- all protected record arrays remain empty.

## Exact scope maintenance

The skill-graph guard adds only the two exact Slice 3 documentation paths. The
seven Wave 4 governance guards and the Slice 2 activation-prerequisites guard
add only the five exact Slice 3 product files. The new validator enumerates the
complete 22-path local implementation set and admits no broad directory prefix.

Focused tests retain rejection of near-miss Wave 5, API, OpenAPI, Prisma, web,
runtime and lockfile paths and verify the root test-command registrations.

## Excluded implementation

No dependency, lockfile, Prisma schema, migration, API, OpenAPI, web, runtime,
provider, content-candidate, reviewer, student-data, analytics or deployment
change is part of this slice. The Slice 2 artifact and its evidence-reference
arrays are unchanged.

## Validation and rollback

The complete validation chain from the approved prompt is required and is
reported in the Slice 3 handoff. Green validation is not policy approval,
activation evidence or CI evidence.

Before commit, rollback is deletion of the five new Slice 3 files and reversion
of their exact guard, test and `package.json` registrations. No database, API or
runtime state requires rollback.

## Handoff boundary

Approval of Slice 3 approves only this unresolved placeholder foundation.
Slice 4 and any policy satisfaction, real candidate identity, submission,
review decision, digest value, approval, activation or readiness change require
separate user authorization.
