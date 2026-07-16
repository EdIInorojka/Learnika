# Diagnostic separation-of-duties enforcement policy placeholder contract

## Purpose

This contract defines the static placeholder boundary for a future diagnostic
separation-of-duties enforcement policy for Russian mathematics in grades 7-9.
It makes unresolved independence, enforcement, violation and exception
requirements machine-validatable without approving a policy, assigning a
person, evaluating a relationship or activating runtime authorization.

The contract creates no candidate, identity, role assignment, conflict,
violation, waiver, exception, review decision or production approval. Passing
its validator is not evidence that separation of duties exists.

## Contract status

The policy remains `UNRESOLVED_DEFERRED`. The activation prerequisite
`separation_of_duties_enforcement` remains `UNSATISFIED_DEFERRED`, retains
`UNASSIGNED_OWNER_PLACEHOLDER` and has no evidence references.

Creating and validating this placeholder must not:

- satisfy or advance an activation prerequisite;
- turn a Wave 4 separation requirement into an executable rule;
- assign a reviewer, production approver, audit observer or policy owner;
- compare or resolve real identities;
- evaluate a real assignment, conflict, violation or exception;
- authorize a review decision or production approval;
- activate candidate intake, review workflow or readiness integration.

## Pinned upstream baseline

The artifact pins, without modifying:

- activation prerequisites artifact `wave-5.slice-2.grade-7-9-math.v1`;
- reviewer role ownership policy artifact
  `wave-5.slice-5.grade-7-9-math.v1` and policy
  `wave-5.slice-5.diagnostic-reviewer-role-ownership.placeholder.v1`;
- Wave 4 review authority artifact `wave-4.slice-8.grade-7-9-math.v1` and
  policy `wave-4.slice-8.diagnostic-review-authority.placeholder.v1`;
- Wave 4 workflow artifact `wave-4.slice-7.grade-7-9-math.v1` and workflow
  version `wave-4.slice-7.diagnostic-review-workflow-state.placeholder.v1`;
- readiness policy `wave-3-slice-11-diagnostic-readiness-policy-v1`.

Every referenced policy remains deferred or unresolved. Upstream reviewer and
audit identities, role assignments, review decisions, approved decisions and
production approvals remain zero.

## Policy identity

The placeholder has policy ID
`diagnostic-separation-of-duties-enforcement`, policy version
`wave-5.slice-6.diagnostic-separation-of-duties-enforcement.placeholder.v1`
and state `UNRESOLVED_DEFERRED`.

The stable identifiers version an unresolved placeholder only. There is no
active ruleset, policy approval, runtime enforcement, assignment-time check,
decision-time check, review authority or production authority.

## Incompatible role combinations placeholder

The artifact pins exactly the three Wave 4 requirement groups:

- `SUBSTANTIVE_REVIEWER_SEPARATE_FROM_PRODUCTION_APPROVER`;
- `AUDIT_OBSERVER_SEPARATE_FROM_DECISION_ROLES`;
- `NO_SELF_REVIEW_OR_SELF_APPROVAL`.

Their participant lists remain the exact Wave 4 role-placeholder IDs. Each is
`REFERENCE_ONLY_NOT_ENFORCED`, has no enforcement-policy reference and enables
neither runtime evaluation nor decision authorization. They are requirement
groups, not an approved pairwise incompatibility matrix.

## Maker/checker separation placeholder

A future policy must define how candidate authorship, substantive review and
final production approval are bound to independently resolvable identities,
how one identity is prevented from occupying incompatible positions, and how
duplicate identities are excluded from quorum.

`CANDIDATE_AUTHOR_ACTOR_PLACEHOLDER` is an abstract, non-authorizing actor
class. It is not an eighth reviewer role, real candidate author, identity or
assignment. Slice 6 selects no identity-comparison or evaluation policy and
enables no maker/checker enforcement.

## Production approver separation placeholder

A future approved rule must keep every substantive reviewer distinct from the
final production approver. A production approver must not replace a missing
substantive gate or approve an item they substantively reviewed. Slice 6
defines no active separation rule and grants no production authority.

## Reviewer self-approval prohibition placeholder

A future policy must fail closed when an actor would review their own work,
count twice toward quorum or approve a decision in which they occupied an
incompatible role. Enforcement must be evaluated at assignment time and again
at decision time using authorized identity bindings.

Slice 6 records no identity binding and performs no comparison or runtime
authorization check.

## Candidate author and reviewer separation placeholder

A future policy must prevent a candidate author from acting as a substantive
reviewer or final approver for the same governed candidate and version. The
policy must define authorship evidence, comparison scope, revision behavior
and fail-closed handling for unresolved identity.

