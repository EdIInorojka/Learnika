# Pre-Wave 7 / Slice 27 — school beta future implementation slice map

Status: `IMPLEMENTATION_MAP_BLOCKED_NON_PRODUCTION`

This document is a static planning map for future Wave 7 school-beta
implementation. It does not start Wave 7, approve a school beta, name a design
partner, create production school records, or authorize real school data
processing.

## Baseline

- Wave 6 is closed only as a static diagnostic governance foundation.
- The synthetic school demo foundation is closed for non-production
  demonstration use only.
- The static school-beta gate foundation is closed.
- The activation-packet template, template closure gate, acceleration roadmap
  and activation-packet checklist exist as static planning artifacts only.
- Real Wave 7 school beta remains `BLOCKED`.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Production school data count remains `0`.
- Real school count remains `0`.
- Production approvals count remains `0`.

## Purpose

The purpose of this map is to reduce execution ambiguity after a future
activation approval. It decomposes the Wave 7 school beta into small,
dependency-ordered slices that can be reviewed independently.

This map does not approve any slice. Every future implementation slice remains
blocked until the business/design-partner, privacy/data-processing,
security/isolation, teacher-workflow, restore-readiness and independent-review
gates are approved in a separate activation process.

## Future implementation lanes

### Lane A — activation preflight

Future prerequisite: complete activation packet approval.

Blocked until approval:

1. **Activation preflight guard** — verify named design partner, approved legal
   basis, security review, restore readiness and independent-review decision.
2. **Beta feature boundary** — define exact enabled routes, roles, write paths,
   rollback triggers and stop conditions.
3. **Production data admission gate** — prove that only approved fields and
   approved tenant scopes can enter beta storage.

Current status: `BLOCKED_UNTIL_APPROVED`.

### Lane B — school tenant setup

Future prerequisite: approved school identity and data-processing basis.

Blocked until approval:

4. **School tenant provisioning** — create real organization and school tenant
   setup flow with authorization and audit coverage.
5. **Academic-year and class configuration** — configure year, grades 7–9,
   classes and subject groups from approved inputs.
6. **License and entitlement activation** — enable school license limits,
   feature entitlements and expiry behavior.

Current status: `BLOCKED_UNTIL_APPROVED`.

### Lane C — identity, roles and access

Future prerequisite: approved authorization matrix and school-family separation
policy.

Blocked until approval:

7. **Teacher/admin role boundary** — implement teacher, coordinator and admin
   role checks without exposing family tenancy data.
8. **Invite-code or account-link boundary** — add future invite/linking flow
   only after privacy and consent paths are approved.
9. **Sensitive access audit** — record privileged support or admin access with
   no unnecessary PII in logs.

Current status: `BLOCKED_UNTIL_APPROVED`.

### Lane D — roster import

Future prerequisite: approved import format, consent/legal basis and deletion
model.

Blocked until approval:

10. **CSV/XLSX import preview** — parse school-provided roster files into a
    review-only preview without committing records.
11. **Import validation and error report** — reject malformed, excessive,
    duplicate or cross-tenant data safely.
12. **Roster commit and rollback** — commit approved roster rows with audit,
    rollback and deletion propagation.

Current status: `BLOCKED_UNTIL_APPROVED`.

### Lane E — teacher assignment workflow

Future prerequisite: teacher workflow validation and authorization coverage.

Blocked until approval:

13. **Assignment builder MVP** — create teacher-confirmed assignments for
    approved classes and subject groups.
14. **Assessment item selection boundary** — use only reviewed, rights-safe
    content and no copied textbook material.
15. **Attempt and timing settings** — add bounded time, attempt and availability
    settings with safe defaults.

Current status: `BLOCKED_UNTIL_APPROVED`.

### Lane F — student delivery

Future prerequisite: approved student access model and school-family data
policy.

Blocked until approval:

16. **Online assignment delivery** — expose assignments to authorized students
    only.
