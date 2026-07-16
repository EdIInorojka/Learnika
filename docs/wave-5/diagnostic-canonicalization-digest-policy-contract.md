# Diagnostic canonicalization and digest policy placeholder contract

## Purpose

This contract defines the static placeholder boundary for future diagnostic
candidate canonicalization and immutable digest policies for Russian
mathematics in grades 7-9. It provides a machine-validatable inventory of
unresolved decisions without selecting, approving or implementing any rule,
algorithm, encoding or serialization behavior.

The contract creates no candidate, candidate ID, transformed content, digest,
hash, evidence, decision, identity, assignment or approval. It is not
acceptance evidence for an activation prerequisite.

## Contract status

The policy and every decision requirement remain `UNRESOLVED_DEFERRED` or
`TO_BE_DECIDED`. The activation prerequisite
`canonicalization_and_digest_policy` remains `UNSATISFIED_DEFERRED`; its owner
remains `UNASSIGNED_OWNER_PLACEHOLDER`, and its evidence-reference array
remains empty.

Creating and validating this placeholder must not:

- satisfy or advance any activation prerequisite;
- interpret a Wave 4 category or policy placeholder as a decision;
- select or approve a digest algorithm or encoding;
- activate a canonicalization ruleset or serialize candidate content;
- generate a digest, hash or reproducibility vector;
- activate candidate intake or the review workflow;
- change coverage or readiness;
- provide review, policy-approval or production evidence.

## Pinned upstream baseline

The artifact pins, without modifying:

- activation prerequisites artifact `wave-5.slice-2.grade-7-9-math.v1`;
- candidate identity policy placeholder
  `wave-5.slice-3.grade-7-9-math.v1`;
- Wave 4 candidate digest registry `wave-4.slice-5.grade-7-9-math.v1`;
- Wave 4 canonicalization placeholder `wave-4.slice-6.grade-7-9-math.v1`;
- readiness policy `wave-3-slice-11-diagnostic-readiness-policy-v1`.

The Wave 4 digest algorithm remains `DEFERRED`, with no algorithm or encoding.
The Wave 4 canonicalization policy remains `UNRESOLVED_DEFERRED`, with no
active ruleset or rules. The Wave 4 categories are references to unresolved
areas only and are not field-inclusion or normalization decisions.

The Slice 3 candidate identity policy remains unresolved, with zero real
candidate IDs, submissions, approved candidates and production approvals.

## Policy identity and owner placeholders

The global placeholder has stable artifact and policy versions solely so later
artifacts can distinguish it from a future approved policy. Its state is
`UNRESOLVED_DEFERRED`; its active ruleset, field inventory, serialization
format, digest algorithm and digest encoding are absent.

Policy approval, candidate processing, canonicalization, digest generation and
production approval are disabled. The owner remains the generic
`UNASSIGNED_POLICY_OWNER_PLACEHOLDER`; owner, assignment and authority
references are absent. A name, email, account identifier, repository author or
commit identity is not owner evidence.

## Candidate field inventory and inclusion policy placeholder

A future separately approved policy must enumerate every candidate content and
metadata field and decide explicit inclusion or exclusion. It must define the
effect of candidate identity, blueprint and skill references, educational
payload, accessibility metadata, review metadata, runtime metadata, personal
data and provider data without embedding protected content in this policy
artifact.

Slice 4 selects no fields. Inventory, inclusion and exclusion policy references
are null, selected/included/excluded field-reference arrays are empty, and
application is disabled.

## Canonicalization ruleset placeholder

A future approved, versioned ruleset must define deterministic handling for:

- Unicode, Russian-language text, locale and line endings;
- mathematical notation, symbols, units and expression representation;
- whitespace and punctuation;
- field ordering and canonical byte serialization;
- ruleset versioning, migration and invalidation.

Slice 4 records no active rules, ruleset version or normalization behavior.
The target locale `ru-RU` is context metadata, not an active normalization
rule. All rule and policy references remain null or empty, and normalization
and canonicalization are disabled.

## Digest algorithm and encoding placeholders

