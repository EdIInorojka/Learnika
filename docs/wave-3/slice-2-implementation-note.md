# Wave 3 Slice 2 implementation note

## Slice

Wave 3 / Slice 2 - Canonical skill graph seed artifact and validator.

## Scope

This slice creates a static, machine-readable canonical skill graph seed and a
dependency-free validation harness. It does not add runtime product behavior.

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

## Created files

- `packages/curriculum/skill-graph/grade-7-9-math.seed.v1.json`;
- `packages/curriculum/scripts/validate-skill-graph.mjs`;
- `packages/curriculum/test/skill-graph-seed.test.mjs`;
- `docs/wave-3/slice-2-implementation-note.md`.

## Changed files

- `package.json` registers the dependency-free curriculum validator and test in
  the root test command.

## Artifact summary

The seed artifact is a draft static JSON graph for the Russian MVP mathematics
scope. It contains:

- versioned graph metadata;
- 27 parent skills;
- stable IDs that follow `math.<strand>.<topic>.v1`;
- coverage across number, algebra, functions, geometry and data/probability;
- grade bands within 7-9 only;
- conservative prerequisite references to existing skill IDs only;
- draft safety notes that keep the artifact structural and non-runtime.

Exact leaf granularity, display naming, grade placement and reviewed curriculum
publication remain open decisions.

## Validator summary

The validator checks:

- canonical skill ID pattern;
- duplicate IDs;
- grade bands within 7-9;
- unknown prerequisite references;
- prerequisite cycles;
- forbidden field and content terms;
- high-level strand coverage including data/probability;
- current worktree scope so this slice does not modify runtime API, OpenAPI,
  Prisma or web paths.

## No runtime changes

This slice intentionally makes no changes to:

- Prisma schema or migrations;
- API routes or OpenAPI contracts;
- web UI;
- diagnostics engine;
- mastery scoring;
- recommendation logic;
- answer checking;
- hints or generated assistance;
- OCR, STT or LLM providers;
- analytics, billing, school, mobile or deployment code.

## Follow-up

Slice 3 must not start without explicit approval. Later slices should decide
whether the next step is leaf-skill refinement, package contract hardening or a
review workflow before any executable product behavior is added.
