# Wave 3 diagnostic foundation closure gate

## Verdict

Wave 3 diagnostic foundation verdict: `APPROVE WAVE 3 CLOSURE`.

This verdict closes the approved contract, static-artifact and internal-only
service foundation through Slice 11. It does not approve a learner-facing
diagnostic, production content, real diagnostic sessions, persistence, API or
web exposure, response collection, checking, scoring, mastery, proficiency,
recommendations, provider activation or real-child use.

Closure evidence was reviewed on 2026-07-13 against the committed repository.
The worktree was clean at gate start. Node.js was `v24.18.0`, pnpm was
`11.7.0`, PostgreSQL, Redis and MinIO were reachable, all three committed
migrations were applied, OpenAPI was current and contract privacy validation
passed.

## Capability summary

| Capability | Closure status | Evidence |
|---|---|---|
| Canonical skill graph contract | Complete as a planning contract | Slice 1; stable versioned IDs and conservative prerequisite rules |
| Canonical skill graph seed | Complete as a static draft | Slice 2; 27 skills across number, algebra, functions, geometry and data |
| Diagnostic blueprint | Complete as a static structural draft | Slice 3; 11 coverage slots across all five strands |
| Diagnostic item contract and fixtures | Complete as non-production fixtures | Slice 4; five original minimal fixtures, one per strand |
| Response and evidence contract | Complete as synthetic static fixtures | Slice 5; three responses, three evidence records and seven non-scoring transitions |
| Session lifecycle contract | Complete as synthetic static fixtures | Slice 6; three scenarios, seven states and fourteen transitions |
| Session state service | Complete as an internal metadata-only policy | Slice 7; deterministic transitions and bounded denials |
| Diagnostic catalog | Complete as an internal read-only registry | Slice 8; version-pinned defensive projections of graph, slots and item metadata |
| Session plan | Complete as an internal incomplete plan | Slice 9; 11 slots, five fixtures and six explicit gaps |
| Session draft preview | Complete as internal orchestration only | Slice 10; starts at `drafted` and cannot activate directly |
| Readiness policy | Complete as an internal blocking policy | Slice 11; current draft is `NOT_READY` |

None of these capabilities creates a production diagnostic item bank, learner
attempt, result, evidence event or learning-state update.

## Static artifact audit

All required artifacts exist and their dependency-free validators pass:

- skill graph `wave-3.slice-2.grade-7-9-math.v1`: 27 skills and all five
  canonical strands, including data/probability;
- blueprint `wave-3.slice-3.grade-7-9-math.v1`: 11 static slots and all five
  canonical strands;
- item fixture set `wave-3.slice-4.grade-7-9-math.v1`: five original,
  non-production fixtures;
- response/evidence fixture set `wave-3.slice-5.grade-7-9-math.v1`: three
  responses, three evidence records and seven static transitions;
- lifecycle fixture set `wave-3.slice-6.grade-7-9-math.v1`: three sessions,
  seven states and fourteen static transitions.

Validators check exact version pins, ID formats, duplicates, grades 7-9,
canonical references, strand alignment, prerequisite cycles, lifecycle paths,
forbidden fields, synthetic/non-production markers and out-of-scope worktree
paths. The curriculum test suite contains negative cases for unknown
references, duplicate IDs, malformed states, unsafe fields and runtime-shaped
data.

## Internal service audit

The five Wave 3 Nest modules remain internal providers:

- `DiagnosticSessionStateService` implements exactly the seven states and
  fourteen transitions from the lifecycle contract. It validates reference
  metadata, preserves linked references during invalidation and returns no
  educational interpretation.
- `DiagnosticCatalogRegistryService` reads only the checked-in Slice 2-4 JSON
  artifacts, verifies version and reference alignment, and exposes defensive
  metadata projections. Item stems and evaluation placeholders are omitted.
- `DiagnosticSessionPlanService` accepts only the pinned blueprint version and
  returns all 11 structural slots in artifact order. Five have non-production
  item fixture IDs and six remain `MISSING`.
- `DiagnosticSessionDraftService` composes the plan and state services into a
  metadata-only preview at `drafted`. The invalid direct transition
  `drafted -> active` is denied as `TRANSITION_NOT_ALLOWED`.
- `DiagnosticReadinessPolicyService` validates the exact draft shape and asks
  the state service whether `drafted -> ready` is structurally allowed. It does
  not apply a transition or mutate the draft.

The focused service suite passes all 47 tests. Source and test audits confirm
that none of these modules has a controller, route decorator, `AppModule`
registration, Prisma dependency, filesystem write, network call or random
runtime behavior. The catalog's checked-in JSON reads are the only filesystem
operations in this foundation.

