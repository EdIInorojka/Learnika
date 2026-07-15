# Diagnostic candidate canonicalization placeholder contract

## Purpose

This contract defines a static, machine-validatable placeholder for the future
canonicalization policy required before an immutable diagnostic candidate
digest can be generated. It pins the Slice 5 candidate digest registry and
describes unresolved decision categories only.

Slice 6 does not canonicalize content, define executable normalization rules,
select content fields, generate a hash or digest, record a review decision,
approve a candidate or change diagnostic readiness.

## Slice 6 boundary

The policy artifact is metadata-only, non-production and storage-disabled. It
may define policy identity, version pins and categories of decisions that a
future policy must resolve. Category presence is not a policy decision and
does not activate a rule.

The slice cannot:

- add or revise diagnostic candidate content;
- choose or implement a canonicalization algorithm;
- select concrete included or excluded content fields;
- transform a candidate or create a transformed record;
- generate or store a hash or digest value;
- add review evidence, decisions or reviewer identity;
- grant production approval;
- enable persistence, API, OpenAPI, UI or runtime behavior;
- alter the Wave 3 readiness policy or return `READY`.

## Version pins

The artifact pins candidate digest registry
`wave-4.slice-5.grade-7-9-math.v1` and its unresolved policies:

- candidate identity format
  `wave-4.slice-5.candidate-identity-format.placeholder.v1`;
- digest algorithm
  `wave-4.slice-5.candidate-digest-algorithm.placeholder.v1`;
- prior canonicalization placeholder
  `wave-4.slice-5.candidate-canonicalization.placeholder.v1`;
- diagnostic readiness policy
  `wave-3-slice-11-diagnostic-readiness-policy-v1`.

The Slice 5 registry remains authoritative for its 11 structural placeholders,
zero assigned identities, zero digest values, zero review decisions and zero
production-approved candidates.

## Policy identity

The Slice 6 artifact defines:

- policy ID `diagnostic-candidate-canonicalization`;
- policy version
  `wave-4.slice-6.diagnostic-candidate-canonicalization.placeholder.v1`;
- status `UNRESOLVED_DEFERRED`;
- null active ruleset version;
- activation disabled.

This identity versions the placeholder definition only. It is not an approved
or active canonicalization policy.

## Normalization category placeholders

The artifact lists unresolved categories for:

- locale and language handling;
- mathematical notation handling;
- whitespace handling;
- punctuation handling;
- field ordering handling.

Every category remains `TO_BE_DECIDED`, carries no policy reference and has no
active rule references. The category names identify questions a future slice
must resolve; they do not prescribe a normalization operation.

## Content field category placeholders

The artifact defines separate unresolved category lists for potential
inclusion and exclusion decisions. They cover only abstract field classes:

- candidate identity metadata;
- curriculum reference metadata;
- diagnostic payload classification;
- accessibility metadata;
- review workflow metadata;
- runtime delivery metadata;
- personal-data classification;
- provider-data classification.

Each category remains `TO_BE_DECIDED` with an empty field-reference list. The
artifact selects no concrete field, contains no item content and establishes no
future inclusion or exclusion outcome.

## Specialized policy placeholders

### Locale and language

The target locale reference remains `ru-RU`, while the language handling policy
reference and all active rule references remain unresolved and empty.

### Mathematical notation

Notation normalization policy and active rules remain unresolved. Slice 6 does
not define symbol, expression, unit, label or serialization transformations.

### Whitespace and punctuation

Whitespace and punctuation policy references remain null and no active rules
exist. Slice 6 does not define trimming, collapsing, line-ending, character or
punctuation behavior.

## No-rule and no-record invariants

The Slice 6 artifact keeps:

- zero active canonicalization rules;
- zero transformed candidate records;
- zero digest values;
- zero review decisions;
- zero production-approved candidates;
- empty active-rule, transformed-record, review-decision and production-
  approval arrays;
- production, runtime and storage use disabled.

No count may advance independently of validated records.

## Safety and data rules

The artifact must not contain item stems, candidate payloads, final or correct
answers, worked solutions, hints, scoring keys, checking or correctness
results, mastery or proficiency claims, provider prompts or payloads, copied
textbook content, learner data or reviewer PII.

The validator rejects all terms forbidden by the Slice 6 instruction, item-
stem fields, non-empty concrete field references, non-null policy activation
references and hash-like values.

## Readiness boundary

Readiness remains `NOT_READY` under
`wave-3-slice-11-diagnostic-readiness-policy-v1`. Blocking reasons remain
`INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. An unresolved policy
placeholder cannot close either blocker or add a readiness reason code.

## Open decisions

- exact content and metadata field inventory;
- inclusion and exclusion decisions for each field;
- locale, language and Unicode handling;
- mathematical notation and expression serialization;
- whitespace, punctuation, line-ending and ordering behavior;
- deterministic serialization format and reproducibility tests;
- policy activation, migration and invalidation authority;
- interaction with candidate identity and digest-algorithm policies;
- evidence required to approve canonicalization behavior;
- persistence, access control, API and administrative tooling;
- readiness-policy integration.
