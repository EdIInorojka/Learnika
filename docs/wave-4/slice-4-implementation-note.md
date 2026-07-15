# Wave 4 Slice 4 implementation note

## Status

This slice adds a static diagnostic review gate rubric contract, artifact and
dependency-free validator. The rubric defines non-decision criteria and future
taxonomies for the six existing gates. It records no evidence, reviewer
assignment, review decision or production approval and adds no runtime
behavior.

## Gate evidence

The pre-edit gate passed with a clean worktree, Node.js 24.18.0 and pnpm
11.7.0. PostgreSQL, Redis and MinIO were reachable. The Prisma schema was
valid, all three migrations were already applied, OpenAPI was current and
contract scope/privacy validation passed.

## Contract

The contract distinguishes rubric definitions from review activity:

- evidence categories describe future evidence classes but are not evidence;
- blocking categories describe fail-closed issue classes but are not findings;
- allowed future states define enum vocabulary but are not current decisions;
- reviewer-role fields remain deferred null placeholders without PII;
- no criterion can advance coverage or readiness.

It defines boundaries for methodology, safety and no-answer, rights and
copyright, grade placement, accessibility and readability, and production
approval.

## Rubric artifact

The artifact pins review coverage
`wave-4.slice-2.grade-7-9-math.v1`, review evidence
`wave-4.slice-3.grade-7-9-math.v1`, blueprint
`wave-3.slice-3.grade-7-9-math.v1` and the existing Wave 3 readiness policy.

- Exactly six approved gate IDs appear once each.
- Every gate carries its existing policy-version pin.
- The artifact defines 23 stable non-decision criteria.
- The criteria map 23 required evidence categories and 23 blocking issue
  categories exactly once.
- Future decision enums match the Slice 1 contract.
- Reviewer roles, assignments and identities remain deferred and null.
- Review decision and evidence record arrays remain empty.
- Recorded decisions, recorded evidence and production approvals remain zero.

## Validator

The validator checks exact fields and upstream version pins, all six unique
gate IDs, policy alignment across coverage and every evidence placeholder,
non-empty unique taxonomies, future enum values, criterion namespaces and
taxonomy references, PII-free role placeholders, empty record arrays, zero
aggregates, forbidden fields and content, and the unchanged readiness blockers.

Focused tests cover the valid baseline, missing, unknown and duplicate gates,
policy mismatch, empty and duplicate taxonomies, invalid future states,
criterion-reference errors, reviewer assignment claims, evidence and decision
claims, production approval claims, readiness changes, forbidden terms and
exact worktree scope.

## Repository boundary

The worktree guard permits only eight exact Slice 4 paths: this note, the
contract, artifact, validator, focused test, two existing review validators
whose exact guards require the new static paths, and root `package.json`. API,
OpenAPI, Prisma, web, lockfile and unrelated runtime paths remain rejected. No
broad application allowlist is introduced.

## Readiness

Readiness remains `NOT_READY` under
`wave-3-slice-11-diagnostic-readiness-policy-v1`. Blocking reasons remain
`INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`. Production approval count
remains zero.

## Deferred

- rubric ownership, reviewer eligibility and separation of duties;
- evidence sufficiency, reference formats, storage and retention;
- blocking-issue severity and remediation workflow;
- candidate digest canonicalization and invalidation;
- reviewer and audit identity policies;
- decision authorization, expiry and withdrawal;
- production approval authority;
- persistence, API, UI and administrative tooling;
- readiness-policy integration;
- Slice 5 pending explicit approval.