## Diagnostic readiness

Current readiness is `NOT_READY`.

The lifecycle contract permits considering `drafted -> ready`, but content and
coverage policy blocks eligibility for two deterministic reasons:

1. `INCOMPLETE_COVERAGE`: six of the 11 blueprint slots have no item fixture.
2. `NON_PRODUCTION_FIXTURES`: the five available item fixtures are explicitly
   draft-only and `productionUseAllowed=false`.

The readiness output contains only the pinned blueprint version, lifecycle
state, counts, policy versions and blocking reasons. It contains no plan
entries, item IDs, stems, learner content or educational outcome. No current
contract version can legitimately promote this draft to production readiness.

## Runtime and exposure audit

Status: `PASS` for the approved internal-only boundary.

- No diagnostic controller or HTTP route decorator exists.
- `AppModule` imports none of the five diagnostic foundation modules.
- Generated OpenAPI contains no diagnostic path or diagnostic schema.
- The web application contains no diagnostic route, component, action or API
  client surface.
- Prisma contains no diagnostic model, table or migration.
- No learner-facing diagnostic engine, session creation, item selection,
  response collection, result page or recommendation flow exists.
- No diagnostic analytics, queue, cache, storage, deployment or background
  worker exists.

The absence of API and persistence is intentional. It also means Wave 3 does
not establish production authorization, tenant isolation, idempotency,
retention, deletion, concurrency or recovery behavior for diagnostics.

## Safety and no-scoring audit

Status: `PASS` for the implemented Wave 3 artifacts and services.

- Diagnostic production source exposes no final response, expected response,
  worked method, learner help, revealing key, correctness boolean, numeric
  evaluation, mastery or proficiency claim.
- The five item stems are short, original minimal fixtures and remain
  non-production. They include no expected value or source textbook metadata.
- Response/evidence fixtures are synthetic placeholders and have
  `evaluationMode: none` or `aggregationMode: none` semantics.
- Lifecycle fixtures carry no success, failure or educational outcome meaning.
- Internal catalog, plan, draft and readiness projections omit item stems and
  learner content.
- Exact input allowlists reject identity-, response-, evaluation- and
  provider-shaped additions without reflecting caller values.
- Forbidden-term searches across API, curriculum, contracts and web were
  reviewed. Static diagnostic JSON matches are limited to explicit negative
  blueprint flags `claimsMastery=false`, `claimsProficiency=false` and
  `numericScore=false`, plus their no-claim policy note.
- Other matches are rejection lists, redaction patterns, negative tests or the
  existing parent-auth email contract. They do not create diagnostic payload
  fields or learner-facing diagnostic behavior.

No diagnostic artifact or service authorizes checking, scoring, hints,
solutions, mastery, proficiency or recommendations.

## Provider and textbook audit

- Diagnostic source contains no external HTTP client, provider adapter call or
  OCR/STT/LLM invocation.
- Package manifests and the lockfile contain no OpenAI, Anthropic, Gemini,
  Whisper, Azure AI, Google Cloud AI or equivalent provider SDK.
- Existing Wave 2 OCR, STT and LLM boundaries remain deterministic mocks and
  are not connected to the Wave 3 diagnostic foundation.
- Static validators reject provider payload, prompt and completion fields.
- No textbook edition, chapter, page, exercise number, source excerpt or
  copied-text field appears in diagnostic fixtures.
- Item fixtures declare `contentOrigin: original_minimal_fixture`; this is not
  production rights approval. Human curriculum, safety and rights review
  remains mandatory before publication.

No real child data may be sent to a provider, and no Wave 3 artifact may be
presented as reviewed textbook content.

## Privacy, tenant and auth audit

- Diagnostic fixtures are explicitly synthetic and non-production.
- Searches found no child, learner, family, tenant, user, account or email
  identity field in diagnostic JSON fixtures or internal diagnostic source
  contracts.
- Services accept only structural IDs, pinned versions and metadata-only draft
  shapes. They do not accept freeform learner content.
- Diagnostic modules have no request boundary, session identity or persistence,
  so they cannot currently read or write tenant-scoped diagnostic data.
- Web production source contains no `localStorage` or `sessionStorage` token
  use; existing auth tokens remain server-managed under the Wave 2 closure.
- Existing public homework/media authorization and cross-family tests remain
  unchanged by Wave 3.

This is not approval of diagnostic auth or tenant safety. Any future diagnostic
API must introduce explicit authentication, family ownership, tenant-safe
lookups, cross-tenant tests, data minimization and retention/deletion policy
before exposure.

