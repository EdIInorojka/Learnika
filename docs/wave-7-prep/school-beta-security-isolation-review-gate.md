# Pre-Wave 7 / Slice 18 — school beta security and isolation review gate

Status: `BLOCKED_NON_PRODUCTION`

This gate is a static planning artifact. It does not start Wave 7, does not
approve a school beta and does not authorize real school, teacher, student,
parent or roster data processing.

## Decision

Real Wave 7 remains `BLOCKED`.

The synthetic school demo foundation and the prior business, design-partner,
data-processing and privacy gates define prerequisites only. A real school
pilot also requires an explicit security and tenant-isolation approval before
any production-like school workflow is enabled.

## Current baseline

- The synthetic school demo foundation is closed.
- The business and design-partner gate remains `BLOCKED_NON_PRODUCTION`.
- The data-processing and privacy gate remains `BLOCKED_NON_PRODUCTION`.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Real Wave 7 school beta remains `BLOCKED`.
- Production school data count remains `0`.
- Real school count remains `0`.

## Security review prerequisites

Before any real school pilot can begin, the project must approve:

1. a school beta threat model;
2. school versus family authorization rules;
3. teacher, curator, administrator, learner, parent and support role
   boundaries;
4. tenant isolation test coverage for every school-scoped query and mutation;
5. school-family relationship and consent authorization rules;
6. privileged support access policy and audit evidence;
7. sensitive export, deletion and correction authorization rules;
8. import validation and rejection controls for roster and assignment data;
9. incident response and escalation owners;
10. backup, restore and pilot exit controls.

None of these prerequisites is satisfied by this document.

## Required isolation cases

A future implementation must prove fail-closed behavior for at least:

- school administrator cannot access another organization or school;
- teacher cannot access another class or subject group;
- curator cannot bypass teacher assignment boundaries;
- learner cannot access another learner's school work;
- parent cannot access school records without an approved relationship policy;
- school role cannot access family subscription, private homework history or
  unrelated child learning records without an approved relationship policy;
- family role cannot access school rosters or class analytics without an
  approved relationship policy;
- support actor cannot access sensitive school data without a documented
  reason, time-bound permission and audit event;
- export and deletion actions cannot proceed without verified authority;
- analytics cannot expose small cohorts or identifiable learner rows.

These are future implementation requirements only. No runtime enforcement is
added here.

## Security evidence required before activation

A future Wave 7 activation packet must include:

- security threat model review;
- tenant-isolation test matrix;
- authorization policy matrix by role and resource;
- negative tests for cross-organization, cross-school, cross-class and
  school-family boundaries;
- audit log schema and review evidence;
- import and export abuse-case tests;
- rate-limit and abuse-control review;
- backup and restore validation for school data;
- incident-response runbook and owner;
- independent security/privacy review approval.

Green repository validation is not a substitute for this evidence.

## Explicit non-goals

This gate does not:

- name real schools or design partners;
- create accounts, sessions, invitations, identities, rosters, support access
  grants, exports, deletions, audit events or production approvals;
- add or change API, OpenAPI, Prisma, migrations, runtime, web routes,
  dependencies, lockfile or CI workflow;
- activate diagnostic readiness or diagnostic review workflow;
- authorize roster imports, school-family linking, assignment delivery,
  analytics, PDF/print, OMR or manual review for production.

## Fail-closed boundary

If the security threat model, role authorization matrix, tenant-isolation test
matrix, audit policy, support access policy, export/deletion policy, incident
runbook or independent review is missing, the only valid real-school state is
`BLOCKED`.

The synthetic demo can remain available as a local non-production conversation
aid. It cannot be treated as security approval, pilot launch authorization or
production evidence.

## Minimum future approval packet

A future Wave 7 activation request should include:

- approved business and design-partner gate;
- approved data-processing and privacy gate;
- approved security threat model;
- approved tenant-isolation and authorization evidence;
- approved audit, support-access, export and deletion controls;
- approved incident response and restore evidence;
- QA and independent-review sign-off;
- explicit approval to enable real school beta workflows.

Until that packet exists, real Wave 7 remains `BLOCKED`.
