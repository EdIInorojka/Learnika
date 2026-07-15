# Wave 5 diagnostic review activation prerequisites scope

## Status

Wave 5 Slice 1 is a documentation-only, non-activating planning slice. It
defines the conditions that must be approved and implemented before a future
diagnostic review workflow may be activated.

Approval of this slice would approve only the prerequisites contract. It would
not satisfy any prerequisite, activate a policy or workflow, authorize a
reviewer, create a candidate, record evidence or a decision, grant production
approval, advance coverage or change diagnostic readiness.

## Baseline

The Wave 4 closure baseline remains authoritative:

- 11 diagnostic blueprint slots;
- five slots in `DRAFT_ONLY`;
- six slots in `GAP_CONFIRMED`;
- zero `PRODUCTION_APPROVED` slots;
- zero assigned candidate identities and zero immutable digest values;
- zero review evidence records and zero review decisions;
- zero reviewer assignments, reviewer identities and audit identities;
- zero production approvals;
- every workflow placeholder in `NOT_SUBMITTED`;
- authority, conflict, identity, canonicalization, digest and workflow policies
  deferred or inactive.

Diagnostic readiness remains `NOT_READY` under
`wave-3-slice-11-diagnostic-readiness-policy-v1`. Its blocking reasons remain
exactly:

- `INCOMPLETE_COVERAGE`;
- `NON_PRODUCTION_FIXTURES`.

The prerequisites in this slice are governance entry conditions, not new
readiness reason codes.

## In scope

Slice 1 defines future approval requirements for:

- reviewed candidate identity;
- canonicalization and immutable digest policy;
- reviewer-role ownership and eligibility;
- separation of duties;
- conflict-of-interest handling;
- reviewer and audit identity references;
- evidence storage, access, retention and deletion;
- production approval authority;
- closure of the current coverage gaps;
- later readiness-policy integration;
- rollback, invalidation and withdrawal;
- CI and deterministic validation.

It also makes the smallest static scope-guard change needed to admit exactly
the four Wave 5 Slice 1 documentation files while continuing to reject other
Wave 5 files and all unauthorized runtime paths.

## Non-goals

Slice 1 does not:

- activate the diagnostic review workflow or any transition;
- approve a concrete candidate identity, digest algorithm or canonicalization
  ruleset;
- assign an identity, generate a digest or canonicalize candidate content;
- author, import or approve diagnostic content;
- fill any blueprint gap or advance any coverage state;
- create reviewer roles, people, assignments, entitlements or reviewer
  identities;
- create audit identities, conflict declarations or conflict decisions;
- record review evidence, gate decisions or production approvals;
- create a machine-readable production approval artifact;
- add persistence, Prisma schema changes or migrations;
- add API routes, OpenAPI operations, web UI or runtime workflow code;
- add answer checking, correctness scoring, mastery or proficiency claims,
  hints or worked solutions;
- connect OCR, STT, LLM or other providers;
- use copied textbook content, real learner data or real reviewer data;
- add analytics, billing, school, teacher or administrator, mobile or
  deployment capabilities;
- change readiness policy, remove a blocker or return `READY`.

## Activation boundary

Every prerequisite in the companion contract is necessary but not sufficient
for activation. A future explicitly approved slice must still:

1. present machine-validatable policy artifacts and synthetic test evidence;
2. prove that every prerequisite is current and mutually consistent;
3. pass security, privacy, curriculum, QA and independent review;
4. define the narrow workflow capability to be activated; and
5. receive an explicit activation decision.

Missing, stale, conflicting or unverifiable prerequisite evidence must fail
closed. No state may be inferred from the existence of these documents.

## Authorized file boundary

The Slice 1 product boundary is exactly:

- `docs/wave-5/scope-and-non-goals.md`;
- `docs/wave-5/diagnostic-review-activation-prerequisites-contract.md`;
- `docs/wave-5/open-decisions.md`;
- `docs/wave-5/slice-1-implementation-note.md`.

The scope-guard unblock is limited to the existing curriculum guard scripts
and their focused tests. It must not permit a `docs/wave-5/` prefix,
`apps/api/**`, OpenAPI, Prisma, web, runtime, lockfile or dependency changes.

