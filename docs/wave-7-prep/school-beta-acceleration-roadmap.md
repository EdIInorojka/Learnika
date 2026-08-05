# Pre-Wave 7 / Slice 25 — school beta acceleration roadmap

Status: `ROADMAP_BLOCKED_NON_PRODUCTION`

This document is a static execution roadmap for accelerating the next safe
school-beta preparation work. It does not start real Wave 7, approve a school
beta, name a design-partner school, create production school records or
authorize real school data processing.

## Current baseline

- The synthetic school demo foundation is closed.
- The static school-beta gate foundation is closed.
- The activation-packet template is closed as a static template only.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Real Wave 7 school beta remains `BLOCKED`.
- Production school data count remains `0`.
- Real school count remains `0`.
- Production approvals count remains `0`.

## Acceleration principle

Development can be accelerated only by reducing ambiguity, batching review
questions and keeping implementation slices small. Acceleration must not bypass
business approval, named design-partner approval, privacy/legal review,
security isolation review, teacher workflow validation, restore readiness or
independent review.

Green validation, a clean worktree, a complete demo walkthrough or a completed
static template is consistency evidence only. It is not Wave 7 activation.

## Fast safe lanes

The following lanes can move quickly while real Wave 7 remains blocked.

### Lane 1 — static activation readiness packet

Goal: prepare a reviewable packet skeleton that can later be filled outside the
repository with approved real-school evidence.

Allowed now:

- checklist wording;
- packet section ordering;
- missing-evidence denial rules;
- reviewer handoff structure;
- exact scope guard updates.

Blocked now:

- real school names;
- real contacts;
- real evidence;
- approval decisions;
- authority grants;
- legal-basis records;
- machine-readable production approvals.

### Lane 2 — synthetic demo robustness

Goal: keep the existing synthetic demo reliable for school conversations while
preserving the non-production boundary.

Allowed now:

- read-only demo copy improvements;
- synthetic-only validation notes;
- presentation flow refinements;
- accessibility or readability improvements;
- tests that prove no mutations, no PII and no real-school data.

Blocked now:

- real roster import;
- invitations;
- teacher accounts;
- school identity provider integration;
- production analytics;
- grading, answer checking, OMR result or manual-review result workflows.

### Lane 3 — implementation readiness decomposition

Goal: pre-split the future Wave 7 implementation into small slices so the team
can execute quickly after approval.

Allowed now:

- path-level implementation planning;
- dependency ordering;
- test matrix planning;
- rollback and stop-condition planning;
- explicit non-goals for each future implementation slice.

Blocked now:

- Prisma schema changes for new real-school workflows;
- API or OpenAPI routes for production beta;
- web routes beyond synthetic demo surfaces;
- CI workflow mutation;
- dependency and lockfile changes.

### Lane 4 — external decision capture

Goal: list the exact external decisions required before activation so the team
can gather them without changing product code.

Allowed now:

- decision inventory;
- owner placeholders without real identities;
- required evidence categories;
- expiration and re-review rules.

Blocked now:

- named owners;
- real reviewer identities;
- real conflict disclosures;
- signed approvals;
- production legal or security claims.

## Recommended next slices

The following sequence is optimized for speed while preserving fail-closed
boundaries:

1. **Activation packet checklist** — convert the closed template into a
   checklist-only document with empty placeholders and denial cases.
2. **Future implementation slice map** — split approved-after-gate Wave 7 work
   into exact, dependency-ordered implementation slices.
3. **Synthetic demo regression matrix** — document the read-only/no-PII/no-real
   school checks that must remain green during presentation changes.
4. **School beta risk register** — consolidate remaining business, privacy,
   security, teacher-workflow, restore and independent-review risks.
5. **Pre-activation stop/go rubric** — define a non-authorizing rubric for
   deciding whether an activation request is complete enough for review.

Each item must be its own slice with a clean git gate, exact scope and full
validation. None of these slices may create real school data or activate Wave 7.

## Stop conditions

Stop and return `BLOCK` if a proposed acceleration slice requires:

- real school, teacher, student, parent, reviewer or design-partner identity;
- real roster rows, assignment records, submissions, analytics or audit events;
- production approval, legal-basis record, consent record or evidence record;
- API, OpenAPI, Prisma, migration, web route, dependency, lockfile or CI
  workflow changes not explicitly authorized for that slice;
- weakening tenant-isolation, no-PII, no-mutation or exact-scope guarantees;
- treating synthetic evidence as real pilot evidence;
- changing diagnostic readiness from `NOT_READY` or activation from `BLOCKED`.

## Execution rules

- Start every slice with `git status --short --branch`.
- If the worktree is dirty, stop before editing.
- Prefer docs/static planning slices until real Wave 7 gates are approved.
- Keep allowlists exact; never add broad `docs/`, `docs/wave-7-prep/`,
  `packages/curriculum/`, `apps/api/`, `apps/web/`, `.github/` or wildcard
  allowances.
- Run full validation before returning `APPROVE`.
- Provide commit and push commands only after a successful `APPROVE` verdict.

## Preserved non-goals

This roadmap does not authorize:

- real Wave 7 school beta;
- production school onboarding;
- real school, teacher, student, parent, reviewer or design-partner records;
- real legal, privacy, security, restore or independent-review approvals;
- mutations, invitations, real import, assignments, submissions, analytics,
  PDF/print, OMR, manual review or support workflows;
- learner-facing diagnostics readiness changes;
- runtime, API, OpenAPI, Prisma, migration, web, dependency, lockfile or CI
  workflow changes.

Acceleration means smaller reviewed slices and less ambiguity. It does not
mean bypassing gates.
