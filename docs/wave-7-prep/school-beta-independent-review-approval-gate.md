# Pre-Wave 7 / Slice 21 — school beta independent-review approval gate

Status: `BLOCKED_NON_PRODUCTION`

This gate is a static planning artifact. It does not start Wave 7, does not
approve a school beta and does not authorize real school, teacher, student,
parent, roster, assignment, submission, analytics, audit, backup, restore or
support data processing.

## Decision

Real Wave 7 remains `BLOCKED`.

The synthetic school demo and the prior school beta gates can support internal
review, but a real school pilot requires explicit independent-review approval
before any production-like school workflow is enabled.

## Current baseline

- The synthetic school demo foundation is closed.
- The business and design-partner gate remains `BLOCKED_NON_PRODUCTION`.
- The data-processing and privacy gate remains `BLOCKED_NON_PRODUCTION`.
- The security and isolation review gate remains `BLOCKED_NON_PRODUCTION`.
- The teacher workflow validation gate remains `BLOCKED_NON_PRODUCTION`.
- The restore readiness gate remains `BLOCKED_NON_PRODUCTION`.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Real Wave 7 school beta remains `BLOCKED`.
- Production school data count remains `0`.
- Real school count remains `0`.

## Independent-review prerequisites

Before any real school pilot can begin, the project must approve:

1. independent reviewer role and ownership;
2. reviewer independence from implementation, sales and pilot delivery;
3. review packet completeness criteria;
4. product, security, privacy, QA and operations evidence checklist;
5. negative-decision and remediation workflow;
6. reviewer conflict-of-interest disclosure process;
7. evidence retention and auditability policy;
8. approval authority and expiry boundary;
9. post-approval monitoring and rollback trigger review;
10. final go/no-go decision process for real Wave 7 activation.

None of these prerequisites is satisfied by this document.

## Required review packet before activation

A future Wave 7 activation packet must include:

- approved business and named design-partner gate;
- approved data-processing and privacy gate;
- approved security and tenant-isolation review gate;
- approved teacher workflow validation evidence;
- approved restore readiness evidence;
- school-beta threat model and role authorization matrix;
- tenant-isolation test evidence for every school-scoped query and mutation;
- legal basis, consent, retention, deletion, export and pilot-exit evidence;
- support, incident, backup and restore runbook evidence;
- QA evidence covering online delivery, class analytics, PDF/print, OMR and
  manual review where those workflows are in scope;
- explicit reviewer decision with expiry, scope and rollback conditions.

Evidence must use approved pilot data only after the upstream gates are
approved. Until then, only synthetic evidence is allowed.

## Required denial cases

A future independent review must fail closed when:

- design-partner schools are unnamed or not approved through the business gate;
- legal basis, consent or privacy evidence is missing;
- tenant-isolation evidence is incomplete or does not cover a school-family
  boundary;
- teacher workflow validation evidence is synthetic-only but presented as real
  pilot evidence;
- restore readiness is untested or cross-tenant restore risks remain open;
- approval authority, reviewer independence or conflict disclosure is missing;
- review evidence contains secrets, contacts, raw media, raw learner text,
  private family data or unsupported provider payloads;
- open critical risks are accepted without an explicit owner and written
  decision;
- green repository validation is treated as independent-review approval.

These are future implementation and governance requirements only. No runtime
enforcement is added here.

## Explicit non-goals

This gate does not:

- name real schools, teachers, students, parents, reviewers or design partners;
- create approvals, reviewer identities, reviewer assignments, review records,
  conflict disclosures, support access grants, audit events or production
  evidence;
- create real rosters, assignments, submissions, analytics, print artifacts,
  answer sheets, OMR records, manual-review records, exports, deletions,
  backups or restores;
- approve legal basis, consent text, retention schedule, recovery objective,
  support model, security exception or risk acceptance;
- add or change API, OpenAPI, Prisma, migrations, runtime, web routes,
  dependencies, lockfile or CI workflow;
- activate diagnostic readiness or diagnostic review workflow;
- authorize real roster imports, invitations, school-family linking,
  assignment delivery, analytics, PDF/print, OMR or manual review.

## Fail-closed boundary

If independent reviewer authority, independence, review packet completeness,
conflict disclosure, security/privacy/QA/restore evidence, expiry boundary or
go/no-go decision is missing, the only valid real-school state is `BLOCKED`.

Green repository validation and synthetic walkthroughs are repository
consistency evidence only. They do not authorize independent-review approval,
real school onboarding, school beta launch or production use.

## Minimum future approval packet

A future Wave 7 activation request should include:

- approved business and design-partner gate;
- approved data-processing and privacy gate;
- approved security and isolation review gate;
- approved teacher workflow validation gate;
- approved restore readiness gate;
- complete independent-review evidence packet;
- explicit independent reviewer approval with scope, expiry and rollback
  conditions;
- QA, operations and support sign-off;
- explicit approval to enable real school beta workflows.

Until that packet exists, real Wave 7 remains `BLOCKED`.
