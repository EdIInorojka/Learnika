# Learnika

 

Learnika is an educational platform that helps children learn independently through diagnostics, personalized learning tracks, step-by-step homework support, optional voice input and measurable progress.

 

The first production version is mathematics for grades 7-9. The long-term platform expands to ages 3-18, multiple subjects, exam preparation and school workflows.

 

## Core product promise

The platform does not do the work for the student. It identifies where the student is stuck, checks their own steps, provides the minimum sufficient hint and verifies transfer to a similar problem.

 

## Current scope

- Russia and Russian language;

- mathematics for grades 7-9;

- algebra, geometry and prerequisite skills;

- textbook-aware school track;

- restorative track for knowledge gaps;

- target track for tests and OGE preparation;

- homework upload from image, screenshot, PDF or manual input;

- short voice questions and dictated solution steps with transcript confirmation;

- parent progress reports;

- optional mentor or teacher escalation;

- internal learning-oriented gamification.

 

See `docs/product/current-scope.md`, `docs/product/mvp.md` and `docs/product/voice-input.md`.

 

## Planned repository structure

```text

apps/

  web/                  Student and parent PWA

  api/                  Modular core API and background workers

  mobile/               Activated in the mobile wave

  content-studio/       Later: content authoring and review

  school/               Later: teacher and school application

services/

  math-ai/              Math normalization, validation, OCR and media adapters

  learning-engine/      Later extraction candidate for diagnostics and planning

packages/

  contracts/            Shared API and event contracts

  domain/               Domain primitives and policies

  curriculum/           Skill graph and curriculum packages

  content-schema/       Versioned educational content schemas

  ui/                   Shared UI components

  analytics/            Event taxonomy and instrumentation

  test-fixtures/        Safe synthetic fixtures and gold sets

infra/

  docker/

  migrations/

  observability/

docs/

```

 

## Approved technology direction

- monorepo: pnpm workspaces and Turborepo;

- web: Next.js App Router, React, TypeScript strict, Tailwind CSS and shadcn/ui;

- server state and forms: TanStack Query, React Hook Form and Zod;

- API: NestJS with Fastify, REST and OpenAPI;

- database: PostgreSQL with Prisma and reviewed migrations;

- queues and cache: Redis and BullMQ;

- files: S3-compatible private object storage with signed URLs;

- math and media: Python 3.12+, FastAPI, Pydantic, SymPy, OpenCV and FFmpeg;

- voice: browser MediaRecorder, provider-neutral Speech-to-Text adapter and mathematical speech normalizer;

- mobile after validation: React Native and Expo;

- local environment: Docker Compose;

- testing: Vitest or Jest by package, Pytest and Playwright;

- observability: OpenTelemetry, structured logs, metrics, traces and Sentry.

 

The complete stage-by-stage stack is in `docs/architecture/technology-stack.md`. Dependency versions are selected during Wave 1 and locked in the repository.

 

## Documentation map

Start with `docs/INDEX.md`. The active implementation sequence is in `docs/IMPLEMENTATION_PLAN.md`.

 

## Local development

Wave 1 Slice 4 provides the monorepo tooling baseline, local infrastructure,
minimal app/service shells and Prisma database foundation. Product flows,
authentication endpoints, onboarding, homework, voice, billing, mobile and
school features are still deferred.

On Windows PowerShell, use `.cmd` package-tool shims:

```powershell
corepack.cmd enable
pnpm.cmd install
Copy-Item .env.example .env
pnpm.cmd run infra:up
pnpm.cmd run infra:validate
pnpm.cmd run db:migrate:deploy
pnpm.cmd run db:validate
pnpm.cmd run validate
```

For the Python service shell, create a local virtual environment:

```powershell
Set-Location services\math-ai
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Set-Location ..\..
```

If `python` is not on PATH, set `LEARNIKA_PYTHON` to a Python 3.12 executable
for the current shell before running math-ai scripts. Do not commit
machine-specific Python paths.

Available root scripts:

```powershell
pnpm.cmd run format
pnpm.cmd run format:check
pnpm.cmd run lint
pnpm.cmd run typecheck
pnpm.cmd run test
pnpm.cmd run validate
pnpm.cmd run infra:config
pnpm.cmd run infra:up
pnpm.cmd run infra:ps
pnpm.cmd run infra:logs
pnpm.cmd run infra:down
pnpm.cmd run infra:validate
pnpm.cmd run dev:web
pnpm.cmd run dev:api
pnpm.cmd run dev:math-ai
pnpm.cmd run build:web
pnpm.cmd run build:api
pnpm.cmd run db:generate
pnpm.cmd run db:validate
pnpm.cmd run db:migrate:dev -- --name <migration_name>
pnpm.cmd run db:migrate:deploy
pnpm.cmd run db:reset -- --yes
pnpm.cmd run db:studio
```

To delete local infrastructure containers and named volumes, use the explicit
confirmation flag:

```powershell
pnpm.cmd run infra:clean -- --yes
```

Local services bind to `127.0.0.1`:

- PostgreSQL: `5432`
- Redis: `6379`
- MinIO API: `9000`
- MinIO console: `9001`

Shell services bind to `127.0.0.1`:

- Web: `3000`, health route `/health`
- API: `3001`, health routes `/health/live` and `/health/ready`
- Math AI: `8000`, health routes `/health/live` and `/health/ready`

A fresh clone must install reproducibly with Node.js 24.x and pnpm 11.7.0.
Local credentials in `.env.example` are placeholders for development only.
`DATABASE_URL` points Prisma to the local PostgreSQL container.

 

## Security

This product processes data about children. Use synthetic data in development, minimize collected information, enforce tenant boundaries, strip image metadata, treat raw audio as temporary sensitive data and never place PII in analytics or ordinary logs.

 

See `docs/security/`.

 

## Contribution rule

Do not implement future roadmap features without an active gate. Each pull request must have a narrow goal, acceptance criteria, tests and a rollback or forward-fix plan where applicable.