## Database and migration audit

The migration inventory remains unchanged:

1. `20260708173051_initial_data_foundation`;
2. `20260708181231_auth_session_foundation`;
3. `20260710082038_homework_media_domain_foundation`.

`db:validate` passes and `db:migrate:deploy` reports no pending migration. The
Prisma schema and migrations contain no diagnostic session, plan, response,
evidence, readiness, checking, scoring or learning-state persistence.

## Scope guard audit

The curriculum worktree guard retains exact Wave 3 runtime allowances:

- `apps/api/src/diagnostic-session-state/` and its focused test;
- `apps/api/src/diagnostic-catalog/` and its focused test;
- `apps/api/src/diagnostic-session-plan/` and its focused test;
- `apps/api/src/diagnostic-session-draft/` and its focused test;
- `apps/api/src/diagnostic-readiness-policy/` and its focused test;
- `apps/api/package.json` only for focused-test registration.

No `apps/api/**`, API route, OpenAPI, Prisma, migration, web, environment or
lockfile wildcard is allowed. The closure slice changes only this document and
does not weaken the guard.

## CI assumptions

The approved handoff reports CI green through Slice 11. The checked-in GitHub
Actions workflow uses:

- read-only repository contents permission;
- `ubuntu-latest`, Node.js 24 and Corepack pnpm 11.7.0;
- a repository-created `pnpm.cmd` compatibility shim;
- `pnpm install --frozen-lockfile` and Prisma client generation;
- local-only synthetic auth and database credentials;
- `infra:validate` before database validation and migration deployment;
- the root `validate` command after infrastructure and database readiness.

CI assumes Docker and Docker Compose availability, free loopback ports 5432,
6379, 9000 and 9001, and registry access for pinned PostgreSQL 16.4, Redis
7.2.5 and MinIO release images. `ubuntu-latest`, action major tags and hosted
runner software remain external moving inputs and require later release
hardening.

## Closure validation

The following commands pass against the final documentation-only worktree:

- `pnpm.cmd run format:check`;
- `pnpm.cmd run lint`;
- `pnpm.cmd run typecheck`;
- `pnpm.cmd run test`;
- `pnpm.cmd run build:web`;
- `pnpm.cmd run build:api`;
- `pnpm.cmd run contracts:check`;
- `pnpm.cmd run contracts:validate`;
- `pnpm.cmd run validate`;
- `pnpm.cmd run db:validate`;
- `pnpm.cmd run db:migrate:deploy`;
- `pnpm.cmd run infra:validate`;
- `git diff --check`.

OpenAPI remains current, contract scope/privacy validation passes, both
production builds pass, all three local infrastructure services are reachable
and the three committed migrations are applied with none pending.

## Deferred work and unresolved risks

Wave 3 closure does not resolve:

- reviewed leaf-skill granularity and exact Russian grade placement;
- curriculum, safety, psychometric and rights approval for diagnostic content;
- the six missing blueprint fixtures and any production-ready item set;
- diagnostic length, ordering, timing, accessibility, stop and selection rules;
- supported deterministic validator forms and validity semantics;
- meaningful-attempt, response confirmation and invalidation policy;
- runtime session identity, authorization, tenant isolation and idempotency;
- persistence, concurrency, interruption recovery, retention and deletion;
- evidence independence, aggregation, contradiction and supersession rules;
- correctness, scoring, mastery, proficiency, recommendation or learning-plan
  policy;
- API, OpenAPI, web, analytics, reporting, operations and real-child use;
- named curriculum, security, QA and independent release reviewers.

These items block any learner-facing or persisted diagnostic. They do not block
closure of the explicitly approved static and internal-only Wave 3 foundation.

## Recommended Wave 4 starting point

Recommended first slice: `Wave 4 / Slice 1 - reviewed diagnostic content and
coverage readiness contract`.

The smallest safe next step is documentation and static review metadata only.
It should define named review roles, rights provenance, leaf-skill and grade
placement criteria, original-item acceptance rules, deterministic validator
requirements and the evidence required to close all six coverage gaps. It
must not change readiness to `READY`, add persistence, expose an API or build a
learner flow until reviewed content and production safety evidence exist.

Wave 4 requires a new explicit gate before implementation.

## Independent closure decision

`APPROVE WAVE 3 CLOSURE` for the committed diagnostic foundation through Slice
11.

Do not start Wave 4, expose diagnostic behavior, persist diagnostic data or
process real learner responses without a separately approved gate.
