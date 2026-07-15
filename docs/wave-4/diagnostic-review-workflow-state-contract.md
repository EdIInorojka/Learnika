# Diagnostic review workflow state placeholder contract

## Purpose

This contract defines a static, machine-validatable placeholder for the future
diagnostic candidate review lifecycle in Russian mathematics for grades 7-9.
It pins the Wave 4 coverage, evidence, rubric, candidate-digest and
canonicalization artifacts while keeping every current blueprint slot outside
review activity.

Slice 7 does not submit a candidate, start a review, record evidence or a
decision, identify a reviewer, grant production approval or change diagnostic
readiness.

## Slice 7 boundary

The workflow artifact is metadata-only, non-production and storage-disabled.
It may define a policy identity, a future non-production state vocabulary, a
conservative transition definition and one inactive placeholder per blueprint
slot. Definitions are not workflow events and do not authorize runtime use.

The slice cannot:

- add or revise diagnostic candidate content;
- submit or assign an immutable candidate;
- generate or store a digest;
- activate canonicalization rules;
- create review evidence, a gate decision or reviewer assignment;
- grant production approval or create a path to production readiness;
- enable persistence, API, OpenAPI, UI or runtime workflow behavior;
- alter the Wave 3 readiness policy or return `READY`.

## Version pins

The workflow placeholder pins these exact upstream artifacts:

- review coverage `wave-4.slice-2.grade-7-9-math.v1`;
- review evidence `wave-4.slice-3.grade-7-9-math.v1`;
- review gate rubric `wave-4.slice-4.grade-7-9-math.v1`;
- candidate digest registry `wave-4.slice-5.grade-7-9-math.v1`;
- candidate canonicalization policy
  `wave-4.slice-6.grade-7-9-math.v1`;
- diagnostic readiness policy
  `wave-3-slice-11-diagnostic-readiness-policy-v1`.

Those artifacts remain authoritative for slot membership, coverage status,
empty evidence and decision records, unresolved candidate identity and digest,
inactive canonicalization, and zero production approvals.

## Workflow policy identity

The placeholder policy has:

- policy ID `diagnostic-review-workflow-state`;
- workflow version
  `wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1`;
- policy state `DEFERRED_NON_PRODUCTION`;
- runtime activation disabled;
- production-readiness transitions disabled.

The policy identity versions a static definition only. It is not an active
workflow engine or authorization policy.

## Non-production state vocabulary

Slice 7 defines these placeholder states:

| State | Meaning |
| --- | --- |
| `NOT_SUBMITTED` | No exact candidate has entered the workflow. |
| `CANDIDATE_DEFERRED` | Future candidate intake cannot proceed under unresolved policy. |
| `REVIEW_NOT_STARTED` | Future vocabulary for an assigned candidate with no active review. |
| `REVIEW_BLOCKED` | Future review cannot proceed because a prerequisite is unresolved. |
| `CHANGES_REQUIRED_DEFERRED` | Future revision would be required, but no current decision is recorded. |
| `REJECTED_DEFERRED` | Future rejection vocabulary only; no current decision is recorded. |
| `APPROVED_DEFERRED_PLACEHOLDER` | Reserved vocabulary that remains isolated and unusable in Slice 7. |

Every current workflow entry must use `NOT_SUBMITTED`. The reserved approved
placeholder has no inbound or outbound transition and must not appear on a
workflow entry.

## Conservative future transition table

The transition table is definition-only and fail-closed:

- `NOT_SUBMITTED` may lead only to `CANDIDATE_DEFERRED`;
- `CANDIDATE_DEFERRED` may lead only to `REVIEW_NOT_STARTED`;
- `REVIEW_NOT_STARTED` may lead only to `REVIEW_BLOCKED`;
- `REVIEW_BLOCKED` may lead only to `CHANGES_REQUIRED_DEFERRED` or
  `REJECTED_DEFERRED`;
- `CHANGES_REQUIRED_DEFERRED` may lead only to `CANDIDATE_DEFERRED` or
  `REJECTED_DEFERRED`;
- `REJECTED_DEFERRED` may lead only to `CANDIDATE_DEFERRED`;
- `APPROVED_DEFERRED_PLACEHOLDER` has no allowed transition.

Each row remains `FUTURE_ONLY_DEFERRED`, has no authorization-policy
reference and explicitly prohibits production readiness. The graph contains
no path from `NOT_SUBMITTED` to the reserved approved placeholder or any
production state.

## Workflow entry

Each of the 11 review-coverage slots appears exactly once. An entry contains:

| Field | Requirement |
| --- | --- |
| `workflowEntryId` | Stable identity of the placeholder row only. |
| `recordState` | `PLACEHOLDER_ONLY`. |
| `blueprintSlotId` | One exact slot from the Slice 2 coverage artifact. |
| `coverageReference` | Exact Slice 2 version, slot and unchanged coverage status. |
| `evidenceReference` | Exact Slice 3 version and `NOT_RECORDED` state. |
| `rubricReference` | Exact Slice 4 version and six-gate definition count. |
| `candidateRegistryReference` | Exact Slice 5 version, registry entry and unresolved candidate/digest states. |
| `canonicalizationReference` | Exact Slice 6 artifact and unresolved policy versions. |
| `workflowState` | `NOT_SUBMITTED` in Slice 7. |
| boundary flags | No submission, review, decision, identity or approval exists. |

A workflow-entry ID is not a candidate ID, review ID, decision ID or audit
identity. It cannot advance the referenced coverage state.

## Reviewer and audit identity

Reviewer identity and audit identity remain separate `DEFERRED` policies with
null policy versions and reference formats. Every workflow entry keeps both
identity references null. The artifact stores no reviewer name, email, account
ID, organization, role assignment or free-form review note.

A later approved slice must define reviewer eligibility, assignment,
separation of duties, authorization, opaque identity-reference formats,
conflict handling, audit ownership, retention, revocation and re-review.

## No-record invariants

The Slice 7 artifact keeps:

- 11 workflow placeholders and zero candidate submissions;
- zero active reviews and zero review-evidence records;
- zero review decisions and zero approved decisions;
- zero production approvals;
- zero reviewer and audit identity records;
- empty submission, active-review, evidence, decision, approval and identity
  record arrays;
- production, runtime and storage use disabled.

No aggregate may advance independently of validated records.

## Safety and data rules

The artifact must exclude item stems, final or correct answers, worked
solutions, hints, scoring keys, answer checking, correctness results, mastery
or proficiency claims, provider prompts or payloads, copied textbook content,
learner data, reviewer PII, immutable digest values and canonicalized candidate
content.

The validator rejects the forbidden fields and content terms required by the
Slice 7 instruction, plus hash-like values and any unexpected field.

## Readiness boundary

Readiness remains `NOT_READY` under
`wave-3-slice-11-diagnostic-readiness-policy-v1`. Blocking reasons remain
`INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. A workflow definition
cannot close either blocker, advance coverage or add a readiness reason code.

## Open decisions

- workflow ownership, authorization and policy activation;
- candidate submission authority and intake requirements;
- transition authorization, retry, withdrawal and invalidation rules;
- reviewer eligibility, assignment and separation of duties;
- reviewer and audit identity policies;
- evidence sufficiency and linkage to gate decisions;
- production approval authority and withdrawal;
- persistence, access control, retention, API, UI and administrative tooling;
- readiness-policy integration.
