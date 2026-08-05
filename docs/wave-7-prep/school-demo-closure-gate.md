# Pre-Wave 7 / Slice 15 — synthetic school demo closure gate

## Decision

`APPROVE PRE-WAVE 7 SYNTHETIC SCHOOL DEMO FOUNDATION CLOSURE`.

This closure gate closes the synthetic, school-shaped demo foundation delivered
through Slice 14. It does not start real Wave 7, approve a school beta, name a
design-partner school, create production school records or authorize real
school data processing.

Real Wave 7 remains `BLOCKED` until both external gates are approved:

1. the business gate approves pilot economics, support ownership, privacy,
   security and operational readiness; and
2. named design-partner schools are approved outside this repository.

## Closed synthetic foundation

The closed foundation contains only synthetic or read-only demo capability:

- school tenancy schema foundation for organization, school, academic year,
  class, subject group, teacher assignment, enrollment, license and
  entitlement ownership;
- deterministic `ru-RU` synthetic seed data for one disposable school-shaped
  scenario;
- read-only synthetic school snapshot API and web surfaces;
- dashboard, class drilldown, teacher-facing overview and compact summary;
- restrained school-ready visual polish with local-only light/dark demo theme;
- guided presentation flow, teacher/admin handoff pack, pilot checklist,
  pilot configuration preview and rollout preview;
- exact scope guards and focused regression tests for the demo continuation
  chain.

The browser demo surfaces are:

- `/school-demo`;
- `/school-demo/classes/[classCode]`;
- `/school-demo/summary`;
- `/school-demo/handoff`;
- `/school-demo/pilot`;
- `/school-demo/pilot-config`;
- `/school-demo/rollout`.

## Preserved boundary

The closure preserves these non-negotiable boundaries:

- diagnostic readiness remains `NOT_READY`;
- diagnostic activation remains `BLOCKED`;
- diagnostic workflow remains non-activated;
- school beta remains `BLOCKED`;
- production data count remains `0`;
- real school count remains `0`;
- no real school, organization, teacher, student, parent or design partner is
  named;
- no real names, contact details, addresses, account identifiers, roster rows
  or production learner records are introduced;
- no mutations, operational intake, invitations, identity-provider integration
  or auth/session changes are authorized;
- no payments, family-domain links, production analytics, grades, mastery,
  proficiency, answer checking, hints, solutions, OMR or manual-review result
  workflow is activated.

Green validation, a complete demo walkthrough or an empty issue list is
consistency evidence only. It is not school-beta approval and does not satisfy
any future legal, privacy, support, product, security or design-partner gate.

## Demo evidence summary

The synthetic demo can now be shown as a coherent school-ready route:

1. overview of the synthetic organization, school and academic year;
2. class list and class drilldown for grades 7–9;
3. teacher assignments and subject groups;
4. license and entitlement boundary;
5. compact one-screen summary for meetings;
6. teacher/admin handoff pack;
7. pilot checklist and FAQ;
8. pilot configuration preview;
9. rollout and integration preview.

All displayed values must remain synthetic demo codes. Any fixture or page
that cannot be proven synthetic must fail closed and stay out of the demo.

## Deferred decisions

The following remain open and require separate approval before real Wave 7:

- named design-partner schools and accountable school owners;
- legal basis, consent path, data-processing roles and retention/deletion
  policy for real school data;
- school identity provider, teacher account, role grant and session model;
- real CSV/XLSX import preview, persistence, rejection, deletion and audit
  policy;
- family-school linking and any shared visibility policy;
- assignment builder, delivery, analytics, PDF/print and OMR/manual-review
  implementation boundaries;
- support, escalation, incident response, backup/restore and exit procedures;
- OpenAPI/API contract exposure for any non-demo school workflow;
- security, privacy, accessibility and independent release review.

## Validation expectations

This closure gate must pass:

- `pnpm.cmd run format:check`;
- `pnpm.cmd run lint`;
- `pnpm.cmd run typecheck`;
- `pnpm.cmd run test`;
- `pnpm.cmd run validate`;
- `git diff --check`.

The checks prove repository consistency for the synthetic foundation only.
They do not authorize real school onboarding, production use or Wave 7 beta.

## Scope-guard audit

This closure is admitted only through exact path guards. No broad
`docs/wave-7-prep/`, `docs/`, `packages/curriculum/`, `apps/api/`,
`apps/web/`, `.github/` or wildcard allowance is introduced.

The closure path is a documentation continuation only. Any future slice must
start with a clean git gate, declare its exact scope, preserve the synthetic
boundary unless separately approved and run full validation.
