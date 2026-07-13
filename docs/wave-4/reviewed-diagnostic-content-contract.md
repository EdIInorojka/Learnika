# Reviewed diagnostic content coverage contract

## Purpose

This contract defines how future diagnostic content for Russian mathematics in
grades 7-9 may move from a draft candidate toward reviewed production approval.
It covers review metadata and coverage accounting only. It does not create
content, authorize learner use or change the diagnostic readiness policy.

## Contract principles

- Review applies to an immutable, version-pinned candidate.
- Every candidate is linked to one existing Wave 3 blueprint slot and its
  canonical skill references.
- Every required gate is independent and fail-closed.
- Approval at one gate cannot imply approval at another gate.
- Automated checks may provide evidence but cannot grant human review approval.
- A candidate change invalidates approvals tied to the prior artifact digest.
- Missing, stale, conflicting or unverifiable evidence is treated as not
  approved.
- Production approval is explicit and is never inferred from fixture presence,
  broad strand coverage or completion of the other five gates.
- Existing Wave 3 fixtures remain draft, non-production material.

## Review unit

The review unit is one immutable diagnostic content candidate. A future review
record must identify, without embedding learner data or source content:

| Field | Requirement |
| --- | --- |
| `reviewRecordVersion` | Stable version of the review-record contract. |
| `candidateId` | Stable identifier for the exact candidate under review. |
| `candidateArtifactVersion` | Version of the containing content artifact. |
| `candidateDigest` | Digest pinning all reviewed candidate content and metadata. |
| `blueprintVersion` | Exact approved blueprint version under review. |
| `blueprintSlotId` | One existing slot from that blueprint. |
| `canonicalSkillIds` | Existing canonical skill IDs referenced by the slot and candidate. |
| `gradeBand` | Integer range contained within grades 7-9. |
| `evidenceCategory` | Category already permitted by the referenced slot. |
| `locale` | `ru-RU` for the current MVP. |
| `contentOrigin` | Original or rights-cleared provenance classification. |
| `gateRecords` | One record for each required review gate. |
| `productionApprovalStatus` | Explicit final release decision for this candidate. |

The record must not contain a learner response, child identifier, final or
correct answer, worked solution, hint, scoring key, provider request or copied
textbook passage.

## Common gate states

Each of the first five review gates uses one of these states:

| State | Meaning |
| --- | --- |
| `NOT_STARTED` | No valid review evidence exists. |
| `IN_REVIEW` | A designated review role is evaluating the pinned candidate. |
| `CHANGES_REQUIRED` | The candidate cannot proceed without revision. |
| `APPROVED` | The pinned candidate passed this gate under the recorded policy version. |
| `INVALIDATED` | Earlier evidence no longer applies because its pin or policy is stale. |

Every gate record must carry the gate type, state, policy or rubric version,
candidate digest, reviewer role, evidence reference and decision timestamp.
Personal reviewer names and free-form review discussions are not part of the
coverage contract. The future audit identity model remains an open decision.

## Required review gates

### Methodology review

The methodology gate confirms that the candidate:

- measures the intended canonical skills and referenced blueprint slot;
- matches the slot's evidence category without claiming mastery or proficiency;
- has a clear, bounded learner action suitable for diagnostic evidence;
- does not rely on knowledge outside the reviewed scope unless that dependency
  is explicit;
- avoids ambiguity that would make deterministic future evaluation unsafe;
- remains diagnostic content rather than instruction, a hint or a solution.

Difficulty calibration, scoring and psychometric claims are outside Slice 1.

### Safety and no-answer review

The safety gate confirms that the candidate and its metadata:

- contain no final or correct answer, worked solution or generated hint;
- contain no scoring key or answer-revealing rubric;
- do not expose hidden evaluation data to a learner-facing surface;
- do not ask for unnecessary personal or sensitive information;
- remain bounded to mathematics for grades 7-9;
- follow the same no-answer principle as the wider Learnika product.

Passing this gate does not authorize checking, scoring or runtime use.

### Rights and copyright review

The rights gate confirms one documented provenance path:

- the candidate is original content with an auditable internal provenance
  declaration; or
- the candidate is covered by documented rights that permit the intended use.

A textbook title, edition or section reference is not evidence of content
rights. The review record stores a rights-evidence reference, not protected
source text. Unclear provenance, copied tasks or unverifiable rights require
`CHANGES_REQUIRED`.

### Grade-placement review

The grade-placement gate confirms that:

- the grade band remains within 7-9;
- the placement is defensible for the Russian MVP context;
- prerequisite expectations align with the canonical skill graph;
- disputed or program-dependent placement is recorded as an open decision
  rather than presented as settled curriculum fact.

