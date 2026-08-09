# Pre-Wave 7 / Slice 30 — school beta pre-activation stop/go rubric

Status: `STOP_GO_RUBRIC_BLOCKED_NON_PRODUCTION`

This document is a static, non-authorizing rubric for deciding whether a future
real Wave 7 school-beta activation request is complete enough to enter review.
It does not start Wave 7, approve a school beta, name a design-partner school,
create production school records or authorize real school data processing.

## Baseline

- Wave 6 is closed only as a static diagnostic governance foundation.
- The synthetic school demo foundation is closed for non-production
  demonstration use only.
- The school beta gate foundation, activation-packet template, activation
  checklist, acceleration roadmap, future implementation slice map, synthetic
  demo regression matrix and risk register exist as static planning artifacts
  only.
- Real Wave 7 school beta remains `BLOCKED`.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Production school data count remains `0`.
- Real school count remains `0`.
- Production approvals count remains `0`.

## Purpose

The purpose of this rubric is to reduce ambiguity before any future activation
request. It defines a fail-closed stop/go review model that can later be applied
to a separately prepared activation packet.

This rubric is not an approval record, legal-basis record, evidence record,
reviewer decision, risk acceptance, authority grant or machine-readable
production transition artifact.

## Decision vocabulary

- `STOP_BLOCKED`: the activation request is incomplete and cannot enter review.
- `READY_FOR_REVIEW_ONLY`: the packet appears complete enough for a separate
  approval review, but no beta is active.
- `REQUIRES_REMEDIATION`: reviewers found a bounded gap that must be fixed in a
  separate slice before review continues.
- `OUT_OF_SCOPE`: the request attempts to include unapproved production work,
  real data or broad runtime scope.

Current decision for this slice: `STOP_BLOCKED`.

## Rubric dimensions

Every dimension below must be satisfied by separate approved evidence before a
future request can move from `STOP_BLOCKED` to `READY_FOR_REVIEW_ONLY`.

| ID | Dimension | Future required evidence | Stop condition if missing | Current status |
| --- | --- | --- | --- | --- |
| W7-SG-001 | Business and design-partner gate | Approved pilot purpose, named design partner, accountable business owner, support owner, success criteria and stop conditions. | Real beta scope or support accountability is undefined. | `STOP_BLOCKED` |
| W7-SG-002 | Privacy and data-processing gate | Approved legal basis, notice/consent path, data-processing roles, field inventory, retention, deletion and export model. | Any real school, teacher, student or parent data would enter without approved basis. | `STOP_BLOCKED` |
| W7-SG-003 | Data minimization | Approved import and storage field set with explicit rejection of unsupported fields. | Real roster import can collect excessive identifiers or sensitive school records. | `STOP_BLOCKED` |
| W7-SG-004 | School-family separation | Authorization model and negative tests proving school and family contexts remain separated. | School users can infer or access family data outside an approved relationship. | `STOP_BLOCKED` |
| W7-SG-005 | Security and tenant isolation | Threat model, role matrix, tenant-isolation tests, support-access rules and audit boundaries. | Organization, school, class, family, support or export boundaries are untested. | `STOP_BLOCKED` |
| W7-SG-006 | Restore readiness | Tenant-scoped backup/restore drill evidence, restore owner, validation steps and pilot-exit interaction. | Restore can fail or leak data across tenants during incident recovery. | `STOP_BLOCKED` |
| W7-SG-007 | Teacher workflow validation | Evidence that assignment, delivery, analytics, print and manual-review flows fit classroom constraints. | Teacher burden or workflow mismatch can invalidate the pilot. | `STOP_BLOCKED` |
| W7-SG-008 | Analytics interpretation | Aggregation, small-cohort suppression and interpretation disclaimers for class analytics. | Analytics can become unsupported mastery/proficiency claims or expose small cohorts. | `STOP_BLOCKED` |
| W7-SG-009 | Assessment content rights | Rights-safe content sourcing and review evidence for any beta assessment or print material. | Protected textbook content or unreviewed items can enter the pilot. | `STOP_BLOCKED` |
| W7-SG-010 | OMR and manual review | Confidence states, teacher confirmation rules and no-automatic-final-result boundaries. | Ambiguous or open responses can be treated as final without review. | `STOP_BLOCKED` |
| W7-SG-011 | Support and incident response | Least-privilege support model, reason capture, escalation owner, audit events and incident runbook. | Sensitive support access or incidents are unaudited or ownerless. | `STOP_BLOCKED` |
| W7-SG-012 | External integration boundary | Explicit confirmation that electronic journal, identity-provider and other integrations remain separately gated. | Scope expands into unreviewed integration work. | `STOP_BLOCKED` |
| W7-SG-013 | Activation slice scope | Exact changed paths, read/write surface inventory, rollback triggers and stop points for the future activation slice. | Activation bundles too much runtime, data, import, analytics or workflow scope. | `STOP_BLOCKED` |
| W7-SG-014 | Synthetic evidence separation | Activation packet distinguishes synthetic demo consistency evidence from real pilot approval evidence. | Synthetic demo validation is misused as production or real-school evidence. | `STOP_BLOCKED` |
| W7-SG-015 | Independent review | Independent reviewer authority, separation-of-duties, conflict disclosure, evidence review and expiry conditions. | Approval lacks credible independent review or conflict handling. | `STOP_BLOCKED` |

## Stop/go interpretation

### STOP

The request must remain stopped if any rubric dimension is `STOP_BLOCKED`,
`REQUIRES_REMEDIATION` or `OUT_OF_SCOPE`.

Current repository state is `STOP_BLOCKED` because no real design-partner school
is approved, no privacy/legal evidence is recorded, no real security/isolation
review evidence is recorded, no restore drill evidence is recorded and no
independent-review decision exists.

### READY_FOR_REVIEW_ONLY

`READY_FOR_REVIEW_ONLY` may be assigned only by a future review slice after all
required evidence exists outside this rubric and the activation packet is
complete. It means the request can be reviewed. It does not mean the beta is
active.

### GO

This rubric intentionally does not define an automatic `GO` state. Any real
activation requires a separate, explicit activation decision after review.

## Required packet links

A future activation request must reference, without embedding real personal
data in this repository:

- business/design-partner approval;
- privacy/data-processing approval;
- security and tenant-isolation review;
- teacher workflow validation;
- restore readiness evidence;
- independent-review decision;
- exact activation-slice scope and rollback plan;
- unresolved-risk disposition from the risk register.

This slice records no such links, evidence or approvals.

## Fail-closed rules

Stop and return `BLOCK` if future work requires any of the following before a
separate activation slice is approved:

- real school, teacher, student, parent, reviewer or design-partner identity;
- real roster rows, assignment records, submissions, analytics, support cases
  or audit events;
- production approval, legal-basis record, consent record, evidence record,
  reviewer decision or risk acceptance record;
- API, OpenAPI, Prisma, migration, web route, dependency, lockfile or CI
  workflow changes not explicitly authorized for that slice;
- weakening tenant-isolation, no-PII, no-mutation or exact-scope guarantees;
- treating synthetic demo validation as real pilot evidence;
- changing diagnostic readiness from `NOT_READY` or activation from `BLOCKED`;
- treating this rubric as approval to start real Wave 7.

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
rubric only. It does not authorize real school onboarding, production use or
Wave 7 beta.
