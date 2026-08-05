# Pre-Wave 7 / Slice 20 — school beta restore readiness gate

Status: `BLOCKED_NON_PRODUCTION`

This gate is a static planning artifact. It does not start Wave 7, does not
approve a school beta and does not authorize real school, teacher, student,
parent, roster, assignment, submission, analytics, backup or restore data
processing.

## Decision

Real Wave 7 remains `BLOCKED`.

The synthetic school demo can support product conversations, but a real school
pilot requires explicit backup, restore, export and pilot-exit readiness before
any production-like school workflow is enabled.

## Current baseline

- The synthetic school demo foundation is closed.
- The business and design-partner gate remains `BLOCKED_NON_PRODUCTION`.
- The data-processing and privacy gate remains `BLOCKED_NON_PRODUCTION`.
- The security and isolation review gate remains `BLOCKED_NON_PRODUCTION`.
- The teacher workflow validation gate remains `BLOCKED_NON_PRODUCTION`.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Real Wave 7 school beta remains `BLOCKED`.
- Production school data count remains `0`.
- Real school count remains `0`.

## Restore readiness prerequisites

Before any real school pilot can begin, the project must approve:

1. school-beta backup scope by data class and tenant boundary;
2. recovery objectives for pilot-critical school workflows;
3. restore drill procedure and owner;
4. tenant-scoped restore validation for organization, school, class, roster,
   assignment, submission, analytics, audit and license records;
5. deletion, export and retention interaction with restore and backups;
6. pilot termination and data exit plan;
7. incident communication and support escalation model;
8. restore evidence retention and review process;
9. denial cases for unsafe partial restores or cross-tenant recovery;
10. independent review acceptance criteria for restore readiness.

None of these prerequisites is satisfied by this document.

## Required restore evidence before activation

A future Wave 7 activation packet must include evidence that the team can:

- restore school data without crossing organization, school, class, family or
  support boundaries;
- identify which records are inside and outside a school pilot restore scope;
- recover teacher assignment, roster, delivery and analytics state without
  creating unsupported mastery, grading or proficiency claims;
- preserve audit continuity across restore and rollback operations;
- respect approved deletion, retention and export constraints during restore;
- recover from failed roster imports, delivery setup, print/answer-sheet
  generation and manual-review queues;
- explain expected recovery time and data-loss bounds to school stakeholders;
- prove that backup and restore evidence does not contain raw learner work,
  raw media, contacts, secrets or private family data.

Evidence must use approved pilot data only after the business,
design-partner, privacy, security and teacher workflow gates are approved.
Until then, only synthetic evidence is allowed.

## Required denial cases

A future implementation must fail closed when:

- a restore request references an unnamed or unapproved real school;
- a restore scope includes another organization, school, class, family or
  private homework context;
- backup material contains secrets, raw media, raw learner text, contact data or
  unsupported provider payloads outside an approved retention policy;
- restore would resurrect data already deleted under an approved deletion or
  pilot-exit process;
- class analytics could expose small cohorts after restore;
- support actors attempt restore without time-bound authority, reason and audit
  evidence;
- restore evidence is missing, incomplete or not independently reviewed;
- green validation is treated as restore readiness approval.

These are future implementation requirements only. No runtime enforcement is
added here.

## Explicit non-goals

This gate does not:

- name real schools, teachers, students, parents or design partners;
- create backup jobs, restore jobs, export jobs, deletion jobs, audit events,
  support access grants, production approvals or restore evidence;
- create real rosters, assignments, submissions, analytics, print artifacts,
  answer sheets, OMR records or manual-review records;
- approve a retention schedule, recovery objective, pilot exit plan or support
  operating model;
- add or change API, OpenAPI, Prisma, migrations, runtime, web routes,
  dependencies, lockfile or CI workflow;
- activate diagnostic readiness or diagnostic review workflow;
- authorize real roster imports, invitations, school-family linking,
  assignment delivery, analytics, PDF/print, OMR or manual review.

## Fail-closed boundary

If the restore scope, backup policy, recovery objectives, tenant-isolation
evidence, deletion/export interaction, incident plan, support authority,
restore drill evidence or independent review is missing, the only valid
real-school state is `BLOCKED`.

Green repository validation and synthetic walkthroughs are repository
consistency evidence only. They do not authorize real school onboarding,
backup/restore readiness, school beta launch or production use.

## Minimum future approval packet

A future Wave 7 activation request should include:

- approved business and design-partner gate;
- approved data-processing and privacy gate;
- approved security and isolation review gate;
- approved teacher workflow validation gate;
- backup scope and recovery objectives;
- tenant-isolated restore drill evidence;
- deletion, export, retention and pilot-exit plan;
- support and incident escalation readiness;
- QA and independent-review sign-off;
- explicit approval to enable real school beta workflows.

Until that packet exists, real Wave 7 remains `BLOCKED`.
