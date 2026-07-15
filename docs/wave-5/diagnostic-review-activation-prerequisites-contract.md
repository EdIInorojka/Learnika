# Diagnostic review activation prerequisites contract

## Purpose

This contract defines the fail-closed prerequisites that must be approved,
implemented and validated before Learnika may activate a future diagnostic
candidate review workflow for Russian mathematics in grades 7-9.

It is a static contract, not an activation record. It does not approve a
policy, create a candidate or identity, record evidence or a decision, grant
authority, enable a workflow, permit production use or change readiness.

## Contract status and interpretation

All prerequisite areas in Slice 1 are `UNSATISFIED_DEFERRED`. That phrase is
documentation vocabulary only and is not a machine-readable workflow state or
readiness reason code.

The following interpretation rules apply:

- a prerequisite is satisfied only by a separately approved, versioned and
  machine-validatable policy or evidence artifact;
- a definition, placeholder, role name, repository author or document owner is
  not authorization or proof;
- absence of a value, record, conflict or rejection is never approval;
- all dependent artifacts must pin the same exact candidate and current policy
  versions;
- missing, stale, conflicting, revoked or unverifiable data fails closed;
- satisfying every prerequisite does not itself activate the workflow; a
  separate future activation gate remains mandatory.

## Pinned Wave 4 baseline

This contract carries forward, without modifying, these Wave 4 artifacts:

| Capability | Pinned artifact | Current condition |
| --- | --- | --- |
| Review coverage | `wave-4.slice-2.grade-7-9-math.v1` | Five `DRAFT_ONLY`, six `GAP_CONFIRMED`, zero `PRODUCTION_APPROVED` |
| Review evidence | `wave-4.slice-3.grade-7-9-math.v1` | 66 empty gate placeholders, zero evidence records |
| Gate rubric | `wave-4.slice-4.grade-7-9-math.v1` | Six non-decision gate definitions, 23 criteria |
| Candidate digest registry | `wave-4.slice-5.grade-7-9-math.v1` | 11 placeholders, no assigned identities or digest values |
| Canonicalization | `wave-4.slice-6.grade-7-9-math.v1` | Unresolved and inactive |
| Workflow state | `wave-4.slice-7.grade-7-9-math.v1` | 11 `NOT_SUBMITTED` placeholders, no active review |
| Review authority | `wave-4.slice-8.grade-7-9-math.v1` | Placeholder roles only, no authority or assignments |

These artifacts remain non-production and storage-disabled. This contract does
not advance any aggregate or record array.

## Activation entry gate

Before a future activation proposal may be considered, every row below must
have an approved owner, policy version, machine-validatable acceptance evidence
and explicit current status. The current Slice 1 status of every row is
`UNSATISFIED_DEFERRED`.

| Prerequisite area | Required future outcome | Minimum acceptance evidence before activation |
| --- | --- | --- |
| Candidate identity | Stable identity and revision policy approved | Versioned policy, uniqueness and non-reuse tests, invalidation semantics |
| Canonicalization and digest | Concrete canonicalization and immutable digest policies approved | Field inventory, deterministic serialization, algorithm and encoding policy, synthetic reproducibility vectors |
| Reviewer-role ownership | Accountable owners and eligibility rules approved | Versioned role policy, appointment and revocation controls, quorum rules |
| Separation of duties | Enforceable assignment and decision constraints approved | Fail-closed policy plus positive and negative authorization tests |
| Conflict of interest | Disclosure, evaluation, recusal and escalation policy approved | Versioned rules, private reference model and blocked-assignment tests |
| Audit identity | Authorized opaque identity-reference policies approved | Binding, authorization, revocation, access and audit validation evidence |
| Evidence lifecycle | Evidence schema, storage and retention policy approved | Integrity pins, access controls, retention/deletion matrix and recovery tests |
| Production authority | Independent final approval authority approved | Eligibility, quorum, explicit decision and withdrawal policy tests |
| Coverage closure | Per-slot closure plan and threshold approved | Current coverage report, rights-safe authoring plan and no-silent-waiver checks |
| Readiness integration | Separate readiness consumption plan approved | Fail-closed validator design and policy-transition test plan |
| Rollback and withdrawal | Invalidation, containment and withdrawal policy approved | Trigger matrix, propagation rules and restoration/forward-fix tests |
| CI and validation | Clean, deterministic validation gate approved | Required checks, negative fixtures, exact scope controls and provenance pins |

The sections below define the obligations for those future outcomes. They do
not provide the listed evidence in Slice 1.

## Reviewed candidate identity policy

Before candidate intake, a separately approved identity policy must define:

- the accountable allocator and namespace owner;
- the identity format and validation grammar;
- uniqueness, reservation, collision and non-reuse rules;
- version and revision semantics for content and metadata changes;
- the relationship among candidate ID, artifact version, blueprint slot and
  canonical skill references;
