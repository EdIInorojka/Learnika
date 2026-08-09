# Pre-Wave 7 / Slice 31 — school beta acceleration closure gate

## Decision

`APPROVE PRE-WAVE 7 SCHOOL BETA ACCELERATION PREP CLOSURE`.

This closure gate closes only the static acceleration and pre-activation
planning foundation delivered through Slice 30. It does not start real Wave 7,
approve a school beta, name a design-partner school, create production school
records or authorize real school data processing.

Real Wave 7 remains `BLOCKED` until a separate activation request provides a
complete approval packet with named design partners, approved business owner,
privacy and legal basis, security evidence, teacher workflow validation,
restore readiness and independent-review approval.

## Closed static acceleration foundation

The closed foundation contains these non-production planning artifacts:

1. school beta activation-packet checklist;
2. future implementation slice map;
3. synthetic demo regression matrix;
4. school beta risk register;
5. pre-activation stop/go rubric.

These artifacts define review structure, denial cases, risk categories, future
implementation ordering and fail-closed pre-activation checks only. They are not
production approvals and do not satisfy the future gates they describe.

## Preserved boundary

The closure preserves these non-negotiable boundaries:

- diagnostic readiness remains `NOT_READY`;
- diagnostic activation remains `BLOCKED`;
- diagnostic workflow remains non-activated;
- real Wave 7 school beta remains `BLOCKED`;
- every school-beta gate remains blocked or future-only;
- stop/go status remains `STOP_BLOCKED`;
- production school data count remains `0`;
- real school count remains `0`;
- production approvals count remains `0`;
- no real school, organization, teacher, student, parent, reviewer or design
  partner is named;
- no real roster, assignment, submission, analytics, print, OMR, manual-review,
  support, export, deletion, backup or restore record is created;
- no production approvals, reviewer identities, reviewer assignments, conflict
  disclosures, authority grants, legal-basis records, consent records,
  evidence records or risk-acceptance records are created;
- no runtime, API, OpenAPI, Prisma, migration, database, web route,
  dependency, lockfile or CI workflow is changed by this closure.

Green validation, a complete synthetic demo walkthrough, a complete static
checklist, an implementation map, a risk register or an empty issue list is
repository consistency evidence only. It is not business approval, privacy
approval, security approval, teacher validation, restore readiness,
independent-review approval or Wave 7 activation.

## Closure evidence summary

The static acceleration foundation now documents what a future real school beta
must prepare before an activation request can be reviewed:

- activation-packet sections and missing-evidence denial cases;
- ordered future implementation lanes and exact-slice expectations;
- synthetic demo regression invariants for no PII, no mutations and no real
  school data;
- unresolved business, privacy, security, teacher-workflow, restore,
  integration and independent-review risks;
- stop/go dimensions that keep the current state `STOP_BLOCKED` until all
  required external evidence exists.

All evidence remains future and must be approved separately. Synthetic demo
evidence may inform conversations but cannot substitute for approved pilot data
or independent review.

## Deferred decisions

The following remain open and require separate approval before real Wave 7:

- named design-partner schools and accountable school-side sponsors;
- business owner, pilot objective, stop conditions, renewal-intent metrics and
  support budget;
- legal basis, consent or notice model, field inventory and PII classification
  for real school data;
- school identity, teacher role grants, auth/session model and support access;
- school-family relationship policy and any shared visibility boundary;
- roster import, invitation, correction, rejection, deletion and audit policy;
- assignment builder, online delivery, analytics, PDF/print, OMR and
  manual-review production boundaries;
- backup, restore, export, deletion, incident response and pilot-exit process;
- independent reviewer identity, authority, conflict disclosure, evidence
  packet and final activation decision;
- explicit activation slice scope, rollback conditions, withdrawal conditions
  and expiry model.

## Activation boundary

A future Wave 7 activation request must be a separate slice and must start from
a clean git gate. It must explicitly identify any runtime, API, OpenAPI,
Prisma, migration, database, web, dependency, lockfile or CI workflow scope it
needs.

This closure does not permit broad allowlists, wildcard path admissions,
production approvals, real schools, real data, school beta activation or
diagnostic readiness changes.

## Validation expectations

This closure gate must pass:

- `pnpm.cmd run format:check`;
- `pnpm.cmd run lint`;
- `pnpm.cmd run typecheck`;
- `pnpm.cmd run test`;
- `pnpm.cmd run validate`;
- `pnpm.cmd run infra:validate`;
- `pnpm.cmd run db:validate`;
- `pnpm.cmd run db:migrate:deploy`;
- `git diff --check`.

The checks prove repository consistency for the static acceleration foundation
only. They do not authorize real school onboarding, production use or Wave 7
beta.

## Scope-guard audit

This closure is admitted only through exact path guards. No broad
`docs/wave-7-prep/`, `docs/`, `packages/curriculum/`, `apps/api/`,
`apps/web/`, `.github/` or wildcard allowance is introduced.

Any future slice must declare its exact scope, preserve the blocked real-school
boundary unless separately approved and run full validation.
