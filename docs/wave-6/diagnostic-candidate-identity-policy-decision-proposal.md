# Diagnostic candidate identity policy decision proposal

## Proposal status

`PROPOSED_DEFERRED` — not approved, not active and not usable for allocation,
review, digest generation or production.

This proposal refines the unresolved Wave 5 candidate identity placeholder.
It creates no real or reserved candidate ID and is not acceptance evidence
for `candidate_identity_policy`, which remains `UNSATISFIED_DEFERRED`.

## Pinned upstream artifacts

| Upstream | Exact artifact |
| --- | --- |
| Activation prerequisites | `wave-5.slice-2.grade-7-9-math.v1` |
| Candidate identity placeholder | `wave-5.slice-3.grade-7-9-math.v1` |
| Candidate digest placeholder registry | `wave-4.slice-5.grade-7-9-math.v1` |
| Review coverage | `wave-4.slice-2.grade-7-9-math.v1` |

## Proposed policy shape

Every row is a non-approved proposal.

| Area | Proposed rule |
| --- | --- |
| Namespace | Use the fixed ASCII namespace `dcandidate.math.g7-9`; organizational ownership and allocation authority remain unresolved. |
| Candidate reference | Use `dcandidate.math.g7-9.<strand>.c<opaque-token>.v<major>.r<revision>`. Strand is one of `number`, `algebra`, `functions`, `geometry`, `data`; the opaque token uses 12 lowercase Crockford-style characters. |
| Version and revision | `v` is a positive integer and `r` is a non-negative integer. A future canonicalized-content or blueprint-link change would require a new major version. A revision would be limited to future policy-approved metadata excluded from canonicalization. |
| Collision prevention | A future single accountable allocator must normalize before allocation, perform atomic full-reference uniqueness checks and retry opaque-token collisions. This slice implements none of those controls. |
| Non-reuse | Once allocated in a future system, an identity root and every full candidate reference remain permanently unavailable for reuse, including after withdrawal or supersession. |
| Withdrawal and supersession | Future records should reference the exact candidate version and revision plus a monotonically increasing event ordinal. They must preserve history and never transfer review state. |
| Blueprint slot | A candidate reference is independent of a blueprint slot ID and pins exactly one slot. A slot ID must never be promoted or embedded as a candidate key. |
| Digest registry | A future digest-registry record must reference the exact candidate version and revision. Existing Wave 4 registry entries remain unassigned placeholders. |
| Canonicalization and digest | Future records must also pin separately approved canonicalization and digest policy versions. No algorithm, encoding, canonical bytes or digest value is selected here. |
| Data exclusion | Candidate references use allocator-generated opaque tokens only. Person names, contact data, principal/account references, learner/reviewer/audit data, source content, decisions and storage references are excluded. |

Because the canonical field inventory is still unresolved, the proposed
version/revision boundary cannot be approved independently in this slice.

## Synthetic accepted vectors

The machine-readable examples use a wrapper that makes the displayed value
invalid as an operational ID. Each vector carries all six markers:

- `SYNTHETIC_EXAMPLE_ONLY`;
- `NOT_A_REAL_CANDIDATE_ID`;
- `NOT_RESERVED`;
- `NOT_APPROVED`;
- `NOT_USABLE_FOR_REVIEW`;
- `NOT_USABLE_FOR_DIGEST`.

Examples:

- `SYNTHETIC_EXAMPLE_ONLY<dcandidate.math.g7-9.algebra.c0123456789ab.v1.r0>`;
- `SYNTHETIC_EXAMPLE_ONLY<dcandidate.math.g7-9.geometry.cabcdefghjkmn.v2.r3>`.

Only the inner text matches the proposed grammar. The complete wrapped value
cannot be allocated, reserved, reviewed or submitted to a digest registry.

## Explicit rejected vectors

The proposal rejects synthetic wrappers whose inner value has:

- an unsupported strand;
- a human-readable key instead of an opaque token;
- a missing revision segment;
- major version zero;
- an embedded blueprint-slot shape.

Private-value patterns, unwrapped candidate-shaped values and all forbidden
educational, identity, provider, storage and digest material are rejected by
the validator rather than stored as negative examples.

## Fail-closed boundary

The proposal contains zero policy decision records, candidate identities,
reservations, allocations, evidence, review decisions, digest values,
reviewer or audit identities, assignments, authority grants, candidate or
production approvals, withdrawals, supersessions, tombstones and
restorations.

Readiness remains `NOT_READY`; activation remains `BLOCKED`; the workflow
remains `INACTIVE`; satisfied prerequisites, approved candidates and
production approvals remain zero.