- which changes create a new identity or version and invalidate prior review;
- retirement and tombstone behavior;
- prohibition on learner PII, reviewer PII, source text or workflow decisions
  inside an identifier.

The Wave 4 format template remains unassigned vocabulary. Registry-entry and
workflow-entry IDs must not be promoted to candidate IDs. An identity alone
does not prove immutability, review status or production eligibility.

## Canonicalization and immutable digest policy approval

Before any real digest is generated, separate approved policies must define:

- the exact content and metadata field inventory;
- explicit inclusion and exclusion decisions for every field class;
- deterministic field ordering and serialization to bytes;
- locale, Unicode, Russian-language and line-ending handling;
- mathematical notation, symbol, unit and expression serialization;
- whitespace and punctuation handling;
- canonicalization ruleset versioning, migration and invalidation;
- the digest algorithm identifier, output encoding and domain separation;
- collision detection, incident response and algorithm migration;
- independent reproducibility requirements and synthetic test vectors.

Canonicalization must execute before digest generation. Evidence, gate
decisions and production approval must pin the candidate identity, candidate
version, canonicalization policy version, digest policy version and one exact
digest value. A change to any included field or applicable policy invalidates
dependent review records according to the approved invalidation policy.

Slice 1 selects no field, rule, algorithm or encoding and creates no digest or
test vector containing real candidate content.

## Reviewer-role ownership

Before assignments are possible, a versioned authority policy must establish
an accountable organizational owner for each substantive gate and for final
production approval. It must define:

- eligibility, competence and independence criteria;
- appointment, authorization, delegation and expiry;
- minimum reviewer counts, quorum and decision aggregation;
- scope limits by gate, subject, locale and grade band;
- suspension, revocation, reassignment and emergency coverage;
- who owns policy maintenance and access review;
- how authorization is proven without embedding personal identity in
  curriculum artifacts.

The seven Wave 4 role names remain placeholders. This contract creates no real
role, person, account, assignment or entitlement.

## Separation-of-duties enforcement

The future authority layer must enforce, for the same exact candidate:

- an author cannot approve their own candidate at a substantive gate;
- a substantive reviewer cannot grant final production approval;
- the final production approver cannot satisfy a missing substantive gate;
- the audit observer cannot make review or production decisions;
- one identity cannot be counted twice toward a quorum;
- an unauthorized, expired, revoked, conflicted or missing assignment blocks
  the decision.

Enforcement must occur both when an assignment is created and when a decision
is recorded. Policy-version and authorization snapshots must be auditable.
Exceptions, if any are later permitted, require explicit authority, bounded
conditions, separate audit evidence and fail-closed validation; silence is not
an exception.

Slice 1 does not activate enforcement or prove that separation currently
exists.

## Conflict-of-interest policy

Before assignment, an approved conflict policy must define:

- disclosure obligations and disqualifying relationship categories;
- evaluation timing at assignment and again before decision;
- recusal, reassignment, escalation and appeal ownership;
- handling of late disclosures and previously recorded decisions;
- whether any exception is permitted and the independent authority required;
- private declaration references, access control, retention and deletion;
- minimal audit evidence that proves evaluation without exposing personal
  details in ordinary curriculum artifacts.

An unresolved, stale or unavailable conflict evaluation must block assignment
or decision. No conflict record or evaluation is created by this contract.

## Reviewer and audit identity policy

Reviewer identity and audit identity must remain distinct policy concerns. A
future approved design must define opaque reference formats and prove:

- binding to an authenticated internal principal and authorized role;
- uniqueness and non-reuse within the applicable audit domain;
- authorization state at assignment and decision time;
- revocation, expiry and historical traceability;
- controlled resolution of an opaque reference by authorized investigators;
- data minimization, access logging, retention and deletion behavior;
- separation between identity data and curriculum/content artifacts.

Names, emails and raw account IDs must not be embedded in curriculum artifacts
or treated as sufficient identity evidence. Commit metadata and repository
authorship are not valid standalone reviewer or audit identity evidence. Slice
1 defines no reference format and records no real identity.

## Evidence storage and retention policy

Before evidence can be recorded, separately approved policies must define:

- the machine-readable review-evidence schema and allowed evidence categories;
- required candidate, digest, blueprint, rubric and policy-version pins;
- evidence sufficiency and freshness rules for every gate;
- private storage location, encryption, integrity and backup requirements;
- least-privilege create, read, amend, invalidate and audit permissions;
- reference formats that do not expose protected content or personal data;
- a retention and deletion matrix by evidence category;
- legal-hold, rights-dispute and security-incident handling;
- invalidation, verifiable deletion, deletion audit evidence and tombstone
  semantics;
- recovery, reconciliation and orphan-reference checks.

