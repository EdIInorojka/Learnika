# Wave 0 repository audit

## Active wave

Active wave: `docs/prompts/00-wave-0.md`.

Wave 0 is discovery, prototype planning, architecture, review, and gate documentation only. Wave 1 foundation work is not started by this artifact.

## Reviewed source documents

Primary required files:

- `AGENTS.md`
- `README.md`
- `docs/INDEX.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/prompts/00-wave-0.md`

Wave 0-relevant documents reviewed through `docs/INDEX.md`:

- `docs/reference/business-plan.md`
- `docs/reference/research-findings.md`
- `docs/reference/glossary.md`
- `docs/product/vision.md`
- `docs/product/current-scope.md`
- `docs/product/mvp.md`
- `docs/product/user-journeys.md`
- `docs/product/business-rules.md`
- `docs/product/voice-input.md`
- `docs/product/roadmap.md`
- `docs/product/school-product.md`
- `docs/architecture/system-overview.md`
- `docs/architecture/technology-stack.md`
- `docs/architecture/domain-model.md`
- `docs/architecture/api-contracts.md`
- `docs/architecture/adr/ADR-001-modular-monolith.md`
- `docs/architecture/adr/ADR-002-python-math-ai-service.md`
- `docs/architecture/adr/ADR-003-multi-tenancy.md`
- `docs/architecture/adr/ADR-004-voice-input-pipeline.md`
- `docs/curriculum/skill-graph.md`
- `docs/curriculum/textbook-mapping.md`
- `docs/curriculum/content-quality.md`
- `docs/ai/homework-helper.md`
- `docs/ai/ai-safety-policy.md`
- `docs/security/privacy-and-data.md`
- `docs/security/threat-model.md`
- `docs/data/analytics-events.md`
- `docs/testing/test-strategy.md`
- `docs/runbooks/local-development.md`
- `docs/runbooks/release-checklist.md`
- `docs/VOICE_INPUT.md`

Later wave prompts were not used as execution inputs.

## Repository state at audit

The repository contains documentation only:

- `AGENTS.md`
- `README.md`
- `docs/`

No production application scaffolding exists at Wave 0:

- no `apps/`
- no `services/`
- no `packages/`
- no `package.json`
- no `pnpm-workspace.yaml`
- no Docker configuration
- no database migrations
- no frontend screens
- no backend endpoints
- no workers
- no provider integrations

## Current product scope

Source of truth: `docs/product/current-scope.md`, `docs/product/mvp.md`, and `docs/product/business-rules.md`.

Learnika starts with:

- Russia;
- Russian language;
- students in grades 7-9;
- mathematics, including algebra, geometry, and selected prerequisites;
- knowledge-gap diagnostics;
- textbook-aware learning;
- homework support without ready-made answers;
- tests and OGE preparation;
- optional foreground-only voice input converted to editable confirmed text.

## Non-goals

Source of truth: `docs/product/current-scope.md` and `docs/product/roadmap.md`.

The first MVP does not include:

- production code during Wave 0;
- Wave 1 scaffolding;
- native mobile applications;
- ages outside grades 7-9;
- subjects outside mathematics;
- EGE;
- realtime voice conversation;
- background or continuous recording;
- text-to-speech tutoring;
- voice biometrics, emotion recognition, or speaker profiling;
- full school administration;
- public procurement integrations;
- copied protected textbook content without rights.

## Repository findings

- Documentation direction is coherent across product, architecture, AI, voice, security, analytics, testing, and delivery.
- The accepted architecture direction is modular monolith plus a separate Python math/media service.
- Family tenancy is the current production boundary; school tenancy is future-gated design.
- Voice input is consistently optional and confirmation-based.
- Existing evidence is limited; unsupported evidence must remain `NOT YET COLLECTED`.
- `docs/product/voice-input.md` is the canonical voice policy document.

## Missing foundations

These are intentionally not implemented in Wave 0:

- executable local development setup: `NOT YET COLLECTED`;
- dependency versions and lockfile: `NOT YET COLLECTED`;
- Docker Compose configuration: `NOT YET COLLECTED`;
- CI workflows: `NOT YET COLLECTED`;
- database schema and migrations: `NOT YET COLLECTED`;
- production OpenAPI files: `NOT YET COLLECTED`;
- provider integrations: `NOT YET COLLECTED`;
- production application code: `NOT YET COLLECTED`.

## Documentation fixes applied in Wave 0

- Replace project-name placeholders with Learnika.
- Correct the business-plan count from four to five needs.
- Resolve duplicate `Asset` domain heading.
- Make `docs/product/voice-input.md` the clear canonical voice-input document.

