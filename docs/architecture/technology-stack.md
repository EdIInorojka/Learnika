# Technology stack by stage

 

## 1. Principles

- use the simplest architecture that supports the active stage;

- prefer a modular monolith before microservices;

- use provider adapters for OCR, Speech-to-Text, LLM, payments and notifications;

- keep deterministic mathematics separate from probabilistic models;

- keep raw child media private and temporary where possible;

- lock dependency versions in the repository during Wave 1;

- add infrastructure only when a measurable requirement exists.

 

## 2. Stage 0 — prototype and architecture

### Product and design

- Figma;

- user-flow maps;

- clickable prototypes;

- synthetic homework and voice fixtures.

 

### Web prototype

- Next.js;

- React;

- TypeScript;

- Tailwind CSS;

- shadcn/ui;

- React Hook Form;

- Zod;

- TanStack Query with mock adapters.

 

### Repository and quality

- GitHub;

- pnpm;

- Turborepo;

- Vitest;

- Playwright.

 

### Voice prototype

- browser MediaRecorder;

- deterministic transcript mock;

- editable confirmation UI;

- no permanent audio storage.

 

## 3. Stage 1 — technical foundation

### Frontend

- Next.js App Router;

- React and strict TypeScript;

- Tailwind CSS and shadcn/ui;

- TanStack Query;

- React Hook Form and Zod;

- accessibility checks with automated and manual review.

 

### Backend

- NestJS;

- Fastify adapter;

- REST and OpenAPI;

- secure cookie or token-based sessions with rotating refresh mechanism;

- Argon2id for password hashing where passwords are used.

 

### Data and jobs

- PostgreSQL;

- Prisma ORM;

- reviewed SQL migrations;

- Redis;

- BullMQ;

- S3-compatible object storage;

- MinIO for local development.

 

### Infrastructure

- Docker and Docker Compose;

- GitHub Actions;

- environment-based configuration;

- Sentry;

- Pino structured logging;

- OpenTelemetry;

- Prometheus-compatible metrics.

 

## 4. Stage 2 — homework helper and voice input

### Mathematics and AI

- Python 3.12+;

- FastAPI;

- Pydantic;

- SymPy;

- Pytest;

- server-side LLM adapter;

- policy engine and hint state machine;

- versioned gold evaluation sets.

 

### Images and documents

- presigned S3 uploads;

- OpenCV;

- PDF rasterization adapter;

- OCR provider adapter;

- mathematical OCR adapter;

- metadata stripping and file scanning.

 

### Voice

- browser MediaRecorder;

- WebM or approved browser audio formats;

- FFmpeg in background workers;

- Speech-to-Text provider adapter;

- mathematical speech normalizer;

- BullMQ transcription and cleanup jobs;

- editable transcript confirmation;

- temporary object retention.

 

### Mathematical UI

- LaTeX;

- KaTeX;

- MathLive or an equivalent accessible math input component.

 

## 5. Stage 3 — diagnostics and learning engine

- NestJS domain modules for mastery, evidence and planning;

- PostgreSQL skill graph and versioned curriculum tables;

- JSONB for flexible reviewed content schemas;

- BullMQ for diagnostics, report and planning jobs;

- Python and SymPy for mathematical checks;

- deterministic planner rules before ML recommendation models;

- Metabase for internal analytical review when needed.

 

## 6. Stage 4 — native mobile application

- React Native;

- Expo;

- TypeScript;

- Expo Router;

- `expo-audio`;

- `expo-camera`;

- `expo-file-system`;

- `expo-notifications`;

- `expo-secure-store`;

- TanStack Query;

- Zustand for local UI state;

- EAS Build and EAS Update;

- Sentry React Native.

 

Background recording remains disabled. Native voice is foreground-only and user initiated.

 

## 7. Stage 5 — commercial launch

- payment-provider adapters suitable for the target market;

- internal subscription, entitlement and usage-limit module;

- fiscalization integration where required;

- email, SMS and push notification adapters;

- feature flags through Unleash or a reviewed internal implementation;

- PII-safe product analytics through an approved PostHog deployment or internal event pipeline;

- Metabase for business intelligence;

- managed PostgreSQL, Redis and S3-compatible storage;

- cloud secret manager or Vault;

- automated backups and restore tests;

- helpdesk integration.

 

## 8. Stage 6 — complete mathematics 7-9 and OGE

- expanded curriculum and content studio;

- versioned exam framework packages;

- rubric and open-response review tools;

- content generation constrained by reviewed templates;

- performance profiling and queue optimization;

- content and model evaluation dashboards.

 

## 9. Stage 7 — school platform

- PostgreSQL multi-tenant organization model;

- Next.js teacher workspace;

- assessment item editor;

- HTML and CSS to PDF through Playwright PDF or React-PDF;

- QR-code generation;

- CSV and XLSX import;

- Python and OpenCV for answer-sheet processing;

- OMR pipeline with confidence and manual review;

- SymPy and rule engine for supported grading;

- WebSocket status updates through NestJS gateways when justified;

- immutable or append-only audit log;

- analytical reporting views.

 

## 10. Stage 8 — expansion to ages 3-18 and new subjects

### Russian language

- morphological and syntactic NLP services;

- spelling and punctuation tools;

- rubric-based written-work review;

- human-in-the-loop validation.

 

### Foreign languages

- Speech-to-Text;

- Text-to-Speech;

- pronunciation assessment;

- listening exercises;

- controlled voice conversation.

 

### Physics and chemistry

- formula and unit engines;

- interactive graphs;

- simulations;

- virtual laboratory components.

 

### Primary school

- simplified UI;

- large controls;

- text-to-speech;

- short sessions;

- parent-assisted flows.

 

### Preschool

- tablet-first and mobile-first UX;

- voice-first interaction;

- minimal reading requirements;

- strict parent controls;

- short session limits;

- separate game layer.

 

## 11. Stage 9 — high-load evolution

Introduced only when real load, team ownership or SLA requirements justify extraction:

 

- Kubernetes;

- Kafka or Redpanda;

- gRPC where appropriate;

- ClickHouse;

- OpenSearch;

- Redis Cluster;

- OpenTelemetry Collector;

- Prometheus;

- Grafana;

- Loki;

- Tempo;

- Argo CD;

- Vault;

- API gateway;

- CDN.

 

First extraction candidates:

 

1. media processing;

2. OCR;

3. speech;

4. assessment;

5. notifications;

6. analytics pipeline;

7. content service.

 

## 12. Technologies not required for MVP

- Kubernetes;

- Kafka;

- service mesh;

- dozens of microservices;

- blockchain;

- data lake;

- custom Speech-to-Text model;

- custom video-conference platform;

- realtime voice tutor;

- complex recommendation ML;

- separate application for every role.

 

## 13. Initial deployment summary

```text

Next.js web

      ↓

NestJS modular monolith and BullMQ workers

      ↓

PostgreSQL + Redis + private S3-compatible storage

      ↓

Python math and media service

      ↓

Provider adapters:

OCR / Speech-to-Text / LLM / notifications / payments

```