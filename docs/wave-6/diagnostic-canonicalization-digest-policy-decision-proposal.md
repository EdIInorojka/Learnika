# Diagnostic canonicalization and digest policy decision proposal

## Proposal status

`PROPOSED_DEFERRED` — not approved, not active and not usable to process a
candidate, create canonical bytes, generate a digest, support review or permit
production use.

This proposal refines the unresolved Wave 5 canonicalization and digest policy
placeholder. It is not acceptance evidence for
`canonicalization_and_digest_policy`, which remains
`UNSATISFIED_DEFERRED`.

## Pinned upstream artifacts

| Upstream | Exact artifact |
| --- | --- |
| Activation prerequisites | `wave-5.slice-2.grade-7-9-math.v1` |
| Canonicalization/digest placeholder | `wave-5.slice-4.grade-7-9-math.v1` |
| Candidate identity decision proposal | `wave-6.slice-1.grade-7-9-math.v1` |
| Candidate digest placeholder registry | `wave-4.slice-5.grade-7-9-math.v1` |
| Candidate canonicalization placeholder | `wave-4.slice-6.grade-7-9-math.v1` |

## Proposed canonical field policy

Every row is a non-approved proposal.

Proposed included field classes are limited to version pins, candidate and
curriculum references, diagnostic task payload, interaction-contract metadata,
accessibility metadata and rights provenance. Proposed excluded classes are
review workflow metadata, runtime delivery metadata, personal data, provider
data, transient storage references, policy-decision metadata and audit-actor
metadata.

The proposal defines a fixed top-level order and deterministic ordering within
sets. Unknown fields fail closed. No candidate payload or field value is stored
in this proposal.

## Proposed serialization and normalization policy

The non-approved serialization shape uses a length-prefixed UTF-8 field
sequence, fixed type tags, explicit null representation and minimal decimal
integer representation. The proposal uses LF for line endings and NFC as the
Unicode normalization candidate. Locale-sensitive case conversion and
transliteration are prohibited by the proposal.

Mathematical handling is lexical only: a future reviewed alias table may map
explicit glyph aliases, while operator order, expression structure and unit
tokens remain preserved. Semantic equivalence rewriting, expression solving
and evaluation are outside this proposal. Ambiguous notation fails closed.

Whitespace handling proposes boundary trimming, supported space-token mapping,
inline-space collapsing and paragraph-boundary preservation. Punctuation is
preserved unless a future separately reviewed rule explicitly classifies it.

## Proposed digest policy shape

The proposal requires a future security-reviewed cryptographic digest family,
but selects no concrete algorithm. `algorithmId` remains null and algorithm
selection, approval and activation remain false.

Lowercase base32 without padding and a fixed ASCII domain tag are proposed for
later review. Neither is approved or active. No digest value, hash, canonical
byte sequence or reproducibility claim is created.

## Proposed invalidation boundary

A future approved policy would invalidate dependent output when an included
field, candidate version or revision, field inventory, canonicalization
ruleset, serialization format, algorithm, encoding or domain-separation tag
changes. This slice records no invalidation or regeneration event and enables
no migration or runtime behavior.

## Synthetic symbolic vectors

The machine artifact contains four proposed accepted and five explicitly
rejected symbolic vectors. They contain abstract tokens only, not educational
content, candidate references, canonical bytes or digest values.

Every vector carries all seven markers:

- `SYNTHETIC_EXAMPLE_ONLY`;
- `NOT_REAL_CONTENT`;
- `NOT_A_REAL_CANDIDATE`;
- `NOT_A_REAL_DIGEST`;
- `NOT_APPROVED`;
- `NOT_USABLE_FOR_REVIEW`;
- `NOT_USABLE_FOR_PRODUCTION`.

Accepted symbolic scenarios cover ordering, Unicode/Russian text handling,
mathematical glyph aliases and whitespace/line-ending handling. Rejected
scenarios cover an unknown field class, excluded personal-data material,
ambiguous mathematical rewriting, a concrete-output request and a real
candidate-reference request.

## Fail-closed boundary

The proposal contains zero policy decisions, selected algorithms, selected
encodings, canonical representations, digest values, candidate identities,
reservations, evidence, review decisions, identities, assignments, authority
grants, approvals, invalidation executions and regeneration executions.

Readiness remains `NOT_READY`; activation remains `BLOCKED`; the workflow
remains `INACTIVE`; satisfied prerequisites, approved candidates and production
approvals remain zero.