Free-form sensitive notes, learner data, copied textbook passages and ordinary
application logs are not evidence stores. Slice 1 chooses no storage system,
creates no schema and records no evidence.

## Production approval authority

Before production approval can exist, a separately approved authority policy
must define:

- the accountable production-approval owner and eligible approver role;
- minimum approver count, quorum, delegation, expiry and revocation;
- independence from candidate authors and substantive reviewers;
- an explicit decision schema tied to one exact candidate and current pins;
- the required proof that all five substantive gates are current;
- withdrawal, emergency suspension and re-approval authority;
- audit ownership and retention.

Production approval must be an explicit recorded decision. It cannot be
inferred from complete gates, fixture presence, coverage totals, repository
merge, CI success or absence of objections. Slice 1 grants no decision
authority and creates no approval artifact.

## Coverage-gap closure plan

Before activation, an approved plan must address all 11 current blueprint
slots individually:

- six `GAP_CONFIRMED` slots require future original or documented
  rights-cleared candidate authoring;
- five `DRAFT_ONLY` slots require a future decision to replace or revise the
  non-production fixtures and then complete the full review path;
- each slot must retain exact blueprint and canonical-skill pins;
- authoring, rights evidence, review sequencing and responsible policy owners
  must be defined;
- duplicate candidates cannot compensate for an uncovered slot;
- any waiver or blueprint change requires an explicit separately approved
  policy decision and cannot be inferred.

The production-coverage threshold and balance rules remain open decisions.
Until approved, every slot is treated as not production-covered. Slice 1 adds
no candidate, edits no fixture and advances no coverage state.

## Readiness integration plan

Review workflow activation and diagnostic readiness are separate gates. Before
any future readiness-policy change, an approved integration plan must define a
fail-closed validator that consumes only current, machine-validated:

- per-slot coverage;
- exact candidate and digest pins;
- substantive gate evidence and decisions;
- production approval authority and decision records;
- policy versions, expiry, invalidation and withdrawal state.

The plan must specify reconciliation, stale-reference handling, negative test
vectors and the effect of withdrawal on coverage. No review-workflow event may
directly return `READY`.

This contract does not change
`wave-3-slice-11-diagnostic-readiness-policy-v1`. Readiness remains
`NOT_READY`, with exactly `INCOMPLETE_COVERAGE` and
`NON_PRODUCTION_FIXTURES`. Activation prerequisites are not additional
readiness reason codes.

## Rollback, invalidation and withdrawal policy

Before activation, an approved policy must define:

- triggers including candidate revision, policy change, expired evidence,
  rights dispute, safety issue, authorization failure and digest incident;
- who may suspend, invalidate, withdraw and restore a candidate;
- immediate containment of an affected candidate from future review or use;
- propagation to evidence, decisions, production approval and slot coverage;
- audit records that preserve history without treating withdrawn approval as
  current;
- rollback versus forward-fix criteria, re-review and re-approval;
- reconciliation and recovery tests for partial failure.

Withdrawal must fail closed and must not silently delete history or transfer an
approval to a replacement candidate. Slice 1 performs no rollback or
withdrawal and records no such event.

## CI and validation expectations

Any future activation implementation must provide deterministic CI validation
for:

- schema validation with unknown-field rejection;
- exact version-pin and cross-artifact consistency;
- candidate identity uniqueness and revision behavior;
- canonicalization reproducibility using synthetic non-production fixtures;
- digest algorithm and encoding conformance without publishing protected
  candidate content;
- authorization, quorum, separation-of-duties and conflict failures;
- evidence sufficiency, freshness, retention and invalidation;
- production-approval eligibility and withdrawal propagation;
- per-slot coverage and readiness fail-closed behavior;
- absence of learner PII, reviewer PII, copied textbook content, answer keys,
  provider payloads and unauthorized production claims;
- exact worktree scope with explicit rejection of API, OpenAPI, Prisma, web,
  runtime and lockfile paths.

CI success proves only that the tested contract is internally consistent. It
does not create a review decision, production approval or readiness result.
Real policy artifacts and workflow activation require later approved slices.

## Required sequencing

The safe dependency order is:

1. approve candidate identity, canonicalization and digest policies;
2. approve role ownership, identity, conflict and separation policies;
3. approve evidence schema, storage and retention policies;
4. approve production authority and withdrawal policies;
5. approve the coverage threshold and rights-safe closure plan;
6. implement and validate those policies using synthetic fixtures;
7. present a separate narrowly scoped workflow activation proposal;
8. consider readiness integration only through its own later gate.

A later gate may refine this order, but it may not bypass a prerequisite or
infer approval from a placeholder.

## Slice 1 completion condition

Slice 1 is complete when these documents and their exact scope guards pass the
repository validation chain while every Wave 4 artifact remains unchanged.
Completion means only that the future prerequisites are documented. It does
not mean that activation is ready, authorized or complete.
