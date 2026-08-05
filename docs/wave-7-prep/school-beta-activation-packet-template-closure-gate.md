# Pre-Wave 7 / Slice 24 — school beta activation packet template closure

## Decision

`APPROVE PRE-WAVE 7 SCHOOL BETA ACTIVATION PACKET TEMPLATE CLOSURE`.

This closure gate closes only the static activation-packet template introduced
in Slice 23. It does not start real Wave 7, approve a school beta, name a
design-partner school, create production school records or authorize real
school data processing.

Real Wave 7 remains `BLOCKED` until a separate activation request provides a
complete approval packet with named design partners, approved business owner,
privacy and legal basis, security evidence, teacher workflow validation,
restore readiness and independent-review approval.

## Closed static template

The closed Slice 23 template defines the sections that a future real Wave 7
activation request must provide:

1. business and design-partner gate;
2. data-processing and privacy gate;
3. security and isolation gate;
4. teacher workflow validation gate;
5. restore readiness gate;
6. independent-review gate.

Every section remains `EMPTY_DEFERRED`. The template is not an evidence packet,
approval record, reviewer decision, legal-basis record or machine-readable
production approval artifact.

## Preserved boundary

This closure preserves these non-negotiable boundaries:

- diagnostic readiness remains `NOT_READY`;
- diagnostic activation remains `BLOCKED`;
- diagnostic workflow remains non-activated;
- real Wave 7 school beta remains `BLOCKED`;
- the activation packet template remains `TEMPLATE_BLOCKED_NON_PRODUCTION`;
- production school data count remains `0`;
- real school count remains `0`;
- production approvals count remains `0`;
- no real school, organization, teacher, student, parent, reviewer or design
  partner is named;
- no real roster, assignment, submission, analytics, print, OMR, manual-review,
  support, export, deletion, backup, restore or audit record is created;
- no production approvals, reviewer identities, reviewer assignments, conflict
  disclosures, authority grants, legal-basis records, consent records or
  evidence records are created;
- no runtime, API, OpenAPI, Prisma, migration, web route, dependency, lockfile
  or CI workflow is changed by this closure.

Green validation, a complete synthetic demo walkthrough, a complete static
template or an empty issue list is repository consistency evidence only. It is
not business approval, privacy approval, security approval, teacher validation,
restore readiness, independent-review approval or Wave 7 activation.

## Closure evidence summary

The static template now makes the future activation request shape explicit:

- each required gate section has a named evidence category;
- missing, partial or synthetic-only evidence remains fail-closed;
- filled real-school, person, contact, roster, approval or evidence fields are
  out of scope until a separate approved activation slice exists;
- the future activation packet must be reviewed independently and cannot be
  inferred from green CI or demo completeness.

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
  packet and final go/no-go decision;
- explicit activation slice scope, rollback conditions and expiry model.

## Activation boundary

A future Wave 7 activation request must be a separate slice and must start from
a clean git gate. It must explicitly identify any runtime, API, OpenAPI,
Prisma, migration, web, dependency, lockfile or CI workflow scope it needs.

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

The checks prove repository consistency for the static activation-packet
template only. They do not authorize real school onboarding, production use or
Wave 7 beta.

## Scope-guard audit

This closure is admitted only through exact path guards. No broad
`docs/wave-7-prep/`, `docs/`, `packages/curriculum/`, `apps/api/`,
`apps/web/`, `.github/` or wildcard allowance is introduced.

Any future slice must declare its exact scope, preserve the blocked real-school
boundary unless separately approved and run full validation.