A future separately approved digest policy must decide the algorithm
identifier, output encoding, domain separation, collision response, incident
handling and algorithm migration. No earlier illustrative label or deferred
policy version is an approved choice.

The algorithm ID, encoding ID and every related decision or policy reference
remain null. Selection, approval and activation flags remain false. The
artifact contains zero selected algorithms, zero selected encodings, zero
generated hashes and zero digest values.

## Deterministic serialization placeholder

A future policy must define exact field ordering, type representation,
serialization format, byte encoding and reproducibility requirements.
Independent synthetic vectors must prove deterministic output without using
production candidate content.

Slice 4 selects no serialization format and records no vectors. Ordering,
byte-serialization and reproducibility policy references remain null;
serialization and vector generation are disabled.

## Invalidation and regeneration placeholder

A future approved policy must define which included-field, candidate-version,
ruleset, algorithm or encoding changes invalidate a digest; how affected
evidence, decisions and approvals fail closed; when regeneration is required;
and how algorithm migration preserves historical auditability without
transferring approval.

Slice 4 records no trigger, invalidation, regeneration or migration behavior.
All references and trigger arrays are empty, and invalidation and regeneration
execution are disabled.

## Decision requirements

The artifact contains exactly ten `TO_BE_DECIDED` requirements:

1. candidate field inventory;
2. field inclusion and exclusion;
3. deterministic ordering and byte serialization;
4. locale, Unicode, language and line endings;
5. mathematical notation, symbols, units and expression serialization;
6. whitespace and punctuation handling;
7. canonicalization versioning, migration and invalidation;
8. digest algorithm, encoding and domain separation;
9. digest collision, incident and algorithm migration;
10. independent reproducibility and synthetic vectors.

Every decision and policy reference is null, every active-rule and test-vector
reference array is empty, and every decision-recorded flag is false. These are
future decision categories, not approved policies or acceptance evidence.

## Protected record boundary

Selected fields, canonicalization rules, selected algorithms and encodings,
reproducibility vectors, transformed candidates, candidate identities,
submissions, candidate approvals, generated hashes, digest values, evidence,
decisions, reviewer identities, audit identities, owner assignments and
production approvals all remain absent. Their record arrays are empty and
their aggregate counts are zero.

Unknown, missing, stale, populated, active, selected or approving fields fail
closed. Hash-like values, concrete candidate IDs and personal/account identity
values are rejected.

## Activation and readiness boundary

Activation remains `BLOCKED`; the review workflow remains `INACTIVE`; all
activation, readiness-transition, canonicalization, digest-generation and
production flags remain false.

Readiness remains `NOT_READY` with exactly:

- `INCOMPLETE_COVERAGE`;
- `NON_PRODUCTION_FIXTURES`.

This placeholder does not remove a blocker or add a readiness reason code.

## Deterministic validation expectations

The Slice 4 validator must:

- validate the complete Slice 3, Slice 2 and Wave 4 upstream chain;
- require exact artifact and policy pins and the exact targeted prerequisite;
- require exactly the ten unique unresolved requirement IDs;
- require every algorithm, encoding, ruleset, inventory and serialization
  value to remain a placeholder;
- require all decision, policy, owner, field, rule and vector references to
  remain null or empty;
- reject every activation, selection, generation, approval and production
  claim;
- reject hashes, digest values, candidate IDs, transformed candidates,
  evidence, decisions, identities and assignments;
- reject learner/reviewer PII, copied content, evaluation fields and provider
  payloads;
- enforce the exact static worktree scope and reject API, OpenAPI, Prisma, web,
  runtime and lockfile paths.

Passing validation proves only internal consistency of the placeholder. It
does not approve a policy, satisfy a prerequisite or make digest generation
ready.

## Open decisions and later gate

`W5-OD-CANONICAL-FIELD-INVENTORY` and `W5-OD-DIGEST-POLICY` remain open in
full. Related invalidation, rollback, reproducibility and CI decisions also
remain unresolved.

A later separately authorized slice must approve concrete policies and provide
synthetic deterministic evidence before the prerequisite can be considered
for satisfaction. Any such work must update the activation prerequisite only
through its own gate and must not automatically activate the workflow or
change readiness.
