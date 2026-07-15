# Diagnostic review authority and separation-of-duties placeholder contract

## Purpose

This contract defines a static, machine-validatable placeholder for future
diagnostic review authority governance in Russian mathematics for grades 7-9.
It introduces reviewer-role vocabulary, separation-of-duties requirements and
identity, conflict and production-authority deferrals without creating people,
assignments, decisions or approvals.

Slice 8 does not authorize a reviewer, activate a role, assign an identity,
record a review decision, grant production approval or change diagnostic
readiness.

## Slice 8 boundary

The authority artifact is metadata-only, non-production and storage-disabled.
Role names identify future governance responsibilities only. A role placeholder
is not a person, account, entitlement, assignment or authorization grant.

The slice cannot:

- create real reviewer or audit identities;
- assign any reviewer to a candidate, slot, gate or decision;
- set an executable minimum-reviewer threshold;
- activate conflict-of-interest evaluation or enforcement;
- authorize a gate decision or production approval;
- add review evidence, immutable candidate digests or diagnostic content;
- enable persistence, API, OpenAPI, UI or runtime authority behavior;
- alter the Wave 3 readiness policy or return `READY`.

## Version pins

The authority placeholder pins these exact upstream artifacts:

- review coverage `wave-4.slice-2.grade-7-9-math.v1`;
- review evidence `wave-4.slice-3.grade-7-9-math.v1`;
- review gate rubric `wave-4.slice-4.grade-7-9-math.v1`;
- candidate digest registry `wave-4.slice-5.grade-7-9-math.v1`;
- candidate canonicalization policy `wave-4.slice-6.grade-7-9-math.v1`;
- review workflow state `wave-4.slice-7.grade-7-9-math.v1`;
- diagnostic readiness policy
  `wave-3-slice-11-diagnostic-readiness-policy-v1`.

The upstream artifacts remain authoritative for coverage, empty evidence and
decision records, unresolved candidates and digests, inactive
canonicalization, inactive workflow entries and zero production approvals.

## Authority policy identity

The placeholder policy has:

- policy ID `diagnostic-review-authority-separation-of-duties`;
- policy version
  `wave-4.slice-8.diagnostic-review-authority.placeholder.v1`;
- state `DEFERRED_NON_PRODUCTION`;
- activation disabled;
- runtime authority disabled;
- assignment and decision authorization disabled.

This identity versions a static definition only. It does not establish a real
authorization policy.

## Reviewer role taxonomy

Slice 8 defines exactly these placeholders:

- `METHODOLOGY_REVIEWER_PLACEHOLDER`;
- `SAFETY_REVIEWER_PLACEHOLDER`;
- `RIGHTS_REVIEWER_PLACEHOLDER`;
- `GRADE_PLACEMENT_REVIEWER_PLACEHOLDER`;
- `ACCESSIBILITY_REVIEWER_PLACEHOLDER`;
- `PRODUCTION_APPROVER_PLACEHOLDER`;
- `AUDIT_OBSERVER_PLACEHOLDER`.

Each role is `PLACEHOLDER_ONLY`, references an abstract gate or audit scope,
has null identity and assignment policy references, and grants neither review-
decision authority nor production-approval authority. No role contains a name,
email, account identifier, organization, assignment or personal attribute.

## Gate authority and minimum reviewer counts

Each of the six review gates has one authority placeholder linked to its
matching role placeholder and Slice 4 gate-policy version. Every gate entry
keeps:

- authority state `DEFERRED`;
- count state `TO_BE_DECIDED`;
- minimum reviewer count `null`;
- authority policy reference `null`;
- assignments disabled;
- review-decision authority disabled;
- production approval disabled.

A null count is not zero reviewers, a waiver or an implicit single-reviewer
policy. The executable threshold, counting rules, quorum semantics and
exceptions remain open decisions.

## Separation of duties

The artifact defines three non-authorizing requirement groups:

1. substantive review roles must be separated from final production approval;
2. the audit observer must be separated from all decision roles;
3. self-review and self-approval must be prohibited by a future policy.

Each rule remains `NON_AUTHORIZING_PLACEHOLDER`, lists only role-placeholder
IDs, has no enforcement-policy reference, enables no runtime enforcement and
grants no decision authorization. The rules express fail-closed governance
requirements; they do not prove that separation currently exists.

## Conflict of interest

Conflict-of-interest governance remains `DEFERRED_PLACEHOLDER_ONLY`. The policy
version, declaration-reference format and evaluation rules are null or
inactive. Conflict records and assignment enforcement are disabled.

A future approved policy must define disqualifying relationships, disclosure,
recusal, escalation, evidence, retention, authorization and audit handling
without exposing reviewer PII in ordinary curriculum artifacts.

## Reviewer and audit identity

Reviewer identity and audit identity remain separate `DEFERRED` policies with
null versions and reference formats. Identity records are prohibited in the
Slice 8 artifact. Identity must never be inferred from repository authorship,
commit metadata or a free-form note.

## Production approval authority

The production-approval authority placeholder references only
`PRODUCTION_APPROVER_PLACEHOLDER`. Its policy version and minimum approver count
remain null, its count state is `TO_BE_DECIDED`, and both decision authority and
production approval are disabled.

The presence of this placeholder does not make a candidate eligible, pending
or approved and cannot advance the isolated Slice 7 approved-state vocabulary.

## No-record invariants

The Slice 8 artifact keeps:

- seven role placeholders and zero real reviewer roles;
- six gate-authority placeholders and no executable reviewer counts;
- zero reviewer assignments and zero reviewer identities;
- zero audit identities and zero conflict records;
- zero review decisions and zero approved decisions;
- zero production approvals;
- empty assignment, identity, conflict, decision and approval arrays;
- production, runtime and storage use disabled.

No aggregate may advance independently of validated records.

## Safety and data rules

The artifact must exclude final or correct answers, worked solutions, hints,
scoring keys, answer checking, correctness results, mastery or proficiency
claims, provider prompts or payloads, copied textbook content, learner data,
reviewer PII, account identifiers, immutable digest values and canonicalized
candidate content.

The validator rejects the forbidden fields and content terms required by the
Slice 8 instruction, plus hash-like values and unexpected fields.

## Readiness boundary

Readiness remains `NOT_READY` under
`wave-3-slice-11-diagnostic-readiness-policy-v1`. Blocking reasons remain
`INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. A placeholder authority
taxonomy cannot close either blocker, authorize workflow activity or add a
readiness reason code.

## Open decisions

- accountable role owners and eligibility requirements;
- minimum reviewer counts, quorum and exception policy per gate;
- reviewer assignment, delegation, expiry and revocation;
- separation-of-duties enforcement and proof;
- conflict disclosure, recusal, escalation and retention;
- reviewer and audit identity formats and authorization;
- production approval authority and withdrawal;
- persistence, access control, API, UI and administrative tooling;
- readiness-policy integration.
