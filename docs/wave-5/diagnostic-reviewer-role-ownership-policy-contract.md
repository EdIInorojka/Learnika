# Diagnostic reviewer role ownership policy placeholder contract

## Purpose

This contract defines the static placeholder boundary for a future diagnostic
reviewer role ownership policy for Russian mathematics in grades 7-9. It makes
unresolved ownership, eligibility, assignment authority and lifecycle
requirements machine-validatable without appointing an owner, authorizing a
reviewer or activating a review capability.

The contract creates no person, account, reviewer identity, audit identity,
role owner, assignment, role grant, decision or production approval. It is not
acceptance evidence for an activation prerequisite.

## Contract status

The policy remains `UNRESOLVED_DEFERRED`. The activation prerequisite
`reviewer_role_ownership` remains `UNSATISFIED_DEFERRED`, retains the generic
`UNASSIGNED_OWNER_PLACEHOLDER` and has no evidence references.

Creating and validating this placeholder must not:

- satisfy or advance any activation prerequisite;
- turn a Wave 4 role name into an executable role or entitlement;
- appoint an organizational or personal role owner;
- approve eligibility, quorum, delegation or revocation rules;
- create an identity, assignment or active role grant;
- grant review-decision or production-approval authority;
- activate candidate intake or the review workflow;
- change diagnostic coverage or readiness.

## Pinned upstream baseline

The artifact pins, without modifying:

- activation prerequisites artifact `wave-5.slice-2.grade-7-9-math.v1`;
- Wave 4 review authority artifact `wave-4.slice-8.grade-7-9-math.v1` and
  policy `wave-4.slice-8.diagnostic-review-authority.placeholder.v1`;
- candidate identity policy placeholder
  `wave-5.slice-3.grade-7-9-math.v1`;
- canonicalization and digest policy placeholder
  `wave-5.slice-4.grade-7-9-math.v1`;
- readiness policy `wave-3-slice-11-diagnostic-readiness-policy-v1`.

All referenced policies remain deferred or unresolved. The referenced
artifacts contain zero real candidate IDs, reviewer assignments, reviewer or
audit identities, approved decisions and production approvals.

## Policy identity

The placeholder has policy ID `diagnostic-reviewer-role-ownership`, policy
version
`wave-5.slice-5.diagnostic-reviewer-role-ownership.placeholder.v1` and state
`UNRESOLVED_DEFERRED`.

The stable identifiers distinguish this placeholder from any future approved
policy. They do not create an active ruleset, ownership authority, assignment
authority, role grant, review authority or production authority.

## Reviewer role taxonomy placeholder

The artifact copies exactly the seven non-authorizing Wave 4 role placeholders:

- `METHODOLOGY_REVIEWER_PLACEHOLDER` for `methodology`;
- `SAFETY_REVIEWER_PLACEHOLDER` for `safety_no_answer`;
- `RIGHTS_REVIEWER_PLACEHOLDER` for `rights_copyright`;
- `GRADE_PLACEMENT_REVIEWER_PLACEHOLDER` for `grade_placement`;
- `ACCESSIBILITY_REVIEWER_PLACEHOLDER` for `accessibility_readability`;
- `PRODUCTION_APPROVER_PLACEHOLDER` for `production_approval`;
- `AUDIT_OBSERVER_PLACEHOLDER` for `audit_observation`.

These values are taxonomy references only. They are not real roles, people,
accounts, assignments or permissions. The production approver placeholder does
not satisfy `production_approval_authority`, and the audit observer placeholder
does not create an audit identity.

## Role ownership placeholder

Every taxonomy entry has one matching ownership placeholder. Each remains
`TO_BE_DECIDED`, uses `UNASSIGNED_ROLE_OWNER_PLACEHOLDER`, has null owner and
assignment references, and keeps ownership and role grants inactive.

A future separately approved policy must define accountable organizational
ownership, policy-maintenance responsibility and access-review ownership.
Personal names, email addresses, account IDs, repository authorship and commit
metadata are not valid ownership evidence and must not appear in curriculum
artifacts.

## Eligibility and assignment authority placeholders

A future policy must approve competence, independence and eligibility criteria
for each role. It must separately define who may appoint or assign a reviewer,
the allowed subject, locale, grade-band and gate scope, minimum reviewer counts,
quorum and decision aggregation.

