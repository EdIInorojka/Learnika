# Wave 3 Slice 3 implementation note

## Slice

Wave 3 / Slice 3 - Diagnostic blueprint contract foundation.

## Scope

This slice creates a planning contract, static machine-readable diagnostic
blueprint draft and dependency-free validation harness. It does not add runtime
diagnostic behavior.

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

- `docs/wave-3/diagnostic-blueprint-contract.md`;
- `docs/wave-3/slice-3-implementation-note.md`;
- `packages/curriculum/diagnostic-blueprints/grade-7-9-math.draft.v1.json`;
- `packages/curriculum/scripts/validate-diagnostic-blueprint.mjs`;
- `packages/curriculum/test/diagnostic-blueprint.test.mjs`.

## Changed files

- `docs/wave-3/open-decisions.md` records the Slice 3 draft and remaining
  diagnostic blockers;
- root `package.json` registers the static blueprint validator and tests.

## Artifact summary

The static JSON blueprint contains:

- versioned metadata pinned to the Slice 2 skill graph version;
- 11 structural coverage slots across all five canonical strands;
- canonical primary and supporting skill references;
- broad grade 7-9 bands marked as open decisions;
- five evidence categories;
- non-scoring placeholder result semantics;
- structural source and safety policies without task content.

The slots do not represent authored questions, diagnostic attempts or a
released item bank.

## Validator summary

The dependency-free validator checks:

- blueprint and diagnostic item ID structure;
- canonical graph version and skill references;
- duplicate item IDs;
- grade bands within 7-9 and within the primary skill band;
- item strand alignment;
- canonical strand and target-grade coverage;
- evidence category and non-scoring result semantics;
- forbidden fields and content terms;
- unexpected runtime-shaped fields;
- current worktree scope.

## No runtime changes

This slice intentionally makes no changes to:

- Prisma schema or migrations;
- API routes or OpenAPI contracts;
- web UI;
- diagnostics engine or persistence;
- mastery scoring or recommendation logic;
- generated questions, answer checking, hints or solutions;
- OCR, STT, LLM or provider integration;
- analytics, billing, school, mobile or deployment code.

## Follow-up

Slice 4 must not start without explicit approval. Runtime diagnostics remain
blocked by reviewed leaf-skill scope, original item content, selection rules,
result semantics, deterministic validation coverage and a separate slice gate.
