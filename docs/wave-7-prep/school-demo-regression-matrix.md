# Pre-Wave 7 / Slice 28 — synthetic school demo regression matrix

Status: `REGRESSION_MATRIX_BLOCKED_NON_PRODUCTION`

This document is a static regression matrix for the synthetic school demo. It
does not start real Wave 7, approve a school beta, name a design-partner
school, create production school records or authorize real school data
processing.

## Baseline

- Wave 6 is closed only as a static diagnostic governance foundation.
- The synthetic school demo foundation is closed for non-production
  demonstration use only.
- The school beta gate foundation, activation-packet template, activation
  checklist, acceleration roadmap and future implementation slice map exist as
  static planning artifacts only.
- Real Wave 7 school beta remains `BLOCKED`.
- Diagnostic readiness remains `NOT_READY`.
- Diagnostic activation remains `BLOCKED`.
- Diagnostic workflow remains non-activated.
- Production school data count remains `0`.
- Real school count remains `0`.
- Production approvals count remains `0`.

## Purpose

The purpose of this matrix is to keep the existing synthetic demo reliable
during presentation and documentation changes. It records the checks that must
remain green before any demo-facing change can be approved.

The matrix is not evidence for real school beta. It cannot replace future
security isolation review, teacher workflow validation, restore readiness,
privacy/legal review, independent review or named design-partner approval.

## Demo surfaces under regression

The current read-only synthetic demo surfaces are:

- `/school-demo`;
- `/school-demo/classes/[classCode]`;
- `/school-demo/summary`;
- `/school-demo/handoff`;
- `/school-demo/pilot`;
- `/school-demo/pilot-config`;
- `/school-demo/rollout`.

All surfaces must remain synthetic, local-demo oriented and non-operational.

## Regression matrix

| Area | Required invariant | Minimum check | Fail-closed denial |
| --- | --- | --- | --- |
| Demo boundary | Every page identifies the data as synthetic/non-production without presenting it as real beta evidence. | Web render tests or static copy review cover visible synthetic boundary text. | Boundary copy is removed, hidden or reframed as production/pilot evidence. |
| Read-only behavior | No demo route creates, updates, deletes, imports, invites or submits data. | Tests assert no mutation controls, action routes or persistence writes are introduced. | Any mutation, form submission, invite, import, assignment delivery or data write appears. |
| No PII | Demo content contains no real names, emails, phone numbers, addresses, IDs, storage keys or school identities. | Synthetic-only assertions and fixture review remain green. | Any real person, school, contact, identifier or production-like record is introduced. |
| School-family separation | Demo school tenancy remains separate from family/homework tenancy. | API and domain tests keep tenant-isolation and no cross-link assertions green. | School data can reference family, `User`, `Family` or `ChildProfile` without separate approval. |
| Snapshot shape | Demo snapshot still shows organization, school, academic year, classes 7–9, groups, teachers, enrollments, license and entitlements. | Snapshot/API tests verify shape and expected synthetic counts. | Required demo section disappears or starts relying on live real-school data. |
| Class drilldown | Class pages remain reachable and show roster, assignments and enrollment context from synthetic fixtures only. | Route/render tests verify class links and detail page content. | Class page requires auth/session mutation or real roster records. |
| Presentation flow | Overview, summary, handoff, pilot, config and rollout pages remain linked coherently. | Web tests verify navigation links and deep links. | Presenter flow breaks or points to unapproved operational paths. |
| Theme behavior | Light mode, dark graphite mode and local-only theme toggle remain functional where used. | Web tests verify theme control and no server persistence. | Theme state creates cookies, auth/session changes or server-side persistence without approval. |
| Accessibility/readability | Pages stay readable on desktop and mobile, with sufficient contrast and restrained school-ready style. | Existing lint/typecheck/web tests plus manual review notes for visible changes. | Visual changes reduce contrast, hide key boundary text or create toy/marketing framing. |
| API contract | Public OpenAPI changes occur only through the contracts workflow when a real API change is explicitly approved. | `contracts:check` and `contracts:validate` remain green. | OpenAPI/runtime contract changes appear in a docs-only or presentation-only slice. |
| Data foundation | Prisma schema, migrations and deterministic synthetic seed behavior stay stable unless a slice explicitly authorizes data work. | `db:validate`, `db:migrate:deploy` and seed tests remain green when applicable. | Schema, migration or seed data changes are bundled into presentation/docs-only work. |
| Infrastructure | PostgreSQL, Redis and MinIO are reachable for full validation when DB/E2E tests are in scope. | `infra:validate` passes before relying on DB-backed test results. | Failed infrastructure is treated as product validation success. |

## Required command groups

For any future demo-facing change, run at minimum:

- `pnpm.cmd run format:check`;
- `pnpm.cmd run lint`;
- `pnpm.cmd run typecheck`;
- `pnpm.cmd --filter @learnika/web test` when web surfaces change;
- `pnpm.cmd --filter @learnika/api test` when API, Prisma or seed paths
  change;
- `pnpm.cmd run test`;
- `pnpm.cmd run validate`;
- `pnpm.cmd run infra:validate` when DB/API E2E tests are in scope;
- `pnpm.cmd run db:validate` when Prisma or seed boundaries are relevant;
- `pnpm.cmd run db:migrate:deploy` when database state is relevant;
- `git diff --check`.

If Docker Desktop, PostgreSQL, Redis or MinIO are unavailable, the affected
validation must be reported as blocked. Do not reinterpret unavailable
infrastructure as a green product result.

## Regression stop conditions

Stop and return `BLOCK` if any demo change introduces:

- real school, organization, teacher, student, parent, reviewer or
  design-partner identity;
- real roster rows, assignment records, submissions, analytics, OMR/manual
  review results, support cases or audit events;
- production approval, legal-basis record, consent record or evidence record;
- runtime, API, OpenAPI, Prisma, migration, web route, dependency, lockfile or
  CI workflow changes not explicitly authorized for that slice;
- mutations, invites, imports, auth/session changes, payments, family-domain
  links or production activation;
- answer checking, correctness scoring, hints, solutions, mastery/proficiency
  claims or copied textbook content;
- weakened tenant-isolation, no-PII, no-mutation or exact-scope guarantees;
- readiness changed from `NOT_READY` or activation changed from `BLOCKED`.

## Handling matrix failures

When a future change fails the matrix:

1. identify the exact invariant that failed;
2. revert only the violating local change or open a separate explicitly
   approved slice if the requirement is intentional;
3. rerun focused tests first;
4. rerun full validation before returning `APPROVE`;
5. keep the real Wave 7 beta `BLOCKED` unless the activation gates are
   separately approved.

## Explicit non-goals

This matrix does not:

- add or change demo pages;
- change demo data, seed data, Prisma schema, migrations, API, OpenAPI,
  contracts, runtime modules, dependencies, lockfile or CI workflow;
- create machine-readable approval or evidence artifacts;
- create real school beta evidence;
- satisfy any future school beta gate;
- authorize real school onboarding or production use.

Passing this matrix proves only that the synthetic demo remains internally
consistent for non-production presentation.
