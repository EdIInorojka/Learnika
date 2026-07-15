# Diagnostic candidate identity policy placeholder contract

## Purpose

This contract defines the static placeholder boundary for a future diagnostic
candidate identity policy for Russian mathematics in grades 7-9. It provides a
machine-validatable location for unresolved policy requirements without
selecting, approving or implementing an identity system.

The contract creates no candidate identity, namespace owner, reservation,
allocation, submission, review decision or production approval. It is not
acceptance evidence for an activation prerequisite.

## Contract status

The policy artifact and every decision requirement remain unresolved and
deferred. The activation prerequisite `candidate_identity_policy` remains
`UNSATISFIED_DEFERRED`; its owner remains
`UNASSIGNED_OWNER_PLACEHOLDER`, and its evidence-reference array remains empty.

Creating and validating this placeholder must not:

- satisfy or advance an activation prerequisite;
- approve the referenced Wave 4 format template;
- instantiate a candidate ID;
- activate candidate intake or the review workflow;
- change coverage or readiness;
- provide review, policy-approval or production evidence.

## Pinned upstream baseline

The artifact pins these existing static baselines without modifying them:

- activation prerequisites artifact
  `wave-5.slice-2.grade-7-9-math.v1`;
- candidate digest placeholder registry
  `wave-4.slice-5.grade-7-9-math.v1`;
- review coverage artifact `wave-4.slice-2.grade-7-9-math.v1`;
- diagnostic blueprint `wave-3.slice-3.grade-7-9-math.v1`;
- readiness policy `wave-3-slice-11-diagnostic-readiness-policy-v1`.

The coverage reference contains exactly the 11 known blueprint slot IDs. It is
a linkage list only; it creates no per-slot candidate identity record and does
not duplicate the Wave 4 registry placeholders.

## Policy identity placeholder

The placeholder has a stable policy ID and placeholder version so later
artifacts can distinguish this unresolved contract from a future approved
policy. Its policy state is `UNRESOLVED_DEFERRED`, its active ruleset is absent,
and policy approval, candidate assignment, candidate submission and production
approval are all disabled.

The placeholder version is not an approved policy version and cannot be used
as authority for allocation or validation.

## Candidate ID pattern placeholder

The Wave 4 candidate digest registry contains an illustrative format template.
Slice 3 references that template only with treatment
`REFERENCE_ONLY_NOT_APPROVED` and retains its upstream state
`FORMAT_DEFINED_ASSIGNMENT_DEFERRED`.

The reference is not an active grammar. It cannot be used to instantiate or
validate IDs, and it does not decide:

- namespace ownership or allocation authority;
- allowed characters, segments, length or normalization;
- reservation, uniqueness, collision and non-reuse rules;
- version and revision semantics;
- retirement, withdrawal, supersession or tombstone references.

No registry-entry ID, workflow-entry ID, blueprint slot ID or repository path
may be promoted to a candidate ID by inference.

## Namespace ownership placeholder

The namespace owner remains the generic
`UNASSIGNED_NAMESPACE_OWNER_PLACEHOLDER`. Owner and assignment references are
null, and allocation authority is disabled.

A future separately approved policy must define accountable organizational
ownership, appointment and revocation, delegation, namespace boundaries,
allocation controls and audit responsibilities. Names, emails, raw account
identifiers, learner data and repository authorship are not valid ownership
evidence and must not appear in curriculum artifacts.

## Collision prevention placeholder

Reservation, collision-prevention and non-reuse policy references remain null,
with enforcement disabled. A future policy must define deterministic
uniqueness, atomic reservation, collision response, released-name handling,
non-reuse and reconciliation behavior. Absence of a collision record is not
proof that a candidate identity is valid or unique.

## Versioning policy placeholder

Versioning, revision and invalidation rule references remain null, with
enforcement disabled. A future policy must decide:

- which content and metadata changes retain an identity;
- which changes require a new version or new identity;
- how artifact, blueprint-slot and canonical-skill references are pinned;
- how prior evidence, decisions and approvals are invalidated;
- how concurrent revisions and stale references fail closed.

Slice 3 records none of those decisions.

## Withdrawal and supersession reference placeholder

Withdrawal and supersession reference formats and policy references remain
null, and recording is disabled. A future approved policy must define
retirement, tombstone, withdrawal, containment, replacement, historical
traceability and non-transfer of prior review state.

No withdrawal or supersession record is created in this slice.

## Decision requirements

The artifact contains exactly eight `TO_BE_DECIDED` requirements:

1. namespace and allocation ownership;
2. identity format and validation grammar;
3. uniqueness, reservation, collision and non-reuse;
4. version and revision semantics;
5. candidate, artifact, blueprint and canonical-skill linkage;
6. new-version and invalidation triggers;
7. retirement and tombstone semantics;
8. identifier data exclusions.

Every decision reference and policy reference is null, every active-rule list
is empty, and every decision-recorded flag is false. The requirements are
future decision categories, not policy decisions or acceptance evidence.

## Protected record boundary

All policy-decision, candidate-identity, reservation, allocation, submission,
candidate-approval, digest-value, review-evidence, review-decision,
owner-assignment, withdrawal, supersession and production-approval record
arrays remain empty.

Accordingly, the artifact declares:

- zero real candidate IDs;
- zero submitted candidates;
- zero approved candidates;
- zero production approvals;
- zero active rules, decisions, assignments or identity lifecycle records.

Unknown, missing, stale or populated fields fail closed.

## Activation and readiness boundary

Activation remains `BLOCKED`; the review workflow remains `INACTIVE`; all
activation, readiness-transition and production flags remain false.

Readiness remains `NOT_READY` with exactly:

- `INCOMPLETE_COVERAGE`;
- `NON_PRODUCTION_FIXTURES`.

The placeholder does not remove a blocker or add a readiness reason code.

## Deterministic validation expectations

The Slice 3 validator must:

- validate the complete Slice 2 and Wave 4 upstream chain;
- require exact fields, versions, counts and the eight unique requirement IDs;
- require the targeted prerequisite to remain unchanged and unsatisfied;
- require the Wave 4 template to remain reference-only and non-instantiating;
- require exactly the 11 known coverage slot references;
- reject concrete namespace owners, candidate IDs and populated records;
- reject approved, active, decided, submitted or production claims;
- reject learner/reviewer PII, copied content, evaluation fields, provider
  payloads and digest-value material;
- enforce an exact static worktree scope and reject API, OpenAPI, Prisma, web,
  runtime and lockfile paths.

Passing validation proves only internal consistency of the placeholder. It does
not approve policy choices or make candidate identity infrastructure ready.

## Open decisions and later gate

`W5-OD-CANDIDATE-IDENTITY` remains open in full. Before the prerequisite can be
considered for satisfaction, a separately authorized slice must approve the
owner, grammar, allocation, uniqueness, versioning, invalidation, retirement,
privacy and audit policies and provide synthetic deterministic evidence.

Any such later work must also define how it updates the activation prerequisite
without automatically activating the review workflow or changing readiness.
