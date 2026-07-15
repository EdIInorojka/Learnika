# Wave 5 Slice 1 implementation note

## Slice

`WAVE 5 / SLICE 1 - DIAGNOSTIC REVIEW ACTIVATION PREREQUISITES CONTRACT`

## Status

Documentation and static scope-contract foundation only. No diagnostic review
workflow, policy, authority, identity, candidate, digest, evidence, decision,
approval or production capability is activated.

## Implemented documentation

Slice 1 adds:

- `scope-and-non-goals.md`, which fixes the documentation-only boundary;
- `diagnostic-review-activation-prerequisites-contract.md`, which defines 12
  fail-closed prerequisite areas;
- `open-decisions.md`, which records the decisions deferred to later gates;
- this implementation note.

The prerequisites cover candidate identity; canonicalization and digest;
reviewer ownership; separation of duties; conflicts; audit identity; evidence
storage and retention; production authority; coverage closure; readiness
integration; rollback and withdrawal; and CI validation.

## Scope-guard unblock

The existing curriculum worktree guards are extended only with the four exact
Wave 5 Slice 1 documentation paths. No `docs/wave-5/` prefix is allowed.
Focused tests cover the exact allowed paths and continue to reject near-miss
Wave 5, API, OpenAPI, Prisma, web, runtime and lockfile paths.

## Preserved baseline

- readiness remains `NOT_READY`;
- blocking reasons remain exactly `INCOMPLETE_COVERAGE` and
  `NON_PRODUCTION_FIXTURES`;
- five slots remain `DRAFT_ONLY` and six remain `GAP_CONFIRMED`;
- all 11 workflow entries remain `NOT_SUBMITTED`;
- candidate identity and digest values remain absent;
- canonicalization, workflow and authority policies remain inactive;
- review evidence, decisions, reviewer identities, assignments and production
  approvals remain absent.

## Excluded implementation

No dependencies, Prisma schema, migration, API, OpenAPI, web, runtime,
provider, analytics, deployment or production-content change is part of this
slice. README is unchanged because the Wave 5 pointer is not required for the
contract to be discoverable within its approved directory.

## Validation

The slice requires the complete repository validation chain from the approved
prompt, including focused scope tests, builds, contract validation, database
validation and migration deployment, infrastructure validation and
`git diff --check`. Exact results are reported in the Slice 1 handoff; CI is not
claimed by this uncommitted local worktree.

## Rollback and forward fix

Before commit, rollback is deletion of the four new documentation files and
reversion of their exact scope-guard/test entries. No database, API or runtime
state requires rollback. After later review, any correction must remain within
an explicitly approved documentation or static-contract gate.

## Handoff boundary

Approval of Slice 1 approves only the static prerequisites contract. Slice 2,
workflow activation, machine-readable production approval artifacts and all
real policy or review records require separate user authorization.
