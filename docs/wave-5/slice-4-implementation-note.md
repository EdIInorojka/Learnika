# Wave 5 Slice 4 implementation note

## Slice

`WAVE 5 / SLICE 4 - DIAGNOSTIC CANONICALIZATION AND DIGEST POLICY PLACEHOLDER`

## Status

Static contract-data validation foundation only. This slice adds one global,
unresolved canonicalization and digest policy placeholder. It does not approve
or execute canonicalization, select a digest algorithm or encoding, generate a
hash or digest, or activate any review capability.

## Added foundation

Slice 4 adds:

- the canonicalization and digest policy placeholder contract;
- one versioned global placeholder artifact;
- one dependency-free deterministic validator;
- focused artifact, negative and exact-scope tests;
- this implementation note.

The artifact pins the Slice 2 activation prerequisites, Slice 3 candidate
identity policy, Wave 4 candidate digest registry and Wave 4 canonicalization
placeholder. It does not create per-slot or per-candidate rows.

## Preserved prerequisite and product boundary

- `canonicalization_and_digest_policy` remains `UNSATISFIED_DEFERRED`;
- its owner remains `UNASSIGNED_OWNER_PLACEHOLDER`;
- its evidence references remain empty;
- all ten policy requirements remain `TO_BE_DECIDED`;
- the policy remains `UNRESOLVED_DEFERRED`;
- activation remains `BLOCKED` and workflow remains `INACTIVE`;
- readiness remains `NOT_READY` with exactly `INCOMPLETE_COVERAGE` and
  `NON_PRODUCTION_FIXTURES`;
- active canonicalization rules, selected algorithms, generated hashes, digest
  values, candidate identities, submissions, approvals and production
  approvals remain zero;
- all protected record arrays remain empty.

## Exact scope maintenance

The skill-graph guard adds only the two exact Slice 4 documentation paths. The
seven Wave 4 governance guards, Slice 2 activation-prerequisites guard and
Slice 3 identity-policy guard add only the five exact Slice 4 product files.
The new validator enumerates the complete 24-path local implementation set and
admits no broad directory prefix.

Focused tests retain rejection of near-miss Wave 5, API, OpenAPI, Prisma, web,
runtime, workspace-manifest and lockfile paths and verify the root test-command
registrations.

## Excluded implementation

No dependency, lockfile, Prisma schema, migration, API, OpenAPI, web, runtime,
provider, content-candidate, reviewer, student-data, analytics or deployment
change is part of this slice. The Slice 2 and Slice 3 artifacts remain
unchanged.

## Validation and rollback

The complete validation chain from the approved prompt is required and is
reported in the Slice 4 handoff. Green validation is not policy approval,
activation evidence, digest evidence or CI evidence.

Before commit, rollback is deletion of the five new Slice 4 files and
reversion of their exact guard, test and `package.json` registrations. No
database, API or runtime state requires rollback.

## Handoff boundary

Approval of Slice 4 approves only this unresolved placeholder foundation.
Slice 5 and any prerequisite satisfaction, active rule, algorithm selection,
hash or digest generation, candidate processing, review decision, approval,
activation or readiness change require separate user authorization.
