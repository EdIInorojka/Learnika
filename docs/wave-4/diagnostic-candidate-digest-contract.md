# Diagnostic content candidate digest placeholder contract

## Purpose

This contract defines a static placeholder registry for future immutable
diagnostic content candidates in Russian mathematics for grades 7-9. It pins
the existing review coverage, evidence and gate-rubric artifacts and makes the
future candidate-to-review reference shape machine-validatable.

Slice 5 does not assign a candidate identity, calculate or record a digest,
embed diagnostic content, record review evidence or decisions, grant
production approval, or change diagnostic readiness.

## Slice 5 boundary

The registry is metadata-only, non-production and storage-disabled. Each
registry entry represents a blueprint-slot placeholder rather than an authored
or immutable candidate. A placeholder entry cannot advance coverage and does
not change a `GAP_CONFIRMED` or `DRAFT_ONLY` status.

The slice cannot:

- add or revise a diagnostic item stem or other candidate content;
- assign a real candidate ID;
- select a digest algorithm for production use;
- define executable canonicalization rules;
- calculate, import or record a digest value;
- create review evidence, a gate decision or reviewer identity;
- grant production approval;
- enable persistence, API, OpenAPI, UI or runtime behavior;
- alter the Wave 3 readiness policy or return `READY`.

## Version pins

The placeholder registry pins:

- review coverage artifact `wave-4.slice-2.grade-7-9-math.v1`;
- review evidence placeholder `wave-4.slice-3.grade-7-9-math.v1`;
- review gate rubric `wave-4.slice-4.grade-7-9-math.v1`;
- diagnostic blueprint `wave-3.slice-3.grade-7-9-math.v1`;
- diagnostic readiness policy
  `wave-3-slice-11-diagnostic-readiness-policy-v1`.

The upstream artifacts remain authoritative for slot membership, coverage
status, pending digest placeholders, empty evidence and decision records,
rubric definitions and zero production approvals.

## Candidate identity policy

The registry defines the future identity template:

`dcandidate.math.g7-9.{strand}.{candidate-key}.v{integer}`

The template is vocabulary only. Every Slice 5 entry keeps identity state
`UNASSIGNED`, a null candidate ID and the same identity-format policy pin. A
registry-entry ID identifies only the placeholder row and must never be treated
as a candidate ID.

Candidate identity ownership, key allocation, revision semantics and
invalidation remain unresolved.

## Digest algorithm policy

The artifact contains a versioned digest-algorithm policy placeholder with
state `DEFERRED`. Its algorithm identifier and value encoding remain null. No
algorithm is approved or inferred from earlier illustrative placeholders.

Every entry pins that deferred policy. A later approved slice must define the
algorithm, encoding, collision and migration policy before a digest value can
exist.

## Canonicalization policy

The artifact contains a versioned canonicalization-policy placeholder with
state `DEFERRED`. Its ruleset version remains null and no executable rules are
defined.

Future canonicalization must explicitly define which candidate content and
metadata fields are included, normalization and ordering rules, version
invalidation, reproducibility and migration behavior. Changing any included
field must invalidate the prior digest and its dependent evidence.

## Placeholder digest states

Slice 5 defines only these non-approving placeholder states:

- `PENDING_IMMUTABLE_CANDIDATE` — the upstream review artifacts expect a
  future exact candidate, but none is assigned or pinned;
- `DIGEST_DEFERRED` — digest creation cannot begin because a required candidate
  or policy is unresolved.

Current registry entries preserve the upstream
`PENDING_IMMUTABLE_CANDIDATE` state. Both states require a null digest value and
cannot imply review activity or production eligibility.

## Registry entry

Each of the 11 blueprint slots appears exactly once. A registry entry contains:

| Field | Requirement |
| --- | --- |
| `registryEntryId` | Stable identity of the placeholder row only. |
| `recordState` | `PLACEHOLDER_ONLY`. |
| `candidateIdentity` | `UNASSIGNED`, null candidate ID and identity-policy pin. |
| `blueprintReference` | Exact blueprint version and known slot ID. |
| `reviewCoverageReference` | Exact coverage version, slot ID and unchanged coverage status. |
| `reviewEvidenceReference` | Exact evidence version and matching unrecorded slot placeholder. |
| `reviewGateRubricReference` | Exact rubric version and six-gate definition count. |
| `digestPlaceholder` | Pending state, deferred policy pins and null algorithm and value. |
| `reviewDecisionState` | `NO_DECISION`. |
| `productionApprovalState` | `NOT_ELIGIBLE`. |
| `candidateContentEmbedded` | `false`. |
| `productionUseAllowed` | `false`. |

The registry entry is not content and cannot fill a coverage gap. It contains
no item stem, learner action, evaluation material or rights-bearing source
material.

## Reference alignment

For every placeholder entry:

- the blueprint slot must exist in the coverage artifact;
- the coverage reference must copy the exact slot and coverage status;
- the evidence reference must resolve to the matching Slice 3 slot and remain
  `NOT_RECORDED` with a null record ID;
- the rubric reference must pin the Slice 4 artifact and its six definitions;
- the digest state and null value must remain aligned with the upstream
  placeholders.

Missing, duplicate, unknown or mismatched references fail closed.

## No-record invariants

The Slice 5 registry keeps:

- 11 structural placeholder entries and zero assigned candidate identities;
- zero digest values;
- empty review-evidence, review-decision and production-approval record arrays;
- zero review evidence, decisions and production-approved candidates;
- production, runtime and storage use disabled.

No aggregate may advance independently of validated records.

## Safety and data rules

The registry must exclude item stems, final or correct answers, worked
solutions, hints, scoring keys, answer checking, correctness results, mastery
or proficiency claims, provider prompts or payloads, copied textbook content,
learner data and reviewer PII. It stores no real student or reviewer identity.

The validator rejects all fields and content terms forbidden by the Slice 5
instruction, plus any non-null digest value or hash-like string.

## Readiness boundary

Readiness remains `NOT_READY` under
`wave-3-slice-11-diagnostic-readiness-policy-v1`. Blocking reasons remain
`INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. A placeholder registry
cannot close either blocker or add a readiness reason code.

## Open decisions

- candidate identity ownership, allocation and version semantics;
- digest algorithm, encoding, collision handling and migration policy;
- canonicalization field set, ordering and normalization rules;
- digest creation authority, reproducibility checks and invalidation triggers;
- linkage of a future exact candidate to evidence and gate decisions;
- reviewer and audit identity, authorization and separation of duties;
- production approval authority and withdrawal;
- persistence, access control, retention, API and administrative tooling;
- readiness-policy integration.
