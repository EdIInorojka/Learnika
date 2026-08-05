# Pre-Wave 7 / Slice 19 — school beta teacher workflow validation gate

Status: `BLOCKED_NON_PRODUCTION`

This gate is a static planning artifact. It does not start Wave 7, does not
approve a school beta and does not authorize real teacher, student, parent,
school, roster, assignment, submission or analytics data processing.

## Decision

Real Wave 7 remains `BLOCKED`.

The synthetic school demo can support product conversations, but a real school
pilot requires explicit teacher workflow validation before any production-like
school workflow is enabled.

## Current baseline

- The synthetic school demo foundation is closed.
- The business and design-partner gate remains `BLOCKED_NON_PRODUCTION`.
- The data-processing and privacy gate remains `BLOCKED_NON_PRODUCTION`.
- The security and isolation review gate remains `BLOCKED_NON_PRODUCTION`.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Real Wave 7 school beta remains `BLOCKED`.
- Production school data count remains `0`.
- Real school count remains `0`.

## Teacher workflow validation prerequisites

Before any real school pilot can begin, the project must approve:

1. teacher participant criteria and validation plan;
2. school administrator and coordinator workflow boundaries;
3. assignment builder acceptance criteria;
4. online delivery acceptance criteria;
5. class roster import preview acceptance criteria;
6. class analytics interpretation boundaries;
7. PDF/print workflow acceptance criteria;
8. OMR/manual-review prototype acceptance criteria;
9. support and escalation expectations during a live pilot;
10. teacher time-saving and renewal-intent measurement plan.

None of these prerequisites is satisfied by this document.

## Required teacher validation evidence

A future Wave 7 activation packet must include evidence that teachers can
understand and complete the intended workflow without unsafe shortcuts:

- create a bounded assignment from approved content or synthetic pilot content;
- configure time, attempts, variants and accommodations;
- preview what learners will see;
- run online delivery without exposing unrelated classes or family data;
- interpret class-level analytics without making unsupported individual
  mastery or proficiency claims;
- generate and use print artifacts with safe identifiers;
- route uncertain OMR/manual-review cases to teacher confirmation;
- recover from import, delivery, print and review errors;
- understand what remains unsupported or blocked.

Evidence must use approved pilot data only after the business,
design-partner, privacy and security gates are approved. Until then, only
synthetic evidence is allowed.

## Required denial cases

A future implementation must fail closed when:

- teacher workflow validation tries to use unnamed schools or real rosters
  before approval;
- assignment creation uses unreviewed production content;
- a teacher can publish an assignment outside the assigned class or subject
  group;
- class analytics exposes identifiable small cohorts;
- PDF or answer-sheet identifiers expose personal data;
- OMR confidence is treated as a final result without teacher confirmation;
- ambiguous open responses are graded without teacher confirmation;
- teacher workflow metrics include raw learner text, media, contacts or
  private family data;
- support workflows bypass the security and privacy gates.

These are future implementation requirements only. No runtime enforcement is
added here.

## Explicit non-goals

This gate does not:

- name real schools, teachers, students, parents or design partners;
- create assignments, submissions, analytics, print artifacts, answer sheets,
  OMR records, manual-review records, support cases or production approvals;
- approve content, grades, answer checking, hints, solutions, mastery or
  proficiency claims;
- add or change API, OpenAPI, Prisma, migrations, runtime, web routes,
  dependencies, lockfile or CI workflow;
- activate diagnostic readiness or diagnostic review workflow;
- authorize real roster imports, invitations, school-family linking,
  assignment delivery, analytics, PDF/print, OMR or manual review.

## Fail-closed boundary

If the teacher validation plan, participant criteria, workflow acceptance
criteria, denial cases, measurement plan, support expectations or independent
review evidence is missing, the only valid real-school state is `BLOCKED`.

Green repository validation and synthetic walkthroughs are repository
consistency evidence only. They do not authorize real teacher onboarding,
school beta launch or production use.

## Minimum future approval packet

A future Wave 7 activation request should include:

- approved business and design-partner gate;
- approved data-processing and privacy gate;
- approved security and isolation review gate;
- teacher workflow validation plan and evidence;
- assignment, delivery, analytics, print and review acceptance criteria;
- teacher-time and renewal-intent measurement plan;
- support and escalation readiness;
- QA and independent-review sign-off;
- explicit approval to enable real school beta workflows.

Until that packet exists, real Wave 7 remains `BLOCKED`.