The exact reviewer rubric and treatment of cross-grade candidates remain open.

### Accessibility and readability review

The accessibility and readability gate confirms that:

- Russian wording is concise, age-appropriate and unambiguous;
- notation, labels and units are internally consistent;
- the candidate does not depend on color, layout or an image alone to convey
  essential meaning;
- required alternative representations are identified for future delivery;
- unnecessary reading load and cultural assumptions are avoided;
- the candidate is reviewable without learner PII or production telemetry.

This gate defines content requirements only; it does not add UI behavior.

### Production approval

Production approval is a separate final status:

| Status | Meaning |
| --- | --- |
| `NOT_ELIGIBLE` | At least one required gate lacks current approval. |
| `PENDING` | All five gates are approved and final production review is awaiting a decision. |
| `APPROVED` | A designated release authority explicitly approved the exact pinned candidate. |
| `WITHDRAWN` | Prior production approval was revoked or invalidated. |

`APPROVED` is valid only while all five gate approvals reference the same
candidate digest, blueprint version and applicable policy versions. A content,
metadata, skill-reference, grade-placement or policy change returns the
candidate to `NOT_ELIGIBLE` until required reviews are repeated.

Slice 1 creates no production approval records and grants no candidate an
`APPROVED` status.

## Coverage tracking

Coverage is tracked per blueprint slot, never only as a strand-level total.
The tracker must pin the blueprint version and derive one of these states:

| Coverage state | Meaning |
| --- | --- |
| `GAP_CONFIRMED` | No candidate is registered for the slot. |
| `DRAFT_ONLY` | At least one draft fixture or candidate exists, but no complete review bundle exists. |
| `REVIEW_IN_PROGRESS` | At least one candidate has an active review, with no production approval. |
| `CHANGES_REQUIRED` | A required gate has requested candidate changes. |
| `REVIEWED_NON_PRODUCTION` | The five substantive gates passed, but production approval is absent. |
| `PRODUCTION_APPROVAL_PENDING` | The candidate is eligible and awaiting the separate production decision. |
| `PRODUCTION_APPROVED` | At least one exact pinned candidate for the slot has current production approval. |

A slot is not production-covered merely because an item exists. Multiple
candidates may reference a slot, but at least one must have a valid complete
review bundle for the slot to reach `PRODUCTION_APPROVED`. Duplicate candidates
do not compensate for a gap in another slot.

### Wave 3 baseline snapshot

The baseline uses blueprint
`wave-3.slice-3.grade-7-9-math.v1` and fixture set
`wave-3.slice-4.grade-7-9-math.v1`.

Draft-only slots:

- `diag.math.g7-9.number.rational-number-operations.v1`;
- `diag.math.g7-9.algebra.expression-transformations.v1`;
- `diag.math.g7-9.functions.coordinate-plane-graphs.v1`;
- `diag.math.g7-9.geometry.parallel-lines.v1`;
- `diag.math.g7-9.data.probability-statistics-basic.v1`.

Confirmed gaps:

- `diag.math.g7-9.number.percent-ratio.v1`;
- `diag.math.g7-9.algebra.linear-equation-one-variable.v1`;
- `diag.math.g7-9.algebra.powers-and-roots.v1`;
- `diag.math.g7-9.functions.linear-function.v1`;
- `diag.math.g7-9.geometry.basic-objects-angles.v1`;
- `diag.math.g7-9.geometry.triangle-properties.v1`.

Current totals are five `DRAFT_ONLY`, six `GAP_CONFIRMED` and zero
`PRODUCTION_APPROVED`. Slice 1 records this baseline but does not add candidates
or advance any slot.

## Readiness boundary

Diagnostic readiness remains `NOT_READY`. The existing policy blockers remain:

- `INCOMPLETE_COVERAGE`, because six blueprint slots have no fixture; and
- `NON_PRODUCTION_FIXTURES`, because the five available fixtures explicitly
  prohibit production use.

This contract adds further review requirements but does not alter the policy,
its reason codes, runtime behavior or any Wave 3 artifact. A future readiness
change requires complete reviewed coverage, explicit production approval,
machine-validated evidence and a separately approved slice.

## Deferred implementation

- the machine-readable review-record artifact and validator;
- actual content authoring for uncovered slots;
- review evidence storage, retention, authorization and audit identity;
- reviewer assignment and separation-of-duty policy;
- methodology, grade-placement and accessibility rubric details;
- rights-evidence retention and legal review procedure;
- re-review deadlines and policy-version expiry rules;
- deterministic evaluation, scoring and diagnostic result semantics;
- integration with readiness policy, API, persistence or learner UI;
- reconciliation of the legacy mobile Wave 4 bootstrap prompt.