Slice 6 records no candidate, authorship, candidate ID, identity or assignment.

## Audit observer separation placeholder

The audit observer must remain independent from substantive reviewer and
production-decision roles and must never make a review or production decision.
Slice 6 retains `AUDIT_OBSERVER_PLACEHOLDER` as taxonomy only and creates no
audit identity, assignment, observation or authority.

## Enforcement authority placeholder

A future approved policy must define who owns the separation rules, who may
evaluate them, how authorization is proven at assignment and decision time,
how stale or unavailable identity data fails closed, and how rule changes are
versioned and audited.

The current authority is `UNASSIGNED_ENFORCEMENT_AUTHORITY_PLACEHOLDER`.
Authority and policy references are null, rule lists are empty, and policy
approval, runtime enforcement, assignment-time evaluation, decision-time
evaluation and authorization remain disabled.

## Violation handling placeholder

A future policy must define detection, containment, affected-assignment and
decision invalidation, reassignment, escalation, audit preservation,
remediation and recovery. It must coordinate with the separately unresolved
conflict-of-interest, evidence, withdrawal and readiness policies.

Slice 6 defines no violation policy, detects no violation and records no
violation or remediation event.

## Waiver and exception placeholder

Whether any exception can exist remains an open decision. A future policy, if
exceptions are permitted at all, must define explicit authority, bounded scope,
expiry, independent review, audit evidence and fail-closed behavior.

No waiver or exception may authorize production approval, satisfy a missing
gate, override separation enforcement or change readiness. Slice 6 defines no
waiver policy and records no waiver or exception.

## Decision requirements

The artifact contains exactly nine `TO_BE_DECIDED` requirements:

1. incompatible role combinations;
2. maker/checker separation;
3. production approver separation;
4. reviewer self-approval prohibition;
5. candidate author and reviewer separation;
6. audit observer separation;
7. separation enforcement authority;
8. separation violation handling;
9. separation waiver and exception policy.

Every decision and policy reference is null, every active-rule list is empty
and every decision-recorded flag is false. These are unresolved categories,
not decisions, evidence or active policy.

## Protected record boundary

Policy decisions, real candidates, authorship, digest values, review evidence,
candidate-author identities, reviewer identities, audit identities, role and
reviewer assignments, conflicts, violations, waivers, exceptions, enforcement
authority assignments, active enforcement rules, review decisions, approved
decisions and production approvals all remain absent. Every corresponding
array is empty and every aggregate count is zero.

Unknown, missing, populated, active or authorizing fields fail closed. Email,
UUID, user/account-ID, candidate-ID and hash-like values are rejected, as are
answer, scoring, learner-data, provider and copied-content material.

## Activation and readiness boundary

Activation remains `BLOCKED`; the review workflow remains `INACTIVE`;
enforcement, decision authorization and production approval remain disabled.

Readiness remains `NOT_READY` with exactly:

- `INCOMPLETE_COVERAGE`;
- `NON_PRODUCTION_FIXTURES`.

This placeholder removes no blocker and adds no readiness reason code.

## Deterministic validation expectations

The Slice 6 validator must:

- validate the full Slice 2-5 and Wave 4 authority/workflow chain;
- require exact upstream artifact and policy versions;
- require the exact unsatisfied `separation_of_duties_enforcement`
  prerequisite;
- require the exact seven-role taxonomy and three upstream requirement groups;
- require exactly nine unique unresolved decision requirements;
- reject active incompatibility, identity comparison or enforcement rules;
- keep enforcement authority unassigned and disabled;
- prevent any waiver or exception from authorizing production;
- require every protected record array empty and every count zero;
- keep activation, workflow and readiness at their blocked baseline;
- reject forbidden fields, private identifiers and hash-like values;
- enforce an exact static worktree allowlist and reject API, OpenAPI, Prisma,
  web, runtime, workspace-manifest and lockfile paths.

Passing validation proves only internal consistency of the placeholder. It does
not approve policy, satisfy a prerequisite, prove independence or make review
activation ready.

## Open decision and later gate

`W5-OD-SEPARATION-ENFORCEMENT` remains open in full: identity comparison,
assignment-time and decision-time enforcement, self-review and self-approval,
reviewer/approver independence, audit-observer independence, quorum
de-duplication and whether any exception can exist.

The conflict-of-interest and audit-identity prerequisites remain separate and
unsatisfied. A later separately authorized slice must approve concrete rules
and provide synthetic positive and negative authorization evidence before this
prerequisite can be considered for satisfaction. That later gate must not
automatically activate the workflow or change readiness.
