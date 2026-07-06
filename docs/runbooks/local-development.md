# Local development runbook

 

This is the target runbook. Wave 1 must update commands to match the actual repository.

 

## Prerequisites

- Git;

- Node.js LTS selected by the repository;

- pnpm via Corepack;

- Python 3.12+;

- Docker and Docker Compose;

- FFmpeg for local media-worker tests or the provided container image;

- optional Make or task runner used by the repository.

 

## First setup

```bash

git clone <repository-url>

cd <repository>

cp .env.example .env

corepack enable

pnpm install

pnpm bootstrap

```

 

`pnpm bootstrap` should:

 

- start local PostgreSQL, Redis and object storage;

- create development buckets;

- apply migrations;

- seed safe curriculum and demo data;

- install Python dependencies;

- verify FFmpeg or media-worker container;

- configure deterministic OCR, Speech-to-Text and LLM mocks;

- verify services.

 

## Start

```bash

pnpm dev

```

 

Expected local services:

 

- web application;

- core API;

- background worker;

- math-AI service;

- PostgreSQL;

- Redis;

- S3-compatible local storage;

- optional telemetry viewer.

 

## Checks

```bash

pnpm format:check

pnpm lint

pnpm typecheck

pnpm test

pnpm test:integration

pnpm test:e2e

pnpm contracts:check

pnpm migrations:check

pnpm ai:eval

pnpm voice:eval

pnpm retention:check

```

 

The exact commands must be real and kept current.

 

## Voice development

- use synthetic or adult-created non-identifying recordings;

- deterministic transcription mock is the default;

- production provider is disabled unless explicitly configured;

- local audio objects use a short test retention;

- cleanup worker can be triggered manually;

- do not commit recordings or transcripts containing personal information.

 

## Test accounts

Use generated synthetic accounts. Never commit real contacts or child data.

 

## Environment variables

- `.env.example` contains names and safe defaults;

- local `.env` is ignored by Git;

- no production key is required for basic development;

- AI, OCR and Speech-to-Text use deterministic mocks unless explicitly enabled;

- secrets are never pasted into Codex prompts or issue text.

 

## Database reset

```bash

pnpm db:reset

pnpm db:seed

```

 

The command must clearly warn before deleting data.

 

## Troubleshooting

### Services do not start

- check Docker status;

- inspect health endpoints;

- verify ports;

- run `pnpm doctor` when implemented.

 

### Migration failure

- stop feature work;

- preserve logs without PII;

- follow migration recovery notes;

- do not manually alter production-like data without documenting the change.

 

### AI, OCR or Speech-to-Text provider unavailable

- use deterministic mock;

- confirm safe fallback behavior;

- keep typed input active;

- never bypass validation or transcript confirmation.

 

### Audio cleanup failure

- run the cleanup job in dry-run mode;

- inspect object and database states by internal ID only;

- retry idempotently;

- never make the bucket public to diagnose access.

 

## Documentation update

Any change to setup, command names, ports, media formats or retention behavior must update this file in the same pull request.