# Pre-Wave 7 / Slice 17 — school beta data-processing and privacy gate

Status: `BLOCKED_NON_PRODUCTION`

This gate is a static planning artifact. It does not start Wave 7, does not
approve a school beta and does not authorize real school data processing.

## Decision

Real Wave 7 remains `BLOCKED`.

The synthetic school demo may support product conversations, but any real
school pilot requires a separate data-processing and privacy approval before a
real school, teacher, student, parent, roster, assessment, submission or
support record enters Learnika.

## Current baseline

- The synthetic school demo foundation is closed.
- The business and design-partner gate remains `BLOCKED_NON_PRODUCTION`.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Real Wave 7 school beta remains `BLOCKED`.
- Production school data count remains `0`.
- Real school count remains `0`.

## Data-processing prerequisites

Before any real school pilot can begin, the project must approve:

1. the processing purpose for each school workflow;
2. the legal basis or consent path for each participant category;
3. the controller, processor and support responsibilities;
4. the minimum field list for school, teacher, class, learner and parent data;
5. the source-of-truth policy for roster and assignment data;
6. the import, correction, rejection and deletion workflow for roster rows;
7. the school-family relationship policy and whether any learning data can be
   shared across contexts;
8. the retention, deletion, restriction, export and backup-propagation model;
9. the audit event model for sensitive access, export and support actions;
10. the incident notification and pilot termination procedure.

None of these prerequisites is satisfied by this document.

## Privacy prerequisites

Before real data can be processed, the project must record:

- a data-minimization review for every proposed field;
- a PII classification for school rosters, teacher records, student records,
  parent links, assessment submissions and support evidence;
- a policy for real names, school names, contacts, class labels, government
  identifiers and internal account identifiers;
- a consent or notice path for minors and legal representatives where required;
- a retention schedule per data class;
- a deletion and export workflow with identity verification;
- a privileged-access review process;
- a no-training default for child and school data;
- analytics suppression rules for small cohorts;
- a privacy review owner and independent review checkpoint.

This artifact does not claim legal compliance. It only defines what must be
approved before real processing is allowed.

## School data classes for future review

The future approval packet must classify at least:

- school profile data;
- administrator and teacher account data;
- class and subject-group metadata;
- student roster data;
- parent or legal-representative link data where applicable;
- assignment configuration data;
- online submission and attempt metadata;
- printed answer-sheet identifiers;
- OMR/manual-review evidence;
- class analytics and small-cohort aggregates;
- audit, export, deletion and support records.

All concrete values remain absent from this artifact.

## Required denial cases

A future implementation must fail closed when:

- a school record is not tied to an approved real pilot;
- a roster row lacks approved processing basis;
- a teacher attempts to access a class outside the school scope;
- a school context attempts to access family subscription or private homework
  history without an approved relationship policy;
- a family context attempts to access school roster or class analytics without
  an approved relationship policy;
- a support actor lacks a documented reason and audit trail;
- an export request cannot verify the requesting party;
- deletion cannot propagate to the required data stores and backups;
- analytics would expose a small cohort or identifiable learner.

These are future requirements only. No runtime enforcement is added here.

## Explicit non-goals

This gate does not:

- name real schools or design partners;
- create real records, identities, accounts, rosters, consent records,
  submissions, exports, deletions or audit events;
- approve a legal basis or consent language;
- create a production retention schedule;
- change API, OpenAPI, Prisma, migrations, runtime, web routes, dependencies,
  lockfile or CI workflow;
- activate diagnostic readiness or review workflow;
- authorize roster imports, invitations, school-family linking, assignment
  delivery, analytics, PDF/print, OMR or manual review for production.

## Fail-closed boundary

If the data-processing purpose, legal basis, consent path, field minimization,
retention/deletion policy, audit model, support model or independent review is
missing, the only valid real-school state is `BLOCKED`.

Green validation and complete synthetic demo walkthroughs are repository
consistency evidence only. They do not authorize real school onboarding,
production data processing or Wave 7 activation.

## Minimum future approval packet

A future Wave 7 activation request should include:

- approved business and design-partner gate;
- approved data-processing purpose matrix;
- approved legal basis or consent plan;
- approved field inventory and PII classification;
- approved tenant and relationship authorization rules;
- approved retention, deletion, export and backup policy;
- approved audit and support-access policy;
- approved incident and pilot exit plan;
- security, privacy, QA and independent-review evidence.

Until that packet exists, real Wave 7 remains `BLOCKED`.
