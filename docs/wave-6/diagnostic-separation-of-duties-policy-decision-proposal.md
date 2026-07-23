# Diagnostic separation-of-duties policy decision proposal

## Proposal status

Wave 6 / Slice 4 is a static, non-production proposal. Its status is
`PROPOSED_DEFERRED`: no policy or ruleset is approved, no enforcement runs and
no review or production authority is granted.

The activation prerequisite `separation_of_duties_enforcement` remains
`UNSATISFIED_DEFERRED`. This proposal is not prerequisite evidence and cannot
activate the review workflow.

## Exact upstream baseline

The machine-readable proposal pins the following unchanged artifacts:

| Upstream | Exact artifact |
| --- | --- |
| Activation prerequisites | `wave-5.slice-2.grade-7-9-math.v1` |
| Separation-of-duties placeholder | `wave-5.slice-6.grade-7-9-math.v1` |
| Reviewer-role ownership proposal | `wave-6.slice-3.grade-7-9-math.v1` |
| Conflict-of-interest placeholder | `wave-5.slice-7.grade-7-9-math.v1` |
| Audit-identity placeholder | `wave-5.slice-8.grade-7-9-math.v1` |
| Review authority placeholder | `wave-4.slice-8.grade-7-9-math.v1` |
| Review workflow placeholder | `wave-4.slice-7.grade-7-9-math.v1` |

Every referenced policy remains deferred or unresolved. The proposal does not
modify an upstream artifact.

## Proposed policy areas

Every area below remains `UNRESOLVED_DEFERRED`.

### Maker/checker separation

A future policy would distinguish an abstract authoring stage from an abstract
substantive-review stage and fail closed if the required independence cannot
be established. Slice 4 records no author, reviewer, assignment or comparison.

### Author/reviewer/approver separation

The proposal describes three distinct governance stages. A future approved
policy would prevent one principal from authoring and reviewing, authoring and
approving, or substantively reviewing and finally approving the same governed
work. No principal or governed work exists in this slice.

### Reviewer-role incompatibilities

A future closed incompatibility matrix and quorum de-duplication rule are
required. The proposal activates no matrix, grants no role and evaluates no
assignment.

### Audit-observer separation

Audit observation is proposed as a non-deciding stage, separate from
substantive review and final approval. The audit-identity dependency remains
unresolved, and no observer or audit event is created.

### Conflict-of-interest dependency

Separation enforcement depends on a separately approved conflict-of-interest
policy. An unresolved conflict must fail closed. Slice 4 collects no
disclosure, evaluates no relationship and records no recusal.

### Emergency exception boundaries

Whether an emergency exception may exist remains undecided. The proposal
requires that any later exception be time-bound, non-production, independently
reviewed and unable to bypass a missing gate or authorize production.

### Violation handling

A future policy must define detection, containment, affected-decision review,
invalidation, remediation and audit preservation. Slice 4 detects and processes
no violation.

### Future enforcement evidence

A later gate must require deterministic synthetic positive and negative
authorization vectors for assignment-time and decision-time enforcement.
This slice describes only the shape; it records no evidence and proves no
enforcement.

### Future policy gate

Policy approval requires a separately authorized governance, security and QA
review. Approval, prerequisite satisfaction, workflow activation and readiness
transition remain separate decisions.

## Synthetic vectors

The artifact contains four proposed accepted and four explicitly rejected
symbolic vectors. They carry no personal data, governed content, account
reference, assignment, storage reference or operational payload. Every vector
is marked non-operational, unassigned, unenforced, unapproved and unusable for
review or production.

## Preserved baseline

- readiness: `NOT_READY`;
- blockers: `INCOMPLETE_COVERAGE`, `NON_PRODUCTION_FIXTURES`;
- activation: `BLOCKED`;
- workflow: `INACTIVE`;
- satisfied prerequisites: `0/12`;
- approved candidates: `0`;
- production approvals: `0`.

All operational arrays remain empty and all operational counts remain zero.
Passing validation proves only that this deferred proposal is internally
consistent and fail-closed.
