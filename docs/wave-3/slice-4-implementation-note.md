# Wave 3 Slice 4 implementation note

## Slice

Wave 3 / Slice 4 - Diagnostic item contract and seed fixtures.

## Scope

This slice creates a static item contract, five original non-production fixture
stems and a dependency-free validation harness. It does not add diagnostic
runtime behavior.

## Pre-edit gate

The slice started from a clean worktree. Local gate checks verified:

- `git status --short`: clean;
- `node --version`: `v24.18.0`;
- `pnpm.cmd --version`: `11.7.0`;
- `pnpm.cmd run infra:validate`: PostgreSQL, Redis and MinIO reachable;
- `pnpm.cmd run db:validate`: passed;
- `pnpm.cmd run db:migrate:deploy`: no pending migrations;
- `pnpm.cmd run contracts:check`: OpenAPI artifact current;
- `pnpm.cmd run contracts:validate`: OpenAPI privacy and scope validation passed.

## Created files

- `docs/wave-3/diagnostic-item-contract.md`;
- `docs/wave-3/slice-4-implementation-note.md`;
- `packages/curriculum/diagnostic-items/grade-7-9-math.fixtures.v1.json`;
- `packages/curriculum/scripts/validate-diagnostic-items.mjs`;
- `packages/curriculum/test/diagnostic-items.test.mjs`.

## Changed files

- `docs/wave-3/open-decisions.md` records the static fixtures and remaining
  production-content blockers;
- root `package.json` registers the diagnostic item validator and tests.

## Contract summary

The item contract defines:

- stable IDs using
  `ditem.math.<strand>.<topic>.fixture-<nn>.v<major>`;
- an allowlisted safe metadata shape;
- pinned skill graph, blueprint slot and evidence category references;
- original minimal stem constraints;
- explicit non-production and open-decision markers;
- deferred evaluation placeholders with no expected values or runtime behavior;
- forbidden content, provider and runtime data boundaries.

## Fixture summary

The JSON artifact contains five short original Russian-language fixtures, one
for each canonical strand. Every fixture:

- references an existing Slice 3 blueprint slot;
- matches the slot's primary skill and evidence category;
- references canonical supporting skills only;
- stays within grades 7-9;
- is marked `draft_non_production_fixture` and
  `productionUseAllowed: false`;
- contains no expected value, worked material, hint, scoring key or learner
  data.

## Validator summary

The dependency-free validator checks:

- fixture-set and item ID structure;
- duplicate item IDs;
- graph and blueprint version pins;
- canonical skill and blueprint slot references;
- strand, primary skill and evidence category alignment;
- supporting-skill boundaries;
- grade bands within 7-9 and referenced contract bands;
- exact allowlisted fields and short unique stems;
- all required forbidden fields and terms;
- absence of runtime attempt, result and student data fields;
- non-production markers and deferred evaluation placeholders;
- current worktree scope.

## No runtime changes

This slice intentionally makes no changes to:

- Prisma schema or migrations;
- API routes or OpenAPI contracts;
- web UI;
- diagnostic execution, attempts or results;
- checking, correctness, scoring, mastery or recommendations;
- generated questions, hints or solutions;
- OCR, STT, LLM or provider integration;
- analytics, billing, school, mobile or deployment code.

## Follow-up

Slice 5 must not start without explicit approval. Production diagnostic content
and runtime remain blocked by curriculum and safety review, leaf-skill scope,
response contracts, deterministic validation policy, selection rules and a
separate implementation gate.
