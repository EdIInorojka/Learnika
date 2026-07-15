# Wave 4 Slice 6 implementation note

## Status

This slice adds a static diagnostic candidate canonicalization contract,
unresolved policy artifact and dependency-free validator. It defines future
decision categories without selecting fields, activating rules, transforming
candidates, generating digests or granting approval.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. The Prisma schema was
valid, all three migrations were already applied, OpenAPI was current and
contract scope/privacy validation passed.

## Contract

The contract establishes the following fail-closed boundary:

- policy identity and version are stable, but status is
  `UNRESOLVED_DEFERRED`;
- category names identify future policy questions rather than rules;
- inclusion and exclusion classes contain no concrete field references;
- locale, language, math-notation, whitespace and punctuation handling remain
  unresolved;
- no transformed candidate, digest, review decision or production approval can
  be created by this artifact.

## Placeholder artifact

The artifact pins candidate digest registry
`wave-4.slice-5.grade-7-9-math.v1` and its candidate identity, digest algorithm
and prior canonicalization policy placeholders.

- Five normalization categories remain `TO_BE_DECIDED` with null policy
  references and no active rules.
- Four inclusion and four exclusion category placeholders contain empty field-
  reference arrays.
- Locale and language handling retains only the `ru-RU` target reference.
- Math notation handling has no policy or rule reference.
- Whitespace and punctuation handling has no policy or rule reference.
- The active rules, transformed candidate, review decision and production
  approval arrays are empty.
- Active rules, transformed candidates, digest values, review decisions and
  production-approved candidates all remain zero.
- Production, runtime and storage use remain disabled.

## Validator and tests

The validator checks the exact Slice 5 registry and unresolved policy pins,
policy identity and inactivity, exact unique normalization categories, abstract
inclusion and exclusion category sets, empty concrete field and rule
references, specialized unresolved placeholders, empty record arrays, zero
aggregates, forbidden fields and content, hash-like values, unchanged readiness
blockers and exact worktree scope.

Focused tests cover the valid baseline, registry and policy pin mismatches,
policy activation, missing, unknown and duplicate normalization categories,
rule activation, concrete inclusion and exclusion fields, specialized policy
activation, populated record arrays, non-zero boundaries and aggregates, hash-
like values, forbidden terms, readiness changes and repository scope. All 18
focused tests pass.

## Repository boundary

The worktree guard permits only ten exact Slice 6 static and registration
paths: this note, the contract, policy artifact, validator, focused test, four
existing review/candidate validators whose exact guards require the new paths,
and root `package.json`. API, OpenAPI, Prisma, web, lockfile and runtime paths
remain rejected. No broad application allowlist is introduced.

No dependency or lockfile change is required.

## Readiness

Readiness remains `NOT_READY` under
`wave-3-slice-11-diagnostic-readiness-policy-v1`. Blocking reasons remain
`INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. Production-approved
candidate count remains zero.

## Deferred

- exact candidate content and metadata field inventory;
- field inclusion and exclusion decisions;
- locale, language and Unicode handling;
- mathematical notation and expression serialization;
- whitespace, punctuation, line-ending and field-order behavior;
- deterministic serialization and reproducibility testing;
- policy activation, migration and invalidation authority;
- digest algorithm activation and real digest generation;
- review evidence, decisions, reviewer and audit identity;
- production approval authority;
- persistence, API, UI and readiness integration;
- Slice 7 pending explicit approval.
