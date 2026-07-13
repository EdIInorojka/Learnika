# Wave 3 Slice 1 implementation note

## Slice

Wave 3 / Slice 1 - Canonical skill graph contract.

## Scope

This slice creates planning and contract documentation only. It does not add
runtime product features.

## Pre-edit gate

The slice started from a clean tracked worktree. Local gate checks verified:

- `git status --short`: clean;
- `node --version`: `v24.18.0`;
- `pnpm.cmd --version`: `11.7.0`;
- `pnpm.cmd run infra:validate`: PostgreSQL, Redis and MinIO reachable;
- `pnpm.cmd run db:validate`: passed;
- `pnpm.cmd run db:migrate:deploy`: no pending migrations;
- `pnpm.cmd run contracts:check`: OpenAPI artifact current;
- `pnpm.cmd run contracts:validate`: OpenAPI privacy/scope validation passed.

Local environment note: pnpm-linked packages and Docker access required approved
execution outside the restricted sandbox. A frozen `pnpm.cmd install` repaired
the local `node_modules` tree without tracked dependency changes, and
`db:generate` regenerated the local Prisma client after that repair.

## Created files

- `docs/wave-3/scope-and-non-goals.md`;
- `docs/wave-3/canonical-skill-graph-contract.md`;
- `docs/wave-3/open-decisions.md`;
- `docs/wave-3/slice-1-implementation-note.md`.

## Changed files

- `README.md` adds a pointer to the Wave 3 planning docs.

## No runtime changes

This slice intentionally makes no changes to:

- Prisma schema or migrations;
- API routes or OpenAPI contracts;
- web UI;
- diagnostics engine;
- mastery scoring;
- answer checking;
- hints or solution generation;
- OCR, STT or LLM providers;
- analytics, billing, school, mobile or deployment code.

## Contract summary

The canonical skill graph contract defines:

- stable readable skill IDs in the form
  `math.<strand>.<topic>[.<subtopic>...].v<major>`;
- high-level grade 7-9 coverage for number, algebra, functions, geometry and
  data;
- conservative prerequisite rules;
- safety constraints for diagnostics and homework evidence;
- explicit deferrals for schema, API, diagnostics, mastery, textbook mapping,
  validators, hints, transfer and analytics.

## Follow-up

Slice 2 must not start without explicit approval. The next slice should state
whether it is documentation-only, static-data-only or schema work before any
files are changed.
