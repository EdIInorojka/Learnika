# Pre-Wave 7 / Slice 16 — school beta business and design-partner gate

Status: `BLOCKED_NON_PRODUCTION`

This gate is a static planning artifact. It does not start Wave 7, does not
approve a school beta and does not authorize real school data processing.

## Decision

Real Wave 7 remains `BLOCKED`.

The synthetic school demo foundation may be used for local product
conversation and internal review, but a real school beta can start only after
the business gate and named design-partner gate are approved in a separate
release decision.

## Current baseline

- Wave 6 is closed only as a static governance foundation.
- The synthetic school demo foundation is closed through the Pre-Wave 7 closure
  gate.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Real Wave 7 school beta remains `BLOCKED`.
- Production school data count remains `0`.
- Real school count remains `0`.

## Business gate prerequisites

Before real Wave 7 can begin, the project must record:

1. a named business owner for the school beta;
2. a written school-beta objective;
3. pilot success metrics for teacher time, learner engagement, security
   acceptance and renewal intent;
4. explicit stop conditions for the pilot;
5. support ownership and escalation hours;
6. budget and operational capacity for onboarding, support, security review and
   incident handling;
7. legal review scope for real school data, consent, processing basis,
   retention, deletion and export;
8. release-review owners for product, security, privacy, QA and independent
   review.

None of these prerequisites is satisfied by this document.

## Design-partner gate prerequisites

Before real Wave 7 can begin, the project must record:

1. named design-partner schools through an approved business process;
2. a school-side accountable sponsor role;
3. a school administrator or coordinator role;
4. teacher participant criteria;
5. grade-band and subject scope;
6. written pilot boundaries for classes, rosters, assignments, analytics and
   printed workflows;
7. a consent and family-notification plan where required;
8. a data-processing and support contact model;
9. an exit plan for pilot termination and data deletion or export;
10. a clear statement that the synthetic demo is not production evidence.

No real school, person, organization, address, contact or roster value is
recorded in this artifact.

## Synthetic demo evidence that may support the gate

The following evidence may inform a future gate review, but it does not satisfy
the gate by itself:

- read-only `/school-demo` snapshot;
- class drilldown and teacher-facing overview;
- compact summary, handoff, pilot, pilot-config and rollout views;
- deterministic synthetic seed data;
- family and school tenancy separation tests;
- synthetic-only and no-PII assertions;
- local validation evidence.

Green validation only proves repository consistency. It does not approve a
school beta.

## Explicit non-goals

This gate does not:

- name real schools;
- create real teacher, student, parent or school records;
- create accounts, invitations, identity-provider links or auth sessions;
- create production approvals;
- activate diagnostic readiness;
- activate diagnostic review workflow;
- enable learner-facing diagnostics;
- approve roster imports, school-family links, grading, analytics, PDF/print,
  OMR or manual-review workflows for production;
- change API, OpenAPI, Prisma, migrations, runtime, web routes, dependencies,
  lockfile or CI workflow.

## Fail-closed boundary

If the business owner, named design partners, legal basis, consent model,
support model, security review or independent review is missing, the only valid
state is `BLOCKED`.

The synthetic demo can remain available locally as a non-production
conversation aid, but it cannot be treated as a pilot launch, production
approval or real customer deployment.

## Minimum future approval packet

A future Wave 7 activation request should include:

- business gate approval;
- named design-partner list approved outside the repository;
- pilot objective and success metrics;
- participant and class boundaries;
- data-processing basis and consent plan;
- retention, deletion and export plan;
- support and incident plan;
- security and privacy review evidence;
- QA plan and rollback plan;
- explicit approval to process real school data.

Until that packet exists, real Wave 7 remains `BLOCKED`.
