# Pre-Wave 7 / Slice 29 — school beta risk register

Status: `RISK_REGISTER_BLOCKED_NON_PRODUCTION`

This document is a static risk register for future Wave 7 school-beta
activation. It does not start Wave 7, approve a school beta, name a
design-partner school, create production school records or authorize real
school data processing.

## Baseline

- Wave 6 is closed only as a static diagnostic governance foundation.
- The synthetic school demo foundation is closed for non-production
  demonstration use only.
- The school beta gate foundation, activation-packet template, activation
  checklist, acceleration roadmap, future implementation slice map and
  synthetic demo regression matrix exist as static planning artifacts only.
- Real Wave 7 school beta remains `BLOCKED`.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Production school data count remains `0`.
- Real school count remains `0`.
- Production approvals count remains `0`.

## Purpose

The purpose of this risk register is to consolidate the unresolved school-beta
risks that must be addressed before any real Wave 7 activation request can be
reviewed. It is designed to speed up later review by making blockers explicit.

This register is not a risk acceptance record. It records no owner identity,
approval, waiver, evidence, legal basis, reviewer decision or production
control.

## Risk status model

- `OPEN_BLOCKED`: risk is known and blocks activation until separately
  resolved.
- `DEFERRED_OWNER_PLACEHOLDER`: future owner must be assigned outside this
  slice without recording a real identity here.
- `EVIDENCE_EMPTY`: no production evidence is recorded in this slice.
- `NO_ACCEPTANCE`: no risk is accepted in this slice.

All risks in this document remain `OPEN_BLOCKED`.

## Risk register

| ID | Area | Risk | Impact if unresolved | Required future mitigation | Status |
| --- | --- | --- | --- | --- | --- |
| W7-RISK-001 | Business/design partner | Real design-partner schools are not named and no accountable business owner is approved. | Real beta scope, support burden and success criteria remain undefined. | Business gate must approve named design partners, pilot purpose, support owner and stop conditions. | `OPEN_BLOCKED` |
| W7-RISK-002 | Privacy/legal | Legal basis, consent/notice path and data-processing roles for real school data are not approved. | Real roster, teacher and student data could be processed without an approved basis. | Privacy/legal gate must approve data purpose, field inventory, roles, retention, deletion and notice/consent path. | `OPEN_BLOCKED` |
| W7-RISK-003 | Data minimization | Future import scope could collect excessive identifiers or sensitive school records. | Unnecessary PII and sensitive operational data increase compliance and breach risk. | Import format must be minimized, reviewed and fail-closed for unsupported fields before any real import. | `OPEN_BLOCKED` |
| W7-RISK-004 | School-family separation | School tenancy could be linked to family tenancy without an approved relationship model. | Teachers or school admins could access family/child data outside consent and purpose boundaries. | Authorization model must explicitly separate school and family contexts and test cross-tenant denials. | `OPEN_BLOCKED` |
| W7-RISK-005 | Security/isolation | Tenant-isolation tests may not cover organization, school, class, family, support and export boundaries. | Cross-tenant data leakage or privilege escalation could reach real school records. | Security review must include role matrix, negative tests, support-access rules and export/deletion boundaries. | `OPEN_BLOCKED` |
| W7-RISK-006 | Restore readiness | Tenant-scoped backup and restore may not be proven before real pilot data exists. | Restore could leak data across tenants or fail during incident recovery. | Restore gate must approve drill procedure, scope, owner, validation evidence and pilot-exit interaction. | `OPEN_BLOCKED` |
| W7-RISK-007 | Teacher workflow | Teacher-facing workflows may not match classroom constraints or time burden. | Pilot can fail despite technical correctness because teachers cannot use it efficiently. | Teacher workflow validation must cover assignment builder, delivery, analytics, print and manual-review paths. | `OPEN_BLOCKED` |
| W7-RISK-008 | Analytics interpretation | Class analytics may be interpreted as unsupported mastery/proficiency claims or expose small cohorts. | Schools could make inaccurate decisions or infer sensitive learner information. | Analytics gate must define aggregation, small-cohort suppression and interpretation disclaimers. | `OPEN_BLOCKED` |
| W7-RISK-009 | Assessment content rights | Future assessment items or print variants may accidentally copy protected textbook content. | Rights exposure and content-quality failure could block pilot use. | Content sourcing must be rights-safe, reviewed and independent from copied textbook material. | `OPEN_BLOCKED` |
| W7-RISK-010 | OMR/manual review | OMR results could be treated as final without confidence states or teacher confirmation. | Incorrect grading or review outcomes could reach teachers/students. | OMR prototype must use confidence, manual-review states and teacher confirmation for ambiguous/open responses. | `OPEN_BLOCKED` |
| W7-RISK-011 | Support and incident response | Support access, escalation and incident ownership may be unclear. | Sensitive support access could be unaudited or incident response could be delayed. | Support model must include least privilege, reason capture, audit events, escalation and incident owner. | `OPEN_BLOCKED` |
| W7-RISK-012 | External integrations | Electronic journal or identity-provider integrations may be assumed before approval. | Scope expands into high-risk integration work not covered by synthetic demo gates. | Integrations must remain blocked until separate approval, data-processing review and threat model exist. | `OPEN_BLOCKED` |
| W7-RISK-013 | Activation scope creep | Future activation slice may bundle too many runtime, data, import and analytics changes. | Review becomes unreliable and rollback becomes unclear. | Activation must use exact scope, small slices, rollback triggers and stop conditions from the slice map. | `OPEN_BLOCKED` |
| W7-RISK-014 | Synthetic evidence misuse | Synthetic demo validation may be treated as proof for real school beta. | Real beta could launch without real legal, security, workflow or restore evidence. | Activation packet must distinguish synthetic consistency evidence from real pilot approval evidence. | `OPEN_BLOCKED` |
| W7-RISK-015 | Independent review | Independent reviewer authority, independence and conflict-of-interest disclosure are not assigned. | Approval may lack credible separation and release-governance evidence. | Independent-review gate must define authority, conflicts, evidence review, go/no-go and expiry conditions. | `OPEN_BLOCKED` |