17. **Submission capture** — store submitted work within approved retention and
    audit boundaries.
18. **Teacher-visible submission status** — show progress metadata without
    unnecessary learning or family data.

Current status: `BLOCKED_UNTIL_APPROVED`.

### Lane G — analytics and reporting

Future prerequisite: small-cohort suppression, interpretation limits and
teacher workflow validation.

Blocked until approval:

19. **Class analytics MVP** — show class-level skill progress with safe
    aggregation and no unsupported mastery claims.
20. **Student drilldown boundary** — allow only authorized, purpose-limited
    teacher views.
21. **Pilot measurement** — measure teacher time, support burden and renewal
    intent without logging raw learner work or PII.

Current status: `BLOCKED_UNTIL_APPROVED`.

### Lane H — print, OMR and manual review

Future prerequisite: reviewed assessment content, print workflow acceptance and
manual-review policy.

Blocked until approval:

22. **PDF variants and answer sheets** — generate print artifacts from reviewed
    content only.
23. **OMR prototype** — process answer sheets with confidence states and no
    automatic high-stakes decisions.
24. **Manual-review queue** — require teacher confirmation for ambiguous or
    open-response work.

Current status: `BLOCKED_UNTIL_APPROVED`.

### Lane I — operations, exit and closure

Future prerequisite: restore readiness, export/deletion policy and independent
review.

Blocked until approval:

25. **Export, correction and deletion controls** — implement purpose-limited
    school data rights workflows.
26. **Backup and restore drill** — prove tenant-scoped restore without
    cross-tenant leakage.
27. **School beta closure gate** — decide whether to stop, extend, remediate or
    move toward production.

Current status: `BLOCKED_UNTIL_APPROVED`.

## Cross-slice invariants

Every future implementation slice must:

- start from a clean git gate;
- define exact changed paths before validation;
- include tenant-isolation tests for every school-, class-, organization- or
  family-scoped query;
- include no-PII log and analytics assertions where data or logging changes;
- update OpenAPI and generated contracts when a public API changes;
- include migration validation and rollback or forward-fix notes when schema
  changes;
- preserve no-answer and meaningful-attempt rules for learner-facing learning
  flows;
- keep OMR/manual review confidence and teacher confirmation explicit;
- fail closed when approval evidence, legal basis, isolation tests or restore
  evidence are missing.

## Explicit non-goals for this slice

This map does not:

- name real schools, organizations, teachers, students, parents, reviewers or
  design partners;
- create real identities, accounts, rosters, assignments, submissions,
  analytics, print artifacts, answer sheets, OMR records, manual-review
  records, exports, deletions, backups, restores, support cases or audit
  events;
- create production approvals, authority grants, legal-basis records, consent
  records, evidence records, reviewer assignments or conflict disclosures;
- change runtime, API, OpenAPI, Prisma, migrations, database, web routes,
  dependencies, lockfile or CI workflow;
- activate diagnostic readiness, diagnostic review workflow or real Wave 7
  school beta;
- authorize real roster import, invitations, school-family linking, assignment
  delivery, analytics, PDF/print, OMR or manual review.

## Stop conditions

Stop and return `BLOCK` if future work requires any of the following before a
separate activation slice is approved:

- real school, teacher, student, parent, reviewer or design-partner identity;
- real roster rows, assignment records, submissions, analytics or audit events;
- production approval, legal-basis record, consent record or evidence record;
- runtime, API, OpenAPI, Prisma, migration, web route, dependency, lockfile or
  CI workflow changes not explicitly authorized for that slice;
- weakening tenant-isolation, no-PII, no-mutation or exact-scope guarantees;
- treating synthetic demo evidence as real pilot evidence;
- changing diagnostic readiness from `NOT_READY` or activation from `BLOCKED`.

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
map only. It does not authorize real school onboarding, production use or Wave
7 beta.
