# Pre-Wave 7 / Slice 23 — school beta activation packet template

Status: `TEMPLATE_BLOCKED_NON_PRODUCTION`

This document is a static template for a future Wave 7 activation request. It
is not an approval record, does not start Wave 7 and does not authorize real
school, teacher, student, parent, roster, assignment, submission, analytics,
audit, backup, restore, support or production data processing.

## Decision boundary

Real Wave 7 remains `BLOCKED`.

This template exists only to make the future approval packet explicit and
reviewable. Every field that would contain real school, person, account,
contact, roster, evidence, authority, approval or production data must remain
empty until a separate approved activation slice is opened.

## Current baseline

- The synthetic school demo foundation is closed.
- The static school beta gate foundation is closed.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Real Wave 7 school beta remains `BLOCKED`.
- Production school data count remains `0`.
- Real school count remains `0`.
- Production approvals count remains `0`.

## Activation packet sections

A future activation request must provide all sections below in a separate
approval slice. Missing, partial or synthetic-only evidence must keep Wave 7
`BLOCKED`.

### 1. Business and design-partner gate

Required future evidence:

- named business owner;
- pilot objective and stop conditions;
- budget and support ownership;
- renewal-intent and teacher-time metrics;
- named design-partner schools approved outside this repository;
- school-side sponsor and coordinator roles.

Template status for this slice: `EMPTY_DEFERRED`.

### 2. Data-processing and privacy gate

Required future evidence:

- processing purpose matrix;
- legal basis or consent/notice plan;
- field inventory and PII classification;
- retention, deletion, export and backup-propagation model;
- analytics small-cohort suppression policy;
- privileged support-access and audit policy.

Template status for this slice: `EMPTY_DEFERRED`.

### 3. Security and isolation gate

Required future evidence:

- school beta threat model;
- role authorization matrix;
- tenant-isolation test matrix;
- negative tests for organization, school, class, family and support
  boundaries;
- export, deletion, correction and support authorization tests;
- incident response owner and runbook.

Template status for this slice: `EMPTY_DEFERRED`.

### 4. Teacher workflow validation gate

Required future evidence:

- teacher participant criteria;
- assignment builder acceptance criteria;
- online delivery acceptance criteria;
- class analytics interpretation boundary;
- PDF/print and answer-sheet acceptance criteria;
- OMR/manual-review confirmation boundary;
- teacher-time and renewal-intent measurement plan.

Template status for this slice: `EMPTY_DEFERRED`.

### 5. Restore readiness gate

Required future evidence:

- school-beta backup scope by tenant and data class;
- recovery objectives;
- restore drill procedure and owner;
- tenant-scoped restore validation evidence;
- deletion, export, retention and pilot-exit interaction;
- incident communication and support escalation model.

Template status for this slice: `EMPTY_DEFERRED`.

### 6. Independent-review gate

Required future evidence:

- independent reviewer role and authority;
- independence and conflict-of-interest disclosure;
- review packet completeness assessment;
- negative decision and remediation workflow;
- expiry, rollback and post-approval monitoring conditions;
- explicit go/no-go decision.

Template status for this slice: `EMPTY_DEFERRED`.

## Required fail-closed checks

A future activation request must fail closed when:

- any required gate section is missing;
- design-partner schools are unnamed;
- school or person data is introduced without approved legal/privacy basis;
- tenant-isolation evidence does not cover school-family boundaries;
- teacher workflow validation uses synthetic-only evidence as real pilot
  evidence;
- restore readiness is untested or cross-tenant recovery risk remains open;
- independent reviewer authority, independence or conflict disclosure is
  missing;
- approval scope, expiry or rollback conditions are absent;
- green validation is treated as activation approval.

## Explicit non-goals

This template does not:

- name real schools, organizations, teachers, students, parents, reviewers or
  design partners;
- create real identities, accounts, rosters, assignments, submissions,
  analytics, print artifacts, answer sheets, OMR records, manual-review
  records, exports, deletions, backups, restores, support cases or audit
  events;
- create production approvals, authority grants, legal-basis records, consent
  records, reviewer assignments, conflict disclosures or evidence records;
- change runtime, API, OpenAPI, Prisma, migrations, web routes, dependencies,
  lockfile or CI workflow;
- activate diagnostic readiness or diagnostic review workflow;
- authorize real roster imports, invitations, school-family linking,
  assignment delivery, analytics, PDF/print, OMR or manual review.

## Template handling rules

- Keep all future evidence fields empty in this slice.
- Do not convert this document into a machine-readable approval artifact.
- Do not add real names, contacts, account identifiers, roster rows, storage
  keys, URLs, raw learner work, raw media, secrets or provider payloads.
- Treat any filled approval/evidence section as out of scope until a separate
  activation slice is explicitly approved.
- Preserve exact path guards; no broad `docs/`, `docs/wave-7-prep/`,
  `packages/curriculum/`, `apps/api/`, `apps/web/`, `.github/` or wildcard
  allowances are permitted.

## Validation expectations

This template slice must pass:

- `pnpm.cmd run format:check`;
- `pnpm.cmd run lint`;
- `pnpm.cmd run typecheck`;
- `pnpm.cmd run test`;
- `pnpm.cmd run validate`;
- `pnpm.cmd run infra:validate`;
- `pnpm.cmd run db:validate`;
- `pnpm.cmd run db:migrate:deploy`;
- `git diff --check`.

The checks prove repository consistency for this static template only. They do
not authorize real school onboarding, production use or Wave 7 beta.
