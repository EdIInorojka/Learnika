# Pre-Wave 7 / Slice 26 — school beta activation packet checklist

Status: `CHECKLIST_BLOCKED_NON_PRODUCTION`

This checklist is a static review aid for a future school beta activation packet. It is not an
activation packet, production approval, evidence record, legal-basis record, reviewer decision,
identity binding, or machine-readable production artifact.

## Baseline

- Wave 6 is closed only as a static diagnostic governance foundation.
- The synthetic school demo foundation is closed for non-production demonstration use only.
- The static school-beta gate foundation is closed through the activation-packet template and
  template closure gate.
- The school beta acceleration roadmap exists as planning guidance only.
- Real Wave 7 school beta remains `BLOCKED`.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Production school data count remains `0`.
- Real school count remains `0`.
- Production approvals count remains `0`.

## Checklist rules

Every checklist item below must remain `EMPTY_DEFERRED` or `BLOCKED_UNTIL_APPROVED` in this slice.
The checklist may be used to prepare a later approval review, but it does not satisfy any gate by
itself.

## 1. Business and design-partner section

Status: `EMPTY_DEFERRED`

Future packet section must include:

- named design-partner school candidate after separate business approval;
- school contact and authority model after separate privacy/legal review;
- pilot purpose, expected duration, and non-production/prototype limits;
- explicit confirmation that the current synthetic demo is not real school beta launch.

Must remain empty in this slice:

- real organization names;
- real school names;
- real contact details;
- real signatures;
- production acceptance statements.

Fail-closed denial conditions:

- any real school identity appears before the business gate is approved;
- any packet wording implies that Wave 7 beta is already active;
- the packet omits synthetic-demo versus real-beta separation.

## 2. Privacy and data-processing section

Status: `EMPTY_DEFERRED`

Future packet section must include:

- legal basis and consent/notice plan for any future school-provided data;
- data minimization boundary for teachers, students, parents, classes, and school staff;
- retention, deletion, export, and incident-response references;
- explicit prohibition on using real school data in the current synthetic demo.

Must remain empty in this slice:

- legal-basis records;
- consent records;
- personal data samples;
- emails, phone numbers, addresses, identifiers, or account references;
- production data-processing approvals.

Fail-closed denial conditions:

- any real PII appears in docs, tests, seed data, logs, or demo pages;
- any privacy statement claims legal compliance instead of requiring later review;
- any future data import is described as active.

## 3. Security and tenant-isolation section

Status: `EMPTY_DEFERRED`

Future packet section must include:

- school tenancy boundary and separation from family tenancy;
- authorization and tenant-isolation test evidence for future real-school paths;
- read/write surface inventory for the activation slice;
- audit, backup, restore, and access-control review expectations.

Must remain empty in this slice:

- security approval records;
- access grants;
- real tenant IDs;
- production audit logs;
- runtime isolation changes.

Fail-closed denial conditions:

- any API, web, Prisma, OpenAPI, migration, dependency, lockfile, or CI workflow mutation is bundled
  into this checklist slice;
- any future isolation test is treated as already sufficient for real school data;
- any family-school cross-link is created without a separate approved slice.

## 4. Teacher workflow validation section

Status: `EMPTY_DEFERRED`

Future packet section must include:

- teacher-facing workflow walkthrough scope;
- class, assignment, roster, and analytics validation goals;
- evidence plan for teacher feedback without collecting unnecessary personal data;
- explicit non-goals for payments, production activation, and broad admin tooling.

Must remain empty in this slice:

- teacher identities;
- feedback records;
- assignments to real users;
- real classroom artifacts;
- production validation decisions.

Fail-closed denial conditions:

- any teacher workflow validation is represented as complete before a named pilot and review;
- any mutation-capable workflow is introduced without explicit authorization;
- any real student or teacher record is added.

## 5. Restore-readiness section

Status: `BLOCKED_UNTIL_APPROVED`

Future packet section must include:

- exact blockers to remove before readiness can change;
- validation commands and deterministic evidence requirements;
- rollback and withdrawal references;
- explicit statement that green validation does not by itself authorize readiness.

Must remain unchanged in this slice:

- diagnostic readiness: `NOT_READY`;
- diagnostic activation: `BLOCKED`;
- diagnostic workflow: non-activated;
- satisfied prerequisites: `0`;
- production approvals: `0`.

Fail-closed denial conditions:

- any readiness transition is proposed as already approved;
- any blocker is removed without a separate activation/closure gate;
- any checklist row is converted into an executable readiness artifact.

## 6. Independent-review section

Status: `EMPTY_DEFERRED`

Future packet section must include:

- reviewer independence requirements;
- separation-of-duties and conflict-of-interest checks;
- evidence package review expectations;
- dissent, escalation, and withdrawal handling.

Must remain empty in this slice:

- reviewer names;
- reviewer identities;
- reviewer assignments;
- review decisions;
- approval or dissent records.

Fail-closed denial conditions:

- any review identity appears before audit identity policy approval;
- any checklist item claims independent review completion;
- any review decision is created in documentation or machine-readable artifacts.

## 7. Activation-slice scope and rollback boundary

Status: `BLOCKED_UNTIL_APPROVED`

Future packet section must include:

- exact activation slice scope;
- exact rollback and withdrawal triggers;
- data-removal and access-disablement plan;
- validation order and fail-closed stop points.

Must remain empty in this slice:

- activation event records;
- rollback events;
- withdrawal events;
- authority grants;
- machine-readable production transition artifacts.

Fail-closed denial conditions:

- the activation slice includes unreviewed runtime or data-surface changes;
- rollback is described without a concrete future owner and validation plan;
- the packet assumes activation can occur without the unresolved gates.

## 8. Final fail-closed review

Status: `BLOCKED_UNTIL_APPROVED`

Before any future real beta activation, reviewers must confirm:

- the packet contains only approved future evidence;
- no real data entered the synthetic demo track early;
- no runtime production path was activated by a planning slice;
- readiness, activation, and school beta gates are updated only by a separately approved slice.

This slice records no reviewer confirmation.

## Non-goals

This checklist does not:

- name real schools, organizations, teachers, students, parents, or reviewers;
- create evidence, approvals, legal-basis records, consent records, or audit identities;
- change readiness, activation, workflow state, blockers, prerequisites, or production approvals;
- change runtime, API, OpenAPI, Prisma, migrations, database, web, dependencies, lockfile, or CI
  workflow;
- create production learner diagnostics, school beta records, or real school data;
- satisfy any Wave 5, Wave 6, or Pre-Wave 7 gate.

## Acceleration value

The checklist reduces later review friction by making the activation packet review sequence
explicit. It does not replace gate ownership, independent review, privacy/legal approval,
security/isolation review, or a future activation slice.

## Stop conditions

Stop and create a separately approved activation or review slice if any future work needs:

- real school or person data;
- legal-basis or consent records;
- reviewer identity or decision records;
- production approval artifacts;
- runtime/API/OpenAPI/Prisma/migration/web/dependency/lockfile/CI workflow changes;
- readiness or activation transitions.

## Validation expectations

A future implementation or activation slice must still pass the full validation suite, including:

- `pnpm.cmd run format:check`;
- `pnpm.cmd run lint`;
- `pnpm.cmd run typecheck`;
- `pnpm.cmd run test`;
- `pnpm.cmd run validate`;
- `pnpm.cmd run infra:validate`;
- `pnpm.cmd run db:validate`;
- `pnpm.cmd run db:migrate:deploy`;
- `git diff --check`.

Passing validation for this checklist does not authorize readiness, activation, production school
data, or real Wave 7 beta.
