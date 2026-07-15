# Diagnostic review evidence placeholder contract

## Purpose

This contract defines a static, machine-validatable placeholder for future
diagnostic review evidence records in Russian mathematics for grades 7-9. It
extends the Slice 1 review semantics and pins the Slice 2 coverage baseline. It
does not record a review decision, identify a reviewer, approve content or
change diagnostic readiness.

## Slice 3 boundary

Slice 3 is metadata-only and non-production. It may describe the future shape
of review evidence and represent empty placeholders for all current blueprint
slots and gates. It cannot:

- add or revise diagnostic item content;
- populate an immutable candidate digest;
- claim that evidence has been collected;
- assign or identify a reviewer;
- claim authorization, audit identity or separation of duties;
- approve any methodology, safety, rights, grade or accessibility gate;
- grant production approval;
- enable runtime, persistence, API, OpenAPI or learner-facing behavior;
- alter the Wave 3 readiness policy or return `READY`.

## Version pins

The placeholder artifact must pin:

- review coverage artifact `wave-4.slice-2.grade-7-9-math.v1`;
- diagnostic blueprint `wave-3.slice-3.grade-7-9-math.v1`;
- diagnostic readiness policy
  `wave-3-slice-11-diagnostic-readiness-policy-v1`;
- the six policy versions already recorded by the coverage artifact.

The coverage artifact remains authoritative for blueprint-slot membership,
coverage status, policy pins and the pending candidate-digest state. Slice 3
must not reinterpret or advance those values.

## Future evidence record unit

A future evidence record is scoped to one exact candidate, one blueprint slot
and one review gate. Before persistence or production use is designed, its
contract must provide these fields:

| Field | Requirement |
| --- | --- |
| `evidenceRecordVersion` | Version of the future evidence-record schema. |
| `evidenceRecordId` | Stable opaque identifier; absent from placeholders. |
| `reviewCoverageArtifactVersion` | Exact coverage artifact used for review. |
| `blueprintSlotId` | One slot present in that coverage artifact. |
| `gate` | One of the six required review gates. |
| `candidateDigest` | Immutable digest of the exact reviewed candidate. |
| `policyVersion` | Exact policy or rubric used for the gate. |
| `evidenceRef` | Opaque reference to separately governed review evidence. |
| `reviewerIdentityRef` | Auditable opaque identity reference under a future policy. |
| `auditIdentityRef` | Opaque reference proving authorization and audit linkage. |
| `decisionStatus` | Gate-specific decision under an approved state model. |
| `decidedAt` | Auditable decision timestamp. |

This table is a future contract boundary, not permission to populate a record
in Slice 3. Evidence references must never embed protected source content,
learner data, reviewer personal data, free-form review discussions or provider
payloads.

## Placeholder artifact shape

The Slice 3 artifact contains:

- metadata and upstream version pins;
- explicit reviewer-identity and audit-identity deferrals;
- the unchanged readiness decision and blockers;
- aggregate counts proving that no evidence or approval exists;
- one placeholder entry for each of the 11 coverage slots;
- six gate placeholders per slot;
- an empty `evidenceRecords` array.

Every slot placeholder copies only its blueprint slot ID and coverage status
from the Slice 2 artifact. It carries an unpopulated candidate digest with:

- state `PENDING_IMMUTABLE_CANDIDATE`;
- algorithm `sha256`;
- value `null`.

No digest value may be synthesized from a draft fixture. Fixture presence does
not make a candidate immutable or reviewed.

## Gate placeholders

Every slot has exactly these six gate keys:

- `methodology`;
- `safety_no_answer`;
- `rights_copyright`;
- `grade_placement`;
- `accessibility_readability`;
- `production_approval`.

Each gate placeholder must remain:

- `recordState: NOT_RECORDED`;
- pinned to the matching Slice 2 policy version;
- linked only to `PENDING_IMMUTABLE_CANDIDATE`;
- `decisionStatus: NO_DECISION`;
- without an evidence reference, reviewer identity reference, audit identity
  reference or decision timestamp.

The placeholder is not evidence that a review started, completed or failed.
It exists only to make the required future structure explicit and testable.

## Reviewer and audit identity

Reviewer identity and audit identity are independent unresolved policies.
Slice 3 records both as `DEFERRED` with null policy versions and null reference
formats. It stores no name, contact detail, account ID, role assignment or
other reviewer PII.

Before evidence records can exist, a later approved slice must define:

- eligible reviewer roles and authorization checks;
- separation-of-duty and conflict-of-interest rules;
- opaque identity-reference formats;
- audit-event ownership, access and retention;
- revocation and re-review behavior.

Missing identity or authorization evidence must fail closed. It must never be
inferred from a repository author, commit identity or free-form metadata.

## Aggregate invariants

For the Slice 3 baseline:

- blueprint slot count is 11;
- gate placeholder count is 66;
- recorded evidence count is 0;
- approved decision count is 0;
- production approval count is 0.

An aggregate cannot advance independently of validated records. In this slice,
the `evidenceRecords` array must remain empty, so every decision and approval
count must remain zero.

## Safety and data rules

The artifact and any future evidence record must exclude:

- final or correct answers, worked solutions, hints and scoring keys;
- checking, correctness, mastery or proficiency results;
- learner responses, child identity or other student data;
- real reviewer PII or free-form reviewer notes;
- copied textbook text or protected content;
- OCR, STT, LLM or other provider payloads;
- runtime request, persistence or delivery data.

The placeholder is synthetic metadata and is not authorized for production
storage or learner-facing use.

## Readiness boundary

Readiness remains `NOT_READY` under the existing Wave 3 policy. The blockers
remain `INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. An empty evidence
placeholder cannot close either blocker and adds no new readiness reason code.

Moving toward readiness requires separately approved production content,
immutable candidate digests, valid review evidence, authorized reviewer and
audit identity, explicit production approval, complete coverage and a later
readiness-policy integration slice.

## Open decisions

- evidence-record identifier and reference formats;
- evidence storage, authorization, retention and deletion;
- reviewer ownership, assignment and separation of duties;
- reviewer and audit identity policies;
- digest creation, canonicalization and invalidation rules;
- detailed gate rubrics and accepted evidence types;
- decision state transitions, expiry and withdrawal;
- production approval authority;
- readiness-policy integration;
- persistence, API and administrative tooling, if separately activated.