Slice 5 records no eligibility criteria, authority policy, scope rule, minimum
count or quorum. All references and rule arrays are null or empty, and
evaluation, appointment, assignment and decision authority remain disabled.

## Reviewer lifecycle placeholder

A future policy must define appointment start, expiry, renewal, suspension,
reassignment and termination. It must prove the authorization state at
assignment and decision time and fail closed for missing, expired, suspended or
revoked authority.

Slice 5 records no lifecycle rule or lifecycle event and enables no lifecycle
processing.

## Delegation and revocation placeholder

A future policy must define whether delegation is permitted, who may delegate,
scope and duration limits, revocation propagation, emergency coverage and
reconciliation of affected assignments or decisions.

Slice 5 approves no delegation, revocation or emergency exception. Policy
references and rule arrays remain null or empty, and all related capabilities
remain disabled.

## Separation from audit identity

Role ownership, reviewer identity and audit identity remain distinct policy
concerns. A future approved design must keep the audit observer independent
from reviewer and production decision roles, use controlled opaque identity
references and prevent identity data from entering ordinary curriculum
artifacts.

Slice 5 defines no identity format, binding, resolution policy or enforcement
rule. Reviewer and audit identity references and records remain absent. This
placeholder does not satisfy `audit_identity_policy` or
`separation_of_duties_enforcement`.

## Decision requirements

The artifact contains exactly eight `TO_BE_DECIDED` requirements:

1. accountable role ownership;
2. role eligibility, competence and independence;
3. appointment and assignment authority;
4. scope, minimum counts, quorum and decision aggregation;
5. reviewer lifecycle, expiry, suspension and reassignment;
6. delegation, revocation and emergency coverage;
7. policy maintenance and access-review ownership;
8. reviewer and audit identity separation.

Every decision and policy reference is null, every active-rule list is empty
and every decision-recorded flag is false. The requirements are unresolved
categories, not policy decisions or evidence.

## Protected record boundary

Policy decisions, role owners, owner assignments, eligibility records,
assignment authorities, lifecycle records, delegations, revocations, real
reviewer roles, active role grants, reviewer identities, audit identities,
reviewer assignments, review decisions, approved decisions and production
approvals all remain absent. Every corresponding record array is empty and
every aggregate count is zero.

Unknown, missing, populated, active or approving fields fail closed. Email,
UUID, user/account-ID and hash-like values are rejected, as are answer,
scoring, learner-data, provider, copied-content, candidate-digest and concrete
candidate-ID material.

## Activation and readiness boundary

Activation remains `BLOCKED`; the review workflow remains `INACTIVE`; policy
approval, ownership activation, assignment, role grants, review authority and
production authority remain disabled.

Readiness remains `NOT_READY` with exactly:

- `INCOMPLETE_COVERAGE`;
- `NON_PRODUCTION_FIXTURES`.

This placeholder removes no blocker and adds no readiness reason code.

## Deterministic validation expectations

The Slice 5 validator must:

- validate the full Slice 2-4 and Wave 4 authority chain;
- require exact upstream artifact and policy versions;
- require the exact unsatisfied `reviewer_role_ownership` prerequisite;
- require the exact seven-role taxonomy and seven unassigned ownership rows;
- require exactly eight unique unresolved requirement IDs;
- reject real or active owners, roles, identities, assignments and grants;
- reject policy activation, review authority, decisions and approvals;
- require every protected record array empty and every count zero;
- keep activation, workflow and readiness at their blocked baseline;
- reject forbidden fields, private identifiers and hash-like values;
- enforce an exact static worktree allowlist and reject API, OpenAPI, Prisma,
  web, runtime, workspace-manifest and lockfile paths.

Passing validation proves only internal consistency of the placeholder. It does
not approve role ownership, satisfy a prerequisite or make review activation
ready.

## Open decisions and later gate

`W5-OD-ROLE-OWNERSHIP` remains open in full. Eligibility, quorum, lifecycle,
delegation, revocation, identity separation, policy maintenance and access
review also remain unresolved.

A later separately authorized slice must approve concrete policies and provide
synthetic deterministic authorization evidence before this prerequisite can be
considered for satisfaction. That later gate must not automatically activate
the workflow, satisfy other prerequisites or change readiness.
