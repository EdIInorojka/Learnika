# Wave 0 ownership matrix

## Purpose

This matrix assigns documentation and future module ownership for planning. It does not create future folders or implementation files.

## Current documentation ownership

| Area | Source files | Primary owner role | Review roles |
|---|---|---|---|
| Product scope | `docs/product/current-scope.md`, `docs/product/mvp.md`, `docs/product/business-rules.md` | product-program | curriculum, security, QA |
| User journeys and UX | `docs/product/user-journeys.md`, `docs/product/voice-input.md` | student-parent-ux | product, security, QA |
| Architecture | `docs/architecture/system-overview.md`, ADRs | solution-architect | backend-platform, security |
| Domain model | `docs/architecture/domain-model.md` | solution-architect | backend-platform, security, curriculum |
| API contracts | `docs/architecture/api-contracts.md` | backend-platform | solution-architect, QA |
| Curriculum | `docs/curriculum/*` | curriculum-knowledge | content-platform, QA |
| Homework and AI safety | `docs/ai/*` | ai-vision-math | curriculum, security, QA |
| Voice and media | `docs/product/voice-input.md`, ADR-004 | voice-media | security, UX, QA |
| Privacy and threat model | `docs/security/*` | security-privacy | architecture, QA |
| Analytics | `docs/data/analytics-events.md` | data-analytics | privacy, product |
| Testing | `docs/testing/test-strategy.md` | qa-evaluation | security, AI, product |
| Delivery | `docs/runbooks/*`, `docs/architecture/technology-stack.md` | devops-sre | backend-platform, security |
| Independent gate review | `docs/wave-0/subagent-review.md`, `docs/wave-0/gate-checklist.md` | independent-review | all area owners |

## Future implementation ownership

Planned paths are documentation-only until their wave is approved.

| Planned path | Wave status | Owner role |
|---|---:|---|
| `apps/web/` | Wave 1 | student-parent-ux and frontend |
| `apps/api/` | Wave 1 | backend-platform |
| `services/math-ai/` | Wave 1 shell, Wave 2 behavior | ai-vision-math |
| `packages/contracts/` | Wave 1 | backend-platform |
| `packages/domain/` | Wave 1 | solution-architect |
| `packages/curriculum/` | Wave 3 | curriculum-knowledge |
| `packages/analytics/` | Wave 1+ | data-analytics |
| `packages/test-fixtures/` | Wave 1+ | qa-evaluation |
| `infra/docker/` | Wave 1 | devops-sre |
| `infra/migrations/` | Wave 1 | backend-platform |
| `infra/observability/` | Wave 1+ | devops-sre |
| `apps/mobile/` | Future Wave 4 | mobile-agent |
| `apps/school/` | Future school gate | teacher-school-agent |
| `apps/content-studio/` | Later | content-platform |

## Change-control rules

- Do not edit future-gated implementation paths before their wave.
- Do not allow two agents to edit the same files concurrently.
- Each change must name owner, reviewers, evidence, risks, and unresolved decisions.
- Security, QA, and independent review are required at every release gate.

