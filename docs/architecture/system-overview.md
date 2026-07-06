# System architecture overview

 

## 1. Architecture goals

- deliver the first vertical slice quickly;

- preserve clear domain boundaries;

- support strong family and school tenancy;

- separate deterministic mathematics from probabilistic AI;

- support image, typed and confirmed voice input through one educational workflow;

- allow future age and subject packages without rebuilding identity and platform services;

- maintain auditability and safe rollback;

- avoid premature microservices.

 

## 2. Initial architecture

Use a modular monolith for the core API plus a separate Python math-AI service. Background jobs run as separate worker processes but reuse the same application modules and contracts.

 

### Core API modules

- identity and sessions;

- family and child profiles;

- consent;

- curriculum catalog;

- textbooks and mappings;

- learning goals and plans;

- attempts and evidence;

- homework workflow orchestration;

- voice sessions and media-job orchestration;

- reports;

- entitlements and billing references;

- teacher escalation;

- audit and administration.

 

### Python math-AI service

- image and file adapter interfaces;

- task segmentation;

- mathematical expression normalization;

- mathematical speech normalization support;

- problem-type classification;

- deterministic SymPy validation;

- step comparison;

- hint-policy execution support;

- transfer-problem validation;

- media preprocessing helpers using OpenCV and FFmpeg where appropriate;

- confidence and evaluation instrumentation.

 

### Voice pipeline

```text

Browser MediaRecorder

        ↓

Voice Session API

        ↓

Signed temporary upload

        ↓

S3-compatible private storage

        ↓

BullMQ transcription job

        ↓

Media worker and FFmpeg validation

        ↓

Speech-to-Text provider adapter

        ↓

Math speech normalizer

        ↓

Editable transcript review

        ↓

Learner confirmation

        ↓

Homework or learning flow

        ↓

Retention cleanup worker

```

 

Raw audio never goes directly to the learning LLM in the MVP. Only confirmed text enters the educational domain.

 

### Learning engine

Initially a core module or internal service boundary. It owns diagnostics, mastery updates, review scheduling and plan generation. Extract only if scale or lifecycle requires it.

 

## 3. Planned monorepo

```text

apps/

  web/

  api/

  mobile/              # activated in Wave 4

  content-studio/      # later

  school/              # later

services/

  math-ai/

  learning-engine/     # later extraction candidate

packages/

  contracts/

  domain/

  curriculum/

  content-schema/

  ui/

  analytics/

  test-fixtures/

infra/

  docker/

  migrations/

  observability/

docs/

```

 

## 4. Technology direction

The detailed stage-by-stage stack is defined in `technology-stack.md`.

 

Initial approved choices:

 

- pnpm workspaces and Turborepo;

- Next.js App Router, React and strict TypeScript;

- Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form and Zod;

- NestJS with Fastify for modular REST API;

- OpenAPI as the external API contract;

- PostgreSQL with Prisma and reviewed migrations;

- Redis and BullMQ;

- S3-compatible private object storage with signed URLs;

- Python 3.12+, FastAPI, Pydantic, SymPy, OpenCV and FFmpeg;

- provider-neutral gateways for OCR, Speech-to-Text, LLM, notifications and payments;

- Docker Compose for local development;

- OpenTelemetry, structured logs, metrics, traces and Sentry.

 

## 5. Boundary rules

### Browser to API

- browser never receives storage credentials;

- uploads use short-lived signed URLs or controlled proxy flow;

- child and adult sessions have distinct permissions;

- only confirmed voice text may be submitted as learning input.

 

### API to math-AI

- strict versioned JSON contracts;

- no direct database access from math-AI;

- idempotent job and request identifiers;

- timeouts, retries and circuit breaking;

- provider and model metadata returned where relevant.

 

### API to storage

- private buckets only;

- generated object keys;

- content type, size and duration validation;

- image metadata stripping;

- retention deadline per object category;

- deletion retry and audit.

 

### Voice provider boundary

- provider adapter receives only the minimum audio and context required;

- provider choice is configuration, not domain logic;

- raw audio is not reused for unrelated purposes;

- provider failure falls back to text input.

 

## 6. Reliability principles

- transactional outbox for critical domain events when needed;

- idempotency for uploads, jobs, payments and webhooks;

- explicit state machines for homework and voice sessions;

- dead-letter queues and manual replay tools;

- backups with restore tests;

- health, readiness and dependency checks;

- cost and queue-depth monitoring.

 

## 7. Evolution rules

- modular monolith is the default;

- first extraction candidates are media processing, OCR, speech, assessment, notification and analytics;

- extraction requires independent scaling, security or lifecycle evidence;

- React Native and Expo are introduced only in the mobile wave;

- Kubernetes, event streaming, ClickHouse and OpenSearch are introduced only after measured scale thresholds;

- every extraction keeps versioned contracts and rollback capability.