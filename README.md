# [PROJECT_NAME]

 

[PROJECT_NAME] is an educational platform that helps children learn independently through diagnostics, personalized learning tracks, step-by-step homework support, optional voice input and measurable progress.

 

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

The final commands are established in Wave 1. The target experience is:

 

```bash

cp .env.example .env

corepack enable

pnpm install

pnpm bootstrap

pnpm dev

```

 

A fresh clone must start with one documented command sequence and must not require production secrets.

 

## Security

This product processes data about children. Use synthetic data in development, minimize collected information, enforce tenant boundaries, strip image metadata, treat raw audio as temporary sensitive data and never place PII in analytics or ordinary logs.

 

See `docs/security/`.

 

## Contribution rule

Do not implement future roadmap features without an active gate. Each pull request must have a narrow goal, acceptance criteria, tests and a rollback or forward-fix plan where applicable.