## Required future evidence categories

Before any risk can move out of `OPEN_BLOCKED`, a separate approved slice must
record or reference evidence for the relevant gate:

- business/design-partner approval;
- data-processing and privacy/legal review;
- field inventory and minimization review;
- security threat model and tenant-isolation test evidence;
- restore drill evidence;
- teacher workflow validation evidence;
- analytics interpretation and small-cohort suppression policy;
- content rights and review evidence;
- OMR/manual-review confidence and confirmation policy;
- support-access and incident-response runbook;
- activation scope, rollback and withdrawal conditions;
- independent-review decision.

This slice records no such evidence.

## Risk handling rules

- Do not assign real owners, reviewers or school contacts in this register.
- Do not convert this register into a machine-readable approval or risk
  acceptance artifact.
- Do not mark a risk accepted, mitigated or closed in this slice.
- Do not use synthetic demo results as real beta evidence.
- Do not introduce runtime, API, OpenAPI, Prisma, migration, database, web,
  dependency, lockfile or CI workflow changes through a risk-register slice.
- Do not change diagnostic readiness, diagnostic activation, workflow state,
  blockers, prerequisites or production approvals.

## Stop conditions

Stop and return `BLOCK` if future work requires any of the following before a
separate activation slice is approved:

- real school, teacher, student, parent, reviewer or design-partner identity;
- real roster rows, assignment records, submissions, analytics, support cases
  or audit events;
- production approval, legal-basis record, consent record, evidence record or
  risk acceptance record;
- API, OpenAPI, Prisma, migration, web route, dependency, lockfile or CI
  workflow changes not explicitly authorized for that slice;
- weakening tenant-isolation, no-PII, no-mutation or exact-scope guarantees;
- changing diagnostic readiness from `NOT_READY` or activation from `BLOCKED`;
- treating this register as approval to start real Wave 7.

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
risk register only. It does not authorize real school onboarding, production
use or Wave 7 beta.
