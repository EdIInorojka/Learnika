# Pre-Wave 7 / Slice 32 — school beta external decision request index

Status: `EXTERNAL_DECISION_REQUEST_BLOCKED_NON_PRODUCTION`

This document is a static index of external decisions that must be collected
before a future real Wave 7 school-beta activation request can be opened. It
does not start real Wave 7, approve a school beta, name a design-partner
school, create production school records or authorize real school data
processing.

## Baseline

- Wave 6 is closed only as a static diagnostic governance foundation.
- The synthetic school demo foundation is closed for non-production
  demonstration use only.
- The school beta gate foundation is closed.
- The activation-packet template is closed as a static template only.
- The acceleration and pre-activation planning foundation is closed through
  the static acceleration closure gate.
- Real Wave 7 school beta remains `BLOCKED`.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Stop/go status remains `STOP_BLOCKED`.
- Production school data count remains `0`.
- Real school count remains `0`.
- Production approvals count remains `0`.

## Purpose

The purpose of this index is to make the next non-code work explicit. It lists
the external decisions that must be obtained outside this repository before the
team can safely request a real school-beta activation review.

This index is not an evidence record, approval record, legal-basis record,
reviewer decision, authority grant, risk acceptance or machine-readable
production transition artifact.

## Decision request model

- `REQUEST_ONLY`: the decision must be requested later; no answer is recorded
  here.
- `EVIDENCE_EMPTY`: no evidence, attachment, signature or link is recorded in
  this slice.
- `OWNER_UNASSIGNED`: no real owner identity is recorded in this slice.
- `BLOCKED_UNTIL_APPROVED`: the related activation path cannot start until the
  decision is approved in a separate process.

All rows in this document remain `BLOCKED_UNTIL_APPROVED`.

## External decision requests

| ID | Decision area | Future decision needed | Required future output | Current status |
| --- | --- | --- | --- | --- |
| W7-EDR-001 | Business ownership | Decide whether a real school beta should be pursued now, with explicit accountable business owner and support owner. | Approved business gate with owner, budget boundary, support model and stop conditions. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-002 | Named design partners | Decide which real schools, if any, are approved as design partners. | Approved design-partner list outside this repository, with authority and participation boundary. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-003 | Pilot objective | Decide the pilot purpose, duration, success criteria and renewal-intent measurement. | Approved pilot brief with measurable outcomes and stop/go criteria. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-004 | Privacy/legal basis | Decide legal basis, consent or notice path, data-processing roles and jurisdiction-specific requirements. | Approved privacy/legal packet before any real school data enters the product. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-005 | Data minimization | Decide the minimum real-school field inventory for organization, school, teachers, classes, students and guardians where needed. | Approved field inventory with denied fields and deletion/export categories. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-006 | School-family relationship | Decide whether and how school and family contexts may relate, including visibility and consent boundaries. | Approved relationship policy with explicit deny-by-default behavior. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-007 | Security isolation | Decide whether the school-beta threat model, role matrix and tenant-isolation test plan are sufficient for real data. | Approved security/isolation review evidence. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-008 | Restore readiness | Decide whether tenant-scoped backup/restore, pilot exit and incident recovery are ready. | Approved restore drill evidence and recovery owner. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-009 | Teacher workflow validation | Decide whether teacher workflow evidence is sufficient for assignment, delivery, analytics, print and manual-review flows. | Approved teacher workflow validation packet. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-010 | Analytics interpretation | Decide aggregation, small-cohort suppression and interpretation limits for school analytics. | Approved analytics policy that avoids unsupported mastery or proficiency claims. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-011 | Content and rights | Decide which assessment content sources and review process are approved for any beta assessment or print material. | Approved rights-safe content sourcing and review evidence. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-012 | OMR/manual review | Decide confidence states, teacher confirmation and no-automatic-final-result rules for printed assessment processing. | Approved OMR/manual-review policy. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-013 | Support and incident response | Decide support access, reason capture, escalation path, incident owner and audit expectations. | Approved support and incident-response runbook. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-014 | External integrations | Decide whether any electronic journal, identity provider or external system integration is in scope. | Separate approved integration gate, or explicit out-of-scope confirmation. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-015 | Independent review | Decide reviewer authority, independence, conflict disclosure, evidence review and expiry conditions. | Approved independent-review packet and final activation review process. | `BLOCKED_UNTIL_APPROVED` |
| W7-EDR-016 | Activation scope | Decide exact future activation-slice scope, rollback triggers, withdrawal triggers and validation order. | Approved activation-scope brief before any runtime or data path changes. | `BLOCKED_UNTIL_APPROVED` |

## What this index intentionally does not contain

This slice records no:

- real school names;
- real organization names;
- teacher, student, parent, reviewer or design-partner identities;
- contact details, emails, phone numbers, addresses or account IDs;
- legal-basis record;
- consent record;
- evidence link or attachment;
- reviewer decision;
- authority grant;
- risk acceptance;
- production approval.

## How to use this index

A future activation request may use this index as a checklist for external
work, but every answer must be collected and approved outside this slice. If any
row remains unresolved, the only valid real-school state remains `BLOCKED`.

The current repository may continue with synthetic, non-production planning
work. It must not use this index to start real roster import, teacher accounts,
school invitations, analytics, PDF/print, OMR, manual review, support access or
external integrations.

## Fail-closed rules

Stop and return `BLOCK` if future work requires any of the following before a
separate activation slice is approved:

- real school, teacher, student, parent, reviewer or design-partner identity;
- real roster rows, assignment records, submissions, analytics, support cases
  or audit events;
- production approval, legal-basis record, consent record, evidence record,
  reviewer decision or risk acceptance record;
- API, OpenAPI, Prisma, migration, database, web route, dependency, lockfile or
  CI workflow changes not explicitly authorized for that slice;
- weakening tenant-isolation, no-PII, no-mutation or exact-scope guarantees;
- treating synthetic demo validation as real pilot evidence;
- changing diagnostic readiness from `NOT_READY` or activation from `BLOCKED`;
- treating this index as approval to start real Wave 7.

## Validation expectations

This planning slice must pass:

- `pnpm.cmd run format:check`;
- `pnpm.cmd run lint`;
- `pnpm.cmd run typecheck`;
- `pnpm.cmd run test`;
- `pnpm.cmd run validate`;
- `pnpm.cmd run infra:validate`;
- `pnpm.cmd run db:validate`;
- `pnpm.cmd run db:migrate:deploy`;
- `git diff --check`.

Passing validation for this slice proves repository consistency for the static
decision-request index only. It does not authorize real school onboarding,
production use or Wave 7 beta.
