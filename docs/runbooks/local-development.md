# Local development runbook

 

This runbook is updated one Wave 1 slice at a time. Slice 2 covers local infrastructure only; application shells, migrations, provider mocks and product flows are still deferred.

 

## Prerequisites

- Git;

- Node.js LTS selected by the repository;

- pnpm via Corepack;

- Python 3.12+; required when the Python service shell is created in a later slice;

- Docker and Docker Compose;

- FFmpeg for local media-worker tests or the provided container image;

- optional Make or task runner used by the repository.

 

## First setup

```powershell
git clone <repository-url>
cd <repository>
corepack.cmd enable
pnpm.cmd install
Copy-Item .env.example .env
pnpm.cmd run infra:up
pnpm.cmd run infra:validate
```

`pnpm.cmd run bootstrap` is currently an alias for `pnpm.cmd run infra:validate`. It starts and validates PostgreSQL, Redis and MinIO only.

 

## Start

```powershell
pnpm.cmd run infra:up
```

Expected Slice 2 local services:

- PostgreSQL on `127.0.0.1:5432`;
- Redis on `127.0.0.1:6379`;
- MinIO API on `127.0.0.1:9000`;
- MinIO console on `127.0.0.1:9001`.

 

## Checks

```powershell
pnpm.cmd run format:check
pnpm.cmd run lint
pnpm.cmd run typecheck
pnpm.cmd run validate
pnpm.cmd run infra:config
pnpm.cmd run infra:check:env
pnpm.cmd run infra:validate
```

Later slices will add real app, integration, E2E, contract, migration, AI, voice and retention checks when those surfaces exist.

 

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

Database migrations and seeds are not implemented in Slice 2.

To remove local infrastructure containers and named volumes:

```powershell
pnpm.cmd run infra:clean -- --yes
```

`infra:clean` refuses to run without `--yes` because it deletes local Docker volumes.

 

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
