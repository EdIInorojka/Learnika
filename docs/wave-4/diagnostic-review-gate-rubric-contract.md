# Diagnostic review gate rubric contract

## Purpose

This contract defines non-decision rubric criteria for the six diagnostic
review gates introduced in Wave 4 Slice 1. It pins the Slice 2 coverage and
Slice 3 evidence-placeholder foundations, but it does not record evidence,
assign a reviewer, make a review decision, grant production approval or change
diagnostic readiness.

## Slice 4 boundary

Slice 4 is static, metadata-only and non-production. It may define:

- exact gate IDs and policy-version pins;
- criterion identifiers and requirement codes;
- categories of evidence a future review would need;
- categories of issues that would block a future gate decision;
- future decision-state enum values;
- unresolved reviewer-role placeholders.

The rubric is a definition artifact, not a completed checklist. Category names
are not evidence, blocking categories are not findings and allowed future
states are not current decisions.

Slice 4 cannot:

- add or revise diagnostic content;
- populate a candidate digest;
- record evidence or a gate outcome;
- identify, assign or authorize a reviewer;
- grant production approval;
- enable persistence, API, OpenAPI, UI or runtime behavior;
- alter the Wave 3 readiness policy or return `READY`.

## Version pins

The rubric artifact must pin:

- review coverage artifact `wave-4.slice-2.grade-7-9-math.v1`;
- review evidence placeholder `wave-4.slice-3.grade-7-9-math.v1`;
- diagnostic blueprint `wave-3.slice-3.grade-7-9-math.v1`;
- diagnostic readiness policy
  `wave-3-slice-11-diagnostic-readiness-policy-v1`;
- the exact gate-policy versions already carried by the coverage and evidence
  placeholder artifacts.

The earlier artifacts remain authoritative for slot coverage, pending
candidate digests, empty evidence records, identity-policy deferrals and zero
approval counts.

## Rubric unit

One rubric unit defines one review gate and contains:

| Field | Requirement |
| --- | --- |
| `gateId` | One of the six approved gate IDs. |
| `policyVersion` | Exact policy pin shared with the earlier artifacts. |
| `rubricState` | `NON_DECISION_DEFINITION` for Slice 4. |
| `reviewerRolePlaceholder` | Deferred role, assignment and identity references only. |
| `requiredEvidenceCategories` | Non-empty future evidence taxonomy. |
| `blockingIssueCategories` | Non-empty fail-closed issue taxonomy. |
| `allowedFutureDecisionStates` | Enum definition only, never a current result. |
| `criteria` | Non-empty criterion definitions referencing both taxonomies. |

Every criterion has a stable ID, an uppercase requirement code, one required
evidence category and one blocking issue category. Criterion IDs are unique
within the artifact and namespaced by their gate ID.

## Gate rubric definitions

### Methodology

The methodology rubric requires future review categories for skill alignment,
evidence-category alignment, bounded learner action, prerequisite boundaries
and evaluation boundaries. Blocking categories cover unresolved alignment,
ambiguity, undeclared prerequisites and unsafe evaluation boundaries.

The rubric defines no learner result, performance interpretation or educational
claim.

### Safety and no-answer

The safety rubric requires future review categories for source-result exposure,
hidden evaluation data, learner-data minimization and active-scope safety.
Blocking categories cover exposure risk, unnecessary personal data, hidden
evaluation data and out-of-scope content.

The rubric contains no answer, worked solution, hint, scoring key or learner
response.

### Rights and copyright

The rights rubric requires future provenance classification, usage-rights basis
and source-material boundary review. Unverified provenance, unverified usage
rights and protected source material are blocking categories.

Category definitions are not a legal clearance record and do not establish
rights for any content.

### Grade placement

The grade-placement rubric requires future grade-band alignment, Russian
program-context review and prerequisite alignment. Unresolved grade placement,
unresolved program context and prerequisite mismatch are blocking categories.

No grade placement is decided by the artifact.

### Accessibility and readability

The accessibility rubric requires future review of Russian-language
readability, notation consistency, alternative representation and reading
load. Ambiguous wording, inconsistent notation, visual-only essential meaning
and excessive reading load are blocking categories.

The rubric defines content-review requirements only and adds no delivery UI.

### Production approval

The production-approval rubric requires future confirmation that all five
substantive gates are current, all candidate and policy pins agree, and release
authority and audit-identity policies are defined. Incomplete upstream gates,
pin mismatch or unresolved authority and audit policy are blocking categories.

The future enum may define `NOT_ELIGIBLE`, `PENDING`, `APPROVED` and
`WITHDRAWN`, but Slice 4 records none of those states for a candidate. The
artifact has no review decision records and production approval count remains
zero.

## Future decision-state enums

For methodology, safety, rights, grade placement and accessibility, the enum
definition is:

- `NOT_STARTED`;
- `IN_REVIEW`;
- `CHANGES_REQUIRED`;
- `APPROVED`;
- `INVALIDATED`.

For production approval, the enum definition is:

- `NOT_ELIGIBLE`;
- `PENDING`;
- `APPROVED`;
- `WITHDRAWN`.

These arrays are vocabulary for a future separately approved decision model.
Their presence does not imply that a state transition occurred.

## Reviewer-role boundary

Every gate carries a reviewer-role placeholder with state `DEFERRED` and null
role, assignment and identity references. The artifact stores no real reviewer
PII, account ID, organization, free-form note or authorization claim.

A later slice must define reviewer eligibility, assignment, separation of
duties, conflict handling, audit identity and revocation before any decision
can be recorded. Missing identity or authorization must fail closed.

## No-record invariants

The Slice 4 artifact must keep:

- `reviewDecisionRecords` empty;
- `reviewEvidenceRecords` empty;
- recorded decision count at zero;
- recorded evidence count at zero;
- production approval count at zero;
- explicit boundary flags confirming that no records or assignments exist.

Required evidence categories describe future record classes. They do not
satisfy the Slice 3 evidence contract and cannot advance a gate.

## Safety and data rules

The rubric artifact must not contain final or correct answers, worked
solutions, hints, scoring keys, checking results, mastery or proficiency
claims, provider payloads, copied textbook material, learner data or reviewer
PII. It remains synthetic curriculum metadata with production, runtime and
storage use disabled.

## Readiness boundary

Readiness remains `NOT_READY` under the existing Wave 3 policy. Blocking
reasons remain `INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. A rubric
definition cannot close either blocker, create reviewed coverage or add a new
readiness reason code.

## Open decisions

- accountable reviewer roles and separation of duties;
- rubric owners, review cadence and policy expiry;
- evidence sufficiency and accepted reference formats;
- blocking-issue severity and remediation workflow;
- candidate digest canonicalization and invalidation;
- reviewer and audit identity policies;
- decision transition authorization and withdrawal;
- production approval authority;
- persistence, API, UI and administrative tooling;
- readiness-policy integration.
